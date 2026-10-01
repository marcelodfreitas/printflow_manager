import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = 24,
  text,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
    >
      <Loader2
        size={size}
        className="animate-spin text-secondary"
      />

      {text && (
        <span className="text-sm text-muted">
          {text}
        </span>
      )}
    </div>
  );
}