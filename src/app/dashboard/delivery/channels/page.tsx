"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid,
  Smartphone,
  Building2,
  Headphones,
  Link2,
  Code2,
  Layers,
  Gauge,
  MonitorSmartphone,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type ChannelStatus = "Active" | "Developing" | "Pilot" | "Planned";

interface DeliveryChannel {
  id: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  maturity: number;
  servicesAvailable: number;
  servicesTotal: number;
  status: ChannelStatus;
  capabilities: string;
  strengths: string[];
  gaps: string[];
  extra?: string;
}

const CHANNELS: DeliveryChannel[] = [
  {
    id: "portal",
    name: "Digital Portal",
    subtitle: "gpssa.gov.ae",
    icon: LayoutGrid,
    maturity: 65,
    servicesAvailable: 18,
    servicesTotal: 31,
    status: "Active",
    capabilities:
      "Employer self-service, certificate generation, inquiry submission, and guided journeys for core insured tasks.",
    strengths: [
      "Broad employer workflows and document issuance",
      "Strong baseline for digital-first segments",
      "Integrated inquiry and complaint capture",
    ],
    gaps: [
      "Complex merge and military journeys still center-heavy",
      "Limited proactive status tracking for beneficiaries",
      "Partner and API-led fulfillment still maturing",
    ],
  },
  {
    id: "mobile",
    name: "Mobile Application",
    subtitle: "iOS & Android",
    icon: Smartphone,
    maturity: 40,
    servicesAvailable: 8,
    servicesTotal: 31,
    status: "Developing",
    capabilities:
      "Pension status visibility, notifications, and basic inquiries with a roadmap toward parity with the portal.",
    strengths: [
      "High engagement potential for younger insureds",
      "Push notifications for lifecycle moments",
      "Lightweight UX for quick reads",
    ],
    gaps: [
      "Limited transactional depth vs. portal",
      "Incomplete catalog coverage (8/31)",
      "Needs stronger offline and accessibility patterns",
    ],
  },
  {
    id: "centers",
    name: "Service Centers",
    subtitle: "Full-service in-person",
    icon: Building2,
    maturity: 85,
    servicesAvailable: 31,
    servicesTotal: 31,
    status: "Active",
    capabilities:
      "Full-service in-person delivery with document capture, complex case handling, and human reassurance.",
    strengths: [
      "Complete catalog coverage (31/31)",
      "Trusted channel for guardians and elderly users",
      "Handles exceptions that digital cannot yet absorb",
    ],
    gaps: [
      "Peak-time capacity and appointment orchestration",
      "Consistency of digital handoff after visits",
      "Travel burden for rural and cross-emirate users",
    ],
    extra: "Locations: Abu Dhabi, Dubai, Sharjah, Al Ain.",
  },
  {
    id: "call",
    name: "Call Center",
    subtitle: "Voice & IVR",
    icon: Headphones,
    maturity: 70,
    servicesAvailable: 20,
    servicesTotal: 31,
    status: "Active",
    capabilities:
      "IVR routing, multilingual agents, and assisted completion for journeys that need clarification.",
    strengths: [
      "Strong assisted coverage (20/31)",
      "Multilingual support for diverse populations",
      "De-escalation path for sensitive life events",
    ],
    gaps: [
      "IVR depth vs. true self-serve resolution",
      "Knowledge base alignment with portal changes",
      "Callback and case continuity across channels",
    ],
  },
  {
    id: "partner",
    name: "Partner Channels",
    subtitle: "Government & banking",
    icon: Link2,
    maturity: 30,
    servicesAvailable: 5,
    servicesTotal: 31,
    status: "Pilot",
    capabilities:
      "Government integration (ICP, MOHRE) and banking partners to meet users where they already transact.",
    strengths: [
      "Reach into employer and expat ecosystems",
      "Potential for verified data exchange",
      "Scalable distribution without linear headcount",
    ],
    gaps: [
      "Early-stage catalog (5/31)",
      "Legal and operational playbooks still forming",
      "Partner onboarding velocity and monitoring",
    ],
  },
  {
    id: "api",
    name: "API / Integration",
    subtitle: "Systems & GCC",
    icon: Code2,
    maturity: 25,
    servicesAvailable: 4,
    servicesTotal: 31,
    status: "Planned",
    capabilities:
      "Employer HR and payroll integrations plus GCC cross-border portability for coordinated pensions.",
    strengths: [
      "Foundational for employer digital supply chains",
      "Unlocks straight-through processing at scale",
      "Supports regional portability ambitions",
    ],
    gaps: [
      "Early catalog coverage (4/31)",
      "Standards, consent, and audit requirements",
      "Sandbox, versioning, and partner SLAs still to land",
    ],
  },
];

const TOTAL_SERVICES = 31;

function statusVariant(
  status: ChannelStatus
): "green" | "gold" | "blue" | "gray" {
  switch (status) {
    case "Active":
      return "green";
    case "Developing":
      return "gold";
    case "Pilot":
      return "blue";
    default:
      return "gray";
  }
}

export default function DeliveryChannelsPage() {
  const totalChannels = CHANNELS.length;
  const avgMaturity = Math.round(
    CHANNELS.reduce((acc, c) => acc + c.maturity, 0) / totalChannels
  );
  const portal = CHANNELS.find((c) => c.id === "portal");
  const digitalFirstPct = portal
    ? Math.round((portal.servicesAvailable / portal.servicesTotal) * 100)
    : 0;
  const fullyCoveredServices = Math.max(
    ...CHANNELS.map((c) => c.servicesAvailable)
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Delivery Channels"
        badge={{ label: "Delivery pillar", variant: "green" }}
        description="Landscape of how GPSSA delivers services and products to customers—digital, assisted, partner-led, and integrated—so teams can prioritize maturity, coverage, and experience coherence."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Layers}
          label="Total channels"
          value={totalChannels}
          trend="neutral"
        />
        <StatCard
          icon={Gauge}
          label="Average maturity"
          value={`${avgMaturity}%`}
          trend="neutral"
          change="Portfolio view"
        />
        <StatCard
          icon={MonitorSmartphone}
          label="Digital-first (portal reach)"
          value={`${digitalFirstPct}%`}
          trend="up"
          change={
            portal
              ? `${portal.servicesAvailable} / ${portal.servicesTotal} services`
              : undefined
          }
        />
        <StatCard
          icon={CheckCircle2}
          label="Fully covered services"
          value={`${fullyCoveredServices}/${TOTAL_SERVICES}`}
          trend="neutral"
          change="Best channel depth"
        />
      </div>

      <p className="text-xs text-gray-muted -mt-2 max-w-3xl">
        Digital-first percentage is the share of the catalog reachable through the
        primary digital portal (gpssa.gov.ae). Fully covered services reflects
        the deepest single-channel availability (in-person service centers).
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CHANNELS.map((channel, index) => {
          const Icon = channel.icon;
          return (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
            >
              <Card variant="glass" padding="lg" hover className="h-full">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-3 rounded-2xl bg-teal-400/10 border border-teal-400/20 shrink-0">
                      <Icon className="text-teal-400" size={22} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-playfair text-lg font-semibold text-cream leading-tight">
                        {channel.name}
                      </h2>
                      <p className="text-xs text-gray-muted mt-0.5">
                        {channel.subtitle}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusVariant(channel.status)} size="sm" dot>
                    {channel.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="text-sm text-cream">
                    <span className="font-playfair font-semibold text-teal-400">
                      {channel.servicesAvailable}
                    </span>
                    <span className="text-gray-muted"> / {channel.servicesTotal} </span>
                    <span className="text-gray-muted text-xs uppercase tracking-wide">
                      services
                    </span>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-gray-muted mb-1">
                      <span>Maturity</span>
                      <span className="text-cream tabular-nums">
                        {channel.maturity}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-teal-400/90 to-gpssa-green"
                        initial={{ width: 0 }}
                        animate={{ width: `${channel.maturity}%` }}
                        transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-muted leading-relaxed mb-5">
                  {channel.capabilities}
                </p>
                {channel.extra && (
                  <p className="text-xs text-adl-blue/90 mb-4 border-l-2 border-adl-blue/40 pl-3">
                    {channel.extra}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gpssa-green mb-2">
                      Strengths
                    </h3>
                    <ul className="space-y-2 text-xs text-gray-muted">
                      {channel.strengths.map((s) => (
                        <li key={s} className="flex gap-2">
                          <span className="text-gold mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gold mb-2">
                      Gaps
                    </h3>
                    <ul className="space-y-2 text-xs text-gray-muted">
                      {channel.gaps.map((g) => (
                        <li key={g} className="flex gap-2">
                          <span className="text-red-400/80 mt-0.5">•</span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
