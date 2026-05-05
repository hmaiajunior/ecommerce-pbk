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

export async function sendOrderCancellationEmail(
  email: string,
  name: string,
  orderId: string,
  items: { name: string; size: string; quantity: number; price: number }[]
) {
  const shortId = orderId.slice(-8).toUpperCase()
  const itemsHtml = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 0;font-size:14px;color:#6B4F42;">${i.name}</td>
          <td style="padding:6px 0;font-size:14px;color:#6B4F42;text-align:center;">Tam. ${i.size}</td>
          <td style="padding:6px 0;font-size:14px;color:#6B4F42;text-align:center;">×${i.quantity}</td>
          <td style="padding:6px 0;font-size:14px;color:#FF6B4A;text-align:right;font-weight:700;">
            ${(i.price * i.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </td>
        </tr>`
    )
    .join("")

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Pedido #${shortId} cancelado — Playbekids`,
    html: `
      <p>Olá, ${name}!</p>
      <p>Seu pedido <strong>#${shortId}</strong> foi cancelado automaticamente pois o pagamento não foi confirmado dentro do prazo de 30 minutos.</p>
      <h3 style="color:#3D2B1F;margin-top:24px;">Resumo do pedido cancelado</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:2px solid #EDE0DC;">
            <th style="text-align:left;padding:6px 0;font-size:12px;color:#9A7B70;text-transform:uppercase;">Produto</th>
            <th style="text-align:center;padding:6px 0;font-size:12px;color:#9A7B70;text-transform:uppercase;">Tamanho</th>
            <th style="text-align:center;padding:6px 0;font-size:12px;color:#9A7B70;text-transform:uppercase;">Qtd</th>
            <th style="text-align:right;padding:6px 0;font-size:12px;color:#9A7B70;text-transform:uppercase;">Valor</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="margin-top:24px;">Você pode realizar um novo pedido a qualquer momento acessando nossa loja:</p>
      <p><a href="${APP_URL}/produtos" style="color:#FF6B4A;font-weight:700;">Voltar para a loja →</a></p>
      <p style="color:#9A7B70;font-size:12px;">Se tiver dúvidas, entre em contato pelo Instagram @playbekids.</p>
    `,
  })
}

export async function sendAbandonedCartEmail(
  email: string,
  name: string,
  items: { name: string; size: string; quantity: number; price: number; imageUrl: string | null; slug: string }[],
  subtotal: number
) {
  const subtotalFormatted = subtotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

  const itemsHtml = items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 0;width:64px;vertical-align:top;">
          ${
            i.imageUrl
              ? `<img src="${i.imageUrl}" width="56" height="56" style="border-radius:8px;object-fit:cover;display:block;" alt="" />`
              : `<div style="width:56px;height:56px;border-radius:8px;background:#FBE6DF;"></div>`
          }
        </td>
        <td style="padding:12px 0 12px 12px;vertical-align:top;">
          <p style="margin:0;font-size:14px;color:#3D2B1F;font-weight:700;">${i.name}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#9A7B70;">Tam. ${i.size} · ×${i.quantity}</p>
        </td>
        <td style="padding:12px 0;vertical-align:top;text-align:right;">
          <p style="margin:0;font-size:14px;color:#FF6B4A;font-weight:800;">
            ${(i.price * i.quantity).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </td>
      </tr>`
    )
    .join("")

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Você esqueceu algo lindo no carrinho 💛",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FFF8F3;padding:32px 24px;color:#3D2B1F;">
        <h2 style="margin:0 0 8px;color:#3D2B1F;">Olá, ${name}!</h2>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#6B4F42;">
          Você deixou itens incríveis no seu carrinho. Garante o seu antes que acabe — temos estoque limitado!
        </p>

        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;padding:8px 16px;">
          <tbody>${itemsHtml}</tbody>
        </table>

        <table style="width:100%;margin-top:16px;border-top:2px solid #EDE0DC;padding-top:12px;">
          <tr>
            <td style="font-size:14px;color:#9A7B70;font-weight:700;">Subtotal</td>
            <td style="font-size:18px;color:#FF6B4A;font-weight:800;text-align:right;">${subtotalFormatted}</td>
          </tr>
        </table>

        <div style="text-align:center;margin:32px 0 8px;">
          <a href="${APP_URL}/carrinho"
             style="display:inline-block;background:#FF6B4A;color:#fff;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:15px;">
            Voltar para o carrinho →
          </a>
        </div>

        <p style="margin:24px 0 0;font-size:12px;color:#9A7B70;text-align:center;line-height:1.5;">
          Se tiver dúvidas, fale com a gente no Instagram <strong>@playbekids</strong>.<br/>
          Você está recebendo este e-mail porque iniciou uma compra na Playbekids.
        </p>
      </div>
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
