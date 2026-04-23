import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { resetPasswordSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = resetPasswordSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const { token, password } = parsed.data
  const redisKey = `reset-password:${token}`

  const userId = await redis.get(redisKey)
  if (!userId) {
    return NextResponse.json(
      { error: "Token inválido ou expirado." },
      { status: 400 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: userId as string },
    data: { password: hashedPassword },
  })

  // Invalida o token após o uso
  await redis.del(redisKey)

  return NextResponse.json({ message: "Senha redefinida com sucesso." })
}
