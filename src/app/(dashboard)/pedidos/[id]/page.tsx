import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Car, Lock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getOrderById } from "@/lib/data/orders";
import { getVehicles } from "@/lib/data/vehicles";
import { getMatchingVehicles } from "@/lib/utils/order-matcher";
import { getCurrentUserProfile } from "@/lib/supabase/server";

function fmtPrice(n: number) {
  if (!n) return "–";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentUserProfile();
  const [order, vehicles] = await Promise.all([
    getOrderById(id, { userId: profile.id, role: profile.role }),
    getVehicles({ userId: profile.id, role: profile.role }),
  ]);

  if (!order) notFound();

  const matches = getMatchingVehicles(vehicles, order);

  return (
    <>
      <div className="mb-6">
        <Link
          href="/pedidos"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a pedidos
        </Link>
      </div>

      <PageHeader
        eyebrow="Detalle de pedido"
        title={`${order.brand} ${order.line} ${order.year}`}
        description={`Estado: ${order.status} · ${order.budget}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 lg:col-span-1">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Información del pedido
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Vehículo</dt>
              <dd className="text-right font-medium text-white">{order.brand} {order.line} {order.year}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Presupuesto</dt>
              <dd className="text-right text-zinc-300">{order.budget}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Forma de pago</dt>
              <dd className="text-right text-zinc-300">{order.paymentMethod}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Color preferido</dt>
              <dd className="text-right text-zinc-300">{order.colorPreference}</dd>
            </div>
            {order.observations && (
              <div className="pt-2 border-t border-zinc-800">
                <dt className="text-zinc-500 mb-1">Observaciones</dt>
                <dd className="text-zinc-300">{order.observations}</dd>
              </div>
            )}
            <div className="pt-2 border-t border-zinc-800">
              <dt className="text-zinc-500 mb-1">Asesor</dt>
              <dd className="text-white font-medium">{order.advisorName ?? "–"}</dd>
              {order.advisorPhone && <dd className="text-zinc-500 text-xs mt-0.5">{order.advisorPhone}</dd>}
            </div>
            <div className="pt-2 border-t border-zinc-800">
              <dt className="text-zinc-500 mb-1">Cliente</dt>
              {order.customerVisible ? (
                <>
                  <dd className="text-white font-medium">{order.customerName}</dd>
                  <dd className="text-zinc-500 text-xs mt-0.5">{order.customerPhone}</dd>
                </>
              ) : (
                <dd className="flex items-center gap-1.5 text-xs text-zinc-600">
                  <Lock className="h-3 w-3" />
                  Dato privado
                </dd>
              )}
            </div>
          </dl>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            {matches.length > 0
              ? `${matches.length} vehículo${matches.length !== 1 ? "s" : ""} en inventario coincide${matches.length === 1 ? "" : "n"}`
              : "Sin coincidencias en inventario"}
          </h2>

          {matches.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-12 text-center text-sm text-zinc-500">
              No hay vehículos disponibles que coincidan con este pedido.
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((v) => (
                <Link
                  key={v.id}
                  href={`/vehiculos/${v.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 hover:bg-zinc-900/60 transition-colors"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-800">
                    <Car className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">
                      {v.brand} {v.line} {v.year}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {v.color} · {v.plate} · {v.status}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-[#D6A93D]">{fmtPrice(v.targetPrice)}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{v.mileage.toLocaleString("es-CO")} km</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
