import type { ReactNode } from "react";
import { Card, CardContent } from "./Card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  description,
  className,
}: StatsCardProps) {
  return (
    <Card className={className}>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fd6401]/10 text-[#fd6401]">
            {icon}
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium text-white/50">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>

            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
