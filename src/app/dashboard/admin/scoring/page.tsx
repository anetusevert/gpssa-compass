"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, Scale } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Weight {
  id: string;
  dimension: string;
  weight: number;
  maxScore: number;
  description: string | null;
}

interface Methodology {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  weights: Weight[];
}

interface PreviewRow {
  institutionId: string;
  name: string;
  shortName: string;
  weightedScore: number;
}

const DIMENSION_LABELS: Record<string, string> = {
  "digital-maturity": "Digital Maturity",
  "service-breadth": "Service Breadth",
  "customer-experience": "Customer Experience",
  "operational-efficiency": "Operational Efficiency",
  "innovation": "Innovation",
  "governance-compliance": "Governance & Compliance",
  "data-analytics": "Data & Analytics",
  "channel-strategy": "Channel Strategy",
};

export default function ScoringPage() {
  const [methodology, setMethodology] = useState<Methodology | null>(null);
  const [localWeights, setLocalWeights] = useState<{ dimension: string; weight: number }[]>([]);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchMethodology = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/scoring");
      if (res.ok) {
        const data: Methodology = await res.json();
        setMethodology(data);
        setLocalWeights(data.weights.map((w) => ({ dimension: w.dimension, weight: w.weight })));
      }
    } catch { /* ignore */ }
  }, []);

  const fetchPreview = useCallback(async (weights: { dimension: string; weight: number }[]) => {
    try {
      const res = await fetch("/api/admin/scoring/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreview(data.preview ?? []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchMethodology();
  }, [fetchMethodology]);

  useEffect(() => {
    if (localWeights.length > 0) fetchPreview(localWeights);
  }, [localWeights, fetchPreview]);

  function updateWeight(dimension: string, weight: number) {
    setLocalWeights((prev) => prev.map((w) => (w.dimension === dimension ? { ...w, weight } : w)));
    setDirty(true);
  }

  async function saveWeights() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/scoring", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights: localWeights }),
      });
      if (res.ok) {
        const data = await res.json();
        setMethodology(data);
        setDirty(false);
      }
    } finally {
      setSaving(false);
    }
  }

  const totalWeight = localWeights.reduce((sum, w) => sum + w.weight, 0);

  return (
    <>
      <PageHeader
        title="Scoring Methodology"
        description="Configure benchmark dimension weights and review scoring impact."
      />

      {methodology && (
        <>
          {/* Methodology info */}
          <Card variant="glass" padding="lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-cream">
                  <Scale size={18} className="mr-2 inline-block" />
                  {methodology.name}
                </h3>
                {methodology.description && (
                  <p className="mt-1 text-sm text-gray-muted">{methodology.description}</p>
                )}
              </div>
              <Button onClick={saveWeights} disabled={saving || !dirty}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Weights
              </Button>
            </div>

            <div className="mt-4 rounded-xl bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-wider text-gray-muted">Scoring Formula</p>
              <p className="mt-2 font-mono text-sm text-cream">
                finalScore = &Sigma;(dimensionScore &times; weight) / &Sigma;(weights)
              </p>
              <p className="mt-1 text-xs text-gray-muted">
                Total weight: {totalWeight.toFixed(1)} across {localWeights.length} dimensions
              </p>
            </div>
          </Card>

          {/* Weight sliders */}
          <Card variant="glass" padding="lg">
            <h3 className="mb-4 text-lg font-semibold text-cream">Dimension Weights</h3>
            <div className="space-y-5">
              {localWeights.map((w) => (
                <div key={w.dimension}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-cream">
                        {DIMENSION_LABELS[w.dimension] ?? w.dimension}
                      </p>
                      <p className="text-xs text-gray-muted">
                        {methodology.weights.find((mw) => mw.dimension === w.dimension)?.description ?? ""}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-cream tabular-nums">{w.weight.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={0.1}
                    value={w.weight}
                    onChange={(e) => updateWeight(w.dimension, parseFloat(e.target.value))}
                    className="mt-2 w-full accent-gpssa-green"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Live preview */}
          {preview.length > 0 && (
            <Card variant="glass" padding="lg">
              <h3 className="mb-4 text-lg font-semibold text-cream">Score Preview</h3>
              <div className="space-y-3">
                {preview.map((row, i) => (
                  <motion.div
                    key={row.institutionId}
                    layout
                    className="flex items-center gap-4"
                  >
                    <span className="w-6 text-xs text-gray-muted">{i + 1}</span>
                    <span className="w-28 truncate text-sm text-cream">{row.shortName}</span>
                    <div className="flex-1">
                      <div className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full bg-gpssa-green/60"
                          animate={{ width: `${row.weightedScore}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                    <span className="w-12 text-right text-sm font-semibold text-cream tabular-nums">
                      {row.weightedScore}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {!methodology && (
        <Card variant="glass" padding="lg">
          <p className="text-center text-sm text-gray-muted">
            No active scoring methodology found. Run the database seed to create the default methodology.
          </p>
        </Card>
      )}
    </>
  );
}
