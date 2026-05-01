"use client";

import { AlertTriangle, Car, CircleDollarSign, Gauge, Landmark, Users, Wallet } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { compactCOP, percentage } from "@/lib/utils";
import { getVehicleProjectedMargin, getVehicleProjectedProfit } from "@/lib/domain/vehicle-calculations";
import type { AppAlert } from "@/lib/data/alerts";
import type { Commission, FinanceMovement } from "@/types/finance";
import type { Vehicle } from "@/types/vehicle";

type DashboardSeries = {
  month: string;
  ventas: number;
  utilidad: number;
  costos: number;
  unidades?: number;
};

type CashBankSeries = {
  day: string;
  banco: number;
  efectivo1: number;
  efectivo2: number;
};

export function ExecutiveDashboard({
  data,
}: {
  data: {
    vehicles: Vehicle[];
    financeMovements: FinanceMovement[];
    alerts: AppAlert[];
    commissions: Commission[];
    monthlyPerformance: DashboardSeries[];
    cashBankSeries: CashBankSeries[];
  };
}) {
  const { alerts, cashBankSeries, commissions, financeMovements, monthlyPerformance, vehicles } = data;
  const available = vehicles.filter((v) => v.status === "Disponible" || v.status === "Publicado").length;
  const separated = vehicles.filter((v) => v.status === "Separado").length;
  const sold = vehicles.filter((v) => v.status === "Vendido" || v.status === "Entregado").length;
  const invested = vehicles.reduce((sum, vehicle) => sum + vehicle.buyPrice + vehicle.realCost, 0);
  const projectedProfit = vehicles.reduce((sum, vehicle) => sum + getVehicleProjectedProfit(vehicle), 0);
  const bankBalance = financeMovements.filter((m) => m.channel === "Banco").reduce((sum, m) => sum + (m.type === "Ingreso" ? m.amount : -m.amount), 0);
  const cashBalance = financeMovements.filter((m) => m.channel !== "Banco").reduce((sum, m) => sum + (m.type === "Ingreso" ? m.amount : -m.amount), 0);
  const pendingCommissions = commissions.filter((commission) => commission.status === "Pendiente").reduce((sum, commission) => sum + commission.amount, 0);
  const averageMargin = vehicles.length
    ? vehicles.reduce((sum, vehicle) => sum + getVehicleProjectedMargin(vehicle), 0) / vehicles.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Inventario activo" value={`${vehicles.length} vehículos`} helper={`${available} disponibles · ${separated} separados · ${sold} vendidos`} icon={Car} tone="gold" />
        <StatCard label="Capital en inventario" value={compactCOP(invested)} helper="Compra + costos reales acumulados" icon={Gauge} tone="neutral" />
        <StatCard label="Utilidad proyectada" value={compactCOP(projectedProfit)} helper="Estimado según precio objetivo" icon={CircleDollarSign} tone="green" />
        <StatCard label="Alertas críticas" value={`${alerts.length} activas`} helper="Pagos, papeles, margen y costos" icon={AlertTriangle} tone="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <Card>
          <CardHeader className="flex flex-col gap-3 border-b border-zinc-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Ventas, utilidad y costos</CardTitle>
              <CardDescription>Lectura ejecutiva mensual en millones COP.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge tone="gold">Ventas</Badge>
              <Badge tone="white">Utilidad</Badge>
              <Badge tone="neutral">Gastos</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPerformance} margin={{ left: -20, right: 8, top: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ventas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D6A93D" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#D6A93D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#18181b" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 16, color: "#fff" }} />
                <Area type="monotone" dataKey="ventas" stroke="#D6A93D" fill="url(#ventas)" strokeWidth={2} />
                <Area type="monotone" dataKey="utilidad" stroke="#ffffff" fill="transparent" strokeWidth={2} />
                <Area type="monotone" dataKey="costos" stroke="#71717a" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Alertas prioritarias</CardTitle>
                <CardDescription>Riesgos que afectan dinero, entrega o margen.</CardDescription>
              </div>
              <Badge tone="red">{alerts.filter((a) => a.priority === "Alta").length} altas</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{alert.description}</p>
                  </div>
                  <Badge tone={alert.priority === "Alta" ? "red" : "amber"}>{alert.priority}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saldo bancario" value={compactCOP(bankBalance)} helper="Movimientos bancarizados registrados" icon={Landmark} tone="blue" />
        <StatCard label="Efectivo total" value={compactCOP(cashBalance)} helper="Ubicación 1 + ubicación 2" icon={Wallet} tone="gold" />
        <StatCard label="Comisiones pendientes" value={compactCOP(pendingCommissions)} helper="Captadores, vendedores y crédito" icon={Users} tone="red" />
        <StatCard label="Margen promedio" value={percentage(averageMargin)} helper="Estimado neto del inventario" icon={Gauge} tone="green" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Banco vs efectivo</CardTitle>
            <CardDescription>Separación visual de dinero bancarizado y caja física.</CardDescription>
          </CardHeader>
          <CardContent className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashBankSeries} margin={{ left: -20, right: 8, top: 20, bottom: 0 }}>
                <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 16, color: "#fff" }} />
                <Bar dataKey="banco" fill="#D6A93D" radius={[8, 8, 0, 0]} />
                <Bar dataKey="efectivo1" fill="#ffffff" radius={[8, 8, 0, 0]} />
                <Bar dataKey="efectivo2" fill="#71717a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Inventario por estado</CardTitle>
                <CardDescription>Distribución operativa actual del inventario.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
            {[
              { label: "Disponibles", tone: "green" as const, count: vehicles.filter((v) => v.status === "Disponible").length },
              { label: "Publicados", tone: "blue" as const, count: vehicles.filter((v) => v.status === "Publicado").length },
              { label: "Separados", tone: "amber" as const, count: vehicles.filter((v) => v.status === "Separado").length },
              { label: "En reparación", tone: "red" as const, count: vehicles.filter((v) => v.status === "En reparación").length },
              { label: "En trámite", tone: "neutral" as const, count: vehicles.filter((v) => v.status === "En trámite").length },
              { label: "Vendidos", tone: "gold" as const, count: vehicles.filter((v) => v.status === "Vendido" || v.status === "Entregado").length },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <Badge tone={item.tone}>{item.label}</Badge>
                <p className="mt-3 text-3xl font-semibold text-white">{item.count}</p>
                <p className="mt-1 text-xs text-zinc-500">vehículo{item.count !== 1 ? "s" : ""}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
