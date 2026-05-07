"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { cancelSaleAction } from "@/app/actions/sales";

export function CancelSaleButton({
  saleId,
  vehicleId,
  saleStatus,
}: {
  saleId: string;
  vehicleId: string;
  saleStatus: string;
}) {
  const [step, setStep] = useState<"idle" | "confirm" | "payment">("idle");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function close() {
    setStep("idle");
    setReason("");
    setError(null);
  }

  function handleDelete(deletePayment: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await cancelSaleAction(saleId, vehicleId, deletePayment, reason.trim() || undefined);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/ventas");
    });
  }

  const isDelivered = saleStatus === "entregado";

  return (
    <>
      <button
        type="button"
        disabled={isDelivered}
        onClick={() => setStep("confirm")}
        title={isDelivered ? "No se puede cancelar una venta ya entregada." : "Cancelar esta venta"}
        className="inline-flex items-center gap-1.5 rounded-2xl border border-red-800/50 bg-red-950/30 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-950/60 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Cancelar venta
      </button>

      {step !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <button
            className="absolute inset-0 bg-black/70"
            onClick={close}
            aria-label="Cerrar"
          />

          <div className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {step === "confirm" && (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl border border-red-800/40 bg-red-950/30 p-2.5">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Cancelar venta</h2>
                    <p className="text-xs text-zinc-500">Esta acción no se puede deshacer.</p>
                  </div>
                </div>

                <p className="mb-4 text-sm text-zinc-300">
                  El vehículo volverá al estado <span className="font-medium text-green-400">Disponible</span> y se eliminará el traspaso asociado si existe.
                </p>

                <div className="mb-5">
                  <label className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-zinc-500">
                    Motivo (opcional)
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ej: Cliente desistió, financiamiento no aprobado…"
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
                    className="flex-1 rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:text-white transition"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("payment")}
                    className="flex-1 rounded-2xl border border-red-800 bg-red-950/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950/80 transition"
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}

            {step === "payment" && (
              <>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl border border-amber-800/40 bg-amber-950/30 p-2.5">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">¿Eliminar el abono inicial?</h2>
                    <p className="text-xs text-zinc-500">Elige cómo tratar el abono registrado.</p>
                  </div>
                </div>

                {error && (
                  <p className="mb-4 rounded-2xl border border-red-800/40 bg-red-950/30 px-3 py-2 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(true)}
                    className="flex flex-col items-start rounded-2xl border border-red-800/40 bg-red-950/20 px-4 py-3.5 text-left transition hover:bg-red-950/40 disabled:opacity-60"
                  >
                    <span className="font-medium text-red-300">Sí, eliminar abono inicial</span>
                    <span className="mt-0.5 text-xs text-zinc-500">
                      Elimina la venta, los abonos y los movimientos financieros relacionados.
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(false)}
                    className="flex flex-col items-start rounded-2xl border border-zinc-700 bg-zinc-900/60 px-4 py-3.5 text-left transition hover:bg-zinc-900 disabled:opacity-60"
                  >
                    <span className="font-medium text-zinc-200">No, conservar abono inicial</span>
                    <span className="mt-0.5 text-xs text-zinc-500">
                      Elimina solo la venta. El abono y el movimiento financiero quedan en los registros.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("confirm")}
                    className="rounded-2xl border border-zinc-800 px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition"
                  >
                    Volver
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
