"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { addExpenseAction, deleteExpenseAction } from "@/app/(dashboard)/vehiculos/[id]/gastos/actions";
import type { VehicleExpense } from "@/lib/data/expenses";

type State = { error: string | null; attempt: number };
const INIT: State = { error: null, attempt: 0 };

function fmtCOP(n: number) {
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function fmtDate(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export function VehicleExpenses({
  vehicleId,
  expenses,
  canDelete,
}: {
  vehicleId: string;
  expenses: VehicleExpense[];
  canDelete: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [state, formAction, isPending] = useActionState(
    addExpenseAction.bind(null, vehicleId),
    INIT
  );

  const total = expenses.reduce((s, e) => s + e.monto, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            Total gastos adicionales:{" "}
            <span className="text-[#D6A93D]">{fmtCOP(total)}</span>
          </p>
          <p className="text-xs text-zinc-500">{expenses.length} registro{expenses.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agregar gasto
        </button>
      </div>

      {showForm && (
        <form
          action={async (fd) => {
            await formAction(fd);
            if (!state.error) setShowForm(false);
          }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4"
        >
          <p className="text-sm font-medium text-zinc-300">Nuevo gasto adicional</p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="mb-1.5 block text-xs text-zinc-500">Motivo *</label>
              <Input name="motivo" placeholder="Ej: Grúa, reparación, papeles" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">Fecha *</label>
              <Input
                name="fecha"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">Monto *</label>
              <Input name="monto" type="number" min="1" placeholder="500000" required />
            </div>
          </div>

          {state.error && (
            <p className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-2 text-sm text-red-400">
              {state.error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-[#D6A93D] px-4 py-2 text-sm font-medium text-black hover:bg-[#c49835] disabled:opacity-50 transition-colors"
            >
              {isPending ? "Guardando…" : "Guardar gasto"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {expenses.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-5 py-10 text-center text-sm text-zinc-500">
          No hay gastos adicionales registrados aún.
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-900 text-xs uppercase tracking-[0.15em] text-zinc-500">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Motivo</th>
                <th className="px-5 py-3 text-left font-medium">Fecha</th>
                <th className="px-5 py-3 text-right font-medium">Monto</th>
                {canDelete && <th className="px-5 py-3 text-right font-medium"></th>}
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/40">
                  <td className="px-5 py-3 text-zinc-200">{expense.motivo}</td>
                  <td className="px-5 py-3 text-zinc-400">{fmtDate(expense.fecha)}</td>
                  <td className="px-5 py-3 text-right font-medium text-white">{fmtCOP(expense.monto)}</td>
                  {canDelete && (
                    <td className="px-5 py-3 text-right">
                      <form action={deleteExpenseAction.bind(null, expense.id, vehicleId)}>
                        <button
                          type="submit"
                          className="rounded-lg border border-zinc-700 p-1.5 text-zinc-500 hover:border-red-800 hover:text-red-400 transition-colors"
                          aria-label="Eliminar gasto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-800 bg-zinc-900/30">
                <td className="px-5 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500" colSpan={2}>Total</td>
                <td className="px-5 py-3 text-right text-sm font-semibold text-[#D6A93D]">{fmtCOP(total)}</td>
                {canDelete && <td />}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
