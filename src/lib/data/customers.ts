import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type Customer = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  documentNumber: string | null;
  createdAt: string;
  purchaseCount: number;
  totalSpent: number;
  lastPurchaseDate: string | null;
};

export type CustomerDetail = Customer & {
  purchases: CustomerPurchase[];
};

export type CustomerPurchase = {
  saleId: string;
  vehicleName: string;
  vehiclePlate: string;
  agreedPrice: number;
  saleStatus: string;
  createdAt: string;
};

const CUSTOMERS_PAGE_SIZE = 50;

export async function getCustomers(opts?: {
  page?: number;
  pageSize?: number;
}): Promise<{ customers: Customer[]; total: number }> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { customers: [], total: 0 };

  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = opts?.pageSize ?? CUSTOMERS_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const [customersRes, countRes] = await Promise.all([
    supabase
      .from("customers")
      .select("id,full_name,phone,email,document_number,created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
  ]);

  if (customersRes.error || !customersRes.data) return { customers: [], total: 0 };

  // Only fetch sales for the current page's customer IDs
  const customerIds = customersRes.data.map((c: any) => c.id as string);
  const salesRes = customerIds.length
    ? await supabase
        .from("sales")
        .select("id,customer_id,agreed_price,sale_status,created_at")
        .in("customer_id", customerIds)
    : { data: [] };

  const salesByCustomer = new Map<string, { count: number; total: number; last: string | null }>();
  for (const s of (salesRes.data ?? [])) {
    const cid = s.customer_id as string;
    if (!cid) continue;
    const existing = salesByCustomer.get(cid) ?? { count: 0, total: 0, last: null };
    existing.count += 1;
    existing.total += Number(s.agreed_price ?? 0);
    if (!existing.last || (s.created_at as string) > existing.last) {
      existing.last = s.created_at as string;
    }
    salesByCustomer.set(cid, existing);
  }

  const customers = customersRes.data.map((c: any) => {
    const stats = salesByCustomer.get(c.id) ?? { count: 0, total: 0, last: null };
    return {
      id: c.id as string,
      fullName: c.full_name as string,
      phone: c.phone ?? null,
      email: c.email ?? null,
      documentNumber: c.document_number ?? null,
      createdAt: c.created_at as string,
      purchaseCount: stats.count,
      totalSpent: stats.total,
      lastPurchaseDate: stats.last,
    };
  });

  return { customers, total: countRes.count ?? customers.length };
}

export async function getCustomersSummary(): Promise<{
  total: number;
  withPurchases: number;
  repeat: number;
  totalRevenue: number;
  totalPurchases: number;
}> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { total: 0, withPurchases: 0, repeat: 0, totalRevenue: 0, totalPurchases: 0 };

  const [countRes, salesRes] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("sales").select("customer_id,agreed_price"),
  ]);

  const salesByCustomer = new Map<string, { count: number; total: number }>();
  for (const s of (salesRes.data ?? [])) {
    const cid = s.customer_id as string;
    if (!cid) continue;
    const e = salesByCustomer.get(cid) ?? { count: 0, total: 0 };
    e.count += 1;
    e.total += Number(s.agreed_price ?? 0);
    salesByCustomer.set(cid, e);
  }

  const stats = [...salesByCustomer.values()];
  return {
    total: countRes.count ?? 0,
    withPurchases: stats.filter((s) => s.count > 0).length,
    repeat: stats.filter((s) => s.count >= 2).length,
    totalRevenue: stats.reduce((sum, s) => sum + s.total, 0),
    totalPurchases: stats.reduce((sum, s) => sum + s.count, 0),
  };
}

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const [customerRes, salesRes] = await Promise.all([
    supabase.from("customers").select("id,full_name,phone,email,document_number,created_at").eq("id", id).is("deleted_at", null).single(),
    supabase.from("sales").select("id,vehicle_id,agreed_price,sale_status,created_at").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);

  if (customerRes.error || !customerRes.data) return null;
  const c = customerRes.data as any;

  const vehicleIds = [...new Set((salesRes.data ?? []).map((s: any) => s.vehicle_id).filter(Boolean))];
  const vehiclesRes = vehicleIds.length
    ? await supabase.from("vehicles").select("id,brand,line,plate").in("id", vehicleIds)
    : { data: [] };

  const vehicleMap = new Map((vehiclesRes.data ?? []).map((v: any) => [v.id, v]));

  const purchases: CustomerPurchase[] = (salesRes.data ?? []).map((s: any) => {
    const v = vehicleMap.get(s.vehicle_id);
    return {
      saleId: s.id as string,
      vehicleName: v ? `${v.brand} ${v.line}` : "Vehículo",
      vehiclePlate: v?.plate ?? "",
      agreedPrice: Number(s.agreed_price ?? 0),
      saleStatus: s.sale_status as string,
      createdAt: s.created_at as string,
    };
  });

  const stats = purchases.reduce(
    (acc, p) => ({ count: acc.count + 1, total: acc.total + p.agreedPrice }),
    { count: 0, total: 0 }
  );

  return {
    id: c.id,
    fullName: c.full_name,
    phone: c.phone ?? null,
    email: c.email ?? null,
    documentNumber: c.document_number ?? null,
    createdAt: c.created_at,
    purchaseCount: stats.count,
    totalSpent: stats.total,
    lastPurchaseDate: purchases[0]?.createdAt ?? null,
    purchases,
  };
}

// Requires: ALTER TABLE customers
//   ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ DEFAULT NULL,
//   ADD COLUMN IF NOT EXISTS deleted_by   TEXT        DEFAULT NULL,
//   ADD COLUMN IF NOT EXISTS delete_reason TEXT       DEFAULT NULL;
export async function deleteCustomer(
  customerId: string,
  deletedBy: string,
  reason?: string
): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  // Always soft-delete to preserve sales/purchase history
  const { error } = await supabase
    .from("customers")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: deletedBy,
      delete_reason: reason?.trim() || null,
    })
    .eq("id", customerId);

  if (error) throw new Error(error.message ?? "No se pudo eliminar el cliente.");
}
