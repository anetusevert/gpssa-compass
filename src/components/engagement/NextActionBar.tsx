"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getNextAction, getScreenMeta } from "@/lib/engagement/playbook";

export function NextActionBar({ pathname }: { pathname: string }) {
  if (pathname === "/dashboard") return null;

  const action = getNextAction(pathname);
  const meta = getScreenMeta(pathname);
  if (!action && !meta) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-white/[0.05] bg-black/20 px-4 py-1.5 text-[11px] md:px-6">
      {meta && (
        <p className="min-w-0 text-white/45">
          <span className="text-white/30">Why here · </span>
          {meta.why}
          <span className="ml-2 text-white/25">({meta.ownerHint})</span>
        </p>
      )}
      {action && (
        <Link
          href={action.next.href}
          className="ml-auto inline-flex items-center gap-1 font-medium text-[var(--gpssa-green)] hover:text-[#9DE5C2]"
        >
          {action.label}
          <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}
