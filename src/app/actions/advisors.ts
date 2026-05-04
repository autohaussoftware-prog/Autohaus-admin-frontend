"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserRole } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ADVISOR_ROLES = ["Captador", "Vendedor", "Captador/Vendedor", "Aliado"] as const;

const advisorSchema = z.object({
  fullName: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  role: z.enum(ADVISOR_ROLES),
  phone: z.string().trim().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

async function assertManageRole() {
  const role = await getUserRole();
  if (!["owner", "partner", "admin", "gerente"].includes(role)) return "Sin permisos.";
  return null;
}

export async function createAdvisorAction(formData: FormData): Promise<{ error?: string }> {
  const err = await assertManageRole();
  if (err) return { error: err };

  const parsed = advisorSchema.safeParse({
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase.from("advisors").insert({
    full_name: parsed.data.fullName,
    role: parsed.data.role,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    active: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/asesores");
  revalidatePath("/comisiones");
  return {};
}

export async function updateAdvisorAction(
  advisorId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const err = await assertManageRole();
  if (err) return { error: err };

  const parsed = advisorSchema.safeParse({
    fullName: formData.get("fullName"),
    role: formData.get("role"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase
    .from("advisors")
    .update({
      full_name: parsed.data.fullName,
      role: parsed.data.role,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
    })
    .eq("id", advisorId);

  if (error) return { error: error.message };
  revalidatePath("/asesores");
  revalidatePath("/comisiones");
  return {};
}

export async function deleteAdvisorAction(advisorId: string): Promise<{ error?: string }> {
  const err = await assertManageRole();
  if (err) return { error: err };

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase.from("advisors").delete().eq("id", advisorId);
  if (error) return { error: error.message };
  revalidatePath("/asesores");
  revalidatePath("/comisiones");
  return {};
}

export async function toggleAdvisorActiveAction(advisorId: string, active: boolean): Promise<{ error?: string }> {
  const err = await assertManageRole();
  if (err) return { error: err };

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase.from("advisors").update({ active }).eq("id", advisorId);
  if (error) return { error: error.message };
  revalidatePath("/asesores");
  revalidatePath("/comisiones");
  return {};
}
