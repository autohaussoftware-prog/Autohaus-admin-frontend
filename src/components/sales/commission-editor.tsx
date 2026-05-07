"use client";

import { useActionState, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { updateCommissionAmountAction } from "@/app/actions/sales";

function fmtCOP(n: number) {
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export function CommissionEditor({
  saleId,
  vehicleId,
  currentAmount,
  autoAmount,
  rate,
  overrideBy,
  canEdit,
}: {
  saleId: string;
  vehicleId: string;
  currentAmount: number;
  autoAmount: number;
  rate: number;
  overrideBy: string | null;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const isOverridden = currentAmount !== autoAmount;

  const [state, formAction, isPending] = useActionState(
    updateCommissionAmountAction.bind(null, saleId, vehicleId),
    { error: null, attempt: 0 }
  );

  if (!editing) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[#D6A93D]">− {fmtCOP(currentAmount)}</span>
          {canEdit && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg border border-zinc-700 p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Editar comisión"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {isOverridden ? (
          <p className="text-xs text-zinc-500">
            Auto {rate}%: {fmtCOP(autoAmount)}
            {overrideBy && ` · Mod. por ${overrideBy}`}
          </p>
        ) : (
          <p className="text-xs text-zinc-500">Calculada al {rate}%</p>
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
      className="flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <Input
          name="commissionAmount"
          type="number"
          min="0"
          defaultValue={currentAmount || ""}
          placeholder={String(autoAmount)}
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
      </div>
      <p className="text-xs text-zinc-500">Sugerida {rate}%: {fmtCOP(autoAmount)}</p>
      {state.error && <p className="text-xs text-red-400">{state.error}</p>}
    </form>
  );
}
