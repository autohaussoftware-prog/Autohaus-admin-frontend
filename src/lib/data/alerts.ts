import { alerts as mockAlerts } from "@/data/mock";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getVehicleProjectedMargin } from "@/lib/domain/vehicle-calculations";

export type AppAlert = {
  id: string;
  title: string;
  description: string;
  priority: "Alta" | "Media" | "Baja";
  module: string;
};

const MIN_MARGIN_PERCENT = 3;
const DAYS_BEFORE_EXPIRY_ALERT = 45;

function daysUntil(dateStr: string): number {
  if (!dateStr) return Infinity;
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

type DbVehicle = {
  id: string;
  plate: string;
  brand: string;
  line: string;
  status: string;
  soat_due: string | null;
  techno_due: string | null;
  buy_price: number | string | null;
  target_price: number | string | null;
  min_price: number | string | null;
  real_cost: number | string | null;
  estimated_cost: number | string | null;
};

type DbSale = {
  id: string;
  vehicle_id: string;
  pending_balance: number | string;
  sale_status: string;
  payment_status: string;
};

async function computeAutoAlerts(
  vehicles: DbVehicle[],
  sales: DbSale[]
): Promise<AppAlert[]> {
  const alerts: AppAlert[] = [];

  for (const v of vehicles) {
    if (v.status === "Vendido" || v.status === "Entregado") continue;

    const name = `${v.brand} ${v.line} (${v.plate})`;
    const toNum = (x: number | string | null) => Number(x ?? 0) || 0;

    // SOAT vencimiento
    if (v.soat_due) {
      const days = daysUntil(v.soat_due);
      if (days <= 0) {
        alerts.push({
          id: `auto-soat-${v.id}`,
          title: `SOAT vencido — ${name}`,
          description: `El SOAT venció hace ${Math.abs(days)} día(s). No puede circular ni venderse.`,
          priority: "Alta",
          module: "Documentos",
        });
      } else if (days <= DAYS_BEFORE_EXPIRY_ALERT) {
        alerts.push({
          id: `auto-soat-${v.id}`,
          title: `SOAT próximo a vencer — ${name}`,
          description: `Vence en ${days} día(s). Renovar antes de continuar operaciones.`,
          priority: days <= 15 ? "Alta" : "Media",
          module: "Documentos",
        });
      }
    }

    // Tecnomecánica vencimiento
    if (v.techno_due) {
      const days = daysUntil(v.techno_due);
      if (days <= 0) {
        alerts.push({
          id: `auto-rtm-${v.id}`,
          title: `Tecnomecánica vencida — ${name}`,
          description: `Venció hace ${Math.abs(days)} día(s). Impide circulación y transacción legal.`,
          priority: "Alta",
          module: "Documentos",
        });
      } else if (days <= DAYS_BEFORE_EXPIRY_ALERT) {
        alerts.push({
          id: `auto-rtm-${v.id}`,
          title: `Tecnomecánica próxima a vencer — ${name}`,
          description: `Vence en ${days} día(s). Programar revisión antes de fecha límite.`,
          priority: days <= 15 ? "Alta" : "Media",
          module: "Documentos",
        });
      }
    }

    // Margen bajo
    const buyPrice = toNum(v.buy_price);
    const targetPrice = toNum(v.target_price);
    const realCost = toNum(v.real_cost);
    if (targetPrice > 0 && buyPrice > 0) {
      const profit = targetPrice - buyPrice - realCost;
      const margin = (profit / targetPrice) * 100;
      if (margin < MIN_MARGIN_PERCENT) {
        alerts.push({
          id: `auto-margin-${v.id}`,
          title: `Margen bajo — ${name}`,
          description: `Margen proyectado ${margin.toFixed(1)}% está por debajo del mínimo esperado (${MIN_MARGIN_PERCENT}%).`,
          priority: margin < 0 ? "Alta" : "Media",
          module: "Rentabilidad",
        });
      }
    }

    // Costo real supera estimado significativamente
    const estimatedCost = toNum(v.estimated_cost);
    const realCostVal = toNum(v.real_cost);
    if (estimatedCost > 0 && realCostVal > estimatedCost * 1.3) {
      const excess = ((realCostVal - estimatedCost) / estimatedCost) * 100;
      alerts.push({
        id: `auto-cost-${v.id}`,
        title: `Costo real alto — ${name}`,
        description: `Costo real supera el estimado en ${excess.toFixed(0)}%. Revisar rentabilidad neta.`,
        priority: "Media",
        module: "Costos",
      });
    }
  }

  // Separaciones con saldo pendiente
  for (const s of sales) {
    if (s.sale_status === "separacion" && Number(s.pending_balance) > 0 && s.payment_status !== "completo") {
      const vehicle = vehicles.find((v) => v.id === s.vehicle_id);
      const name = vehicle ? `${vehicle.brand} ${vehicle.line} (${vehicle.plate})` : `Vehículo ${s.vehicle_id.slice(0, 8)}`;
      const balance = Number(s.pending_balance);
      alerts.push({
        id: `auto-sale-${s.id}`,
        title: `Separación con saldo pendiente — ${name}`,
        description: `Saldo pendiente: $${balance.toLocaleString("es-CO")} antes de entrega. Bloquear hasta pago completo.`,
        priority: "Alta",
        module: "Ventas",
      });
    }
  }

  return alerts;
}

export async function getAlerts(): Promise<AppAlert[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return mockAlerts as AppAlert[];

  const [vehiclesResult, salesResult, dbAlertsResult] = await Promise.all([
    supabase.from("vehicles").select("id,plate,brand,line,status,soat_due,techno_due,buy_price,target_price,min_price,real_cost,estimated_cost"),
    supabase.from("sales").select("id,vehicle_id,pending_balance,sale_status,payment_status"),
    supabase
      .from("alerts")
      .select("id,title,description,priority,module")
      .eq("status", "abierta")
      .order("created_at", { ascending: false }),
  ]);

  if (vehiclesResult.error) {
    console.error("No se pudieron cargar datos para alertas:", vehiclesResult.error?.message);
    return mockAlerts as AppAlert[];
  }

  const autoAlerts = await computeAutoAlerts(
    (vehiclesResult.data ?? []) as DbVehicle[],
    (salesResult.data ?? []) as DbSale[]
  );

  const dbAlerts: AppAlert[] = (dbAlertsResult.data ?? []).map((a) => ({
    id: a.id as string,
    title: a.title as string,
    description: (a.description as string | null) ?? "",
    priority: a.priority as AppAlert["priority"],
    module: a.module as string,
  }));

  // Merge: auto alerts first, then DB manual alerts (deduplicate by id)
  const seen = new Set<string>();
  const merged: AppAlert[] = [];
  for (const alert of [...autoAlerts, ...dbAlerts]) {
    if (!seen.has(alert.id)) {
      seen.add(alert.id);
      merged.push(alert);
    }
  }

  return merged;
}
