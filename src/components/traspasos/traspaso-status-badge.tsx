import type { TraspasoStatus } from "@/lib/data/traspasos";

const STYLES: Record<TraspasoStatus, string> = {
  en_proceso: "text-amber-300 border-amber-500/30 bg-amber-500/10",
  pendiente:  "text-yellow-300 border-yellow-500/30 bg-yellow-500/10",
  completado: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  cancelado:  "text-red-300 border-red-500/30 bg-red-500/10",
};

const LABELS: Record<TraspasoStatus, string> = {
  en_proceso: "En proceso",
  pendiente:  "Pendiente",
  completado: "Completado",
  cancelado:  "Cancelado",
};

export function TraspasoStatusBadge({ status }: { status: TraspasoStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status] ?? "text-zinc-300 border-zinc-600 bg-zinc-700/30"}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
