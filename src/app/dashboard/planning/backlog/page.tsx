"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ListOrdered, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { BacklogTable, type BacklogItem } from "@/components/roadmap/BacklogTable";

interface BacklogRow extends BacklogItem {
  description: string | null;
  conceptSheet: string | null;
}

const EFFORT_X: Record<string, number> = { low: 1, medium: 2, high: 3 };
const IMPACT_Y: Record<string, number> = { low: 1, medium: 2, high: 3 };

export default function BacklogPage() {
  const [items, setItems] = useState<BacklogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"rice" | "wsjf">("rice");
  const [conceptId, setConceptId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/roadmap/backlog")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Sorted view (drag-rank works on the displayed order).
  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const av = sortBy === "rice" ? a.riceScore ?? 0 : a.wsjfScore ?? 0;
      const bv = sortBy === "rice" ? b.riceScore ?? 0 : b.wsjfScore ?? 0;
      return bv - av;
    });
  }, [items, sortBy]);

  // Local working order for the drag list (seeded from the sorted view).
  const [order, setOrder] = useState<BacklogRow[]>([]);
  useEffect(() => {
    setOrder(sorted);
  }, [sorted]);

  const scatterData = items.map((i) => ({
    x: EFFORT_X[i.effort] ?? 2,
    y: IMPACT_Y[i.impact] ?? 2,
    z: i.riceScore ?? 1,
    name: i.title,
    category: i.category,
  }));

  const concept = items.find((i) => i.id === conceptId) ?? null;
  const parsedConcept = concept?.conceptSheet
    ? safeParse(concept.conceptSheet)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunity Backlog"
        description="Prioritised with RICE and WSJF (RFP Part C). Drag to re-rank, toggle the scoring lens, and open concept sheets."
        badge={{ label: "Prioritisation", variant: "gold" }}
        actions={
          <Tabs
            variant="pills"
            tabs={[
              { id: "rice", label: "RICE" },
              { id: "wsjf", label: "WSJF" },
            ]}
            activeTab={sortBy}
            onChange={(id) => setSortBy(id as "rice" | "wsjf")}
          />
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ListOrdered}
          title="No opportunities yet"
          description="Seed the Roadmap & Governance module to populate the backlog."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card padding="lg" className="lg:col-span-2">
            <h2 className="mb-4 font-playfair text-lg font-semibold text-cream">
              Ranked backlog
            </h2>
            <BacklogTable
              items={order}
              onReorder={(next) => setOrder(next as BacklogRow[])}
              onOpenConcept={setConceptId}
            />
          </Card>

          <Card padding="lg">
            <h2 className="mb-1 font-playfair text-lg font-semibold text-cream">
              Impact vs Effort
            </h2>
            <p className="mb-3 text-xs text-gray-muted">
              Bubble size = RICE. Top-left = quick wins.
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeOpacity={0.1} />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Effort"
                    domain={[0.5, 3.5]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(v) => ["", "Low", "Med", "High"][v] ?? ""}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    label={{
                      value: "Effort →",
                      position: "insideBottom",
                      offset: -8,
                      fill: "#9ca3af",
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Impact"
                    domain={[0.5, 3.5]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(v) => ["", "Low", "Med", "High"][v] ?? ""}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                  />
                  <ZAxis type="number" dataKey="z" range={[60, 400]} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      background: "#0f1729",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(_v, _n, p) => {
                      const d = p.payload;
                      return [`RICE ${Math.round(d.z)}`, d.name];
                    }}
                  />
                  <Scatter data={scatterData}>
                    {scatterData.map((_, i) => (
                      <Cell key={i} fill="#C5A572" fillOpacity={0.75} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      <Modal
        isOpen={Boolean(concept)}
        onClose={() => setConceptId(null)}
        title={concept?.title}
        description={concept?.category}
        size="lg"
      >
        {parsedConcept ? (
          <div className="space-y-4 text-sm">
            <ConceptField label="Problem" value={parsedConcept.problem} />
            <ConceptField label="Proposition" value={parsedConcept.proposition} />
            <ConceptField
              label="Target segment"
              value={parsedConcept.targetSegment}
            />
            <ConceptList label="Key features" items={parsedConcept.keyFeatures} />
            <ConceptList
              label="Success metrics"
              items={parsedConcept.successMetrics}
            />
            <ConceptField
              label="Estimated benefit"
              value={parsedConcept.estimatedBenefit}
            />
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-gray-muted">
            <Sparkles size={16} /> No concept sheet content available.
          </p>
        )}
      </Modal>
    </div>
  );
}

function ConceptField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-muted">
        {label}
      </p>
      <p className="text-cream">{value}</p>
    </div>
  );
}

function ConceptList({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-muted">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2 text-cream">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gpssa-green" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ParsedConcept {
  problem?: string;
  proposition?: string;
  targetSegment?: string;
  keyFeatures?: string[];
  successMetrics?: string[];
  estimatedBenefit?: string;
}

function safeParse(value: string): ParsedConcept | null {
  try {
    return JSON.parse(value) as ParsedConcept;
  } catch {
    return null;
  }
}
