"use client";

import { useState } from "react";
import { Check, Copy, Download, LayoutTemplate, Loader2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vehicle, VehiclePhoto } from "@/types/vehicle";

type Format = "post" | "story";

const GOLD      = "#D4A843";
const GOLD_DARK = "#1a0e00";
const W         = 1080;

// ── SVG icons ─────────────────────────────────────────────────────────
const IC = "rgba(255,255,255,0.72)";
const SVGS: Record<string, string> = {
  km:       `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${IC}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  gear:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${IC}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  fuel:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${IC}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><line x1="3" y1="22" x2="15" y2="22"/><path d="M15 10h2a2 2 0 0 1 2 2v5a1 1 0 0 0 2 0v-7l-3-3"/></svg>`,
  traction: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${IC}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="9" width="20" height="6" rx="2"/><circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>`,
  city:     `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${IC}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
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

// ── Canvas renderer ────────────────────────────────────────────────────
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
  const iKm = g(2); const iGear = g(3); const iFuel = g(4);
  const iTrac = g(5); const iCity = g(6);

  // ── Layout: all values scaled relative to 1350px height ────────────
  const PANEL_Y  = Math.round(H * (isPost ? 0.660 : 0.615));
  const BRAND_Y  = PANEL_Y + Math.round(70  * S);
  const YEAR_Y   = PANEL_Y + Math.round(112 * S);
  const SPEC1_Y  = PANEL_Y + Math.round(165 * S);
  const SPEC2_Y  = PANEL_Y + Math.round(210 * S);
  const PRICE_Y  = PANEL_Y + Math.round(300 * S);

  const HANDLE_Y = Math.round((isPost ? 96 : 72) * S);
  const LOGO_SZ  = Math.round((isPost ? 74 : 56) * S);
  const LOGO_Y   = HANDLE_Y - LOGO_SZ - Math.round(8 * S);
  const HANDLE_FS = Math.round(28 * S);

  const MX = Math.round(58 * S);

  // ── 1. Dark base ────────────────────────────────────────────────────
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  // ── 2. Car photo — full-bleed, object-cover ─────────────────────────
  if (carImg) {
    coverDraw(ctx, carImg, 0, 0, W, H);
  }

  // ── 3. Bottom dark gradient overlay ─────────────────────────────────
  {
    const grad = ctx.createLinearGradient(0, H * 0.28, 0, H);
    grad.addColorStop(0,    "rgba(8,8,8,0)");
    grad.addColorStop(0.28, "rgba(8,8,8,0.42)");
    grad.addColorStop(0.52, "rgba(8,8,8,0.80)");
    grad.addColorStop(0.74, "rgba(8,8,8,0.94)");
    grad.addColorStop(1,    "rgba(8,8,8,0.99)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // ── 4. Top vignette (behind logo / handle) ───────────────────────────
  {
    const tv = ctx.createLinearGradient(0, 0, 0, H * 0.20);
    tv.addColorStop(0, "rgba(0,0,0,0.55)");
    tv.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = tv;
    ctx.fillRect(0, 0, W, H * 0.20);
  }

  // ── 5. Gold separator line ───────────────────────────────────────────
  ctx.fillStyle = GOLD;
  ctx.fillRect(MX, PANEL_Y, W - MX * 2, Math.round(2.5 * S));

  // ── 6. AH Logo ──────────────────────────────────────────────────────
  if (logoImg) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(logoImg, (W - LOGO_SZ) / 2, LOGO_Y, LOGO_SZ, LOGO_SZ);
    ctx.restore();
  }

  // ── 7. @autohausmed handle ───────────────────────────────────────────
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,1)";
  ctx.shadowBlur  = 22;
  ctx.fillStyle   = "rgba(255,255,255,0.88)";
  ctx.font        = `600 ${HANDLE_FS}px Inter, sans-serif`;
  ctx.textAlign   = "center";
  ctx.fillText("@autohausmed", W / 2, HANDLE_Y);
  ctx.restore();

  // ── 8. Brand + Line ─────────────────────────────────────────────────
  const header  = [v.brand, v.line].filter(Boolean).join("  ").toUpperCase();
  const hLen    = header.length;
  const brandFs = Math.round((hLen > 16 ? 68 : hLen > 12 ? 86 : hLen > 8 ? 104 : 126) * S);
  ctx.fillStyle = "#ffffff";
  ctx.font      = `900 ${brandFs}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(header, W / 2, BRAND_Y);

  // ── 9. Version · Year ────────────────────────────────────────────────
  const yearFs  = Math.round(36 * S);
  ctx.font      = `400 ${yearFs}px Inter, sans-serif`;
  const verTxt  = v.version?.trim() ? v.version.trim() + "  " : "";
  const yrTxt   = String(v.year);
  const verW    = ctx.measureText(verTxt).width;
  const yrW     = ctx.measureText(yrTxt).width;
  const subX    = (W - verW - yrW) / 2;
  ctx.textAlign = "left";
  if (verTxt) {
    ctx.fillStyle = "#888888";
    ctx.fillText(verTxt, subX, YEAR_Y);
  }
  ctx.fillStyle = GOLD;
  ctx.fillText(yrTxt, subX + verW, YEAR_Y);

  // ── 10. Spec rows ────────────────────────────────────────────────────
  const ICON_SZ  = Math.round(28 * S);
  const SPEC_FS  = Math.round(26 * S);
  const ICON_GAP = 10;
  const DOT_R    = Math.round(3.5 * S);
  const SEP      = Math.round(50 * S);

  ctx.font = `500 ${SPEC_FS}px Inter, sans-serif`;

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
      if (it.icon) ctx.drawImage(it.icon, cx, y - Math.round(SPEC_FS * 0.84), ICON_SZ, ICON_SZ);
      ctx.fillStyle = "rgba(255,255,255,0.76)";
      ctx.font      = `500 ${SPEC_FS}px Inter, sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(it.label.toUpperCase(), cx + (it.icon ? ICON_SZ + ICON_GAP : 0), y);
      cx += iw;
      if (i < items.length - 1) {
        cx += SEP;
        ctx.beginPath();
        ctx.arc(cx, y - Math.round(SPEC_FS * 0.28), DOT_R, 0, Math.PI * 2);
        ctx.fillStyle = GOLD;
        ctx.fill();
        cx += SEP;
      }
    });
  }

  // Row 1: KM · Transmisión · Combustible
  drawSpecRow([
    { icon: iKm,   label: v.mileage.toLocaleString("es-CO") + " KM" },
    { icon: iGear, label: v.transmission },
    { icon: iFuel, label: v.fuel },
  ], SPEC1_Y);

  // Row 2 (post only): Tracción · Tránsito
  if (isPost) {
    const r2: { icon: HTMLImageElement | null; label: string }[] = [];
    if (v.traction) r2.push({ icon: iTrac, label: v.traction });
    r2.push({ icon: iCity, label: v.cityRegistration });
    if (r2.length) drawSpecRow(r2, SPEC2_Y);
  }

  // ── 11. Price pill (story only) ──────────────────────────────────────
  if (!isPost) {
    const prStr  = priceCOP(v.targetPrice);
    const prFs   = Math.round((prStr.length > 17 ? 72 : 90) * S);
    ctx.font     = `900 ${prFs}px Inter, sans-serif`;
    const ptw    = ctx.measureText(prStr).width;
    const padX   = Math.round(54 * S);
    const padY   = Math.round(18 * S);
    const pillH  = prFs + padY * 2;
    const pillW  = ptw + padX * 2;
    const pillX  = (W - pillW) / 2;
    const pillTop = PRICE_Y - prFs - padY;
    const pillR  = Math.round(pillH * 0.14);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.65)";
    ctx.shadowBlur  = Math.round(24 * S);
    ctx.fillStyle   = GOLD;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(pillX, pillTop, pillW, pillH, pillR);
    else ctx.rect(pillX, pillTop, pillW, pillH);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = GOLD_DARK;
    ctx.textAlign = "center";
    ctx.fillText(prStr, W / 2, PRICE_Y);
  }

  // ── 12. AUTOHAUS wordmark — very subtle ──────────────────────────────
  const wmFs = Math.round(14 * S);
  const wmY  = H - Math.round(36 * S);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.font      = `600 ${wmFs}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("A U T O H A U S", W / 2, wmY);

  return canvas;
}

// ── Instagram caption ──────────────────────────────────────────────────
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

// ── CSS Preview ────────────────────────────────────────────────────────
function DesignPreview({ v, photoUrl, fmt }: { v: Vehicle; photoUrl?: string; fmt: Format }) {
  const isPost   = fmt === "post";
  const header   = [v.brand, v.line].filter(Boolean).join("  ").toUpperCase();
  const priceStr = priceCOP(v.targetPrice);
  const panelPct = isPost ? 66.0 : 61.5;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl select-none bg-[#0a0a0a]",
        isPost ? "aspect-[4/5]" : "aspect-[9/16]",
      )}
      style={{ containerType: "inline-size" } as React.CSSProperties}
    >
      {/* Full-bleed photo */}
      {photoUrl
        ? <img src={photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ zIndex: 1 }} />
        : <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-950" style={{ zIndex: 1 }} />
      }

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 2,
          background: "linear-gradient(to bottom, transparent 0%, transparent 28%, rgba(8,8,8,0.42) 42%, rgba(8,8,8,0.82) 56%, rgba(8,8,8,0.96) 72%, rgba(8,8,8,0.99) 100%)",
        }}
      />

      {/* Top vignette */}
      <div
        className="absolute inset-x-0 top-0"
        style={{ zIndex: 2, height: "20%", background: "linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, transparent 100%)" }}
      />

      {/* AH Logo */}
      <img
        src="/logo-ah.jpeg"
        alt=""
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          zIndex: 3,
          top: isPost ? "2.0%" : "1.5%",
          height: isPost ? "5.5%" : "4.2%",
          width: "auto",
          mixBlendMode: "screen",
          objectFit: "contain",
        }}
      />

      {/* @autohausmed */}
      <div
        className="absolute inset-x-0 flex justify-center"
        style={{ zIndex: 3, top: isPost ? "8.6%" : "6.5%" }}
      >
        <p style={{ fontSize: "2.7cqw", fontWeight: 600, color: "rgba(255,255,255,0.88)", textShadow: "0 0 14px rgba(0,0,0,1)" }}>
          @autohausmed
        </p>
      </div>

      {/* Gold separator line */}
      <div
        className="absolute"
        style={{ zIndex: 3, top: `${panelPct}%`, left: "5.5%", right: "5.5%", height: "0.22%", background: GOLD }}
      />

      {/* Brand + Line */}
      <div
        className="absolute inset-x-0 text-center"
        style={{ zIndex: 3, top: `${panelPct + 2.2}%` }}
      >
        <p
          className="truncate px-[4%] font-black uppercase text-white"
          style={{ fontSize: "9.6cqw", lineHeight: 1, letterSpacing: "-0.01em" }}
        >
          {header}
        </p>
        <p className="mt-[0.8%]" style={{ fontSize: "3.3cqw", lineHeight: 1 }}>
          {v.version?.trim() && <span style={{ color: "#888" }}>{v.version.trim()}{"  "}</span>}
          <span style={{ color: GOLD }}>{v.year}</span>
        </p>
      </div>

      {/* Spec rows */}
      <div
        className="absolute inset-x-0 flex flex-col items-center"
        style={{ zIndex: 3, top: `${panelPct + 11.8}%`, gap: "1.4%" }}
      >
        {/* Row 1: KM · Transmisión · Combustible */}
        <div
          className="flex items-center"
          style={{ gap: "2.6%", fontSize: "2.5cqw", color: "rgba(255,255,255,0.76)", fontWeight: 500 }}
        >
          <span>{v.mileage.toLocaleString("es-CO")} KM</span>
          <span style={{ color: GOLD, fontSize: "1.6cqw" }}>●</span>
          <span>{v.transmission.toUpperCase()}</span>
          <span style={{ color: GOLD, fontSize: "1.6cqw" }}>●</span>
          <span>{v.fuel.toUpperCase()}</span>
        </div>

        {/* Row 2 (post only): Tracción · Ciudad */}
        {isPost && (
          <div
            className="flex items-center"
            style={{ gap: "2.6%", fontSize: "2.5cqw", color: "rgba(255,255,255,0.76)", fontWeight: 500 }}
          >
            {v.traction && (
              <>
                <span>{v.traction.toUpperCase()}</span>
                <span style={{ color: GOLD, fontSize: "1.6cqw" }}>●</span>
              </>
            )}
            <span>{v.cityRegistration.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Price pill (story only) */}
      {!isPost && (
        <div
          className="absolute inset-x-[10%] flex items-center justify-center"
          style={{ zIndex: 3, top: `${panelPct + 22}%`, height: "8%" }}
        >
          <div
            className="flex items-center justify-center rounded-[12%] px-[5%]"
            style={{ background: GOLD, minWidth: "55%", height: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.65)" }}
          >
            <span style={{ fontSize: "8cqw", fontWeight: 900, color: GOLD_DARK, letterSpacing: "-0.01em" }}>
              {priceStr}
            </span>
          </div>
        </div>
      )}

      {/* AUTOHAUS wordmark */}
      <div
        className="absolute inset-x-0 flex justify-center"
        style={{ zIndex: 3, bottom: "2%" }}
      >
        <p style={{ fontSize: "1.3cqw", color: "rgba(255,255,255,0.16)", fontWeight: 600, letterSpacing: "0.25em" }}>
          A U T O H A U S
        </p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────
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

      {/* Live preview */}
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
