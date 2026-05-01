"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/server";

export async function updateSettingAction(key: string, value: string) {
  const role = await getUserRole();
  if (!["owner", "admin"].includes(role)) return { error: "Sin permisos para editar configuración." };

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase
    .from("app_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) return { error: error.message };

  revalidatePath("/configuracion");
  return { success: true };
}
