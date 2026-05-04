"use client";

import { useState, useTransition } from "react";
import { Plus, Search } from "lucide-react";
import { createTransferAction, lookupVehicleByPlateAction } from "@/app/actions/transfers";

export function NewTransferForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupPending, startLookup] = useTransition();
  const [submitPending, startSubmit] = useTransition();

  const [plate, setPlate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [fromOwner, setFromOwner] = useState("");
  const [toOwner, setToOwner] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);

  function handlePlateBlur() {
    if (!plate.trim()) return;
    setLookupError(null);
    startLookup(async () => {
      const result = await lookupVehicleByPlateAction(plate.trim().toUpperCase());
      if (!result) return;
      if (result.error) {
        setLookupError(result.error);
        setVehicleId("");
        setFromOwner("");
        setToOwner("");
      } else {
        setVehicleId(result.vehicleId ?? "");
        setFromOwner(result.fromOwner ?? "");
        setToOwner(result.toOwner ?? "");
      }
    });
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startSubmit(async () => {
      const result = await createTransferAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setPlate("");
        setVehicleId("");
        setFromOwner("");
        setToOwner("");
        setLookupError(null);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-[#D6A93D]/50 hover:text-white transition"
      >
        <Plus className="h-4 w-4" />
        Nuevo traspaso
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-4">
      <h3 className="font-semibold text-white">Registrar traspaso</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Placa */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs text-zinc-400">
            Placa del vehículo <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              onBlur={handlePlateBlur}
              placeholder="Ej: KMQ918"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 pr-9 text-sm uppercase text-white placeholder-zinc-500 focus:border-[#D6A93D] focus:outline-none"
            />
            {lookupPending && (
              <Search className="absolute right-3 top-2.5 h-4 w-4 animate-pulse text-zinc-500" />
            )}
          </div>
          {lookupError && <p className="mt-1 text-xs text-red-400">{lookupError}</p>}
          {vehicleId && !lookupError && (
            <p className="mt-1 text-xs text-emerald-400">Vehículo encontrado</p>
          )}
          {/* vehicleId oculto para el form */}
          <input type="hidden" name="vehicleId" value={vehicleId} />
        </div>

        {/* Propietario origen */}
        <div>
          <label className="mb-1.5 block text-xs text-zinc-400">Propietario origen</label>
          <input
            name="fromOwner"
            type="text"
            value={fromOwner}
            onChange={(e) => setFromOwner(e.target.value)}
            placeholder="Se llena automáticamente"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#D6A93D] focus:outline-none"
          />
        </div>

        {/* Propietario destino */}
        <div>
          <label className="mb-1.5 block text-xs text-zinc-400">Propietario destino</label>
          <input
            name="toOwner"
            type="text"
            value={toOwner}
            onChange={(e) => setToOwner(e.target.value)}
            placeholder="Se llena automáticamente"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#D6A93D] focus:outline-none"
          />
        </div>

        {/* Tramitador */}
        <div>
          <label className="mb-1.5 block text-xs text-zinc-400">Tramitador</label>
          <input
            name="tramitador"
            type="text"
            defaultValue="Titi"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#D6A93D] focus:outline-none"
          />
        </div>

        {/* Notas */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs text-zinc-400">Notas</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Observaciones del traspaso…"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#D6A93D] focus:outline-none resize-none"
          />
        </div>
      </div>

      {error && <p className="rounded-xl border border-red-800 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:text-white transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitPending || !vehicleId}
          className="rounded-xl bg-[#D6A93D] px-4 py-2 text-sm font-medium text-black hover:bg-[#c49635] transition disabled:opacity-60"
        >
          {submitPending ? "Guardando…" : "Registrar"}
        </button>
      </div>
    </form>
  );
}
