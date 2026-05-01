import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type Payment = {
  id: string;
  saleId: string;
  amount: number;
  date: string;
  channel: string;
  reference: string;
  notes: string;
  registeredBy: string;
  createdAt: string;
};

export { PAYMENT_CHANNELS, type PaymentChannel } from "@/lib/domain/payment-channels-config";

export async function getPaymentsBySaleId(saleId: string): Promise<Payment[]> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("sale_id", saleId)
    .order("date", { ascending: false });

  if (error || !data) return [];

  return data.map((p: any) => ({
    id: p.id,
    saleId: p.sale_id,
    amount: Number(p.amount),
    date: p.date,
    channel: p.channel,
    reference: p.reference ?? "",
    notes: p.notes ?? "",
    registeredBy: p.registered_by ?? "Sistema",
    createdAt: p.created_at,
  }));
}

export type CreatePaymentInput = {
  saleId: string;
  amount: number;
  date: string;
  channel: string;
  reference?: string;
  notes?: string;
  registeredBy?: string;
};

export async function createPayment(input: CreatePaymentInput): Promise<string> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) throw new Error("Supabase no configurado.");

  const { data, error } = await supabase
    .from("payments")
    .insert({
      sale_id: input.saleId,
      amount: input.amount,
      date: input.date,
      channel: input.channel,
      reference: input.reference?.trim() || null,
      notes: input.notes?.trim() || null,
      registered_by: input.registeredBy || "Sistema",
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Error registrando pago.");

  // Actualizar saldo pendiente en la venta
  const { data: sale } = await supabase
    .from("sales")
    .select("pending_balance, agreed_price")
    .eq("id", input.saleId)
    .single();

  if (sale) {
    const newBalance = Math.max(0, Number(sale.pending_balance) - input.amount);
    const newPaymentStatus = newBalance === 0 ? "completo" : "parcial";
    await supabase
      .from("sales")
      .update({ pending_balance: newBalance, payment_status: newPaymentStatus })
      .eq("id", input.saleId);
  }

  return data.id as string;
}
