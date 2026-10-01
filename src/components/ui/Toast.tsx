"use client";

import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "success",
  onClose,
}: ToastProps) {
  const config = {
    success: {
      icon: CheckCircle2,
      iconClass: "text-emerald-400",
      borderClass: "border-emerald-400/20",
    },
    error: {
      icon: AlertCircle,
      iconClass: "text-red-400",
      borderClass: "border-red-400/20",
    },
    warning: {
      icon: AlertTriangle,
      iconClass: "text-amber-400",
      borderClass: "border-amber-400/20",
    },
    info: {
      icon: Info,
      iconClass: "text-sky-400",
      borderClass: "border-sky-400/20",
    },
  };

  const current = config[type];
  const Icon = current.icon;

  return (
    <div
      className={`
        flex
        items-center
        gap-3
        rounded-2xl
        border
        ${current.borderClass}
        bg-[#0A1120]/95
        px-4
        py-3
        text-sm
        text-white
        shadow-2xl
        shadow-black/40
        backdrop-blur-xl
      `}
    >
      <Icon className={`h-5 w-5 shrink-0 ${current.iconClass}`} />

      <p className="min-w-0 flex-1">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="
          shrink-0
          rounded-lg
          p-1
          text-white/40
          transition
          hover:bg-white/10
          hover:text-white
        "
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

