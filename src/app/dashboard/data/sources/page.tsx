"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Plus,
  Link2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";

interface SourceRecord {
  id: string;
  title: string;
  url: string;
  publisher: string | null;
  sourceType: string;
  description: string | null;
  region: string | null;
  createdAt: string;
  _count?: {
    serviceCitations: number;
    institutionCitations: number;
    opportunityCitations: number;
    requirementCitations: number;
    productCitations: number;
    segmentCitations: number;
    innovationCitations: number;
    channelCitations: number;
    personaCitations: number;
    deliveryModelCitations: number;
    intlServiceCitations: number;
    intlProductCitations: number;
    intlSegmentCitations: number;
    countryCitations: number;
  };
}

interface LinkedEntity {
  kind: string;
  citation: string | null;
  evidenceNote: string | null;
  entity: Record<string, unknown> | null;
}

interface LinkedEntities {
  services: LinkedEntity[];
  institutions: LinkedEntity[];
  opportunities: LinkedEntity[];
  requirements: LinkedEntity[];
  products: LinkedEntity[];
  segments: LinkedEntity[];
  innovations: LinkedEntity[];
  channels: LinkedEntity[];
  personas: LinkedEntity[];
  deliveryModels: LinkedEntity[];
  intlServices: LinkedEntity[];
  intlProducts: LinkedEntity[];
  intlSegments: LinkedEntity[];
  countries: LinkedEntity[];
}

const CITATION_LABELS: Array<{ key: keyof NonNullable<SourceRecord["_count"]>; label: string; bucket: keyof LinkedEntities }> = [
  { key: "countryCitations", label: "Countries", bucket: "countries" },
  { key: "institutionCitations", label: "Institutions", bucket: "institutions" },
  { key: "serviceCitations", label: "GPSSA Services", bucket: "services" },
  { key: "productCitations", label: "Products", bucket: "products" },
  { key: "segmentCitations", label: "Segments", bucket: "segments" },
  { key: "innovationCitations", label: "Innovations", bucket: "innovations" },
  { key: "channelCitations", label: "Channels", bucket: "channels" },
  { key: "personaCitations", label: "Personas", bucket: "personas" },
  { key: "deliveryModelCitations", label: "Delivery Models", bucket: "deliveryModels" },
  { key: "intlServiceCitations", label: "Intl. Services", bucket: "intlServices" },
  { key: "intlProductCitations", label: "Intl. Products", bucket: "intlProducts" },
  { key: "intlSegmentCitations", label: "Intl. Segments", bucket: "intlSegments" },
  { key: "opportunityCitations", label: "Opportunities", bucket: "opportunities" },
  { key: "requirementCitations", label: "Requirements", bucket: "requirements" },
];

const typeColor: Record<string, string> = { report: "gold", paper: "blue", database: "green", website: "gray" };

const EMPTY_SOURCE = { title: "", url: "", publisher: "", sourceType: "website", description: "", region: "" };

export default function SourcesDataPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceForm, setSourceForm] = useState({ ...EMPTY_SOURCE });
  const [savingSource, setSavingSource] = useState(false);

  const [linkedById, setLinkedById] = useState<Record<string, LinkedEntities>>({});
  const [linkedLoading, setLinkedLoading] = useState<Set<string>>(new Set());

  async function fetchSources() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data/sources");
      if (res.ok) setSources(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchSources(); }, []);

  const types = useMemo(() => {
    const set = new Set(sources.map((s) => s.sourceType));
    return ["All", ...Array.from(set).sort()];
  }, [sources]);

  const filtered = useMemo(() => {
    return sources.filter((src) => {
      const matchSearch =
        !search ||
        src.title.toLowerCase().includes(search.toLowerCase()) ||
        (src.publisher ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (src.description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All" || src.sourceType === typeFilter;
      return matchSearch && matchType;
    });
  }, [sources, search, typeFilter]);

  const sumCitations = (c: SourceRecord["_count"]): number => {
    if (!c) return 0;
    return CITATION_LABELS.reduce((acc, def) => acc + (c[def.key] ?? 0), 0);
  };

  const totalCitations = useMemo(() => {
    return sources.reduce((acc, s) => acc + sumCitations(s._count), 0);
  }, [sources]);

  async function ensureLinkedLoaded(id: string) {
    if (linkedById[id] || linkedLoading.has(id)) return;
    setLinkedLoading((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/data/sources/${id}/linked`);
      if (res.ok) {
        const data = (await res.json()) as LinkedEntities;
        setLinkedById((prev) => ({ ...prev, [id]: data }));
      }
    } catch { /* ignore */ } finally {
      setLinkedLoading((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        ensureLinkedLoaded(id);
      }
      return next;
    });
  }

  function entityLabel(kind: string, entity: Record<string, unknown> | null): string {
    if (!entity) return "(deleted)";
    const name = (entity.name as string | undefined) ?? (entity.title as string | undefined) ?? (entity.segment as string | undefined);
    const country = (entity.countryIso3 as string | undefined) ?? (entity.iso3 as string | undefined) ?? ((entity.country as { iso3?: string } | undefined)?.iso3);
    const base = name ?? `${kind}:${(entity.id as string | undefined) ?? "?"}`;
    return country ? `${base} (${country})` : base;
  }

  async function handleAddSource() {
    if (!sourceForm.title || !sourceForm.url) return;
    setSavingSource(true);
    try {
      const res = await fetch("/api/admin/data/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sourceForm),
      });
      if (res.ok) {
        setShowAddSource(false);
        setSourceForm({ ...EMPTY_SOURCE });
        fetchSources();
      }
    } catch { /* ignore */ } finally {
      setSavingSource(false);
    }
  }

  function citationTotal(src: SourceRecord) {
    return sumCitations(src._count);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/dashboard/data")} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <PageHeader title="Sources" description="Data sources, research references, and citation links backing all research data." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Sources" value={sources.length} icon={BookOpen} />
        <StatCard label="Total Citations" value={totalCitations} icon={Link2} />
        <StatCard label="Source Types" value={types.length - 1} icon={BookOpen} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sources..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-cream placeholder:text-gray-muted focus:outline-none focus:border-adl-blue/40"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none cursor-pointer"
        >
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {isAdmin && (
          <Button onClick={() => setShowAddSource(true)} variant="secondary" size="sm">
            <Plus size={14} /> Add Source
          </Button>
        )}
        <span className="text-xs text-gray-muted">{filtered.length} of {sources.length}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : sources.length === 0 ? (
        <EmptyState icon={BookOpen} title="No sources" description="No data sources have been added yet." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium w-8" />
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Title</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Publisher</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Type</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden lg:table-cell">Region</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Citations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((src) => {
                  const isExpanded = expandedRows.has(src.id);
                  const citations = citationTotal(src);
                  return (
                    <AnimatePresence key={src.id}>
                      <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleRow(src.id)}>
                        <td className="py-2.5 px-3">
                          {isExpanded ? <ChevronDown size={14} className="text-gray-muted" /> : <ChevronRight size={14} className="text-gray-muted" />}
                        </td>
                        <td className="py-2.5 px-3 text-cream font-medium max-w-xs truncate">{src.title}</td>
                        <td className="py-2.5 px-3 hidden md:table-cell text-xs text-cream/70">{src.publisher ?? "—"}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={(typeColor[src.sourceType] ?? "gray") as "gold" | "blue" | "green" | "gray"} size="sm">{src.sourceType}</Badge>
                        </td>
                        <td className="py-2.5 px-3 hidden lg:table-cell text-xs text-cream/70">{src.region ?? "—"}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={citations > 0 ? "green" : "gray"} size="sm">{citations}</Badge>
                        </td>
                      </tr>
                      {isExpanded && (
                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td colSpan={6} className="px-6 py-4 bg-white/[0.01]">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">URL</p>
                                <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-xs text-adl-blue hover:underline inline-flex items-center gap-1 break-all">
                                  {src.url} <ExternalLink size={10} />
                                </a>
                              </div>
                              {src.description && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Description</p>
                                  <p className="text-xs text-cream/80 leading-relaxed">{src.description}</p>
                                </div>
                              )}
                              <div className="md:col-span-2">
                                <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Citation Breakdown</p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  {CITATION_LABELS.map((def) => {
                                    const count = src._count?.[def.key] ?? 0;
                                    if (count === 0) return null;
                                    return (
                                      <span key={def.key} className="text-cream/70 px-2 py-0.5 rounded-md bg-white/5">
                                        {def.label}: <span className="font-semibold text-cream">{count}</span>
                                      </span>
                                    );
                                  })}
                                  {citations === 0 && <span className="text-xs text-gray-muted">No citations yet.</span>}
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Added</p>
                                <p className="text-xs text-cream/70">{new Date(src.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">Linked Entities</p>
                                {linkedLoading.has(src.id) && !linkedById[src.id] ? (
                                  <div className="text-xs text-gray-muted">Loading…</div>
                                ) : linkedById[src.id] ? (
                                  <div className="space-y-2">
                                    {CITATION_LABELS.map((def) => {
                                      const items = linkedById[src.id][def.bucket];
                                      if (!items || items.length === 0) return null;
                                      return (
                                        <div key={def.bucket}>
                                          <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-1">{def.label} <span className="text-cream/40">({items.length})</span></p>
                                          <div className="flex flex-wrap gap-1.5">
                                            {items.slice(0, 30).map((item, idx) => (
                                              <span
                                                key={`${def.bucket}-${idx}`}
                                                title={item.evidenceNote ?? item.citation ?? ""}
                                                className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-cream/80"
                                              >
                                                {entityLabel(def.bucket, item.entity)}
                                              </span>
                                            ))}
                                            {items.length > 30 && (
                                              <span className="text-[11px] text-gray-muted">+{items.length - 30} more</span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-muted">No linked-entity data available.</div>
                                )}
                              </div>
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
            <p className="text-center py-8 text-xs text-gray-muted">No sources match your search.</p>
          )}
        </Card>
      )}

      {/* Add Source Modal */}
      <Modal
        isOpen={showAddSource}
        onClose={() => setShowAddSource(false)}
        title="Add Data Source"
        size="md"
      >
        <div className="space-y-4 p-2">
          <div>
            <label className="block text-xs text-gray-muted mb-1">Title *</label>
            <input
              type="text"
              value={sourceForm.title}
              onChange={(e) => setSourceForm({ ...sourceForm, title: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none focus:border-adl-blue/40"
              placeholder="Source title"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1">URL *</label>
            <input
              type="url"
              value={sourceForm.url}
              onChange={(e) => setSourceForm({ ...sourceForm, url: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none focus:border-adl-blue/40"
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-muted mb-1">Publisher</label>
              <input
                type="text"
                value={sourceForm.publisher}
                onChange={(e) => setSourceForm({ ...sourceForm, publisher: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none focus:border-adl-blue/40"
                placeholder="Organization name"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-muted mb-1">Type</label>
              <select
                value={sourceForm.sourceType}
                onChange={(e) => setSourceForm({ ...sourceForm, sourceType: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none cursor-pointer"
              >
                <option value="website">Website</option>
                <option value="report">Report</option>
                <option value="paper">Paper</option>
                <option value="database">Database</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1">Description</label>
            <textarea
              value={sourceForm.description}
              onChange={(e) => setSourceForm({ ...sourceForm, description: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none focus:border-adl-blue/40 h-20 resize-none"
              placeholder="Brief description..."
            />
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1">Region</label>
            <input
              type="text"
              value={sourceForm.region}
              onChange={(e) => setSourceForm({ ...sourceForm, region: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream focus:outline-none focus:border-adl-blue/40"
              placeholder="e.g. Middle East, Europe"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowAddSource(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddSource} loading={savingSource} disabled={!sourceForm.title || !sourceForm.url}>
              Add Source
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
