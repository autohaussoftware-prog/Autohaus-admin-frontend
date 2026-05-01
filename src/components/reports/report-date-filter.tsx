"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { CalendarDays, X } from "lucide-react";

const QUICK_RANGES = [
  { label: "Este mes", months: 0 },
  { label: "3 meses", months: 3 },
  { label: "6 meses", months: 6 },
  { label: "Este año", months: 12 },
];

export function ReportDateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  const update = useCallback(
    (from: string, to: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (from) params.set("dateFrom", from); else params.delete("dateFrom");
      if (to) params.set("dateTo", to); else params.delete("dateTo");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const applyQuick = (months: number) => {
    const to = new Date().toISOString().split("T")[0];
    let from: string;
    if (months === 0) {
      const now = new Date();
      from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    } else if (months === 12) {
      from = `${new Date().getFullYear()}-01-01`;
    } else {
      const d = new Date();
      d.setMonth(d.getMonth() - months);
      from = d.toISOString().split("T")[0];
    }
    update(from, to);
  };

  const hasFilter = Boolean(dateFrom || dateTo);

  return (
    <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-zinc-500">
          <CalendarDays className="h-3.5 w-3.5" />
          Periodo
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => applyQuick(r.months)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:border-[#D6A93D]/50 hover:text-white transition"
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => update(e.target.value, dateTo)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-[#D6A93D] focus:outline-none"
          />
          <span className="text-xs text-zinc-600">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => update(dateFrom, e.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-[#D6A93D] focus:outline-none"
          />
          {hasFilter && (
            <button
              onClick={() => update("", "")}
              className="flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white transition"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
