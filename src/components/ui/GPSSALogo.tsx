"use client";

const sizeMap = {
  sm: { width: 160, gpssa: 28, submark: 8, gap: 2 },
  md: { width: 220, gpssa: 40, submark: 10, gap: 4 },
  lg: { width: 320, gpssa: 56, submark: 12, gap: 6 },
  hero: { width: 430, gpssa: 72, submark: 15, gap: 8 },
} as const;

interface GPSSALogoProps {
  size?: keyof typeof sizeMap;
  color?: string;
  className?: string;
}

export function GPSSALogo({
  size = "md",
  color = "#FFFFFF",
  className = "",
}: GPSSALogoProps) {
  const s = sizeMap[size];
  const totalHeight = s.gpssa + s.gap + s.submark + 4;

  return (
    <svg
      width={s.width}
      height={totalHeight}
      viewBox={`0 0 ${s.width} ${totalHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="GPSSA Intelligence"
    >
      <text
        x="50%"
        y={s.gpssa}
        textAnchor="middle"
        fill={color}
        fontFamily="var(--font-playfair), Georgia, serif"
        fontSize={s.gpssa}
        fontWeight="700"
        letterSpacing="0.08em"
      >
        GPSSA
      </text>

      <line
        x1={s.width * 0.25}
        y1={s.gpssa + s.gap}
        x2={s.width * 0.75}
        y2={s.gpssa + s.gap}
        stroke={color}
        strokeOpacity={0.25}
        strokeWidth={1}
      />

      <text
        x="50%"
        y={s.gpssa + s.gap + s.submark + 2}
        textAnchor="middle"
        fill={color}
        fontFamily="var(--font-dm-sans), system-ui, sans-serif"
        fontSize={s.submark}
        fontWeight="400"
        letterSpacing="0.18em"
        opacity={0.7}
      >
        INTELLIGENCE
      </text>
    </svg>
  );
}
