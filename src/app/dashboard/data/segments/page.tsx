"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users2,
  Search,
  ChevronDown,
  ChevronRight,
  Link2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";

interface SegmentRecord {
  id: string;
  segment: string;
  coverageType: string;
  level: string;
  population: string | null;
  notes: string | null;
  researchStatus: string | null;
  createdAt: string;
  sourceCitations?: { id: string; citation: string | null; source: { title: string; url: string } }[];
}

const levelVariant: Record<string, string> = {
  Covered: "green",
  Voluntary: "gold",
  Limited: "blue",
  "Not Covered": "red",
};

export default function SegmentsDataPage() {
  const router = useRouter();
  const [segments, setSegments] = useState<SegmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/products/segments")
      .then((r) => (r.ok ? r.json() : []))
      .then(setSegments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const levels = useMemo(() => {
    const set = new Set(segments.map((s) => s.level));
    return ["All", ...Array.from(set).sort()];
  }, [segments]);

  const filtered = useMemo(() => {
    return segments.filter((s) => {
      const matchSearch =
        !search ||
        s.segment.toLowerCase().includes(search.toLowerCase()) ||
        s.coverageType.toLowerCase().includes(search.toLowerCase()) ||
        (s.notes ?? "").toLowerCase().includes(search.toLowerCase());
      const matchLevel = levelFilter === "All" || s.level === levelFilter;
      return matchSearch && matchLevel;
    });
  }, [segments, search, levelFilter]);

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const uniqueSegments = new Set(segments.map((s) => s.segment)).size;
  const withSources = segments.filter((s) => (s.sourceCitations?.length ?? 0) > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/dashboard/data")} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <PageHeader title="Segments" description="Segment coverage matrix data with coverage types, levels, and linked citations." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Records" value={segments.length} icon={Users2} />
        <StatCard label="Unique Segments" value={uniqueSegments} icon={Users2} />
        <StatCard label="With Sources" value={withSources} icon={Link2} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search segments..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-cream placeholder:text-gray-muted focus:outline-none focus:border-adl-blue/40"
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none cursor-pointer"
        >
          {levels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <span className="text-xs text-gray-muted">{filtered.length} of {segments.length}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : segments.length === 0 ? (
        <EmptyState icon={Users2} title="No segments" description="No segment coverage data available yet. Run the Segment Coverage Research Agent to populate." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium w-8" />
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Segment</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Coverage Type</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Level</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Population</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden lg:table-cell">Sources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((seg) => {
                  const isExpanded = expandedRows.has(seg.id);
                  return (
                    <AnimatePresence key={seg.id}>
                      <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleRow(seg.id)}>
                        <td className="py-2.5 px-3">
                          {isExpanded ? <ChevronDown size={14} className="text-gray-muted" /> : <ChevronRight size={14} className="text-gray-muted" />}
                        </td>
                        <td className="py-2.5 px-3 text-cream font-medium">{seg.segment}</td>
                        <td className="py-2.5 px-3 text-cream/70 text-xs">{seg.coverageType}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={(levelVariant[seg.level] ?? "gray") as "green" | "gold" | "blue" | "red" | "gray"} size="sm">{seg.level}</Badge>
                        </td>
                        <td className="py-2.5 px-3 hidden md:table-cell text-xs text-cream/70">{seg.population ?? "—"}</td>
                        <td className="py-2.5 px-3 hidden lg:table-cell"><Badge variant="gray" size="sm">{seg.sourceCitations?.length ?? 0}</Badge></td>
                      </tr>
                      {isExpanded && (
                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td colSpan={6} className="px-6 py-4 bg-white/[0.01]">
                            <div className="grid gap-4 md:grid-cols-2">
                              {seg.notes && (
                                <div className="md:col-span-2">
                                  <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Notes</p>
                                  <p className="text-xs text-cream/80 leading-relaxed">{seg.notes}</p>
                                </div>
                              )}
                              {(seg.sourceCitations?.length ?? 0) > 0 && (
                                <div className="md:col-span-2">
                                  <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Linked Sources</p>
                                  <div className="space-y-1">
                                    {seg.sourceCitations!.map((c) => (
                                      <div key={c.id} className="flex items-start gap-2 text-[11px]">
                                        <Link2 size={11} className="text-adl-blue mt-0.5 shrink-0" />
                                        <a href={c.source.url} target="_blank" rel="noopener noreferrer" className="text-adl-blue hover:underline">
                                          {c.source.title}
                                        </a>
                                        {c.citation && <span className="text-gray-muted">— {c.citation}</span>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-xs text-gray-muted">No segments match your search.</p>
          )}
        </Card>
      )}
    </div>
  );
}
