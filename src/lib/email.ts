import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM ?? "noreply@playbekids.com.br"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/resetar-senha?token=${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Redefinir senha — Playbekids",
    html: `
      <p>Você solicitou a redefinição de senha da sua conta Playbekids.</p>
      <p>Clique no link abaixo para criar uma nova senha. O link expira em 1 hora.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Se você não solicitou isso, ignore este e-mail.</p>
    `,
  })
}

export async function sendWholesaleApprovalEmail(email: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Conta atacado aprovada — Playbekids",
    html: `
      <p>Olá, ${name}!</p>
      <p>Sua conta de atacado foi aprovada. Você já pode acessar os preços e condições especiais.</p>
      <p><a href="${APP_URL}/login">Acessar minha conta</a></p>
    `,
  })
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderId: string
) {
  const orderUrl = `${APP_URL}/minha-conta/pedidos/${orderId}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Pedido confirmado #${orderId.slice(-8).toUpperCase()} — Playbekids`,
    html: `
      <p>Olá, ${name}!</p>
      <p>Seu pagamento foi confirmado e seu pedido está sendo processado.</p>
      <p><a href="${orderUrl}">Acompanhar pedido</a></p>
    `,
  })
}
