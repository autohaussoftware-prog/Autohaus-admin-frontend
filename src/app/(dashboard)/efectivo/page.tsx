import { Banknote, MapPin, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { MovementsTable } from "@/components/finance/movements-table";
import { getCashMovements } from "@/lib/data/finance";
import { compactCOP } from "@/lib/utils";

export default async function CashPage() {
  const cashMovements = await getCashMovements();
  const cash1 = cashMovements.filter((m) => m.channel === "Efectivo ubicación 1").reduce((sum, m) => sum + (m.type === "Ingreso" ? m.amount : -m.amount), 0);
  const cash2 = cashMovements.filter((m) => m.channel === "Efectivo ubicación 2").reduce((sum, m) => sum + (m.type === "Ingreso" ? m.amount : -m.amount), 0);
  const income = cashMovements.filter((m) => m.type === "Ingreso").reduce((sum, m) => sum + m.amount, 0);
  const outcome = cashMovements.filter((m) => m.type === "Egreso").reduce((sum, m) => sum + m.amount, 0);

  return (
    <>
      <PageHeader
        eyebrow="Contabilidad en efectivo"
        title="Caja física por ubicaciones"
        description="Control separado del efectivo en dos ubicaciones, responsables, motivos y alertas por montos grandes."
        actionLabel="Nuevo movimiento"
        actionHref="/movimientos/nuevo"
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Efectivo ubicación 1" value={compactCOP(cash1)} helper="Saldo disponible" icon={MapPin} tone="gold" />
        <StatCard label="Efectivo ubicación 2" value={compactCOP(cash2)} helper="Saldo disponible" icon={MapPin} tone="blue" />
        <StatCard label="Ingresos efectivo" value={compactCOP(income)} helper="Periodo visible" icon={TrendingUp} tone="green" />
        <StatCard label="Egresos efectivo" value={compactCOP(outcome)} helper="Periodo visible" icon={TrendingDown} tone="red" />
      </div>
      <MovementsTable title="Registro de efectivo" description="Movimientos separados por ubicación y responsable." movements={cashMovements} />
    </>
  );
}
