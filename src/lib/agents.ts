export interface DefaultAgent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  model: string;
  maxTokens: number;
  temperature: number;
  targetScreen?: string;
  researchType?: string;
  sortOrder: number;
  isActive: boolean;
}

export const DEFAULT_AGENTS: DefaultAgent[] = [
  // ── Mandate Pillar ──

  {
    id: "mandate-corpus",
    name: "GPSSA Mandate Corpus Agent",
    description:
      "Reads scraped GPSSA pages (laws, regulations, circulars, policies, governance, news) and extracts a structured legal corpus: Standards, Requirements (with plain-English explainers), historical Milestones, and the obligation links that bridge each statutory article to existing GPSSA services / products / channels / segments / personas.",
    targetScreen: "mandate-corpus",
    researchType: "mandate-corpus",
    systemPrompt: "USE_CANONICAL_PROMPT",
    userPromptTemplate: "Structure the following GPSSA source page: {ITEMS}",
    model: "gpt-4o",
    maxTokens: 16384,
    temperature: 0.1,
    sortOrder: 0,
    isActive: true,
  },

  // ── Atlas Pillar ──

  {
    id: "atlas-worldmap",
    name: "Global Atlas Research Agent (legacy monolith)",
    description:
      "DEPRECATED: replaced by three parallel sub-agents (System Architecture, Performance Metrics, Narrative Insights). Kept for backwards compatibility; do not enable in production.",
    targetScreen: "atlas-worldmap",
    researchType: "atlas-worldmap",
    systemPrompt: `USE_CANONICAL_PROMPT`,
    userPromptTemplate: `Research the social security and pension systems for the following countries: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 16384,
    temperature: 0.2,
    sortOrder: 99,
    isActive: false,
  },
  {
    id: "atlas-system",
    name: "Atlas — System Architecture Agent",
    description:
      "Researches the institutional and legislative architecture of each country's pension/social security system: institutions, system type, contribution rates, retirement ages, benefit formulas, governance, ILO ratifications, and population coverage.",
    targetScreen: "atlas-system",
    researchType: "atlas-system",
    systemPrompt: `USE_CANONICAL_PROMPT`,
    userPromptTemplate: `Research the system architecture for the following countries: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 12288,
    temperature: 0.2,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "atlas-performance",
    name: "Atlas — Performance Metrics Agent",
    description:
      "Researches quantitative performance and maturity metrics: maturity score, coverage rate, replacement rate, sustainability, digital level, Mercer/OECD/World Bank rankings, dependency ratio, social protection expenditure, pension fund assets.",
    targetScreen: "atlas-performance",
    researchType: "atlas-performance",
    systemPrompt: `USE_CANONICAL_PROMPT`,
    userPromptTemplate: `Research performance metrics for the following countries: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 8192,
    temperature: 0.2,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "atlas-insights",
    name: "Atlas — Narrative Insights Agent",
    description:
      "Researches qualitative narrative content: distinctive key features, structural challenges, recent reforms, and forward-looking insights — each entry a substantive 2-3 sentence paragraph.",
    targetScreen: "atlas-insights",
    researchType: "atlas-insights",
    systemPrompt: `USE_CANONICAL_PROMPT`,
    userPromptTemplate: `Research narrative insights for the following countries: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 12288,
    temperature: 0.3,
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "atlas-benchmarking",
    name: "Benchmarking Analyst Agent",
    description:
      "Generates structured comparative analysis between social security institutions, identifying relative strengths, gaps, and transferable best practices.",
    targetScreen: "atlas-benchmarking",
    researchType: "atlas-benchmarking",
    systemPrompt: `You are a world-class benchmarking strategist specializing in comparative institutional analysis for government and social security organizations. Your frameworks draw from ISSA Guidelines (Good Governance, Administrative Solutions, ICT), OECD/INPRS Global Pension Statistics, CMMI, COBIT, TOGAF, Mercer CFA Institute Global Pension Index, and World Bank GovTech Maturity Index.

You specialize in multi-dimensional scoring across: Service Range (ILO C102 benchmark), Digital Maturity (CMMI levels), Operational Efficiency (ISSA/OECD admin cost benchmarks), Citizen Experience (GovTech standards), Innovation Capacity, and Governance Quality (ISSA Good Governance guidelines). Each dimension uses a 0-100 scale grounded in published evidence.

You MUST respond with valid JSON only. Include source citations grounded in the frameworks above.`,
    userPromptTemplate: `Conduct a structured benchmarking assessment for the following institutions: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.3,
    sortOrder: 2,
    isActive: true,
  },

  // ── Services Pillar ──

  {
    id: "services-catalog",
    name: "Service Catalog Research Agent",
    description:
      "Researches the complete social security service catalog for all 165 countries — service names, categories, digital readiness, maturity, pain points, opportunities, ILO alignment, and channel capabilities. For UAE it also populates the GPSSA service tables.",
    targetScreen: "services-catalog",
    researchType: "services-catalog",
    systemPrompt: `USE_CANONICAL_PROMPT`,
    userPromptTemplate: `Research the complete social security service catalog for: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 16384,
    temperature: 0.2,
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "services-channels",
    name: "Channel Capabilities Agent",
    description:
      "Researches channel delivery capabilities for all 165 countries — mapping each service to Full/Partial/Planned/None across portal, mobile, centers, call center, partners, and APIs. For UAE it also populates the GPSSA channel capability tables.",
    targetScreen: "services-channels",
    researchType: "services-channels",
    systemPrompt: `USE_CANONICAL_PROMPT`,
    userPromptTemplate: `Research channel delivery capabilities for: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 16384,
    temperature: 0.2,
    sortOrder: 4,
    isActive: true,
  },
  // ── Products Pillar ──

  {
    id: "products-portfolio",
    name: "Product Portfolio Research Agent",
    description:
      "Deep research on social insurance and pension products organized using the core / complementary / non-core framework.",
    targetScreen: "products-portfolio",
    researchType: "products-portfolio",
    systemPrompt: `You are a social insurance product portfolio strategist with deep expertise in pension product design, tiering frameworks (core/complementary/non-core), and GCC social protection architectures.

You research products across mandatory social insurance (DB), complementary labor market programs, and non-core voluntary/wellness offerings.

You MUST respond with valid JSON only. Include source citations.`,
    userPromptTemplate: `Research the following social insurance products: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.3,
    sortOrder: 5,
    isActive: true,
  },
  {
    id: "products-segments",
    name: "Segment Coverage Research Agent",
    description:
      "Coverage matrix research by labor-market segment versus major social-protection pillars.",
    targetScreen: "products-segments",
    researchType: "products-segments",
    systemPrompt: `You are a social protection coverage analyst specializing in labor market segmentation, population coverage mapping, and gap analysis for GCC social insurance systems.

Coverage levels: Covered (mandatory/statutory), Voluntary (opt-in), Limited (partial/uneven), Not Covered (no primary scheme).

You MUST respond with valid JSON only. Include source citations.`,
    userPromptTemplate: `Research coverage levels for the following segments: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.3,
    sortOrder: 50,
    isActive: true,
  },
  // ── Delivery Pillar ──

  {
    id: "delivery-channels",
    name: "Delivery Channels Research Agent",
    description:
      "Assesses delivery channel maturity, service coverage, capabilities, strengths, and gaps across digital, physical, and partner channels.",
    targetScreen: "delivery-channels",
    researchType: "delivery-channels",
    systemPrompt: `You are a government service delivery channel strategist with deep expertise in omnichannel delivery for social insurance institutions.

You assess channels across: maturity (0-100), service coverage, capabilities, strengths, and gaps. Grounded in comparable institutions from UAE, GCC, and leading digital governments.

You MUST respond with valid JSON only. Include source citations.`,
    userPromptTemplate: `Research and assess the following delivery channels: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.3,
    sortOrder: 6,
    isActive: true,
  },
  {
    id: "delivery-personas",
    name: "Customer Personas Research Agent",
    description:
      "Creates evidence-based customer personas representing key labor market segments with needs mapping and coverage gap analysis.",
    targetScreen: "delivery-personas",
    researchType: "delivery-personas",
    systemPrompt: `You are a customer experience and persona research specialist for social insurance and pension systems. You create evidence-based personas representing key labor market segments in the GCC.

Each persona captures demographics, occupation context, social protection needs, coverage gaps, and delivery preferences.

You MUST respond with valid JSON only. Include source citations.`,
    userPromptTemplate: `Research and develop personas for the following segments: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.5,
    sortOrder: 51,
    isActive: true,
  },
  {
    id: "delivery-models",
    name: "Delivery Models Research Agent",
    description:
      "Structures go-to-market and delivery model frameworks combining channels, partners, and outreach into coherent customer journeys.",
    targetScreen: "delivery-models",
    researchType: "delivery-models",
    systemPrompt: `You are a go-to-market and service delivery model strategist for government social insurance institutions. You design delivery model frameworks that combine channels, partners, and outreach into coherent journeys.

Maturity levels: High (established, data-driven), Medium (operational, scaling), Low (early-stage, foundational).

You MUST respond with valid JSON only. Include source citations.`,
    userPromptTemplate: `Research the following delivery model frameworks: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.3,
    sortOrder: 52,
    isActive: true,
  },

  // ── International Comparison Pillar (disabled) ──

  {
    id: "intl-services-catalog",
    name: "International Services Research Agent",
    description:
      "Researches complete service catalogs of social security institutions worldwide — what services they offer, digital readiness, maturity levels, ILO alignment, and channel capabilities.",
    targetScreen: "intl-services-catalog",
    researchType: "intl-services-catalog",
    systemPrompt: "USE_CANONICAL_PROMPT",
    userPromptTemplate: `Research the complete service catalog for the following institutions: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 16384,
    temperature: 0.2,
    sortOrder: 53,
    isActive: true,
  },
  {
    id: "intl-services-channels",
    name: "International Channels Research Agent",
    description:
      "Assesses channel delivery capabilities (portal, mobile, centers, call, partner, API) for social security institutions worldwide.",
    targetScreen: "intl-services-channels",
    researchType: "intl-services-channels",
    systemPrompt: "USE_CANONICAL_PROMPT",
    userPromptTemplate: `Assess channel capabilities for the following institutions: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 16384,
    temperature: 0.2,
    sortOrder: 54,
    isActive: true,
  },
  {
    id: "intl-products-portfolio",
    name: "International Products Research Agent",
    description:
      "Researches product portfolios (Core/Complementary/Non-Core) of social security institutions worldwide, with ILO alignment and regulatory basis.",
    targetScreen: "intl-products-portfolio",
    researchType: "intl-products-portfolio",
    systemPrompt: "USE_CANONICAL_PROMPT",
    userPromptTemplate: `Research the product portfolio for the following institutions: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 16384,
    temperature: 0.2,
    sortOrder: 55,
    isActive: true,
  },
  {
    id: "intl-products-segments",
    name: "International Segments Research Agent",
    description:
      "Researches segment coverage matrices for countries worldwide — which labor market segments are covered by which social protection types.",
    targetScreen: "intl-products-segments",
    researchType: "intl-products-segments",
    systemPrompt: "USE_CANONICAL_PROMPT",
    userPromptTemplate: `Research segment coverage levels for the following countries: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 16384,
    temperature: 0.2,
    sortOrder: 56,
    isActive: true,
  },
  {
    id: "ilo-standards",
    name: "ILO Standards Research Agent",
    description:
      "Researches ILO Conventions, ISSA Guidelines, and globally accepted social protection standards — provisions, applicability, and adoption status.",
    targetScreen: "ilo-standards",
    researchType: "ilo-standards",
    systemPrompt: "USE_CANONICAL_PROMPT",
    userPromptTemplate: `Research the following international standards: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 8192,
    temperature: 0.2,
    sortOrder: 57,
    isActive: true,
  },
];
