"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Send, Stethoscope, Wallet, HeartPulse, Building2,
  Plane, AlertTriangle, User, HelpCircle, UserPlus, CheckCircle2,
  Clock, Link, Globe, FileCheck, Armchair, TrendingUp,
  Smartphone, Car, Sun, Home,
} from "lucide-react";
import { type PersonaJourneyStep } from "@/data/personas";

const iconMap: Record<string, React.ElementType> = {
  FileText, Send, Stethoscope, Wallet, HeartPulse, Building2,
  Plane, AlertTriangle, User, HelpCircle, UserPlus, CheckCircle2,
  Clock, Link, Globe, FileCheck, Armchair, TrendingUp,
  Smartphone, Car, Sun, Home,
};

const colorConfig: Record<string, {
  line: string; dot: string; glow: string; bg: string; border: string; text: string;
}> = {
  purple:  { line: "from-purple-500 to-violet-600",  dot: "bg-purple-500",  glow: "shadow-purple-500/50",  bg: "bg-purple-500/10",  border: "border-purple-500/30",  text: "text-purple-400"  },
  cyan:    { line: "from-cyan-500 to-teal-600",      dot: "bg-cyan-500",    glow: "shadow-cyan-500/50",    bg: "bg-cyan-500/10",    border: "border-cyan-500/30",    text: "text-cyan-400"    },
  blue:    { line: "from-blue-500 to-indigo-600",    dot: "bg-blue-500",    glow: "shadow-blue-500/50",    bg: "bg-blue-500/10",    border: "border-blue-500/30",    text: "text-blue-400"    },
  amber:   { line: "from-amber-500 to-orange-600",   dot: "bg-amber-500",   glow: "shadow-amber-500/50",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   text: "text-amber-400"   },
  indigo:  { line: "from-indigo-500 to-blue-600",    dot: "bg-indigo-500",  glow: "shadow-indigo-500/50",  bg: "bg-indigo-500/10",  border: "border-indigo-500/30",  text: "text-indigo-400"  },
  rose:    { line: "from-rose-500 to-pink-600",      dot: "bg-rose-500",    glow: "shadow-rose-500/50",    bg: "bg-rose-500/10",    border: "border-rose-500/30",    text: "text-rose-400"    },
  emerald: { line: "from-emerald-500 to-green-600",  dot: "bg-emerald-500", glow: "shadow-emerald-500/50", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
  orange:  { line: "from-orange-500 to-amber-600",   dot: "bg-orange-500",  glow: "shadow-orange-500/50",  bg: "bg-orange-500/10",  border: "border-orange-500/30",  text: "text-orange-400"  },
  slate:   { line: "from-slate-400 to-gray-600",     dot: "bg-slate-400",   glow: "shadow-slate-400/50",   bg: "bg-slate-500/10",   border: "border-slate-400/30",   text: "text-slate-300"   },
  lime:    { line: "from-lime-500 to-green-600",     dot: "bg-lime-500",    glow: "shadow-lime-500/50",    bg: "bg-lime-500/10",    border: "border-lime-500/30",    text: "text-lime-400"    },
};

function JourneyDescription({ description, colors }: { description: string; colors: typeof colorConfig.cyan }) {
  const segments = description.split(
    /(?=POSITIVE:|CHALLENGE:|EXCELLENT:|CRITICAL:|BENEFIT:|IMPROVEMENT:|REALITY:|INSIGHT:|OPPORTUNITY:|DANGER:|KEY |REFORM|TWO PATHS:|THREE PATHS:|IF PROVIDED:|ZERO|COMPLETE|PARTIAL:|PRESSURE:|IMPORTANT:)/
  );

  if (segments.length <= 1) {
    return <p className="text-xs text-white/60 leading-relaxed">{description}</p>;
  }

  return (
    <div className="space-y-1.5 text-xs">
      {segments.map((segment, i) => {
        const trimmed = segment.trim();
        if (!trimmed) return null;

        let labelClass = "text-white/50";
        let textClass = "text-white/60";
        let label = "";
        let content = trimmed;

        if (/^(POSITIVE:|EXCELLENT|BENEFIT:|IMPROVEMENT:|GLIMMER)/.test(trimmed)) {
          labelClass = "text-emerald-400 font-semibold";
          textClass = "text-emerald-300/80";
        } else if (/^(CHALLENGE:|CRITICAL|DANGER:|ZERO|COMPLETE|PRESSURE:)/.test(trimmed)) {
          labelClass = "text-amber-400 font-semibold";
          textClass = "text-amber-300/80";
        } else if (/^(INSIGHT:|REALITY:|KEY |IMPORTANT:|IF PROVIDED:|PARTIAL:)/.test(trimmed)) {
          labelClass = "text-cyan-400 font-semibold";
          textClass = "text-cyan-300/80";
        } else if (/^(OPPORTUNITY:|REFORM|TWO PATHS:|THREE PATHS:)/.test(trimmed)) {
          labelClass = "text-purple-400 font-semibold";
          textClass = "text-purple-300/80";
        }

        const colonIndex = trimmed.indexOf(":");
        if (colonIndex > -1 && colonIndex < 20) {
          label = trimmed.substring(0, colonIndex + 1);
          content = trimmed.substring(colonIndex + 1).trim();
        }

        return (
          <p key={i} className="leading-relaxed">
            {label && <span className={labelClass}>{label} </span>}
            <span className={textClass}>{content}</span>
          </p>
        );
      })}
    </div>
  );
}

interface GPSSATimelineProps {
  steps: PersonaJourneyStep[];
  outcome: string;
  personaColor: string;
}

export function GPSSATimeline({ steps, outcome, personaColor }: GPSSATimelineProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const colors = colorConfig[personaColor] || colorConfig.cyan;
  const selectedStep = steps[selectedIndex];
  const Icon = iconMap[selectedStep?.icon] || FileText;

  return (
    <div className="h-full flex flex-col">
      {/* Timeline Track */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }}
        className="flex items-start justify-between px-4 mb-4"
      >
        {steps.map((step, index) => {
          const StepIcon = iconMap[step.icon] || FileText;
          const isSelected = selectedIndex === index;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }}
              className="flex-1 flex flex-col items-center relative"
            >
              {index > 0 && (
                <div className={`absolute top-5 right-1/2 w-full h-0.5 bg-gradient-to-r ${colors.line} opacity-30`} />
              )}
              <motion.button
                onClick={() => setSelectedIndex(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-lg ${colors.glow} ${
                  isSelected
                    ? `${colors.bg} ${colors.border} border-2 ring-2 ring-offset-2 ring-offset-navy`
                    : `${colors.bg} ${colors.border} border hover:border-2`
                }`}
              >
                <StepIcon className={`w-4 h-4 ${colors.text}`} />
              </motion.button>
              <div className="mt-2 text-center">
                <p className={`text-[10px] font-medium ${isSelected ? colors.text : "text-white/50"}`}>
                  Step {index + 1}
                </p>
                <p className={`text-xs font-semibold mt-0.5 max-w-[80px] truncate ${isSelected ? "text-white" : "text-white/70"}`}>
                  {step.title}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Selected Step Detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } }}
          exit={{ opacity: 0, y: 5, scale: 0.95, transition: { duration: 0.15 } }}
          className="flex-1 p-4 rounded-xl bg-navy-light/60 border border-white/10 overflow-auto"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${colors.bg} ${colors.border} border`}>
              <Icon className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                    Step {selectedIndex + 1}
                  </span>
                  <h4 className="text-base font-semibold text-white font-playfair">{selectedStep.title}</h4>
                </div>
                <div className="px-2 py-1 rounded-lg bg-navy/50 border border-white/10 flex-shrink-0">
                  <span className="text-[10px] text-white/60">Duration: </span>
                  <span className="text-xs font-medium text-white">{selectedStep.duration}</span>
                </div>
              </div>
              <JourneyDescription description={selectedStep.description} colors={colors} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Outcome */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`mt-3 p-3 rounded-lg border flex items-center gap-3 ${colors.bg} ${colors.border}`}
      >
        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${colors.text}`} />
        <div className="min-w-0">
          <span className={`text-xs font-semibold ${colors.text}`}>Expected Outcome: </span>
          <span className="text-xs text-white/70">{outcome}</span>
        </div>
      </motion.div>
    </div>
  );
}
