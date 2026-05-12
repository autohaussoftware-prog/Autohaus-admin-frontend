"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/types/vehicle";

const STATUS_LINES: Partial<Record<string, string>> = {
  "Disponible":                 "✅ DISPONIBLE",
  "Publicado":                  "✅ DISPONIBLE",
  "Separado":                   "🟡 RESERVADO",
  "Vendido":                    "🔴 VENDIDO",
  "Entregado":                  "🔴 VENDIDO",
  "Vendido por el propietario": "⚫ VENDIDO POR EL PROPIETARIO",
  "En comisión":                "📋 EN COMISIÓN",
  "En reparación":              "🔧 EN REPARACIÓN",
  "En trámite":                 "📄 EN TRÁMITE",
  "No publicado":               "⬛ NO PUBLICADO",
  "Papeles pendientes":         "📄 PAPELES PENDIENTES",
};

function fmtPrice(amount: number): string {
  return "$" + amount.toLocaleString("es-CO");
}

function lastDigit(plate: string): string {
  const digits = plate.replace(/\D/g, "");
  return digits.at(-1) ?? "—";
}

function buildText(v: Vehicle): string {
  const statusLine = STATUS_LINES[v.status] ?? v.status.toUpperCase();
  const techno = v.technoDue?.trim() ? v.technoDue : "N/A";

  return [
    statusLine,
    "",
    `🚗 ${v.brand} ${v.line} ${v.version} 🚗`,
    "",
    `➖ Precio: ${fmtPrice(v.targetPrice)}`,
    `➖ Modelo: ${v.year}`,
    `➖ Kilometraje: ${v.mileage.toLocaleString("es-CO")} km`,
    `➖ Transmisión: ${v.transmission}`,
    `➖ Motor: ${v.motor}`,
    `➖ Tracción: ${v.traction}`,
    `➖ Combustible: ${v.fuel}`,
    `➖ Último dígito de la placa: ${lastDigit(v.plate)}`,
    `➖ Tránsito: ${v.cityRegistration}`,
    `➖ Soat: ${v.soatDue || "—"}`,
    `➖ Tecno: ${techno}`,
    "",
    "Gestiona tu crédito y seguro vehicular con las mejores tasas y precios del mercado en Autohaus.",
  ].join("\n");
}

export function VehicleInfoSheet({ vehicle }: { vehicle: Vehicle }) {
  const [copied, setCopied] = useState(false);
  const text = buildText(vehicle);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select the pre element text
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // cancelled or not supported — fall through to copy
      }
    }
    handleCopy();
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 animate-in">
      {/* Header hint */}
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        Ficha comercial · lista para compartir
      </p>

      {/* Preview */}
      <div className="relative rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0a0a0a] p-6 shadow-card">
        {/* Subtle gold accent top-left */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_60%_40%_at_0%_0%,rgba(212,168,67,0.06),transparent)]" />

        <pre className="relative whitespace-pre-wrap font-sans text-[14px] leading-[1.85] text-zinc-200 select-text">
          {text}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          size="md"
          variant={copied ? "secondary" : "primary"}
          className="flex-1"
          onClick={handleCopy}
        >
          {copied
            ? <><Check className="h-4 w-4" /> Copiado</>
            : <><Copy className="h-4 w-4" /> Copiar texto</>
          }
        </Button>

        <Button variant="outline" size="md" className="flex-1" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
      </div>

      <p className="text-center text-[11px] text-zinc-600">
        El texto se actualiza automáticamente si cambias el precio o el estado del vehículo.
      </p>
    </div>
  );
}
