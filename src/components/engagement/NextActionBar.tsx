"use client";

import { getScreenMeta } from "@/lib/engagement/playbook";

/** Shorten playbook why-copy to a calm one-liner (≤14 words). */
function shortWhy(why: string): string {
  const cleaned = why.replace(/\s+/g, " ").trim();
  const words = cleaned.split(" ");
  if (words.length <= 14) return cleaned;
  return `${words.slice(0, 14).join(" ")}…`;
}

export function NextActionBar({ pathname }: { pathname: string }) {
  if (pathname === "/dashboard") return null;

  const meta = getScreenMeta(pathname);
  if (!meta) return null;

  return (
    <div className="flex items-center border-b border-white/[0.05] bg-black/20 px-4 py-1.5 text-[11px] md:px-6">
      <p className="min-w-0 truncate text-white/45">
        <span className="font-semibold text-white/35">Why here</span>
        <span className="mx-1.5 text-white/20">·</span>
        {shortWhy(meta.why)}
      </p>
    </div>
  );
}
