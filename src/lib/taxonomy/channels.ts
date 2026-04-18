/**
 * Canonical Channel Typology
 *
 * Six-channel model aligned with the UN E-Government Survey's Online Service
 * Index (OSI) sub-pillars and ISSA Service Quality Guideline #6 (Multi-channel).
 *
 * Slug is the stable database key (already used in
 * `InternationalService.channelCapabilities` JSON: portal/mobile/centers/call/partner/api).
 *
 * Maturity levels for any channel cell:
 *   "None" | "Planned" | "Partial" | "Full"
 *   …rendered to a 0–100 score: None=0, Planned=30, Partial=60, Full=100.
 */

export interface Channel {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  /** Standard slugs primarily evaluating this channel. */
  standardSlugs: string[];
  /** UN E-Gov OSI sub-pillar this channel maps to. */
  osiPillar: "Service Provision" | "Engagement" | "Technology" | "Institutional Framework";
  color: string;
  icon: string;
  sortOrder: number;
}

export const CHANNELS: Channel[] = [
  {
    slug: "portal",
    label: "Digital Portal",
    shortLabel: "Portal",
    description: "Authenticated web portal — the primary self-service surface for insureds, employers and beneficiaries.",
    standardSlugs: ["un-egov-survey", "issa-ict", "issa-service-quality"],
    osiPillar: "Service Provision",
    color: "#3B82F6",
    icon: "globe",
    sortOrder: 1,
  },
  {
    slug: "mobile",
    label: "Mobile Application",
    shortLabel: "Mobile",
    description: "Native iOS / Android application for everyday transactions, notifications and biometric auth.",
    standardSlugs: ["un-egov-survey", "issa-ict"],
    osiPillar: "Service Provision",
    color: "#8B5CF6",
    icon: "smartphone",
    sortOrder: 2,
  },
  {
    slug: "centers",
    label: "Service Centers",
    shortLabel: "Centers",
    description: "Physical service centers and Tas-heel-style assisted-digital points.",
    standardSlugs: ["issa-service-quality"],
    osiPillar: "Institutional Framework",
    color: "#10B981",
    icon: "map-pin",
    sortOrder: 3,
  },
  {
    slug: "call",
    label: "Call Center",
    shortLabel: "Call",
    description: "Voice / IVR contact center for assisted service, complaints and proactive outreach.",
    standardSlugs: ["issa-service-quality"],
    osiPillar: "Engagement",
    color: "#F59E0B",
    icon: "phone",
    sortOrder: 4,
  },
  {
    slug: "partner",
    label: "Partner Channels",
    shortLabel: "Partner",
    description: "Banks, post offices, employer portals and government one-stop shops acting on behalf of the institution.",
    standardSlugs: ["wb-govtech-maturity", "issa-service-quality"],
    osiPillar: "Institutional Framework",
    color: "#EC4899",
    icon: "share-2",
    sortOrder: 5,
  },
  {
    slug: "api",
    label: "API / Integration",
    shortLabel: "API",
    description: "Open APIs and system-to-system integration with national digital ID, registries and other agencies.",
    standardSlugs: ["wb-govtech-maturity", "issa-ict"],
    osiPillar: "Technology",
    color: "#06B6D4",
    icon: "git-merge",
    sortOrder: 6,
  },
];

export type ChannelSlug = (typeof CHANNELS)[number]["slug"];

// ── Channel maturity ──────────────────────────────────────────────────────

export const CHANNEL_LEVELS = ["None", "Planned", "Partial", "Full"] as const;
export type ChannelLevel = (typeof CHANNEL_LEVELS)[number];

export const CHANNEL_LEVEL_SCORES: Record<ChannelLevel, number> = {
  None: 0,
  Planned: 30,
  Partial: 60,
  Full: 100,
};

export const CHANNEL_LEVEL_COLORS: Record<ChannelLevel, string> = {
  Full: "#10B981",
  Partial: "#F59E0B",
  Planned: "#6366F1",
  None: "#64748B",
};

// ── Status (used by Delivery channel catalog) ────────────────────────────

export const CHANNEL_STATUSES = ["Active", "Developing", "Pilot", "Planned"] as const;
export type ChannelStatus = (typeof CHANNEL_STATUSES)[number];

export const CHANNEL_STATUS_COLORS: Record<ChannelStatus, string> = {
  Active: "#10B981",
  Developing: "#3B82F6",
  Pilot: "#F59E0B",
  Planned: "#6366F1",
};

// ── Lookups ──────────────────────────────────────────────────────────────

const CHANNEL_LOOKUP = new Map<string, Channel>();
for (const c of CHANNELS) {
  CHANNEL_LOOKUP.set(c.slug, c);
  CHANNEL_LOOKUP.set(c.label.toLowerCase(), c);
  CHANNEL_LOOKUP.set(c.shortLabel.toLowerCase(), c);
  // Tolerate legacy "Mobile App" naming
  if (c.slug === "mobile") {
    CHANNEL_LOOKUP.set("mobile app", c);
    CHANNEL_LOOKUP.set("app", c);
  }
}

export function resolveChannel(value: string | null | undefined): Channel | null {
  if (!value) return null;
  return CHANNEL_LOOKUP.get(value.trim().toLowerCase()) ?? CHANNEL_LOOKUP.get(value.trim()) ?? null;
}

export function channelLevelToScore(level: string | null | undefined): number {
  if (!level) return 0;
  return CHANNEL_LEVEL_SCORES[level as ChannelLevel] ?? 0;
}
