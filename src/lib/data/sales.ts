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
  paymentMethod: string;
  createdAt: string;
  isExternal: boolean;
};

export async function getSales(filterByUserId?: string): Promise<Sale[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("sales")
    .select("id,vehicle_id,customer_id,seller_id,agreed_price,initial_payment,pending_balance,payment_status,document_status,delivery_status,sale_status,expiry_date,payment_method,created_at,created_by_user_id")
    .order("created_at", { ascending: false });

  if (filterByUserId) {
    query = query.eq("created_by_user_id", filterByUserId);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("No se pudieron cargar ventas:", error?.message);
    return [];
  }

  const vehicleIds = [...new Set(data.map((s: any) => s.vehicle_id).filter(Boolean))];
  const customerIds = [...new Set(data.map((s: any) => s.customer_id).filter(Boolean))];
  const sellerIds = [...new Set(data.map((s: any) => s.seller_id).filter(Boolean))];

  const [vehiclesRes, customersRes, advisorsRes] = await Promise.all([
    vehicleIds.length ? supabase.from("vehicles").select("id,brand,line,plate,owner_type").in("id", vehicleIds) : Promise.resolve({ data: [] }),
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
      isExternal: (v as any)?.owner_type === "Externo",
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
      paymentMethod: s.payment_method ?? "Contado",
      createdAt: s.created_at,
    };
  });
}

export type SaleDetail = Sale & {
  closedAt: string | null;
  vehicleBrand: string;
  vehicleLine: string;
  vehicleVersion: string;
  customerDocument: string | null;
  vehicleOwnerType: string;
  vehicleOwnerName: string | null;
  consignmentRate: number;
  consignmentCommission: number;
  consignmentAutoAmount: number;
  commissionIsOverridden: boolean;
  commissionOverrideBy: string | null;
  commissionOverrideAt: string | null;
  clientPaperworkAmount: number;
  ownerPayout: number;
};

export async function getSaleById(saleId: string): Promise<SaleDetail | null> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return null;

  const { data: s, error } = await supabase
    .from("sales")
    .select("*")
    .eq("id", saleId)
    .single();

  if (error || !s) return null;

  const [vehicleRes, customerRes, advisorRes, settings] = await Promise.all([
    s.vehicle_id ? supabase.from("vehicles").select("id,brand,line,version,plate,owner_type,owner_name").eq("id", s.vehicle_id).single() : Promise.resolve({ data: null }),
    s.customer_id ? supabase.from("customers").select("id,full_name,phone,document_number").eq("id", s.customer_id).single() : Promise.resolve({ data: null }),
    s.seller_id ? supabase.from("advisors").select("id,full_name").eq("id", s.seller_id).single() : Promise.resolve({ data: null }),
    getSettings(),
  ]);

  const v = vehicleRes.data;
  const c = customerRes.data;
  const a = advisorRes.data;

  const settingsMap = Object.fromEntries(settings.map((st) => [st.key, Number(st.value)]));
  const consignmentRate = settingsMap["commission_consignacion"] ?? 3;
  const agreedPrice = Number(s.agreed_price);
  const ownerType = (v as any)?.owner_type ?? "Propio";
  const consignmentAutoAmount = ownerType === "Comisión" ? Math.round(agreedPrice * consignmentRate / 100) : 0;
  const storedCommission = (s as any).commission_amount;
  const consignmentCommission = ownerType === "Comisión"
    ? (storedCommission !== null && storedCommission !== undefined ? Number(storedCommission) : consignmentAutoAmount)
    : 0;
  const commissionIsOverridden = ownerType === "Comisión" && storedCommission !== null && storedCommission !== undefined && Number(storedCommission) !== consignmentAutoAmount;
  const clientPaperworkAmount = ownerType === "Comisión" ? Number((s as any).client_paperwork_amount ?? 0) : 0;
  const ownerPayout = ownerType === "Comisión" ? agreedPrice - consignmentCommission - clientPaperworkAmount : 0;

  return {
    id: s.id,
    vehicleId: s.vehicle_id,
    vehicleName: v ? `${(v as any).brand} ${(v as any).line}` : "Vehículo",
    vehiclePlate: (v as any)?.plate ?? "",
    vehicleBrand: (v as any)?.brand ?? "",
    vehicleLine: (v as any)?.line ?? "",
    vehicleVersion: (v as any)?.version ?? "",
    customerName: c?.full_name ?? null,
    customerPhone: c?.phone ?? null,
    customerDocument: c?.document_number ?? null,
    sellerName: a?.full_name ?? null,
    agreedPrice,
    initialPayment: Number(s.initial_payment),
    pendingBalance: Number(s.pending_balance),
    paymentStatus: s.payment_status,
    documentStatus: s.document_status,
    deliveryStatus: s.delivery_status,
    saleStatus: s.sale_status,
    expiryDate: s.expiry_date ?? null,
    paymentMethod: s.payment_method ?? "Contado",
    closedAt: s.closed_at ?? null,
    createdAt: s.created_at,
    vehicleOwnerType: ownerType,
    vehicleOwnerName: (v as any)?.owner_name ?? null,
    consignmentRate,
    consignmentCommission,
    consignmentAutoAmount,
    commissionIsOverridden,
    commissionOverrideBy: (s as any).commission_override_by ?? null,
    commissionOverrideAt: (s as any).commission_override_at ?? null,
    clientPaperworkAmount,
    ownerPayout,
  };
}

export type CreateSaleInput = {
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  customerDocument?: string;
  sellerId?: string;
  agreedPrice: number;
  initialPayment: number;
  paymentStatus: string;
  documentStatus: string;
  deliveryStatus: string;
  saleStatus: string;
  expiryDate?: string;
  paymentMethod?: string;
  initialPaymentChannel?: string;
  clientPaperworkAmount?: number;
  createdByUserId?: string;
};

export async function createSale(input: CreateSaleInput): Promise<string> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const isSold = input.saleStatus === "vendido";
  const customerLabel = input.customerName.trim() || "Cliente";

  // Fetch vehicle data + settings in parallel to compute commissions before the transaction
  const [vehicleRes, settings] = await Promise.all([
    supabase
      .from("vehicles")
      .select("brand,line,plate,owner_type,advisor_buyer_id,buy_price,real_cost")
      .eq("id", input.vehicleId)
      .single(),
    getSettings(),
  ]);

  if (vehicleRes.error) throw new Error(vehicleRes.error.message);
  const vehicle = vehicleRes.data as any;

  const vehicleTag = vehicle
    ? [vehicle.brand + " " + vehicle.line, vehicle.plate].filter(Boolean).join(" · ")
    : "";

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, Number(s.value)]));
  const pctCaptador     = settingsMap["commission_captador"] ?? 20;
  const pctVendedor     = settingsMap["commission_vendedor"] ?? 20;
  const pctConsignacion = settingsMap["commission_consignacion"] ?? 3;
  const currentMonth    = new Date().toISOString().slice(0, 7);

  const conceptParts = [isSold ? "Pago venta" : "Abono separación"];
  if (vehicleTag) conceptParts.push(vehicleTag);
  conceptParts.push(customerLabel);

  type CommissionRow = {
    advisor_id: string; role: string;
    base_amount: number; percentage: number; amount: number; month: string;
  };
  const commissions: CommissionRow[] = [];
  let consignmentIncomeAmount = 0;
  let consignmentIncomeConcept = "";

  if (vehicle && vehicle.owner_type !== "Externo") {
    if (vehicle.owner_type === "Comisión") {
      consignmentIncomeAmount = Math.round(input.agreedPrice * pctConsignacion / 100);
      const parts = ["Comisión consignación"];
      if (vehicleTag) parts.push(vehicleTag);
      if (customerLabel) parts.push(customerLabel);
      consignmentIncomeConcept = parts.join(" — ");
    } else {
      const grossProfit = Math.max(
        0,
        input.agreedPrice - Number(vehicle.buy_price) - Number(vehicle.real_cost ?? 0)
      );
      if (vehicle.advisor_buyer_id) {
        commissions.push({
          advisor_id: vehicle.advisor_buyer_id,
          role: "Captador",
          base_amount: grossProfit,
          percentage: pctCaptador,
          amount: Math.round((grossProfit * pctCaptador) / 100),
          month: currentMonth,
        });
      }
      if (input.sellerId) {
        commissions.push({
          advisor_id: input.sellerId,
          role: "Vendedor",
          base_amount: grossProfit,
          percentage: pctVendedor,
          amount: Math.round((grossProfit * pctVendedor) / 100),
          month: currentMonth,
        });
      }
    }
  }

  const { data: saleId, error } = await supabase.rpc("create_sale_atomic", {
    p_vehicle_id:                input.vehicleId,
    p_customer_name:             input.customerName,
    p_customer_phone:            input.customerPhone ?? "",
    p_customer_document:         input.customerDocument ?? "",
    p_seller_id:                 input.sellerId ?? null,
    p_agreed_price:              input.agreedPrice,
    p_initial_payment:           input.initialPayment,
    p_pending_balance:           Math.max(0, input.agreedPrice - input.initialPayment),
    p_payment_status:            input.paymentStatus,
    p_document_status:           input.documentStatus,
    p_delivery_status:           input.deliveryStatus,
    p_sale_status:               input.saleStatus,
    p_expiry_date:               input.expiryDate ?? null,
    p_payment_method:            input.paymentMethod ?? "Contado",
    p_client_paperwork_amount:   input.clientPaperworkAmount ?? 0,
    p_created_by_user_id:        input.createdByUserId ?? null,
    p_vehicle_new_status:        isSold ? "Vendido" : "Separado",
    p_vehicle_separated:         !isSold,
    p_movement_title:            isSold ? "Vehículo vendido" : "Vehículo separado",
    p_movement_description:      `Cliente: ${customerLabel}. Precio acordado: $${input.agreedPrice.toLocaleString("es-CO")}. Abono inicial: $${input.initialPayment.toLocaleString("es-CO")}.`,
    p_finance_channel:           input.initialPaymentChannel ?? "Banco",
    p_finance_concept:           conceptParts.join(" — "),
    p_commissions:               commissions,
    p_consignment_income_amount: consignmentIncomeAmount,
    p_consignment_income_concept: consignmentIncomeConcept,
  });

  if (error) throw new Error(error.message);
  return saleId as string;
}

export async function updateSaleCommission(
  saleId: string,
  vehicleId: string,
  amount: number,
  overrideBy: string
): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error } = await supabase.from("sales").update({
    commission_amount: Math.max(0, amount),
    commission_override_by: overrideBy,
    commission_override_at: new Date().toISOString(),
  }).eq("id", saleId);
  if (error) throw new Error(error.message);

  // Sync the corresponding finance_movement
  const { data: movements } = await supabase
    .from("finance_movements")
    .select("id")
    .ilike("notes", `%Venta ID: ${saleId}.%`)
    .limit(1);

  if (movements && movements.length > 0) {
    await supabase.from("finance_movements").update({ amount: Math.max(0, amount) }).eq("id", movements[0].id);
  }
}

export async function updateConsignmentPaperwork(saleId: string, amount: number): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error } = await supabase
    .from("sales")
    .update({ client_paperwork_amount: Math.max(0, amount) })
    .eq("id", saleId);

  if (error) throw new Error(error.message);
}

export async function updateSaleStatuses(
  saleId: string,
  updates: { paymentStatus?: string; documentStatus?: string; deliveryStatus?: string }
): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const patch: Record<string, string> = {};
  if (updates.paymentStatus) patch.payment_status = updates.paymentStatus;
  if (updates.documentStatus) patch.document_status = updates.documentStatus;
  if (updates.deliveryStatus) patch.delivery_status = updates.deliveryStatus;
  if (Object.keys(patch).length === 0) return;

  const { error } = await supabase.from("sales").update(patch).eq("id", saleId);
  if (error) throw new Error(error.message);
}

export async function markSaleDelivered(
  saleId: string,
  vehicleId: string,
  userName: string,
  checklist: string[]
): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  await supabase.from("sales").update({
    sale_status: "entregado",
    delivery_status: "completada",
    payment_status: "completo",
  }).eq("id", saleId);

  await supabase.from("vehicles").update({
    status: "Entregado",
    separated: false,
  }).eq("id", vehicleId);

  await supabase.from("vehicle_movements").insert({
    vehicle_id: vehicleId,
    type: "Entregado",
    title: "Vehículo entregado al cliente",
    description: `Acta de entrega firmada por ${userName}. Checklist: ${checklist.join(", ")}.`,
    new_status: "Entregado",
    metadata: { userName, saleId, checklist },
  });
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

export async function cancelSale(
  saleId: string,
  deleteInitialPayment: boolean,
  cancelledBy: string,
  reason?: string
): Promise<void> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { error } = await supabase.rpc("cancel_sale_atomic", {
    p_sale_id:                saleId,
    p_cancelled_by:           cancelledBy,
    p_delete_initial_payment: deleteInitialPayment,
    p_reason:                 reason ?? null,
  });

  if (error) throw new Error(error.message);
}
