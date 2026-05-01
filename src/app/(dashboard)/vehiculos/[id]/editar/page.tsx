import { notFound } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { updateVehicleAction } from "./actions";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getVehicleById, getVehicleFormOptions } from "@/lib/data/vehicles";
import { getUserRole } from "@/lib/supabase/server";
import { VehicleIdentificationFields } from "@/components/vehicles/vehicle-identification-fields";

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

  const error = sp.error ? decodeURIComponent(sp.error) : null;
  const action = updateVehicleAction.bind(null, id);
  const isAdvisor = role === "advisor";

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
            {error === "validation" ? "Revisa placa, marca y línea. Son campos obligatorios." : error}
          </div>
        )}

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Identificación y especificaciones</CardTitle>
            <CardDescription>Cambia la marca o línea para actualizar las especificaciones automáticamente.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Placa">
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
            />
            <Field label="Año">
              <Input name="year" type="number" defaultValue={vehicle.year || ""} />
            </Field>
            <Field label="Kilometraje">
              <Input name="mileage" type="number" defaultValue={vehicle.mileage || ""} />
            </Field>
            <Field label="Color">
              <Input name="color" defaultValue={vehicle.color} />
            </Field>
            <Field label="Ciudad matrícula">
              <Input name="cityRegistration" defaultValue={vehicle.cityRegistration} />
            </Field>
            <Field label="Estado legal">
              <Input name="legalStatus" defaultValue={vehicle.legalStatus} />
            </Field>
          </CardContent>
        </Card>

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
            <Field label="Estado">
              <Select name="status" defaultValue={vehicle.status}>
                <option>Disponible</option>
                <option>Publicado</option>
                <option>Separado</option>
                <option>Vendido</option>
                <option>En comisión</option>
                <option>En reparación</option>
                <option>En trámite</option>
                <option>Entregado</option>
                <option>No publicado</option>
                <option>Papeles pendientes</option>
              </Select>
            </Field>
            <Field label="Origen">
              <Select name="ownerType" defaultValue={vehicle.ownerType}>
                <option>Propio</option>
                <option>Comisión</option>
              </Select>
            </Field>
            <Field label="Tipo de entrada">
              <Select name="entryType" defaultValue={vehicle.entryType ?? "Compra"}>
                <option>Compra</option>
                <option>Consignación</option>
                <option>Permuta</option>
                <option>Propio</option>
                <option>Socio</option>
                <option>Otro</option>
              </Select>
            </Field>
            <Field label="Ubicación">
              <Select name="locationId" defaultValue={locations.find((l) => l.name === vehicle.location)?.id ?? ""}>
                <option value="">Sin ubicación</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </Select>
            </Field>

            {/* Campos financieros — solo owners, partners y admins */}
            {!isAdvisor && (
              <Field label="Precio compra">
                <Input name="buyPrice" type="number" min="0" defaultValue={vehicle.buyPrice || ""} />
              </Field>
            )}

            <Field label="Precio publicación">
              <Input name="targetPrice" type="number" min="0" defaultValue={vehicle.targetPrice || ""} />
            </Field>
            <Field label="Precio mínimo">
              <Input name="minPrice" type="number" min="0" defaultValue={vehicle.minPrice || ""} />
            </Field>

            {!isAdvisor && (
              <>
                <Field label="Costo estimado">
                  <Input name="estimatedCost" type="number" min="0" defaultValue={vehicle.estimatedCost || ""} />
                </Field>
                <Field label="Costo real acumulado">
                  <Input name="realCost" type="number" min="0" defaultValue={vehicle.realCost || ""} />
                </Field>
              </>
            )}

            <Field label="Asesor captador">
              <Select name="advisorBuyerId" defaultValue={advisors.find((a) => a.name === vehicle.advisorBuyer)?.id ?? ""}>
                <option value="">Sin asignar</option>
                {advisors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </Select>
            </Field>

            {/* Asesor vendedor solo para owners/admins */}
            {!isAdvisor && (
              <Field label="Asesor vendedor">
                <Select name="advisorSellerId" defaultValue={advisors.find((a) => a.name === vehicle.advisorSeller)?.id ?? ""}>
                  <option value="">Sin asignar</option>
                  {advisors.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </Select>
              </Field>
            )}

            <Field label="SOAT vence">
              <Input name="soatDue" type="date" defaultValue={vehicle.soatDue} />
            </Field>
            <Field label="Tecnomecánica vence">
              <Input name="technoDue" type="date" defaultValue={vehicle.technoDue} />
            </Field>
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
