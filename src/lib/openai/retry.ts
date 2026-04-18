import OpenAI from "openai";

interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

const DEFAULTS: Required<RetryOptions> = {
  maxAttempts: 5,
  baseDelayMs: 1000,
  maxDelayMs: 30_000,
};

function isRetryable(err: unknown): boolean {
  if (err instanceof OpenAI.APIError) {
    if (err.status === 429) return true;
    if (typeof err.status === "number" && err.status >= 500 && err.status < 600) return true;
  }
  if (err instanceof OpenAI.APIConnectionError || err instanceof OpenAI.APIConnectionTimeoutError) {
    return true;
  }
  return false;
}

function jitter(ms: number): number {
  return ms * (0.7 + Math.random() * 0.6);
}

export async function withOpenAIRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const { maxAttempts, baseDelayMs, maxDelayMs } = { ...DEFAULTS, ...opts };
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts || !isRetryable(err)) throw err;
      const delay = Math.min(maxDelayMs, jitter(baseDelayMs * Math.pow(2, attempt - 1)));
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
