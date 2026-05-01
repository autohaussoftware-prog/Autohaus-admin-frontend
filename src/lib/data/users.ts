import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";

export type AppUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

export async function getUsers(): Promise<AppUser[]> {
  const supabase = getSupabaseAdminClient() ?? (await getSupabaseServerClient());
  if (!supabase) {
    return [
      { id: "1", fullName: "Dueño principal", email: "dueno@autohaus.co", role: "owner", active: true, createdAt: new Date().toISOString() },
      { id: "2", fullName: "Administrador", email: "admin@autohaus.co", role: "admin", active: true, createdAt: new Date().toISOString() },
    ];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, active, created_at")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((p) => ({
    id: p.id,
    fullName: p.full_name ?? p.email,
    email: p.email,
    role: p.role as UserRole,
    active: p.active ?? true,
    createdAt: p.created_at,
  }));
}
