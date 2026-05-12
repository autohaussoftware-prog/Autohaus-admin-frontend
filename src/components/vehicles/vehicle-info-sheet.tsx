"use client";

import { useState } from "react";
import { Check, Copy, Instagram, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";

/* ── Status maps ─────────────────────────────────────────────────────── */

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

const STATUS_EMOJI: Partial<Record<string, string>> = {
  "Disponible":   "🟢",
  "Publicado":    "🟢",
  "Separado":     "🟡",
  "Vendido":      "🔴",
  "Entregado":    "🔴",
  "Vendido por el propietario": "⚫",
  "En reparación": "🔧",
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

function fmtPrice(amount: number): string {
  return "$" + amount.toLocaleString("es-CO");
}

function lastDigit(plate: string): string {
  const digits = plate.replace(/\D/g, "");
  return digits.at(-1) ?? "—";
}

function toTag(word: string) {
  return "#" + word.replace(/[\s-]/g, "");
}

/* ── Text builders ───────────────────────────────────────────────────── */

function buildStandardText(v: Vehicle): string {
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

function buildInstagramText(v: Vehicle): string {
  const emoji = STATUS_EMOJI[v.status] ?? "🔵";
  const techno = v.technoDue?.trim() ? v.technoDue : "N/A";
  const tags = [
    "#Autohaus",
    toTag(v.brand),
    toTag(v.line),
    "#VentaDeCarros",
    "#CarrosUsados",
    "#CarrosDeLujo",
    "#Colombia",
    "#Medellín",
  ].join(" ");

  return [
    `🏎️ ${v.brand} ${v.line} ${v.version} · ${v.year}`,
    "",
    `💰 Precio: ${fmtPrice(v.targetPrice)}`,
    `🛣️ ${v.mileage.toLocaleString("es-CO")} km  ·  ⚙️ ${v.transmission}`,
    `⚡ ${v.motor}  ·  ⛽ ${v.fuel}`,
    v.traction ? `🔄 ${v.traction}` : "",
    `📍 ${v.cityRegistration}`,
    `📋 SOAT: ${v.soatDue || "—"}  ·  Tecno: ${techno}`,
    "",
    `${emoji} ${v.status.toUpperCase()}`,
    "",
    "¿Te interesa? ¡Escríbenos y lo separamos hoy! 🤝",
    "👇 Más info en el link de la bio",
    "",
    tags,
  ].filter(Boolean).join("\n");
}

/* ── Mode toggle ─────────────────────────────────────────────────────── */

type Mode = "estandar" | "instagram";

function ModeTab({ active, onClick, icon: Icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition-all duration-150",
        active
          ? "bg-white text-black shadow-sm"
          : "text-zinc-500 hover:text-zinc-300"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */

export function VehicleInfoSheet({ vehicle }: { vehicle: Vehicle }) {
  const [mode, setMode] = useState<Mode>("estandar");
  const [copied, setCopied] = useState(false);

  const text = mode === "estandar"
    ? buildStandardText(vehicle)
    : buildInstagramText(vehicle);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* noop */ }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ text }); return; } catch { /* noop */ }
    }
    handleCopy();
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 animate-in">

      {/* Mode toggle */}
      <div className="flex gap-1 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0a0a0a] p-1.5">
        <ModeTab
          active={mode === "estandar"}
          onClick={() => setMode("estandar")}
          icon={MessageCircle}
          label="Estándar · WhatsApp"
        />
        <ModeTab
          active={mode === "instagram"}
          onClick={() => setMode("instagram")}
          icon={Instagram}
          label="Instagram"
        />
      </div>

      {/* Mode hint */}
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        {mode === "estandar"
          ? "Ficha técnica completa · lista para WhatsApp"
          : "Descripción comercial · optimizada para Instagram"}
      </p>

      {/* Preview card */}
      <div className="relative rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0a0a0a] p-6 shadow-card">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_60%_40%_at_0%_0%,rgba(212,168,67,0.06),transparent)]" />
        {mode === "instagram" && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_40%_30%_at_100%_0%,rgba(131,58,180,0.07),transparent)]" />
        )}
        <pre className="relative whitespace-pre-wrap font-sans text-[14px] leading-[1.85] text-zinc-200 select-text">
          {text}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          size="md"
          variant={copied ? "secondary" : "primary"}
          className="flex-1"
          onClick={handleCopy}
        >
          {copied
            ? <><Check className="h-4 w-4" />Copiado</>
            : <><Copy className="h-4 w-4" />Copiar texto</>
          }
        </Button>
        <Button variant="outline" size="md" className="flex-1" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
      </div>

      <p className="text-center text-[11px] text-zinc-600">
        Se actualiza automáticamente al cambiar precio o estado del vehículo.
      </p>
    </div>
  );
}
