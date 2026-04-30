import { getFinanceMovements } from "@/lib/data/finance";
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
