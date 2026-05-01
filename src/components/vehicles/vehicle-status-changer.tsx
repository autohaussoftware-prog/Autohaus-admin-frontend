"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { updateVehicleStatusAction } from "@/app/(dashboard)/vehiculos/[id]/actions";
import type { VehicleStatus } from "@/types/vehicle";

const ALL_STATUSES: VehicleStatus[] = [
  "Disponible",
  "Publicado",
  "No publicado",
  "Separado",
  "En comisión",
  "En reparación",
  "En trámite",
  "Papeles pendientes",
  "Vendido",
  "Entregado",
];

const STATUS_COLOR: Record<VehicleStatus, string> = {
  Disponible: "text-green-400",
  Publicado: "text-blue-400",
  "No publicado": "text-zinc-400",
  Separado: "text-amber-400",
  "En comisión": "text-purple-400",
  "En reparación": "text-orange-400",
  "En trámite": "text-cyan-400",
  "Papeles pendientes": "text-yellow-400",
  Vendido: "text-red-400",
  Entregado: "text-emerald-400",
};

export function VehicleStatusChanger({
  vehicleId,
  currentStatus,
}: {
  vehicleId: string;
  currentStatus: VehicleStatus;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<VehicleStatus>(currentStatus);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSelect(newStatus: VehicleStatus) {
    if (newStatus === status) { setOpen(false); return; }
    setOpen(false);
    setSaved(false);
    setStatus(newStatus);
    startTransition(async () => {
      await updateVehicleStatusAction(vehicleId, newStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm transition hover:border-zinc-700 hover:bg-zinc-900 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
        ) : saved ? (
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        ) : (
          <span className={`h-2 w-2 rounded-full bg-current ${STATUS_COLOR[status]}`} />
        )}
        <span className={`font-medium ${STATUS_COLOR[status]}`}>{status}</span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
          />
          <div className="absolute left-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSelect(s)}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-zinc-900 ${
                  s === status ? "bg-zinc-900/60" : ""
                }`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full bg-current ${STATUS_COLOR[s]}`} />
                <span className={s === status ? STATUS_COLOR[s] : "text-zinc-300"}>{s}</span>
                {s === status && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-zinc-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
