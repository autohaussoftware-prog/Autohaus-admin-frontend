"use client";

import { useState } from "react";
import { Check, Copy, Download, LayoutTemplate, Loader2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vehicle, VehiclePhoto } from "@/types/vehicle";

type Format = "post" | "story";

const GOLD      = "#D4A843";
const GOLD_DARK = "#1a0e00";
const PANEL_BG  = "#0c0c0c";
const W         = 1080;

// ── Tiny uniform icons ─────────────────────────────────────────────────
const IC = "rgba(255,255,255,0.60)";
const SVGS: Record<string, string> = {
  km:       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${IC}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  gear:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${IC}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  fuel:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${IC}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><line x1="3" y1="22" x2="15" y2="22"/><path d="M15 10h2a2 2 0 0 1 2 2v5a1 1 0 0 0 2 0v-7l-3-3"/></svg>`,
  traction: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${IC}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="20" height="6" rx="2"/><circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>`,
  city:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${IC}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
};

function svgImg(key: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const blob = new Blob([SVGS[key]], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload  = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = rej;
    img.src = url;
  });
}

function photoImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src = src;
    setTimeout(() => rej(new Error("timeout")), 12000);
  });
}

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
) {
  const s  = Math.max(dw / img.width, dh / img.height);
  const sw = img.width  * s;
  const sh = img.height * s;
  ctx.drawImage(img, dx + (dw - sw) / 2, dy + (dh - sh) / 2, sw, sh);
}

function priceCOP(n: number) {
  return "$ " + n.toLocaleString("es-CO");
}

// ── Canvas renderer ─────────────────────────────────────────────────────
//
// Fixed structure (all measurements in "1350-base px", scaled by S = H/1350):
//
//  ┌──────────────────────────────────────┐  0
//  │                                      │
//  │  [logo centered, screen blend]       │  ~16px
//  │  [@autohausmed centered]             │  ~76px
//  │                                      │
//  │        CAR PHOTO (object-cover)      │  0 → PHOTO_BOT
//  │                                      │
//  │  [bottom fade into dark panel]       │
//  ├──────────────────────────────────────┤  PHOTO_BOT (72% post / 65% story)
//  │  DARK PANEL  #0c0c0c                 │
//  │                                      │
//  │      BRAND  LINE                     │  brand baseline
//  │      Version  ·  Year               │  year baseline
//  │        ─────────────                 │  gold divider
//  │   KM  ·  Transmisión  ·  Combustible│  spec row 1
//  │         Tracción  ·  Ciudad         │  spec row 2 (post only)
//  │                                      │
//  │         PRECIO (story only)          │
//  │          $ 00.000.000               │
//  │                                      │
//  │         A U T O H A U S             │  wordmark
//  └──────────────────────────────────────┘  H

async function renderCanvas(
  v: Vehicle,
  photoUrl: string | undefined,
  fmt: Format,
): Promise<HTMLCanvasElement> {
  const isPost = fmt === "post";
  const H      = isPost ? 1350 : 1920;
  const S      = H / 1350;

  const canvas    = document.createElement("canvas");
  canvas.width    = W;
  canvas.height   = H;
  const ctx       = canvas.getContext("2d")!;
  await document.fonts.ready;

  const settled = await Promise.allSettled([
    photoUrl ? photoImg(photoUrl) : Promise.reject("no-photo"),
    photoImg("/logo-ah.jpeg"),
    svgImg("km"), svgImg("gear"), svgImg("fuel"), svgImg("traction"), svgImg("city"),
  ]);
  const g = (i: number): HTMLImageElement | null =>
    settled[i].status === "fulfilled"
      ? (settled[i] as PromiseFulfilledResult<HTMLImageElement>).value
      : null;

  const carImg = g(0); const logoImg = g(1);
  const iKm = g(2); const iGear = g(3); const iFuel = g(4); const iTrac = g(5); const iCity = g(6);

  // ── Zone heights ─────────────────────────────────────────────────────
  // Photo: 72% post, 65% story — rest is solid dark panel
  const PHOTO_H   = Math.round(H * (isPost ? 0.72 : 0.65));
  const PANEL_TOP = PHOTO_H;  // panel begins immediately after photo
  const PANEL_H   = H - PANEL_TOP;

  // Branding overlay on photo (scale = S relative to 1350)
  const LOGO_SZ  = Math.round(52 * S);
  const LOGO_Y   = Math.round(18 * S);
  const HANDLE_Y = LOGO_Y + LOGO_SZ + Math.round(14 * S);
  const HANDLE_FS = Math.round(24 * S);

  // Panel content baselines (measured from PANEL_TOP, at 1350-base px, then * S)
  const brandY   = PANEL_TOP + Math.round(110 * S);
  const yearY    = PANEL_TOP + Math.round(152 * S);
  const dividerY = PANEL_TOP + Math.round(182 * S);
  const spec1Y   = PANEL_TOP + Math.round(232 * S);
  const spec2Y   = PANEL_TOP + Math.round(274 * S);
  // story-only price
  const priceLabelY = PANEL_TOP + Math.round(348 * S);
  const priceY      = PANEL_TOP + Math.round(408 * S);

  // ── 1. Dark base fill ────────────────────────────────────────────────
  ctx.fillStyle = PANEL_BG;
  ctx.fillRect(0, 0, W, H);

  // ── 2. Car photo — clipped to photo zone (hard straight edge) ────────
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, PHOTO_H);
  ctx.clip();
  if (carImg) {
    coverDraw(ctx, carImg, 0, 0, W, PHOTO_H);
  } else {
    const gFb = ctx.createLinearGradient(0, 0, W, PHOTO_H);
    gFb.addColorStop(0, "#2a2a2a");
    gFb.addColorStop(1, "#141414");
    ctx.fillStyle = gFb;
    ctx.fillRect(0, 0, W, PHOTO_H);
  }
  // Top vignette — behind logo/handle
  const topV = ctx.createLinearGradient(0, 0, 0, Math.round(140 * S));
  topV.addColorStop(0, "rgba(0,0,0,0.60)");
  topV.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topV;
  ctx.fillRect(0, 0, W, Math.round(140 * S));
  // Bottom fade — photo transitions into panel
  const fade = Math.round(100 * S);
  const botV = ctx.createLinearGradient(0, PHOTO_H - fade, 0, PHOTO_H);
  botV.addColorStop(0, "rgba(12,12,12,0)");
  botV.addColorStop(1, "rgba(12,12,12,1)");
  ctx.fillStyle = botV;
  ctx.fillRect(0, PHOTO_H - fade, W, fade);
  ctx.restore();

  // ── 3. AH Logo (screen blend, over photo top) ────────────────────────
  if (logoImg) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(logoImg, (W - LOGO_SZ) / 2, LOGO_Y, LOGO_SZ, LOGO_SZ);
    ctx.restore();
  }

  // ── 4. @autohausmed ──────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font      = `500 ${HANDLE_FS}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("@autohausmed", W / 2, HANDLE_Y + HANDLE_FS);

  // ── 5. Brand + Line ──────────────────────────────────────────────────
  const header  = [v.brand, v.line].filter(Boolean).join("  ").toUpperCase();
  const hLen    = header.length;
  const brandFs = Math.round((hLen > 16 ? 68 : hLen > 12 ? 86 : hLen > 8 ? 106 : 128) * S);
  ctx.fillStyle = "#ffffff";
  ctx.font      = `800 ${brandFs}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(header, W / 2, brandY);

  // ── 6. Version + Year ────────────────────────────────────────────────
  const yearFs  = Math.round(34 * S);
  ctx.font      = `400 ${yearFs}px Inter, sans-serif`;
  const verTxt  = v.version?.trim() ? v.version.trim() + "   " : "";
  const yrTxt   = String(v.year);
  const verW    = ctx.measureText(verTxt).width;
  const yrW     = ctx.measureText(yrTxt).width;
  const subX    = (W - verW - yrW) / 2;
  ctx.textAlign = "left";
  if (verTxt) {
    ctx.fillStyle = "#707070";
    ctx.fillText(verTxt, subX, yearY);
  }
  ctx.fillStyle = GOLD;
  ctx.fillText(yrTxt, subX + verW, yearY);

  // ── 7. Gold divider (short, centered) ────────────────────────────────
  const divW = Math.round(140 * S);
  ctx.fillStyle = GOLD;
  ctx.globalAlpha = 0.7;
  ctx.fillRect((W - divW) / 2, dividerY, divW, Math.round(1.5 * S));
  ctx.globalAlpha = 1;

  // ── 8. Spec rows ─────────────────────────────────────────────────────
  const ICON_SZ  = Math.round(20 * S);
  const SPEC_FS  = Math.round(24 * S);
  const ICON_GAP = Math.round(7 * S);
  const DOT_R    = Math.round(2.8 * S);
  const SEP      = Math.round(42 * S);

  ctx.font = `400 ${SPEC_FS}px Inter, sans-serif`;

  function itemW(icon: HTMLImageElement | null, label: string): number {
    return (icon ? ICON_SZ + ICON_GAP : 0) + ctx.measureText(label.toUpperCase()).width;
  }

  function drawSpecRow(items: { icon: HTMLImageElement | null; label: string }[], y: number) {
    const total = items.reduce(
      (s, it, i) => s + itemW(it.icon, it.label) + (i < items.length - 1 ? SEP * 2 + DOT_R * 2 : 0),
      0,
    );
    let cx = (W - total) / 2;
    items.forEach((it, i) => {
      const iw = itemW(it.icon, it.label);
      if (it.icon) ctx.drawImage(it.icon, cx, y - Math.round(SPEC_FS * 0.80), ICON_SZ, ICON_SZ);
      ctx.fillStyle = "rgba(210,210,210,0.80)";
      ctx.font      = `400 ${SPEC_FS}px Inter, sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(it.label.toUpperCase(), cx + (it.icon ? ICON_SZ + ICON_GAP : 0), y);
      cx += iw;
      if (i < items.length - 1) {
        cx += SEP;
        ctx.beginPath();
        ctx.arc(cx, y - Math.round(SPEC_FS * 0.30), DOT_R, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,168,67,0.55)`;
        ctx.fill();
        cx += SEP;
      }
    });
  }

  // Row 1 (both formats): KM · Transmisión · Combustible
  drawSpecRow([
    { icon: iKm,   label: v.mileage.toLocaleString("es-CO") + " KM" },
    { icon: iGear, label: v.transmission },
    { icon: iFuel, label: v.fuel },
  ], spec1Y);

  // Row 2 (post only): Tracción · Tránsito
  if (isPost) {
    const r2: { icon: HTMLImageElement | null; label: string }[] = [];
    if (v.traction) r2.push({ icon: iTrac, label: v.traction });
    r2.push({ icon: iCity, label: v.cityRegistration });
    if (r2.length) drawSpecRow(r2, spec2Y);
  }

  // ── 9. Price (story only) ─────────────────────────────────────────────
  if (!isPost) {
    // PRECIO label
    const labelFs = Math.round(16 * S);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle   = GOLD;
    ctx.font        = `500 ${labelFs}px Inter, sans-serif`;
    ctx.textAlign   = "center";
    ctx.fillText("PRECIO", W / 2, priceLabelY);
    ctx.globalAlpha = 1;

    // Price value — large, clean
    const prStr  = priceCOP(v.targetPrice);
    const prFs   = Math.round((prStr.length > 17 ? 72 : 88) * S);
    ctx.fillStyle = GOLD;
    ctx.font      = `800 ${prFs}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(prStr, W / 2, priceY);
  }

  // ── 10. AUTOHAUS wordmark — very subtle ───────────────────────────────
  const wmFs = Math.round(13 * S);
  const wmY  = H - Math.round(28 * S);
  ctx.globalAlpha = 0.14;
  ctx.fillStyle   = "#ffffff";
  ctx.font        = `600 ${wmFs}px Inter, sans-serif`;
  ctx.textAlign   = "center";
  ctx.fillText("A U T O H A U S", W / 2, wmY);
  ctx.globalAlpha = 1;

  return canvas;
}

// ── Instagram caption ────────────────────────────────────────────────────
function buildCaption(v: Vehicle): string {
  const brand = v.brand.toLowerCase().replace(/\s+/g, "");
  const line  = v.line.toLowerCase().replace(/\s+/g, "");
  return [
    `${v.brand} ${v.line} ${v.year}${v.version?.trim() ? ` · ${v.version.trim()}` : ""}`,
    "",
    `📏 ${v.mileage.toLocaleString("es-CO")} km`,
    `⚙️ ${v.transmission}`,
    `⛽ ${v.fuel}`,
    ...(v.traction ? [`🔄 ${v.traction}`] : []),
    "",
    "📲 Escríbenos para más información",
    "@autohausmed",
    "",
    `#Autohaus #${brand}${line} #CarrosUsados #Medellín #VehículosUsados #AutohausMed`,
  ].join("\n");
}

// ── CSS Preview ──────────────────────────────────────────────────────────
//
// Mirrors the canvas layout exactly using CSS:
//  • Photo zone: top 72% (post) / 65% (story) — overflow:hidden, object-cover
//  • Info panel: remaining height — solid dark, all text centered
//
function DesignPreview({ v, photoUrl, fmt }: { v: Vehicle; photoUrl?: string; fmt: Format }) {
  const isPost     = fmt === "post";
  const header     = [v.brand, v.line].filter(Boolean).join("  ").toUpperCase();
  const priceStr   = priceCOP(v.targetPrice);
  const photoPct   = isPost ? 72 : 65;   // % of total height
  const panelPct   = 100 - photoPct;

  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-2xl select-none bg-[#0c0c0c]", isPost ? "aspect-[4/5]" : "aspect-[9/16]")}
      style={{ containerType: "inline-size" } as React.CSSProperties}
    >
      {/* ── Photo zone ─────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: `${photoPct}%` }}>
        {/* Car photo */}
        {photoUrl
          ? <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          : <div className="h-full w-full" style={{ background: "linear-gradient(135deg, #2a2a2a 0%, #141414 100%)" }} />
        }
        {/* Top vignette — logo area */}
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: "18%", background: "linear-gradient(to bottom, rgba(0,0,0,0.58) 0%, transparent 100%)", zIndex: 1 }}
        />
        {/* Bottom fade — transitions into dark panel */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: "16%", background: `linear-gradient(to bottom, transparent 0%, ${PANEL_BG} 100%)`, zIndex: 1 }}
        />

        {/* AH Logo */}
        <img
          src="/logo-ah.jpeg"
          alt=""
          className="absolute left-1/2 -translate-x-1/2"
          style={{ zIndex: 2, top: "2.8%", height: "8%", width: "auto", mixBlendMode: "screen", objectFit: "contain" }}
        />
        {/* @autohausmed */}
        <div className="absolute inset-x-0 flex justify-center" style={{ zIndex: 2, top: isPost ? "14%" : "13%" }}>
          <p style={{ fontSize: "2.5cqw", fontWeight: 500, color: "rgba(255,255,255,0.78)" }}>
            @autohausmed
          </p>
        </div>
      </div>

      {/* ── Info panel ─────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center"
        style={{ top: `${photoPct}%`, background: PANEL_BG, paddingTop: "5.5%", paddingBottom: "2%" }}
      >
        {/* Brand + Line */}
        <p
          className="truncate w-full text-center font-extrabold uppercase text-white"
          style={{ fontSize: "9.2cqw", lineHeight: 1.0, letterSpacing: "-0.01em", paddingInline: "4%" }}
        >
          {header}
        </p>

        {/* Version + Year */}
        <p className="mt-[1.5%]" style={{ fontSize: "3.1cqw", lineHeight: 1 }}>
          {v.version?.trim() && <span style={{ color: "#707070" }}>{v.version.trim()}{"   "}</span>}
          <span style={{ color: GOLD }}>{v.year}</span>
        </p>

        {/* Gold divider */}
        <div
          className="mt-[2.5%] mb-[0%]"
          style={{ width: "13cqw", height: "0.18%", minHeight: 1, background: GOLD, opacity: 0.7 }}
        />

        {/* Spec row 1: KM · Transmisión · Combustible */}
        <div
          className="mt-[3.5%] flex items-center justify-center"
          style={{ gap: "2.2%", fontSize: "2.2cqw", color: "rgba(210,210,210,0.80)", fontWeight: 400, width: "100%" }}
        >
          <span>{v.mileage.toLocaleString("es-CO")} KM</span>
          <span style={{ color: GOLD, opacity: 0.55, fontSize: "1.4cqw" }}>●</span>
          <span>{v.transmission.toUpperCase()}</span>
          <span style={{ color: GOLD, opacity: 0.55, fontSize: "1.4cqw" }}>●</span>
          <span>{v.fuel.toUpperCase()}</span>
        </div>

        {/* Spec row 2 (post only): Tracción · Ciudad */}
        {isPost && (
          <div
            className="mt-[2%] flex items-center justify-center"
            style={{ gap: "2.2%", fontSize: "2.2cqw", color: "rgba(210,210,210,0.80)", fontWeight: 400, width: "100%" }}
          >
            {v.traction && (
              <>
                <span>{v.traction.toUpperCase()}</span>
                <span style={{ color: GOLD, opacity: 0.55, fontSize: "1.4cqw" }}>●</span>
              </>
            )}
            <span>{v.cityRegistration.toUpperCase()}</span>
          </div>
        )}

        {/* Price (story only) */}
        {!isPost && (
          <div className="mt-auto mb-[6%] flex flex-col items-center" style={{ paddingTop: "5%" }}>
            <p style={{ fontSize: "1.5cqw", color: GOLD, opacity: 0.55, fontWeight: 500, letterSpacing: "0.1em" }}>PRECIO</p>
            <p className="mt-[1.5%]" style={{ fontSize: "8.2cqw", fontWeight: 800, color: GOLD, lineHeight: 1, letterSpacing: "-0.01em" }}>
              {priceStr}
            </p>
          </div>
        )}

        {/* Wordmark */}
        <p
          className={isPost ? "mt-auto" : ""}
          style={{ fontSize: "1.2cqw", color: "rgba(255,255,255,0.14)", fontWeight: 600, letterSpacing: "0.25em", paddingTop: isPost ? undefined : "2%" }}
        >
          A U T O H A U S
        </p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────
export function VehicleDesignCard({ vehicle, photos }: { vehicle: Vehicle; photos: VehiclePhoto[] }) {
  const [fmt, setFmt]           = useState<Format>("post");
  const [photoIdx, setPhotoIdx] = useState(0);
  const [dlPost, setDlPost]     = useState(false);
  const [dlStory, setDlStory]   = useState(false);
  const [dlError, setDlError]   = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);

  const primaryPhoto = photos[photoIdx]?.fileUrl;

  async function download(f: Format) {
    const setDl = f === "post" ? setDlPost : setDlStory;
    setDl(true);
    setDlError(null);
    try {
      const canvas = await renderCanvas(vehicle, primaryPhoto, f);
      canvas.toBlob((blob) => {
        if (!blob) { setDlError("Error generando imagen."); return; }
        const url = URL.createObjectURL(blob);
        const a   = document.createElement("a");
        a.href     = url;
        a.download = `autohaus-${vehicle.brand}-${vehicle.line}-${vehicle.year}-${f}.png`
          .toLowerCase().replace(/\s+/g, "-");
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch {
      setDlError("No se pudo generar. Verifica que la foto sea accesible.");
    } finally {
      setDl(false);
    }
  }

  function copyCaption() {
    navigator.clipboard.writeText(buildCaption(vehicle)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <div className="mx-auto max-w-sm space-y-4 animate-in">

      {/* Format toggle */}
      <div className="flex gap-1 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0a0a0a] p-1.5">
        {(["post", "story"] as Format[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFmt(f)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition-all duration-150",
              fmt === f ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            {f === "post"
              ? <><LayoutTemplate className="h-4 w-4" />Post 4:5</>
              : <><Maximize2 className="h-4 w-4" />Historia 9:16</>
            }
          </button>
        ))}
      </div>

      {/* Photo selector */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPhotoIdx(i)}
              className={cn(
                "h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                photoIdx === i ? "border-[#D4A843]" : "border-transparent opacity-50 hover:opacity-80",
              )}
            >
              <img src={p.fileUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-400">
          Sin fotos — sube fotos en la pestaña <strong>Documentos</strong> para el diseño completo.
        </p>
      )}

      {/* Preview */}
      <DesignPreview v={vehicle} photoUrl={primaryPhoto} fmt={fmt} />

      {dlError && (
        <p className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-2 text-xs text-red-400">
          {dlError}
        </p>
      )}

      {/* Download buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={dlPost}
          onClick={() => download("post")}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[#0f0f0f] py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#1a1a1a] disabled:opacity-60"
        >
          {dlPost ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Post 1080×1350
        </button>
        <button
          type="button"
          disabled={dlStory}
          onClick={() => download("story")}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[#0f0f0f] py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-[#1a1a1a] disabled:opacity-60"
        >
          {dlStory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Story 1080×1920
        </button>
      </div>

      {/* Copy caption */}
      <button
        type="button"
        onClick={copyCaption}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0a0a0a] py-2.5 text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
      >
        {copied
          ? <><Check className="h-4 w-4 text-green-400" />¡Descripción copiada!</>
          : <><Copy className="h-4 w-4" />Copiar descripción de Instagram</>
        }
      </button>

      <p className="text-center text-[11px] text-zinc-600">
        PNG · 1080px · listo para Instagram
      </p>
    </div>
  );
}
