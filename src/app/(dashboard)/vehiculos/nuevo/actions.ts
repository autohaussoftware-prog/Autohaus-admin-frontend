"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createVehicle } from "@/lib/data/vehicles";
import { getCurrentUserProfile } from "@/lib/supabase/server";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : Number(value)),
  z.number().nonnegative().optional()
);

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional()
);

const vehicleSchema = z.object({
  plate: z.string().trim().min(3, "La placa debe tener al menos 3 caracteres."),
  brand: z.string().trim().min(2, "La marca es obligatoria."),
  line: z.string().trim().min(1, "La línea es obligatoria."),
  version: optionalText,
  year: z.preprocess(
    (v) => (v === "" || v === null ? undefined : Number(v)),
    z.number({ message: "El modelo (año) es obligatorio." }).positive("El modelo (año) debe ser positivo.")
  ),
  mileage: optionalNumber,
  color: z.string().trim().min(1, "El color es obligatorio."),
  motor: optionalText,
  transmission: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.enum(["Manual", "Automática"] as const, { message: "Selecciona Manual o Automática." })
  ),
  fuel: z.string().trim().min(1, "El combustible es obligatorio."),
  traction: optionalText,
  cityRegistration: optionalText,
  legalStatus: z.enum(["Sí", "No"], { message: "Selecciona si tiene prenda." }),
  lienValue: optionalNumber,
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
      ctx.addIssue({ code: "custom", message: "El nombre del propietario es obligatorio en consignación.", path: ["ownerName"] });
    }
    if (!data.ownerPhone?.trim()) {
      ctx.addIssue({ code: "custom", message: "El contacto del propietario es obligatorio en consignación.", path: ["ownerPhone"] });
    }
    if (!data.targetPrice) {
      ctx.addIssue({ code: "custom", message: "El precio de publicación es obligatorio en consignación.", path: ["targetPrice"] });
    }
  }
});

export async function createVehicleAction(
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const rawData = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => !(v instanceof File))
  );

  const parsed = vehicleSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los campos obligatorios." };
  }

  const profile = await getCurrentUserProfile();
  let vehicleId: string;

  try {
    vehicleId = await createVehicle({ ...parsed.data, createdByUserId: profile.id });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear el vehículo." };
  }

  revalidatePath("/inventario");
  revalidatePath("/vehiculos");
  redirect(`/vehiculos/${vehicleId}`);
}
