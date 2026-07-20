"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { isDemoDataPath } from "@/lib/engagement/playbook";

export function DemoDataBanner({ pathname }: { pathname: string }) {
  if (!isDemoDataPath(pathname)) return null;

  return (
    <div
      role="status"
      className="flex items-center gap-2 border-b border-amber-500/25 bg-amber-500/[0.08] px-4 py-1.5 text-[11px] text-amber-100/90 md:px-6"
    >
      <AlertTriangle size={12} className="shrink-0 text-amber-400" />
      <span className="min-w-0 truncate">
        <strong className="font-semibold text-amber-200">Gold seed</strong>
        {" — "}
        Rehearsal data for walkthroughs. Replace with client evidence before decisions.
      </span>
      <Link
        href="/dashboard/data"
        className="ml-auto shrink-0 font-medium text-amber-200/90 underline-offset-2 hover:underline"
      >
        Import / sources
      </Link>
    </div>
  );
}
