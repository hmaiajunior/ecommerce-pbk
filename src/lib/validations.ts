import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  role: z.enum(["RETAIL", "WHOLESALE"]).default("RETAIL"),
  cnpj: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
