"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient, getCurrentUserProfile } from "@/lib/supabase/server";

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  phone: z.string().trim().regex(/^\d{7,15}$/, "El celular debe contener solo dígitos (7–15)."),
});

export type ProfileActionState = {
  error: string | null;
  success?: boolean;
  attempt: number;
};

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const rawData = {
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
  };

  const parsed = profileSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los campos.",
      attempt: _prev.attempt + 1,
    };
  }

  const { data: { user } } = await (await getSupabaseServerClient())!.auth.getUser();
  if (!user) return { error: "No autenticado.", attempt: _prev.attempt + 1 };

  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) return { error: "Error de conexión.", attempt: _prev.attempt + 1 };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone })
    .eq("id", user.id);

  if (error) return { error: error.message, attempt: _prev.attempt + 1 };

  revalidatePath("/perfil");
  return { error: null, success: true, attempt: _prev.attempt + 1 };
}

const passwordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export async function updatePasswordAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const rawData = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = passwordSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los campos.",
      attempt: _prev.attempt + 1,
    };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { error: "Error de conexión.", attempt: _prev.attempt + 1 };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message, attempt: _prev.attempt + 1 };

  return { error: null, success: true, attempt: _prev.attempt + 1 };
}
