import Image from "next/image"
import Link from "next/link"

const loja = ["Camisetas", "Bermudas e Shorts", "Conjuntos", "Agasalhos", "Acessórios"]
const atacado = ["Como funciona", "Tabela de preços", "Mínimo por peça", "Cadastro de revendedor"]
const ajuda = [
  { label: "Frete e Entrega",      href: "/ajuda#frete-e-entrega" },
  { label: "Trocas e Devoluções",  href: "/ajuda#trocas-e-devolucoes" },
  { label: "Tabela de tamanhos",   href: "/ajuda#tabela-de-tamanhos" },
  { label: "Fale conosco",         href: "/ajuda#fale-conosco" },
]

export function Footer() {
  return (
    <footer className="bg-brown-dark text-white mt-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8 pt-12 pb-8">

        {/* Topo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">

          {/* Marca */}
          <div className="col-span-2 md:col-span-1">
            <div className="w-[52px] h-[52px] rounded-full overflow-hidden bg-bg-blush shadow-[0_4px_14px_rgba(0,0,0,0.22)] mb-3">
              <Image
                src="/logo.jpeg"
                alt="Playbekids"
                width={52}
                height={52}
                className="object-cover object-[50%_38%] w-full h-full"
              />
            </div>
            <p className="font-black text-[22px] mb-1">Playbekids</p>
            <p className="font-semibold text-sm text-brown-muted leading-relaxed">
              Moda infantil masculina<br />para os pequenos aventureiros.
            </p>
            <div className="mt-4">
              <a
                href="https://instagram.com/playbekids2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-primary text-white font-extrabold text-sm px-4 py-1.5 rounded-pill hover:bg-primary-hover transition-colors"
              >
                @playbekids2
              </a>
            </div>
          </div>

          {/* Loja */}
          <div>
            <p className="font-black text-[13px] uppercase tracking-[0.08em] text-accent mb-4">Loja</p>
            <ul className="space-y-2">
              {loja.map((l) => (
                <li key={l}>
                  <Link href={`/produtos?category=${l.toLowerCase().replace(/\s/g, "-")}`}
                    className="font-semibold text-sm text-bg-nude hover:text-white transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Atacado */}
          <div>
            <p className="font-black text-[13px] uppercase tracking-[0.08em] text-accent mb-4">Atacado</p>
            <ul className="space-y-2">
              {atacado.map((l) => (
                <li key={l}>
                  <Link href="/atacado" className="font-semibold text-sm text-bg-nude hover:text-white transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <p className="font-black text-[13px] uppercase tracking-[0.08em] text-accent mb-4">Ajuda</p>
            <ul className="space-y-2">
              {ajuda.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="font-semibold text-sm text-bg-nude hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-5" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-semibold text-[13px] text-brown-muted">
            © {new Date().getFullYear()} Playbekids. Todos os direitos reservados.
          </p>
          <p className="font-extrabold text-[13px] text-secondary">
            Instagram: @playbekids2
          </p>
        </div>
      </div>
    </footer>
  )
}
