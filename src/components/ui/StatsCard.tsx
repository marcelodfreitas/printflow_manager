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
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl accent-bg/10 accent-text sm:h-12 sm:w-12">            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white/50">
              {title}
            </p>

            <p className="text-[17px] font-bold text-white sm:text-2xl">
              {value}
            </p>

            {description && (
              <p className="text-xs text-white/40">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}