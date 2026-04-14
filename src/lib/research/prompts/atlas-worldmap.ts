import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";
import {
  RESEARCH_SYSTEM_PROMPT,
  buildUserPrompt as canonicalBuildUserPrompt,
} from "@/lib/countries/prompts";

function buildUserPrompt(items: { key: string; label: string }[]): string {
  return canonicalBuildUserPrompt(items.map((item) => item.label));
}

export const atlasWorldmapPrompt: PromptModule = {
  systemPrompt: RESEARCH_SYSTEM_PROMPT,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
