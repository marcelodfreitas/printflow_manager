import { ReactNode } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  className = "",
}: ButtonProps) {
  const variants = {
    primary:
      "bg-primary text-white hover:opacity-90",
      
    secondary:
      "bg-white/10 text-white hover:bg-white/20",

    danger:
      "bg-danger text-white hover:opacity-90",

    ghost:
      "bg-transparent text-muted hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2
        rounded-xl
        font-medium
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >

      {loading ? (
        <LoadingSpinner size={18} />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}

    </button>
  );
}