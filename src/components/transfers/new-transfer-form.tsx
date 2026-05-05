"use client";

import { useState, useTransition } from "react";
import { Plus, Search, AlertCircle } from "lucide-react";
import {
  createTransferAction,
  createVehicleForTransferAction,
  lookupVehicleByPlateAction,
} from "@/app/actions/transfers";
import type { OwnerLookup } from "@/app/actions/transfers";

const DOC_TYPES = ["Cédula", "NIT"] as const;
const FUELS = ["Gasolina", "Diésel", "Híbrido", "Eléctrico", "Gas"] as const;

function OwnerFields({
  prefix,
  label,
  owner,
}: {
  prefix: "from" | "to";
  label: string;
  owner: OwnerLookup | null;
}) {
  const [docType, setDocType] = useState<string>(owner?.docType ?? "Cédula");

  return (
    <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-400">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Tipo documento</label>
          <select
            name={`${prefix}DocType`}
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
          >
            {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Número documento</label>
          <input
            name={`${prefix}DocNumber`}
            type="text"
            defaultValue={owner?.docNumber ?? ""}
            placeholder="Ej: 1234567890"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            {docType === "NIT" ? "Nombre empresa" : "Nombre completo"}
          </label>
          <input
            name={`${prefix}Owner`}
            type="text"
            defaultValue={owner?.name ?? ""}
            placeholder="Nombre"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
          />
        </div>
        {docType === "NIT" && (
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Nombre contacto</label>
            <input
              name={`${prefix}Company`}
              type="text"
              defaultValue={owner?.company ?? ""}
              placeholder="Representante legal"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Celular</label>
          <input
            name={`${prefix}Phone`}
            type="tel"
            defaultValue={owner?.phone ?? ""}
            placeholder="3001234567"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

export function NewTransferForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupPending, startLookup] = useTransition();
  const [createVehiclePending, startCreateVehicle] = useTransition();
  const [submitPending, startSubmit] = useTransition();

  const [plate, setPlate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [fromOwner, setFromOwner] = useState<OwnerLookup | null>(null);
  const [toOwner, setToOwner] = useState<OwnerLookup | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [vehicleNotFound, setVehicleNotFound] = useState(false);
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);

  // Mini vehicle creation form state
  const [newBrand, setNewBrand] = useState("");
  const [newLine, setNewLine] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newFuel, setNewFuel] = useState("Gasolina");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerPhone, setNewOwnerPhone] = useState("");

  function reset() {
    setPlate(""); setVehicleId(""); setFromOwner(null); setToOwner(null);
    setLookupError(null); setVehicleNotFound(false); setShowCreateVehicle(false);
    setError(null); setNewBrand(""); setNewLine(""); setNewYear("");
    setNewColor(""); setNewOwnerName(""); setNewOwnerPhone("");
  }

  function handlePlateBlur() {
    if (!plate.trim()) return;
    setLookupError(null);
    setVehicleNotFound(false);
    setShowCreateVehicle(false);
    setVehicleId("");
    setFromOwner(null);
    setToOwner(null);

    startLookup(async () => {
      const result = await lookupVehicleByPlateAction(plate.trim().toUpperCase());
      if (!result) return;
      if (!result.found) {
        setLookupError(result.error);
        setVehicleNotFound(true);
      } else {
        setVehicleId(result.vehicleId);
        setFromOwner(result.fromOwner);
        setToOwner(result.toOwner);
      }
    });
  }

  function handleCreateVehicle() {
    if (!newBrand.trim() || !newLine.trim()) {
      setLookupError("Marca y línea son obligatorios.");
      return;
    }
    setLookupError(null);

    startCreateVehicle(async () => {
      const fd = new FormData();
      fd.set("newPlate", plate);
      fd.set("newBrand", newBrand);
      fd.set("newLine", newLine);
      fd.set("newYear", newYear);
      fd.set("newColor", newColor);
      fd.set("newFuel", newFuel);
      fd.set("newOwnerName", newOwnerName);
      fd.set("newOwnerPhone", newOwnerPhone);

      const result = await createVehicleForTransferAction(fd);
      if (result.error) {
        setLookupError(result.error);
      } else {
        setVehicleId(result.vehicleId!);
        setVehicleNotFound(false);
        setShowCreateVehicle(false);
        setLookupError(null);
        if (newOwnerName) {
          setFromOwner({ name: newOwnerName, docType: "Cédula", docNumber: null, phone: newOwnerPhone || null, company: null });
        }
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
        reset();
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

      {/* Placa */}
      <div>
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
        <input type="hidden" name="vehicleId" value={vehicleId} />

        {vehicleId && (
          <p className="mt-1 text-xs text-emerald-400">Vehículo encontrado en inventario</p>
        )}

        {vehicleNotFound && !showCreateVehicle && (
          <div className="mt-2 rounded-xl border border-amber-700/40 bg-amber-500/10 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
              Vehículo no encontrado en inventario
            </div>
            <button
              type="button"
              onClick={() => setShowCreateVehicle(true)}
              className="text-xs text-[#D6A93D] hover:underline"
            >
              + Registrar vehículo con datos básicos y continuar
            </button>
          </div>
        )}
      </div>

      {/* Mini form crear vehículo */}
      {showCreateVehicle && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4 space-y-3">
          <p className="text-xs font-medium text-zinc-300">Datos básicos del vehículo</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Placa</label>
              <input value={plate} readOnly
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-400" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Marca *</label>
              <input type="text" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder="Toyota"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Línea *</label>
              <input type="text" value={newLine} onChange={(e) => setNewLine(e.target.value)} placeholder="Hilux"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Año</label>
              <input type="number" value={newYear} onChange={(e) => setNewYear(e.target.value)} placeholder="2020"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Color</label>
              <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Blanco"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Combustible</label>
              <select value={newFuel} onChange={(e) => setNewFuel(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none">
                {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Nombre propietario origen</label>
              <input type="text" value={newOwnerName} onChange={(e) => setNewOwnerName(e.target.value)} placeholder="Nombre completo"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Teléfono propietario</label>
              <input type="tel" value={newOwnerPhone} onChange={(e) => setNewOwnerPhone(e.target.value)} placeholder="3001234567"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none" />
            </div>
          </div>
          {lookupError && <p className="text-xs text-red-400">{lookupError}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleCreateVehicle} disabled={createVehiclePending}
              className="rounded-xl bg-[#D6A93D] px-3 py-1.5 text-xs font-medium text-black hover:bg-[#c49635] disabled:opacity-60 transition">
              {createVehiclePending ? "Registrando…" : "Registrar y continuar"}
            </button>
            <button type="button" onClick={() => { setShowCreateVehicle(false); setLookupError(null); }}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Propietarios — solo si hay vehículo */}
      {vehicleId && (
        <div className="grid gap-4 sm:grid-cols-2">
          <OwnerFields prefix="from" label="Propietario origen" owner={fromOwner} />
          <OwnerFields prefix="to" label="Propietario destino" owner={toOwner} />
        </div>
      )}

      {/* Tramitador y notas */}
      {vehicleId && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-zinc-400">Tramitador</label>
            <input name="tramitador" type="text" defaultValue="Titi"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-[#D6A93D] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-zinc-400">Notas</label>
            <textarea name="notes" rows={1} placeholder="Observaciones…"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-[#D6A93D] focus:outline-none resize-none" />
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-800 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => { setOpen(false); reset(); }}
          className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:text-white transition">
          Cancelar
        </button>
        <button type="submit" disabled={submitPending || !vehicleId}
          className="rounded-xl bg-[#D6A93D] px-4 py-2 text-sm font-medium text-black hover:bg-[#c49635] transition disabled:opacity-60">
          {submitPending ? "Guardando…" : "Registrar traspaso"}
        </button>
      </div>
    </form>
  );
}
