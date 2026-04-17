"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users2, AlertTriangle, ShieldCheck, Globe2, ArrowLeftRight } from "lucide-react";
import { CountrySelector } from "@/components/comparison/CountrySelector";
import { StatBar, type StatBarItem } from "@/components/ui/StatBar";
import { COUNTRIES } from "@/lib/countries/catalog";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */
type CoverageLevel = "Covered" | "Voluntary" | "Limited" | "Not Covered";

const COVERAGE_COLUMNS = [
  "Retirement Coverage",
  "Occupational Hazard",
  "Unemployment",
  "Housing Security",
  "Health Security",
] as const;

type CoverageColumn = (typeof COVERAGE_COLUMNS)[number];

const COL_SHORT: Record<CoverageColumn, string> = {
  "Retirement Coverage": "Retirement",
  "Occupational Hazard": "Occ. Hazard",
  Unemployment: "Unemploy.",
  "Housing Security": "Housing",
  "Health Security": "Health",
};

interface SegmentRow {
  id: string;
  name: string;
  detail: string;
  populationLabel: string;
  populationM: number | null;
  cells: Record<CoverageColumn, CoverageLevel>;
}

interface IntlSegment {
  id: string;
  countryIso3: string;
  segment: string;
  coverageType: string;
  level: string;
  population: string | null;
  notes: string | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */
const cellStyles: Record<CoverageLevel, string> = {
  Covered: "bg-gpssa-green/15 border-gpssa-green/30 text-gpssa-green",
  Voluntary: "bg-gold/15 border-gold/30 text-gold",
  Limited: "bg-adl-blue/15 border-adl-blue/30 text-adl-blue",
  "Not Covered": "bg-red-500/10 border-red-500/20 text-red-400",
};

const cellShort: Record<CoverageLevel, string> = {
  Covered: "Covered",
  Voluntary: "Voluntary",
  Limited: "Limited",
  "Not Covered": "Not Cov.",
};

const STATIC_SEGMENT_MATRIX: SegmentRow[] = [
  { id: "s1", name: "Saudi — Formal employment", detail: "Private ~2.2M · Civil ~1.2M · Military ~1M", populationLabel: "~4.4M", populationM: 4.4, cells: { "Retirement Coverage": "Covered", "Occupational Hazard": "Covered", Unemployment: "Covered", "Housing Security": "Voluntary", "Health Security": "Covered" } },
  { id: "s2", name: "Saudi — Self-employed", detail: "Independent professionals & own-account workers", populationLabel: "~0.4M", populationM: 0.4, cells: { "Retirement Coverage": "Voluntary", "Occupational Hazard": "Not Covered", Unemployment: "Not Covered", "Housing Security": "Not Covered", "Health Security": "Covered" } },
  { id: "s3", name: "Saudi — Informal employment", detail: "Gig, casual labor, micro-enterprise", populationLabel: "~0.3M", populationM: 0.3, cells: { "Retirement Coverage": "Not Covered", "Occupational Hazard": "Not Covered", Unemployment: "Not Covered", "Housing Security": "Not Covered", "Health Security": "Limited" } },
  { id: "s4", name: "Non-Saudi — Formal employment", detail: "6.4M expat labor force", populationLabel: "~6.4M", populationM: 6.4, cells: { "Retirement Coverage": "Not Covered", "Occupational Hazard": "Covered", Unemployment: "Limited", "Housing Security": "Not Covered", "Health Security": "Covered" } },
  { id: "s5", name: "Non-Saudi — Domestic workers", detail: "Household staff, drivers, nannies", populationLabel: "~1.5M", populationM: 1.5, cells: { "Retirement Coverage": "Not Covered", "Occupational Hazard": "Limited", Unemployment: "Not Covered", "Housing Security": "Not Covered", "Health Security": "Covered" } },
  { id: "s6", name: "Non-Saudi — Others", detail: "Dependents, students, retired", populationLabel: "~2.0M", populationM: 2.0, cells: { "Retirement Coverage": "Not Covered", "Occupational Hazard": "Not Covered", Unemployment: "Not Covered", "Housing Security": "Not Covered", "Health Security": "Limited" } },
  { id: "s7", name: "GCC-posted nationals", detail: "Cross-border GCC workers", populationLabel: "~50K", populationM: 0.05, cells: { "Retirement Coverage": "Covered", "Occupational Hazard": "Covered", Unemployment: "Limited", "Housing Security": "Not Covered", "Health Security": "Covered" } },
  { id: "s8", name: "Military & security", detail: "Armed forces & security personnel", populationLabel: "~100K", populationM: 0.1, cells: { "Retirement Coverage": "Covered", "Occupational Hazard": "Covered", Unemployment: "Not Covered", "Housing Security": "Covered", "Health Security": "Covered" } },
];

function countGaps(matrix: SegmentRow[]): number {
  return matrix.reduce((acc, row) => acc + Object.values(row.cells).filter((v) => v === "Not Covered").length, 0);
}

/* ═══════════════════════════════════════════════════════════════════════════
   Coverage Matrix (compact, fits viewport)
   ═══════════════════════════════════════════════════════════════════════════ */
function CompactMatrix({
  title,
  iso3,
  rows,
  highlightGaps,
  gapSet,
}: {
  title: string;
  iso3: string;
  rows: SegmentRow[];
  highlightGaps?: boolean;
  gapSet?: Set<string>;
}) {
  return (
    <div className="glass-card overflow-hidden border border-white/[0.06] flex flex-col h-full">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2 shrink-0">
        <CountryFlag code={iso3} size="sm" />
        <h2 className="font-playfair text-sm font-semibold text-cream">{title}</h2>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="text-left p-2 text-[9px] uppercase tracking-wide text-gray-muted font-medium w-[160px]">Segment</th>
              <th className="text-center p-2 text-[9px] uppercase tracking-wide text-gray-muted font-medium w-[50px]">Pop.</th>
              {COVERAGE_COLUMNS.map((col) => (
                <th key={col} className="text-center p-1.5 text-[8px] uppercase tracking-wide text-gray-muted font-medium leading-tight">{COL_SHORT[col]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 + idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="p-2 align-top">
                  <p className="font-medium text-cream text-[10px] leading-tight">{row.name}</p>
                  <p className="text-[8px] text-gray-muted mt-0.5 line-clamp-1">{row.detail}</p>
                </td>
                <td className="p-1.5 text-center align-middle">
                  <span className="font-playfair text-[11px] font-semibold text-cream tabular-nums">{row.populationLabel}</span>
                </td>
                {COVERAGE_COLUMNS.map((col) => {
                  const level = row.cells[col];
                  const isGap = highlightGaps && gapSet?.has(`${row.name}::${col}`);
                  return (
                    <td key={col} className="p-1 align-middle text-center">
                      <motion.span
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.05 + idx * 0.03, duration: 0.25 }}
                        className={`inline-flex items-center justify-center min-h-[1.75rem] w-full max-w-[80px] mx-auto px-1 py-0.5 rounded-md border text-[9px] font-medium leading-tight ${cellStyles[level]} ${
                          isGap ? "ring-1 ring-gpssa-green/40 shadow-sm shadow-gpssa-green/20" : ""
                        }`}
                      >
                        {cellShort[level]}
                      </motion.span>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function SegmentCoveragePage() {
  const [segmentMatrix, setSegmentMatrix] = useState<SegmentRow[]>(STATIC_SEGMENT_MATRIX);
  const [intlSegments, setIntlSegments] = useState<IntlSegment[]>([]);
  const [comparisonCountries, setComparisonCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const comparisonCountry = comparisonCountries[0] ?? null;

  useEffect(() => {
    fetch("/api/products/segments")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const rowMap = new Map<string, SegmentRow>();
        for (const item of data) {
          const seg = String(item.segment ?? "");
          const covType = String(item.coverageType ?? "") as CoverageColumn;
          const level = String(item.level ?? "Limited") as CoverageLevel;
          if (!seg || !COVERAGE_COLUMNS.includes(covType)) continue;
          if (!rowMap.has(seg)) {
            rowMap.set(seg, { id: seg, name: seg, detail: String(item.notes ?? ""), populationLabel: String(item.population ?? "N/A"), populationM: null, cells: Object.fromEntries(COVERAGE_COLUMNS.map((c) => [c, "Limited" as CoverageLevel])) as Record<CoverageColumn, CoverageLevel> });
          }
          rowMap.get(seg)!.cells[covType] = level;
        }
        if (rowMap.size > 0) setSegmentMatrix(Array.from(rowMap.values()));
      }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!comparisonCountry) { setIntlSegments([]); return; }
    fetch(`/api/international/segments?countries=${comparisonCountry}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (Array.isArray(data)) setIntlSegments(data); })
      .catch(() => setIntlSegments([]));
  }, [comparisonCountry]);

  const intlMatrix = useMemo(() => {
    if (!comparisonCountry || intlSegments.length === 0) return null;
    const rows: SegmentRow[] = [];
    for (const s of intlSegments) {
      const covType = s.coverageType as CoverageColumn;
      if (!COVERAGE_COLUMNS.includes(covType)) continue;
      let row = rows.find((r) => r.name === s.segment);
      if (!row) {
        row = { id: `${s.countryIso3}-${s.segment}`, name: s.segment, detail: s.notes ?? "", populationLabel: s.population ?? "N/A", populationM: null, cells: Object.fromEntries(COVERAGE_COLUMNS.map((c) => [c, "Not Covered" as CoverageLevel])) as Record<CoverageColumn, CoverageLevel> };
        rows.push(row);
      }
      row.cells[covType] = (s.level as CoverageLevel) ?? "Not Covered";
    }
    return rows;
  }, [intlSegments, comparisonCountry]);

  const gapHighlightSet = useMemo(() => {
    if (!intlMatrix) return new Set<string>();
    const gaps = new Set<string>();
    for (const gpssaRow of segmentMatrix) {
      for (const col of COVERAGE_COLUMNS) {
        if (gpssaRow.cells[col] === "Not Covered") {
          const intlRow = intlMatrix.find((r) => r.name === gpssaRow.name);
          if (intlRow && (intlRow.cells[col] === "Covered" || intlRow.cells[col] === "Voluntary")) {
            gaps.add(`${gpssaRow.name}::${col}`);
          }
        }
      }
    }
    return gaps;
  }, [segmentMatrix, intlMatrix]);

  const totalPopulationM = segmentMatrix.reduce((acc, r) => acc + (r.populationM ?? 0), 0);
  const gapCount = countGaps(segmentMatrix);
  const countryName = comparisonCountry ? COUNTRIES.find((c) => c.iso3 === comparisonCountry)?.name : null;

  const statBarItems: StatBarItem[] = useMemo(() => {
    const items: StatBarItem[] = [
      { icon: Users2, value: segmentMatrix.length, label: "Segments" },
      { icon: AlertTriangle, value: gapCount, label: "Gap Cells" },
      { icon: ShieldCheck, value: `~${totalPopulationM.toFixed(1)}M`, label: "Population" },
    ];
    if (comparisonCountry && countryName) {
      items.push({ icon: ArrowLeftRight, value: intlMatrix?.length ?? 0, label: countryName });
    }
    return items;
  }, [segmentMatrix.length, gapCount, totalPopulationM, comparisonCountry, countryName, intlMatrix]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2 border-b border-white/[0.06]">
        <h1 className="font-playfair text-base font-semibold text-cream shrink-0">Segment Coverage</h1>
        <div className="h-4 w-px bg-white/10" />
        <CountrySelector
          selected={comparisonCountries}
          onChange={setComparisonCountries}
          pillar="products"
          variant="inline"
          maxSelections={1}
        />
        {comparisonCountry && gapHighlightSet.size > 0 && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gpssa-green/40 ring-1 ring-gpssa-green/40 shadow-sm shadow-gpssa-green/20" />
            <span className="text-[9px] text-gray-muted">{gapHighlightSet.size} gap{gapHighlightSet.size !== 1 ? "s" : ""} highlighted</span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 flex overflow-hidden p-4 gap-4">
        <AnimatePresence mode="wait">
          {comparisonCountry && intlMatrix && intlMatrix.length > 0 ? (
            <motion.div
              key="side-by-side"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-4 w-full h-full min-h-0"
            >
              <div className="flex-1 min-w-0 h-full">
                <CompactMatrix
                  title="GPSSA Coverage"
                  iso3="ARE"
                  rows={segmentMatrix}
                  highlightGaps
                  gapSet={gapHighlightSet}
                />
              </div>
              <div className="flex-1 min-w-0 h-full">
                <CompactMatrix
                  title={`${countryName} Coverage`}
                  iso3={comparisonCountry}
                  rows={intlMatrix}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="single"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <CompactMatrix
                title="GPSSA Segment × Coverage Matrix"
                iso3="ARE"
                rows={segmentMatrix}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {comparisonCountry && intlSegments.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="glass-card rounded-xl p-6 text-center max-w-xs pointer-events-auto">
              <Globe2 size={24} className="mx-auto text-gray-muted mb-2" />
              <p className="text-xs text-cream mb-1">No data for {countryName}</p>
              <p className="text-[10px] text-gray-muted">Run the International Segments Research Agent from Admin to populate.</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend + StatBar */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-1.5 border-t border-white/[0.04] bg-white/[0.01]">
        <span className="text-[9px] uppercase tracking-wide text-cream/60 mr-1">Legend</span>
        {([
          ["Covered", "Mandatory / statutory"],
          ["Voluntary", "Opt-in / employer-sponsored"],
          ["Limited", "Partial / uneven access"],
          ["Not Covered", "No primary scheme"],
        ] as const).map(([label, hint]) => (
          <span key={label} className="inline-flex items-center gap-1">
            <span className={`rounded-md px-1.5 py-0.5 border text-[8px] font-medium ${cellStyles[label as CoverageLevel]}`}>{label}</span>
            <span className="text-[8px] text-gray-muted hidden lg:inline">{hint}</span>
          </span>
        ))}
      </div>
      <StatBar items={statBarItems} />
    </div>
  );
}
