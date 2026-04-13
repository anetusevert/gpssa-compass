"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { GPSSALogo } from "@/components/ui/GPSSALogo";
import { LoginTransition } from "@/components/ui/LoginTransition";

type Phase = "entry" | "hero" | "login";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const highlightItems = [
  { label: "Dynamic intelligence layers", icon: Sparkles },
  { label: "Secure executive workspace", icon: ShieldCheck },
  { label: "Roadmap-driven analysis flow", icon: Workflow },
];

const statItems = [
  { value: "31", label: "services in scope" },
  { value: "12M", label: "roadmap horizon" },
  { value: "360", label: "journey intelligence" },
];

function AmbientBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid-overlay opacity-50" />

      <div
        className="orb halo-pulse"
        style={{
          width: 620,
          height: 620,
          left: "-6%",
          top: "-8%",
          background:
            "radial-gradient(circle, rgba(0,168,107,0.16) 0%, transparent 70%)",
        }}
      />
      <div
        className="orb drift-slow drift-reverse"
        style={{
          width: 480,
          height: 480,
          right: "-4%",
          top: "15%",
          background:
            "radial-gradient(circle, rgba(45,74,140,0.14) 0%, transparent 72%)",
        }}
      />
      <div
        className="orb drift-slow"
        style={{
          width: 360,
          height: 360,
          left: "52%",
          bottom: "-4%",
          background:
            "radial-gradient(circle, rgba(197,165,114,0.14) 0%, transparent 75%)",
        }}
      />

      <div className="ambient-ring left-[8%] top-[16%] h-80 w-80 opacity-40" />
      <div className="ambient-ring bottom-[12%] right-[10%] h-[28rem] w-[28rem] opacity-25" />

      <motion.div
        className="absolute left-[12%] top-[28%] h-px w-40 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{ x: [0, 40, -10, 0], opacity: [0.2, 0.7, 0.35, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[24%] right-[14%] h-px w-56 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{ x: [0, -60, 18, 0], opacity: [0.15, 0.55, 0.2, 0.15] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
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
      initial={{ opacity: 0, y: 36, scale: 0.98, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, scale: 0.98, filter: "blur(10px)" }}
      transition={{ duration: 0.55, ease }}
      className="w-full max-w-md"
    >
      <div className="glass-card surface-depth tile-no-frame rounded-[28px] p-8 md:p-9">
        <div className="mb-8 flex flex-col gap-4">
          <GPSSALogo size="sm" />
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-white/45">
              Secure Access
            </p>
            <p className="mt-2 text-sm text-gray-muted">
              Sign in to access the intelligence workspace and continue into the
              platform.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-micro uppercase font-medium text-white/55"
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
              className="text-micro uppercase font-medium text-white/55"
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
            className="group relative mt-2 overflow-hidden rounded-2xl px-4 py-3 text-body font-medium text-white disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))",
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
          className="mt-4 w-full text-center text-caption text-gray-muted transition-colors duration-200 hover:text-white/80"
        >
          Back to overview
        </button>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [phase, setPhase] = useState<Phase>("entry");
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    if (phase !== "entry") return;
    const timer = setTimeout(() => setPhase("hero"), 1800);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleLoginSuccess = useCallback(() => {
    setShowTransition(true);
  }, []);

  if (showTransition) {
    return <LoginTransition />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--navy)]">
      <AmbientBackdrop />

      <div className="relative z-10 w-full px-5 py-8 sm:px-8 lg:px-12">
        <AnimatePresence mode="wait">
          {phase === "entry" && (
            <motion.div
              key="entry"
              className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
              transition={{ duration: 0.7, ease }}
            >
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.95, ease }}
                style={{ filter: "drop-shadow(0 0 80px rgba(255,255,255,0.16))" }}
              >
                <GPSSALogo size="hero" />
              </motion.div>

              <motion.p
                className="mt-6 text-xs uppercase tracking-[0.45em] text-white/45"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.65, ease }}
              >
                Social Insurance &amp; Pension Knowledge Intelligence
              </motion.p>

              <motion.div
                className="mt-12 flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.5 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-10 rounded-full bg-white/20"
                    animate={{ opacity: [0.25, 1, 0.25], scaleX: [0.92, 1.08, 0.92] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {phase === "hero" && (
            <motion.section
              key="hero"
              className="mx-auto max-w-6xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease }}
            >
              <div className="glass-card surface-depth tile-no-frame overflow-hidden rounded-[32px] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08, duration: 0.5, ease }}
                      className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/[0.03] px-4 py-2"
                    >
                      <span className="h-2 w-2 rounded-full bg-white/80" />
                      <span className="text-micro uppercase tracking-[0.28em] text-white/60">
                        General Pension &amp; Social Security Authority
                      </span>
                    </motion.div>

                    <motion.h1
                      className="max-w-3xl font-playfair text-5xl font-bold leading-[1.02] text-cream sm:text-6xl lg:text-7xl"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.16, duration: 0.65, ease }}
                    >
                      GPSSA <span className="text-white/88">Intelligence</span>
                    </motion.h1>

                    <motion.p
                      className="mt-5 max-w-2xl text-base text-gray-muted sm:text-lg"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.24, duration: 0.6, ease }}
                    >
                      Social Insurance &amp; Pension Knowledge Intelligence
                      across service landscapes, product development, and
                      delivery execution.
                    </motion.p>

                    <motion.div
                      className="mt-7 grid gap-3 sm:grid-cols-3"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.32, duration: 0.6, ease }}
                    >
                      {statItems.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl bg-white/[0.03] px-4 py-4 backdrop-blur-sm"
                        >
                          <p className="text-2xl font-semibold text-white">
                            {item.value}
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/45">
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </motion.div>

                    <motion.div
                      className="mt-8 flex flex-col gap-3 sm:flex-row"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.42, duration: 0.6, ease }}
                    >
                      <motion.button
                        onClick={() => setPhase("login")}
                        whileHover={{ y: -3, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-white/[0.09] px-7 py-4 text-base font-medium text-white"
                      >
                        Access Platform
                        <ArrowRight
                          size={18}
                          className="icon-white transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </motion.button>

                      <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/[0.03] px-6 py-4 text-sm text-white/65">
                        <ShieldCheck size={16} className="icon-white" />
                        Secure executive environment
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    className="grid gap-4"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.28, duration: 0.7, ease }}
                  >
                    {highlightItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.label}
                          className="glass surface-depth tile-no-frame rounded-[26px] px-5 py-5"
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.34 + index * 0.08,
                            duration: 0.58,
                            ease,
                          }}
                          whileHover={{ y: -4, scale: 1.01 }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-white/[0.05] p-3">
                              <Icon size={20} className="icon-white" />
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">
                                Intelligence layer {index + 1}
                              </p>
                              <p className="mt-2 text-lg font-medium text-white">
                                {item.label}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    <motion.div
                      className="flex items-center justify-between rounded-[26px] bg-white/[0.03] px-5 py-5"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.62, duration: 0.58, ease }}
                    >
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">
                          Powered by
                        </p>
                        <p className="mt-2 text-sm text-white/65">
                          Arthur D. Little
                        </p>
                      </div>
                      <Image
                        src="/images/adl-logo.png"
                        alt="Arthur D. Little"
                        width={92}
                        height={28}
                        className="adl-logo-white object-contain opacity-90"
                      />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          )}

          {phase === "login" && (
            <motion.section
              key="login"
              className="mx-auto max-w-6xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <motion.div
                  className="glass-card surface-depth tile-no-frame rounded-[32px] px-6 py-8 sm:px-8"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, ease }}
                >
                  <GPSSALogo size="lg" />
                  <p className="mt-6 max-w-xl text-base text-gray-muted">
                    Enter the workspace to navigate the atlas, service
                    intelligence, product intelligence, and delivery insights
                    with a stronger executive view.
                  </p>

                  <div className="mt-8 grid gap-3">
                    {highlightItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-4"
                        >
                          <div className="rounded-xl bg-white/[0.05] p-2.5">
                            <Icon size={18} className="icon-white" />
                          </div>
                          <span className="text-sm text-white/82">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-10 flex items-center gap-4">
                    <span className="text-[11px] uppercase tracking-[0.28em] text-white/36">
                      Powered by
                    </span>
                    <Image
                      src="/images/adl-logo.png"
                      alt="Arthur D. Little"
                      width={88}
                      height={26}
                      className="adl-logo-white object-contain opacity-85"
                    />
                  </div>
                </motion.div>

                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onBack={() => setPhase("hero")}
                />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
