"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronDown, Network, BarChart3 } from "lucide-react";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SeverityChip } from "@/components/quality/RiskChip";
import { ParetoChart, type ParetoDatum } from "@/components/quality/ParetoChart";
import { staggerChildren, tileItem } from "@/lib/motion";

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

  const totalDefects = useMemo(
    () => tree.reduce((s, n) => s + n.defectCount, 0),
    [tree]
  );

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
            <Network size={16} className="text-teal-400" />
            <h1 className="font-playfair text-sm font-semibold text-cream sm:text-base">
              Error Taxonomy
            </h1>
          </div>
          <span className="text-xs text-gray-muted">Pareto 80/20 on shared defects</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <span className="text-[9px] uppercase tracking-[0.16em] text-white/40">Categories </span>
              <span className="text-xs font-semibold text-cream">{tree.length}</span>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <span className="text-[9px] uppercase tracking-[0.16em] text-white/40">Defects </span>
              <span className="text-xs font-semibold text-cream">{totalDefects}</span>
            </div>
          </div>
        </div>
      }
    >
      <div className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-y-auto pb-4 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] lg:overflow-visible lg:pb-0">
        {/* Left: collapsible tree, scrolling */}
        <div className="glass-card flex min-h-0 flex-col p-4">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <Network size={15} className="text-teal-400" />
            <h3 className="font-playfair text-sm font-semibold text-cream">Taxonomy tree</h3>
          </div>
          <TileScroll className="pr-1">
            <motion.div variants={staggerChildren} initial="hidden" animate="show" className="space-y-2">
              {tree.map((node) => {
                const open = expanded[node.id] ?? false;
                return (
                  <motion.div
                    key={node.id}
                    variants={tileItem}
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
            </motion.div>
          </TileScroll>
        </div>

        {/* Right: Pareto chart, fixed tile */}
        <div className="glass-card flex min-h-0 flex-col p-4">
          <div className="mb-2 flex shrink-0 items-center gap-2">
            <BarChart3 size={15} className="text-teal-400" />
            <h3 className="font-playfair text-sm font-semibold text-cream">
              Defect Pareto — the vital few
            </h3>
          </div>
          <TileScroll className="pr-1">
            {pareto.length > 0 ? (
              <ParetoChart data={pareto} />
            ) : (
              <p className="text-sm text-gray-muted">No defects recorded yet.</p>
            )}
          </TileScroll>
          <p className="mt-2 shrink-0 text-[11px] text-gray-muted">
            Highlighted bars cover the first ~80% of defect volume — the focus list for
            corrective action.
          </p>
        </div>
      </div>
    </PageFrame>
  );
}
