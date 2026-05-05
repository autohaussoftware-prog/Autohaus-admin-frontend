import { Car, CircleDollarSign, Calendar } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import type { AdvisorStats } from "@/lib/data/advisor-dashboard";

const STATUS_TONE: Record<string, "green" | "gold" | "blue" | "red" | "neutral"> = {
  Disponible: "green",
  Vendido: "blue",
  Separado: "gold",
  Entregado: "neutral",
  "En comisión": "gold",
};

const SALE_TONE: Record<string, "green" | "gold" | "blue" | "neutral"> = {
  vendido: "blue",
  entregado: "green",
  separacion: "gold",
};

function fmt(n: number) {
  return "$" + n.toLocaleString("es-CO");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

export function AdvisorDashboard({ data }: { data: AdvisorStats }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Vehículos ingresados"
          value={`${data.vehiclesRegistered}`}
          helper="Total registrados por ti"
          icon={Car}
          tone="gold"
        />
        <StatCard
          label="Disponibles"
          value={`${data.vehiclesAvailable}`}
          helper="Listos para venta"
          icon={Car}
          tone="green"
        />
        <StatCard
          label="Ventas totales"
          value={`${data.salesTotal}`}
          helper="Todas tus ventas registradas"
          icon={CircleDollarSign}
          tone="blue"
        />
        <StatCard
          label="Ventas este mes"
          value={`${data.salesThisMonth}`}
          helper={new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
          icon={Calendar}
          tone="gold"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Mis vehículos */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
            <div>
              <h2 className="font-semibold text-white">Mis vehículos ingresados</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Últimos registrados por ti</p>
            </div>
            <a
              href="/vehiculos"
              className="text-xs text-[#D6A93D] hover:underline"
            >
              Ver todos
            </a>
          </div>
          {data.recentVehicles.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">
              No has ingresado vehículos aún.{" "}
              <a href="/vehiculos/nuevo" className="text-[#D6A93D] hover:underline">
                Ingresar uno
              </a>
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-900 text-xs uppercase tracking-[0.15em] text-zinc-500">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Vehículo</th>
                  <th className="px-5 py-3 text-left font-medium">Estado</th>
                  <th className="px-5 py-3 text-left font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.recentVehicles.map((v) => (
                  <tr key={v.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/40">
                    <td className="px-5 py-3">
                      <p className="font-medium text-white">
                        {v.brand} {v.line}
                      </p>
                      <p className="text-xs text-zinc-500">{v.plate}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[v.status] ?? "neutral"}>{v.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-500">{fmtDate(v.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mis ventas */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
            <div>
              <h2 className="font-semibold text-white">Mis ventas</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Últimas registradas por ti</p>
            </div>
            <a href="/ventas" className="text-xs text-[#D6A93D] hover:underline">
              Ver todas
            </a>
          </div>
          {data.recentSales.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">
              No has registrado ventas aún.{" "}
              <a href="/ventas" className="text-[#D6A93D] hover:underline">
                Registrar una
              </a>
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-900 text-xs uppercase tracking-[0.15em] text-zinc-500">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Vehículo</th>
                  <th className="px-5 py-3 text-left font-medium">Cliente</th>
                  <th className="px-5 py-3 text-right font-medium">Precio</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSales.map((s) => (
                  <tr key={s.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/40">
                    <td className="px-5 py-3">
                      <p className="font-medium text-white">{s.vehicleName}</p>
                      <p className="text-xs text-zinc-500">{s.vehiclePlate}</p>
                    </td>
                    <td className="px-5 py-3 text-zinc-400">{s.customerName ?? "—"}</td>
                    <td className="px-5 py-3 text-right">
                      <p className="text-zinc-300">{fmt(s.agreedPrice)}</p>
                      <Badge tone={SALE_TONE[s.saleStatus] ?? "neutral"} className="mt-0.5">
                        {s.saleStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
