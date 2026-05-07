"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient, getCurrentUserProfile, getUserRole } from "@/lib/supabase/server";

export async function updateVehiclePriceAction(
  vehicleId: string,
  _prev: { error: string | null; attempt: number },
  formData: FormData
): Promise<{ error: string | null; attempt: number }> {
  const next = _prev.attempt + 1;

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

  revalidatePath(`/vehiculos/${vehicleId}`);
  revalidatePath("/vehiculos");
  revalidatePath("/");
  return { error: null, attempt: next };
}
