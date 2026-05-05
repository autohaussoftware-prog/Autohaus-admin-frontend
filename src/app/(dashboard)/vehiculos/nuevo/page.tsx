import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";
import { getVehicleFormOptions } from "@/lib/data/vehicles";
import { getUserRole } from "@/lib/supabase/server";
import { NewVehicleForm } from "@/components/vehicles/new-vehicle-form";

export default async function NewVehiclePage() {
  const [{ locations, advisors }, role] = await Promise.all([
    getVehicleFormOptions(),
    getUserRole(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Ingreso de inventario"
        title="Nuevo vehículo"
        description="Completa la ficha del vehículo. Los campos marcados con * son obligatorios."
      />

      <div className="mb-4 flex">
        <Link href="/vehiculos" className={buttonClassName({ variant: "outline" })}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>

      <NewVehicleForm
        locations={locations}
        advisors={advisors}
        isAdvisor={role === "advisor"}
      />
    </>
  );
}
