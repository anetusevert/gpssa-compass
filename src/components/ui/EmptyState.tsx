import type { LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div className="glass rounded-2xl p-4 mb-5">
        <Icon size={32} className="text-gray-muted" />
      </div>

      <h3 className="font-playfair text-lg font-semibold text-cream mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-gray-muted max-w-sm mb-6">{description}</p>
      )}

      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
