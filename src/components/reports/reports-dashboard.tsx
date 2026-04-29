"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, CalendarRange, CircleDollarSign, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";

type MonthlyPerformanceItem = {
  month: string;
  ventas: number;
  utilidad: number;
  gastos: number;
};

export function ReportsDashboard({ monthlyPerformance }: { monthlyPerformance: MonthlyPerformanceItem[] }) {
  return (
    <>
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reporte bancario" value="Activo" helper="Ingresos, egresos y saldo" icon={FileText} tone="blue" />
        <StatCard label="Reporte efectivo" value="2 cajas" helper="Ubicación 1 y ubicación 2" icon={CircleDollarSign} tone="gold" />
        <StatCard label="Consolidado" value="Banco + caja" helper="Vista total del negocio" icon={BarChart3} tone="green" />
        <StatCard label="Filtros" value="Mes / Año" helper="Rango, asesor, vehículo y canal" icon={CalendarRange} tone="neutral" />
      </div>

      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Reporte mensual consolidado</CardTitle>
          <CardDescription>Comparativo de ventas, utilidad y gastos. Valores en millones COP.</CardDescription>
        </CardHeader>
        <CardContent className="h-[420px] p-5">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPerformance} margin={{ left: -20, right: 8, top: 20, bottom: 0 }}>
              <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 16, color: "#fff" }} />
              <Bar dataKey="ventas" fill="#D6A93D" radius={[8, 8, 0, 0]} />
              <Bar dataKey="utilidad" fill="#ffffff" radius={[8, 8, 0, 0]} />
              <Bar dataKey="gastos" fill="#71717a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}

