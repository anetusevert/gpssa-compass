"use client";

/**
 * StandardChips — a tiny inline row of "standards alignment" badges.
 *
 * Used everywhere a piece of content (a service, channel, product tier,
 * segment, KPI, dimension, or reference card) needs to display the
 * canonical global standards it maps onto.
 *
 *   <StandardChips slugs={["ilo-c102", "ilo-r202"]} size="sm" />
 *
 * The slug → display-name mapping is centralised here and stays in sync
 * with `src/lib/standards/catalog.ts`.
 */

const STANDARD_LABEL: Record<string, string> = {
  "ilo-c102":                 "ILO C102",
  "ilo-c128":                 "ILO C128",
  "ilo-r202":                 "ILO R202",
  "issa-service-quality":     "ISSA SQ",
  "issa-ict":                 "ISSA ICT",
  "issa-good-governance":     "ISSA Gov",
  "wb-govtech-maturity":      "WB GTMI",
  "oecd-pensions-at-a-glance": "OECD PaaG",
  "mercer-cfa-gpi":           "Mercer GPI",
  "un-egov-survey":           "UN E-Gov",
};

const STANDARD_BODY_COLOR: Record<string, string> = {
  "ilo-c102":                 "#0EA5E9",
  "ilo-c128":                 "#0EA5E9",
  "ilo-r202":                 "#0EA5E9",
  "issa-service-quality":     "#A855F7",
  "issa-ict":                 "#A855F7",
  "issa-good-governance":     "#A855F7",
  "wb-govtech-maturity":      "#10B981",
  "oecd-pensions-at-a-glance": "#F59E0B",
  "mercer-cfa-gpi":           "#EC4899",
  "un-egov-survey":           "#06B6D4",
};

interface Props {
  slugs: string[];
  size?: "xs" | "sm";
  /** Show a small "Aligned to" prefix label. */
  showPrefix?: boolean;
  /** Maximum chips to show before collapsing into "+N". */
  max?: number;
  className?: string;
}

export function StandardChips({ slugs, size = "sm", showPrefix = false, max = 6, className = "" }: Props) {
  if (!slugs?.length) return null;
  const visible = slugs.slice(0, max);
  const overflow = slugs.length - visible.length;
  const sizing =
    size === "xs"
      ? "px-1 py-0.5 text-[8px]"
      : "px-1.5 py-0.5 text-[9px]";

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {showPrefix && (
        <span className="text-[8px] uppercase tracking-[0.2em] text-gpssa-green/80 font-semibold mr-0.5">
          Aligned to
        </span>
      )}
      {visible.map((slug) => {
        const color = STANDARD_BODY_COLOR[slug] ?? "#94A3B8";
        const label = STANDARD_LABEL[slug] ?? slug;
        return (
          <span
            key={slug}
            className={`inline-flex items-center rounded-md font-medium uppercase tracking-wider ${sizing}`}
            style={{
              background: `${color}1c`,
              border: `1px solid ${color}55`,
              color,
            }}
            title={label}
          >
            {label}
          </span>
        );
      })}
      {overflow > 0 && (
        <span className={`inline-flex items-center rounded-md font-medium text-gray-muted ${sizing}`}
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          +{overflow}
        </span>
      )}
    </div>
  );
}

export { STANDARD_LABEL, STANDARD_BODY_COLOR };
