"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient, getUserRole, getCurrentUserProfile } from "@/lib/supabase/server";
import { ROLES, requireRole } from "@/lib/security";
import { logAudit } from "@/lib/data/audit";
import type { UserRole } from "@/types/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Dueño",
  partner: "Socio",
  admin: "Administrador",
  gerente: "Gerente",
  advisor: "Asesor",
  accounting: "Contabilidad",
  viewer: "Solo lectura",
  inversionista: "Inversionista",
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

async function sendPasswordChangeEmail(
  to: string,
  name: string,
  dateTime: string,
  changedBy: string
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@autohaus.co";
  if (!resendKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: "Tu contraseña fue actualizada — Autohaus",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#111;color:#fff;padding:40px;border-radius:16px;">
          <h2 style="color:#D6A93D;margin:0 0 4px;">Autohaus</h2>
          <p style="color:#666;margin:0 0 32px;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Seguridad de cuenta</p>
          <p style="margin:0 0 8px;">Hola <strong>${name}</strong>,</p>
          <p style="color:#aaa;line-height:1.6;margin:0 0 24px;">
            Tu contraseña en el sistema administrativo de Autohaus fue actualizada.
          </p>
          <div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#888;">Detalles del cambio</p>
            <p style="margin:0 0 4px;font-size:14px;color:#eee;">📅 <strong>Fecha:</strong> ${dateTime}</p>
            <p style="margin:0;font-size:14px;color:#eee;">👤 <strong>Realizado por:</strong> ${changedBy}</p>
          </div>
          <p style="color:#666;font-size:12px;line-height:1.6;margin:0;">
            Si no reconoces este cambio, contacta inmediatamente al administrador del sistema.
          </p>
        </div>
      `,
    }),
  }).catch(() => {});
}

export async function changePasswordAction(
  userId: string,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const admin = getSupabaseAdminClient();
  if (!admin) return { error: "Servicio no disponible (falta SUPABASE_SERVICE_ROLE_KEY)." };

  const role = await getUserRole();
  if (!["owner", "partner", "admin", "gerente"].includes(role)) {
    return { error: "Sin permisos para cambiar contraseñas." };
  }

  const password = (formData.get("password") as string ?? "").trim();
  const confirm = (formData.get("confirmPassword") as string ?? "").trim();

  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { error: "La contraseña debe contener letras y números." };
  }
  if (password !== confirm) return { error: "Las contraseñas no coinciden." };

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, { password });
  if (updateError) return { error: updateError.message };

  // Send notification email and log asynchronously (non-blocking)
  const [{ name: changedByName }, targetRes] = await Promise.all([
    getCurrentUserProfile(),
    admin.from("profiles").select("email, full_name").eq("id", userId).single(),
  ]);
  const target = targetRes.data as { email: string; full_name: string | null } | null;
  if (target?.email) {
    const now = new Date().toLocaleString("es-CO", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Bogota",
    });
    sendPasswordChangeEmail(target.email, target.full_name ?? target.email, now, changedByName).catch(() => {});
  }

  return { success: true };
}

export async function inviteUserAction(formData: FormData) {
  const callerRole = await getUserRole();
  const guard = requireRole(callerRole, ROLES.ADMIN_ONLY, "Solo administradores pueden invitar usuarios.");
  if (guard) return guard;

  const email = (formData.get("email") as string)?.trim();
  const fullName = (formData.get("fullName") as string)?.trim();
  const role = (formData.get("role") as UserRole) ?? "viewer";
  if (!email) return { error: "El email es requerido." };
  if (!fullName) return { error: "El nombre es requerido." };

  // Only owner/partner can assign owner or partner roles
  if ((role === "owner" || role === "partner") && !ROLES.OWNER_ADMIN.includes(callerRole)) {
    return { error: "Solo el dueño o socio pueden asignar ese rol." };
  }

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

  // Upsert profile with desired role — id must match the auth user's UUID
  const userId = linkData.user?.id;
  if (userId) {
    await admin.from("profiles").upsert({
      id: userId,
      email,
      full_name: fullName,
      role,
      active: true,
    }, { onConflict: "id", ignoreDuplicates: false });
  }

  revalidatePath("/usuarios");
  revalidatePath("/asesores");
  // Always return the link so admin can share it manually if email fails
  return { success: true, emailSent, inviteLink: link };
}

export async function resendInviteAction(userId: string) {
  const callerRole = await getUserRole();
  const guard = requireRole(callerRole, ROLES.ADMIN_ONLY, "Solo administradores pueden reenviar invitaciones.");
  if (guard) return guard;

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
  const callerRole = await getUserRole();
  const guard = requireRole(callerRole, ROLES.ADMIN_ONLY, "Solo administradores pueden cambiar roles.");
  if (guard) return guard;

  if ((role === "owner" || role === "partner") && !ROLES.OWNER_ADMIN.includes(callerRole)) {
    return { error: "Solo el dueño o socio pueden asignar ese rol." };
  }

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { data: existing } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  const oldRole = (existing?.role as string | null) ?? "desconocido";

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: error.message };

  const { id: callerId, name: callerName } = await getCurrentUserProfile();
  logAudit({
    tableName: "profiles",
    recordId: userId,
    action: "UPDATE",
    fieldChanged: "role",
    oldValue: oldRole,
    newValue: role,
    userName: callerName,
    userId: callerId,
  }).catch(() => {});

  revalidatePath("/usuarios");
  return { success: true };
}

export async function toggleUserActiveAction(userId: string, active: boolean) {
  const callerRole = await getUserRole();
  const guard = requireRole(callerRole, ROLES.ADMIN_ONLY, "Solo administradores pueden activar o desactivar usuarios.");
  if (guard) return guard;

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase.from("profiles").update({ active }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  return { success: true };
}
