"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createVehicle } from "@/lib/data/vehicles";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._\-]/g, "_");
}

async function uploadPhotos(vehicleId: string, files: File[]) {
  const supabase = getSupabaseAdminClient();
  if (!supabase || !files.length) return;

  for (const file of files) {
    if (!file.size) continue;
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${vehicleId}/${Date.now()}-${sanitizeFileName(file.name.replace(/\.[^/.]+$/, ""))}.${ext}`;
      const buffer = new Uint8Array(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("vehicle-photos")
        .upload(path, buffer, { contentType: file.type, upsert: false });

      if (uploadError) continue;

      const { data: { publicUrl } } = supabase.storage.from("vehicle-photos").getPublicUrl(path);

      await supabase.from("vehicle_documents").insert({
        vehicle_id: vehicleId,
        document_type: "foto_vehiculo",
        file_url: publicUrl,
        file_name: file.name,
        status: "aprobado",
      });
    } catch {
      // Foto fallida no debe cancelar el registro del vehículo
    }
  }
}

export async function createVehicleAction(formData: FormData) {
  const rawData = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => !(v instanceof File))
  );

  const parsed = vehicleSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Revisa los campos obligatorios.";
    redirect(`/vehiculos/nuevo?error=${encodeURIComponent(firstError)}`);
  }

  let vehicleId: string;

  try {
    vehicleId = await createVehicle(parsed.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el vehículo.";
    redirect(`/vehiculos/nuevo?error=${encodeURIComponent(message)}`);
  }

  const photoFiles = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (photoFiles.length > 0) {
    await uploadPhotos(vehicleId, photoFiles);
  }

  revalidatePath("/inventario");
  revalidatePath("/vehiculos");
  redirect(`/vehiculos/${vehicleId}`);
}
