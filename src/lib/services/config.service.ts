import { prisma } from "@/lib/db";

const SENSITIVE_KEYS = ["openai_api_key"];

function maskValue(key: string, value: string): string {
  if (SENSITIVE_KEYS.includes(key) && value.length > 4) {
    return "•".repeat(value.length - 4) + value.slice(-4);
  }
  return value;
}

export class ConfigService {
  async getAll() {
    const configs = await prisma.appConfig.findMany();
    const result: Record<string, string> = {};
    for (const c of configs) {
      result[c.key] = maskValue(c.key, c.value);
    }
    return result;
  }

  async get(key: string) {
    const config = await prisma.appConfig.findUnique({ where: { key } });
    return config?.value ?? null;
  }

  async getMasked(key: string) {
    const config = await prisma.appConfig.findUnique({ where: { key } });
    if (!config) return null;
    return maskValue(key, config.value);
  }

  async set(key: string, value: string) {
    const config = await prisma.appConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    return { key: config.key, value: maskValue(config.key, config.value) };
  }
}

export const configService = new ConfigService();
