"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { AlertCircle, ImagePlus, Trash2 } from "lucide-react";

const MAX_FILES = 10;
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

type Preview = { file: File; url: string };

export function VehicleFormImages() {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      for (const p of previews) URL.revokeObjectURL(p.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncToInput = useCallback((files: File[]) => {
    const el = fileInputRef.current;
    if (!el || typeof DataTransfer === "undefined") return;
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(f);
    el.files = dt.files;
  }, []);

  const handleDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      const errs: string[] = [];

      for (const { file, errors: fileErrors } of rejected) {
        for (const err of fileErrors) {
          if (err.code === "file-too-large")
            errs.push(`"${file.name}" supera el tamaño máximo de ${MAX_SIZE_MB}MB.`);
          else if (err.code === "file-invalid-type")
            errs.push(`"${file.name}" no es un formato permitido. Solo JPG o PNG.`);
          else if (err.code === "too-many-files")
            errs.push(`Máximo ${MAX_FILES} imágenes permitidas.`);
        }
      }

      setPreviews((prev) => {
        const remaining = MAX_FILES - prev.length;
        if (remaining <= 0) {
          errs.push(`Ya tienes el máximo de ${MAX_FILES} imágenes.`);
          setErrors(errs);
          return prev;
        }
        const toAdd = accepted.slice(0, remaining);
        if (accepted.length > remaining)
          errs.push(`Solo se añadieron ${remaining} imagen(es) para no superar el límite de ${MAX_FILES}.`);

        const newPreviews = toAdd.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
        const updated = [...prev, ...newPreviews];
        syncToInput(updated.map((p) => p.file));
        setErrors(errs);
        return updated;
      });
    },
    [syncToInput]
  );

  const removePreview = useCallback(
    (idx: number) => {
      setPreviews((prev) => {
        URL.revokeObjectURL(prev[idx].url);
        const updated = prev.filter((_, i) => i !== idx);
        syncToInput(updated.map((p) => p.file));
        return updated;
      });
    },
    [syncToInput]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxSize: MAX_SIZE_BYTES,
    multiple: true,
    noClick: false,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? "border-[#D6A93D] bg-[#D6A93D]/5"
            : "border-zinc-700 hover:border-zinc-500"
        }`}
      >
        <input {...getInputProps()} />
        <input
          ref={fileInputRef}
          type="file"
          name="photos"
          multiple
          accept="image/jpeg,image/png"
          className="hidden"
          tabIndex={-1}
        />
        <ImagePlus className="mb-2 h-8 w-8 text-zinc-500" />
        <p className="text-sm text-zinc-300">
          {isDragActive ? "Suelta las fotos aquí" : "Arrastra fotos o haz clic para seleccionar"}
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          JPG · PNG · Máx. {MAX_SIZE_MB}MB por foto · Hasta {MAX_FILES} imágenes
        </p>
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {err}
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {previews.map((p, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.file.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePreview(i)}
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                title="Eliminar foto"
              >
                <Trash2 className="h-5 w-5 text-white" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-[#D6A93D] px-1.5 py-0.5 text-[10px] font-medium text-black">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-600">
        {previews.length}/{MAX_FILES} fotos · Las fotos se guardan al registrar el vehículo.
      </p>
    </div>
  );
}
