const variantStyles = {
  green: "bg-gpssa-green/15 text-gpssa-green border-gpssa-green/20",
  blue: "bg-adl-blue/15 text-adl-blue border-adl-blue/20",
  gold: "bg-gold/15 text-gold border-gold/20",
  gray: "bg-gray-muted/15 text-gray-muted border-gray-muted/20",
  red: "bg-red-500/15 text-red-400 border-red-500/20",
} as const;

const dotColors = {
  green: "bg-gpssa-green",
  blue: "bg-adl-blue",
  gold: "bg-gold",
  gray: "bg-gray-muted",
  red: "bg-red-400",
} as const;

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
} as const;

interface BadgeProps {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "green",
  size = "md",
  dot = false,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        leading-none tracking-wide uppercase
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`shrink-0 rounded-full ${dotColors[variant]} ${
            size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
          }`}
        />
      )}
      {children}
    </span>
  );
}
