"use client";

import { useActionState, useState } from "react";
import { Save, Users } from "lucide-react";
import type { ReactNode } from "react";
import { createVehicleAction } from "@/app/(dashboard)/vehiculos/nuevo/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VehicleIdentificationFields } from "@/components/vehicles/vehicle-identification-fields";
import { VehicleBusinessFields } from "@/components/vehicles/vehicle-business-fields";
import { TransitAuthoritySelect } from "@/components/vehicles/transit-authority-select";
import { PrendaFields } from "@/components/vehicles/prenda-fields";
import { InvestorsSection, type InvestorUser } from "@/components/vehicles/investors-section";

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
  investorUsers,
  fieldErrors = {},
}: {
  values?: Record<string, string>;
  locations: Option[];
  advisors: Option[];
  isAdvisor: boolean;
  investorUsers: InvestorUser[];
  fieldErrors?: Record<string, string[]>;
}) {
  const [ownerType, setOwnerType] = useState(values?.ownerType ?? "Propio");
  const [buyPrice, setBuyPrice] = useState(Number(values?.buyPrice) || 0);
  const isPropio = ownerType === "Propio";

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
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">
              Placa <span className="text-red-400">*</span>
            </span>
            <Input
              name="plate"
              required
              placeholder="KMQ918"
              className="uppercase"
              defaultValue={values?.plate}
            />
            {fieldErrors.plate && <p className="mt-1 text-xs text-red-400">{fieldErrors.plate[0]}</p>}
          </label>
          <VehicleIdentificationFields
            defaultBrand={values?.brand}
            defaultLine={values?.line}
            defaultVersion={values?.version}
            defaultMotor={values?.motor}
            defaultFuel={values?.fuel}
            defaultTransmission={values?.transmission}
            defaultTraction={values?.traction}
            defaultColor={values?.color}
            fieldErrors={fieldErrors}
          />
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">
              Modelo (año) <span className="text-red-400">*</span>
            </span>
            <Input
              name="year"
              type="number"
              min="1900"
              max="2100"
              required
              placeholder="2022"
              defaultValue={values?.year}
            />
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
            defaultAdvisorBuyerId={values?.advisorBuyerId}
            defaultAdvisorSellerId={values?.advisorSellerId}
            defaultSoatDue={values?.soatDue}
            defaultTechnoDue={values?.technoDue}
            defaultOwnerName={values?.ownerName}
            defaultOwnerPhone={values?.ownerPhone}
            fieldErrors={fieldErrors}
            onOwnerTypeChange={setOwnerType}
            onBuyPriceChange={(p) => setBuyPrice(Number(p) || 0)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Información adicional</CardTitle>
          <CardDescription>
            Observaciones internas, pendientes, condiciones especiales o notas de seguimiento.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Observaciones</span>
            <textarea
              name="notes"
              rows={4}
              placeholder="Ej: Pendiente de peritaje. Cliente entrega segunda llave mañana. Detalle en defensa trasera…"
              defaultValue={values?.notes}
              className="w-full resize-y rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none min-h-[100px]"
            />
          </label>
        </CardContent>
      </Card>

      {isPropio && !isAdvisor && (
        <Card>
          <CardHeader className="border-b border-zinc-900">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#D6A93D]" />
              <CardTitle>Inversionistas</CardTitle>
            </div>
            <CardDescription>
              Personas que compran o invierten en este vehículo. La suma debe coincidir con el precio de compra.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <InvestorsSection buyPrice={buyPrice} investorUsers={investorUsers} />
          </CardContent>
        </Card>
      )}
    </>
  );
}

export function NewVehicleForm({
  locations,
  advisors,
  isAdvisor,
  investorUsers,
}: {
  locations: Option[];
  advisors: Option[];
  isAdvisor: boolean;
  investorUsers: InvestorUser[];
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
        investorUsers={investorUsers}
        fieldErrors={state.fieldErrors}
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
