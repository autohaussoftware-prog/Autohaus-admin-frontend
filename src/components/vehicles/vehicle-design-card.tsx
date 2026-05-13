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
    photoImg("/logo-ah.jpeg"),
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
  const [carImg, logoImg, iSpeed, iGear, iEngine, iTraction, iFuel] =
    [get(0), get(1), get(2), get(3), get(4), get(5), get(6)];

  // ── Layout proportions (derived from reference images)
  // Photo occupies top ~67%, info panel bottom ~33%, diagonal at boundary
  const diagLY = Math.round(H * 0.700); // left lower corner of diagonal  (945px)
  const diagRY = Math.round(H * 0.660); // right lower corner (upper-right) (891px)
  const bandH  = Math.round(H * 0.028); // gold band thickness               (38px)
  const panelY = diagLY;                 // info panel solid start

  // Left text margin / right column
  const lX    = 54;
  const colRX = Math.round(W * 0.680);   // 734px

  // Text baselines (absolute canvas Y, from reference proportions)
  const brandAbsY  = panelY + Math.round(H * 0.061); // ~1027px  brand baseline
  const subAbsY    = panelY + Math.round(H * 0.107); // ~1090px  subtitle
  const spec1AbsY  = panelY + Math.round(H * 0.158); // ~1145px  spec row 1
  const spec2AbsY  = panelY + Math.round(H * 0.207); // ~1195px  spec row 2
  const plateAbsX  = colRX;
  const plateAbsY  = panelY + Math.round(H * 0.005); // ~952px   plate badge top
  const tecnoAbsY  = panelY + Math.round(H * 0.094); // ~1072px  TECNO baseline

  /* 1 — Dark base */
  ctx.fillStyle = T.panelBg;
  ctx.fillRect(0, 0, W, H);

  /* 2 — Vehicle photo clipped to diagonal trapezoid (lower-left → upper-right /) */
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W, 0);
  ctx.lineTo(W, diagRY);
  ctx.lineTo(0, diagLY);
  ctx.closePath();
  ctx.clip();
  if (carImg) {
    coverDraw(ctx, carImg, 0, 0, W, diagLY);
    // Top gradient so AH logo is readable
    const gTop = ctx.createLinearGradient(0, 0, 0, H * 0.25);
    gTop.addColorStop(0, "rgba(0,0,0,0.62)");
    gTop.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gTop;
    ctx.fillRect(0, 0, W, H * 0.25);
  } else {
    const gGray = ctx.createLinearGradient(0, 0, 0, diagLY);
    gGray.addColorStop(0,    "#606060");
    gGray.addColorStop(0.35, "#c0c0c0");
    gGray.addColorStop(0.7,  "#f0f0f0");
    gGray.addColorStop(1,    "#e8e8e8");
    ctx.fillStyle = gGray;
    ctx.fillRect(0, 0, W, diagLY);
  }
  ctx.restore();

  /* 3 — AH logo + @autohausmed (centered near top of photo) */
  if (logoImg) {
    const sz = Math.round(H * 0.082); // ~111px
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(logoImg, (W - sz) / 2, Math.round(H * 0.036), sz, sz);
    ctx.restore();
  }
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.95)";
  ctx.shadowBlur  = 18;
  ctx.fillStyle   = "rgba(255,255,255,0.92)";
  ctx.font        = `600 ${Math.round(H * 0.026)}px Inter, sans-serif`;
  ctx.textAlign   = "center";
  ctx.fillText("@autohausmed", W / 2, Math.round(H * 0.162));
  ctx.restore();

  /* 4 — Info panel dark background */
  ctx.fillStyle = T.panelBg;
  ctx.fillRect(0, panelY, W, H - panelY);

  /* 5 — Diagonal accent band */
  ctx.save();
  ctx.fillStyle = T.accent;
  ctx.beginPath();
  ctx.moveTo(0, diagLY - bandH);
  ctx.lineTo(W, diagRY - bandH);
  ctx.lineTo(W, diagRY);
  ctx.lineTo(0, diagLY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  /* 6 — Info panel content */
  const lastDigit   = v.plate.replace(/\D/g, "").at(-1) ?? "—";
  const techno      = v.technoDue?.trim() || "N/A";
  // Header: line + version (model identifier)
  // Subtitle: brand (gray) + year (accent)
  const headerTxt  = [v.line, v.version?.trim()].filter(Boolean).join(" ");
  const headerText = (headerTxt || v.brand).toUpperCase();

  // Brand / model name — large bold white
  const headerFs = Math.round(
    (headerText.length > 12 ? 62 : headerText.length > 9 ? 74 : headerText.length > 7 ? 84 : 96) * (H / 1350)
  );
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font      = `900 ${headerFs}px Inter, sans-serif`;
  ctx.fillText(headerText, lX, brandAbsY);

  // Subtitle: brand (gray) + year (accent gold)
  const subFs = Math.round(34 * (H / 1350));
  ctx.font = `600 ${subFs}px Inter, sans-serif`;
  ctx.fillStyle = "#888888";
  const brandLabel = v.brand.toUpperCase() + " ";
  ctx.fillText(brandLabel, lX, subAbsY);
  ctx.fillStyle = T.accent;
  ctx.fillText(String(v.year), lX + ctx.measureText(brandLabel).width, subAbsY);

  // Horizontal divider
  ctx.strokeStyle = T.divider;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(lX, subAbsY + 16);
  ctx.lineTo(colRX - 20, subAbsY + 16);
  ctx.stroke();

  // Spec helpers
  const iconSz = Math.round(22 * (H / 1350));
  const specFsStr = `bold ${Math.round(22 * (H / 1350))}px Inter, sans-serif`;
  const pipeFsStr = `${Math.round(22 * (H / 1350))}px Inter, sans-serif`;
  const pipeGap   = Math.round(26 * (W / 1080));

  function specUnit(icon: HTMLImageElement | null, text: string, x: number, y: number): number {
    if (icon) {
      ctx.drawImage(icon, x, y - iconSz + 3, iconSz, iconSz);
      x += iconSz + 5;
    }
    ctx.fillStyle = T.specText;
    ctx.font      = specFsStr;
    ctx.textAlign = "left";
    ctx.fillText(text.toUpperCase(), x, y);
    return x + ctx.measureText(text.toUpperCase()).width;
  }

  function pipe(x: number, y: number): number {
    ctx.fillStyle = T.accent;
    ctx.font      = pipeFsStr;
    ctx.textAlign = "left";
    ctx.fillText("/", x + 8, y);
    return x + pipeGap;
  }

  // Row 1: KM | Transmission | Motor
  let x = lX;
  x = specUnit(iSpeed, v.mileage.toLocaleString("es-CO") + " KM", x, spec1AbsY);
  x = pipe(x, spec1AbsY);
  x = specUnit(iGear, v.transmission, x, spec1AbsY);
  if (v.motor) {
    x = pipe(x, spec1AbsY);
    specUnit(iEngine, v.motor, x, spec1AbsY);
  }

  // Row 2: Traction | Fuel
  x = lX;
  if (v.traction) {
    x = specUnit(iTraction, v.traction, x, spec2AbsY);
    x = pipe(x, spec2AbsY);
  }
  specUnit(iFuel, v.fuel, x, spec2AbsY);

  /* Right column — plate badge */
  const plateBW = Math.round(80 * (W / 1080));
  const plateBH = Math.round(30 * (H / 1350));

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
  ctx.font      = `bold ${Math.round(11 * (H / 1350))}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(v.plate.toUpperCase(), plateAbsX + plateBW / 2, plateAbsY + plateBH * 0.74);

  // Last digit | city (right of badge)
  const afterPlateX = plateAbsX + plateBW + 12;
  const digitFs2    = Math.round(24 * (H / 1350));
  ctx.textAlign = "left";
  ctx.fillStyle = T.accent;
  ctx.font      = `bold ${digitFs2}px Inter, sans-serif`;
  ctx.fillText(lastDigit, afterPlateX, plateAbsY + plateBH * 0.82);
  const dw2 = ctx.measureText(lastDigit).width;
  ctx.fillStyle = "#ababab";
  ctx.font      = `${Math.round(20 * (H / 1350))}px Inter, sans-serif`;
  ctx.fillText(" | " + v.cityRegistration.toUpperCase(), afterPlateX + dw2, plateAbsY + plateBH * 0.82);

  // TECNO + SOAT
  const infoFs2 = Math.round(21 * (H / 1350));
  ctx.textAlign = "left";
  ctx.font      = `${infoFs2}px Inter, sans-serif`;
  ctx.fillStyle = "#555555";
  ctx.fillText("TECNO: ", colRX, tecnoAbsY);
  ctx.fillStyle = "#b0b0b0";
  ctx.fillText(techno, colRX + ctx.measureText("TECNO: ").width, tecnoAbsY);
  const soatY2 = tecnoAbsY + Math.round(32 * (H / 1350));
  ctx.fillStyle = "#555555";
  ctx.fillText("SOAT: ", colRX, soatY2);
  ctx.fillStyle = "#b0b0b0";
  ctx.fillText(v.soatDue || "—", colRX + ctx.measureText("SOAT: ").width, soatY2);

  /* Price badge */
  const priceText = "$" + v.targetPrice.toLocaleString("es-CO");
  const priceFs   = Math.round((priceText.length > 14 ? 44 : 54) * (H / 1350));
  const badgeH2   = Math.round(78 * (H / 1350));
  const badgeY2   = H - Math.round(100 * (H / 1350));
  const hPad      = Math.round(44 * (W / 1080));

  const priceGrd = ctx.createLinearGradient(hPad, 0, W - hPad, 0);
  priceGrd.addColorStop(0,   T.accentDark);
  priceGrd.addColorStop(0.3, T.accent);
  priceGrd.addColorStop(0.7, T.accent);
  priceGrd.addColorStop(1,   T.accentDark);
  ctx.fillStyle = priceGrd;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(hPad, badgeY2, W - hPad * 2, badgeH2, 14);
  else ctx.rect(hPad, badgeY2, W - hPad * 2, badgeH2);
  ctx.fill();

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur  = 10;
  ctx.fillStyle   = "#ffffff";
  ctx.font        = `bold ${priceFs}px Inter, sans-serif`;
  ctx.textAlign   = "center";
  ctx.fillText(priceText, W / 2, badgeY2 + badgeH2 * 0.67);
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
  const lastDigit  = v.plate.replace(/\D/g, "").at(-1) ?? "—";
  const techno     = v.technoDue?.trim() || "N/A";
  const priceText  = "$" + v.targetPrice.toLocaleString("es-CO");
  const headerTxt  = [v.line, v.version?.trim()].filter(Boolean).join(" ");
  const headerText = (headerTxt || v.brand).toUpperCase();

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl select-none",
        fmt === "post" ? "aspect-[4/5]" : "aspect-[9/16]",
      )}
      style={{ background: T.panelBg }}
    >
      {/* Photo area — top 70% (canvas diagLY = H×0.700) */}
      <div className="absolute inset-x-0 top-0" style={{ height: "70%" }}>
        {photoUrl
          ? <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          : <div className="h-full w-full bg-gradient-to-b from-[#707070] via-[#c8c8c8] to-white" />
        }
        <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-black/55 to-transparent" />
      </div>

      {/* @autohausmed centered near top of photo */}
      <div className="absolute inset-x-0 top-[16%] z-10 flex justify-center">
        <p className="text-[9px] font-semibold text-white [text-shadow:0_1px_8px_rgba(0,0,0,1)]">@autohausmed</p>
      </div>

      {/* Diagonal accent band — left at 70%, right at 66% (canvas diagLY/diagRY) */}
      <div
        className="absolute z-10 w-[116%]"
        style={{
          left: "-8%",
          top: "68.5%",
          height: "2%",
          backgroundColor: T.accent,
          transform: "rotate(-2.3deg)",
          transformOrigin: "0% 100%",
        }}
      />

      {/* Info panel — starts at 70% */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col" style={{ top: "70%" }}>
        <div className="flex flex-1 gap-1 px-3 pt-2">

          {/* Left column */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-black uppercase leading-tight tracking-wide text-white">
              {headerText}
            </p>
            <p className="mt-0.5 text-[8px] leading-none">
              <span className="text-zinc-500">{v.brand.toUpperCase()} </span>
              <span style={{ color: T.accent }}>{v.year}</span>
            </p>
            <div className="my-1 h-px" style={{ width: "62%", background: T.divider }} />
            <div className="space-y-0.5 text-[7.5px] leading-none text-zinc-400">
              <p className="truncate">
                ⊙ {v.mileage.toLocaleString("es-CO")} KM
                <span style={{ color: T.accent }}>&nbsp;/&nbsp;</span>
                ⚙ {v.transmission}
                {v.motor ? <><span style={{ color: T.accent }}>&nbsp;/&nbsp;</span>▣ {v.motor}</> : null}
              </p>
              <p className="truncate">
                {v.traction ? <>✦ {v.traction}<span style={{ color: T.accent }}>&nbsp;/&nbsp;</span></> : null}
                ⛽ {v.fuel}
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
