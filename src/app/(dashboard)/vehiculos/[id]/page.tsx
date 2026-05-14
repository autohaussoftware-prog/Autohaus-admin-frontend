import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { VehicleDetailTabs } from "@/components/vehicles/vehicle-detail-tabs";
import { VehicleStatusChanger } from "@/components/vehicles/vehicle-status-changer";
import { getVehicleById, getVehicleMovementsByVehicleId } from "@/lib/data/vehicles";
import { getVehicleCosts } from "@/lib/data/costs";
import { getVehicleDocs, getVehiclePhotos } from "@/lib/data/docs";
import { getVehicleInvestors } from "@/lib/data/investors";
import { getVehicleExpenses } from "@/lib/data/expenses";
import { getCurrentUserProfile } from "@/lib/supabase/server";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentUserProfile();
  const [vehicle, role] = await Promise.all([
    getVehicleById(id, { userId: profile.id, role: profile.role }),
    Promise.resolve(profile.role),
  ]);

  if (!vehicle) notFound();

  const showFinancials = role !== "advisor";
  const canChangeStatus = role !== "viewer";
  const canEdit =
    !["advisor", "viewer"].includes(role) ||
    (vehicle.createdByUserId !== undefined && vehicle.createdByUserId === profile.id);
  const canDeleteCosts = ["owner", "partner", "admin"].includes(role);
  const canDeleteDocs = ["owner", "partner", "admin"].includes(role);
  const canManageInvestments = ["owner", "partner", "admin", "gerente", "accounting"].includes(role);
  const canEditPrice =
    ["owner", "partner", "admin", "gerente"].includes(role) ||
    (vehicle.createdByUserId !== undefined && vehicle.createdByUserId === profile.id);
  const canDelete =
    ["owner", "partner", "admin", "gerente"].includes(role) ||
    (vehicle.createdByUserId !== undefined && vehicle.createdByUserId === profile.id);
  const canEditCommission = ["owner", "partner", "admin", "gerente"].includes(role);

  const [movements, costs, legalDocs, photos, investors, expenses] = await Promise.all([
    getVehicleMovementsByVehicleId(vehicle.id),
    getVehicleCosts(vehicle.id),
    getVehicleDocs(vehicle.id),
    getVehiclePhotos(vehicle.id),
    showFinancials ? getVehicleInvestors(vehicle.id) : Promise.resolve([]),
    showFinancials ? getVehicleExpenses(vehicle.id) : Promise.resolve([]),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Ficha individual"
        title={`${vehicle.brand} ${vehicle.line}`}
        description={`${vehicle.version} · ${vehicle.year} · Placa ${vehicle.plate}`}
        actionLabel={canEdit ? "Editar vehículo" : undefined}
        actionHref={canEdit ? `/vehiculos/${vehicle.id}/editar` : undefined}
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
        costs={costs}
        legalDocs={legalDocs}
        photos={photos}
        investors={investors}
        expenses={expenses}
        showFinancials={showFinancials}
        canDeleteCosts={canDeleteCosts}
        canDeleteDocs={canDeleteDocs}
        canManageInvestments={canManageInvestments}
        canEditPrice={canEditPrice}
        canManagePhotos={canEdit}
      canEdit={canEdit}
      canDelete={canDelete}
      canEditCommission={canEditCommission}
      />
    </>
  );
}
