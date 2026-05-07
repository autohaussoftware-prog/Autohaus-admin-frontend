"use client";

import { useActionState, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { updatePaperworkAmountAction } from "@/app/actions/sales";

function fmtCOP(n: number) {
  if (!n) return "$0";
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export function PaperworkEditor({
  saleId,
  currentAmount,
  canEdit,
}: {
  saleId: string;
  currentAmount: number;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updatePaperworkAmountAction.bind(null, saleId),
    { error: null, attempt: 0 }
  );

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-zinc-300">{fmtCOP(currentAmount)}</span>
        {canEdit && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-zinc-700 p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
            aria-label="Editar valor papeles"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <form
      action={async (fd) => {
        await formAction(fd);
        setEditing(false);
      }}
      className="flex items-center gap-2"
    >
      <Input
        name="clientPaperworkAmount"
        type="number"
        min="0"
        defaultValue={currentAmount || ""}
        placeholder="0"
        className="h-8 w-40 text-sm"
        autoFocus
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-1.5 text-emerald-400 hover:bg-emerald-950/70 transition-colors disabled:opacity-50"
        aria-label="Guardar"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="rounded-lg border border-zinc-700 p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
        aria-label="Cancelar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
    </form>
  );
}
