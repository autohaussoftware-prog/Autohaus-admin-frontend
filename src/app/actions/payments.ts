"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createPayment } from "@/lib/data/payments";
import { getCurrentUserName, getUserRole } from "@/lib/supabase/server";

const paymentSchema = z.object({
  saleId: z.string().uuid(),
  amount: z.preprocess((v) => Number(v), z.number().positive("El monto debe ser mayor a cero")),
  date: z.string().min(1),
  channel: z.enum(["Banco", "Efectivo ubicación 1", "Efectivo ubicación 2"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export async function createPaymentAction(formData: FormData) {
  const role = await getUserRole();
  if (role === "viewer") return { error: "Sin permisos para registrar pagos." };

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
