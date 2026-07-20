"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { staggerChildren, tileItem } from "@/lib/motion";

interface ModelInfo {
  id: string;
  name: string;
}

export default function AIConfigPage() {
  const [apiKey, setApiKey] = useState("");
  const [maskedKey, setMaskedKey] = useState("");
  const [keyStatus, setKeyStatus] = useState<"unknown" | "connected" | "disconnected">("unknown");
  const [savingKey, setSavingKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

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

  useEffect(() => {
    fetchConfig();
    fetchModels();
  }, [fetchConfig, fetchModels]);

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

  return (
    <PageFrame
      header={
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-white/5 shrink-0">
              <Cpu size={16} className="text-gpssa-green" />
            </div>
            <h1 className="font-playfair text-sm sm:text-base font-semibold text-cream">
              AI Configuration
            </h1>
            <span className="hidden sm:inline text-xs text-gray-muted">
              OpenAI integration & models
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <p className="text-[9px] uppercase tracking-[0.16em] text-white/40">Models</p>
              <p className="text-sm font-semibold text-cream tabular-nums">{models.length}</p>
            </div>
            {keyStatus === "connected" && <Badge variant="green" dot>Connected</Badge>}
            {keyStatus === "disconnected" && <Badge variant="red" dot>Disconnected</Badge>}
            {keyStatus === "unknown" && <Badge variant="gray" dot>Checking...</Badge>}
          </div>
        </div>
      }
    >
      <TileScroll className="pr-1">
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          {/* API Key Section */}
          <motion.div variants={tileItem}>
            <Card>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-white/5">
                  <Key size={20} className="text-gpssa-green" />
                </div>
                <div>
                  <h3 className="font-semibold text-cream">OpenAI API Key</h3>
                  <p className="text-xs text-gray-muted">Powers all AI features</p>
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
          </motion.div>

          {/* Available Models Section */}
          <motion.div variants={tileItem}>
            <Card>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-white/5">
                  <Cpu size={20} className="text-adl-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-cream">Available Models</h3>
                  <p className="text-xs text-gray-muted">Via your OpenAI key</p>
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
          </motion.div>
        </motion.div>
      </TileScroll>
    </PageFrame>
  );
}
