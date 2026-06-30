"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileCheck2, GitBranch, Citrus, Link2, ArrowDownRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Ola {
  id: string;
  name: string;
  serviceName: string | null;
  targetHours: number;
  direction: string | null;
  description?: string | null;
  underpinsSlaId?: string | null;
}

interface Sla {
  id: string;
  serviceName: string | null;
  name: string;
  tier: string;
  type: string;
  targetHours: number;
  description: string | null;
  underpinnedBy: Ola[];
}

const TIER_VARIANT: Record<string, "gold" | "gray" | "blue" | "green"> = {
  gold: "gold",
  silver: "gray",
  bronze: "blue",
  standard: "green",
};

function formatHours(h: number): string {
  if (h >= 24) return `${(h / 24).toFixed(h % 24 === 0 ? 0 : 1)}d (${h}h)`;
  return `${h}h`;
}

export default function SlaPage() {
  const [slas, setSlas] = useState<Sla[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fulfilment/sla", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.slas) setSlas(data.slas);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="SLA / OLA Design"
        description="Tiered, service-based customer SLAs and the internal OLAs that underpin them — the layer that stops inter-team hand-offs from silently breaching a customer commitment."
        badge={{ label: "ITIL 4 · Service Level Management", variant: "gold" }}
      />

      {/* Watermelon-effect callout */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <Card variant="bordered" className="border-rose-500/20 bg-rose-500/[0.03]">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 shrink-0">
              <Citrus size={18} className="text-rose-300" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-cream mb-1">
                Avoid the &quot;Watermelon Effect&quot;
              </h3>
              <p className="text-xs text-gray-muted leading-relaxed max-w-3xl">
                An SLA can look green on the outside (targets met) while the customer is red
                on the inside (dissatisfied). Counter it by pairing every SLA attainment metric
                with a <span className="text-cream">CSAT / customer-effort outcome</span>, so a
                technically-met SLA never masks a poor experience. GPSSA already sends an
                after-session satisfaction survey — bind it to each SLA here.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tiered SLA table */}
      <div>
        <h2 className="text-sm font-semibold text-cream font-playfair mb-3 flex items-center gap-2">
          <FileCheck2 size={16} className="text-gold" />
          Customer SLAs (service-based, tiered)
        </h2>
        <div className="rounded-xl border border-white/[0.07] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.03] text-[9px] uppercase tracking-wide text-gray-muted">
                <th className="px-4 py-2.5 font-medium">Service</th>
                <th className="px-4 py-2.5 font-medium">SLA</th>
                <th className="px-4 py-2.5 font-medium">Tier</th>
                <th className="px-4 py-2.5 font-medium text-right">Target</th>
                <th className="px-4 py-2.5 font-medium text-center">Underpinning OLAs</th>
              </tr>
            </thead>
            <tbody>
              {slas.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="border-t border-white/[0.05] hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3 text-[11px] text-cream/80 whitespace-nowrap">
                    {s.serviceName}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-cream">{s.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={TIER_VARIANT[s.tier] ?? "gray"} size="sm">
                      {s.tier}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-cream tabular-nums text-right whitespace-nowrap">
                    {formatHours(s.targetHours)}
                  </td>
                  <td className="px-4 py-3 text-center text-[11px] text-gray-muted tabular-nums">
                    {s.underpinnedBy.length}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OLA → SLA dependency view */}
      <div>
        <h2 className="text-sm font-semibold text-cream font-playfair mb-3 flex items-center gap-2">
          <GitBranch size={16} className="text-adl-blue" />
          OLA → SLA underpinning
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {slas
            .filter((s) => s.underpinnedBy.length > 0)
            .map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
              >
                <Card variant="glass" padding="md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={TIER_VARIANT[s.tier] ?? "gray"} size="sm">
                        {s.tier}
                      </Badge>
                      <span className="text-[11px] font-semibold text-cream">{s.name}</span>
                    </div>
                    <span className="text-[10px] text-gold tabular-nums">
                      {formatHours(s.targetHours)}
                    </span>
                  </div>

                  <div className="space-y-2 pl-3 border-l border-white/[0.08]">
                    {s.underpinnedBy.map((o) => (
                      <div
                        key={o.id}
                        className="flex items-start gap-2 rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5"
                      >
                        <ArrowDownRight size={13} className="text-adl-blue mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-medium text-cream truncate">
                              {o.name}
                            </span>
                            <span className="text-[9px] text-adl-blue tabular-nums shrink-0">
                              {formatHours(o.targetHours)}
                            </span>
                          </div>
                          {o.direction && (
                            <p className="text-[9px] text-gray-muted mt-0.5 flex items-center gap-1">
                              <Link2 size={8} />
                              {o.direction}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
        </div>
        <p className="text-[10px] text-gray-muted mt-3 italic max-w-3xl">
          An OLA carries targets that underpin those within the SLA, so that the customer-facing
          commitment is never breached by the failure of a supporting internal activity. This is
          the same accountability map as the sector RACI.
        </p>
      </div>
    </div>
  );
}
