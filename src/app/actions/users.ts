"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Dueño",
  partner: "Socio",
  admin: "Administrador",
  gerente: "Gerente",
  advisor: "Asesor",
  accounting: "Contabilidad",
  viewer: "Solo lectura",
};

async function sendInviteEmail(to: string, name: string, link: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@autohaus.co";

  if (!resendKey) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: "Invitación al sistema Autohaus Admin",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#111;color:#fff;padding:40px;border-radius:16px;">
            <h2 style="color:#D6A93D;margin:0 0 4px;">Autohaus</h2>
            <p style="color:#666;margin:0 0 32px;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Sistema Administrativo</p>
            <p style="margin:0 0 8px;">Hola <strong>${name}</strong>,</p>
            <p style="color:#aaa;line-height:1.6;margin:0 0 28px;">
              Has sido invitado al sistema administrativo de Autohaus.<br/>
              Haz clic en el botón para crear tu contraseña y activar tu cuenta.
            </p>
            <a href="${link}"
              style="display:inline-block;background:#D6A93D;color:#000;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;">
              Crear contraseña →
            </a>
            <p style="color:#555;font-size:12px;margin-top:32px;line-height:1.6;">
              Este enlace es válido por <strong style="color:#888;">24 horas</strong>.<br/>
              Si no esperabas esta invitación, puedes ignorar este correo.
            </p>
          </div>
        `,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function inviteUserAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const fullName = (formData.get("fullName") as string)?.trim();
  const role = (formData.get("role") as UserRole) ?? "viewer";
  const advisorRole = (formData.get("advisorRole") as string)?.trim() || "Captador/Vendedor";
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!email) return { error: "El email es requerido." };
  if (!fullName) return { error: "El nombre es requerido." };

  const admin = getSupabaseAdminClient();
  if (!admin) return { error: "Servicio no disponible (falta SUPABASE_SERVICE_ROLE_KEY)." };

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const redirectTo = siteUrl ? `${siteUrl}/update-password` : undefined;

  // Generate invite link — creates the auth user and returns the link
  // We send the email ourselves via Resend for reliability (no Supabase SMTP limits)
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo, data: { full_name: fullName } },
  });

  if (linkError) {
    // If user already exists, try generating a recovery link instead
    if (linkError.message.includes("already been registered")) {
      return { error: "Este correo ya tiene una cuenta registrada." };
    }
    return { error: linkError.message };
  }

  const link = linkData?.properties?.action_link;
  if (!link) return { error: "No se pudo generar el link de invitación." };

  // Try to send via Resend — returns false if email not configured or fails
  const emailSent = await sendInviteEmail(email, fullName, link);

  // Upsert profile with desired role
  await admin.from("profiles").upsert({
    email,
    full_name: fullName,
    role,
    active: true,
  }, { onConflict: "email", ignoreDuplicates: false });

  // If advisor role, auto-create in advisors table
  if (role === "advisor") {
    const { data: existing } = await admin
      .from("advisors")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!existing) {
      await admin.from("advisors").insert({
        full_name: fullName,
        role: advisorRole,
        email,
        phone,
        active: true,
      });
    }
  }

  revalidatePath("/usuarios");
  revalidatePath("/asesores");
  // Always return the link so admin can share it manually if email fails
  return { success: true, emailSent, inviteLink: link };
}

export async function resendInviteAction(userId: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) return { error: "Servicio no disponible (falta SUPABASE_SERVICE_ROLE_KEY)." };

  const { data: profile } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (!profile?.email) return { error: "Usuario no encontrado." };

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

  const { data, error } = await admin.auth.admin.generateLink({
    type: "invite",
    email: profile.email,
    options: { redirectTo: siteUrl ? `${siteUrl}/update-password` : undefined },
  });

  if (error) return { error: error.message };

  const link = data?.properties?.action_link;
  let emailSent = false;
  if (link) {
    emailSent = await sendInviteEmail(profile.email, profile.full_name ?? profile.email, link);
  }

  revalidatePath("/usuarios");
  return { success: true, emailSent, inviteLink: link ?? null };
}

export async function updateUserRoleAction(userId: string, role: UserRole) {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  return { success: true };
}

export async function toggleUserActiveAction(userId: string, active: boolean) {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase.from("profiles").update({ active }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  return { success: true };
}
