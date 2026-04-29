import { cashBankSeries, monthlyPerformance } from "@/data/mock";
import { getAlerts } from "@/lib/data/alerts";
import { getCommissions } from "@/lib/data/commissions";
import { getFinanceMovements } from "@/lib/data/finance";
import { getVehicles } from "@/lib/data/vehicles";

export async function getExecutiveDashboardData() {
  const [vehicles, financeMovements, alerts, commissions] = await Promise.all([
    getVehicles(),
    getFinanceMovements(),
    getAlerts(),
    getCommissions(),
  ]);

  return {
    vehicles,
    financeMovements,
    alerts,
    commissions,
    monthlyPerformance,
    cashBankSeries,
  };
}

