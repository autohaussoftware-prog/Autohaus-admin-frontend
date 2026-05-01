"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Car, Clock, Columns3, LayoutGrid, List, Search, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { compactCOP, percentage } from "@/lib/utils";
import { getVehicleProjectedMargin } from "@/lib/domain/vehicle-calculations";
import { VehicleStatusBadge } from "./vehicle-status-badge";
import type { Vehicle } from "@/types/vehicle";

const ALL_STATUSES = [
  "Todos", "Disponible", "Publicado", "Separado", "En comisión",
  "En reparación", "En trámite", "Papeles pendientes", "Vendido", "Entregado", "No publicado",
];

function daysInInventory(vehicle: Vehicle): number | null {
  if (!vehicle.createdAt) return null;
  return Math.floor((Date.now() - new Date(vehicle.createdAt).getTime()) / (1000 * 60 * 60 * 24));
}

function CardView({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((vehicle) => {
        const margin = getVehicleProjectedMargin(vehicle);
        const isLowMargin = margin < 3;
        return (
          <Link
            key={vehicle.id}
            href={`/vehiculos/${vehicle.id}`}
            className="group rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5 transition hover:border-[#D6A93D]/30 hover:bg-zinc-900/80"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-[#D6A93D]">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-white group-hover:text-[#D6A93D]">
                    {vehicle.brand} {vehicle.line}
                  </p>
                  <p className="text-xs text-zinc-500">{vehicle.plate} · {vehicle.year}</p>
                </div>
              </div>
              <VehicleStatusBadge status={vehicle.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
                <p className="text-xs text-zinc-500">Precio objetivo</p>
                <p className="mt-0.5 text-sm font-semibold text-white">{compactCOP(vehicle.targetPrice)}</p>
              </div>
              <div className={`rounded-2xl border p-3 ${isLowMargin ? "border-red-500/20 bg-red-500/5" : "border-zinc-800 bg-zinc-900/60"}`}>
                <p className={`text-xs ${isLowMargin ? "text-red-400" : "text-zinc-500"}`}>
                  <TrendingUp className="mr-1 inline h-3 w-3" />Margen neto
                </p>
                <p className={`mt-0.5 text-sm font-semibold ${isLowMargin ? "text-red-300" : "text-[#D6A93D]"}`}>
                  {percentage(margin)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span>{vehicle.location}</span>
              <span>·</span>
              <span>{vehicle.ownerType}</span>
              {vehicle.advisorBuyer !== "Sin asignar" && (
                <>
                  <span>·</span>
                  <span>{vehicle.advisorBuyer}</span>
                </>
              )}
              {vehicle.alert && (
                <span className="ml-auto text-amber-400">{vehicle.alert}</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

const KANBAN_COLUMNS = [
  { status: "Disponible", color: "border-emerald-500/30 bg-emerald-500/5", label: "Disponible" },
  { status: "Publicado", color: "border-blue-500/30 bg-blue-500/5", label: "Publicado" },
  { status: "Separado", color: "border-amber-500/30 bg-amber-500/5", label: "Separado" },
  { status: "En reparación", color: "border-purple-500/30 bg-purple-500/5", label: "En reparación" },
  { status: "En trámite", color: "border-orange-500/30 bg-orange-500/5", label: "En trámite" },
  { status: "Vendido", color: "border-zinc-700/30 bg-zinc-900/30", label: "Vendido" },
];

function KanbanView({ vehicles }: { vehicles: Vehicle[] }) {
  const byStatus = useMemo(() => {
    const map: Record<string, Vehicle[]> = {};
    for (const col of KANBAN_COLUMNS) map[col.status] = [];
    for (const v of vehicles) {
      if (map[v.status]) map[v.status].push(v);
    }
    return map;
  }, [vehicles]);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {KANBAN_COLUMNS.map((col) => {
          const colVehicles = byStatus[col.status] ?? [];
          return (
            <div key={col.status} className={`w-72 rounded-3xl border ${col.color} flex flex-col`}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">{col.label}</p>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{colVehicles.length}</span>
              </div>
              <div className="flex-1 space-y-3 p-3">
                {colVehicles.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-800 py-6 text-center">
                    <p className="text-xs text-zinc-600">Sin vehículos</p>
                  </div>
                ) : (
                  colVehicles.map((vehicle) => {
                    const margin = getVehicleProjectedMargin(vehicle);
                    return (
                      <Link
                        key={vehicle.id}
                        href={`/vehiculos/${vehicle.id}`}
                        className="block rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3.5 transition hover:border-[#D6A93D]/30"
                      >
                        <p className="text-sm font-medium text-white">{vehicle.brand} {vehicle.line}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{vehicle.plate} · {vehicle.year}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-xs text-zinc-400">{compactCOP(vehicle.targetPrice)}</p>
                          <p className={`text-xs font-medium ${margin < 3 ? "text-red-400" : "text-[#D6A93D]"}`}>
                            {percentage(margin)}
                          </p>
                        </div>
                        {vehicle.advisorBuyer !== "Sin asignar" && (
                          <p className="mt-1.5 text-xs text-zinc-600">{vehicle.advisorBuyer}</p>
                        )}
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableView({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-zinc-900 bg-zinc-950/50 text-xs uppercase tracking-[0.18em] text-zinc-500">
              <tr>
                <th className="px-5 py-4 font-medium">Vehículo</th>
                <th className="px-5 py-4 font-medium">Estado</th>
                <th className="px-5 py-4 font-medium">Ubicación</th>
                <th className="px-5 py-4 font-medium">Precio obj.</th>
                <th className="px-5 py-4 font-medium">Margen</th>
                <th className="px-5 py-4 font-medium">Origen</th>
                <th className="px-5 py-4 font-medium">Días inv.</th>
                <th className="px-5 py-4 font-medium">SOAT vence</th>
                <th className="px-5 py-4 font-medium">Alerta</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-zinc-500">
                    No hay vehículos que coincidan con el filtro.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => {
                  const margin = getVehicleProjectedMargin(vehicle);
                  const days = daysInInventory(vehicle);
                  return (
                    <tr key={vehicle.id} className="border-b border-zinc-900/80 transition hover:bg-zinc-950/80">
                      <td className="px-5 py-3.5">
                        <Link href={`/vehiculos/${vehicle.id}`} className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-[#D6A93D]">
                            <Car className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-white hover:text-[#D6A93D]">{vehicle.brand} {vehicle.line}</p>
                            <p className="text-xs text-zinc-500">{vehicle.plate} · {vehicle.year} · {vehicle.version}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5"><VehicleStatusBadge status={vehicle.status} /></td>
                      <td className="px-5 py-3.5 text-zinc-400">{vehicle.location}</td>
                      <td className="px-5 py-3.5 font-medium text-white">{compactCOP(vehicle.targetPrice)}</td>
                      <td className={`px-5 py-3.5 font-medium ${margin < 3 ? "text-red-300" : "text-[#D6A93D]"}`}>
                        {percentage(margin)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={vehicle.ownerType === "Propio" ? "gold" : "blue"}>{vehicle.ownerType}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {days !== null && !["Vendido", "Entregado"].includes(vehicle.status) ? (
                          <span className={`flex items-center gap-1 text-xs ${days > 60 ? "text-red-400" : days > 30 ? "text-amber-400" : "text-zinc-400"}`}>
                            <Clock className="h-3 w-3" />{days}d
                          </span>
                        ) : <span className="text-xs text-zinc-600">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400">{vehicle.soatDue || "—"}</td>
                      <td className="px-5 py-3.5">
                        {vehicle.alert
                          ? <span className="text-xs text-amber-400">{vehicle.alert}</span>
                          : <span className="text-xs text-emerald-500">OK</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function VehiclesInventory({ vehicles, initialQuery }: { vehicles: Vehicle[]; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [status, setStatus] = useState("Todos");
  const [brand, setBrand] = useState("Todas");
  const [ownerType, setOwnerType] = useState("Todos");
  const [view, setView] = useState<"cards" | "table" | "kanban">("table");

  const brands = useMemo(() => ["Todas", ...Array.from(new Set(vehicles.map((v) => v.brand))).sort()], [vehicles]);
  const ownerTypes = ["Todos", "Propio", "Comisión"];

  const filtered = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const text = `${vehicle.plate} ${vehicle.brand} ${vehicle.line} ${vehicle.version} ${vehicle.color} ${vehicle.advisorBuyer}`.toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesStatus = status === "Todos" || vehicle.status === status;
      const matchesBrand = brand === "Todas" || vehicle.brand === brand;
      const matchesOwner = ownerType === "Todos" || vehicle.ownerType === ownerType;
      return matchesQuery && matchesStatus && matchesBrand && matchesOwner;
    });
  }, [query, status, brand, ownerType, vehicles]);

  const hasFilters = status !== "Todos" || brand !== "Todas" || ownerType !== "Todos" || query;

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por placa, marca, modelo, color…"
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-48">
          {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Select value={brand} onChange={(e) => setBrand(e.target.value)} className="sm:w-40">
          {brands.map((b) => <option key={b}>{b}</option>)}
        </Select>
        <Select value={ownerType} onChange={(e) => setOwnerType(e.target.value)} className="sm:w-36">
          {ownerTypes.map((o) => <option key={o}>{o}</option>)}
        </Select>
        <div className="flex overflow-hidden rounded-xl border border-zinc-800">
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs transition ${view === "table" ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}
          >
            <List className="h-3.5 w-3.5" /> Tabla
          </button>
          <button
            onClick={() => setView("cards")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs transition ${view === "cards" ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Cards
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs transition ${view === "kanban" ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}
          >
            <Columns3 className="h-3.5 w-3.5" /> Kanban
          </button>
        </div>
      </div>
      {hasFilters && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-zinc-500">{filtered.length} de {vehicles.length} vehículos</p>
          <button
            onClick={() => { setQuery(""); setStatus("Todos"); setBrand("Todas"); setOwnerType("Todos"); }}
            className="text-xs text-zinc-500 hover:text-white transition"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {!hasFilters && <p className="mb-3 text-xs text-zinc-600">{filtered.length} de {vehicles.length} vehículos</p>}

      {view === "table" && <TableView vehicles={filtered} />}
      {view === "cards" && <CardView vehicles={filtered} />}
      {view === "kanban" && <KanbanView vehicles={filtered} />}
    </>
  );
}
