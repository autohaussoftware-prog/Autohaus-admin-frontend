import { PageHeader } from "@/components/shared/page-header";
import { VehiclesTable } from "@/components/vehicles/vehicles-table";
import { StatCard } from "@/components/shared/stat-card";
import { Car, CircleDollarSign, Gauge, ShieldAlert } from "lucide-react";
import { compactCOP } from "@/lib/utils";
import { getVehicles } from "@/lib/data/vehicles";
import { getVehicleProjectedMargin } from "@/lib/domain/vehicle-calculations";

export default async function InventoryPage() {
  const vehicles = await getVehicles();
  const totalValue = vehicles.reduce((sum, vehicle) => sum + vehicle.buyPrice + vehicle.realCost, 0);
  const available = vehicles.filter((vehicle) => vehicle.status === "Disponible" || vehicle.status === "Publicado").length;
  const risky = vehicles.filter((vehicle) => vehicle.alert).length;
  const avgMargin = vehicles.length
    ? vehicles.reduce((sum, vehicle) => sum + getVehicleProjectedMargin(vehicle), 0) / vehicles.length
    : 0;

  return (
    <>
      <PageHeader
        eyebrow="Inventario vehicular"
        title="Inventario operativo Autohaus"
        description="Vista completa de vehículos propios y en comisión, estados comerciales, ubicación, precios, márgenes y alertas."
        actionLabel="Crear vehículo"
        actionHref="/vehiculos/nuevo"
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Vehículos registrados" value={`${vehicles.length}`} helper="Propios y en comisión" icon={Car} tone="gold" />
        <StatCard label="Disponibles" value={`${available}`} helper="Listos para publicación o venta" icon={Gauge} tone="green" />
        <StatCard label="Capital controlado" value={compactCOP(totalValue)} helper="Compra + costos acumulados" icon={CircleDollarSign} tone="blue" />
        <StatCard label="Alertas" value={`${risky}`} helper={`Margen promedio ${avgMargin.toFixed(1)}%`} icon={ShieldAlert} tone="red" />
      </div>
      <VehiclesTable vehicles={vehicles} />
    </>
  );
}
