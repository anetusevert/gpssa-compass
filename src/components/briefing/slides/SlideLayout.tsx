"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SlideLayoutProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  align?: "center" | "left";
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function SlideLayout({
  eyebrow,
  title,
  subtitle,
  children,
  align = "center",
}: SlideLayoutProps) {
  return (
    <motion.div
      className="flex h-full w-full flex-col"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.12, delayChildren: 0.05 },
        },
      }}
    >
      <div
        className={`flex flex-col px-12 pt-16 pb-4 ${
          align === "center" ? "items-center text-center" : "items-start text-left"
        }`}
      >
        {eyebrow && (
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -6 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
            }}
            className="mb-2 text-[11px] uppercase tracking-[0.32em] text-[#33C490]/85"
          >
            {eyebrow}
          </motion.div>
        )}
        <motion.h1
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
          }}
          className={`font-playfair text-cream font-bold leading-tight ${
            align === "center"
              ? "text-4xl md:text-5xl max-w-4xl"
              : "text-3xl md:text-4xl"
          }`}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
            }}
            className={`mt-3 text-sm text-white/55 ${
              align === "center" ? "max-w-2xl" : ""
            }`}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 16 },
          show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
        }}
        className="relative flex-1 min-h-0 px-12 pb-20"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
