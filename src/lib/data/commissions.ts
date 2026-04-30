import { commissions as mockCommissions } from "@/data/mock";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Commission } from "@/types/finance";

type DbCommission = {
  id: string;
  advisor_id: string | null;
  role: Commission["role"];
  vehicle_id: string | null;
  amount: number | string;
  status: Commission["status"];
  month: string | null;
};

function toAmount(value: number | string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getCommissions() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return mockCommissions;

  const [commissionsResult, advisorsResult, vehiclesResult] = await Promise.all([
    supabase.from("commissions").select("*").order("created_at", { ascending: false }),
    supabase.from("advisors").select("id,full_name"),
    supabase.from("vehicles").select("id,brand,line"),
  ]);

  if (commissionsResult.error || !commissionsResult.data) {
    console.error("No se pudieron cargar comisiones:", commissionsResult.error?.message);
    return mockCommissions;
  }

  const advisors = new Map(
    (advisorsResult.data ?? []).map((a) => [a.id as string, a.full_name as string])
  );
  const vehicles = new Map(
    (vehiclesResult.data ?? []).map((v) => [v.id as string, `${v.brand as string} ${v.line as string}`])
  );

  return (commissionsResult.data as DbCommission[]).map((c) => ({
    id: c.id,
    advisor: c.advisor_id ? advisors.get(c.advisor_id) ?? "Sin asesor" : "Sin asesor",
    role: c.role,
    vehicle: c.vehicle_id ? vehicles.get(c.vehicle_id) ?? "Sin vehículo" : "Sin vehículo",
    amount: toAmount(c.amount),
    status: c.status,
    month: c.month ?? "",
  }));
}

export type CreateCommissionInput = {
  advisorId: string;
  role: "Captador" | "Vendedor" | "Crédito";
  vehicleId?: string;
  amount: number;
  month: string;
  status: "Pendiente" | "Pagada";
};

export async function createCommission(input: CreateCommissionInput): Promise<string> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { data, error } = await supabase
    .from("commissions")
    .insert({
      advisor_id: input.advisorId,
      role: input.role,
      vehicle_id: input.vehicleId || null,
      amount: input.amount,
      month: input.month,
      status: input.status,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "No se pudo registrar la comisión.");
  return data.id as string;
}

export async function getAdvisors() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("advisors")
    .select("id,full_name,role")
    .eq("active", true)
    .order("full_name");

  return (data ?? []).map((a) => ({ id: a.id as string, name: a.full_name as string, role: a.role as string }));
}
