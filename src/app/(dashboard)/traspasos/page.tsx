import Link from "next/link";
import { ClipboardList, ExternalLink, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TraspasoInlineStatus } from "@/components/traspasos/traspaso-inline-status";
import { getTraspasos } from "@/lib/data/traspasos";
import { getUserRole } from "@/lib/supabase/server";
import { compactCOP } from "@/lib/utils";
import { buttonClassName } from "@/components/ui/button";

const STATUS_TABS = [
  { label: "Todos",       value: "" },
  { label: "En proceso",  value: "en_proceso" },
  { label: "Pendiente",   value: "pendiente" },
  { label: "Completado",  value: "completado" },
  { label: "Cancelado",   value: "cancelado" },
] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function TraspasoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; from?: string; to?: string }>;
}) {
  const { status, q, from, to } = await searchParams;
  const role = await getUserRole();
  const canEdit = role !== "viewer";

  const all = await getTraspasos({ search: q, from, to });
  const displayed = status ? all.filter((t) => t.status === status) : all;

  const counts = {
    en_proceso: all.filter((t) => t.status === "en_proceso").length,
    pendiente:  all.filter((t) => t.status === "pendiente").length,
    completado: all.filter((t) => t.status === "completado").length,
    cancelado:  all.filter((t) => t.status === "cancelado").length,
  };

  function tabHref(s: string) {
    const p = new URLSearchParams();
    if (s) p.set("status", s);
    if (q) p.set("q", q);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    const qs = p.toString();
    return `/traspasos${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <PageHeader
        eyebrow="Gestión documental"
        title="Traspasos"
        description="Seguimiento del proceso de traspaso de propiedad para cada venta cerrada."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="En proceso"  value={`${counts.en_proceso}`}  helper="Requieren seguimiento" icon={ClipboardList} tone="gold" />
        <StatCard label="Pendiente"   value={`${counts.pendiente}`}   helper="En espera"             icon={ClipboardList} tone="neutral" />
        <StatCard label="Completados" value={`${counts.completado}`}  helper="Traspaso cerrado"      icon={ClipboardList} tone="green" />
        <StatCard label="Cancelados"  value={`${counts.cancelado}`}   helper="Proceso anulado"       icon={ClipboardList} tone="red" />
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-1">
          {STATUS_TABS.map((tab) => {
            const active = (status ?? "") === tab.value;
            return (
              <Link
                key={tab.value}
                href={tabHref(tab.value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? "bg-[#D6A93D] text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <form method="GET" action="/traspasos" className="flex items-center gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          {from && <input type="hidden" name="from" value={from} />}
          {to && <input type="hidden" name="to" value={to} />}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Cliente, vehículo o placa…"
              className="h-9 w-60 rounded-2xl border border-zinc-700 bg-zinc-900 pl-8 pr-3 text-sm text-white placeholder-zinc-600 focus:border-[#D6A93D] focus:outline-none"
            />
          </div>
          <button type="submit" className={buttonClassName({ variant: "outline", size: "sm" })}>
            Buscar
          </button>
          {q && (
            <Link href={tabHref(status ?? "")} className={buttonClassName({ variant: "outline", size: "sm" })}>
              Limpiar
            </Link>
          )}
        </form>

        <form method="GET" action="/traspasos" className="flex items-center gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          {q && <input type="hidden" name="q" value={q} />}
          <input
            type="date"
            name="from"
            defaultValue={from ?? ""}
            className="h-9 rounded-2xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
          />
          <span className="text-xs text-zinc-500">—</span>
          <input
            type="date"
            name="to"
            defaultValue={to ?? ""}
            className="h-9 rounded-2xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
          />
          <button type="submit" className={buttonClassName({ variant: "outline", size: "sm" })}>
            Filtrar fechas
          </button>
        </form>
      </div>

      {displayed.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
            <ClipboardList className="h-10 w-10 text-zinc-600" />
            <p className="text-zinc-400">
              {q || status || from || to
                ? "Sin resultados para los filtros aplicados."
                : "Sin traspasos registrados. Se crean automáticamente al confirmar una venta."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b border-zinc-900">
            <CardTitle>
              {displayed.length} traspaso{displayed.length !== 1 ? "s" : ""}
              {status ? ` · ${STATUS_TABS.find((t) => t.value === status)?.label}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-900">
              {displayed.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{t.vehicleName}</p>
                      {t.vehiclePlate && (
                        <span className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                          {t.vehiclePlate}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">
                      {t.customerName}
                      <span className="mx-1.5 text-zinc-600">·</span>
                      {compactCOP(t.agreedPrice)}
                      <span className="mx-1.5 text-zinc-600">·</span>
                      <span className="text-zinc-500">{formatDate(t.createdAt)}</span>
                    </p>
                    <p className="text-xs text-zinc-600">Registrado por {t.createdBy}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <TraspasoInlineStatus
                      traspasoId={t.id}
                      saleId={t.saleId}
                      currentStatus={t.status}
                      canEdit={canEdit}
                    />
                    <Link
                      href={`/ventas/${t.saleId}`}
                      className={buttonClassName({ variant: "outline", size: "sm" })}
                      title="Ver venta asociada"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
