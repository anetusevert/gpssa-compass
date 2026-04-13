"use client";

import { motion } from "framer-motion";
import { Users2, AlertTriangle, ShieldCheck, Table2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

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

/** Illustrative matrix aligned to Bain Technical Proposal labor-market segmentation (KSA). */
const SEGMENT_MATRIX: SegmentRow[] = [
  {
    id: "s1",
    name: "Saudi — Formal employment",
    detail: "Private ~2.2M · Civil ~1.2M · Military ~1M",
    populationLabel: "~4.4M",
    populationM: 4.4,
    cells: {
      "Retirement Coverage": "Covered",
      "Occupational Hazard": "Covered",
      Unemployment: "Covered",
      "Housing Security": "Voluntary",
      "Health Security": "Covered",
    },
  },
  {
    id: "s2",
    name: "Saudi — Self-employed",
    detail: "Independent professionals & own-account workers",
    populationLabel: "~0.4M",
    populationM: 0.4,
    cells: {
      "Retirement Coverage": "Voluntary",
      "Occupational Hazard": "Limited",
      Unemployment: "Not Covered",
      "Housing Security": "Voluntary",
      "Health Security": "Voluntary",
    },
  },
  {
    id: "s3",
    name: "Saudi — Informal employment",
    detail: "Undeclared or non-contractual work arrangements",
    populationLabel: "~0.2M",
    populationM: 0.2,
    cells: {
      "Retirement Coverage": "Limited",
      "Occupational Hazard": "Limited",
      Unemployment: "Not Covered",
      "Housing Security": "Limited",
      "Health Security": "Limited",
    },
  },
  {
    id: "s4",
    name: "Saudi — Amateurs & professionals",
    detail: "Sports, media, and atypical professional categories",
    populationLabel: "Various",
    populationM: null,
    cells: {
      "Retirement Coverage": "Voluntary",
      "Occupational Hazard": "Limited",
      Unemployment: "Limited",
      "Housing Security": "Voluntary",
      "Health Security": "Voluntary",
    },
  },
  {
    id: "s5",
    name: "Non-Saudi — Formal employment",
    detail: "Wage employees under standard sponsorship",
    populationLabel: "~6.4M",
    populationM: 6.4,
    cells: {
      "Retirement Coverage": "Covered",
      "Occupational Hazard": "Covered",
      Unemployment: "Limited",
      "Housing Security": "Voluntary",
      "Health Security": "Covered",
    },
  },
  {
    id: "s6",
    name: "Non-Saudi — Others",
    detail: "Domestic workers, self-employed, and fragmented categories",
    populationLabel: "~3.7M",
    populationM: 3.7,
    cells: {
      "Retirement Coverage": "Limited",
      "Occupational Hazard": "Limited",
      Unemployment: "Not Covered",
      "Housing Security": "Limited",
      "Health Security": "Voluntary",
    },
  },
];

const cellStyles: Record<CoverageLevel, string> = {
  Covered: "bg-gpssa-green/15 text-gpssa-green border-gpssa-green/25",
  Voluntary: "bg-gold/15 text-gold border-gold/25",
  Limited: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  "Not Covered": "bg-red-500/10 text-red-400/90 border-red-500/20",
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function countGaps(rows: SegmentRow[]): number {
  let n = 0;
  for (const row of rows) {
    for (const col of COVERAGE_COLUMNS) {
      if (row.cells[col] === "Not Covered") n += 1;
    }
  }
  return n;
}

const totalPopulationM = SEGMENT_MATRIX.reduce(
  (acc, r) => acc + (r.populationM ?? 0),
  0
);
const gapCount = countGaps(SEGMENT_MATRIX);

export default function SegmentCoveragePage() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8 p-6 md:p-8 pb-12"
    >
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Segment Coverage"
          description="Coverage matrix by labor-market segment versus major social-protection pillars, informed by the Bain Technical Proposal segmentation."
          badge={{ label: "Products pillar", variant: "gold" }}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users2}
          label="Segments in view"
          value={SEGMENT_MATRIX.length}
          trend="neutral"
        />
        <StatCard
          icon={AlertTriangle}
          label="Coverage gap cells"
          value={gapCount}
          trend="neutral"
          change="Not covered"
        />
        <StatCard
          icon={ShieldCheck}
          label="Population modeled (M)"
          value={`~${totalPopulationM.toFixed(1)}M`}
          trend="neutral"
          change="excl. atypical"
        />
      </motion.div>

      <motion.div variants={fadeUp} className="glass-card overflow-hidden border border-white/[0.06]">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <Table2 size={16} className="text-gold" />
          <h2 className="font-playfair text-lg font-semibold text-cream">
            Segment × coverage matrix
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left p-3 md:p-4 text-xs uppercase tracking-wide text-gray-muted font-medium w-[220px]">
                  Segment
                </th>
                <th className="text-center p-3 md:p-4 text-xs uppercase tracking-wide text-gray-muted font-medium whitespace-nowrap">
                  Population
                </th>
                {COVERAGE_COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="text-center p-3 md:p-4 text-[10px] md:text-xs uppercase tracking-wide text-gray-muted font-medium leading-tight"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEGMENT_MATRIX.map((row, idx) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-3 md:p-4 align-top">
                    <p className="font-medium text-cream">{row.name}</p>
                    <p className="text-xs text-gray-muted mt-0.5">{row.detail}</p>
                  </td>
                  <td className="p-3 md:p-4 text-center align-middle">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="font-playfair text-base font-semibold text-cream tabular-nums">
                        {row.populationLabel}
                      </span>
                      <span className="h-1 w-12 rounded-full bg-gradient-to-r from-gpssa-green/40 via-gold/50 to-adl-blue/40" />
                    </div>
                  </td>
                  {COVERAGE_COLUMNS.map((col) => {
                    const level = row.cells[col];
                    return (
                      <td key={col} className="p-2 md:p-3 align-middle text-center">
                        <span
                          className={`inline-flex items-center justify-center min-h-[2.25rem] w-full max-w-[120px] mx-auto px-1.5 py-1 rounded-lg border text-[10px] md:text-xs font-medium leading-tight ${cellStyles[level]}`}
                        >
                          {level}
                        </span>
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/5 flex flex-wrap gap-3 text-xs text-gray-muted">
          <span className="uppercase tracking-wide text-cream/80 mr-1">Legend:</span>
          {(
            [
              ["Covered", "Mandatory / statutory"],
              ["Voluntary", "Opt-in or employer-sponsored"],
              ["Limited", "Partial, capped, or uneven access"],
              ["Not Covered", "No primary scheme"],
            ] as const
          ).map(([label, hint]) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <span className={`rounded-md px-2 py-0.5 border ${cellStyles[label as CoverageLevel]}`}>
                {label}
              </span>
              <span className="hidden sm:inline">{hint}</span>
            </span>
          ))}
        </div>
      </motion.div>

      <motion.p variants={fadeUp} className="text-xs text-gray-muted max-w-3xl">
        Population figures are order-of-magnitude placeholders for dashboard storytelling; validate against
        the latest national labor surveys and GOSI / HRSD statistical releases before executive use.
      </motion.p>
    </motion.div>
  );
}
