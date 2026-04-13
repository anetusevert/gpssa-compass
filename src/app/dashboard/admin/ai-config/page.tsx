"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  CheckCircle2,
  XCircle,
  Cpu,
  Bot,
  Play,
  Pencil,
  Loader2,
  RefreshCw,
  Thermometer,
  Hash,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
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

export default function AIConfigPage() {
  const [apiKey, setApiKey] = useState("");
  const [maskedKey, setMaskedKey] = useState("");
  const [keyStatus, setKeyStatus] = useState<"unknown" | "connected" | "disconnected">("unknown");
  const [savingKey, setSavingKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);

  const [editAgent, setEditAgent] = useState<AgentConfig | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    model: "",
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: "",
    userPromptTemplate: "",
    isActive: true,
  });
  const [savingAgent, setSavingAgent] = useState(false);

  const [testAgent, setTestAgent] = useState<AgentConfig | null>(null);
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<ExecutionResult | null>(null);
  const [runningTest, setRunningTest] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const data = await res.json();
        setMaskedKey(data.openai_api_key || "");
        setKeyStatus(data.openai_api_key ? "connected" : "disconnected");
      }
    } catch {
      setKeyStatus("disconnected");
    }
  }, []);

  const fetchModels = useCallback(async () => {
    setLoadingModels(true);
    try {
      const res = await fetch("/api/agents/models");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.models ?? []);
        setModels(list);
        if (list.length > 0) setKeyStatus("connected");
      } else {
        setKeyStatus("disconnected");
      }
    } catch {
      setKeyStatus("disconnected");
    } finally {
      setLoadingModels(false);
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        setAgents(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoadingAgents(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchModels();
    fetchAgents();
  }, [fetchConfig, fetchModels, fetchAgents]);

  async function handleSaveKey() {
    if (!apiKey.trim()) return;
    setSavingKey(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ openai_api_key: apiKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setMaskedKey(data.openai_api_key || "");
        setApiKey("");
        setKeyStatus("connected");
        fetchModels();
      }
    } catch {
      setKeyStatus("disconnected");
    } finally {
      setSavingKey(false);
    }
  }

  async function handleTestConnection() {
    setTestingConnection(true);
    try {
      const res = await fetch("/api/agents/models");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.models ?? []);
        setModels(list);
        setKeyStatus(list.length > 0 ? "connected" : "disconnected");
      } else {
        setKeyStatus("disconnected");
      }
    } catch {
      setKeyStatus("disconnected");
    } finally {
      setTestingConnection(false);
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
      if (res.ok) {
        setEditAgent(null);
        fetchAgents();
      }
    } catch {
      // silently fail
    } finally {
      setSavingAgent(false);
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
      const data = await res.json();
      setTestResult(data);
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Configuration"
        description="Manage OpenAI integration and agent models"
      />

      {/* API Key Section */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-white/5">
            <Key size={20} className="text-gpssa-green" />
          </div>
          <div>
            <h3 className="font-semibold text-cream">OpenAI API Key</h3>
            <p className="text-xs text-gray-muted">Configure your OpenAI API key for AI-powered features</p>
          </div>
          <div className="ml-auto">
            {keyStatus === "connected" && (
              <Badge variant="green" dot>Connected</Badge>
            )}
            {keyStatus === "disconnected" && (
              <Badge variant="red" dot>Disconnected</Badge>
            )}
            {keyStatus === "unknown" && (
              <Badge variant="gray" dot>Checking...</Badge>
            )}
          </div>
        </div>

        {maskedKey && (
          <p className="text-sm text-gray-muted mb-3">
            Current key: <span className="font-mono text-cream">{maskedKey}</span>
          </p>
        )}

        <div className="flex gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="flex-1 px-4 py-2.5 rounded-xl glass text-cream text-sm placeholder:text-gray-muted/50 focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 font-mono"
          />
          <Button
            onClick={handleSaveKey}
            loading={savingKey}
            disabled={!apiKey.trim()}
            size="md"
          >
            Save Key
          </Button>
          <Button
            variant="secondary"
            onClick={handleTestConnection}
            loading={testingConnection}
            size="md"
          >
            <RefreshCw size={16} />
            Test Connection
          </Button>
        </div>
      </Card>

      {/* Available Models Section */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-white/5">
            <Cpu size={20} className="text-adl-blue" />
          </div>
          <div>
            <h3 className="font-semibold text-cream">Available Models</h3>
            <p className="text-xs text-gray-muted">GPT models available via your OpenAI API key</p>
          </div>
          <Badge variant="blue" className="ml-auto">{models.length} models</Badge>
        </div>

        {loadingModels ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : models.length === 0 ? (
          <p className="text-sm text-gray-muted py-4 text-center">
            No models found. Ensure your API key is valid and connected.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {models.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] text-sm"
              >
                <Cpu size={14} className="text-adl-blue shrink-0" />
                <span className="text-cream font-mono text-xs truncate">{m.id}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Agent Registry Section */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-white/5">
            <Bot size={20} className="text-gold" />
          </div>
          <div>
            <h3 className="font-semibold text-cream">Agent Registry</h3>
            <p className="text-xs text-gray-muted">Manage AI agents, their prompts, and model configuration</p>
          </div>
          <Badge variant="gold" className="ml-auto">{agents.length} agents</Badge>
        </div>

        {loadingAgents ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : agents.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="No agents configured"
            description="Create your first AI agent to get started"
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

      {/* Edit Agent Modal */}
      <Modal
        isOpen={!!editAgent}
        onClose={() => setEditAgent(null)}
        title="Edit Agent"
        description={editAgent?.name}
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Name</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">Model</label>
              <select
                value={editForm.model}
                onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                className="w-full px-3 py-2 rounded-lg glass text-cream text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              >
                {editForm.model && !models.find((m) => m.id === editForm.model) && (
                  <option value={editForm.model}>{editForm.model}</option>
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
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs text-gray-muted mb-1.5 uppercase tracking-wider">
                <Thermometer size={12} />
                Temperature: {editForm.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={editForm.temperature}
                onChange={(e) => setEditForm({ ...editForm, temperature: parseFloat(e.target.value) })}
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
                value={editForm.maxTokens}
                onChange={(e) => setEditForm({ ...editForm, maxTokens: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 rounded-lg glass text-cream text-sm focus:outline-none focus:ring-1 focus:ring-gpssa-green/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-muted mb-1.5 uppercase tracking-wider">System Prompt</label>
            <textarea
              value={editForm.systemPrompt}
              onChange={(e) => setEditForm({ ...editForm, systemPrompt: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 resize-y"
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
              value={editForm.userPromptTemplate}
              onChange={(e) => setEditForm({ ...editForm, userPromptTemplate: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 rounded-lg glass text-cream text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gpssa-green/50 resize-y"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-muted uppercase tracking-wider">Active</label>
            <button
              onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
              className="text-cream"
            >
              {editForm.isActive ? (
                <ToggleRight size={28} className="text-gpssa-green" />
              ) : (
                <ToggleLeft size={28} className="text-gray-muted" />
              )}
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setEditAgent(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAgent} loading={savingAgent}>
              Save Changes
            </Button>
          </div>
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

          <Button
            onClick={handleRunTest}
            loading={runningTest}
            fullWidth
          >
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
