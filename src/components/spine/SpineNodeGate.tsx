"use client";

import { motion } from "framer-motion";
import { Eye, Wand2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EASE } from "@/lib/motion";
import type { SpineNodeId } from "@/lib/spine/types";

const SHORT: Record<SpineNodeId, string> = {
  episode: "Episode",
  journey: "Journey",
  process: "Process",
  systems: "Systems",
  qa: "QA",
};

export function SpineNodeGate({
  isOpen,
  onClose,
  node,
  existingSummary,
  onBrowse,
  onSetup,
}: {
  isOpen: boolean;
  onClose: () => void;
  node: SpineNodeId;
  existingSummary: string;
  onBrowse: () => void;
  onSetup: () => void;
}) {
  const label = SHORT[node];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={label} size="md">
      <p className="mb-4 text-center text-[12px] text-white/40">
        View what exists, or set up something new
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <motion.button
          type="button"
          onClick={onBrowse}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex flex-col items-start gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition hover:border-white/25"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-cream">
            <Eye size={18} />
          </span>
          <span className="text-[14px] font-semibold text-cream">View existing</span>
          <span className="text-[11px] text-white/40">{existingSummary}</span>
        </motion.button>
        <motion.button
          type="button"
          onClick={onSetup}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex flex-col items-start gap-2 rounded-2xl border border-[var(--gpssa-green)]/40 bg-[var(--gpssa-green)]/10 p-4 text-left transition hover:border-[var(--gpssa-green)]/70"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gpssa-green)]/20 text-[var(--gpssa-green)]">
            <Wand2 size={18} />
          </span>
          <span className="text-[14px] font-semibold text-cream">Set up</span>
          <span className="text-[11px] text-white/40">Guided wizard for {label.toLowerCase()}</span>
        </motion.button>
      </div>
    </Modal>
  );
}
