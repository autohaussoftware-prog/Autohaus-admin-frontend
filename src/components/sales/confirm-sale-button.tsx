"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { confirmSaleAction } from "@/app/actions/sales";

export function ConfirmSaleButton({ saleId, vehicleId }: { saleId: string; vehicleId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!confirm("¿Confirmar esta separación como venta cerrada? El vehículo pasará a estado Vendido.")) return;
    setLoading(true);
    setError(null);
    const result = await confirmSaleAction(saleId, vehicleId);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={loading}
        onClick={handleConfirm}
        className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
        Confirmar venta
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
