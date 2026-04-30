import { getFinanceMovements } from "@/lib/data/finance";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { FinanceMovement } from "@/types/finance";

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function buildMonthlyPerformance(movements: FinanceMovement[]) {
  const byMonth = new Map<string, { ventas: number; gastos: number }>();
  for (const m of movements) {
    const parts = m.date.split("-");
    const key = `${parts[0]}-${parts[1]}`;
    if (!byMonth.has(key)) byMonth.set(key, { ventas: 0, gastos: 0 });
    const entry = byMonth.get(key)!;
    if (m.type === "Ingreso") entry.ventas += m.amount;
    else entry.gastos += m.amount;
  }
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = byMonth.get(key) ?? { ventas: 0, gastos: 0 };
    const ventasM = Math.round(entry.ventas / 1_000_000);
    const gastosM = Math.round(entry.gastos / 1_000_000);
    return {
      month: MONTH_LABELS[d.getMonth()],
      ventas: ventasM,
      utilidad: Math.max(0, ventasM - gastosM),
      gastos: gastosM,
    };
  });
}

export async function getMonthlyPerformance() {
  const movements = await getFinanceMovements();
  return buildMonthlyPerformance(movements);
}

// ─── Advisor activity report ───────────────────────────────────────────────

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
    const name = (v as any).advisor_buyer_id
      ? (advisorMap.get((v as any).advisor_buyer_id) ?? "Sin asesor")
      : "Sin asesor";
    const existing = slot.entries.find((e) => e.advisorName === name);
    if (existing) existing.count++;
    else slot.entries.push({ advisorName: name, count: 1 });
    slot.totalEntries++;
  }

  for (const s of salesRes.data ?? []) {
    const d = new Date((s as any).created_at);
    const slot = months.find((m) => m.monthNum === d.getMonth() && m.year === d.getFullYear());
    if (!slot) continue;
    const name = (s as any).seller_id
      ? (advisorMap.get((s as any).seller_id) ?? "Sin asesor")
      : "Sin asesor";
    const value = Number((s as any).agreed_price) || 0;
    const existing = slot.sales.find((e) => e.advisorName === name);
    if (existing) {
      existing.count++;
      existing.totalValue += value;
    } else {
      slot.sales.push({ advisorName: name, count: 1, totalValue: value });
    }
    slot.totalSales++;
    slot.totalSalesValue += value;
  }

  return months;
}
