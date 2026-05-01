import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type Transfer = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  status: string;
  fromOwner: string | null;
  toOwner: string | null;
  requestedAt: string;
  completedAt: string | null;
  notes: string | null;
};

export type CreateTransferInput = {
  vehicleId: string;
  fromOwner?: string;
  toOwner?: string;
  notes?: string;
};

export async function getTransfers(): Promise<Transfer[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("transfer_processes")
    .select("*")
    .order("requested_at", { ascending: false });

  if (error || !data) return [];

  const vehicleIds = [...new Set(data.map((t: any) => t.vehicle_id).filter(Boolean))];
  const vehiclesRes = vehicleIds.length
    ? await supabase.from("vehicles").select("id,brand,line,plate").in("id", vehicleIds)
    : { data: [] };

  const vehicleMap = new Map((vehiclesRes.data ?? []).map((v: any) => [v.id, v]));

  return data.map((t: any) => {
    const v = vehicleMap.get(t.vehicle_id);
    return {
      id: t.id as string,
      vehicleId: t.vehicle_id as string,
      vehicleName: v ? `${v.brand} ${v.line}` : "Vehículo",
      vehiclePlate: v?.plate ?? "",
      status: (t.status as string) ?? "En proceso",
      fromOwner: t.from_owner ?? null,
      toOwner: t.to_owner ?? null,
      requestedAt: t.requested_at as string,
      completedAt: t.completed_at ?? null,
      notes: t.notes ?? null,
    };
  });
}

export async function createTransfer(input: CreateTransferInput): Promise<string> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { data, error } = await supabase
    .from("transfer_processes")
    .insert({
      vehicle_id: input.vehicleId,
      from_owner: input.fromOwner?.trim() || null,
      to_owner: input.toOwner?.trim() || null,
      notes: input.notes?.trim() || null,
      status: "En proceso",
      requested_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "No se pudo crear el traspaso.");
  return data.id as string;
}

export async function updateTransferStatus(transferId: string, status: string): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const update: Record<string, unknown> = { status };
  if (status === "Completado") update.completed_at = new Date().toISOString();

  const { error } = await supabase.from("transfer_processes").update(update).eq("id", transferId);
  if (error) throw new Error(error.message);
}
