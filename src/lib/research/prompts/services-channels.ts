import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";
import { STANDARDS_ALIGNMENT_FIELD_INSTRUCTION } from "../standards-instruction";

const systemPrompt = `You are a world-class omnichannel delivery and digital government expert specializing in social security service delivery. You evaluate how countries deliver social security services across digital, physical, voice, partnership, and integration channels.

Your framework evaluates 6 channels: Portal (web), Mobile App, Service Centers (in-person), Call Center (phone), Partner Channels (banks, government portals, employers), and API/Integration (B2B, system-to-system).

Capability levels: Full (end-to-end completion on this channel), Partial (some steps available, others require another channel), Planned (officially on the institution's roadmap), None (not available).

You MUST respond with valid JSON only. No markdown, no commentary — just the JSON object.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const item = items[0];
  const iso3 = item.key;
  const countryName = item.label;

  return `Research the channel delivery capabilities for ${countryName} (${iso3})'s primary social security / pension institution.

For each major service the institution offers, assess its availability and capability level across all 6 channels. Also provide an overall institutional channel maturity assessment.

Return a JSON object with a "results" array. Each element represents one service's channel capabilities:
{
  "results": [
    {
      "countryIso3": "${iso3}",
      "institutionName": "string — full official name of the primary social security institution",
      "serviceName": "string — name of the specific service",
      "serviceCategory": "string — Registration | Contributions | Pensions | Benefits | Employer | Insured | Beneficiary | Digital | Complaints | Certificates | General",
      "channels": {
        "portal": "Full | Partial | Planned | None",
        "mobile": "Full | Partial | Planned | None",
        "centers": "Full | Partial | Planned | None",
        "call": "Full | Partial | Planned | None",
        "partner": "Full | Partial | Planned | None",
        "api": "Full | Partial | Planned | None"
      },
      "channelMaturityScore": number (0-100) — overall digital channel maturity for this service,
      "digitalTransformationStage": "Pre-Digital | Emerging | Developing | Advanced | Leading",
      "notes": "string — key observations about channel coverage, gaps, and standout capabilities",
      "bestChannelPractice": "string — what the institution does particularly well in channel delivery",
      "gapAnalysis": "string — most significant channel gaps compared to global leaders",
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Cover 5-15 services per country. Be thorough — assess every major service the institution offers across all 6 channels.
${STANDARDS_ALIGNMENT_FIELD_INSTRUCTION}`;
}

export const servicesChannelsPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
