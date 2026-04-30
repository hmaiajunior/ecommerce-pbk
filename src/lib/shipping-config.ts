// Configuração de frete grátis. Use NEXT_PUBLIC_FREE_SHIPPING_MIN no .env
// para alterar o valor mínimo. Se não definida, usa o padrão abaixo.

export const FREE_SHIPPING_MIN = (() => {
  const raw = process.env.NEXT_PUBLIC_FREE_SHIPPING_MIN
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 199
})()
