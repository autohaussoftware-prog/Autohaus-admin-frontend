import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { VehicleDetail } from "@/components/vehicles/vehicle-detail";
import { VehiclePhotos } from "@/components/vehicles/vehicle-photos";
import { VehicleStatusChanger } from "@/components/vehicles/vehicle-status-changer";
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
  const canChangeStatus = role !== "viewer";

  return (
    <>
      <PageHeader
        eyebrow="Ficha individual"
        title={`${vehicle.brand} ${vehicle.line}`}
        description="Control completo del vehículo desde ingreso hasta venta, entrega y cierre documental."
        actionLabel="Editar vehículo"
        actionHref={`/vehiculos/${vehicle.id}/editar`}
      />
      {canChangeStatus && (
        <div className="mb-5 flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Estado actual</span>
          <VehicleStatusChanger vehicleId={vehicle.id} currentStatus={vehicle.status} />
        </div>
      )}
      <VehicleDetail vehicle={vehicle} movements={movements} showFinancials={showFinancials} />
      <div className="mt-6">
        <VehiclePhotos vehicleId={vehicle.id} photos={photos} />
      </div>
    </>
  );
}
