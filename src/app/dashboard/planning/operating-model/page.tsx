"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, GraduationCap, BookOpen, Users, Gauge } from "lucide-react";
import { fadeRise, staggerChildren, tileItem } from "@/lib/motion";
import { PageFrame, TileScroll } from "@/components/ui/PageFrame";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { CoEDiagram } from "@/components/roadmap/CoEDiagram";

interface CapabilityItem {
  id: string;
  item: string;
  mechanism: string;
  phase: string | null;
  owner: string | null;
  status: string;
  sustainmentMetric: string | null;
}

const MECHANISM_META: Record<
  string,
  { label: string; icon: typeof BookOpen; variant: "green" | "blue" | "gold" | "gray" }
> = {
  "train-the-trainer": { label: "Train-the-trainer", icon: GraduationCap, variant: "green" },
  playbook: { label: "Playbook", icon: BookOpen, variant: "blue" },
  coaching: { label: "Coaching", icon: Users, variant: "gold" },
  "sustainment-metric": { label: "Sustainment metric", icon: Gauge, variant: "gray" },
};

const statusVariant: Record<string, "green" | "gold" | "gray"> = {
  embedded: "green",
  "in-progress": "gold",
  planned: "gray",
};

export default function OperatingModelPage() {
  const [items, setItems] = useState<CapabilityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/governance/capability")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageFrame
      header={
        <div className="flex items-center gap-2.5 pb-3">
          <Building2 size={16} className="shrink-0 text-gold" />
          <h1 className="truncate font-playfair text-sm font-semibold text-cream sm:text-base">
            Operating Model
          </h1>
          <span className="hidden text-[11px] text-white/40 md:inline">
            Federated CoE and capability transfer
          </span>
        </div>
      }
    >
      <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* CoE diagram tile — own scroll */}
        <motion.div
          variants={fadeRise}
          initial="hidden"
          animate="show"
          className="glass-card flex min-h-0 flex-col overflow-hidden p-5"
        >
          <div className="mb-3 flex shrink-0 items-center gap-2">
            <Building2 size={16} className="text-gold" />
            <h2 className="font-playfair text-base font-semibold text-cream">
              Federated Centre-of-Excellence
            </h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <CoEDiagram />
            <p className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs text-cream">
              <span className="font-semibold text-gold">Why capability transfer matters: </span>
              60–70% of change initiatives fail, mainly from weak leadership support and
              resistance. A documented-playbook approach with metric-threshold escalation
              lifted post-change metric retention from{" "}
              <span className="font-semibold text-gpssa-green">~10% to ~95% at six months</span>
              {" "}— success is declared only after a sustainment window, not at go-live.
            </p>
          </div>
        </motion.div>

        {/* Capability-transfer checklist */}
        <div className="flex min-h-0 flex-col">
          <h2 className="mb-3 shrink-0 font-playfair text-base font-semibold text-cream">
            Capability-Transfer Checklist
          </h2>

          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No capability-transfer items yet"
              description="Seed the Roadmap & Governance module to populate the plan."
            />
          ) : (
            <TileScroll className="pr-1">
              <motion.div
                variants={staggerChildren}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-3 pb-4"
              >
                {items.map((c) => {
                  const meta = MECHANISM_META[c.mechanism] ?? MECHANISM_META.playbook;
                  const Icon = meta.icon;
                  return (
                    <motion.div key={c.id} variants={tileItem}>
                      <Card padding="md" hover>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="rounded-lg bg-white/5 p-1.5">
                              <Icon size={16} className="text-gray-muted" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-cream">{c.item}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <Badge variant={meta.variant} size="sm">
                                  {meta.label}
                                </Badge>
                                {c.phase && (
                                  <span className="text-[11px] text-gray-muted">
                                    {c.phase}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={statusVariant[c.status] ?? "gray"}
                            size="sm"
                            dot
                          >
                            {c.status}
                          </Badge>
                        </div>

                        {c.sustainmentMetric && (
                          <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-border bg-navy-light/40 px-2.5 py-1.5">
                            <Gauge size={13} className="text-teal-300" />
                            <span className="text-[11px] text-gray-muted">
                              Sustainment: {c.sustainmentMetric}
                            </span>
                          </div>
                        )}
                        {c.owner && (
                          <p className="mt-2 text-[11px] text-gray-muted">
                            Owner: {c.owner}
                          </p>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            </TileScroll>
          )}
        </div>
      </div>
    </PageFrame>
  );
}
