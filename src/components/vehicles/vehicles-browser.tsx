"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Car, Search, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { VehicleStatusBadge } from "@/components/vehicles/vehicle-status-badge";
import { compactCOP, percentage } from "@/lib/utils";
import { getVehicleProjectedMargin } from "@/lib/domain/vehicle-calculations";
import type { Vehicle } from "@/types/vehicle";

export function VehiclesBrowser({ vehicles }: { vehicles: Vehicle[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");

  const filtered = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const text = `${vehicle.plate} ${vehicle.brand} ${vehicle.line} ${vehicle.version} ${vehicle.status}`.toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesStatus = status === "Todos" || vehicle.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, vehicles]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por placa, marca o modelo..."
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(event) => setStatus(event.target.value)} className="sm:w-48">
          <option>Todos</option>
          <option>Disponible</option>
          <option>Publicado</option>
          <option>Separado</option>
          <option>Vendido</option>
          <option>En reparación</option>
          <option>En trámite</option>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((vehicle) => {
          const margin = getVehicleProjectedMargin(vehicle);
          const isLowMargin = margin < 3;

          return (
            <Link
              key={vehicle.id}
              href={`/vehiculos/${vehicle.id}`}
              className="group rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 transition hover:border-[#D6A93D]/30 hover:bg-zinc-900/80"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-[#D6A93D] transition group-hover:border-[#D6A93D]/30">
                  <Car className="h-5 w-5" />
                </div>
                <VehicleStatusBadge status={vehicle.status} />
              </div>

              <h3 className="font-semibold text-white">
                {vehicle.brand} {vehicle.line}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {vehicle.version} · {vehicle.year}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600">Placa {vehicle.plate}</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
                  <p className="text-xs text-zinc-500">Precio objetivo</p>
                  <p className="mt-1 text-sm font-semibold text-white">{compactCOP(vehicle.targetPrice)}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
                  <p className="text-xs text-zinc-500">Margen neto</p>
                  <p className={`mt-1 text-sm font-semibold ${isLowMargin ? "text-red-300" : "text-[#D6A93D]"}`}>
                    {percentage(margin)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={vehicle.ownerType === "Propio" ? "gold" : "blue"}>{vehicle.ownerType}</Badge>
                  {vehicle.alert && <Badge tone="amber">Alerta</Badge>}
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-600 transition group-hover:text-[#D6A93D]">
                  <TrendingUp className="h-3 w-3" />
                  <span>Ver ficha</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/40 py-16 text-center">
          <Car className="mx-auto h-8 w-8 text-zinc-700" />
          <p className="mt-3 text-sm text-zinc-500">No se encontraron vehículos con ese filtro.</p>
        </div>
      )}
    </>
  );
}

