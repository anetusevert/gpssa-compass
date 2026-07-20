"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Network, Users, Clock } from "lucide-react";
import { fadeRise, staggerChildren, tileItem } from "@/lib/motion";
import { PageFrame } from "@/components/ui/PageFrame";
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
    <PageFrame
      header={
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Network size={16} className="shrink-0 text-gold" />
            <h1 className="truncate font-playfair text-sm font-semibold text-cream sm:text-base">
              Governance & RACI
            </h1>
            <span className="hidden text-[11px] text-white/40 md:inline">
              Exactly one Accountable per activity
            </span>
          </div>
          <div className="hidden flex-wrap items-center gap-1.5 lg:flex">
            <Badge variant="green" size="sm">R Responsible</Badge>
            <Badge variant="gold" size="sm">A Accountable</Badge>
            <Badge variant="blue" size="sm">C Consulted</Badge>
            <Badge variant="gray" size="sm">S Support · I Informed</Badge>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : forums.length === 0 && raci.length === 0 ? (
        <EmptyState
          icon={Network}
          title="No governance data yet"
          description="Seed the Roadmap & Governance module to populate forums and the RACI."
        />
      ) : (
        <div className="flex h-full min-h-0 flex-col gap-4">
          {/* Tiered forums strip */}
          {forums.length > 0 && (
            <motion.div
              variants={staggerChildren}
              initial="hidden"
              animate="show"
              className="flex shrink-0 gap-3 overflow-x-auto pb-1"
            >
              {tiers.map((tier) => {
                const tierForums = forums.filter((f) => f.tier === tier);
                if (tierForums.length === 0) return null;
                return tierForums.map((f) => (
                  <motion.div
                    key={f.id}
                    variants={tileItem}
                    className="w-64 shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2"
                  >
                    <p className="text-[9px] uppercase tracking-[0.16em] text-gold/80">
                      {TIER_LABEL[tier]}
                    </p>
                    <div className="mt-1 flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-cream">{f.name}</p>
                      <Badge
                        variant={cadenceVariant[f.cadence] ?? "gray"}
                        size="sm"
                        dot
                      >
                        {f.cadence}
                      </Badge>
                    </div>
                    <div className="mt-1.5 space-y-0.5 text-[11px] text-gray-muted">
                      {f.attendees && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Users size={11} className="shrink-0" /> {f.attendees}
                        </p>
                      )}
                      {f.owner && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Clock size={11} className="shrink-0" /> Owner: {f.owner}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ));
              })}
            </motion.div>
          )}

          {/* RACI matrices — scrolls both axes inside the tile */}
          <motion.div
            variants={fadeRise}
            initial="hidden"
            animate="show"
            className="glass-card min-h-0 flex-1 overflow-auto p-6"
          >
            <div className="space-y-6">
              <h2 className="font-playfair text-base font-semibold text-cream">
                Sector-wide RACI
              </h2>
              {raci.map((group) => (
                <div key={group.processArea}>
                  <h3 className="mb-3 font-playfair text-sm font-semibold text-cream">
                    {group.processArea}
                  </h3>
                  <RaciMatrix group={group} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </PageFrame>
  );
}
