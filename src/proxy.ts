import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessRoute, getDefaultRedirect } from "@/lib/permissions";
import type { UserRole } from "@/types/auth";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return supabaseResponse;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  const PUBLIC_PATHS = ["/login", "/update-password"];
  if (!user) {
    if (!PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return supabaseResponse;
  }

  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Role is synced to app_metadata by the sync_role_to_jwt trigger (phase14).
  // Avoids a DB round-trip on every request. Server Actions re-query the DB
  // for security-critical role checks, so stale JWT claims are acceptable here.
  const role: UserRole = (user.app_metadata?.user_role as UserRole) ?? "viewer";

  if (!canAccessRoute(role, pathname)) {
    return NextResponse.redirect(new URL(getDefaultRedirect(role), request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",],
};
