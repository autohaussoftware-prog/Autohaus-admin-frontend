import { Users, ShoppingBag, CircleDollarSign, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { CustomersTable } from "@/components/customers/customers-table";
import { getCustomers } from "@/lib/data/customers";
import { compactCOP } from "@/lib/utils";

export default async function ClientesPage() {
  const customers = await getCustomers();

  const totalCustomers = customers.length;
  const withPurchases = customers.filter((c) => c.purchaseCount > 0).length;
  const repeat = customers.filter((c) => c.purchaseCount >= 2).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <>
      <PageHeader
        eyebrow="CRM"
        title="Clientes"
        description="Historial de compradores registrados en el sistema. Cada cliente agrupa sus compras y el valor total transaccionado."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clientes registrados" value={`${totalCustomers}`} helper={`${withPurchases} con compras`} icon={Users} tone="gold" />
        <StatCard label="Clientes recurrentes" value={`${repeat}`} helper="2 o más compras" icon={Star} tone="green" />
        <StatCard label="Compras totales" value={`${customers.reduce((s, c) => s + c.purchaseCount, 0)}`} helper="Ventas con cliente asignado" icon={ShoppingBag} tone="blue" />
        <StatCard label="Facturación total" value={compactCOP(totalRevenue)} helper="Precio acordado acumulado" icon={CircleDollarSign} tone="neutral" />
      </div>

      <CustomersTable customers={customers} />
    </>
  );
}
