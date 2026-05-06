import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { syncVehicleRealCost } from "@/lib/data/costs";

export type VehicleExpense = {
  id: string;
  vehiculoId: string;
  motivo: string;
  fecha: string;
  monto: number;
  createdAt: string;
};

export async function getVehicleExpenses(vehiculoId: string): Promise<VehicleExpense[]> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("vehiculo_gastos")
    .select("*")
    .eq("vehiculo_id", vehiculoId)
    .order("fecha", { ascending: false });

  if (error || !data) return [];

  return (data as any[]).map((r) => ({
    id: r.id,
    vehiculoId: r.vehiculo_id,
    motivo: r.motivo,
    fecha: r.fecha,
    monto: Number(r.monto),
    createdAt: r.created_at,
  }));
}

export async function createVehicleExpense(
  vehiculoId: string,
  input: { motivo: string; fecha: string; monto: number },
  createdBy?: string
): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error } = await supabase
    .from("vehiculo_gastos")
    .insert({ vehiculo_id: vehiculoId, motivo: input.motivo, fecha: input.fecha, monto: input.monto });

  if (error) throw new Error(error.message);

  await Promise.all([
    syncVehicleRealCost(supabase, vehiculoId),
    supabase.from("vehicle_movements").insert({
      vehicle_id: vehiculoId,
      type: "Gasto adicional",
      title: `Gasto: ${input.motivo}`,
      description: `Monto: $${input.monto.toLocaleString("es-CO")}. Fecha: ${input.fecha}.`,
      metadata: { userName: createdBy ?? "Sistema" },
    }),
  ]);
}

export async function deleteVehicleExpense(expenseId: string, vehiculoId: string, deletedBy?: string): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error } = await supabase.from("vehiculo_gastos").delete().eq("id", expenseId);
  if (error) throw new Error(error.message);

  await Promise.all([
    syncVehicleRealCost(supabase, vehiculoId),
    supabase.from("vehicle_movements").insert({
      vehicle_id: vehiculoId,
      type: "Gasto eliminado",
      title: "Gasto adicional eliminado",
      description: `Registro eliminado por ${deletedBy ?? "Sistema"}.`,
      metadata: { userName: deletedBy ?? "Sistema" },
    }),
  ]);
}
