"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ListChecks,
  Beaker,
  CheckCircle2,
  XCircle,
  Send,
  Users,
} from "lucide-react";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { RiskChip } from "@/components/quality/RiskChip";
import { computeReviewOutcome, type ReviewOutcome } from "@/lib/qa/scoring";
import { fadeRise } from "@/lib/motion";

interface SummaryRow {
  period: string;
  customer: number;
  business: number;
  compliance: number;
  count: number;
}

interface Criterion {
  id: string;
  text: string;
  weight: number;
  critical: boolean;
  dimension: { id: string; name: string; copcFamily: string | null } | null;
}

interface Scorecard {
  id: string;
  name: string;
  serviceScope: string | null;
  criteria: Criterion[];
}

interface SamplingPlan {
  id: string;
  method: string;
  populationSize: number;
  confidenceLevel: number;
  marginError: number;
  sampleSize: number;
  cadence: string;
  scorecard: { name: string } | null;
}

interface Review {
  id: string;
  caseRef: string;
  reviewer: string | null;
  totalScore: number;
  customerAccuracy: boolean;
  businessAccuracy: boolean;
  complianceAccuracy: boolean;
  autoFailTriggered: boolean;
  reviewedAt: string;
  scorecard: { name: string } | null;
}

export default function ReviewsPage() {
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [scorecards, setScorecards] = useState<Scorecard[]>([]);
  const [plans, setPlans] = useState<SamplingPlan[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Working review panel state
  const [selectedId, setSelectedId] = useState<string>("");
  const [passMap, setPassMap] = useState<Record<string, boolean>>({});
  const [liveOutcome, setLiveOutcome] = useState<ReviewOutcome | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function loadReviews() {
    fetch("/api/quality/reviews", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(() => {});
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/quality/reviews/summary", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/quality/scorecards", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/quality/sampling", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/quality/reviews", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([sum, scs, pl, rv]) => {
        if (Array.isArray(sum)) setSummary(sum);
        if (Array.isArray(scs)) {
          setScorecards(scs);
          if (scs.length > 0) setSelectedId(scs[0].id);
        }
        if (Array.isArray(pl)) setPlans(pl);
        if (Array.isArray(rv)) setReviews(rv);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selected = useMemo(
    () => scorecards.find((s) => s.id === selectedId) ?? null,
    [scorecards, selectedId]
  );

  // Reset toggles (default pass=true) when scorecard changes.
  useEffect(() => {
    if (!selected) return;
    const m: Record<string, boolean> = {};
    for (const c of selected.criteria) m[c.id] = true;
    setPassMap(m);
    setLiveOutcome(null);
    setSubmitError(null);
  }, [selected]);

  // Recompute the live outcome whenever toggles change.
  useEffect(() => {
    if (!selected) return;
    const items = selected.criteria.map((c) => ({
      criterionId: c.id,
      passed: passMap[c.id] ?? true,
    }));
    const outcome = computeReviewOutcome(
      selected.criteria.map((c) => ({
        id: c.id,
        weight: c.weight,
        critical: c.critical,
        copcFamily: c.dimension?.copcFamily ?? null,
      })),
      items
    );
    setLiveOutcome(outcome);
  }, [selected, passMap]);

  async function submitReview() {
    if (!selected) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const items = selected.criteria.map((c) => ({
        criterionId: c.id,
        passed: passMap[c.id] ?? true,
      }));
      const res = await fetch("/api/quality/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scorecardId: selected.id,
          caseRef: `LIVE-${Date.now().toString().slice(-6)}`,
          reviewer: "Live demo reviewer",
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Submission failed.");
        return;
      }
      loadReviews();
    } catch {
      setSubmitError("Network error submitting the review.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <PageFrame
      header={
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <ListChecks size={16} className="text-teal-400" />
            <h1 className="font-playfair text-sm font-semibold text-cream sm:text-base">
              Reviews &amp; Sampling
            </h1>
          </div>
          <span className="text-xs text-gray-muted">COPC 3-metric accuracy, scored live</span>
          <div className="ml-auto flex items-center gap-2">
            <HeaderChip label="Reviews" value={String(reviews.length)} />
            <HeaderChip label="Plans" value={String(plans.length)} />
          </div>
        </div>
      }
    >
      <motion.div
        variants={fadeRise}
        initial="hidden"
        animate="show"
        className="flex h-full min-h-0 flex-col gap-3"
      >
        {/* Charts strip: COPC trend + sampling plans */}
        <div className="grid shrink-0 grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="glass-card p-4 lg:col-span-2">
            <h3 className="mb-2 font-playfair text-sm font-semibold text-cream">
              COPC accuracy trend
            </h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="period" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <YAxis domain={[60, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(13,20,38,0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={((v: number) => `${v}%`) as never}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="customer" name="Customer" stroke="#2D4A8C" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="business" name="Business" stroke="#C5A572" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="compliance" name="Compliance" stroke="#00A86B" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card flex max-h-56 flex-col p-4">
            <div className="mb-2 flex shrink-0 items-center gap-2">
              <Beaker size={15} className="text-teal-400" />
              <h3 className="font-playfair text-sm font-semibold text-cream">Sampling plans</h3>
            </div>
            <TileScroll className="pr-1">
              <div className="space-y-2">
                {plans.map((p) => (
                  <div key={p.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-cream">
                        {p.scorecard?.name ?? "—"}
                      </span>
                      <Badge variant="blue" size="sm">
                        {p.method}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-gray-muted">
                      <span>Population: <span className="text-cream/80">{p.populationSize.toLocaleString()}</span></span>
                      <span>Sample: <span className="text-cream/80">{p.sampleSize}</span></span>
                      <span>Confidence: <span className="text-cream/80">{p.confidenceLevel}%</span></span>
                      <span>Margin: <span className="text-cream/80">±{p.marginError}%</span></span>
                      <span className="col-span-2">Cadence: <span className="text-cream/80 capitalize">{p.cadence}</span></span>
                    </div>
                  </div>
                ))}
                {plans.length === 0 && (
                  <p className="text-sm text-gray-muted">No sampling plans seeded.</p>
                )}
              </div>
            </TileScroll>
          </div>
        </div>

        {/* Review panel: criteria toggles + live outcome + recent reviews */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto pb-4 lg:grid-cols-5 lg:grid-rows-[minmax(0,1fr)] lg:overflow-visible lg:pb-0">
          {/* Criteria toggles */}
          <div className="glass-card flex min-h-0 flex-col p-4 lg:col-span-2">
            <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ListChecks size={15} className="text-teal-400" />
                <h3 className="font-playfair text-sm font-semibold text-cream">Score a case</h3>
              </div>
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="max-w-[55%] truncate rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-cream focus:border-teal-400/40 focus:outline-none"
              >
                {scorecards.map((s) => (
                  <option key={s.id} value={s.id} className="bg-navy">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <TileScroll className="pr-1">
              <div className="space-y-2">
                {selected?.criteria.map((c) => {
                  const passed = passMap[c.id] ?? true;
                  return (
                    <div
                      key={c.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-cream/90">{c.text}</p>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-muted">
                          <span>{c.dimension?.name ?? "—"}</span>
                          <span>·</span>
                          <span>×{c.weight.toFixed(1)}</span>
                          {c.critical && (
                            <Badge variant="red" size="sm">
                              Auto-fail
                            </Badge>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setPassMap((m) => ({ ...m, [c.id]: !passed }))}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          passed
                            ? "bg-gpssa-green/15 text-gpssa-green"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {passed ? "Pass" : "Fail"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </TileScroll>
          </div>

          {/* Live outcome */}
          <div className="flex min-h-0 flex-col gap-3 lg:col-span-1">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="mb-2 text-[9px] uppercase tracking-[0.16em] text-white/40">
                Live outcome
              </p>
              {liveOutcome && (
                <>
                  <div className="mb-3 flex items-baseline gap-2">
                    <span className="font-playfair text-3xl font-bold text-cream">
                      {liveOutcome.totalScore}%
                    </span>
                    {liveOutcome.autoFailTriggered && (
                      <Badge variant="red" size="sm">
                        Auto-fail
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <CopcRow label="Customer-critical" ok={liveOutcome.customerAccuracy} />
                    <CopcRow label="Business-critical" ok={liveOutcome.businessAccuracy} />
                    <CopcRow label="Compliance-critical" ok={liveOutcome.complianceAccuracy} />
                  </div>
                </>
              )}
            </div>
            <Button variant="primary" size="sm" fullWidth loading={submitting} onClick={submitReview}>
              <Send size={14} />
              Submit review
            </Button>
            {submitError && (
              <p className="text-xs text-red-400">{submitError}</p>
            )}
          </div>

          {/* Recent reviews */}
          <div className="glass-card flex min-h-0 flex-col p-4 lg:col-span-2">
            <div className="mb-2 flex shrink-0 items-center gap-2">
              <Users size={15} className="text-teal-400" />
              <h3 className="font-playfair text-sm font-semibold text-cream">Recent reviews</h3>
            </div>
            <TileScroll className="pr-1">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-navy/90 text-[10px] uppercase tracking-wide text-gray-muted backdrop-blur">
                  <tr>
                    <th className="px-2 py-1.5">Case</th>
                    <th className="px-2 py-1.5">Reviewer</th>
                    <th className="px-2 py-1.5 text-right">Score</th>
                    <th className="px-2 py-1.5 text-center">COPC</th>
                    <th className="px-2 py-1.5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.slice(0, 20).map((r) => (
                    <tr key={r.id} className="border-t border-white/[0.05]">
                      <td className="px-2 py-1.5 text-cream/80" title={r.scorecard?.name ?? undefined}>
                        {r.caseRef}
                      </td>
                      <td className="px-2 py-1.5 text-cream/60">{r.reviewer ?? "—"}</td>
                      <td className="px-2 py-1.5 text-right">
                        {r.autoFailTriggered ? (
                          <Badge variant="red" size="sm">
                            0% · fail
                          </Badge>
                        ) : (
                          <span className="text-cream/80">{r.totalScore}%</span>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center justify-center gap-1">
                          <Dot ok={r.customerAccuracy} title="Customer" />
                          <Dot ok={r.businessAccuracy} title="Business" />
                          <Dot ok={r.complianceAccuracy} title="Compliance" />
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-right text-[10px] text-gray-muted">
                        {new Date(r.reviewedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TileScroll>
          </div>
        </div>
      </motion.div>
    </PageFrame>
  );
}

function HeaderChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
      <span className="text-[9px] uppercase tracking-[0.16em] text-white/40">{label} </span>
      <span className="text-xs font-semibold text-cream">{value}</span>
    </div>
  );
}

function CopcRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-muted">{label}</span>
      {ok ? (
        <RiskChip tone="green">Pass</RiskChip>
      ) : (
        <RiskChip tone="red">Fail</RiskChip>
      )}
    </div>
  );
}

function Dot({ ok, title }: { ok: boolean; title: string }) {
  return (
    <span
      title={title}
      className="h-2.5 w-2.5 rounded-full"
      style={{ background: ok ? "#00A86B" : "#E76363" }}
    />
  );
}
