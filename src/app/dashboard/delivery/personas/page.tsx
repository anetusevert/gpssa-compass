"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe2,
  Sparkles,
} from "lucide-react";
import { personas, getCoverageStatus, getCoverageLabel, type Persona } from "@/data/personas";
import { PersonaCard, PersonaDetailModal } from "@/components/personas";
import type { ResearchedPersona } from "@/components/personas/PersonaDetailModal";
import { useResearchUpdates } from "@/lib/hooks/useResearchUpdates";
import { StandardChips } from "@/components/comparator/StandardChips";
import { MandateBasisChip } from "@/components/mandate/MandateBasisChip";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3, staggerChildren: 0.08 } },
};

const gridVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

function CoverageChip({ status }: { status: "full" | "partial" | "none" }) {
  const cfg = {
    full:    { icon: CheckCircle2,  color: "text-emerald-400", label: "Full Coverage" },
    partial: { icon: AlertTriangle, color: "text-amber-400",   label: "Partial" },
    none:    { icon: XCircle,       color: "text-rose-400",    label: "No Coverage" },
  };
  const { icon: Icon, color, label } = cfg[status];
  const count = personas.filter((p) => getCoverageStatus(p) === status).length;
  return (
    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white/60">
      <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${color}`} />
      <span>{label}:</span>
      <span className={`font-semibold ${color}`}>{count}</span>
    </div>
  );
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export default function CustomerPersonasPage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [researched, setResearched] = useState<ResearchedPersona[]>([]);

  const loadPersonas = useCallback(() => {
    fetch("/api/delivery/personas", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data)) return;
        setResearched(
          data.map((d: Record<string, unknown>) => ({
            id: String(d.id),
            name: String(d.name ?? ""),
            headline: (d.headline as string | null) ?? null,
            journeyHighlights: (d.journeyHighlights as string | null) ?? null,
            channelPreference: (d.channelPreference as string | null) ?? null,
            description: (d.description as string | null) ?? null,
            needs: Array.isArray(d.needs) ? (d.needs as unknown[]).map(String) : [],
            segment: (d.segment as string | null) ?? null,
            occupation: (d.occupation as string | null) ?? null,
            ageRange: (d.ageRange as string | null) ?? null,
            city: (d.city as string | null) ?? null,
            incomeRange: (d.incomeRange as string | null) ?? null,
          }))
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => { loadPersonas(); }, [loadPersonas]);

  useResearchUpdates({
    targetScreens: ["delivery-personas"],
    onComplete: () => loadPersonas(),
  });

  const researchedByName = useMemo(() => {
    const map = new Map<string, ResearchedPersona>();
    for (const r of researched) map.set(normalizeName(r.name), r);
    return map;
  }, [researched]);

  const selectedResearched = selectedPersona
    ? researchedByName.get(normalizeName(selectedPersona.name)) ?? null
    : null;

  const augmentedCount = personas.filter((p) => researchedByName.has(normalizeName(p.name))).length;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Compact Header */}
      <header className="flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 bg-navy/50 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-teal/20 to-gpssa-green/20 border border-teal/30 flex-shrink-0">
              <Users2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-cream font-playfair truncate">
                GPSSA Social Insurance Personas
              </h1>
              <p className="text-[9px] sm:text-[10px] text-gray-muted truncate">
                Ten segments aligned to ILO labor taxonomy — from full GPSSA pension to zero coverage.
              </p>
              <div className="mt-1 hidden sm:flex sm:items-center sm:gap-2">
                <StandardChips slugs={["ilo-c102", "ilo-r202"]} size="xs" max={2} />
                <MandateBasisChip
                  screenPath="/dashboard/delivery/personas"
                  entityIds={personas.map((p) => p.id)}
                />
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <CoverageChip status="full" />
              <CoverageChip status="partial" />
              <CoverageChip status="none" />
            </div>
            {augmentedCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] text-purple-400">{augmentedCount} researched</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-navy-light/60 border border-white/10">
              <Globe2 className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[10px] text-white/40">2025</span>
            </div>
          </div>
        </div>
      </header>

      {/* Cards Grid — fills remaining space */}
      <main className="flex-1 min-h-0 flex items-center justify-center p-3 sm:p-4 lg:p-6 overflow-hidden">
        <motion.div
          variants={gridVariants}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full max-w-[1600px]"
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
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedPersona && (
          <PersonaDetailModal
            persona={selectedPersona}
            researched={selectedResearched}
            onClose={() => setSelectedPersona(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
