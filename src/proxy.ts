import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { canAccessRoute } from "@/lib/permissions";
import type { UserRole } from "@/types/auth";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sin Supabase configurado (dev local): dejar pasar todo
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
  const isLoginPage = pathname === "/login";

  // 1. Sin sesión → login
  if (!user && !isLoginPage) {
    const dest = request.nextUrl.clone();
    dest.pathname = "/login";
    return NextResponse.redirect(dest);
  }

  // 2. Con sesión en /login → dashboard
  if (user && isLoginPage) {
    const dest = request.nextUrl.clone();
    dest.pathname = "/";
    return NextResponse.redirect(dest);
  }

  // 3. Verificar permisos por rol
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role: UserRole = (profile?.role as UserRole) ?? "viewer";

    if (!canAccessRoute(role, pathname)) {
      const dest = request.nextUrl.clone();
      // Redirigir al inicio de su área
      dest.pathname = role === "advisor" ? "/inventario" : "/";
      dest.searchParams.set("acceso", "denegado");
      return NextResponse.redirect(dest);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.*\\.jpg|.*\\.png).*)"],
};
