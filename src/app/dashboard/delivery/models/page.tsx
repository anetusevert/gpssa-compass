"use client";

import { motion } from "framer-motion";
import {
  Cpu,
  Building2,
  Share2,
  Megaphone,
  Target,
  Route,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type MaturityLevel = "High" | "Medium" | "Low";

interface DeliveryModel {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  covers: string[];
  targets: string[];
  maturity: MaturityLevel;
  enablers: string[];
}

const MODELS: DeliveryModel[] = [
  {
    id: "direct-digital",
    title: "Direct Digital",
    icon: Cpu,
    description:
      "Primary channel for tech-savvy segments—straight-through digital journeys with minimal assisted handoffs.",
    covers: ["Portal", "Mobile app", "API"],
    targets: ["Employers", "Young insureds", "GCC nationals"],
    maturity: "Medium",
    enablers: [
      "eKYC and reusable identity",
      "Qualified digital signature",
      "SingPass-style federated integrations",
    ],
  },
  {
    id: "in-person",
    title: "In-Person Assisted",
    icon: Building2,
    description:
      "Service center model for complex cases, guardianship, and populations that prefer human reassurance.",
    covers: ["Service centers", "Appointment system"],
    targets: ["Beneficiaries", "Guardians", "Elderly users"],
    maturity: "High",
    enablers: [
      "Appointment booking and queue fairness",
      "Case management and CRM hooks",
      "High-quality document scanning and archival",
    ],
  },
  {
    id: "partnership",
    title: "Partnership Ecosystem",
    icon: Share2,
    description:
      "Leverage third-party networks to embed pensions and OH into employer, government, and financial journeys.",
    covers: ["Banking partners", "MOHRE", "ICP", "Employer HR systems"],
    targets: ["Expats", "Informal workers", "Domestic workers"],
    maturity: "Low",
    enablers: [
      "Published API framework",
      "Data sharing agreements and consent",
      "Partner onboarding and monitoring",
    ],
  },
  {
    id: "outreach",
    title: "Outreach & Awareness",
    icon: Megaphone,
    description:
      "Proactive engagement that finds uncovered segments and converts intent into enrollment and contribution continuity.",
    covers: [
      "Social media",
      "Financial literacy campaigns",
      "Community events",
      "Employer workshops",
    ],
    targets: ["Self-employed", "Informal workers", "Gig workers"],
    maturity: "Low",
    enablers: [
      "CRM with segment orchestration",
      "Content management for localized narratives",
      "Campaign analytics and attribution",
    ],
  },
];

function maturityBadge(level: MaturityLevel): "green" | "gold" | "gray" {
  if (level === "High") return "green";
  if (level === "Medium") return "gold";
  return "gray";
}

function maturityWidth(level: MaturityLevel): string {
  if (level === "High") return "85%";
  if (level === "Medium") return "55%";
  return "30%";
}

export default function DeliveryModelsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Delivery Models"
        badge={{ label: "GTM frameworks", variant: "blue" }}
        description="Go-to-market and delivery model patterns that combine channels, partners, and outreach—so strategy, operations, and technology investments line up behind coherent customer journeys."
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {MODELS.map((model, index) => {
          const Icon = model.icon;
          return (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07, duration: 0.35 }}
            >
              <Card
                variant="glass"
                padding="lg"
                hover
                className="relative overflow-hidden border border-white/5"
              >
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />
                <div className="relative flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <Icon className="text-teal-400" size={22} />
                    </div>
                    <div>
                      <h2 className="font-playfair text-xl font-semibold text-cream">
                        {model.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant={maturityBadge(model.maturity)} size="sm" dot>
                          Maturity · {model.maturity}
                        </Badge>
                        <Badge variant="gray" size="sm">
                          Knowledge card
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Sparkles className="text-gold/70 shrink-0" size={18} />
                </div>

                <p className="text-sm text-gray-muted leading-relaxed mb-5">
                  {model.description}
                </p>

                <div className="mb-5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-gray-muted mb-1.5">
                    <span>Relative maturity</span>
                    <span className="text-cream">{model.maturity}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-adl-blue via-teal-400 to-gpssa-green"
                      initial={{ width: 0 }}
                      animate={{ width: maturityWidth(model.maturity) }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Route size={14} className="text-teal-400" />
                      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-cream">
                        Channel mix
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {model.covers.map((item) => (
                        <Badge key={item} variant="blue" size="sm">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={14} className="text-gold" />
                      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-cream">
                        Target segments
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {model.targets.map((t) => (
                        <Badge key={t} variant="gold" size="sm">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gpssa-green mb-2">
                    Key enablers
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-muted">
                    {model.enablers.map((e) => (
                      <li key={e} className="flex gap-2">
                        <span className="text-teal-400 mt-0.5">▹</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
