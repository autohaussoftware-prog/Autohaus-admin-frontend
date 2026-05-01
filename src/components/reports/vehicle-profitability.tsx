"use client";

import Link from "next/link";
import { Download, ExternalLink, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { compactCOP, currencyCOP, percentage } from "@/lib/utils";
import type { VehicleProfitRow } from "@/lib/data/reports";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function exportToCSV(rows: VehicleProfitRow[]) {
  const headers = ["Vehículo", "Placa", "Año", "Fecha cierre", "Captador", "Vendedor", "Precio compra", "Costo acumulado", "Precio venta", "Utilidad bruta", "Margen %"];
  const data = rows.map((r) => [
    r.name,
    r.plate,
    r.year,
    formatDate(r.closedAt),
    r.advisorBuyer,
    r.advisorSeller,
    r.buyPrice,
    r.realCost,
    r.agreedPrice,
    r.grossProfit,
    r.margin.toFixed(2) + "%",
  ]);

  const csv = [headers, ...data]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rentabilidad-autohaus-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function VehicleProfitability({ rows }: { rows: VehicleProfitRow[] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Rentabilidad por vehículo</CardTitle>
          <CardDescription>Sin ventas cerradas en el periodo seleccionado.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
          <TrendingUp className="h-10 w-10 text-zinc-700" />
          <p className="text-sm text-zinc-500">No hay ventas cerradas con los filtros actuales.</p>
        </CardContent>
      </Card>
    );
  }

  const totalVentas = rows.reduce((s, r) => s + r.agreedPrice, 0);
  const totalCostos = rows.reduce((s, r) => s + r.buyPrice + r.realCost, 0);
  const totalUtilidad = rows.reduce((s, r) => s + r.grossProfit, 0);
  const avgMargin = rows.reduce((s, r) => s + r.margin, 0) / rows.length;

  return (
    <Card>
      <CardHeader className="border-b border-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Rentabilidad por vehículo</CardTitle>
            <CardDescription>
              {rows.length} {rows.length === 1 ? "vehículo vendido" : "vehículos vendidos"} ·
              Margen promedio {percentage(avgMargin)}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => exportToCSV(rows)}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>

      {/* Totales */}
      <div className="grid grid-cols-3 divide-x divide-zinc-900 border-b border-zinc-900">
        <div className="px-5 py-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Total ventas</p>
          <p className="mt-1 text-lg font-semibold text-[#D6A93D]">{compactCOP(totalVentas)}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Total costos + compra</p>
          <p className="mt-1 text-lg font-semibold text-zinc-300">{compactCOP(totalCostos)}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Utilidad bruta</p>
          <p className={`mt-1 text-lg font-semibold ${totalUtilidad >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {compactCOP(totalUtilidad)}
          </p>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-zinc-900 bg-zinc-950/60 text-xs uppercase tracking-[0.18em] text-zinc-500">
              <tr>
                <th className="px-5 py-4 font-medium">Vehículo</th>
                <th className="px-5 py-4 font-medium">Fecha</th>
                <th className="px-5 py-4 font-medium">Captador</th>
                <th className="px-5 py-4 font-medium">Vendedor</th>
                <th className="px-5 py-4 text-right font-medium">Compra</th>
                <th className="px-5 py-4 text-right font-medium">Costos</th>
                <th className="px-5 py-4 text-right font-medium">Venta</th>
                <th className="px-5 py-4 text-right font-medium">Utilidad</th>
                <th className="px-5 py-4 text-right font-medium">Margen</th>
                <th className="px-5 py-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.vehicleId + row.closedAt} className="border-b border-zinc-900/80 hover:bg-zinc-950/70">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-white">{row.name}</p>
                    <p className="text-xs text-zinc-500">{row.plate} · {row.year}</p>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400">{formatDate(row.closedAt)}</td>
                  <td className="px-5 py-3.5 text-zinc-400">{row.advisorBuyer}</td>
                  <td className="px-5 py-3.5 text-zinc-400">{row.advisorSeller}</td>
                  <td className="px-5 py-3.5 text-right text-zinc-300">{compactCOP(row.buyPrice)}</td>
                  <td className="px-5 py-3.5 text-right text-zinc-300">{compactCOP(row.realCost)}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-[#D6A93D]">{compactCOP(row.agreedPrice)}</td>
                  <td className={`px-5 py-3.5 text-right font-semibold ${row.grossProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    <span className="flex items-center justify-end gap-1">
                      {row.grossProfit >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {compactCOP(Math.abs(row.grossProfit))}
                    </span>
                  </td>
                  <td className={`px-5 py-3.5 text-right font-semibold ${row.margin < 3 ? "text-red-400" : row.margin < 10 ? "text-amber-400" : "text-emerald-400"}`}>
                    {percentage(row.margin)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/vehiculos/${row.vehicleId}`} className="text-zinc-500 hover:text-[#D6A93D] transition">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
