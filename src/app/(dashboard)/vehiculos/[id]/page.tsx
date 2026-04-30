import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { VehicleDetail } from "@/components/vehicles/vehicle-detail";
import { VehiclePhotos } from "@/components/vehicles/vehicle-photos";
import { getVehicleById, getVehicleMovementsByVehicleId, getVehiclePhotos } from "@/lib/data/vehicles";
import { getUserRole } from "@/lib/supabase/server";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vehicle, role] = await Promise.all([getVehicleById(id), getUserRole()]);

  if (!vehicle) notFound();

  const [movements, photos] = await Promise.all([
    getVehicleMovementsByVehicleId(vehicle.id),
    getVehiclePhotos(vehicle.id),
  ]);

  const showFinancials = role !== "advisor";

  return (
    <>
      <PageHeader
        eyebrow="Ficha individual"
        title={`${vehicle.brand} ${vehicle.line}`}
        description="Control completo del vehículo desde ingreso hasta venta, entrega y cierre documental."
        actionLabel="Editar vehículo"
        actionHref={`/vehiculos/${vehicle.id}/editar`}
      />
      <VehicleDetail vehicle={vehicle} movements={movements} showFinancials={showFinancials} />
      <div className="mt-6">
        <VehiclePhotos vehicleId={vehicle.id} photos={photos} />
      </div>
    </>
  );
}
