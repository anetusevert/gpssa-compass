import type { PromptModule, ScreenType } from "../types";
import { atlasWorldmapPrompt } from "./atlas-worldmap";
import { atlasBenchmarkingPrompt } from "./atlas-benchmarking";
import { servicesCatalogPrompt } from "./services-catalog";
import { servicesChannelsPrompt } from "./services-channels";
import { servicesAnalysisPrompt } from "./services-analysis";
import { productsPortfolioPrompt } from "./products-portfolio";
import { productsSegmentsPrompt } from "./products-segments";
import { productsInnovationPrompt } from "./products-innovation";
import { deliveryChannelsPrompt } from "./delivery-channels";
import { deliveryPersonasPrompt } from "./delivery-personas";
import { deliveryModelsPrompt } from "./delivery-models";

export const PROMPT_MODULES: Record<ScreenType, PromptModule> = {
  "atlas-worldmap": atlasWorldmapPrompt,
  "atlas-benchmarking": atlasBenchmarkingPrompt,
  "services-catalog": servicesCatalogPrompt,
  "services-channels": servicesChannelsPrompt,
  "services-analysis": servicesAnalysisPrompt,
  "products-portfolio": productsPortfolioPrompt,
  "products-segments": productsSegmentsPrompt,
  "products-innovation": productsInnovationPrompt,
  "delivery-channels": deliveryChannelsPrompt,
  "delivery-personas": deliveryPersonasPrompt,
  "delivery-models": deliveryModelsPrompt,
};
