import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 rounded-2xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-300 outline-none transition focus:border-[#D6A93D]/60 focus:ring-4 focus:ring-[#D6A93D]/10",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
