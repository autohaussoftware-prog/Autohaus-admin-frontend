import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarX2,
  Car,
  Clock,
  FileText,
  Printer,
  User,
} from "lucide-react";
import { getSaleById } from "@/lib/data/sales";
import { getPaymentsBySaleId } from "@/lib/data/payments";
import { getUserRole } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalePayments } from "@/components/sales/sale-payments";
import { SaleStatusPanel } from "@/components/sales/sale-status-panel";
import { DeliveryChecklist } from "@/components/sales/delivery-checklist";
import { ConfirmSaleButton } from "@/components/sales/confirm-sale-button";
import { currencyCOP } from "@/lib/utils";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

function isExpired(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

const STATUS_LABELS: Record<string, string> = {
  separacion: "Separación",
  vendido: "Vendido",
  entregado: "Entregado",
  anulado: "Anulado",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sale, payments, role] = await Promise.all([
    getSaleById(id),
    getPaymentsBySaleId(id),
    getUserRole(),
  ]);

  if (!sale) notFound();

  const expired = isExpired(sale.expiryDate);
  const canConfirm = ["owner", "partner", "admin", "accounting"].includes(role);
  const canAddPayment = role !== "viewer";
  const canEditStatuses = ["owner", "partner", "admin", "accounting", "advisor"].includes(role);
  const canDeliver = ["owner", "partner", "admin", "accounting"].includes(role);
  const alreadyDelivered = sale.saleStatus === "entregado" || sale.deliveryStatus === "completada";
  const canShowDelivery = canDeliver && (sale.saleStatus === "vendido" || alreadyDelivered);

  return (
    <>
      <PageHeader
        eyebrow="Ventas y separaciones"
        title={`${sale.vehicleName} — ${sale.vehiclePlate}`}
        description={`Registro comercial · ${formatDate(sale.createdAt)}`}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/ventas" className={buttonClassName({ variant: "outline", size: "sm" })}>
          <ArrowLeft className="h-4 w-4" />
          Volver a ventas
        </Link>
        <Link href={`/vehiculos/${sale.vehicleId}`} className={buttonClassName({ variant: "outline", size: "sm" })}>
          <Car className="h-4 w-4" />
          Ver vehículo
        </Link>
        {sale.saleStatus === "separacion" && canConfirm && (
          <ConfirmSaleButton saleId={sale.id} vehicleId={sale.vehicleId} />
        )}
        {(sale.saleStatus === "vendido" || alreadyDelivered) && (
          <Link
            href={`/ventas/${sale.id}/acta`}
            target="_blank"
            className={buttonClassName({ variant: "outline", size: "sm" })}
          >
            <Printer className="h-4 w-4" />
            Acta de entrega
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Estado general — editable */}
          <Card>
            <CardHeader className="border-b border-zinc-900">
              <div className="flex items-center justify-between">
                <CardTitle>Estado del proceso</CardTitle>
                <Badge
                  tone={
                    sale.saleStatus === "entregado" ? "green"
                    : sale.saleStatus === "vendido" ? "blue"
                    : sale.saleStatus === "separacion" ? "gold"
                    : "neutral"
                  }
                >
                  {STATUS_LABELS[sale.saleStatus] ?? sale.saleStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <SaleStatusPanel
                saleId={sale.id}
                initialPaymentStatus={sale.paymentStatus}
                initialDocumentStatus={sale.documentStatus}
                initialDeliveryStatus={sale.deliveryStatus}
                canEdit={canEditStatuses && !alreadyDelivered}
              />
            </CardContent>
          </Card>

          {/* Condiciones comerciales */}
          <Card>
            <CardHeader className="border-b border-zinc-900">
              <CardTitle>Condiciones comerciales</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 p-5 sm:grid-cols-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Precio acordado</p>
                <p className="text-lg font-bold text-[#D6A93D]">{currencyCOP(sale.agreedPrice)}</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Abono inicial</p>
                <p className="text-sm font-semibold text-white">{currencyCOP(sale.initialPayment)}</p>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Saldo pendiente</p>
                <p className={`text-sm font-semibold ${sale.pendingBalance > 0 ? "text-red-400" : "text-emerald-400"}`}>
                  {sale.pendingBalance > 0 ? currencyCOP(sale.pendingBalance) : "Saldado"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Abonos */}
          <SalePayments
            saleId={sale.id}
            payments={payments}
            pendingBalance={sale.pendingBalance}
            canAdd={canAddPayment && !alreadyDelivered}
          />

          {/* Flujo de entrega */}
          {canShowDelivery && (
            <Card>
              <CardHeader className="border-b border-zinc-900">
                <CardTitle>Entrega al cliente</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <DeliveryChecklist
                  saleId={sale.id}
                  vehicleId={sale.vehicleId}
                  vehicleName={sale.vehicleName}
                  alreadyDelivered={alreadyDelivered}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Cliente */}
          <Card>
            <CardHeader className="border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-zinc-500" />
                <CardTitle>Cliente</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <InfoRow label="Nombre" value={sale.customerName ?? "Sin nombre"} />
              {sale.customerPhone && <InfoRow label="Teléfono" value={sale.customerPhone} />}
              {sale.customerDocument && <InfoRow label="Documento" value={sale.customerDocument} />}
            </CardContent>
          </Card>

          {/* Asesor */}
          {sale.sellerName && (
            <Card>
              <CardHeader className="border-b border-zinc-900">
                <CardTitle>Asesor vendedor</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <InfoRow label="Nombre" value={sale.sellerName} />
              </CardContent>
            </Card>
          )}

          {/* Fechas */}
          <Card>
            <CardHeader className="border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-zinc-500" />
                <CardTitle>Fechas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <InfoRow label="Registro" value={formatDate(sale.createdAt)} />
              {sale.expiryDate && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Límite separación</p>
                  <div className="flex items-center gap-2">
                    {expired && <CalendarX2 className="h-4 w-4 text-red-400" />}
                    <p className={`text-sm font-medium ${expired ? "text-red-400" : "text-white"}`}>
                      {formatDate(sale.expiryDate)}{expired && " — VENCIDA"}
                    </p>
                  </div>
                </div>
              )}
              {sale.closedAt && <InfoRow label="Cierre comercial" value={formatDate(sale.closedAt)} />}
            </CardContent>
          </Card>

          {/* Vehículo */}
          <Card>
            <CardHeader className="border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-zinc-500" />
                <CardTitle>Vehículo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <InfoRow label="Marca / Línea" value={`${sale.vehicleBrand} ${sale.vehicleLine}`} />
              {sale.vehicleVersion && <InfoRow label="Versión" value={sale.vehicleVersion} />}
              <InfoRow label="Placa" value={sale.vehiclePlate || "Sin placa"} />
              <Link
                href={`/vehiculos/${sale.vehicleId}`}
                className="mt-1 inline-flex items-center gap-1 text-xs text-[#D6A93D] hover:underline"
              >
                <FileText className="h-3 w-3" />
                Ver ficha completa
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
