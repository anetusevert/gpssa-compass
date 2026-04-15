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
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/dashboard/data")} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <PageHeader title="Services" description="GPSSA service catalog — all services tracked with categories, pain points, and opportunities." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Services" value={services.length} icon={Layers} />
        <StatCard label="Categories" value={categories.length - 1} icon={Layers} />
        <StatCard label="With Sources" value={services.filter((s) => (s.sourceCitations?.length ?? 0) > 0).length} icon={Link2} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-cream placeholder:text-gray-muted focus:outline-none focus:border-adl-blue/40"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none cursor-pointer"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <span className="text-xs text-gray-muted">{filtered.length} of {services.length}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : services.length === 0 ? (
        <EmptyState icon={Layers} title="No services" description="No services have been added yet." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium w-8" />
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Service Name</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Category</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Status</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden lg:table-cell">Sources</th>
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
          </div>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-xs text-gray-muted">No services match your search.</p>
          )}
        </Card>
      )}
    </div>
  );
}
