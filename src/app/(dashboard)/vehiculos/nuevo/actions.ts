"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createVehicle } from "@/lib/data/vehicles";
import { getCurrentUserProfile } from "@/lib/supabase/server";
import { vehicleSchema, type VehicleActionState } from "@/lib/schemas/vehicle-schema";
import { getOpenOrders } from "@/lib/data/orders";
import { getVehicleById } from "@/lib/data/vehicles";
import { matchesOrder } from "@/lib/utils/order-matcher";
import { createNotification } from "@/lib/data/notifications";

export async function createVehicleAction(
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

  const profile = await getCurrentUserProfile();
  let vehicleId: string;

  try {
    vehicleId = await createVehicle({ ...parsed.data, createdByUserId: profile.id });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo crear el vehículo.",
      attempt: _prev.attempt + 1,
      values: rawData,
    };
  }

  const [vehicle, openOrders] = await Promise.all([
    getVehicleById(vehicleId),
    getOpenOrders(),
  ]);

  if (vehicle) {
    const matched = openOrders.filter((o) => matchesOrder(vehicle, o));
    await Promise.all(
      matched
        .filter((o) => o.createdByUserId && o.createdByUserId !== profile.id)
        .map((o) =>
          createNotification(
            o.createdByUserId!,
            "¡Coincidencia en inventario!",
            `El vehículo ${vehicle.brand} ${vehicle.line} ${vehicle.year} coincide con tu pedido.`,
            `/pedidos/${o.id}`
          )
        )
    );
  }

  revalidatePath("/inventario");
  revalidatePath("/vehiculos");
  redirect(`/vehiculos/${vehicleId}`);
}
