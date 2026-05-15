"use client";

import { Bell } from "lucide-react";
import { useAlertPrefs, type AlertPrefs } from "@/lib/hooks/use-alert-prefs";

const TOGGLES: { key: keyof AlertPrefs; label: string; description: string }[] = [
  {
    key: "showVisualAlerts",
    label: "Alertas visuales en inventario",
    description: "Muestra el texto de alerta en las tarjetas de vehículos (SOAT, costos, etc.).",
  },
  {
    key: "showExpiryAlerts",
    label: "Alertas de vencimiento",
    description: "SOAT y tecnomecánica próximos a vencer o ya vencidos.",
  },
  {
    key: "showFinancialAlerts",
    label: "Alertas financieras",
    description: "Costos reales altos, separaciones con saldo pendiente y vencimientos de venta.",
  },
  {
    key: "showMarginWarnings",
    label: "Avisos de margen bajo",
    description: "Resalta en rojo los vehículos propios con margen proyectado inferior al 3%.",
  },
];

export function AlertPreferencesPanel() {
  const { prefs, update } = useAlertPrefs();

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="mb-5 flex items-center gap-2">
        <Bell className="h-4 w-4 text-[#D6A93D]" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Preferencias de alertas
        </h2>
      </div>
      <div className="space-y-4">
        {TOGGLES.map(({ key, label, description }) => (
          <div key={key} className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-200">{label}</p>
              <p className="mt-0.5 text-xs leading-5 text-zinc-500">{description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[key]}
              onClick={() => update(key, !prefs[key])}
              className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A93D]/50 ${
                prefs[key] ? "bg-[#D6A93D]" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  prefs[key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-zinc-600">
        Las preferencias se guardan en este dispositivo y se aplican solo a tu vista.
      </p>
    </div>
  );
}
