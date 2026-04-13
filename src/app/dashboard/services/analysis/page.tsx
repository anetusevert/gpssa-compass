"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Cpu,
  HeartHandshake,
  GitBranch,
  Sparkles,
  AlertCircle,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type ThemeId =
  | "digital"
  | "automation"
  | "cx"
  | "synergy";

type Impact = "Critical" | "High" | "Medium" | "Low";

interface Insight {
  id: string;
  theme: ThemeId;
  title: string;
  description: string;
  impact: Impact;
  metrics: { label: string; value: string }[];
}

const THEME_META: Record<
  ThemeId,
  { label: string; icon: typeof Brain; accent: string }
> = {
  digital: {
    label: "Digital Transformation Readiness",
    icon: Brain,
    accent: "text-gpssa-green",
  },
  automation: {
    label: "Process Automation Potential",
    icon: Cpu,
    accent: "text-teal-400",
  },
  cx: {
    label: "Customer Experience Gaps",
    icon: HeartHandshake,
    accent: "text-gold",
  },
  synergy: {
    label: "Cross-Service Synergies",
    icon: GitBranch,
    accent: "text-adl-blue",
  },
};

const STATIC_INSIGHTS: Insight[] = [
  {
    id: "i-1",
    theme: "digital",
    title: "Portal-first journeys mask mobile gaps",
    description:
      "Several high-volume services reach parity on the digital portal while the mobile app still offers partial flows, creating inconsistent expectations for insured users.",
    impact: "High",
    metrics: [
      { label: "Services with portal ≥ partial", value: "82%" },
      { label: "Mobile parity gap", value: "11 svcs" },
    ],
  },
  {
    id: "i-2",
    theme: "digital",
    title: "Certificate generation leads digital maturity",
    description:
      "Certificate-type outputs show the strongest end-to-end digital completion, suggesting reusable patterns for document-heavy services elsewhere in the catalog.",
    impact: "Medium",
    metrics: [
      { label: "Avg readiness score", value: "78" },
      { label: "Reusable components", value: "6" },
    ],
  },
  {
    id: "i-3",
    theme: "automation",
    title: "Eligibility rules are the automation choke point",
    description:
      "Complex merge, purchase, and GCC portability journeys stall where actuarial and legal rules require manual overrides—prime candidates for decision engines behind APIs.",
    impact: "Critical",
    metrics: [
      { label: "Manual override rate", value: "~40%" },
      { label: "Rule blocks identified", value: "23" },
    ],
  },
  {
    id: "i-4",
    theme: "automation",
    title: "Straight-through processing wins in payments",
    description:
      "Contribution and schedule-change services cluster around payment rails; automating reconciliation and exception routing could recover thousands of staff hours annually.",
    impact: "High",
    metrics: [
      { label: "STP potential", value: "54%" },
      { label: "Avg touch time", value: "18 min" },
    ],
  },
  {
    id: "i-5",
    theme: "cx",
    title: "Beneficiary moments need compassionate design",
    description:
      "Death reporting and beneficiary registration combine emotional load with document intensity; digital progress exists but empathy-led orchestration remains underdeveloped.",
    impact: "Critical",
    metrics: [
      { label: "NPS risk cluster", value: "Low" },
      { label: "Drop-off after step 2", value: "31%" },
    ],
  },
  {
    id: "i-6",
    theme: "cx",
    title: "Employer HR users want batch and status APIs",
    description:
      "Employers repeatedly request consolidated status for insured rosters; today’s fragmented touchpoints inflate call-center load and duplicate portal lookups.",
    impact: "High",
    metrics: [
      { label: "Repeat inquiries", value: "28%" },
      { label: "Desired API consumers", value: "Top 120" },
    ],
  },
  {
    id: "i-7",
    theme: "cx",
    title: "Advisory services are capacity-constrained",
    description:
      "Pension advisory demand exceeds advisor availability; self-serve simulators and guided narratives could scale quality without diluting trust.",
    impact: "Medium",
    metrics: [
      { label: "Wait time p90", value: "9 days" },
      { label: "Simulator adoption (pilot)", value: "3.2k" },
    ],
  },
  {
    id: "i-8",
    theme: "synergy",
    title: "GCC portability bundles four services",
    description:
      "Registration, end-of-service, and merge flows for GCC and UAE-national mobility share data contracts—unifying case management would reduce duplicate evidence collection.",
    impact: "High",
    metrics: [
      { label: "Shared data entities", value: "14" },
      { label: "Duplicate uploads", value: "-35% est." },
    ],
  },
  {
    id: "i-9",
    theme: "synergy",
    title: "Complaints and inquiries share routing logic",
    description:
      "Sentiment and topic models cluster complaints and suggestions into overlapping themes; a single intelligence layer could route, prioritize, and learn across both channels.",
    impact: "Medium",
    metrics: [
      { label: "Topic overlap", value: "62%" },
      { label: "Models in production", value: "2" },
    ],
  },
  {
    id: "i-10",
    theme: "synergy",
    title: "Military–civil merge is a cross-pillar exemplar",
    description:
      "Military merge illustrates secure cross-sector reconciliation; patterns validated here can accelerate other sensitive workflows with similar audit requirements.",
    impact: "Low",
    metrics: [
      { label: "Reuse score", value: "71" },
      { label: "Security controls mapped", value: "18" },
    ],
  },
];

function impactBadgeVariant(
  impact: Impact
): "red" | "gold" | "blue" | "green" {
  switch (impact) {
    case "Critical":
      return "red";
    case "High":
      return "gold";
    case "Medium":
      return "blue";
    default:
      return "green";
  }
}

const THEME_ORDER: ThemeId[] = ["digital", "automation", "cx", "synergy"];

export default function ServiceAnalysisPage() {
  const [insights, setInsights] = useState<Insight[]>(STATIC_INSIGHTS);

  useEffect(() => {
    fetch("/api/research/screen-jobs")
      .then((r) => r.ok ? r.json() : null)
      .then((jobs) => {
        if (!Array.isArray(jobs)) return;
        const analysisJob = jobs.find((j: Record<string, unknown>) => j.type === "services-analysis" && j.status === "completed" && j.rawOutput);
        if (!analysisJob?.rawOutput) return;
        try {
          const parsed = JSON.parse(String(analysisJob.rawOutput));
          const results = Array.isArray(parsed) ? parsed : (parsed.results ?? []);
          if (results.length > 0) {
            setInsights(results.map((r: Record<string, unknown>, i: number) => ({
              id: `db-${i}`,
              theme: String(r.theme ?? "digital") as ThemeId,
              title: String(r.title ?? ""),
              description: String(r.description ?? ""),
              impact: String(r.impact ?? "Medium") as Impact,
              metrics: Array.isArray(r.metrics)
                ? r.metrics.map((m: Record<string, unknown>) => ({ label: String(m.label ?? ""), value: String(m.value ?? "") }))
                : [],
            })));
          }
        } catch { /* keep static */ }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Service Analysis"
        badge={{ label: "AI intelligence", variant: "green" }}
        description="Curated findings from service intelligence models and domain research—digital readiness, automation leverage, experience friction, and cross-catalog synergies for GPSSA’s 31-service landscape."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Services analyzed"
          value={31}
          trend="neutral"
        />
        <StatCard
          icon={Sparkles}
          label="Avg digital readiness"
          value="64%"
          trend="up"
          change="+4 pts"
        />
        <StatCard
          icon={AlertCircle}
          label="Pain themes surfaced"
          value={47}
          trend="neutral"
        />
        <StatCard
          icon={Lightbulb}
          label="Opportunity backlog"
          value={112}
          trend="up"
          change="prioritized"
        />
      </div>

      <div className="space-y-10">
        {THEME_ORDER.map((themeId) => {
          const meta = THEME_META[themeId];
          const ThemeIcon = meta.icon;
          const items = insights.filter((i) => i.theme === themeId);

          return (
            <section key={themeId}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-white/5">
                  <ThemeIcon size={20} className={meta.accent} />
                </div>
                <div>
                  <h2 className="font-playfair text-lg font-semibold text-cream">
                    {meta.label}
                  </h2>
                  <p className="text-xs text-gray-muted">
                    {items.length} insight{items.length !== 1 ? "s" : ""} in this
                    theme
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {items.map((insight, idx) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.25 }}
                  >
                    <Card variant="glass" padding="md" hover className="h-full">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-playfair text-base font-semibold text-cream leading-snug">
                          {insight.title}
                        </h3>
                        <Badge
                          variant={impactBadgeVariant(insight.impact)}
                          size="sm"
                          dot
                        >
                          {insight.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-muted leading-relaxed mb-4">
                        {insight.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border">
                        {insight.metrics.map((m) => (
                          <div
                            key={m.label}
                            className="rounded-lg bg-white/[0.04] border border-border/80 px-3 py-2"
                          >
                            <p className="text-lg font-playfair font-bold text-cream">
                              {m.value}
                            </p>
                            <p className="text-[10px] text-gray-muted uppercase tracking-wide mt-0.5">
                              {m.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
