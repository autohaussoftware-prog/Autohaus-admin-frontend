"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient, getUserRole } from "@/lib/supabase/server";

export async function resolveAlertAction(alertId: string): Promise<{ error?: string }> {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "gerente", "accounting", "advisor"].includes(role)) {
    return { error: "Sin permisos." };
  }

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase
    .from("alerts")
    .update({ status: "resuelta", updated_at: new Date().toISOString() })
    .eq("id", alertId)
    .eq("status", "abierta");

  if (error) return { error: error.message };

  revalidatePath("/alertas");
  revalidatePath("/");
  return {};
}
