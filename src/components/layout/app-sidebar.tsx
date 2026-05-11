"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { navItems } from "./nav-items";
import type { UserRole } from "@/types/auth";

export function AppSidebar({
  open,
  onClose,
  role,
}: {
  open: boolean;
  onClose: () => void;
  role: UserRole;
}) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  const FINANCE_ROLES: UserRole[] = ["owner", "partner", "admin", "accounting"];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col",
        "border-r border-[rgba(255,255,255,0.06)] bg-[#070707]",
        "px-3 py-4",
        "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
      aria-label="Navegación principal"
    >
      {/* Logo */}
      <div className="mb-5 flex items-center justify-between px-2">
        <Link href="/" onClick={onClose} className="flex items-center gap-3">
          <Image
            src="/logo-ah.jpeg"
            alt="AH"
            width={40}
            height={40}
            className="h-9 w-9 object-cover [mix-blend-mode:screen]"
            priority
          />
          <span className="text-sm font-bold tracking-[0.18em] uppercase text-white">Autohaus</span>
        </Link>
        <button
          className="rounded-lg p-1 text-zinc-500 hover:text-white transition-colors lg:hidden"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto no-scrollbar">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "nav-active"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="mt-3 space-y-0.5 border-t border-[rgba(255,255,255,0.05)] pt-3">
        {FINANCE_ROLES.includes(role) && (
          <Link
            href="/movimientos/nuevo"
            onClick={onClose}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
              "text-[#D4A843] hover:bg-[rgba(212,168,67,0.08)] hover:text-[#E8BC55]"
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Registrar movimiento</span>
          </Link>
        )}

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition-all duration-150 hover:bg-white/[0.04] hover:text-zinc-300"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
