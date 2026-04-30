import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { createCommissionAction } from "@/app/actions/commissions";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getAdvisors } from "@/lib/data/commissions";
import { getVehicles } from "@/lib/data/vehicles";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

const currentMonth = new Date().toISOString().slice(0, 7);

export default async function NewCommissionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? decodeURIComponent(params.error) : null;

  const [advisors, vehicles] = await Promise.all([getAdvisors(), getVehicles()]);

  return (
    <>
      <PageHeader
        eyebrow="Comisiones"
        title="Registrar comisión"
        description="Registra una comisión para captador (20%), vendedor (20%) o crédito (33%) vinculada a un vehículo."
      />

      <form action={createCommissionAction} className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Datos de la comisión</CardTitle>
            <CardDescription>Asesor, rol, vehículo asociado y monto calculado.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Asesor">
              <Select name="advisorId" defaultValue="" required>
                <option value="" disabled>Selecciona un asesor</option>
                {advisors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} — {a.role}</option>
                ))}
              </Select>
            </Field>
            <Field label="Rol de comisión">
              <Select name="role" defaultValue="Captador">
                <option value="Captador">Captador (20%)</option>
                <option value="Vendedor">Vendedor (20%)</option>
                <option value="Crédito">Crédito (33%)</option>
              </Select>
            </Field>
            <Field label="Monto (COP)">
              <Input name="amount" type="number" min="1" required placeholder="Ej: 4000000" />
            </Field>
            <Field label="Mes">
              <Input name="month" type="month" defaultValue={currentMonth} required />
            </Field>
            <Field label="Estado">
              <Select name="status" defaultValue="Pendiente">
                <option value="Pendiente">Pendiente</option>
                <option value="Pagada">Pagada</option>
              </Select>
            </Field>
            <Field label="Vehículo asociado (opcional)">
              <Select name="vehicleId" defaultValue="">
                <option value="">Sin vehículo</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.brand} {v.line} — {v.plate}</option>
                ))}
              </Select>
            </Field>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/comisiones" className={buttonClassName({ variant: "outline" })}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4" />
            Registrar comisión
          </Button>
        </div>
      </form>
    </>
  );
}
