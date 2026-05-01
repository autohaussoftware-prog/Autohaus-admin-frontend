import { getSupabaseServerClient } from "@/lib/supabase/server";

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export type MonthlyPerformanceItem = {
  month: string;
  ventas: number;
  utilidad: number;
  costos: number;
  unidades: number;
};

// ─── Rendimiento mensual desde tabla sales (real) ──────────────────────────

export async function getMonthlyPerformance(months = 6): Promise<MonthlyPerformanceItem[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return buildEmptyMonths(months);

  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1).toISOString();

  const { data: salesData } = await supabase
    .from("sales")
    .select("agreed_price,created_at,vehicle_id")
    .eq("sale_status", "vendido")
    .gte("created_at", cutoff);

  const vehicleIds = [...new Set((salesData ?? []).map((s: any) => s.vehicle_id as string).filter(Boolean))];

  const vehicleMap = new Map<string, { buyPrice: number; realCost: number }>();
  if (vehicleIds.length) {
    const { data: vehiclesData } = await supabase
      .from("vehicles")
      .select("id,buy_price,real_cost")
      .in("id", vehicleIds);
    for (const v of vehiclesData ?? []) {
      vehicleMap.set(v.id as string, {
        buyPrice: Number(v.buy_price ?? 0),
        realCost: Number(v.real_cost ?? 0),
      });
    }
  }

  const byMonth = new Map<string, { ventas: number; costos: number; unidades: number }>();

  for (const s of salesData ?? []) {
    const d = new Date((s as any).created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth.has(key)) byMonth.set(key, { ventas: 0, costos: 0, unidades: 0 });
    const entry = byMonth.get(key)!;
    const agreedPrice = Number((s as any).agreed_price ?? 0);
    const vehicle = vehicleMap.get((s as any).vehicle_id);
    entry.ventas += agreedPrice;
    entry.costos += (vehicle?.buyPrice ?? 0) + (vehicle?.realCost ?? 0);
    entry.unidades += 1;
  }

  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = byMonth.get(key) ?? { ventas: 0, costos: 0, unidades: 0 };
    const ventasM = Math.round(entry.ventas / 1_000_000);
    const costosM = Math.round(entry.costos / 1_000_000);
    return {
      month: MONTH_LABELS[d.getMonth()],
      ventas: ventasM,
      costos: costosM,
      utilidad: Math.max(0, ventasM - costosM),
      unidades: entry.unidades,
    };
  });
}

function buildEmptyMonths(months: number): MonthlyPerformanceItem[] {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return { month: MONTH_LABELS[d.getMonth()], ventas: 0, costos: 0, utilidad: 0, unidades: 0 };
  });
}

// ─── Rentabilidad por vehículo vendido ────────────────────────────────────

export type VehicleProfitRow = {
  vehicleId: string;
  plate: string;
  name: string;
  year: number;
  closedAt: string;
  buyPrice: number;
  realCost: number;
  agreedPrice: number;
  grossProfit: number;
  margin: number;
  advisorBuyer: string;
  advisorSeller: string;
};

export async function getVehicleProfitability(dateFrom?: string, dateTo?: string): Promise<VehicleProfitRow[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("sales")
    .select("id,agreed_price,created_at,vehicle_id,seller_id")
    .eq("sale_status", "vendido")
    .order("created_at", { ascending: false });

  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59");

  const { data: salesData } = await query;
  if (!salesData?.length) return [];

  const vehicleIds = [...new Set(salesData.map((s: any) => s.vehicle_id as string).filter(Boolean))];
  const sellerIds = [...new Set(salesData.map((s: any) => s.seller_id as string).filter(Boolean))];

  const [vehiclesRes, advisorsRes] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id,plate,brand,line,year,buy_price,real_cost,advisor_buyer_id")
      .in("id", vehicleIds),
    sellerIds.length
      ? supabase.from("advisors").select("id,full_name").in("id", [...new Set([...vehicleIds, ...sellerIds])])
      : Promise.resolve({ data: [] }),
  ]);

  const advisorBuyerIds = (vehiclesRes.data ?? []).map((v: any) => v.advisor_buyer_id).filter(Boolean);
  let allAdvisors: { id: string; name: string }[] = [];

  if (advisorBuyerIds.length || sellerIds.length) {
    const allIds = [...new Set([...advisorBuyerIds, ...sellerIds])];
    const { data } = await supabase.from("advisors").select("id,full_name").in("id", allIds);
    allAdvisors = (data ?? []).map((a: any) => ({ id: a.id as string, name: a.full_name as string }));
  }

  const advisorMap = new Map(allAdvisors.map((a) => [a.id, a.name]));
  const vehicleMap = new Map((vehiclesRes.data ?? []).map((v: any) => [v.id as string, v]));

  return salesData.map((s: any) => {
    const v = vehicleMap.get(s.vehicle_id);
    const buyPrice = Number(v?.buy_price ?? 0);
    const realCost = Number(v?.real_cost ?? 0);
    const agreedPrice = Number(s.agreed_price ?? 0);
    const grossProfit = agreedPrice - buyPrice - realCost;
    const margin = agreedPrice > 0 ? (grossProfit / agreedPrice) * 100 : 0;

    return {
      vehicleId: s.vehicle_id ?? "",
      plate: v?.plate ?? "Sin placa",
      name: v ? `${v.brand} ${v.line}` : "Vehículo",
      year: Number(v?.year ?? 0),
      closedAt: s.created_at ?? "",
      buyPrice,
      realCost,
      agreedPrice,
      grossProfit,
      margin,
      advisorBuyer: v?.advisor_buyer_id ? advisorMap.get(v.advisor_buyer_id) ?? "—" : "—",
      advisorSeller: s.seller_id ? advisorMap.get(s.seller_id) ?? "—" : "—",
    };
  });
}

// ─── Actividad mensual por asesor ─────────────────────────────────────────

export type AdvisorEntry = { advisorName: string; count: number };
export type AdvisorSale = { advisorName: string; count: number; totalValue: number };

export type MonthlyAdvisorActivity = {
  label: string;
  year: number;
  monthNum: number;
  entries: AdvisorEntry[];
  sales: AdvisorSale[];
  totalEntries: number;
  totalSales: number;
  totalSalesValue: number;
};

export async function getMonthlyAdvisorActivity(): Promise<MonthlyAdvisorActivity[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

  const [vehiclesRes, salesRes, advisorsRes] = await Promise.all([
    supabase.from("vehicles").select("id,created_at,advisor_buyer_id").gte("created_at", cutoff),
    supabase.from("sales").select("id,created_at,seller_id,agreed_price").gte("created_at", cutoff),
    supabase.from("advisors").select("id,full_name"),
  ]);

  const advisorMap = new Map<string, string>(
    (advisorsRes.data ?? []).map((a: any) => [a.id as string, a.full_name as string])
  );

  const months: MonthlyAdvisorActivity[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      monthNum: d.getMonth(),
      entries: [],
      sales: [],
      totalEntries: 0,
      totalSales: 0,
      totalSalesValue: 0,
    };
  });

  for (const v of vehiclesRes.data ?? []) {
    const d = new Date((v as any).created_at);
    const slot = months.find((m) => m.monthNum === d.getMonth() && m.year === d.getFullYear());
    if (!slot) continue;
    const name = (v as any).advisor_buyer_id ? advisorMap.get((v as any).advisor_buyer_id) ?? "Sin asesor" : "Sin asesor";
    const existing = slot.entries.find((e) => e.advisorName === name);
    if (existing) existing.count++;
    else slot.entries.push({ advisorName: name, count: 1 });
    slot.totalEntries++;
  }

  for (const s of salesRes.data ?? []) {
    const d = new Date((s as any).created_at);
    const slot = months.find((m) => m.monthNum === d.getMonth() && m.year === d.getFullYear());
    if (!slot) continue;
    const name = (s as any).seller_id ? advisorMap.get((s as any).seller_id) ?? "Sin asesor" : "Sin asesor";
    const value = Number((s as any).agreed_price) || 0;
    const existing = slot.sales.find((e) => e.advisorName === name);
    if (existing) { existing.count++; existing.totalValue += value; }
    else slot.sales.push({ advisorName: name, count: 1, totalValue: value });
    slot.totalSales++;
    slot.totalSalesValue += value;
  }

  return months;
}
