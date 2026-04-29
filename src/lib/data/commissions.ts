import { commissions as mockCommissions } from "@/data/mock";
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
  const supabase = getSupabaseServerClient();
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

  const advisors = new Map((advisorsResult.data ?? []).map((advisor) => [advisor.id as string, advisor.full_name as string]));
  const vehicles = new Map(
    (vehiclesResult.data ?? []).map((vehicle) => [vehicle.id as string, `${vehicle.brand as string} ${vehicle.line as string}`])
  );

  return (commissionsResult.data as DbCommission[]).map((commission) => ({
    id: commission.id,
    advisor: commission.advisor_id ? advisors.get(commission.advisor_id) ?? "Sin asesor" : "Sin asesor",
    role: commission.role,
    vehicle: commission.vehicle_id ? vehicles.get(commission.vehicle_id) ?? "Sin vehículo" : "Sin vehículo",
    amount: toAmount(commission.amount),
    status: commission.status,
    month: commission.month ?? "",
  }));
}

