"use client";

/**
 * Small inline RAG / severity chip. The shared Badge has no amber/red-for-state
 * variants, so this renders a self-coloured span for green/amber/red states.
 */

const TONES = {
  green: "#00A86B",
  amber: "#E9A23B",
  red: "#E76363",
} as const;

type Tone = keyof typeof TONES;

const SEVERITY_TONE: Record<string, Tone> = {
  critical: "red",
  major: "amber",
  minor: "green",
};

export function RiskChip({
  tone,
  children,
  className = "",
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const color = TONES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${className}`}
      style={{ color, background: color + "22" }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

export function SeverityChip({ severity }: { severity: string }) {
  const tone = SEVERITY_TONE[severity] ?? "amber";
  return <RiskChip tone={tone}>{severity}</RiskChip>;
}

export { TONES as RAG_TONES };
