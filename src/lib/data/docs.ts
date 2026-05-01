import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
export { LEGAL_DOC_TYPES, type LegalDocType } from "@/lib/domain/vehicle-docs-config";

export type VehicleDoc = {
  id: string;
  vehicleId: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
};

export async function getVehicleDocs(vehicleId: string): Promise<VehicleDoc[]> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("vehicle_documents")
    .select("id,vehicle_id,document_type,file_url,file_name,uploaded_at")
    .eq("vehicle_id", vehicleId)
    .neq("document_type", "foto_vehiculo")
    .order("uploaded_at", { ascending: false });

  if (error || !data) return [];

  return data.map((d: any) => ({
    id: d.id as string,
    vehicleId: d.vehicle_id as string,
    documentType: d.document_type as string,
    fileUrl: d.file_url as string,
    fileName: (d.file_name as string) ?? "documento",
    uploadedAt: (d.uploaded_at as string) ?? "",
  }));
}

export async function saveVehicleDoc(
  vehicleId: string,
  documentType: string,
  fileUrl: string,
  fileName: string
): Promise<string> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { data, error } = await supabase
    .from("vehicle_documents")
    .insert({
      vehicle_id: vehicleId,
      document_type: documentType,
      file_url: fileUrl,
      file_name: fileName,
      status: "aprobado",
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Error guardando documento.");
  return data.id as string;
}

export async function deleteVehicleDoc(docId: string): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error } = await supabase.from("vehicle_documents").delete().eq("id", docId);
  if (error) throw new Error(error.message);
}
