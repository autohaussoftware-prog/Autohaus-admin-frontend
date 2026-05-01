"use server";

import { revalidatePath } from "next/cache";
import { updateVehicleStatus } from "@/lib/data/vehicles";
import { getUserRole } from "@/lib/supabase/server";
import type { VehicleStatus } from "@/types/vehicle";

export async function updateVehicleStatusAction(vehicleId: string, status: VehicleStatus) {
  const role = await getUserRole();
  if (role === "viewer") return { error: "Sin permisos para cambiar estado." };

  await updateVehicleStatus(vehicleId, status, role);
  revalidatePath(`/vehiculos/${vehicleId}`);
  revalidatePath("/vehiculos");
  revalidatePath("/inventario");
  return { success: true };
}
