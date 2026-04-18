import type { ScreenType } from "../types";
import { writeAtlasResults } from "./atlas";
import { writeServicesResults } from "./services";
import { writeProductsResults } from "./products";
import { writeDeliveryResults } from "./delivery";
import { writeInternationalResults } from "./international";
import { writeMandateResults } from "./mandate";
import { SCREEN_PILLAR } from "../types";
import { writeComplianceForScreen } from "./standards-bridge";
import { writeStandardsAuditorResults } from "./standards-auditor";

export async function writeScreenResults(
  screenType: ScreenType,
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  const pillar = SCREEN_PILLAR[screenType];

  let written = 0;
  switch (pillar) {
    case "mandate":
      written = await writeMandateResults(screenType, results, agentLabel);
      break;
    case "atlas":
      written = await writeAtlasResults(screenType, results, agentLabel);
      break;
    case "services":
      written = await writeServicesResults(screenType, results, agentLabel);
      break;
    case "products":
      written = await writeProductsResults(screenType, results, agentLabel);
      break;
    case "delivery":
      written = await writeDeliveryResults(screenType, results, agentLabel);
      break;
    case "international":
      written = await writeInternationalResults(screenType, results, agentLabel);
      break;
    case "standards":
      written = await writeStandardsAuditorResults(screenType, results, agentLabel);
      break;
    default:
      return 0;
  }

  // Post-process: persist standardsAlignment → StandardCompliance rows
  try {
    await writeComplianceForScreen(screenType, results, agentLabel);
  } catch (err) {
    console.error(`[standards-bridge] Failed to persist compliance for ${screenType}:`, err);
  }

  return written;
}

export { createSourcesAndCitations } from "./sources";
