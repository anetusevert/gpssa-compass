"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users2, AlertTriangle, ShieldCheck, Table2, Globe2, ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { CountrySelector } from "@/components/comparison/CountrySelector";
import { ComparisonBanner } from "@/components/comparison/ComparisonBanner";
import { COUNTRIES } from "@/lib/countries/catalog";
import { CountryFlag } from "@/components/ui/CountryFlag";

type CoverageLevel = "Covered" | "Voluntary" | "Limited" | "Not Covered";

const COVERAGE_COLUMNS = [
  "Retirement Coverage",
  "Occupational Hazard",
  "Unemployment",
  "Housing Security",
  "Health Security",
] as const;

type CoverageColumn = (typeof COVERAGE_COLUMNS)[number];

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

const cellStyles: Record<CoverageLevel, string> = {
  Covered: "bg-gpssa-green/15 border-gpssa-green/30 text-gpssa-green",
  Voluntary: "bg-gold/15 border-gold/30 text-gold",
  Limited: "bg-adl-blue/15 border-adl-blue/30 text-adl-blue",
  "Not Covered": "bg-red-500/10 border-red-500/20 text-red-400",
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

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const } } };

function CoverageMatrix({ title, iso3, rows }: { title: string; iso3: string; rows: SegmentRow[] }) {
  return (
    <div className="glass-card overflow-hidden border border-white/[0.06]">
      <div className="p-5 border-b border-white/5 flex items-center gap-2">
        <CountryFlag code={iso3} size="sm" />
        <Table2 size={16} className="text-gold" />
        <h2 className="font-playfair text-lg font-semibold text-cream">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="text-left p-3 md:p-4 text-xs uppercase tracking-wide text-gray-muted font-medium w-[220px]">Segment</th>
              <th className="text-center p-3 md:p-4 text-xs uppercase tracking-wide text-gray-muted font-medium whitespace-nowrap">Population</th>
              {COVERAGE_COLUMNS.map((col) => (
                <th key={col} className="text-center p-3 md:p-4 text-[10px] md:text-xs uppercase tracking-wide text-gray-muted font-medium leading-tight">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <motion.tr key={row.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 + idx * 0.04, ease: [0.16, 1, 0.3, 1] }} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-3 md:p-4 align-top">
                  <p className="font-medium text-cream">{row.name}</p>
                  <p className="text-xs text-gray-muted mt-0.5">{row.detail}</p>
                </td>
                <td className="p-3 md:p-4 text-center align-middle">
                  <span className="font-playfair text-base font-semibold text-cream tabular-nums">{row.populationLabel}</span>
                </td>
                {COVERAGE_COLUMNS.map((col) => {
                  const level = row.cells[col];
                  return (
                    <td key={col} className="p-2 md:p-3 align-middle text-center">
                      <span className={`inline-flex items-center justify-center min-h-[2.25rem] w-full max-w-[120px] mx-auto px-1.5 py-1 rounded-lg border text-[10px] md:text-xs font-medium leading-tight ${cellStyles[level]}`}>{level}</span>
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

export default function SegmentCoveragePage() {
  const [segmentMatrix, setSegmentMatrix] = useState<SegmentRow[]>(STATIC_SEGMENT_MATRIX);
  const [intlSegments, setIntlSegments] = useState<IntlSegment[]>([]);
  const [comparisonCountries, setComparisonCountries] = useState<string[]>([]);

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
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (comparisonCountries.length === 0) { setIntlSegments([]); return; }
    const params = new URLSearchParams({ countries: comparisonCountries.join(",") });
    fetch(`/api/international/segments?${params}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (Array.isArray(data)) setIntlSegments(data); })
      .catch(() => setIntlSegments([]));
  }, [comparisonCountries]);

  const intlMatrices = useMemo(() => {
    const map = new Map<string, SegmentRow[]>();
    for (const s of intlSegments) {
      const covType = s.coverageType as CoverageColumn;
      if (!COVERAGE_COLUMNS.includes(covType)) continue;
      if (!map.has(s.countryIso3)) map.set(s.countryIso3, []);
      const rows = map.get(s.countryIso3)!;
      let row = rows.find((r) => r.name === s.segment);
      if (!row) {
        row = { id: `${s.countryIso3}-${s.segment}`, name: s.segment, detail: s.notes ?? "", populationLabel: s.population ?? "N/A", populationM: null, cells: Object.fromEntries(COVERAGE_COLUMNS.map((c) => [c, "Not Covered" as CoverageLevel])) as Record<CoverageColumn, CoverageLevel> };
        rows.push(row);
      }
      row.cells[covType] = (s.level as CoverageLevel) ?? "Not Covered";
    }
    return map;
  }, [intlSegments]);

  const gapInsights = useMemo(() => {
    if (intlSegments.length === 0) return [];
    const gpssaGaps = new Set<string>();
    for (const row of segmentMatrix) {
      for (const col of COVERAGE_COLUMNS) {
        if (row.cells[col] === "Not Covered") gpssaGaps.add(`${col}`);
      }
    }

    const insights: { coverageType: string; countriesWithCoverage: { iso3: string; name: string }[] }[] = [];
    for (const gap of Array.from(gpssaGaps)) {
      const countriesCovering = intlSegments
        .filter((s) => s.coverageType === gap && (s.level === "Covered" || s.level === "Voluntary"))
        .map((s) => s.countryIso3);
      const uniqueCountries = Array.from(new Set(countriesCovering)).map((iso3) => {
        const c = COUNTRIES.find((c) => c.iso3 === iso3);
        return { iso3, name: c?.name ?? iso3 };
      });
      if (uniqueCountries.length > 0) {
        insights.push({ coverageType: gap, countriesWithCoverage: uniqueCountries });
      }
    }
    return insights;
  }, [segmentMatrix, intlSegments]);

  const totalPopulationM = segmentMatrix.reduce((acc, r) => acc + (r.populationM ?? 0), 0);
  const gapCount = countGaps(segmentMatrix);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 p-6 md:p-8 pb-12">
      <motion.div variants={fadeUp}>
        <PageHeader title="Segment Coverage" description="Coverage matrix by labor-market segment versus major social-protection pillars, with international comparison." badge={{ label: "Products pillar", variant: "gold" }} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Users2} label="Segments in view" value={segmentMatrix.length} trend="neutral" />
        <StatCard icon={AlertTriangle} label="Coverage gap cells" value={gapCount} trend="neutral" change="Not covered" />
        <StatCard icon={ShieldCheck} label="Population modeled (M)" value={`~${totalPopulationM.toFixed(1)}M`} trend="neutral" change="excl. atypical" />
      </motion.div>

      <motion.div variants={fadeUp}>
        <CountrySelector selected={comparisonCountries} onChange={setComparisonCountries} pillar="products" />
      </motion.div>

      <AnimatePresence>
        {comparisonCountries.length > 0 && <ComparisonBanner selectedCountries={comparisonCountries} />}
      </AnimatePresence>

      {/* Gap insights */}
      {gapInsights.length > 0 && (
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {gapInsights.map((insight) => (
            <div key={insight.coverageType} className="glass-card rounded-xl p-4 border border-gpssa-green/15">
              <div className="flex items-center gap-2 mb-2">
                <ArrowLeftRight size={12} className="text-gpssa-green" />
                <span className="text-xs font-medium text-cream">{insight.coverageType}</span>
              </div>
              <p className="text-[10px] text-gray-muted mb-2">
                {insight.countriesWithCoverage.length} comparison {insight.countriesWithCoverage.length === 1 ? "country provides" : "countries provide"} coverage where GPSSA has gaps
              </p>
              <div className="flex flex-wrap gap-1">
                {insight.countriesWithCoverage.map((c) => (
                  <span key={c.iso3} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gpssa-green/10 text-gpssa-green">
                    <CountryFlag code={c.iso3} size="xs" /> {c.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <CoverageMatrix title="GPSSA Segment × Coverage Matrix" iso3="ARE" rows={segmentMatrix} />
      </motion.div>

      {/* International matrices */}
      {Array.from(intlMatrices.entries()).map(([iso3, rows]) => {
        const country = COUNTRIES.find((c) => c.iso3 === iso3);
        return (
          <motion.div key={iso3} variants={fadeUp}>
            <CoverageMatrix title={`${country?.name ?? iso3} Segment × Coverage`} iso3={iso3} rows={rows} />
          </motion.div>
        );
      })}

      {comparisonCountries.length > 0 && intlSegments.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center">
          <Globe2 size={32} className="mx-auto text-gray-muted mb-3" />
          <p className="text-sm text-cream mb-1">No international segment data available yet</p>
          <p className="text-xs text-gray-muted">Run the International Segments Research Agent from Admin → Agents to populate comparison data.</p>
        </div>
      )}

      <motion.div variants={fadeUp} className="p-4 border-t border-white/5 flex flex-wrap gap-3 text-xs text-gray-muted">
        <span className="uppercase tracking-wide text-cream/80 mr-1">Legend:</span>
        {([["Covered", "Mandatory / statutory"], ["Voluntary", "Opt-in or employer-sponsored"], ["Limited", "Partial, capped, or uneven access"], ["Not Covered", "No primary scheme"]] as const).map(([label, hint]) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span className={`rounded-md px-2 py-0.5 border ${cellStyles[label as CoverageLevel]}`}>{label}</span>
            <span className="hidden sm:inline">{hint}</span>
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
