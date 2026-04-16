"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Smartphone,
  Building2,
  Headphones,
  Link2,
  Code2,
  Cpu,
  Share2,
  Megaphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { KPIStrip, ChannelTile, DynamicPanel } from "@/components/delivery";
import type { ChannelData, DeliveryModelData } from "@/components/delivery";

type ChannelStatus = "Active" | "Developing" | "Pilot" | "Planned";
type MaturityLevel = "High" | "Medium" | "Low";

const ICON_MAP: Record<string, LucideIcon> = {
  "Digital Portal": LayoutGrid,
  "Mobile Application": Smartphone,
  "Service Centers": Building2,
  "Call Center": Headphones,
  "Partner Channels": Link2,
  "API / Integration": Code2,
};

const MODEL_ICON_MAP: Record<string, LucideIcon> = {
  "Direct Digital": Cpu,
  "In-Person Assisted": Building2,
  "Partnership Ecosystem": Share2,
  "Outreach & Awareness": Megaphone,
};

const STATIC_CHANNELS: ChannelData[] = [
  {
    id: "portal",
    name: "Digital Portal",
    subtitle: "gpssa.gov.ae",
    icon: LayoutGrid,
    maturity: 65,
    servicesAvailable: 18,
    servicesTotal: 31,
    status: "Active",
    capabilities: "Employer self-service, certificate generation, inquiry submission, and guided journeys for core insured tasks.",
    strengths: ["Broad employer workflows and document issuance", "Strong baseline for digital-first segments", "Integrated inquiry and complaint capture"],
    gaps: ["Complex merge and military journeys still center-heavy", "Limited proactive status tracking for beneficiaries", "Partner and API-led fulfillment still maturing"],
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
    capabilities: "Pension status visibility, notifications, and basic inquiries with a roadmap toward parity with the portal.",
    strengths: ["High engagement potential for younger insureds", "Push notifications for lifecycle moments", "Lightweight UX for quick reads"],
    gaps: ["Limited transactional depth vs. portal", "Incomplete catalog coverage (8/31)", "Needs stronger offline and accessibility patterns"],
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
    capabilities: "Full-service in-person delivery with document capture, complex case handling, and human reassurance.",
    strengths: ["Complete catalog coverage (31/31)", "Trusted channel for guardians and elderly users", "Handles exceptions that digital cannot yet absorb"],
    gaps: ["Peak-time capacity and appointment orchestration", "Consistency of digital handoff after visits", "Travel burden for rural and cross-emirate users"],
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
    capabilities: "IVR routing, multilingual agents, and assisted completion for journeys that need clarification.",
    strengths: ["Strong assisted coverage (20/31)", "Multilingual support for diverse populations", "De-escalation path for sensitive life events"],
    gaps: ["IVR depth vs. true self-serve resolution", "Knowledge base alignment with portal changes", "Callback and case continuity across channels"],
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
    capabilities: "Government integration (ICP, MOHRE) and banking partners to meet users where they already transact.",
    strengths: ["Reach into employer and expat ecosystems", "Potential for verified data exchange", "Scalable distribution without linear headcount"],
    gaps: ["Early-stage catalog (5/31)", "Legal and operational playbooks still forming", "Partner onboarding velocity and monitoring"],
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
    capabilities: "Employer HR and payroll integrations plus GCC cross-border portability for coordinated pensions.",
    strengths: ["Foundational for employer digital supply chains", "Unlocks straight-through processing at scale", "Supports regional portability ambitions"],
    gaps: ["Early catalog coverage (4/31)", "Standards, consent, and audit requirements", "Sandbox, versioning, and partner SLAs still to land"],
  },
];

const STATIC_MODELS: DeliveryModelData[] = [
  {
    id: "direct-digital",
    title: "Direct Digital",
    icon: Cpu,
    description: "Primary channel for tech-savvy segments—straight-through digital journeys with minimal assisted handoffs.",
    covers: ["Portal", "Mobile app", "API"],
    targets: ["Employers", "Young insureds", "GCC nationals"],
    maturity: "Medium",
    enablers: ["eKYC and reusable identity", "Qualified digital signature", "SingPass-style federated integrations"],
  },
  {
    id: "in-person",
    title: "In-Person Assisted",
    icon: Building2,
    description: "Service center model for complex cases, guardianship, and populations that prefer human reassurance.",
    covers: ["Service centers", "Appointment system"],
    targets: ["Beneficiaries", "Guardians", "Elderly users"],
    maturity: "High",
    enablers: ["Appointment booking and queue fairness", "Case management and CRM hooks", "High-quality document scanning and archival"],
  },
  {
    id: "partnership",
    title: "Partnership Ecosystem",
    icon: Share2,
    description: "Leverage third-party networks to embed pensions and OH into employer, government, and financial journeys.",
    covers: ["Banking partners", "MOHRE", "ICP", "Employer HR systems"],
    targets: ["Expats", "Informal workers", "Domestic workers"],
    maturity: "Low",
    enablers: ["Published API framework", "Data sharing agreements and consent", "Partner onboarding and monitoring"],
  },
  {
    id: "outreach",
    title: "Outreach & Awareness",
    icon: Megaphone,
    description: "Proactive engagement that finds uncovered segments and converts intent into enrollment and contribution continuity.",
    covers: ["Social media", "Financial literacy campaigns", "Community events", "Employer workshops"],
    targets: ["Self-employed", "Informal workers", "Gig workers"],
    maturity: "Low",
    enablers: ["CRM with segment orchestration", "Content management for localized narratives", "Campaign analytics and attribution"],
  },
];

const TOTAL_SERVICES = 31;

export default function DeliveryChannelsPage() {
  const [channels, setChannels] = useState<ChannelData[]>(STATIC_CHANNELS);
  const [models, setModels] = useState<DeliveryModelData[]>(STATIC_MODELS);
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);

  useEffect(() => {
    fetch("/api/delivery/channels")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setChannels(
            data.map((d: Record<string, unknown>) => ({
              id: String(d.id),
              name: String(d.name ?? ""),
              subtitle: String(d.channelType ?? ""),
              icon: ICON_MAP[String(d.name)] ?? LayoutGrid,
              maturity: Number(d.maturity ?? 0),
              servicesAvailable: Number(d.servicesAvailable ?? 0),
              servicesTotal: Number(d.servicesTotal ?? 31),
              status: String(d.status ?? "Active") as ChannelStatus,
              capabilities: String(d.capabilities ?? ""),
              strengths: Array.isArray(d.strengths) ? d.strengths.map(String) : [],
              gaps: Array.isArray(d.gaps) ? d.gaps.map(String) : [],
            }))
          );
        }
      })
      .catch(() => {});

    fetch("/api/delivery/models")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setModels(
            data.map((d: Record<string, unknown>) => {
              const matScore = Number(d.maturity ?? 0);
              const matLevel: MaturityLevel = matScore >= 70 ? "High" : matScore >= 40 ? "Medium" : "Low";
              return {
                id: String(d.id),
                title: String(d.name ?? ""),
                icon: MODEL_ICON_MAP[String(d.name)] ?? Cpu,
                description: String(d.description ?? ""),
                covers: Array.isArray(d.channelMix) ? d.channelMix.map(String) : [],
                targets: Array.isArray(d.targetSegments) ? d.targetSegments.map(String) : [],
                maturity: matLevel,
                enablers: Array.isArray(d.enablers) ? d.enablers.map(String) : [],
              };
            })
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleSelect = useCallback(
    (channel: ChannelData) => {
      setSelectedChannel((prev) => (prev?.id === channel.id ? null : channel));
    },
    []
  );

  const handleBack = useCallback(() => setSelectedChannel(null), []);

  const totalChannels = channels.length;
  const avgMaturity = totalChannels > 0 ? Math.round(channels.reduce((acc, c) => acc + c.maturity, 0) / totalChannels) : 0;
  const portal = channels.find((c) => c.name === "Digital Portal" || c.id === "portal");
  const digitalFirstPct = portal ? Math.round((portal.servicesAvailable / portal.servicesTotal) * 100) : 0;
  const fullyCovered = channels.length > 0 ? Math.max(...channels.map((c) => c.servicesAvailable)) : 0;

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 lg:px-6 pb-4">
      {/* Top KPI strip */}
      <motion.div
        className="flex items-center justify-between gap-4 py-3 flex-shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="min-w-0">
          <h1 className="font-playfair text-lg font-bold text-cream">Channel Framework</h1>
          <p className="text-[11px] text-gray-muted mt-0.5">Delivery landscape — channels, models & benchmarks</p>
        </div>
        <KPIStrip
          totalChannels={totalChannels}
          avgMaturity={avgMaturity}
          digitalFirstPct={digitalFirstPct}
          fullyCovered={fullyCovered}
          totalServices={TOTAL_SERVICES}
        />
      </motion.div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent flex-shrink-0" />

      {/* Main content: grid + panel */}
      <div className="flex-1 min-h-0 flex gap-4 pt-4">
        {/* Channel grid */}
        <div className="flex-[3] min-w-0">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 h-full auto-rows-fr">
            {channels.map((channel, index) => (
              <ChannelTile
                key={channel.id}
                channel={channel}
                index={index}
                selected={selectedChannel?.id === channel.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>

        {/* Dynamic panel */}
        <div className="flex-[2] min-w-0">
          <DynamicPanel
            selectedChannel={selectedChannel}
            channels={channels}
            models={models}
            onBack={handleBack}
          />
        </div>
      </div>
    </div>
  );
}
