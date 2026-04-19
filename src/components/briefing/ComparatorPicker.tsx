"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Check, Globe, Building2, ScrollText, Layers } from "lucide-react";
import {
  useComparatorStore,
  type ComparatorKind,
  type ComparatorRef,
} from "./store";
import type { BriefingSnapshot } from "@/lib/briefing/types";

interface ComparatorPickerProps {
  snapshot: BriefingSnapshot;
}

interface PickerItem {
  id: string;
  kind: ComparatorKind;
  label: string;
  sublabel?: string;
  flag?: string;
  /** Score on the active dimension (0–100) for ranking display. */
  hint?: number | null;
}

const TABS: Array<{ key: ComparatorKind; label: string; icon: typeof Globe }> = [
  { key: "country", label: "Countries", icon: Globe },
  { key: "institution", label: "Institutions", icon: Building2 },
  { key: "standard", label: "Standards", icon: ScrollText },
  { key: "aggregate", label: "Aggregates", icon: Layers },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function ComparatorPicker({ snapshot }: ComparatorPickerProps) {
  const pickerOpen = useComparatorStore((s) => s.pickerOpen);
  const pickerSlide = useComparatorStore((s) => s.pickerSlide);
  const closePicker = useComparatorStore((s) => s.closePicker);
  const slide5 = useComparatorStore((s) => s.slide5);
  const slide7 = useComparatorStore((s) => s.slide7);
  const toggle = useComparatorStore((s) => s.toggle);

  const selected = pickerSlide === "slide5" ? slide5 : slide7;
  const selectedIds = useMemo(
    () => new Set(selected.map((r) => r.id)),
    [selected]
  );

  const [tab, setTab] = useState<ComparatorKind>("country");
  const [query, setQuery] = useState("");

  // Reset search when picker opens or tab changes
  useEffect(() => {
    if (pickerOpen) setQuery("");
  }, [pickerOpen, tab]);

  // Esc closes the picker
  useEffect(() => {
    if (!pickerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closePicker();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [pickerOpen, closePicker]);

  const items: PickerItem[] = useMemo(() => {
    if (tab === "country") {
      return snapshot.atlas.countries.map((c) => ({
        id: `country:${c.iso3}`,
        kind: "country" as const,
        label: c.name,
        sublabel: c.region,
        flag: c.flag ?? undefined,
        hint: c.maturityScore,
      }));
    }
    if (tab === "institution") {
      return snapshot.benchmarks.allPeers.map((p) => ({
        id: `institution:${p.id}`,
        kind: "institution" as const,
        label: p.shortName ?? p.name,
        sublabel: `${p.country}${p.region ? " · " + p.region : ""}`,
        hint: p.averageScore,
      }));
    }
    if (tab === "standard") {
      return snapshot.standards.rows.map((r) => ({
        id: `standard:${r.slug}`,
        kind: "standard" as const,
        label: r.title,
        sublabel: r.category,
        hint: r.gpssaScore,
      }));
    }
    return snapshot.standards.aggregates.map((a) => ({
      id: `aggregate:${a.id}`,
      kind: "aggregate" as const,
      label: a.label,
      sublabel: a.description,
      hint: a.metrics.maturityScore ?? null,
    }));
  }, [tab, snapshot]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        (it.sublabel ?? "").toLowerCase().includes(q)
    );
  }, [items, query]);

  function handleToggle(item: PickerItem) {
    const ref: Omit<ComparatorRef, "color"> = {
      id: item.id,
      kind: item.kind,
      label: item.label,
      sublabel: item.sublabel,
      flag: item.flag,
    };
    toggle(pickerSlide, ref);
  }

  return (
    <AnimatePresence>
      {pickerOpen && (
        <>
          {/* Scrim */}
          <motion.div
            key="picker-scrim"
            className="fixed inset-0 z-[91] bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closePicker}
          />

          {/* Drawer */}
          <motion.aside
            key="picker-drawer"
            className="fixed right-0 top-0 z-[92] flex h-screen w-[420px] max-w-[92vw] flex-col border-l border-white/10 bg-[#071122]/95 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.5)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.32em] text-white/40">
                  Compare against
                </div>
                <div className="mt-0.5 font-playfair text-lg font-semibold text-cream">
                  {selected.length} of 4 comparators
                </div>
              </div>
              <button
                type="button"
                onClick={closePicker}
                aria-label="Close comparator picker"
                className="rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/5 px-3 py-2">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-medium uppercase tracking-[0.14em] transition ${
                      active
                        ? "bg-white/[0.08] text-cream ring-1 ring-white/15"
                        : "text-white/45 hover:bg-white/[0.04] hover:text-white/80"
                    }`}
                  >
                    <Icon size={13} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="px-5 pt-3 pb-2">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${TABS.find((t) => t.key === tab)?.label.toLowerCase()}…`}
                  data-comparator-search
                  autoFocus
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-cream outline-none placeholder:text-white/30 focus:border-white/25"
                />
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
                {filtered.length} matching · max 4 selections
              </div>
            </div>

            {/* List */}
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
              {filtered.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-white/40">
                  No matches.
                </div>
              )}
              <ul className="flex flex-col gap-1">
                {filtered.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => handleToggle(item)}
                        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                          isSelected
                            ? "bg-[#00A86B]/12 ring-1 ring-[#00A86B]/40"
                            : "hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-base">
                          {item.flag ?? <KindGlyph kind={item.kind} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium text-cream">
                            {item.label}
                          </div>
                          {item.sublabel && (
                            <div className="truncate text-[11px] text-white/45">
                              {item.sublabel}
                            </div>
                          )}
                        </div>
                        {item.hint != null && (
                          <div className="text-[11px] tabular-nums text-white/55">
                            {Math.round(item.hint)}
                          </div>
                        )}
                        {isSelected ? (
                          <Check size={16} className="text-[#33C490]" />
                        ) : (
                          <span className="text-[11px] text-white/30 opacity-0 transition group-hover:opacity-100">
                            +
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer hint */}
            <div className="border-t border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
              Esc to close · adding the 5th replaces the oldest
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function KindGlyph({ kind }: { kind: ComparatorKind }) {
  if (kind === "country") return <Globe size={14} className="text-white/55" />;
  if (kind === "institution")
    return <Building2 size={14} className="text-white/55" />;
  if (kind === "standard")
    return <ScrollText size={14} className="text-white/55" />;
  return <Layers size={14} className="text-white/55" />;
}
