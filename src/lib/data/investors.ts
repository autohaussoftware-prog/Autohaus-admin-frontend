import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type VehicleInvestor = {
  id: string;
  vehiculoId: string;
  userId?: string;
  nombre: string;
  celular: string;
  monto: number;
  createdAt: string;
};

export type InvestorInput = {
  userId?: string;
  nombre: string;
  celular: string;
  monto: number;
};

export type InvestorUser = {
  id: string;
  fullName: string;
};

export type InvestorVehicle = {
  investorId: string;
  vehiculoId: string;
  nombre: string;
  monto: number;
  createdAt: string;
  brand: string;
  line: string;
  plate: string;
  year: number;
  status: string;
  targetPrice: number;
  buyPrice: number;
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
    userId: r.user_id ?? undefined,
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
      user_id: inv.userId ?? null,
      nombre: inv.nombre,
      celular: inv.celular,
      monto: inv.monto,
    }))
  );
}

export async function getInvestorUsers(): Promise<InvestorUser[]> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "inversionista")
    .eq("active", true)
    .order("full_name", { ascending: true });

  if (error || !data) return [];

  return (data as any[]).map((p) => ({
    id: p.id,
    fullName: p.full_name ?? p.email,
  }));
}

export async function getInvestorPortalData(userId: string): Promise<InvestorVehicle[]> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return [];

  const { data: invData, error } = await supabase
    .from("vehiculo_inversionistas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !invData || invData.length === 0) return [];

  const vehicleIds = (invData as any[]).map((r) => r.vehiculo_id);

  const { data: vehicleData } = await supabase
    .from("vehicles")
    .select("id, brand, line, plate, year, status, target_price, buy_price")
    .in("id", vehicleIds);

  const vehicleMap = new Map(((vehicleData ?? []) as any[]).map((v) => [v.id, v]));

  return (invData as any[]).map((r) => {
    const v = vehicleMap.get(r.vehiculo_id) ?? {};
    return {
      investorId: r.id,
      vehiculoId: r.vehiculo_id,
      nombre: r.nombre,
      monto: Number(r.monto),
      createdAt: r.created_at,
      brand: v.brand ?? "",
      line: v.line ?? "",
      plate: v.plate ?? "",
      year: v.year ?? 0,
      status: v.status ?? "",
      targetPrice: Number(v.target_price ?? 0),
      buyPrice: Number(v.buy_price ?? 0),
    };
  });
}
