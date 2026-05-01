import { PageHeader } from "@/components/shared/page-header";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { ReportDateFilter } from "@/components/reports/report-date-filter";
import { AdvisorActivityReport } from "@/components/reports/advisor-activity";
import { VehicleProfitability } from "@/components/reports/vehicle-profitability";
import { getMonthlyPerformance, getMonthlyAdvisorActivity, getVehicleProfitability } from "@/lib/data/reports";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const params = await searchParams;
  const { dateFrom, dateTo } = params;

  const [monthlyPerformance, advisorActivity, profitability] = await Promise.all([
    getMonthlyPerformance(6),
    getMonthlyAdvisorActivity(),
    getVehicleProfitability(dateFrom, dateTo),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Reportes"
        title="Rentabilidad y desempeño operativo"
        description="Utilidad real por vehículo vendido, rendimiento mensual y actividad por asesor. Calculado desde ventas confirmadas."
      />
      <ReportDateFilter />
      <ReportsDashboard monthlyPerformance={monthlyPerformance} />
      <div className="mt-6">
        <VehicleProfitability rows={profitability} />
      </div>
      <div className="mt-6">
        <AdvisorActivityReport data={advisorActivity} />
      </div>
    </>
  );
}
