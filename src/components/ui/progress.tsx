import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-zinc-900", className)}>
      <div className="h-full rounded-full bg-[#D6A93D]" style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
    </div>
  );
}
