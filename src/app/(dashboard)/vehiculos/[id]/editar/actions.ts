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
  plate: z.string().trim().min(3, "La placa debe tener al menos 3 caracteres."),
  brand: z.string().trim().min(2, "La marca es obligatoria."),
  line: z.string().trim().min(1, "La línea es obligatoria."),
  version: optionalText,
  year: optionalNumber,
  mileage: optionalNumber,
  color: optionalText,
  motor: optionalText,
  transmission: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.enum(["Manual", "Automática"] as const, { message: "Selecciona Manual o Automática." })
  ),
  fuel: optionalText,
  traction: optionalText,
  cityRegistration: optionalText,
  legalStatus: optionalText,
  status: z.enum([
    "Disponible", "Separado", "Vendido", "En comisión", "En reparación",
    "En trámite", "Entregado", "Publicado", "No publicado", "Papeles pendientes",
  ]),
  locationId: optionalText,
  ownerType: z.enum(["Propio", "Comisión"]),
  ownerName: optionalText,
  ownerPhone: optionalText,
  entryType: optionalText,
  buyPrice: optionalNumber,
  targetPrice: optionalNumber,
  minPrice: optionalNumber,
  estimatedCost: optionalNumber,
  realCost: optionalNumber,
  advisorBuyerId: optionalText,
  advisorSellerId: optionalText,
  soatDue: optionalText,
  technoDue: optionalText,
}).superRefine((data, ctx) => {
  if (data.ownerType === "Comisión") {
    if (!data.ownerName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El nombre del propietario es obligatorio en consignación.", path: ["ownerName"] });
    }
    if (!data.ownerPhone?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El contacto del propietario es obligatorio en consignación.", path: ["ownerPhone"] });
    }
    if (!data.targetPrice) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "El precio de publicación es obligatorio en consignación.", path: ["targetPrice"] });
    }
  }
});

export async function updateVehicleAction(vehicleId: string, formData: FormData) {
  const rawData = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => !(v instanceof File))
  );

  const parsed = vehicleSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Revisa los campos obligatorios.";
    redirect(`/vehiculos/${vehicleId}/editar?error=${encodeURIComponent(firstError)}`);
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
