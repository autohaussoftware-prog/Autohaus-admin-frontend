import { PageHeader } from "@/components/shared/page-header";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { getMonthlyPerformance } from "@/lib/data/reports";

export default async function ReportsPage() {
  const monthlyPerformance = await getMonthlyPerformance();

  return (
    <>
      <PageHeader
        eyebrow="Reportes"
        title="Reportes bancarios, efectivo y consolidado"
        description="Vista diseñada para que dueños y socios entiendan rentabilidad real, flujo, cartera, comisiones y costos por periodo."
      />
      <ReportsDashboard monthlyPerformance={monthlyPerformance} />
    </>
  );
}

