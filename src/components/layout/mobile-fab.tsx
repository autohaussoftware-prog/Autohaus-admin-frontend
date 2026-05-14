"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, CircleDollarSign, Landmark, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

type FabAction = { label: string; href: string; icon: React.ElementType; roles: UserRole[] };

const ADVISOR_AND_UP: UserRole[] = ["owner", "partner", "admin", "gerente", "advisor", "accounting"];
const FINANCE_ROLES: UserRole[] = ["owner", "partner", "admin", "gerente", "accounting"];

const ACTIONS: FabAction[] = [
  { label: "Nuevo vehículo",    href: "/vehiculos/nuevo",    icon: Car,              roles: ADVISOR_AND_UP },
  { label: "Nueva venta",       href: "/ventas/nueva",       icon: CircleDollarSign, roles: ADVISOR_AND_UP },
  { label: "Nuevo movimiento",  href: "/movimientos/nuevo",  icon: Landmark,         roles: FINANCE_ROLES },
];

export function MobileFab({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false);
  const visible = ACTIONS.filter((a) => a.roles.includes(role));

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-[76px] right-4 z-50 lg:hidden">
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
          aria-label="Cerrar"
        />
      )}

      {open && (
        <div className="absolute bottom-16 right-0 z-50 flex flex-col-reverse gap-3">
          {visible.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-zinc-700/80 bg-zinc-900 py-3 pl-4 pr-5 shadow-2xl whitespace-nowrap"
              >
                <div className="rounded-xl border border-[#D4A843]/30 bg-[#D4A843]/10 p-2">
                  <Icon className="h-4 w-4 text-[#D4A843]" />
                </div>
                <span className="text-sm font-medium text-white">{action.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl transition-all duration-200",
          open ? "bg-zinc-800 text-white" : "bg-[#D4A843] text-black"
        )}
        aria-label={open ? "Cerrar acciones" : "Acciones rápidas"}
      >
        {open
          ? <X className="h-5 w-5 transition-transform" />
          : <Plus className="h-6 w-6" />}
      </button>
    </div>
  );
}
