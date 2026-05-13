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

function formatPlate(raw: string): string {
  const clean = raw.replace(/[-\s]/g, "").toUpperCase();
  if (clean.length === 6) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  return raw.toUpperCase();
}

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

  // Exact pixel measurements pixel-scanned from blank template PNGs:
  //   POST  (1080×1350): gold left y=1028, gold right y=908, dark left y=1035
  //   STORY (1080×1920): gold left y=1149, gold right y=1025, dark left y=1160
  //   @autohausmed baseline: POST y=267, STORY y=270 (same absolute position)
  //   STORY price pill: y=1642–1778 center, x=137–964
  const isPost = fmt === "post";
  const templateUrl = isPost ? "/template-post.png" : "/template-story.png";

  const settled = await Promise.allSettled([
    photoUrl ? photoImg(photoUrl) : Promise.reject(),
    photoImg("/logo-ah.jpeg"),
    photoImg(templateUrl),
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
  const [carImg, logoImg, templateImg, iSpeed, iGear, iEngine, iTraction, iFuel] =
    [get(0), get(1), get(2), get(3), get(4), get(5), get(6), get(7)];

  // ── Layout — absolute pixel values from template scan ─────────────
  const handleY = isPost ? 267  : 270;   // @autohausmed baseline (px)
  const diagLY  = isPost ? 1028 : 1149;  // top of gold band, left edge (px)
  const diagRY  = isPost ?  908 : 1025;  // top of gold band, right edge (px)
  const panelY  = isPost ? 1035 : 1160;  // dark panel start, left edge (px)
  const scale   = H / 1350;              // only used for text sizing/spacing

  const lX    = 54;                          // left text margin
  const colRX = Math.round(W * 0.600);       // right column — aligns with "/" decorative

  const logoSz  = Math.round(H * 0.075);
  const logoTop = handleY - logoSz - Math.round(H * 0.008);

  // Panel text baselines — offsets from panelY, scaled by H/1350
  const headerY = panelY + Math.round(62  * scale);
  const subY    = panelY + Math.round(104 * scale);
  const spec1Y  = panelY + Math.round(152 * scale);
  const spec2Y  = panelY + Math.round(192 * scale);

  // Right column — plate badge width computed from text
  const plateFontPx = Math.round(13 * scale);
  const plateText   = formatPlate(v.plate);
  const plateBH     = Math.round(36 * scale);

  // ── Draw ───────────────────────────────────────────────────────────

  /* 1 — Dark base */
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, W, H);

  /* 2 — Vehicle photo clipped to photo polygon */
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
    const gTop = ctx.createLinearGradient(0, 0, 0, H * 0.28);
    gTop.addColorStop(0, "rgba(0,0,0,0.70)");
    gTop.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gTop;
    ctx.fillRect(0, 0, W, H * 0.28);
  } else {
    const gGray = ctx.createLinearGradient(0, 0, 0, diagLY);
    gGray.addColorStop(0, "#505050");
    gGray.addColorStop(0.4, "#b8b8b8");
    gGray.addColorStop(1, "#e0e0e0");
    ctx.fillStyle = gGray;
    ctx.fillRect(0, 0, W, diagLY);
  }
  ctx.restore();

  /* 3 — Template panel overlay (actual design PNG, clipped to panel area) */
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, diagLY - 4);
  ctx.lineTo(W, diagRY - 4);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.clip();
  if (templateImg) {
    ctx.drawImage(templateImg, 0, 0, W, H);
  } else {
    // Fallback: solid panel + gold band
    ctx.fillStyle = T.panelBg;
    ctx.fillRect(0, diagLY, W, H - diagLY);
    ctx.fillStyle = T.accent;
    ctx.beginPath();
    ctx.moveTo(0, diagLY - 20); ctx.lineTo(W, diagRY - 20);
    ctx.lineTo(W, diagRY); ctx.lineTo(0, diagLY);
    ctx.fill();
  }
  ctx.restore();

  /* 4 — AH logo (screen blend over photo) */
  if (logoImg) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(logoImg, (W - logoSz) / 2, logoTop, logoSz, logoSz);
    ctx.restore();
  }

  /* 5 — @autohausmed */
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.95)";
  ctx.shadowBlur  = 18;
  ctx.fillStyle   = "rgba(255,255,255,0.92)";
  ctx.font        = `600 ${Math.round(H * 0.022)}px Inter, sans-serif`;
  ctx.textAlign   = "center";
  ctx.fillText("@autohausmed", W / 2, handleY);
  ctx.restore();

  /* 6 — Panel info text */
  const lastDigit  = v.plate.replace(/\D/g, "").at(-1) ?? "—";
  const techno     = v.technoDue?.trim() || "N/A";
  const headerText = [v.brand, v.line].filter(Boolean).join(" ").toUpperCase();

  // Header: brand + line
  const hLen     = headerText.length;
  const headerFs = Math.round(
    (hLen > 14 ? 52 : hLen > 11 ? 64 : hLen > 8 ? 76 : 90) * (H / 1350)
  );
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font      = `900 ${headerFs}px Inter, sans-serif`;
  ctx.fillText(headerText, lX, headerY);

  // Subtitle: version (gray) + year (accent)
  const subFs = Math.round(30 * (H / 1350));
  ctx.font = `400 ${subFs}px Inter, sans-serif`;
  const versionLabel = v.version?.trim() ? v.version.trim() + " " : "";
  ctx.fillStyle = "#bbbbbb";
  ctx.fillText(versionLabel, lX, subY);
  ctx.fillStyle = T.accent;
  ctx.fillText(String(v.year), lX + ctx.measureText(versionLabel).width, subY);

  // Spec helpers
  const specFs    = Math.round(22 * scale);
  const iconSz    = Math.round(26 * scale);
  const specFsStr = `600 ${specFs}px Inter, sans-serif`;
  const pipeFsStr = `400 ${specFs}px Inter, sans-serif`;

  function specUnit(icon: HTMLImageElement | null, text: string, x: number, y: number): number {
    if (icon) {
      ctx.drawImage(icon, x, y - Math.round(specFs * 0.78), iconSz, iconSz);
      x += iconSz + 6;
    }
    ctx.fillStyle = T.specText;
    ctx.font      = specFsStr;
    ctx.textAlign = "left";
    ctx.fillText(text.toUpperCase(), x, y);
    return x + ctx.measureText(text.toUpperCase()).width;
  }

  function pipe(x: number, y: number): number {
    const pipeStr = "  |  ";
    ctx.fillStyle = "#555555";
    ctx.font      = pipeFsStr;
    ctx.textAlign = "left";
    ctx.fillText(pipeStr, x, y);
    return x + ctx.measureText(pipeStr).width;
  }

  // Row 1: KM | Transmission | Motor  /
  let x = lX;
  x = specUnit(iSpeed, v.mileage.toLocaleString("es-CO") + " KM", x, spec1Y);
  x = pipe(x, spec1Y);
  x = specUnit(iGear, v.transmission, x, spec1Y);
  if (v.motor) {
    x = pipe(x, spec1Y);
    x = specUnit(iEngine, v.motor, x, spec1Y);
  }
  // Row 2: Traction | Fuel
  x = lX;
  if (v.traction) {
    x = specUnit(iTraction, v.traction, x, spec2Y);
    x = pipe(x, spec2Y);
  }
  specUnit(iFuel, v.fuel, x, spec2Y);

  /* ── Right column ────────────────────────────────────────────────── */
  // Line 1: [ABC-123]  7 | MEDELLÍN  — at header level
  // Line 2: TECNO: value             — at subtitle level
  // Line 3: SOAT:  value             — below TECNO

  // Measure plate text to size badge exactly
  ctx.font = `bold ${plateFontPx}px monospace`;
  const plateTextW   = ctx.measureText(plateText).width;
  const hPad         = Math.round(10 * scale);
  const plateBW      = plateTextW + hPad * 2;

  // Badge top — align its baseline with the header baseline
  const plateBadgeTop      = Math.round(headerY - plateBH * 0.82);
  const plateBadgeBaseline = plateBadgeTop + Math.round(plateBH * 0.72);

  // Draw plate badge (gold rectangle, rounded, inner border)
  const radius = Math.round(6 * scale);
  ctx.fillStyle = T.plateBg;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(colRX, plateBadgeTop, plateBW, plateBH, radius);
  else ctx.rect(colRX, plateBadgeTop, plateBW, plateBH);
  ctx.fill();
  ctx.strokeStyle = T.plateBorder;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(colRX + 2, plateBadgeTop + 2, plateBW - 4, plateBH - 4, Math.max(2, radius - 2));
  else ctx.rect(colRX + 2, plateBadgeTop + 2, plateBW - 4, plateBH - 4);
  ctx.stroke();

  // Plate text centered inside badge
  ctx.fillStyle = T.plateText;
  ctx.font      = `bold ${plateFontPx}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(plateText, colRX + plateBW / 2, plateBadgeBaseline);

  // Last digit (accent) + " | " + city — to the right of badge, same baseline
  const afterBadge = colRX + plateBW + Math.round(10 * scale);
  const digitFs    = Math.round(22 * scale);
  const infoLineFs = Math.round(18 * scale);

  ctx.textAlign = "left";
  ctx.fillStyle = T.accent;
  ctx.font      = `700 ${digitFs}px Inter, sans-serif`;
  ctx.fillText(lastDigit, afterBadge, plateBadgeBaseline);
  const dw = ctx.measureText(lastDigit).width;

  ctx.fillStyle = "#777777";
  ctx.font      = `400 ${infoLineFs}px Inter, sans-serif`;
  const pipe2   = " | ";
  ctx.fillText(pipe2, afterBadge + dw, plateBadgeBaseline);
  const pw = ctx.measureText(pipe2).width;

  ctx.fillStyle = "#cccccc";
  ctx.fillText(v.cityRegistration.toUpperCase(), afterBadge + dw + pw, plateBadgeBaseline);

  // TECNO / SOAT — at subtitle level (below badge line)
  const infoFs   = Math.round(19 * scale);
  const labelFont = `400 ${infoFs}px Inter, sans-serif`;
  const valueFont = `500 ${infoFs}px Inter, sans-serif`;
  ctx.textAlign  = "left";

  ctx.font      = labelFont;
  const tecnoLabelW = ctx.measureText("TECNO: ").width;
  const soatLabelW  = ctx.measureText("SOAT:  ").width;

  ctx.fillStyle = "#585858";
  ctx.fillText("TECNO: ", colRX, subY);
  ctx.font      = valueFont;
  ctx.fillStyle = "#cccccc";
  ctx.fillText(techno, colRX + tecnoLabelW, subY);

  const soatInfoY = subY + Math.round(30 * scale);
  ctx.font      = labelFont;
  ctx.fillStyle = "#585858";
  ctx.fillText("SOAT:  ", colRX, soatInfoY);
  ctx.font      = valueFont;
  ctx.fillStyle = "#cccccc";
  ctx.fillText(v.soatDue || "—", colRX + soatLabelW, soatInfoY);

  /* 7 — Price text (story only — template already has the gold pill shape)
     Pill measured from template: y=1642–1778, center y=1710, x=137–964 */
  if (!isPost) {
    const priceText = "$" + v.targetPrice.toLocaleString("es-CO");
    const priceFs   = Math.round((priceText.length > 14 ? 56 : 68) * scale);
    const pillCenterY = 1710;
    const priceTextY  = pillCenterY + Math.round(priceFs * 0.36);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur  = 8;
    ctx.fillStyle   = "#1a0d00";
    ctx.font        = `900 ${priceFs}px Inter, sans-serif`;
    ctx.textAlign   = "center";
    ctx.fillText(priceText, W / 2, priceTextY);
    ctx.restore();
  }

  return canvas;
}

/* ── CSS Preview ─────────────────────────────────────────────────────── */

function DesignPreview({
  v, photoUrl, fmt, theme,
}: {
  v: Vehicle; photoUrl?: string; fmt: Format; theme: Theme;
}) {
  const T = THEMES[theme];
  const isPost     = fmt === "post";
  const lastDigit  = v.plate.replace(/\D/g, "").at(-1) ?? "—";
  const techno     = v.technoDue?.trim() || "N/A";
  const priceText  = "$" + v.targetPrice.toLocaleString("es-CO");
  const headerText = [v.brand, v.line].filter(Boolean).join(" ").toUpperCase();
  const plateLabel = formatPlate(v.plate);

  // Diagonal percentages — pixel-scanned from blank template PNGs:
  //   POST  1080×1350: gold left=1028(76.1%), right=908(67.3%); handle y=267(19.8%)
  //   STORY 1080×1920: gold left=1149(59.8%), right=1025(53.4%); handle y=270(14.1%)
  const diagL     = isPost ? 76.1 : 59.8;  // left  edge photo-end % (was 81.2 / 75.5)
  const diagR     = isPost ? 67.3 : 53.4;  // right edge photo-end % (was 78.4 / 72.7)
  const handlePct = isPost ? 19.5 : 13.8;  // @autohausmed center % (was 18.9 / 16.1)

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl select-none bg-[#111]",
        isPost ? "aspect-[4/5]" : "aspect-[9/16]",
      )}
    >
      {/* z=1 — Template PNG (dark panel + gold band) */}
      <img
        src={`/template-${fmt}.png`}
        alt=""
        className="absolute inset-0 h-full w-full object-fill"
        style={{ zIndex: 1 }}
      />

      {/* z=2 — Car photo clipped to photo polygon */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 2,
          clipPath: `polygon(0 0, 100% 0, 100% ${diagR}%, 0 ${diagL}%)`,
        }}
      >
        {photoUrl
          ? <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          : <div className="h-full w-full bg-gradient-to-b from-[#505050] via-[#b8b8b8] to-[#e0e0e0]" />
        }
        <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/65 to-transparent" />
      </div>

      {/* z=10 — @autohausmed */}
      <div
        className="absolute inset-x-0 flex justify-center"
        style={{ top: `${handlePct}%`, zIndex: 10 }}
      >
        <p className="text-[8px] font-semibold text-white [text-shadow:0_1px_8px_rgba(0,0,0,1)]">
          @autohausmed
        </p>
      </div>

      {/* z=10 — Panel text */}
      <div
        className="absolute inset-x-0 px-[5%]"
        style={{ top: `${diagL}%`, zIndex: 10 }}
      >
        {/* Header */}
        <p className="truncate text-[11px] font-black uppercase leading-tight text-white mt-[4%]">
          {headerText}
        </p>

        {/* Subtitle */}
        <p className="mt-[1%] text-[7px] leading-none">
          {v.version?.trim() && <span className="text-zinc-400">{v.version.trim()} </span>}
          <span style={{ color: T.accent }}>{v.year}</span>
        </p>

        {/* Two-column layout */}
        <div className="mt-[1%] flex gap-1">
          {/* Left specs — 61% of inner width (colRX=60% of W, 5% padding each side) */}
          <div className="min-w-0 space-y-[2%] text-[6px] leading-snug text-zinc-400" style={{ width: "61%" }}>
            <p className="truncate">
              {v.mileage.toLocaleString("es-CO")} KM
              <span className="text-zinc-600"> | </span>{v.transmission}
              {v.motor ? <><span className="text-zinc-600"> | </span>{v.motor}</> : null}
            </p>
            <p className="truncate">
              {v.traction ? <>{v.traction}<span className="text-zinc-600"> | </span></> : null}
              {v.fuel}
            </p>
          </div>

          {/* Right: [ABC-123] digit | city on ONE line, TECNO/SOAT below */}
          <div className="min-w-0 flex-1 text-[5.5px]">
            {/* Line 1: plate badge + digit + city */}
            <div className="flex items-center gap-[3px]">
              <span
                className="shrink-0 rounded-[2px] border px-[3px] py-[1px] font-mono text-[4.5px] font-bold leading-none"
                style={{ background: T.plateBg, color: T.plateText, borderColor: T.plateBorder }}
              >
                {plateLabel}
              </span>
              <span className="shrink-0 font-bold" style={{ color: T.accent }}>{lastDigit}</span>
              <span className="shrink-0 text-zinc-600">|</span>
              <span className="truncate text-zinc-300">{v.cityRegistration.slice(0, 9).toUpperCase()}</span>
            </div>
            {/* Lines 2-3: TECNO / SOAT */}
            <div className="mt-[4%] leading-snug text-[5px] text-zinc-500">
              <p>TECNO: <span className="text-zinc-300">{techno}</span></p>
              <p>SOAT: <span className="text-zinc-300">{v.soatDue || "—"}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* z=10 — Price text (story only — template already has the gold pill)
          Pill at 85.5%–92.6% from top (measured: y=1642–1778 / 1920) */}
      {!isPost && (
        <div
          className="absolute inset-x-[14%] flex items-center justify-center"
          style={{ top: "85.5%", height: "7.1%", zIndex: 10 }}
        >
          <span className="text-[10px] font-black [color:#1a0d00] [text-shadow:0_1px_3px_rgba(0,0,0,0.3)]">
            {priceText}
          </span>
        </div>
      )}
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
