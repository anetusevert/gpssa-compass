"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PersonaAvatar } from "@/components/personas/PersonaAvatar";
import { personas } from "@/data/personas";

/** Compact persona grid opened from the Persona column on the spine line. */
export function PersonaChooserModal({
  isOpen,
  onClose,
  personaKey,
  busy,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  personaKey: string | null;
  busy?: boolean;
  onSelect: (key: string) => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose customer" size="2xl">
      <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
        <p className="text-[11px] text-white/40">
          The operating spine follows this persona — episodes may serve more than one customer.
        </p>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {personas.map((p) => {
            const active = p.id === personaKey;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    onSelect(p.id);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
                    active
                      ? "border-[var(--gpssa-green)]/50 bg-[var(--gpssa-green)]/10"
                      : "border-white/[0.06] hover:border-white/20 hover:bg-white/[0.04]"
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
            className="mt-2 flex items-center justify-center gap-1 rounded-xl border border-white/[0.06] px-2 py-1.5 text-[11px] text-[var(--gpssa-green)] hover:bg-white/[0.04]"
            onClick={onClose}
          >
            Full profile <ExternalLink size={11} />
          </Link>
        )}
      </div>
    </Modal>
  );
}
