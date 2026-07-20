"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Building2,
  Share2,
  Megaphone,
  Network,
  AlertTriangle,
  Globe2,
  Users2,
  Layers,
  TrendingUp,
  ArrowLeftRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { StatBar, type StatBarItem } from "@/components/ui/StatBar";
import { useResearchUpdates } from "@/lib/hooks/useResearchUpdates";
import { StandardChips } from "@/components/comparator/StandardChips";
import { CountrySelector } from "@/components/comparison/CountrySelector";
import { COUNTRIES } from "@/lib/countries/catalog";

type MaturityLevel = "High" | "Medium" | "Low";

interface DeliveryModelRecord {
  id: string;
  name: string;
  description: string;
  channelMix: string[];
  targetSegments: string[];
  enablers: string[];
  risks: string[];
  benchmarkExamples: string[];
  maturity: number;
}

const MODEL_ICON_MAP: Record<string, LucideIcon> = {
  "Direct Digital": Cpu,
  "In-Person Assisted": Building2,
  "Partnership Ecosystem": Share2,
  "Outreach & Awareness": Megaphone,
};

const STATIC_MODELS: DeliveryModelRecord[] = [
  {
    id: "direct-digital",
    name: "Direct Digital",
    description: "Primary channel for tech-savvy segments — straight-through digital journeys with minimal assisted handoffs.",
    channelMix: ["Portal", "Mobile app", "API"],
    targetSegments: ["Employers", "Young insureds", "GCC nationals"],
    enablers: ["eKYC and reusable identity", "Qualified digital signature", "Federated SingPass-style integrations"],
    risks: [],
    benchmarkExamples: [],
    maturity: 55,
  },
  {
    id: "in-person",
    name: "In-Person Assisted",
    description: "Service center model for complex cases, guardianship, and populations that prefer human reassurance.",
    channelMix: ["Service centers", "Appointment system"],
    targetSegments: ["Beneficiaries", "Guardians", "Elderly users"],
    enablers: ["Appointment booking and queue fairness", "Case management and CRM hooks", "High-quality document scanning and archival"],
    risks: [],
    benchmarkExamples: [],
    maturity: 80,
  },
  {
    id: "partnership",
    name: "Partnership Ecosystem",
    description: "Leverage third-party networks to embed pensions and OH into employer, government, and financial journeys.",
    channelMix: ["Banking partners", "MOHRE", "ICP", "Employer HR systems"],
    targetSegments: ["Expats", "Informal workers", "Domestic workers"],
    enablers: ["Published API framework", "Data sharing agreements and consent", "Partner onboarding and monitoring"],
    risks: [],
    benchmarkExamples: [],
    maturity: 30,
  },
  {
    id: "outreach",
    name: "Outreach & Awareness",
    description: "Proactive engagement that finds uncovered segments and converts intent into enrollment and contribution continuity.",
    channelMix: ["Social media", "Financial literacy campaigns", "Community events", "Employer workshops"],
    targetSegments: ["Self-employed", "Informal workers", "Gig workers"],
    enablers: ["CRM with segment orchestration", "Content management for localized narratives", "Campaign analytics and attribution"],
    risks: [],
    benchmarkExamples: [],
    maturity: 30,
  },
];

function maturityLevel(score: number): MaturityLevel {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function maturityVariant(level: MaturityLevel): "green" | "gold" | "gray" {
  if (level === "High") return "green";
  if (level === "Medium") return "gold";
  return "gray";
}

function safeParse(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string" && raw.trim().length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return [raw];
    }
  }
  return [];
}

interface IntlDeliveryModel {
  id: string;
  countryIso3: string;
  name: string;
  description: string | null;
  channelMix: string | null;
  targetSegments: string | null;
  maturity: number;
  enablers: string | null;
  risks: string | null;
  benchmarkExamples: string | null;
}

export default function DeliveryModelsPage() {
  const [models, setModels] = useState<DeliveryModelRecord[]>(STATIC_MODELS);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DeliveryModelRecord | null>(null);
  const [comparisonCountries, setComparisonCountries] = useState<string[]>([]);
  const [intlModels, setIntlModels] = useState<IntlDeliveryModel[]>([]);
  const comparisonCountry = comparisonCountries[0] ?? null;
  const comparisonCountryName = comparisonCountry
    ? COUNTRIES.find((c) => c.iso3 === comparisonCountry)?.name ?? null
    : null;

  const loadIntlModels = useCallback(() => {
    if (!comparisonCountry) {
      setIntlModels([]);
      return;
    }
    fetch(`/api/international/delivery/models?countries=${comparisonCountry}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setIntlModels(data as IntlDeliveryModel[]);
      })
      .catch(() => setIntlModels([]));
  }, [comparisonCountry]);

  useEffect(() => {
    loadIntlModels();
  }, [loadIntlModels]);

  const loadModels = useCallback(() => {
    fetch("/api/delivery/models", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setModels(
            data.map((d: Record<string, unknown>) => ({
              id: String(d.id),
              name: String(d.name ?? ""),
              description: String(d.description ?? ""),
              channelMix: safeParse(d.channelMix),
              targetSegments: safeParse(d.targetSegments),
              enablers: safeParse(d.enablers),
              risks: safeParse(d.risks),
              benchmarkExamples: safeParse(d.benchmarkExamples),
              maturity: Number(d.maturity ?? 0),
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadModels(); }, [loadModels]);

  useResearchUpdates({
    targetScreens: ["delivery-models"],
    onComplete: () => loadModels(),
  });
  useResearchUpdates({
    targetScreens: ["intl-delivery-models"],
    onComplete: () => loadIntlModels(),
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const avgMaturity = models.length
    ? Math.round(models.reduce((acc, m) => acc + m.maturity, 0) / models.length)
    : 0;
  const totalEnablers = models.reduce((acc, m) => acc + m.enablers.length, 0);
  const totalRisks = models.reduce((acc, m) => acc + m.risks.length, 0);

  const stats: StatBarItem[] = [
    { icon: Network, value: models.length, label: "Delivery models" },
    { icon: TrendingUp, value: `${avgMaturity}%`, label: "Avg maturity" },
    { icon: Layers, value: totalEnablers, label: "Enablers" },
    { icon: AlertTriangle, value: totalRisks, label: "Tracked risks" },
  ];

  return (
    <PageFrame
      header={
        <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-5 py-2">
          <Network size={16} className="text-teal-400" />
          <h1 className="font-playfair text-base font-semibold text-cream">Delivery Models</h1>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <StandardChips slugs={["wb-govtech-maturity", "issa-good-governance"]} size="xs" />
            <CountrySelector
              selected={comparisonCountries}
              onChange={setComparisonCountries}
              maxSelections={1}
              variant="inline"
            />
          </div>
        </div>
      }
    >
      <div className="flex h-full min-h-0 flex-col">
        <TileScroll className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {models.map((model, idx) => {
              const Icon = MODEL_ICON_MAP[model.name] ?? Cpu;
              const level = maturityLevel(model.maturity);
              return (
                <motion.button
                  key={model.id}
                  onClick={() => setDetail(model)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-4 text-left transition-all hover:border-teal-400/30 hover:bg-white/[0.06]"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div className="shrink-0 rounded-xl border border-teal-400/20 bg-teal-400/10 p-2">
                      <Icon size={16} className="text-teal-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate font-playfair text-sm font-semibold text-cream">{model.name}</h3>
                        <Badge variant={maturityVariant(level)} size="sm" dot>
                          {level}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-gray-muted">{model.description}</p>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-cream/70">
                      <Layers size={10} className="text-adl-blue" />
                      <span>{model.channelMix.length} channels</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-cream/70">
                      <Users2 size={10} className="text-gold" />
                      <span>{model.targetSegments.length} segments</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-cream/70">
                      <TrendingUp size={10} className="text-gpssa-green" />
                      <span>{model.enablers.length} enablers</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-cream/70">
                      <AlertTriangle size={10} className="text-amber-400" />
                      <span>{model.risks.length} risks</span>
                    </div>
                  </div>

                  {model.benchmarkExamples.length > 0 && (
                    <div className="mt-3 flex items-start gap-1.5 border-t border-white/[0.06] pt-3">
                      <Globe2 size={10} className="mt-0.5 shrink-0 text-adl-blue" />
                      <p className="line-clamp-2 text-[10px] text-cream/60">
                        Benchmarks: {model.benchmarkExamples.slice(0, 2).join("; ")}
                      </p>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {comparisonCountry && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="glass-card mt-4 rounded-xl border border-white/10 p-4"
              >
                <div className="mb-3 flex items-center gap-2 text-xs text-gray-muted">
                  <ArrowLeftRight className="h-3.5 w-3.5 text-gpssa-green" />
                  <span className="font-medium text-cream/90">
                    Comparator — {comparisonCountryName ?? comparisonCountry}
                  </span>
                  <span className="opacity-60">{intlModels.length} models</span>
                </div>
                {intlModels.length === 0 ? (
                  <div className="py-4 text-center text-xs text-gray-muted">
                    No data yet — run the International Delivery Models agent to populate this country.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {intlModels.map((m) => {
                      const lvl = maturityLevel(Number(m.maturity ?? 0));
                      return (
                        <div key={m.id} className="rounded-lg border border-white/10 bg-navy-light/40 p-3">
                          <div className="mb-1.5 flex items-start justify-between gap-2">
                            <div className="text-sm font-medium text-cream">{m.name}</div>
                            <Badge variant={maturityVariant(lvl)} size="sm" dot>
                              {lvl}
                            </Badge>
                          </div>
                          {m.description && (
                            <p className="mb-2 line-clamp-3 text-[11px] text-gray-muted">{m.description}</p>
                          )}
                          {m.channelMix && (
                            <p className="text-[10px] text-cream/70">
                              <span className="text-adl-blue">Channels: </span>
                              {m.channelMix}
                            </p>
                          )}
                          {m.benchmarkExamples && (
                            <p className="mt-1 line-clamp-2 text-[10px] text-cream/60">
                              <span className="text-gpssa-green">Benchmarks: </span>
                              {m.benchmarkExamples}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TileScroll>

        <StatBar items={stats} />
      </div>

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name ?? ""}
        description={detail?.description ?? undefined}
        size="lg"
      >
        {detail && <DeliveryModelDetail model={detail} />}
      </Modal>
    </PageFrame>
  );
}

function DeliveryModelDetail({ model }: { model: DeliveryModelRecord }) {
  const level = maturityLevel(model.maturity);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge variant={maturityVariant(level)} dot>
          Maturity: {level} ({Math.round(model.maturity)})
        </Badge>
      </div>

      <DetailSection title="Channel Mix" icon={Layers} tone="text-adl-blue" items={model.channelMix} empty="No channels captured." />
      <DetailSection title="Target Segments" icon={Users2} tone="text-gold" items={model.targetSegments} empty="No target segments captured." />
      <DetailSection title="Enablers" icon={TrendingUp} tone="text-gpssa-green" items={model.enablers} empty="No enablers captured." />
      <DetailSection title="Risks" icon={AlertTriangle} tone="text-amber-400" items={model.risks} empty="No risks captured by the agent yet." />
      <DetailSection title="Benchmark Examples" icon={Globe2} tone="text-adl-blue" items={model.benchmarkExamples} empty="No benchmark examples captured by the agent yet." />
    </div>
  );
}

function DetailSection({
  title,
  icon: Icon,
  tone,
  items,
  empty,
}: {
  title: string;
  icon: LucideIcon;
  tone: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={11} className={tone} />
        <span className={`text-[10px] uppercase tracking-wider font-semibold ${tone}`}>{title}</span>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={`${item}-${i}`} className="text-[11px] text-cream/80 leading-snug flex gap-1.5">
              <span className={`mt-0.5 shrink-0 ${tone}`}>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] text-gray-muted/70 italic">{empty}</p>
      )}
    </div>
  );
}
