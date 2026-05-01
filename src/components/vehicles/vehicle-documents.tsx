"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, PlusCircle, Trash2, Upload } from "lucide-react";
import { saveVehicleDocAction, deleteVehicleDocAction } from "@/app/actions/docs";
import { LEGAL_DOC_TYPES } from "@/lib/domain/vehicle-docs-config";
import type { VehicleDoc } from "@/lib/data/docs";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BUCKET = "vehicle-photos";
const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._\-]/g, "_");
}

const DOC_TYPE_COLORS: Record<string, string> = {
  "SOAT": "text-blue-300 border-blue-500/30 bg-blue-500/10",
  "Tecnomecánica": "text-purple-300 border-purple-500/30 bg-purple-500/10",
  "Tarjeta de propiedad": "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
  "Factura de compra": "text-amber-300 border-amber-500/30 bg-amber-500/10",
  "Contrato de compraventa": "text-orange-300 border-orange-500/30 bg-orange-500/10",
  "Poder de venta": "text-pink-300 border-pink-500/30 bg-pink-500/10",
  "Registro de traspaso": "text-cyan-300 border-cyan-500/30 bg-cyan-500/10",
  "Paz y salvo comparendos": "text-red-300 border-red-500/30 bg-red-500/10",
  "Otro": "text-zinc-300 border-zinc-600/30 bg-zinc-600/10",
};

export function VehicleDocuments({
  vehicleId,
  docs,
  canDelete = false,
}: {
  vehicleId: string;
  docs: VehicleDoc[];
  canDelete?: boolean;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [docType, setDocType] = useState<string>(LEGAL_DOC_TYPES[0]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const grouped = docs.reduce<Record<string, VehicleDoc[]>>((acc, d) => {
    acc[d.documentType] = acc[d.documentType] ?? [];
    acc[d.documentType].push(d);
    return acc;
  }, {});

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError("El archivo no puede superar 15 MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const path = `docs/${vehicleId}/${Date.now()}-${sanitizeName(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const result = await saveVehicleDocAction(vehicleId, docType, publicUrl, file.name);
      if (result?.error) throw new Error(result.error);

      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo archivo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }, [vehicleId, docType, router]);

  async function handleDelete(doc: VehicleDoc) {
    setDeletingId(doc.id);
    const storagePath = doc.fileUrl.includes("/vehicle-photos/")
      ? doc.fileUrl.split("/vehicle-photos/").pop()
      : undefined;
    const result = await deleteVehicleDocAction(doc.id, vehicleId, storagePath);
    if (result?.error) setError(result.error);
    setDeletingId(null);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="border-b border-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>
              {docs.length === 0
                ? "Sin documentos cargados."
                : `${docs.length} ${docs.length === 1 ? "documento" : "documentos"} en ${Object.keys(grouped).length} ${Object.keys(grouped).length === 1 ? "categoría" : "categorías"}`}
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
            <PlusCircle className="h-4 w-4" />
            {showForm ? "Cancelar" : "Subir documento"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {showForm && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">Tipo de documento *</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
                >
                  {LEGAL_DOC_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                  Archivo (PDF / imagen, máx. 15 MB) *
                </label>
                <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed px-4 py-3 transition ${uploading ? "opacity-50 cursor-not-allowed border-zinc-700" : "border-zinc-700 hover:border-[#D6A93D]"}`}>
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  ) : (
                    <Upload className="h-4 w-4 text-zinc-400" />
                  )}
                  <span className="text-sm text-zinc-400">
                    {uploading ? "Subiendo…" : "Seleccionar archivo"}
                  </span>
                  <input
                    type="file"
                    accept={ACCEPTED}
                    disabled={uploading}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {docs.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-zinc-800 py-12">
            <FileText className="h-8 w-8 text-zinc-700" />
            <p className="text-sm text-zinc-500">Sin documentos cargados para este vehículo.</p>
          </div>
        )}

        {docs.length > 0 && (
          <div className="space-y-3">
            {Object.entries(grouped).map(([type, typeDocs]) => (
              <div key={type} className="rounded-3xl border border-zinc-800 overflow-hidden">
                <div className={`px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] border-b border-zinc-800 ${DOC_TYPE_COLORS[type] ?? DOC_TYPE_COLORS["Otro"]}`}>
                  {type} ({typeDocs.length})
                </div>
                <div className="divide-y divide-zinc-900">
                  {typeDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0 flex items-center gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
                        <div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-white hover:text-[#D6A93D] hover:underline truncate block max-w-[280px]"
                            title={doc.fileName}
                          >
                            {doc.fileName}
                          </a>
                          <p className="text-xs text-zinc-500">{formatDate(doc.uploadedAt)}</p>
                        </div>
                      </div>
                      {canDelete && (
                        <button
                          type="button"
                          disabled={deletingId === doc.id}
                          onClick={() => handleDelete(doc)}
                          className="rounded-xl border border-red-500/30 bg-red-500/10 p-1.5 text-red-300 transition hover:bg-red-500/30 disabled:opacity-50 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
