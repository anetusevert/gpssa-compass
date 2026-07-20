"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Clock } from "lucide-react";
import { fadeRise } from "@/lib/motion";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { Tabs } from "@/components/ui/Tabs";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricTile } from "@/components/performance";
import type { MetricTileData } from "@/components/performance";

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

  const current = tiers[active];
  const metrics = current?.metrics ?? [];

  return (
    <PageFrame
      header={
        <div className="space-y-2.5 pb-3">
          <div className="flex items-center gap-2.5">
            <Gauge size={16} className="shrink-0 text-adl-blue" />
            <h1 className="truncate font-playfair text-sm font-semibold text-cream sm:text-base">
              Tiered Performance Dashboards
            </h1>
            <span className="hidden text-[11px] text-white/40 md:inline">
              Dashboards matched to decision speed
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Tabs tabs={TAB_DEFS} activeTab={active} onChange={setActive} variant="pills" />
            {current && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-muted">
                <Clock size={13} />
                Refresh cadence: <span className="text-cream/80">{current.cadence}</span>
              </span>
            )}
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : metrics.length === 0 ? (
        <EmptyState
          icon={Gauge}
          title="No metrics in this tier"
          description="Seed the Performance module to populate tiered dashboard metrics."
        />
      ) : (
        <TileScroll className="pr-1">
          <motion.div
            key={active}
            variants={fadeRise}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4"
          >
            {metrics.map((m, i) => (
              <MetricTile key={m.id} metric={m} index={i} />
            ))}
          </motion.div>
        </TileScroll>
      )}
    </PageFrame>
  );
}
