"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTraspasoStatusAction } from "@/app/actions/traspasos";
import { TraspasoStatusBadge } from "./traspaso-status-badge";
import type { TraspasoStatus } from "@/lib/data/traspasos";

const OPTIONS: { value: TraspasoStatus; label: string }[] = [
  { value: "en_proceso", label: "En proceso" },
  { value: "pendiente",  label: "Pendiente" },
  { value: "completado", label: "Completado" },
  { value: "cancelado",  label: "Cancelado" },
];

const SELECT_STYLES: Record<TraspasoStatus, string> = {
  en_proceso: "text-amber-300 border-amber-500/40 bg-amber-500/10",
  pendiente:  "text-yellow-300 border-yellow-500/40 bg-yellow-500/10",
  completado: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10",
  cancelado:  "text-red-300 border-red-500/40 bg-red-500/10",
};

export function TraspasoInlineStatus({
  traspasoId,
  saleId,
  currentStatus,
  canEdit,
}: {
  traspasoId: string;
  saleId?: string;
  currentStatus: TraspasoStatus;
  canEdit: boolean;
}) {
  const [status, setStatus] = useState<TraspasoStatus>(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!canEdit) return <TraspasoStatusBadge status={status} />;

  function handleChange(next: TraspasoStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateTraspasoStatusAction(traspasoId, next, saleId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStatus(next);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as TraspasoStatus)}
        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium cursor-pointer disabled:opacity-60 focus:outline-none transition-colors ${SELECT_STYLES[status]}`}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-zinc-900 text-white">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
