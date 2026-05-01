"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { markCommissionPaidAction } from "@/app/actions/commissions";

export function MarkPaidButton({
  commissionId,
  advisorName,
  amount,
  vehicleName,
}: {
  commissionId: string;
  advisorName: string;
  amount: number;
  vehicleName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm(`¿Confirmar pago de comisión a ${advisorName} por $${amount.toLocaleString("es-CO")}?\n\nEsto registrará un egreso bancario automáticamente.`)) return;
    setLoading(true);
    setError(null);
    const result = await markCommissionPaidAction(commissionId, advisorName, amount, vehicleName);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  if (error) {
    return <span className="text-xs text-red-400">{error}</span>;
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
      Marcar pagada
    </button>
  );
}
