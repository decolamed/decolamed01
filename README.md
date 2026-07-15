# Decola Med — v1

Base do projeto: site de vendas, matrícula com pagamento via Asaas, login e
estrutura inicial da área do aluno e do painel administrativo.

Stack: Next.js 14 (App Router) + TypeScript + Tailwind + Supabase + Asaas.

> **Importante:** este código foi gerado sem acesso à internet, então nunca
> foi rodado (`npm install` / `next build`). Revise antes de ir para
> produção — em especial a integração com o Asaas, que deve ser validada em
> ambiente sandbox primeiro.

## 1. Instalar dependências

```bash
npm install
```

## 2. Configurar o Supabase

1. Crie um projeto em https://supabase.com.
2. No SQL Editor, rode o conteúdo de `supabase/schema.sql`. Isso cria todas
   as tabelas, enums, RLS e políticas.
3. Em **Authentication > URL Configuration**, defina a Site URL e adicione
   `/redefinir-senha` como Redirect URL permitida.
4. Em **Authentication > Email Templates**, os templates de "Invite user" e
   "Reset password" são os e-mails enviados automaticamente pelo Supabase
   (convite após pagamento confirmado / recuperação de senha). Personalize o
   texto e o remetente por lá.
5. Copie as chaves em **Project Settings > API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (nunca exponha esta no client)

## 3. Configurar o Asaas

1. Crie uma conta em https://www.asaas.com (use o ambiente sandbox durante o
   desenvolvimento: https://sandbox.asaas.com).
2. Gere sua API Key em **Configurações > Integrações > Chave de API**.
3. Configure o Webhook em **Configurações > Integrações > Webhooks**:
   - URL: `https://SEU-DOMINIO.com/api/asaas/webhook`
   - Eventos: pelo menos `PAYMENT_CONFIRMED` e `PAYMENT_RECEIVED`
   - Defina um token de autenticação — o mesmo valor vai em
     `ASAAS_WEBHOOK_TOKEN`.
4. A implementação em `src/lib/asaas/client.ts` segue os campos oficiais
   documentados em https://docs.asaas.com — **confira a documentação vigente
   antes de ir para produção**, pois a Asaas pode alterar campos
   obrigatórios/recomendados com o tempo.

## 4. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ASAAS_API_KEY=
ASAAS_API_URL=https://sandbox.asaas.com/api/v3
ASAAS_WEBHOOK_TOKEN=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 5. Rodar localmente

```bash
npm run dev
```

## 6. Deploy na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Importe o repositório na Vercel.
3. Em **Settings > Environment Variables**, adicione as mesmas variáveis do
   `.env.local` (troque `ASAAS_API_URL` para a URL de produção
   `https://api.asaas.com/v3` quando sair do sandbox, e atualize
   `NEXT_PUBLIC_SITE_URL` para o domínio final).
4. Atualize a URL do webhook no painel do Asaas para apontar para o domínio
   de produção.

## Como criar o primeiro administrador

Não existe cadastro de admin pelo site (por segurança). Após alguém se
matricular normalmente (o que cria um registro em `profiles` com
`role = 'aluno'`), promova manualmente pelo SQL Editor do Supabase:

```sql
update profiles set role = 'admin' where email = 'seu-email@dominio.com';
```

## Arquitetura

```
src/
  app/
    (site)/         site de vendas: home, planos, matrícula, contato
    (auth)/         login, recuperação e criação de senha
    (aluno)/         área do aluno (estrutura inicial)
    (admin)/         painel administrativo
    api/
      matricula/            cria pré-cadastro + cobrança no Asaas
      asaas/webhook/        confirma pagamento, cria matrícula e usuário
  components/       site, ui, admin, aluno, auth
  lib/
    supabase/       clients (browser, server, admin, middleware)
    asaas/          client HTTP para a API oficial do Asaas
    auth/           helpers de permissão (requireAdmin / requireAluno)
  types/database.ts tipos que espelham supabase/schema.sql
supabase/schema.sql tabelas, enums, RLS e seed mínimo
middleware.ts       renovação de sessão + roteamento por perfil (admin/aluno)
```

## O que já está pronto nesta v1

- Site de vendas com a identidade visual da marca (azul + laranja, tema
  aviação), reconstruído em componentes React/Tailwind a partir do material
  de referência enviado.
- Fluxo completo de matrícula → pré-cadastro no Supabase → cliente e
  cobrança no Asaas (Pix, boleto ou cartão) → confirmação por webhook →
  criação de matrícula e usuário → e-mail de convite para criar senha.
- Login, recuperação e criação de senha via Supabase Auth.
- Estrutura da área do aluno, com os módulos futuros indicados (mas não
  implementados, conforme escopo desta versão).
- Painel administrativo com CRUD de planos, gestão de matrículas (liberar/
  bloquear acesso), gestão de usuários (buscar, trocar plano, resetar
  senha) e edição de conteúdos institucionais do site.
- Banco de dados modelado para crescer: tabelas de permissões e
  configurações já preparadas, e a seção final do `schema.sql` documenta os
  módulos futuros (cursos, questões, flashcards, redações, simulados,
  desempenho) para manter o padrão de arquitetura quando forem construídos.

## O que ainda precisa de atenção antes de produção

- Rodar `npm install` e `next build` para pegar erros de tipo/lint que não
  puderam ser verificados neste ambiente sem internet.
- Testar o fluxo de pagamento ponta a ponta no sandbox do Asaas.
- Definir a política de e-mail transacional definitiva (hoje usa os
  templates padrão do Supabase Auth).
- Ajustar `dueDate` e regras comerciais da cobrança em
  `src/app/api/matricula/route.ts` conforme a política da Decola Med.
- Cadastrar os planos reais pelo painel (`/admin/planos`) antes de divulgar
  o link de matrícula.
