"use client";

import { useState } from "react";
import { Download, LayoutTemplate, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Vehicle, VehiclePhoto } from "@/types/vehicle";

type Format = "post" | "story";

/* ── SVG icons (loaded via Blob URL into canvas) ─────────────────────── */

const SVGS: Record<string, string> = {
  speed: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(200,200,200,1)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  gear:  `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(200,200,200,1)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  engine:`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(200,200,200,1)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M7 8V5M12 8V5M17 8V5"/></svg>`,
  traction:`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(200,200,200,1)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="8" rx="2"/><circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>`,
  fuel:  `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(200,200,200,1)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="15" y2="22"/><path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M14 10h2a2 2 0 0 1 2 2v3a2 2 0 0 0 4 0v-5l-3-3"/></svg>`,
};

function svgImg(key: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const blob = new Blob([SVGS[key]], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image(48, 48);
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

/* ── Main canvas render ──────────────────────────────────────────────── */

async function renderToCanvas(v: Vehicle, photoUrl: string | undefined, fmt: Format): Promise<HTMLCanvasElement> {
  const W = 1080;
  const H = fmt === "post" ? 1350 : 1920;
  const photoH = Math.floor(H * 0.595);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  await document.fonts.ready;

  // Load all assets in parallel (non-blocking failures)
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

  /* ── Photo ── */
  if (carImg) {
    coverDraw(ctx, carImg, 0, 0, W, photoH);
  } else {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, W, photoH);
    ctx.fillStyle = "#333";
    ctx.font = "40px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Sin foto", W / 2, photoH / 2);
  }

  // Bottom gradient on photo
  const g = ctx.createLinearGradient(0, photoH * 0.4, 0, photoH);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, photoH);

  /* ── AH Logo (screen blend) ── */
  if (logoImg) {
    const sz = 88;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(logoImg, (W - sz) / 2, 38, sz, sz);
    ctx.restore();
  }

  /* ── @autohausmed ── */
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.95)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "white";
  ctx.font = "bold 34px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("@autohausmed", W / 2, 164);
  ctx.restore();

  /* ── Gold diagonal separator ── */
  ctx.save();
  ctx.fillStyle = "#D4A843";
  ctx.beginPath();
  ctx.moveTo(0, photoH - 22);
  ctx.lineTo(W, photoH - 5);
  ctx.lineTo(W, photoH + 6);
  ctx.lineTo(0, photoH - 11);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  /* ── Dark panel ── */
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, photoH, W, H - photoH);

  const pY = photoH;
  const lX = 55;
  const rX = W - 55;

  const lastDigit = v.plate.replace(/\D/g, "").at(-1) ?? "—";
  const techno = v.technoDue?.trim() || "N/A";

  /* ── Line name ── */
  const lineText = v.line.toUpperCase();
  const lineFs = lineText.length > 10 ? 68 : lineText.length > 7 ? 80 : 92;
  ctx.textAlign = "left";
  ctx.fillStyle = "white";
  ctx.font = `bold ${lineFs}px Inter, sans-serif`;
  ctx.fillText(lineText, lX, pY + 88);

  /* ── Version + Year (subtitle) ── */
  ctx.font = "34px Inter, sans-serif";
  ctx.fillStyle = "#888";
  const versionTxt = v.version?.trim() || "";
  let subtitleX = lX;
  if (versionTxt) {
    ctx.fillText(versionTxt, lX, pY + 132);
    subtitleX = lX + ctx.measureText(versionTxt + " ").width;
  }
  ctx.fillStyle = "#D4A843";
  ctx.fillText(String(v.year), subtitleX, pY + 132);

  /* ── Divider line ── */
  ctx.strokeStyle = "#252525";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lX, pY + 154);
  ctx.lineTo(rX, pY + 154);
  ctx.stroke();

  /* ── Spec helper (icon + text, returns next X) ── */
  function specUnit(icon: HTMLImageElement | null, text: string, x: number, y: number): number {
    const IS = 34;
    if (icon) {
      ctx.drawImage(icon, x, y - IS + 4, IS, IS);
      x += IS + 10;
    }
    ctx.fillStyle = "#c8c8c8";
    ctx.font = "bold 26px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(text.toUpperCase(), x, y);
    return x + ctx.measureText(text.toUpperCase()).width;
  }

  function pipe(x: number, y: number): number {
    ctx.fillStyle = "#3a3a3a";
    ctx.font = "bold 26px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("|", x + 14, y);
    return x + 44;
  }

  const ROW1 = pY + 215;
  const ROW2 = pY + 270;

  // Row 1: KM | Transmission (left portion)
  let x = lX;
  x = specUnit(iSpeed, v.mileage.toLocaleString("es-CO") + " KM", x, ROW1);
  x = pipe(x, ROW1);
  specUnit(iGear, v.transmission, x, ROW1);

  // Row 2: Motor | Traction | Fuel
  x = lX;
  x = specUnit(iEngine, v.motor, x, ROW2);
  if (v.traction) {
    x = pipe(x, ROW2);
    x = specUnit(iTraction, v.traction, x, ROW2);
  }
  x = pipe(x, ROW2);
  specUnit(iFuel, v.fuel, x, ROW2);

  /* ── Plate badge (right) ── */
  const badgeW = 300, badgeH = 42;
  const badgeX = rX - badgeW;
  const badgeY = ROW1 - 34;
  ctx.fillStyle = "#171717";
  ctx.strokeStyle = "#D4A843";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
  else ctx.rect(badgeX, badgeY, badgeW, badgeH);
  ctx.fill();
  ctx.stroke();
  // "ABC-123" small label
  ctx.fillStyle = "#555";
  ctx.font = "bold 15px monospace, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("ABC-123", badgeX + 10, badgeY + 27);
  // Digit + city
  ctx.fillStyle = "#D4A843";
  ctx.font = "bold 21px Inter, sans-serif";
  ctx.fillText(lastDigit, badgeX + 120, badgeY + 28);
  ctx.fillStyle = "#bbb";
  ctx.font = "21px Inter, sans-serif";
  ctx.fillText(" | " + v.cityRegistration.toUpperCase(), badgeX + 142, badgeY + 28);

  // TECNO + SOAT (right, below badge)
  ctx.textAlign = "right";
  ctx.font = "24px Inter, sans-serif";
  ctx.fillStyle = "#555";
  ctx.fillText("TECNO: ", rX - ctx.measureText(techno).width, ROW1 + 38);
  ctx.fillStyle = "#aaa";
  ctx.fillText(techno, rX, ROW1 + 38);
  ctx.fillStyle = "#555";
  ctx.fillText("SOAT: ", rX - ctx.measureText(v.soatDue || "—").width, ROW1 + 68);
  ctx.fillStyle = "#aaa";
  ctx.fillText(v.soatDue || "—", rX, ROW1 + 68);

  /* ── Price badge ── */
  const badgePriceY = pY + 318;
  const badgePriceH = 116;
  const hPad = 40;
  const priceGrd = ctx.createLinearGradient(hPad, badgePriceY, W - hPad, badgePriceY);
  priceGrd.addColorStop(0, "#8A6520");
  priceGrd.addColorStop(0.4, "#D4A843");
  priceGrd.addColorStop(0.6, "#D4A843");
  priceGrd.addColorStop(1, "#8A6520");
  ctx.fillStyle = priceGrd;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(hPad, badgePriceY, W - hPad * 2, badgePriceH, 18);
  else ctx.rect(hPad, badgePriceY, W - hPad * 2, badgePriceH);
  ctx.fill();
  const priceText = "$" + v.targetPrice.toLocaleString("es-CO");
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "white";
  ctx.font = `bold ${priceText.length > 14 ? 56 : 66}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(priceText, W / 2, badgePriceY + badgePriceH * 0.68);
  ctx.restore();

  return canvas;
}

/* ── CSS Preview Card ────────────────────────────────────────────────── */

function DesignPreview({ v, photoUrl, fmt }: { v: Vehicle; photoUrl?: string; fmt: Format }) {
  const lastDigit = v.plate.replace(/\D/g, "").at(-1) ?? "—";
  const techno = v.technoDue?.trim() || "N/A";
  const priceText = "$" + v.targetPrice.toLocaleString("es-CO");

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl bg-[#0d0d0d] shadow-elevated select-none", fmt === "post" ? "aspect-[4/5]" : "aspect-[9/16]")}>

      {/* Photo */}
      <div className="absolute inset-x-0 top-0" style={{ height: "60%" }}>
        {photoUrl
          ? <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          : <div className="flex h-full w-full items-center justify-center bg-zinc-900"><span className="text-xs text-zinc-600">Sin foto</span></div>
        }
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
      </div>

      {/* Logo + handle */}
      <div className="absolute left-1/2 top-3 flex -translate-x-1/2 flex-col items-center gap-0.5">
        <img src="/logo-ah.jpeg" alt="AH" className="h-8 w-8 object-cover [mix-blend-mode:screen]" />
        <p className="text-[9px] font-semibold text-white drop-shadow-lg">@autohausmed</p>
      </div>

      {/* Gold separator */}
      <div className="absolute left-0 right-0 bg-[#D4A843]" style={{ top: "59.3%", height: "2px", transform: "skewY(-0.6deg)", transformOrigin: "left" }} />

      {/* Dark info panel */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col" style={{ top: "61%" }}>
        <div className="flex flex-1 px-3 pt-1.5 pb-1">
          {/* Left column */}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-black uppercase leading-tight text-white">{v.line}</h2>
            <p className="text-[9px] leading-none text-zinc-500">
              {v.version && <span>{v.version} </span>}
              <span className="text-[#D4A843]">{v.year}</span>
            </p>
            <div className="my-1 h-px bg-zinc-800" />
            <div className="space-y-0.5 text-[8.5px] text-zinc-400 leading-none">
              <p className="truncate">⊙ {v.mileage.toLocaleString("es-CO")} KM &nbsp;|&nbsp; ⚙ {v.transmission}</p>
              <p className="truncate">▣ {v.motor}{v.traction ? ` | ✦ ${v.traction}` : ""} | ⛽ {v.fuel}</p>
            </div>
          </div>
          {/* Right column */}
          <div className="w-24 shrink-0 pl-2 pt-0.5">
            <div className="inline-flex items-center gap-0.5 rounded border border-[#D4A843]/40 bg-[#D4A843]/10 px-1 py-0.5">
              <span className="text-[7px] text-zinc-500">ABC</span>
              <span className="text-[10px] font-bold text-[#D4A843]">{lastDigit}</span>
              <span className="text-[7px] text-zinc-500">|{v.cityRegistration.slice(0, 8)}</span>
            </div>
            <div className="mt-0.5 text-[7px] leading-tight text-zinc-500">
              <p>TECNO: <span className="text-zinc-400">{techno}</span></p>
              <p>SOAT: <span className="text-zinc-400">{v.soatDue || "—"}</span></p>
            </div>
          </div>
        </div>
        {/* Price badge */}
        <div className="mx-3 mb-2 flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8A6520,#D4A843,#8A6520)] py-2 shadow-gold-sm">
          <span className="text-sm font-black text-white drop-shadow">{priceText}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */

export function VehicleDesignCard({ vehicle, photos }: { vehicle: Vehicle; photos: VehiclePhoto[] }) {
  const [fmt, setFmt] = useState<Format>("post");
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
          <button key={f} type="button" onClick={() => setFmt(f)} className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition-all duration-150", fmt === f ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300")}>
            {f === "post" ? <><LayoutTemplate className="h-4 w-4" />Post 4:5</> : <><Maximize2 className="h-4 w-4" />Story 9:16</>}
          </button>
        ))}
      </div>

      {/* Photo selector */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {photos.map((p, i) => (
            <button key={p.id} type="button" onClick={() => setPhotoIdx(i)} className={cn("h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all", photoIdx === i ? "border-[#D4A843]" : "border-transparent opacity-50 hover:opacity-80")}>
              <img src={p.fileUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-400">
          Sin fotos — sube fotos en la pestaña <strong>Documentos</strong> para el diseño completo.
        </div>
      )}

      {/* Preview */}
      <DesignPreview v={vehicle} photoUrl={primaryPhoto} fmt={fmt} />

      {/* Error */}
      {dlError && <p className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-2 text-xs text-red-400">{dlError}</p>}

      {/* Download */}
      <Button size="md" variant="primary" className="w-full" disabled={downloading} onClick={handleDownload}>
        {downloading
          ? <><Loader2 className="h-4 w-4 animate-spin" />Generando…</>
          : <><Download className="h-4 w-4" />Descargar {fmt === "post" ? "Post 1080×1350" : "Story 1080×1920"}</>
        }
      </Button>

      <p className="text-center text-[11px] text-zinc-600">PNG de alta resolución listo para publicar · datos actualizados automáticamente</p>
    </div>
  );
}
