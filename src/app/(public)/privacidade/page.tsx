import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidade — Playbekids",
}

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-12">
      <h1 className="font-black text-[32px] text-brown-dark mb-2">Política de Privacidade</h1>
      <p className="text-sm text-brown-muted font-semibold mb-10">Última atualização: maio de 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-brown-mid font-semibold leading-relaxed">

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">1. Quem somos</h2>
          <p>A <strong>Playbekids</strong>, inscrita no CNPJ 35.490.656/0001-14, é responsável pelo tratamento dos dados pessoais coletados neste site (<strong>www.playbekids.com.br</strong>), nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).</p>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">2. Dados que coletamos</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Dados de cadastro:</strong> nome, e-mail e senha (armazenada de forma criptografada).</li>
            <li><strong>Dados de entrega:</strong> endereço completo e CEP informados no checkout.</li>
            <li><strong>Dados de navegação:</strong> cookies de sessão necessários para o funcionamento do site.</li>
            <li><strong>Dados de pedido:</strong> itens comprados, valor, forma de pagamento e status.</li>
          </ul>
          <p className="mt-3">Não armazenamos dados de cartão de crédito. O pagamento é processado diretamente pela <strong>InfinitePay</strong>, em ambiente seguro.</p>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">3. Como usamos seus dados</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Processar e entregar seus pedidos.</li>
            <li>Enviar e-mails transacionais (confirmação de pedido, recuperação de senha).</li>
            <li>Manter sua conta ativa e segura.</li>
            <li>Cumprir obrigações legais e fiscais.</li>
          </ul>
          <p className="mt-3">Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins de marketing.</p>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">4. Compartilhamento de dados</h2>
          <p>Seus dados podem ser compartilhados apenas com:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>InfinitePay</strong> — processamento de pagamento.</li>
            <li><strong>Melhor Envio / transportadoras</strong> — cálculo e entrega do frete.</li>
            <li><strong>Resend</strong> — envio de e-mails transacionais.</li>
          </ul>
          <p className="mt-3">Todos os parceiros operam sob suas próprias políticas de privacidade e são contratualmente obrigados a proteger seus dados.</p>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">5. Cookies</h2>
          <p>Utilizamos cookies estritamente necessários para:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Manter sua sessão autenticada.</li>
            <li>Armazenar o conteúdo do seu carrinho.</li>
          </ul>
          <p className="mt-3">Não utilizamos cookies de rastreamento ou publicidade.</p>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">6. Seus direitos (LGPD)</h2>
          <p>Você tem direito a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Confirmar a existência de tratamento dos seus dados.</li>
            <li>Acessar, corrigir ou excluir seus dados.</li>
            <li>Revogar o consentimento a qualquer momento.</li>
            <li>Solicitar a portabilidade dos seus dados.</li>
          </ul>
          <p className="mt-3">Para exercer seus direitos, entre em contato pelo Instagram <strong>@playbekids</strong>.</p>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">7. Retenção de dados</h2>
          <p>Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política e obrigações legais (mínimo de 5 anos para dados fiscais, conforme legislação brasileira).</p>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">8. Alterações nesta política</h2>
          <p>Podemos atualizar esta política periodicamente. A data de última atualização será sempre indicada no topo desta página.</p>
        </section>

      </div>
    </div>
  )
}
