# Arquitetura — Playbekids

## Stack

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Renderização híbrida SSG/ISR/SSR na mesma base de código, otimização de imagem nativa, edge middleware |
| Estilização | **Tailwind CSS** | Zero runtime CSS, tree-shaking automático, mobile-first |
| Componentes | **shadcn/ui** (Radix UI) | Código copiado para o projeto — sem overhead de bundle externo, acessível |
| Estado cliente | **Zustand** | ~2kb, ideal para carrinho e UI state sem boilerplate |
| Cache/fetch | **TanStack Query** | Cache inteligente no cliente, deduplicação de requests, revalidação em background |
| ORM | **Prisma** | Type-safe, migrations versionadas, compatível com PostgreSQL |
| Banco de dados | **PostgreSQL** | Relacional, transações ACID para pedidos e estoque |
| Cache server | **Redis (Upstash)** | Serverless-friendly, cache de catálogo, sessões e rate limiting |
| Auth | **Auth.js v5** | JWT + sessão, múltiplos roles, integração nativa com Next.js App Router |
| Storage | **Cloudflare R2** | Armazenamento de imagens sem custo de egress |
| CDN | **Cloudflare** | Cache de assets, proteção DDoS, entrega próxima ao usuário no Brasil |
| E-mail | **Resend** | API simples, templates com react-email, entrega confiável |
| Pagamento | **Mercado Pago SDK** | Amplamente adotado no Brasil, suporte a cartão/Pix/boleto, sem mensalidade |
| Frete | **Melhor Envio API** | Agrega Correios e transportadoras, REST simples |
| Deploy | **Vercel** | Deploy zero-config para Next.js, edge network global, preview por branch |

---

## Estratégia de Renderização por Página

Ponto central para velocidade — cada tipo de página usa a estratégia que equilibra frescor de dados e performance:

| Página | Estratégia | Revalidação |
|---|---|---|
| Home | ISR | 10 min |
| Catálogo de produtos | ISR | 5 min |
| Página de produto | ISR | 5 min |
| Páginas de categoria | SSG (build time) | — |
| Checkout | SSR (autenticado) | — |
| Carrinho | Client-side (Zustand) | — |
| Área do cliente | SSR (autenticado) | — |
| Painel admin | SSR (autenticado) | — |

Páginas públicas (home, catálogo, produto) chegam ao usuário como HTML estático cacheado na borda, sem aguardar o banco de dados.

---

## Diagrama de Camadas

```
┌────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                       │
│  Next.js App Router · Zustand (carrinho) · TanStack Query      │
└────────────────────────┬───────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼───────────────────────────────────────┐
│                    EDGE / CDN (Cloudflare)                      │
│  Cache de assets estáticos · Imagens (R2) · DDoS protection    │
│  Next.js Edge Middleware → verifica cookie de sessão           │
│  (redireciona /admin e /checkout sem bater no origin)          │
└────────────────────────┬───────────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────────┐
│                   VERCEL (Origin / Serverless)                  │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ Route Pages │  │  API Routes  │  │  Server Actions    │    │
│  │ (ISR / SSR) │  │  /api/*      │  │  (form mutations)  │    │
│  └─────────────┘  └──────┬───────┘  └────────┬───────────┘    │
└─────────────────────────┬┴───────────────────┬┴────────────────┘
                          │                    │
         ┌────────────────▼──┐    ┌────────────▼────────────┐
         │  Redis (Upstash)  │    │  PostgreSQL (Supabase   │
         │                   │    │  ou Railway)            │
         │ · Cache catálogo  │    │                         │
         │ · Cache preço     │    │ · Produtos / Estoque    │
         │   atacado         │    │ · Clientes / Pedidos    │
         │ · Sessões         │    │ · Roles (varejo/atacado)│
         │ · Rate limiting   │    │ · Transações            │
         └───────────────────┘    └─────────────────────────┘
                                           │
                          ┌────────────────▼────────────────┐
                          │        SERVIÇOS EXTERNOS        │
                          │                                 │
                          │  Mercado Pago  ·  Melhor Envio  │
                          │  Resend (e-mail) · ViaCEP       │
                          └─────────────────────────────────┘
```

---

## Fluxo de Cache em Camadas

Sequência de resolução para uma página de produto pública:

```
Requisição do usuário
        │
        ▼
[1] Cloudflare CDN ──── hit? ──→ responde em ~10ms
        │ miss
        ▼
[2] Vercel ISR cache ── hit? ──→ responde em ~50ms
        │ miss
        ▼
[3] Redis ───────────── hit? ──→ renderiza em ~80ms
        │ miss
        ▼
[4] PostgreSQL ──────────────→ busca dados ~200ms
                               → armazena no Redis
                               → salva no ISR cache
                               → responde ao usuário
```

Na prática, 95%+ das visitas são resolvidas nas camadas [1] ou [2].

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (public)/               # layout sem autenticação
│   │   ├── page.tsx            # Home (ISR)
│   │   ├── produtos/           # Catálogo (ISR)
│   │   └── produto/[slug]/     # Página de produto (ISR)
│   ├── (auth)/                 # layout com sessão obrigatória
│   │   ├── carrinho/
│   │   ├── checkout/
│   │   └── minha-conta/
│   ├── admin/                  # layout com guard de role admin
│   └── api/
│       ├── webhook/mercadopago/
│       └── frete/calcular/
├── components/
│   ├── ui/                     # shadcn/ui base
│   └── shop/                   # componentes de domínio (produto, carrinho, etc.)
├── lib/
│   ├── prisma.ts               # cliente Prisma singleton
│   ├── redis.ts                # cliente Upstash
│   ├── auth.ts                 # config Auth.js
│   └── mercadopago.ts          # config SDK Mercado Pago
└── actions/                    # Server Actions (mutations de formulário)
    ├── cart.ts
    ├── checkout.ts
    └── orders.ts
```

---

## Decisões de Arquitetura para Velocidade

### Preço de atacado via Redis
Ao logar, o preço atacadista é carregado uma vez e cacheado no Redis com TTL de 1h. Páginas de produto ISR não precisam de join no banco para cada visitante autenticado.

### Carrinho 100% client-side
O Zustand persiste o carrinho no `localStorage`. Sem round-trip ao servidor a cada alteração de quantidade — o carrinho só valida com o servidor no checkout.

### Edge Middleware para autenticação
A verificação de sessão ocorre no edge (Cloudflare/Vercel), antes de chegar ao origin. Usuário não autenticado tentando acessar `/admin` é redirecionado sem consumir uma serverless function.

### Imagens via R2 + Next.js Image loader
O Next.js Image com loader customizado apontando para R2 entrega WebP/AVIF no tamanho exato do viewport. O processamento de imagem não consome CPU do servidor de aplicação.

---

## Segurança

| Ponto | Medida |
|---|---|
| Autenticação | JWT com refresh token rotativo, cookie HttpOnly + SameSite=Strict |
| Autorização | Role validado server-side a cada request (nunca só no frontend) |
| Dados de cartão | Tokenização 100% via SDK Mercado Pago no cliente — servidor nunca recebe dados em texto claro |
| Webhooks | Validação de assinatura HMAC antes de atualizar status de pedido |
| Rate limiting | Upstash Redis no edge — login, cadastro e recuperação de senha |
| Headers HTTP | CSP, X-Frame-Options, X-Content-Type-Options, HSTS via `next.config.js` |
| Uploads (admin) | Validação de MIME type real + armazenamento no R2, fora do webroot |
| Secrets | Exclusivamente em variáveis de ambiente, nunca no código |
| Logs de auditoria | Ações sensíveis no admin registradas (aprovar atacado, cancelar pedido, alterar preço) |

---

## Custos Estimados (early stage)

| Serviço | Plano Inicial | Custo |
|---|---|---|
| Vercel | Hobby → Pro | Grátis → $20/mês |
| Supabase (PostgreSQL) | Free tier | Grátis → $25/mês |
| Upstash (Redis) | Free tier | Grátis → ~$0.2/100k comandos |
| Cloudflare CDN + R2 | Free tier | Grátis para volume inicial |
| Resend (e-mail) | Free 3k/mês | Grátis → $20/mês |
| Mercado Pago | Por transação | % sobre venda |

---

## Próximos Passos

- [ ] Schema Prisma (modelos: User, Product, Order, Category, Address)
- [ ] Rotas de API (produtos, carrinho, checkout, webhook Mercado Pago)
- [ ] Configuração de Auth.js com roles (visitante, varejo, atacado, admin)
- [ ] Setup do projeto Next.js com Tailwind + shadcn/ui
- [ ] Definição de identidade visual (cores, logo)
