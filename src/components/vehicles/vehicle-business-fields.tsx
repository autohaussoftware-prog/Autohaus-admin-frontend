"use client";

import { useState } from "react";
import { Building2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Option = { id: string; name: string };

type Props = {
  isAdvisor: boolean;
  locations: Option[];
  advisors: Option[];
  defaultOwnerType?: string;
  defaultEntryType?: string;
  defaultLocationId?: string;
  defaultStatus?: string;
  defaultBuyPrice?: number | string;
  defaultTargetPrice?: number | string;
  defaultMinPrice?: number | string;
  defaultEstimatedCost?: number | string;
  defaultRealCost?: number | string;
  defaultAdvisorBuyerId?: string;
  defaultAdvisorSellerId?: string;
  defaultSoatDue?: string;
  defaultTechnoDue?: string;
  defaultOwnerName?: string;
  defaultOwnerPhone?: string;
};

const STATUSES = [
  "Disponible", "Publicado", "Separado", "Vendido",
  "En comisión", "En reparación", "En trámite",
  "Entregado", "No publicado", "Papeles pendientes",
];

const ENTRY_TYPES = ["Compra", "Consignación", "Permuta", "Propio", "Socio", "Otro"];

export function VehicleBusinessFields({
  isAdvisor,
  locations,
  advisors,
  defaultOwnerType = "Propio",
  defaultEntryType = "Compra",
  defaultLocationId = "",
  defaultStatus = "Disponible",
  defaultBuyPrice,
  defaultTargetPrice,
  defaultMinPrice,
  defaultEstimatedCost,
  defaultRealCost,
  defaultAdvisorBuyerId = "",
  defaultAdvisorSellerId = "",
  defaultSoatDue = "",
  defaultTechnoDue = "",
  defaultOwnerName = "",
  defaultOwnerPhone = "",
}: Props) {
  const [ownerType, setOwnerType] = useState(defaultOwnerType);
  const isConsignment = ownerType === "Comisión";

  return (
    <>
      {/* ── Toggle: tipo de vehículo ──────────────────────────── */}
      <div className="col-span-full">
        <span className="mb-2 block text-sm text-zinc-400">¿Cómo ingresa este vehículo? <span className="text-red-400">*</span></span>
        <input type="hidden" name="ownerType" value={ownerType} />
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOwnerType("Propio")}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
              !isConsignment
                ? "border-[#D6A93D] bg-[#D6A93D]/5 text-white"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <Building2 className={`h-5 w-5 shrink-0 ${!isConsignment ? "text-[#D6A93D]" : "text-zinc-600"}`} />
            <div>
              <p className="text-sm font-medium">Vehículo propio</p>
              <p className="text-xs text-zinc-500">AutoHouse lo compró o es de la empresa</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setOwnerType("Comisión")}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
              isConsignment
                ? "border-[#D6A93D] bg-[#D6A93D]/5 text-white"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            <User className={`h-5 w-5 shrink-0 ${isConsignment ? "text-[#D6A93D]" : "text-zinc-600"}`} />
            <div>
              <p className="text-sm font-medium">En consignación</p>
              <p className="text-xs text-zinc-500">Pertenece a un tercero, AutoHouse vende</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Datos del propietario (solo consignación) ──────────── */}
      {isConsignment && (
        <>
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">
              Nombre del propietario <span className="text-red-400">*</span>
            </span>
            <Input
              name="ownerName"
              required={isConsignment}
              placeholder="Nombre completo del dueño"
              defaultValue={defaultOwnerName}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">
              Contacto del propietario <span className="text-red-400">*</span>
            </span>
            <Input
              name="ownerPhone"
              required={isConsignment}
              placeholder="Ej: 3001234567"
              defaultValue={defaultOwnerPhone}
            />
          </label>
        </>
      )}

      {/* ── Estado del vehículo ──────────────────────────────── */}
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Estado</span>
        <Select name="status" defaultValue={defaultStatus}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </Select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Tipo de entrada</span>
        <Select name="entryType" defaultValue={defaultEntryType}>
          {ENTRY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </Select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Ubicación</span>
        <Select name="locationId" defaultValue={defaultLocationId}>
          <option value="">Sin ubicación</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </Select>
      </label>

      {/* ── Campos financieros ─────────────────────────────────── */}
      {isConsignment ? (
        /* Consignación: solo precio de publicación */
        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">
            Precio de publicación <span className="text-red-400">*</span>
          </span>
          <Input
            name="targetPrice"
            type="number"
            min="0"
            required={isConsignment}
            placeholder="369000000"
            defaultValue={defaultTargetPrice ?? ""}
          />
        </label>
      ) : (
        /* Vehículo propio: campos financieros completos */
        <>
          {!isAdvisor && (
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-400">Precio compra</span>
              <Input
                name="buyPrice"
                type="number"
                min="0"
                placeholder="315000000"
                defaultValue={defaultBuyPrice ?? ""}
              />
            </label>
          )}
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Precio publicación</span>
            <Input
              name="targetPrice"
              type="number"
              min="0"
              placeholder="369000000"
              defaultValue={defaultTargetPrice ?? ""}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-400">Precio mínimo</span>
            <Input
              name="minPrice"
              type="number"
              min="0"
              placeholder="354000000"
              defaultValue={defaultMinPrice ?? ""}
            />
          </label>
          {!isAdvisor && (
            <>
              <label className="block">
                <span className="mb-2 block text-sm text-zinc-400">Costo estimado</span>
                <Input
                  name="estimatedCost"
                  type="number"
                  min="0"
                  placeholder="14500000"
                  defaultValue={defaultEstimatedCost ?? ""}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-zinc-400">Costo real inicial</span>
                <Input
                  name="realCost"
                  type="number"
                  min="0"
                  placeholder="0"
                  defaultValue={defaultRealCost ?? ""}
                />
              </label>
            </>
          )}
        </>
      )}

      {/* ── Asesores ─────────────────────────────────────────── */}
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Asesor captador</span>
        <Select name="advisorBuyerId" defaultValue={defaultAdvisorBuyerId}>
          <option value="">Sin asignar</option>
          {advisors.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </Select>
      </label>

      {!isAdvisor && (
        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">Asesor vendedor</span>
          <Select name="advisorSellerId" defaultValue={defaultAdvisorSellerId}>
            <option value="">Sin asignar</option>
            {advisors.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </label>
      )}

      {/* ── Documentos legales ──────────────────────────────── */}
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">SOAT vence</span>
        <Input name="soatDue" type="date" defaultValue={defaultSoatDue} />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-zinc-400">Tecnomecánica vence</span>
        <Input name="technoDue" type="date" defaultValue={defaultTechnoDue} />
      </label>
    </>
  );
}
