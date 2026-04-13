import type { PromptModule } from "../types";
import {
  RESEARCH_SYSTEM_PROMPT,
  buildUserPrompt as canonicalBuildUserPrompt,
} from "@/lib/countries/prompts";

function buildUserPrompt(items: { key: string; label: string }[]): string {
  return canonicalBuildUserPrompt(items.map((item) => item.label));
}

function parseResponse(raw: string): Record<string, unknown>[] {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) return parsed;
  if (parsed.results && Array.isArray(parsed.results)) return parsed.results;
  const firstArrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
  if (firstArrayKey) return parsed[firstArrayKey];
  return [parsed];
}

export const atlasWorldmapPrompt: PromptModule = {
  systemPrompt: RESEARCH_SYSTEM_PROMPT,
  buildUserPrompt,
  parseResponse,
};
