"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createFinanceMovement, deleteFinanceMovement, updateFinanceMovement } from "@/lib/data/finance";
import { getCurrentUserProfile, getUserRole } from "@/lib/supabase/server";
import { ROLES, requireRole } from "@/lib/security";
import { logAudit } from "@/lib/data/audit";

const movimientoSchema = z.object({
  type: z.enum(["Ingreso", "Egreso"]),
  channel: z.enum(["Banco", "Efectivo José", "Efectivo Tomás"]),
  category: z.string().trim().optional(),
  concept: z.string().trim().min(3),
  amount: z.preprocess((v) => Number(v), z.number().positive()),
  date: z.string().min(1),
  vehicleId: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().optional()
  ),
  responsibleName: z.string().trim().min(2),
});

export async function createMovimientoAction(formData: FormData) {
  const role = await getUserRole();
  const denied = requireRole(role, ROLES.FINANCE_WRITE, "Sin permisos para registrar movimientos financieros.");
  if (denied) redirect("/movimientos/nuevo?error=" + encodeURIComponent(denied.error));

  const parsed = movimientoSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    redirect("/movimientos/nuevo?error=" + encodeURIComponent(msg));
  }

  let newId: string;
  try {
    newId = await createFinanceMovement(parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo registrar el movimiento.";
    redirect("/movimientos/nuevo?error=" + encodeURIComponent(message));
  }

  const { id: userId, name } = await getCurrentUserProfile();
  logAudit({
    tableName: "finance_movements",
    recordId: newId!,
    action: "INSERT",
    newValue: `${parsed.data.type} ${parsed.data.amount} — ${parsed.data.concept}`,
    userName: name,
    userId,
  }).catch(() => {});

  revalidatePath("/banco");
  revalidatePath("/efectivo");
  revalidatePath("/");
  redirect("/banco");
}

export async function updateMovimientoAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  const role = await getUserRole();
  const denied = requireRole(role, ROLES.FINANCE_WRITE, "Sin permisos para editar movimientos financieros.");
  if (denied) redirect(`/movimientos/${id}/editar?error=` + encodeURIComponent(denied.error));

  const parsed = movimientoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    redirect(`/movimientos/${id}/editar?error=` + encodeURIComponent(msg));
  }

  try {
    await updateFinanceMovement(id, parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo actualizar el movimiento.";
    redirect(`/movimientos/${id}/editar?error=` + encodeURIComponent(message));
  }

  const { id: userId, name } = await getCurrentUserProfile();
  logAudit({
    tableName: "finance_movements",
    recordId: id,
    action: "UPDATE",
    newValue: `${parsed.data.type} ${parsed.data.amount} — ${parsed.data.concept}`,
    userName: name,
    userId,
  }).catch(() => {});

  revalidatePath("/banco");
  revalidatePath("/efectivo");
  revalidatePath("/");
  redirect("/banco");
}

export async function deleteMovimientoAction(
  id: string,
  reason?: string
): Promise<{ error?: string }> {
  const role = await getUserRole();
  const denied = requireRole(role, ROLES.MANAGEMENT, "Sin permisos para eliminar movimientos financieros.");
  if (denied) return denied;

  const { id: userId, name } = await getCurrentUserProfile();

  try {
    await deleteFinanceMovement(id, name, reason);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo eliminar el movimiento." };
  }

  logAudit({
    tableName: "finance_movements",
    recordId: id,
    action: "DELETE",
    newValue: reason ?? "sin motivo",
    userName: name,
    userId,
  }).catch(() => {});

  revalidatePath("/banco");
  revalidatePath("/efectivo");
  revalidatePath("/");
  return {};
}
