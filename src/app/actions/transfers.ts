"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createTransfer, updateTransferStatus } from "@/lib/data/transfers";
import { getUserRole } from "@/lib/supabase/server";

const transferSchema = z.object({
  vehicleId: z.string().uuid(),
  fromOwner: z.string().trim().optional(),
  toOwner: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function createTransferAction(formData: FormData) {
  const role = await getUserRole();
  if (!["owner", "partner", "admin"].includes(role)) {
    return { error: "Sin permisos para registrar traspasos." };
  }

  const parsed = transferSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  try {
    await createTransfer(parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error registrando traspaso." };
  }

  revalidatePath("/traspasos");
  return { success: true };
}

export async function updateTransferStatusAction(transferId: string, status: string) {
  const role = await getUserRole();
  if (!["owner", "partner", "admin"].includes(role)) {
    return { error: "Sin permisos para actualizar traspasos." };
  }

  try {
    await updateTransferStatus(transferId, status);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error actualizando traspaso." };
  }

  revalidatePath("/traspasos");
  return { success: true };
}
