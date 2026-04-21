/**
 * Static reference data for the GPSSA mandate.
 *
 * Both the dashboard pages under `/dashboard/mandate/*` and the executive
 * briefing slide `Slide05_UAEToday` import these constants so the storyline
 * stays in sync wherever it is shown.
 */

import {
  Briefcase,
  Building2,
  Eye,
  FileText,
  Globe2,
  Heart,
  HeartHandshake,
  HeartPulse,
  Landmark,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MandateBranch {
  id: string;
  label: string;
  pillar: string;
  ilo: string;
  description: string;
  Icon: LucideIcon;
  accent: string;
}

export const BRANCHES: MandateBranch[] = [
  {
    id: "old-age",
    label: "Old-age pension",
    pillar: "pension",
    ilo: "ILO C102 · Part V",
    description:
      "Lifetime income for insured Emiratis on reaching the legal pension age.",
    Icon: HeartPulse,
    accent: "#1B7A4A",
  },
  {
    id: "end-of-service",
    label: "End-of-service",
    pillar: "end-of-service",
    ilo: "GCC Unified Insurance Extension Law",
    description:
      "Lump-sum / pension on separation for civil and military insured persons.",
    Icon: ShieldCheck,
    accent: "#E7B02E",
  },
  {
    id: "injury",
    label: "Workplace injury",
    pillar: "injury",
    ilo: "ILO C102 · Part VI",
    description:
      "Medical care, temporary incapacity, permanent disability and rehabilitation.",
    Icon: HeartHandshake,
    accent: "#E76363",
  },
  {
    id: "death",
    label: "Survivor benefits",
    pillar: "death",
    ilo: "ILO C102 · Part X",
    description:
      "Pensions and lump-sums for the family of a deceased insured person.",
    Icon: Heart,
    accent: "#9696AA",
  },
  {
    id: "registration",
    label: "Registration & contributions",
    pillar: "registration",
    ilo: "FL 57/2023 — coverage articles",
    description:
      "Mandatory enrolment of employers and insured persons; monthly contributions.",
    Icon: Briefcase,
    accent: "#4899FF",
  },
  {
    id: "gcc",
    label: "GCC mobility",
    pillar: "gcc",
    ilo: "GCC Unified Insurance Extension",
    description:
      "Cross-border continuity of insurance for GCC nationals working in the UAE.",
    Icon: Globe2,
    accent: "#CA63D5",
  },
];

export interface MandateCoverageClass {
  id: string;
  label: string;
  note: string;
  accent: string;
}

export const COVERAGE_CLASSES: MandateCoverageClass[] = [
  {
    id: "uae-civil",
    label: "Emirati nationals — civil sector",
    note: "Federal & local government, semi-public, private sector employers",
    accent: "#1B7A4A",
  },
  {
    id: "uae-military",
    label: "Emirati nationals — military sector",
    note: "Specialised handling under sectoral regulations",
    accent: "#E7B02E",
  },
  {
    id: "gcc-nationals",
    label: "GCC nationals",
    note: "Insurance extension across the GCC unified law",
    accent: "#CA63D5",
  },
  {
    id: "voluntary",
    label: "Voluntary insurance",
    note: "Self-employed, sabbatical and overseas workers under specific articles",
    accent: "#7DB9A4",
  },
];

export interface MandateArchitectureNode {
  id: string;
  label: string;
  note: string;
  Icon: LucideIcon;
  accent: string;
}

export const ARCHITECTURE: MandateArchitectureNode[] = [
  {
    id: "council-of-ministers",
    label: "UAE Council of Ministers",
    note: "Approves federal pension legislation & regulations.",
    Icon: Landmark,
    accent: "#1B7A4A",
  },
  {
    id: "moca",
    label: "Ministry overseeing GPSSA",
    note: "Sectoral oversight and policy coordination.",
    Icon: Building2,
    accent: "#7DB9A4",
  },
  {
    id: "board",
    label: "GPSSA Board of Directors",
    note: "Strategic direction, investment policy, regulations.",
    Icon: ShieldCheck,
    accent: "#4899FF",
  },
  {
    id: "dg",
    label: "Director General",
    note: "Day-to-day administration of the mandate.",
    Icon: UserCheck,
    accent: "#C5A572",
  },
];

export interface MandateControlPillar {
  id: string;
  label: string;
  description: string;
  Icon: LucideIcon;
  accent: string;
}

export const CONTROL_PILLARS: MandateControlPillar[] = [
  {
    id: "transparency",
    label: "Transparency",
    description:
      "Publication of laws, regulations, circulars and annual reports on gpssa.gov.ae.",
    Icon: Eye,
    accent: "#4899FF",
  },
  {
    id: "audit",
    label: "Audit & supervision",
    description:
      "Internal audit, statutory external audit and parliamentary oversight.",
    Icon: ShieldCheck,
    accent: "#1B7A4A",
  },
  {
    id: "redress",
    label: "Complaints & redress",
    description:
      "Insured complaint pathways and ombudsman-style escalation.",
    Icon: FileText,
    accent: "#E7B02E",
  },
];
