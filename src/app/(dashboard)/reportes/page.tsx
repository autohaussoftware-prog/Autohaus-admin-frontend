import { PageHeader } from "@/components/shared/page-header";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { AdvisorActivityReport } from "@/components/reports/advisor-activity";
import { getMonthlyPerformance, getMonthlyAdvisorActivity } from "@/lib/data/reports";

export default async function ReportsPage() {
  const [monthlyPerformance, advisorActivity] = await Promise.all([
    getMonthlyPerformance(),
    getMonthlyAdvisorActivity(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Reportes"
        title="Reportes bancarios, efectivo y consolidado"
        description="Vista diseñada para que dueños y socios entiendan rentabilidad real, flujo, cartera, comisiones y costos por periodo."
      />
      <ReportsDashboard monthlyPerformance={monthlyPerformance} />
      <AdvisorActivityReport data={advisorActivity} />
    </>
  );
}
