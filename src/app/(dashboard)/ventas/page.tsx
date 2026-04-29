import { CircleDollarSign, CreditCard, FileClock, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getVehicles } from "@/lib/data/vehicles";

export default async function SalesPage() {
  const vehicles = await getVehicles();
  const separated = vehicles.filter((vehicle) => vehicle.status === "Separado");
  const sold = vehicles.filter((vehicle) => vehicle.status === "Vendido" || vehicle.status === "Entregado");

  return (
    <>
      <PageHeader
        eyebrow="Ventas y separaciones"
        title="Pipeline comercial"
        description="Control visual del proceso desde separación hasta pago completo, papeles y entrega."
        actionLabel="Registrar venta"
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Separados" value={`${separated.length}`} helper="Con o sin saldo pendiente" icon={FileClock} tone="gold" />
        <StatCard label="Vendidos" value={`${sold.length}`} helper="Cierre comercial registrado" icon={ShoppingBag} tone="green" />
        <StatCard label="Pagos pendientes" value="$48M" helper="Antes de entrega" icon={CreditCard} tone="red" />
        <StatCard label="Ventas del mes" value="$1.100M" helper="Base mock para dashboard" icon={CircleDollarSign} tone="blue" />
      </div>

      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Separaciones activas</CardTitle>
          <CardDescription>Vehículos que requieren seguimiento comercial y financiero.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 lg:grid-cols-2">
          {separated.map((vehicle) => (
            <div key={vehicle.id} className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white">{vehicle.brand} {vehicle.line}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{vehicle.plate} · {vehicle.version}</p>
                </div>
                <Badge tone="amber">Separado</Badge>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div><p className="text-xs text-zinc-500">Precio</p><p className="text-sm text-white">$329M</p></div>
                <div><p className="text-xs text-zinc-500">Abono</p><p className="text-sm text-emerald-300">$30M</p></div>
                <div><p className="text-xs text-zinc-500">Saldo</p><p className="text-sm text-red-300">$48M</p></div>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-500">Bloquear entrega hasta validar pago completo y salida documental.</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
