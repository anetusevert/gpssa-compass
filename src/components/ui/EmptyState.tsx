import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  /** When true, point users at Engagement Mode instead of a blank wall. */
  playbookHint?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  playbookHint = true,
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
        <p className="text-sm text-gray-muted max-w-sm mb-4">{description}</p>
      )}

      {playbookHint && (
        <p className="mb-6 max-w-sm text-[11px] text-white/35">
          Gold seed may not have loaded, or this module awaits client evidence.{" "}
          <Link href="/dashboard" className="text-[var(--gpssa-green)] hover:underline">
            Open Engagement Mode
          </Link>{" "}
          for the phase path, or import from Data &amp; Sources.
        </p>
      )}

      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
