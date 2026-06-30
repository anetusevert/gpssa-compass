"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  Sparkles,
  User,
  CalendarClock,
  GitBranch,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const EASE = [0.16, 1, 0.3, 1] as const;

interface CorrectiveAction {
  id: string;
  clusterLabel: string | null;
  title: string;
  rootCauseMethod: string;
  rootCause: string | null;
  owner: string | null;
  dueDate: string | null;
  status: string;
  cycle: string;
  effectivenessCheck: string | null;
}

interface AiHypothesis {
  rootCause: string;
  rationale?: string;
  method?: string;
  confidence?: number;
}
interface AiAction {
  title: string;
  owner?: string;
  cycle?: string;
  effectivenessCheck?: string;
}

const COLUMNS: { id: string; label: string }[] = [
  { id: "open", label: "Open" },
  { id: "in-progress", label: "In progress" },
  { id: "verified", label: "Verified" },
  { id: "closed", label: "Closed" },
];

function statusVariant(status: string): "gray" | "blue" | "gold" | "green" {
  if (status === "open") return "gray";
  if (status === "in-progress") return "blue";
  if (status === "verified") return "gold";
  return "green";
}

export default function CapaPage() {
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [loading, setLoading] = useState(true);

  // AI rootcause flow
  const [aiOpen, setAiOpen] = useState(false);
  const [aiCluster, setAiCluster] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiHypotheses, setAiHypotheses] = useState<AiHypothesis[] | null>(null);
  const [aiActions, setAiActions] = useState<AiAction[] | null>(null);

  useEffect(() => {
    fetch("/api/quality/capa", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setActions(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function suggestRootCauses() {
    if (!aiCluster.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiHypotheses(null);
    setAiActions(null);
    try {
      const res = await fetch("/api/quality/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "rootcause", payload: { cluster: aiCluster } }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? "AI request failed.");
        return;
      }
      if (Array.isArray(data.hypotheses)) setAiHypotheses(data.hypotheses as AiHypothesis[]);
      if (Array.isArray(data.correctiveActions)) setAiActions(data.correctiveActions as AiAction[]);
      if (!Array.isArray(data.hypotheses) && !Array.isArray(data.correctiveActions)) {
        setAiError("The model did not return hypotheses.");
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
        title="Corrective Actions (CAPA)"
        description="Root-cause analysis plus corrective/preventive actions with owners, due dates and effectiveness checks — wrapped in PDCA / DMAIC."
        badge={{ label: `${actions.length} actions`, variant: "gold" }}
        actions={
          <Button variant="secondary" size="sm" onClick={() => setAiOpen(true)}>
            <Sparkles size={15} />
            Suggest root causes (AI)
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const cards = actions.filter((a) => a.status === col.id);
          return (
            <div key={col.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-cream">
                  {col.label}
                </h3>
                <Badge variant={statusVariant(col.id)} size="sm">
                  {cards.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {cards.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i, ease: EASE }}
                  >
                    <Card variant="bordered" padding="sm" className="h-full">
                      <div className="mb-2 flex items-start gap-2">
                        <Wrench size={14} className="mt-0.5 shrink-0 text-teal-400" />
                        <p className="text-sm font-medium leading-snug text-cream">{a.title}</p>
                      </div>
                      {a.clusterLabel && (
                        <Badge variant="gray" size="sm" className="mb-2">
                          {a.clusterLabel}
                        </Badge>
                      )}
                      {a.rootCause && (
                        <p className="mb-2 line-clamp-3 text-[11px] leading-relaxed text-gray-muted">
                          <span className="uppercase tracking-wide text-cream/50">Root cause: </span>
                          {a.rootCause}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-muted">
                        <span className="inline-flex items-center gap-1">
                          <GitBranch size={10} className="text-amber-400" />
                          {a.rootCauseMethod}
                        </span>
                        <span className="inline-flex items-center gap-1 uppercase">
                          <CheckCircle2 size={10} className="text-gpssa-green" />
                          {a.cycle}
                        </span>
                        {a.owner && (
                          <span className="inline-flex items-center gap-1">
                            <User size={10} className="text-adl-blue" />
                            {a.owner}
                          </span>
                        )}
                        {a.dueDate && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock size={10} className="text-gold" />
                            {a.dueDate}
                          </span>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
                {cards.length === 0 && (
                  <p className="rounded-lg border border-dashed border-white/[0.06] px-3 py-4 text-center text-[11px] text-gray-muted">
                    None
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI rootcause modal */}
      <Modal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        title="Suggest root causes"
        description="Describe a defect cluster; the model returns ranked root-cause hypotheses and corrective actions."
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wide text-gray-muted">
              Defect cluster
            </label>
            <textarea
              value={aiCluster}
              onChange={(e) => setAiCluster(e.target.value)}
              rows={3}
              placeholder="e.g. Repeated wrong-settlement-amount defects in End-of-Service cases at month-end."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream placeholder:text-gray-muted/60 focus:border-teal-400/40 focus:outline-none"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            loading={aiLoading}
            disabled={!aiCluster.trim()}
            onClick={suggestRootCauses}
          >
            <Sparkles size={15} />
            Analyse
          </Button>

          {aiError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
              {aiError}
            </div>
          )}

          {aiHypotheses && aiHypotheses.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-muted">Ranked hypotheses</p>
              <div className="space-y-2">
                {aiHypotheses.map((h, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-cream">{h.rootCause}</span>
                      {h.method && (
                        <Badge variant="gold" size="sm">
                          {h.method}
                        </Badge>
                      )}
                    </div>
                    {h.rationale && (
                      <p className="mt-1 text-[11px] text-gray-muted">{h.rationale}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiActions && aiActions.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-muted">Suggested corrective actions</p>
              <div className="space-y-2">
                {aiActions.map((a, i) => (
                  <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-sm font-medium text-cream">{a.title}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-muted">
                      {a.owner && <span>Owner: {a.owner}</span>}
                      {a.cycle && <span className="uppercase">Cycle: {a.cycle}</span>}
                    </div>
                    {a.effectivenessCheck && (
                      <p className="mt-1 text-[11px] text-gray-muted">
                        <span className="uppercase tracking-wide text-cream/50">Check: </span>
                        {a.effectivenessCheck}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
