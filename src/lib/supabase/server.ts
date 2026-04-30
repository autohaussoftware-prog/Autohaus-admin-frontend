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

export type UserRole = "owner" | "partner" | "admin" | "advisor" | "accounting" | "viewer";

export async function getUserRole(): Promise<UserRole> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return "owner"; // dev fallback: full access when no Supabase

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "viewer";

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (profile?.role as UserRole) ?? "viewer";
}
