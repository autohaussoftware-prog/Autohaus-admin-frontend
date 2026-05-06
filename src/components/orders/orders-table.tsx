"use client";

import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { updateOrderStatusAction } from "@/app/(dashboard)/pedidos/actions";
import type { Order, OrderStatus } from "@/lib/data/orders";

const STATUS_TONE: Record<OrderStatus, "blue" | "gold" | "green" | "neutral"> = {
  "Nuevo": "blue",
  "En búsqueda": "gold",
  "Contactado": "green",
  "Cerrado": "neutral",
};

const STATUSES: OrderStatus[] = ["Nuevo", "En búsqueda", "Contactado", "Cerrado"];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function StatusSelect({ orderId, current }: { orderId: string; current: OrderStatus }) {
  return (
    <Select
      value={current}
      className="h-8 text-xs"
      onChange={async (e) => {
        await updateOrderStatusAction(orderId, e.target.value);
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </Select>
  );
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-16 text-center text-sm text-zinc-500">
        No hay pedidos registrados aún.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-900 text-xs uppercase tracking-[0.15em] text-zinc-500">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Vehículo</th>
              <th className="px-5 py-3 text-left font-medium">Presupuesto</th>
              <th className="px-5 py-3 text-left font-medium">Pago</th>
              <th className="px-5 py-3 text-left font-medium">Color</th>
              <th className="px-5 py-3 text-left font-medium">Cliente</th>
              <th className="px-5 py-3 text-left font-medium">Estado</th>
              <th className="px-5 py-3 text-left font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-zinc-900/60 hover:bg-zinc-900/40">
                <td className="px-5 py-3">
                  <p className="font-medium text-white">{order.brand} {order.line}</p>
                  <p className="text-xs text-zinc-500">Año {order.year}</p>
                </td>
                <td className="px-5 py-3 text-zinc-300">{order.budget}</td>
                <td className="px-5 py-3 text-zinc-400">{order.paymentMethod}</td>
                <td className="px-5 py-3 text-zinc-400">{order.colorPreference}</td>
                <td className="px-5 py-3">
                  {order.customerVisible ? (
                    <>
                      <p className="font-medium text-white">{order.customerName}</p>
                      <p className="text-xs text-zinc-500">{order.customerPhone}</p>
                    </>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-zinc-600">
                      <Lock className="h-3 w-3" />
                      Dato privado
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <StatusSelect orderId={order.id} current={order.status} />
                </td>
                <td className="px-5 py-3 text-xs text-zinc-500">{fmtDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
