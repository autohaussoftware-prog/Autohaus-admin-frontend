"use client";

import { useState } from "react";
import { Download, LayoutTemplate, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Vehicle, VehiclePhoto } from "@/types/vehicle";

type Format = "post" | "story";

/* ── SVG icons ───────────────────────────────────────────────────────── */

const SVGS: Record<string, string> = {
  speed:    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  gear:     `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  engine:   `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M7 8V5M12 8V5M17 8V5"/><path d="M21 13h2M1 13h2"/></svg>`,
  traction: `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="20" height="6" rx="2"/><circle cx="6" cy="5" r="2.5"/><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="19" r="2.5"/></svg>`,
  fuel:     `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><line x1="3" y1="22" x2="15" y2="22"/><path d="M15 10h2a2 2 0 0 1 2 2v5a1 1 0 0 0 2 0v-7l-3-3"/></svg>`,
};

function svgImg(key: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const blob = new Blob([SVGS[key]], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image(64, 64);
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = rej;
    img.src = url;
  });
}

function photoImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
    setTimeout(() => rej(new Error("timeout")), 12000);
  });
}

function coverDraw(ctx: CanvasRenderingContext2D, img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) {
  const scale = Math.max(dw / img.width, dh / img.height);
  const sw = dw / scale, sh = dh / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, dx, dy, dw, dh);
}

/* ── Canvas renderer ─────────────────────────────────────────────────── */

async function renderToCanvas(v: Vehicle, photoUrl: string | undefined, fmt: Format): Promise<HTMLCanvasElement> {
  const W = 1080;
  const H = fmt === "post" ? 1350 : 1920;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  await document.fonts.ready;

  const settled = await Promise.allSettled([
    photoUrl ? photoImg(photoUrl) : Promise.reject(),
    photoImg("/logo-ah.jpeg"),
    svgImg("speed"),
    svgImg("gear"),
    svgImg("engine"),
    svgImg("traction"),
    svgImg("fuel"),
  ]);
  const get = (i: number) => settled[i].status === "fulfilled" ? (settled[i] as PromiseFulfilledResult<HTMLImageElement>).value : null;
  const [carImg, logoImg, iSpeed, iGear, iEngine, iTraction, iFuel] = [get(0), get(1), get(2), get(3), get(4), get(5), get(6)];

  // Diagonal band: rises from lower-left to upper-right (/)
  // diagLY = where left edge of photo area ends (lower)
  // diagRY = where right edge of photo area ends (higher)
  const diagLY = Math.round(H * 0.607);
  const diagRY = Math.round(H * 0.562);
  const bandH  = 22;

  /* ── 1. Dark base (entire canvas) ── */
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, W, H);

  /* ── 2. Photo area (clipped above diagonal) ── */
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, diagRY - bandH);
  ctx.lineTo(0, diagLY - bandH);
  ctx.closePath();
  ctx.clip();

  if (carImg) {
    coverDraw(ctx, carImg, 0, 0, W, diagLY);
    // Top dark gradient so logo is legible over any photo
    const gOver = ctx.createLinearGradient(0, 0, 0, H * 0.28);
    gOver.addColorStop(0, "rgba(0,0,0,0.52)");
    gOver.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gOver;
    ctx.fillRect(0, 0, W, H * 0.28);
  } else {
    // Blank template: gray → white gradient
    const gTop = ctx.createLinearGradient(0, 0, 0, diagLY);
    gTop.addColorStop(0,    "#909090");
    gTop.addColorStop(0.22, "#c8c8c8");
    gTop.addColorStop(0.55, "#ffffff");
    gTop.addColorStop(1,    "#f0f0f0");
    ctx.fillStyle = gTop;
    ctx.fillRect(0, 0, W, diagLY);
  }
  ctx.restore();

  /* ── 3. AH logo (screen blend mode) ── */
  if (logoImg) {
    const sz = 108;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(logoImg, (W - sz) / 2, 52, sz, sz);
    ctx.restore();
  }

  /* ── 4. @autohausmed ── */
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.95)";
  ctx.shadowBlur  = 20;
  ctx.fillStyle   = "rgba(255,255,255,0.95)";
  ctx.font        = "600 38px Inter, sans-serif";
  ctx.textAlign   = "center";
  ctx.fillText("@autohausmed", W / 2, 192);
  ctx.restore();

  /* ── 5. Gold diagonal band ── */
  ctx.save();
  ctx.fillStyle = "#D4A843";
  ctx.beginPath();
  ctx.moveTo(0, diagLY - bandH);
  ctx.lineTo(W, diagRY - bandH);
  ctx.lineTo(W, diagRY);
  ctx.lineTo(0, diagLY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  /* ── 6. Dark panel content ── */
  const pY  = diagLY;  // left edge Y where panel begins
  const lX  = 52;
  const rX  = W - 52;

  const lastDigit   = v.plate.replace(/\D/g, "").at(-1) ?? "—";
  const techno      = v.technoDue?.trim() || "N/A";
  const subtitleTxt = [v.line, v.version?.trim()].filter(Boolean).join(" ");

  // Brand name (large, bold)
  const brandText = v.brand.toUpperCase();
  const brandFs   = brandText.length > 9 ? 86 : brandText.length > 7 ? 102 : 118;
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font      = `900 ${brandFs}px Inter, sans-serif`;
  ctx.fillText(brandText, lX, pY + 88);

  // Subtitle: line + version (gray) + year (gold)
  ctx.font = "36px Inter, sans-serif";
  let subX = lX;
  if (subtitleTxt) {
    ctx.fillStyle = "#888888";
    ctx.fillText(subtitleTxt, lX, pY + 130);
    subX = lX + ctx.measureText(subtitleTxt + " ").width;
  }
  ctx.fillStyle = "#D4A843";
  ctx.fillText(String(v.year), subX, pY + 130);

  // Horizontal divider (left ~60% only)
  ctx.strokeStyle = "#242424";
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(lX, pY + 152);
  ctx.lineTo(W * 0.61, pY + 152);
  ctx.stroke();

  // Spec helpers
  function specUnit(icon: HTMLImageElement | null, text: string, x: number, y: number): number {
    const IS = 30;
    if (icon) {
      ctx.drawImage(icon, x, y - IS + 5, IS, IS);
      x += IS + 7;
    }
    ctx.fillStyle   = "#c0c0c0";
    ctx.font        = "bold 26px Inter, sans-serif";
    ctx.textAlign   = "left";
    ctx.fillText(text.toUpperCase(), x, y);
    return x + ctx.measureText(text.toUpperCase()).width;
  }

  function pipe(x: number, y: number): number {
    ctx.fillStyle = "#333333";
    ctx.font      = "26px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("|", x + 9, y);
    return x + 34;
  }

  // Row 1: KM | Transmission | Motor
  const ROW1 = pY + 203;
  let x = lX;
  x = specUnit(iSpeed, v.mileage.toLocaleString("es-CO") + " KM", x, ROW1);
  x = pipe(x, ROW1);
  x = specUnit(iGear, v.transmission, x, ROW1);
  if (v.motor) {
    x = pipe(x, ROW1);
    specUnit(iEngine, v.motor, x, ROW1);
  }

  // Row 2: Traction | Fuel
  const ROW2 = pY + 254;
  x = lX;
  if (v.traction) {
    x = specUnit(iTraction, v.traction, x, ROW2);
    x = pipe(x, ROW2);
  }
  specUnit(iFuel, v.fuel, x, ROW2);

  /* ── Right column ── */
  const colRX = Math.round(W * 0.665);

  // Plate badge (yellow, like Colombian plate)
  const plateBY = pY + 93;
  const plateBW = 74;
  const plateBH = 36;
  ctx.fillStyle = "#E8C547";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(colRX, plateBY, plateBW, plateBH, 5);
  else ctx.rect(colRX, plateBY, plateBW, plateBH);
  ctx.fill();
  ctx.strokeStyle = "#b89c30";
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(colRX + 2, plateBY + 2, plateBW - 4, plateBH - 4, 3);
  else ctx.rect(colRX + 2, plateBY + 2, plateBW - 4, plateBH - 4);
  ctx.stroke();
  ctx.fillStyle = "#1a1000";
  ctx.font      = "bold 15px monospace";
  ctx.textAlign = "center";
  ctx.fillText("ABC-123", colRX + plateBW / 2, plateBY + plateBH * 0.7);

  // Digit + city
  const afterPlateX = colRX + plateBW + 14;
  ctx.textAlign = "left";
  ctx.fillStyle = "#D4A843";
  ctx.font      = "bold 30px Inter, sans-serif";
  ctx.fillText(lastDigit, afterPlateX, plateBY + 27);
  const digitW = ctx.measureText(lastDigit).width;
  ctx.fillStyle = "#ababab";
  ctx.font      = "28px Inter, sans-serif";
  ctx.fillText(" | " + v.cityRegistration.toUpperCase(), afterPlateX + digitW, plateBY + 27);

  // TECNO + SOAT
  ctx.textAlign = "left";
  ctx.font      = "26px Inter, sans-serif";
  ctx.fillStyle = "#555555";
  ctx.fillText("TECNO: ", colRX, pY + 162);
  ctx.fillStyle = "#b8b8b8";
  ctx.fillText(techno, colRX + ctx.measureText("TECNO: ").width, pY + 162);
  ctx.fillStyle = "#555555";
  ctx.fillText("SOAT: ", colRX, pY + 196);
  ctx.fillStyle = "#b8b8b8";
  ctx.fillText(v.soatDue || "—", colRX + ctx.measureText("SOAT: ").width, pY + 196);

  /* ── Price badge ── */
  const priceText = "$" + v.targetPrice.toLocaleString("es-CO");
  const priceFs   = priceText.length > 14 ? 52 : 64;
  const badgeH    = 90;
  const badgeY    = H - 132;
  const hPad      = 44;

  const priceGrd = ctx.createLinearGradient(hPad, 0, W - hPad, 0);
  priceGrd.addColorStop(0,    "#6b4c10");
  priceGrd.addColorStop(0.3,  "#D4A843");
  priceGrd.addColorStop(0.7,  "#D4A843");
  priceGrd.addColorStop(1,    "#6b4c10");
  ctx.fillStyle = priceGrd;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(hPad, badgeY, W - hPad * 2, badgeH, 16);
  else ctx.rect(hPad, badgeY, W - hPad * 2, badgeH);
  ctx.fill();

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur  = 10;
  ctx.fillStyle   = "#ffffff";
  ctx.font        = `bold ${priceFs}px Inter, sans-serif`;
  ctx.textAlign   = "center";
  ctx.fillText(priceText, W / 2, badgeY + badgeH * 0.67);
  ctx.restore();

  return canvas;
}

/* ── CSS Preview ─────────────────────────────────────────────────────── */

function DesignPreview({ v, photoUrl, fmt }: { v: Vehicle; photoUrl?: string; fmt: Format }) {
  const lastDigit   = v.plate.replace(/\D/g, "").at(-1) ?? "—";
  const techno      = v.technoDue?.trim() || "N/A";
  const priceText   = "$" + v.targetPrice.toLocaleString("es-CO");
  const subtitleTxt = [v.line, v.version?.trim()].filter(Boolean).join(" ");

  return (
    <div className={cn(
      "relative w-full overflow-hidden rounded-2xl select-none bg-[#0d0d0d]",
      fmt === "post" ? "aspect-[4/5]" : "aspect-[9/16]"
    )}>

      {/* Photo area – top ~61% */}
      <div className="absolute inset-x-0 top-0" style={{ height: "61%" }}>
        {photoUrl
          ? <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          : <div className="h-full w-full bg-gradient-to-b from-[#909090] via-[#d8d8d8] to-white" />
        }
        {/* Gradient overlay so logo is always readable */}
        <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black/50 to-transparent" />
      </div>

      {/* AH logo + handle */}
      <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 flex-col items-center gap-0.5">
        <img src="/logo-ah.jpeg" alt="AH" className="h-9 w-9 object-cover [mix-blend-mode:screen]" />
        <p className="text-[9px] font-semibold text-white [text-shadow:0_1px_8px_rgba(0,0,0,1)]">@autohausmed</p>
      </div>

      {/* Gold diagonal band (/) — wider than card so rotation doesn't leave gaps */}
      <div
        className="absolute z-10 bg-[#D4A843]"
        style={{
          left: "-8%",
          right: "-8%",
          top: "59.5%",
          height: "2%",
          transform: "rotate(-2.4deg)",
          transformOrigin: "0% center",
        }}
      />

      {/* Dark info panel */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col" style={{ top: "62%" }}>
        <div className="flex flex-1 gap-1 px-3 pt-2">

          {/* Left column */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-black uppercase leading-tight tracking-wide text-white">
              {v.brand}
            </p>
            <p className="mt-0.5 text-[8px] leading-none text-zinc-500">
              {subtitleTxt && <>{subtitleTxt} </>}
              <span className="text-[#D4A843]">{v.year}</span>
            </p>
            <div className="my-1 h-px bg-zinc-800" style={{ width: "62%" }} />
            <div className="space-y-0.5 text-[7.5px] leading-none text-zinc-400">
              <p className="truncate">
                ⊙ {v.mileage.toLocaleString("es-CO")} KM&nbsp;|&nbsp;⚙ {v.transmission}
                {v.motor ? <>&nbsp;|&nbsp;▣ {v.motor}</> : null}
              </p>
              <p className="truncate">
                {v.traction ? <>✦ {v.traction}&nbsp;|&nbsp;</> : null}⛽ {v.fuel}
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className="w-[40%] shrink-0 pt-0.5">
            <div className="flex flex-wrap items-center gap-1">
              <span className="rounded bg-[#E8C547] px-1 py-0.5 font-mono text-[6px] font-bold text-black">ABC-123</span>
              <span className="text-[10px] font-bold text-[#D4A843]">{lastDigit}</span>
              <span className="text-[8px] text-zinc-400">| {v.cityRegistration.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="mt-1 text-[7.5px] leading-snug text-zinc-500">
              <p>TECNO: <span className="text-zinc-300">{techno}</span></p>
              <p>SOAT: <span className="text-zinc-300">{v.soatDue || "—"}</span></p>
            </div>
          </div>
        </div>

        {/* Price badge */}
        <div className="mx-3 mb-2 mt-1 flex items-center justify-center rounded-xl bg-[linear-gradient(90deg,#6b4c10,#D4A843_30%,#D4A843_70%,#6b4c10)] py-2 shadow">
          <span className="text-base font-black text-white drop-shadow">{priceText}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */

export function VehicleDesignCard({ vehicle, photos }: { vehicle: Vehicle; photos: VehiclePhoto[] }) {
  const [fmt, setFmt]         = useState<Format>("post");
  const [photoIdx, setPhotoIdx] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState<string | null>(null);

  const primaryPhoto = photos[photoIdx]?.fileUrl;

  async function handleDownload() {
    setDownloading(true);
    setDlError(null);
    try {
      const canvas = await renderToCanvas(vehicle, primaryPhoto, fmt);
      canvas.toBlob((blob) => {
        if (!blob) { setDlError("Error generando imagen."); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${vehicle.brand}-${vehicle.line}-${vehicle.year}-${fmt}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch {
      setDlError("No se pudo generar. Verifica que la foto del vehículo sea accesible.");
    } finally {
      setDownloading(false);
    }
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
              fmt === f ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {f === "post"
              ? <><LayoutTemplate className="h-4 w-4" />Post 4:5</>
              : <><Maximize2 className="h-4 w-4" />Story 9:16</>
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
                photoIdx === i ? "border-[#D4A843]" : "border-transparent opacity-50 hover:opacity-80"
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
        <p className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-2 text-xs text-red-400">{dlError}</p>
      )}

      {/* Download */}
      <Button size="md" variant="primary" className="w-full" disabled={downloading} onClick={handleDownload}>
        {downloading
          ? <><Loader2 className="h-4 w-4 animate-spin" />Generando…</>
          : <><Download className="h-4 w-4" />Descargar {fmt === "post" ? "Post 1080×1350" : "Story 1080×1920"}</>
        }
      </Button>

      <p className="text-center text-[11px] text-zinc-600">
        PNG de alta resolución · datos del vehículo actualizados automáticamente
      </p>
    </div>
  );
}
