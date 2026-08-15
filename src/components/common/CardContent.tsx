import { cn } from "@/lib/utils";

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({
  children,
  className,
}: CardContentProps) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}