"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { saveVehiclePhotoAction, deleteVehiclePhotoAction } from "@/app/actions/photos";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { VehiclePhoto } from "@/types/vehicle";

const BUCKET = "vehicle-photos";

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._\-]/g, "_");
}

export function VehiclePhotos({
  vehicleId,
  photos,
}: {
  vehicleId: string;
  photos: VehiclePhoto[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    if (!files.length) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(`Subiendo ${i + 1} de ${files.length}…`);

      const path = `${vehicleId}/${Date.now()}-${sanitizeName(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setError(`Error en "${file.name}": ${uploadError.message}`);
        setUploading(false);
        setProgress(null);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

      await saveVehiclePhotoAction(vehicleId, publicUrl, file.name);
    }

    setUploading(false);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  async function handleDelete(photo: VehiclePhoto) {
    setDeleting(photo.id);
    // Extract storage path from public URL
    // URL format: .../storage/v1/object/public/vehicle-photos/{path}
    const marker = `/vehicle-photos/`;
    const idx = photo.fileUrl.indexOf(marker);
    const storagePath = idx !== -1 ? photo.fileUrl.slice(idx + marker.length) : "";

    await deleteVehiclePhotoAction(photo.id, storagePath);
    setDeleting(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="border-b border-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Fotos del vehículo</CardTitle>
            <CardDescription>
              {photos.length > 0
                ? `${photos.length} ${photos.length === 1 ? "foto" : "fotos"} — haz clic en una para ampliar.`
                : "Imágenes del inventario, peritaje y proceso de venta."}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Subiendo…" : "Subir fotos"}
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </CardHeader>

      <CardContent className="p-5">
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {progress && (
          <div className="mb-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
            {progress}
          </div>
        )}

        {photos.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-zinc-800 py-12 transition hover:border-zinc-600"
          >
            <ImageIcon className="h-10 w-10 text-zinc-700" />
            <p className="text-sm text-zinc-500">Sin fotos aún. Haz clic para subir.</p>
          </button>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
              >
                <a href={photo.fileUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={photo.fileUrl}
                    alt={photo.fileName}
                    className="aspect-[4/3] w-full object-cover transition group-hover:opacity-90"
                  />
                </a>
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="truncate text-xs text-zinc-300">{photo.fileName}</p>
                  <button
                    type="button"
                    disabled={deleting === photo.id}
                    onClick={() => handleDelete(photo)}
                    className="ml-2 shrink-0 rounded-xl border border-red-500/30 bg-red-500/20 p-1.5 text-red-300 transition hover:bg-red-500/40 disabled:opacity-50"
                  >
                    {deleting === photo.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
