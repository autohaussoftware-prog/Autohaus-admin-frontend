import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getVehicleById, getVehicleFormOptions } from "@/lib/data/vehicles";
import { getCurrentUserProfile } from "@/lib/supabase/server";
import { canAccessRoute } from "@/lib/permissions";
import { EditVehicleForm } from "@/components/vehicles/edit-vehicle-form";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentUserProfile();
  const role = profile.role;

  if (!canAccessRoute(role, `/vehiculos/${id}/editar`)) redirect("/vehiculos");

  const [vehicle, { locations, advisors }] = await Promise.all([
    getVehicleById(id, { userId: profile.id, role }),
    getVehicleFormOptions(),
  ]);

  if (!vehicle) notFound();

  const advisorBuyerId = advisors.find((a) => a.name === vehicle.advisorBuyer)?.id ?? "";
  const advisorSellerId = advisors.find((a) => a.name === vehicle.advisorSeller)?.id ?? "";
  const locationId = locations.find((l) => l.name === vehicle.location)?.id ?? "";

  return (
    <>
      <PageHeader
        eyebrow="Editar vehículo"
        title={`${vehicle.brand} ${vehicle.line}`}
        description="Actualiza cualquier dato del vehículo. Los cambios quedan registrados en el historial."
      />

      <EditVehicleForm
        vehicleId={id}
        vehicle={vehicle}
        locationId={locationId}
        advisorBuyerId={advisorBuyerId}
        advisorSellerId={advisorSellerId}
        locations={locations}
        advisors={advisors}
        isAdvisor={role === "advisor"}
      />
    </>
  );
}
