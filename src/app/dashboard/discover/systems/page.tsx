"use client";

import { motion } from "framer-motion";
import {
  Monitor,
  Server,
  Smartphone,
  BarChart3,
  Link2,
  ShieldCheck,
  Brain,
  Boxes,
  Cloud,
  TabletSmartphone,
  Workflow,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SystemCategory {
  name: string;
  icon: LucideIcon;
  status: "Active" | "Legacy" | "Planned";
  description: string;
  maturityLevel: number; // 0-100
}

interface EmergingTech {
  name: string;
  icon: LucideIcon;
  category: string;
  relevanceScore: number; // 0-100
  description: string;
  potentialImpact: "High" | "Medium" | "Low";
}

interface BestPractice {
  title: string;
  institution: string;
  description: string;
  applicability: "Highly Applicable" | "Applicable" | "Exploratory";
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const systemCategories: SystemCategory[] = [
  {
    name: "Core Platform (Ma'ashi)",
    icon: Server,
    status: "Active",
    description:
      "Central pension administration system managing registrations, contributions, benefit calculations, and disbursements across all GPSSA programs.",
    maturityLevel: 72,
  },
  {
    name: "Digital Channels",
    icon: Smartphone,
    status: "Active",
    description:
      "Web portal, mobile app, and self-service kiosks providing employers, insured individuals, and beneficiaries access to GPSSA services.",
    maturityLevel: 58,
  },
  {
    name: "Data & Analytics",
    icon: BarChart3,
    status: "Planned",
    description:
      "Enterprise data warehouse, BI dashboards, and predictive analytics for actuarial modeling, fraud detection, and strategic decision-making.",
    maturityLevel: 35,
  },
  {
    name: "Integration Layer",
    icon: Link2,
    status: "Active",
    description:
      "API gateway and ESB connecting GPSSA systems with government entities (ICA, MoHRE, ADRPBF), banks, and third-party service providers.",
    maturityLevel: 65,
  },
  {
    name: "Security & Compliance",
    icon: ShieldCheck,
    status: "Active",
    description:
      "Identity management, encryption services, audit logging, and regulatory compliance modules aligned with UAE data protection standards.",
    maturityLevel: 80,
  },
];

const emergingTech: EmergingTech[] = [
  {
    name: "AI & Machine Learning",
    icon: Brain,
    category: "AI/ML",
    relevanceScore: 92,
    description:
      "Intelligent automation for claims processing, fraud detection, chatbot-assisted service, and predictive actuarial modeling.",
    potentialImpact: "High",
  },
  {
    name: "Blockchain & DLT",
    icon: Boxes,
    category: "Blockchain",
    relevanceScore: 65,
    description:
      "Distributed ledger for cross-border pension portability, secure document verification, and transparent contribution tracking.",
    potentialImpact: "Medium",
  },
  {
    name: "Cloud-Native Architecture",
    icon: Cloud,
    category: "Cloud Native",
    relevanceScore: 88,
    description:
      "Microservices, containerized deployments, and serverless computing to improve scalability, resilience, and deployment speed.",
    potentialImpact: "High",
  },
  {
    name: "Mobile-First Experience",
    icon: TabletSmartphone,
    category: "Mobile-First",
    relevanceScore: 85,
    description:
      "Progressive web apps, biometric authentication, and offline-capable mobile services for anytime, anywhere access.",
    potentialImpact: "High",
  },
  {
    name: "API Economy",
    icon: Workflow,
    category: "API Economy",
    relevanceScore: 78,
    description:
      "Open API platform enabling third-party integrations, partner ecosystems, and embedded pension services in government super-apps.",
    potentialImpact: "Medium",
  },
  {
    name: "Robotic Process Automation",
    icon: Bot,
    category: "RPA",
    relevanceScore: 74,
    description:
      "Automated data entry, document processing, and reconciliation workflows to reduce manual effort and operational errors.",
    potentialImpact: "Medium",
  },
];

const bestPractices: BestPractice[] = [
  {
    title: "Proactive Digital Pension Statements",
    institution: "APG (Netherlands)",
    description:
      "Personalized, real-time pension dashboards that proactively push retirement readiness insights to members via mobile and web channels.",
    applicability: "Highly Applicable",
  },
  {
    title: "AI-Driven Claims Adjudication",
    institution: "CPP Investments (Canada)",
    description:
      "Machine learning models that auto-adjudicate straightforward claims within minutes while flagging complex cases for human review.",
    applicability: "Highly Applicable",
  },
  {
    title: "Blockchain Pension Portability",
    institution: "EPFO (India)",
    description:
      "Distributed ledger pilot for seamless pension transfer between employers and regions, reducing processing time from months to days.",
    applicability: "Exploratory",
  },
  {
    title: "Omnichannel Service Delivery",
    institution: "GOSI (Saudi Arabia)",
    description:
      "Unified service experience across digital, physical, and contact-center channels with real-time session continuity.",
    applicability: "Highly Applicable",
  },
  {
    title: "DevOps & Continuous Delivery",
    institution: "DWP Digital (UK)",
    description:
      "Agile delivery pipelines with automated testing and weekly production releases for pension platform enhancements.",
    applicability: "Applicable",
  },
  {
    title: "Open Banking Integration",
    institution: "Keva (Finland)",
    description:
      "API-based integration with banking systems for real-time contribution collection and automated benefit disbursement.",
    applicability: "Applicable",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statusConfig: Record<
  SystemCategory["status"],
  { variant: "green" | "blue" | "gold"; icon: LucideIcon }
> = {
  Active: { variant: "green", icon: CheckCircle2 },
  Legacy: { variant: "gold", icon: AlertTriangle },
  Planned: { variant: "blue", icon: Clock },
};

const impactColor: Record<EmergingTech["potentialImpact"], string> = {
  High: "text-gpssa-green",
  Medium: "text-gold",
  Low: "text-gray-muted",
};

const applicabilityVariant: Record<
  BestPractice["applicability"],
  "green" | "blue" | "gold"
> = {
  "Highly Applicable": "green",
  Applicable: "blue",
  Exploratory: "gold",
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function MaturityBar({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gpssa-green/80 to-gpssa-green"
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </div>
      <span className="text-xs text-gray-muted tabular-nums w-8 text-right">{level}%</span>
    </div>
  );
}

function RelevanceRing({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
        <motion.circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="var(--gpssa-green)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-cream">
        {score}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SystemsPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Systems & Delivery Intelligence"
        description="Technology landscape and digital delivery best practices"
        badge={{ label: "Tech", variant: "blue" }}
      />

      {/* ── Technology Landscape ─────────────────────────────────────── */}
      <motion.section variants={stagger} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-5">
          <Monitor size={18} className="text-gpssa-green" />
          <h2 className="font-playfair text-lg font-semibold text-cream">
            Technology Landscape
          </h2>
        </div>

        <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger}>
          {systemCategories.map((sys) => {
            const cfg = statusConfig[sys.status];
            const StatusIcon = cfg.icon;
            const SysIcon = sys.icon;
            return (
              <motion.div key={sys.name} variants={fadeUp}>
                <Card hover className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-white/5">
                      <SysIcon size={20} className="text-gray-muted" />
                    </div>
                    <Badge variant={cfg.variant} size="sm" dot>
                      {sys.status}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-cream mb-1">{sys.name}</h3>
                  <p className="text-xs text-gray-muted leading-relaxed flex-1 mb-4">
                    {sys.description}
                  </p>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-muted mb-1.5">
                      Maturity Level
                    </p>
                    <MaturityBar level={sys.maturityLevel} />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* ── Innovation Radar ─────────────────────────────────────────── */}
      <motion.section variants={stagger} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-5">
          <Gauge size={18} className="text-gpssa-green" />
          <h2 className="font-playfair text-lg font-semibold text-cream">
            Innovation Radar
          </h2>
        </div>

        <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger}>
          {emergingTech.map((tech) => {
            const TechIcon = tech.icon;
            return (
              <motion.div key={tech.name} variants={fadeUp}>
                <Card hover className="h-full flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <RelevanceRing score={tech.relevanceScore} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-cream truncate">
                        {tech.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="gray" size="sm">
                          {tech.category}
                        </Badge>
                        <span className={`text-[10px] font-medium ${impactColor[tech.potentialImpact]}`}>
                          {tech.potentialImpact} Impact
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-muted leading-relaxed flex-1">
                    {tech.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* ── Digital Delivery Best Practices ───────────────────────────── */}
      <motion.section variants={stagger} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-5">
          <ExternalLink size={18} className="text-gpssa-green" />
          <h2 className="font-playfair text-lg font-semibold text-cream">
            Digital Delivery Best Practices
          </h2>
        </div>

        <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger}>
          {bestPractices.map((bp) => (
            <motion.div key={bp.title} variants={fadeUp}>
              <Card hover className="h-full flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-cream">{bp.title}</h3>
                  <Badge variant={applicabilityVariant[bp.applicability]} size="sm">
                    {bp.applicability}
                  </Badge>
                </div>
                <p className="text-[11px] font-medium text-gpssa-green mb-2">
                  {bp.institution}
                </p>
                <p className="text-xs text-gray-muted leading-relaxed flex-1">
                  {bp.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
}
