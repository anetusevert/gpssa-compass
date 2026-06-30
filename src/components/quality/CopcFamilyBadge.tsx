"use client";

import { Badge } from "@/components/ui/Badge";

/**
 * COPC critical-error family chip: customer | business | compliance.
 * Maps each family to one of the 5 allowed Badge variants.
 */
const FAMILY_VARIANT: Record<string, "green" | "blue" | "gold" | "gray"> = {
  customer: "blue",
  business: "gold",
  compliance: "green",
};

const FAMILY_LABEL: Record<string, string> = {
  customer: "Customer-critical",
  business: "Business-critical",
  compliance: "Compliance-critical",
};

export function CopcFamilyBadge({
  family,
  size = "sm",
}: {
  family?: string | null;
  size?: "sm" | "md";
}) {
  if (!family) return null;
  const variant = FAMILY_VARIANT[family] ?? "gray";
  const label = FAMILY_LABEL[family] ?? family;
  return (
    <Badge variant={variant} size={size} dot>
      {label}
    </Badge>
  );
}
