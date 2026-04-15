import type { ScreenType } from "../types";
import { writeAtlasResults } from "./atlas";
import { writeServicesResults } from "./services";
import { writeProductsResults } from "./products";
import { writeDeliveryResults } from "./delivery";
import { writeInternationalResults } from "./international";
import { SCREEN_PILLAR } from "../types";

export async function writeScreenResults(
  screenType: ScreenType,
  results: Record<string, unknown>[],
  agentLabel: string
): Promise<number> {
  const pillar = SCREEN_PILLAR[screenType];

  switch (pillar) {
    case "atlas":
      return writeAtlasResults(screenType, results, agentLabel);
    case "services":
      return writeServicesResults(screenType, results, agentLabel);
    case "products":
      return writeProductsResults(screenType, results, agentLabel);
    case "delivery":
      return writeDeliveryResults(screenType, results, agentLabel);
    case "international":
      return writeInternationalResults(screenType, results, agentLabel);
    default:
      return 0;
  }
}

export { createSourcesAndCitations } from "./sources";
