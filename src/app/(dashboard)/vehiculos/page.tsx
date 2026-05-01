import { Car, CircleDollarSign, Gauge, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { VehiclesInventory } from "@/components/vehicles/vehicles-inventory";
import { getVehicles } from "@/lib/data/vehicles";
import { getVehicleProjectedMargin } from "@/lib/domain/vehicle-calculations";
import { compactCOP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  const available = vehicles.filter((v) => v.status === "Disponible" || v.status === "Publicado").length;
  const totalCapital = vehicles
    .filter((v) => !["Vendido", "Entregado"].includes(v.status))
    .reduce((sum, v) => sum + v.buyPrice + v.realCost, 0);
  const risky = vehicles.filter((v) => v.alert).length;
  const avgMargin = vehicles.length
    ? vehicles.reduce((sum, v) => sum + getVehicleProjectedMargin(v), 0) / vehicles.length
    : 0;

  return (
    <>
      <PageHeader
        eyebrow="Inventario vehicular"
        title="Vehículos"
        description="Control completo del inventario: estado, documentos, costos, margenes y alertas."
        actionLabel="Nuevo vehículo"
        actionHref="/vehiculos/nuevo"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total vehículos" value={`${vehicles.length}`} helper="Propios y en comisión" icon={Car} tone="gold" />
        <StatCard label="Disponibles" value={`${available}`} helper="Listos para venta" icon={Gauge} tone="green" />
        <StatCard label="Capital activo" value={compactCOP(totalCapital)} helper={`Margen promedio ${avgMargin.toFixed(1)}%`} icon={CircleDollarSign} tone="blue" />
        <StatCard label="Con alertas" value={`${risky}`} helper="Requieren atención" icon={ShieldAlert} tone="red" />
      </div>

      <VehiclesInventory vehicles={vehicles} />
    </>
  );
}
