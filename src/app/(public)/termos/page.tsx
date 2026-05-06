import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termos de Uso — Playbekids",
}

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-8 py-12">
      <h1 className="font-black text-[32px] text-brown-dark mb-2">Termos de Uso</h1>
      <p className="text-sm text-brown-muted font-semibold mb-10">Última atualização: maio de 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-brown-mid font-semibold leading-relaxed">

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">1. Aceitação dos termos</h2>
          <p>Ao acessar ou realizar uma compra em <strong>www.playbekids.com.br</strong>, você concorda com estes Termos de Uso. Caso não concorde, não utilize o site.</p>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">2. Sobre a Playbekids</h2>
          <p><strong>Playbekids</strong>, CNPJ 35.490.656/0001-14, é uma loja de moda infantil masculina que comercializa produtos no varejo e atacado para todo o Brasil.</p>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">3. Cadastro e conta</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Você é responsável pela veracidade das informações fornecidas no cadastro.</li>
            <li>Mantenha sua senha em sigilo. A Playbekids não se responsabiliza por acessos não autorizados decorrentes de negligência do usuário.</li>
            <li>É permitido apenas um cadastro por pessoa física ou jurídica.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">4. Pedidos e pagamento</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Os preços exibidos são em reais (BRL) e incluem os impostos aplicáveis.</li>
            <li>O pedido é confirmado somente após a aprovação do pagamento pelo gateway <strong>InfinitePay</strong>.</li>
            <li>Pedidos com pagamento não confirmado em até 30 minutos são cancelados automaticamente e o estoque é liberado.</li>
            <li>Em caso de divergência de preço por erro de sistema, entraremos em contato antes de processar o pedido.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">5. Frete e entrega</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>O prazo de entrega começa a contar após a confirmação do pagamento.</li>
            <li>Os prazos são estimados e podem variar conforme a transportadora e a região.</li>
            <li>A Playbekids não se responsabiliza por atrasos causados por greves, desastres naturais ou falhas dos Correios/transportadoras.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">6. Trocas e devoluções</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Conforme o Código de Defesa do Consumidor (Art. 49), você tem <strong>7 dias corridos</strong> após o recebimento para desistir da compra, sem necessidade de justificativa.</li>
            <li>Produtos com defeito podem ser trocados em até <strong>30 dias</strong> (produtos não duráveis) ou <strong>90 dias</strong> (produtos duráveis).</li>
            <li>Para iniciar uma troca ou devolução, entre em contato pelo Instagram <strong>@playbekids</strong>.</li>
            <li>O produto deve ser devolvido sem sinais de uso, com etiquetas originais.</li>
            <li>Em caso de defeito ou erro nosso, o frete de devolução é por nossa conta. Em trocas por tamanho, o frete é por conta do cliente.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">7. Atacado</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>O acesso aos preços de atacado é exclusivo para clientes com cadastro aprovado pela Playbekids.</li>
            <li>Pedidos de atacado possuem valor mínimo de <strong>R$ 500,00</strong>.</li>
            <li>A aprovação do cadastro atacado é feita manualmente e pode ser revogada a qualquer momento.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">8. Propriedade intelectual</h2>
          <p>Todo o conteúdo do site (textos, imagens, logotipo, layout) é de propriedade da Playbekids e protegido por direitos autorais. É proibida a reprodução sem autorização prévia.</p>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">9. Limitação de responsabilidade</h2>
          <p>A Playbekids não se responsabiliza por danos indiretos decorrentes do uso do site ou de produtos adquiridos, além dos limites previstos no Código de Defesa do Consumidor.</p>
        </section>

        <section>
          <h2 className="font-black text-lg text-brown-dark mb-3">10. Foro</h2>
          <p>Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca do domicílio do consumidor para resolução de conflitos, conforme o CDC.</p>
        </section>

      </div>
    </div>
  )
}
