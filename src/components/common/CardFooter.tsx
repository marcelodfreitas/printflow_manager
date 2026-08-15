import { cn } from "@/lib/utils";

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({
  children,
  className,
}: CardFooterProps) {
  return (
    <div
      className={cn(
        "mt-8 flex items-center justify-end border-t border-white/10 pt-6",
        className
      )}
    >
      {children}
    </div>
  );
}