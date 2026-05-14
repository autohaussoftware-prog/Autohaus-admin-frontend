"use client";

import { useActionState, useMemo } from "react";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { updateVehicleAction } from "@/app/(dashboard)/vehiculos/[id]/editar/actions";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VehicleIdentificationFields } from "@/components/vehicles/vehicle-identification-fields";
import { VehicleBusinessFields } from "@/components/vehicles/vehicle-business-fields";
import { TransitAuthoritySelect } from "@/components/vehicles/transit-authority-select";
import { PrendaFields } from "@/components/vehicles/prenda-fields";
import type { Vehicle } from "@/types/vehicle";
import type { VehicleActionState } from "@/lib/schemas/vehicle-schema";

type Option = { id: string; name: string };

function vehicleToFormValues(
  vehicle: Vehicle,
  locationId: string,
  advisorBuyerId: string,
  advisorSellerId: string
): Record<string, string> {
  return {
    plate: vehicle.plate,
    brand: vehicle.brand,
    line: vehicle.line,
    version: vehicle.version ?? "",
    year: vehicle.year ? String(vehicle.year) : "",
    mileage: vehicle.mileage ? String(vehicle.mileage) : "",
    color: vehicle.color ?? "",
    motor: vehicle.motor ?? "",
    transmission: vehicle.transmission ?? "",
    fuel: vehicle.fuel ?? "",
    traction: vehicle.traction ?? "",
    cityRegistration: vehicle.cityRegistration ?? "",
    legalStatus: vehicle.legalStatus === "Sí" ? "Sí" : "No",
    lienValue: vehicle.lienValue ? String(vehicle.lienValue) : "",
    ownerType: vehicle.ownerType,
    entryType: vehicle.entryType ?? "Compra",
    locationId,
    status: vehicle.status,
    buyPrice: vehicle.buyPrice ? String(vehicle.buyPrice) : "",
    targetPrice: vehicle.targetPrice ? String(vehicle.targetPrice) : "",
    minPrice: vehicle.minPrice ? String(vehicle.minPrice) : "",
    estimatedCost: vehicle.estimatedCost ? String(vehicle.estimatedCost) : "",
    advisorBuyerId,
    advisorSellerId,
    soatDue: vehicle.soatDue ?? "",
    technoDue: vehicle.technoDue ?? "",
    ownerName: vehicle.ownerName ?? "",
    ownerPhone: vehicle.ownerPhone ?? "",
    notes: vehicle.notes ?? "",
  };
}

export function EditVehicleForm({
  vehicleId,
  vehicle,
  locationId,
  advisorBuyerId,
  advisorSellerId,
  locations,
  advisors,
  isAdvisor,
}: {
  vehicleId: string;
  vehicle: Vehicle;
  locationId: string;
  advisorBuyerId: string;
  advisorSellerId: string;
  locations: Option[];
  advisors: Option[];
  isAdvisor: boolean;
}) {
  const initialValues = useMemo(
    () => vehicleToFormValues(vehicle, locationId, advisorBuyerId, advisorSellerId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const initialState: VehicleActionState = { error: null, attempt: 0, values: initialValues };

  const [state, action, isPending] = useActionState(
    updateVehicleAction.bind(null, vehicleId),
    initialState
  );

  const values = state.values ?? initialValues;
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      )}

      {/* ── Identificación y especificaciones ──────────────────────── */}
      <Card key={state.attempt}>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Identificación y especificaciones</CardTitle>
          <CardDescription>
            Cambia la marca o línea para actualizar las especificaciones automáticamente.
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
              defaultValue={values.plate}
            />
            {fe.plate && <p className="mt-1 text-xs text-red-400">{fe.plate[0]}</p>}
          </label>

          <VehicleIdentificationFields
            defaultBrand={values.brand}
            defaultLine={values.line}
            defaultVersion={values.version}
            defaultMotor={values.motor}
            defaultFuel={values.fuel}
            defaultTransmission={values.transmission}
            defaultTraction={values.traction}
            defaultColor={values.color}
            fieldErrors={fe}
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
              defaultValue={values.year}
            />
            {fe.year && <p className="mt-1 text-xs text-red-400">{fe.year[0]}</p>}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Kilometraje</span>
            <Input
              name="mileage"
              type="number"
              min="0"
              placeholder="28500"
              defaultValue={values.mileage}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Organismo de tránsito</span>
            <TransitAuthoritySelect defaultValue={values.cityRegistration} />
          </label>

          <PrendaFields
            defaultLien={values.legalStatus}
            defaultLienValue={values.lienValue}
          />
        </CardContent>
      </Card>

      {/* ── Negocio ──────────────────────────────────────────────────── */}
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
            isEditMode
            locations={locations}
            advisors={advisors}
            currentRealCost={vehicle.realCost}
            defaultOwnerType={values.ownerType}
            defaultEntryType={values.entryType}
            defaultLocationId={values.locationId}
            defaultStatus={values.status}
            defaultBuyPrice={values.buyPrice}
            defaultTargetPrice={values.targetPrice}
            defaultMinPrice={values.minPrice}
            defaultEstimatedCost={values.estimatedCost}
            defaultAdvisorBuyerId={values.advisorBuyerId}
            defaultAdvisorSellerId={values.advisorSellerId}
            defaultSoatDue={values.soatDue}
            defaultTechnoDue={values.technoDue}
            defaultOwnerName={values.ownerName}
            defaultOwnerPhone={values.ownerPhone}
            fieldErrors={fe}
          />
        </CardContent>
      </Card>

      {/* ── Información adicional ────────────────────────────────────── */}
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
              defaultValue={values.notes}
              className="w-full resize-y rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none min-h-[100px]"
            />
          </label>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={`/vehiculos/${vehicleId}`} className={buttonClassName({ variant: "outline" })}>
          <ArrowLeft className="h-4 w-4" />
          Cancelar
        </Link>
        <Button type="submit" disabled={isPending}>
          <Save className="h-4 w-4" />
          {isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
