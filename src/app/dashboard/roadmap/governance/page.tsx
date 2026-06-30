"use client";

import { useEffect, useState } from "react";
import { Network, Users, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { RaciMatrix, type RaciGroup } from "@/components/roadmap/RaciMatrix";

interface Forum {
  id: string;
  name: string;
  tier: number;
  cadence: string;
  purpose: string | null;
  attendees: string | null;
  owner: string | null;
}

const TIER_LABEL: Record<number, string> = {
  1: "Tier 1 · Front-line",
  2: "Tier 2 · Supervisors / Ops",
  3: "Tier 3 · Managers / Council",
  4: "Tier 4 · Executive",
};

const cadenceVariant: Record<string, "green" | "blue" | "gold" | "gray"> = {
  daily: "green",
  weekly: "blue",
  monthly: "gold",
  quarterly: "gray",
};

export default function GovernancePage() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [raci, setRaci] = useState<RaciGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/governance/forums").then((r) => r.json()),
      fetch("/api/governance/raci").then((r) => r.json()),
    ])
      .then(([f, r]) => {
        setForums(Array.isArray(f) ? f : []);
        setRaci(Array.isArray(r) ? r : []);
      })
      .catch(() => {
        setForums([]);
        setRaci([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const tiers = [1, 2, 3, 4];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Governance & RACI"
        description="A tiered daily-management rhythm plus a sector-wide RACI (RFP Part E). The cardinal rule: exactly one Accountable per activity."
        badge={{ label: "Operating Rhythm", variant: "gold" }}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : forums.length === 0 && raci.length === 0 ? (
        <EmptyState
          icon={Network}
          title="No governance data yet"
          description="Seed the Roadmap & Governance module to populate forums and the RACI."
        />
      ) : (
        <>
          {/* Tiered forums */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {tiers.map((tier) => {
              const tierForums = forums.filter((f) => f.tier === tier);
              if (tierForums.length === 0) return null;
              return (
                <div key={tier} className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gold">
                    {TIER_LABEL[tier]}
                  </h3>
                  {tierForums.map((f) => (
                    <Card key={f.id} padding="sm" hover>
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-cream">{f.name}</p>
                        <Badge
                          variant={cadenceVariant[f.cadence] ?? "gray"}
                          size="sm"
                          dot
                        >
                          {f.cadence}
                        </Badge>
                      </div>
                      {f.purpose && (
                        <p className="mb-2 text-xs text-gray-muted">{f.purpose}</p>
                      )}
                      <div className="space-y-1 text-[11px] text-gray-muted">
                        {f.attendees && (
                          <p className="flex items-center gap-1.5">
                            <Users size={12} /> {f.attendees}
                          </p>
                        )}
                        {f.owner && (
                          <p className="flex items-center gap-1.5">
                            <Clock size={12} /> Owner: {f.owner}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              );
            })}
          </div>

          {/* RACI matrices */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-playfair text-lg font-semibold text-cream">
                Sector-wide RACI
              </h2>
              <Badge variant="green" size="sm">R Responsible</Badge>
              <Badge variant="gold" size="sm">A Accountable</Badge>
              <Badge variant="blue" size="sm">C Consulted</Badge>
              <Badge variant="gray" size="sm">S Support · I Informed</Badge>
            </div>

            {raci.map((group) => (
              <Card key={group.processArea} padding="lg">
                <h3 className="mb-3 font-playfair text-base font-semibold text-cream">
                  {group.processArea}
                </h3>
                <RaciMatrix group={group} />
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
