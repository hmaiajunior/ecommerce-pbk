import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // ─── Faixas etárias ────────────────────────────────────────────
  const ageRanges = await Promise.all([
    prisma.ageRange.upsert({
      where: { id: "age-bebe" },
      update: {},
      create: { id: "age-bebe", name: "Bebê", minAge: 0, maxAge: 2 },
    }),
    prisma.ageRange.upsert({
      where: { id: "age-infantil" },
      update: {},
      create: { id: "age-infantil", name: "Infantil", minAge: 2, maxAge: 8 },
    }),
    prisma.ageRange.upsert({
      where: { id: "age-juvenil" },
      update: {},
      create: { id: "age-juvenil", name: "Juvenil", minAge: 8, maxAge: 16 },
    }),
  ])

  // ─── Categorias ────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "camisetas" },
      update: {},
      create: { id: "cat-camisetas", name: "Camisetas", slug: "camisetas" },
    }),
    prisma.category.upsert({
      where: { slug: "bermudas-shorts" },
      update: {},
      create: { id: "cat-bermudas", name: "Bermudas e Shorts", slug: "bermudas-shorts" },
    }),
    prisma.category.upsert({
      where: { slug: "calcas" },
      update: {},
      create: { id: "cat-calcas", name: "Calças", slug: "calcas" },
    }),
    prisma.category.upsert({
      where: { slug: "conjuntos" },
      update: {},
      create: { id: "cat-conjuntos", name: "Conjuntos", slug: "conjuntos" },
    }),
    prisma.category.upsert({
      where: { slug: "agasalhos-moletons" },
      update: {},
      create: { id: "cat-agasalhos", name: "Agasalhos e Moletons", slug: "agasalhos-moletons" },
    }),
    prisma.category.upsert({
      where: { slug: "acessorios" },
      update: {},
      create: { id: "cat-acessorios", name: "Acessórios", slug: "acessorios" },
    }),
  ])

  // ─── Produtos de exemplo ───────────────────────────────────────
  const products = [
    {
      id: "prod-camiseta-dino",
      name: "Camiseta Dino Explorer",
      slug: "camiseta-dino-explorer",
      description: "Camiseta manga curta com estampa de dinossauro. Tecido 100% algodão, macio e respirável.",
      fabric: "100% Algodão",
      retailPrice: 49.9,
      wholesalePrice: 28.0,
      wholesaleMinQty: 6,
      featured: true,
      categoryId: "cat-camisetas",
      ageRangeId: "age-infantil",
      sizes: ["2", "4", "6", "8"],
    },
    {
      id: "prod-bermuda-surf",
      name: "Bermuda Surf Wave",
      slug: "bermuda-surf-wave",
      description: "Bermuda estilo surf com cós elástico e bolsos laterais. Ideal para o verão.",
      fabric: "96% Poliéster, 4% Elastano",
      retailPrice: 59.9,
      wholesalePrice: 34.0,
      wholesaleMinQty: 6,
      featured: true,
      categoryId: "cat-bermudas",
      ageRangeId: "age-infantil",
      sizes: ["2", "4", "6", "8"],
    },
    {
      id: "prod-conjunto-sport",
      name: "Conjunto Sport Urbano",
      slug: "conjunto-sport-urbano",
      description: "Conjunto camiseta + bermuda em moletom leve. Perfeito para o dia a dia e atividades esportivas.",
      fabric: "70% Algodão, 30% Poliéster",
      retailPrice: 99.9,
      wholesalePrice: 58.0,
      wholesaleMinQty: 4,
      featured: true,
      categoryId: "cat-conjuntos",
      ageRangeId: "age-infantil",
      sizes: ["4", "6", "8", "10"],
    },
    {
      id: "prod-moletom-shark",
      name: "Moletom Shark Hood",
      slug: "moletom-shark-hood",
      description: "Moletom com capuz estampado em tubarão. Tecido macio por dentro, ideal para dias frescos.",
      fabric: "80% Algodão, 20% Poliéster",
      retailPrice: 89.9,
      wholesalePrice: 52.0,
      wholesaleMinQty: 4,
      featured: false,
      categoryId: "cat-agasalhos",
      ageRangeId: "age-juvenil",
      sizes: ["8", "10", "12", "14", "16"],
    },
    {
      id: "prod-calca-jogger",
      name: "Calça Jogger Flex",
      slug: "calca-jogger-flex",
      description: "Calça jogger com punhos na barra e cós elástico com cordão. Conforto total.",
      fabric: "67% Algodão, 33% Poliéster",
      retailPrice: 69.9,
      wholesalePrice: 40.0,
      wholesaleMinQty: 6,
      featured: false,
      categoryId: "cat-calcas",
      ageRangeId: "age-juvenil",
      sizes: ["8", "10", "12", "14", "16"],
    },
  ]

  for (const product of products) {
    const { sizes, ...data } = product
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        ...data,
        retailPrice: data.retailPrice,
        wholesalePrice: data.wholesalePrice,
        sizes: {
          create: sizes.map((size) => ({
            size,
            stock: Math.floor(Math.random() * 20) + 5,
          })),
        },
      },
    })
  }

  // ─── Usuário admin ─────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@playbekids.com.br" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@playbekids.com.br",
      password: await bcrypt.hash("admin123", 12),
      role: "ADMIN",
    },
  })

  // ─── Usuário atacado de exemplo ────────────────────────────────
  await prisma.user.upsert({
    where: { email: "atacado@exemplo.com" },
    update: {},
    create: {
      name: "Loja Exemplo Atacado",
      email: "atacado@exemplo.com",
      password: await bcrypt.hash("atacado123", 12),
      role: "WHOLESALE",
      wholesaleApproved: true,
    },
  })

  console.log("✓ Seed concluído")
  console.log(`  ${ageRanges.length} faixas etárias`)
  console.log(`  ${categories.length} categorias`)
  console.log(`  ${products.length} produtos`)
  console.log("  2 usuários (admin + atacado de exemplo)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
