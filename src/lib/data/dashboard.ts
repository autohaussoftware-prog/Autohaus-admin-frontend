import { getAlerts } from "@/lib/data/alerts";
import { getCommissions } from "@/lib/data/commissions";
import { getFinanceMovements } from "@/lib/data/finance";
import { getMonthlyPerformance } from "@/lib/data/reports";
import { getVehicles } from "@/lib/data/vehicles";
import type { FinanceMovement } from "@/types/finance";

export type CashBankPoint = {
  day: string;
  banco: number;
  efectivo1: number;
  efectivo2: number;
};

function buildCashBankSeries(movements: FinanceMovement[]): CashBankPoint[] {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthMovements = movements
    .filter((m) => m.date.startsWith(currentMonth))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (monthMovements.length === 0) {
    return [1, 5, 10, 15, 20, 25, 30].map((d) => ({
      day: String(d).padStart(2, "0"),
      banco: 0,
      efectivo1: 0,
      efectivo2: 0,
    }));
  }

  const pointsByDay = new Map<string, CashBankPoint>();
  let banco = 0;
  let efectivo1 = 0;
  let efectivo2 = 0;

  for (const m of monthMovements) {
    const day = m.date.split("-")[2];
    const sign = m.type === "Ingreso" ? 1 : -1;
    if (m.channel === "Banco") banco += sign * m.amount;
    else if (m.channel === "Efectivo ubicación 1") efectivo1 += sign * m.amount;
    else efectivo2 += sign * m.amount;

    pointsByDay.set(day, {
      day,
      banco: Math.round(banco / 1_000_000),
      efectivo1: Math.round(efectivo1 / 1_000_000),
      efectivo2: Math.round(efectivo2 / 1_000_000),
    });
  }

  return Array.from(pointsByDay.values());
}

export async function getExecutiveDashboardData() {
  const [vehicles, financeMovements, alerts, commissions, monthlyPerformance] = await Promise.all([
    getVehicles(),
    getFinanceMovements(),
    getAlerts(),
    getCommissions(),
    getMonthlyPerformance(6),
  ]);

  return {
    vehicles,
    financeMovements,
    alerts,
    commissions,
    monthlyPerformance,
    cashBankSeries: buildCashBankSeries(financeMovements),
  };
}
