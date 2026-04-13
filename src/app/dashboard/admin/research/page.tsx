"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Search,
  Square,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface JobItem {
  id: string;
  countryIso3: string;
  status: string;
  tokensUsed: number;
  durationMs: number;
  error: string | null;
}

interface ResearchJob {
  id: string;
  status: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  currentItem: string | null;
  totalTokens: number;
  totalCost: number;
  startedAt: string | null;
  completedAt: string | null;
  items?: JobItem[];
}

interface CountryRow {
  id: string;
  iso3: string;
  name: string;
  flag: string | null;
  region: string;
  institution: string | null;
  maturityScore: number | null;
  maturityLabel: string | null;
  researchStatus: string;
  researchedAt: string | null;
  keyFeatures: string | null;
  challenges: string | null;
  insights: string | null;
  digitalLevel: string | null;
  coverageRate: number | null;
  replacementRate: number | null;
  sustainability: number | null;
  systemType: string | null;
  yearEstablished: number | null;
}

function statusBadge(status: string) {
  const map: Record<string, "green" | "blue" | "gold" | "gray"> = {
    completed: "green",
    running: "blue",
    processing: "blue",
    researching: "blue",
    paused: "gold",
    pending: "gray",
    failed: "gray",
    cancelled: "gray",
  };
  return <Badge variant={map[status] ?? "gray"} size="sm">{status}</Badge>;
}

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function ResearchPage() {
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [activeJob, setActiveJob] = useState<ResearchJob | null>(null);
  const [countries, setCountries] = useState<CountryRow[]>([]);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("All");
  const [starting, setStarting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryRow | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/research-jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        const running = data.find((j: ResearchJob) => j.status === "running" || j.status === "paused");
        if (running) setActiveJob(running);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (regionFilter !== "All") params.set("region", regionFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/countries?${params}`);
      if (res.ok) setCountries(await res.json());
    } catch { /* ignore */ }
  }, [regionFilter, search]);

  const pollJobProgress = useCallback(async () => {
    if (!activeJob) return;
    try {
      const res = await fetch(`/api/admin/research-jobs/${activeJob.id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveJob(data);
        if (data.status === "completed" || data.status === "cancelled" || data.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          fetchCountries();
        }
      }
    } catch { /* ignore */ }
  }, [activeJob, fetchCountries]);

  useEffect(() => {
    fetchJobs();
    fetchCountries();
  }, [fetchJobs, fetchCountries]);

  useEffect(() => {
    if (activeJob && (activeJob.status === "running")) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        pollJobProgress();
        fetchCountries();
      }, 2000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeJob, pollJobProgress, fetchCountries]);

  async function startJob() {
    setStarting(true);
    try {
      const res = await fetch("/api/admin/research-jobs", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setActiveJob({ ...data, totalItems: 0, completedItems: 0, failedItems: 0, totalTokens: 0, totalCost: 0, currentItem: null, startedAt: new Date().toISOString(), completedAt: null });
        fetchJobs();
      }
    } finally {
      setStarting(false);
    }
  }

  async function pauseJob() {
    if (!activeJob) return;
    await fetch(`/api/admin/research-jobs/${activeJob.id}/pause`, { method: "POST" });
    setActiveJob({ ...activeJob, status: "paused" });
  }

  async function resumeJob() {
    if (!activeJob) return;
    await fetch(`/api/admin/research-jobs/${activeJob.id}/resume`, { method: "POST" });
    setActiveJob({ ...activeJob, status: "running" });
  }

  async function cancelJob() {
    if (!activeJob) return;
    await fetch(`/api/admin/research-jobs/${activeJob.id}/cancel`, { method: "POST" });
    setActiveJob({ ...activeJob, status: "cancelled" });
    if (pollRef.current) clearInterval(pollRef.current);
  }

  const regions = ["All", ...Array.from(new Set(countries.map((c) => c.region)))];
  const completed = countries.filter((c) => c.researchStatus === "completed").length;
  const filtered = countries.filter((c) => {
    if (regionFilter !== "All" && c.region !== regionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.iso3.toLowerCase().includes(q) || (c.institution ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const progress = activeJob && activeJob.totalItems > 0 ? Math.round((activeJob.completedItems / activeJob.totalItems) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Global Research Agent"
        description="AI-powered research engine for social security and pension systems across all countries."
      />

      {/* Job Controls */}
      <Card variant="glass" padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-cream">Research Engine</h3>
            <p className="mt-1 text-sm text-gray-muted">
              {completed} / {countries.length} countries researched
            </p>
          </div>
          <div className="flex gap-2">
            {!activeJob || activeJob.status === "completed" || activeJob.status === "cancelled" || activeJob.status === "failed" ? (
              <Button onClick={startJob} disabled={starting}>
                {starting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                Start Global Research
              </Button>
            ) : (
              <>
                {activeJob.status === "running" && (
                  <Button variant="secondary" onClick={pauseJob}>
                    <Pause size={16} /> Pause
                  </Button>
                )}
                {activeJob.status === "paused" && (
                  <Button onClick={resumeJob}>
                    <RotateCcw size={16} /> Resume
                  </Button>
                )}
                <Button variant="secondary" onClick={cancelJob}>
                  <Square size={16} /> Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {activeJob && (activeJob.status === "running" || activeJob.status === "paused") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 space-y-4"
          >
            <div className="relative h-3 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gpssa-green"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-gray-muted">Progress: </span>
                <span className="text-cream">{activeJob.completedItems} / {activeJob.totalItems}</span>
              </div>
              {activeJob.currentItem && (
                <div>
                  <span className="text-gray-muted">Researching: </span>
                  <span className="text-cream">{activeJob.currentItem}</span>
                </div>
              )}
              <div>
                <span className="text-gray-muted">Tokens: </span>
                <span className="text-cream">{activeJob.totalTokens.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-muted">Cost: </span>
                <span className="text-cream">${activeJob.totalCost.toFixed(4)}</span>
              </div>
              {activeJob.failedItems > 0 && (
                <div>
                  <span className="text-gray-muted">Failed: </span>
                  <span className="text-orange-400">{activeJob.failedItems}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </Card>

      {/* Country Grid */}
      <Card variant="glass" padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-cream">
            <Globe size={18} className="mr-2 inline-block" />
            Country Database ({filtered.length})
          </h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries..."
                className="rounded-xl bg-white/[0.05] py-2 pl-9 pr-3 text-sm text-cream outline-none"
              />
            </div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="rounded-xl bg-white/[0.05] px-3 py-2 text-sm text-cream outline-none"
            >
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-auto max-h-[50vh] rounded-xl">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-navy/90 backdrop-blur-md">
              <tr className="text-left text-[11px] uppercase tracking-wider text-gray-muted">
                <th className="p-3">Country</th>
                <th className="p-3">Region</th>
                <th className="p-3">Status</th>
                <th className="p-3">Maturity</th>
                <th className="p-3">Institution</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.iso3}
                  onClick={() => setSelectedCountry(c)}
                  className="cursor-pointer border-t border-white/[0.04] transition-colors hover:bg-white/[0.03]"
                >
                  <td className="p-3 font-medium text-cream">
                    {c.flag} {c.name}
                  </td>
                  <td className="p-3 text-gray-muted">{c.region}</td>
                  <td className="p-3">{statusBadge(c.researchStatus)}</td>
                  <td className="p-3 text-cream">
                    {c.maturityScore ? `${c.maturityScore.toFixed(1)} — ${c.maturityLabel}` : "—"}
                  </td>
                  <td className="p-3 text-gray-muted max-w-[200px] truncate">
                    {c.institution ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Country Detail Modal */}
      <Modal
        isOpen={!!selectedCountry}
        onClose={() => setSelectedCountry(null)}
        title={selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : ""}
        description={selectedCountry?.region ?? ""}
        size="xl"
      >
        {selectedCountry && selectedCountry.researchStatus === "completed" ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Digital Maturity", value: selectedCountry.maturityScore?.toFixed(1), sub: selectedCountry.maturityLabel },
                { label: "Coverage Rate", value: selectedCountry.coverageRate ? `${Math.round(selectedCountry.coverageRate)}%` : "—", sub: "of workforce" },
                { label: "Replacement Rate", value: selectedCountry.replacementRate ? `${Math.round(selectedCountry.replacementRate)}%` : "—", sub: "of salary" },
                { label: "Sustainability", value: selectedCountry.sustainability?.toFixed(1), sub: `/ 4.0` },
              ].map((m) => (
                <div key={m.label} className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-wider text-gray-muted">{m.label}</p>
                  <p className="mt-1 font-playfair text-2xl text-cream">{m.value ?? "—"}</p>
                  <p className="text-xs text-gray-muted">{m.sub}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-cream">Institution</p>
              <p className="mt-1 text-sm text-gray-muted">
                {selectedCountry.institution ?? "Unknown"} · {selectedCountry.systemType ?? "—"} · Est. {selectedCountry.yearEstablished ?? "—"}
              </p>
              <p className="mt-1 text-xs text-gray-muted">
                <Zap size={12} className="mr-1 inline-block" /> {selectedCountry.digitalLevel ?? "—"}
              </p>
            </div>

            {parseJsonArray(selectedCountry.keyFeatures).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cream">Key Features</p>
                <ul className="space-y-1">
                  {parseJsonArray(selectedCountry.keyFeatures).map((f, i) => (
                    <li key={i} className="text-sm text-gray-muted">• {f}</li>
                  ))}
                </ul>
              </div>
            )}

            {parseJsonArray(selectedCountry.insights).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cream">Insights & Innovations</p>
                <ul className="space-y-1">
                  {parseJsonArray(selectedCountry.insights).map((f, i) => (
                    <li key={i} className="text-sm text-gray-muted">• {f}</li>
                  ))}
                </ul>
              </div>
            )}

            {parseJsonArray(selectedCountry.challenges).length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-cream">Challenges</p>
                <ul className="space-y-1">
                  {parseJsonArray(selectedCountry.challenges).map((f, i) => (
                    <li key={i} className="text-sm text-gray-muted">• {f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-muted">
            {selectedCountry?.researchStatus === "pending" ? "This country has not been researched yet. Run the research agent to populate data." : `Status: ${selectedCountry?.researchStatus}`}
          </p>
        )}
      </Modal>
    </>
  );
}
