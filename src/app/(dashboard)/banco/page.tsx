import { Landmark, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { MovementsTable } from "@/components/finance/movements-table";
import { getBankMovements } from "@/lib/data/finance";
import { compactCOP } from "@/lib/utils";

export default async function BankPage() {
  const bankMovements = await getBankMovements();
  const income = bankMovements.filter((m) => m.type === "Ingreso").reduce((sum, m) => sum + m.amount, 0);
  const outcome = bankMovements.filter((m) => m.type === "Egreso").reduce((sum, m) => sum + m.amount, 0);
  const balance = income - outcome;

  return (
    <>
      <PageHeader
        eyebrow="Contabilidad bancaria"
        title="Movimientos bancarizados"
        description="Control de ingresos, egresos, soportes, categorías, responsables y asociación a vehículo."
        actionLabel="Nuevo movimiento bancario"
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saldo bancario" value={compactCOP(balance)} helper="Ingresos menos egresos registrados" icon={Landmark} tone="blue" />
        <StatCard label="Ingresos" value={compactCOP(income)} helper="Ventas, abonos y créditos" icon={TrendingUp} tone="green" />
        <StatCard label="Egresos" value={compactCOP(outcome)} helper="Costos, trámites y comisiones" icon={TrendingDown} tone="red" />
        <StatCard label="Movimientos" value={`${bankMovements.length}`} helper="Registros visibles en frontend" icon={WalletCards} tone="gold" />
      </div>
      <MovementsTable title="Registro bancario" description="Movimientos bancarios con trazabilidad por responsable y concepto." movements={bankMovements} />
    </>
  );
}
