import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const configured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = configured ? Redis.fromEnv() : null;

type LimitResult = { success: boolean };

function createLimiter(
  prefix: string,
  max: number,
  window: Duration,
): { limit: (identifier: string) => Promise<LimitResult> } {
  if (!redis) {
    return {
      async limit() {
        return { success: true };
      },
    };
  }

  const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(max, window),
  prefix,
  ephemeralCache: new Map(),
});

  return {
    async limit(identifier: string) {
      const result = await ratelimit.limit(identifier);
      return { success: result.success };
    },
  };
}

export const authLimiter = createLimiter("printflow:auth", 5, "15 m");
export const registerLimiter = createLimiter("printflow:register", 3, "60 m");
export const pageLimiter = createLimiter("printflow:page", 120, "1 m");
export const adminLimiter = createLimiter("printflow:admin", 60, "1 m");

export function getIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
