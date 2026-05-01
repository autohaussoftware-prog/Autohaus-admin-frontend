"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { CalendarDays, X } from "lucide-react";

export function DateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearAll = () => {
    router.push(pathname);
  };

  const hasFilter = Boolean(dateFrom || dateTo);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-zinc-500">
        <CalendarDays className="h-3.5 w-3.5" />
        Filtrar por fecha
      </div>
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => update("dateFrom", e.target.value)}
        className="rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
        title="Desde"
        placeholder="Desde"
      />
      <span className="text-xs text-zinc-600">—</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => update("dateTo", e.target.value)}
        className="rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-white focus:border-[#D6A93D] focus:outline-none"
        title="Hasta"
        placeholder="Hasta"
      />
      {hasFilter && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 rounded-2xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-white transition"
        >
          <X className="h-3.5 w-3.5" />
          Limpiar
        </button>
      )}
      {hasFilter && (
        <span className="text-xs text-[#D6A93D]">
          {dateFrom && dateTo ? `${dateFrom} → ${dateTo}` : dateFrom ? `Desde ${dateFrom}` : `Hasta ${dateTo}`}
        </span>
      )}
    </div>
  );
}
