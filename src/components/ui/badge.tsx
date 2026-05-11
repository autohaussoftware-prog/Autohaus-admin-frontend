import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "gold" | "green" | "blue" | "red" | "amber" | "white";

const tones: Record<BadgeTone, string> = {
  neutral: "border-white/10 bg-white/[0.05] text-zinc-300",
  gold:    "border-[#D4A843]/30 bg-[#D4A843]/10 text-[#D4A843]",
  green:   "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  blue:    "border-blue-400/25 bg-blue-400/8 text-blue-300",
  red:     "border-red-500/25 bg-red-500/8 text-red-300",
  amber:   "border-amber-400/30 bg-amber-400/10 text-amber-300",
  white:   "border-white/20 bg-white text-black font-semibold",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
