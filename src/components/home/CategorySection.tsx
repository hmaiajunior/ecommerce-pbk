import Link from "next/link"

const categories = [
  { slug: "camisetas",        label: "Camisetas",        emoji: "👕", bg: "#FFE5DC" },
  { slug: "bermudas-shorts",  label: "Bermudas",         emoji: "🩳", bg: "#E5F6F5" },
  { slug: "calcas",           label: "Calças",           emoji: "👖", bg: "#FFF3CC" },
  { slug: "conjuntos",        label: "Conjuntos",        emoji: "🎽", bg: "#EAF0FB" },
  { slug: "agasalhos-moletons", label: "Agasalhos",      emoji: "🧥", bg: "#F0EBF8" },
  { slug: "acessorios",       label: "Acessórios",       emoji: "🧢", bg: "#FFF9E5" },
]

export function CategorySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted mb-1">
            Explorar
          </p>
          <h2 className="font-black text-[28px] md:text-[36px] text-brown-dark leading-tight">
            Categorias
          </h2>
        </div>
        <Link
          href="/produtos"
          className="font-extrabold text-sm text-primary hover:underline hidden sm:block"
        >
          Ver tudo →
        </Link>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {categories.map(({ slug, label, emoji, bg }) => (
          <Link
            key={slug}
            href={`/produtos?category=${slug}`}
            className="group flex flex-col items-center gap-3 rounded-card p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_24px_rgba(61,43,31,0.10)]"
            style={{ backgroundColor: bg }}
          >
            <span className="text-4xl">{emoji}</span>
            <span className="font-extrabold text-[13px] text-brown-dark text-center leading-tight">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
