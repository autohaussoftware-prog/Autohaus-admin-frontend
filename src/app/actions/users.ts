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

export async function resendInviteAction(userId: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) return { error: "Servicio no disponible (falta SUPABASE_SERVICE_ROLE_KEY)." };

  // Get the user's email from profiles
  const { data: profile } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (!profile?.email) return { error: "Usuario no encontrado." };

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

  // Generate a new password recovery link (works for pending invites too)
  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email: profile.email,
    options: {
      redirectTo: siteUrl ? `${siteUrl}/update-password` : undefined,
    },
  });

  if (error) return { error: error.message };

  // Send via Resend if configured, otherwise let Supabase default handle it
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@autohaus.co";
  const link = data?.properties?.action_link;

  if (resendKey && link) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: profile.email,
        subject: "Tu invitación a Autohaus Admin",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#111;color:#fff;padding:32px;border-radius:16px;">
            <h2 style="color:#D6A93D;margin-bottom:8px;">Autohaus Admin</h2>
            <p style="color:#aaa;margin-bottom:24px;">Sistema administrativo</p>
            <p>Hola <strong>${profile.full_name ?? profile.email}</strong>,</p>
            <p>Has sido invitado al sistema administrativo de Autohaus. Haz clic en el botón para crear tu contraseña y activar tu cuenta.</p>
            <a href="${link}" style="display:inline-block;margin:24px 0;background:#D6A93D;color:#000;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
              Crear contraseña
            </a>
            <p style="color:#666;font-size:13px;">Este enlace expira en 24 horas. Si no esperabas esta invitación, ignora este correo.</p>
          </div>
        `,
      }),
    });
  }

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
