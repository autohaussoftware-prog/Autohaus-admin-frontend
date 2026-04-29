"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createVehicle } from "@/lib/data/vehicles";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : Number(value)),
  z.number().nonnegative().optional()
);

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

const vehicleSchema = z.object({
  plate: z.string().trim().min(3),
  brand: z.string().trim().min(2),
  line: z.string().trim().min(1),
  version: optionalText,
  year: optionalNumber,
  mileage: optionalNumber,
  color: optionalText,
  motor: optionalText,
  transmission: optionalText,
  fuel: optionalText,
  traction: optionalText,
  cityRegistration: optionalText,
  legalStatus: optionalText,
  status: z.enum(["Disponible", "Separado", "Vendido", "En comisión", "En reparación", "En trámite", "Entregado", "Publicado", "No publicado", "Papeles pendientes"]),
  locationId: optionalText,
  ownerType: z.enum(["Propio", "Comisión"]),
  buyPrice: optionalNumber,
  targetPrice: optionalNumber,
  minPrice: optionalNumber,
  estimatedCost: optionalNumber,
  realCost: optionalNumber,
  advisorBuyerId: optionalText,
  advisorSellerId: optionalText,
  soatDue: optionalText,
  technoDue: optionalText,
});

export async function createVehicleAction(formData: FormData) {
  const parsed = vehicleSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect("/vehiculos/nuevo?error=validation");
  }

  let vehicleId: string;

  try {
    vehicleId = await createVehicle(parsed.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el vehículo.";
    redirect(`/vehiculos/nuevo?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/inventario");
  revalidatePath("/vehiculos");
  redirect(`/vehiculos/${vehicleId}`);
}

