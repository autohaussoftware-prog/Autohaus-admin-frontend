"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Phone, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ── Status maps ─────────────────────────────────────────────────────── */

const STATUS_LINE: Partial<Record<string, string>> = {
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

/* ── Helpers ─────────────────────────────────────────────────────────── */

function fmtPrice(n: number) {
  return "$" + n.toLocaleString("es-CO");
}

function lastDigit(plate: string) {
  return plate.replace(/\D/g, "").at(-1) ?? "—";
}

function toTag(word: string) {
  return "#" + word.replace(/[\s\-().]/g, "");
}

/* ── Text builders ───────────────────────────────────────────────────── */

function buildStandardText(v: Vehicle): string {
  const status = STATUS_LINE[v.status] ?? v.status.toUpperCase();
  const techno = v.technoDue?.trim() || "N/A";

  return [
    status,
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

function buildInstagramText(v: Vehicle, phone: string): string {
  const status = STATUS_LINE[v.status] ?? v.status.toUpperCase();
  const techno = v.technoDue?.trim() || "N/A";
  const tags = [
    "#Autohaus",
    "#Vehiculos",
    "#CarrosUsados",
    "#Medellin",
    "#AutosColombia",
    toTag(v.brand),
    toTag(v.line),
  ].join(" ");

  return [
    status,
    "",
    `🚗 ${v.brand} ${v.line} ${v.version} 🚗`,
    "",
    `💰 Precio: ${fmtPrice(v.targetPrice)}`,
    `📅 Modelo: ${v.year}`,
    `🛣️ Kilometraje: ${v.mileage.toLocaleString("es-CO")} km`,
    `⚙️ Transmisión: ${v.transmission}`,
    `🔥 Motor: ${v.motor}`,
    `⛽ Combustible: ${v.fuel}`,
    v.traction ? `🛞 Tracción: ${v.traction}` : "",
    `📍 Tránsito: ${v.cityRegistration}`,
    "",
    `📄 SOAT: ${v.soatDue || "—"}`,
    `🔧 Tecno: ${techno}`,
    "",
    "✨ Recibimos tu vehículo en parte de pago",
    "🏦 Financiación disponible",
    "🛡️ Seguro vehicular con excelentes tasas",
    "",
    `📲 Más información al: ${phone || "[teléfono]"}`,
    "📍 Autohaus - Medellín",
    "",
    tags,
  ].filter((l) => l !== undefined && l !== null && !(l === "" && false)).join("\n");
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
        "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-150",
        active ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"
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
  const [phone, setPhone] = useState("");

  const text = mode === "estandar"
    ? buildStandardText(vehicle)
    : buildInstagramText(vehicle, phone);

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
          icon={InstagramIcon}
          label="Instagram"
        />
      </div>

      {/* Phone field — only in Instagram mode */}
      {mode === "instagram" && (
        <label className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0f0f0f] px-4 py-2.5">
          <Phone className="h-4 w-4 shrink-0 text-[#D4A843]" />
          <Input
            type="tel"
            placeholder="Teléfono de contacto (ej: 300 123 4567)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-auto border-0 bg-transparent p-0 text-sm focus:ring-0 focus:border-0"
          />
        </label>
      )}

      {/* Mode hint */}
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
        {mode === "estandar"
          ? "Ficha técnica completa · lista para WhatsApp"
          : "Descripción comercial · lista para Instagram"}
      </p>

      {/* Preview */}
      <div className="relative rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0a0a0a] p-6 shadow-card">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_60%_40%_at_0%_0%,rgba(212,168,67,0.06),transparent)]" />
        {mode === "instagram" && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_50%_35%_at_100%_0%,rgba(131,58,180,0.08),transparent)]" />
        )}
        <pre className="relative whitespace-pre-wrap font-sans text-[14px] leading-[1.9] text-zinc-200 select-text">
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
