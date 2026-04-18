"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Play,
  Pencil,
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
  Trash2,
  RefreshCw,
  PlayCircle,
  AlertTriangle,
  Scale,
  Globe,
  FileDown,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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
  sortOrder: number;
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
  lastError: string | null;
  errorCount: number;
  agentConfigId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  agentConfig?: { id: string; name: string; targetScreen: string | null; model: string } | null;
}

type AgentState = "idle" | "running" | "paused" | "completed" | "failed" | "cancelled";

const PILLAR_META: Record<string, { label: string; icon: typeof Globe2; color: string; bgColor: string; screens: string[] }> = {
  mandate: {
    label: "Mandate",
    icon: Scale,
    color: "text-gpssa-green",
    bgColor: "bg-gpssa-green",
    screens: ["mandate-corpus"],
  },
  atlas: {
    label: "Global Atlas",
    icon: Globe2,
    color: "text-gpssa-green",
    bgColor: "bg-gpssa-green",
    screens: ["atlas-worldmap", "atlas-benchmarking"],
  },
  services: {
    label: "Services",
    icon: Briefcase,
    color: "text-adl-blue",
    bgColor: "bg-adl-blue",
    screens: ["services-catalog", "services-channels", "services-analysis"],
  },
  products: {
    label: "Products",
    icon: Package,
    color: "text-gold",
    bgColor: "bg-gold",
    screens: ["products-portfolio", "products-segments", "products-innovation"],
  },
  delivery: {
    label: "Delivery",
    icon: Truck,
    color: "text-teal-400",
    bgColor: "bg-teal-400",
    screens: ["delivery-channels", "delivery-personas", "delivery-models"],
  },
};

const SCREEN_LABELS: Record<string, string> = {
  "mandate-corpus": "Mandate — Corpus & Legal Foundation",
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

function getAgentState(job: ResearchJob | undefined): AgentState {
  if (!job) return "idle";
  switch (job.status) {
    case "running": return "running";
    case "paused": return "paused";
    case "completed": return "completed";
    case "failed": return "failed";
    case "cancelled": return "cancelled";
    default: return "idle";
  }
}

function StatusBadge({ state }: { state: AgentState }) {
  const config: Record<AgentState, { variant: "green" | "blue" | "gold" | "gray" | "red"; label: string }> = {
    idle: { variant: "gray", label: "Idle" },
    running: { variant: "blue", label: "Running" },
    paused: { variant: "gold", label: "Paused" },
    completed: { variant: "green", label: "Completed" },
    failed: { variant: "red", label: "Failed" },
    cancelled: { variant: "gray", label: "Cancelled" },
  };
  const { variant, label } = config[state];
  return <Badge variant={variant} size="sm" dot>{label}</Badge>;
}

function ProgressBar({ completed, total, failed }: { completed: number; total: number; failed: number }) {
  if (total === 0) return null;
  const pct = Math.round(((completed + failed) / total) * 100);
  const successPct = Math.round((completed / total) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-gray-muted">
        <span>{completed}/{total} completed{failed > 0 ? ` · ${failed} failed` : ""}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden flex">
        <div className="h-full bg-gpssa-green rounded-l-full transition-all duration-500" style={{ width: `${successPct}%` }} />
        {failed > 0 && (
          <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${Math.round((failed / total) * 100)}%` }} />
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
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set(["mandate", "atlas", "services", "products", "delivery"]));

  const [editAgent, setEditAgent] = useState<AgentConfig | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_AGENT_FORM });
  const [savingAgent, setSavingAgent] = useState(false);

  const [busyAgents, setBusyAgents] = useState<Set<string>>(new Set());

  const [confirmClear, setConfirmClear] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const [runAllBusy, setRunAllBusy] = useState(false);

  // GPSSA web scrape state
  const [scrapeBusy, setScrapeBusy] = useState(false);
  const [scrapeFollowPdfs, setScrapeFollowPdfs] = useState(true);
  const [scrapeForce, setScrapeForce] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState<string | null>(null);
  const [lastScrapeResult, setLastScrapeResult] = useState<{ pages: number; updated: number; ts: string } | null>(null);

  async function handleScrapeGpssa() {
    if (scrapeBusy) return;
    setScrapeBusy(true);
    setScrapeStatus("Hitting gpssa.gov.ae politely…");
    try {
      const res = await fetch("/api/mandate/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followPdfs: scrapeFollowPdfs, force: scrapeForce }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setLastScrapeResult({
          pages: data.totalPages ?? data.pages ?? 0,
          updated: data.updated ?? data.upserted ?? 0,
          ts: new Date().toISOString(),
        });
        setScrapeStatus(`Scrape complete · ${data.totalPages ?? data.pages ?? 0} pages indexed`);
      } else {
        setScrapeStatus(`Scrape failed: ${data?.error ?? res.status}`);
      }
    } catch (err) {
      setScrapeStatus(`Scrape error: ${(err as Error).message}`);
    } finally {
      setScrapeBusy(false);
    }
  }

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
      const res = await fetch("/api/research/screen-jobs?latest=true");
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

  const screenAgents = agents.filter((a) => a.targetScreen).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  function getLatestJob(agentId: string): ResearchJob | undefined {
    return researchJobs.find((j) => j.agentConfigId === agentId);
  }

  function togglePillar(pillar: string) {
    setExpandedPillars((prev) => {
      const next = new Set(prev);
      if (next.has(pillar)) next.delete(pillar);
      else next.add(pillar);
      return next;
    });
  }

  function markBusy(agentId: string) {
    setBusyAgents((prev) => new Set(prev).add(agentId));
  }

  function clearBusy(agentId: string) {
    setBusyAgents((prev) => {
      const next = new Set(prev);
      next.delete(agentId);
      return next;
    });
  }

  async function handleModelChange(agentId: string, newModel: string) {
    setAgents((prev) => prev.map((a) => a.id === agentId ? { ...a, model: newModel } : a));
    try {
      await fetch(`/api/agents/${agentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: newModel }),
      });
    } catch { /* ignore */ }
  }

  async function handleRun(agentId: string) {
    markBusy(agentId);
    try {
      await fetch("/api/research/screen-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentConfigId: agentId }),
      });
      await fetchJobs();
    } catch { /* ignore */ } finally {
      clearBusy(agentId);
    }
  }

  async function handlePause(jobId: string) {
    await fetch(`/api/research/screen-jobs/${jobId}/pause`, { method: "POST" });
    fetchJobs();
  }

  async function handleResume(jobId: string) {
    await fetch(`/api/research/screen-jobs/${jobId}/resume`, { method: "POST" });
    fetchJobs();
  }

  async function handleStop(jobId: string) {
    await fetch(`/api/research/screen-jobs/${jobId}/cancel`, { method: "POST" });
    fetchJobs();
  }

  async function handleRestartEntirely(jobId: string, agentId: string) {
    markBusy(agentId);
    try {
      await fetch(`/api/research/screen-jobs/${jobId}/restart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await fetchJobs();
    } catch { /* ignore */ } finally {
      clearBusy(agentId);
    }
  }

  async function handleRewriteData(jobId: string, agentId: string) {
    markBusy(agentId);
    try {
      await fetch(`/api/research/screen-jobs/${jobId}/rewrite`, { method: "POST" });
      await fetchJobs();
    } catch { /* ignore */ } finally {
      clearBusy(agentId);
    }
  }

  async function handleClearProgress(agentId: string) {
    setClearing(true);
    try {
      await fetch("/api/research/screen-jobs/clear-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentConfigId: agentId }),
      });
      await Promise.all([fetchJobs(), fetchAgents()]);
    } catch { /* ignore */ } finally {
      setClearing(false);
      setConfirmClear(null);
    }
  }

  async function handleRunAllPillars() {
    if (runAllBusy) return;
    setRunAllBusy(true);
    try {
      const res = await fetch("/api/research/run-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ background: true }),
      });
      if (res.ok) {
        await fetchJobs();
      }
    } catch {
      // ignore — surface via job stream
    } finally {
      setRunAllBusy(false);
    }
  }

  async function handleRunAllInPillar(pillarKey: string) {
    const meta = PILLAR_META[pillarKey];
    if (!meta) return;
    const pillarAgents = screenAgents
      .filter((a) => meta.screens.includes(a.targetScreen!))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    for (const agent of pillarAgents) {
      const job = getLatestJob(agent.id);
      const state = getAgentState(job);
      if (state === "idle" || state === "completed" || state === "failed" || state === "cancelled") {
        if (job && (state === "completed" || state === "failed" || state === "cancelled")) {
          await fetch(`/api/research/screen-jobs/${job.id}/restart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
        } else {
          await fetch("/api/research/screen-jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentConfigId: agent.id }),
          });
        }
        await fetchJobs();
      }
    }
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

  const stats = {
    total: screenAgents.length,
    running: researchJobs.filter((j) => j.status === "running").length,
    completed: researchJobs.filter((j) => j.status === "completed").length,
    pending: screenAgents.filter((a) => !getLatestJob(a.id) || getAgentState(getLatestJob(a.id)) === "idle").length,
  };

  function renderActionButtons(agent: AgentConfig) {
    const job = getLatestJob(agent.id);
    const state = getAgentState(job);
    const isBusy = busyAgents.has(agent.id);

    switch (state) {
      case "idle":
        return (
          <Button size="sm" onClick={() => handleRun(agent.id)} loading={isBusy} disabled={isBusy}>
            <Play size={14} />
            Run
          </Button>
        );

      case "running":
        return (
          <div className="flex gap-1">
            <button onClick={() => handlePause(job!.id)} className="p-1.5 rounded-lg text-gold hover:bg-gold/10 transition-colors" title="Pause">
              <Pause size={14} />
            </button>
            <button onClick={() => handleStop(job!.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Stop">
              <StopCircle size={14} />
            </button>
          </div>
        );

      case "paused":
        return (
          <div className="flex gap-1">
            <button onClick={() => handleResume(job!.id)} className="p-1.5 rounded-lg text-gpssa-green hover:bg-gpssa-green/10 transition-colors" title="Resume (retry failed)">
              <Play size={14} />
            </button>
            <button onClick={() => handleRestartEntirely(job!.id, agent.id)} className="p-1.5 rounded-lg text-adl-blue hover:bg-adl-blue/10 transition-colors" title="Restart entirely">
              <RefreshCw size={14} />
            </button>
            <button onClick={() => handleStop(job!.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Stop">
              <StopCircle size={14} />
            </button>
          </div>
        );

      case "completed":
      case "failed":
      case "cancelled":
        return (
          <div className="flex gap-1">
            {state === "failed" && (
              <button onClick={() => handleResume(job!.id)} className="p-1.5 rounded-lg text-gpssa-green hover:bg-gpssa-green/10 transition-colors" title="Resume (retry failed items)">
                <Play size={14} />
              </button>
            )}
            {state === "completed" && (
              <button onClick={() => handleRewriteData(job!.id, agent.id)} className="p-1.5 rounded-lg text-gold hover:bg-gold/10 transition-colors" title="Sync data to screens" disabled={isBusy}>
                <Database size={14} />
              </button>
            )}
            <button onClick={() => handleRestartEntirely(job!.id, agent.id)} className="p-1.5 rounded-lg text-adl-blue hover:bg-adl-blue/10 transition-colors" title="Restart entirely">
              <RefreshCw size={14} />
            </button>
            <button onClick={() => setConfirmClear(agent.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Clear progress">
              <Trash2 size={14} />
            </button>
          </div>
        );

      default:
        return null;
    }
  }

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
        title="Research Agent Control Center"
        description="Activate, run, and manage the AI research agents that populate every screen of the platform"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Agents" value={stats.total} icon={Bot} />
        <StatCard label="Running" value={stats.running} icon={Activity} trend={stats.running > 0 ? "up" : "neutral"} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} />
        <StatCard label="Pending" value={stats.pending} icon={Clock} />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-adl-blue/10 shrink-0 mt-0.5">
            <Zap size={14} className="text-adl-blue" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-cream mb-1">Recommended Execution Order</p>
            <p className="text-xs text-gray-muted leading-relaxed">
              Agents are numbered 1–11 in their optimal run sequence. Each agent&apos;s research builds on the previous one&apos;s output.
              The <strong className="text-cream">Run All Pillars</strong> button below orchestrates everything server-side: Atlas
              sub-agents (system / performance / insights) run in parallel, then Atlas Benchmarking, then Services → Products →
              Delivery → International → ILO sequentially.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleRunAllPillars}
            loading={runAllBusy}
            disabled={runAllBusy}
            className="shrink-0"
          >
            <PlayCircle size={14} />
            Run All Pillars
          </Button>
        </div>
      </div>

      {/* GPSSA Mandate Corpus Scraper */}
      <div className="rounded-xl border border-gpssa-green/15 bg-gradient-to-br from-gpssa-green/[0.06] to-transparent p-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-gpssa-green/15 shrink-0 mt-0.5">
            <Globe size={14} className="text-gpssa-green" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-cream">GPSSA Mandate Corpus Scraper</p>
              <Badge variant="green" size="sm" dot>gpssa.gov.ae</Badge>
            </div>
            <p className="mt-1 text-xs text-gray-muted leading-relaxed max-w-3xl">
              Polite-scrapes <strong className="text-cream">gpssa.gov.ae/laws-and-regulations</strong> and the connected
              About / News / Governance pages, normalises HTML &amp; PDF content into Markdown,
              and persists it to the <code className="text-cream">GpssaPage</code> table. The
              <strong className="text-cream"> Mandate Corpus </strong> agent then structures it
              into Standards, Articles, Milestones and obligation links.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-gray-muted">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scrapeFollowPdfs}
                  onChange={(e) => setScrapeFollowPdfs(e.target.checked)}
                  className="accent-gpssa-green"
                />
                Follow PDFs
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scrapeForce}
                  onChange={(e) => setScrapeForce(e.target.checked)}
                  className="accent-gpssa-green"
                />
                Ignore ETag cache (force refetch)
              </label>
              {lastScrapeResult && (
                <span className="inline-flex items-center gap-1.5 text-cream/60">
                  <FileDown size={11} className="text-gpssa-green" />
                  Last run · {lastScrapeResult.pages} pages · {new Date(lastScrapeResult.ts).toLocaleString()}
                </span>
              )}
              {scrapeStatus && !lastScrapeResult && <span>{scrapeStatus}</span>}
              {scrapeStatus && lastScrapeResult && <span className="text-cream/60">{scrapeStatus}</span>}
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleScrapeGpssa}
            loading={scrapeBusy}
            disabled={scrapeBusy}
            className="shrink-0"
          >
            <Globe size={14} />
            Scrape now
          </Button>
        </div>
      </div>

      {loadingAgents ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(PILLAR_META).map(([pillarKey, meta]) => {
            const PillarIcon = meta.icon;
            const pillarAgents = screenAgents.filter((a) => meta.screens.includes(a.targetScreen!)).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
            const isExpanded = expandedPillars.has(pillarKey);
            const pillarRunning = pillarAgents.some((a) => getAgentState(getLatestJob(a.id)) === "running");
            const pillarCompleted = pillarAgents.filter((a) => getAgentState(getLatestJob(a.id)) === "completed").length;
            const stepRange = pillarAgents.length > 0 ? `Steps ${pillarAgents[0].sortOrder}–${pillarAgents[pillarAgents.length - 1].sortOrder}` : "";
            const hasIdleAgents = pillarAgents.some((a) => {
              const s = getAgentState(getLatestJob(a.id));
              return s === "idle" || s === "completed" || s === "failed" || s === "cancelled";
            });

            return (
              <Card key={pillarKey} variant="glass" padding="sm" className="!p-0 overflow-hidden border border-white/[0.06]">
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => togglePillar(pillarKey)}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1"
                  >
                    <div className="p-2 rounded-xl bg-white/5">
                      <PillarIcon size={20} className={meta.color} />
                    </div>
                    <div className="text-left">
                      <h3 className={`font-playfair text-lg font-semibold ${meta.color}`}>{meta.label}</h3>
                      <p className="text-xs text-gray-muted">
                        {stepRange} · {pillarAgents.length} agents · {pillarCompleted}/{pillarAgents.length} completed
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {pillarRunning && <Badge variant="blue" size="sm" dot>Running</Badge>}
                      {isExpanded ? <ChevronUp size={16} className="text-gray-muted" /> : <ChevronDown size={16} className="text-gray-muted" />}
                    </div>
                  </button>

                  {hasIdleAgents && !pillarRunning && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRunAllInPillar(pillarKey)}
                      className="ml-3 shrink-0"
                    >
                      <PlayCircle size={14} />
                      Run All
                    </Button>
                  )}
                </div>

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
                          const state = getAgentState(latestJob);

                          return (
                            <div key={agent.id} className="p-4 hover:bg-white/[0.01] transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[10px] font-bold text-white/60 shrink-0">{agent.sortOrder ?? "?"}</span>
                                    <h4 className="text-sm font-medium text-cream">{agent.name}</h4>
                                    <Badge variant="gray" size="sm">{SCREEN_LABELS[agent.targetScreen!] ?? agent.targetScreen}</Badge>
                                    <StatusBadge state={state} />
                                  </div>
                                  {agent.description && (
                                    <p className="text-xs text-gray-muted line-clamp-2 mb-2">{agent.description}</p>
                                  )}

                                  {latestJob && (
                                    <div className="space-y-1.5 mt-2">
                                      {latestJob.currentItem && latestJob.status === "running" && (
                                        <div className="flex items-center gap-2">
                                          <Loader2 size={10} className="animate-spin text-adl-blue" />
                                          <span className="text-xs text-gray-muted truncate max-w-[300px]">{latestJob.currentItem}</span>
                                        </div>
                                      )}
                                      <ProgressBar completed={latestJob.completedItems} total={latestJob.totalItems} failed={latestJob.failedItems} />
                                      <div className="flex gap-3 text-[10px] text-gray-muted">
                                        <span>Tokens: {latestJob.totalTokens.toLocaleString()}</span>
                                        <span>Cost: ${latestJob.totalCost.toFixed(4)}</span>
                                        {latestJob.completedAt && <span>Finished: {new Date(latestJob.completedAt).toLocaleDateString()}</span>}
                                      </div>
                                      {latestJob.lastError && (state === "failed" || latestJob.failedItems > 0) && (
                                        <div className="flex items-start gap-1.5 mt-1 p-1.5 rounded bg-red-500/10 border border-red-500/20">
                                          <XCircle size={10} className="text-red-400 shrink-0 mt-0.5" />
                                          <span className="text-[10px] text-red-300 break-all line-clamp-3">{latestJob.lastError}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <select
                                    value={agent.model}
                                    onChange={(e) => handleModelChange(agent.id, e.target.value)}
                                    className="px-2 py-1.5 rounded-lg glass text-cream text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 max-w-[160px]"
                                    title="Model (saved automatically)"
                                  >
                                    {!models.find((m) => m.id === agent.model) && <option value={agent.model}>{agent.model}</option>}
                                    {models.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}
                                  </select>

                                  {renderActionButtons(agent)}

                                  <button onClick={() => openEditModal(agent)} className="p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/5 transition-colors" title="Edit agent config">
                                    <Pencil size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {pillarAgents.length === 0 && (
                          <p className="text-sm text-gray-muted p-4 text-center">No agents registered for this pillar. Seed defaults to create them.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Agent Modal */}
      <Modal isOpen={!!editAgent} onClose={() => setEditAgent(null)} title="Edit Agent Configuration" description={editAgent?.name} size="xl">
        {renderAgentForm(editForm, setEditForm)}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
          <Button variant="ghost" onClick={() => setEditAgent(null)}>Cancel</Button>
          <Button onClick={handleSaveAgent} loading={savingAgent}>Save Changes</Button>
        </div>
      </Modal>

      {/* Clear Progress Confirmation Modal */}
      <Modal isOpen={!!confirmClear} onClose={() => setConfirmClear(null)} title="Clear Research Progress" size="md">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-cream font-medium">This action cannot be undone</p>
              <p className="text-xs text-gray-muted mt-1">
                This will delete all research jobs and their results for this agent, and reset the domain data back to &quot;pending&quot; status. The agent will need to re-research everything from scratch.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmClear(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => confirmClear && handleClearProgress(confirmClear)} loading={clearing}>
              <Trash2 size={14} />
              Clear All Progress
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
