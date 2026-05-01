"use server";

import { revalidatePath } from "next/cache";
import { getVehicleById, updateVehicleStatus } from "@/lib/data/vehicles";
import { getCurrentUserProfile } from "@/lib/supabase/server";
import type { VehicleStatus } from "@/types/vehicle";

const TERMINAL_STATUSES: VehicleStatus[] = ["Vendido", "Entregado"];
const PRE_SALE_STATUSES: VehicleStatus[] = ["Disponible", "Publicado", "No publicado"];

export async function updateVehicleStatusAction(vehicleId: string, status: VehicleStatus) {
  const { name, role } = await getCurrentUserProfile();
  if (role === "viewer") return { error: "Sin permisos para cambiar estado." };

  const current = await getVehicleById(vehicleId);
  if (current) {
    const fromTerminal = TERMINAL_STATUSES.includes(current.status);
    const toPreSale = PRE_SALE_STATUSES.includes(status);
    const isPrivileged = ["owner", "partner"].includes(role);

    if (current.status === "Entregado" && status !== "Entregado" && !isPrivileged) {
      return { error: "Un vehículo entregado no puede cambiar de estado sin autorización del propietario." };
    }
    if (fromTerminal && toPreSale && !isPrivileged) {
      return { error: "Solo el propietario puede revertir un vehículo vendido o entregado al inventario activo." };
    }
  }

  await updateVehicleStatus(vehicleId, status, name);
  revalidatePath(`/vehiculos/${vehicleId}`);
  revalidatePath("/vehiculos");
  revalidatePath("/inventario");
  return { success: true };
}
