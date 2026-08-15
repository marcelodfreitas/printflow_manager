import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: 
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {

  const variants = {
    default:
      "bg-white/10 text-white",

    success:
      "bg-green-500/20 text-green-400",

    warning:
      "bg-yellow-500/20 text-yellow-400",

    danger:
      "bg-red-500/20 text-red-400",

    info:
      "bg-blue-500/20 text-blue-400",
  };


  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-xs
        font-medium
        border
        border-white/10
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}