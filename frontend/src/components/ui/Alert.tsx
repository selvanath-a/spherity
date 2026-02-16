import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AlertVariant = "info" | "success" | "warning" | "error";
export type AlertState = { variant: AlertVariant; message: string } | null;

const variants: Record<AlertVariant, string> = {
  info: "border-[#e2dcd4] bg-white/70 text-[#5b554f]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
};

type AlertProps = {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
};

export function Alert({ variant = "info", children, className }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm shadow-sm",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
