import { Users, ShoppingBag, CircleDollarSign, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { CustomersTable } from "@/components/customers/customers-table";
import { getCustomers, getCustomersSummary } from "@/lib/data/customers";
import { compactCOP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [summary, { customers, total }] = await Promise.all([
    getCustomersSummary(),
    getCustomers({ page }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="CRM"
        title="Clientes"
        description="Historial de compradores registrados en el sistema. Cada cliente agrupa sus compras y el valor total transaccionado."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clientes registrados" value={`${summary.total}`} helper={`${summary.withPurchases} con compras`} icon={Users} tone="gold" />
        <StatCard label="Clientes recurrentes" value={`${summary.repeat}`} helper="2 o más compras" icon={Star} tone="green" />
        <StatCard label="Compras totales" value={`${summary.totalPurchases}`} helper="Ventas con cliente asignado" icon={ShoppingBag} tone="blue" />
        <StatCard label="Facturación total" value={compactCOP(summary.totalRevenue)} helper="Precio acordado acumulado" icon={CircleDollarSign} tone="neutral" />
      </div>

      <CustomersTable customers={customers} total={total} page={page} />
    </>
  );
}
