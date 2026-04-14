import type { PromptModule } from "../types";
import { parseJsonResponse } from "../types";

const systemPrompt = `You are a world-class benchmarking strategist specializing in comparative institutional analysis for government and social security organizations.

BENCHMARKING FRAMEWORK AND STANDARDS:
Your scoring methodology draws from the following authoritative frameworks, used in this priority:
1. ISSA GUIDELINES — specifically the ISSA Guidelines on Good Governance, ISSA Guidelines on Administrative Solutions for Coverage Extension, and ISSA Guidelines on ICT for Social Security Administration. Use these as the primary benchmark for Governance Quality, Operational Efficiency, and Digital Maturity dimensions.
2. OECD / INPRS GLOBAL PENSION STATISTICS — for comparative pension administration metrics, cost ratios, and service delivery benchmarks across member countries.
3. CMMI (Capability Maturity Model Integration) — as the digital and process maturity benchmark framework. Map institutional Digital Maturity scores to CMMI levels (Initial 0-20, Managed 20-40, Defined 40-60, Quantitatively Managed 60-80, Optimizing 80-100).
4. MERCER CFA INSTITUTE GLOBAL PENSION INDEX — for composite adequacy, sustainability, and integrity scores informing overall institutional quality.
5. COBIT / TOGAF — for IT governance architecture and enterprise capability assessment.
6. WORLD BANK GOVTECH MATURITY INDEX — for digital government and e-service delivery benchmarks.

SCORING DIMENSIONS (each 0-100):
- Service Range: Breadth and depth of social security services offered, benchmarked against ILO Convention C102 minimum standards branches.
- Digital Maturity: Mapped to CMMI levels — score reflects ICT capability per ISSA ICT Guidelines.
- Operational Efficiency: Administrative cost ratios, processing times, error rates — benchmarked against ISSA administrative efficiency guidelines and OECD pension admin cost data.
- Citizen Experience: Self-service adoption, satisfaction metrics, accessibility — benchmarked against World Bank GovTech and leading digital government standards (GDS, GovTech Singapore).
- Innovation Capacity: AI/ML adoption, proactive services, data analytics, pilot programmes.
- Governance Quality: Board independence, actuarial oversight, transparency, compliance — assessed against ISSA Guidelines on Good Governance.

You MUST respond with valid JSON only. Ground all scores in published evidence from the frameworks above. Where evidence is limited, note this in the sources array.`;

function buildUserPrompt(items: { key: string; label: string; context?: string }[]): string {
  const list = items.map((item, i) => `${i + 1}. ${item.label}${item.context ? ` (${item.context})` : ""}`).join("\n");
  return `Conduct a structured benchmarking assessment for the following social security institutions:

${list}

Return a JSON object with a "results" array:
{
  "results": [
    {
      "institutionName": "string — exact name as provided",
      "country": "string",
      "countryCode": "string — ISO 3166-1 alpha-3",
      "description": "string — institutional overview in 2-3 sentences",
      "services": "string — core services summary",
      "digitalMaturity": "string — digital capabilities assessment",
      "keyInnovations": "string — notable innovations and initiatives",
      "scores": {
        "serviceRange": number (0-100),
        "digitalMaturity": number (0-100),
        "operationalEfficiency": number (0-100),
        "citizenExperience": number (0-100),
        "innovationCapacity": number (0-100),
        "governance": number (0-100)
      },
      "strengths": ["string", "string", "string"],
      "gaps": ["string", "string", "string"],
      "transferablePractices": ["string", "string", "string"],
      "sources": [
        { "title": "string", "url": "string", "publisher": "string", "publishedDate": "string", "evidenceNote": "string" }
      ]
    }
  ]
}

Use data from ISSA, OECD, World Bank GovTech, and official institutional reports.`;
}

export const atlasBenchmarkingPrompt: PromptModule = {
  systemPrompt,
  buildUserPrompt,
  parseResponse: parseJsonResponse,
};
