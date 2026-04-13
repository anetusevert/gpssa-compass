"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

interface ServiceRecord {
  id: string;
  name: string;
  category: string;
  description: string | null;
  createdAt: string;
}

interface InstitutionRecord {
  id: string;
  name: string;
  country: string;
  region: string;
  createdAt: string;
}

interface OpportunityRecord {
  id: string;
  title: string;
  category: string;
  impact: string;
  status: string;
  createdAt: string;
}

interface RequirementRecord {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
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
];

export default function DataManagementPage() {
  const [activeTab, setActiveTab] = useState("services");

  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionRecord[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [requirements, setRequirements] = useState<RequirementRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [seedingServices, setSeedingServices] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult>(null);
  const [seedingInstitutions, setSeedingInstitutions] = useState(false);
  const [instSeedResult, setInstSeedResult] = useState<SeedResult>(null);
  const [seedingBenchmarking, setSeedingBenchmarking] = useState(false);
  const [benchmarkSeedResult, setBenchmarkSeedResult] = useState<SeedResult>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [svcRes, instRes, oppRes, reqRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/research/institutions"),
        fetch("/api/research/opportunities").catch(() => null),
        fetch("/api/admin/requirements"),
      ]);

      if (svcRes.ok) setServices(await svcRes.json());
      if (instRes.ok) setInstitutions(await instRes.json());
      if (oppRes?.ok) setOpportunities(await oppRes.json());
      if (reqRes.ok) setRequirements(await reqRes.json());
    } catch {
      // silently fail
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
    } catch {
      // silently fail
    } finally {
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
    } catch {
      // silently fail
    } finally {
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
    } catch {
      // silently fail
    } finally {
      setSeedingBenchmarking(false);
    }
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Data Management"
        description="Manage research data and service catalog"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Services" value={services.length} icon={Layers} />
        <StatCard label="Institutions" value={institutions.length} icon={Building2} />
        <StatCard label="Opportunities" value={opportunities.length} icon={Lightbulb} />
        <StatCard label="Requirements" value={requirements.length} icon={ClipboardList} />
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Services Tab */}
          {activeTab === "services" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSeedServices}
                  loading={seedingServices}
                  variant="secondary"
                  size="sm"
                >
                  <Sprout size={16} />
                  Seed Default Services
                </Button>
                {seedResult && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-xs text-gpssa-green"
                  >
                    <CheckCircle2 size={14} />
                    Created {seedResult.created}, skipped {seedResult.skipped} of {seedResult.total}
                  </motion.div>
                )}
              </div>

              <Card>
                {services.length === 0 ? (
                  <EmptyState
                    icon={Layers}
                    title="No services"
                    description="Seed the default GPSSA services to get started"
                    action={{ label: "Seed Services", onClick: handleSeedServices }}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">#</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Service Name</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {services.map((svc, i) => (
                          <tr key={svc.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-2.5 px-3 text-gray-muted text-xs">{i + 1}</td>
                            <td className="py-2.5 px-3 text-cream">{svc.name}</td>
                            <td className="py-2.5 px-3">
                              <Badge variant="green" size="sm">{svc.category}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Institutions Tab */}
          {activeTab === "institutions" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSeedInstitutions}
                  loading={seedingInstitutions}
                  variant="secondary"
                  size="sm"
                >
                  <Sprout size={16} />
                  Seed Default Institutions
                </Button>
                {instSeedResult && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-xs text-gpssa-green"
                  >
                    <CheckCircle2 size={14} />
                    Created {instSeedResult.created}, skipped {instSeedResult.skipped} of {instSeedResult.total}
                  </motion.div>
                )}
              </div>

              <Card>
                {institutions.length === 0 ? (
                  <EmptyState
                    icon={Building2}
                    title="No institutions"
                    description="Seed default institutions to populate the research data"
                    action={{ label: "Seed Institutions", onClick: handleSeedInstitutions }}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Institution</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Country</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Region</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {institutions.map((inst) => (
                          <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-2.5 px-3 text-cream">{inst.name}</td>
                            <td className="py-2.5 px-3 text-gray-muted">{inst.country}</td>
                            <td className="py-2.5 px-3 text-gray-muted hidden md:table-cell">{inst.region}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Opportunities Tab */}
          {activeTab === "opportunities" && (
            <Card>
              {opportunities.length === 0 ? (
                <EmptyState
                  icon={Lightbulb}
                  title="No opportunities"
                  description="Opportunities will appear here as they are identified through analysis"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Opportunity</th>
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Category</th>
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Impact</th>
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {opportunities.map((opp) => (
                        <tr key={opp.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 px-3 text-cream">{opp.title}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="blue" size="sm">{opp.category}</Badge>
                          </td>
                          <td className="py-2.5 px-3 hidden md:table-cell">
                            <Badge variant={impactVariant(opp.impact)} size="sm">{opp.impact}</Badge>
                          </td>
                          <td className="py-2.5 px-3 hidden md:table-cell">
                            <Badge variant="gray" size="sm">{opp.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Requirements Tab */}
          {activeTab === "requirements" && (
            <Card>
              {requirements.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title="No requirements"
                  description="Requirements will appear here as they are generated"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Requirement</th>
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Category</th>
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Priority</th>
                        <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {requirements.map((req) => (
                        <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 px-3 text-cream">{req.title}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="blue" size="sm">{req.category}</Badge>
                          </td>
                          <td className="py-2.5 px-3 hidden md:table-cell">
                            <Badge variant={priorityVariant(req.priority)} size="sm">{req.priority}</Badge>
                          </td>
                          <td className="py-2.5 px-3 hidden md:table-cell">
                            <Badge variant="gray" size="sm">{req.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* Benchmarking dataset */}
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-cream">Benchmarking Dataset</h3>
                <p className="mt-1 text-sm text-gray-muted">
                  Seed the source-backed benchmarking dataset used by the redesigned intelligence stage.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSeedBenchmarking}
                  loading={seedingBenchmarking}
                  variant="secondary"
                  size="sm"
                >
                  <BarChart3 size={16} />
                  Seed Benchmarking Dataset
                </Button>
                {benchmarkSeedResult && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-xs text-gpssa-green"
                  >
                    <CheckCircle2 size={14} />
                    Seeded {benchmarkSeedResult.created} benchmark scores
                  </motion.div>
                )}
              </div>
            </div>
          </Card>

          {/* Import/Export Section */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-semibold text-cream">Import / Export</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass rounded-xl p-5 flex flex-col items-center gap-3 text-center">
                <Upload size={24} className="text-gray-muted" />
                <p className="text-sm text-cream font-medium">Import Data</p>
                <Badge variant="gold" size="sm">Coming Soon</Badge>
              </div>
              <div className="glass rounded-xl p-5 flex flex-col items-center gap-3 text-center">
                <Download size={24} className="text-gray-muted" />
                <p className="text-sm text-cream font-medium">Export Data</p>
                <Badge variant="gold" size="sm">Coming Soon</Badge>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
