import { getCurrentUserProfile } from "@/lib/supabase/server";
import { AdvisorDashboard } from "@/components/dashboard/advisor-dashboard";
import { ExecutiveDashboard } from "@/components/dashboard/executive-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { getExecutiveDashboardData } from "@/lib/data/dashboard";
import { getAdvisorDashboardData } from "@/lib/data/advisor-dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUserProfile();

  if (user.role === "advisor") {
    const data = await getAdvisorDashboardData(user.id);
    return (
      <>
        <PageHeader
          eyebrow="Mi espacio de trabajo"
          title={`Hola, ${user.name.split(" ")[0]}`}
          description="Tus vehículos ingresados, ventas registradas y actividad reciente."
        />
        <AdvisorDashboard data={data} />
      </>
    );
  }

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
