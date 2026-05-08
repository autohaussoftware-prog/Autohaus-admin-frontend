import { redirect } from "next/navigation";
import { Car, AlertCircle } from "lucide-react";
import { getCurrentUserProfile } from "@/lib/supabase/server";
import { getInvestorPortalData } from "@/lib/data/investors";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function fmtCOP(n: number) {
  if (!n) return "$0";
  return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function compactCOP(n: number) {
  if (!n) return "$0";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmtCOP(n);
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    Disponible: "text-emerald-400",
    Publicado: "text-blue-400",
    Separado: "text-amber-400",
    Vendido: "text-zinc-400",
    Entregado: "text-zinc-500",
    "En reparación": "text-purple-400",
    "En trámite": "text-orange-400",
  };
  return map[status] ?? "text-zinc-400";
}

export default async function MisInversionesPage() {
  const user = await getCurrentUserProfile();

  if (user.role !== "inversionista" && user.role !== "owner" && user.role !== "admin") {
    redirect("/");
  }

  const investments = await getInvestorPortalData(user.id);

  const totalInvested = investments.reduce((s, i) => s + i.monto, 0);
  const totalEstimatedReturn = investments.reduce((s, i) => {
    if (i.buyPrice <= 0) return s + i.monto;
    const share = i.monto / i.buyPrice;
    return s + i.monto + (i.targetPrice - i.buyPrice) * share;
  }, 0);
  const totalGain = totalEstimatedReturn - totalInvested;

  return (
    <>
      <PageHeader
        eyebrow="Portal inversionista"
        title={`Hola, ${user.name.split(" ")[0]}`}
        description="Resumen de tus inversiones en el inventario de Autohaus."
      />

      {investments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-zinc-800 py-20 text-center">
          <AlertCircle className="h-10 w-10 text-zinc-600" />
          <div>
            <p className="text-zinc-300">No tienes inversiones registradas aún.</p>
            <p className="mt-1 text-sm text-zinc-600">Cuando un vehículo se registre con tu participación, aparecerá aquí.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Capital invertido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{compactCOP(totalInvested)}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{investments.length} {investments.length === 1 ? "vehículo" : "vehículos"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Retorno estimado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{compactCOP(totalEstimatedReturn)}</p>
                <p className="mt-0.5 text-xs text-zinc-500">Basado en precio de publicación</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Ganancia estimada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${totalGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {totalGain >= 0 ? "+" : ""}{compactCOP(totalGain)}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {totalInvested > 0 ? `${((totalGain / totalInvested) * 100).toFixed(1)}% sobre el capital` : ""}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Investments table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="border-b border-zinc-900 bg-zinc-950/50 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    <tr>
                      <th className="px-5 py-4 font-medium">Vehículo</th>
                      <th className="px-5 py-4 font-medium">Estado</th>
                      <th className="px-5 py-4 font-medium">Mi aporte</th>
                      <th className="px-5 py-4 font-medium">Precio publicación</th>
                      <th className="px-5 py-4 font-medium">Ganancia estimada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((inv) => {
                      const hasPrice = inv.buyPrice > 0;
                      const share = hasPrice ? inv.monto / inv.buyPrice : 0;
                      const gain = hasPrice ? (inv.targetPrice - inv.buyPrice) * share : 0;
                      const returnAmount = inv.monto + gain;

                      return (
                        <tr key={inv.investorId} className="border-b border-zinc-900/80 hover:bg-zinc-950/60 transition">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-[#D6A93D]">
                                <Car className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{inv.brand} {inv.line}</p>
                                <p className="text-xs text-zinc-500">{inv.plate} · {inv.year}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs font-medium ${statusColor(inv.status)}`}>{inv.status}</span>
                          </td>
                          <td className="px-5 py-3.5 font-medium text-white">{fmtCOP(inv.monto)}</td>
                          <td className="px-5 py-3.5 text-zinc-300">{fmtCOP(inv.targetPrice)}</td>
                          <td className="px-5 py-3.5">
                            {hasPrice ? (
                              <div>
                                <p className={`font-medium ${gain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                  {gain >= 0 ? "+" : ""}{fmtCOP(gain)}
                                </p>
                                <p className="text-xs text-zinc-500">Retorno: {fmtCOP(returnAmount)}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-600">Sin precio de compra</span>
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

          <p className="mt-3 text-xs text-zinc-600">
            * Las ganancias son estimadas con base en el precio de publicación actual. El valor real se determina al momento de la venta.
          </p>
        </>
      )}
    </>
  );
}
