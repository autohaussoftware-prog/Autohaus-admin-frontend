import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";

export type AppUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  confirmed: boolean;  // false = invite sent but user hasn't set password yet
  createdAt: string;
};

export async function getUsers(): Promise<AppUser[]> {
  const admin = getSupabaseAdminClient();
  const supabase = admin ?? (await getSupabaseServerClient());
  if (!supabase) return [];

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, active, created_at")
    .order("created_at", { ascending: true });

  if (error || !profiles) return [];

  // Use admin API to get confirmation status for each user
  let confirmedIds = new Set<string>();
  if (admin) {
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (authData?.users) {
      for (const u of authData.users) {
        if (u.email_confirmed_at) confirmedIds.add(u.id);
      }
    }
  }

  return profiles.map((p: any) => ({
    id: p.id,
    fullName: p.full_name ?? p.email,
    email: p.email,
    role: p.role as UserRole,
    active: p.active ?? true,
    confirmed: confirmedIds.size > 0 ? confirmedIds.has(p.id) : true,
    createdAt: p.created_at,
  }));
}
