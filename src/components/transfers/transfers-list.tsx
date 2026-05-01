"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Clock, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updateTransferStatusAction } from "@/app/actions/transfers";
import type { Transfer } from "@/lib/data/transfers";

const STATUS_NEXT: Record<string, string | null> = {
  "En proceso": "Documentos listos",
  "Documentos listos": "Completado",
  "Completado": null,
};

const STATUS_TONE: Record<string, "neutral" | "amber" | "green" | "blue"> = {
  "En proceso": "amber",
  "Documentos listos": "blue",
  "Completado": "green",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function AdvanceButton({ transferId, currentStatus }: { transferId: string; currentStatus: string }) {
  const next = STATUS_NEXT[currentStatus];
  const [pending, startTransition] = useTransition();

  if (!next) return <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Completado</span>;

  return (
    <button
      onClick={() => startTransition(async () => { await updateTransferStatusAction(transferId, next); })}
      disabled={pending}
      className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#D6A93D]/50 hover:text-white transition disabled:opacity-50"
    >
      {pending ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <FileCheck className="h-3.5 w-3.5" />}
      {next}
    </button>
  );
}

export function TransfersList({ transfers, canManage }: { transfers: Transfer[]; canManage: boolean }) {
  const [filter, setFilter] = useState<string>("all");

  const statuses = ["all", "En proceso", "Documentos listos", "Completado"];
  const filtered = filter === "all" ? transfers : transfers.filter((t) => t.status === filter);

  if (transfers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-950/60 py-16">
        <FileCheck className="h-8 w-8 text-zinc-600" />
        <p className="text-sm text-zinc-500">No hay traspasos registrados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-xl border px-3 py-1.5 text-xs transition ${
              filter === s
                ? "border-[#D6A93D]/50 bg-[#D6A93D]/10 text-[#D6A93D]"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {s === "all" ? "Todos" : s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <div key={t.id} className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{t.vehicleName}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{t.vehiclePlate}</p>
              </div>
              <Badge tone={STATUS_TONE[t.status] ?? "neutral"}>{t.status}</Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-zinc-500">Propietario origen</p>
                <p className="text-zinc-300">{t.fromOwner ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Propietario destino</p>
                <p className="text-zinc-300">{t.toOwner ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Solicitado</p>
                <p className="text-zinc-300">{formatDate(t.requestedAt)}</p>
              </div>
            </div>

            {t.notes && (
              <p className="mt-3 rounded-xl bg-zinc-900 px-3 py-2 text-xs text-zinc-400">{t.notes}</p>
            )}

            {canManage && (
              <div className="mt-4 flex justify-end">
                <AdvanceButton transferId={t.id} currentStatus={t.status} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
