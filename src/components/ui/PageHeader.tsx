"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "./Badge";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: {
    label: string;
    variant?: "green" | "blue" | "gold" | "gray" | "red";
  };
  actions?: React.ReactNode;
  backHref?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  backHref,
  className = "",
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={`flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="flex items-start gap-3">
        {backHref && (
          <button
            onClick={() => router.push(backHref)}
            className="mt-1 p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/5 transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-playfair text-2xl font-bold text-cream">
              {title}
            </h1>
            {badge && (
              <Badge variant={badge.variant} size="sm">
                {badge.label}
              </Badge>
            )}
          </div>

          {description && (
            <p className="mt-1 text-sm text-gray-muted max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 mt-3 sm:mt-0 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
