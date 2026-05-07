import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarX2,
  Car,
  Clock,
  ClipboardList,
  FileText,
  Printer,
  User,
} from "lucide-react";
import { getSaleById } from "@/lib/data/sales";
import { getPaymentsBySaleId } from "@/lib/data/payments";
import { getTraspasosBySaleId } from "@/lib/data/traspasos";
import { getUserRole } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalePayments } from "@/components/sales/sale-payments";
import { SaleStatusPanel } from "@/components/sales/sale-status-panel";
import { DeliveryChecklist } from "@/components/sales/delivery-checklist";
import { ConfirmSaleButton } from "@/components/sales/confirm-sale-button";
import { PaperworkEditor } from "@/components/sales/paperwork-editor";
import { CommissionEditor } from "@/components/sales/commission-editor";
import { CancelSaleButton } from "@/components/sales/cancel-sale-button";
import { TraspasoInlineStatus } from "@/components/traspasos/traspaso-inline-status";
import { currencyCOP } from "@/lib/utils";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
}

function isExpired(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function expiryStatus(paymentMethod: string, expiryDate: string | null, saleStatus: string): "credit" | "vigente" | "vencida" | null {
  if (saleStatus !== "separacion") return null;
  if (paymentMethod === "Crédito") return "credit";
  if (!expiryDate) return null;
  return isExpired(expiryDate) ? "vencida" : "vigente";
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
  const [sale, payments, traspaso, role] = await Promise.all([
    getSaleById(id),
    getPaymentsBySaleId(id),
    getTraspasosBySaleId(id),
    getUserRole(),
  ]);

  if (!sale) notFound();

  const canConfirm = ["owner", "partner", "admin", "accounting"].includes(role);
  const canAddPayment = role !== "viewer";
  const canEditStatuses = ["owner", "partner", "admin", "accounting", "advisor"].includes(role);
  const canEditCommission = ["owner", "partner", "admin", "gerente"].includes(role);
  const canCancelSale = ["owner", "partner", "admin", "gerente"].includes(role);
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
        {canCancelSale && (
          <CancelSaleButton
            saleId={sale.id}
            vehicleId={sale.vehicleId}
            saleStatus={sale.saleStatus}
          />
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

          {/* Liquidación consignación */}
          {sale.vehicleOwnerType === "Comisión" && (
            <Card>
              <CardHeader className="border-b border-zinc-900">
                <div className="flex items-center justify-between">
                  <CardTitle>Liquidación consignación</CardTitle>
                  <span className="rounded-xl border border-[#D6A93D]/40 bg-[#D6A93D]/10 px-3 py-1 text-xs font-medium text-[#D6A93D]">
                    {sale.consignmentRate}% base
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                {/* Summary grid */}
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Precio de venta</p>
                    <p className="mt-1 text-base font-bold text-white">{currencyCOP(sale.agreedPrice)}</p>
                  </div>
                  <div className="rounded-2xl border border-[#D6A93D]/30 bg-[#D6A93D]/5 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#D6A93D]">Comisión</p>
                    <div className="mt-1">
                      <CommissionEditor
                        saleId={sale.id}
                        vehicleId={sale.vehicleId}
                        currentAmount={sale.consignmentCommission}
                        autoAmount={sale.consignmentAutoAmount}
                        rate={sale.consignmentRate}
                        overrideBy={sale.commissionOverrideBy}
                        canEdit={canEditCommission && !alreadyDelivered}
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-700/50 bg-zinc-800/40 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Papeles cliente</p>
                    <p className="mt-2">
                      <PaperworkEditor
                        saleId={sale.id}
                        currentAmount={sale.clientPaperworkAmount}
                        canEdit={canEditStatuses && !alreadyDelivered}
                      />
                    </p>
                    {sale.clientPaperworkAmount > 0 && (
                      <p className="mt-0.5 text-xs text-zinc-500">− {currencyCOP(sale.clientPaperworkAmount)}</p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-emerald-400">Para el propietario</p>
                    <p className="mt-1 text-base font-bold text-emerald-400">{currencyCOP(sale.ownerPayout)}</p>
                  </div>
                </div>

                {/* Formula note */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-400">Fórmula: </span>
                  {currencyCOP(sale.agreedPrice)}
                  {" − comisión ("}{currencyCOP(sale.consignmentCommission)}{")"}
                  {sale.clientPaperworkAmount > 0 && ` − papeles (${currencyCOP(sale.clientPaperworkAmount)})`}
                  {" = "}<span className="font-semibold text-emerald-400">{currencyCOP(sale.ownerPayout)}</span>
                  {" para el propietario"}
                  {sale.commissionIsOverridden && (
                    <span className="ml-2 rounded-full bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 text-amber-400">
                      comisión ajustada manualmente
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Abonos */}
          <SalePayments
            saleId={sale.id}
            payments={payments}
            pendingBalance={sale.pendingBalance}
            ownerName={sale.vehicleOwnerType === "Comisión" ? sale.vehicleOwnerName : null}
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
              <InfoRow label="Forma de pago" value={sale.paymentMethod} />
              {(sale.expiryDate || sale.paymentMethod === "Crédito") && sale.saleStatus === "separacion" && (() => {
                const status = expiryStatus(sale.paymentMethod, sale.expiryDate, sale.saleStatus);
                return (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Límite separación</p>
                    {status === "credit" ? (
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-950/60 border border-blue-800/50 px-2.5 py-0.5 text-xs font-medium text-blue-300">
                          En proceso de crédito
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {status === "vencida" && <CalendarX2 className="h-4 w-4 text-red-400" />}
                        <p className={`text-sm font-medium ${status === "vencida" ? "text-red-400" : "text-white"}`}>
                          {formatDate(sale.expiryDate)}
                        </p>
                        {status === "vigente" && (
                          <span className="rounded-full bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                            Vigente
                          </span>
                        )}
                        {status === "vencida" && (
                          <span className="rounded-full bg-red-950/60 border border-red-800/50 px-2.5 py-0.5 text-xs font-medium text-red-300">
                            Vencida
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
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

          {/* Traspaso */}
          <Card>
            <CardHeader className="border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-zinc-500" />
                <CardTitle>Traspaso</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {traspaso ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Estado</p>
                    <div className="mt-1">
                      <TraspasoInlineStatus
                        traspasoId={traspaso.id}
                        saleId={sale.id}
                        currentStatus={traspaso.status}
                        canEdit={role !== "viewer"}
                      />
                    </div>
                  </div>
                  {traspaso.createdAt && (
                    <InfoRow label="Generado" value={formatDate(traspaso.createdAt)} />
                  )}
                  {traspaso.completedAt && (
                    <InfoRow label="Completado" value={formatDate(traspaso.completedAt)} />
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  {sale.saleStatus === "vendido" || sale.saleStatus === "entregado"
                    ? "Traspaso pendiente de generación."
                    : "Se genera automáticamente al confirmar la venta."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
