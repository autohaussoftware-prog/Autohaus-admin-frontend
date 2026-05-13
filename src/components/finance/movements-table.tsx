import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { compactCOP } from "@/lib/utils";
import type { FinanceMovement } from "@/types/finance";
import { DeleteMovementButton } from "@/components/finance/delete-movement-button";

export function MovementsTable({
  title,
  description,
  movements,
  canDelete = false,
  canEdit = false,
}: {
  title: string;
  description: string;
  movements: FinanceMovement[];
  canDelete?: boolean;
  canEdit?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-zinc-900">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-zinc-900 bg-zinc-950/60 text-xs uppercase tracking-[0.18em] text-zinc-500">
              <tr>
                <th className="px-5 py-4 font-medium">Fecha</th>
                <th className="px-5 py-4 font-medium">Tipo</th>
                <th className="px-5 py-4 font-medium">Canal</th>
                <th className="px-5 py-4 font-medium">Categoría</th>
                <th className="px-5 py-4 font-medium">Concepto</th>
                <th className="px-5 py-4 font-medium">Responsable</th>
                <th className="px-5 py-4 text-right font-medium">Monto</th>
                {(canEdit || canDelete) && <th className="px-3 py-4 font-medium" />}
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-b border-zinc-900/80 hover:bg-zinc-950/70">
                  <td className="px-5 py-4 text-zinc-400">{movement.date}</td>
                  <td className="px-5 py-4"><Badge tone={movement.type === "Ingreso" ? "green" : "red"}>{movement.type}</Badge></td>
                  <td className="px-5 py-4 text-zinc-300">{movement.channel}</td>
                  <td className="px-5 py-4 text-zinc-400">{movement.category}</td>
                  <td className="px-5 py-4 text-white">{movement.concept}</td>
                  <td className="px-5 py-4 text-zinc-400">{movement.responsible}</td>
                  <td className={`px-5 py-4 text-right font-medium ${movement.type === "Ingreso" ? "text-emerald-300" : "text-red-300"}`}>
                    {movement.type === "Ingreso" ? "+" : "−"}{compactCOP(movement.amount)}
                  </td>
                  {(canEdit || canDelete) && (
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <Link
                            href={`/movimientos/${movement.id}/editar`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        )}
                        {canDelete && <DeleteMovementButton movement={movement} />}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
