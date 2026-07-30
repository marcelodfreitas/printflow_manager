import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { translateStatus } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantClasses = {
  default:
    "border border-gray-600 bg-gray-800 text-gray-300",

  success:
    "border border-green-700 bg-green-900/40 text-green-300",

  warning:
    "border border-yellow-700 bg-yellow-900/40 text-yellow-300",

  danger:
    "border border-red-700 bg-red-900/40 text-red-300",

  info:
    "border border-blue-700 bg-blue-900/40 text-blue-300",
};

const dotClasses = {
  default: "bg-white/40",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-sky-400",
};

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
  className={cn(
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
    variantClasses[variant],
    
    className
  )}
>
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          dotClasses[variant]
        )}
      />

      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<
    string,
    "success" | "warning" | "danger" | "info" | "default"
  > = {
    active: "success",
    approved: "success",
    completed: "success",
    delivered: "success",
    converted: "success",

    printing: "info",
    sent: "info",

    pending: "warning",
    paused: "warning",
    maintenance: "warning",

    idle: "default",
    draft: "default",

    cancelled: "danger",
    rejected: "danger",
    offline: "danger",
  };

  return (
    <Badge variant={variantMap[status] || "default"}>
      {translateStatus(status)}
    </Badge>
  );
}