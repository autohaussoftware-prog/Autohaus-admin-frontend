"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";

export async function inviteUserAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const fullName = (formData.get("fullName") as string)?.trim();
  const role = (formData.get("role") as UserRole) ?? "viewer";
  const advisorRole = (formData.get("advisorRole") as string)?.trim() || "Captador/Vendedor";
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!email) return { error: "El email es requerido." };

  const admin = getSupabaseAdminClient();
  if (!admin) return { error: "Servicio de invitación no disponible (falta SUPABASE_SERVICE_ROLE_KEY)." };

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const { data: inviteData, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
    redirectTo: siteUrl ? `${siteUrl}/update-password` : undefined,
  });

  if (error) return { error: error.message };

  const name = fullName || email.split("@")[0];

  // Upsert profile with desired role
  await admin.from("profiles").upsert({
    email,
    full_name: name,
    role,
    active: true,
  }, { onConflict: "email", ignoreDuplicates: false });

  // If advisor role, auto-create their advisor record so they appear in /asesores
  if (role === "advisor") {
    const { data: existing } = await admin
      .from("advisors")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!existing) {
      await admin.from("advisors").insert({
        full_name: name,
        role: advisorRole,
        email,
        phone,
        active: true,
      });
    }
  }

  revalidatePath("/usuarios");
  revalidatePath("/asesores");
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
