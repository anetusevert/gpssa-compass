"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Globe2,
} from "lucide-react";
import { personas, getCoverageStatus, getCoverageLabel, type Persona } from "@/data/personas";
import { PersonaCard, PersonaDetailModal } from "@/components/personas";

// ── Animation variants ────────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.4, staggerChildren: 0.1, delayChildren: 0.2 },
  },
  exit: { opacity: 0 },
};

const headerVariants = {
  initial: { opacity: 0, y: -20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const gridVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

// ── Coverage indicator ────────────────────────────────────────────────────

function CoverageIndicator({ status }: { status: "full" | "partial" | "none" }) {
  const config = {
    full:    { icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    partial: { icon: AlertTriangle, color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30"   },
    none:    { icon: XCircle,       color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/30"    },
  };
  const { icon: Icon, color, bg, border } = config[status];
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${bg} ${border} border`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className={color}>{getCoverageLabel(status)}</span>
    </div>
  );
}

// ── Stats overview ────────────────────────────────────────────────────────

function StatsOverview() {
  const stats = [
    { label: "Total Personas",    value: personas.length, icon: Users2,       color: "text-teal" },
    { label: "Full Coverage",     value: personas.filter((p) => getCoverageStatus(p) === "full").length, icon: CheckCircle2, color: "text-emerald-400" },
    { label: "Partial Coverage",  value: personas.filter((p) => getCoverageStatus(p) === "partial").length, icon: AlertTriangle, color: "text-amber-400" },
    { label: "No Coverage",       value: personas.filter((p) => getCoverageStatus(p) === "none").length, icon: XCircle, color: "text-rose-400" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="flex items-center gap-4"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-light/60 border border-white/10">
          <stat.icon className={`w-4 h-4 ${stat.color}`} />
          <span className="text-white/70 text-xs">{stat.label}:</span>
          <span className={`font-semibold text-sm ${stat.color}`}>{stat.value}</span>
        </div>
      ))}
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function CustomerPersonasPage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Header */}
      <motion.header
        variants={headerVariants}
        className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-navy/50 backdrop-blur-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-teal/20 to-gpssa-green/20 border border-teal/30">
              <Users2 className="w-5 h-5 sm:w-6 sm:h-6 text-teal" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-cream font-playfair flex flex-wrap items-center gap-2">
                GPSSA Social Insurance Personas
                <span className="hidden sm:inline text-xs font-normal text-white/40">|</span>
                <span className="hidden sm:inline text-sm font-medium text-white/60 font-sans">Ten Personas. Ten Realities.</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-muted mt-0.5">
                Each segment of the UAE workforce faces distinct social insurance realities — from full GPSSA pension to zero coverage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-navy-light/60 border border-white/10">
              <Globe2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/50" />
              <span className="text-[10px] sm:text-xs text-white/50">2025 Data</span>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 hidden sm:block">
          <StatsOverview />
        </div>
      </motion.header>

      {/* Cards Grid */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <motion.div
          variants={gridVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 max-w-[1800px] mx-auto"
        >
          {personas.map((persona, index) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              index={index}
              onClick={() => setSelectedPersona(persona)}
            />
          ))}
        </motion.div>

        {/* Coverage Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Shield className="w-4 h-4" />
            <span>GPSSA Coverage Status</span>
          </div>
          <div className="flex items-center gap-4">
            <CoverageIndicator status="full" />
            <CoverageIndicator status="partial" />
            <CoverageIndicator status="none" />
          </div>
          <p className="text-[10px] text-white/30 text-center max-w-md mt-2">
            Select any persona to explore their GPSSA journey, coverage status,
            and the challenges they face — with sourced evidence.
          </p>
        </motion.div>
      </main>

      {/* Persona Detail Modal */}
      <AnimatePresence>
        {selectedPersona && (
          <PersonaDetailModal
            persona={selectedPersona}
            onClose={() => setSelectedPersona(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
