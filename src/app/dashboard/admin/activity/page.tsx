"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ScrollText,
  Bot,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

interface ExecutionRecord {
  id: string;
  agentId: string;
  agent: { name: string };
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  model: string;
  tokensUsed: number | null;
  durationMs: number | null;
  status: string;
  error: string | null;
  createdAt: string;
}

interface ActivityRecord {
  id: string;
  actor: string;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

interface PaginatedResponse<T> {
  records: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const tabItems = [
  { id: "executions", label: "AI Executions", icon: Bot },
  { id: "activity", label: "User Activity", icon: Users },
];

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState("executions");
  const [page, setPage] = useState(1);
  const [limit] = useState(25);

  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [detailRecord, setDetailRecord] = useState<ExecutionRecord | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const type = activeTab === "executions" ? "executions" : "activity";
      const res = await fetch(
        `/api/admin/activity?type=${type}&page=${page}&limit=${limit}`
      );
      if (res.ok) {
        const data: PaginatedResponse<ExecutionRecord | ActivityRecord> = await res.json();
        if (type === "executions") {
          setExecutions(data.records as ExecutionRecord[]);
        } else {
          setActivities(data.records as ActivityRecord[]);
        }
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const statusVariant = (s: string) => {
    if (s === "completed") return "green";
    if (s === "failed") return "red";
    if (s === "running") return "gold";
    return "gray";
  };

  const statusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle2 size={14} className="text-gpssa-green" />;
    if (s === "failed") return <XCircle size={14} className="text-red-400" />;
    return <Loader2 size={14} className="text-gold animate-spin" />;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Activity Logs"
        description="AI execution logs and user activity"
      />

      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} variant="pills" />

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* AI Executions Tab */}
          {activeTab === "executions" && (
            <Card>
              {executions.length === 0 ? (
                <EmptyState
                  icon={Bot}
                  title="No executions yet"
                  description="AI agent execution logs will appear here"
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Agent</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden sm:table-cell">Model</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Tokens</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Duration</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Status</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden lg:table-cell">Date</th>
                          <th className="text-right py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {executions.map((exec) => (
                          <motion.tr
                            key={exec.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                            onClick={() => setDetailRecord(exec)}
                          >
                            <td className="py-3 px-3">
                              <span className="text-cream font-medium">{exec.agent.name}</span>
                            </td>
                            <td className="py-3 px-3 hidden sm:table-cell">
                              <span className="font-mono text-xs text-adl-blue">{exec.model}</span>
                            </td>
                            <td className="py-3 px-3 hidden md:table-cell">
                              <span className="text-cream">{exec.tokensUsed?.toLocaleString() ?? "—"}</span>
                            </td>
                            <td className="py-3 px-3 hidden md:table-cell">
                              <span className="text-cream">{exec.durationMs ? `${exec.durationMs}ms` : "—"}</span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                {statusIcon(exec.status)}
                                <Badge variant={statusVariant(exec.status)} size="sm">
                                  {exec.status}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-3 px-3 hidden lg:table-cell">
                              <span className="text-xs text-gray-muted">
                                {new Date(exec.createdAt).toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button className="p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/5 transition-colors">
                                <Eye size={15} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                      <span className="text-xs text-gray-muted">
                        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                          className="p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs text-cream">
                          Page {page} of {totalPages}
                        </span>
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page >= totalPages}
                          className="p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}

          {/* User Activity Tab */}
          {activeTab === "activity" && (
            <Card>
              {activities.length === 0 ? (
                <EmptyState
                  icon={ScrollText}
                  title="No activity yet"
                  description="User activity logs will appear here"
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Actor</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Action</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium hidden md:table-cell">Details</th>
                          <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-gray-muted font-medium">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {activities.map((act) => (
                          <motion.tr
                            key={act.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3 px-3">
                              <span className="text-cream font-medium">{act.actor}</span>
                            </td>
                            <td className="py-3 px-3">
                              <Badge variant="blue" size="sm">{act.action}</Badge>
                            </td>
                            <td className="py-3 px-3 hidden md:table-cell">
                              <span className="text-xs text-gray-muted line-clamp-1 max-w-xs">
                                {act.details ? JSON.stringify(act.details) : "—"}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-xs text-gray-muted">
                                {new Date(act.createdAt).toLocaleString()}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                      <span className="text-xs text-gray-muted">
                        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                          className="p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs text-cream">
                          Page {page} of {totalPages}
                        </span>
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page >= totalPages}
                          className="p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          )}
        </>
      )}

      {/* Execution Detail Modal */}
      <Modal
        isOpen={!!detailRecord}
        onClose={() => setDetailRecord(null)}
        title="Execution Details"
        description={detailRecord?.agent.name}
        size="xl"
      >
        {detailRecord && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass rounded-lg p-3">
                <p className="text-[10px] text-gray-muted uppercase tracking-wider mb-1">Status</p>
                <div className="flex items-center gap-1.5">
                  {statusIcon(detailRecord.status)}
                  <span className="text-sm text-cream capitalize">{detailRecord.status}</span>
                </div>
              </div>
              <div className="glass rounded-lg p-3">
                <p className="text-[10px] text-gray-muted uppercase tracking-wider mb-1">Model</p>
                <p className="text-sm text-cream font-mono">{detailRecord.model}</p>
              </div>
              <div className="glass rounded-lg p-3">
                <p className="text-[10px] text-gray-muted uppercase tracking-wider mb-1">Tokens</p>
                <p className="text-sm text-cream">{detailRecord.tokensUsed?.toLocaleString() ?? "—"}</p>
              </div>
              <div className="glass rounded-lg p-3">
                <p className="text-[10px] text-gray-muted uppercase tracking-wider mb-1">Duration</p>
                <p className="text-sm text-cream">{detailRecord.durationMs ? `${detailRecord.durationMs}ms` : "—"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-muted uppercase tracking-wider mb-2">Input</p>
              <div className="glass rounded-lg p-4 max-h-48 overflow-y-auto">
                <pre className="text-xs text-cream whitespace-pre-wrap font-mono">
                  {JSON.stringify(detailRecord.input, null, 2)}
                </pre>
              </div>
            </div>

            {detailRecord.output && (
              <div>
                <p className="text-xs text-gray-muted uppercase tracking-wider mb-2">Output</p>
                <div className="glass rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-cream whitespace-pre-wrap font-mono leading-relaxed">
                    {typeof detailRecord.output === "object" && "content" in detailRecord.output
                      ? String(detailRecord.output.content)
                      : JSON.stringify(detailRecord.output, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {detailRecord.error && (
              <div>
                <p className="text-xs text-gray-muted uppercase tracking-wider mb-2">Error</p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-sm text-red-400">{detailRecord.error}</p>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-muted pt-2 border-t border-white/10">
              <Clock size={12} className="inline mr-1.5" />
              {new Date(detailRecord.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
