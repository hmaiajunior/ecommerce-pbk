import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { registerSchema } from "@/lib/validations"

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW = 60 * 60 // 1 hora

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"
  const rateLimitKey = `ratelimit:register:${ip}`

  const attempts = await redis.incr(rateLimitKey)
  if (attempts === 1) await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW)
  if (attempts > RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429 }
    )
  }

  const body = await req.json()
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const { name, email, password, role, cnpj } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: "Este e-mail já está cadastrado." },
      { status: 409 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      // atacado aguarda aprovação manual
      wholesaleApproved: false,
    },
    select: { id: true, name: true, email: true, role: true },
  })

  const message =
    role === "WHOLESALE"
      ? "Cadastro realizado! Sua conta de atacado será analisada em até 2 dias úteis."
      : "Cadastro realizado com sucesso!"

  return NextResponse.json({ data: user, message }, { status: 201 })
}
