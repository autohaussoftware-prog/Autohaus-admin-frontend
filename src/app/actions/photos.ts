"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient, getUserRole } from "@/lib/supabase/server";
import { ROLES, requireRole, isValidUUID } from "@/lib/security";

export async function saveVehiclePhotoAction(
  vehicleId: string,
  fileUrl: string,
  fileName: string
) {
  const role = await getUserRole();
  const denied = requireRole(role, ROLES.VEHICLE_WRITE, "Sin permisos para subir fotos.");
  if (denied) throw new Error(denied.error);

  if (!isValidUUID(vehicleId)) throw new Error("ID de vehículo inválido.");

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error } = await supabase.from("vehicle_documents").insert({
    vehicle_id: vehicleId,
    document_type: "foto_vehiculo",
    file_url: fileUrl,
    file_name: fileName,
    status: "aprobado",
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/vehiculos/${vehicleId}`);
}

export async function deleteVehiclePhotoAction(documentId: string, storagePath: string) {
  const role = await getUserRole();
  const denied = requireRole(role, ROLES.VEHICLE_DELETE, "Sin permisos para eliminar fotos.");
  if (denied) throw new Error(denied.error);

  if (!isValidUUID(documentId)) throw new Error("ID de documento inválido.");

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  await supabase.storage.from("vehicle-photos").remove([storagePath]);
  await supabase.from("vehicle_documents").delete().eq("id", documentId);
}
