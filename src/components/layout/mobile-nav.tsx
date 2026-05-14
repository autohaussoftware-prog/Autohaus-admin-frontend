"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, CircleDollarSign, Inbox, Landmark, LayoutDashboard, UserCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

type MobileNavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
};

const ALL_ROLES: UserRole[] = ["owner", "partner", "admin", "gerente", "advisor", "accounting", "viewer"];
const FINANCE_ROLES: UserRole[] = ["owner", "partner", "admin", "gerente", "accounting"];
const ADVISOR_AND_UP: UserRole[] = ["owner", "partner", "admin", "gerente", "advisor", "accounting"];

const NAV_ITEMS: MobileNavItem[] = [
  { label: "Inicio",      href: "/",         icon: LayoutDashboard,  roles: ADVISOR_AND_UP },
  { label: "Inventario",  href: "/vehiculos", icon: Car,              roles: ALL_ROLES },
  { label: "Ventas",      href: "/ventas",    icon: CircleDollarSign, roles: ADVISOR_AND_UP },
  { label: "Pedidos",     href: "/pedidos",   icon: Inbox,            roles: ADVISOR_AND_UP },
  { label: "Banco",       href: "/banco",     icon: Landmark,         roles: FINANCE_ROLES },
  { label: "Efectivo",    href: "/efectivo",  icon: Wallet,           roles: FINANCE_ROLES },
  { label: "Perfil",      href: "/perfil",    icon: UserCircle,       roles: [...ALL_ROLES, "inversionista"] as UserRole[] },
];

export function MobileNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const visible = NAV_ITEMS.filter((item) => item.roles.includes(role)).slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-[rgba(255,255,255,0.06)] bg-[#070707]/95 backdrop-blur-md">
      <div className="flex items-center justify-around px-1 py-2 safe-bottom">
        {visible.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors",
                isActive ? "text-[#D4A843]" : "text-zinc-500 active:text-zinc-300"
              )}
            >
              <Icon className="h-[22px] w-[22px]" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
