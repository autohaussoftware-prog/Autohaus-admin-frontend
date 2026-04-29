import {
  AlertTriangle,
  BarChart3,
  Car,
  CircleDollarSign,
  ClipboardList,
  Landmark,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

export const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Inventario", href: "/inventario", icon: Car },
  { label: "Vehículos", href: "/vehiculos", icon: ClipboardList },
  { label: "Ventas", href: "/ventas", icon: CircleDollarSign },
  { label: "Comisiones", href: "/comisiones", icon: Users },
  { label: "Banco", href: "/banco", icon: Landmark },
  { label: "Efectivo", href: "/efectivo", icon: Wallet },
  { label: "Reportes", href: "/reportes", icon: BarChart3 },
  { label: "Alertas", href: "/alertas", icon: AlertTriangle },
  { label: "Usuarios", href: "/usuarios", icon: ShieldCheck },
  { label: "Configuración", href: "/configuracion", icon: Settings },
];
