"use server"

import crypto from "crypto"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { sendGuestWelcomeEmail } from "@/lib/email"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
const SET_PASSWORD_TTL = 60 * 60 * 24 // 24 horas

export async function checkEmailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true },
  })
  return !!user
}

// Garante que o usuário existe (cria se necessário) e retorna o e-mail normalizado
export async function ensureGuestUser(
  email: string,
  name?: string
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim()

    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (!user) {
      const tempPassword = await bcrypt.hash(crypto.randomUUID(), 10)
      const displayName = (name ?? "").trim() || normalizedEmail.split("@")[0]

      user = await prisma.user.create({
        data: { email: normalizedEmail, name: displayName, password: tempPassword },
      })

      const token = crypto.randomBytes(32).toString("hex")
      await redis.setex(`reset-password:${token}`, SET_PASSWORD_TTL, user.id)
      const setPasswordUrl = `${APP_URL}/resetar-senha?token=${token}`

      sendGuestWelcomeEmail(normalizedEmail, user.name, setPasswordUrl).catch(
        (err) => console.error("[guest-checkout] falha ao enviar e-mail:", err)
      )
    }

    return { ok: true, email: normalizedEmail }
  } catch (err) {
    console.error("[guest-checkout] erro:", err)
    return { ok: false, error: "Não foi possível continuar. Tente novamente." }
  }
}
