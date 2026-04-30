"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createFinanceMovement } from "@/lib/data/finance";

const movimientoSchema = z.object({
  type: z.enum(["Ingreso", "Egreso"]),
  channel: z.enum(["Banco", "Efectivo ubicación 1", "Efectivo ubicación 2"]),
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
  const parsed = movimientoSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    redirect("/movimientos/nuevo?error=" + encodeURIComponent(msg));
  }

  try {
    await createFinanceMovement(parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo registrar el movimiento.";
    redirect("/movimientos/nuevo?error=" + encodeURIComponent(message));
  }

  revalidatePath("/banco");
  revalidatePath("/efectivo");
  revalidatePath("/");
  redirect("/banco");
}
