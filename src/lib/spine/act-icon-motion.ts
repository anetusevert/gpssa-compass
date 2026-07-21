import type { ActStatus } from "@/lib/spine/conductor-acts";

export type ActIconMotion = {
  amp: number;
  mute: number;
  scale: number;
};

/** Shared status → living motion targets for spine 3D icons. */
export function statusToMotion(opts: {
  selected: boolean;
  hovered: boolean;
  status: ActStatus;
}): ActIconMotion {
  const active = opts.selected || opts.hovered;
  const done = opts.status === "done";
  const current = opts.status === "current";
  const locked = opts.status === "locked";

  return {
    amp: active ? 0.95 : current ? 0.7 : done ? 0.35 : 0.12,
    mute: active || current ? 0 : done ? 0.15 : locked ? 1 : 0.55,
    scale: active ? 1.14 : current ? 1.08 : done ? 1.02 : locked ? 0.88 : 0.96,
  };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
