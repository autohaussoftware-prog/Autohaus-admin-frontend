import type { UserRole } from "@/types/auth";

const FINANCE: UserRole[] = ["owner", "partner", "admin", "gerente", "accounting"];
const MGMT: UserRole[] = ["owner", "partner", "admin", "gerente"];

const ROUTE_PERMISSIONS: { prefix: string; allowed: UserRole[] }[] = [
  { prefix: "/vehiculos/nuevo",  allowed: ["owner", "partner", "admin", "gerente", "advisor", "accounting"] },
  { prefix: "/vehiculos",        allowed: ["owner", "partner", "admin", "gerente", "advisor", "accounting", "viewer"] },
  { prefix: "/configuracion",    allowed: ["owner", "admin"] },
  { prefix: "/usuarios",         allowed: [...MGMT] },
  { prefix: "/reportes",         allowed: [...FINANCE] },
  { prefix: "/banco",            allowed: [...FINANCE] },
  { prefix: "/efectivo",         allowed: [...FINANCE] },
  { prefix: "/movimientos",      allowed: [...FINANCE] },
  { prefix: "/comisiones",       allowed: [...FINANCE] },
  { prefix: "/alertas",          allowed: [...FINANCE] },
  { prefix: "/asesores",         allowed: [...FINANCE] },
  { prefix: "/ventas",           allowed: ["owner", "partner", "admin", "gerente", "advisor", "accounting"] },
  { prefix: "/clientes",         allowed: [...FINANCE] },
  { prefix: "/traspasos",        allowed: ["owner", "partner", "admin", "gerente", "advisor", "accounting"] },
  { prefix: "/mis-inversiones",  allowed: ["inversionista", "owner", "admin"] },
];

const EDIT_VEHICLE_ROLES: UserRole[] = ["owner", "partner", "admin", "gerente", "accounting"];

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

export function getDefaultRedirect(role: UserRole): string {
  if (role === "inversionista") return "/mis-inversiones";
  if (role === "advisor" || role === "viewer") return "/vehiculos";
  return "/";
}

// Links visibles en el sidebar por rol
export function isNavItemVisible(role: UserRole, href: string): boolean {
  return canAccessRoute(role, href);
}
