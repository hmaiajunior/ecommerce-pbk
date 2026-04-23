import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-guard"
import { sendWholesaleApprovalEmail } from "@/lib/email"

const bodySchema = z.object({
  approved: z.boolean(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const customer = await prisma.user.findFirst({
    where: { id, role: "WHOLESALE" },
    select: { id: true, name: true, email: true, wholesaleApproved: true },
  })

  if (!customer) {
    return NextResponse.json(
      { error: "Cliente atacado não encontrado." },
      { status: 404 }
    )
  }

  const wasApproved = customer.wholesaleApproved
  const { approved } = parsed.data

  const updated = await prisma.user.update({
    where: { id },
    data: { wholesaleApproved: approved },
    select: { id: true, name: true, email: true, wholesaleApproved: true },
  })

  // Envia e-mail somente na transição para aprovado
  if (approved && !wasApproved && customer.email) {
    await sendWholesaleApprovalEmail(customer.email, customer.name).catch(
      console.error
    )
  }

  return NextResponse.json({ data: updated })
}
