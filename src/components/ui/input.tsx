import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0f0f0f] px-3.5 text-sm text-white outline-none transition-all duration-200",
        "placeholder:text-zinc-600",
        "focus:border-[rgba(212,168,67,0.50)] focus:ring-4 focus:ring-[rgba(212,168,67,0.08)]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}
