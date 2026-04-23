import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ajuda",
  description: "Dúvidas sobre frete, trocas, devoluções e tamanhos da Playbekids.",
}

const sections = [
  {
    id: "frete-e-entrega",
    title: "Frete e Entrega",
    items: [
      { q: "Quais são os prazos de entrega?", a: "O prazo varia conforme a região. Após a confirmação do pagamento, o pedido é despachado em até 2 dias úteis. O prazo de entrega é calculado no checkout com base no seu CEP." },
      { q: "Como é calculado o frete?", a: "O frete é calculado automaticamente no checkout com base no CEP de destino e no peso total do pedido, utilizando as melhores transportadoras disponíveis." },
      { q: "Há frete grátis?", a: "Condições de frete grátis podem ser aplicadas em promoções específicas. Fique de olho nos banners do site." },
      { q: "Como rastrear meu pedido?", a: "Após o envio, você receberá um e-mail com o código de rastreamento. Também é possível acompanhar em Minha conta → Meus pedidos." },
    ],
  },
  {
    id: "trocas-e-devolucoes",
    title: "Trocas e Devoluções",
    items: [
      { q: "Qual o prazo para solicitar troca ou devolução?", a: "Você tem até 7 dias corridos após o recebimento para solicitar troca ou devolução, conforme o Código de Defesa do Consumidor." },
      { q: "Como solicitar uma troca?", a: "Entre em contato pelo WhatsApp ou e-mail informando o número do pedido e o motivo da troca. Nossa equipe orientará os próximos passos." },
      { q: "O produto precisa estar em qual condição?", a: "O produto deve estar sem uso, com etiquetas originais e na embalagem original." },
      { q: "Quem paga o frete da devolução?", a: "Em caso de defeito ou erro nosso, o frete de devolução é por nossa conta. Em trocas por tamanho, o frete é por conta do cliente." },
    ],
  },
  {
    id: "tabela-de-tamanhos",
    title: "Tabela de Tamanhos",
    items: [
      { q: "Como escolher o tamanho certo?", a: "Consulte a tabela abaixo. Em caso de dúvida, recomendamos escolher o tamanho maior." },
    ],
    table: [
      ["Tamanho", "Idade aprox.", "Altura aprox."],
      ["2",  "2 anos",   "86–92 cm"],
      ["4",  "4 anos",   "98–104 cm"],
      ["6",  "6 anos",   "110–116 cm"],
      ["8",  "8 anos",   "122–128 cm"],
      ["10", "10 anos",  "134–140 cm"],
      ["12", "12 anos",  "146–152 cm"],
      ["14", "14 anos",  "158–164 cm"],
      ["16", "16 anos",  "164–170 cm"],
    ],
  },
  {
    id: "fale-conosco",
    title: "Fale Conosco",
    items: [
      { q: "WhatsApp", a: "Atendimento de segunda a sexta, das 9h às 18h." },
      { q: "Instagram", a: "@playbekids2 — responderemos no direct." },
      { q: "E-mail", a: "contato@playbekids.com.br" },
    ],
  },
]

export default function AjudaPage() {
  return (
    <main className="min-h-screen bg-bg-cream">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-3xl font-black text-brown-dark mb-2">Central de Ajuda</h1>
        <p className="text-brown-muted font-semibold mb-10">Encontre respostas para as dúvidas mais comuns.</p>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-xl font-black text-brown-dark mb-4 pb-2 border-b border-bg-nude">
                {section.title}
              </h2>

              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.q} className="bg-white rounded-card p-5 shadow-card">
                    <p className="font-black text-brown-dark mb-1">{item.q}</p>
                    <p className="text-sm font-semibold text-brown-mid">{item.a}</p>
                  </div>
                ))}
              </div>

              {section.table && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm bg-white rounded-card shadow-card overflow-hidden">
                    <thead>
                      <tr className="bg-bg-blush">
                        {section.table[0].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-black text-brown-dark">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.slice(1).map((row, i) => (
                        <tr key={i} className="border-t border-bg-nude">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-3 font-semibold text-brown-mid">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
