import Link from "next/link";
import { AlertTriangle, CalendarX2, CircleDollarSign, CreditCard, FileClock, Plus, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ConfirmSaleButton } from "@/components/sales/confirm-sale-button";
import { getSales } from "@/lib/data/sales";
import { getUserRole } from "@/lib/supabase/server";
import { compactCOP, currencyCOP } from "@/lib/utils";

const PAYMENT_LABELS: Record<string, string> = {
  pendiente: "Pago pendiente",
  parcial: "Pago parcial",
  completo: "Pagado",
};

const DELIVERY_LABELS: Record<string, string> = {
  pendiente: "Entrega pendiente",
  programada: "Entrega programada",
  completada: "Entregado",
};

const DOC_LABELS: Record<string, string> = {
  pendiente: "Docs pendientes",
  en_tramite: "En trámite",
  completo: "Docs completos",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export default async function SalesPage() {
  const [sales, role] = await Promise.all([getSales(), getUserRole()]);

  const separated = sales.filter((s) => s.saleStatus === "separacion");
  const sold = sales.filter((s) => s.saleStatus === "vendido");
  const totalPending = separated.reduce((sum, s) => sum + s.pendingBalance, 0);
  const totalSoldValue = sold.reduce((sum, s) => sum + s.agreedPrice, 0);
  const expiredCount = separated.filter((s) => isExpired(s.expiryDate)).length;
  const canConfirmSale = ["owner", "partner", "admin", "accounting"].includes(role);

  return (
    <>
      <PageHeader
        eyebrow="Ventas y separaciones"
        title="Pipeline comercial"
        description="Control del proceso desde separación hasta pago completo, papeles y entrega."
        actionLabel="Registrar venta / separación"
        actionHref="/ventas/nueva"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Separaciones activas" value={`${separated.length}`} helper={expiredCount > 0 ? `${expiredCount} vencida${expiredCount > 1 ? "s" : ""}` : "Pendientes de cierre"} icon={FileClock} tone="gold" />
        <StatCard label="Ventas cerradas" value={`${sold.length}`} helper="Cierre comercial registrado" icon={ShoppingBag} tone="green" />
        <StatCard label="Saldo pendiente total" value={compactCOP(totalPending)} helper="Antes de entrega" icon={CreditCard} tone="red" />
        <StatCard label="Total vendido" value={compactCOP(totalSoldValue)} helper="Precio acordado acumulado" icon={CircleDollarSign} tone="blue" />
      </div>

      {expiredCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">
            <span className="font-semibold">{expiredCount} separación{expiredCount > 1 ? "es" : ""} vencida{expiredCount > 1 ? "s" : ""}.</span>{" "}
            Revisar con el cliente o liberar el vehículo.
          </p>
        </div>
      )}

      {sales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
            <CircleDollarSign className="h-10 w-10 text-zinc-600" />
            <p className="text-zinc-400">No hay ventas ni separaciones registradas aún.</p>
            <Link href="/ventas/nueva" className={buttonClassName({})}>
              <Plus className="h-4 w-4" />
              Registrar primera venta
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {separated.length > 0 && (
            <Card>
              <CardHeader className="border-b border-zinc-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Separaciones activas</CardTitle>
                    <CardDescription>Vehículos con abono parcial, pendientes de cierre total.</CardDescription>
                  </div>
                  <Badge tone="amber">{separated.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 p-5 lg:grid-cols-2">
                {separated.map((sale) => {
                  const expired = isExpired(sale.expiryDate);
                  return (
                    <div
                      key={sale.id}
                      className={`rounded-3xl border p-5 ${expired ? "border-red-500/40 bg-red-500/5" : "border-zinc-800 bg-zinc-950/60"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-white">{sale.vehicleName}</h3>
                          <p className="mt-1 text-sm text-zinc-500">{sale.vehiclePlate}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {expired ? (
                            <Badge tone="red">Separación vencida</Badge>
                          ) : (
                            <Badge tone="amber">Separado</Badge>
                          )}
                        </div>
                      </div>

                      {sale.expiryDate && (
                        <div className={`mt-3 flex items-center gap-1.5 text-xs ${expired ? "text-red-400" : "text-zinc-500"}`}>
                          <CalendarX2 className="h-3.5 w-3.5" />
                          {expired ? "Venció el" : "Vence el"} {formatDate(sale.expiryDate)}
                        </div>
                      )}

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-zinc-500">Precio acordado</p>
                          <p className="text-sm font-medium text-white">{compactCOP(sale.agreedPrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Abono recibido</p>
                          <p className="text-sm font-medium text-emerald-300">{compactCOP(sale.initialPayment)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500">Saldo pendiente</p>
                          <p className="text-sm font-medium text-red-300">{compactCOP(sale.pendingBalance)}</p>
                        </div>
                      </div>

                      {(sale.customerName || sale.sellerName) && (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {sale.customerName && (
                            <div>
                              <p className="text-xs text-zinc-500">Cliente</p>
                              <p className="text-sm text-zinc-300">{sale.customerName}</p>
                              {sale.customerPhone && <p className="text-xs text-zinc-600">{sale.customerPhone}</p>}
                            </div>
                          )}
                          {sale.sellerName && (
                            <div>
                              <p className="text-xs text-zinc-500">Asesor vendedor</p>
                              <p className="text-sm text-zinc-300">{sale.sellerName}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge tone="neutral">{PAYMENT_LABELS[sale.paymentStatus] ?? sale.paymentStatus}</Badge>
                          <Badge tone="neutral">{DOC_LABELS[sale.documentStatus] ?? sale.documentStatus}</Badge>
                          <Badge tone="neutral">{DELIVERY_LABELS[sale.deliveryStatus] ?? sale.deliveryStatus}</Badge>
                        </div>
                        {canConfirmSale && (
                          <ConfirmSaleButton saleId={sale.id} vehicleId={sale.vehicleId} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {sold.length > 0 && (
            <Card>
              <CardHeader className="border-b border-zinc-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Ventas cerradas</CardTitle>
                    <CardDescription>Cierres comerciales registrados.</CardDescription>
                  </div>
                  <Badge tone="green">{sold.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-zinc-900">
                  {sold.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{sale.vehicleName}</p>
                        <p className="text-xs text-zinc-500">
                          {sale.vehiclePlate} · {sale.customerName ?? "Sin cliente"}
                          {sale.sellerName ? ` · ${sale.sellerName}` : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-[#D6A93D]">{compactCOP(sale.agreedPrice)}</p>
                        <Badge tone="green">Vendido</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
