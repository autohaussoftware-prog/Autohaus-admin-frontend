import Link from "next/link";
import { Button, buttonClassName } from "@/components/ui/button";

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
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        {eyebrow && <p className="text-xs uppercase tracking-[0.24em] text-[#D6A93D]">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">{description}</p>}
      </div>
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={buttonClassName({})}>{actionLabel}</Link>
      ) : (
        actionLabel && <Button>{actionLabel}</Button>
      )}
    </div>
  );
}
