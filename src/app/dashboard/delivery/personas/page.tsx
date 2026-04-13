"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCircle2, MapPin, Briefcase } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

type Coverage = "covered" | "partial" | "none";

interface PersonaNeed {
  label: string;
  coverage: Coverage;
}

interface Persona {
  id: string;
  name: string;
  headline: string;
  ageRange: string;
  city: string;
  occupation: string;
  summary: string;
  detail: string;
  needs: PersonaNeed[];
}

const PERSONAS: Persona[] = [
  {
    id: "khaled",
    name: "Khaled",
    headline: "Saudi Uber Driver",
    ageRange: "26",
    city: "Riyadh",
    occupation: "Ride-hail driver · Finance graduate",
    summary:
      "Primary income from Uber; not married; willing to trade 6–8% of earnings for benefits but not yet registered with MHRSD.",
    detail:
      "Khaled represents gig-economy workers with volatile income and limited employer-sponsored coverage. He values transparency on deductions, instant proof of coverage, and mobile-first enrollment. Barriers include awareness of schemes, registration friction with MHRSD, and cash-flow sensitivity.",
    needs: [
      { label: "Pension", coverage: "none" },
      { label: "Health insurance", coverage: "none" },
      { label: "OH coverage", coverage: "none" },
      { label: "Unemployment", coverage: "none" },
    ],
  },
  {
    id: "bassam",
    name: "Bassam",
    headline: "Arab Expat",
    ageRange: "55+",
    city: "Jeddah",
    occupation: "Procurement manager · 3 children (1 disabled)",
    summary:
      "35 years in Saudi Arabia; seeks retirement pension beyond end-of-service; needs housing support while carrying employer health and GOSI OH.",
    detail:
      "Bassam illustrates long-tenure expatriates approaching retirement with family complexity. He needs clarity on portability, adequacy of pension vs. lump sums, and coordinated support for dependents. Trust, language, and assisted channels matter as much as digital self-serve.",
    needs: [
      { label: "Retirement pension", coverage: "partial" },
      { label: "Housing support", coverage: "none" },
      { label: "Health insurance", coverage: "covered" },
      { label: "GOSI OH", coverage: "partial" },
    ],
  },
  {
    id: "fatima",
    name: "Fatima",
    headline: "Self-Employed Artisan",
    ageRange: "35–44",
    city: "Al Ain",
    occupation: "Home-based manufacturing",
    summary:
      "Voluntary contributions only today; needs pension, occupational health, and practical financial literacy to stabilize informal income.",
    detail:
      "Fatima embodies home-based micro-entrepreneurs with irregular revenue. She benefits from simplified contribution schedules, community touchpoints, and education that connects pensions to real-life goals (children’s education, business shocks).",
    needs: [
      { label: "Pension", coverage: "partial" },
      { label: "OH coverage", coverage: "partial" },
      { label: "Financial literacy", coverage: "none" },
    ],
  },
  {
    id: "ahmed",
    name: "Ahmed",
    headline: "Farmer",
    ageRange: "45–54",
    city: "Rural area",
    occupation: "Agriculture worker",
    summary:
      "Rural agriculture worker without formal coverage; needs pension, OH, and healthcare aligned to seasonal income patterns.",
    detail:
      "Ahmed highlights informal rural employment with geographic distance from service centers. Outreach, mobile light-weight journeys, and partnerships with cooperatives or municipal programs can bridge enrollment gaps.",
    needs: [
      { label: "Pension", coverage: "none" },
      { label: "OH", coverage: "none" },
      { label: "Healthcare", coverage: "none" },
    ],
  },
  {
    id: "sara",
    name: "Sara",
    headline: "Sports Professional",
    ageRange: "18–34",
    city: "UAE",
    occupation: "Athlete at sports club",
    summary:
      "Early-career athlete on voluntary contributions; needs pension, OH, and structured career transition support as competition windows close.",
    detail:
      "Sara’s earnings peak early; she needs products that flex with contract cycles and clear guidance on transitioning to traditional employment or self-employment without losing continuity.",
    needs: [
      { label: "Pension", coverage: "partial" },
      { label: "OH", coverage: "partial" },
      { label: "Career transition", coverage: "partial" },
    ],
  },
  {
    id: "omar",
    name: "Omar",
    headline: "GCC National",
    ageRange: "35–44",
    city: "Bahraini in UAE",
    occupation: "Cross-border professional",
    summary:
      "Bahraini working in the UAE; needs cross-border pension portability, OH, and retirement clarity under GCC coordination frameworks.",
    detail:
      "Omar depends on interoperable data, harmonized vesting rules, and transparent statements that reconcile multiple jurisdictions. APIs and government-to-government channels are critical enablers.",
    needs: [
      { label: "Cross-border portability", coverage: "partial" },
      { label: "OH", coverage: "partial" },
      { label: "Retirement", coverage: "partial" },
    ],
  },
  {
    id: "maria",
    name: "Maria",
    headline: "Domestic Worker",
    ageRange: "25–34",
    city: "UAE",
    occupation: "Domestic worker · Philippines",
    summary:
      "Filipino domestic worker with very limited coverage; needs basic protections, OH, and predictable end-of-service outcomes.",
    detail:
      "Maria reflects a segment reliant on sponsors and brokers. Simple language, employer-led enrollment, and partner channels (ICP, agencies) reduce friction while safeguarding dignity and privacy.",
    needs: [
      { label: "Basic protection", coverage: "none" },
      { label: "OH", coverage: "none" },
      { label: "End-of-service", coverage: "partial" },
    ],
  },
  {
    id: "rashid",
    name: "Rashid",
    headline: "Public Sector Retiree",
    ageRange: "62",
    city: "Abu Dhabi",
    occupation: "Retired civil servant",
    summary:
      "Receiving pension but concerned about adequacy; focused on healthcare continuity, housing costs, and inflation resilience.",
    detail:
      "Rashid needs proactive communications on adjustments, supplemental savings options, and assisted service for complex life events (bereavement, dependents). Digital is secondary to clarity and trust.",
    needs: [
      { label: "Pension adequacy", coverage: "partial" },
      { label: "Healthcare", coverage: "covered" },
      { label: "Housing", coverage: "partial" },
    ],
  },
];

function needVariant(coverage: Coverage): "green" | "gold" | "red" {
  if (coverage === "covered") return "green";
  if (coverage === "partial") return "gold";
  return "red";
}

function needLabel(coverage: Coverage): string {
  if (coverage === "covered") return "Covered";
  if (coverage === "partial") return "Partial";
  return "Not covered";
}

export default function CustomerPersonasPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const active = useMemo(
    () => PERSONAS.find((p) => p.id === openId) ?? null,
    [openId]
  );

  const stats = useMemo(() => {
    const total = PERSONAS.length;
    const crossBorder = PERSONAS.filter((p) =>
      p.needs.some((n) => n.label.toLowerCase().includes("cross-border"))
    ).length;
    const vulnerable = PERSONAS.filter((p) =>
      p.needs.some((n) => n.coverage === "none")
    ).length;
    return { total, crossBorder, vulnerable };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customer Personas"
        badge={{ label: "Bain-style segments", variant: "gold" }}
        description="Representative personas from the Bain-inspired framework—needs, coverage signals, and journeys—so delivery teams can design channels, products, and policies around real people."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Personas in view"
          value={stats.total}
          trend="neutral"
        />
        <StatCard
          icon={MapPin}
          label="With cross-border context"
          value={stats.crossBorder}
          trend="neutral"
        />
        <StatCard
          icon={UserCircle2}
          label="With unmet needs"
          value={stats.vulnerable}
          trend="down"
          change="Has “none” coverage"
        />
        <StatCard
          icon={Briefcase}
          label="Informal / gig skew"
          value={4}
          trend="neutral"
          change="Illustrative slice"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {PERSONAS.map((persona, index) => (
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
          >
            <Card
              variant="glass"
              padding="md"
              hover
              onClick={() => setOpenId(persona.id)}
              className="h-full border border-white/5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-adl-blue/15 border border-adl-blue/25">
                  <UserCircle2 className="text-adl-blue" size={26} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-playfair text-lg font-semibold text-cream leading-tight">
                    {persona.name}
                  </h2>
                  <p className="text-xs text-teal-400 mt-0.5">{persona.headline}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-gray-muted mb-3">
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 border border-white/10">
                  Age {persona.ageRange}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 border border-white/10">
                  <MapPin size={12} className="text-gold" />
                  {persona.city}
                </span>
              </div>
              <p className="text-xs text-gray-muted mb-1">{persona.occupation}</p>
              <p className="text-sm text-gray-muted leading-relaxed mb-4">
                {persona.summary}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {persona.needs.map((need) => (
                  <span
                    key={`${persona.id}-${need.label}`}
                    title={`${need.label}: ${needLabel(need.coverage)}`}
                    className="inline-flex"
                  >
                    <Badge variant={needVariant(need.coverage)} size="sm">
                      {need.label}
                    </Badge>
                  </span>
                ))}
              </div>

              <p className="mt-4 text-[11px] text-gray-muted uppercase tracking-wide">
                Click for full persona detail
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={!!active}
        onClose={() => setOpenId(null)}
        title={active ? `${active.name} — ${active.headline}` : undefined}
        description={active ? `${active.occupation} · ${active.city}` : undefined}
        size="lg"
      >
        {active && (
          <div className="space-y-4 text-sm text-gray-muted">
            <div className="flex flex-wrap gap-2">
              <Badge variant="gray" size="sm">
                Age {active.ageRange}
              </Badge>
              <Badge variant="blue" size="sm" dot>
                {active.city}
              </Badge>
            </div>
            <p className="leading-relaxed">{active.summary}</p>
            <div>
              <h3 className="font-playfair text-sm text-cream mb-2">
                Coverage map
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {active.needs.map((need) => (
                  <Badge
                    key={`modal-${need.label}`}
                    variant={needVariant(need.coverage)}
                    size="md"
                  >
                    {need.label} · {needLabel(need.coverage)}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-playfair text-sm text-cream mb-2">
                Delivery notes
              </h3>
              <p className="leading-relaxed">{active.detail}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
