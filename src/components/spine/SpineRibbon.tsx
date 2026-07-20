"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";
import { nodeForRoute, RIBBON_NODES, showRibbonFor } from "@/lib/spine/ribbon";
import { EASE } from "@/lib/motion";

/**
 * Slim Episode→QA strip shown in the chrome of spine-related module pages.
 * The node that owns the current page glows; clicking any node returns to
 * the home spine with that planet selected.
 */
export function SpineRibbon({ pathname: pathnameProp }: { pathname?: string }) {
  const livePathname = usePathname();
  const pathname = pathnameProp ?? livePathname;

  if (!showRibbonFor(pathname)) return null;
  const current = nodeForRoute(pathname);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="flex items-center justify-center gap-1 border-b border-white/[0.05] bg-black/20 px-3 py-1"
    >
      <Link
        href="/dashboard"
        className="mr-2 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30 transition hover:text-[var(--gpssa-green)]"
        title="Open operating spine"
      >
        <GitBranch size={9} /> Spine
      </Link>
      {RIBBON_NODES.map((n, i) => {
        const active = n.id === current;
        return (
          <span key={n.id} className="flex items-center gap-1">
            <Link
              href={`/dashboard?node=${n.id}`}
              className="group flex items-center gap-1 rounded-full px-1.5 py-0.5 transition hover:bg-white/[0.05]"
              title={`${n.label} on the spine`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full transition"
                style={{
                  background: active ? n.color : "rgba(255,255,255,0.15)",
                  boxShadow: active ? `0 0 8px ${n.color}` : "none",
                }}
              />
              <span
                className={`text-[8px] font-semibold uppercase tracking-[0.14em] transition ${
                  active ? "text-cream" : "text-white/25 group-hover:text-white/55"
                }`}
              >
                {n.label}
              </span>
            </Link>
            {i < RIBBON_NODES.length - 1 && <span className="h-px w-3 bg-white/10" />}
          </span>
        );
      })}
    </motion.div>
  );
}
