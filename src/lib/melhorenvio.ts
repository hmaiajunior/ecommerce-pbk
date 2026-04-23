const BASE_URL =
  process.env.MELHOR_ENVIO_SANDBOX === "true"
    ? "https://sandbox.melhorenvio.com.br"
    : "https://melhorenvio.com.br"

// CEP de origem da loja
const STORE_ZIP = (process.env.STORE_ZIP ?? "01310100").replace(/\D/g, "")

// Estimativas para roupas infantis
const ITEM_WEIGHT_KG = 0.2
const PACKAGE_WIDTH_CM = 20
const PACKAGE_LENGTH_CM = 30
// Altura cresce com a quantidade de peças
const ITEM_HEIGHT_CM = 3

type ShippingItem = {
  quantity: number
}

export type ShippingQuote = {
  id: number
  service: string
  company: string
  price: number
  deliveryDays: number
}

type MelhorEnvioOption = {
  id: number
  name: string
  price: string | null
  delivery_time: number
  company: { name: string }
  error?: string
}

export async function calculateShipping(
  destinationZip: string,
  items: ShippingItem[]
): Promise<ShippingQuote[]> {
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)

  const pkg = {
    height: Math.max(10, ITEM_HEIGHT_CM * totalQty),
    width: PACKAGE_WIDTH_CM,
    length: PACKAGE_LENGTH_CM,
    weight: parseFloat((ITEM_WEIGHT_KG * totalQty).toFixed(2)),
  }

  const res = await fetch(`${BASE_URL}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Playbekids/1.0 (contato@playbekids.com.br)",
    },
    body: JSON.stringify({
      from: { postal_code: STORE_ZIP },
      to: { postal_code: destinationZip.replace(/\D/g, "") },
      package: pkg,
      options: { receipt: false, own_hand: false },
    }),
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`Melhor Envio retornou status ${res.status}`)
  }

  const options: MelhorEnvioOption[] = await res.json()

  return options
    .filter((o) => !o.error && o.price !== null)
    .map((o) => ({
      id: o.id,
      service: o.name,
      company: o.company.name,
      price: parseFloat(o.price!),
      deliveryDays: o.delivery_time,
    }))
    .sort((a, b) => a.price - b.price)
}
