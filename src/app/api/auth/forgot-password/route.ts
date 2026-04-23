import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { sendPasswordResetEmail } from "@/lib/email"
import { forgotPasswordSchema } from "@/lib/validations"

const TOKEN_TTL = 60 * 60 // 1 hora

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = forgotPasswordSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const { email } = parsed.data

  // Resposta idêntica independente de o e-mail existir (evita user enumeration)
  const genericResponse = NextResponse.json({
    message: "Se este e-mail estiver cadastrado, você receberá as instruções em breve.",
  })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return genericResponse

  const token = crypto.randomBytes(32).toString("hex")
  await redis.setex(`reset-password:${token}`, TOKEN_TTL, user.id)

  await sendPasswordResetEmail(email, token)

  return genericResponse
}
