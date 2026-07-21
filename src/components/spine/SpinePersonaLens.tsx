"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { PersonaAvatar } from "@/components/personas/PersonaAvatar";
import { getPersonaById, personas } from "@/data/personas";
import { EASE } from "@/lib/motion";

export function SpinePersonaLens({
  personaKey,
  busy,
  onSelect,
}: {
  personaKey: string | null;
  busy?: boolean;
  onSelect: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const persona = personaKey ? getPersonaById(personaKey) : null;

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-black/30 py-1.5 pl-1.5 pr-2.5 text-left transition hover:border-[var(--gpssa-green)]/40 hover:bg-black/45 disabled:opacity-50"
        aria-expanded={open}
        aria-haspopup="listbox"
        title="Choose customer persona"
      >
        {persona ? (
          <PersonaAvatar persona={persona} size="md" showGlow={!open} />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06] text-[10px] text-white/40">
            ?
          </div>
        )}
        <div className="min-w-0 max-w-[140px] sm:max-w-[180px]">
          <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Customer
          </p>
          <p className="truncate text-[13px] font-semibold text-cream">
            {persona?.name ?? "Choose persona"}
          </p>
          <p className="truncate text-[10px] text-white/35">
            {persona?.tagline ?? "Lens for episodes & path"}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 text-white/35 transition group-hover:text-white/60 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute left-0 top-[calc(100%+6px)] z-40 w-[min(92vw,340px)] rounded-2xl border border-white/[0.1] bg-[#0a1628]/95 p-2 shadow-2xl backdrop-blur-xl"
          >
            <p className="px-2 pb-1.5 pt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
              Switch customer lens
            </p>
            <ul className="max-h-[240px] space-y-0.5 overflow-y-auto">
              {personas.map((p) => {
                const active = p.id === personaKey;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onSelect(p.id);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition ${
                        active
                          ? "bg-[var(--gpssa-green)]/15 ring-1 ring-[var(--gpssa-green)]/40"
                          : "hover:bg-white/[0.06]"
                      }`}
                    >
                      <PersonaAvatar persona={p} size="sm" showGlow={false} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-cream">{p.name}</p>
                        <p className="truncate text-[10px] text-white/35">{p.tagline}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            {personaKey && (
              <Link
                href={`/dashboard/delivery/personas?persona=${personaKey}`}
                className="mt-1.5 flex items-center justify-center gap-1 rounded-xl border border-white/[0.06] px-2 py-1.5 text-[11px] text-[var(--gpssa-green)] hover:bg-white/[0.04]"
                onClick={() => setOpen(false)}
              >
                Full profile <ExternalLink size={11} />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
