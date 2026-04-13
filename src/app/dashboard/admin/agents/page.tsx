"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Play,
  Pencil,
  Plus,
  Loader2,
  Thermometer,
  Hash,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Globe2,
  Briefcase,
  Package,
  Truck,
  Pause,
  RotateCcw,
  StopCircle,
  ChevronDown,
  ChevronUp,
  Database,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

interface AgentConfig {
  id: string;
  name: string;
  description: string | null;
  systemPrompt: string;
  userPromptTemplate: string;
  model: string;
  provider: string;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  targetScreen: string | null;
  researchType: string | null;
  executionCount: number;
  lastRunAt: string | null;
  createdAt: string;
}

interface ModelInfo {
  id: string;
  name: string;
}

interface ResearchJob {
  id: string;
  type: string;
  status: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  currentItem: string | null;
  model: string;
  totalTokens: number;
  totalCost: number;
  agentConfigId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  agentConfig?: { id: string; name: string; targetScreen: string | null; model: string } | null;
}

interface ExecutionResult {
  success: boolean;
  output: string | null;
  tokensUsed: number;
  durationMs: number;
  model: string;
  error?: string;
}

const PILLAR_META: Record<string, { label: string; icon: typeof Globe2; color: string; dotColor: string; screens: string[] }> = {
  atlas: {
    label: "Global Atlas",
    icon: Globe2,
    color: "text-gpssa-green",
    dotColor: "bg-gpssa-green",
    screens: ["atlas-worldmap", "atlas-benchmarking"],
  },
  services: {
    label: "Services",
    icon: Briefcase,
    color: "text-adl-blue",
    dotColor: "bg-adl-blue",
    screens: ["services-catalog", "services-channels", "services-analysis"],
  },
  products: {
    label: "Products",
    icon: Package,
    color: "text-gold",
    dotColor: "bg-gold",
    screens: ["products-portfolio", "products-segments", "products-innovation"],
  },
  delivery: {
    label: "Delivery",
    icon: Truck,
    color: "text-teal-400",
    dotColor: "bg-teal-400",
    screens: ["delivery-channels", "delivery-personas", "delivery-models"],
  },
};

const SCREEN_LABELS: Record<string, string> = {
  "atlas-worldmap": "World Map",
  "atlas-benchmarking": "Benchmarking",
  "services-catalog": "Service Catalog",
  "services-channels": "Channel Capabilities",
  "services-analysis": "Service Analysis",
  "products-portfolio": "Product Portfolio",
  "products-segments": "Segment Coverage",
  "products-innovation": "Product Innovation",
  "delivery-channels": "Delivery Channels",
  "delivery-personas": "Customer Personas",
  "delivery-models": "Delivery Models",
};

function extractTemplateVariables(template: string): string[] {
  const matches = template.match(/\{(\w+)\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.slice(1, -1))));
}

const EMPTY_AGENT_FORM = {
  name: "",
  description: "",
  model: "gpt-4o",
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: "",
  userPromptTemplate: "",
  isActive: true,
};

function JobStatusBadge({ status }: { status: string }) {
  const variant = status === "completed" ? "green"
    : status === "running" ? "blue"
    : status === "paused" ? "gold"
    : status === "failed" ? "red"
    : status === "cancelled" ? "gray"
    : "gray";
  return <Badge variant={variant} size="sm" dot>{status}</Badge>;
}

function ProgressBar({ completed, total, failed }: { completed: number; total: number; failed: number }) {
  if (total === 0) return null;
  const pct = Math.round(((completed + failed) / total) * 100);
  const successPct = Math.round((completed / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-gray-muted">
        <span>{completed} completed{failed > 0 ? `, ${failed} failed` : ""}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden flex">
        <div className="h-full bg-gpssa-green rounded-l-full transition-all" style={{ width: `${successPct}%` }} />
        {failed > 0 && (
          <div className="h-full bg-red-500 transition-all" style={{ width: `${Math.round((failed / total) * 100)}%` }} />
        )}
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [researchJobs, setResearchJobs] = useState<ResearchJob[]>([]);
  const [activeTab, setActiveTab] = useState<"screen" | "general">("screen");
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set(["atlas", "services", "products", "delivery"]));

  const [editAgent, setEditAgent] = useState<AgentConfig | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_AGENT_FORM });
  const [savingAgent, setSavingAgent] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ ...EMPTY_AGENT_FORM });
  const [creatingAgent, setCreatingAgent] = useState(false);

  const [testAgent, setTestAgent] = useState<AgentConfig | null>(null);
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<ExecutionResult | null>(null);
  const [runningTest, setRunningTest] = useState(false);

  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({});

  const fetchAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const res = await fetch("/api/agents");
      if (res.ok) setAgents(await res.json());
    } catch { /* ignore */ } finally {
      setLoadingAgents(false);
    }
  }, []);

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch("/api/agents/models");
      if (res.ok) {
        const data = await res.json();
        setModels(Array.isArray(data) ? data : (data.models ?? []));
      }
    } catch { /* ignore */ }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/research/screen-jobs");
      if (res.ok) setResearchJobs(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchAgents();
    fetchModels();
    fetchJobs();
  }, [fetchAgents, fetchModels, fetchJobs]);

  useEffect(() => {
    const hasRunning = researchJobs.some((j) => j.status === "running");
    if (!hasRunning) return;
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, [researchJobs, fetchJobs]);

  const screenAgents = agents.filter((a) => a.targetScreen);
  const generalAgents = agents.filter((a) => !a.targetScreen);

  function togglePillar(pillar: string) {
    setExpandedPillars((prev) => {
      const next = new Set(prev);
      if (next.has(pillar)) next.delete(pillar);
      else next.add(pillar);
      return next;
    });
  }

  async function handleRunScreenAgent(agentId: string) {
    setRunningAgents((prev) => new Set(prev).add(agentId));
    try {
      const body: Record<string, string> = { agentConfigId: agentId };
      if (selectedModels[agentId]) body.model = selectedModels[agentId];
      await fetch("/api/research/screen-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await fetchJobs();
    } catch { /* ignore */ } finally {
      setRunningAgents((prev) => {
        const next = new Set(prev);
        next.delete(agentId);
        return next;
      });
    }
  }

  async function handlePauseJob(jobId: string) {
    await fetch(`/api/research/screen-jobs/${jobId}/pause`, { method: "POST" });
    fetchJobs();
  }

  async function handleResumeJob(jobId: string) {
    await fetch(`/api/research/screen-jobs/${jobId}/resume`, { method: "POST" });
    fetchJobs();
  }

  async function handleCancelJob(jobId: string) {
    await fetch(`/api/research/screen-jobs/${jobId}/cancel`, { method: "POST" });
    fetchJobs();
  }

  function getLatestJob(agentId: string): ResearchJob | undefined {
    return researchJobs.find((j) => j.agentConfigId === agentId);
  }

  function openEditModal(agent: AgentConfig) {
    setEditAgent(agent);
    setEditForm({
      name: agent.name,
      description: agent.description ?? "",
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      systemPrompt: agent.systemPrompt,
      userPromptTemplate: agent.userPromptTemplate,
      isActive: agent.isActive,
    });
  }

  async function handleSaveAgent() {
    if (!editAgent) return;
    setSavingAgent(true);
    try {
      const res = await fetch(`/api/agents/${editAgent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) { setEditAgent(null); fetchAgents(); }
    } catch { /* ignore */ } finally { setSavingAgent(false); }
  }

  async function handleCreateAgent() {
    if (!createForm.name || !createForm.systemPrompt || !createForm.userPromptTemplate) return;
    setCreatingAgent(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (res.ok) { setShowCreateModal(false); setCreateForm({ ...EMPTY_AGENT_FORM }); fetchAgents(); }
    } catch { /* ignore */ } finally { setCreatingAgent(false); }
  }

  function openTestModal(agent: AgentConfig) {
    setTestAgent(agent);
    setTestResult(null);
    const vars = extractTemplateVariables(agent.userPromptTemplate);
    const initial: Record<string, string> = {};
    vars.forEach((v) => (initial[v] = ""));
    setTestVariables(initial);
  }

  async function handleRunTest() {
    if (!testAgent) return;
    setRunningTest(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/agents/${testAgent.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables: testVariables }),
      });
      setTestResult(await res.json());
    } catch {
      setTestResult({ success: false, output: null, tokensUsed: 0, durationMs: 0, model: testAgent.model, error: "Network error" });
    } finally { setRunningTest(false); }
  }

  const stats = {
    total: agents.length,
    screenAgents: screenAgents.length,
    active: agents.filter((a) => a.isActive).length,
    totalRuns: agents.reduce((s, a) => s + a.executionCount, 0),
    runningJobs: researchJobs.filter((j) => j.status === "running").length,
  };

  function renderAgentForm(
    form: typeof EMPTY_AGENT_FORM,
    setForm: (f: typeof EMPTY_AGENT_FORM) => void
  ) {
    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50" placeholder="Agent name" />
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Model</label>
            <select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full px-3 py-2 rounded-lg glass text-cream text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gpssa-green/50">
              {form.model && !models.find((m) => m.id === form.model) && <option value={form.model}>{form.model}</option>}
              {models.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50" placeholder="Brief description" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-xs text-gray-muted mb-1.5 uppercase tracking-wider"><Thermometer size={12} />Temperature: {form.temperature}</label>
            <input type="range" min="0" max="2" step="0.1" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })} className="w-full accent-gpssa-green" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs text-gray-muted mb-1.5 uppercase tracking-wider"><Hash size={12} />Max Tokens</label>
            <input type="number" value={form.maxTokens} onChange={(e) => setForm({ ...form, maxTokens: parseInt(e.target.value, 10) || 0 })} className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">System Prompt</label>
          <textarea value={form.systemPrompt} onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })} rows={6} className="w-full px-3 py-2 rounded-lg glass text-cream text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 resize-y" />
        </div>
        <div>
          <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">User Prompt Template</label>
          <textarea value={form.userPromptTemplate} onChange={(e) => setForm({ ...form, userPromptTemplate: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-lg glass text-cream text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 resize-y" />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-muted uppercase tracking-wider">Active</label>
          <button onClick={() => setForm({ ...form, isActive: !form.isActive })} className="text-cream">
            {form.isActive ? <ToggleRight size={28} className="text-gpssa-green" /> : <ToggleLeft size={28} className="text-gray-muted" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Agent Registry & Screen Research"
        description="Manage AI agents and run deep research to populate every screen of the knowledge intelligence platform"
        actions={
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus size={16} />
            New Agent
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Screen Agents" value={stats.screenAgents} icon={Database} />
        <StatCard label="General Agents" value={generalAgents.length} icon={Bot} />
        <StatCard label="Active" value={stats.active} icon={Zap} />
        <StatCard label="Total Runs" value={stats.totalRuns} icon={Clock} />
        <StatCard label="Running Jobs" value={stats.runningJobs} icon={Activity} trend={stats.runningJobs > 0 ? "up" : "neutral"} />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 w-fit">
        <button
          onClick={() => setActiveTab("screen")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "screen" ? "bg-gpssa-green/20 text-gpssa-green" : "text-gray-muted hover:text-cream"}`}
        >
          <Database size={14} className="inline mr-2" />
          Screen Research ({screenAgents.length})
        </button>
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "general" ? "bg-adl-blue/20 text-adl-blue" : "text-gray-muted hover:text-cream"}`}
        >
          <Bot size={14} className="inline mr-2" />
          General Agents ({generalAgents.length})
        </button>
      </div>

      {loadingAgents ? (
        <div className="flex justify-center py-8"><LoadingSpinner /></div>
      ) : activeTab === "screen" ? (
        <div className="space-y-6">
          {Object.entries(PILLAR_META).map(([pillarKey, meta]) => {
            const PillarIcon = meta.icon;
            const pillarAgents = screenAgents.filter((a) => meta.screens.includes(a.targetScreen!));
            const isExpanded = expandedPillars.has(pillarKey);

            return (
              <Card key={pillarKey} variant="glass" padding="none" className="overflow-hidden border border-white/[0.06]">
                <button
                  onClick={() => togglePillar(pillarKey)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white/5`}>
                      <PillarIcon size={20} className={meta.color} />
                    </div>
                    <div className="text-left">
                      <h3 className={`font-playfair text-lg font-semibold ${meta.color}`}>{meta.label}</h3>
                      <p className="text-xs text-gray-muted">{pillarAgents.length} agents · {meta.screens.length} screens</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pillarAgents.some((a) => {
                      const job = getLatestJob(a.id);
                      return job?.status === "running";
                    }) && (
                      <Badge variant="blue" size="sm" dot>Running</Badge>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-gray-muted" /> : <ChevronDown size={16} className="text-gray-muted" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-white/5 divide-y divide-white/5">
                        {pillarAgents.map((agent) => {
                          const latestJob = getLatestJob(agent.id);
                          const isRunning = runningAgents.has(agent.id) || latestJob?.status === "running";

                          return (
                            <div key={agent.id} className="p-4 hover:bg-white/[0.01] transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-medium text-cream">{agent.name}</h4>
                                    <Badge variant="gray" size="sm">{SCREEN_LABELS[agent.targetScreen!] ?? agent.targetScreen}</Badge>
                                  </div>
                                  {agent.description && (
                                    <p className="text-xs text-gray-muted line-clamp-1 mb-2">{agent.description}</p>
                                  )}

                                  {latestJob && (
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2">
                                        <JobStatusBadge status={latestJob.status} />
                                        {latestJob.currentItem && latestJob.status === "running" && (
                                          <span className="text-xs text-gray-muted truncate max-w-[200px]">{latestJob.currentItem}</span>
                                        )}
                                      </div>
                                      <ProgressBar completed={latestJob.completedItems} total={latestJob.totalItems} failed={latestJob.failedItems} />
                                      <div className="flex gap-3 text-[10px] text-gray-muted">
                                        <span>Tokens: {latestJob.totalTokens.toLocaleString()}</span>
                                        <span>Cost: ${latestJob.totalCost.toFixed(4)}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <select
                                    value={selectedModels[agent.id] ?? agent.model}
                                    onChange={(e) => setSelectedModels((prev) => ({ ...prev, [agent.id]: e.target.value }))}
                                    className="px-2 py-1.5 rounded-lg glass text-cream text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 max-w-[130px]"
                                  >
                                    {!models.find((m) => m.id === agent.model) && <option value={agent.model}>{agent.model}</option>}
                                    {models.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}
                                  </select>

                                  {latestJob?.status === "running" ? (
                                    <div className="flex gap-1">
                                      <button onClick={() => handlePauseJob(latestJob.id)} className="p-1.5 rounded-lg text-gold hover:bg-gold/10 transition-colors" title="Pause">
                                        <Pause size={14} />
                                      </button>
                                      <button onClick={() => handleCancelJob(latestJob.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Cancel">
                                        <StopCircle size={14} />
                                      </button>
                                    </div>
                                  ) : latestJob?.status === "paused" ? (
                                    <div className="flex gap-1">
                                      <button onClick={() => handleResumeJob(latestJob.id)} className="p-1.5 rounded-lg text-gpssa-green hover:bg-gpssa-green/10 transition-colors" title="Resume">
                                        <RotateCcw size={14} />
                                      </button>
                                      <button onClick={() => handleCancelJob(latestJob.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Cancel">
                                        <StopCircle size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <Button size="sm" onClick={() => handleRunScreenAgent(agent.id)} loading={isRunning} disabled={isRunning}>
                                      <Play size={14} />
                                      Run
                                    </Button>
                                  )}

                                  <button onClick={() => openEditModal(agent)} className="p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/5 transition-colors" title="Edit">
                                    <Pencil size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {pillarAgents.length === 0 && (
                          <p className="text-sm text-gray-muted p-4 text-center">No screen agents for this pillar yet.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      ) : (
        /* General Agents Tab */
        <Card>
          {generalAgents.length === 0 ? (
            <EmptyState icon={Bot} title="No general agents" description="All agents are assigned to screens" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Agent</th>
                    <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Model</th>
                    <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden lg:table-cell">Runs</th>
                    <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Status</th>
                    <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {generalAgents.map((agent) => (
                    <motion.tr key={agent.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-medium text-cream">{agent.name}</p>
                        {agent.description && <p className="text-xs text-gray-muted mt-0.5 line-clamp-1">{agent.description}</p>}
                      </td>
                      <td className="py-3 px-3"><span className="font-mono text-xs text-adl-blue">{agent.model}</span></td>
                      <td className="py-3 px-3 hidden lg:table-cell"><span className="text-cream">{agent.executionCount}</span></td>
                      <td className="py-3 px-3"><Badge variant={agent.isActive ? "green" : "gray"} dot size="sm">{agent.isActive ? "Active" : "Inactive"}</Badge></td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditModal(agent)} className="p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/5 transition-colors" title="Edit"><Pencil size={15} /></button>
                          <button onClick={() => openTestModal(agent)} className="p-1.5 rounded-lg text-gray-muted hover:text-gpssa-green hover:bg-gpssa-green/10 transition-colors" title="Test"><Play size={15} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Create Agent Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Agent" size="xl">
        {renderAgentForm(createForm, setCreateForm)}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button onClick={handleCreateAgent} loading={creatingAgent} disabled={!createForm.name || !createForm.systemPrompt || !createForm.userPromptTemplate}>Create Agent</Button>
        </div>
      </Modal>

      {/* Edit Agent Modal */}
      <Modal isOpen={!!editAgent} onClose={() => setEditAgent(null)} title="Edit Agent" description={editAgent?.name} size="xl">
        {renderAgentForm(editForm, setEditForm)}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
          <Button variant="ghost" onClick={() => setEditAgent(null)}>Cancel</Button>
          <Button onClick={handleSaveAgent} loading={savingAgent}>Save Changes</Button>
        </div>
      </Modal>

      {/* Test Agent Modal */}
      <Modal isOpen={!!testAgent} onClose={() => { setTestAgent(null); setTestResult(null); }} title="Test Agent" description={testAgent?.name} size="xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {Object.keys(testVariables).length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-muted uppercase tracking-wider">Template Variables</p>
              {Object.entries(testVariables).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs text-cream mb-1 font-mono">&#123;{key}&#125;</label>
                  <textarea value={value} onChange={(e) => setTestVariables({ ...testVariables, [key]: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 resize-y" placeholder={`Enter value for ${key}...`} />
                </div>
              ))}
            </div>
          )}
          {Object.keys(testVariables).length === 0 && <p className="text-sm text-gray-muted">No template variables detected.</p>}
          <Button onClick={handleRunTest} loading={runningTest} fullWidth><Play size={16} />Run Agent</Button>
          <AnimatePresence>
            {runningTest && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-3 py-6">
                <LoadingSpinner /><span className="text-sm text-gray-muted">Executing agent...</span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {testResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <div className="flex items-center gap-2">
                  {testResult.success ? <CheckCircle2 size={16} className="text-gpssa-green" /> : <XCircle size={16} className="text-red-400" />}
                  <span className={`text-sm font-medium ${testResult.success ? "text-gpssa-green" : "text-red-400"}`}>{testResult.success ? "Execution Successful" : "Execution Failed"}</span>
                </div>
                <div className="flex gap-4 text-xs text-gray-muted">
                  <span>Model: <span className="text-cream font-mono">{testResult.model}</span></span>
                  <span>Tokens: <span className="text-cream">{testResult.tokensUsed}</span></span>
                  <span>Duration: <span className="text-cream">{testResult.durationMs}ms</span></span>
                </div>
                {testResult.output && (
                  <div className="glass rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-cream whitespace-pre-wrap font-mono leading-relaxed">{testResult.output}</pre>
                  </div>
                )}
                {testResult.error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"><p className="text-sm text-red-400">{testResult.error}</p></div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </div>
  );
}
