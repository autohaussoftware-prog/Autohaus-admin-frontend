import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getSupabaseServerClient() {
  if (!hasSupabaseConfig()) return null;
  return createClient();
}

export type { UserRole } from "@/types/auth";
import type { UserRole } from "@/types/auth";

export async function getUserRole(): Promise<UserRole> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return "owner";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "viewer";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (profile?.role as UserRole) ?? "viewer";
}

export async function getCurrentUserName(): Promise<string> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return "Sistema";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "Sistema";

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  return profile?.full_name || profile?.email || user.email || "Usuario";
}

export async function getCurrentUserProfile(): Promise<{ name: string; role: UserRole }> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { name: "Sistema", role: "owner" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { name: "Sistema", role: "viewer" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  return {
    name: profile?.full_name || profile?.email || user.email || "Usuario",
    role: (profile?.role as UserRole) ?? "viewer",
  };
}
