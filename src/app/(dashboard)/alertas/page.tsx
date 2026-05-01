import Link from "next/link";
import { AlertTriangle, BellRing, Car, CheckCircle2, CreditCard, ExternalLink, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getAlerts, getResolvedAlertsCount } from "@/lib/data/alerts";

export default async function AlertsPage() {
  const [alerts, resolved] = await Promise.all([getAlerts(), getResolvedAlertsCount()]);
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
        <StatCard label="Resueltas" value={`${resolved}`} helper="Últimos 30 días" icon={CheckCircle2} tone="green" />
      </div>

      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Alertas abiertas</CardTitle>
          <CardDescription>Lista visual de riesgos actuales del negocio.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 lg:grid-cols-2">
          {alerts.length === 0 && (
            <div className="lg:col-span-2 flex flex-col items-center justify-center gap-3 py-16">
              <CheckCircle2 className="h-10 w-10 text-emerald-700" />
              <p className="text-sm text-zinc-500">Sin alertas activas en este momento.</p>
            </div>
          )}
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Badge tone="neutral">{alert.module}</Badge>
                  <h3 className="mt-3 font-semibold text-white">{alert.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{alert.description}</p>
                </div>
                <Badge tone={alert.priority === "Alta" ? "red" : "amber"}>{alert.priority}</Badge>
              </div>
              {(alert.vehicleId || alert.saleId) && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
                  {alert.vehicleId && (
                    <Link
                      href={`/vehiculos/${alert.vehicleId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#D6A93D]/50 hover:text-white transition"
                    >
                      <Car className="h-3 w-3" />
                      Ver vehículo
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                  {alert.saleId && (
                    <Link
                      href={`/ventas/${alert.saleId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#D6A93D]/50 hover:text-white transition"
                    >
                      <CreditCard className="h-3 w-3" />
                      Ver venta
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
