import { ReactNode } from "react";

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export default function CardHeader({
  children,
  className = "",
}: CardHeaderProps) {
  return (
    <div
      className={`
        px-6
        py-5
        border-b
        border-white/10
        ${className}
      `}
    >
      {children}
    </div>
  );
}