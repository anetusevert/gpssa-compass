"use client";

/**
 * Small inline chips for KPI/KQI metadata: leading/lagging timing, Balanced
 * Scorecard perspective, and operating tier. Badge has no amber variant, so we
 * render these as inline spans with explicit colours (per module conventions).
 */

const TIMING_COLORS: Record<string, string> = {
  leading: "#2DD4BF", // teal — predictive
  lagging: "#E9A23B", // amber — outcome
};

const PERSPECTIVE_COLORS: Record<string, string> = {
  financial: "#C5A572", // gold
  customer: "#00A86B", // green
  process: "#2D4A8C", // blue
  capacity: "#2DD4BF", // teal
};

const TIER_COLORS: Record<string, string> = {
  operational: "#2DD4BF",
  tactical: "#2D4A8C",
  strategic: "#C5A572",
};

const PERSPECTIVE_LABEL: Record<string, string> = {
  financial: "Financial / Stewardship",
  customer: "Customer / Member",
  process: "Internal Process",
  capacity: "Org. Capacity",
};

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide leading-none"
      style={{ color, background: color + "22" }}
    >
      {label}
    </span>
  );
}

export function TimingChip({ timing }: { timing?: string | null }) {
  if (!timing) return null;
  const color = TIMING_COLORS[timing] ?? "#9CA3AF";
  return <Chip label={timing} color={color} />;
}

export function PerspectiveChip({ perspective }: { perspective?: string | null }) {
  if (!perspective) return null;
  const color = PERSPECTIVE_COLORS[perspective] ?? "#9CA3AF";
  return <Chip label={PERSPECTIVE_LABEL[perspective] ?? perspective} color={color} />;
}

export function TierChip({ tier }: { tier?: string | null }) {
  if (!tier) return null;
  const color = TIER_COLORS[tier] ?? "#9CA3AF";
  return <Chip label={tier} color={color} />;
}

const RAG_COLORS: Record<string, string> = {
  green: "#00A86B",
  amber: "#E9A23B",
  red: "#E76363",
  gray: "#9CA3AF",
};

export function RagChip({ status }: { status: string }) {
  const color = RAG_COLORS[status] ?? RAG_COLORS.gray;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide leading-none"
      style={{ color, background: color + "22" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}

export const RAG_COLOR_MAP = RAG_COLORS;
