"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ─── Schemas ──────────────────────────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual obrigatória"),
    newPassword: z.string().min(8, "Nova senha deve ter ao menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

// ─── Actions ──────────────────────────────────────────────────────────────────

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string }

export async function changePassword(
  input: z.infer<typeof changePasswordSchema>
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado." }
  }

  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user?.password) {
    return { success: false, error: "Conta sem senha definida." }
  }

  const isValid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.password
  )
  if (!isValid) {
    return { success: false, error: "Senha atual incorreta." }
  }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  })

  return { success: true, message: "Senha alterada com sucesso." }
}
