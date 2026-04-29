import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { createVehicleAction } from "./actions";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getVehicleFormOptions } from "@/lib/data/vehicles";

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
  const [{ locations, advisors }, params] = await Promise.all([getVehicleFormOptions(), searchParams]);
  const error = params.error ? decodeURIComponent(params.error) : null;

  return (
    <>
      <PageHeader
        eyebrow="Ingreso de inventario"
        title="Nuevo vehículo"
        description="Registro operativo mínimo para alimentar inventario, ficha individual y trazabilidad inicial."
      />

      <form action={createVehicleAction} className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error === "validation" ? "Revisa placa, marca y línea. Son campos obligatorios." : error}
          </div>
        )}

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Identificación</CardTitle>
            <CardDescription>Datos básicos del vehículo. Luego podrán venir desde documentos con IA.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Placa">
              <Input name="plate" required placeholder="KMQ918" className="uppercase" />
            </Field>
            <Field label="Marca">
              <Input name="brand" required placeholder="BMW" />
            </Field>
            <Field label="Línea">
              <Input name="line" required placeholder="X6" />
            </Field>
            <Field label="Versión">
              <Input name="version" placeholder="xDrive40i M Sport" />
            </Field>
            <Field label="Año">
              <Input name="year" type="number" min="1900" max="2100" placeholder="2022" />
            </Field>
            <Field label="Kilometraje">
              <Input name="mileage" type="number" min="0" placeholder="28500" />
            </Field>
            <Field label="Color">
              <Input name="color" placeholder="Negro" />
            </Field>
            <Field label="Ciudad matrícula">
              <Input name="cityRegistration" placeholder="Medellín" />
            </Field>
            <Field label="Estado legal">
              <Input name="legalStatus" placeholder="Sin restricciones" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Especificaciones</CardTitle>
            <CardDescription>Campos técnicos visibles en la ficha individual.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Motor">
              <Input name="motor" placeholder="3.0L TwinPower Turbo" />
            </Field>
            <Field label="Transmisión">
              <Input name="transmission" placeholder="Automática" />
            </Field>
            <Field label="Combustible">
              <Input name="fuel" placeholder="Gasolina" />
            </Field>
            <Field label="Tracción">
              <Input name="traction" placeholder="AWD" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Negocio</CardTitle>
            <CardDescription>Datos que alimentan rentabilidad, estados y operación.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Estado">
              <Select name="status" defaultValue="Disponible">
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
              <Select name="ownerType" defaultValue="Propio">
                <option>Propio</option>
                <option>Comisión</option>
              </Select>
            </Field>
            <Field label="Ubicación">
              <Select name="locationId" defaultValue="">
                <option value="">Sin ubicación</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Precio compra">
              <Input name="buyPrice" type="number" min="0" placeholder="315000000" />
            </Field>
            <Field label="Precio objetivo">
              <Input name="targetPrice" type="number" min="0" placeholder="369000000" />
            </Field>
            <Field label="Precio mínimo">
              <Input name="minPrice" type="number" min="0" placeholder="354000000" />
            </Field>
            <Field label="Costo estimado">
              <Input name="estimatedCost" type="number" min="0" placeholder="14500000" />
            </Field>
            <Field label="Costo real inicial">
              <Input name="realCost" type="number" min="0" placeholder="0" />
            </Field>
            <Field label="Asesor captador">
              <Select name="advisorBuyerId" defaultValue="">
                <option value="">Sin asignar</option>
                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>{advisor.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Asesor vendedor">
              <Select name="advisorSellerId" defaultValue="">
                <option value="">Sin asignar</option>
                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>{advisor.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="SOAT vence">
              <Input name="soatDue" type="date" />
            </Field>
            <Field label="Tecnomecánica vence">
              <Input name="technoDue" type="date" />
            </Field>
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
