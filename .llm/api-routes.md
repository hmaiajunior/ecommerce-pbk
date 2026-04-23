# Rotas de API e Server Actions — Playbekids

Todas as rotas vivem em `src/app/api/`. Server Actions ficam em `src/actions/`.

---

## Convenções

- Respostas de erro seguem `{ error: string, code?: string }`
- Respostas de sucesso seguem `{ data: T }`
- Rotas protegidas retornam `401` se não autenticado e `403` se sem permissão
- Paginação: query params `page` (default 1) e `limit` (default 24)

---

## Rotas Públicas

### Produtos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/products` | Lista produtos com filtros |
| GET | `/api/products/[slug]` | Produto por slug |

**GET /api/products — Query params:**
```
category    string   slug da categoria
ageRange    string   id da faixa etária
size        string   tamanho (ex: "4", "M", "GG")
minPrice    number   preço mínimo varejo
maxPrice    number   preço máximo varejo
sort        string   "featured" | "price_asc" | "price_desc" | "newest"
page        number   página atual (default 1)
limit       number   itens por página (default 24)
```

**Observação:** preço de atacado é omitido na resposta para usuários não autenticados como atacado. A verificação ocorre server-side — o campo `wholesalePrice` retorna `null` se o solicitante não for WHOLESALE aprovado.

---

### Categorias e Faixas Etárias

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/categories` | Lista todas as categorias ativas |
| GET | `/api/age-ranges` | Lista todas as faixas etárias |

---

### Frete

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/frete/calcular` | Calcula opções de frete por CEP |

**POST /api/frete/calcular — Body:**
```json
{
  "zipCode": "01310-100",
  "items": [
    { "productId": "cuid", "quantity": 2, "size": "6" }
  ]
}
```

**Resposta:**
```json
{
  "data": [
    {
      "service": "PAC",
      "price": 18.50,
      "deliveryDays": 7
    },
    {
      "service": "SEDEX",
      "price": 32.00,
      "deliveryDays": 3
    }
  ]
}
```

---

## Auth (Auth.js v5)

| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | Handler Auth.js (login, logout, session) |
| POST | `/api/auth/register` | Cadastro de novo usuário |
| POST | `/api/auth/forgot-password` | Solicita link de recuperação |
| POST | `/api/auth/reset-password` | Redefine senha via token |

**POST /api/auth/register — Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "role": "RETAIL" | "WHOLESALE",
  "cnpj": "00.000.000/0001-00"
}
```

- `role: RETAIL` → aprovação automática
- `role: WHOLESALE` → cria conta pendente; admin aprova manualmente

---

## Rotas Protegidas (usuário autenticado)

### Pedidos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/orders` | Lista pedidos do usuário logado |
| GET | `/api/orders/[id]` | Detalhes de um pedido |

---

### Checkout

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/checkout/create-payment` | Cria intenção de pagamento no Mercado Pago |

**POST /api/checkout/create-payment — Body:**
```json
{
  "orderId": "cuid",
  "method": "pix" | "credit_card" | "boleto",
  "installments": 1,
  "cardToken": "mp-card-token"
}
```

**Resposta (Pix):**
```json
{
  "data": {
    "paymentId": "mp-payment-id",
    "qrCode": "...",
    "qrCodeBase64": "...",
    "expiresAt": "2026-04-22T14:00:00Z"
  }
}
```

---

### Webhook Mercado Pago

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/webhook/mercadopago` | Recebe notificações de pagamento |

**Fluxo interno:**
1. Valida assinatura HMAC do header `x-signature`
2. Busca status do pagamento na API do Mercado Pago
3. Atualiza `Order.paymentStatus` e `Order.status` no banco
4. Dispara e-mail de confirmação via Resend (quando aprovado)

---

## Rotas Admin (`role: ADMIN` obrigatório)

### Produtos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/products` | Lista todos os produtos (incl. inativos) |
| POST | `/api/admin/products` | Cria produto |
| PUT | `/api/admin/products/[id]` | Atualiza produto |
| DELETE | `/api/admin/products/[id]` | Remove produto |
| POST | `/api/admin/products/[id]/images` | Upload de imagem (para R2) |
| DELETE | `/api/admin/products/[id]/images/[imageId]` | Remove imagem |

---

### Pedidos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/orders` | Lista todos os pedidos com filtros |
| PUT | `/api/admin/orders/[id]` | Atualiza status do pedido |

---

### Clientes

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/customers` | Lista clientes |
| PUT | `/api/admin/customers/[id]/wholesale` | Aprova ou revoga acesso atacado |

**PUT /api/admin/customers/[id]/wholesale — Body:**
```json
{ "approved": true }
```

---

### Cupons

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/coupons` | Lista cupons |
| POST | `/api/admin/coupons` | Cria cupom |
| PUT | `/api/admin/coupons/[id]` | Atualiza cupom |
| DELETE | `/api/admin/coupons/[id]` | Desativa cupom |

---

## Server Actions (`src/actions/`)

Server Actions são usadas para mutações originadas de formulários e interações do cliente. Não exigem um endpoint HTTP separado.

### `src/actions/cart.ts`

```typescript
addToCart(productId: string, size: string, quantity: number): Promise<void>
removeFromCart(itemId: string): Promise<void>
updateCartQuantity(itemId: string, quantity: number): Promise<void>
clearCart(): Promise<void>
```

O carrinho é mantido no `localStorage` (Zustand persist) no cliente. As actions validam disponibilidade de estoque no servidor antes de confirmar a adição.

### `src/actions/checkout.ts`

```typescript
validateCart(items: CartItem[]): Promise<{ valid: boolean; errors: string[] }>
applyCoupon(code: string, subtotal: number): Promise<CouponResult>
createOrder(input: CreateOrderInput): Promise<{ orderId: string }>
```

### `src/actions/auth.ts`

```typescript
register(data: RegisterInput): Promise<{ success: boolean; error?: string }>
forgotPassword(email: string): Promise<void>
resetPassword(token: string, password: string): Promise<void>
```

---

## Cache Redis — Chaves

| Chave | TTL | Conteúdo |
|---|---|---|
| `product:{slug}` | 5 min | Dados do produto serializado |
| `products:list:{hash-dos-filtros}` | 5 min | Lista paginada de produtos |
| `wholesale:prices:{userId}` | 1 h | Preços atacado do usuário logado |
| `ratelimit:login:{ip}` | 15 min | Contador de tentativas de login |
| `ratelimit:register:{ip}` | 1 h | Contador de cadastros por IP |
