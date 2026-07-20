"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Layers,
  Search,
  ChevronDown,
  ChevronRight,
  Link2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { fadeRise } from "@/lib/motion";

interface ServiceRecord {
  id: string;
  name: string;
  category: string;
  description: string | null;
  userTypes: string[];
  currentState: string | null;
  painPoints: string[];
  opportunities: string[];
  researchStatus: string | null;
  createdAt: string;
  sourceCitations?: { id: string; citation: string | null; source: { title: string; url: string } }[];
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="text-sm font-semibold text-cream tabular-nums">{value}</p>
    </div>
  );
}

const TH = "text-left py-2.5 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium sticky top-0 z-10 bg-[#081226]";

export default function ServicesDataPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/services")
      .then((r) => (r.ok ? r.json() : []))
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(services.map((s) => s.category));
    return ["All", ...Array.from(set).sort()];
  }, [services]);

  const filtered = useMemo(() => {
    return services.filter((svc) => {
      const matchSearch =
        !search ||
        svc.name.toLowerCase().includes(search.toLowerCase()) ||
        (svc.description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "All" || svc.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [services, search, categoryFilter]);

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <PageFrame
      header={
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
          <button onClick={() => router.push("/dashboard/data")} className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 text-white/60" />
          </button>
          <div className="shrink-0 rounded-lg border border-adl-blue/20 bg-adl-blue/10 p-1.5">
            <Layers size={14} className="text-adl-blue" />
          </div>
          <div className="min-w-0">
            <h1 className="font-playfair text-sm font-bold leading-tight text-cream sm:text-base">Services</h1>
            <p className="hidden truncate text-[10px] text-gray-muted sm:block">GPSSA service catalog</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <StatChip label="Services" value={services.length} />
            <StatChip label="Categories" value={categories.length - 1} />
            <StatChip label="Sourced" value={services.filter((s) => (s.sourceCitations?.length ?? 0) > 0).length} />
          </div>
        </div>
      }
    >
      <div className="flex h-full min-h-0 flex-col gap-3 pt-3">
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] max-w-md flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-cream placeholder:text-gray-muted focus:border-adl-blue/40 focus:outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="text-xs text-gray-muted">{filtered.length} of {services.length}</span>
        </div>

        <motion.div
          variants={fadeRise}
          initial="hidden"
          animate="show"
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]"
        >
          {loading ? (
            <div className="flex flex-1 items-center justify-center"><LoadingSpinner size="lg" /></div>
          ) : services.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState icon={Layers} title="No services" description="No services have been added yet." />
            </div>
          ) : (
            <TileScroll>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={`${TH} w-8`} />
                    <th className={TH}>Service Name</th>
                    <th className={TH}>Category</th>
                    <th className={`${TH} hidden md:table-cell`}>Status</th>
                    <th className={`${TH} hidden lg:table-cell`}>Sources</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((svc) => {
                    const isExpanded = expandedRows.has(svc.id);
                    return (
                      <AnimatePresence key={svc.id}>
                        <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleRow(svc.id)}>
                          <td className="py-2.5 px-3">
                            {isExpanded ? <ChevronDown size={14} className="text-gray-muted" /> : <ChevronRight size={14} className="text-gray-muted" />}
                          </td>
                          <td className="py-2.5 px-3 text-cream font-medium">{svc.name}</td>
                          <td className="py-2.5 px-3"><Badge variant="green" size="sm">{svc.category}</Badge></td>
                          <td className="py-2.5 px-3 hidden md:table-cell">
                            <Badge variant={svc.researchStatus === "completed" ? "green" : "gray"} size="sm">
                              {svc.researchStatus ?? "pending"}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 hidden lg:table-cell">
                            <Badge variant="gray" size="sm">{svc.sourceCitations?.length ?? 0}</Badge>
                          </td>
                        </tr>
                        {isExpanded && (
                          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <td colSpan={5} className="px-6 py-4 bg-white/[0.01]">
                              <div className="grid gap-4 md:grid-cols-2">
                                {svc.description && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Description</p>
                                    <p className="text-xs text-cream/80 leading-relaxed">{svc.description}</p>
                                  </div>
                                )}
                                {svc.userTypes.length > 0 && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">User Types</p>
                                    <div className="flex flex-wrap gap-1">
                                      {svc.userTypes.map((ut) => <Badge key={ut} variant="blue" size="sm">{ut}</Badge>)}
                                    </div>
                                  </div>
                                )}
                                {svc.currentState && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Current State</p>
                                    <p className="text-xs text-cream/80 leading-relaxed">{svc.currentState}</p>
                                  </div>
                                )}
                                {svc.painPoints.length > 0 && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Pain Points</p>
                                    <ul className="space-y-0.5">
                                      {svc.painPoints.map((pp, idx) => (
                                        <li key={idx} className="text-xs text-cream/80 flex items-start gap-1.5">
                                          <span className="text-red-400 mt-0.5">•</span> {pp}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {svc.opportunities.length > 0 && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Opportunities</p>
                                    <ul className="space-y-0.5">
                                      {svc.opportunities.map((opp, idx) => (
                                        <li key={idx} className="text-xs text-cream/80 flex items-start gap-1.5">
                                          <span className="text-gpssa-green mt-0.5">•</span> {opp}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {(svc.sourceCitations?.length ?? 0) > 0 && (
                                  <div className="md:col-span-2">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Linked Sources</p>
                                    <div className="space-y-1">
                                      {svc.sourceCitations!.map((c) => (
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
              {filtered.length === 0 && (
                <p className="text-center py-8 text-xs text-gray-muted">No services match your search.</p>
              )}
            </TileScroll>
          )}
        </motion.div>
      </div>
    </PageFrame>
  );
}
