"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createOrder } from "@/lib/data/orders";
import { getCurrentUserProfile } from "@/lib/supabase/server";

const orderSchema = z.object({
  brand: z.string().trim().min(1, "La marca es obligatoria."),
  year: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number({ message: "El modelo (año) es obligatorio." }).int().min(1990).max(2030)
  ),
  line: z.string().trim().min(1, "La línea es obligatoria."),
  budget: z.string().trim().min(1, "El presupuesto es obligatorio."),
  paymentMethod: z.string().trim().min(1, "La forma de pago es obligatoria."),
  colorPreference: z.string().trim().min(1, "El color de preferencia es obligatorio."),
  observations: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().optional()
  ).optional(),
  customerName: z.string().trim().min(2, "El nombre del cliente es obligatorio."),
  customerPhone: z.string().trim().regex(/^\d{7,15}$/, "El celular debe contener solo dígitos (7–15)."),
});

type ActionState = { error: string | null; attempt: number; values?: Record<string, string> };

export async function createOrderAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => !(v instanceof File))
  ) as Record<string, string>;

  const parsed = orderSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los campos obligatorios.",
      attempt: _prev.attempt + 1,
      values: rawData,
    };
  }

  const profile = await getCurrentUserProfile();

  try {
    await createOrder({ ...parsed.data, createdByUserId: profile.id });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo crear el pedido.",
      attempt: _prev.attempt + 1,
      values: rawData,
    };
  }

  revalidatePath("/pedidos");
  redirect("/pedidos");
}
