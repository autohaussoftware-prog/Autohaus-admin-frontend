"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient, getCurrentUserProfile, getUserRole } from "@/lib/supabase/server";
import { deleteVehicle, updateVehicleCommissionRate } from "@/lib/data/vehicles";
import { logAudit } from "@/lib/data/audit";
import { isValidUUID } from "@/lib/security";

export async function updateVehiclePriceAction(
  vehicleId: string,
  _prev: { error: string | null; attempt: number },
  formData: FormData
): Promise<{ error: string | null; attempt: number }> {
  const next = _prev.attempt + 1;

  if (!isValidUUID(vehicleId)) return { error: "ID de vehículo inválido.", attempt: next };

  const raw = formData.get("price");
  const newPrice = Number(raw);
  if (!newPrice || newPrice <= 0) {
    return { error: "El precio debe ser un valor positivo.", attempt: next };
  }

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado.", attempt: next };

  const [role, { id: userId, name }] = await Promise.all([
    getUserRole(),
    getCurrentUserProfile(),
  ]);

  const canByRole = ["owner", "partner", "admin", "gerente"].includes(role);
  if (!canByRole) {
    const { data: v } = await supabase
      .from("vehicles")
      .select("created_by_user_id")
      .eq("id", vehicleId)
      .single();
    if (!v || v.created_by_user_id !== userId) {
      return { error: "Sin permisos para editar el precio de este vehículo.", attempt: next };
    }
  }

  const { data: current } = await supabase
    .from("vehicles")
    .select("target_price")
    .eq("id", vehicleId)
    .single();
  const oldPrice = Number(current?.target_price ?? 0);

  const { error: updateError } = await supabase
    .from("vehicles")
    .update({ target_price: newPrice })
    .eq("id", vehicleId);

  if (updateError) return { error: updateError.message, attempt: next };

  const fmt = (n: number) =>
    n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

  await supabase.from("vehicle_movements").insert({
    vehicle_id: vehicleId,
    type: "Actualización",
    title: "Precio de venta actualizado",
    description: `Precio cambiado de ${fmt(oldPrice)} → ${fmt(newPrice)} por ${name}.`,
    metadata: { updatedBy: name, userId, oldPrice, newPrice, updatedAt: new Date().toISOString() },
  });

  logAudit({
    tableName: "vehicles",
    recordId: vehicleId,
    action: "UPDATE",
    fieldChanged: "target_price",
    oldValue: String(oldPrice),
    newValue: String(newPrice),
    userName: name,
    userId,
  }).catch(() => {});

  revalidatePath(`/vehiculos/${vehicleId}`);
  revalidatePath("/vehiculos");
  revalidatePath("/");
  return { error: null, attempt: next };
}

export async function updateCommissionRateAction(
  vehicleId: string,
  _prev: { error: string | null; attempt: number },
  formData: FormData
): Promise<{ error: string | null; attempt: number }> {
  const next = _prev.attempt + 1;

  if (!isValidUUID(vehicleId)) return { error: "ID de vehículo inválido.", attempt: next };

  const raw = formData.get("rate");
  const rate = Number(raw);
  if (!rate || rate <= 0 || rate > 100) {
    return { error: "El porcentaje debe estar entre 0.1 y 100.", attempt: next };
  }

  const { name, role } = await getCurrentUserProfile();
  if (!["owner", "partner", "admin", "gerente"].includes(role)) {
    return { error: "Sin permisos para modificar la comisión.", attempt: next };
  }

  try {
    await updateVehicleCommissionRate(vehicleId, rate, name);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo actualizar la comisión.", attempt: next };
  }

  revalidatePath(`/vehiculos/${vehicleId}`);
  revalidatePath("/vehiculos");
  revalidatePath("/");
  return { error: null, attempt: next };
}

export async function deleteVehicleAction(
  vehicleId: string,
  reason?: string
): Promise<{ error?: string }> {
  if (!isValidUUID(vehicleId)) return { error: "ID de vehículo inválido." };

  const { id: userId, name, role } = await getCurrentUserProfile();

  // Permissions: admin roles OR the creator
  const canByRole = ["owner", "partner", "admin", "gerente"].includes(role);
  if (!canByRole) {
    const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
    if (!supabase) return { error: "Sin conexión." };
    const { data: v } = await supabase
      .from("vehicles")
      .select("created_by_user_id")
      .eq("id", vehicleId)
      .single();
    if (!v || v.created_by_user_id !== userId) {
      return { error: "Sin permisos para eliminar este vehículo." };
    }
  }

  try {
    await deleteVehicle(vehicleId, name, reason);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo eliminar el vehículo." };
  }

  revalidatePath("/vehiculos");
  revalidatePath("/");
  redirect("/vehiculos");
}
