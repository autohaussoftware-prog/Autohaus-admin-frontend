import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { updateVehicleAction } from "./actions";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getVehicleById, getVehicleFormOptions } from "@/lib/data/vehicles";
import { getUserRole } from "@/lib/supabase/server";
import { canAccessRoute } from "@/lib/permissions";
import { VehicleIdentificationFields } from "@/components/vehicles/vehicle-identification-fields";
import { VehicleBusinessFields } from "@/components/vehicles/vehicle-business-fields";
import { TransitAuthoritySelect } from "@/components/vehicles/transit-authority-select";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

export default async function EditVehiclePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const [vehicle, { locations, advisors }, sp, role] = await Promise.all([
    getVehicleById(id),
    getVehicleFormOptions(),
    searchParams,
    getUserRole(),
  ]);

  if (!vehicle) notFound();
  if (!canAccessRoute(role, `/vehiculos/${id}/editar`)) redirect("/vehiculos");

  const error = sp.error ? decodeURIComponent(sp.error) : null;
  const action = updateVehicleAction.bind(null, id);
  const isAdvisor = role === "advisor";

  const advisorBuyerId = advisors.find((a) => a.name === vehicle.advisorBuyer)?.id ?? "";
  const advisorSellerId = advisors.find((a) => a.name === vehicle.advisorSeller)?.id ?? "";
  const locationId = locations.find((l) => l.name === vehicle.location)?.id ?? "";

  return (
    <>
      <PageHeader
        eyebrow="Editar vehículo"
        title={`${vehicle.brand} ${vehicle.line}`}
        description="Actualiza cualquier dato del vehículo. Los cambios quedan registrados en el historial."
      />

      <form action={action} className="space-y-6">
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
              Cambia la marca o línea para actualizar las especificaciones automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Placa *">
              <Input name="plate" required defaultValue={vehicle.plate} className="uppercase" />
            </Field>
            <VehicleIdentificationFields
              defaultBrand={vehicle.brand}
              defaultLine={vehicle.line}
              defaultVersion={vehicle.version}
              defaultMotor={vehicle.motor}
              defaultFuel={vehicle.fuel}
              defaultTransmission={vehicle.transmission}
              defaultTraction={vehicle.traction}
              defaultColor={vehicle.color}
            />
            <Field label="Año">
              <Input name="year" type="number" defaultValue={vehicle.year || ""} />
            </Field>
            <Field label="Kilometraje">
              <Input name="mileage" type="number" defaultValue={vehicle.mileage || ""} />
            </Field>
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-400">Organismo de tránsito</span>
              <TransitAuthoritySelect defaultValue={vehicle.cityRegistration} />
            </label>
            <Field label="Estado legal">
              <Input name="legalStatus" defaultValue={vehicle.legalStatus} />
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
                : "Datos financieros, estados y operación."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <VehicleBusinessFields
              isAdvisor={isAdvisor}
              locations={locations}
              advisors={advisors}
              defaultOwnerType={vehicle.ownerType}
              defaultEntryType={vehicle.entryType ?? "Compra"}
              defaultLocationId={locationId}
              defaultStatus={vehicle.status}
              defaultBuyPrice={vehicle.buyPrice || ""}
              defaultTargetPrice={vehicle.targetPrice || ""}
              defaultMinPrice={vehicle.minPrice || ""}
              defaultEstimatedCost={vehicle.estimatedCost || ""}
              defaultRealCost={vehicle.realCost || ""}
              defaultAdvisorBuyerId={advisorBuyerId}
              defaultAdvisorSellerId={advisorSellerId}
              defaultSoatDue={vehicle.soatDue}
              defaultTechnoDue={vehicle.technoDue}
              defaultOwnerName={vehicle.ownerName ?? ""}
              defaultOwnerPhone={vehicle.ownerPhone ?? ""}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href={`/vehiculos/${id}`} className={buttonClassName({ variant: "outline" })}>
            <ArrowLeft className="h-4 w-4" />
            Cancelar
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
