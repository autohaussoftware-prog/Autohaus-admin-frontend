"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import type { ReactNode } from "react";
import { createVehicleAction } from "@/app/(dashboard)/vehiculos/nuevo/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VehicleIdentificationFields } from "@/components/vehicles/vehicle-identification-fields";
import { VehicleBusinessFields } from "@/components/vehicles/vehicle-business-fields";
import { TransitAuthoritySelect } from "@/components/vehicles/transit-authority-select";
import { PrendaFields } from "@/components/vehicles/prenda-fields";

type Option = { id: string; name: string };

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function FormFields({
  values,
  locations,
  advisors,
  isAdvisor,
}: {
  values?: Record<string, string>;
  locations: Option[];
  advisors: Option[];
  isAdvisor: boolean;
}) {
  return (
    <>
      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Identificación y especificaciones</CardTitle>
          <CardDescription>
            Selecciona la marca y línea para auto-completar transmisión, combustible y tracción.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Placa *">
            <Input name="plate" required placeholder="KMQ918" className="uppercase" defaultValue={values?.plate} />
          </Field>
          <VehicleIdentificationFields
            defaultBrand={values?.brand}
            defaultLine={values?.line}
            defaultVersion={values?.version}
            defaultMotor={values?.motor}
            defaultFuel={values?.fuel}
            defaultTransmission={values?.transmission}
            defaultTraction={values?.traction}
            defaultColor={values?.color}
          />
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">
              Modelo (año) <span className="text-red-400">*</span>
            </span>
            <Input name="year" type="number" min="1900" max="2100" required placeholder="2022" defaultValue={values?.year} />
          </label>
          <Field label="Kilometraje">
            <Input name="mileage" type="number" min="0" placeholder="28500" defaultValue={values?.mileage} />
          </Field>
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Organismo de tránsito</span>
            <TransitAuthoritySelect defaultValue={values?.cityRegistration} />
          </label>
          <PrendaFields
            defaultLien={values?.legalStatus}
            defaultLienValue={values?.lienValue}
          />
        </CardContent>
      </Card>

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
            defaultOwnerType={values?.ownerType}
            defaultEntryType={values?.entryType}
            defaultLocationId={values?.locationId}
            defaultStatus={values?.status}
            defaultBuyPrice={values?.buyPrice}
            defaultTargetPrice={values?.targetPrice}
            defaultMinPrice={values?.minPrice}
            defaultEstimatedCost={values?.estimatedCost}
            defaultRealCost={values?.realCost}
            defaultAdvisorBuyerId={values?.advisorBuyerId}
            defaultAdvisorSellerId={values?.advisorSellerId}
            defaultSoatDue={values?.soatDue}
            defaultTechnoDue={values?.technoDue}
            defaultOwnerName={values?.ownerName}
            defaultOwnerPhone={values?.ownerPhone}
          />
        </CardContent>
      </Card>
    </>
  );
}

export function NewVehicleForm({
  locations,
  advisors,
  isAdvisor,
}: {
  locations: Option[];
  advisors: Option[];
  isAdvisor: boolean;
}) {
  const [state, action, isPending] = useActionState(createVehicleAction, { error: null, attempt: 0 });

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      )}

      <FormFields
        key={state.attempt}
        values={state.values}
        locations={locations}
        advisors={advisors}
        isAdvisor={isAdvisor}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending ? "Guardando…" : "Guardar vehículo"}
        </Button>
      </div>
    </form>
  );
}
