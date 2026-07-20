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
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { fadeRise } from "@/lib/motion";

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

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="text-sm font-semibold text-cream tabular-nums">{value}</p>
    </div>
  );
}

const TH = "text-left py-2.5 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium sticky top-0 z-10 bg-[#081226]";

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
    <PageFrame
      header={
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-3">
          <button onClick={() => router.push("/dashboard/data")} className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-white/10">
            <ArrowLeft className="h-4 w-4 text-white/60" />
          </button>
          <div className="shrink-0 rounded-lg border border-gpssa-green/20 bg-gpssa-green/10 p-1.5">
            <Building2 size={14} className="text-gpssa-green" />
          </div>
          <div className="min-w-0">
            <h1 className="font-playfair text-sm font-bold leading-tight text-cream sm:text-base">Institutions</h1>
            <p className="hidden truncate text-[10px] text-gray-muted sm:block">Pension institutions tracked worldwide</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <StatChip label="Institutions" value={institutions.length} />
            <StatChip label="Countries" value={countryCount} />
            <StatChip label="Benchmarks" value={institutions.filter((i) => i.isBenchmarkTarget).length} />
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
              placeholder="Search institutions..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-cream placeholder:text-gray-muted focus:border-adl-blue/40 focus:outline-none"
            />
          </div>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none"
          >
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <span className="text-xs text-gray-muted">{filtered.length} of {institutions.length}</span>
        </div>

        <motion.div
          variants={fadeRise}
          initial="hidden"
          animate="show"
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]"
        >
          {loading ? (
            <div className="flex flex-1 items-center justify-center"><LoadingSpinner size="lg" /></div>
          ) : institutions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState icon={Building2} title="No institutions" description="No institution data has been researched yet." />
            </div>
          ) : (
            <TileScroll>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={`${TH} w-8`} />
                    <th className={TH}>Institution</th>
                    <th className={TH}>Country</th>
                    <th className={`${TH} hidden md:table-cell`}>Region</th>
                    <th className={`${TH} hidden lg:table-cell`}>Website</th>
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
              {filtered.length === 0 && (
                <p className="text-center py-8 text-xs text-gray-muted">No institutions match your search.</p>
              )}
            </TileScroll>
          )}
        </motion.div>
      </div>
    </PageFrame>
  );
}
