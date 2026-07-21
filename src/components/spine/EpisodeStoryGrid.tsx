"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  Globe,
  HeartPulse,
  Home,
  Loader2,
  Plus,
  Shield,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { CatalogueEpisode, Workspace, WorkspaceEpisode } from "./workspace-types";

const CATEGORY_LABEL: Record<string, string> = {
  join: "Join & register",
  contribute: "Contribute",
  records: "Records & evidence",
  claim: "Claim benefits",
  "end-of-service": "End of service",
  survivor: "Survivor",
  disability: "Disability",
  mobility: "Mobility / GCC",
  family: "Family events",
  employer: "Employer ops",
};

const CATEGORY_ICON: Record<string, LucideIcon> = {
  join: UserPlus,
  contribute: Wallet,
  records: FileText,
  claim: Home,
  "end-of-service": Briefcase,
  survivor: Users,
  disability: HeartPulse,
  mobility: Globe,
  family: Shield,
  employer: Briefcase,
};

type StoryTile = {
  key: string;
  name: string;
  description: string;
  category: string;
  kind: "service" | "catalogue";
  episodeId?: string;
  libraryId?: string;
  isActive?: boolean;
  stageCount?: number;
};

export function EpisodeStoryGrid({
  workspace,
  eligible,
  catalogue,
  personaKey,
  busy,
  onAction,
  onNewEpisode,
}: {
  workspace: Workspace | null;
  eligible: WorkspaceEpisode[];
  catalogue: CatalogueEpisode[];
  personaKey: string | null;
  busy: boolean;
  onAction: (action: string, payload?: Record<string, unknown>) => Promise<void>;
  onNewEpisode: () => void;
}) {
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(catalogue.map((c) => c.category))),
    [catalogue]
  );

  const tiles = useMemo(() => {
    const serviceTiles: StoryTile[] = eligible.map((e) => ({
      key: `svc-${e.id}`,
      name: e.name,
      description: e.description ?? "",
      category: e.lifecycleCategory ?? "records",
      kind: "service",
      episodeId: e.id,
      libraryId: e.libraryId ?? undefined,
      isActive: e.isActive,
    }));

    const onServiceLibrary = new Set(
      eligible.map((e) => e.libraryId).filter(Boolean) as string[]
    );

    const catalogueTiles: StoryTile[] = catalogue
      .filter((c) => !onServiceLibrary.has(c.id) && !c.alreadyOnService)
      .filter((c) => category === "all" || c.category === category)
      .map((c) => ({
        key: `lib-${c.id}`,
        name: c.name,
        description: c.description,
        category: c.category,
        kind: "catalogue",
        libraryId: c.id,
        stageCount: c.stageCount,
      }));

    const filteredService =
      category === "all"
        ? serviceTiles
        : serviceTiles.filter((t) => t.category === category);

    return [...filteredService, ...catalogueTiles];
  }, [eligible, catalogue, category]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-white/40">
          {workspace?.persona?.name
            ? `Stories for ${workspace.persona.name}`
            : "Choose a life episode"}
        </p>
        <div className="flex max-w-full flex-wrap gap-1">
          <CatChip active={category === "all"} onClick={() => setCategory("all")}>
            All
          </CatChip>
          {categories.map((c) => (
            <CatChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_LABEL[c] ?? c}
            </CatChip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <motion.button
          type="button"
          disabled={busy}
          onClick={onNewEpisode}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="group flex min-h-[118px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-2 py-3 text-center transition hover:border-[var(--gpssa-green)]/45 hover:bg-[var(--gpssa-green)]/5"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-white/25 text-white/45 transition group-hover:border-[var(--gpssa-green)]/50 group-hover:text-[var(--gpssa-green)]">
            <Plus size={18} />
          </span>
          <span className="text-[12px] font-semibold text-cream">New episode</span>
          <span className="text-[9px] text-white/35">Set up a custom path</span>
        </motion.button>

        {tiles.map((tile) => {
          const Icon = CATEGORY_ICON[tile.category] ?? FileText;
          return (
            <motion.button
              key={tile.key}
              type="button"
              disabled={busy}
              onClick={() => {
                if (tile.kind === "service" && tile.episodeId) {
                  void onAction("activate-episode", {
                    episodeId: tile.episodeId,
                    ...(personaKey ? { personaKey } : {}),
                  });
                } else if (tile.libraryId) {
                  void onAction("activate-library", {
                    libraryId: tile.libraryId,
                    ...(personaKey ? { personaKey } : {}),
                  });
                }
              }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex min-h-[118px] flex-col items-start rounded-xl border px-2.5 py-2.5 text-left transition ${
                tile.isActive
                  ? "border-[var(--gpssa-green)]/50 bg-[var(--gpssa-green)]/10"
                  : "border-white/[0.07] bg-black/20 hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <motion.span
                className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-[var(--gpssa-green)]"
                whileHover={{ rotate: [-4, 4, 0], y: [0, -3, 0] }}
                transition={{ duration: 0.45 }}
              >
                <Icon size={16} />
              </motion.span>
              <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-cream">
                {tile.name}
              </p>
              <p className="mt-1 line-clamp-2 text-[9px] leading-snug text-white/35">
                {tile.description || CATEGORY_LABEL[tile.category] || tile.category}
              </p>
              {tile.isActive && (
                <span className="absolute right-2 top-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--gpssa-green)]">
                  Active
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {busy && (
        <div className="flex items-center justify-center gap-2 py-2 text-[11px] text-white/40">
          <Loader2 size={12} className="animate-spin" /> Activating episode…
        </div>
      )}

      {!tiles.length && (
        <p className="text-center text-[12px] text-white/35">
          No episodes for this filter — try another category or New episode
        </p>
      )}
    </div>
  );
}

function CatChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold transition ${
        active
          ? "bg-[var(--gpssa-green)]/20 text-[var(--gpssa-green)]"
          : "bg-white/[0.04] text-white/40 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}
