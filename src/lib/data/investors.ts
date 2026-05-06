import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type VehicleInvestor = {
  id: string;
  vehiculoId: string;
  nombre: string;
  celular: string;
  monto: number;
  createdAt: string;
};

export type InvestorInput = {
  nombre: string;
  celular: string;
  monto: number;
};

export async function getVehicleInvestors(vehiculoId: string): Promise<VehicleInvestor[]> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("vehiculo_inversionistas")
    .select("*")
    .eq("vehiculo_id", vehiculoId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return (data as any[]).map((r) => ({
    id: r.id,
    vehiculoId: r.vehiculo_id,
    nombre: r.nombre,
    celular: r.celular,
    monto: Number(r.monto),
    createdAt: r.created_at,
  }));
}

export async function setVehicleInvestors(vehiculoId: string, investors: InvestorInput[]): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return;

  await supabase.from("vehiculo_inversionistas").delete().eq("vehiculo_id", vehiculoId);

  if (investors.length === 0) return;

  await supabase.from("vehiculo_inversionistas").insert(
    investors.map((inv) => ({
      vehiculo_id: vehiculoId,
      nombre: inv.nombre,
      celular: inv.celular,
      monto: inv.monto,
    }))
  );
}
