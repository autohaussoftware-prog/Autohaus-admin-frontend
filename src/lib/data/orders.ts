import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const FULL_ACCESS_ROLES = ["owner", "partner", "admin", "gerente", "accounting"];

export type OrderStatus = "Nuevo" | "En búsqueda" | "Contactado" | "Cerrado";

export type Order = {
  id: string;
  brand: string;
  year: number;
  line: string;
  budget: string;
  paymentMethod: string;
  colorPreference: string;
  observations: string | null;
  status: OrderStatus;
  createdAt: string;
  createdByUserId: string | null;
  advisorName: string | null;
  advisorPhone: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerVisible: boolean;
};

export type CreateOrderInput = {
  brand: string;
  year: number;
  line: string;
  budget: string;
  paymentMethod: string;
  colorPreference: string;
  observations?: string;
  customerName: string;
  customerPhone: string;
  createdByUserId: string;
};

type DbOrder = {
  id: string;
  brand: string;
  year: number;
  line: string;
  budget: string;
  payment_method: string;
  color_preference: string;
  observations: string | null;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  created_by_user_id: string | null;
  created_at: string;
};

type AdvisorProfile = { full_name: string | null; phone: string | null };

function mapOrder(
  order: DbOrder,
  viewer: { userId: string; role: string } | undefined,
  advisorsMap: Map<string, AdvisorProfile>
): Order {
  const canSeeContact =
    !viewer ||
    FULL_ACCESS_ROLES.includes(viewer.role) ||
    (order.created_by_user_id !== null && order.created_by_user_id === viewer.userId);

  const advisor = order.created_by_user_id ? advisorsMap.get(order.created_by_user_id) : undefined;

  return {
    id: order.id,
    brand: order.brand,
    year: order.year,
    line: order.line,
    budget: order.budget,
    paymentMethod: order.payment_method,
    colorPreference: order.color_preference,
    observations: order.observations,
    status: order.status,
    createdAt: order.created_at,
    createdByUserId: order.created_by_user_id,
    advisorName: advisor?.full_name ?? null,
    advisorPhone: advisor?.phone ?? null,
    customerName: canSeeContact ? order.customer_name : null,
    customerPhone: canSeeContact ? order.customer_phone : null,
    customerVisible: canSeeContact,
  };
}

export async function getOrders(viewer?: { userId: string; role: string }): Promise<Order[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const orders = data as DbOrder[];
  const advisorIds = [...new Set(orders.map((o) => o.created_by_user_id).filter(Boolean))] as string[];

  const advisorsMap = new Map<string, AdvisorProfile>();
  if (advisorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", advisorIds);

    if (profiles) {
      for (const p of profiles as any[]) {
        advisorsMap.set(p.id, { full_name: p.full_name ?? null, phone: p.phone ?? null });
      }
    }
  }

  return orders.map((order) => mapOrder(order, viewer, advisorsMap));
}

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { data, error } = await supabase
    .from("orders")
    .insert({
      brand: input.brand,
      year: input.year,
      line: input.line,
      budget: input.budget,
      payment_method: input.paymentMethod,
      color_preference: input.colorPreference,
      observations: input.observations || null,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      status: "Nuevo",
      created_by_user_id: input.createdByUserId,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "No se pudo crear el pedido.");

  return data.id as string;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}
