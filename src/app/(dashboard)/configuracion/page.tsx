import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const settings = [
  { group: "Comisiones", item: "Captador", value: "20%", status: "Activo" },
  { group: "Comisiones", item: "Vendedor", value: "20%", status: "Activo" },
  { group: "Comisiones", item: "Crédito", value: "33%", status: "Activo" },
  { group: "Rentabilidad", item: "Margen mínimo esperado", value: "3%", status: "Activo" },
  { group: "Efectivo", item: "Alerta por movimiento grande", value: "$30M", status: "Activo" },
  { group: "Ubicaciones", item: "Efectivo ubicación 1", value: "Principal", status: "Activo" },
  { group: "Ubicaciones", item: "Efectivo ubicación 2", value: "Secundaria", status: "Activo" },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Configuración"
        title="Reglas internas del sistema"
        description="Pantalla visual para parametrizar reglas de comisión, margen mínimo, categorías, estados, ubicaciones y alertas."
      />
      <Card>
        <CardHeader className="border-b border-zinc-900">
          <CardTitle>Parámetros actuales</CardTitle>
          <CardDescription>Base visual editable en la siguiente fase.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {settings.map((setting) => (
            <div key={`${setting.group}-${setting.item}`} className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge tone="gold">{setting.group}</Badge>
                  <h3 className="mt-3 text-sm font-semibold text-white">{setting.item}</h3>
                  <p className="mt-2 text-2xl font-semibold text-[#D6A93D]">{setting.value}</p>
                </div>
                <Badge tone="green">{setting.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
