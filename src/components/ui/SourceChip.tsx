"use client";

import { BookOpen, ExternalLink } from "lucide-react";

/**
 * Citation-first provenance chip — use next to scores and mandate claims.
 */
export function SourceChip({
  label,
  href,
  publisher,
}: {
  label: string;
  href?: string | null;
  publisher?: string | null;
}) {
  const content = (
    <>
      <BookOpen size={10} className="shrink-0 opacity-70" strokeWidth={1.8} />
      <span className="truncate">{publisher ? `${publisher} · ${label}` : label}</span>
      {href ? <ExternalLink size={9} className="shrink-0 opacity-50" /> : null}
    </>
  );

  const className =
    "inline-flex max-w-full items-center gap-1 rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/45 ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.07] hover:text-white/70";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={label}
      >
        {content}
      </a>
    );
  }

  return (
    <span className={className} title={label}>
      {content}
    </span>
  );
}
