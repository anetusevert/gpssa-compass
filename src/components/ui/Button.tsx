"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

const variantStyles = {
  primary:
    "bg-gradient-to-r from-gpssa-green to-gpssa-green-light text-white shadow-lg shadow-gpssa-green/20",
  secondary: "glass text-cream hover:border-border-hover",
  ghost: "bg-transparent text-cream hover:bg-white/5",
  danger: "bg-red-500/80 text-white hover:bg-red-500",
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-5 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-7 py-3.5 text-base gap-2.5 rounded-xl",
} as const;

interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "disabled"> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled = false,
      children,
      className = "",
      ...props
    },
    ref
  ) {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled || loading ? undefined : { scale: 1.02 }}
        whileTap={disabled || loading ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium
          transition-colors duration-200
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
        {...props}
      >
        {loading && <Loader2 className="animate-spin shrink-0" size={size === "sm" ? 14 : size === "md" ? 16 : 18} />}
        {children}
      </motion.button>
    );
  }
);
