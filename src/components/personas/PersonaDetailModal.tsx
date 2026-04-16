"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Shield, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, Users, Briefcase, Clock,
  FileText, Sparkles, Building2, ChevronRight, Percent, Route,
} from "lucide-react";
import { type Persona, getCoverageStatus, getCoverageLabel } from "@/data/personas";
import { PersonaAvatar } from "./PersonaAvatar";
import { GPSSATimeline } from "./GPSSATimeline";
import { SourceCitations } from "./SourceCitations";

type TabId = "overview" | "journey" | "coverage" | "research";

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, damping: 28, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } },
};

const contentVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

const colorConfig: Record<string, {
  accent: string; gradient: string; bg: string; border: string;
}> = {
  purple:  { accent: "text-purple-400",  gradient: "from-purple-500/20 to-violet-600/20", bg: "bg-purple-500/10",  border: "border-purple-500/30"  },
  cyan:    { accent: "text-cyan-400",    gradient: "from-cyan-500/20 to-teal-600/20",     bg: "bg-cyan-500/10",    border: "border-cyan-500/30"    },
  blue:    { accent: "text-blue-400",    gradient: "from-blue-500/20 to-indigo-600/20",   bg: "bg-blue-500/10",    border: "border-blue-500/30"    },
  amber:   { accent: "text-amber-400",   gradient: "from-amber-500/20 to-orange-600/20",  bg: "bg-amber-500/10",   border: "border-amber-500/30"   },
  indigo:  { accent: "text-indigo-400",  gradient: "from-indigo-500/20 to-blue-600/20",   bg: "bg-indigo-500/10",  border: "border-indigo-500/30"  },
  rose:    { accent: "text-rose-400",    gradient: "from-rose-500/20 to-pink-600/20",     bg: "bg-rose-500/10",    border: "border-rose-500/30"    },
  emerald: { accent: "text-emerald-400", gradient: "from-emerald-500/20 to-green-600/20", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  orange:  { accent: "text-orange-400",  gradient: "from-orange-500/20 to-amber-600/20",  bg: "bg-orange-500/10",  border: "border-orange-500/30"  },
  slate:   { accent: "text-slate-300",   gradient: "from-slate-500/20 to-gray-600/20",    bg: "bg-slate-500/10",   border: "border-slate-400/30"   },
  lime:    { accent: "text-lime-400",    gradient: "from-lime-600/20 to-green-700/20",    bg: "bg-lime-500/10",    border: "border-lime-500/30"    },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function CoverageBadge({ status, size = "md" }: { status: "full" | "partial" | "none"; size?: "sm" | "md" }) {
  const cfg = {
    full:    { icon: CheckCircle2,  label: "Full Coverage",  color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
    partial: { icon: AlertTriangle, label: "Partial",        color: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/30"   },
    none:    { icon: XCircle,       label: "No Coverage",    color: "text-rose-400",    bg: "bg-rose-500/15",    border: "border-rose-500/30"    },
  };
  const { icon: Icon, label, color, bg, border } = cfg[status];
  const small = size === "sm";
  return (
    <div className={`flex items-center gap-1.5 rounded-full border ${bg} ${border} ${small ? "px-2 py-0.5" : "px-3 py-1.5"}`}>
      <Icon className={`${small ? "w-3 h-3" : "w-4 h-4"} ${color}`} />
      <span className={`${small ? "text-[10px]" : "text-xs"} font-medium ${color}`}>{label}</span>
    </div>
  );
}

function NavButton({ label, icon: Icon, isActive, onClick }: {
  label: string; icon: React.ElementType; isActive: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
        isActive
          ? "text-white bg-white/10 border-l-2 md:border-l-2 border-teal"
          : "text-white/50 hover:text-white/80 hover:bg-white/5 border-l-2 md:border-l-2 border-transparent"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function QuickStat({ label, value, icon: Icon, color }: {
  label: string; value: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-navy/50">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[9px] text-white/40 uppercase tracking-wider truncate">{label}</p>
        <p className="text-xs font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function CompactStatCard({ icon: Icon, label, value, color = "cyan" }: {
  icon: React.ElementType; label: string; value: string | number; color?: string;
}) {
  const cm: Record<string, string> = {
    cyan: "text-cyan-400", emerald: "text-emerald-400", amber: "text-amber-400",
    purple: "text-purple-400", rose: "text-rose-400", blue: "text-blue-400",
    indigo: "text-indigo-400", orange: "text-orange-400", slate: "text-slate-300", lime: "text-lime-400",
  };
  return (
    <div className="p-2.5 rounded-lg bg-navy-light/60 border border-white/10">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className={`w-3 h-3 ${cm[color] || cm.cyan}`} />
        <span className="text-[9px] text-white/50 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-base font-bold text-white">{value}</p>
    </div>
  );
}

function CoverageRow({ label, value, isBoolean = false }: {
  label: string; value: boolean | string; isBoolean?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-navy/40">
      <span className="text-xs text-white/60">{label}</span>
      {isBoolean ? (
        value ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />
      ) : (
        <span className="text-xs font-medium text-white">{String(value)}</span>
      )}
    </div>
  );
}

// ── Tab Panels ─────────────────────────────────────────────────────────────

function OverviewPanel({ persona, colors }: { persona: Persona; colors: typeof colorConfig.cyan }) {
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <CompactStatCard icon={Users} label="Workforce" value={`${persona.demographics.populationShare}%`} color={persona.color} />
          <CompactStatCard icon={TrendingUp} label="Registered" value={`${persona.demographics.registrationRate}%`} color="emerald" />
          <CompactStatCard icon={Clock} label="Age Group" value={persona.demographics.keyAgeGroup} color="purple" />
          <CompactStatCard icon={Briefcase} label="Sectors" value={persona.demographics.primarySectors.length} color="cyan" />
        </div>
        <div className="p-2.5 rounded-lg bg-navy-light/40 border border-white/10">
          <div className="flex items-center gap-2 mb-1.5">
            <Building2 className="w-3.5 h-3.5 text-white/50" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Primary Sectors</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {persona.demographics.primarySectors.slice(0, 5).map((s) => (
              <span key={s} className="px-1.5 py-0.5 rounded bg-navy/50 text-[9px] text-white/60">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-amber-400 font-medium">Key Needs</span>
          </div>
          <ul className="space-y-0.5">
            {persona.research.keyNeeds.slice(0, 3).map((n, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/60">
                <ChevronRight className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{n}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-2.5 rounded-lg bg-navy-light/40 border border-white/10">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Challenges</span>
          </div>
          <ul className="space-y-0.5">
            {persona.research.challenges.slice(0, 3).map((c, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/60">
                <ChevronRight className="w-3 h-3 text-white/30 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{c}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-medium">Recent Policy Changes</span>
          </div>
          <ul className="space-y-0.5">
            {persona.research.recentChanges.slice(0, 2).map((ch, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/60">
                <span className="text-emerald-400">•</span>
                <span className="line-clamp-1">{ch}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function JourneyPanel({ persona, colors }: { persona: Persona; colors: typeof colorConfig.cyan }) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 flex-shrink-0 gap-2">
        <p className="text-xs sm:text-sm text-white/60">
          What is the GPSSA experience for <span className="text-white font-medium">{persona.name}</span>?
        </p>
        <div className="px-2.5 py-1 rounded-lg bg-navy/60 border border-white/10 flex-shrink-0">
          <span className="text-[9px] text-white/40 uppercase">Duration:</span>
          <span className={`ml-1.5 text-xs font-semibold ${colors.accent}`}>{persona.gpssaJourney.totalDuration}</span>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <GPSSATimeline
          steps={persona.gpssaJourney.steps}
          outcome={persona.gpssaJourney.outcome}
          personaColor={persona.color}
        />
      </div>
    </div>
  );
}

function CoveragePanel({ persona }: { persona: Persona }) {
  const coverageStatus = getCoverageStatus(persona);
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
      <div className="space-y-3">
        <div className={`p-3 rounded-xl border ${
          coverageStatus === "full" ? "bg-emerald-500/10 border-emerald-500/30" :
          coverageStatus === "partial" ? "bg-amber-500/10 border-amber-500/30" :
          "bg-rose-500/10 border-rose-500/30"
        }`}>
          <div className="flex items-center gap-3">
            {coverageStatus === "full" && <CheckCircle2 className="w-7 h-7 text-emerald-400" />}
            {coverageStatus === "partial" && <AlertTriangle className="w-7 h-7 text-amber-400" />}
            {coverageStatus === "none" && <XCircle className="w-7 h-7 text-rose-400" />}
            <div>
              <p className="text-base font-bold text-white font-playfair">{getCoverageLabel(coverageStatus)}</p>
              <p className="text-[10px] text-white/50">GPSSA Social Insurance</p>
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <CoverageRow label="Pension" value={persona.coverage.pension} isBoolean />
          <CoverageRow label="End-of-Service" value={persona.coverage.endOfService} isBoolean />
          <CoverageRow label="Disability Benefit" value={persona.coverage.disabilityBenefit} isBoolean />
          <CoverageRow label="Death Benefit" value={persona.coverage.deathBenefit} isBoolean />
          <CoverageRow label="Contribution Rate" value={persona.coverage.contributionRate} />
          <CoverageRow label="Paid By" value={persona.coverage.payer.charAt(0).toUpperCase() + persona.coverage.payer.slice(1)} />
        </div>
      </div>

      <div className="space-y-3">
        {persona.coverage.gaps.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Coverage Gaps</span>
            </div>
            <ul className="space-y-1.5">
              {persona.coverage.gaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-white/60">
                  <span className="text-amber-400 mt-0.5">!</span>
                  {gap}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-3 rounded-xl bg-navy-light/40 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-3.5 h-3.5 text-white/50" />
            <span className="text-xs font-medium text-white/70">What This Means</span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed">
            {coverageStatus === "full" &&
              "Full access to GPSSA benefits including pension, disability, death-in-service, and end-of-service support. Contributions build toward a lifetime retirement income."}
            {coverageStatus === "partial" &&
              "Limited coverage — some benefits available but significant gaps exist. End-of-service gratuity may be the only retirement-adjacent benefit."}
            {coverageStatus === "none" &&
              "Not covered by GPSSA. No pension, disability, or death-in-service protections. Entirely dependent on employer goodwill and personal savings."}
          </p>
        </div>
      </div>
    </div>
  );
}

function ResearchPanel({ persona }: { persona: Persona }) {
  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <SourceCitations sources={persona.research.sources} compact />
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────

interface PersonaDetailModalProps {
  persona: Persona;
  onClose: () => void;
}

export function PersonaDetailModal({ persona, onClose }: PersonaDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [mounted, setMounted] = useState(false);
  const coverageStatus = getCoverageStatus(persona);
  const colors = colorConfig[persona.color] || colorConfig.cyan;

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const navItems: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "journey", label: "GPSSA Journey", icon: Route },
    { id: "coverage", label: "Coverage", icon: Shield },
    { id: "research", label: "Sources", icon: FileText },
  ];

  if (!mounted) return null;

  const modal = (
    <>
      {/* Backdrop */}
      <motion.div
        variants={backdropVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
      />

      {/* Modal container — always centered */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-6 pointer-events-none">
        <motion.div
          variants={modalVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-labelledby="persona-modal-title"
          className="pointer-events-auto w-full max-w-[1100px] max-h-[90vh] bg-gradient-to-br from-navy via-navy-light to-navy rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          {/* ── Left Sidebar (desktop) / Top bar (mobile) ── */}
          <div className={`md:w-[200px] flex-shrink-0 flex flex-col md:border-r border-b md:border-b-0 border-white/10 bg-gradient-to-b ${colors.gradient}`}>
            {/* Avatar + identity */}
            <div className="p-3 flex md:flex-col items-center gap-3 md:border-b border-white/10">
              <div className="flex-shrink-0">
                <PersonaAvatar persona={persona} size="md" showGlow={false} />
              </div>
              <div className="flex-1 md:text-center min-w-0">
                <h2 id="persona-modal-title" className="text-sm font-bold text-white font-playfair truncate">
                  {persona.name}
                </h2>
                <p className={`text-[10px] font-medium mt-0.5 ${colors.accent} truncate`}>{persona.tagline}</p>
                <p className="text-[9px] text-white/30 mt-0.5 hidden md:block" dir="rtl">{persona.arabicName}</p>
                <div className="mt-1.5 flex md:justify-center">
                  <CoverageBadge status={coverageStatus} size="sm" />
                </div>
              </div>
              {/* Close on mobile */}
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="md:hidden p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav tabs — horizontal on mobile, vertical on desktop */}
            <nav className="flex md:flex-col gap-0.5 p-1.5 overflow-x-auto md:overflow-x-visible md:flex-1">
              {navItems.map((item) => (
                <NavButton
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  isActive={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                />
              ))}
            </nav>

            {/* Quick stats — desktop only */}
            <div className="hidden md:block p-2 border-t border-white/10 space-y-1">
              <QuickStat label="Registered" value={`${persona.demographics.registrationRate}%`} icon={TrendingUp} color={colors.accent} />
              <QuickStat label="Workforce" value={`${persona.demographics.populationShare}%`} icon={Percent} color="text-white/60" />
            </div>
          </div>

          {/* ── Right Content Panel ── */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
                  {activeTab === "overview" && <Users className={`w-3.5 h-3.5 ${colors.accent}`} />}
                  {activeTab === "journey" && <Route className={`w-3.5 h-3.5 ${colors.accent}`} />}
                  {activeTab === "coverage" && <Shield className={`w-3.5 h-3.5 ${colors.accent}`} />}
                  {activeTab === "research" && <FileText className={`w-3.5 h-3.5 ${colors.accent}`} />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white font-playfair">
                    {activeTab === "overview" && "Demographic Overview"}
                    {activeTab === "journey" && "GPSSA Journey"}
                    {activeTab === "coverage" && "GPSSA Coverage Details"}
                    {activeTab === "research" && "Sources"}
                  </h3>
                  <p className="text-[9px] text-white/40">{persona.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="hidden md:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 sm:p-4 overflow-hidden min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="h-full"
                >
                  {activeTab === "overview" && <OverviewPanel persona={persona} colors={colors} />}
                  {activeTab === "journey" && <JourneyPanel persona={persona} colors={colors} />}
                  {activeTab === "coverage" && <CoveragePanel persona={persona} />}
                  {activeTab === "research" && <ResearchPanel persona={persona} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
