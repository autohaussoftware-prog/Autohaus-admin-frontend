import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { escapeHtml, filterValidEmails } from "@/lib/security";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM ?? "Autohaus <noreply@autohaus.com>";
const GERENTE_EMAIL = process.env.GERENTE_EMAIL ?? "";

async function sendEmail(to: string[], subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not configured — email not sent");
    return;
  }
  if (to.length === 0) return;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[email] Resend API error", { status: res.status, body, to });
    }
  } catch (err) {
    console.error("[email] Network error sending email", { error: String(err), to });
  }
}

export async function sendSaleNotification(saleId: string) {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return;

  const { data: sale } = await supabase
    .from("sales")
    .select("*")
    .eq("id", saleId)
    .single();

  if (!sale) return;

  const [vehicleRes, customerRes, sellerRes, vehicleAdvisorRes] = await Promise.all([
    sale.vehicle_id
      ? supabase.from("vehicles").select("brand,line,plate,advisor_buyer_id").eq("id", sale.vehicle_id).single()
      : Promise.resolve({ data: null }),
    sale.customer_id
      ? supabase.from("customers").select("full_name,phone").eq("id", sale.customer_id).single()
      : Promise.resolve({ data: null }),
    sale.seller_id
      ? supabase.from("advisors").select("full_name,email").eq("id", sale.seller_id).single()
      : Promise.resolve({ data: null }),
    Promise.resolve({ data: null }),
  ]);

  const vehicle = vehicleRes.data;
  const customer = customerRes.data;
  const seller = sellerRes.data;

  let captadorEmail: string | null = null;
  if (vehicle?.advisor_buyer_id) {
    const { data: captador } = await supabase
      .from("advisors")
      .select("email")
      .eq("id", vehicle.advisor_buyer_id)
      .single();
    captadorEmail = captador?.email ?? null;
  }

  const vehicleLabel = vehicle
    ? `${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.line)} — ${escapeHtml(vehicle.plate)}`
    : "Vehículo";
  const customerLabel = escapeHtml(customer?.full_name ?? "Cliente");
  const customerPhone = escapeHtml(customer?.phone ?? "");
  const agreedPrice = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(sale.agreed_price));
  const saleStatusLabel = sale.sale_status === "vendido" ? "Venta directa" : "Separación";

  const html = `
<div style="font-family:sans-serif;max-width:560px">
  <h2 style="color:#D6A93D">Nueva venta registrada</h2>
  <p><strong>Veh&iacute;culo:</strong> ${vehicleLabel}</p>
  <p><strong>Cliente:</strong> ${customerLabel}${customerPhone ? ` &mdash; ${customerPhone}` : ""}</p>
  <p><strong>Precio acordado:</strong> ${agreedPrice}</p>
  <p><strong>Estado:</strong> ${saleStatusLabel}</p>
  <p style="color:#888;font-size:12px">Sistema Autohaus</p>
</div>`;

  const recipients = filterValidEmails([seller?.email, captadorEmail, GERENTE_EMAIL || null]);

  if (recipients.length > 0) {
    await sendEmail(recipients, `Nueva venta: ${vehicleLabel}`, html);
  }
}
