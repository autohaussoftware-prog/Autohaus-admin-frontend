import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "relative overflow-hidden bg-gold-grad text-black font-semibold shadow-gold-sm " +
    "before:absolute before:inset-0 before:bg-shimmer before:bg-[length:200%_100%] before:opacity-0 before:transition-opacity before:duration-500 " +
    "hover:before:opacity-100 hover:shadow-gold active:scale-[0.98]",
  secondary:
    "bg-white text-black font-semibold shadow-inner-hi " +
    "hover:bg-zinc-100 active:scale-[0.98]",
  ghost:
    "bg-transparent text-zinc-400 " +
    "hover:bg-white/[0.05] hover:text-white",
  outline:
    "border border-[rgba(255,255,255,0.08)] bg-[#0f0f0f] text-zinc-300 " +
    "hover:border-[rgba(255,255,255,0.14)] hover:bg-[#141414] hover:text-white",
  danger:
    "border border-red-500/25 bg-red-500/8 text-red-400 " +
    "hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-300",
};

const sizes: Record<ButtonSize, string> = {
  sm:   "h-8 px-3 text-xs rounded-xl gap-1.5",
  md:   "h-10 px-4 text-sm rounded-xl gap-2",
  lg:   "h-11 px-5 text-sm rounded-xl gap-2",
  icon: "h-10 w-10 p-0 rounded-xl",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer " +
    "disabled:pointer-events-none disabled:opacity-40 select-none",
    variants[variant],
    sizes[size],
    className
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild,
  children,
  ...props
}: ButtonProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: buttonClassName({ variant, size, className }),
    });
  }
  return (
    <button className={buttonClassName({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}
