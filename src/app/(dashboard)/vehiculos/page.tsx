import { PageHeader } from "@/components/shared/page-header";
import { VehiclesBrowser } from "@/components/vehicles/vehicles-browser";
import { getVehicles } from "@/lib/data/vehicles";

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <>
      <PageHeader
        eyebrow="Fichas de vehículos"
        title="Vehículos y fichas individuales"
        description="Acceso rápido a la ficha completa de cada vehículo: datos técnicos, costos, utilidad, asesor, documentos e historial."
        actionLabel="Nuevo vehículo"
        actionHref="/vehiculos/nuevo"
      />

      <VehiclesBrowser vehicles={vehicles} />
    </>
  );
}

