"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { compactCOP, percentage } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";
import { VehicleStatusBadge } from "./vehicle-status-badge";

export function VehiclesTable({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
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
    <Card>
      <CardHeader className="border-b border-zinc-900">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <CardTitle>Inventario vehicular</CardTitle>
            <CardDescription>Control de estado, ubicación, margen, origen y alertas por vehículo.</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar placa o modelo"
                className="pl-9 sm:w-72"
              />
            </div>
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>Todos</option>
              <option>Disponible</option>
              <option>Separado</option>
              <option>Vendido</option>
              <option>En trámite</option>
              <option>En reparación</option>
              <option>Publicado</option>
            </Select>
            <Button onClick={() => router.push("/vehiculos/nuevo")}>Nuevo vehículo</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="border-b border-zinc-900 bg-zinc-950/50 text-xs uppercase tracking-[0.18em] text-zinc-500">
              <tr>
                <th className="px-5 py-4 font-medium">Vehículo</th>
                <th className="px-5 py-4 font-medium">Estado</th>
                <th className="px-5 py-4 font-medium">Ubicación</th>
                <th className="px-5 py-4 font-medium">Compra</th>
                <th className="px-5 py-4 font-medium">Venta objetivo</th>
                <th className="px-5 py-4 font-medium">Margen neto</th>
                <th className="px-5 py-4 font-medium">Origen</th>
                <th className="px-5 py-4 font-medium">Publicación</th>
                <th className="px-5 py-4 font-medium">Alerta</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vehicle) => {
                const margin = ((vehicle.targetPrice - vehicle.buyPrice - vehicle.realCost) / vehicle.targetPrice) * 100;
                return (
                  <tr key={vehicle.id} className="border-b border-zinc-900/80 transition hover:bg-zinc-950/80">
                    <td className="px-5 py-4">
                      <Link href={`/vehiculos/${vehicle.id}`} className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-[#D6A93D]">
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{vehicle.brand} {vehicle.line}</p>
                          <p className="text-xs text-zinc-500">{vehicle.plate} · {vehicle.year} · {vehicle.version}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4"><VehicleStatusBadge status={vehicle.status} /></td>
                    <td className="px-5 py-4 text-zinc-300">{vehicle.location}</td>
                    <td className="px-5 py-4 text-zinc-400">{compactCOP(vehicle.buyPrice)}</td>
                    <td className="px-5 py-4 text-white">{compactCOP(vehicle.targetPrice)}</td>
                    <td className="px-5 py-4 text-[#D6A93D]">{percentage(margin)}</td>
                    <td className="px-5 py-4 text-zinc-400">{vehicle.ownerType}</td>
                    <td className="px-5 py-4"><Badge tone={vehicle.published ? "green" : "neutral"}>{vehicle.published ? "Publicado" : "No publicado"}</Badge></td>
                    <td className="px-5 py-4"><span className={vehicle.alert ? "text-amber-300" : "text-emerald-300"}>{vehicle.alert ?? "OK"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
