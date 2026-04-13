"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Radio,
  Smartphone,
  Building2,
  Headphones,
  Link2,
  Code2,
  Gauge,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const CHANNELS = [
  { id: "portal", label: "Digital Portal", short: "Portal", icon: LayoutGrid },
  { id: "mobile", label: "Mobile App", short: "App", icon: Smartphone },
  { id: "centers", label: "Service Centers", short: "Centers", icon: Building2 },
  { id: "call", label: "Call Center", short: "Call", icon: Headphones },
  { id: "partner", label: "Partner Channels", short: "Partner", icon: Link2 },
  { id: "api", label: "API / Integration", short: "API", icon: Code2 },
] as const;

const CATEGORIES = [
  "Employer",
  "Insured",
  "Beneficiary",
  "Agent/Guardian",
  "GCC",
  "Military",
  "General",
] as const;

type Category = (typeof CATEGORIES)[number];
type ChannelId = (typeof CHANNELS)[number]["id"];

type Capability = "Full" | "Partial" | "Planned" | "None";

interface ServiceChannelRow {
  id: string;
  name: string;
  category: Category;
  channels: Record<ChannelId, Capability>;
}

const PORTFOLIO_TOTAL = 31;

const SERVICE_MATRIX: ServiceChannelRow[] = [
  {
    id: "s-01",
    name: "Registration of an Insured",
    category: "Employer",
    channels: {
      portal: "Full",
      mobile: "Partial",
      centers: "Full",
      call: "Partial",
      partner: "Planned",
      api: "Planned",
    },
  },
  {
    id: "s-02",
    name: "Employers Registration",
    category: "Employer",
    channels: {
      portal: "Full",
      mobile: "Partial",
      centers: "Full",
      call: "Full",
      partner: "None",
      api: "Partial",
    },
  },
  {
    id: "s-10",
    name: "Merge Service Period — Civil",
    category: "Insured",
    channels: {
      portal: "Partial",
      mobile: "None",
      centers: "Full",
      call: "Partial",
      partner: "None",
      api: "Planned",
    },
  },
  {
    id: "s-11",
    name: "Purchase of Service Years",
    category: "Insured",
    channels: {
      portal: "Partial",
      mobile: "Planned",
      centers: "Full",
      call: "Partial",
      partner: "None",
      api: "None",
    },
  },
  {
    id: "s-13",
    name: "Pension Advisory Service",
    category: "Insured",
    channels: {
      portal: "Partial",
      mobile: "Partial",
      centers: "Full",
      call: "Full",
      partner: "None",
      api: "None",
    },
  },
  {
    id: "s-17",
    name: "Beneficiary Registration",
    category: "Beneficiary",
    channels: {
      portal: "Planned",
      mobile: "None",
      centers: "Full",
      call: "Partial",
      partner: "None",
      api: "Planned",
    },
  },
  {
    id: "s-19",
    name: "Report a Death",
    category: "Beneficiary",
    channels: {
      portal: "Partial",
      mobile: "Planned",
      centers: "Full",
      call: "Full",
      partner: "Partial",
      api: "Planned",
    },
  },
  {
    id: "s-20",
    name: "Agent Enrollment",
    category: "Agent/Guardian",
    channels: {
      portal: "Partial",
      mobile: "None",
      centers: "Full",
      call: "Partial",
      partner: "None",
      api: "None",
    },
  },
  {
    id: "s-23",
    name: "Registration of GCC Nationals",
    category: "GCC",
    channels: {
      portal: "Partial",
      mobile: "Partial",
      centers: "Full",
      call: "Partial",
      partner: "Partial",
      api: "Planned",
    },
  },
  {
    id: "s-25",
    name: "End of Service — GCC Nationals",
    category: "GCC",
    channels: {
      portal: "Partial",
      mobile: "None",
      centers: "Full",
      call: "Full",
      partner: "Partial",
      api: "Planned",
    },
  },
  {
    id: "s-27",
    name: "End of Service — Military",
    category: "Military",
    channels: {
      portal: "None",
      mobile: "None",
      centers: "Full",
      call: "Partial",
      partner: "None",
      api: "None",
    },
  },
  {
    id: "s-28",
    name: "Merge Service Period — Military",
    category: "Military",
    channels: {
      portal: "None",
      mobile: "None",
      centers: "Full",
      call: "Partial",
      partner: "None",
      api: "Planned",
    },
  },
  {
    id: "s-29",
    name: "Generate Certificates",
    category: "General",
    channels: {
      portal: "Full",
      mobile: "Full",
      centers: "Partial",
      call: "Partial",
      partner: "None",
      api: "Partial",
    },
  },
  {
    id: "s-30",
    name: "Submit Complaint",
    category: "General",
    channels: {
      portal: "Partial",
      mobile: "Partial",
      centers: "Full",
      call: "Full",
      partner: "None",
      api: "Planned",
    },
  },
  {
    id: "s-31",
    name: "Submit Inquiry / Suggestion",
    category: "General",
    channels: {
      portal: "Full",
      mobile: "Partial",
      centers: "Partial",
      call: "Full",
      partner: "None",
      api: "None",
    },
  },
];

const capabilityScore: Record<Capability, number> = {
  Full: 4,
  Partial: 2,
  Planned: 1,
  None: 0,
};

function capabilityVariant(
  level: Capability
): "green" | "gold" | "blue" | "gray" {
  switch (level) {
    case "Full":
      return "green";
    case "Partial":
      return "gold";
    case "Planned":
      return "blue";
    default:
      return "gray";
  }
}

function CapabilityCell({ level }: { level: Capability }) {
  return (
    <Badge variant={capabilityVariant(level)} size="sm" className="tabular-nums">
      {level}
    </Badge>
  );
}

export default function ChannelCapabilitiesPage() {
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    if (category === "All") return SERVICE_MATRIX;
    return SERVICE_MATRIX.filter((r) => r.category === category);
  }, [category]);

  const stats = useMemo(() => {
    const rows = SERVICE_MATRIX;
    const fullyDigital = rows.filter(
      (r) => r.channels.portal === "Full" && r.channels.mobile === "Full"
    ).length;
    const withApiFullOrPartial = rows.filter(
      (r) => r.channels.api === "Full" || r.channels.api === "Partial"
    ).length;
    const highTouch = rows.filter(
      (r) => r.channels.centers === "Full" || r.channels.call === "Full"
    ).length;
    return {
      portfolioTotal: PORTFOLIO_TOTAL,
      sampleRows: rows.length,
      channelCount: CHANNELS.length,
      fullyDigital,
      omniStrong: highTouch,
      apiSurface: withApiFullOrPartial,
    };
  }, []);

  const maturityByChannel = useMemo(() => {
    const rows = filtered;
    return CHANNELS.map((ch) => {
      if (rows.length === 0) {
        return { ...ch, score: 0, maturityTier: "—" as const };
      }
      const sum = rows.reduce(
        (acc, r) => acc + capabilityScore[r.channels[ch.id]],
        0
      );
      const max = rows.length * 4;
      const pct = Math.round((sum / max) * 100);
      let maturityTier: "Mature" | "Progressing" | "Foundational" | "Emerging" =
        "Emerging";
      if (pct >= 75) maturityTier = "Mature";
      else if (pct >= 50) maturityTier = "Progressing";
      else if (pct >= 30) maturityTier = "Foundational";
      return { ...ch, score: pct, maturityTier };
    });
  }, [filtered]);

  const grouped = useMemo(() => {
    const map = new Map<Category, ServiceChannelRow[]>();
    for (const cat of CATEGORIES) {
      map.set(cat, []);
    }
    for (const row of filtered) {
      map.get(row.category)!.push(row);
    }
    return CATEGORIES.map((c) => ({ category: c, rows: map.get(c)! })).filter(
      (g) => g.rows.length > 0
    );
  }, [filtered]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Channel Capabilities"
        badge={{ label: "Knowledge base", variant: "blue" }}
        description="Cross-channel view of how GPSSA services are experienced today—digital, assisted, and partner-led—so teams can align roadmaps, APIs, and service design around a coherent delivery model."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Layers}
          label="Services in portfolio"
          value={stats.portfolioTotal}
          trend="neutral"
          change="RFI baseline"
        />
        <StatCard
          icon={Radio}
          label="Channels in framework"
          value={stats.channelCount}
          trend="neutral"
        />
        <StatCard
          icon={Smartphone}
          label="Full digital (portal + app)"
          value={stats.fullyDigital}
          trend="up"
          change={`${stats.sampleRows} mapped`}
        />
        <StatCard
          icon={Gauge}
          label="Strong assisted (center/call)"
          value={stats.omniStrong}
          trend="neutral"
        />
      </div>

      <p className="text-xs text-gray-muted -mt-4">
        Matrix shows {SERVICE_MATRIX.length} representative services from the{" "}
        {PORTFOLIO_TOTAL}-service catalog; filters apply to this knowledge slice.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
              category === cat
                ? "bg-gpssa-green/20 text-gpssa-green border-gpssa-green/30"
                : "text-gray-muted hover:text-cream hover:bg-white/5 border-transparent"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <Card variant="glass" padding="md" className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-playfair text-lg font-semibold text-cream">
              Delivery matrix
            </h2>
            <p className="text-xs text-gray-muted mt-0.5">
              Capability levels per channel for each service in view.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-gray-muted">
            <span className="inline-flex items-center gap-1">
              <Badge variant="green" size="sm">
                Full
              </Badge>
            </span>
            <span className="inline-flex items-center gap-1">
              <Badge variant="gold" size="sm">
                Partial
              </Badge>
            </span>
            <span className="inline-flex items-center gap-1">
              <Badge variant="blue" size="sm">
                Planned
              </Badge>
            </span>
            <span className="inline-flex items-center gap-1">
              <Badge variant="gray" size="sm">
                None
              </Badge>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[920px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 font-playfair text-xs font-semibold text-cream w-[220px]">
                  Service
                </th>
                {CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  return (
                    <th
                      key={ch.id}
                      className="text-center py-3 px-1 font-normal text-[11px] text-gray-muted uppercase tracking-wide"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Icon size={14} className="text-teal-400/90" />
                        <span className="hidden xl:inline">{ch.label}</span>
                        <span className="xl:hidden">{ch.short}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {grouped.map(({ category: cat, rows }) => (
                <>
                  <tr key={`h-${cat}`} className="bg-white/[0.03]">
                    <td
                      colSpan={CHANNELS.length + 1}
                      className="py-2 px-2 text-xs font-playfair font-semibold text-teal-400/90 tracking-wide"
                    >
                      {cat}
                    </td>
                  </tr>
                  {rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      layout
                      className="border-b border-border/60 hover:bg-white/[0.02]"
                    >
                      <td className="py-3 pr-4 align-middle">
                        <p className="text-cream text-xs font-medium leading-snug">
                          {row.name}
                        </p>
                        <Badge variant="gray" size="sm" className="mt-1">
                          {row.category}
                        </Badge>
                      </td>
                      {CHANNELS.map((ch) => (
                        <td key={ch.id} className="py-2 px-1 text-center align-middle">
                          <div className="flex justify-center">
                            <CapabilityCell level={row.channels[ch.id]} />
                          </div>
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="text-sm text-gray-muted py-8 text-center">
            No services in this category for the current sample.
          </p>
        )}
      </Card>

      <div>
        <h2 className="font-playfair text-lg font-semibold text-cream mb-1">
          Channel maturity overview
        </h2>
        <p className="text-xs text-gray-muted mb-4 max-w-2xl">
          Normalized maturity for each channel based on the filtered service set.
          Scores weight Full highest, then Partial, Planned, and None.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {maturityByChannel.map((ch) => {
            const Icon = ch.icon;
            const tier = ch.maturityTier;
            const blurb =
              tier === "Mature"
                ? "Strong digital or assisted coverage across most mapped services."
                : tier === "Progressing"
                  ? "Mix of digital and assisted paths; several gaps or planned upgrades."
                  : tier === "Foundational"
                    ? "Many journeys still depend on centers or call for substantive steps."
                    : tier === "Emerging"
                      ? "Early coverage; prioritize parity, APIs, and guided digital journeys."
                      : "Awaiting data for the current filter.";
            return (
              <Card key={ch.id} variant="glass" padding="md" hover>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-white/5">
                    <Icon size={18} className="text-teal-400" />
                  </div>
                  <Badge variant="blue" size="sm" dot>
                    {tier}
                  </Badge>
                </div>
                <p className="font-playfair text-sm text-cream mb-1">{ch.label}</p>
                <p className="text-xs text-gray-muted line-clamp-3 mb-3">{blurb}</p>
                <div className="flex items-end justify-between gap-2">
                  <span className="text-2xl font-playfair font-bold text-cream">
                    {ch.score}%
                  </span>
                  <span className="text-[10px] text-gray-muted uppercase tracking-wide">
                    maturity index
                  </span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-adl-blue to-gpssa-green"
                    initial={{ width: 0 }}
                    animate={{ width: `${ch.score}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
