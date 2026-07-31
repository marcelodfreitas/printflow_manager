"use client";

import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-6xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
      />
      <div
        className={cn(
  `
  relative
  z-10
  mx-0
  w-full
  max-h-[92dvh]
  overflow-y-auto
  rounded-t-2xl
  border
  border-white/10
  bg-[#0a1120]/95
  backdrop-blur-2xl
  p-4
  shadow-2xl
  shadow-black/40
  text-white
  sm:mx-4
  sm:rounded-2xl
  sm:p-6
  `,
  sizeClasses[size],
  className
)}
      >
        <div className="sticky -top-4 z-10 mb-4 flex items-center justify-between border-b border-white/10 bg-[#0a1120]/95 pb-3 pt-1 backdrop-blur-2xl sm:static sm:border-b-0 sm:bg-transparent sm:pb-0 sm:pt-0">
          <h2 className="text-lg font-semibold text-inherit">{title}</h2>
          <button
            onClick={onClose}
className="
rounded-lg
p-1
text-white/50
transition-colors
hover:bg-white/5
hover:text-white
"          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
