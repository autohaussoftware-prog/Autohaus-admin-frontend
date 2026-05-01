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
  return data.id as string;
}

export async function deleteVehicleCost(costId: string): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error } = await supabase.from("vehicle_costs").delete().eq("id", costId);
  if (error) throw new Error(error.message);
}
