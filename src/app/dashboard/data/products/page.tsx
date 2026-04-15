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
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/dashboard/data")} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <PageHeader title="Products" description="Product portfolio with tiers, coverage types, features, and linked citations." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Products" value={products.length} icon={Package} />
        <StatCard label="Active" value={products.filter((p) => p.status === "Active").length} icon={Package} />
        <StatCard label="With Sources" value={products.filter((p) => (p.sourceCitations?.length ?? 0) > 0).length} icon={Link2} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-cream placeholder:text-gray-muted focus:outline-none focus:border-adl-blue/40"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none cursor-pointer"
        >
          {tiers.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span className="text-xs text-gray-muted">{filtered.length} of {products.length}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products" description="No product data available yet." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium w-8" />
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Product Name</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Tier</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Status</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Coverage</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden lg:table-cell">Sources</th>
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
          </div>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-xs text-gray-muted">No products match your search.</p>
          )}
        </Card>
      )}
    </div>
  );
}
