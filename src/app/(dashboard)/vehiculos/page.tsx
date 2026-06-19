import { Car, CircleDollarSign, Gauge, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { VehiclesInventory } from "@/components/vehicles/vehicles-inventory";
import { getVehicles, getVehiclesSummary } from "@/lib/data/vehicles";
import { getSettings } from "@/lib/data/settings";
import { compactCOP } from "@/lib/utils";
import { getCurrentUserProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [profile, settings, summary] = await Promise.all([
    getCurrentUserProfile(),
    getSettings(),
    getVehiclesSummary(),
  ]);

  const { vehicles, total } = await getVehicles({ userId: profile.id, role: profile.role }, { page });

  const canEditPrice = ["owner", "partner", "admin", "gerente"].includes(profile.role);
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, Number(s.value)]));
  const marginMin = settingsMap["margin_min"] ?? 3;

  return (
    <>
      <PageHeader
        eyebrow="Inventario vehicular"
        title="Vehículos"
        description="Control completo del inventario: estado, documentos, costos, márgenes y alertas."
        actionLabel="Nuevo vehículo"
        actionHref="/vehiculos/nuevo"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total vehículos" value={`${summary.total}`} helper="Propios y en comisión" icon={Car} tone="gold" />
        <StatCard label="Disponibles" value={`${summary.available}`} helper="Listos para venta" icon={Gauge} tone="green" />
        <StatCard label="Capital activo" value={compactCOP(summary.totalCapital)} helper={`Margen mínimo esperado: ${marginMin}%`} icon={CircleDollarSign} tone="blue" />
        <StatCard label="Con alertas" value={`${summary.withAlerts}`} helper="Requieren atención" icon={ShieldAlert} tone="red" />
      </div>

      <VehiclesInventory
        vehicles={vehicles}
        total={total}
        page={page}
        initialQuery={q}
        canEditPrice={canEditPrice}
        marginMin={marginMin}
      />
    </>
  );
}
