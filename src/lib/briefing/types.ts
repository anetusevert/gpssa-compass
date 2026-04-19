/**
 * Executive Briefing Snapshot
 *
 * The single typed payload returned by `/api/briefing/snapshot` and consumed by
 * every slide. Each section is independent so a slide can render gracefully
 * when its source agents have not finished yet (`data === null` or
 * `completeness.done === 0`).
 */

export interface BriefingMeta {
  now: string;
  agentExecutions: number;
  totalTokens: number;
  orchestratorRunsCompleted: number;
  lastResearchAt: string | null;
}

export interface Completeness {
  done: number;
  total: number;
}

export interface BriefingCompleteness {
  countries: Completeness;
  services: Completeness;
  products: Completeness;
  channels: Completeness;
  personas: Completeness;
  intlServices: Completeness;
  /** Average across all pillars, 0–1. */
  overall: number;
}

// ── Atlas ────────────────────────────────────────────────────────────────

export interface AtlasRegionBucket {
  region: string;
  count: number;
}

export interface AtlasMaturityBucket {
  label: string;
  count: number;
}

export interface AtlasTopCountry {
  iso3: string;
  name: string;
  region: string;
  maturityScore: number | null;
  maturityLabel: string | null;
}

/** Full country payload exposed to the comparator picker. */
export interface AtlasCountryRow {
  iso3: string;
  iso2: string | null;
  name: string;
  region: string;
  flag: string | null;
  maturityScore: number | null;
  maturityLabel: string | null;
  /** Normalised radar metrics (0–100). null when the source field is null. */
  metrics: {
    maturityScore: number | null;
    coverageRate: number | null;
    replacementRate: number | null;
    sustainability: number | null;
    digitalReadiness: number | null;
  };
}

export interface AtlasSection {
  countryCount: number;
  researchedCount: number;
  regions: AtlasRegionBucket[];
  maturity: AtlasMaturityBucket[];
  top: AtlasTopCountry[];
  /** All countries with a known maturityScore, ranked desc, used by the picker. */
  countries: AtlasCountryRow[];
}

// ── Services ─────────────────────────────────────────────────────────────

export interface ServiceCategoryBucket {
  category: string;
  count: number;
  averageReadiness: number | null;
}

export interface ChannelCapabilityCell {
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  channelName: string;
  capabilityLevel: string;
}

export interface ServicesSection {
  count: number;
  averageReadiness: number | null;
  categories: ServiceCategoryBucket[];
  capabilityLevelCounts: Record<string, number>;
  channelCapabilities: ChannelCapabilityCell[];
  channelNames: string[];
  serviceNames: string[];
}

// ── Products ─────────────────────────────────────────────────────────────

export interface ProductTierBucket {
  tier: string;
  count: number;
}

export interface SegmentLevelBucket {
  level: string;
  count: number;
}

export interface TopInnovation {
  id: string;
  title: string;
  targetSegment: string | null;
  impactScore: number | null;
  feasibilityScore: number | null;
}

export interface ProductsSection {
  count: number;
  tiers: ProductTierBucket[];
  segmentLevels: SegmentLevelBucket[];
  innovations: TopInnovation[];
}

// ── Delivery ─────────────────────────────────────────────────────────────

export interface DeliveryChannelRow {
  id: string;
  name: string;
  channelType: string;
  maturity: number;
  servicesAvailable: number;
  servicesTotal: number;
}

export interface DeliverySection {
  channels: DeliveryChannelRow[];
  personaCount: number;
  modelCount: number;
}

// ── Standards ────────────────────────────────────────────────────────────

export interface StandardComparisonRow {
  slug: string;
  code: string | null;
  title: string;
  category: string;
  /** GPSSA score (0–100) on this standard. Null if no compliance row exists. */
  gpssaScore: number | null;
  /** Global average across all evaluated countries on this standard. */
  globalAverage: number | null;
  /** Top quartile (or "best practice") global score on this standard. */
  topQuartile: number | null;
  /** Bottom quartile ("laggards") global score on this standard. */
  bottomQuartile: number | null;
  /** ILO/OECD/etc. recommended floor when applicable. */
  floor: number | null;
  /** Plain-English explainer (what the dimension actually measures). */
  oneLiner: string;
  /** Short, direct dimension label (e.g. "Coverage", "Adequacy"). */
  shortLabel: string;
}

/** Pre-computed aggregate "comparator" payloads used on the radar slide. */
export interface StandardAggregate {
  id: string;
  label: string;
  description: string;
  metrics: Record<string, number>;
}

export interface StandardsSection {
  count: number;
  evaluatedCount: number;
  rows: StandardComparisonRow[];
  /** Global Average ComputedReference payload metrics for the radar chart. */
  globalAverageMetrics: Record<string, number> | null;
  /** Global Best Practice (top-quartile) ComputedReference payload metrics. */
  globalBestMetrics: Record<string, number> | null;
  /** GPSSA derived metrics (from UAE country row when available). */
  gpssaMetrics: Record<string, number> | null;
  /** Curated abstract aggregates exposed in the comparator picker. */
  aggregates: StandardAggregate[];
}

// ── Benchmarks (peer institutions) ───────────────────────────────────────

export interface PeerInstitutionRow {
  id: string;
  name: string;
  shortName: string | null;
  country: string;
  countryCode: string;
  region: string;
  /** Average score across all benchmark dimensions, 0–100. */
  averageScore: number | null;
  /** Total dimensions scored. */
  scoredDimensions: number;
  /** Whether this row represents GPSSA itself. */
  isGpssa: boolean;
  /** Per-dimension scores keyed by dimension slug. */
  dimensionScores: Record<string, number>;
}

export interface BenchmarkDimensionRow {
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
}

export interface BenchmarksSection {
  /** Curated benchmark target peers (sorted GPSSA first, then by avg desc). */
  peers: PeerInstitutionRow[];
  /** Every institution in the database, used by the comparator picker. */
  allPeers: PeerInstitutionRow[];
  dimensions: number;
  dimensionList: BenchmarkDimensionRow[];
}

// ── Opportunities ────────────────────────────────────────────────────────

export interface OpportunityRow {
  id: string;
  title: string;
  category: string;
  description: string | null;
  impact: string;
  effort: string;
  strategicFit: number | null;
  feasibility: number | null;
  sourceSection: string | null;
}

export interface OpportunitiesSection {
  count: number;
  top: OpportunityRow[];
}

// ── Sources ──────────────────────────────────────────────────────────────

export interface SourcesSection {
  count: number;
  publishers: number;
}

// ── Root ─────────────────────────────────────────────────────────────────

export interface BriefingSnapshot {
  meta: BriefingMeta;
  completeness: BriefingCompleteness;
  atlas: AtlasSection;
  services: ServicesSection;
  products: ProductsSection;
  delivery: DeliverySection;
  standards: StandardsSection;
  benchmarks: BenchmarksSection;
  opportunities: OpportunitiesSection;
  sources: SourcesSection;
}
