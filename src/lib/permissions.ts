import type { UserRole } from "@/types/auth";

// Rutas que requieren roles específicos.
// Si una ruta no está aquí, todos los usuarios autenticados pueden acceder.
const ROUTE_PERMISSIONS: { prefix: string; allowed: UserRole[] }[] = [
  { prefix: "/configuracion", allowed: ["owner", "admin"] },
  { prefix: "/usuarios",      allowed: ["owner", "partner", "admin"] },
  { prefix: "/reportes",      allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/banco",         allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/efectivo",      allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/movimientos",   allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/comisiones",    allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/alertas",       allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/ventas",        allowed: ["owner", "partner", "admin", "advisor", "accounting"] },
];

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  for (const { prefix, allowed } of ROUTE_PERMISSIONS) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return allowed.includes(role);
    }
  }
  return true;
}

// Links visibles en el sidebar por rol
export function isNavItemVisible(role: UserRole, href: string): boolean {
  return canAccessRoute(role, href);
}
