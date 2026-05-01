import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
export { COST_CATEGORIES, type CostCategory } from "@/lib/domain/vehicle-costs-config";

export type VehicleCost = {
  id: string;
  vehicleId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  provider: string;
  paid: boolean;
  createdBy: string;
  createdAt: string;
};

export async function getVehicleCosts(vehicleId: string): Promise<VehicleCost[]> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("vehicle_costs")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("date", { ascending: false });

  if (error || !data) return [];

  return data.map((c: any) => ({
    id: c.id,
    vehicleId: c.vehicle_id,
    category: c.category,
    description: c.description,
    amount: Number(c.amount),
    date: c.date,
    provider: c.provider ?? "",
    paid: Boolean(c.paid),
    createdBy: c.created_by ?? "Sistema",
    createdAt: c.created_at,
  }));
}

export type CreateVehicleCostInput = {
  vehicleId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  provider?: string;
  paid: boolean;
  createdBy?: string;
};

export async function createVehicleCost(input: CreateVehicleCostInput): Promise<string> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { data, error } = await supabase
    .from("vehicle_costs")
    .insert({
      vehicle_id: input.vehicleId,
      category: input.category,
      description: input.description,
      amount: input.amount,
      date: input.date,
      provider: input.provider?.trim() || null,
      paid: input.paid,
      created_by: input.createdBy || "Sistema",
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Error registrando costo.");

  await Promise.all([
    syncVehicleRealCost(supabase, input.vehicleId),
    supabase.from("vehicle_movements").insert({
      vehicle_id: input.vehicleId,
      type: "Costo",
      title: `Costo registrado: ${input.description}`,
      description: `Categoría: ${input.category}. Monto: $${input.amount.toLocaleString("es-CO")}. Proveedor: ${input.provider?.trim() || "N/A"}.`,
      metadata: { userName: input.createdBy ?? "Sistema", costId: data.id },
    }),
  ]);

  return data.id as string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncVehicleRealCost(supabase: any, vehicleId: string) {
  const { data } = await supabase
    .from("vehicle_costs")
    .select("amount")
    .eq("vehicle_id", vehicleId);
  const total = (data ?? []).reduce((sum: number, c: { amount: unknown }) => sum + Number(c.amount), 0);
  await supabase.from("vehicles").update({ real_cost: total }).eq("id", vehicleId);
}

export async function deleteVehicleCost(costId: string, vehicleId?: string, deletedBy?: string): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error } = await supabase.from("vehicle_costs").delete().eq("id", costId);
  if (error) throw new Error(error.message);

  if (vehicleId) {
    await Promise.all([
      syncVehicleRealCost(supabase, vehicleId),
      supabase.from("vehicle_movements").insert({
        vehicle_id: vehicleId,
        type: "Costo eliminado",
        title: "Costo eliminado del vehículo",
        description: `Registro de costo eliminado por ${deletedBy ?? "Sistema"}.`,
        metadata: { userName: deletedBy ?? "Sistema", costId },
      }),
    ]);
  }
}
