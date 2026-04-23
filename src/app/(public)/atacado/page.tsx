import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Atacado",
  description: "Seja um revendedor Playbekids. Acesse preços exclusivos de atacado para lojistas e revendedores.",
}

const beneficios = [
  { titulo: "Preços exclusivos", desc: "Tabela de preços diferenciada para revendedores cadastrados." },
  { titulo: "Variedade de produtos", desc: "Acesso a todo o catálogo com grades completas por tamanho." },
  { titulo: "Entrega para todo o Brasil", desc: "Frete calculado por CEP com as melhores transportadoras." },
  { titulo: "Suporte dedicado", desc: "Atendimento via WhatsApp para tirar dúvidas e acompanhar pedidos." },
]

export default function AtacadoPage() {
  return (
    <main className="min-h-screen bg-bg-cream">
      {/* Hero */}
      <section className="bg-primary text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-black mb-4">Seja um Revendedor Playbekids</h1>
        <p className="text-lg font-semibold opacity-90 max-w-xl mx-auto mb-8">
          Acesse preços de atacado, grades completas e condições especiais para lojistas e revendedores.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/cadastro"
            className="bg-white text-primary font-black px-8 py-3 rounded-pill hover:bg-accent hover:text-brown-dark transition-colors"
          >
            Quero me cadastrar
          </Link>
          <Link
            href="/login"
            className="border-2 border-white text-white font-black px-8 py-3 rounded-pill hover:bg-white hover:text-primary transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Benefícios */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-brown-dark text-center mb-10">Por que revender Playbekids?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {beneficios.map((b) => (
            <div key={b.titulo} className="bg-white rounded-card p-6 shadow-card">
              <h3 className="font-black text-brown-dark mb-2">{b.titulo}</h3>
              <p className="text-sm text-brown-mid font-semibold">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-bg-blush py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-brown-dark text-center mb-10">Como funciona</h2>
          <ol className="space-y-6">
            {[
              { n: "1", t: "Crie sua conta", d: "Cadastre-se como revendedor informando CNPJ ou CPF." },
              { n: "2", t: "Aguarde a aprovação", d: "Nossa equipe analisa o cadastro em até 2 dias úteis." },
              { n: "3", t: "Acesse os preços", d: "Com a conta aprovada, visualize os preços de atacado em todo o catálogo." },
              { n: "4", t: "Faça seus pedidos", d: "Compre online com frete calculado e pagamento facilitado." },
            ].map((step) => (
              <li key={step.n} className="flex gap-4 items-start">
                <span className="w-10 h-10 rounded-circle bg-primary text-white font-black flex items-center justify-center shrink-0">
                  {step.n}
                </span>
                <div>
                  <p className="font-black text-brown-dark">{step.t}</p>
                  <p className="text-sm text-brown-mid font-semibold">{step.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-4 text-center">
        <p className="text-brown-mid font-semibold mb-6">Pronto para começar?</p>
        <Link
          href="/cadastro"
          className="bg-primary text-white font-black px-10 py-4 rounded-pill hover:bg-primary-hover transition-colors shadow-coral"
        >
          Criar conta de revendedor
        </Link>
      </section>
    </main>
  )
}
