"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 border-r border-zinc-900 bg-[#050505] px-4 py-5 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
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

      <nav className="space-y-1">
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

      <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#D6A93D]/20 text-sm font-bold text-[#D6A93D]">
            D
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">Dueño principal</p>
            <p className="text-xs text-zinc-500">Acceso completo</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <p className="text-xs text-zinc-500">Sesión activa</p>
        </div>
      </div>
    </aside>
  );
}
