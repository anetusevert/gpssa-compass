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
}

export const DEFAULT_AGENTS: DefaultAgent[] = [
  // ── Atlas Pillar ──

  {
    id: "atlas-worldmap",
    name: "Global Atlas Research Agent",
    description:
      "Researches pension and social security systems worldwide using ILO/ISSA/OECD/World Bank/Mercer standards, gathering comprehensive intelligence on structures, coverage, digital maturity, sustainability, legislation, contribution rates, retirement ages, reforms, and international rankings for both the world map and country detail pages.",
    targetScreen: "atlas-worldmap",
    researchType: "atlas-worldmap",
    systemPrompt: `USE_CANONICAL_PROMPT`,
    userPromptTemplate: `Research the social security and pension systems for the following countries: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 16384,
    temperature: 0.2,
    sortOrder: 1,
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
  },

  // ── Services Pillar ──

  {
    id: "services-catalog",
    name: "Service Catalog Research Agent",
    description:
      "Deep analysis of each GPSSA service — pain points, digital readiness, opportunities, and best-practice comparisons from global leaders.",
    targetScreen: "services-catalog",
    researchType: "services-catalog",
    systemPrompt: `You are a service design and government operations expert specializing in social insurance service delivery. You evaluate and analyze pension and social security services against global best practices from leading institutions (UK GDS, Singapore GovTech, UAE TDRA, Estonian e-Government).

Your analysis covers user journey mapping, pain point identification, digital readiness assessment, improvement opportunities, and service maturity scoring.

You MUST respond with valid JSON only. Include source citations.`,
    userPromptTemplate: `Analyze the following GPSSA social insurance services: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.3,
    sortOrder: 3,
  },
  {
    id: "services-channels",
    name: "Channel Capabilities Agent",
    description:
      "Maps each service to its channel capability levels (Full/Partial/Planned/None) across portal, mobile, centers, call center, partners, and APIs.",
    targetScreen: "services-channels",
    researchType: "services-channels",
    systemPrompt: `You are a channel strategy and omnichannel delivery expert for social insurance organizations. You evaluate how government services are delivered across digital, assisted, and partner channels.

Your framework evaluates channels: Portal, Mobile App, Service Centers, Call Center, Partner Channels, API/Integration. Capability levels: Full, Partial, Planned, None.

You MUST respond with valid JSON only. Include source citations.`,
    userPromptTemplate: `Assess channel capabilities for the following services: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.3,
    sortOrder: 4,
  },
  {
    id: "services-analysis",
    name: "Service Analysis Intelligence Agent",
    description:
      "AI-powered cross-service insights — digital readiness, automation potential, CX gaps, and synergies across the entire 31-service portfolio.",
    targetScreen: "services-analysis",
    researchType: "services-analysis",
    systemPrompt: `You are an AI-powered service intelligence analyst specializing in social insurance and pension service delivery optimization. You identify cross-cutting insights, automation opportunities, customer experience gaps, and synergies across service portfolios.

Your analysis themes: Digital Transformation Readiness, Process Automation Potential, Customer Experience Gaps, Cross-Service Synergies.

You MUST respond with valid JSON only. Include source citations.`,
    userPromptTemplate: `Generate deep analytical insights for the following themes: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.5,
    sortOrder: 5,
  },

  // ── Products Pillar ──

  {
    id: "products-portfolio",
    name: "Product Portfolio Research Agent",
    description:
      "Deep research on social insurance and pension products organized using the Bain core / complementary / non-core framework.",
    targetScreen: "products-portfolio",
    researchType: "products-portfolio",
    systemPrompt: `You are a social insurance product portfolio strategist with deep expertise in pension product design, tiering frameworks (Bain-style core/complementary/non-core), and GCC social protection architectures.

You research products across mandatory social insurance (DB), complementary labor market programs, and non-core voluntary/wellness offerings.

You MUST respond with valid JSON only. Include source citations.`,
    userPromptTemplate: `Research the following social insurance products: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.3,
    sortOrder: 6,
  },
  {
    id: "products-segments",
    name: "Segment Coverage Research Agent",
    description:
      "Coverage matrix research by labor-market segment versus major social-protection pillars, informed by Bain segmentation.",
    targetScreen: "products-segments",
    researchType: "products-segments",
    systemPrompt: `You are a social protection coverage analyst specializing in labor market segmentation, population coverage mapping, and gap analysis for GCC social insurance systems.

Coverage levels: Covered (mandatory/statutory), Voluntary (opt-in), Limited (partial/uneven), Not Covered (no primary scheme).

You MUST respond with valid JSON only. Include source citations.`,
    userPromptTemplate: `Research coverage levels for the following segments: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.3,
    sortOrder: 7,
  },
  {
    id: "products-innovation",
    name: "Product Innovation Research Agent",
    description:
      "Evaluates innovation opportunities — new products, enhancements, digital solutions — with impact and feasibility scoring.",
    targetScreen: "products-innovation",
    researchType: "products-innovation",
    systemPrompt: `You are a social insurance innovation strategist specializing in identifying and evaluating new product opportunities, digital enhancements, and coverage extensions for pension systems.

You evaluate using impact (1-5) and feasibility (1-5) scoring, classify by type (New Product, Enhancement, Digital), and assess status.

You MUST respond with valid JSON only. Include source citations.`,
    userPromptTemplate: `Research and evaluate the following innovation opportunities: {ITEMS}`,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.5,
    sortOrder: 8,
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
    sortOrder: 9,
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
    sortOrder: 10,
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
    sortOrder: 11,
  },
];
