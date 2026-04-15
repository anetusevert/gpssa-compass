"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Layers3,
  Sparkles,
  Shield,
  Briefcase,
  Scale,
  Globe2,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CountrySelector } from "@/components/comparison/CountrySelector";
import { ComparisonBanner } from "@/components/comparison/ComparisonBanner";
import { COUNTRIES } from "@/lib/countries/catalog";

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

interface IntlProduct {
  id: string;
  countryIso3: string;
  name: string;
  tier: string;
  status: string;
  description: string | null;
  targetSegments: string | null;
  coverageType: string | null;
  keyFeatures: string | null;
  regulatoryBasis: string | null;
  iloAlignment: string | null;
  institution: { name: string; shortName: string | null; country: string } | null;
}

function parseJsonField<T>(val: unknown): T | null {
  if (val == null) return null;
  if (Array.isArray(val)) return val as T;
  if (typeof val === "string") { try { return JSON.parse(val) as T; } catch { return null; } }
  return val as T;
}

const STATIC_PRODUCTS: Product[] = [
  { id: "p-core-1", name: "Retirement / Pension Coverage", description: "Mandatory defined-benefit pension for UAE nationals with coordinated employer and employee contributions toward long-term retirement security.", tier: "Core", status: "Active", targetSegments: ["UAE nationals", "Formal employment", "Public & private sector"], coverageType: "Mandatory social insurance (DB)", keyFeatures: ["Actuarially governed benefit accrual", "Employer + employee contribution schedules", "Service credit purchase and merge pathways"] },
  { id: "p-core-2", name: "Occupational Hazard Insurance", description: "Workplace injury, occupational disability, and death-in-service coverage aligned with employer obligations and medical evidence workflows.", tier: "Core", status: "Active", targetSegments: ["Insured employees", "Employers", "High-risk sectors"], coverageType: "Mandatory hazard indemnity", keyFeatures: ["Claims adjudication with medical review", "Disability grading and rehabilitation linkage", "Survivor benefits coordination"] },
  { id: "p-core-3", name: "Unemployment Insurance (DEWS)", description: "Dubai Establishment Workers Savings and related end-of-service benefit constructs that smooth income shocks and protect accrued entitlements.", tier: "Core", status: "Active", targetSegments: ["Private sector workers", "Eligible establishments", "DEWS participants"], coverageType: "Savings + unemployment support", keyFeatures: ["Employer-funded savings accumulation", "End-of-service benefit portability", "Compliance monitoring for covered entities"] },
  { id: "p-comp-1", name: "Placement Services", description: "Job matching, employability screening, and career counseling for beneficiaries transitioning from benefits back into productive employment.", tier: "Complementary", status: "Active", targetSegments: ["Unemployed beneficiaries", "Career changers", "Youth entrants"], coverageType: "Active labor market program", keyFeatures: ["Employer vacancy integration", "Skills profiling and coaching", "Outcome tracking with benefit milestones"] },
  { id: "p-comp-2", name: "Rehabilitation Programs", description: "Vocational rehabilitation and return-to-work support for insured persons recovering from injury or chronic conditions affecting capacity.", tier: "Complementary", status: "Pilot", targetSegments: ["Injured workers", "Partial disability cohorts", "Long-term sick"], coverageType: "Rehabilitation & reintegration", keyFeatures: ["Clinical + vocational pathway design", "Graduated return-to-duty plans", "Employer liaison for reasonable adjustments"] },
  { id: "p-comp-3", name: "Stay-at-Home Support", description: "Targeted coverage concepts for non-working spouses and caregivers who underpin household stability but sit outside classic contribution records.", tier: "Complementary", status: "Planned", targetSegments: ["Non-working spouses", "Primary caregivers", "Household dependents"], coverageType: "Household resilience (design)", keyFeatures: ["Household means testing (framework)", "Caregiver stipend pilots", "Link to survivor and family benefits"] },
  { id: "p-nc-1", name: "Old-Age Healthcare", description: "Supplementary healthcare arrangements aimed at closing post-retirement medical cost gaps beyond core pension cash benefits.", tier: "Non-Core", status: "Pilot", targetSegments: ["Retirees", "Early retirees", "High medical need cohorts"], coverageType: "Supplementary health financing", keyFeatures: ["Retiree health wallet concepts", "Preferred provider panels", "Chronic disease management bundles"] },
  { id: "p-nc-2", name: "Savings & Investment Products", description: "Voluntary additional retirement savings vehicles that layer on top of mandatory DB accruals for members seeking higher replacement rates.", tier: "Non-Core", status: "Active", targetSegments: ["Higher earners", "Mid-career planners", "Self-directed savers"], coverageType: "Voluntary defined contribution", keyFeatures: ["Flexible contribution schedules", "Investment choice within guardrails", "Tax-advantaged treatment where applicable"] },
  { id: "p-nc-3", name: "Credit & Debt Counseling", description: "Financial wellness programs that help members avoid liquidity crises that can erode contribution continuity and retirement outcomes.", tier: "Non-Core", status: "Concept", targetSegments: ["Financially stressed members", "Young families", "Debt-distressed cohorts"], coverageType: "Financial wellness (non-insurance)", keyFeatures: ["Confidential counseling intake", "Restructuring guidance with licensed partners", "Early warning signals from contribution patterns"] },
  { id: "p-nc-4", name: "Financial Literacy Programs", description: "Education and awareness campaigns that build understanding of pension rights, contribution mechanics, and long-horizon planning.", tier: "Non-Core", status: "Active", targetSegments: ["Students", "New labor market entrants", "Low-literacy segments"], coverageType: "Awareness & education", keyFeatures: ["Modular learning paths", "Employer co-branded sessions", "Digital micro-learning and gamified quizzes"] },
];

const statusBadge: Record<ProductStatus, { variant: "green" | "gold" | "blue" | "gray" }> = {
  Active: { variant: "green" }, Pilot: { variant: "gold" }, Planned: { variant: "blue" }, Concept: { variant: "gray" },
};

const tierOrder: ProductTier[] = ["Core", "Complementary", "Non-Core"];

const tierMeta: Record<ProductTier, { subtitle: string; accent: string; border: string }> = {
  Core: { subtitle: "Mandatory social insurance backbone", accent: "text-gold", border: "border-gold/25" },
  Complementary: { subtitle: "Labor market & household resilience", accent: "text-gpssa-green", border: "border-gpssa-green/25" },
  "Non-Core": { subtitle: "Voluntary, wellness, and enrichment", accent: "text-adl-blue", border: "border-adl-blue/25" },
};

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const } } };

function IntlProductCard({ product }: { product: IntlProduct }) {
  const country = COUNTRIES.find((c) => c.iso3 === product.countryIso3);
  const segments = parseJsonField<string[]>(product.targetSegments) ?? [];
  const sb = statusBadge[(product.status as ProductStatus) ?? "Active"] ?? statusBadge.Active;

  return (
    <Card variant="glass" padding="md" className="h-full border border-white/[0.06]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{country?.flag}</span>
          <span className="text-[10px] text-gray-muted">{country?.name}</span>
        </div>
        <Badge variant={sb.variant} size="sm">{product.status}</Badge>
      </div>
      <h3 className="font-playfair text-base font-semibold text-cream leading-snug mb-1">{product.name}</h3>
      {product.description && <p className="text-xs text-gray-muted mb-2 line-clamp-2">{product.description}</p>}
      {product.coverageType && (
        <p className="text-xs text-cream/80 mb-2 flex items-start gap-1.5"><Briefcase size={12} className="text-gold shrink-0 mt-0.5" />{product.coverageType}</p>
      )}
      {segments.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {segments.slice(0, 3).map((seg) => <Badge key={seg} variant="blue" size="sm">{seg}</Badge>)}
        </div>
      )}
      {product.iloAlignment && (
        <div className="flex items-center gap-1 text-[10px] text-gold mt-1">
          <Scale size={10} /><span>{product.iloAlignment}</span>
        </div>
      )}
      {product.institution && (
        <p className="text-[10px] text-gray-muted mt-1">via {product.institution.shortName ?? product.institution.name}</p>
      )}
    </Card>
  );
}

export default function ProductPortfolioPage() {
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [intlProducts, setIntlProducts] = useState<IntlProduct[]>([]);
  const [comparisonCountries, setComparisonCountries] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data.map((d: Record<string, unknown>) => ({
            id: String(d.id), name: String(d.name), description: String(d.description ?? ""),
            tier: String(d.tier ?? "Core") as ProductTier, status: String(d.status ?? "Active") as ProductStatus,
            targetSegments: Array.isArray(d.targetSegments) ? d.targetSegments.map(String) : parseJsonField<string[]>(d.targetSegments) ?? [],
            coverageType: String(d.coverageType ?? ""),
            keyFeatures: Array.isArray(d.keyFeatures) ? d.keyFeatures.map(String) : parseJsonField<string[]>(d.keyFeatures) ?? [],
          })));
        }
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (comparisonCountries.length === 0) { setIntlProducts([]); return; }
    const params = new URLSearchParams({ countries: comparisonCountries.join(",") });
    fetch(`/api/international/products?${params}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (Array.isArray(data)) setIntlProducts(data); })
      .catch(() => setIntlProducts([]));
  }, [comparisonCountries]);

  const intlByCountryTier = useMemo(() => {
    const map = new Map<string, Map<string, IntlProduct[]>>();
    for (const p of intlProducts) {
      if (!map.has(p.countryIso3)) map.set(p.countryIso3, new Map());
      const tierMap = map.get(p.countryIso3)!;
      const list = tierMap.get(p.tier) ?? [];
      list.push(p);
      tierMap.set(p.tier, list);
    }
    return map;
  }, [intlProducts]);

  const gapProducts = useMemo(() => {
    if (intlProducts.length === 0) return [];
    const gpssaNames = new Set(products.map((p) => p.name.toLowerCase()));
    const seen = new Set<string>();
    return intlProducts.filter((p) => {
      const key = `${p.countryIso3}:${p.name.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return !gpssaNames.has(p.name.toLowerCase()) && !Array.from(gpssaNames).some((n) => p.name.toLowerCase().includes(n.split(" ")[0]) || n.includes(p.name.toLowerCase().split(" ")[0]));
    }).slice(0, 12);
  }, [products, intlProducts]);

  const activeCount = products.filter((p) => p.status === "Active").length;
  const pilotCount = products.filter((p) => p.status === "Pilot").length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 p-6 md:p-8 pb-12">
      <motion.div variants={fadeUp}>
        <PageHeader title="Product Portfolio" description="GPSSA social insurance products with global comparison against leading institutions." badge={{ label: "Products pillar", variant: "gold" }} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="GPSSA Products" value={products.length} trend="neutral" />
        <StatCard icon={Shield} label="Active offerings" value={activeCount} trend="up" change="Core stable" />
        <StatCard icon={Sparkles} label="In pilot" value={pilotCount} trend="neutral" />
        <StatCard icon={Layers3} label="Bain tiers" value={3} trend="neutral" change="Core · Comp · NC" />
      </motion.div>

      <motion.div variants={fadeUp}>
        <CountrySelector selected={comparisonCountries} onChange={setComparisonCountries} pillar="products" />
      </motion.div>

      <AnimatePresence>
        {comparisonCountries.length > 0 && <ComparisonBanner selectedCountries={comparisonCountries} />}
      </AnimatePresence>

      {tierOrder.map((tier) => {
        const items = products.filter((p) => p.tier === tier);
        const meta = tierMeta[tier];
        return (
          <motion.section key={tier} variants={fadeUp} className="space-y-4">
            <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b ${meta.border} pb-3`}>
              <div>
                <h2 className={`font-playfair text-xl font-semibold text-cream ${meta.accent}`}>🇦🇪 {tier} Products</h2>
                <p className="text-sm text-gray-muted mt-0.5">{meta.subtitle}</p>
              </div>
              <Badge variant="gold" size="sm" dot>{items.length} {items.length === 1 ? "product" : "products"}</Badge>
            </div>
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((product) => {
                const sb = statusBadge[product.status];
                return (
                  <motion.div key={product.id} variants={fadeUp}>
                    <Card variant="glass" hover padding="md" className="h-full border border-white/[0.06]">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-playfair text-lg font-semibold text-cream leading-snug">{product.name}</h3>
                        <Badge variant={sb.variant} size="sm">{product.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-muted mb-3">{product.description}</p>
                      <p className="text-xs uppercase tracking-wide text-gray-muted mb-1.5">Coverage type</p>
                      <p className="text-sm text-cream/90 mb-3 flex items-start gap-2"><Briefcase size={14} className="text-gold shrink-0 mt-0.5" />{product.coverageType}</p>
                      <p className="text-xs uppercase tracking-wide text-gray-muted mb-1.5">Target segments</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {product.targetSegments.map((seg) => <Badge key={seg} variant="blue" size="sm">{seg}</Badge>)}
                      </div>
                      <p className="text-xs uppercase tracking-wide text-gray-muted mb-1.5">Key features</p>
                      <ul className="text-sm text-gray-muted space-y-1.5 list-disc list-inside marker:text-gpssa-green">
                        {product.keyFeatures.map((f) => <li key={f}>{f}</li>)}
                      </ul>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* International comparison for this tier */}
            {comparisonCountries.length > 0 && (
              <div className="space-y-4">
                {Array.from(intlByCountryTier.entries()).map(([iso3, tierMap]) => {
                  const tierProducts = tierMap.get(tier) ?? [];
                  if (tierProducts.length === 0) return null;
                  const country = COUNTRIES.find((c) => c.iso3 === iso3);
                  return (
                    <div key={iso3}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-gpssa-green/20 to-transparent" />
                        <span className="text-[10px] text-gray-muted uppercase tracking-wide">{country?.flag} {country?.name} · {tier}</span>
                        <div className="h-px flex-1 bg-gradient-to-l from-gpssa-green/20 to-transparent" />
                      </div>
                      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {tierProducts.map((p) => <IntlProductCard key={p.id} product={p} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.section>
        );
      })}

      {/* Gap analysis */}
      {gapProducts.length > 0 && (
        <motion.section variants={fadeUp} className="space-y-4">
          <div className="flex items-center gap-2 border-b border-red-500/20 pb-3">
            <AlertCircle size={16} className="text-red-400" />
            <h2 className="font-playfair text-xl font-semibold text-cream">Gap Analysis</h2>
            <span className="text-xs text-gray-muted ml-2">Products offered internationally but not by GPSSA</span>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {gapProducts.map((p) => <IntlProductCard key={p.id} product={p} />)}
          </div>
        </motion.section>
      )}

      {comparisonCountries.length > 0 && intlProducts.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center">
          <Globe2 size={32} className="mx-auto text-gray-muted mb-3" />
          <p className="text-sm text-cream mb-1">No international product data available yet</p>
          <p className="text-xs text-gray-muted">Run the International Products Research Agent from Admin → Agents to populate comparison data.</p>
        </div>
      )}
    </motion.div>
  );
}
