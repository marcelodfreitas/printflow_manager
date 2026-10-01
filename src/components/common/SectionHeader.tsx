import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-5", className)}>
      <h3 className="text-base font-semibold text-white">
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-sm text-white/45">
          {description}
        </p>
      )}
    </div>
  );
}