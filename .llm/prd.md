# PRD — Site Ecommerce Loja Infantil Masculina (Playbekids)

## Visão Geral

Site de ecommerce para loja infantil masculina com atendimento a **varejo** e **atacado**.
Clientes não autenticados visualizam preços de varejo. Clientes atacadistas fazem login para acessar preços e condições especiais.

---

## Tipos de Usuário

- **Visitante** — acessa o site sem login, vê preços de varejo
- **Cliente Varejo** — pode criar conta para acompanhar pedidos, sem acesso a preços de atacado
- **Cliente Atacado** — conta aprovada manualmente, acessa preços e tabelas de atacado após login
- **Administrador** — gerencia produtos, pedidos, clientes e configurações

---

## Páginas Principais

### Home
- Banner principal (carrossel)
- Seção de categorias em destaque
- Produtos em destaque / lançamentos
- Seção de promoções
- Banners secundários
- Rodapé com informações de contato e links úteis

### Catálogo / Listagem de Produtos
- Filtros: categoria, faixa etária, tamanho, cor, faixa de preço
- Ordenação: mais vendidos, menor preço, maior preço, novidades
- Grid de produtos com foto, nome e preço (varejo ou atacado conforme login)
- Paginação ou scroll infinito

### Página do Produto
- Galeria de fotos
- Nome, descrição, composição do tecido
- Tabela de tamanhos disponíveis
- Preço de varejo (sempre visível)
- Preço de atacado (visível apenas para clientes atacado logados)
- Quantidade mínima para atacado
- Botão "Adicionar ao Carrinho"
- Produtos relacionados

### Carrinho
- Resumo dos itens
- Quantidade editável
- Subtotal, frete e total
- Cupom de desconto
- Botão para finalizar compra

### Checkout
- Endereço de entrega
- Cálculo de frete (integração com Correios / transportadoras)
- Forma de pagamento: cartão de crédito, boleto, Pix
- Resumo do pedido
- Confirmação por e-mail

### Login / Cadastro
- Login com e-mail e senha
- Cadastro para varejo (aprovação automática)
- Cadastro para atacado (aprovação manual pelo admin)
- Recuperação de senha

### Área do Cliente
- Meus pedidos (histórico e status)
- Dados cadastrais
- Endereços salvos
- Trocar senha

### Área Administrativa
- Dashboard com resumo de vendas
- Gestão de produtos (CRUD)
- Gestão de categorias
- Gestão de pedidos
- Gestão de clientes (aprovar/revogar acesso atacado)
- Configurações de frete e pagamento
- Cupons de desconto

---

## Regras de Negócio

- Preço de atacado só é exibido após login com conta de atacado aprovada
- Pedidos de atacado podem ter quantidade mínima por produto ou por pedido
- Clientes atacado podem ter tabela de preços diferenciada por volume
- Frete pode ser calculado por CEP
- Pagamento parcelado disponível para varejo e atacado

---

## Categorias de Produtos (inicial)

- Camisetas
- Bermudas / Shorts
- Calças
- Conjuntos
- Agasalhos / Moletons

---

## Faixas Etárias

- Bebê (0 a 2 anos)
- Infantil (2 a 8 anos)
- Juvenil (8 a 12 anos)

---

## Integrações Previstas

- Gateway de pagamento (ver seção dedicada abaixo)
- Cálculo de frete (Correios / Melhor Envio)
- E-mail transacional (confirmação de pedido, recuperação de senha)
- WhatsApp para suporte (botão flutuante)

---

## Gateway de Pagamento

### Formas de Pagamento Suportadas

- **Cartão de crédito** — parcelamento em até X vezes (a definir), com ou sem juros
- **Cartão de débito**
- **Pix** — geração de QR Code e chave copia-e-cola, confirmação automática
- **Boleto bancário** — vencimento em 1 a 3 dias úteis, confirmação em até 2 dias úteis

### Gateway Recomendado: Mercado Pago

Melhor opção para o contexto brasileiro por:
- Amplamente conhecido e confiável pelo consumidor final
- SDK oficial para Node.js / Next.js
- Suporte a todos os métodos acima
- Painel de gestão de recebimentos já familiar para muitos lojistas
- Sem mensalidade — cobrança apenas por transação

Alternativas: PagSeguro, Pagar.me, Stripe (menos popular no Brasil para varejo)

### Fluxo de Pagamento

1. Cliente finaliza o carrinho e vai para o checkout
2. Seleciona a forma de pagamento
3. Para cartão: dados inseridos em formulário seguro (tokenização via SDK do gateway — nunca trafegam pelo servidor da loja)
4. Para Pix: QR Code gerado e exibido na tela, com timer de expiração
5. Para boleto: PDF gerado e enviado por e-mail
6. Gateway notifica o backend via **webhook** sobre o status do pagamento
7. Backend atualiza o status do pedido e dispara e-mail de confirmação ao cliente

### Status de Pedido x Pagamento

| Status Pagamento | Status Pedido         |
|------------------|-----------------------|
| Pendente         | Aguardando pagamento  |
| Aprovado         | Em processamento      |
| Recusado         | Pagamento recusado    |
| Estornado        | Pedido cancelado      |

### Segurança

- Dados de cartão nunca armazenados no banco da loja (responsabilidade do gateway)
- Comunicação via HTTPS obrigatória
- Validação de assinatura nos webhooks recebidos
- Ambiente de sandbox para testes antes de ir para produção

### Parcelamento — Regras (a definir)

- [ ] Número máximo de parcelas para varejo
- [ ] Número máximo de parcelas para atacado
- [ ] Parcelamento sem juros até X vezes (loja absorve o custo)?
- [ ] Valor mínimo de parcela

---

## Identidade Visual

- Público: infantil masculino
- Tom: moderno, colorido mas sem exageros, confiável
- Cores: a definir (sugestão: azul, laranja ou verde como cor primária)
- Logo: a definir

---

## Tecnologia (a definir)

- Frontend: Next.js ou similar
- Backend: Node.js / API REST ou Next.js fullstack
- Banco de dados: PostgreSQL
- Hospedagem: a definir

---

## Pendências / Dúvidas

- [ ] Nome oficial da loja
- [ ] Definir paleta de cores e logo
- [ ] Política de frete grátis?
- [ ] Quais formas de pagamento serão aceitas?
- [ ] Quantidade mínima para atacado (por peça? por pedido? por valor?)
- [ ] Haverá programa de fidelidade?
- [ ] Integração com sistema de estoque externo?
