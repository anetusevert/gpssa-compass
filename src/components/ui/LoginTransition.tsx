"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { GPSSALogo } from "./GPSSALogo";

const QUOTES = [
  "Securing futures, empowering generations.",
  "Every pension plan is a promise kept.",
  "Innovation in service, excellence in delivery.",
  "Building trust through operational excellence.",
];

const QUOTE_DURATION = 2400;
const LOGO_DURATION = 1800;
const EXIT_DURATION = 800;

const ease = [0.16, 1, 0.3, 1] as const;

export function LoginTransition() {
  const router = useRouter();
  const [phase, setPhase] = useState<"logo" | "quotes" | "exit">("logo");
  const [quoteIndex, setQuoteIndex] = useState(0);

  const advanceToExit = useCallback(() => {
    setPhase("exit");
    setTimeout(() => router.push("/dashboard"), EXIT_DURATION);
  }, [router]);

  useEffect(() => {
    const logoTimer = setTimeout(() => setPhase("quotes"), LOGO_DURATION);
    return () => clearTimeout(logoTimer);
  }, []);

  useEffect(() => {
    if (phase !== "quotes") return;

    if (quoteIndex < QUOTES.length - 1) {
      const timer = setTimeout(
        () => setQuoteIndex((i) => i + 1),
        QUOTE_DURATION
      );
      return () => clearTimeout(timer);
    }

    const exitTimer = setTimeout(advanceToExit, QUOTE_DURATION);
    return () => clearTimeout(exitTimer);
  }, [phase, quoteIndex, advanceToExit]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--navy)]"
      animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: EXIT_DURATION / 1000, ease }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,168,107,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-12">
        {/* Logo phase */}
        <AnimatePresence mode="wait">
          {phase === "logo" && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8, ease }}
              className="flex flex-col items-center"
              style={{
                filter: "drop-shadow(0 0 60px rgba(0,168,107,0.3))",
              }}
            >
              <GPSSALogo size="hero" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quotes phase */}
        <AnimatePresence mode="wait">
          {phase === "quotes" && (
            <motion.div
              key="quotes-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-10"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease }}
                style={{
                  filter: "drop-shadow(0 0 40px rgba(0,168,107,0.2))",
                }}
              >
                <GPSSALogo size="lg" />
              </motion.div>

              <div className="h-16 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={quoteIndex}
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                    transition={{ duration: 0.6, ease }}
                    className="text-body-lg text-center max-w-md"
                    style={{
                      color: "var(--cream)",
                      fontStyle: "italic",
                      opacity: 0.8,
                    }}
                  >
                    &ldquo;{QUOTES[quoteIndex]}&rdquo;
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Progress dots */}
              <div className="flex gap-2">
                {QUOTES.map((_, i) => (
                  <motion.div
                    key={i}
                    className="rounded-full"
                    animate={{
                      width: i === quoteIndex ? 24 : 6,
                      backgroundColor:
                        i === quoteIndex
                          ? "var(--gpssa-green)"
                          : "var(--gray-muted)",
                      opacity: i === quoteIndex ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.4, ease }}
                    style={{ height: 6 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
