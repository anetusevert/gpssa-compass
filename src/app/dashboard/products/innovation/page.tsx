"use client";

import { motion } from "framer-motion";
import { Lightbulb, Gauge, Target, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type InnovationStatus = "Research" | "Concept" | "Pilot" | "Ready";
type InnovationType = "New Product" | "Enhancement" | "Digital";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  targetSegment: string;
  impactScore: number;
  feasibilityScore: number;
  status: InnovationStatus;
  estimatedPopulation: string;
  innovationType: InnovationType;
}

const OPPORTUNITIES: Opportunity[] = [
  {
    id: "i1",
    title: "Gig Worker Pension Scheme",
    description:
      "Portable micro-accrual pension wrapper for ride-share, delivery, and platform workers with weekly settlement and employer-of-record integrations.",
    targetSegment: "Platform & gig economy workers",
    impactScore: 5,
    feasibilityScore: 3,
    status: "Research",
    estimatedPopulation: "~180k eligible (pilot catchment)",
    innovationType: "New Product",
  },
  {
    id: "i2",
    title: "Expat End-of-Service Digital Platform",
    description:
      "Single digital journey for gratuity calculation, documentation, approvals, and payout tracking with bilingual UX and employer APIs.",
    targetSegment: "Non-national formal employees",
    impactScore: 4,
    feasibilityScore: 4,
    status: "Pilot",
    estimatedPopulation: "~6.4M addressable",
    innovationType: "Digital",
  },
  {
    id: "i3",
    title: "Micro-Pension for Informal Workers",
    description:
      "Mobile-first micro-contribution rails, agent banking top-ups, and simplified KYC for informal and own-account segments.",
    targetSegment: "Informal & cash-economy workers",
    impactScore: 5,
    feasibilityScore: 2,
    status: "Concept",
    estimatedPopulation: "~0.5M+ (national informal tail)",
    innovationType: "New Product",
  },
  {
    id: "i4",
    title: "GCC Pension Portability Framework",
    description:
      "Inter-authority data standards, accrual transfer protocols, and dispute resolution playbooks for cross-GCC mobility.",
    targetSegment: "GCC mobile contributors",
    impactScore: 4,
    feasibilityScore: 2,
    status: "Research",
    estimatedPopulation: "Regional cohorts",
    innovationType: "Enhancement",
  },
  {
    id: "i5",
    title: "AI-Powered Pension Advisory",
    description:
      "Responsible AI copilot for benefit estimates, contribution optimization, and scenario planning with human escalation paths.",
    targetSegment: "All insured digital users",
    impactScore: 3,
    feasibilityScore: 4,
    status: "Concept",
    estimatedPopulation: "~2M digital MAU (target)",
    innovationType: "Digital",
  },
  {
    id: "i6",
    title: "Voluntary Savings Top-Up Program",
    description:
      "Employer-matched voluntary DC sleeve with payroll deduction, Sharia-compliant fund menu, and annual opt-out windows.",
    targetSegment: "Mid-career high contributors",
    impactScore: 3,
    feasibilityScore: 5,
    status: "Ready",
    estimatedPopulation: "~400k early adopters",
    innovationType: "Enhancement",
  },
  {
    id: "i7",
    title: "Digital Workplace Injury Claims",
    description:
      "Evidence upload, tele-triage routing, and straight-through processing for low-complexity occupational claims.",
    targetSegment: "Insured employees & HR",
    impactScore: 4,
    feasibilityScore: 4,
    status: "Pilot",
    estimatedPopulation: "~1.2M claims volume / yr (est.)",
    innovationType: "Digital",
  },
  {
    id: "i8",
    title: "Cross-Border Benefit Settlement Engine",
    description:
      "Rules-based settlement core for currency, tax, and treaty overlays when benefits span multiple jurisdictions.",
    targetSegment: "Cross-border retirees & heirs",
    impactScore: 4,
    feasibilityScore: 3,
    status: "Concept",
    estimatedPopulation: "Five-figure cross-border cases / yr",
    innovationType: "Digital",
  },
  {
    id: "i9",
    title: "Portable Accrual Ledger for GCC Moves",
    description:
      "Cryptographically anchored service record that follows the member across GCC postings without duplicate contribution periods.",
    targetSegment: "GCC-posted nationals",
    impactScore: 3,
    feasibilityScore: 2,
    status: "Research",
    estimatedPopulation: "Tens of thousands mobile annually",
    innovationType: "New Product",
  },
];

const statusVariant: Record<InnovationStatus, "green" | "gold" | "blue" | "gray"> = {
  Ready: "green",
  Pilot: "gold",
  Concept: "blue",
  Research: "gray",
};

const typeVariant: Record<InnovationType, "green" | "blue" | "gold"> = {
  "New Product": "gold",
  Enhancement: "green",
  Digital: "blue",
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

function ScoreBar({
  label,
  value,
  filledClass,
}: {
  label: string;
  value: number;
  filledClass: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-[10px] uppercase tracking-wide text-gray-muted mb-1">
        <span>{label}</span>
        <span className="text-cream tabular-nums">{value}/5</span>
      </div>
      <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-white/10 p-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-colors ${
              i < value ? filledClass : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const avgImpact =
  OPPORTUNITIES.reduce((s, o) => s + o.impactScore, 0) / OPPORTUNITIES.length;
const avgFeasibility =
  OPPORTUNITIES.reduce((s, o) => s + o.feasibilityScore, 0) / OPPORTUNITIES.length;

export default function ProductInnovationPage() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8 p-6 md:p-8 pb-12"
    >
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Product Innovation"
          description="Structured view of high-potential product bets, digital enhancements, and coverage gaps informed by segment analytics."
          badge={{ label: "Products pillar", variant: "gold" }}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Lightbulb}
          label="Opportunities tracked"
          value={OPPORTUNITIES.length}
          trend="up"
          change="Pipeline"
        />
        <StatCard
          icon={Target}
          label="Avg. impact score"
          value={avgImpact.toFixed(1)}
          trend="neutral"
        />
        <StatCard
          icon={Gauge}
          label="Avg. feasibility"
          value={avgFeasibility.toFixed(1)}
          trend="neutral"
        />
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {OPPORTUNITIES.map((opp) => (
          <motion.div key={opp.id} variants={fadeUp}>
            <Card
              variant="glass"
              hover
              padding="md"
              className="h-full border border-white/[0.06] flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-playfair text-lg font-semibold text-cream leading-snug">
                  {opp.title}
                </h3>
                <Badge variant={statusVariant[opp.status]} size="sm">
                  {opp.status}
                </Badge>
              </div>

              <p className="text-sm text-gray-muted flex-1">{opp.description}</p>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={typeVariant[opp.innovationType]} size="sm">
                  {opp.innovationType}
                </Badge>
                <Badge variant="blue" size="sm">
                  {opp.targetSegment}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
                <ScoreBar
                  label="Impact"
                  value={opp.impactScore}
                  filledClass="bg-gold shadow-[0_0_8px_rgba(212,168,67,0.35)]"
                />
                <ScoreBar
                  label="Feasibility"
                  value={opp.feasibilityScore}
                  filledClass="bg-gpssa-green shadow-[0_0_8px_rgba(74,222,128,0.2)]"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-muted">
                <Users size={14} className="text-adl-blue shrink-0" />
                <span>{opp.estimatedPopulation}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
