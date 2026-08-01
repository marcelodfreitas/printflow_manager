import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET() {
  await redis.set("teste", "funcionou");

  const value = await redis.get("teste");

  return Response.json({
    ok: true,
    value,
  });
}