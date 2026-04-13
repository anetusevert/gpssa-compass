const sizeMap = {
  sm: 16,
  md: 24,
  lg: 36,
} as const;

interface LoadingSpinnerProps {
  size?: keyof typeof sizeMap;
  color?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  color = "var(--gpssa-green)",
  className = "",
}: LoadingSpinnerProps) {
  const px = sizeMap[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      aria-label="Loading"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeOpacity={0.2}
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
