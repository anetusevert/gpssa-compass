"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { GPSSALogo } from "@/components/ui/GPSSALogo";
import { LoginTransition } from "@/components/ui/LoginTransition";

type Phase = "entry" | "hero" | "login";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];
const smoothEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

function AmbientBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid-overlay opacity-40" />

      <div
        className="orb halo-pulse"
        style={{
          width: 700,
          height: 700,
          left: "-10%",
          top: "-12%",
          background:
            "radial-gradient(circle, rgba(0,168,107,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="orb drift-slow drift-reverse"
        style={{
          width: 520,
          height: 520,
          right: "-6%",
          top: "20%",
          background:
            "radial-gradient(circle, rgba(45,74,140,0.1) 0%, transparent 72%)",
        }}
      />
      <div
        className="orb drift-slow"
        style={{
          width: 400,
          height: 400,
          left: "50%",
          bottom: "-8%",
          background:
            "radial-gradient(circle, rgba(197,165,114,0.1) 0%, transparent 75%)",
        }}
      />

      <div className="ambient-ring left-[12%] top-[18%] h-72 w-72 opacity-30" />
      <div className="ambient-ring bottom-[14%] right-[12%] h-96 w-96 opacity-20" />

      <motion.div
        className="absolute left-[15%] top-[35%] h-px w-48 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{ x: [0, 50, -15, 0], opacity: [0.15, 0.5, 0.25, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[30%] right-[18%] h-px w-64 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: [0, -70, 20, 0], opacity: [0.1, 0.4, 0.15, 0.1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function LoginForm({
  onSuccess,
  onBack,
}: {
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (res?.error) {
        setError("Invalid credentials. Please try again.");
        return;
      }

      onSuccess();
    },
    [email, password, onSuccess]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, scale: 0.97, filter: "blur(10px)" }}
      transition={{ duration: 0.6, ease }}
      className="w-full max-w-md"
    >
      <div className="glass-card surface-depth tile-no-frame rounded-[28px] p-8 md:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <GPSSALogo size="sm" />
          <p className="mt-5 text-caption uppercase tracking-[0.3em] text-white/40">
            Secure Access
          </p>
          <p className="mt-2 text-sm text-gray-muted max-w-xs">
            Sign in to continue into the intelligence platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-micro uppercase font-medium text-white/50"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organization.com"
              required
              className="w-full rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-body transition-all duration-300 focus:border-white/10 focus:outline-none focus:ring-2 focus:ring-white/10"
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-micro uppercase font-medium text-white/50"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-body transition-all duration-300 focus:border-white/10 focus:outline-none focus:ring-2 focus:ring-white/10"
              autoComplete="current-password"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-caption text-center text-red-400"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="group relative mt-2 overflow-hidden rounded-2xl px-4 py-3.5 text-body font-medium text-white disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? "Authenticating..." : "Access Platform"}
              <ArrowRight
                size={16}
                className="icon-white transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </motion.button>
        </form>

        <button
          onClick={onBack}
          className="mt-5 w-full text-center text-caption text-gray-muted transition-colors duration-200 hover:text-white/70"
        >
          Back to overview
        </button>
      </div>

      <motion.div
        className="mt-8 flex items-center justify-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <span className="text-[11px] uppercase tracking-[0.28em] text-white/30">
          Powered by
        </span>
        <Image
          src="/images/adl-logo.png"
          alt="Arthur D. Little"
          width={72}
          height={22}
          className="adl-logo-white object-contain opacity-70"
        />
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [phase, setPhase] = useState<Phase>("entry");
  const [entryStep, setEntryStep] = useState(0);
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    if (phase !== "entry") return;
    const timers = [
      setTimeout(() => setEntryStep(1), 600),
      setTimeout(() => setEntryStep(2), 1500),
      setTimeout(() => setEntryStep(3), 2200),
      setTimeout(() => setPhase("hero"), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const handleLoginSuccess = useCallback(() => {
    setShowTransition(true);
  }, []);

  if (showTransition) {
    return <LoginTransition />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[var(--navy)]">
      <AmbientBackdrop />

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <AnimatePresence mode="wait">
          {/* ── PHASE 1: CINEMATIC ENTRY ── */}
          {phase === "entry" && (
            <motion.div
              key="entry"
              className="flex h-screen w-full flex-col items-center justify-center"
              exit={{
                opacity: 0,
                scale: 1.04,
                filter: "blur(10px)",
                transition: { duration: 0.6, ease: smoothEase },
              }}
            >
              {/* Bloom glow behind logo */}
              <motion.div
                className="entry-bloom absolute"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{
                  opacity: [0, 0.4, 0.2],
                  scale: [0.3, 1.8, 2.2],
                }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.1 }}
              />

              {/* Logo materializes */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: smoothEase, delay: 0.15 }}
              >
                <GPSSALogo size="hero" />
              </motion.div>

              {/* Expanding horizontal line */}
              <AnimatePresence>
                {entryStep >= 1 && (
                  <motion.div
                    key="entry-line"
                    className="mt-8 h-px w-48 origin-center"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                    }}
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: smoothEase, delay: 0.1 }}
                  />
                )}
              </AnimatePresence>

              {/* Tagline fade-up */}
              <AnimatePresence>
                {entryStep >= 2 && (
                  <motion.p
                    key="entry-tagline"
                    className="mt-7 text-center text-sm tracking-[0.14em] text-white/50 sm:text-base"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease, delay: 0.05 }}
                  >
                    Social Insurance &amp; Pension Knowledge{" "}
                    <span className="text-white/90">Intelligence</span>
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Welcome beat */}
              <AnimatePresence>
                {entryStep >= 3 && (
                  <motion.p
                    key="entry-welcome"
                    className="mt-10 text-[11px] uppercase tracking-[0.4em] text-white/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.6, y: 0 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    Welcome
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── PHASE 2: TYPOGRAPHIC HERO ── */}
          {phase === "hero" && (
            <motion.section
              key="hero"
              className="flex h-screen w-full flex-col items-center justify-center px-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                y: -16,
                filter: "blur(8px)",
                transition: { duration: 0.45, ease },
              }}
              transition={{ duration: 0.5, ease }}
            >
              {/* Eyebrow pill */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.5, ease }}
                className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/[0.04] px-5 py-2.5"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--gpssa-green)]" />
                <span className="text-[11px] uppercase tracking-[0.22em] text-white/55">
                  General Pension &amp; Social Security Authority
                </span>
              </motion.div>

              {/* Split-line headline */}
              <div className="mb-6">
                <div className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease, delay: 0.12 }}
                  >
                    <h1 className="font-playfair text-7xl font-bold leading-[0.95] text-cream sm:text-8xl lg:text-9xl">
                      GPSSA
                    </h1>
                  </motion.div>
                </div>
                <div className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease, delay: 0.26 }}
                  >
                    <h1 className="font-playfair text-7xl font-bold leading-[0.95] text-white/80 sm:text-8xl lg:text-9xl">
                      Intelligence
                    </h1>
                  </motion.div>
                </div>
              </div>

              {/* Expanding line under headline */}
              <motion.div
                className="mb-7 h-px w-32 origin-center sm:w-44"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(0,168,107,0.5), transparent)",
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: smoothEase, delay: 0.45 }}
              />

              {/* Subcopy */}
              <motion.p
                className="mb-10 max-w-lg text-base text-white/50 sm:text-lg"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease }}
              >
                Strategic knowledge platform for social insurance and pension
                systems worldwide.
              </motion.p>

              {/* CTA row */}
              <motion.div
                className="flex items-center gap-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.55, ease }}
              >
                <motion.button
                  onClick={() => setPhase("login")}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-3 rounded-full bg-white/[0.08] px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition-colors duration-300 hover:bg-white/[0.12]"
                >
                  Access Platform
                  <ArrowRight
                    size={18}
                    className="icon-white transition-transform duration-300 group-hover:translate-x-1"
                  />
                </motion.button>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/30">
                    Powered by
                  </span>
                  <Image
                    src="/images/adl-logo.png"
                    alt="Arthur D. Little"
                    width={80}
                    height={24}
                    className="adl-logo-white object-contain opacity-60"
                  />
                </div>
              </motion.div>

              {/* Scroll / pulse indicator */}
              <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <motion.div
                  className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent"
                  animate={{ scaleY: [0.6, 1, 0.6], opacity: [0.3, 0.7, 0.3] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </motion.section>
          )}

          {/* ── PHASE 3: CENTERED LOGIN ── */}
          {phase === "login" && (
            <motion.section
              key="login"
              className="flex h-screen w-full flex-col items-center justify-center px-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <LoginForm
                onSuccess={handleLoginSuccess}
                onBack={() => setPhase("hero")}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
