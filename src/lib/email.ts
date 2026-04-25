import { Resend } from "resend"

const FROM = process.env.EMAIL_FROM ?? "noreply@playbekids.com.br"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/resetar-senha?token=${token}`

  await getResend().emails.send({
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
  await getResend().emails.send({
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

export async function sendGuestWelcomeEmail(
  email: string,
  name: string,
  setPasswordUrl: string
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Sua conta foi criada — Playbekids",
    html: `
      <p>Olá, ${name}!</p>
      <p>Sua compra foi iniciada e criamos uma conta para você na Playbekids.</p>
      <p>Para acessar seus pedidos e gerenciar sua conta, crie sua senha clicando no link abaixo:</p>
      <p><a href="${setPasswordUrl}">Criar minha senha</a></p>
      <p>O link expira em 24 horas. Se preferir, pode ignorar este e-mail — seu pedido será processado normalmente.</p>
    `,
  })
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderId: string
) {
  const orderUrl = `${APP_URL}/minha-conta/pedidos/${orderId}`

  await getResend().emails.send({
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
