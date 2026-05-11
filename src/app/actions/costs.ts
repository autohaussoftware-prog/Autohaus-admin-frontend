"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createVehicleCost, deleteVehicleCost } from "@/lib/data/costs";
import { getCurrentUserName, getUserRole } from "@/lib/supabase/server";
import { ROLES, requireRole, isValidUUID } from "@/lib/security";

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
  const denied = requireRole(role, ROLES.VEHICLE_WRITE, "Sin permisos para registrar costos.");
  if (denied) return denied;

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
  if (!isValidUUID(costId) || !isValidUUID(vehicleId)) {
    return { error: "ID inválido." };
  }

  const role = await getUserRole();
  const denied = requireRole(role, ROLES.VEHICLE_DELETE, "Sin permisos para eliminar costos.");
  if (denied) return denied;

  const userName = await getCurrentUserName();

  try {
    await deleteVehicleCost(costId, vehicleId, userName);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error eliminando costo." };
  }

  revalidatePath(`/vehiculos/${vehicleId}`);
  return { success: true };
}
