"use client";

import Link from "next/link";
import { isDemoDataPath } from "@/lib/engagement/playbook";

/** Compact demo chip — no walkthrough paragraph. */
export function DemoDataBanner({ pathname }: { pathname: string }) {
  if (!isDemoDataPath(pathname)) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-end gap-2 border-b border-white/[0.04] bg-black/15 px-4 py-1 md:px-6"
    >
      <Link
        href="/dashboard/data"
        title="Rehearsal data — replace with client evidence before decisions"
        className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-200/90 transition hover:bg-amber-500/20"
      >
        Demo
      </Link>
    </div>
  );
}
