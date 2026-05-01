"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updateSaleStatusesAction } from "@/app/actions/sales";

const PAYMENT_OPTIONS = [
  { value: "pendiente", label: "Pago pendiente", tone: "red" as const },
  { value: "parcial", label: "Pago parcial", tone: "gold" as const },
  { value: "completo", label: "Pagado completo", tone: "green" as const },
];

const DOC_OPTIONS = [
  { value: "pendiente", label: "Docs pendientes", tone: "neutral" as const },
  { value: "en_tramite", label: "En trámite", tone: "gold" as const },
  { value: "completo", label: "Docs completos", tone: "green" as const },
];

const DELIVERY_OPTIONS = [
  { value: "pendiente", label: "Entrega pendiente", tone: "neutral" as const },
  { value: "programada", label: "Entrega programada", tone: "gold" as const },
  { value: "completada", label: "Vehículo entregado", tone: "green" as const },
];

type StatusKey = "paymentStatus" | "documentStatus" | "deliveryStatus";

function StatusSelector({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; tone: "red" | "gold" | "green" | "neutral" }[];
  onChange: (v: string) => void;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
              value === o.value
                ? "border-[#D6A93D]/50 bg-[#D6A93D]/10 text-[#D6A93D]"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SaleStatusPanel({
  saleId,
  initialPaymentStatus,
  initialDocumentStatus,
  initialDeliveryStatus,
  canEdit,
}: {
  saleId: string;
  initialPaymentStatus: string;
  initialDocumentStatus: string;
  initialDeliveryStatus: string;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [documentStatus, setDocumentStatus] = useState(initialDocumentStatus);
  const [deliveryStatus, setDeliveryStatus] = useState(initialDeliveryStatus);

  const PAYMENT = PAYMENT_OPTIONS.find((o) => o.value === paymentStatus);
  const DOC = DOC_OPTIONS.find((o) => o.value === documentStatus);
  const DELIVERY = DELIVERY_OPTIONS.find((o) => o.value === deliveryStatus);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateSaleStatusesAction(saleId, {
        paymentStatus,
        documentStatus,
        deliveryStatus,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  if (!editing) {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        {[
          { label: "Pago", option: PAYMENT },
          { label: "Documentos", option: DOC },
          { label: "Entrega", option: DELIVERY },
        ].map(({ label, option }) => (
          <div key={label} className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{label}</p>
            <Badge tone={option?.tone ?? "neutral"}>{option?.label ?? "—"}</Badge>
          </div>
        ))}
        {canEdit && (
          <div className="flex items-end">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition"
            >
              {saved ? (
                <><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> Guardado</>
              ) : (
                <><Pencil className="h-3.5 w-3.5" /> Editar estados</>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <StatusSelector label="Estado de pago" value={paymentStatus} options={PAYMENT_OPTIONS} onChange={setPaymentStatus} />
      <StatusSelector label="Estado de documentos" value={documentStatus} options={DOC_OPTIONS} onChange={setDocumentStatus} />
      <StatusSelector label="Estado de entrega" value={deliveryStatus} options={DELIVERY_OPTIONS} onChange={setDeliveryStatus} />

      {error && <p className="rounded-xl border border-red-800 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={pending}
          className="flex items-center gap-2 rounded-xl bg-[#D6A93D] px-4 py-2 text-sm font-medium text-black hover:bg-[#c49635] transition disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Guardar cambios
        </button>
        <button
          onClick={() => { setEditing(false); setPaymentStatus(initialPaymentStatus); setDocumentStatus(initialDocumentStatus); setDeliveryStatus(initialDeliveryStatus); }}
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:text-white transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
