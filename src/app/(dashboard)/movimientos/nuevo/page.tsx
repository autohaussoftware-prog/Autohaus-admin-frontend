import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { createMovimientoAction } from "@/app/actions/movimientos";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getVehicles } from "@/lib/data/vehicles";
import { getCurrentUserName } from "@/lib/supabase/server";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

const today = new Date().toISOString().split("T")[0];

export default async function NewMovimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : null;
  const [vehicles, userName] = await Promise.all([getVehicles(), getCurrentUserName()]);

  return (
    <>
      <PageHeader
        eyebrow="Movimientos financieros"
        title="Registrar movimiento"
        description="Registra un ingreso o egreso en banco o efectivo, vinculado opcionalmente a un vehículo."
      />

      <form action={createMovimientoAction} className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Datos del movimiento</CardTitle>
            <CardDescription>Todos los movimientos quedan trazados en el registro financiero.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Tipo">
              <Select name="type" defaultValue="Ingreso">
                <option value="Ingreso">Ingreso</option>
                <option value="Egreso">Egreso</option>
              </Select>
            </Field>
            <Field label="Canal">
              <Select name="channel" defaultValue="Banco">
                <option value="Banco">Banco</option>
                <option value="Efectivo José">Efectivo José</option>
                <option value="Efectivo Tomás">Efectivo Tomás</option>
              </Select>
            </Field>
            <Field label="Categoría">
              <Input name="category" placeholder="Ej: Venta, Reparación, Trámite, Comisión" />
            </Field>
            <Field label="Concepto">
              <Input name="concept" required placeholder="Descripción del movimiento" />
            </Field>
            <Field label="Monto (COP)">
              <Input name="amount" type="number" min="1" required placeholder="Ej: 5000000" />
            </Field>
            <Field label="Fecha">
              <Input name="date" type="date" defaultValue={today} required />
            </Field>
            <Field label="Responsable">
              <Input name="responsibleName" required defaultValue={userName} placeholder="Nombre del responsable" />
            </Field>
            <Field label="Vehículo asociado (opcional)">
              <Select name="vehicleId" defaultValue="">
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
            Registrar movimiento
          </Button>
        </div>
      </form>
    </>
  );
}
