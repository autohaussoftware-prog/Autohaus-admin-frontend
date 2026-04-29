import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { VehicleDetail } from "@/components/vehicles/vehicle-detail";
import { getVehicleById, getVehicleMovementsByVehicleId } from "@/lib/data/vehicles";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) notFound();

  const movements = await getVehicleMovementsByVehicleId(vehicle.id);

  return (
    <>
      <PageHeader
        eyebrow="Ficha individual"
        title={`${vehicle.brand} ${vehicle.line}`}
        description="Control completo del vehículo desde ingreso hasta venta, entrega y cierre documental."
        actionLabel="Registrar novedad"
      />
      <VehicleDetail vehicle={vehicle} movements={movements} />
    </>
  );
}
