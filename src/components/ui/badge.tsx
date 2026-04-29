import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "gold" | "green" | "blue" | "red" | "amber" | "white";

const tones: Record<BadgeTone, string> = {
  neutral: "border-zinc-700 bg-zinc-900 text-zinc-300",
  gold: "border-[#D6A93D]/30 bg-[#D6A93D]/10 text-[#D6A93D]",
  green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  red: "border-red-500/30 bg-red-500/10 text-red-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  white: "border-white/20 bg-white text-black",
};

export function Badge({ className, tone = "neutral", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
