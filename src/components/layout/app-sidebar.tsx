"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { navItems } from "./nav-items";

export function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-900 bg-[#050505] px-4 py-5 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
      aria-label="Navegación principal"
    >
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" onClick={onClose} className="flex items-center">
          <Image
            src="/logo-full.jpg"
            alt="Autohaus"
            width={220}
            height={110}
            className="h-24 w-auto object-contain"
            priority
          />
        </Link>
        <button className="text-zinc-400 lg:hidden" onClick={onClose} aria-label="Cerrar menú">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                isActive
                  ? "bg-white text-black shadow-lg shadow-[#D6A93D]/10"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-2">
        <Link
          href="/movimientos/nuevo"
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-2xl bg-[#D6A93D]/10 px-3 py-2.5 text-sm text-[#D6A93D] transition hover:bg-[#D6A93D]/20"
        >
          <span className="text-lg leading-none">+</span>
          <span>Registrar movimiento</span>
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
