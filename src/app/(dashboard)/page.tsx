import { ExecutiveDashboard } from "@/components/dashboard/executive-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { getExecutiveDashboardData } from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const dashboardData = await getExecutiveDashboardData();

  return (
    <>
      <PageHeader
        eyebrow="Dashboard principal"
        title="Control ejecutivo del negocio"
        description="Vista central para dueños y socios: inventario, capital, utilidad, alertas, banco, efectivo y prioridades operativas."
        actionLabel="Nuevo movimiento"
        actionHref="/movimientos/nuevo"
      />
      <ExecutiveDashboard data={dashboardData} />
    </>
  );
}
