"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createFinanceMovement, deleteFinanceMovement } from "@/lib/data/finance";
import { getCurrentUserProfile, getUserRole } from "@/lib/supabase/server";

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

export async function deleteMovimientoAction(
  id: string,
  reason?: string
): Promise<{ error?: string }> {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "gerente"].includes(role)) {
    return { error: "Sin permisos para eliminar movimientos financieros." };
  }

  const { name } = await getCurrentUserProfile();

  try {
    await deleteFinanceMovement(id, name, reason);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "No se pudo eliminar el movimiento." };
  }

  revalidatePath("/banco");
  revalidatePath("/efectivo");
  revalidatePath("/");
  return {};
}
