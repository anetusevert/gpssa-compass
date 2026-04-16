"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Percent,
} from "lucide-react";
import { type Persona, getCoverageStatus } from "@/data/personas";
import { PersonaAvatar } from "./PersonaAvatar";

interface PersonaCardProps {
  persona: Persona;
  index: number;
  onClick: () => void;
}

const cardVariants = {
  initial: { opacity: 0, y: 30, filter: "blur(8px)", scale: 0.97 },
  animate: {
    opacity: 1, y: 0, filter: "blur(0px)", scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  hover: { y: -6, transition: { duration: 0.25, ease: "easeOut" as const } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

const glowVariants = {
  initial: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.3 } },
};

const arrowVariants = {
  initial: { x: 0, opacity: 0.5 },
  hover: { x: 4, opacity: 1, transition: { duration: 0.2, ease: "easeOut" as const } },
};

function CoverageBadge({ status }: { status: "full" | "partial" | "none" }) {
  const config = {
    full:    { icon: CheckCircle2,  label: "Full Coverage",  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    partial: { icon: AlertTriangle, label: "Partial",        color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30"   },
    none:    { icon: XCircle,       label: "No Coverage",    color: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/30"    },
  };
  const { icon: Icon, label, color, bg, border } = config[status];
  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${bg} ${border} border`}>
      <Icon className={`w-2.5 h-2.5 ${color}`} />
      <span className={color}>{label}</span>
    </div>
  );
}

function StatPill({ icon: Icon, value, label, color }: { icon: React.ElementType; value: string | number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <Icon className={`w-3 h-3 ${color}`} />
      <span className="text-white/70">{label}:</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

const colorConfig: Record<string, { ring: string; glow: string; accent: string }> = {
  purple:  { ring: "group-hover:ring-purple-500/50",  glow: "from-purple-500/30 via-transparent to-transparent",  accent: "text-purple-400"  },
  cyan:    { ring: "group-hover:ring-cyan-500/50",    glow: "from-cyan-500/30 via-transparent to-transparent",    accent: "text-cyan-400"    },
  blue:    { ring: "group-hover:ring-blue-500/50",    glow: "from-blue-500/30 via-transparent to-transparent",    accent: "text-blue-400"    },
  amber:   { ring: "group-hover:ring-amber-500/50",   glow: "from-amber-500/30 via-transparent to-transparent",   accent: "text-amber-400"   },
  indigo:  { ring: "group-hover:ring-indigo-500/50",  glow: "from-indigo-500/30 via-transparent to-transparent",  accent: "text-indigo-400"  },
  rose:    { ring: "group-hover:ring-rose-500/50",    glow: "from-rose-500/30 via-transparent to-transparent",    accent: "text-rose-400"    },
  emerald: { ring: "group-hover:ring-emerald-500/50", glow: "from-emerald-500/30 via-transparent to-transparent", accent: "text-emerald-400" },
  orange:  { ring: "group-hover:ring-orange-500/50",  glow: "from-orange-500/30 via-transparent to-transparent",  accent: "text-orange-400"  },
  slate:   { ring: "group-hover:ring-slate-400/50",   glow: "from-slate-400/30 via-transparent to-transparent",   accent: "text-slate-300"   },
  lime:    { ring: "group-hover:ring-lime-500/50",    glow: "from-lime-500/30 via-transparent to-transparent",    accent: "text-lime-400"    },
};

export function PersonaCard({ persona, index, onClick }: PersonaCardProps) {
  const Icon = persona.icon;
  const coverageStatus = getCoverageStatus(persona);
  const colors = colorConfig[persona.color] || colorConfig.cyan;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${persona.name}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className={`group relative cursor-pointer rounded-xl overflow-hidden bg-gradient-to-br from-navy-light/90 to-navy/90 border border-white/10 ring-2 ring-transparent transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal/50 ${colors.ring}`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <motion.div
        variants={glowVariants}
        className={`absolute -inset-1 rounded-xl opacity-0 blur-xl -z-10 bg-gradient-to-br ${colors.glow}`}
      />

      <div className="relative p-3 sm:p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <CoverageBadge status={coverageStatus} />
          <div className="p-1 rounded-md bg-white/5 border border-white/10">
            <Icon className={`w-3.5 h-3.5 ${colors.accent}`} />
          </div>
        </div>

        <div className="flex-shrink-0 mb-2 flex justify-center">
          <PersonaAvatar persona={persona} size="md" showGlow={false} />
        </div>

        <div className="text-center mb-2">
          <h3 className="text-sm font-bold text-cream mb-0.5 font-playfair group-hover:text-white transition-colors leading-tight">
            {persona.name}
          </h3>
          <p className={`text-[10px] font-medium leading-tight ${colors.accent}`}>{persona.tagline}</p>
        </div>

        <div className="mt-auto space-y-1.5">
          <div className="p-2 rounded-lg bg-navy/60 border border-white/5 space-y-1">
            <StatPill icon={TrendingUp} value={`${persona.demographics.registrationRate}%`} label="Registered" color={colors.accent} />
            <StatPill icon={Percent} value={`${persona.demographics.populationShare}%`} label="Workforce" color="text-white/60" />
          </div>

          <motion.div className="flex items-center justify-center gap-1 py-1 text-[10px] font-medium text-white/50 group-hover:text-white/80 transition-colors">
            <span>Explore Journey</span>
            <motion.div variants={arrowVariants}>
              <ArrowRight className="w-3 h-3" />
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-teal to-transparent" />
      </div>
    </motion.div>
  );
}
