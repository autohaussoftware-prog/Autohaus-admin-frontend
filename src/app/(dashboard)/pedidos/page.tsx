import { Inbox, Search, Phone, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { OrdersTable } from "@/components/orders/orders-table";
import { getOrders } from "@/lib/data/orders";
import { getVehicles } from "@/lib/data/vehicles";
import { getMatchingVehicles } from "@/lib/utils/order-matcher";
import { getCurrentUserProfile } from "@/lib/supabase/server";

export default async function PedidosPage() {
  const profile = await getCurrentUserProfile();
  const [orders, vehicles] = await Promise.all([
    getOrders({ userId: profile.id, role: profile.role }),
    getVehicles(),
  ]);

  const matchCounts: Record<string, number> = {};
  for (const order of orders) {
    matchCounts[order.id] = getMatchingVehicles(vehicles, order).length;
  }

  const nuevo = orders.filter((o) => o.status === "Nuevo").length;
  const enBusqueda = orders.filter((o) => o.status === "En búsqueda").length;
  const contactado = orders.filter((o) => o.status === "Contactado").length;
  const cerrado = orders.filter((o) => o.status === "Cerrado").length;

  return (
    <>
      <PageHeader
        eyebrow="Gestión comercial"
        title="Pedidos"
        description="Solicitudes de clientes que buscan un vehículo específico."
        actionLabel="Nuevo pedido"
        actionHref="/pedidos/nuevo"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Nuevos"
          value={`${nuevo}`}
          helper="Sin procesar"
          icon={Inbox}
          tone="blue"
        />
        <StatCard
          label="En búsqueda"
          value={`${enBusqueda}`}
          helper="Buscando vehículo"
          icon={Search}
          tone="gold"
        />
        <StatCard
          label="Contactados"
          value={`${contactado}`}
          helper="Cliente notificado"
          icon={Phone}
          tone="green"
        />
        <StatCard
          label="Cerrados"
          value={`${cerrado}`}
          helper="Finalizados"
          icon={CheckCircle}
          tone="neutral"
        />
      </div>

      <OrdersTable orders={orders} matchCounts={matchCounts} />
    </>
  );
}
