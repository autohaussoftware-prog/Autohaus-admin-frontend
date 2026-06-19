import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
};

export function Pagination({ page, pageSize, total, buildHref }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages = buildPageList(page, totalPages);

  return (
    <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-xs text-zinc-500">
        Mostrando {from}–{to} de {total}
      </p>

      <div className="flex items-center gap-1">
        <PaginationLink href={page > 1 ? buildHref(page - 1) : null} aria-label="Anterior">
          <ChevronLeft className="h-4 w-4" />
        </PaginationLink>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-xs text-zinc-600">…</span>
          ) : (
            <PaginationLink key={p} href={p !== page ? buildHref(p as number) : null} active={p === page}>
              {p}
            </PaginationLink>
          )
        )}

        <PaginationLink href={page < totalPages ? buildHref(page + 1) : null} aria-label="Siguiente">
          <ChevronRight className="h-4 w-4" />
        </PaginationLink>
      </div>
    </div>
  );
}

function PaginationLink({
  href,
  children,
  active,
  "aria-label": ariaLabel,
}: {
  href: string | null;
  children: React.ReactNode;
  active?: boolean;
  "aria-label"?: string;
}) {
  const base =
    "flex h-8 min-w-8 items-center justify-center rounded-xl px-2 text-xs font-medium transition";

  if (!href || active) {
    return (
      <span
        aria-label={ariaLabel}
        className={`${base} ${active ? "bg-[#D6A93D] text-black" : "cursor-default text-zinc-700"}`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link aria-label={ariaLabel} href={href} className={`${base} border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white`}>
      {children}
    </Link>
  );
}

function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");

  pages.push(total);
  return pages;
}
