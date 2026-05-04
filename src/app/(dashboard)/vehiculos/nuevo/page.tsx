import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { createVehicleAction } from "./actions";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getVehicleFormOptions } from "@/lib/data/vehicles";
import { getUserRole } from "@/lib/supabase/server";
import { VehicleIdentificationFields } from "@/components/vehicles/vehicle-identification-fields";
import { VehicleBusinessFields } from "@/components/vehicles/vehicle-business-fields";
import { TransitAuthoritySelect } from "@/components/vehicles/transit-authority-select";
import { VehicleFormImages } from "@/components/vehicles/vehicle-form-images";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

export default async function NewVehiclePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ locations, advisors }, params, role] = await Promise.all([
    getVehicleFormOptions(),
    searchParams,
    getUserRole(),
  ]);
  const error = params.error ? decodeURIComponent(params.error) : null;
  const isAdvisor = role === "advisor";

  return (
    <>
      <PageHeader
        eyebrow="Ingreso de inventario"
        title="Nuevo vehículo"
        description="Completa la ficha del vehículo. Los campos marcados con * son obligatorios."
      />

      <form action={createVehicleAction} className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error === "validation"
              ? "Revisa placa, marca, línea y transmisión. Son campos obligatorios."
              : error}
          </div>
        )}

        {/* ── Identificación y especificaciones ──────────────────── */}
        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Identificación y especificaciones</CardTitle>
            <CardDescription>
              Selecciona la marca y línea para auto-completar transmisión, combustible y tracción.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Placa *">
              <Input name="plate" required placeholder="KMQ918" className="uppercase" />
            </Field>
            <VehicleIdentificationFields />
            <Field label="Año">
              <Input name="year" type="number" min="1900" max="2100" placeholder="2022" />
            </Field>
            <Field label="Kilometraje">
              <Input name="mileage" type="number" min="0" placeholder="28500" />
            </Field>
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-400">Organismo de tránsito</span>
              <TransitAuthoritySelect />
            </label>
            <Field label="Estado legal">
              <Input name="legalStatus" placeholder="Sin restricciones" />
            </Field>
          </CardContent>
        </Card>

        {/* ── Negocio ────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Negocio</CardTitle>
            <CardDescription>
              {isAdvisor
                ? "Precios comerciales, estado y asesor captador."
                : "Datos que alimentan rentabilidad, estados y operación."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <VehicleBusinessFields
              isAdvisor={isAdvisor}
              locations={locations}
              advisors={advisors}
            />
          </CardContent>
        </Card>

        {/* ── Fotos del vehículo ─────────────────────────────────── */}
        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Fotos del vehículo</CardTitle>
            <CardDescription>
              Agrega fotos del vehículo. Se guardan automáticamente al registrar.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <VehicleFormImages />
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/vehiculos" className={buttonClassName({ variant: "outline" })}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4" />
            Guardar vehículo
          </Button>
        </div>
      </form>
    </>
  );
}
