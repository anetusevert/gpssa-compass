"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Layers3,
  Sparkles,
  Shield,
  Briefcase,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type ProductTier = "Core" | "Complementary" | "Non-Core";
type ProductStatus = "Active" | "Pilot" | "Planned" | "Concept";

interface Product {
  id: string;
  name: string;
  description: string;
  tier: ProductTier;
  status: ProductStatus;
  targetSegments: string[];
  coverageType: string;
  keyFeatures: string[];
}

const STATIC_PRODUCTS: Product[] = [
  {
    id: "p-core-1",
    name: "Retirement / Pension Coverage",
    description:
      "Mandatory defined-benefit pension for UAE nationals with coordinated employer and employee contributions toward long-term retirement security.",
    tier: "Core",
    status: "Active",
    targetSegments: ["UAE nationals", "Formal employment", "Public & private sector"],
    coverageType: "Mandatory social insurance (DB)",
    keyFeatures: [
      "Actuarially governed benefit accrual",
      "Employer + employee contribution schedules",
      "Service credit purchase and merge pathways",
    ],
  },
  {
    id: "p-core-2",
    name: "Occupational Hazard Insurance",
    description:
      "Workplace injury, occupational disability, and death-in-service coverage aligned with employer obligations and medical evidence workflows.",
    tier: "Core",
    status: "Active",
    targetSegments: ["Insured employees", "Employers", "High-risk sectors"],
    coverageType: "Mandatory hazard indemnity",
    keyFeatures: [
      "Claims adjudication with medical review",
      "Disability grading and rehabilitation linkage",
      "Survivor benefits coordination",
    ],
  },
  {
    id: "p-core-3",
    name: "Unemployment Insurance (DEWS)",
    description:
      "Dubai Establishment Workers Savings and related end-of-service benefit constructs that smooth income shocks and protect accrued entitlements.",
    tier: "Core",
    status: "Active",
    targetSegments: ["Private sector workers", "Eligible establishments", "DEWS participants"],
    coverageType: "Savings + unemployment support",
    keyFeatures: [
      "Employer-funded savings accumulation",
      "End-of-service benefit portability",
      "Compliance monitoring for covered entities",
    ],
  },
  {
    id: "p-comp-1",
    name: "Placement Services",
    description:
      "Job matching, employability screening, and career counseling for beneficiaries transitioning from benefits back into productive employment.",
    tier: "Complementary",
    status: "Active",
    targetSegments: ["Unemployed beneficiaries", "Career changers", "Youth entrants"],
    coverageType: "Active labor market program",
    keyFeatures: [
      "Employer vacancy integration",
      "Skills profiling and coaching",
      "Outcome tracking with benefit milestones",
    ],
  },
  {
    id: "p-comp-2",
    name: "Rehabilitation Programs",
    description:
      "Vocational rehabilitation and return-to-work support for insured persons recovering from injury or chronic conditions affecting capacity.",
    tier: "Complementary",
    status: "Pilot",
    targetSegments: ["Injured workers", "Partial disability cohorts", "Long-term sick"],
    coverageType: "Rehabilitation & reintegration",
    keyFeatures: [
      "Clinical + vocational pathway design",
      "Graduated return-to-duty plans",
      "Employer liaison for reasonable adjustments",
    ],
  },
  {
    id: "p-comp-3",
    name: "Stay-at-Home Support",
    description:
      "Targeted coverage concepts for non-working spouses and caregivers who underpin household stability but sit outside classic contribution records.",
    tier: "Complementary",
    status: "Planned",
    targetSegments: ["Non-working spouses", "Primary caregivers", "Household dependents"],
    coverageType: "Household resilience (design)",
    keyFeatures: [
      "Household means testing (framework)",
      "Caregiver stipend pilots",
      "Link to survivor and family benefits",
    ],
  },
  {
    id: "p-nc-1",
    name: "Old-Age Healthcare",
    description:
      "Supplementary healthcare arrangements aimed at closing post-retirement medical cost gaps beyond core pension cash benefits.",
    tier: "Non-Core",
    status: "Pilot",
    targetSegments: ["Retirees", "Early retirees", "High medical need cohorts"],
    coverageType: "Supplementary health financing",
    keyFeatures: [
      "Retiree health wallet concepts",
      "Preferred provider panels",
      "Chronic disease management bundles",
    ],
  },
  {
    id: "p-nc-2",
    name: "Savings & Investment Products",
    description:
      "Voluntary additional retirement savings vehicles that layer on top of mandatory DB accruals for members seeking higher replacement rates.",
    tier: "Non-Core",
    status: "Active",
    targetSegments: ["Higher earners", "Mid-career planners", "Self-directed savers"],
    coverageType: "Voluntary defined contribution",
    keyFeatures: [
      "Flexible contribution schedules",
      "Investment choice within guardrails",
      "Tax-advantaged treatment where applicable",
    ],
  },
  {
    id: "p-nc-3",
    name: "Credit & Debt Counseling",
    description:
      "Financial wellness programs that help members avoid liquidity crises that can erode contribution continuity and retirement outcomes.",
    tier: "Non-Core",
    status: "Concept",
    targetSegments: ["Financially stressed members", "Young families", "Debt-distressed cohorts"],
    coverageType: "Financial wellness (non-insurance)",
    keyFeatures: [
      "Confidential counseling intake",
      "Restructuring guidance with licensed partners",
      "Early warning signals from contribution patterns",
    ],
  },
  {
    id: "p-nc-4",
    name: "Financial Literacy Programs",
    description:
      "Education and awareness campaigns that build understanding of pension rights, contribution mechanics, and long-horizon planning.",
    tier: "Non-Core",
    status: "Active",
    targetSegments: ["Students", "New labor market entrants", "Low-literacy segments"],
    coverageType: "Awareness & education",
    keyFeatures: [
      "Modular learning paths",
      "Employer co-branded sessions",
      "Digital micro-learning and gamified quizzes",
    ],
  },
];

const statusBadge: Record<
  ProductStatus,
  { variant: "green" | "gold" | "blue" | "gray" }
> = {
  Active: { variant: "green" },
  Pilot: { variant: "gold" },
  Planned: { variant: "blue" },
  Concept: { variant: "gray" },
};

const tierOrder: ProductTier[] = ["Core", "Complementary", "Non-Core"];

const tierMeta: Record<
  ProductTier,
  { subtitle: string; accent: string; border: string }
> = {
  Core: {
    subtitle: "Mandatory social insurance backbone",
    accent: "text-gold",
    border: "border-gold/25",
  },
  Complementary: {
    subtitle: "Labor market & household resilience",
    accent: "text-gpssa-green",
    border: "border-gpssa-green/25",
  },
  "Non-Core": {
    subtitle: "Voluntary, wellness, and enrichment",
    accent: "text-adl-blue",
    border: "border-adl-blue/25",
  },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function ProductPortfolioPage() {
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data.map((d: Record<string, unknown>) => ({
            id: String(d.id),
            name: String(d.name),
            description: String(d.description ?? ""),
            tier: String(d.tier ?? "Core") as ProductTier,
            status: String(d.status ?? "Active") as ProductStatus,
            targetSegments: Array.isArray(d.targetSegments) ? d.targetSegments.map(String) : [],
            coverageType: String(d.coverageType ?? ""),
            keyFeatures: Array.isArray(d.keyFeatures) ? d.keyFeatures.map(String) : [],
          })));
        }
      })
      .catch(() => {});
  }, []);

  const activeCount = products.filter((p) => p.status === "Active").length;
  const pilotCount = products.filter((p) => p.status === "Pilot").length;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8 p-6 md:p-8 pb-12"
    >
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Product Portfolio"
          description="GPSSA social insurance and pension products organized using the Bain core / complementary / non-core framework for portfolio governance."
          badge={{ label: "Products pillar", variant: "gold" }}
        />
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={Package}
          label="Products in portfolio"
          value={products.length}
          trend="neutral"
          change="+2 YoY"
        />
        <StatCard
          icon={Shield}
          label="Active offerings"
          value={activeCount}
          trend="up"
          change="Core stable"
        />
        <StatCard
          icon={Sparkles}
          label="In pilot"
          value={pilotCount}
          trend="neutral"
        />
        <StatCard
          icon={Layers3}
          label="Bain tiers"
          value={3}
          trend="neutral"
          change="Core · Comp · NC"
        />
      </motion.div>

      {tierOrder.map((tier) => {
        const items = products.filter((p) => p.tier === tier);
        const meta = tierMeta[tier];
        return (
          <motion.section key={tier} variants={fadeUp} className="space-y-4">
            <div
              className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b ${meta.border} pb-3`}
            >
              <div>
                <h2 className={`font-playfair text-xl font-semibold text-cream ${meta.accent}`}>
                  {tier} products
                </h2>
                <p className="text-sm text-gray-muted mt-0.5">{meta.subtitle}</p>
              </div>
              <Badge variant="gold" size="sm" dot>
                {items.length} {items.length === 1 ? "product" : "products"}
              </Badge>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {items.map((product) => {
                const sb = statusBadge[product.status];
                return (
                  <motion.div key={product.id} variants={fadeUp}>
                    <Card variant="glass" hover padding="md" className="h-full border border-white/[0.06]">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-playfair text-lg font-semibold text-cream leading-snug">
                          {product.name}
                        </h3>
                        <Badge variant={sb.variant} size="sm">
                          {product.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-muted mb-3">{product.description}</p>
                      <p className="text-xs uppercase tracking-wide text-gray-muted mb-1.5">
                        Coverage type
                      </p>
                      <p className="text-sm text-cream/90 mb-3 flex items-start gap-2">
                        <Briefcase size={14} className="text-gold shrink-0 mt-0.5" />
                        {product.coverageType}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-gray-muted mb-1.5">
                        Target segments
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {product.targetSegments.map((seg) => (
                          <Badge key={seg} variant="blue" size="sm">
                            {seg}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs uppercase tracking-wide text-gray-muted mb-1.5">
                        Key features
                      </p>
                      <ul className="text-sm text-gray-muted space-y-1.5 list-disc list-inside marker:text-gpssa-green">
                        {product.keyFeatures.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.section>
        );
      })}
    </motion.div>
  );
}
