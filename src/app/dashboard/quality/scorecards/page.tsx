"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  AlertOctagon,
  Sparkles,
  Plus,
  ListChecks,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { CopcFamilyBadge } from "@/components/quality/CopcFamilyBadge";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Dimension {
  id: string;
  name: string;
  copcFamily: string | null;
}

interface Criterion {
  id: string;
  text: string;
  weight: number;
  critical: boolean;
  dimension: Dimension | null;
}

interface Scorecard {
  id: string;
  name: string;
  description: string | null;
  serviceScope: string | null;
  status: string;
  criteria: Criterion[];
  _count: { reviews: number };
}

interface AiCriterion {
  text: string;
  dimension: string;
  weight: number;
  critical: boolean;
}

function statusVariant(status: string): "green" | "gold" | "gray" {
  if (status === "active") return "green";
  if (status === "draft") return "gold";
  return "gray";
}

export default function ScorecardsPage() {
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Scorecard | null>(null);

  // AI generate flow
  const [aiOpen, setAiOpen] = useState(false);
  const [aiService, setAiService] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AiCriterion[] | null>(null);

  useEffect(() => {
    fetch("/api/quality/scorecards", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setScorecards(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function generateWithAI() {
    if (!aiService.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const res = await fetch("/api/quality/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "scorecard", payload: { service: aiService } }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? "AI request failed.");
        return;
      }
      if (Array.isArray(data.criteria)) {
        setAiResult(data.criteria as AiCriterion[]);
      } else {
        setAiError("The model did not return a criteria list.");
      }
    } catch {
      setAiError("Network error contacting the AI service.");
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="QA Scorecards"
        description="10–14 criteria per service, grouped by quality dimension, with compliance and identity-verification auto-fails."
        badge={{ label: `${scorecards.length} scorecards`, variant: "blue" }}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setAiOpen(true)}>
            <Sparkles size={15} />
            Generate with AI
          </Button>
        }
      />

      {scorecards.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No scorecards yet"
          description="Seed the QA demo data or generate a scorecard with AI."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scorecards.map((sc, i) => {
            const criticalCount = sc.criteria.filter((c) => c.critical).length;
            return (
              <motion.div
                key={sc.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, ease: EASE }}
              >
                <Card
                  variant="glass"
                  padding="md"
                  hover
                  onClick={() => setDetail(sc)}
                  className="h-full cursor-pointer"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-playfair text-base font-semibold text-cream">{sc.name}</h3>
                    <Badge variant={statusVariant(sc.status)} size="sm" dot>
                      {sc.status}
                    </Badge>
                  </div>
                  {sc.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-muted">{sc.description}</p>
                  )}
                  <div className="grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3">
                    <Stat icon={ListChecks} tone="text-teal-400" value={sc.criteria.length} label="criteria" />
                    <Stat icon={AlertOctagon} tone="text-amber-400" value={criticalCount} label="auto-fail" />
                    <Stat icon={ClipboardCheck} tone="text-gpssa-green" value={sc._count.reviews} label="reviews" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail modal: criteria table */}
      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.name ?? ""}
        description={detail?.serviceScope ?? undefined}
        size="xl"
      >
        {detail && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant(detail.status)} size="sm" dot>
                {detail.status}
              </Badge>
              <span className="text-xs text-gray-muted">
                {detail.criteria.length} criteria ·{" "}
                {detail.criteria.filter((c) => c.critical).length} auto-fail
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-white/[0.06]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wide text-gray-muted">
                  <tr>
                    <th className="px-3 py-2">Criterion</th>
                    <th className="px-3 py-2">Dimension</th>
                    <th className="px-3 py-2 text-right">Weight</th>
                    <th className="px-3 py-2 text-center">Critical</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.criteria.map((c) => (
                    <tr key={c.id} className="border-t border-white/[0.05] align-top">
                      <td className="px-3 py-2 text-cream/90">{c.text}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-cream/70">{c.dimension?.name ?? "—"}</span>
                          <CopcFamilyBadge family={c.dimension?.copcFamily} />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right text-cream/70">×{c.weight.toFixed(1)}</td>
                      <td className="px-3 py-2 text-center">
                        {c.critical ? (
                          <Badge variant="red" size="sm">
                            Auto-fail
                          </Badge>
                        ) : (
                          <span className="text-gray-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* AI generate modal */}
      <Modal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        title="Generate scorecard with AI"
        description="Draft 10–14 dimension-mapped criteria for a service, with compliance auto-fails."
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-gray-muted">
              Service
            </label>
            <input
              value={aiService}
              onChange={(e) => setAiService(e.target.value)}
              placeholder="e.g. Survivor Benefit Initiation"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-gray-muted/60 focus:border-teal-400/40 focus:outline-none"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            loading={aiLoading}
            disabled={!aiService.trim()}
            onClick={generateWithAI}
          >
            <Plus size={15} />
            Draft criteria
          </Button>

          {aiError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
              {aiError}
            </div>
          )}

          {aiResult && (
            <div className="overflow-hidden rounded-xl border border-white/[0.06]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wide text-gray-muted">
                  <tr>
                    <th className="px-3 py-2">Criterion</th>
                    <th className="px-3 py-2">Dimension</th>
                    <th className="px-3 py-2 text-center">Critical</th>
                  </tr>
                </thead>
                <tbody>
                  {aiResult.map((c, i) => (
                    <tr key={i} className="border-t border-white/[0.05] align-top">
                      <td className="px-3 py-2 text-cream/90">{c.text}</td>
                      <td className="px-3 py-2 text-xs text-cream/70">{c.dimension}</td>
                      <td className="px-3 py-2 text-center">
                        {c.critical ? (
                          <Badge variant="red" size="sm">
                            Auto-fail
                          </Badge>
                        ) : (
                          <span className="text-gray-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function Stat({
  icon: Icon,
  tone,
  value,
  label,
}: {
  icon: typeof ListChecks;
  tone: string;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1">
        <Icon size={12} className={tone} />
        <span className="text-sm font-semibold text-cream">{value}</span>
      </div>
      <span className="text-[10px] uppercase tracking-wide text-gray-muted">{label}</span>
    </div>
  );
}
