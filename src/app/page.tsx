"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { GPSSALogo } from "@/components/ui/GPSSALogo";
import { LoginTransition } from "@/components/ui/LoginTransition";

type Phase = "entry" | "hero" | "login";

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

// --- Constellation / particle CSS background ---

function ConstellationBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div className="absolute inset-0 grid-overlay opacity-40" />

      {/* Floating orbs */}
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          left: "15%",
          top: "20%",
          background:
            "radial-gradient(circle, rgba(0,168,107,0.06) 0%, transparent 70%)",
          animationDelay: "0s",
          animationDuration: "8s",
        }}
      />
      <div
        className="orb"
        style={{
          width: 400,
          height: 400,
          right: "10%",
          top: "50%",
          background:
            "radial-gradient(circle, rgba(45,74,140,0.05) 0%, transparent 70%)",
          animationDelay: "2s",
          animationDuration: "10s",
        }}
      />
      <div
        className="orb"
        style={{
          width: 300,
          height: 300,
          left: "50%",
          bottom: "10%",
          background:
            "radial-gradient(circle, rgba(197,165,114,0.04) 0%, transparent 70%)",
          animationDelay: "4s",
          animationDuration: "7s",
        }}
      />

      {/* Constellation dots */}
      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.6;
          }
        }
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: var(--cream);
          border-radius: 50%;
          animation: twinkle var(--dur) ease-in-out infinite;
          animation-delay: var(--delay);
        }
      `}</style>
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="star"
          style={
            {
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              "--dur": `${3 + (i % 4)}s`,
              "--delay": `${(i * 0.3) % 5}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// --- Login Form ---

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
      initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -30, filter: "blur(12px)" }}
      transition={{ duration: 0.7, ease }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="glass-card p-8 glow-green">
        <div className="flex flex-col items-center mb-8">
          <GPSSALogo size="sm" />
          <p className="text-caption mt-3" style={{ color: "var(--gray-muted)" }}>
            Sign in to access the platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-micro uppercase font-medium"
              style={{ color: "var(--gray-muted)" }}
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
              className="w-full px-4 py-3 rounded-xl border text-body focus:outline-none focus:ring-2 transition-all duration-300"
              style={{
                borderColor: "var(--border)",
                background: "rgba(10, 22, 40, 0.65)",
              }}
              // focus ring applied via Tailwind
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-micro uppercase font-medium"
              style={{ color: "var(--gray-muted)" }}
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
              className="w-full px-4 py-3 rounded-xl border text-body focus:outline-none focus:ring-2 transition-all duration-300"
              style={{
                borderColor: "var(--border)",
                background: "rgba(10, 22, 40, 0.65)",
              }}
              autoComplete="current-password"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-caption text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="relative mt-2 w-full py-3 rounded-xl font-medium text-body transition-all duration-300 overflow-hidden group disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, var(--gpssa-green), var(--gpssa-green-light))",
              color: "#fff",
            }}
          >
            <span className="relative z-10">
              {loading ? "Authenticating..." : "Access Platform"}
            </span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, var(--gpssa-green-light), var(--gpssa-green))",
              }}
            />
          </button>
        </form>

        <button
          onClick={onBack}
          className="w-full mt-4 text-caption text-center transition-colors duration-200 hover:opacity-80"
          style={{ color: "var(--gray-muted)" }}
        >
          &larr; Back
        </button>
      </div>
    </motion.div>
  );
}

// --- Main Landing Page ---

export default function LandingPage() {
  const [phase, setPhase] = useState<Phase>("entry");
  const [showTransition, setShowTransition] = useState(false);

  useEffect(() => {
    if (phase !== "entry") return;
    const timer = setTimeout(() => setPhase("hero"), 3000);
    return () => clearTimeout(timer);
  }, [phase]);

  const handleLoginSuccess = useCallback(() => {
    setShowTransition(true);
  }, []);

  if (showTransition) {
    return <LoginTransition />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--navy)]">
      <ConstellationBg />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center w-full px-6">
        <AnimatePresence mode="wait">
          {/* ── ENTRY PHASE ── */}
          {phase === "entry" && (
            <motion.div
              key="entry"
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.8, ease }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease, delay: 0.3 }}
                style={{
                  filter: "drop-shadow(0 0 80px rgba(0,168,107,0.25))",
                }}
              >
                <GPSSALogo size="hero" />
              </motion.div>

              {/* Loading pulse */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="mt-12 flex gap-1.5"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--gpssa-green)" }}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ── HERO PHASE ── */}
          {phase === "hero" && (
            <motion.div
              key="hero"
              className="flex flex-col items-center text-center max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.6, ease }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease, delay: 0.1 }}
                className="glass px-5 py-2 rounded-full mb-8"
              >
                <span
                  className="text-micro uppercase font-medium tracking-widest"
                  style={{ color: "var(--gpssa-green-light)" }}
                >
                  General Pension &amp; Social Security Authority
                </span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.25 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                <span className="text-gradient-green">GPSSA</span>{" "}
                <span style={{ color: "var(--cream)" }}>Compass</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease, delay: 0.45 }}
                className="text-body-lg mb-10 max-w-md"
                style={{ color: "var(--gray-muted)" }}
              >
                Product &amp; Service Development Roadmap
              </motion.p>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease, delay: 0.6 }}
                onClick={() => setPhase("login")}
                className="glass gradient-border group relative px-10 py-4 rounded-2xl font-medium text-body-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                style={{ color: "var(--cream)" }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Access Platform
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path
                      d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </motion.button>

              {/* Logos row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="flex items-center gap-6 mt-16"
              >
                <GPSSALogo size="sm" color="var(--gray-muted)" />
                <div
                  className="w-px h-8"
                  style={{ background: "var(--border)" }}
                />
                <div className="flex items-center gap-2">
                  <span
                    className="text-micro uppercase"
                    style={{ color: "var(--gray-muted)", opacity: 0.6 }}
                  >
                    Powered by
                  </span>
                  <Image
                    src="/images/adl-logo.png"
                    alt="Arthur D. Little"
                    width={80}
                    height={28}
                    className="opacity-50"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ── LOGIN PHASE ── */}
          {phase === "login" && (
            <motion.div
              key="login"
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <LoginForm
                onSuccess={handleLoginSuccess}
                onBack={() => setPhase("hero")}
              />

              {/* Footer logos */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex items-center gap-4 mt-10"
              >
                <GPSSALogo size="sm" color="var(--gray-muted)" />
                <div
                  className="w-px h-6"
                  style={{ background: "var(--border)" }}
                />
                <div className="flex items-center gap-2">
                  <span
                    className="text-micro"
                    style={{ color: "var(--gray-muted)", opacity: 0.5 }}
                  >
                    Powered by
                  </span>
                  <Image
                    src="/images/adl-logo.png"
                    alt="Arthur D. Little"
                    width={64}
                    height={22}
                    className="opacity-40"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
