"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";

export async function inviteUserAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const fullName = (formData.get("fullName") as string)?.trim();
  const role = (formData.get("role") as UserRole) ?? "viewer";

  if (!email) return { error: "El email es requerido." };

  const admin = getSupabaseAdminClient();
  if (!admin) return { error: "Servicio de invitación no disponible (falta SUPABASE_SERVICE_ROLE_KEY)." };

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  });

  if (error) return { error: error.message };

  // Pre-insert profile with the desired role so when trigger fires it's already there
  await admin.from("profiles").upsert({
    email,
    full_name: fullName || email.split("@")[0],
    role,
    active: true,
  }, { onConflict: "email", ignoreDuplicates: false });

  revalidatePath("/usuarios");
  return { success: true };
}

export async function updateUserRoleAction(userId: string, role: UserRole) {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  return { success: true };
}

export async function toggleUserActiveAction(userId: string, active: boolean) {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase
    .from("profiles")
    .update({ active })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  return { success: true };
}
