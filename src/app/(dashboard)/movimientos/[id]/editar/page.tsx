import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { updateMovimientoAction } from "@/app/actions/movimientos";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getVehicles } from "@/lib/data/vehicles";
import { getFinanceMovementById } from "@/lib/data/finance";
import { getUserRole } from "@/lib/supabase/server";
import { hasRole, ROLES } from "@/lib/security";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

export default async function EditMovimientoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const error = sp.error ? decodeURIComponent(sp.error) : null;

  const role = await getUserRole();
  if (!hasRole(role, ROLES.FINANCE_WRITE)) notFound();

  const [movement, vehicles] = await Promise.all([
    getFinanceMovementById(id),
    getVehicles(),
  ]);

  if (!movement) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Movimientos financieros"
        title="Editar movimiento"
        description="Modifica los datos del movimiento registrado."
      />

      <form action={updateMovimientoAction} className="space-y-6">
        <input type="hidden" name="id" value={id} />

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Datos del movimiento</CardTitle>
            <CardDescription>Los cambios quedan registrados en el historial financiero.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Tipo">
              <Select name="type" defaultValue={movement.type}>
                <option value="Ingreso">Ingreso</option>
                <option value="Egreso">Egreso</option>
              </Select>
            </Field>
            <Field label="Canal">
              <Select name="channel" defaultValue={movement.channel}>
                <option value="Banco">Banco</option>
                <option value="Efectivo José">Efectivo José</option>
                <option value="Efectivo Tomás">Efectivo Tomás</option>
              </Select>
            </Field>
            <Field label="Categoría">
              <Input
                name="category"
                defaultValue={movement.category !== "Sin categoría" ? movement.category : ""}
                placeholder="Ej: Venta, Reparación, Trámite, Comisión"
              />
            </Field>
            <Field label="Concepto">
              <Input name="concept" required defaultValue={movement.concept} placeholder="Descripción del movimiento" />
            </Field>
            <Field label="Monto (COP)">
              <Input name="amount" type="number" min="1" required defaultValue={movement.amount} placeholder="Ej: 5000000" />
            </Field>
            <Field label="Fecha">
              <Input name="date" type="date" required defaultValue={movement.date} />
            </Field>
            <Field label="Responsable">
              <Input name="responsibleName" required defaultValue={movement.responsible} placeholder="Nombre del responsable" />
            </Field>
            <Field label="Vehículo asociado (opcional)">
              <Select name="vehicleId" defaultValue={movement.vehicleId ?? ""}>
                <option value="">Sin vehículo</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.line} — {v.plate}
                  </option>
                ))}
              </Select>
            </Field>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/banco" className={buttonClassName({ variant: "outline" })}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </form>
    </>
  );
}
