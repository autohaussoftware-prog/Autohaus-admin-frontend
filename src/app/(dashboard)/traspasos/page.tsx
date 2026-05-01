import { ClipboardList, CheckCircle2, Clock, FileCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TransfersList } from "@/components/transfers/transfers-list";
import { NewTransferForm } from "@/components/transfers/new-transfer-form";
import { getTransfers } from "@/lib/data/transfers";
import { getVehicles } from "@/lib/data/vehicles";
import { getUserRole } from "@/lib/supabase/server";

export default async function TraspasosPage() {
  const [transfers, vehicles, role] = await Promise.all([
    getTransfers(),
    getVehicles(),
    getUserRole(),
  ]);

  const vehicleOptions = vehicles
    .filter((v) => !["Vendido", "Entregado"].includes(v.status))
    .map((v) => ({ id: v.id, name: `${v.brand} ${v.line} — ${v.plate}` }));

  const canManage = ["owner", "partner", "admin"].includes(role);

  const inProgress = transfers.filter((t) => t.status === "En proceso").length;
  const docsReady = transfers.filter((t) => t.status === "Documentos listos").length;
  const completed = transfers.filter((t) => t.status === "Completado").length;

  return (
    <>
      <PageHeader
        eyebrow="Operaciones"
        title="Traspasos"
        description="Procesos de cambio de propietario registrales. Desde solicitud hasta titulación completada."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard label="En proceso" value={`${inProgress}`} helper="Iniciados, pendientes de docs" icon={Clock} tone="gold" />
        <StatCard label="Documentos listos" value={`${docsReady}`} helper="En revisión notarial o tránsito" icon={FileCheck} tone="blue" />
        <StatCard label="Completados" value={`${completed}`} helper="Titulación finalizada" icon={CheckCircle2} tone="green" />
      </div>

      {canManage && (
        <div className="mb-6">
          <NewTransferForm vehicles={vehicleOptions} />
        </div>
      )}

      <TransfersList transfers={transfers} canManage={canManage} />
    </>
  );
}
