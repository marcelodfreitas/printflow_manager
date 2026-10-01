import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Modal({
  open,
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
}: ModalProps) {
  const visible = isOpen ?? open ?? false;

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (visible) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        p-4
        backdrop-blur-sm
      "
      onMouseDown={onClose}
    >
      <div
        className={cn(
          `
          flex
          max-h-[calc(100vh-2rem)]
          w-full
          ${sizes[size]}
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-[#08111f]
          shadow-2xl
          shadow-black/50
          `,
          className,
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          className="
            flex
            shrink-0
            items-start
            justify-between
            border-b
            border-white/10
            px-5
            py-4
            sm:px-6
            sm:py-5
          "
        >
          <div className="min-w-0 pr-4">
            <h2 className="text-lg font-semibold text-white">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-white/40">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="
              shrink-0
              rounded-lg
              p-2
              text-white/40
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            px-5
            py-5
            sm:px-6
            sm:py-6
          "
        >
          {children}
        </div>
      </div>
    </div>
  );
}