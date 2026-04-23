import Redis from "ioredis"

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  })

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis

// TTLs centralizados (em segundos)
export const TTL = {
  product: 5 * 60,         // 5 min — catálogo público
  wholesalePrice: 60 * 60, // 1 h  — preços de atacado por usuário
  session: 24 * 60 * 60,   // 24 h — dados de sessão extras
}
