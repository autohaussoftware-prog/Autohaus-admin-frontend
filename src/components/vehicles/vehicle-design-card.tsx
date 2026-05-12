"use client";

import { useState } from "react";
import { Download, Loader2, Maximize2, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";
import type { VehiclePhoto } from "@/types/vehicle";

type Format = "post" | "story";

/* ── Canvas helpers ──────────────────────────────────────────────────── */

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("img-error"));
    img.src = src;
    setTimeout(() => reject(new Error("timeout")), 12000);
  });
}

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number
) {
  const scale = Math.max(dw / img.width, dh / img.height);
  const sw = dw / scale, sh = dh / scale;
  const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

async function renderToCanvas(
  vehicle: Vehicle,
  primaryPhoto: string | undefined,
  format: Format
): Promise<HTMLCanvasElement> {
  const W = 1080;
  const H = format === "post" ? 1350 : 1920;
  const PHOTO_FRAC = format === "post" ? 0.60 : 0.64;
  const photoH = Math.floor(H * PHOTO_FRAC);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  await document.fonts.ready;

  /* ── Photo background ── */
  if (primaryPhoto) {
    try {
      const img = await loadImg(primaryPhoto);
      coverDraw(ctx, img, 0, 0, W, photoH);
    } catch {
      ctx.fillStyle = "#1c1c1c";
      ctx.fillRect(0, 0, W, photoH);
    }
  } else {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, W, photoH);
    ctx.fillStyle = "#333";
    ctx.font = "40px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Sin foto", W / 2, photoH / 2);
  }

  /* ── Dark gradient at bottom of photo ── */
  const grd = ctx.createLinearGradient(0, photoH * 0.45, 0, photoH);
  grd.addColorStop(0, "rgba(0,0,0,0)");
  grd.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, photoH);

  /* ── AH logo (top center) ── */
  try {
    const logo = await loadImg("/logo-ah.jpeg");
    const sz = 88;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(logo, (W - sz) / 2, 38, sz, sz);
    ctx.restore();
  } catch { /* skip */ }

  /* ── @autohausmed ── */
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "white";
  ctx.font = "bold 34px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("@autohausmed", W / 2, 162);
  ctx.restore();

  /* ── Gold diagonal separator ── */
  ctx.save();
  ctx.fillStyle = "#D4A843";
  ctx.beginPath();
  ctx.moveTo(0, photoH - 20);
  ctx.lineTo(W, photoH - 5);
  ctx.lineTo(W, photoH + 6);
  ctx.lineTo(0, photoH - 9);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  /* ── Dark info panel ── */
  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, photoH, W, H - photoH);

  const pY = photoH + 14;
  const lX = 55;
  const rX = W - 55;
  const lastDigit = vehicle.plate.replace(/\D/g, "").at(-1) ?? "—";
  const techno = vehicle.technoDue?.trim() || "N/A";

  /* Line name */
  const lineFs = vehicle.line.length > 10 ? 64 : vehicle.line.length > 7 ? 76 : 90;
  ctx.textAlign = "left";
  ctx.fillStyle = "white";
  ctx.font = `bold ${lineFs}px Inter, sans-serif`;
  ctx.fillText(vehicle.line.toUpperCase(), lX, pY + 86);

  /* Brand + Year */
  ctx.font = "36px Inter, sans-serif";
  ctx.fillStyle = "#777";
  const brandW = ctx.measureText(vehicle.brand + " ").width;
  ctx.fillText(vehicle.brand + " ", lX, pY + 134);
  ctx.fillStyle = "#D4A843";
  ctx.fillText(String(vehicle.year), lX + brandW, pY + 134);

  /* Divider */
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(lX, pY + 158);
  ctx.lineTo(rX, pY + 158);
  ctx.stroke();

  /* Left specs */
  ctx.fillStyle = "#c8c8c8";
  ctx.font = "30px Inter, sans-serif";
  const km = vehicle.mileage.toLocaleString("es-CO") + " KM";
  ctx.fillText([km, vehicle.transmission, vehicle.motor].filter(Boolean).join("  |  "), lX, pY + 208);
  const row2 = [vehicle.traction, vehicle.fuel].filter(Boolean).join("  |  ");
  if (row2) ctx.fillText(row2, lX, pY + 253);

  /* Right: digit + city */
  ctx.textAlign = "right";
  ctx.font = "bold 28px Inter, sans-serif";
  ctx.fillStyle = "#D4A843";
  ctx.fillText(`${lastDigit} | ${vehicle.cityRegistration}`, rX, pY + 208);

  ctx.font = "26px Inter, sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText(`TECNO: ${techno}`, rX, pY + 252);
  ctx.fillText(`SOAT: ${vehicle.soatDue || "—"}`, rX, pY + 290);

  return canvas;
}

/* ── CSS Preview Card ────────────────────────────────────────────────── */

function DesignPreview({
  vehicle,
  photoUrl,
  format,
}: {
  vehicle: Vehicle;
  photoUrl: string | undefined;
  format: Format;
}) {
  const lastDigit = vehicle.plate.replace(/\D/g, "").at(-1) ?? "—";
  const techno = vehicle.technoDue?.trim() || "N/A";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl bg-[#0d0d0d] shadow-elevated select-none",
        format === "post" ? "aspect-[4/5]" : "aspect-[9/16]"
      )}
    >
      {/* Photo zone */}
      <div className="absolute inset-x-0 top-0" style={{ height: "60%" }}>
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-900">
            <span className="text-xs text-zinc-600">Sin foto principal</span>
          </div>
        )}
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
      </div>

      {/* Logo + handle */}
      <div className="absolute left-1/2 top-3 flex -translate-x-1/2 flex-col items-center gap-0.5">
        <img
          src="/logo-ah.jpeg"
          alt="AH"
          className="h-8 w-8 object-cover [mix-blend-mode:screen]"
        />
        <p className="text-[10px] font-semibold text-white drop-shadow-lg">@autohausmed</p>
      </div>

      {/* Gold separator */}
      <div
        className="absolute left-0 right-0 bg-[#D4A843]"
        style={{ top: "59.2%", height: "2px", transform: "skewY(-0.8deg)", transformOrigin: "left" }}
      />

      {/* Dark info panel */}
      <div className="absolute bottom-0 left-0 right-0 flex" style={{ top: "61%" }}>
        {/* Left column */}
        <div className="min-w-0 flex-1 px-3 pt-2 pb-2">
          <h2 className="truncate text-lg font-black uppercase leading-tight text-white">
            {vehicle.line}
          </h2>
          <p className="text-[10px] text-zinc-500 leading-none">
            {vehicle.brand}{" "}
            <span className="text-[#D4A843]">{vehicle.year}</span>
          </p>
          <div className="my-1.5 h-px bg-zinc-800" />
          <div className="space-y-0.5 text-[9px] text-zinc-400 leading-tight">
            <p className="truncate">
              {vehicle.mileage.toLocaleString("es-CO")} KM
              {vehicle.transmission ? ` | ${vehicle.transmission}` : ""}
              {vehicle.motor ? ` | ${vehicle.motor}` : ""}
            </p>
            {(vehicle.traction || vehicle.fuel) && (
              <p className="truncate">
                {[vehicle.traction, vehicle.fuel].filter(Boolean).join(" | ")}
              </p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="w-24 shrink-0 border-l border-zinc-800 px-2 pt-2 pb-2 text-right">
          <div className="inline-flex items-center gap-1 rounded border border-[#D4A843]/40 bg-[#D4A843]/10 px-1.5 py-0.5">
            <span className="text-[10px] font-bold text-[#D4A843]">{lastDigit}</span>
            <span className="text-[8px] text-zinc-500">| {vehicle.cityRegistration}</span>
          </div>
          <div className="mt-1.5 space-y-0.5 text-[8px] text-zinc-500 leading-tight">
            <p>TECNO: <span className="text-zinc-400">{techno}</span></p>
            <p>SOAT: <span className="text-zinc-400">{vehicle.soatDue || "—"}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */

export function VehicleDesignCard({
  vehicle,
  photos,
}: {
  vehicle: Vehicle;
  photos: VehiclePhoto[];
}) {
  const [format, setFormat] = useState<Format>("post");
  const [photoIdx, setPhotoIdx] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState<string | null>(null);

  const primaryPhoto = photos[photoIdx]?.fileUrl;

  async function handleDownload() {
    setDownloading(true);
    setDlError(null);
    try {
      const canvas = await renderToCanvas(vehicle, primaryPhoto, format);
      canvas.toBlob((blob) => {
        if (!blob) { setDlError("Error generando imagen."); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${vehicle.brand}-${vehicle.line}-${vehicle.year}-${format}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch {
      setDlError("No se pudo generar la imagen. Verifica que la foto sea accesible.");
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
            onClick={() => setFormat(f)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition-all duration-150",
              format === f ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {f === "post"
              ? <><LayoutTemplate className="h-4 w-4" /> Post (4:5)</>
              : <><Maximize2 className="h-4 w-4" /> Story (9:16)</>
            }
          </button>
        ))}
      </div>

      {/* Photo selector */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPhotoIdx(i)}
              className={cn(
                "h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition",
                photoIdx === i ? "border-[#D4A843]" : "border-transparent opacity-50 hover:opacity-75"
              )}
            >
              <img src={p.fileUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-xs text-amber-400">
          Sin fotos — sube fotos en la pestaña <strong>Documentos</strong> para generar el diseño completo.
        </div>
      )}

      {/* Preview card */}
      <DesignPreview vehicle={vehicle} photoUrl={primaryPhoto} format={format} />

      {/* Download */}
      {dlError && (
        <p className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-2 text-xs text-red-400">
          {dlError}
        </p>
      )}

      <Button
        size="md"
        variant="primary"
        className="w-full"
        disabled={downloading}
        onClick={handleDownload}
      >
        {downloading
          ? <><Loader2 className="h-4 w-4 animate-spin" />Generando…</>
          : <><Download className="h-4 w-4" />Descargar {format === "post" ? "Post 1080×1350" : "Story 1080×1920"}</>
        }
      </Button>

      <p className="text-center text-[11px] text-zinc-600">
        Se descarga como PNG de alta resolución listo para publicar.
      </p>
    </div>
  );
}
