import {
  AlertTriangle,
  BarChart3,
  Car,
  CircleDollarSign,
  ClipboardList,
  HandCoins,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import type { UserRole } from "@/types/auth";

export type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
};

const ALL: UserRole[] = ["owner", "partner", "admin", "gerente", "advisor", "accounting", "viewer"];
const FINANCE: UserRole[] = ["owner", "partner", "admin", "gerente", "accounting"];
const SALES_AND_UP: UserRole[] = ["owner", "partner", "admin", "gerente", "accounting"];
const ADVISOR_AND_UP: UserRole[] = ["owner", "partner", "admin", "gerente", "advisor", "accounting"];
const ADMIN_ONLY: UserRole[] = ["owner", "admin"];
const MGMT: UserRole[] = ["owner", "partner", "admin", "gerente"];

export const navItems: NavItem[] = [
  { label: "Dashboard",      href: "/",              icon: LayoutDashboard,  roles: ADVISOR_AND_UP },
  { label: "Vehículos",      href: "/vehiculos",     icon: Car,              roles: ALL },
  { label: "Ventas",         href: "/ventas",        icon: CircleDollarSign, roles: [...ADVISOR_AND_UP] },
  { label: "Clientes",       href: "/clientes",      icon: Users,            roles: SALES_AND_UP },
  { label: "Traspasos",      href: "/traspasos",     icon: ClipboardList,    roles: ADVISOR_AND_UP },
  { label: "Comisiones",     href: "/comisiones",    icon: HandCoins,        roles: FINANCE },
  { label: "Asesores",       href: "/asesores",      icon: Users,            roles: FINANCE },
  { label: "Banco",          href: "/banco",         icon: Landmark,         roles: FINANCE },
  { label: "Efectivo",       href: "/efectivo",      icon: Wallet,           roles: FINANCE },
  { label: "Reportes",       href: "/reportes",      icon: BarChart3,        roles: FINANCE },
  { label: "Alertas",        href: "/alertas",       icon: AlertTriangle,    roles: FINANCE },
  { label: "Usuarios",       href: "/usuarios",      icon: KeyRound,         roles: MGMT },
  { label: "Configuración",  href: "/configuracion", icon: Settings,         roles: ADMIN_ONLY },
];
