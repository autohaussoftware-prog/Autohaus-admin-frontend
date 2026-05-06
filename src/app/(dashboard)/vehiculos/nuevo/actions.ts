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
import { setVehicleInvestors, type InvestorInput } from "@/lib/data/investors";

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

  // Validate investors for "Propio" vehicles
  let investorsList: InvestorInput[] = [];
  if (parsed.data.ownerType === "Propio" && rawData.investorsJson) {
    try {
      const rows = JSON.parse(rawData.investorsJson) as Array<{ nombre: string; celular: string; monto: string }>;
      const active = rows.filter((r) => r.nombre?.trim() || r.monto);
      if (active.length > 0) {
        for (const r of active) {
          if (!r.nombre?.trim() || !r.celular?.trim() || !Number(r.monto)) {
            return {
              error: "Todos los campos de los inversionistas son obligatorios (nombre, celular, monto).",
              attempt: _prev.attempt + 1,
              values: rawData,
            };
          }
        }
        const totalInvested = active.reduce((s, r) => s + Number(r.monto), 0);
        const buyPrice = parsed.data.buyPrice ?? 0;
        if (buyPrice > 0 && Math.abs(totalInvested - buyPrice) > 1) {
          const fmt = (n: number) => n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
          return {
            error: `La suma de los aportes (${fmt(totalInvested)}) debe ser igual al precio de compra (${fmt(buyPrice)}).`,
            attempt: _prev.attempt + 1,
            values: rawData,
          };
        }
        investorsList = active.map((r) => ({
          nombre: r.nombre.trim(),
          celular: r.celular.trim(),
          monto: Number(r.monto),
        }));
      }
    } catch {
      // Invalid JSON — ignore investors
    }
  }

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

  if (investorsList.length > 0) {
    await setVehicleInvestors(vehicleId, investorsList);
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
