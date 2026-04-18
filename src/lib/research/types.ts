export type ScreenType =
  | "atlas-worldmap"
  | "atlas-system"
  | "atlas-performance"
  | "atlas-insights"
  | "atlas-benchmarking"
  | "services-catalog"
  | "services-channels"
  | "products-portfolio"
  | "products-segments"
  | "products-innovation"
  | "delivery-channels"
  | "delivery-personas"
  | "delivery-models"
  | "intl-services-catalog"
  | "intl-services-channels"
  | "intl-products-portfolio"
  | "intl-products-segments"
  | "ilo-standards";

export const ALL_SCREEN_TYPES: ScreenType[] = [
  "atlas-worldmap",
  "atlas-system",
  "atlas-performance",
  "atlas-insights",
  "atlas-benchmarking",
  "services-catalog",
  "services-channels",
  "products-portfolio",
  "products-segments",
  "products-innovation",
  "delivery-channels",
  "delivery-personas",
  "delivery-models",
  "intl-services-catalog",
  "intl-services-channels",
  "intl-products-portfolio",
  "intl-products-segments",
  "ilo-standards",
];

export const SCREEN_LABELS: Record<ScreenType, string> = {
  "atlas-worldmap": "Global Atlas — World Map (legacy monolith)",
  "atlas-system": "Global Atlas — System Architecture",
  "atlas-performance": "Global Atlas — Performance Metrics",
  "atlas-insights": "Global Atlas — Narrative Insights",
  "atlas-benchmarking": "Global Atlas — Benchmarking",
  "services-catalog": "Services — Catalog",
  "services-channels": "Services — Channel Capabilities",
  "products-portfolio": "Products — Portfolio",
  "products-segments": "Products — Segment Coverage",
  "products-innovation": "Products — Innovation Pipeline",
  "delivery-channels": "Delivery — Channels",
  "delivery-personas": "Delivery — Personas",
  "delivery-models": "Delivery — Models",
  "intl-services-catalog": "International — Service Catalogs",
  "intl-services-channels": "International — Channel Capabilities",
  "intl-products-portfolio": "International — Product Portfolios",
  "intl-products-segments": "International — Segment Coverage",
  "ilo-standards": "ILO & Global Standards",
};

export const SCREEN_PILLAR: Record<ScreenType, string> = {
  "atlas-worldmap": "atlas",
  "atlas-system": "atlas",
  "atlas-performance": "atlas",
  "atlas-insights": "atlas",
  "atlas-benchmarking": "atlas",
  "services-catalog": "services",
  "services-channels": "services",
  "products-portfolio": "products",
  "products-segments": "products",
  "products-innovation": "products",
  "delivery-channels": "delivery",
  "delivery-personas": "delivery",
  "delivery-models": "delivery",
  "intl-services-catalog": "international",
  "intl-services-channels": "international",
  "intl-products-portfolio": "international",
  "intl-products-segments": "international",
  "ilo-standards": "international",
};

export interface ResearchSource {
  title: string;
  url: string;
  publisher?: string;
  publishedDate?: string;
  evidenceNote?: string;
}

export interface PromptModule {
  systemPrompt: string;
  buildUserPrompt: (items: { key: string; label: string; context?: string }[]) => string;
  parseResponse: (raw: string) => Record<string, unknown>[];
}

export function parseJsonResponse(raw: string): Record<string, unknown>[] {
  let cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  // Extract JSON from reasoning model output that may have text before/after
  const jsonStart = cleaned.indexOf("[") !== -1 && (cleaned.indexOf("{") === -1 || cleaned.indexOf("[") < cleaned.indexOf("{"))
    ? cleaned.indexOf("[")
    : cleaned.indexOf("{");
  if (jsonStart > 0) {
    cleaned = cleaned.substring(jsonStart);
  }
  const lastBrace = cleaned.lastIndexOf("}");
  const lastBracket = cleaned.lastIndexOf("]");
  const jsonEnd = Math.max(lastBrace, lastBracket);
  if (jsonEnd !== -1 && jsonEnd < cleaned.length - 1) {
    cleaned = cleaned.substring(0, jsonEnd + 1);
  }
  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) return parsed;
  for (const key of ["results", "data", "countries", "items"]) {
    if (parsed[key] && Array.isArray(parsed[key])) return parsed[key];
  }
  const firstObjArrayKey = Object.keys(parsed).find(
    (k) =>
      Array.isArray(parsed[k]) &&
      parsed[k].length > 0 &&
      typeof parsed[k][0] === "object" &&
      parsed[k][0] !== null
  );
  if (firstObjArrayKey) return parsed[firstObjArrayKey];
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return [parsed];
  return [];
}

export const GPT4O_INPUT_COST = 2.5 / 1_000_000;
export const GPT4O_OUTPUT_COST = 10.0 / 1_000_000;
