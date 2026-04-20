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
  ArrowLeftRight,
  MapPin,
} from "lucide-react";
import { personas, getCoverageStatus, getCoverageLabel, type Persona } from "@/data/personas";
import { PersonaCard, PersonaDetailModal } from "@/components/personas";
import type { ResearchedPersona } from "@/components/personas/PersonaDetailModal";
import { useResearchUpdates } from "@/lib/hooks/useResearchUpdates";
import { StandardChips } from "@/components/comparator/StandardChips";
import { MandateBasisChip } from "@/components/mandate/MandateBasisChip";
import { CountrySelector } from "@/components/comparison/CountrySelector";
import { COUNTRIES } from "@/lib/countries/catalog";

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

interface IntlPersona {
  id: string;
  countryIso3: string;
  name: string;
  headline: string | null;
  ageRange: string | null;
  city: string | null;
  occupation: string | null;
  description: string | null;
  needs: string | null;
  segment: string | null;
  channelPreference: string | null;
  journeyHighlights: string | null;
  coverageMap: string | null;
}

export default function CustomerPersonasPage() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [researched, setResearched] = useState<ResearchedPersona[]>([]);
  const [comparisonCountries, setComparisonCountries] = useState<string[]>([]);
  const [intlPersonas, setIntlPersonas] = useState<IntlPersona[]>([]);
  const comparisonCountry = comparisonCountries[0] ?? null;
  const comparisonCountryName = comparisonCountry
    ? COUNTRIES.find((c) => c.iso3 === comparisonCountry)?.name ?? null
    : null;

  const loadIntlPersonas = useCallback(() => {
    if (!comparisonCountry) {
      setIntlPersonas([]);
      return;
    }
    fetch(`/api/international/delivery/personas?countries=${comparisonCountry}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setIntlPersonas(data as IntlPersona[]);
      })
      .catch(() => setIntlPersonas([]));
  }, [comparisonCountry]);

  useEffect(() => {
    loadIntlPersonas();
  }, [loadIntlPersonas]);

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
  useResearchUpdates({
    targetScreens: ["intl-delivery-personas"],
    onComplete: () => loadIntlPersonas(),
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
              <div className="mt-1 hidden sm:flex sm:items-center sm:gap-2 sm:flex-wrap">
                <StandardChips slugs={["ilo-c102", "ilo-r202"]} size="xs" max={2} />
                <MandateBasisChip
                  screenPath="/dashboard/delivery/personas"
                  entityIds={personas.map((p) => p.id)}
                />
                <CountrySelector
                  selected={comparisonCountries}
                  onChange={setComparisonCountries}
                  maxSelections={1}
                  variant="inline"
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
      <main className="flex-1 min-h-0 flex flex-col items-center justify-start p-3 sm:p-4 lg:p-6 overflow-auto gap-4">
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

        <AnimatePresence>
          {comparisonCountry && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="w-full max-w-[1600px] glass-card rounded-xl p-4 border border-white/10"
            >
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-muted">
                <ArrowLeftRight className="w-3.5 h-3.5 text-gpssa-green" />
                <span className="font-medium text-cream/90">
                  Comparator personas — {comparisonCountryName ?? comparisonCountry}
                </span>
                <span className="opacity-60">{intlPersonas.length} personas</span>
              </div>
              {intlPersonas.length === 0 ? (
                <div className="text-xs text-gray-muted py-4 text-center">
                  No data yet — run the International Customer Personas agent to populate this country.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {intlPersonas.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-lg p-3 bg-navy-light/40 border border-white/10 hover:border-teal/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="font-medium text-sm text-cream truncate">{p.name}</div>
                        {p.ageRange && (
                          <span className="text-[10px] text-gray-muted whitespace-nowrap">{p.ageRange}</span>
                        )}
                      </div>
                      {p.headline && (
                        <p className="text-[11px] text-cream/80 italic mb-2 line-clamp-2">{p.headline}</p>
                      )}
                      {(p.occupation || p.city) && (
                        <div className="flex items-center gap-2 text-[10px] text-gray-muted mb-2">
                          {p.occupation && <span className="truncate">{p.occupation}</span>}
                          {p.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              {p.city}
                            </span>
                          )}
                        </div>
                      )}
                      {p.description && (
                        <p className="text-[11px] text-gray-muted line-clamp-3 mb-2">{p.description}</p>
                      )}
                      {p.segment && (
                        <div className="text-[10px] text-teal/80 truncate">{p.segment}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
