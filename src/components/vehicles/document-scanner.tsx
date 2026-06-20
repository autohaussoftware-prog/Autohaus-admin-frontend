"use client";

import { useRef, useState } from "react";
import { Camera, CheckCircle2, FileSearch, Loader2, ScanLine, Upload, X } from "lucide-react";

type ScanResult = {
  fields: Record<string, string>;
  detectedFields: string[];
};

const FIELD_LABELS: Record<string, string> = {
  plate: "Placa",
  brand: "Marca",
  line: "Línea",
  year: "Año",
  color: "Color",
  motor: "Motor",
  fuel: "Combustible",
  transmission: "Transmisión",
  traction: "Tracción",
  cityRegistration: "Ciudad matrícula",
};

type Props = {
  onScanComplete: (fields: Record<string, string>, detectedFields: string[]) => void;
};

type State =
  | { status: "idle" }
  | { status: "preview"; file: File; preview: string }
  | { status: "scanning"; preview: string }
  | { status: "done"; preview: string; result: ScanResult }
  | { status: "error"; preview?: string; message: string };

export function DocumentScanner({ onScanComplete }: Props) {
  const [state, setState] = useState<State>({ status: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const preview = URL.createObjectURL(file);
    setState({ status: "preview", file, preview });
  }

  async function scan(file: File, preview: string) {
    setState({ status: "scanning", preview });

    try {
      const { default: imageCompression } = await import("browser-image-compression");
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
      });

      const form = new FormData();
      form.append("image", compressed, compressed.name || "document.jpg");

      const res = await fetch("/api/scan-vehicle-document", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setState({ status: "error", preview, message: data.error ?? "Error al procesar el documento." });
        return;
      }

      const result: ScanResult = data;
      setState({ status: "done", preview, result });
      onScanComplete(result.fields, result.detectedFields);
    } catch {
      setState({ status: "error", preview, message: "No se pudo conectar con el servidor." });
    }
  }

  function reset() {
    if (state.status !== "idle" && "preview" in state && state.preview) {
      URL.revokeObjectURL(state.preview);
    }
    setState({ status: "idle" });
  }

  const preview = state.status !== "idle" && "preview" in state ? state.preview : null;

  return (
    <div className="rounded-3xl border border-[#D6A93D]/20 bg-[#D6A93D]/5 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <ScanLine className="h-5 w-5 text-[#D6A93D] shrink-0" />
        <div>
          <p className="text-sm font-semibold text-white">Captura inteligente de documento</p>
          <p className="text-xs text-zinc-500">Carga la tarjeta de propiedad y la IA completará el formulario automáticamente.</p>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {/* IDLE: show buttons */}
      {state.status === "idle" && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-2xl border border-[#D6A93D]/40 bg-[#D6A93D]/10 px-4 py-2.5 text-sm font-medium text-[#D6A93D] hover:bg-[#D6A93D]/20 transition"
          >
            <Upload className="h-4 w-4" />
            Subir foto de matrícula
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-600 hover:text-white transition"
          >
            <Camera className="h-4 w-4" />
            Escanear documento
          </button>
        </div>
      )}

      {/* PREVIEW */}
      {state.status === "preview" && (
        <div className="space-y-3">
          <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.preview} alt="Documento" className="max-h-64 w-full object-contain bg-zinc-950" />
            <button
              type="button"
              onClick={reset}
              className="absolute right-2 top-2 rounded-full bg-zinc-900/80 p-1 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scan(state.file, state.preview)}
              className="flex items-center gap-2 rounded-2xl bg-[#D6A93D] px-4 py-2.5 text-sm font-medium text-black hover:bg-[#c99a35] transition"
            >
              <FileSearch className="h-4 w-4" />
              Analizar documento
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-400 hover:text-white transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* SCANNING */}
      {state.status === "scanning" && (
        <div className="space-y-3">
          <div className="relative w-full overflow-hidden rounded-2xl border border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.preview} alt="Documento" className="max-h-64 w-full object-contain bg-zinc-950 opacity-50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950/60">
              <Loader2 className="h-8 w-8 animate-spin text-[#D6A93D]" />
              <p className="text-sm font-medium text-white">Analizando documento…</p>
              <p className="text-xs text-zinc-500">La IA está extrayendo los datos del vehículo</p>
            </div>
          </div>
          {/* Animated progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-1/2 animate-[scan_1.5s_ease-in-out_infinite] rounded-full bg-[#D6A93D]" />
          </div>
        </div>
      )}

      {/* DONE */}
      {state.status === "done" && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-800/50 bg-emerald-500/10 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-300">
                {state.result.detectedFields.length} campo{state.result.detectedFields.length !== 1 ? "s" : ""} detectado{state.result.detectedFields.length !== 1 ? "s" : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {state.result.detectedFields.map((f) => (
                  <span key={f} className="rounded-lg bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                    {FIELD_LABELS[f] ?? f}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition underline underline-offset-2"
            >
              Escanear otro documento
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {state.status === "error" && (
        <div className="space-y-3">
          {state.preview && (
            <div className="w-full overflow-hidden rounded-2xl border border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={state.preview} alt="Documento" className="max-h-32 w-full object-contain bg-zinc-950 opacity-40" />
            </div>
          )}
          <div className="rounded-2xl border border-red-800/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.message}
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition underline underline-offset-2"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
