import { Car, CircleDollarSign, TrendingUp, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { compactCOP } from "@/lib/utils";
import type { MonthlyAdvisorActivity } from "@/lib/data/reports";

function EmptyRow({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={3} className="px-4 py-6 text-center text-sm text-zinc-600">
        {message}
      </td>
    </tr>
  );
}

function CurrentMonthCard({
  title,
  icon: Icon,
  tone,
  children,
}: {
  title: string;
  icon: React.ElementType;
  tone: "gold" | "blue";
  children: React.ReactNode;
}) {
  const colors = {
    gold: "border-[#D6A93D]/20 bg-[#D6A93D]/5",
    blue: "border-blue-500/20 bg-blue-500/5",
  };
  return (
    <div className={`rounded-3xl border p-5 ${colors[tone]}`}>
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-[#D6A93D]">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function AdvisorActivityReport({ data }: { data: MonthlyAdvisorActivity[] }) {
  if (data.length === 0) return null;

  const current = data[data.length - 1];
  const sortedEntries = [...current.entries].sort((a, b) => b.count - a.count);
  const sortedSales = [...current.sales].sort((a, b) => b.count - a.count);

  return (
    <div className="mt-6 space-y-6">
      {/* Current month summary */}
      <Card>
        <CardHeader className="border-b border-zinc-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Actividad por asesor</CardTitle>
              <CardDescription>Captaciones y ventas del mes en curso — {current.label}.</CardDescription>
            </div>
            <Badge tone="gold">{current.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2">
          {/* Entries */}
          <CurrentMonthCard title="Vehículos ingresados" icon={Car} tone="gold">
            {sortedEntries.length === 0 ? (
              <p className="text-sm text-zinc-600">Sin ingresos registrados este mes.</p>
            ) : (
              <div className="space-y-2">
                {sortedEntries.map((e) => (
                  <div key={e.advisorName} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <UserRound className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      <span className="truncate text-sm text-zinc-300">{e.advisorName}</span>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-[#D6A93D]">
                      {e.count} {e.count === 1 ? "vehículo" : "vehículos"}
                    </span>
                  </div>
                ))}
                <div className="mt-3 border-t border-zinc-800 pt-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>Total</span>
                  <span className="font-medium text-white">{current.totalEntries}</span>
                </div>
              </div>
            )}
          </CurrentMonthCard>

          {/* Sales */}
          <CurrentMonthCard title="Vehículos vendidos / separados" icon={CircleDollarSign} tone="blue">
            {sortedSales.length === 0 ? (
              <p className="text-sm text-zinc-600">Sin ventas registradas este mes.</p>
            ) : (
              <div className="space-y-2">
                {sortedSales.map((s) => (
                  <div key={s.advisorName} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <UserRound className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      <span className="truncate text-sm text-zinc-300">{s.advisorName}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-white">{s.count} vta.</p>
                      <p className="text-xs text-zinc-500">{compactCOP(s.totalValue)}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-3 border-t border-zinc-800 pt-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>Total</span>
                  <div className="text-right">
                    <span className="font-medium text-white">{current.totalSales} ventas</span>
                    <span className="ml-2 text-zinc-500">· {compactCOP(current.totalSalesValue)}</span>
                  </div>
                </div>
              </div>
            )}
          </CurrentMonthCard>
        </CardContent>
      </Card>

      {/* Historical table (last 6 months) */}
      <Card>
        <CardHeader className="border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-zinc-500" />
            <CardTitle>Histórico 6 meses</CardTitle>
          </div>
          <CardDescription>Resumen de captaciones y ventas por mes.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-zinc-900 bg-zinc-950/60 text-xs uppercase tracking-[0.16em] text-zinc-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Mes</th>
                  <th className="px-5 py-3 font-medium">Captaciones</th>
                  <th className="px-5 py-3 font-medium">Quién captó</th>
                  <th className="px-5 py-3 font-medium">Ventas</th>
                  <th className="px-5 py-3 font-medium">Quién vendió</th>
                  <th className="px-5 py-3 font-medium text-right">Valor vendido</th>
                </tr>
              </thead>
              <tbody>
                {data.map((month) => {
                  const isCurrentMonth = month.monthNum === new Date().getMonth() && month.year === new Date().getFullYear();
                  const topCaptador = [...month.entries].sort((a, b) => b.count - a.count)[0];
                  const topVendedor = [...month.sales].sort((a, b) => b.count - a.count)[0];
                  return (
                    <tr
                      key={month.label}
                      className={`border-b border-zinc-900/80 ${isCurrentMonth ? "bg-zinc-900/40" : "hover:bg-zinc-950/70"}`}
                    >
                      <td className="px-5 py-4">
                        <span className="font-medium text-white">{month.label}</span>
                        {isCurrentMonth && (
                          <Badge tone="gold" className="ml-2 text-[10px]">Actual</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {month.totalEntries > 0 ? (
                          <span className="font-semibold text-[#D6A93D]">{month.totalEntries}</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {topCaptador ? (
                          <span>{topCaptador.advisorName} <span className="text-zinc-600">({topCaptador.count})</span></span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {month.totalSales > 0 ? (
                          <span className="font-semibold text-white">{month.totalSales}</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {topVendedor ? (
                          <span>{topVendedor.advisorName} <span className="text-zinc-600">({topVendedor.count})</span></span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {month.totalSalesValue > 0 ? (
                          <span className="font-medium text-white">{compactCOP(month.totalSalesValue)}</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
