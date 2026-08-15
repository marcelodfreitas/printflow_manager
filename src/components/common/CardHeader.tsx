import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardHeaderProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function CardHeader({
  children,
  title,
  description,
  className,
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 py-5",
        className
      )}
    >
      {children ? (
        children
      ) : (
        <>
          {title && (
            <h2 className="text-lg font-semibold text-white">
              {title}
            </h2>
          )}

          {description && (
            <p className="mt-1 text-sm text-white/45">
              {description}
            </p>
          )}
        </>
      )}
    </div>
  );
}