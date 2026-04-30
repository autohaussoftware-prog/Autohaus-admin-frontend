import { AlertTriangle, BellRing, CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getAlerts } from "@/lib/data/alerts";

export default async function AlertsPage() {
  const alerts = await getAlerts();
  const high = alerts.filter((alert) => alert.priority === "Alta").length;
  const medium = alerts.filter((alert) => alert.priority !== "Alta").length;

  return (
    <>
      <PageHeader
        eyebrow="Alertas críticas"
        title="Centro de riesgos operativos"
        description="Alertas para pagos incompletos, documentos vencidos, margen bajo, gastos no previstos y movimientos de efectivo grandes."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total activas" value={`${alerts.length}`} helper="Requieren revisión" icon={BellRing} tone="gold" />
        <StatCard label="Prioridad alta" value={`${high}`} helper="Impactan entrega, caja o margen" icon={ShieldAlert} tone="red" />
        <StatCard label="Prioridad media" value={`${medium}`} helper="Seguimiento operativo" icon={AlertTriangle} tone="blue" />
        <StatCard label="Resueltas" value="12" helper="Últimos 30 días" icon={CheckCircle2} tone="green" />
      </div>

      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Alertas abiertas</CardTitle>
          <CardDescription>Lista visual de riesgos actuales del negocio.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 lg:grid-cols-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge tone="neutral">{alert.module}</Badge>
                  <h3 className="mt-3 font-semibold text-white">{alert.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{alert.description}</p>
                </div>
                <Badge tone={alert.priority === "Alta" ? "red" : "amber"}>{alert.priority}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
