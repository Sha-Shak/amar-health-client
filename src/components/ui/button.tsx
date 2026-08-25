import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "glass";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "tap-target rounded-[var(--radius-pill)] px-6 font-semibold transition-colors disabled:opacity-60 disabled:pointer-events-none",
        variant === "primary" &&
          "bg-primary-600 text-white shadow-[0_8px_24px_-8px_rgb(13_148_136/0.6)] hover:bg-primary-700",
        variant === "glass" && "glass-panel text-ink-900 hover:bg-surface-60",
        className
      )}
      {...props}
    />
  );
}
