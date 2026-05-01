"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, PlusCircle } from "lucide-react";
import { createPaymentAction } from "@/app/actions/payments";
import { PAYMENT_CHANNELS } from "@/lib/domain/payment-channels-config";
import type { Payment } from "@/lib/data/payments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currencyCOP, compactCOP } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

const CHANNEL_COLORS: Record<string, string> = {
  "Banco": "text-blue-300 border-blue-500/30 bg-blue-500/10",
  "Efectivo ubicación 1": "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  "Efectivo ubicación 2": "text-amber-300 border-amber-500/30 bg-amber-500/10",
};

export function SalePayments({
  saleId,
  payments,
  pendingBalance,
  canAdd = false,
}: {
  saleId: string;
  payments: Payment[];
  pendingBalance: number;
  canAdd?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createPaymentAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      setShowForm(false);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="border-b border-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Abonos y pagos</CardTitle>
            <CardDescription>
              {payments.length === 0
                ? "Sin abonos registrados."
                : `${payments.length} ${payments.length === 1 ? "abono" : "abonos"} · Total abonado: ${compactCOP(totalPaid)}`}
            </CardDescription>
          </div>
          {canAdd && pendingBalance > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
              <PlusCircle className="h-4 w-4" />
              {showForm ? "Cancelar" : "Registrar abono"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {pendingBalance === 0 && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300">Pago completo — sin saldo pendiente.</p>
          </div>
        )}

        {pendingBalance > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">Saldo pendiente</p>
            <p className="text-sm font-bold text-red-200">{currencyCOP(pendingBalance)}</p>
          </div>
        )}

        {showForm && (
          <form
            ref={formRef}
            action={handleSubmit}
            className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-4"
          >
            <input type="hidden" name="saleId" value={saleId} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Canal *</label>
                <select
                  name="channel"
                  required
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
                >
                  {PAYMENT_CHANNELS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Monto (COP) *</label>
                <input
                  type="number"
                  name="amount"
                  min={1}
                  max={pendingBalance}
                  required
                  placeholder={`Máx. ${compactCOP(pendingBalance)}`}
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
                <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Referencia</label>
                <input
                  type="text"
                  name="reference"
                  placeholder="Nro. transferencia, cheque, etc."
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#D6A93D] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Notas</label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Observaciones del abono"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#D6A93D] focus:outline-none"
                />
              </div>
            </div>

            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              <CreditCard className="h-4 w-4" />
              Registrar abono
            </Button>
          </form>
        )}

        {payments.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-zinc-800 py-10">
            <CreditCard className="h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-500">Sin abonos registrados para esta venta.</p>
          </div>
        )}

        {payments.length > 0 && (
          <div className="divide-y divide-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
            {payments.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-4 px-4 py-3.5">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${CHANNEL_COLORS[p.channel] ?? "text-zinc-300 border-zinc-600 bg-zinc-700/30"}`}
                    >
                      {p.channel}
                    </span>
                    {p.reference && (
                      <span className="text-xs text-zinc-500">Ref: {p.reference}</span>
                    )}
                  </div>
                  {p.notes && <p className="text-sm text-zinc-300">{p.notes}</p>}
                  <p className="text-xs text-zinc-500">
                    {formatDate(p.date)} · por {p.registeredBy}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-[#D6A93D]">{compactCOP(p.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
