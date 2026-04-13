"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Building2,
  Lightbulb,
  ClipboardList,
  Download,
  Upload,
  Sprout,
  CheckCircle2,
  BarChart3,
  Link2,
  Plus,
  ExternalLink,
  BookOpen,
  Globe,
  FileJson,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
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
  };
}

interface Citation {
  id: string;
  citation: string | null;
  evidenceNote: string | null;
  source: SourceRecord;
}

interface ServiceRecord {
  id: string;
  name: string;
  category: string;
  description: string | null;
  createdAt: string;
  sourceCitations?: Citation[];
}

interface InstitutionRecord {
  id: string;
  name: string;
  country: string;
  region: string;
  websiteUrl: string | null;
  createdAt: string;
  sourceCitations?: Citation[];
}

interface OpportunityRecord {
  id: string;
  title: string;
  category: string;
  impact: string;
  status: string;
  createdAt: string;
  sourceCitations?: Citation[];
}

interface RequirementRecord {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  sourceCitations?: Citation[];
}

type SeedResult = {
  success: boolean;
  created: number;
  skipped: number;
  total: number;
} | null;

const tabs = [
  { id: "services", label: "Services", icon: Layers },
  { id: "institutions", label: "Institutions", icon: Building2 },
  { id: "opportunities", label: "Opportunities", icon: Lightbulb },
  { id: "requirements", label: "Requirements", icon: ClipboardList },
  { id: "sources", label: "Sources", icon: BookOpen },
];

const EMPTY_SOURCE = {
  title: "",
  url: "",
  publisher: "",
  sourceType: "website",
  description: "",
  region: "",
};

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState("services");

  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionRecord[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [requirements, setRequirements] = useState<RequirementRecord[]>([]);
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [seedingServices, setSeedingServices] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult>(null);
  const [seedingInstitutions, setSeedingInstitutions] = useState(false);
  const [instSeedResult, setInstSeedResult] = useState<SeedResult>(null);
  const [seedingBenchmarking, setSeedingBenchmarking] = useState(false);
  const [benchmarkSeedResult, setBenchmarkSeedResult] = useState<SeedResult>(null);

  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceForm, setSourceForm] = useState({ ...EMPTY_SOURCE });
  const [savingSource, setSavingSource] = useState(false);

  const [showCitationModal, setShowCitationModal] = useState(false);
  const [citationEntityType, setCitationEntityType] = useState("");
  const [citationEntityId, setCitationEntityId] = useState("");
  const [citationEntityName, setCitationEntityName] = useState("");
  const [citationSourceId, setCitationSourceId] = useState("");
  const [citationText, setCitationText] = useState("");
  const [citationNote, setCitationNote] = useState("");
  const [savingCitation, setSavingCitation] = useState(false);

  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [svcRes, instRes, oppRes, reqRes, srcRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/research/institutions"),
        fetch("/api/research/opportunities").catch(() => null),
        fetch("/api/admin/requirements"),
        fetch("/api/admin/data/sources"),
      ]);

      if (svcRes.ok) setServices(await svcRes.json());
      if (instRes.ok) setInstitutions(await instRes.json());
      if (oppRes?.ok) setOpportunities(await oppRes.json());
      if (reqRes.ok) setRequirements(await reqRes.json());
      if (srcRes.ok) setSources(await srcRes.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSeedServices() {
    setSeedingServices(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/services/seed", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSeedResult(data);
        const svcRes = await fetch("/api/services");
        if (svcRes.ok) setServices(await svcRes.json());
      }
    } catch { /* ignore */ } finally {
      setSeedingServices(false);
    }
  }

  async function handleSeedInstitutions() {
    setSeedingInstitutions(true);
    setInstSeedResult(null);
    try {
      const res = await fetch("/api/research/institutions/seed", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setInstSeedResult(data);
        const instRes = await fetch("/api/research/institutions");
        if (instRes.ok) setInstitutions(await instRes.json());
      }
    } catch { /* ignore */ } finally {
      setSeedingInstitutions(false);
    }
  }

  async function handleSeedBenchmarking() {
    setSeedingBenchmarking(true);
    setBenchmarkSeedResult(null);
    try {
      const res = await fetch("/api/research/benchmarking/seed", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBenchmarkSeedResult({
          success: true,
          created: data.scoreCount ?? 0,
          skipped: 0,
          total: data.scoreCount ?? 0,
        });
      }
    } catch { /* ignore */ } finally {
      setSeedingBenchmarking(false);
    }
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
        const srcRes = await fetch("/api/admin/data/sources");
        if (srcRes.ok) setSources(await srcRes.json());
      }
    } catch { /* ignore */ } finally {
      setSavingSource(false);
    }
  }

  function openCitationModal(entityType: string, entityId: string, entityName: string) {
    setCitationEntityType(entityType);
    setCitationEntityId(entityId);
    setCitationEntityName(entityName);
    setCitationSourceId(sources[0]?.id || "");
    setCitationText("");
    setCitationNote("");
    setShowCitationModal(true);
  }

  async function handleSaveCitation() {
    if (!citationSourceId || !citationEntityId) return;
    setSavingCitation(true);
    try {
      const res = await fetch("/api/admin/data/citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: citationEntityType,
          entityId: citationEntityId,
          sourceId: citationSourceId,
          citation: citationText || null,
          evidenceNote: citationNote || null,
        }),
      });
      if (res.ok) {
        setShowCitationModal(false);
        fetchData();
      }
    } catch { /* ignore */ } finally {
      setSavingCitation(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/data/export");
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gpssa-compass-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* ignore */ } finally {
      setExporting(false);
    }
  }

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderCitations(citations?: Citation[]) {
    if (!citations || citations.length === 0) {
      return <span className="text-[11px] text-gray-muted/50 italic">No sources linked</span>;
    }
    return (
      <div className="space-y-1.5 mt-1">
        {citations.map((c) => (
          <div key={c.id} className="flex items-start gap-2 text-[11px]">
            <Link2 size={11} className="text-adl-blue mt-0.5 shrink-0" />
            <div>
              <a
                href={c.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-adl-blue hover:underline"
              >
                {c.source.title}
              </a>
              {c.citation && <span className="text-gray-muted ml-1">— {c.citation}</span>}
              {c.source.publisher && (
                <span className="text-gray-muted/50 ml-1">({c.source.publisher})</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const priorityVariant = (p: string) => {
    if (p === "high" || p === "critical") return "red";
    if (p === "medium") return "gold";
    return "gray";
  };

  const impactVariant = (i: string) => {
    if (i === "high") return "green";
    if (i === "medium") return "gold";
    return "gray";
  };

  const sourceTypeColor = (t: string) => {
    if (t === "report") return "gold";
    if (t === "paper") return "blue";
    if (t === "database") return "green";
    return "gray";
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Data Management"
        description="Manage research data, service catalog, and source citations"
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Services" value={services.length} icon={Layers} />
        <StatCard label="Institutions" value={institutions.length} icon={Building2} />
        <StatCard label="Opportunities" value={opportunities.length} icon={Lightbulb} />
        <StatCard label="Requirements" value={requirements.length} icon={ClipboardList} />
        <StatCard label="Sources" value={sources.length} icon={BookOpen} />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* ── Services ── */}
          {activeTab === "services" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button onClick={handleSeedServices} loading={seedingServices} variant="secondary" size="sm">
                  <Sprout size={16} /> Seed Default Services
                </Button>
                {seedResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-gpssa-green">
                    <CheckCircle2 size={14} /> Created {seedResult.created}, skipped {seedResult.skipped}
                  </motion.div>
                )}
              </div>
              <Card>
                {services.length === 0 ? (
                  <EmptyState icon={Layers} title="No services" description="Seed the default GPSSA services to get started" action={{ label: "Seed Services", onClick: handleSeedServices }} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">#</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Service Name</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Category</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Sources</th>
                          <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {services.map((svc, i) => (
                          <>
                            <tr key={svc.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleRow(svc.id)}>
                              <td className="py-2.5 px-3 text-gray-muted text-xs">{i + 1}</td>
                              <td className="py-2.5 px-3 text-cream">{svc.name}</td>
                              <td className="py-2.5 px-3"><Badge variant="green" size="sm">{svc.category}</Badge></td>
                              <td className="py-2.5 px-3 hidden md:table-cell">
                                <Badge variant="gray" size="sm">{svc.sourceCitations?.length || 0}</Badge>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button onClick={(e) => { e.stopPropagation(); openCitationModal("service", svc.id, svc.name); }} className="p-1 rounded text-gray-muted hover:text-adl-blue transition-colors" title="Add source">
                                  <Plus size={14} />
                                </button>
                              </td>
                            </tr>
                            {expandedRows.has(svc.id) && (
                              <tr key={`${svc.id}-exp`}>
                                <td colSpan={5} className="px-6 py-2 bg-white/[0.01]">
                                  {renderCitations(svc.sourceCitations)}
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ── Institutions ── */}
          {activeTab === "institutions" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button onClick={handleSeedInstitutions} loading={seedingInstitutions} variant="secondary" size="sm">
                  <Sprout size={16} /> Seed Default Institutions
                </Button>
                {instSeedResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-gpssa-green">
                    <CheckCircle2 size={14} /> Created {instSeedResult.created}, skipped {instSeedResult.skipped}
                  </motion.div>
                )}
              </div>
              <Card>
                {institutions.length === 0 ? (
                  <EmptyState icon={Building2} title="No institutions" description="Seed default institutions" action={{ label: "Seed", onClick: handleSeedInstitutions }} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Institution</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Country</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Region</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Sources</th>
                          <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {institutions.map((inst) => (
                          <>
                            <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleRow(inst.id)}>
                              <td className="py-2.5 px-3 text-cream">
                                <div className="flex items-center gap-2">
                                  {inst.name}
                                  {inst.websiteUrl && (
                                    <a href={inst.websiteUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-muted hover:text-adl-blue">
                                      <ExternalLink size={12} />
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-gray-muted">{inst.country}</td>
                              <td className="py-2.5 px-3 text-gray-muted hidden md:table-cell">{inst.region}</td>
                              <td className="py-2.5 px-3 hidden md:table-cell">
                                <Badge variant="gray" size="sm">{inst.sourceCitations?.length || 0}</Badge>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button onClick={(e) => { e.stopPropagation(); openCitationModal("institution", inst.id, inst.name); }} className="p-1 rounded text-gray-muted hover:text-adl-blue transition-colors" title="Add source">
                                  <Plus size={14} />
                                </button>
                              </td>
                            </tr>
                            {expandedRows.has(inst.id) && (
                              <tr key={`${inst.id}-exp`}>
                                <td colSpan={5} className="px-6 py-2 bg-white/[0.01]">
                                  {renderCitations(inst.sourceCitations)}
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ── Opportunities ── */}
          {activeTab === "opportunities" && (
            <Card>
              {opportunities.length === 0 ? (
                <EmptyState icon={Lightbulb} title="No opportunities" description="Opportunities will appear here as they are identified" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Opportunity</th>
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Category</th>
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Impact</th>
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Sources</th>
                        <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {opportunities.map((opp) => (
                        <>
                          <tr key={opp.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleRow(opp.id)}>
                            <td className="py-2.5 px-3 text-cream">{opp.title}</td>
                            <td className="py-2.5 px-3"><Badge variant="blue" size="sm">{opp.category}</Badge></td>
                            <td className="py-2.5 px-3 hidden md:table-cell"><Badge variant={impactVariant(opp.impact)} size="sm">{opp.impact}</Badge></td>
                            <td className="py-2.5 px-3 hidden md:table-cell">
                              <Badge variant="gray" size="sm">{opp.sourceCitations?.length || 0}</Badge>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button onClick={(e) => { e.stopPropagation(); openCitationModal("opportunity", opp.id, opp.title); }} className="p-1 rounded text-gray-muted hover:text-adl-blue transition-colors">
                                <Plus size={14} />
                              </button>
                            </td>
                          </tr>
                          {expandedRows.has(opp.id) && (
                            <tr key={`${opp.id}-exp`}>
                              <td colSpan={5} className="px-6 py-2 bg-white/[0.01]">
                                {renderCitations(opp.sourceCitations)}
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* ── Requirements ── */}
          {activeTab === "requirements" && (
            <Card>
              {requirements.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No requirements" description="Requirements will appear as they are generated" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Requirement</th>
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Category</th>
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Priority</th>
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Sources</th>
                        <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {requirements.map((req) => (
                        <>
                          <tr key={req.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggleRow(req.id)}>
                            <td className="py-2.5 px-3 text-cream">{req.title}</td>
                            <td className="py-2.5 px-3"><Badge variant="blue" size="sm">{req.category}</Badge></td>
                            <td className="py-2.5 px-3 hidden md:table-cell"><Badge variant={priorityVariant(req.priority)} size="sm">{req.priority}</Badge></td>
                            <td className="py-2.5 px-3 hidden md:table-cell">
                              <Badge variant="gray" size="sm">{req.sourceCitations?.length || 0}</Badge>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button onClick={(e) => { e.stopPropagation(); openCitationModal("requirement", req.id, req.title); }} className="p-1 rounded text-gray-muted hover:text-adl-blue transition-colors">
                                <Plus size={14} />
                              </button>
                            </td>
                          </tr>
                          {expandedRows.has(req.id) && (
                            <tr key={`${req.id}-exp`}>
                              <td colSpan={5} className="px-6 py-2 bg-white/[0.01]">
                                {renderCitations(req.sourceCitations)}
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* ── Sources ── */}
          {activeTab === "sources" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button onClick={() => setShowAddSource(true)} size="sm">
                  <Plus size={16} /> Add Source
                </Button>
              </div>
              <Card>
                {sources.length === 0 ? (
                  <EmptyState icon={BookOpen} title="No sources" description="Add data sources with URLs to back your research data" action={{ label: "Add Source", onClick: () => setShowAddSource(true) }} />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Title</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Publisher</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Type</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden lg:table-cell">Citations</th>
                          <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">URL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {sources.map((src) => {
                          const totalCitations = (src._count?.serviceCitations || 0) +
                            (src._count?.institutionCitations || 0) +
                            (src._count?.opportunityCitations || 0) +
                            (src._count?.requirementCitations || 0);
                          return (
                            <tr key={src.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-2.5 px-3">
                                <p className="text-cream">{src.title}</p>
                                {src.description && <p className="text-[11px] text-gray-muted mt-0.5 line-clamp-1">{src.description}</p>}
                              </td>
                              <td className="py-2.5 px-3 text-gray-muted hidden md:table-cell">{src.publisher || "—"}</td>
                              <td className="py-2.5 px-3 hidden md:table-cell">
                                <Badge variant={sourceTypeColor(src.sourceType)} size="sm">{src.sourceType}</Badge>
                              </td>
                              <td className="py-2.5 px-3 hidden lg:table-cell">
                                <Badge variant="gray" size="sm">{totalCitations}</Badge>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-adl-blue hover:underline inline-flex items-center gap-1 text-xs">
                                  <ExternalLink size={12} /> Link
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Benchmarking seed + Import/Export */}
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-cream">Benchmarking Dataset</h3>
                <p className="mt-1 text-sm text-gray-muted">
                  Seed the source-backed benchmarking dataset used by the intelligence stage.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleSeedBenchmarking} loading={seedingBenchmarking} variant="secondary" size="sm">
                  <BarChart3 size={16} /> Seed Benchmarking
                </Button>
                {benchmarkSeedResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-gpssa-green">
                    <CheckCircle2 size={14} /> Seeded {benchmarkSeedResult.created} scores
                  </motion.div>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-semibold text-cream">Import / Export</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="glass rounded-xl p-5 flex flex-col items-center gap-3 text-center hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <Upload size={24} className="text-gray-muted" />
                <p className="text-sm text-cream font-medium">Import Data</p>
                <p className="text-[11px] text-gray-muted">Upload a JSON export file</p>
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={() => {/* TODO: import handler */}} />
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="glass rounded-xl p-5 flex flex-col items-center gap-3 text-center hover:bg-white/[0.03] transition-colors cursor-pointer disabled:opacity-50"
              >
                {exporting ? <LoadingSpinner /> : <Download size={24} className="text-gray-muted" />}
                <p className="text-sm text-cream font-medium">Export Data</p>
                <p className="text-[11px] text-gray-muted">Download all data as JSON</p>
              </button>
            </div>
          </Card>
        </>
      )}

      {/* Add Source Modal */}
      <Modal isOpen={showAddSource} onClose={() => setShowAddSource(false)} title="Add Data Source" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Title</label>
            <input
              value={sourceForm.title}
              onChange={(e) => setSourceForm({ ...sourceForm, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              placeholder="Source title"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">URL</label>
            <input
              value={sourceForm.url}
              onChange={(e) => setSourceForm({ ...sourceForm, url: e.target.value })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Publisher</label>
              <input
                value={sourceForm.publisher}
                onChange={(e) => setSourceForm({ ...sourceForm, publisher: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
                placeholder="Organization"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Type</label>
              <select
                value={sourceForm.sourceType}
                onChange={(e) => setSourceForm({ ...sourceForm, sourceType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass text-cream text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              >
                <option value="website">Website</option>
                <option value="report">Report</option>
                <option value="paper">Paper</option>
                <option value="database">Database</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={sourceForm.description}
              onChange={(e) => setSourceForm({ ...sourceForm, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 resize-y"
              placeholder="Brief description"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setShowAddSource(false)}>Cancel</Button>
            <Button onClick={handleAddSource} loading={savingSource} disabled={!sourceForm.title || !sourceForm.url}>
              Add Source
            </Button>
          </div>
        </div>
      </Modal>

      {/* Citation Modal */}
      <Modal isOpen={showCitationModal} onClose={() => setShowCitationModal(false)} title="Link Source" description={citationEntityName} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Source</label>
            {sources.length === 0 ? (
              <p className="text-sm text-gray-muted">No sources available. Add a source first.</p>
            ) : (
              <select
                value={citationSourceId}
                onChange={(e) => setCitationSourceId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass text-cream text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              >
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Citation (optional)</label>
            <input
              value={citationText}
              onChange={(e) => setCitationText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              placeholder="e.g. Chapter 3, Section 2.1"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Evidence Note (optional)</label>
            <textarea
              value={citationNote}
              onChange={(e) => setCitationNote(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 resize-y"
              placeholder="Key evidence or quote from the source"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setShowCitationModal(false)}>Cancel</Button>
            <Button onClick={handleSaveCitation} loading={savingCitation} disabled={!citationSourceId}>
              Link Source
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
