"use server";

import { revalidatePath } from "next/cache";
import { updateTraspasoStatus, type TraspasoStatus } from "@/lib/data/traspasos";
import { getUserRole } from "@/lib/supabase/server";

const ALLOWED: TraspasoStatus[] = ["en_proceso", "pendiente", "completado", "cancelado"];

export async function updateTraspasoStatusAction(
  traspasoId: string,
  status: string,
  saleId?: string
): Promise<{ error?: string }> {
  const role = await getUserRole();
  if (role === "viewer") return { error: "Sin permisos para actualizar traspasos." };
  if (!ALLOWED.includes(status as TraspasoStatus)) return { error: "Estado inválido." };

  try {
    await updateTraspasoStatus(traspasoId, status as TraspasoStatus);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error actualizando traspaso." };
  }

  revalidatePath("/traspasos");
  if (saleId) revalidatePath(`/ventas/${saleId}`);
  return {};
}
