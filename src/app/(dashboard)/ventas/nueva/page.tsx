import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { createSaleAction } from "@/app/actions/sales";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getVehicleFormOptions, getVehicles } from "@/lib/data/vehicles";

function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      {children}
    </label>
  );
}

export default async function NewSalePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : null;

  const [vehicles, { advisors }] = await Promise.all([
    getVehicles(),
    getVehicleFormOptions(),
  ]);

  const availableVehicles = vehicles.filter((v) =>
    v.status === "Disponible" || v.status === "Publicado"
  );

  return (
    <>
      <PageHeader
        eyebrow="Ventas y separaciones"
        title="Registrar venta o separación"
        description="Registra el proceso comercial: cliente, precio acordado, abono inicial y estado documental."
      />

      <form action={createSaleAction} className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Vehículo</CardTitle>
            <CardDescription>Selecciona el vehículo a separar o vender. Solo se muestran los disponibles.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {availableVehicles.length === 0 ? (
              <p className="text-sm text-zinc-500">No hay vehículos disponibles para registrar una venta. Todos están separados, en trámite o vendidos.</p>
            ) : (
              <Field label="Vehículo" required>
                <Select name="vehicleId" defaultValue="" required>
                  <option value="" disabled>Selecciona un vehículo</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.line} {v.version} — {v.plate} ({v.status})
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Cliente</CardTitle>
            <CardDescription>Si el cliente ya existe en el sistema se vinculará automáticamente.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Nombre completo" required>
              <Input name="customerName" required placeholder="Juan García López" />
            </Field>
            <Field label="Teléfono">
              <Input name="customerPhone" type="tel" placeholder="3001234567" />
            </Field>
            <Field label="Documento (CC / NIT)">
              <Input name="customerDocument" placeholder="1234567890" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Condiciones comerciales</CardTitle>
            <CardDescription>Precio acordado, abono y asesor vendedor.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Tipo de registro" required>
              <Select name="saleStatus" defaultValue="separacion">
                <option value="separacion">Separación (con saldo pendiente)</option>
                <option value="vendido">Venta directa (pago completo)</option>
              </Select>
            </Field>
            <Field label="Precio acordado (COP)" required>
              <Input name="agreedPrice" type="number" min="0" required placeholder="Ej: 350000000" />
            </Field>
            <Field label="Abono inicial (COP)">
              <Input name="initialPayment" type="number" min="0" defaultValue="0" placeholder="0" />
            </Field>
            <Field label="Asesor vendedor">
              <Select name="sellerId" defaultValue="">
                <option value="">Sin asignar</option>
                {advisors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Estados operativos</CardTitle>
            <CardDescription>Define el estado actual de pago, documentos y entrega.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-3">
            <Field label="Estado de pago">
              <Select name="paymentStatus" defaultValue="pendiente">
                <option value="pendiente">Pago pendiente</option>
                <option value="parcial">Pago parcial</option>
                <option value="completo">Pagado completo</option>
              </Select>
            </Field>
            <Field label="Estado documental">
              <Select name="documentStatus" defaultValue="pendiente">
                <option value="pendiente">Docs pendientes</option>
                <option value="en_tramite">En trámite</option>
                <option value="completo">Documentos completos</option>
              </Select>
            </Field>
            <Field label="Estado de entrega">
              <Select name="deliveryStatus" defaultValue="pendiente">
                <option value="pendiente">Entrega pendiente</option>
                <option value="programada">Entrega programada</option>
                <option value="completada">Vehículo entregado</option>
              </Select>
            </Field>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/ventas" className={buttonClassName({ variant: "outline" })}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          {availableVehicles.length > 0 && (
            <Button type="submit">
              <Save className="h-4 w-4" />
              Registrar
            </Button>
          )}
        </div>
      </form>
    </>
  );
}
