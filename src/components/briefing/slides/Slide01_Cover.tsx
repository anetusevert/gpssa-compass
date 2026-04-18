"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Slide01_Cover() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Wireframe globe */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <motion.div
          className="relative"
          style={{ width: 620, height: 620 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        >
          <svg
            viewBox="0 0 620 620"
            width="620"
            height="620"
            className="opacity-[0.42]"
          >
            <defs>
              <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(0,168,107,0.18)" />
                <stop offset="60%" stopColor="rgba(0,168,107,0)" />
              </radialGradient>
            </defs>
            <circle cx="310" cy="310" r="290" fill="url(#globeGlow)" />
            <circle
              cx="310"
              cy="310"
              r="290"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
            {/* Latitude lines */}
            {[-60, -30, 0, 30, 60].map((lat) => {
              const ry = Math.cos((lat * Math.PI) / 180) * 290;
              return (
                <ellipse
                  key={`lat-${lat}`}
                  cx="310"
                  cy="310"
                  rx="290"
                  ry={Math.abs(ry)}
                  fill="none"
                  stroke="rgba(0,168,107,0.18)"
                  strokeWidth="1"
                />
              );
            })}
            {/* Longitude lines */}
            {[0, 30, 60, 90, 120, 150].map((lon) => {
              const rx = Math.cos((lon * Math.PI) / 180) * 290;
              return (
                <ellipse
                  key={`lon-${lon}`}
                  cx="310"
                  cy="310"
                  rx={Math.abs(rx)}
                  ry="290"
                  fill="none"
                  stroke="rgba(45,74,140,0.32)"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </motion.div>
      </motion.div>

      {/* Soft halo */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.2 }}
      >
        <div
          className="rounded-full"
          style={{
            width: 720,
            height: 720,
            background:
              "radial-gradient(circle, rgba(0,168,107,0.08) 0%, transparent 60%)",
            filter: "blur(40px)",
          }}
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-12">
        <motion.div
          className="mb-6 flex items-center gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
        >
          <Image
            src="/images/adl-logo.png"
            alt="Arthur D. Little"
            width={80}
            height={28}
            className="object-contain brightness-0 invert opacity-80"
          />
          <span className="h-7 w-px bg-white/20" />
          <span className="font-playfair text-2xl font-bold text-cream tracking-wide">
            GPSSA
          </span>
        </motion.div>

        <motion.div
          className="mb-2 text-[10px] uppercase tracking-[0.36em] text-[#33C490]/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          Executive Briefing · {todayLabel()}
        </motion.div>

        <motion.h1
          className="font-playfair text-[68px] leading-[1.05] font-bold text-cream max-w-4xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
        >
          Intelligence for the
          <br />
          <span className="text-gradient-green">next pension era.</span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-base text-white/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.2 }}
        >
          A live, sourced, comparable view of GPSSA against every major social
          insurance authority on earth.
        </motion.p>

        <motion.div
          className="mt-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <motion.span
            className="h-1 w-1 rounded-full bg-[#00A86B]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Press <kbd className="text-cream">→</kbd> or{" "}
          <kbd className="text-cream">space</kbd> to begin
        </motion.div>
      </div>
    </div>
  );
}
