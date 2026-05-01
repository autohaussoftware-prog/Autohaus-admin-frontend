"use client";

import { useState, useTransition } from "react";
import { CheckSquare2, Loader2, PackageCheck, Square } from "lucide-react";
import { markSaleDeliveredAction } from "@/app/actions/sales";

const CHECKLIST_ITEMS = [
  { id: "llaves", label: "Llaves entregadas al cliente", required: true },
  { id: "manual", label: "Manual de propietario y documentación técnica entregada", required: false },
  { id: "soat", label: "SOAT vigente al momento de entrega", required: true },
  { id: "docs_firmados", label: "Documentos de transferencia firmados por ambas partes", required: true },
  { id: "pago_completo", label: "Pago total recibido o acuerdo de saldo formalizado", required: true },
  { id: "inspeccion", label: "Vehículo limpio e inspeccionado antes de entrega", required: false },
  { id: "tarjeta", label: "Tarjeta de propiedad o trámite de traspaso iniciado", required: true },
];

const REQUIRED_IDS = CHECKLIST_ITEMS.filter((i) => i.required).map((i) => i.id);

export function DeliveryChecklist({
  saleId,
  vehicleId,
  vehicleName,
  alreadyDelivered,
}: {
  saleId: string;
  vehicleId: string;
  vehicleName: string;
  alreadyDelivered: boolean;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(alreadyDelivered);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const allRequired = REQUIRED_IDS.every((id) => checked.has(id));

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleDeliver() {
    setError(null);
    const labels = CHECKLIST_ITEMS.filter((i) => checked.has(i.id)).map((i) => i.label);
    startTransition(async () => {
      const result = await markSaleDeliveredAction(saleId, vehicleId, labels);
      if (result?.error) {
        setError(result.error);
      } else {
        setDone(true);
        setOpen(false);
      }
    });
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-800/50 bg-emerald-500/10 px-4 py-3">
        <PackageCheck className="h-5 w-5 text-emerald-400 shrink-0" />
        <div>
          <p className="text-sm font-medium text-emerald-300">Vehículo entregado</p>
          <p className="text-xs text-emerald-600">El acta de entrega fue registrada. Vehículo en estado Entregado.</p>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm text-zinc-300 hover:border-[#D6A93D]/40 hover:text-white transition w-full"
      >
        <PackageCheck className="h-4 w-4 text-zinc-500" />
        Registrar entrega de {vehicleName}
      </button>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-white">Checklist de entrega</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Marca todos los ítems requeridos (*) antes de confirmar la entrega.
        </p>
      </div>

      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = checked.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                isChecked
                  ? "border-emerald-800/50 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
              }`}
            >
              {isChecked ? (
                <CheckSquare2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <Square className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
              )}
              <span className={`text-sm ${isChecked ? "text-emerald-300" : "text-zinc-300"}`}>
                {item.label}
                {item.required && <span className="ml-1 text-red-400">*</span>}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="rounded-xl border border-red-800 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
      )}

      {!allRequired && (
        <p className="text-xs text-zinc-500">
          Faltan {REQUIRED_IDS.filter((id) => !checked.has(id)).length} ítem(s) requeridos para continuar.
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleDeliver}
          disabled={!allRequired || pending}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
          Confirmar entrega
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:text-white transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
