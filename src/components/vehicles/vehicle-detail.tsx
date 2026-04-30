import { CalendarDays, Car, FileText, Gauge, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { compactCOP, currencyCOP, percentage } from "@/lib/utils";
import type { Vehicle, VehicleMovement } from "@/types/vehicle";
import { VehicleStatusBadge } from "./vehicle-status-badge";

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

export function VehicleDetail({
  vehicle,
  movements,
  showFinancials = true,
}: {
  vehicle: Vehicle;
  movements: VehicleMovement[];
  showFinancials?: boolean;
}) {
  const grossProfit = vehicle.targetPrice - vehicle.buyPrice;
  const netProfit = grossProfit - vehicle.realCost;
  const margin = (netProfit / vehicle.targetPrice) * 100;
  const costUsage = (vehicle.realCost / Math.max(vehicle.estimatedCost, 1)) * 100;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader className="border-b border-zinc-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <VehicleStatusBadge status={vehicle.status} />
                  <Badge tone={vehicle.ownerType === "Propio" ? "gold" : "blue"}>{vehicle.ownerType}</Badge>
                  {vehicle.alert && <Badge tone="amber">{vehicle.alert}</Badge>}
                </div>
                <CardTitle className="text-2xl">{vehicle.brand} {vehicle.line}</CardTitle>
                <CardDescription>{vehicle.version} · {vehicle.year} · Placa {vehicle.plate}</CardDescription>
              </div>
              <div className="rounded-3xl border border-[#D6A93D]/20 bg-[#D6A93D]/10 px-5 py-4 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-[#D6A93D]">Precio objetivo</p>
                <p className="mt-1 text-2xl font-semibold text-white">{compactCOP(vehicle.targetPrice)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InfoItem label="Kilometraje" value={`${vehicle.mileage.toLocaleString("es-CO")} km`} />
              <InfoItem label="Color" value={vehicle.color} />
              <InfoItem label="Motor" value={vehicle.motor} />
              <InfoItem label="Transmisión" value={vehicle.transmission} />
              <InfoItem label="Combustible" value={vehicle.fuel} />
              <InfoItem label="Tracción" value={vehicle.traction} />
              <InfoItem label="Ciudad matrícula" value={vehicle.cityRegistration} />
              <InfoItem label="Estado legal" value={vehicle.legalStatus} />
              <InfoItem label="Ubicación" value={vehicle.location} />
              <InfoItem label="SOAT vence" value={vehicle.soatDue} />
              <InfoItem label="Tecnomecánica vence" value={vehicle.technoDue} />
              <InfoItem label="Asesor captador" value={vehicle.advisorBuyer} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Historial de movimientos</CardTitle>
            <CardDescription>Línea de tiempo operacional del vehículo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {movements.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-500">
                Este vehículo todavía no tiene movimientos registrados.
              </div>
            ) : (
              movements.map((movement) => (
                <div key={movement.id} className="relative rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <Badge tone="gold">{movement.type}</Badge>
                      <h4 className="mt-3 text-sm font-semibold text-white">{movement.title}</h4>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">{movement.description}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-xs text-zinc-500">{movement.createdAt}</p>
                      <p className="mt-1 text-xs text-zinc-400">{movement.user}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {showFinancials && (
          <Card>
            <CardHeader className="border-b border-zinc-900">
              <CardTitle>Rentabilidad</CardTitle>
              <CardDescription>Lectura financiera individual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <InfoItem label="Precio compra" value={currencyCOP(vehicle.buyPrice)} />
              <InfoItem label="Precio mínimo" value={currencyCOP(vehicle.minPrice)} />
              <InfoItem label="Costo real acumulado" value={currencyCOP(vehicle.realCost)} />
              <InfoItem label="Utilidad neta estimada" value={currencyCOP(netProfit)} />
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Margen neto</p>
                  <p className="text-sm font-semibold text-[#D6A93D]">{percentage(margin)}</p>
                </div>
                <Progress value={Math.min(margin * 8, 100)} className="mt-3" />
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Costo usado vs estimado</p>
                  <p className="text-sm font-semibold text-white">{percentage(costUsage)}</p>
                </div>
                <Progress value={costUsage} className="mt-3" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>Estado operativo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5">
            {[
              { icon: Car, label: "Vehículo", value: `${vehicle.brand} ${vehicle.line}` },
              { icon: MapPin, label: "Ubicación", value: vehicle.location },
              { icon: UserRound, label: "Asesor", value: vehicle.advisorSeller ?? vehicle.advisorBuyer },
              { icon: ShieldCheck, label: "Documentos", value: vehicle.alert?.includes("Papeles") ? "Revisión requerida" : "Sin bloqueo" },
              { icon: CalendarDays, label: "Vencimientos", value: `SOAT ${vehicle.soatDue}` },
              { icon: Gauge, label: "Publicación", value: vehicle.published ? "Activa" : "Inactiva" },
              { icon: FileText, label: "Archivos", value: "Fotos, peritaje y soportes" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-[#D6A93D]"><Icon className="h-4 w-4" /></div>
                  <div>
                    <p className="text-xs text-zinc-500">{item.label}</p>
                    <p className="text-sm text-white">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
