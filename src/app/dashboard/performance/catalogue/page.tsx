"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListChecks, ChevronDown, Sparkles, GitBranch } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  TimingChip,
  PerspectiveChip,
  TierChip,
} from "@/components/performance";

const EASE = [0.16, 1, 0.3, 1] as const;

interface KpiRow {
  id: string;
  name: string;
  description?: string | null;
  unit?: string | null;
  target?: string | null;
  kind: string;
  timing?: string | null;
  perspective?: string | null;
  tier?: string | null;
  direction: string;
}
interface KqiRow extends KpiRow {
  feedingKpis: KpiRow[];
}

const PERSPECTIVES: { key: string; label: string }[] = [
  { key: "customer", label: "Customer / Member" },
  { key: "process", label: "Internal Process" },
  { key: "financial", label: "Financial / Stewardship" },
  { key: "capacity", label: "Organisational Capacity" },
];

export default function CataloguePage() {
  const [kqis, setKqis] = useState<KqiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [aiOpen, setAiOpen] = useState(false);
  const [aiService, setAiService] = useState("Apply for End Of Service - Civil");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<unknown>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/performance/catalogue", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { kqis: [] }))
      .then((data) => setKqis(Array.isArray(data.kqis) ? data.kqis : []))
      .catch(() => setKqis([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  async function runAi() {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const res = await fetch("/api/performance/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "kqi-catalogue", service: aiService }),
      });
      const data = await res.json();
      if (!res.ok) setAiError(data.error ?? "AI request failed");
      else setAiResult(data);
    } catch {
      setAiError("AI request failed");
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI / KQI Catalogue"
        description="Citizen-facing KQIs (service-quality commitments) decomposed into the operational KPIs that feed them — grouped by Balanced-Scorecard perspective."
        badge={{ label: "Balanced Scorecard · GB917", variant: "gold" }}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setAiOpen(true)}>
            <Sparkles size={14} /> Generate KQI catalogue (AI)
          </Button>
        }
      />

      {kqis.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No catalogue yet"
          description="Seed the Performance module (POST /api/performance/seed) to populate the KQI/KPI catalogue."
        />
      ) : (
        <div className="space-y-8">
          {PERSPECTIVES.map((p) => {
            const rows = kqis.filter((k) => k.perspective === p.key);
            if (rows.length === 0) return null;
            return (
              <div key={p.key} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-playfair text-lg font-semibold text-cream">
                    {p.label}
                  </h2>
                  <span className="text-xs text-gray-muted">{rows.length} KQIs</span>
                </div>

                <div className="space-y-2">
                  {rows.map((kqi, i) => (
                    <motion.div
                      key={kqi.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: EASE, delay: i * 0.03 }}
                    >
                      <Card variant="glass" padding="md" className="overflow-hidden">
                        <button
                          onClick={() => toggle(kqi.id)}
                          className="w-full flex items-start justify-between gap-4 text-left"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-cream">
                                {kqi.name}
                              </span>
                              <span className="text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 bg-gold/15 text-gold">
                                KQI
                              </span>
                            </div>
                            {kqi.description && (
                              <p className="text-xs text-gray-muted mt-1 max-w-3xl">
                                {kqi.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              <TimingChip timing={kqi.timing} />
                              <PerspectiveChip perspective={kqi.perspective} />
                              <TierChip tier={kqi.tier} />
                              {kqi.target && (
                                <span className="text-[10px] text-gray-muted">
                                  target {kqi.target}
                                  {kqi.unit === "%" ? "%" : ` ${kqi.unit ?? ""}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-muted">
                              <GitBranch size={13} />
                              {kqi.feedingKpis.length}
                            </span>
                            <motion.span
                              animate={{ rotate: expanded[kqi.id] ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-gray-muted"
                            >
                              <ChevronDown size={18} />
                            </motion.span>
                          </div>
                        </button>

                        <AnimatePresence initial={false}>
                          {expanded[kqi.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: EASE }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-white/8 space-y-2">
                                <p className="text-[11px] uppercase tracking-wide text-gray-muted">
                                  Feeding KPIs (decomposition)
                                </p>
                                {kqi.feedingKpis.length === 0 ? (
                                  <p className="text-xs text-gray-muted">
                                    No feeding KPIs mapped.
                                  </p>
                                ) : (
                                  kqi.feedingKpis.map((k) => (
                                    <div
                                      key={k.id}
                                      className="flex items-start justify-between gap-3 rounded-xl bg-white/4 px-3 py-2"
                                    >
                                      <div className="min-w-0">
                                        <p className="text-sm text-cream">{k.name}</p>
                                        {k.description && (
                                          <p className="text-[11px] text-gray-muted mt-0.5">
                                            {k.description}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                          <TimingChip timing={k.timing} />
                                          <PerspectiveChip perspective={k.perspective} />
                                          <TierChip tier={k.tier} />
                                        </div>
                                      </div>
                                      {k.target && (
                                        <span className="text-[11px] text-gray-muted shrink-0 mt-0.5">
                                          {k.target}
                                          {k.unit === "%" ? "%" : ` ${k.unit ?? ""}`}
                                        </span>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        title="Generate KQI catalogue (AI)"
        description="Suggest citizen-facing KQIs and their feeding KPIs for a service."
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-muted">Service</label>
            <input
              value={aiService}
              onChange={(e) => setAiService(e.target.value)}
              className="mt-1 w-full rounded-xl bg-white/5 border border-border px-3 py-2 text-sm text-cream focus:outline-none focus:border-gpssa-green/50"
            />
          </div>
          <Button variant="primary" size="sm" loading={aiLoading} onClick={runAi}>
            <Sparkles size={14} /> Generate
          </Button>

          {aiError && (
            <p className="text-xs text-rose-300 bg-rose-500/10 rounded-lg px-3 py-2">
              {aiError}
            </p>
          )}
          {aiResult != null && (
            <pre className="text-[11px] text-gray-muted bg-black/30 rounded-xl p-3 overflow-auto max-h-80 whitespace-pre-wrap">
              {JSON.stringify(aiResult, null, 2)}
            </pre>
          )}
        </div>
      </Modal>
    </div>
  );
}
