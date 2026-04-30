"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function saveVehiclePhotoAction(
  vehicleId: string,
  fileUrl: string,
  fileName: string
) {
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
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  await supabase.storage.from("vehicle-photos").remove([storagePath]);
  await supabase.from("vehicle_documents").delete().eq("id", documentId);
}
