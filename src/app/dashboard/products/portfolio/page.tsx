"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  Search,
  List,
  BarChart3,
  Radar,
  ArrowLeftRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CountrySelector } from "@/components/comparison/CountrySelector";
import { StatBar, type StatBarItem } from "@/components/ui/StatBar";
import { COUNTRIES } from "@/lib/countries/catalog";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { useResearchUpdates } from "@/lib/hooks/useResearchUpdates";
import { StandardChips } from "@/components/comparator/StandardChips";
import { resolveProductTier } from "@/lib/taxonomy/products";
import { MandateBasisChip } from "@/components/mandate/MandateBasisChip";

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */
type ProductTier = "Core" | "Complementary" | "Non-Core";
type ProductStatus = "Active" | "Pilot" | "Planned" | "Concept";
type VizMode = "list" | "bar" | "radar";

interface Product {
  id: string;
  name: string;
  description: string;
  tier: ProductTier;
  status: ProductStatus;
  targetSegments: string[];
  coverageType: string;
  keyFeatures: string[];
  regulatoryBasis: string | null;
  comparableInternational: string | null;
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

/* ═══════════════════════════════════════════════════════════════════════════
   Static seed data
   ═══════════════════════════════════════════════════════════════════════════ */
const STATIC_EXTRAS: Pick<Product, "regulatoryBasis" | "comparableInternational"> = {
  regulatoryBasis: null,
  comparableInternational: null,
};

const STATIC_PRODUCTS: Product[] = ([
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
] as Omit<Product, "regulatoryBasis" | "comparableInternational">[]).map((p) => ({ ...STATIC_EXTRAS, ...p }));

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */
const TIERS: ProductTier[] = ["Core", "Complementary", "Non-Core"];

const tierConfig: Record<ProductTier, { icon: typeof Shield; accent: string; bg: string; border: string; glow: string; subtitle: string }> = {
  Core:          { icon: Shield,    accent: "border-gold/40",          bg: "bg-gold/[0.08]",          border: "border-gold/25", glow: "shadow-gold/20",          subtitle: "Mandatory social insurance backbone" },
  Complementary: { icon: Sparkles,  accent: "border-gpssa-green/40",   bg: "bg-gpssa-green/[0.08]",   border: "border-gpssa-green/25", glow: "shadow-gpssa-green/20",   subtitle: "Labor market & household resilience" },
  "Non-Core":    { icon: Layers3,   accent: "border-adl-blue/40",      bg: "bg-adl-blue/[0.08]",      border: "border-adl-blue/25", glow: "shadow-adl-blue/20",      subtitle: "Voluntary, wellness & enrichment" },
};

const statusBadge: Record<ProductStatus, { variant: "green" | "gold" | "blue" | "gray" }> = {
  Active: { variant: "green" }, Pilot: { variant: "gold" }, Planned: { variant: "blue" }, Concept: { variant: "gray" },
};

const COUNTRY_COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function TierTile({ tier, count, isActive, onClick }: { tier: ProductTier; count: number; isActive: boolean; onClick: () => void }) {
  const cfg = tierConfig[tier];
  const Icon = cfg.icon;
  const canonical = resolveProductTier(tier);
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex flex-col items-start p-4 rounded-xl border backdrop-blur-sm transition-all text-left w-full ${
        isActive
          ? `${cfg.bg} ${cfg.accent} border-2 shadow-lg ${cfg.glow}`
          : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.14]"
      }`}
    >
      <div className={`p-2 rounded-lg mb-2.5 ${isActive ? cfg.bg : "bg-white/[0.05]"}`}>
        <Icon size={16} className={isActive ? "text-cream" : "text-gray-muted"} />
      </div>
      <span className={`text-xs font-semibold leading-tight ${isActive ? "text-cream" : "text-cream/80"}`}>{tier}</span>
      <span className="text-[10px] text-gray-muted mt-0.5">{cfg.subtitle}</span>
      <span className="text-[10px] text-gray-muted mt-1">{count} product{count !== 1 ? "s" : ""}</span>
      {canonical && (
        <>
          <p className="text-[9px] text-gray-muted/70 mt-1.5 leading-tight italic line-clamp-1">{canonical.iloPillar}</p>
          <div className="mt-1.5">
            <StandardChips slugs={canonical.standardSlugs} size="xs" max={3} />
          </div>
        </>
      )}
      {isActive && (
        <motion.div
          layoutId="tierIndicator"
          className={`absolute -right-px top-3 bottom-3 w-[3px] rounded-full ${cfg.bg.replace("/[0.08]", "")}`}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
    </motion.button>
  );
}

function ComparisonTierRow({
  tier, gpssaCount, intlCounts, maxCount, isActive, onClick,
}: {
  tier: ProductTier; gpssaCount: number; intlCounts: { iso3: string; count: number; color: string }[];
  maxCount: number; isActive: boolean; onClick: () => void;
}) {
  const cfg = tierConfig[tier];
  const Icon = cfg.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-lg transition-all text-left ${
        isActive
          ? `${cfg.bg} border border-l-2 ${cfg.accent}`
          : "hover:bg-white/[0.04] border border-transparent"
      }`}
    >
      <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? cfg.bg : "bg-white/[0.04]"}`}>
        <Icon size={13} className={isActive ? "text-cream" : "text-gray-muted"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-medium ${isActive ? "text-cream" : "text-cream/70"}`}>{tier}</p>
        <p className="text-[9px] text-gray-muted mt-0.5">{cfg.subtitle}</p>
        <div className="flex items-center gap-1 mt-1.5 h-2">
          <div className="flex-1 flex gap-px h-full rounded-sm overflow-hidden bg-white/[0.04]">
            <motion.div
              className="h-full bg-gpssa-green/70 rounded-l-sm"
              initial={{ width: 0 }}
              animate={{ width: maxCount > 0 ? `${(gpssaCount / maxCount) * 100}%` : "0%" }}
              transition={{ duration: 0.4 }}
            />
            {intlCounts.map((ic) => (
              <motion.div
                key={ic.iso3}
                className="h-full"
                style={{ backgroundColor: ic.color + "99" }}
                initial={{ width: 0 }}
                animate={{ width: maxCount > 0 ? `${(ic.count / maxCount) * 100}%` : "0%" }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
            ))}
          </div>
          <span className="text-[9px] text-gray-muted tabular-nums w-4 text-right">{gpssaCount}</span>
        </div>
      </div>
    </button>
  );
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const sb = statusBadge[product.status];
  const canonical = resolveProductTier(product.tier);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-xs font-semibold text-cream group-hover:text-white leading-snug">{product.name}</h3>
        <Badge variant={sb.variant} size="sm">{product.status}</Badge>
      </div>
      {product.description && <p className="text-[10px] text-gray-muted leading-relaxed mb-2.5 line-clamp-2">{product.description}</p>}
      <div className="flex items-center gap-1 text-[10px] text-cream/70 mb-2">
        <Briefcase size={10} className="text-gold shrink-0" />
        <span className="line-clamp-1">{product.coverageType}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {product.targetSegments.slice(0, 2).map((seg) => <Badge key={seg} variant="blue" size="sm">{seg}</Badge>)}
        {product.targetSegments.length > 2 && <Badge variant="blue" size="sm">+{product.targetSegments.length - 2}</Badge>}
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {product.keyFeatures.slice(0, 2).map((f, i) => <Badge key={i} variant="green" size="sm">{f}</Badge>)}
        {product.keyFeatures.length > 2 && <Badge variant="green" size="sm">+{product.keyFeatures.length - 2}</Badge>}
      </div>
      {canonical && canonical.standardSlugs.length > 0 && (
        <div className="pt-2 border-t border-white/[0.05]">
          <StandardChips slugs={canonical.standardSlugs} size="xs" max={4} />
        </div>
      )}
    </motion.div>
  );
}

function ComparisonListView({ gpssaProducts, intlProducts, countries }: {
  gpssaProducts: Product[]; intlProducts: IntlProduct[]; countries: string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
      <div>
        <div className="flex items-center gap-1.5 mb-2 sticky top-0 bg-navy/95 backdrop-blur-sm py-1 z-10">
          <CountryFlag code="ARE" size="xs" />
          <span className="text-[10px] font-semibold text-cream uppercase tracking-wider">GPSSA</span>
          <span className="text-[9px] text-gray-muted ml-auto">{gpssaProducts.length}</span>
        </div>
        <div className="space-y-1.5">
          {gpssaProducts.map((p) => (
            <div key={p.id} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
              <p className="text-[11px] font-medium text-cream leading-snug">{p.name}</p>
              {p.description && <p className="text-[9px] text-gray-muted mt-0.5 line-clamp-1">{p.description}</p>}
              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-gray-muted">
                <Badge variant={statusBadge[p.status].variant} size="sm">{p.status}</Badge>
                <span className="text-cream/60 line-clamp-1">{p.coverageType}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-2 sticky top-0 bg-navy/95 backdrop-blur-sm py-1 z-10">
          {countries.map((iso3) => <CountryFlag key={iso3} code={iso3} size="xs" />)}
          <span className="text-[10px] font-semibold text-cream uppercase tracking-wider">International</span>
          <span className="text-[9px] text-gray-muted ml-auto">{intlProducts.length}</span>
        </div>
        <div className="space-y-1.5">
          {intlProducts.length > 0 ? intlProducts.map((p) => {
            const country = COUNTRIES.find((c) => c.iso3 === p.countryIso3);
            return (
              <div key={p.id} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
                <div className="flex items-center gap-1 mb-1">
                  <CountryFlag code={p.countryIso3} size="xs" />
                  <span className="text-[8px] text-gray-muted">{country?.name}</span>
                </div>
                <p className="text-[11px] font-medium text-cream leading-snug">{p.name}</p>
                {p.coverageType && <span className="text-[9px] text-cream/60">{p.coverageType}</span>}
                {p.iloAlignment && <span className="inline-flex items-center gap-0.5 text-[8px] text-gold mt-1 ml-2"><Scale size={7} />ILO</span>}
              </div>
            );
          }) : (
            <div className="rounded-lg bg-white/[0.02] border border-dashed border-white/[0.08] p-6 text-center">
              <Globe2 size={18} className="mx-auto text-gray-muted mb-1.5" />
              <p className="text-[10px] text-gray-muted">No international data yet. Run research agents to populate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparisonBarChart({ tierCounts }: {
  tierCounts: { tier: ProductTier; gpssa: number; intl: { iso3: string; count: number; color: string }[] }[];
}) {
  const maxVal = Math.max(1, ...tierCounts.flatMap((c) => [c.gpssa, ...c.intl.map((i) => i.count)]));
  return (
    <div className="space-y-5 overflow-y-auto pr-1">
      {tierCounts.map(({ tier, gpssa, intl }) => (
        <div key={tier}>
          <p className="text-[11px] font-medium text-cream mb-2">{tier} Products</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CountryFlag code="ARE" size="xs" />
              <div className="flex-1 h-5 rounded bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded bg-gpssa-green/70 flex items-center justify-end pr-1.5"
                  initial={{ width: 0 }}
                  animate={{ width: `${(gpssa / maxVal) * 100}%` }}
                  transition={{ duration: 0.5 }}
                >
                  {gpssa > 0 && <span className="text-[9px] font-bold text-white">{gpssa}</span>}
                </motion.div>
              </div>
            </div>
            {intl.map((ic) => (
              <div key={ic.iso3} className="flex items-center gap-2">
                <CountryFlag code={ic.iso3} size="xs" />
                <div className="flex-1 h-5 rounded bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded flex items-center justify-end pr-1.5"
                    style={{ backgroundColor: ic.color + "99" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(ic.count / maxVal) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                  >
                    {ic.count > 0 && <span className="text-[9px] font-bold text-white">{ic.count}</span>}
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ComparisonRadar({ tierCounts }: {
  tierCounts: { tier: ProductTier; gpssa: number; intl: { iso3: string; count: number; color: string }[] }[];
}) {
  const cx = 140, cy = 130, r = 100;
  const n = tierCounts.length;
  if (n < 3) return <p className="text-xs text-gray-muted text-center py-8">Need at least 3 tiers for radar view.</p>;

  const maxVal = Math.max(1, ...tierCounts.flatMap((c) => [c.gpssa, ...c.intl.map((i) => i.count)]));
  const angleStep = (2 * Math.PI) / n;

  function polarToXY(idx: number, val: number) {
    const angle = idx * angleStep - Math.PI / 2;
    const norm = (val / maxVal) * r;
    return { x: cx + norm * Math.cos(angle), y: cy + norm * Math.sin(angle) };
  }

  function makePolygon(values: number[]) {
    return values.map((v, i) => { const p = polarToXY(i, v); return `${p.x},${p.y}`; }).join(" ");
  }

  const gpssaPoints = makePolygon(tierCounts.map((c) => c.gpssa));
  const allCountryIso3 = Array.from(new Set(tierCounts.flatMap((c) => c.intl.map((i) => i.iso3))));
  const countryPolygons = allCountryIso3.map((iso3) => {
    const values = tierCounts.map((c) => c.intl.find((i) => i.iso3 === iso3)?.count ?? 0);
    const color = tierCounts[0]?.intl.find((i) => i.iso3 === iso3)?.color ?? "#888";
    return { iso3, points: makePolygon(values), color };
  });

  return (
    <div className="flex flex-col items-center overflow-y-auto pr-1">
      <svg viewBox="0 0 280 280" className="w-full max-w-[320px]">
        {[0.25, 0.5, 0.75, 1].map((pct) => (
          <polygon
            key={pct}
            points={Array.from({ length: n }, (_, i) => { const p = polarToXY(i, maxVal * pct); return `${p.x},${p.y}`; }).join(" ")}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
          />
        ))}
        {tierCounts.map((c, i) => {
          const p = polarToXY(i, maxVal);
          return (
            <g key={c.tier}>
              <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={p.x} y={p.y} textAnchor="middle" dy={p.y < cy ? -6 : 12} className="text-[9px] fill-gray-muted">{c.tier}</text>
            </g>
          );
        })}
        {countryPolygons.map((cp) => (
          <motion.polygon
            key={cp.iso3}
            points={cp.points}
            fill={cp.color + "15"}
            stroke={cp.color}
            strokeWidth="1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        ))}
        <motion.polygon
          points={gpssaPoints}
          fill="rgba(34,197,94,0.12)"
          stroke="#22C55E"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        />
        {tierCounts.map((c, i) => {
          const p = polarToXY(i, c.gpssa);
          return <circle key={c.tier} cx={p.x} cy={p.y} r="3" fill="#22C55E" />;
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <span className="flex items-center gap-1 text-[9px] text-cream"><span className="w-2 h-2 rounded-full bg-gpssa-green" />GPSSA</span>
        {countryPolygons.map((cp) => {
          const country = COUNTRIES.find((c) => c.iso3 === cp.iso3);
          return (
            <span key={cp.iso3} className="flex items-center gap-1 text-[9px] text-cream">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cp.color }} />
              <CountryFlag code={cp.iso3} size="xs" />{country?.name?.split(" ")[0]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function ProductPortfolioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [intlProducts, setIntlProducts] = useState<IntlProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTier, setActiveTier] = useState<ProductTier | null>(null);
  const [comparisonCountries, setComparisonCountries] = useState<string[]>([]);
  const [vizMode, setVizMode] = useState<VizMode>("list");
  const [detailModal, setDetailModal] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isComparing = comparisonCountries.length > 0;

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) {
        const data: Record<string, unknown>[] = await res.json();
        if (data.length > 0) {
          setProducts(data.map((d) => ({
            id: String(d.id), name: String(d.name), description: String(d.description ?? ""),
            tier: String(d.tier ?? "Core") as ProductTier, status: String(d.status ?? "Active") as ProductStatus,
            targetSegments: Array.isArray(d.targetSegments) ? d.targetSegments.map(String) : parseJsonField<string[]>(d.targetSegments) ?? [],
            coverageType: String(d.coverageType ?? ""),
            keyFeatures: Array.isArray(d.keyFeatures) ? d.keyFeatures.map(String) : parseJsonField<string[]>(d.keyFeatures) ?? [],
            regulatoryBasis: d.regulatoryBasis ? String(d.regulatoryBasis) : null,
            comparableInternational: d.comparableInternational ? String(d.comparableInternational) : null,
          })));
        } else { setProducts(STATIC_PRODUCTS); }
      } else { setProducts(STATIC_PRODUCTS); }
    } catch { setProducts(STATIC_PRODUCTS); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useResearchUpdates({
    targetScreens: ["products-portfolio", "products-innovation"],
    onComplete: () => { loadProducts(); },
  });

  useEffect(() => {
    if (comparisonCountries.length === 0) { setIntlProducts([]); return; }
    const params = new URLSearchParams({ countries: comparisonCountries.join(",") });
    fetch(`/api/international/products?${params}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (Array.isArray(data)) setIntlProducts(data); })
      .catch(() => setIntlProducts([]));
  }, [comparisonCountries]);

  const tierCounts = useMemo(() =>
    TIERS.map((tier) => ({ tier, count: products.filter((p) => p.tier === tier).length })),
  [products]);

  const tierProducts = useMemo(() => {
    if (!activeTier) return [];
    let list = products.filter((p) => p.tier === activeTier);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeTier, searchQuery]);

  const tierIntlProducts = useMemo(() => {
    if (!activeTier || intlProducts.length === 0) return [];
    return intlProducts.filter((p) => p.tier === activeTier);
  }, [intlProducts, activeTier]);

  const intlByCountry = useMemo(() => {
    const map = new Map<string, IntlProduct[]>();
    for (const p of intlProducts) {
      const list = map.get(p.countryIso3) ?? [];
      list.push(p);
      map.set(p.countryIso3, list);
    }
    return map;
  }, [intlProducts]);

  const comparisonTierData = useMemo(() => {
    return TIERS.map((tier) => {
      const gpssa = products.filter((p) => p.tier === tier).length;
      const intl = comparisonCountries.map((iso3, idx) => {
        const count = (intlByCountry.get(iso3) ?? []).filter((p) => p.tier === tier).length;
        return { iso3, count, color: COUNTRY_COLORS[idx % COUNTRY_COLORS.length] };
      });
      return { tier, gpssa, intl };
    });
  }, [products, comparisonCountries, intlByCountry]);

  const maxTierCount = useMemo(() =>
    Math.max(1, ...comparisonTierData.flatMap((c) => [c.gpssa, ...c.intl.map((i) => i.count)])),
  [comparisonTierData]);

  const gapCount = useMemo(() => {
    if (intlProducts.length === 0) return 0;
    const gpssaNames = new Set(products.map((p) => p.name.toLowerCase()));
    return intlProducts.filter((p) => !gpssaNames.has(p.name.toLowerCase()) && !Array.from(gpssaNames).some((n) => p.name.toLowerCase().includes(n.split(" ")[0]) || n.includes(p.name.toLowerCase().split(" ")[0]))).length;
  }, [products, intlProducts]);

  const handleTierClick = useCallback((tier: ProductTier) => {
    setActiveTier((prev) => (prev === tier ? null : tier));
  }, []);

  const activeCount = products.filter((p) => p.status === "Active").length;
  const pilotCount = products.filter((p) => p.status === "Pilot").length;

  const statBarItems: StatBarItem[] = useMemo(() => {
    const items: StatBarItem[] = [
      { icon: Package, value: products.length, label: "GPSSA Products" },
      { icon: Shield, value: activeCount, label: "Active" },
      { icon: Sparkles, value: pilotCount, label: "In Pilot" },
      { icon: Layers3, value: 3, label: "Tiers" },
    ];
    if (isComparing) {
      items.push({ icon: Globe2, value: intlProducts.length, label: `Intl (${comparisonCountries.length})` });
      if (gapCount > 0) {
        items.push({ icon: AlertCircle, value: gapCount, label: "Gap Products" });
      }
    }
    return items;
  }, [products.length, activeCount, pilotCount, isComparing, intlProducts.length, comparisonCountries.length, gapCount]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2 border-b border-white/[0.06]">
        <h1 className="font-playfair text-base font-semibold text-cream shrink-0">Product Portfolio</h1>
        <div className="h-4 w-px bg-white/10" />
        <CountrySelector selected={comparisonCountries} onChange={setComparisonCountries} pillar="products" variant="inline" />
        <MandateBasisChip
          screenPath="/dashboard/products/portfolio"
          entityIds={products.map((p) => p.id)}
          className="ml-2"
        />
        {activeTier && (
          <div className="ml-auto relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input type="text" placeholder="Filter…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 pl-7 pr-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-cream placeholder:text-gray-muted focus:outline-none focus:border-gpssa-green/30 transition-colors" />
          </div>
        )}
      </div>

      {/* Comparison stats banner */}
      <AnimatePresence>
        {isComparing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-4 px-5 py-2 border-b border-white/[0.04] bg-white/[0.015]">
              <div className="flex items-center gap-1.5">
                <CountryFlag code="ARE" size="xs" />
                <span className="text-[10px] font-semibold text-cream">{products.length}</span>
                <span className="text-[9px] text-gray-muted">products</span>
              </div>
              {comparisonCountries.map((iso3) => {
                const count = intlByCountry.get(iso3)?.length ?? 0;
                const country = COUNTRIES.find((c) => c.iso3 === iso3);
                return (
                  <div key={iso3} className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-muted">vs</span>
                    <CountryFlag code={iso3} size="xs" />
                    <span className="text-[10px] font-semibold text-cream">{count}</span>
                    <span className="text-[9px] text-gray-muted hidden sm:inline">{country?.name?.split(" ")[0]}</span>
                  </div>
                );
              })}
              {gapCount > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  <ArrowLeftRight size={10} className="text-gold" />
                  <span className="text-[10px] font-semibold text-gold">{gapCount}</span>
                  <span className="text-[9px] text-gray-muted">gap products</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left panel */}
        <div className={`shrink-0 border-r border-white/[0.06] overflow-y-auto scrollbar-thin ${
          isComparing ? "w-[280px]" : "w-[300px]"
        }`}>
          <AnimatePresence mode="wait">
            {isComparing ? (
              <motion.div key="compare-nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 space-y-1">
                <p className="text-[9px] text-gray-muted uppercase tracking-wider mb-2 px-1">Product Tiers</p>
                {comparisonTierData.map((d) => (
                  <ComparisonTierRow
                    key={d.tier}
                    tier={d.tier}
                    gpssaCount={d.gpssa}
                    intlCounts={d.intl}
                    maxCount={maxTierCount}
                    isActive={activeTier === d.tier}
                    onClick={() => handleTierClick(d.tier)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div key="tiles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3">
                <p className="text-[9px] text-gray-muted uppercase tracking-wider mb-2 px-1">Product Tiers</p>
                <div className="space-y-2">
                  {tierCounts.map(({ tier, count }) => (
                    <TierTile key={tier} tier={tier} count={count} isActive={activeTier === tier} onClick={() => handleTierClick(tier)} />
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.05] px-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CountryFlag code="ARE" size="xs" />
                    <span className="text-[10px] font-semibold text-cream">GPSSA Portfolio</span>
                  </div>
                  <p className="text-[9px] text-gray-muted">{products.length} products across 3 tiers. Select a tier to explore.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {isComparing && activeTier && (
            <div className="shrink-0 flex items-center gap-1 px-4 py-2 border-b border-white/[0.04]">
              {([
                { id: "list" as VizMode, icon: List, label: "List" },
                { id: "bar" as VizMode, icon: BarChart3, label: "Bars" },
                { id: "radar" as VizMode, icon: Radar, label: "Radar" },
              ]).map((v) => {
                const Icon = v.icon;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVizMode(v.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                      vizMode === v.id
                        ? "bg-gpssa-green/15 text-gpssa-green border border-gpssa-green/25"
                        : "text-gray-muted hover:text-cream hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <Icon size={11} />{v.label}
                  </button>
                );
              })}
              <span className="ml-auto text-[9px] text-gray-muted">{activeTier}</span>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4">
            <AnimatePresence mode="wait">
              {activeTier ? (
                <motion.div key={`tier-${activeTier}-${isComparing ? vizMode : "browse"}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }} className="h-full">
                  {isComparing ? (
                    vizMode === "list" ? (
                      <ComparisonListView gpssaProducts={tierProducts} intlProducts={tierIntlProducts} countries={comparisonCountries} />
                    ) : vizMode === "bar" ? (
                      <ComparisonBarChart tierCounts={comparisonTierData} />
                    ) : (
                      <ComparisonRadar tierCounts={comparisonTierData} />
                    )
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        {(() => { const cfg = tierConfig[activeTier]; const Icon = cfg.icon; return <div className={`p-1.5 rounded-lg ${cfg.bg}`}><Icon size={14} className="text-cream" /></div>; })()}
                        <div>
                          <h2 className="text-sm font-semibold text-cream font-playfair">{activeTier} Products</h2>
                          <p className="text-[10px] text-gray-muted">{tierProducts.length} product{tierProducts.length !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {tierProducts.map((p) => (
                          <ProductCard key={p.id} product={p} onClick={() => setDetailModal(p)} />
                        ))}
                      </div>
                      {tierProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Search size={20} className="text-gray-muted mb-2" />
                          <p className="text-xs text-gray-muted">No products match your search.</p>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.08] max-w-xs">
                    <Package size={28} className="mx-auto text-gray-muted mb-3" />
                    <h2 className="font-playfair text-sm font-semibold text-cream mb-1">
                      {isComparing ? "Select a tier to compare" : "Select a tier to explore"}
                    </h2>
                    <p className="text-[10px] text-gray-muted leading-relaxed">
                      {isComparing
                        ? "Choose a product tier on the left to see GPSSA products side-by-side with international equivalents."
                        : "Click any tier on the left to browse GPSSA products with coverage types, target segments, and key features."
                      }
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stat Bar */}
      <StatBar items={statBarItems} />

      {/* Detail Modal */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.name} description={detailModal?.tier} size="xl">
        {detailModal && (
          <div className="space-y-4">
            {detailModal.description && <p className="text-sm text-gray-muted">{detailModal.description}</p>}

            <div className="flex items-center gap-3 glass rounded-lg p-3">
              <Badge variant={statusBadge[detailModal.status].variant} size="sm">{detailModal.status}</Badge>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 text-xs text-cream/80">
                <Briefcase size={12} className="text-gold shrink-0" />
                {detailModal.coverageType}
              </div>
            </div>

            {detailModal.targetSegments.length > 0 && (
              <div>
                <span className="text-xs font-medium text-cream block mb-2">Target Segments</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailModal.targetSegments.map((seg) => <Badge key={seg} variant="blue" size="sm">{seg}</Badge>)}
                </div>
              </div>
            )}

            {detailModal.keyFeatures.length > 0 && (
              <div>
                <span className="text-xs font-medium text-cream block mb-2">Key Features</span>
                <ul className="space-y-1.5">
                  {detailModal.keyFeatures.map((f, i) => (
                    <li key={i} className="text-xs text-gray-muted flex items-start gap-2">
                      <span className="text-gpssa-green mt-0.5">•</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detailModal.regulatoryBasis && (
              <div>
                <span className="text-xs font-medium text-cream block mb-1.5 flex items-center gap-1.5">
                  <Scale size={12} className="text-gold" /> Regulatory Basis
                </span>
                <p className="text-xs text-gray-muted glass rounded-lg p-3 leading-relaxed">
                  {detailModal.regulatoryBasis}
                </p>
              </div>
            )}

            {detailModal.comparableInternational && (
              <div>
                <span className="text-xs font-medium text-cream block mb-1.5 flex items-center gap-1.5">
                  <Globe2 size={12} className="text-adl-blue" /> Comparable International Practice
                </span>
                <p className="text-xs text-gray-muted glass rounded-lg p-3 leading-relaxed">
                  {detailModal.comparableInternational}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
