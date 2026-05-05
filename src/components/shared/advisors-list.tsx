"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { toggleAdvisorActiveAction, updateAdvisorAction, deleteAdvisorAction } from "@/app/actions/advisors";
import { ToggleActiveButton } from "@/components/shared/toggle-active-button";
import { Badge } from "@/components/ui/badge";

type Advisor = {
  id: string;
  name: string;
  role: string;
  tipo: string;
  phone: string | null;
  email: string | null;
  active: boolean;
};

const ADVISOR_ROLES = ["Captador", "Vendedor", "Asesor", "Gerente"] as const;
const ADVISOR_TIPOS = ["interno", "externo"] as const;

function EditRow({ advisor, onDone }: { advisor: Advisor; onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateAdvisorAction(advisor.id, formData);
      if (result?.error) setError(result.error);
      else onDone();
    });
  }

  return (
    <tr className="border-b border-zinc-900/80 bg-zinc-900/40">
      <td colSpan={7} className="px-5 py-4">
        <form action={handleSubmit} className="grid gap-3 sm:grid-cols-4">
          <select
            name="role"
            defaultValue={advisor.role}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
          >
            {ADVISOR_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            name="tipo"
            defaultValue={advisor.tipo}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
          >
            {ADVISOR_TIPOS.map((t) => <option key={t} value={t}>{t === "interno" ? "Interno" : "Externo"}</option>)}
          </select>
          <input
            name="phone"
            defaultValue={advisor.phone ?? ""}
            placeholder="Teléfono"
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
          />
          {error && <p className="col-span-4 text-xs text-red-400">{error}</p>}
          <div className="col-span-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onDone}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-1.5 rounded-xl bg-[#D6A93D] px-3 py-1.5 text-sm font-medium text-black hover:bg-[#c49635] transition disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" /> Guardar
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}

function AdvisorRow({ advisor, canManage }: { advisor: Advisor; canManage: boolean }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`¿Eliminar a ${advisor.name}? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteAdvisorAction(advisor.id);
    });
  }

  if (editing) {
    return <EditRow advisor={advisor} onDone={() => setEditing(false)} />;
  }

  return (
    <tr className={`border-b border-zinc-900/80 hover:bg-zinc-950/70 ${!advisor.active ? "opacity-50" : ""}`}>
      <td className="px-5 py-4 font-medium text-white">{advisor.name}</td>
      <td className="px-5 py-4 text-zinc-400">{advisor.role}</td>
      <td className="px-5 py-4">
        <Badge tone={advisor.tipo === "interno" ? "blue" : "gold"}>
          {advisor.tipo === "interno" ? "Interno" : "Externo"}
        </Badge>
      </td>
      <td className="px-5 py-4 text-zinc-400">{advisor.phone ?? "—"}</td>
      <td className="px-5 py-4 text-zinc-400">{advisor.email ?? "—"}</td>
      <td className="px-5 py-4">
        <Badge tone={advisor.active ? "green" : "neutral"}>{advisor.active ? "Activo" : "Inactivo"}</Badge>
      </td>
      {canManage && (
        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <ToggleActiveButton
              id={advisor.id}
              active={advisor.active}
              name={advisor.name}
              onToggle={toggleAdvisorActiveAction}
            />
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-400 hover:border-[#D6A93D]/50 hover:text-white transition"
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={pending}
              className="rounded-lg border border-zinc-700 bg-zinc-800 p-1.5 text-zinc-400 hover:border-red-500/50 hover:text-red-400 transition disabled:opacity-60"
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

export function AdvisorsList({ advisors, canManage }: { advisors: Advisor[]; canManage: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-zinc-900 bg-zinc-950/60 text-xs uppercase tracking-[0.18em] text-zinc-500">
          <tr>
            <th className="px-5 py-4 font-medium">Nombre</th>
            <th className="px-5 py-4 font-medium">Rol</th>
            <th className="px-5 py-4 font-medium">Tipo</th>
            <th className="px-5 py-4 font-medium">Teléfono</th>
            <th className="px-5 py-4 font-medium">Email</th>
            <th className="px-5 py-4 font-medium">Estado</th>
            {canManage && <th className="px-5 py-4 font-medium" />}
          </tr>
        </thead>
        <tbody>
          {advisors.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center text-sm text-zinc-500">
                Sin asesores registrados.
              </td>
            </tr>
          ) : (
            advisors.map((a) => (
              <AdvisorRow key={a.id} advisor={a} canManage={canManage} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
