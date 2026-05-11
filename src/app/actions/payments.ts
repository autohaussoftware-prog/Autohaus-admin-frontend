"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createPayment } from "@/lib/data/payments";
import { getCurrentUserName, getUserRole } from "@/lib/supabase/server";
import { ROLES, requireRole } from "@/lib/security";

const paymentSchema = z.object({
  saleId: z.string().uuid(),
  amount: z.preprocess((v) => Number(v), z.number().positive("El monto debe ser mayor a cero")),
  date: z.string().min(1),
  channel: z.string().min(1, "Selecciona un canal de pago."),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export async function createPaymentAction(formData: FormData) {
  const role = await getUserRole();
  const denied = requireRole(role, ROLES.FINANCE_WRITE, "Sin permisos para registrar pagos.");
  if (denied) return denied;

  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const userName = await getCurrentUserName();

  try {
    await createPayment({ ...parsed.data, registeredBy: userName });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error registrando pago." };
  }

  revalidatePath("/ventas");
  return { success: true };
}
