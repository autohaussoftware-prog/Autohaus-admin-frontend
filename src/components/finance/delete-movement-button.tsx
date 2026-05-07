"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { deleteMovimientoAction } from "@/app/actions/movimientos";
import { compactCOP } from "@/lib/utils";
import type { FinanceMovement } from "@/types/finance";

export function DeleteMovementButton({ movement }: { movement: FinanceMovement }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setReason("");
    setError(null);
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteMovimientoAction(movement.id, reason.trim() || undefined);
      if (result?.error) {
        setError(result.error);
        return;
      }
      close();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Eliminar movimiento"
        className="rounded-xl p-1.5 text-zinc-600 transition hover:bg-red-950/30 hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/70" onClick={close} aria-label="Cerrar" />

          <div className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl border border-red-800/40 bg-red-950/30 p-2.5">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Eliminar movimiento</h2>
                <p className="text-xs text-zinc-500">Esta acción puede afectar reportes y balances financieros.</p>
              </div>
            </div>

            <div className="mb-4 space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-zinc-500">Concepto</span>
                <span className="max-w-[60%] truncate text-right font-medium text-white">{movement.concept}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Monto</span>
                <span className={movement.type === "Ingreso" ? "font-bold text-emerald-400" : "font-bold text-red-400"}>
                  {movement.type === "Ingreso" ? "+" : "−"}{compactCOP(movement.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Fecha</span>
                <span className="text-zinc-300">{movement.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Canal</span>
                <span className="text-zinc-300">{movement.channel}</span>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-zinc-500">
                Motivo de eliminación (opcional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Duplicado, error de registro…"
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#D6A93D] focus:outline-none"
              />
            </div>

            {error && (
              <p className="mb-4 rounded-2xl border border-red-800/40 bg-red-950/30 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="flex-1 rounded-2xl border border-red-800 bg-red-950/50 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950/80 disabled:opacity-60"
              >
                {isPending ? "Eliminando…" : "Eliminar movimiento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
