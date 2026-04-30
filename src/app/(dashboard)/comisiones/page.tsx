import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getCommissions } from "@/lib/data/commissions";
import { compactCOP } from "@/lib/utils";
import { CircleDollarSign, HandCoins, Percent, Users } from "lucide-react";

export default async function CommissionsPage() {
  const commissions = await getCommissions();
  const pending = commissions.filter((commission) => commission.status === "Pendiente");
  const totalPending = pending.reduce((sum, commission) => sum + commission.amount, 0);
  const totalPaid = commissions.filter((commission) => commission.status === "Pagada").reduce((sum, commission) => sum + commission.amount, 0);

  return (
    <>
      <PageHeader
        eyebrow="Asesores y comisiones"
        title="Control de captadores, vendedores y crédito"
        description="Reglas visuales actuales: captador 20%, vendedor 20% y crédito 33% sobre el valor que ingresa a la empresa."
        actionLabel="Registrar comisión"
        actionHref="/comisiones/nueva"
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Comisiones pendientes" value={compactCOP(totalPending)} helper={`${pending.length} registros por validar`} icon={HandCoins} tone="red" />
        <StatCard label="Comisiones pagadas" value={compactCOP(totalPaid)} helper="Pagos del periodo" icon={CircleDollarSign} tone="green" />
        <StatCard label="Asesores activos" value="5" helper="Captadores, vendedores y aliados" icon={Users} tone="blue" />
        <StatCard label="Regla base" value="20 / 20 / 33" helper="Captador · vendedor · crédito" icon={Percent} tone="gold" />
      </div>

      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Comisiones registradas</CardTitle>
          <CardDescription>Estado de pago por asesor, rol y vehículo.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-zinc-900 bg-zinc-950/60 text-xs uppercase tracking-[0.18em] text-zinc-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Asesor</th>
                  <th className="px-5 py-4 font-medium">Rol</th>
                  <th className="px-5 py-4 font-medium">Vehículo</th>
                  <th className="px-5 py-4 font-medium">Mes</th>
                  <th className="px-5 py-4 font-medium">Estado</th>
                  <th className="px-5 py-4 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-b border-zinc-900/80 hover:bg-zinc-950/70">
                    <td className="px-5 py-4 font-medium text-white">{commission.advisor}</td>
                    <td className="px-5 py-4 text-zinc-400">{commission.role}</td>
                    <td className="px-5 py-4 text-zinc-300">{commission.vehicle}</td>
                    <td className="px-5 py-4 text-zinc-400">{commission.month}</td>
                    <td className="px-5 py-4"><Badge tone={commission.status === "Pagada" ? "green" : "amber"}>{commission.status}</Badge></td>
                    <td className="px-5 py-4 text-right text-[#D6A93D]">{compactCOP(commission.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
