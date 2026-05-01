import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { VehicleDetailTabs } from "@/components/vehicles/vehicle-detail-tabs";
import { VehicleStatusChanger } from "@/components/vehicles/vehicle-status-changer";
import { getVehicleById, getVehicleMovementsByVehicleId, getVehiclePhotos } from "@/lib/data/vehicles";
import { getVehicleCosts } from "@/lib/data/costs";
import { getVehicleDocs } from "@/lib/data/docs";
import { getUserRole } from "@/lib/supabase/server";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vehicle, role] = await Promise.all([getVehicleById(id), getUserRole()]);

  if (!vehicle) notFound();

  const [movements, photos, costs, legalDocs] = await Promise.all([
    getVehicleMovementsByVehicleId(vehicle.id),
    getVehiclePhotos(vehicle.id),
    getVehicleCosts(vehicle.id),
    getVehicleDocs(vehicle.id),
  ]);

  const showFinancials = role !== "advisor";
  const canChangeStatus = role !== "viewer";
  const canDeleteCosts = ["owner", "partner", "admin"].includes(role);
  const canDeleteDocs = ["owner", "partner", "admin"].includes(role);

  return (
    <>
      <PageHeader
        eyebrow="Ficha individual"
        title={`${vehicle.brand} ${vehicle.line}`}
        description={`${vehicle.version} · ${vehicle.year} · Placa ${vehicle.plate}`}
        actionLabel="Editar vehículo"
        actionHref={`/vehiculos/${vehicle.id}/editar`}
      />
      {canChangeStatus && (
        <div className="mb-5 flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Estado actual</span>
          <VehicleStatusChanger vehicleId={vehicle.id} currentStatus={vehicle.status} />
        </div>
      )}
      <VehicleDetailTabs
        vehicle={vehicle}
        movements={movements}
        photos={photos}
        costs={costs}
        legalDocs={legalDocs}
        showFinancials={showFinancials}
        canDeleteCosts={canDeleteCosts}
        canDeleteDocs={canDeleteDocs}
      />
    </>
  );
}
