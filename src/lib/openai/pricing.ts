// Per-model pricing (USD per 1M tokens). Update as OpenAI publishes new pricing.
// Keys match OpenAI model IDs. Fallback to GPT-4o pricing for unknown models.

interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
}

const MODEL_PRICES: Record<string, ModelPricing> = {
  "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  "gpt-4o-2024-08-06": { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  "gpt-4o-2024-11-20": { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "gpt-4o-mini-2024-07-18": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "gpt-4.1": { inputPerMillion: 2.0, outputPerMillion: 8.0 },
  "gpt-4.1-mini": { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  "gpt-4.1-nano": { inputPerMillion: 0.1, outputPerMillion: 0.4 },
  "gpt-4-turbo": { inputPerMillion: 10.0, outputPerMillion: 30.0 },
  "o1": { inputPerMillion: 15.0, outputPerMillion: 60.0 },
  "o1-preview": { inputPerMillion: 15.0, outputPerMillion: 60.0 },
  "o1-mini": { inputPerMillion: 3.0, outputPerMillion: 12.0 },
  "o3": { inputPerMillion: 10.0, outputPerMillion: 40.0 },
  "o3-mini": { inputPerMillion: 1.1, outputPerMillion: 4.4 },
  "o4-mini": { inputPerMillion: 1.1, outputPerMillion: 4.4 },
};

const DEFAULT_PRICE: ModelPricing = MODEL_PRICES["gpt-4o"];

export function getModelPricing(model: string): ModelPricing {
  if (MODEL_PRICES[model]) return MODEL_PRICES[model];
  // Fuzzy match by prefix (e.g. "gpt-4o-2024-09-12" → gpt-4o)
  const sortedKeys = Object.keys(MODEL_PRICES).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (model.startsWith(key)) return MODEL_PRICES[key];
  }
  return DEFAULT_PRICE;
}

export function calcCostUSD(model: string, promptTokens: number, completionTokens: number): number {
  const { inputPerMillion, outputPerMillion } = getModelPricing(model);
  return (
    (promptTokens / 1_000_000) * inputPerMillion +
    (completionTokens / 1_000_000) * outputPerMillion
  );
}
