"use client";

import { toggleAdvisorActiveAction } from "@/app/actions/advisors";
import { ToggleActiveButton } from "@/components/shared/toggle-active-button";
import { Badge } from "@/components/ui/badge";

type Advisor = {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  active: boolean;
};

export function AdvisorsList({ advisors, canManage }: { advisors: Advisor[]; canManage: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-zinc-900 bg-zinc-950/60 text-xs uppercase tracking-[0.18em] text-zinc-500">
          <tr>
            <th className="px-5 py-4 font-medium">Nombre</th>
            <th className="px-5 py-4 font-medium">Rol</th>
            <th className="px-5 py-4 font-medium">Teléfono</th>
            <th className="px-5 py-4 font-medium">Email</th>
            <th className="px-5 py-4 font-medium">Estado</th>
            {canManage && <th className="px-5 py-4 font-medium" />}
          </tr>
        </thead>
        <tbody>
          {advisors.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-sm text-zinc-500">
                Sin asesores registrados.
              </td>
            </tr>
          ) : (
            advisors.map((a) => (
              <tr key={a.id} className={`border-b border-zinc-900/80 hover:bg-zinc-950/70 ${!a.active ? "opacity-50" : ""}`}>
                <td className="px-5 py-4 font-medium text-white">{a.name}</td>
                <td className="px-5 py-4 text-zinc-400">{a.role}</td>
                <td className="px-5 py-4 text-zinc-400">{a.phone ?? "—"}</td>
                <td className="px-5 py-4 text-zinc-400">{a.email ?? "—"}</td>
                <td className="px-5 py-4">
                  <Badge tone={a.active ? "green" : "neutral"}>{a.active ? "Activo" : "Inactivo"}</Badge>
                </td>
                {canManage && (
                  <td className="px-5 py-4">
                    <ToggleActiveButton
                      id={a.id}
                      active={a.active}
                      name={a.name}
                      onToggle={toggleAdvisorActiveAction}
                    />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
