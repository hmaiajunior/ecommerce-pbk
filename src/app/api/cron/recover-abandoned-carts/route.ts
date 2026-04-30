import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendAbandonedCartEmail } from "@/lib/email"

const ABANDON_THRESHOLD_MIN = 120 // 2h sem update → considerado abandonado
const STALE_DAYS = 7 // snapshots mais velhos que isso são descartados

type SnapshotItem = {
  productId: string
  slug: string
  name: string
  size: string
  quantity: number
  price: number
  imageUrl: string | null
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = Date.now()
  const abandonedCutoff = new Date(now - ABANDON_THRESHOLD_MIN * 60 * 1000)
  const staleCutoff = new Date(now - STALE_DAYS * 24 * 60 * 60 * 1000)

  // Limpa snapshots antigos
  const stale = await prisma.abandonedCart.deleteMany({
    where: { updatedAt: { lt: staleCutoff } },
  })

  // Busca candidatos: sem e-mail enviado, parados há ≥ 2h, com itens
  const candidates = await prisma.abandonedCart.findMany({
    where: {
      emailSentAt: null,
      updatedAt: { lt: abandonedCutoff },
    },
    include: {
      user: { select: { name: true, email: true } },
    },
    take: 50, // segurança contra blast em caso de bug
  })

  let sent = 0
  let skipped = 0

  for (const cart of candidates) {
    try {
      const items = (cart.items as unknown as SnapshotItem[]) ?? []
      if (!Array.isArray(items) || items.length === 0) {
        await prisma.abandonedCart.delete({ where: { id: cart.id } })
        skipped++
        continue
      }

      if (!cart.user.email) {
        skipped++
        continue
      }

      await sendAbandonedCartEmail(
        cart.user.email,
        cart.user.name,
        items.map((i) => ({
          name: i.name,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
          imageUrl: i.imageUrl,
          slug: i.slug,
        })),
        Number(cart.subtotal)
      )

      await prisma.abandonedCart.update({
        where: { id: cart.id },
        data: { emailSentAt: new Date() },
      })

      sent++
    } catch (err) {
      console.error(`[cron/recover-abandoned-carts] erro no cart ${cart.id}:`, err)
    }
  }

  console.log(
    `[cron/recover-abandoned-carts] enviados=${sent}, ignorados=${skipped}, candidatos=${candidates.length}, stale_removidos=${stale.count}`
  )

  return NextResponse.json({
    sent,
    skipped,
    candidates: candidates.length,
    staleRemoved: stale.count,
  })
}
