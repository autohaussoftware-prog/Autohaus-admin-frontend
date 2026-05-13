"use client";

import { useState } from "react";
import { Download, LayoutTemplate, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Vehicle, VehiclePhoto } from "@/types/vehicle";

type Format = "post" | "story";
type Theme  = "bmw" | "rockse";

interface ThemeCfg {
  label:       string;
  dot:         string;
  panelBg:     string;
  accent:      string;
  accentDark:  string;
  divider:     string;
  specText:    string;
  plateBg:     string;
  plateBorder: string;
  plateText:   string;
}

const THEMES: Record<Theme, ThemeCfg> = {
  bmw: {
    label:       "BMW · Negro",
    dot:         "#D4A843",
    panelBg:     "#0d0d0d",
    accent:      "#D4A843",
    accentDark:  "#6b4c10",
    divider:     "#242424",
    specText:    "#c0c0c0",
    plateBg:     "#E8C547",
    plateBorder: "#b89c30",
    plateText:   "#1a1000",
  },
  rockse: {
    label:       "ROCKS-E · Gris",
    dot:         "#F5C518",
    panelBg:     "#1b1b1b",
    accent:      "#F5C518",
    accentDark:  "#7a6200",
    divider:     "#2d2d2d",
    specText:    "#c8c8c8",
    plateBg:     "#F5C518",
    plateBorder: "#c4a000",
    plateText:   "#1a1400",
  },
};

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

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
) {
  const scale = Math.max(dw / img.width, dh / img.height);
  const sw = dw / scale, sh = dh / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, dx, dy, dw, dh);
}

/* ── Canvas renderer ─────────────────────────────────────────────────── */

async function renderToCanvas(
  v: Vehicle,
  photoUrl: string | undefined,
  fmt: Format,
  theme: Theme,
): Promise<HTMLCanvasElement> {
  const T = THEMES[theme];
  const W = 1080;
  const H = fmt === "post" ? 1350 : 1920;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  await document.fonts.ready;

  const settled = await Promise.allSettled([
    photoUrl ? photoImg(photoUrl) : Promise.reject(),
    photoImg("/plantilla-post-base.svg"),       // SVG master template
    photoImg("/plantilla-logo-panel.png"),      // AH logo in info panel
    svgImg("speed"),
    svgImg("gear"),
    svgImg("engine"),
    svgImg("traction"),
    svgImg("fuel"),
  ]);
  const get = (i: number) =>
    settled[i].status === "fulfilled"
      ? (settled[i] as PromiseFulfilledResult<HTMLImageElement>).value
      : null;
  const [carImg, svgBg, panelLogo, iSpeed, iGear, iEngine, iTraction, iFuel] =
    [get(0), get(1), get(2), get(3), get(4), get(5), get(6), get(7)];

  // SVG template: viewBox 810×1012.5, native output 1080×1350
  const scaleX = W / 810;
  const scaleY = H / 1012.5;

  // From SVG clipPath analysis:
  //   photo zone  → clipPath rect y=0–471   → canvas y=0–628
  //   info panel  → clipPath rect y=534–1012 → canvas y=712–1350
  //   transition  → y=471–534 (badge decoration lives here)
  const photoEndY = Math.round(471 * scaleY);  // 628px
  const panelY    = Math.round(534 * scaleY);  // 712px
  const bandH     = Math.round(20 * scaleY);

  // Text positions — all derived from SVG element translate/matrix analysis
  const lX        = Math.round(141 * scaleX);  // 188px left margin (brand group x)
  const colRX     = Math.round(567 * scaleX);  // 756px right col  (plate badge x)
  const brandAbsY = Math.round(757 * scaleY);  // 1009px brand baseline
  const subAbsY   = Math.round(849 * scaleY);  // 1132px subtitle baseline
  const spec1AbsY = Math.round(898 * scaleY);  // 1197px spec row 1
  const spec2AbsY = Math.round(935 * scaleY);  // 1246px spec row 2
  const plateAbsX = Math.round(567 * scaleX);  // 756px  plate badge left
  const plateAbsY = Math.round(815 * scaleY);  // 1086px plate badge top
  const tecnoAbsY = Math.round(904 * scaleY);  // 1205px TECNO baseline

  /* 1 — Dark base */
  ctx.fillStyle = T.panelBg;
  ctx.fillRect(0, 0, W, H);

  /* 2 — Vehicle photo (drawn first so SVG overlays can sit on top) */
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, photoEndY);
  ctx.clip();
  if (carImg) {
    coverDraw(ctx, carImg, 0, 0, W, photoEndY);
    const gOver = ctx.createLinearGradient(0, 0, 0, H * 0.22);
    gOver.addColorStop(0, "rgba(0,0,0,0.55)");
    gOver.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gOver;
    ctx.fillRect(0, 0, W, H * 0.22);
  } else {
    const gTop = ctx.createLinearGradient(0, 0, 0, photoEndY);
    gTop.addColorStop(0,    "#707070");
    gTop.addColorStop(0.35, "#c8c8c8");
    gTop.addColorStop(0.65, "#ffffff");
    gTop.addColorStop(1,    "#efefef");
    ctx.fillStyle = gTop;
    ctx.fillRect(0, 0, W, photoEndY);
  }
  ctx.restore();

  /* 3 — SVG master template on top of photo
         The SVG's vehicle photo slot is a transparent 1×1 PNG, so the car photo
         shows through while all decorative overlays (@autohausmed, brand watermark,
         diagonal badge, info panel bg) render on top correctly.               */
  if (svgBg) {
    ctx.drawImage(svgBg, 0, 0, W, H);
  }

  /* 4 — Cover info panel + transition zone with theme background color
         This erases the SVG's static text paths so we can redraw dynamic data.
         The diagonal zone (photoEndY→panelY) is also blanked and redrawn below. */
  ctx.fillStyle = T.panelBg;
  ctx.fillRect(0, photoEndY, W, H - photoEndY);

  /* 5 — Diagonal accent band in theme color (lower-left → upper-right /)
         Left edge at panelY, right edge at photoEndY — spans full transition zone */
  ctx.save();
  ctx.fillStyle = T.accent;
  ctx.beginPath();
  ctx.moveTo(0, panelY - bandH);
  ctx.lineTo(W, photoEndY - bandH);
  ctx.lineTo(W, photoEndY);
  ctx.lineTo(0, panelY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  /* 6 — Info panel content */
  const lastDigit   = v.plate.replace(/\D/g, "").at(-1) ?? "—";
  const techno      = v.technoDue?.trim() || "N/A";
  const subtitleTxt = [v.line, v.version?.trim()].filter(Boolean).join(" ");

  // Brand name — SVG x=141, y=757
  const brandText = v.brand.toUpperCase();
  const brandFs   = Math.round(
    (brandText.length > 9 ? 72 : brandText.length > 7 ? 88 : 104) * scaleY
  );
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font      = `900 ${brandFs}px Inter, sans-serif`;
  ctx.fillText(brandText, lX, brandAbsY);

  // Subtitle: line + version (gray) + year (accent) — SVG y=849
  const subFs = Math.round(30 * scaleY);
  ctx.font = `${subFs}px Inter, sans-serif`;
  let subX = lX;
  if (subtitleTxt) {
    ctx.fillStyle = "#888888";
    ctx.fillText(subtitleTxt, lX, subAbsY);
    subX = lX + ctx.measureText(subtitleTxt + " ").width;
  }
  ctx.fillStyle = T.accent;
  ctx.fillText(String(v.year), subX, subAbsY);

  // Horizontal divider (left portion only)
  ctx.strokeStyle = T.divider;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(lX, subAbsY + Math.round(18 * scaleY));
  ctx.lineTo(W * 0.61, subAbsY + Math.round(18 * scaleY));
  ctx.stroke();

  // Spec helpers — scaled icon + text
  const iconSz = Math.round(24 * scaleY);
  const specFs = `bold ${Math.round(22 * scaleY)}px Inter, sans-serif`;
  const pipeFs = `${Math.round(22 * scaleY)}px Inter, sans-serif`;

  function specUnit(icon: HTMLImageElement | null, text: string, x: number, y: number): number {
    if (icon) {
      ctx.drawImage(icon, x, y - iconSz + 3, iconSz, iconSz);
      x += iconSz + 6;
    }
    ctx.fillStyle = T.specText;
    ctx.font      = specFs;
    ctx.textAlign = "left";
    ctx.fillText(text.toUpperCase(), x, y);
    return x + ctx.measureText(text.toUpperCase()).width;
  }

  function pipe(x: number, y: number): number {
    ctx.fillStyle = "#333333";
    ctx.font      = pipeFs;
    ctx.textAlign = "left";
    ctx.fillText("|", x + Math.round(8 * scaleX), y);
    return x + Math.round(28 * scaleX);
  }

  // Row 1: KM | Transmission | Motor  — SVG y=898
  let x = lX;
  x = specUnit(iSpeed, v.mileage.toLocaleString("es-CO") + " KM", x, spec1AbsY);
  x = pipe(x, spec1AbsY);
  x = specUnit(iGear, v.transmission, x, spec1AbsY);
  if (v.motor) {
    x = pipe(x, spec1AbsY);
    specUnit(iEngine, v.motor, x, spec1AbsY);
  }

  // Row 2: Traction | Fuel  — SVG y=935
  x = lX;
  if (v.traction) {
    x = specUnit(iTraction, v.traction, x, spec2AbsY);
    x = pipe(x, spec2AbsY);
  }
  specUnit(iFuel, v.fuel, x, spec2AbsY);

  /* Right column — plate badge  (SVG x=567, y=836) */
  const plateBW = Math.round(72 * scaleX);
  const plateBH = Math.round(32 * scaleY);

  ctx.fillStyle = T.plateBg;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(plateAbsX, plateAbsY, plateBW, plateBH, 4);
  else ctx.rect(plateAbsX, plateAbsY, plateBW, plateBH);
  ctx.fill();
  ctx.strokeStyle = T.plateBorder;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(plateAbsX + 2, plateAbsY + 2, plateBW - 4, plateBH - 4, 2);
  else ctx.rect(plateAbsX + 2, plateAbsY + 2, plateBW - 4, plateBH - 4);
  ctx.stroke();
  ctx.fillStyle = T.plateText;
  ctx.font      = `bold ${Math.round(12 * scaleY)}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(v.plate.toUpperCase(), plateAbsX + plateBW / 2, plateAbsY + plateBH * 0.72);

  // Last digit + city (right of plate badge)
  const afterPlateX = plateAbsX + plateBW + Math.round(12 * scaleX);
  const digitFs = Math.round(26 * scaleY);
  ctx.textAlign = "left";
  ctx.fillStyle = T.accent;
  ctx.font      = `bold ${digitFs}px Inter, sans-serif`;
  ctx.fillText(lastDigit, afterPlateX, plateAbsY + plateBH * 0.82);
  const dw = ctx.measureText(lastDigit).width;
  ctx.fillStyle = "#ababab";
  ctx.font      = `${Math.round(22 * scaleY)}px Inter, sans-serif`;
  ctx.fillText(" | " + v.cityRegistration.toUpperCase(), afterPlateX + dw, plateAbsY + plateBH * 0.82);

  // TECNO + SOAT  — SVG y=904
  const infoFs = Math.round(22 * scaleY);
  ctx.textAlign = "left";
  ctx.font      = `${infoFs}px Inter, sans-serif`;
  ctx.fillStyle = "#555555";
  ctx.fillText("TECNO: ", colRX, tecnoAbsY);
  ctx.fillStyle = "#b8b8b8";
  ctx.fillText(techno, colRX + ctx.measureText("TECNO: ").width, tecnoAbsY);
  const soatY = tecnoAbsY + Math.round(36 * scaleY);
  ctx.fillStyle = "#555555";
  ctx.fillText("SOAT: ", colRX, soatY);
  ctx.fillStyle = "#b8b8b8";
  ctx.fillText(v.soatDue || "—", colRX + ctx.measureText("SOAT: ").width, soatY);

  /* AH logo in info panel (SVG x=133, y=932 → canvas ~178, 1243; size ~30px) */
  if (panelLogo) {
    const lsz = Math.round(30 * scaleY);
    ctx.drawImage(panelLogo, Math.round(133 * scaleX), Math.round(932 * scaleY) - lsz, lsz, lsz);
  }

  /* Price badge (near bottom of canvas) */
  const priceText = "$" + v.targetPrice.toLocaleString("es-CO");
  const priceFs   = Math.round((priceText.length > 14 ? 44 : 54) * scaleY);
  const badgeH    = Math.round(80 * scaleY);
  const badgeY    = H - Math.round(112 * scaleY);
  const hPad      = Math.round(44 * scaleX);

  const priceGrd = ctx.createLinearGradient(hPad, 0, W - hPad, 0);
  priceGrd.addColorStop(0,   T.accentDark);
  priceGrd.addColorStop(0.3, T.accent);
  priceGrd.addColorStop(0.7, T.accent);
  priceGrd.addColorStop(1,   T.accentDark);
  ctx.fillStyle = priceGrd;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(hPad, badgeY, W - hPad * 2, badgeH, 14);
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

function DesignPreview({
  v, photoUrl, fmt, theme,
}: {
  v: Vehicle; photoUrl?: string; fmt: Format; theme: Theme;
}) {
  const T = THEMES[theme];
  const lastDigit   = v.plate.replace(/\D/g, "").at(-1) ?? "—";
  const techno      = v.technoDue?.trim() || "N/A";
  const priceText   = "$" + v.targetPrice.toLocaleString("es-CO");
  const subtitleTxt = [v.line, v.version?.trim()].filter(Boolean).join(" ");

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl select-none",
        fmt === "post" ? "aspect-[4/5]" : "aspect-[9/16]",
      )}
      style={{ background: T.panelBg }}
    >
      {/* Photo area — top 46.5% (SVG clip y=0-471 / 1012.5 = 46.5%) */}
      <div className="absolute inset-x-0 top-0" style={{ height: "46.5%" }}>
        {photoUrl
          ? <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          : <div className="h-full w-full bg-gradient-to-b from-[#707070] via-[#c8c8c8] to-white" />
        }
        <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black/55 to-transparent" />
      </div>

      {/* @autohausmed (SVG y=173/1012.5=17.1% of height) */}
      <div className="absolute inset-x-0 top-[17%] z-10 flex justify-center">
        <p className="text-[9px] font-semibold text-white [text-shadow:0_1px_8px_rgba(0,0,0,1)]">@autohausmed</p>
      </div>

      {/* Diagonal accent band — top: 52.7%−bandH, bottom-left: 52.7%, bottom-right: 46.5% */}
      <div
        className="absolute z-10 w-[116%]"
        style={{
          left: "-8%",
          top: "50%",
          height: "2%",
          backgroundColor: T.accent,
          transform: "rotate(-3.8deg)",
          transformOrigin: "0% 100%",
        }}
      />

      {/* Info panel — starts at 52.7% (SVG y=534/1012.5) */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col" style={{ top: "52.7%" }}>
        <div className="flex flex-1 gap-1 px-3 pt-2">

          {/* Left column */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-black uppercase leading-tight tracking-wide text-white">
              {v.brand}
            </p>
            <p className="mt-0.5 text-[8px] leading-none text-zinc-500">
              {subtitleTxt && <>{subtitleTxt} </>}
              <span style={{ color: T.accent }}>{v.year}</span>
            </p>
            <div className="my-1 h-px" style={{ width: "62%", background: T.divider }} />
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
              <span
                className="rounded px-1 py-0.5 font-mono text-[6px] font-bold"
                style={{ background: T.plateBg, color: T.plateText }}
              >
                {v.plate.toUpperCase()}
              </span>
              <span className="text-[10px] font-bold" style={{ color: T.accent }}>{lastDigit}</span>
              <span className="text-[8px] text-zinc-400">| {v.cityRegistration.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="mt-1 text-[7.5px] leading-snug text-zinc-500">
              <p>TECNO: <span className="text-zinc-300">{techno}</span></p>
              <p>SOAT: <span className="text-zinc-300">{v.soatDue || "—"}</span></p>
            </div>
          </div>
        </div>

        {/* Price badge */}
        <div
          className="mx-3 mb-2 mt-1 flex items-center justify-center rounded-xl py-2 shadow"
          style={{
            background: `linear-gradient(90deg, ${T.accentDark}, ${T.accent} 30%, ${T.accent} 70%, ${T.accentDark})`,
          }}
        >
          <span className="text-base font-black text-white drop-shadow">{priceText}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */

export function VehicleDesignCard({ vehicle, photos }: { vehicle: Vehicle; photos: VehiclePhoto[] }) {
  const [fmt, setFmt]             = useState<Format>("post");
  const [theme, setTheme]         = useState<Theme>("bmw");
  const [photoIdx, setPhotoIdx]   = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError]     = useState<string | null>(null);

  const primaryPhoto = photos[photoIdx]?.fileUrl;

  async function handleDownload() {
    setDownloading(true);
    setDlError(null);
    try {
      const canvas = await renderToCanvas(vehicle, primaryPhoto, fmt, theme);
      canvas.toBlob((blob) => {
        if (!blob) { setDlError("Error generando imagen."); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${vehicle.brand}-${vehicle.line}-${vehicle.year}-${theme}-${fmt}.png`;
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

      {/* Theme toggle: BMW vs ROCKS-E */}
      <div className="flex gap-1 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0a0a0a] p-1.5">
        {(Object.entries(THEMES) as [Theme, ThemeCfg][]).map(([key, t]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTheme(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[12px] font-semibold transition-all duration-150",
              theme === key ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.dot }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Format toggle: Post vs Story */}
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
      <DesignPreview v={vehicle} photoUrl={primaryPhoto} fmt={fmt} theme={theme} />

      {dlError && (
        <p className="rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-2 text-xs text-red-400">
          {dlError}
        </p>
      )}

      {/* Download button */}
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
