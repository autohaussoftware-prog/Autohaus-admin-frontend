import type { UserRole } from "@/types/auth";

// Rutas que requieren roles específicos (orden importa: más específico primero).
// Si una ruta no está aquí, todos los usuarios autenticados pueden acceder.
const ROUTE_PERMISSIONS: { prefix: string; allowed: UserRole[] }[] = [
  // Editar vehículo: no permitido a asesores
  { prefix: "/vehiculos/nuevo",         allowed: ["owner", "partner", "admin", "advisor", "accounting"] },
  { prefix: "/vehiculos",               allowed: ["owner", "partner", "admin", "advisor", "accounting", "viewer"] },
  // Rutas de administración y finanzas: solo roles superiores
  { prefix: "/configuracion",           allowed: ["owner", "admin"] },
  { prefix: "/usuarios",                allowed: ["owner", "partner", "admin"] },
  { prefix: "/reportes",                allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/banco",                   allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/efectivo",                allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/movimientos",             allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/comisiones",              allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/alertas",                 allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/asesores",                allowed: ["owner", "partner", "admin", "accounting"] },
  // Ventas, clientes, traspasos: no asesores
  { prefix: "/ventas",                  allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/clientes",                allowed: ["owner", "partner", "admin", "accounting"] },
  { prefix: "/traspasos",               allowed: ["owner", "partner", "admin", "accounting"] },
];

const EDIT_VEHICLE_ROLES: UserRole[] = ["owner", "partner", "admin", "accounting"];

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  // Editar vehículo: ruta dinámica /vehiculos/[id]/editar — solo roles superiores
  if (/^\/vehiculos\/[^/]+\/editar(\/|$)/.test(pathname)) {
    return EDIT_VEHICLE_ROLES.includes(role);
  }

  // Buscar la regla más específica que coincida con el pathname
  for (const { prefix, allowed } of ROUTE_PERMISSIONS) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return allowed.includes(role);
    }
  }
  return true;
}

// Ruta de fallback para redirigir a usuarios con acceso denegado
export function getDefaultRedirect(role: UserRole): string {
  if (role === "advisor" || role === "viewer") return "/vehiculos";
  return "/";
}

// Links visibles en el sidebar por rol
export function isNavItemVisible(role: UserRole, href: string): boolean {
  return canAccessRoute(role, href);
}
