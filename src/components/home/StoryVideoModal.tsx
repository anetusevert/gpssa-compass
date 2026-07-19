"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Play, X } from "lucide-react";
import { useBriefingStore } from "@/components/briefing/store";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const VIDEO_SRC = "/videos/compass-leave-behind.mp4";

export function StoryVideoTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45 transition-colors hover:border-[var(--gpssa-green)]/35 hover:text-white/75"
        }
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        data-tour="compass-story-video"
      >
        <Play size={10} className="text-[var(--gpssa-green)]/90" strokeWidth={2.2} />
        Watch the story
      </motion.button>
      <StoryVideoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function StoryVideoModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasFile, setHasFile] = useState<boolean | null>(null);
  const openBriefing = useBriefingStore((s) => s.openDeck);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch(VIDEO_SRC, { method: "HEAD" })
      .then((r) => {
        if (!cancelled) setHasFile(r.ok);
      })
      .catch(() => {
        if (!cancelled) setHasFile(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function playBriefingInstead() {
    onClose();
    openBriefing();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Leave-behind story"
            initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[24px]"
            style={{
              background:
                "linear-gradient(160deg, rgba(17, 34, 64, 0.96), rgba(7, 17, 34, 0.98))",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 120px rgba(0,0,0,0.55), 0 0 80px rgba(0,168,107,0.12)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#33C490]/85">
                  Leave-behind story
                </p>
                <h2 className="font-playfair text-lg font-bold text-cream">
                  The operating system the project leaves behind
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/50 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 pb-5">
              {hasFile === null && (
                <div className="flex h-56 items-center justify-center text-sm text-white/40">
                  Loading…
                </div>
              )}

              {hasFile === true && (
                <video
                  ref={videoRef}
                  src={VIDEO_SRC}
                  controls
                  playsInline
                  autoPlay
                  className="aspect-video w-full rounded-xl bg-black/40"
                />
              )}

              {hasFile === false && (
                <div className="flex flex-col items-center gap-4 rounded-xl bg-white/[0.03] px-6 py-10 text-center ring-1 ring-white/[0.06]">
                  <p className="max-w-md text-sm text-white/55">
                    The cinematic MP4 is not in{" "}
                    <code className="text-[#33C490]/90">public/videos/</code> yet.
                    Play the live Executive Briefing now, or follow{" "}
                    <code className="text-white/70">docs/video/LEAVE_BEHIND_SCRIPT.md</code>{" "}
                    to capture and export the film.
                  </p>
                  <button
                    type="button"
                    onClick={playBriefingInstead}
                    className="inline-flex items-center gap-2 rounded-full bg-[#00A86B]/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#33C490] ring-1 ring-[#00A86B]/35 hover:bg-[#00A86B]/30"
                  >
                    <Play size={12} />
                    Open Executive Briefing
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
