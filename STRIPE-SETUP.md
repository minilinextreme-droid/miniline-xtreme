# Pagamento com cartão via Stripe (5 minutos)

Para receber pagamentos de verdade com cartão:

1. Crie sua conta gratuita em https://dashboard.stripe.com/register
2. No painel do Stripe, abra **Pagamentos → Links de pagamento** (Payment Links)
3. Crie um link com o nome "Pedido MiniLine Xtreme" e o valor (ou "deixe o cliente escolher o valor")
4. Copie o link gerado (começa com `https://buy.stripe.com/...`)
5. No seu site, entre como admin → **Painel Admin** → seção **"Stripe (cartão)"**
6. Cole o link e clique em **Salvar**

Pronto! No checkout, a opção **"Cartão (Stripe)"** agora leva o cliente direto
para o pagamento seguro do Stripe (parcelamento, cartão internacional etc.).
O Pix continua funcionando como antes.

Dica: no painel do Stripe você pode criar links de valores diferentes
(R$ 25, R$ 50, R$ 100) e atualizar no admin quando quiser.
