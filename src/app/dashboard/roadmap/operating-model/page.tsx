"use client";

import { useEffect, useState } from "react";
import { Building2, GraduationCap, BookOpen, Users, Gauge } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
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
    <div className="space-y-6">
      <PageHeader
        title="Operating Model"
        description="The recommended federated Quality / CX Centre of Excellence and the capability-transfer plan that sustains it (RFP Part E)."
        badge={{ label: "Federated CoE", variant: "gold" }}
      />

      <Card padding="lg">
        <div className="mb-4 flex items-center gap-2">
          <Building2 size={18} className="text-gold" />
          <h2 className="font-playfair text-lg font-semibold text-cream">
            Federated Centre-of-Excellence
          </h2>
        </div>
        <CoEDiagram />
      </Card>

      {/* Research note */}
      <Card variant="bordered" padding="md">
        <p className="text-sm text-cream">
          <span className="font-semibold text-gold">Why capability transfer matters: </span>
          60–70% of change initiatives fail, mainly from weak leadership support and
          resistance. A documented-playbook approach with metric-threshold escalation
          lifted post-change metric retention from{" "}
          <span className="font-semibold text-gpssa-green">~10% to ~95% at six months</span>
          {" "}— success is declared only after a sustainment window, not at go-live.
        </p>
      </Card>

      {/* Capability-transfer checklist */}
      <div>
        <h2 className="mb-3 font-playfair text-lg font-semibold text-cream">
          Capability-Transfer Checklist
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No capability-transfer items yet"
            description="Seed the Roadmap & Governance module to populate the plan."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((c) => {
              const meta = MECHANISM_META[c.mechanism] ?? MECHANISM_META.playbook;
              const Icon = meta.icon;
              return (
                <Card key={c.id} padding="md" hover>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
