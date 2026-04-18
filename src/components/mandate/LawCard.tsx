"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, FileText, Scale, ShieldCheck } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface LawCardProps {
  slug: string;
  title: string;
  code?: string | null;
  category?: string | null;
  description?: string | null;
  url?: string | null;
  publishedAt?: string | null;
  requirementCount?: number;
  href?: string;
  index?: number;
}

const CATEGORY_META: Record<string, { label: string; accent: string; Icon: typeof Scale }> = {
  "legal-mandate": { label: "Federal Law", accent: "#00A86B", Icon: Scale },
  circular: { label: "Circular", accent: "#4899FF", Icon: FileText },
  policy: { label: "Policy", accent: "#C5A572", Icon: ShieldCheck },
};

export function LawCard({
  slug,
  title,
  code,
  category,
  description,
  url,
  publishedAt,
  requirementCount,
  href,
  index = 0,
}: LawCardProps) {
  const meta = CATEGORY_META[category ?? "legal-mandate"] ?? CATEGORY_META["legal-mandate"];
  const Icon = meta.Icon;
  const linkHref = href ?? `/dashboard/mandate/legal?slug=${encodeURIComponent(slug)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.05 * index }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link
        href={linkHref}
        className="glass-panel relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-white/[0.04] p-5 transition-colors hover:border-white/[0.1]"
        style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 38px rgba(0,0,0,0.32)` }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-90"
          style={{ background: `radial-gradient(circle, ${meta.accent}24 0%, transparent 70%)` }}
        />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${meta.accent}30, ${meta.accent}10)`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <Icon size={16} style={{ color: meta.accent }} strokeWidth={1.7} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/55">
                <span style={{ color: meta.accent }}>{meta.label}</span>
                {code && <span className="text-white/35">· {code}</span>}
                {publishedAt && (
                  <span className="text-white/35">· {new Date(publishedAt).getFullYear()}</span>
                )}
              </div>
              <h3 className="mt-1 font-playfair text-lg font-semibold leading-snug text-cream">
                {title}
              </h3>
            </div>
          </div>
          <ArrowUpRight
            size={16}
            className="mt-1 text-white/30 transition-colors group-hover:text-white/70"
          />
        </div>

        {description && (
          <p className="relative z-10 line-clamp-3 text-[13px] leading-relaxed text-white/65">
            {description}
          </p>
        )}

        <div className="relative z-10 mt-auto flex items-center justify-between text-[11px] text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full" style={{ background: meta.accent }} />
            {typeof requirementCount === "number" ? `${requirementCount} articles indexed` : "Indexing pending"}
          </span>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-white/45 hover:text-white/80"
            >
              Source <ArrowUpRight size={11} />
            </a>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
