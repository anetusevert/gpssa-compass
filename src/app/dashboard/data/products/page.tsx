"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Package,
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

interface ProductRecord {
  id: string;
  name: string;
  tier: string;
  status: string;
  description: string | null;
  targetSegments: string[];
  coverageType: string | null;
  keyFeatures: string[];
  researchStatus: string | null;
  createdAt: string;
  sourceCitations?: { id: string; citation: string | null; source: { title: string; url: string } }[];
}

const tierVariant: Record<string, string> = { Core: "green", Complementary: "blue", "Non-Core": "gray" };
const statusVariant: Record<string, string> = { Active: "green", Pilot: "blue", Planned: "gold", Concept: "gray" };

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">{label}</p>
      <p className="text-sm font-semibold text-cream tabular-nums">{value}</p>
    </div>
  );
}

const TH = "text-left py-2.5 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium sticky top-0 z-10 bg-[#081226]";

export default function ProductsDataPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : []))
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tiers = useMemo(() => {
    const set = new Set(products.map((p) => p.tier));
    return ["All", ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (p.coverageType ?? "").toLowerCase().includes(search.toLowerCase());
      const matchTier = tierFilter === "All" || p.tier === tierFilter;
      return matchSearch && matchTier;
    });
  }, [products, search, tierFilter]);

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
          <div className="shrink-0 rounded-lg border border-gold/20 bg-gold/10 p-1.5">
            <Package size={14} className="text-gold" />
          </div>
          <div className="min-w-0">
            <h1 className="font-playfair text-sm font-bold leading-tight text-cream sm:text-base">Products</h1>
            <p className="hidden truncate text-[10px] text-gray-muted sm:block">Portfolio tiers, coverage and citations</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <StatChip label="Products" value={products.length} />
            <StatChip label="Active" value={products.filter((p) => p.status === "Active").length} />
            <StatChip label="Sourced" value={products.filter((p) => (p.sourceCitations?.length ?? 0) > 0).length} />
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
              placeholder="Search products..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-cream placeholder:text-gray-muted focus:border-adl-blue/40 focus:outline-none"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none"
          >
            {tiers.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="text-xs text-gray-muted">{filtered.length} of {products.length}</span>
        </div>

        <motion.div
          variants={fadeRise}
          initial="hidden"
          animate="show"
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]"
        >
          {loading ? (
            <div className="flex flex-1 items-center justify-center"><LoadingSpinner size="lg" /></div>
          ) : products.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState icon={Package} title="No products" description="No product data available yet." />
            </div>
          ) : (
            <TileScroll>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={`${TH} w-8`} />
                    <th className={TH}>Product Name</th>
                    <th className={TH}>Tier</th>
                    <th className={TH}>Status</th>
                    <th className={`${TH} hidden md:table-cell`}>Coverage</th>
                    <th className={`${TH} hidden lg:table-cell`}>Sources</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((prod) => {
                    const isExpanded = expandedRows.has(prod.id);
                    return (
                      <AnimatePresence key={prod.id}>
                        <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleRow(prod.id)}>
                          <td className="py-2.5 px-3">
                            {isExpanded ? <ChevronDown size={14} className="text-gray-muted" /> : <ChevronRight size={14} className="text-gray-muted" />}
                          </td>
                          <td className="py-2.5 px-3 text-cream font-medium">{prod.name}</td>
                          <td className="py-2.5 px-3"><Badge variant={(tierVariant[prod.tier] ?? "gray") as "green" | "blue" | "gray"} size="sm">{prod.tier}</Badge></td>
                          <td className="py-2.5 px-3"><Badge variant={(statusVariant[prod.status] ?? "gray") as "green" | "blue" | "gold" | "gray"} size="sm">{prod.status}</Badge></td>
                          <td className="py-2.5 px-3 hidden md:table-cell text-xs text-cream/70">{prod.coverageType ?? "—"}</td>
                          <td className="py-2.5 px-3 hidden lg:table-cell"><Badge variant="gray" size="sm">{prod.sourceCitations?.length ?? 0}</Badge></td>
                        </tr>
                        {isExpanded && (
                          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <td colSpan={6} className="px-6 py-4 bg-white/[0.01]">
                              <div className="grid gap-4 md:grid-cols-2">
                                {prod.description && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Description</p>
                                    <p className="text-xs text-cream/80 leading-relaxed">{prod.description}</p>
                                  </div>
                                )}
                                {prod.targetSegments.length > 0 && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Target Segments</p>
                                    <div className="flex flex-wrap gap-1">
                                      {prod.targetSegments.map((seg) => <Badge key={seg} variant="blue" size="sm">{seg}</Badge>)}
                                    </div>
                                  </div>
                                )}
                                {prod.keyFeatures.length > 0 && (
                                  <div className="md:col-span-2">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Key Features</p>
                                    <ul className="space-y-0.5">
                                      {prod.keyFeatures.map((feat, idx) => (
                                        <li key={idx} className="text-xs text-cream/80 flex items-start gap-1.5">
                                          <span className="text-gold mt-0.5">•</span> {feat}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {(prod.sourceCitations?.length ?? 0) > 0 && (
                                  <div className="md:col-span-2">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Linked Sources</p>
                                    <div className="space-y-1">
                                      {prod.sourceCitations!.map((c) => (
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
                <p className="text-center py-8 text-xs text-gray-muted">No products match your search.</p>
              )}
            </TileScroll>
          )}
        </motion.div>
      </div>
    </PageFrame>
  );
}
