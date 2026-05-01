"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, DollarSign, PlusCircle, Trash2 } from "lucide-react";
import { createVehicleCostAction, deleteVehicleCostAction } from "@/app/actions/costs";
import { COST_CATEGORIES } from "@/lib/domain/vehicle-costs-config";
import type { VehicleCost } from "@/lib/data/costs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currencyCOP, compactCOP } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

const CATEGORY_COLORS: Record<string, string> = {
  "Mecánica": "text-blue-300 border-blue-500/30 bg-blue-500/10",
  "Lavado": "text-cyan-300 border-cyan-500/30 bg-cyan-500/10",
  "Pintura": "text-purple-300 border-purple-500/30 bg-purple-500/10",
  "Tapicería": "text-pink-300 border-pink-500/30 bg-pink-500/10",
  "Vidrios": "text-sky-300 border-sky-500/30 bg-sky-500/10",
  "Eléctrico": "text-yellow-300 border-yellow-500/30 bg-yellow-500/10",
  "Trámites": "text-orange-300 border-orange-500/30 bg-orange-500/10",
  "Transporte": "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  "Publicidad": "text-red-300 border-red-500/30 bg-red-500/10",
  "Parqueadero": "text-zinc-300 border-zinc-500/30 bg-zinc-500/10",
  "Comisión captador": "text-[#D6A93D] border-[#D6A93D]/30 bg-[#D6A93D]/10",
  "Otro": "text-zinc-400 border-zinc-600/30 bg-zinc-600/10",
};

export function VehicleCosts({
  vehicleId,
  costs,
  canDelete = false,
}: {
  vehicleId: string;
  costs: VehicleCost[];
  canDelete?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = costs.reduce((sum, c) => sum + c.amount, 0);
  const byCategory = costs.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + c.amount;
    return acc;
  }, {});

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createVehicleCostAction(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(costId: string) {
    setDeletingId(costId);
    const result = await deleteVehicleCostAction(costId, vehicleId);
    if (result?.error) setError(result.error);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="border-b border-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Costos del vehículo</CardTitle>
            <CardDescription>
              {costs.length === 0
                ? "Sin costos registrados."
                : `${costs.length} ${costs.length === 1 ? "costo" : "costos"} · Total: ${compactCOP(total)}`}
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
            <PlusCircle className="h-4 w-4" />
            {showForm ? "Cancelar" : "Agregar costo"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {showForm && (
          <form
            ref={formRef}
            action={handleSubmit}
            className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-4"
          >
            <input type="hidden" name="vehicleId" value={vehicleId} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Categoría *</label>
                <select
                  name="category"
                  required
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
                >
                  <option value="">Seleccionar…</option>
                  {COST_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Monto *</label>
                <input
                  type="number"
                  name="amount"
                  min={1}
                  required
                  placeholder="Ej: 350000"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#D6A93D] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Descripción *</label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="Ej: Cambio de aceite + filtro"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#D6A93D] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Fecha *</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Proveedor</label>
                <input
                  type="text"
                  name="provider"
                  placeholder="Ej: Taller El Rápido"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#D6A93D] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  name="paid"
                  id="paid-check"
                  value="true"
                  defaultChecked
                  className="h-4 w-4 rounded accent-[#D6A93D]"
                />
                <label htmlFor="paid-check" className="text-sm text-zinc-300">Ya fue pagado</label>
              </div>
            </div>

            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              <DollarSign className="h-4 w-4" />
              Registrar costo
            </Button>
          </form>
        )}

        {costs.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-zinc-800 py-12">
            <DollarSign className="h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-500">Sin costos registrados para este vehículo.</p>
          </div>
        )}

        {costs.length > 0 && (
          <>
            <div className="divide-y divide-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
              {costs.map((cost) => (
                <div key={cost.id} className="flex items-start justify-between gap-4 px-4 py-3.5">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[cost.category] ?? CATEGORY_COLORS["Otro"]}`}
                      >
                        {cost.category}
                      </span>
                      {!cost.paid && (
                        <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-300">
                          Pendiente de pago
                        </span>
                      )}
                      {cost.paid && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-sm text-white">{cost.description}</p>
                    <p className="text-xs text-zinc-500">
                      {formatDate(cost.date)}
                      {cost.provider && ` · ${cost.provider}`}
                      {` · por ${cost.createdBy}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <p className="text-sm font-semibold text-[#D6A93D]">{compactCOP(cost.amount)}</p>
                    {canDelete && (
                      <button
                        type="button"
                        disabled={deletingId === cost.id}
                        onClick={() => handleDelete(cost.id)}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 p-1.5 text-red-300 transition hover:bg-red-500/30 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(byCategory).length > 1 && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 p-4">
                <p className="mb-3 text-xs uppercase tracking-[0.14em] text-zinc-500">Por categoría</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(byCategory)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, amt]) => (
                      <div
                        key={cat}
                        className={`rounded-full border px-3 py-1 text-xs ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS["Otro"]}`}
                      >
                        {cat}: {compactCOP(amt)}
                      </div>
                    ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3">
                  <p className="text-xs text-zinc-500">Total acumulado</p>
                  <p className="text-sm font-bold text-white">{currencyCOP(total)}</p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
