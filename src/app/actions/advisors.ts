"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserRole } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const ADVISOR_ROLES = ["Captador", "Vendedor", "Asesor", "Gerente"] as const;
const ADVISOR_TIPOS = ["interno", "externo"] as const;

const advisorSchema = z.object({
  userId: z.string().uuid("Debes seleccionar un usuario válido."),
  role: z.enum(ADVISOR_ROLES, { message: "Rol inválido." }),
  tipo: z.enum(ADVISOR_TIPOS, { message: "Tipo inválido." }),
  phone: z.string().trim().optional(),
});

const advisorUpdateSchema = z.object({
  role: z.enum(ADVISOR_ROLES, { message: "Rol inválido." }),
  tipo: z.enum(ADVISOR_TIPOS, { message: "Tipo inválido." }),
  phone: z.string().trim().optional(),
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
    userId: formData.get("userId"),
    role: formData.get("role"),
    tipo: formData.get("tipo"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", parsed.data.userId)
    .single();

  if (!profile) return { error: "Usuario no encontrado." };

  const { data: existing } = await supabase
    .from("advisors")
    .select("id")
    .eq("user_id", parsed.data.userId)
    .maybeSingle();

  if (existing) return { error: "Este usuario ya tiene un asesor asignado." };

  const { error } = await supabase.from("advisors").insert({
    full_name: profile.full_name,
    email: profile.email,
    role: parsed.data.role,
    tipo: parsed.data.tipo,
    phone: parsed.data.phone || null,
    user_id: parsed.data.userId,
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

  const parsed = advisorUpdateSchema.safeParse({
    role: formData.get("role"),
    tipo: formData.get("tipo"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Supabase no configurado." };

  const { error } = await supabase
    .from("advisors")
    .update({
      role: parsed.data.role,
      tipo: parsed.data.tipo,
      phone: parsed.data.phone || null,
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

  // Check for pending commissions and active vehicle assignments in parallel
  const [commissionsRes, vehiclesRes] = await Promise.all([
    supabase
      .from("commissions")
      .select("id", { count: "exact", head: true })
      .eq("advisor_id", advisorId)
      .eq("status", "Pendiente"),
    supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .or(`advisor_buyer_id.eq.${advisorId},advisor_seller_id.eq.${advisorId}`)
      .not("status", "in", '("Vendido","Entregado")'),
  ]);

  const pendingCount = commissionsRes.count ?? 0;
  const activeVehicles = vehiclesRes.count ?? 0;

  if (pendingCount > 0) {
    return {
      error: `No se puede eliminar: el asesor tiene ${pendingCount} comisión(es) pendiente(s) de pago. Págalas primero o reasígnalas.`,
    };
  }

  if (activeVehicles > 0) {
    return {
      error: `No se puede eliminar: el asesor está asignado a ${activeVehicles} vehículo(s) activo(s) en inventario. Reasígnalos primero.`,
    };
  }

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
