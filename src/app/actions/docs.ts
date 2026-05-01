"use server";

import { revalidatePath } from "next/cache";
import { saveVehicleDoc, deleteVehicleDoc } from "@/lib/data/docs";
import { getUserRole } from "@/lib/supabase/server";

export async function saveVehicleDocAction(
  vehicleId: string,
  documentType: string,
  fileUrl: string,
  fileName: string
): Promise<{ error?: string }> {
  const role = await getUserRole();
  if (role === "viewer") return { error: "Sin permisos para subir documentos." };

  try {
    await saveVehicleDoc(vehicleId, documentType, fileUrl, fileName);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error guardando documento." };
  }

  revalidatePath(`/vehiculos/${vehicleId}`);
  return {};
}

export async function deleteVehicleDocAction(
  docId: string,
  vehicleId: string,
  storagePath?: string
): Promise<{ error?: string }> {
  const role = await getUserRole();
  if (!["owner", "partner", "admin"].includes(role)) return { error: "Sin permisos para eliminar documentos." };

  try {
    if (storagePath) {
      const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
      const { getSupabaseServerClient } = await import("@/lib/supabase/server");
      const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
      if (supabase) {
        await supabase.storage.from("vehicle-photos").remove([storagePath]);
      }
    }
    await deleteVehicleDoc(docId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error eliminando documento." };
  }

  revalidatePath(`/vehiculos/${vehicleId}`);
  return {};
}
