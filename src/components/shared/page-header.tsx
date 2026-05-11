import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";

export function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4A843]">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">{description}</p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref} className={buttonClassName({ variant: "primary", size: "md" })}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
