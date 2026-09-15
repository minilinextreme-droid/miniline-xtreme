# Como cada vendedor recebe no seu próprio banco (com segurança)

## Como o dinheiro flui no MiniLine Xtreme

O site funciona como uma "conta de retenção" (escrow), igual Shopee:

1. O comprador paga o pedido (Pix ou cartão via Stripe).
2. O valor da venda fica **retido** — o vendedor vê como "Retido até a entrega".
3. Quando a mini **chega**, o comprador toca em **"✅ Confirmar recebimento"**
   (página Meus pedidos).
4. O repasse fica **"liberado a pagar"** no painel do administrador
   (Painel Admin → "Pagamentos aos vendedores"), já descontada a
   **comissão da plataforma** (configurável no admin, padrão 10%).
5. O administrador faz o repasse para a conta bancária/Pix do vendedor e
   marca como **"pago"**. O vendedor vê tudo em "Painel da loja → Saldo e
   repasses".

Ninguém recebe antes do comprador confirmar — sem risco de golpe.

## Para os repasses saírem automáticos (dinheiro de verdade)

Quando você quiser que o repasse caia SOZINHO na conta de cada vendedor:

- **Stripe Connect** (recomendado): em https://dashboard.stripe.com/connect
  cada vendedor conecta a própria conta bancária. O pagamento entra na sua
  plataforma, e você libera a transferência para o vendedor com um clique,
  direto pelo Stripe — o dinheiro vai para o banco dele com segurança total.
- **Mercado Pago Marketplace**: alternativa brasileira com split de pagamento
  (stripe.com/connect e mercadopago.com.br/developers/pt/guides/marketplace).

Passo a passo resumido do Stripe Connect:
1. Criar conta Stripe e ativar Connect em "Connect → Onboarding".
2. Enviar o link de "Express account" para cada vendedor aprovado — ele cadastra
   o próprio banco em 2 minutos, sem você ver os dados dele.
3. Cada venda entra na plataforma; em "Transfers" você libera o valor líquido
   para o vendedor depois da confirmação de entrega.
4. Atualize o status no painel "Pagamentos aos vendedores" para manter o
   histórico do site em sincronia.

Com o Supabase configurado (REAL-SETUP.md), cada vendedor vê o próprio saldo
atualizado em qualquer aparelho.
