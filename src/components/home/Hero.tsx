import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-bg-cream min-h-[480px] flex items-center px-4 md:px-16 py-16">
      {/* Blobs decorativos */}
      <div className="pbk-blob w-[500px] h-[500px] bg-primary opacity-10 -top-40 -left-36" />
      <div className="pbk-blob w-[400px] h-[400px] bg-accent opacity-[0.14] -bottom-36 left-72" />
      <div className="pbk-blob w-[280px] h-[280px] bg-secondary opacity-[0.12] top-16 right-96" />

      {/* Dots */}
      <div className="absolute w-3.5 h-3.5 rounded-full bg-primary opacity-25 top-20 left-80" />
      <div className="absolute w-2.5 h-2.5 rounded-full bg-accent opacity-45 top-48 left-[580px]" />
      <div className="absolute w-4 h-4 rounded-full bg-secondary opacity-25 bottom-20 right-[440px]" />

      {/* Conteúdo */}
      <div className="relative z-10 max-w-[560px]">
        <Badge variant="yellow" size="lg" className="mb-5">
          Nova Coleção 2026 🌟
        </Badge>

        <h1 className="font-black text-[clamp(36px,6vw,56px)] leading-[1.1] text-brown-dark mb-4">
          Moda para os<br />
          <span className="text-primary">pequenos aventureiros</span>
        </h1>

        <p className="font-semibold text-[18px] text-brown-mid leading-relaxed mb-8">
          Roupas infantis masculinas com estilo e qualidade.<br />
          Atacado e varejo para todo o Brasil.
        </p>

        <div className="flex gap-4 flex-wrap">
          <Link href="/produtos">
            <Button size="lg">Ver coleção</Button>
          </Link>
          <Link href="/atacado">
            <Button variant="secondary" size="lg">Quero revender</Button>
          </Link>
        </div>
      </div>

      {/* Círculo decorativo direita */}
      <div className="hidden lg:flex absolute right-16 top-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-bg-blush shadow-[0_8px_40px_rgba(61,43,31,0.12)] items-center justify-center overflow-hidden">
        <span className="text-[120px] opacity-55">👕</span>
      </div>
    </section>
  )
}
