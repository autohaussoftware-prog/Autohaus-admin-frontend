import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/data/settings";

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
  expiryDate: string | null;
  createdAt: string;
};

export async function getSales(): Promise<Sale[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("sales")
    .select("id,vehicle_id,customer_id,seller_id,agreed_price,initial_payment,pending_balance,payment_status,document_status,delivery_status,sale_status,expiry_date,created_at")
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
      expiryDate: s.expiry_date ?? null,
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

  // Auto-calcular comisiones si hay asesores asignados
  await autoCreateCommissions(supabase, sale.id as string, input.vehicleId, input.sellerId ?? null);

  return sale.id as string;
}

async function autoCreateCommissions(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>,
  saleId: string,
  vehicleId: string,
  sellerId: string | null
) {
  try {
    const [settings, vehicleRes] = await Promise.all([
      getSettings(),
      supabase.from("vehicles").select("advisor_buyer_id, buy_price, target_price").eq("id", vehicleId).single(),
    ]);

    const vehicle = vehicleRes.data;
    if (!vehicle) return;

    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, Number(s.value)]));
    const pctCaptador = settingsMap["commission_captador"] ?? 20;
    const pctVendedor = settingsMap["commission_vendedor"] ?? 20;

    const grossProfit = Math.max(0, Number(vehicle.target_price) - Number(vehicle.buy_price));
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const commissionsToInsert: any[] = [];

    if (vehicle.advisor_buyer_id) {
      const baseAmount = grossProfit;
      commissionsToInsert.push({
        advisor_id: vehicle.advisor_buyer_id,
        role: "Captador",
        vehicle_id: vehicleId,
        sale_id: saleId,
        base_amount: baseAmount,
        percentage: pctCaptador,
        amount: Math.round((baseAmount * pctCaptador) / 100),
        status: "Pendiente",
        month: currentMonth,
      });
    }

    if (sellerId) {
      const baseAmount = grossProfit;
      commissionsToInsert.push({
        advisor_id: sellerId,
        role: "Vendedor",
        vehicle_id: vehicleId,
        sale_id: saleId,
        base_amount: baseAmount,
        percentage: pctVendedor,
        amount: Math.round((baseAmount * pctVendedor) / 100),
        status: "Pendiente",
        month: currentMonth,
      });
    }

    if (commissionsToInsert.length > 0) {
      await supabase.from("commissions").insert(commissionsToInsert);
    }
  } catch {
    // Comisiones son secundarias — no fallar la venta si hay error
  }
}

export async function confirmSaleFromReservation(saleId: string, vehicleId: string, userName: string): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error: saleError } = await supabase
    .from("sales")
    .update({ sale_status: "vendido", closed_at: new Date().toISOString() })
    .eq("id", saleId);

  if (saleError) throw new Error(saleError.message);

  await supabase
    .from("vehicles")
    .update({ status: "Vendido", separated: false })
    .eq("id", vehicleId);

  await supabase.from("vehicle_movements").insert({
    vehicle_id: vehicleId,
    type: "Vendido",
    title: "Separación convertida a venta",
    description: `Cierre comercial confirmado por ${userName}.`,
    new_status: "Vendido",
    metadata: { userName, saleId },
  });
}
