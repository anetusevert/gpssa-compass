export type ScreenType =
  | "atlas-worldmap"
  | "atlas-benchmarking"
  | "services-catalog"
  | "services-channels"
  | "services-analysis"
  | "products-portfolio"
  | "products-segments"
  | "products-innovation"
  | "delivery-channels"
  | "delivery-personas"
  | "delivery-models";

export const ALL_SCREEN_TYPES: ScreenType[] = [
  "atlas-worldmap",
  "atlas-benchmarking",
  "services-catalog",
  "services-channels",
  "services-analysis",
  "products-portfolio",
  "products-segments",
  "products-innovation",
  "delivery-channels",
  "delivery-personas",
  "delivery-models",
];

export const SCREEN_LABELS: Record<ScreenType, string> = {
  "atlas-worldmap": "Global Atlas — World Map",
  "atlas-benchmarking": "Global Atlas — Benchmarking",
  "services-catalog": "Services — Catalog",
  "services-channels": "Services — Channel Capabilities",
  "services-analysis": "Services — Analysis",
  "products-portfolio": "Products — Portfolio",
  "products-segments": "Products — Segment Coverage",
  "products-innovation": "Products — Innovation",
  "delivery-channels": "Delivery — Channels",
  "delivery-personas": "Delivery — Personas",
  "delivery-models": "Delivery — Models",
};

export const SCREEN_PILLAR: Record<ScreenType, string> = {
  "atlas-worldmap": "atlas",
  "atlas-benchmarking": "atlas",
  "services-catalog": "services",
  "services-channels": "services",
  "services-analysis": "services",
  "products-portfolio": "products",
  "products-segments": "products",
  "products-innovation": "products",
  "delivery-channels": "delivery",
  "delivery-personas": "delivery",
  "delivery-models": "delivery",
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
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
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
