"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Scale, Globe2, Sigma, Check, X } from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag";
import type { ComparatorOption } from "@/lib/comparator/types";

interface Props {
  options: ComparatorOption[];
  selected: ComparatorOption | null;
  onChange: (opt: ComparatorOption | null) => void;
  loading?: boolean;
  /** Limit the picker to a subset of kinds (default: all). */
  enabledKinds?: Array<ComparatorOption["kind"]>;
  /**
   * Trigger appearance:
   *   - "inline"  — tiny trigger for dense headers
   *   - "default" — standard rounded trigger
   *   - "rail"    — large segmented control + rich selected card,
   *                 designed for the Benchmark cockpit.
   */
  variant?: "default" | "inline" | "rail";
  placeholder?: string;
}

const KIND_META = {
  standard: { label: "Global Standards", icon: Scale, hint: "ILO, ISSA, World Bank, OECD, Mercer, UN" },
  computed: { label: "Computed References", icon: Sigma, hint: "Global / Regional averages and best-practice" },
  country:  { label: "Peer Countries", icon: Globe2, hint: "Compare against a single country" },
} as const;

/**
 * Universal comparator picker — pick one of:
 *   - a global standard (ILO, ISSA, ...)
 *   - a computed reference (Global Avg, GCC Best, …)
 *   - a peer country
 *
 * Used by Service Catalog, Channels, Atlas, Benchmarking, Products, Delivery.
 */
export function ComparatorPicker({
  options,
  selected,
  onChange,
  loading = false,
  enabledKinds = ["standard", "computed", "country"],
  variant = "default",
  placeholder = "Compare against…",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeKind, setActiveKind] = useState<ComparatorOption["kind"]>(enabledKinds[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = useMemo(() => {
    const byKind = options.filter((o) => o.kind === activeKind);
    const q = query.trim().toLowerCase();
    if (!q) return byKind;
    return byKind.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.shortLabel.toLowerCase().includes(q) ||
        (o.description ?? "").toLowerCase().includes(q) ||
        (o.body ?? "").toLowerCase().includes(q)
    );
  }, [options, activeKind, query]);

  const triggerCls = variant === "inline"
    ? "flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.18] text-[11px] text-cream transition-all"
    : "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.18] text-xs text-cream transition-all";

  /* ──────────────────────────── rail variant ──────────────────────────── */
  if (variant === "rail") {
    return (
      <div className="rounded-2xl bg-white/[0.025] border border-white/[0.06] p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-muted mb-0.5">Benchmark against</p>
            <p className="text-sm text-cream font-semibold">
              {selected ? selected.label : "Choose a comparator to start"}
            </p>
          </div>
          {selected && (
            <button
              onClick={() => onChange(null)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-gray-muted hover:text-cream hover:bg-white/[0.05] transition-colors"
            >
              <X size={10} /> Clear
            </button>
          )}
        </div>

        {/* Large segmented kind control */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-3">
          {enabledKinds.map((kind) => {
            const m = KIND_META[kind];
            const KIcon = m.icon;
            const active = kind === activeKind;
            return (
              <button
                key={kind}
                onClick={() => setActiveKind(kind)}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-gpssa-green/15 text-gpssa-green"
                    : "text-gray-muted hover:text-cream hover:bg-white/[0.04]"
                }`}
              >
                <KIcon size={12} />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] mb-2">
          <Search size={11} className="text-gray-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${KIND_META[activeKind].label.toLowerCase()}…`}
            className="flex-1 bg-transparent text-[11px] text-cream placeholder:text-gray-muted/60 focus:outline-none"
          />
          {loading && <span className="text-[9px] text-gray-muted animate-pulse">loading</span>}
        </div>

        <div className="max-h-[200px] overflow-y-auto pr-1 -mr-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-[11px] text-gray-muted">
              {loading ? "Loading…" : "No matches"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {filtered.map((opt) => {
                const isSel = selected?.kind === opt.kind && selected?.id === opt.id;
                return (
                  <button
                    key={`${opt.kind}-${opt.id}`}
                    onClick={() => onChange(opt)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
                      isSel
                        ? "bg-gpssa-green/10 border border-gpssa-green/25"
                        : "hover:bg-white/[0.05] border border-transparent"
                    }`}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                    {opt.kind === "country" && opt.iso3 && <CountryFlag code={opt.iso3} size="xs" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] font-medium text-cream truncate">{opt.label}</span>
                        {opt.body && (
                          <span className="text-[9px] text-gray-muted bg-white/[0.04] px-1.5 py-0.5 rounded shrink-0">
                            {opt.body}
                          </span>
                        )}
                      </div>
                      {opt.description && (
                        <p className="text-[10px] text-gray-muted/80 mt-0.5 line-clamp-1">{opt.description}</p>
                      )}
                    </div>
                    {isSel && <Check size={11} className="text-gpssa-green shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-white/[0.05] text-[9px] text-gray-muted/70">
          {KIND_META[activeKind].hint}
        </div>
      </div>
    );
  }

  /* ──────────────────────── default / inline trigger ──────────────────── */
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className={triggerCls}>
        {selected ? (
          <>
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: selected.color }}
            />
            {selected.kind === "country" && selected.iso3 && (
              <CountryFlag code={selected.iso3} size="xs" />
            )}
            <span className="font-medium truncate max-w-[160px]">{selected.shortLabel}</span>
            <span className="text-[9px] uppercase tracking-wider text-gray-muted hidden sm:inline">
              {selected.kind}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="ml-1 p-0.5 rounded hover:bg-white/[0.08] text-gray-muted hover:text-cream"
              title="Clear"
            >
              <X size={10} />
            </button>
          </>
        ) : (
          <>
            <Scale size={11} className="text-gray-muted" />
            <span className="text-gray-muted">{placeholder}</span>
            <ChevronDown size={10} className="text-gray-muted" />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full mt-1.5 z-50 w-[420px] max-w-[92vw] rounded-xl bg-navy/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <Search size={11} className="text-gray-muted" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search comparators…"
                  className="flex-1 bg-transparent text-xs text-cream placeholder:text-gray-muted/60 focus:outline-none"
                />
                {loading && (
                  <span className="text-[9px] text-gray-muted animate-pulse">loading</span>
                )}
              </div>
              <div className="flex gap-1">
                {enabledKinds.map((kind) => {
                  const m = KIND_META[kind];
                  const KIcon = m.icon;
                  const active = kind === activeKind;
                  return (
                    <button
                      key={kind}
                      onClick={() => setActiveKind(kind)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                        active
                          ? "bg-gpssa-green/15 text-gpssa-green border border-gpssa-green/25"
                          : "text-gray-muted hover:text-cream hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <KIcon size={10} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-[11px] text-gray-muted">
                  {loading ? "Loading…" : "No matches"}
                </div>
              ) : (
                filtered.map((opt) => {
                  const isSel = selected?.kind === opt.kind && selected?.id === opt.id;
                  return (
                    <button
                      key={`${opt.kind}-${opt.id}`}
                      onClick={() => {
                        onChange(opt);
                        setOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                        isSel
                          ? "bg-gpssa-green/10 border border-gpssa-green/25"
                          : "hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <span
                        className="mt-1 inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                      {opt.kind === "country" && opt.iso3 && (
                        <CountryFlag code={opt.iso3} size="xs" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-medium text-cream truncate">{opt.label}</span>
                          {opt.body && (
                            <span className="text-[9px] text-gray-muted bg-white/[0.04] px-1.5 py-0.5 rounded shrink-0">
                              {opt.body}
                            </span>
                          )}
                        </div>
                        {opt.description && (
                          <p className="text-[10px] text-gray-muted/80 mt-0.5 line-clamp-1">{opt.description}</p>
                        )}
                      </div>
                      {isSel && <Check size={11} className="text-gpssa-green shrink-0 mt-1" />}
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-3 py-2 border-t border-white/[0.06] text-[9px] text-gray-muted/70">
              {KIND_META[activeKind].hint}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
