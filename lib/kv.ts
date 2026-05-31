import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const TTL_SECONDS = 60 * 60 * 24;

export async function filterUnsent(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.exists(`news:${id}`);
  }

  const results = await pipeline.exec<number[]>();
  return ids.filter((_, i) => results[i] === 0);
}

export async function markAsSent(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.set(`news:${id}`, "1", { ex: TTL_SECONDS });
  }
  await pipeline.exec();
}
