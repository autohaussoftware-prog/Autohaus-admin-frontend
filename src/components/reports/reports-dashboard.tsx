"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CircleDollarSign, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { compactCOP, percentage } from "@/lib/utils";
import type { MonthlyPerformanceItem } from "@/lib/data/reports";

export function ReportsDashboard({ monthlyPerformance }: { monthlyPerformance: MonthlyPerformanceItem[] }) {
  const totalVentas = monthlyPerformance.reduce((s, m) => s + m.ventas, 0);
  const totalUtilidad = monthlyPerformance.reduce((s, m) => s + m.utilidad, 0);
  const totalUnidades = monthlyPerformance.reduce((s, m) => s + m.unidades, 0);
  const avgMargin = totalVentas > 0 ? (totalUtilidad / totalVentas) * 100 : 0;

  return (
    <>
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ventas del periodo"
          value={`${compactCOP(totalVentas)}M`}
          helper={`${totalUnidades} unidades vendidas`}
          icon={CircleDollarSign}
          tone="gold"
        />
        <StatCard
          label="Utilidad bruta"
          value={`${compactCOP(totalUtilidad)}M`}
          helper="Ventas menos compra y costos"
          icon={TrendingUp}
          tone="green"
        />
        <StatCard
          label="Margen promedio"
          value={percentage(avgMargin)}
          helper="Sobre precio de venta"
          icon={Trophy}
          tone="blue"
        />
        <StatCard
          label="Unidades"
          value={`${totalUnidades}`}
          helper="Vehículos vendidos en periodo"
          icon={TrendingDown}
          tone="neutral"
        />
      </div>

      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Rendimiento mensual</CardTitle>
          <CardDescription>
            Ventas, costos (compra + acondicionamiento) y utilidad bruta. Valores en millones COP.
            <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
              Calculado desde tabla ventas reales
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[420px] p-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPerformance} margin={{ left: -20, right: 8, top: 20, bottom: 0 }}>
              <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 16, color: "#fff" }}
                formatter={(value, name) => [
                  `$${Number(value ?? 0)}M`,
                  name === "ventas" ? "Ventas" : name === "costos" ? "Costos" : "Utilidad",
                ]}
              />
              <Legend
                formatter={(value) => value === "ventas" ? "Ventas" : value === "costos" ? "Costos" : "Utilidad"}
                wrapperStyle={{ fontSize: 12, color: "#71717a" }}
              />
              <Bar dataKey="ventas" fill="#D6A93D" radius={[8, 8, 0, 0]} />
              <Bar dataKey="costos" fill="#71717a" radius={[8, 8, 0, 0]} />
              <Bar dataKey="utilidad" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
