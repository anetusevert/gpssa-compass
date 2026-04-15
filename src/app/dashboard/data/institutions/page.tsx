"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Globe,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { CountryFlag } from "@/components/ui/CountryFlag";

interface Institution {
  id: string;
  name: string;
  shortName?: string | null;
  country: string;
  countryCode: string;
  region: string;
  description?: string | null;
  services?: string | null;
  digitalMaturity?: string | null;
  keyInnovations?: string | null;
  aiAnalysis?: string | null;
  websiteUrl?: string | null;
  isBenchmarkTarget?: boolean;
  createdAt: string;
}

function parseJsonField(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export default function InstitutionsDataPage() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/research/institutions")
      .then((r) => (r.ok ? r.json() : []))
      .then(setInstitutions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const regions = useMemo(() => {
    const set = new Set(institutions.map((i) => i.region));
    return ["All", ...Array.from(set).sort()];
  }, [institutions]);

  const filtered = useMemo(() => {
    return institutions.filter((inst) => {
      const matchSearch =
        !search ||
        inst.name.toLowerCase().includes(search.toLowerCase()) ||
        inst.country.toLowerCase().includes(search.toLowerCase()) ||
        (inst.shortName ?? "").toLowerCase().includes(search.toLowerCase());
      const matchRegion = regionFilter === "All" || inst.region === regionFilter;
      return matchSearch && matchRegion;
    });
  }, [institutions, search, regionFilter]);

  const countryCount = useMemo(() => new Set(institutions.map((i) => i.country)).size, [institutions]);

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
        <PageHeader title="Institutions" description="All pension institutions and social security organizations tracked across countries." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Institutions" value={institutions.length} icon={Building2} />
        <StatCard label="Countries" value={countryCount} icon={Globe} />
        <StatCard label="Benchmark Targets" value={institutions.filter((i) => i.isBenchmarkTarget).length} icon={Building2} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search institutions..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-cream placeholder:text-gray-muted focus:outline-none focus:border-adl-blue/40"
          />
        </div>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none cursor-pointer"
        >
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <span className="text-xs text-gray-muted">{filtered.length} of {institutions.length}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : institutions.length === 0 ? (
        <EmptyState icon={Building2} title="No institutions" description="No institution data has been researched yet." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium w-8" />
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Institution</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Country</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Region</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden lg:table-cell">Website</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((inst) => {
                  const isExpanded = expandedRows.has(inst.id);
                  const innovations = parseJsonField(inst.keyInnovations);
                  return (
                    <AnimatePresence key={inst.id}>
                      <tr
                        className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => toggleRow(inst.id)}
                      >
                        <td className="py-2.5 px-3">
                          {isExpanded ? <ChevronDown size={14} className="text-gray-muted" /> : <ChevronRight size={14} className="text-gray-muted" />}
                        </td>
                        <td className="py-2.5 px-3">
                          <div>
                            <p className="text-cream font-medium">{inst.name}</p>
                            {inst.shortName && <p className="text-[10px] text-gray-muted">{inst.shortName}</p>}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="flex items-center gap-1.5">
                            <CountryFlag code={inst.countryCode} size="xs" />
                            <span className="text-cream">{inst.country}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 hidden md:table-cell">
                          <Badge variant="blue" size="sm">{inst.region}</Badge>
                        </td>
                        <td className="py-2.5 px-3 hidden lg:table-cell">
                          {inst.websiteUrl ? (
                            <a
                              href={inst.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-adl-blue hover:underline text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visit <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-gray-muted/50 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td colSpan={5} className="px-6 py-4 bg-white/[0.01]">
                            <div className="grid gap-4 md:grid-cols-2">
                              {inst.description && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Description</p>
                                  <p className="text-xs text-cream/80 leading-relaxed">{inst.description}</p>
                                </div>
                              )}
                              {inst.digitalMaturity && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Digital Maturity</p>
                                  <p className="text-xs text-cream/80">{inst.digitalMaturity}</p>
                                </div>
                              )}
                              {innovations.length > 0 && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Key Innovations</p>
                                  <ul className="space-y-0.5">
                                    {innovations.map((item, idx) => (
                                      <li key={idx} className="text-xs text-cream/80 flex items-start gap-1.5">
                                        <span className="text-gpssa-green mt-0.5">•</span> {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {inst.aiAnalysis && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">AI Analysis</p>
                                  <p className="text-xs text-cream/80 leading-relaxed">{inst.aiAnalysis}</p>
                                </div>
                              )}
                              {inst.services && (
                                <div className="md:col-span-2">
                                  <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Services</p>
                                  <p className="text-xs text-cream/80 leading-relaxed">{inst.services}</p>
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
            <p className="text-center py-8 text-xs text-gray-muted">No institutions match your search.</p>
          )}
        </Card>
      )}
    </div>
  );
}
