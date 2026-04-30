import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type Sale = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  customerName: string | null;
  customerPhone: string | null;
  sellerName: string | null;
  agreedPrice: number;
  initialPayment: number;
  pendingBalance: number;
  paymentStatus: string;
  documentStatus: string;
  deliveryStatus: string;
  saleStatus: string;
  createdAt: string;
};

export async function getSales(): Promise<Sale[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("sales")
    .select("id,vehicle_id,customer_id,seller_id,agreed_price,initial_payment,pending_balance,payment_status,document_status,delivery_status,sale_status,created_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("No se pudieron cargar ventas:", error?.message);
    return [];
  }

  const vehicleIds = [...new Set(data.map((s: any) => s.vehicle_id).filter(Boolean))];
  const customerIds = [...new Set(data.map((s: any) => s.customer_id).filter(Boolean))];
  const sellerIds = [...new Set(data.map((s: any) => s.seller_id).filter(Boolean))];

  const [vehiclesRes, customersRes, advisorsRes] = await Promise.all([
    vehicleIds.length ? supabase.from("vehicles").select("id,brand,line,plate").in("id", vehicleIds) : Promise.resolve({ data: [] }),
    customerIds.length ? supabase.from("customers").select("id,full_name,phone").in("id", customerIds) : Promise.resolve({ data: [] }),
    sellerIds.length ? supabase.from("advisors").select("id,full_name").in("id", sellerIds) : Promise.resolve({ data: [] }),
  ]);

  const vehicles = new Map((vehiclesRes.data ?? []).map((v: any) => [v.id, v]));
  const customers = new Map((customersRes.data ?? []).map((c: any) => [c.id, c]));
  const advisors = new Map((advisorsRes.data ?? []).map((a: any) => [a.id, a]));

  return data.map((s: any) => {
    const v = vehicles.get(s.vehicle_id);
    const c = customers.get(s.customer_id);
    const a = advisors.get(s.seller_id);
    return {
      id: s.id,
      vehicleId: s.vehicle_id,
      vehicleName: v ? `${v.brand} ${v.line}` : "Vehículo",
      vehiclePlate: v?.plate ?? "",
      customerName: c?.full_name ?? null,
      customerPhone: c?.phone ?? null,
      sellerName: a?.full_name ?? null,
      agreedPrice: Number(s.agreed_price),
      initialPayment: Number(s.initial_payment),
      pendingBalance: Number(s.pending_balance),
      paymentStatus: s.payment_status,
      documentStatus: s.document_status,
      deliveryStatus: s.delivery_status,
      saleStatus: s.sale_status,
      createdAt: s.created_at,
    };
  });
}

export type CreateSaleInput = {
  vehicleId: string;
  customerName: string;
  customerPhone?: string;
  customerDocument?: string;
  sellerId?: string;
  agreedPrice: number;
  initialPayment: number;
  paymentStatus: string;
  documentStatus: string;
  deliveryStatus: string;
  saleStatus: string;
};

export async function createSale(input: CreateSaleInput): Promise<string> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  // Crear o encontrar cliente
  let customerId: string | null = null;
  if (input.customerName.trim()) {
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .ilike("full_name", input.customerName.trim())
      .maybeSingle();

    if (existing) {
      customerId = existing.id as string;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          full_name: input.customerName.trim(),
          phone: input.customerPhone?.trim() || null,
          document_number: input.customerDocument?.trim() || null,
        })
        .select("id")
        .single();
      if (customerError) throw new Error(customerError.message);
      customerId = newCustomer.id as string;
    }
  }

  const pendingBalance = Math.max(0, input.agreedPrice - input.initialPayment);
  const isSold = input.saleStatus === "vendido";

  // Registrar venta
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      vehicle_id: input.vehicleId,
      customer_id: customerId,
      seller_id: input.sellerId || null,
      agreed_price: input.agreedPrice,
      initial_payment: input.initialPayment,
      pending_balance: pendingBalance,
      payment_status: input.paymentStatus,
      document_status: input.documentStatus,
      delivery_status: input.deliveryStatus,
      sale_status: input.saleStatus,
    })
    .select("id")
    .single();

  if (saleError || !sale) throw new Error(saleError?.message ?? "Error creando venta.");

  // Actualizar estado del vehículo
  const newStatus = isSold ? "Vendido" : "Separado";
  await supabase
    .from("vehicles")
    .update({ status: newStatus, separated: !isSold })
    .eq("id", input.vehicleId);

  // Registrar movimiento del vehículo
  const customerLabel = input.customerName.trim() || "Cliente";
  await supabase.from("vehicle_movements").insert({
    vehicle_id: input.vehicleId,
    type: newStatus,
    title: isSold ? "Vehículo vendido" : "Vehículo separado",
    description: `Cliente: ${customerLabel}. Precio acordado: $${input.agreedPrice.toLocaleString("es-CO")}. Abono inicial: $${input.initialPayment.toLocaleString("es-CO")}.`,
    new_status: newStatus,
    metadata: { userName: "Sistema", saleId: sale.id },
  });

  // Registrar abono inicial como movimiento financiero si > 0
  if (input.initialPayment > 0) {
    await supabase.from("finance_movements").insert({
      type: "Ingreso",
      channel: "Banco",
      concept: `${isSold ? "Pago venta" : "Abono separación"} — ${customerLabel}`,
      amount: input.initialPayment,
      date: new Date().toISOString().split("T")[0],
      vehicle_id: input.vehicleId,
      responsible_name: "Sistema",
    });
  }

  return sale.id as string;
}
