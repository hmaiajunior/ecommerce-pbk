import { redis } from "@/lib/redis"

/**
 * Cache-aside: tenta o Redis primeiro; se miss, chama o fetcher, armazena e retorna.
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached as string) as T

  const data = await fetcher()
  await redis.setex(key, ttl, JSON.stringify(data))
  return data
}

/**
 * Invalida todas as chaves que casam com o padrão (ex: "products:list:*").
 * Usar com cuidado em produção — KEYS não é recomendado em bases muito grandes.
 */
export async function invalidateByPattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) await redis.del(...keys)
}

/** Invalida a chave de um produto e todas as listas cacheadas. */
export async function invalidateProduct(slug: string): Promise<void> {
  await Promise.all([
    redis.del(`product:${slug}`),
    invalidateByPattern("products:list:*"),
  ])
}
