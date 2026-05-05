"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createTransfer, updateTransferStatus } from "@/lib/data/transfers";
import { getUserRole } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ownerSchema = z.object({
  name:      z.string().trim().optional(),
  docType:   z.string().trim().optional(),
  docNumber: z.string().trim().optional(),
  phone:     z.string().trim().optional(),
  company:   z.string().trim().optional(),
});

const transferSchema = z.object({
  vehicleId:  z.string().uuid(),
  fromOwner:  z.string().trim().optional(),
  fromDocType:   z.string().trim().optional(),
  fromDocNumber: z.string().trim().optional(),
  fromPhone:     z.string().trim().optional(),
  fromCompany:   z.string().trim().optional(),
  toOwner:    z.string().trim().optional(),
  toDocType:   z.string().trim().optional(),
  toDocNumber: z.string().trim().optional(),
  toPhone:     z.string().trim().optional(),
  toCompany:   z.string().trim().optional(),
  tramitador: z.string().trim().optional(),
  notes:      z.string().trim().optional(),
});

export async function createTransferAction(formData: FormData) {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "gerente", "advisor"].includes(role)) {
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

export type OwnerLookup = {
  name: string;
  docType: string;
  docNumber: string | null;
  phone: string | null;
  company: string | null;
};

export type PlateResult = {
  vehicleId: string;
  found: true;
  fromOwner: OwnerLookup;
  toOwner: OwnerLookup | null;
} | {
  found: false;
  error: string;
} | null;

export async function lookupVehicleByPlateAction(plate: string): Promise<PlateResult> {
  if (!plate.trim()) return null;

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { found: false, error: "Supabase no configurado." };

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id, owner_name, owner_type, owner_phone")
    .ilike("plate", plate.trim())
    .single();

  if (!vehicle) return { found: false, error: `No se encontró vehículo con placa ${plate.toUpperCase()}.` };

  const fromOwner: OwnerLookup = {
    name: vehicle.owner_type === "Comisión" && vehicle.owner_name
      ? vehicle.owner_name
      : "Autohaus",
    docType: "Cédula",
    docNumber: null,
    phone: vehicle.owner_phone ?? null,
    company: null,
  };

  // Buscar la venta más reciente
  const { data: sale } = await supabase
    .from("sales")
    .select("customer_id")
    .eq("vehicle_id", vehicle.id)
    .in("sale_status", ["vendido", "entregado"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let toOwner: OwnerLookup | null = null;
  if (sale?.customer_id) {
    const { data: customer } = await supabase
      .from("customers")
      .select("full_name, phone, document_number")
      .eq("id", sale.customer_id)
      .single();

    if (customer) {
      toOwner = {
        name: customer.full_name ?? "",
        docType: "Cédula",
        docNumber: customer.document_number ?? null,
        phone: customer.phone ?? null,
        company: null,
      };
    }
  }

  return { vehicleId: vehicle.id as string, found: true, fromOwner, toOwner };
}

export async function createVehicleForTransferAction(formData: FormData): Promise<{
  vehicleId?: string;
  error?: string;
}> {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "gerente", "advisor"].includes(role)) {
    return { error: "Sin permisos." };
  }

  const plate = (formData.get("newPlate") as string)?.trim().toUpperCase();
  const brand = (formData.get("newBrand") as string)?.trim();
  const line  = (formData.get("newLine") as string)?.trim();
  const year  = parseInt(formData.get("newYear") as string) || undefined;
  const color = (formData.get("newColor") as string)?.trim() || undefined;
  const fuel  = (formData.get("newFuel") as string)?.trim() || undefined;
  const ownerName  = (formData.get("newOwnerName") as string)?.trim() || undefined;
  const ownerPhone = (formData.get("newOwnerPhone") as string)?.trim() || undefined;

  if (!plate || !brand || !line) {
    return { error: "Placa, marca y línea son obligatorios." };
  }

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id ?? null;

  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      plate,
      brand,
      line,
      year:       year ?? null,
      color:      color ?? null,
      fuel:       fuel ?? null,
      owner_name: ownerName ?? null,
      owner_phone: ownerPhone ?? null,
      owner_type: "Propio",
      status: "Disponible",
      buy_price: 0,
      target_price: 0,
      min_price: 0,
      entry_type: "Traspaso",
      created_by: userId,
      created_by_user_id: userId,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "No se pudo crear el vehículo." };

  await supabase.from("vehicle_movements").insert({
    vehicle_id: data.id,
    type: "Ingreso",
    title: "Vehículo registrado desde traspaso",
    new_status: "Disponible",
    metadata: { userName: "Sistema" },
  });

  return { vehicleId: data.id as string };
}
