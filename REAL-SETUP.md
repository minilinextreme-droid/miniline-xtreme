# MiniLine Xtreme — ativação do sistema REAL

Esta versão adiciona backend multiusuário, Supabase Auth/Google, banco persistente, armazenamento de produtos e integração segura com Mercado Pago.

## 1. Supabase
1. Crie um projeto em Supabase.
2. Abra SQL Editor e execute `supabase-schema.sql`.
3. Em Authentication > Providers > Google, ative Google e informe o Client ID/Secret do Google Cloud.
4. Em Authentication > URL Configuration, coloque o domínio final da loja nas Redirect URLs, por exemplo `https://SEU-DOMINIO/`.
5. Crie um bucket Storage chamado `product-images` e configure upload para usuários autenticados (ou ajuste as policies do bucket).

## 2. Variáveis no Vercel
Configure como Environment Variables:
- SUPABASE_URL = URL do projeto
- SUPABASE_ANON_KEY = chave anon/public
- SUPABASE_SERVICE_ROLE_KEY = service role (SOMENTE servidor; nunca coloque no HTML/JS)
- MERCADOPAGO_ACCESS_TOKEN = token privado do Mercado Pago (SOMENTE servidor)
- PUBLIC_URL = URL pública do site, ex. https://miniline-xtreme.vercel.app

## 3. Google
No Google Cloud Console crie OAuth Web Client e coloque como redirect URI a URL de callback do Supabase:
`https://SEU-PROJETO.supabase.co/auth/v1/callback`
Nunca coloque Client Secret no GitHub.

## 4. Mercado Pago
Configure credenciais de produção no Vercel. O frontend chama `/api/payment`; o token privado fica no servidor. Configure também a URL pública do webhook.

## 5. Admin
Depois de criar sua conta Google/email, no SQL Editor:
`update profiles set role='admin' where email='SEU_EMAIL';`
Assim o painel administrativo passa a ter acesso ao gerenciamento protegido no servidor.

## 6. O que fica REAL
- Produtos publicados no banco aparecem para outros aparelhos.
- Anúncios não dependem de localStorage.
- Login Google e sessão são gerenciados pelo Supabase Auth.
- Login por e-mail usa autenticação real e hash seguro do provedor.
- Fotos são enviadas para Storage.
- Pedidos ficam no banco.
- Estoque é atualizado no servidor.
- Checkout cria preferência no Mercado Pago.
- Webhook atualiza o pagamento no banco.
- Pré-venda cobra somente R$25 agora e registra o saldo futuro.
- Notificações personalizadas são armazenadas no banco para distribuição posterior.

## Importante
O ZIP contém o código e a infraestrutura necessária, mas nenhum serviço externo pode ser ativado com credenciais que não foram fornecidas. Não coloque chaves privadas no GitHub.

## Verificação de e-mail (recomendado)

Depois de conectar o Supabase (passo a passo acima), ative a confirmação de
e-mail no painel do Supabase: **Authentication → Sign in / Providers → Email →
Confirm email = ON**. Assim, todo cadastro novo precisa clicar no link enviado
por e-mail antes de entrar — igual às plataformas grandes. O login com Google
já é verificado por natureza.
