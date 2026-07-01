"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createCommission } from "@/lib/data/commissions";
import { createFinanceMovement } from "@/lib/data/finance";
import { getCurrentUserProfile, getUserRole } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ROLES, requireRole } from "@/lib/security";
import { logAudit } from "@/lib/data/audit";

const commissionSchema = z.object({
  advisorId: z.string().trim().min(1),
  role: z.enum(["Captador", "Vendedor", "Crédito"]),
  vehicleId: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().optional()
  ),
  amount: z.preprocess((v) => Number(v), z.number().positive()),
  month: z.string().min(7),
  status: z.enum(["Pendiente", "Pagada"]),
});

export async function createCommissionAction(formData: FormData) {
  const role = await getUserRole();
  const denied = requireRole(role, ROLES.COMMISSION_CREATE, "Sin permisos para registrar comisiones.");
  if (denied) redirect("/comisiones?error=" + encodeURIComponent(denied.error));

  const parsed = commissionSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    redirect("/comisiones/nueva?error=" + encodeURIComponent(msg));
  }

  let newId: string;
  try {
    newId = await createCommission(parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo registrar la comisión.";
    redirect("/comisiones/nueva?error=" + encodeURIComponent(message));
  }

  const { id: userId, name } = await getCurrentUserProfile();
  logAudit({
    tableName: "commissions",
    recordId: newId!,
    action: "INSERT",
    newValue: `${parsed.data.role} — $${parsed.data.amount} — ${parsed.data.month}`,
    userName: name,
    userId,
  }).catch(() => {});

  revalidatePath("/comisiones");
  redirect("/comisiones");
}

export async function markCommissionPaidAction(
  commissionId: string,
  advisorName: string,
  amount: number,
  vehicleName: string
): Promise<{ error?: string }> {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "accounting"].includes(role)) {
    return { error: "Sin permisos para marcar comisiones como pagadas." };
  }

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase
    .from("commissions")
    .update({ status: "Pagada", paid_at: new Date().toISOString() })
    .eq("id", commissionId);

  if (error) return { error: error.message };

  const { id: userId, name } = await getCurrentUserProfile();

  try {
    await createFinanceMovement({
      type: "Egreso",
      channel: "Banco",
      category: "Comisiones",
      concept: `Comisión pagada — ${advisorName} · ${vehicleName}`,
      amount,
      date: new Date().toISOString().split("T")[0],
      responsibleName: name,
    });
  } catch {
    // El movimiento financiero es secundario — no fallar si hay error
  }

  logAudit({
    tableName: "commissions",
    recordId: commissionId,
    action: "UPDATE",
    fieldChanged: "status",
    oldValue: "Pendiente",
    newValue: "Pagada",
    userName: name,
    userId,
  }).catch(() => {});

  revalidatePath("/comisiones");
  return {};
}
