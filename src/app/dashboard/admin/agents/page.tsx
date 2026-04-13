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
  executionCount: number;
  lastRunAt: string | null;
  createdAt: string;
}

interface ModelInfo {
  id: string;
  name: string;
}

interface ExecutionResult {
  success: boolean;
  output: string | null;
  tokensUsed: number;
  durationMs: number;
  model: string;
  error?: string;
}

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

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [models, setModels] = useState<ModelInfo[]>([]);

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

  const fetchAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const res = await fetch("/api/agents");
      if (res.ok) setAgents(await res.json());
    } catch {
      /* ignore */
    } finally {
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
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    fetchModels();
  }, [fetchAgents, fetchModels]);

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
      if (res.ok) {
        setEditAgent(null);
        fetchAgents();
      }
    } catch {
      /* ignore */
    } finally {
      setSavingAgent(false);
    }
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
      if (res.ok) {
        setShowCreateModal(false);
        setCreateForm({ ...EMPTY_AGENT_FORM });
        fetchAgents();
      }
    } catch {
      /* ignore */
    } finally {
      setCreatingAgent(false);
    }
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
      setTestResult({
        success: false,
        output: null,
        tokensUsed: 0,
        durationMs: 0,
        model: testAgent.model,
        error: "Network error",
      });
    } finally {
      setRunningTest(false);
    }
  }

  const stats = {
    total: agents.length,
    active: agents.filter((a) => a.isActive).length,
    totalRuns: agents.reduce((s, a) => s + a.executionCount, 0),
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
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              placeholder="Agent name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Model</label>
            <select
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
            >
              {form.model && !models.find((m) => m.id === form.model) && (
                <option value={form.model}>{form.model}</option>
              )}
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.id}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
            placeholder="Brief description of agent purpose"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-xs text-gray-muted mb-1.5 uppercase tracking-wider">
              <Thermometer size={12} />
              Temperature: {form.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
              className="w-full accent-gpssa-green"
            />
            <div className="flex justify-between text-[10px] text-gray-muted mt-1">
              <span>Precise (0)</span>
              <span>Creative (2)</span>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs text-gray-muted mb-1.5 uppercase tracking-wider">
              <Hash size={12} />
              Max Tokens
            </label>
            <input
              type="number"
              value={form.maxTokens}
              onChange={(e) => setForm({ ...form, maxTokens: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">System Prompt</label>
          <textarea
            value={form.systemPrompt}
            onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
            rows={6}
            className="w-full px-3 py-2 rounded-lg glass text-cream text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 resize-y"
            placeholder="Define the agent's role and capabilities..."
          />
        </div>

        <div>
          <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">
            User Prompt Template
            <span className="ml-2 normal-case tracking-normal text-gray-muted/70">
              (use &#123;variable&#125; for dynamic fields)
            </span>
          </label>
          <textarea
            value={form.userPromptTemplate}
            onChange={(e) => setForm({ ...form, userPromptTemplate: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 rounded-lg glass text-cream text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 resize-y"
            placeholder="Define the input template with {VARIABLE} placeholders..."
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-muted uppercase tracking-wider">Active</label>
          <button
            onClick={() => setForm({ ...form, isActive: !form.isActive })}
            className="text-cream"
          >
            {form.isActive ? (
              <ToggleRight size={28} className="text-gpssa-green" />
            ) : (
              <ToggleLeft size={28} className="text-gray-muted" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Agent Registry"
        description="Manage AI agents, their prompts, and model configuration"
        actions={
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus size={16} />
            New Agent
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Agents" value={stats.total} icon={Bot} />
        <StatCard label="Active" value={stats.active} icon={Zap} />
        <StatCard label="Total Runs" value={stats.totalRuns} icon={Clock} />
      </div>

      <Card>
        {loadingAgents ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : agents.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="No agents configured"
            description="Create your first AI agent to get started"
            action={{ label: "New Agent", onClick: () => setShowCreateModal(true) }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Agent</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Model</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Temp</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden lg:table-cell">Tokens</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden lg:table-cell">Runs</th>
                  <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Status</th>
                  <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {agents.map((agent) => (
                  <motion.tr
                    key={agent.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-medium text-cream">{agent.name}</p>
                        {agent.description && (
                          <p className="text-xs text-gray-muted mt-0.5 line-clamp-1">{agent.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-xs text-adl-blue">{agent.model}</span>
                    </td>
                    <td className="py-3 px-3 hidden md:table-cell">
                      <span className="text-cream">{agent.temperature}</span>
                    </td>
                    <td className="py-3 px-3 hidden lg:table-cell">
                      <span className="text-cream">{agent.maxTokens.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-3 hidden lg:table-cell">
                      <span className="text-cream">{agent.executionCount}</span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={agent.isActive ? "green" : "gray"} dot size="sm">
                        {agent.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(agent)}
                          className="p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/5 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => openTestModal(agent)}
                          className="p-1.5 rounded-lg text-gray-muted hover:text-gpssa-green hover:bg-gpssa-green/10 transition-colors"
                          title="Test"
                        >
                          <Play size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Agent Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Agent"
        size="xl"
      >
        {renderAgentForm(createForm, setCreateForm)}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateAgent}
            loading={creatingAgent}
            disabled={!createForm.name || !createForm.systemPrompt || !createForm.userPromptTemplate}
          >
            Create Agent
          </Button>
        </div>
      </Modal>

      {/* Edit Agent Modal */}
      <Modal
        isOpen={!!editAgent}
        onClose={() => setEditAgent(null)}
        title="Edit Agent"
        description={editAgent?.name}
        size="xl"
      >
        {renderAgentForm(editForm, setEditForm)}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-4">
          <Button variant="ghost" onClick={() => setEditAgent(null)}>
            Cancel
          </Button>
          <Button onClick={handleSaveAgent} loading={savingAgent}>
            Save Changes
          </Button>
        </div>
      </Modal>

      {/* Test Agent Modal */}
      <Modal
        isOpen={!!testAgent}
        onClose={() => { setTestAgent(null); setTestResult(null); }}
        title="Test Agent"
        description={testAgent?.name}
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {Object.keys(testVariables).length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-muted uppercase tracking-wider">Template Variables</p>
              {Object.entries(testVariables).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs text-cream mb-1 font-mono">&#123;{key}&#125;</label>
                  <textarea
                    value={value}
                    onChange={(e) =>
                      setTestVariables({ ...testVariables, [key]: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 resize-y"
                    placeholder={`Enter value for ${key}...`}
                  />
                </div>
              ))}
            </div>
          )}

          {Object.keys(testVariables).length === 0 && (
            <p className="text-sm text-gray-muted">
              No template variables detected. The agent will run with its default prompt.
            </p>
          )}

          <Button onClick={handleRunTest} loading={runningTest} fullWidth>
            <Play size={16} />
            Run Agent
          </Button>

          <AnimatePresence>
            {runningTest && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-3 py-6"
              >
                <LoadingSpinner />
                <span className="text-sm text-gray-muted">Executing agent...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle2 size={16} className="text-gpssa-green" />
                  ) : (
                    <XCircle size={16} className="text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${testResult.success ? "text-gpssa-green" : "text-red-400"}`}>
                    {testResult.success ? "Execution Successful" : "Execution Failed"}
                  </span>
                </div>

                <div className="flex gap-4 text-xs text-gray-muted">
                  <span>Model: <span className="text-cream font-mono">{testResult.model}</span></span>
                  <span>Tokens: <span className="text-cream">{testResult.tokensUsed}</span></span>
                  <span>Duration: <span className="text-cream">{testResult.durationMs}ms</span></span>
                </div>

                {testResult.output && (
                  <div className="glass rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-cream whitespace-pre-wrap font-mono leading-relaxed">
                      {testResult.output}
                    </pre>
                  </div>
                )}

                {testResult.error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-sm text-red-400">{testResult.error}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </div>
  );
}
