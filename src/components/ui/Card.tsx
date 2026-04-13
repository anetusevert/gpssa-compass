"use client";

import { motion } from "framer-motion";

const variantStyles = {
  glass: "glass-card",
  solid: "bg-navy-light border border-border rounded-2xl",
  bordered: "bg-transparent border border-border rounded-2xl",
} as const;

const paddingStyles = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

interface CardProps {
  variant?: keyof typeof variantStyles;
  hover?: boolean;
  gradient?: boolean;
  padding?: keyof typeof paddingStyles;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Card({
  variant = "glass",
  hover = false,
  gradient = false,
  padding = "md",
  onClick,
  children,
  className = "",
}: CardProps) {
  const Comp = hover ? motion.div : "div";

  const hoverProps = hover
    ? {
        whileHover: { y: -2, transition: { duration: 0.2 } },
      }
    : {};

  return (
    <Comp
      {...hoverProps}
      onClick={onClick}
      className={`
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${gradient ? "gradient-border" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </Comp>
  );
}
