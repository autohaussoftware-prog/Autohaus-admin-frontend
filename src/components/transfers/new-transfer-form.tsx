"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createTransferAction } from "@/app/actions/transfers";
import type { VehicleFormOption } from "@/lib/data/vehicles";

export function NewTransferForm({ vehicles }: { vehicles: VehicleFormOption[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTransferAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-[#D6A93D]/50 hover:text-white transition"
      >
        <Plus className="h-4 w-4" />
        Nuevo traspaso
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-4">
      <h3 className="font-semibold text-white">Registrar traspaso</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs text-zinc-400">Vehículo *</label>
          <select
            name="vehicleId"
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
          >
            <option value="">Seleccionar vehículo…</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-zinc-400">Propietario origen</label>
          <input
            name="fromOwner"
            type="text"
            placeholder="Nombre o entidad"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#D6A93D] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-zinc-400">Propietario destino</label>
          <input
            name="toOwner"
            type="text"
            placeholder="Nombre o entidad"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#D6A93D] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs text-zinc-400">Notas</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Observaciones del traspaso…"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#D6A93D] focus:outline-none resize-none"
          />
        </div>
      </div>

      {error && <p className="rounded-xl border border-red-800 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:text-white transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[#D6A93D] px-4 py-2 text-sm font-medium text-black hover:bg-[#c49635] transition disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Registrar"}
        </button>
      </div>
    </form>
  );
}
