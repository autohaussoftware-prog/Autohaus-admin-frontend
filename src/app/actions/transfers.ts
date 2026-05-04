"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createTransfer, updateTransferStatus } from "@/lib/data/transfers";
import { getUserRole } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const transferSchema = z.object({
  vehicleId: z.string().uuid(),
  fromOwner: z.string().trim().optional(),
  toOwner: z.string().trim().optional(),
  tramitador: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function createTransferAction(formData: FormData) {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "gerente"].includes(role)) {
    return { error: "Sin permisos para registrar traspasos." };
  }

  const parsed = transferSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  try {
    await createTransfer(parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error registrando traspaso." };
  }

  revalidatePath("/traspasos");
  return { success: true };
}

export async function updateTransferStatusAction(transferId: string, status: string) {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "gerente"].includes(role)) {
    return { error: "Sin permisos para actualizar traspasos." };
  }

  try {
    await updateTransferStatus(transferId, status);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error actualizando traspaso." };
  }

  revalidatePath("/traspasos");
  return { success: true };
}

export async function lookupVehicleByPlateAction(plate: string): Promise<{
  vehicleId?: string;
  fromOwner?: string;
  toOwner?: string;
  error?: string;
} | null> {
  if (!plate.trim()) return null;

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id,owner_name,owner_type")
    .ilike("plate", plate.trim())
    .single();

  if (!vehicle) return { error: `No se encontró vehículo con placa ${plate.toUpperCase()}.` };

  const fromOwner =
    vehicle.owner_type === "Comisión" && vehicle.owner_name
      ? vehicle.owner_name
      : "Autohaus";

  // Buscar la venta más reciente para obtener el comprador (propietario destino)
  const { data: sale } = await supabase
    .from("sales")
    .select("customer_id")
    .eq("vehicle_id", vehicle.id)
    .in("sale_status", ["vendido", "entregado"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let toOwner = "";
  if (sale?.customer_id) {
    const { data: customer } = await supabase
      .from("customers")
      .select("full_name")
      .eq("id", sale.customer_id)
      .single();
    toOwner = customer?.full_name ?? "";
  }

  return { vehicleId: vehicle.id as string, fromOwner, toOwner };
}
