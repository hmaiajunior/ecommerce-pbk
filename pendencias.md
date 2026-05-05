# Pendências — O que precisa ser providenciado para o site funcionar 100%

---

## 1. Variáveis de Ambiente (`.env`)

Copie `.env.example` para `.env` e preencha cada item abaixo.

### Obrigatórias para o ambiente subir

| Variável | Como obter | Observação |
|---|---|---|
| `AUTH_SECRET` | Rodar `openssl rand -base64 32` no terminal | Mínimo 32 caracteres aleatórios |
| `DATABASE_URL` | Já preenchida para Docker local | Alterar para produção |
| `REDIS_URL` | Já preenchida para Docker local | Alterar para produção |

### InfinitePay

| Variável | Como obter | Observação |
|---|---|---|
| `INFINITEPAY_ACCESS_TOKEN` | [infinitepay.io](https://infinitepay.io) → Painel → Integrações → API | Usar token de sandbox para testes |
| `INFINITEPAY_WEBHOOK_SECRET` | Painel InfinitePay → Webhooks → criar webhook apontando para `https://seu-dominio.com/api/webhook/infinitepay` | Gerado ao configurar o webhook |

> **Ação necessária no painel do InfinitePay:**
> Configurar o webhook com a URL da aplicação e selecionar o evento de pagamento. O secret gerado deve ser colocado em `INFINITEPAY_WEBHOOK_SECRET`.

### Melhor Envio

| Variável | Como obter | Observação |
|---|---|---|
| `MELHOR_ENVIO_TOKEN` | [melhorenvio.com.br](https://melhorenvio.com.br) → Minha conta → Tokens | Criar um token com permissão de cotação |
| `MELHOR_ENVIO_SANDBOX` | `"true"` para testes, `"false"` para produção | — |
| `STORE_ZIP` | CEP do endereço físico da loja | Apenas dígitos, ex: `"01310100"` |

### Resend (e-mail transacional)

| Variável | Como obter | Observação |
|---|---|---|
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys → Create API Key | Plano gratuito: 3.000 e-mails/mês |
| `EMAIL_FROM` | Domínio verificado no Resend | Ex: `noreply@playbekids.com.br` — o domínio precisa ser verificado |

> **Ação necessária no Resend:**
> Adicionar e verificar o domínio do e-mail em Resend → Domains → Add Domain. Isso exige acesso ao DNS do domínio para adicionar registros SPF/DKIM.

### Cloudflare R2 (imagens de produto — necessário na Fase 6/Admin)

| Variável | Como obter | Observação |
|---|---|---|
| `R2_ACCOUNT_ID` | Painel Cloudflare → R2 → Overview | — |
| `R2_ACCESS_KEY_ID` | Cloudflare → R2 → Manage R2 API Tokens | Criar token com permissão de leitura/escrita |
| `R2_SECRET_ACCESS_KEY` | Mesmo local acima | Gerado junto com o Access Key ID |
| `R2_BUCKET_NAME` | Nome do bucket criado no R2 | Ex: `playbekids` |
| `R2_PUBLIC_URL` | URL pública do bucket | Configurar domínio personalizado em R2 → Settings → Custom Domain |

### App

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (local) ou `https://seu-dominio.com` (produção) |

---

## 2. Decisões de Negócio Pendentes

Estas definições impactam diretamente o código. Precisam ser confirmadas antes de ir para produção.

### Pagamento e parcelamento

- [ ] **Número máximo de parcelas para varejo** (ex: 6x, 10x, 12x)
- [ ] **Número máximo de parcelas para atacado**
- [ ] **Parcelamento sem juros até quantas vezes?** (a loja absorve o custo)
- [ ] **Valor mínimo de parcela** (recomendado: R$ 20,00)
- [ ] **Aceitar débito?** (Mercado Pago suporta, mas requer configuração específica)

### Atacado

- [ ] **Quantidade mínima por pedido atacado** — por peça, por produto ou por valor total?
- [ ] **O cliente atacado pode combinar produtos diferentes?** (ex: 3 camisetas + 3 bermudas = pedido mínimo de 6)
- [ ] **Tabela de preços por volume?** (ex: acima de 50 peças, desconto adicional)

### Frete

- [ ] **Frete grátis?** Se sim, a partir de qual valor de pedido?
- [ ] **Quais transportadoras aceitar?** O Melhor Envio agrega várias — definir quais exibir no checkout
- [ ] **Prazo de manuseio (dias corridos da venda ao despacho)?** Necessário para cálculo correto de prazo

### Pedidos e devoluções

- [ ] **Política de devolução / troca** — prazo e condições
- [ ] **O site vai ter troca de tamanho?** Fluxo de logística reversa
- [ ] **Cancelamento pelo cliente?** Até quando o pedido pode ser cancelado?

---

## 3. Infraestrutura e Deploy

### Para testar localmente (já funciona)
- [x] Docker instalado na máquina

### Para produção

| Item | Serviço sugerido | Ação necessária |
|---|---|---|
| **Hospedagem da aplicação** | Vercel | ✅ Configurado |
| **Banco de dados PostgreSQL** | Supabase | ✅ Configurado |
| **Redis** | Upstash | ✅ Configurado |
| **Domínio** | Registro.br ou similar | ✅ www.playbekids.com.br ativo |
| **CDN / Proteção** | Cloudflare (gratuito) | ✅ R2 configurado |

> **Atenção:** Configure o Cloudflare como proxy entre o domínio e a Vercel. Isso ativa o cache de assets gratuitamente e protege contra DDoS.

---

## 4. Git e Repositório

- [x] Criar repositório no GitHub
- [x] Fazer o primeiro commit
- [x] Conectar repositório à Vercel para deploy automático

---

## 5. Design e Identidade Visual

Itens bloqueadores para o frontend (aguardando Claude Design):

- [x] **Logo** da Playbekids (formato SVG + PNG)
- [x] **Paleta de cores** — cor primária, secundária e tons neutros
- [x] **Tipografia** — fonte(s) definidas
- [x] **Banners da home** — imagens para o carrossel principal e banners secundários
- [ ] **Fotos dos produtos** — galeria real para cada produto cadastrado

---

## 6. Conteúdo Jurídico / Compliance (LGPD)

- [ ] **Política de Privacidade** — informar quais dados são coletados e por quê
- [ ] **Termos de Uso** — condições de compra, responsabilidades
- [ ] **Política de Troca e Devolução** — prazo (mínimo 7 dias por lei — CDC)
- [ ] **Aviso de cookies** — banner de consentimento (LGPD)
- [ ] **CNPJ da empresa** — exibir no rodapé (obrigatório para e-commerce no Brasil)

---

## 7. Contas e Cadastros a Criar

Lista de todas as contas em serviços externos que precisam existir antes do go-live:

| Serviço | URL | Para quê |
|---|---|---|
| InfinitePay | infinitepay.io | Pagamentos |
| Melhor Envio | melhorenvio.com.br | Cálculo de frete |
| Resend | resend.com | E-mails transacionais |
| Cloudflare | cloudflare.com | CDN + R2 (imagens) |
| Vercel | vercel.com | Deploy da aplicação |
| Supabase ou Railway | supabase.com / railway.app | Banco de dados em produção |
| Upstash | upstash.com | Redis em produção |

---

## 8. Testes Antes do Go-Live

- [ ] Testar pagamento Pix em sandbox do InfinitePay
- [ ] Testar pagamento cartão (aprovado e recusado) em sandbox
- [ ] Testar boleto em sandbox
- [ ] Confirmar que o webhook do InfinitePay atualiza o status do pedido corretamente
- [ ] Testar cálculo de frete com CEPs reais
- [ ] Testar fluxo completo: cadastro → login → produto → carrinho → checkout → pagamento → e-mail
- [ ] Testar aprovação manual de conta atacado pelo admin
- [ ] Verificar que preços de atacado não aparecem para visitantes ou clientes varejo
- [ ] Testar em dispositivo mobile (iOS e Android)
