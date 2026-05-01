"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createVehicleCost, deleteVehicleCost } from "@/lib/data/costs";
import { getCurrentUserName, getUserRole } from "@/lib/supabase/server";

const costSchema = z.object({
  vehicleId: z.string().uuid(),
  category: z.string().min(1),
  description: z.string().min(2),
  amount: z.preprocess((v) => Number(v), z.number().positive("El monto debe ser mayor a cero")),
  date: z.string().min(1),
  provider: z.string().optional(),
  paid: z.preprocess((v) => v === "true" || v === true, z.boolean()),
});

export async function createVehicleCostAction(formData: FormData) {
  const role = await getUserRole();
  if (role === "viewer") return { error: "Sin permisos para registrar costos." };

  const parsed = costSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const userName = await getCurrentUserName();

  try {
    await createVehicleCost({ ...parsed.data, createdBy: userName });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error registrando costo." };
  }

  revalidatePath(`/vehiculos/${parsed.data.vehicleId}`);
  return { success: true };
}

export async function deleteVehicleCostAction(costId: string, vehicleId: string) {
  const role = await getUserRole();
  if (!["owner", "partner", "admin"].includes(role)) return { error: "Sin permisos para eliminar costos." };

  try {
    await deleteVehicleCost(costId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error eliminando costo." };
  }

  revalidatePath(`/vehiculos/${vehicleId}`);
  return { success: true };
}
