import { Badge } from "@/components/ui/badge";
import type { VehicleStatus } from "@/types/vehicle";

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const tone =
    status === "Disponible" ? "green" :
    status === "Separado" ? "amber" :
    status === "Vendido" || status === "Entregado" ? "blue" :
    status === "En reparación" || status === "Papeles pendientes" ? "red" :
    status === "Publicado" ? "gold" :
    "neutral";

  return <Badge tone={tone}>{status}</Badge>;
}
