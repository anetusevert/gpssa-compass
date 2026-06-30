"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricTile } from "@/components/performance";
import type { MetricTileData } from "@/components/performance";

const EASE = [0.16, 1, 0.3, 1] as const;

interface TierData {
  cadence: string;
  metrics: MetricTileData[];
}

const TAB_DEFS = [
  { id: "operational", label: "Operational" },
  { id: "tactical", label: "Tactical" },
  { id: "strategic", label: "Strategic" },
];

export default function DashboardsPage() {
  const [tiers, setTiers] = useState<Record<string, TierData>>({});
  const [active, setActive] = useState("operational");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/performance/dashboards", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { tiers: {} }))
      .then((data) => setTiers(data.tiers ?? {}))
      .catch(() => setTiers({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const current = tiers[active];
  const metrics = current?.metrics ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tiered Performance Dashboards"
        description="Three dashboard tiers matched to decision speed (Eckerson): operational monitors, tactical analyses, strategic manages."
        badge={{ label: "RAG · sparklines", variant: "blue" }}
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs tabs={TAB_DEFS} activeTab={active} onChange={setActive} variant="pills" />
        {current && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-muted">
            <Clock size={13} />
            Refresh cadence: <span className="text-cream/80">{current.cadence}</span>
          </span>
        )}
      </div>

      {metrics.length === 0 ? (
        <EmptyState
          icon={Gauge}
          title="No metrics in this tier"
          description="Seed the Performance module to populate tiered dashboard metrics."
        />
      ) : (
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {metrics.map((m, i) => (
            <MetricTile key={m.id} metric={m} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
