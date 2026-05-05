"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateVehicle } from "@/lib/data/vehicles";
import { vehicleSchema, type VehicleActionState } from "@/lib/schemas/vehicle-schema";

export async function updateVehicleAction(
  vehicleId: string,
  _prev: VehicleActionState,
  formData: FormData
): Promise<VehicleActionState> {
  const rawData = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => !(v instanceof File))
  ) as Record<string, string>;

  const parsed = vehicleSchema.safeParse(rawData);

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los campos obligatorios.",
      fieldErrors: flat.fieldErrors as Record<string, string[]>,
      attempt: _prev.attempt + 1,
      values: rawData,
    };
  }

  try {
    await updateVehicle(vehicleId, parsed.data);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "No se pudo actualizar el vehículo.",
      attempt: _prev.attempt + 1,
      values: rawData,
    };
  }

  revalidatePath(`/vehiculos/${vehicleId}`);
  revalidatePath("/inventario");
  revalidatePath("/vehiculos");
  redirect(`/vehiculos/${vehicleId}`);
}
