import type { PromptModule, ScreenType } from "../types";
import { atlasWorldmapPrompt } from "./atlas-worldmap";
import { atlasBenchmarkingPrompt } from "./atlas-benchmarking";
import { servicesCatalogPrompt } from "./services-catalog";
import { servicesChannelsPrompt } from "./services-channels";
import { productsPortfolioPrompt } from "./products-portfolio";
import { productsSegmentsPrompt } from "./products-segments";
import { deliveryChannelsPrompt } from "./delivery-channels";
import { deliveryPersonasPrompt } from "./delivery-personas";
import { deliveryModelsPrompt } from "./delivery-models";
import { intlServicesCatalogPrompt } from "./intl-services-catalog";
import { intlServicesChannelsPrompt } from "./intl-services-channels";
import { intlProductsPortfolioPrompt } from "./intl-products-portfolio";
import { intlProductsSegmentsPrompt } from "./intl-products-segments";
import { iloStandardsPrompt } from "./ilo-standards";

export const PROMPT_MODULES: Partial<Record<ScreenType, PromptModule>> = {
  "atlas-worldmap": atlasWorldmapPrompt,
  "atlas-benchmarking": atlasBenchmarkingPrompt,
  "services-catalog": servicesCatalogPrompt,
  "services-channels": servicesChannelsPrompt,
  "products-portfolio": productsPortfolioPrompt,
  "products-segments": productsSegmentsPrompt,
  "delivery-channels": deliveryChannelsPrompt,
  "delivery-personas": deliveryPersonasPrompt,
  "delivery-models": deliveryModelsPrompt,
  "intl-services-catalog": intlServicesCatalogPrompt,
  "intl-services-channels": intlServicesChannelsPrompt,
  "intl-products-portfolio": intlProductsPortfolioPrompt,
  "intl-products-segments": intlProductsSegmentsPrompt,
  "ilo-standards": iloStandardsPrompt,
};
