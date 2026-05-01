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

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const [customersRes, salesRes] = await Promise.all([
    supabase.from("customers").select("id,full_name,phone,email,document_number,created_at").order("created_at", { ascending: false }),
    supabase.from("sales").select("id,customer_id,agreed_price,sale_status,created_at"),
  ]);

  if (customersRes.error || !customersRes.data) return [];

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

  return customersRes.data.map((c: any) => {
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
}

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const [customerRes, salesRes] = await Promise.all([
    supabase.from("customers").select("id,full_name,phone,email,document_number,created_at").eq("id", id).single(),
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
