import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  CircleDollarSign,
  ExternalLink,
  Mail,
  Phone,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import { getCustomerById } from "@/lib/data/customers";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { compactCOP, currencyCOP } from "@/lib/utils";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

const SALE_STATUS_LABEL: Record<string, string> = {
  separacion: "Separación",
  vendido: "Vendido",
  entregado: "Entregado",
  anulado: "Anulado",
};

const SALE_STATUS_TONE: Record<string, "gold" | "green" | "blue" | "neutral" | "red"> = {
  separacion: "gold",
  vendido: "blue",
  entregado: "green",
  anulado: "red",
};

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) notFound();

  const firstPurchase = customer.purchases.at(-1);
  const isRecurring = customer.purchaseCount >= 2;

  return (
    <>
      <PageHeader
        eyebrow="CRM · Clientes"
        title={customer.fullName}
        description={`Cliente registrado el ${formatDate(customer.createdAt)}`}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/clientes" className={buttonClassName({ variant: "outline", size: "sm" })}>
          <ArrowLeft className="h-4 w-4" />
          Volver a clientes
        </Link>
        {isRecurring && (
          <div className="flex items-center gap-1.5 rounded-2xl border border-[#D6A93D]/30 bg-[#D6A93D]/10 px-3 py-1.5 text-xs text-[#D6A93D]">
            <Star className="h-3.5 w-3.5" />
            Cliente recurrente
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna izquierda — perfil + stats */}
        <div className="space-y-6">
          {/* Perfil */}
          <Card>
            <CardHeader className="border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-zinc-500" />
                <CardTitle>Información de contacto</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-lg font-bold text-zinc-200">
                  {customer.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{customer.fullName}</p>
                  {customer.documentNumber && (
                    <p className="text-xs text-zinc-500">C.C. {customer.documentNumber}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    <span className="text-zinc-300">{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                    <span className="text-zinc-300">{customer.email}</span>
                  </div>
                )}
                {!customer.phone && !customer.email && (
                  <p className="text-sm text-zinc-600">Sin datos de contacto adicionales.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats compactos */}
          <div className="grid gap-3">
            <StatCard
              label="Compras totales"
              value={`${customer.purchaseCount}`}
              helper={isRecurring ? "Cliente recurrente" : "Primera compra"}
              icon={ShoppingBag}
              tone={isRecurring ? "gold" : "neutral"}
            />
            <StatCard
              label="Total facturado"
              value={customer.totalSpent > 0 ? compactCOP(customer.totalSpent) : "—"}
              helper="Precio acordado acumulado"
              icon={CircleDollarSign}
              tone="green"
            />
          </div>

          {firstPurchase && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-1">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Primera compra</p>
              <p className="text-sm font-medium text-white">{firstPurchase.vehicleName}</p>
              <p className="text-xs text-zinc-500">{formatDate(firstPurchase.createdAt)}</p>
            </div>
          )}
        </div>

        {/* Columna derecha — historial */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b border-zinc-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-zinc-500" />
                  <CardTitle>Historial de compras</CardTitle>
                </div>
                <Badge tone={isRecurring ? "gold" : "neutral"}>
                  {customer.purchaseCount} {customer.purchaseCount === 1 ? "compra" : "compras"}
                </Badge>
              </div>
            </CardHeader>

            {customer.purchases.length === 0 ? (
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                <ShoppingBag className="h-8 w-8 text-zinc-600" />
                <p className="text-sm text-zinc-500">Este cliente aún no tiene compras registradas.</p>
              </CardContent>
            ) : (
              <CardContent className="p-0">
                <div className="divide-y divide-zinc-900">
                  {customer.purchases.map((purchase, i) => (
                    <div key={purchase.saleId} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-900/30 transition-colors">
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Indicador de orden */}
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-400">
                          {customer.purchases.length - i}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{purchase.vehicleName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-zinc-500">{purchase.vehiclePlate}</p>
                            <span className="text-zinc-700">·</span>
                            <p className="text-xs text-zinc-500">{formatDate(purchase.createdAt)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#D6A93D]">
                            {currencyCOP(purchase.agreedPrice)}
                          </p>
                          <Badge tone={SALE_STATUS_TONE[purchase.saleStatus] ?? "neutral"}>
                            {SALE_STATUS_LABEL[purchase.saleStatus] ?? purchase.saleStatus}
                          </Badge>
                        </div>
                        <Link
                          href={`/ventas/${purchase.saleId}`}
                          className={buttonClassName({ variant: "outline", size: "sm" })}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {customer.purchaseCount > 1 && (
                  <div className="border-t border-zinc-900 px-5 py-3 flex justify-between items-center">
                    <p className="text-xs text-zinc-500">Total acumulado</p>
                    <p className="text-sm font-bold text-[#D6A93D]">{currencyCOP(customer.totalSpent)}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
