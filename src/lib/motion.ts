import type { Variants } from "framer-motion";

/** Shared cinematic easing used across the whole application. */
export const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35, ease: EASE } },
};

export const staggerChildren: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

export const tileItem: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: EASE } },
};

/** Standard hover/tap for interactive tiles. */
export const tilePress = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { scale: 0.99 },
} as const;
