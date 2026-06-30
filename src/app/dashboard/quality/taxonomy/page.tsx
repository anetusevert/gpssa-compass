"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronDown, Network, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SeverityChip } from "@/components/quality/RiskChip";
import { ParetoChart, type ParetoDatum } from "@/components/quality/ParetoChart";

const EASE = [0.16, 1, 0.3, 1] as const;

interface TaxNode {
  id: string;
  code: string;
  name: string;
  severity: string;
  category: string | null;
  description: string | null;
  defectCount: number;
  children: TaxNode[];
}

export default function TaxonomyPage() {
  const [tree, setTree] = useState<TaxNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/quality/taxonomy", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { tree: [] }))
      .then((data) => {
        const t: TaxNode[] = Array.isArray(data.tree) ? data.tree : [];
        setTree(t);
        // Expand all top categories by default.
        const exp: Record<string, boolean> = {};
        for (const n of t) exp[n.id] = true;
        setExpanded(exp);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build Pareto from leaf nodes, descending by defect count.
  const pareto = useMemo<ParetoDatum[]>(() => {
    const leaves: { label: string; count: number }[] = [];
    for (const top of tree) {
      for (const child of top.children) {
        if (child.defectCount > 0) leaves.push({ label: child.name, count: child.defectCount });
      }
    }
    leaves.sort((a, b) => b.count - a.count);
    const total = leaves.reduce((s, l) => s + l.count, 0) || 1;
    let cum = 0;
    return leaves.map((l) => {
      cum += l.count;
      const cumulativePct = Math.round((cum / total) * 1000) / 10;
      return {
        label: l.label,
        count: l.count,
        cumulativePct,
        vital: cumulativePct - (l.count / total) * 100 < 80, // bars up to the 80% line
      };
    });
  }, [tree]);

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
        title="Error Taxonomy"
        description="A shared, severity-tiered defect taxonomy across QA and fulfilment — analysed with Pareto to focus corrective action on the vital few."
        badge={{ label: "Pareto 80/20", variant: "gold" }}
      />

      {/* Pareto chart */}
      <Card variant="glass" padding="md">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 size={16} className="text-teal-400" />
          <h3 className="font-playfair text-base font-semibold text-cream">
            Defect Pareto — the vital few
          </h3>
        </div>
        {pareto.length > 0 ? (
          <ParetoChart data={pareto} />
        ) : (
          <p className="text-sm text-gray-muted">No defects recorded yet.</p>
        )}
        <p className="mt-2 text-[11px] text-gray-muted">
          Highlighted bars are the categories that together account for roughly the first 80% of defect
          volume — the focus list for root-cause and corrective action.
        </p>
      </Card>

      {/* Collapsible tree */}
      <Card variant="glass" padding="md">
        <div className="mb-3 flex items-center gap-2">
          <Network size={16} className="text-teal-400" />
          <h3 className="font-playfair text-base font-semibold text-cream">Taxonomy tree</h3>
        </div>
        <div className="space-y-2">
          {tree.map((node, i) => {
            const open = expanded[node.id] ?? false;
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i, ease: EASE }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02]"
              >
                <button
                  onClick={() => setExpanded((m) => ({ ...m, [node.id]: !open }))}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
                >
                  {open ? (
                    <ChevronDown size={15} className="shrink-0 text-gray-muted" />
                  ) : (
                    <ChevronRight size={15} className="shrink-0 text-gray-muted" />
                  )}
                  <span className="font-mono text-[10px] text-cream/50">{node.code}</span>
                  <span className="font-medium text-cream">{node.name}</span>
                  <SeverityChip severity={node.severity} />
                  <span className="ml-auto text-xs text-gray-muted">
                    {node.defectCount} defect{node.defectCount === 1 ? "" : "s"}
                  </span>
                </button>
                {open && node.children.length > 0 && (
                  <div className="space-y-1 px-3 pb-3 pl-9">
                    {node.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2"
                      >
                        <span className="font-mono text-[10px] text-cream/40">{child.code}</span>
                        <span className="text-sm text-cream/80">{child.name}</span>
                        <SeverityChip severity={child.severity} />
                        <span className="ml-auto text-xs text-gray-muted">{child.defectCount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
