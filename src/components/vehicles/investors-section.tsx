"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export type InvestorRow = { nombre: string; celular: string; monto: string };

function fmtCOP(n: number) {
  if (!n) return "$0";
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

export function InvestorsSection({
  buyPrice,
  defaultInvestors,
}: {
  buyPrice: number;
  defaultInvestors?: InvestorRow[];
}) {
  const [investors, setInvestors] = useState<InvestorRow[]>(
    defaultInvestors?.length ? defaultInvestors : [{ nombre: "", celular: "", monto: "" }]
  );

  const total = investors.reduce((s, inv) => s + (Number(inv.monto) || 0), 0);
  const diff = buyPrice - total;
  const isValid = buyPrice > 0 && Math.abs(diff) < 1;
  const hasAny = investors.some((inv) => inv.nombre.trim() || inv.monto);

  function update(i: number, field: keyof InvestorRow, value: string) {
    setInvestors((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setInvestors((prev) => [...prev, { nombre: "", celular: "", monto: "" }]);
  }

  function removeRow(i: number) {
    setInvestors((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="investorsJson" value={JSON.stringify(investors)} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Registra quién compra este vehículo y cuánto aporta cada uno.
        </p>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar persona
        </button>
      </div>

      <div className="space-y-3">
        {investors.map((inv, i) => (
          <div
            key={i}
            className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <div>
              <span className="mb-1.5 block text-xs text-zinc-500">Nombre *</span>
              <Input
                placeholder="Nombre completo"
                value={inv.nombre}
                onChange={(e) => update(i, "nombre", e.target.value)}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs text-zinc-500">Celular *</span>
              <Input
                placeholder="3001234567"
                value={inv.celular}
                onChange={(e) => update(i, "celular", e.target.value)}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs text-zinc-500">Monto invertido *</span>
              <Input
                type="number"
                min="0"
                placeholder="50000000"
                value={inv.monto}
                onChange={(e) => update(i, "monto", e.target.value)}
              />
            </div>
            <div className="flex items-end pb-0.5">
              {investors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700 text-zinc-500 hover:border-red-800 hover:text-red-400 transition-colors"
                  aria-label="Eliminar inversionista"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasAny && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            isValid
              ? "border-green-900/40 bg-green-950/20 text-green-400"
              : diff > 0
              ? "border-yellow-900/40 bg-yellow-950/20 text-yellow-400"
              : "border-red-900/40 bg-red-950/20 text-red-400"
          }`}
        >
          <span>
            Total aportado: <strong>{fmtCOP(total)}</strong>
          </span>
          <span>
            {isValid
              ? "✓ Coincide con el precio de compra"
              : diff > 0
              ? `Faltan ${fmtCOP(diff)}`
              : `Excede por ${fmtCOP(Math.abs(diff))}`}
          </span>
        </div>
      )}

      {buyPrice === 0 && hasAny && (
        <p className="text-xs text-zinc-500">Ingresa el precio de compra para validar el total.</p>
      )}
    </div>
  );
}
