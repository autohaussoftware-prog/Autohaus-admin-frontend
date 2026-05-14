"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { updateCommissionRateAction } from "@/app/actions/vehicles";

export function EditCommissionButton({
  vehicleId,
  currentRate,
}: {
  vehicleId: string;
  currentRate: number;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = updateCommissionRateAction.bind(null, vehicleId);
  const [state, formAction, isPending] = useActionState(boundAction, { error: null, attempt: 0 });

  useEffect(() => {
    if (state.attempt > 0 && !state.error) setOpen(false);
  }, [state.attempt, state.error]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Editar comisión"
        className="rounded-xl p-1.5 text-zinc-500 transition hover:bg-[#D6A93D]/10 hover:text-[#D6A93D]"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl border border-[#D6A93D]/30 bg-[#D6A93D]/10 p-2.5">
                <Pencil className="h-4 w-4 text-[#D6A93D]" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Editar comisión</h2>
                <p className="text-xs text-zinc-500">Actual: {currentRate}%</p>
              </div>
            </div>

            <form action={formAction} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-zinc-500">
                  Comisión (%) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="rate"
                  min="0.1"
                  max="100"
                  step="0.1"
                  defaultValue={currentRate}
                  required
                  autoFocus
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
                />
              </div>

              {state.error && (
                <p className="rounded-2xl border border-red-800/40 bg-red-950/30 px-3 py-2 text-sm text-red-400">
                  {state.error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-2xl border border-[#D6A93D]/50 bg-[#D6A93D]/10 px-4 py-2 text-sm font-medium text-[#D6A93D] transition hover:bg-[#D6A93D]/20 disabled:opacity-50"
                >
                  {isPending ? "Guardando…" : "Guardar comisión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
