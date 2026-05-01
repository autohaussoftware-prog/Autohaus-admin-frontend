"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { compactCOP } from "@/lib/utils";
import type { Customer } from "@/lib/data/customers";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");

  const filtered = customers.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      (c.phone ?? "").includes(q) ||
      (c.documentNumber ?? "").includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o documento…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-9 pr-4 text-sm text-white placeholder-zinc-500 focus:border-[#D6A93D] focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-950/60 py-16">
          <User className="h-8 w-8 text-zinc-600" />
          <p className="text-sm text-zinc-500">
            {query ? "Sin resultados para esa búsqueda." : "No hay clientes registrados aún."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/40">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Cliente</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Contacto</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Documento</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Compras</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Total gastado</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Última compra</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filtered.map((c) => (
                <tr key={c.id} className="group hover:bg-zinc-900/30 transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/clientes/${c.id}`} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-300 group-hover:bg-zinc-700 transition-colors">
                        {c.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-white group-hover:text-[#D6A93D] transition-colors">
                        {c.fullName}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-zinc-400">{c.phone ?? "—"}</td>
                  <td className="px-5 py-4 text-zinc-400">{c.documentNumber ?? "—"}</td>
                  <td className="px-5 py-4 text-right">
                    {c.purchaseCount > 0 ? (
                      <Badge tone={c.purchaseCount >= 2 ? "gold" : "neutral"}>{c.purchaseCount}</Badge>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-[#D6A93D]">
                    {c.totalSpent > 0 ? compactCOP(c.totalSpent) : <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-5 py-4 text-right text-zinc-400">{formatDate(c.lastPurchaseDate)}</td>
                  <td className="px-4 py-4">
                    <Link href={`/clientes/${c.id}`}>
                      <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
