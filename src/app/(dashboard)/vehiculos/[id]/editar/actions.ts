"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { updateVehicle } from "@/lib/data/vehicles";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null ? undefined : Number(v)),
  z.number().nonnegative().optional()
);

const optionalText = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
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

export async function updateVehicleAction(vehicleId: string, formData: FormData) {
  const parsed = vehicleSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirect(`/vehiculos/${vehicleId}/editar?error=validation`);
  }

  try {
    await updateVehicle(vehicleId, parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo actualizar el vehículo.";
    redirect(`/vehiculos/${vehicleId}/editar?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/vehiculos/${vehicleId}`);
  revalidatePath("/inventario");
  revalidatePath("/vehiculos");
  redirect(`/vehiculos/${vehicleId}`);
}
