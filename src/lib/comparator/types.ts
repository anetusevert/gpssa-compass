/**
 * Comparator — the shared abstraction used everywhere we benchmark
 * GPSSA against an external reference (Service Catalog, Channel
 * Capabilities, Atlas, Benchmarking, Products, Delivery, Data & Sources).
 *
 * A Comparator is one of:
 *   • Standard           — a global reference framework (ILO C102, ISSA, …)
 *   • Computed Reference — an aggregate (Global Avg, GCC Best, …)
 *   • Country            — a single peer country (UK, Singapore, …)
 *
 * Every Comparator exposes the same shape so visualizations
 * (RangeBandRadar, ComplianceDial, ComparatorPicker) can render any of them
 * uniformly.
 */

export type ComparatorKind = "standard" | "computed" | "country";

export interface ComparatorOption {
  kind: ComparatorKind;
  /** Stable id (standard.slug | computed.slug | country.iso3) */
  id: string;
  /** Display name. */
  label: string;
  /** Short label for chips. */
  shortLabel: string;
  /** One-liner description shown in the picker tooltip. */
  description?: string;
  /** Body / publisher (for standards: "ILO", "ISSA"; for computed: "Derived"; for country: region). */
  body?: string;
  /** Hex color used for series in radars and bars. */
  color: string;
  /** Optional country flag iso3 for `country` kind. */
  iso3?: string;
}

export interface ComparatorMetric {
  /** A label for the dimension (e.g. "Old-Age Pensions"). */
  label: string;
  /** Stable key for the dimension (e.g. "old-age-pensions"). */
  key: string;
  /** GPSSA value 0–100 on this dimension. */
  gpssa: number;
  /** Comparator value 0–100. */
  reference: number;
  /** Optional band (e.g. for "Top quartile" spread). */
  band?: { min: number; max: number };
  /** Optional pillar grouping. */
  pillar?: string;
}
