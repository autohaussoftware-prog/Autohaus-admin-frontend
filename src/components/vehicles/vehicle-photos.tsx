"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { ImageIcon, Loader2, Trash2, Upload, ZoomIn } from "lucide-react";
import { saveVehiclePhotoAction, deleteVehiclePhotoAction } from "@/app/actions/photos";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { VehiclePhoto } from "@/types/vehicle";

const BUCKET = "vehicle-photos";
const COMPRESSION_OPTIONS = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._\-]/g, "_");
}

type UploadStep = { name: string; step: "compressing" | "uploading" | "saving" };

export function VehiclePhotos({ vehicleId, photos }: { vehicleId: string; photos: VehiclePhoto[] }) {
  const router = useRouter();
  const [uploadStep, setUploadStep] = useState<UploadStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<VehiclePhoto | null>(null);

  const processFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setError(null);
    const supabase = createClient();

    for (const file of files) {
      setUploadStep({ name: file.name, step: "compressing" });
      let compressed: File;
      try {
        const blob = await imageCompression(file, COMPRESSION_OPTIONS);
        compressed = new File([blob], file.name, { type: blob.type });
      } catch {
        compressed = file;
      }

      setUploadStep({ name: file.name, step: "uploading" });
      const path = `${vehicleId}/${Date.now()}-${sanitizeName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, compressed, { upsert: false });

      if (uploadError) {
        setError(`Error en "${file.name}": ${uploadError.message}`);
        setUploadStep(null);
        return;
      }

      setUploadStep({ name: file.name, step: "saving" });
      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      await saveVehiclePhotoAction(vehicleId, publicUrl, file.name);
    }

    setUploadStep(null);
    router.refresh();
  }, [vehicleId, router]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: processFiles,
    accept: { "image/*": [] },
    noClick: photos.length > 0,
    noKeyboard: true,
    disabled: uploadStep !== null,
  });

  async function handleDelete(photo: VehiclePhoto) {
    setDeleting(photo.id);
    const marker = `/vehicle-photos/`;
    const idx = photo.fileUrl.indexOf(marker);
    const storagePath = idx !== -1 ? photo.fileUrl.slice(idx + marker.length) : "";
    await deleteVehiclePhotoAction(photo.id, storagePath);
    setDeleting(null);
    router.refresh();
  }

  const stepLabel =
    uploadStep?.step === "compressing" ? `Comprimiendo ${uploadStep.name}…` :
    uploadStep?.step === "uploading"   ? `Subiendo ${uploadStep.name}…` :
    uploadStep?.step === "saving"      ? `Guardando ${uploadStep.name}…` : null;

  return (
    <>
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox.fileUrl}
            alt={lightbox.fileName}
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-5 top-5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            Cerrar
          </button>
          <p className="absolute bottom-5 text-xs text-zinc-500">{lightbox.fileName}</p>
        </div>
      )}

      <Card>
        <CardHeader className="border-b border-zinc-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Fotos del vehículo</CardTitle>
              <CardDescription>
                {photos.length > 0
                  ? `${photos.length} ${photos.length === 1 ? "foto" : "fotos"} · Arrastra más o haz clic para ampliar.`
                  : "Arrastra imágenes aquí o usa el botón para subir. Se comprimen automáticamente."}
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadStep !== null}
              onClick={open}
            >
              {uploadStep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploadStep ? "Procesando…" : "Subir fotos"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
          {stepLabel && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
              <Loader2 className="h-4 w-4 animate-spin" />
              {stepLabel}
            </div>
          )}

          <div
            {...getRootProps()}
            className={`relative rounded-3xl transition-all ${
              isDragActive
                ? "border-2 border-dashed border-[#D6A93D]/60 bg-[#D6A93D]/5"
                : photos.length === 0
                  ? "border-2 border-dashed border-zinc-800 hover:border-zinc-600"
                  : "border-2 border-dashed border-transparent"
            }`}
          >
            <input {...getInputProps()} />

            {isDragActive && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-[#D6A93D]/10">
                <p className="text-sm font-medium text-[#D6A93D]">Suelta las imágenes aquí</p>
              </div>
            )}

            {photos.length === 0 ? (
              <div className="flex cursor-pointer flex-col items-center justify-center gap-3 py-14" onClick={open}>
                <ImageIcon className="h-10 w-10 text-zinc-700" />
                <p className="text-sm text-zinc-500">Arrastra fotos aquí o haz clic para seleccionar</p>
                <p className="text-xs text-zinc-600">Se comprimen automáticamente antes de subir</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
                  >
                    <img
                      src={photo.fileUrl}
                      alt={photo.fileName}
                      className="aspect-[4/3] w-full cursor-pointer object-cover transition group-hover:opacity-80"
                      onClick={() => setLightbox(photo)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-xs text-zinc-300">{photo.fileName}</p>
                      <div className="ml-2 flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setLightbox(photo)}
                          className="rounded-xl border border-zinc-600/40 bg-zinc-800/60 p-1.5 text-zinc-300 transition hover:bg-zinc-700"
                        >
                          <ZoomIn className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={deleting === photo.id}
                          onClick={() => handleDelete(photo)}
                          className="rounded-xl border border-red-500/30 bg-red-500/20 p-1.5 text-red-300 transition hover:bg-red-500/40 disabled:opacity-50"
                        >
                          {deleting === photo.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
