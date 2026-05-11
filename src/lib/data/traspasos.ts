import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { escapeLike } from "@/lib/security";

export type TraspasoStatus = "en_proceso" | "pendiente" | "completado" | "cancelado";

export type Traspaso = {
  id: string;
  saleId: string;
  vehicleId: string | null;
  customerName: string;
  vehicleName: string;
  vehiclePlate: string | null;
  agreedPrice: number;
  status: TraspasoStatus;
  assignedTo: string | null;
  notes: string | null;
  createdBy: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TraspasoFilters = {
  status?: string;
  search?: string;
  from?: string;
  to?: string;
};

export const TRASPASO_STATUS_LABELS: Record<TraspasoStatus, string> = {
  en_proceso: "En proceso",
  pendiente: "Pendiente",
  completado: "Completado",
  cancelado: "Cancelado",
};

function mapTraspaso(t: any): Traspaso {
  return {
    id: t.id,
    saleId: t.sale_id,
    vehicleId: t.vehicle_id ?? null,
    customerName: t.customer_name ?? "",
    vehicleName: t.vehicle_name ?? "",
    vehiclePlate: t.vehicle_plate ?? null,
    agreedPrice: Number(t.agreed_price ?? 0),
    status: t.status ?? "en_proceso",
    assignedTo: t.assigned_to ?? null,
    notes: t.notes ?? null,
    createdBy: t.created_by ?? "Sistema",
    completedAt: t.completed_at ?? null,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  };
}

export async function getTraspasos(filters?: TraspasoFilters): Promise<Traspaso[]> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return [];

  let query = supabase.from("traspasos").select("*").order("created_at", { ascending: false });

  if (filters?.from) query = query.gte("created_at", filters.from);
  if (filters?.to) query = query.lte("created_at", `${filters.to}T23:59:59`);
  if (filters?.search) {
    const s = escapeLike(filters.search.trim());
    query = query.or(
      `customer_name.ilike.%${s}%,vehicle_name.ilike.%${s}%,vehicle_plate.ilike.%${s}%`
    );
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const all = data.map(mapTraspaso);
  return filters?.status ? all.filter((t) => t.status === filters.status) : all;
}

export async function getTraspasosBySaleId(saleId: string): Promise<Traspaso | null> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("traspasos")
    .select("*")
    .eq("sale_id", saleId)
    .maybeSingle();

  if (error || !data) return null;
  return mapTraspaso(data);
}

export async function createTraspasoFromSale(saleId: string, createdBy: string): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return;

  // Duplicate guard
  const { data: existing } = await supabase
    .from("traspasos")
    .select("id")
    .eq("sale_id", saleId)
    .maybeSingle();
  if (existing) return;

  const { data: sale } = await supabase
    .from("sales")
    .select("vehicle_id, customer_id, agreed_price")
    .eq("id", saleId)
    .single();
  if (!sale) return;

  const [vehicleRes, customerRes] = await Promise.all([
    sale.vehicle_id
      ? supabase.from("vehicles").select("brand,line,plate").eq("id", sale.vehicle_id).single()
      : Promise.resolve({ data: null }),
    sale.customer_id
      ? supabase.from("customers").select("full_name").eq("id", sale.customer_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const v = vehicleRes.data as any;
  const c = customerRes.data as any;

  await supabase.from("traspasos").insert({
    sale_id: saleId,
    vehicle_id: sale.vehicle_id ?? null,
    customer_name: c?.full_name ?? "Cliente",
    vehicle_name: v ? `${v.brand} ${v.line}` : "Vehículo",
    vehicle_plate: v?.plate ?? null,
    agreed_price: Number(sale.agreed_price ?? 0),
    status: "en_proceso",
    created_by: createdBy,
  });
}

export async function updateTraspasoStatus(
  traspasoId: string,
  status: TraspasoStatus,
  notes?: string
): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const patch: Record<string, any> = { status, updated_at: new Date().toISOString() };
  if (status === "completado") patch.completed_at = new Date().toISOString();
  if (notes !== undefined) patch.notes = notes;

  const { error } = await supabase.from("traspasos").update(patch).eq("id", traspasoId);
  if (error) throw new Error(error.message);
}
