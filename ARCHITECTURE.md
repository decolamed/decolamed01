# Arquitetura — Decola Med

Documento de referência da estrutura atual do projeto. Objetivo: qualquer
pessoa (ou IA) que for mexer no código consiga entender rápido onde cada
coisa está e como os fluxos se conectam, sem precisar reler tudo do zero.

Este documento reflete o código real do projeto — não é um template
genérico. Sempre que uma migração nova mudar o schema ou uma rota nova for
criada, atualize a seção correspondente no mesmo commit.

---

## 1. Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript** (`strict: true`)
- **Tailwind CSS** — estilização
- **Supabase** — banco Postgres, Auth, Row Level Security
- **Asaas** — gateway de pagamento (Pix, boleto, cartão)
- **Zod** — validação de payloads nas rotas de API e nas server actions
- **Vercel** — hospedagem/deploy (ver seção 9 para variáveis de ambiente)

---

## 2. Estrutura de pastas

```
src/
├── app/
│   ├── (site)/            → site público (vendas + checkout)
│   ├── (auth)/             → login, recuperação/redefinição de senha
│   ├── (admin)/admin/      → painel administrativo (role = admin)
│   ├── (aluno)/aluno/      → área do aluno (role = aluno)
│   ├── (parceiro)/parceiro/→ área do parceiro/afiliado (role = parceiro)
│   ├── auth/callback/       → troca o código do e-mail do Supabase por sessão
│   └── api/                  → rotas de API (matrícula, webhook Asaas, cupons)
├── components/
│   ├── site/                  → navbar, footer, formulário de matrícula/inscrição
│   ├── admin/                  → componentes só do painel admin
│   ├── auth/                    → formulários de login/recuperação de senha
│   └── ui/                       → Button (design system básico)
├── lib/
│   ├── supabase/                 → 3 clientes Supabase (ver seção 5)
│   ├── asaas/                     → toda a integração HTTP com a API do Asaas
│   ├── auth/                       → helpers requireAdmin()/requireAluno()/requireParceiro()/requireAcessoAluno()
│   ├── cupons/                      → validação de cupom (compartilhada)
│   ├── matricula/                    → sessionStorage da confirmação + verificarAcessoMatricula()
│   ├── historico/                     → registrarHistoricoAdmin() (trilha de auditoria)
│   ├── formatacao.ts                   → formatarCentavos()/formatarData() (moeda/data em pt-BR)
│   └── site/                            → helper de link do WhatsApp (montarLinkWhatsapp)
├── types/                                → tipos manuais espelhando o schema.sql + migrations
└── middleware.ts (raiz)                   → protege /admin, /aluno e /parceiro; bloqueia conta desativada e acesso vencido

supabase/
├── schema.sql                              → schema inicial (rodar 1x, na criação do projeto)
└── migrations/                              → migrações incrementais numeradas, ver seção 4
```

**Convenção dos grupos de rota** `(site)`, `(auth)`, `(admin)`, `(aluno)`,
`(parceiro)`: são *route groups* do Next — não aparecem na URL, só organizam
pastas e permitem layouts diferentes por área (o site público tem
navbar/footer; o admin tem sidebar; o aluno e o parceiro têm um header
simples com logout; o `(auth)` tem um layout centralizado simples).

---

## 3. Banco de dados (Supabase / Postgres)

### Tabelas

| Tabela | Para quê serve |
|---|---|
| `planos` | Planos de acesso vendidos. `slug` gera a URL pública `/inscricao/[slug]`. `duracao_meses` (null = ilimitado) define até quando o acesso fica ativo. |
| `profiles` | Estende `auth.users` (não duplica e-mail/senha). `role` é `aluno` \| `admin` \| `parceiro` — decide pra onde o middleware manda o usuário. `ativo` (bool) controla se a conta pode logar. `criado_manualmente`/`criado_por` registram quando o profile foi criado via `/admin/usuarios` em vez do checkout. |
| `pre_cadastros` | Criado no momento em que alguém preenche o formulário de inscrição, **antes** de pagar. Guarda CPF/telefone e, se usado, `cupom_codigo`/`desconto_centavos`. |
| `matriculas` | Uma linha por matrícula do aluno num plano. `status` (`pendente`/`ativa`/`bloqueada`/`cancelada`), `acesso_expira_em` (calculado a partir de `planos.duracao_meses`, null = ilimitado) e `acesso_liberado_manualmente`. `origem_pagamento` (`asaas`/`manual`/`cortesia`) e `criado_por`/`observacao` registram matrículas criadas fora do checkout normal (ver `/admin/usuarios` → "Adicionar aluno manualmente"). |
| `pagamentos` | Representa qualquer **venda** — não só cobranças do Asaas: também vendas manuais e cortesias criadas pelo admin. `origem_pagamento` distingue a origem. Campos denormalizados de propósito (`comprador_nome`, `comprador_email`, `plano_nome`, `plano_id`, `cupom_codigo`) para que o dashboard de vendas e o painel do parceiro não precisem depender de acesso a `profiles`/`matriculas` de outras pessoas. `parceiro_id`/`comissao_centavos`/`valor_liquido_centavos` alimentam o sistema de afiliados. `asaas_payment_id` é opcional (só existe pra vendas de origem Asaas). |
| `comissoes_parceiro` | Ledger de comissão por venda, um-para-um com `pagamentos` (gerado automaticamente por trigger, ver seção 3.2). Existe separado de `pagamentos` para já deixar pronta uma futura tela de "marcar comissão como paga" sem precisar migrar schema de novo. `status`: `pendente`/`paga`/`cancelada`. |
| `cupons` | Código, tipo (`percentual`/`fixo`), valor, validade, limite de usos. `parceiro_id`/`percentual_comissao` — quando preenchidos, o cupom é um cupom de afiliado: toda venda com ele gera comissão automaticamente. Validado sempre no servidor (nunca confia em valor calculado no navegador). |
| `historico_admin` | Trilha de auditoria: quem fez o quê e quando (criação manual de aluno, reenvio de e-mail, ativar/desativar, promover/rebaixar role). Consumida na página `/admin/usuarios/[id]` ("Eventos importantes"). |
| `configuracoes` | Chave/valor (jsonb) pra textos e contatos do site — WhatsApp, Instagram, título do hero — editável em `/admin/configuracoes`. |
| `notificacoes` | Preparada para notificações por usuário (ainda sem UI própria). |
| `permissoes` / `usuario_permissoes` | Preparadas para permissões granulares futuras — hoje o controle real é só `profiles.role`. |

> ⚠️ **Tabela nova?** Adicione a policy de RLS correspondente no mesmo commit
> — `alter table ... enable row level security` sozinho bloqueia tudo até
> existir uma `create policy`.

### 3.1 Relacionamentos principais

```
auth.users (Supabase Auth)
  └─ profiles (1:1, profiles.id = auth.users.id)
       ├─ profiles.plano_id → planos.id
       ├─ profiles.criado_por → profiles.id (quem criou manualmente)
       └─ matriculas.aluno_id → profiles.id (1 aluno : N matrículas — uma por checkout/criação manual)
            ├─ matriculas.plano_id → planos.id
            ├─ matriculas.pre_cadastro_id → pre_cadastros.id
            ├─ matriculas.criado_por → profiles.id
            └─ pagamentos.matricula_id → matriculas.id (1 matrícula : N pagamentos)
                 ├─ pagamentos.plano_id → planos.id (denormalizado)
                 ├─ pagamentos.parceiro_id → profiles.id (role parceiro)
                 ├─ pagamentos.cupom_codigo → cupons.codigo (por código, não FK)
                 └─ comissoes_parceiro.pagamento_id → pagamentos.id (1:1)
                      └─ comissoes_parceiro.parceiro_id → profiles.id

cupons.parceiro_id → profiles.id (role parceiro)
historico_admin.usuario_alvo_id / admin_id → profiles.id
```

### 3.2 Triggers e funções relevantes

| Função/trigger | Tabela | O que faz |
|---|---|---|
| `set_updated_at()` | planos, profiles, matriculas, comissoes_parceiro | Atualiza `updated_at` a cada UPDATE. |
| `is_admin()` / `is_parceiro()` | — | Helpers `security definer` usados dentro das policies de RLS. |
| `prevent_self_role_escalation()` | profiles | Trigger `before update`: se `role` mudar e quem está executando não for admin, a operação é rejeitada. Substituiu uma checagem antiga baseada em string na policy (ver migração 006 — a checagem antiga travava um parceiro editar o próprio perfil). |
| `set_valor_liquido_pagamento()` | pagamentos | Trigger `before insert/update`: se `valor_liquido_centavos` vier nulo, calcula `valor_centavos - comissao_centavos`. |
| `sync_comissao_parceiro()` | pagamentos | Trigger `after insert/update`: quando um pagamento com `parceiro_id` + `comissao_centavos > 0` é gravado como `confirmado`/`recebido`, cria/atualiza a linha correspondente em `comissoes_parceiro`. Se o pagamento for marcado `estornado`/`falhou`, cancela a comissão. |

### RLS (Row Level Security) — resumo

Toda tabela sensível tem RLS ligado. O padrão usado em quase tudo:

```sql
create or replace function is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$ language sql stable security definer;
```

- **`planos` / `configuracoes`**: leitura pública (só do que está ativo), escrita só admin.
- **`profiles`**: cada usuário vê/edita o próprio registro; admin vê/edita tudo. Troca de `role` é bloqueada para não-admin pela trigger `prevent_self_role_escalation` (não mais só pela policy — ver 3.2).
- **`matriculas`**: aluno vê a própria (`aluno_id = auth.uid()`); admin vê/gerencia todas. Parceiro **não** tem policy aqui — não enxerga matrículas de ninguém.
- **`pagamentos`**: admin vê/gerencia tudo; o próprio aluno vê os pagamentos ligados à sua matrícula; o próprio parceiro vê só as linhas onde `parceiro_id = auth.uid()` (policy `pagamentos_select_own_parceiro`).
- **`cupons`**: só admin gerencia; parceiro só lê o(s) próprio(s) cupom(ns) (`parceiro_id = auth.uid()`), sem poder editar.
- **`comissoes_parceiro`**: admin gerencia tudo; parceiro só lê as próprias.
- **`historico_admin`**: só admin (dado de auditoria sensível).
- **`pre_cadastros` / `permissoes`**: só admin (dados sensíveis antes de virar usuário, ou não precisam ser públicos).
- **`notificacoes`**: usuário vê/edita as próprias; admin vê/gerencia todas.

### Migrações

O schema é aplicado **em ordem**, no SQL Editor do Supabase (ou `supabase db push`):

1. `supabase/schema.sql` — schema inicial completo (roda uma única vez num projeto novo).
2. `002_planos_cupons.sql` — `duracao_meses`, `acesso_expira_em`, `cupom_codigo` e a tabela `cupons`.
3. `003_fix_profiles_rls.sql` — corrige escalonamento de privilégio (aluno conseguia virar admin editando o próprio profile).
4. `004_role_parceiro_enum.sql` — `alter type user_role add value 'parceiro'`. **Precisa rodar sozinha** (o Postgres não deixa usar um valor de enum recém-criado na mesma transação em que ele foi adicionado) e precisa estar **commitada** antes da 005.
5. `005_gestao_alunos_parceiros_vendas.sql` — colunas novas em `profiles`/`cupons`/`matriculas`/`pagamentos`, tabelas `comissoes_parceiro` e `historico_admin`, triggers de comissão/valor líquido, policies de RLS de parceiro.
6. `006_fix_role_update_trigger.sql` — troca a checagem de `role` na policy de update de `profiles` por uma trigger (necessário porque a checagem antiga só permitia manter `role = 'aluno'`, o que bloquearia um parceiro de editar o próprio perfil).
7. `007_fix_table_grants.sql` — concede GRANT de tabela (`select/insert/update/delete`) para os roles `anon`/`authenticated`/`service_role` em todas as tabelas do schema `public`, incluindo as futuras (via `alter default privileges`). Sem isso, leituras feitas pelo client do navegador (não pela service role) falhavam com `permission denied for table X` mesmo com as policies de RLS corretas — GRANT e RLS são camadas diferentes, RLS não substitui GRANT.

Ao criar a próxima migração, siga a mesma convenção: arquivo numerado em
`supabase/migrations/`, só com `alter table` / `create table if not exists`
(idempotente sempre que possível), com um comentário no topo explicando o
"porquê" quando a mudança for uma correção de segurança ou tiver alguma
pegadinha de ordem de execução.

---

## 4. Autenticação

### Os 3 clientes Supabase (`src/lib/supabase/`)

| Arquivo | Uso | Observação |
|---|---|---|
| `client.ts` | Componentes `"use client"` no navegador | `createBrowserClient` — usa fluxo **PKCE** (por isso o `/auth/callback` é obrigatório, ver abaixo) |
| `server.ts` → `createClient()` | Server Components / Route Handlers / páginas que leem dados do próprio usuário | Respeita RLS normalmente (age como o usuário logado via cookies) |
| `server.ts` → `createAdminClient()` | Só em código 100% server-side (webhook, server actions do admin) | Usa a **service role key** — ignora RLS. Nunca expor ao cliente. Toda página/action do painel admin usa este client, sempre depois de um `requireAdmin()`. |
| `middleware.ts` (raiz) → `updateSession()` | Middleware raiz | Renova a sessão a cada request e expõe `user`/`supabase` (client com RLS) pro middleware decidir redirecionamentos |

### Fluxo de login

`components/auth/login-form.tsx` chama `supabase.auth.signInWithPassword`. Não
existe cadastro público — contas só são criadas de três formas:
1. **Aluno (checkout)**: automaticamente pelo webhook do Asaas, após pagamento confirmado (`inviteUserByEmail`).
2. **Aluno (manual)**: pelo admin, em `/admin/usuarios` → "Adicionar aluno manualmente" (também usa `inviteUserByEmail`, mesmo fluxo de convite).
3. **Admin/Parceiro**: um admin promove um usuário existente em `/admin/usuarios` ("Tornar administrador"/"Tornar parceiro"), ou o primeiro admin é criado manualmente direto no Supabase (Auth → Add user + `insert into profiles ... role = 'admin'`).

### Fluxo de recuperação/criação de senha (importante — tem uma pegadinha)

Como o navegador usa fluxo **PKCE**, todo link de e-mail do Supabase Auth
(recuperação de senha OU convite de novo aluno) chega com `?code=...` na
URL. Esse código **precisa ser trocado por uma sessão no servidor** antes de
qualquer página tentar `updateUser()` — é isso que a rota abaixo faz:

```
src/app/auth/callback/route.ts
```

Fluxo completo:
```
/recuperar-senha (ou convite do webhook / criação manual)
  → supabase.auth.resetPasswordForEmail / inviteUserByEmail(email, { redirectTo: ".../auth/callback?next=/redefinir-senha" })
  → e-mail com link "?code=..."
  → GET /auth/callback → exchangeCodeForSession(code) → seta cookie de sessão
  → redirect para /redefinir-senha (agora autenticado)
  → supabase.auth.updateUser({ password }) funciona
```

**Todo `resetPasswordForEmail` / `inviteUserByEmail` do projeto deve apontar
o `redirectTo` para `/auth/callback?next=<destino>`, nunca direto para a
página final.** Hoje isso é usado em: `recuperar-senha-form.tsx`, o webhook
do Asaas, e as server actions de `/admin/usuarios/actions.ts` (cadastro
manual, reenvio de convite, reenvio de redefinição de senha).

### Contas desativadas (`profiles.ativo`)

`/admin/usuarios` → "Desativar usuário" faz duas coisas: chama
`supabase.auth.admin.updateUserById(id, { ban_duration: "876000h" })`
(bane de verdade no Supabase Auth — bloqueia login mesmo com senha certa) e
seta `profiles.ativo = false`. "Reativar" reverte os dois. O middleware
detecta `ativo === false` numa sessão ainda válida (cookie antigo) e força
`signOut()` + redireciona para `/login?erro=conta-desativada`.

### Bloqueio de acesso vencido/bloqueado/cancelado (aluno)

Implementado em `src/lib/matricula/acesso.ts` — função
`verificarAcessoMatricula(supabase, alunoId)`, chamada em duas camadas:

1. **Middleware** (`middleware.ts`, raiz) — antes de renderizar qualquer
   rota `/aluno/*` (exceto a própria página de aviso), busca a matrícula
   mais recente do aluno e, se ela estiver `bloqueada`/`cancelada`/`pendente`
   ou com `acesso_expira_em` no passado, redireciona para
   `/aluno/acesso-expirado?motivo=...`.
2. **Página** (`requireAcessoAluno()` em `lib/auth/permissions.ts`) — mesma
   checagem, chamada no topo de cada página de conteúdo da área do aluno
   (hoje só `/aluno/page.tsx`). Redundante de propósito, mesmo padrão já
   usado nas páginas do admin que chamam `requireAdmin()` de novo mesmo com
   o layout já chamando.

Por que não dá pra burlar alterando dados no navegador: a consulta usa o
client Supabase autenticado pela sessão (cookies), então roda sob RLS — a
policy `matriculas_select_own_or_admin` só deixa o aluno ler a **própria**
matrícula (`aluno_id = auth.uid()`, resolvido a partir do JWT da sessão, não
de nada que o cliente envia). A comparação de data usa o relógio do
servidor. Nenhuma escrita de `status`/`acesso_expira_em` acontece a partir
do client — só via `createAdminClient()` (server actions do admin) ou pelo
webhook do Asaas.

Não existe cron/edge function para isso — a checagem é feita em tempo real
a cada acesso (comparando `acesso_expira_em` com `now()` no momento da
requisição), o que é suficiente porque o bloqueio é sempre reavaliado antes
de qualquer conteúdo renderizar. Se um cron para "marcar como bloqueada"
proativamente for necessário no futuro (ex.: para aparecer diferente no
dashboard de vendas antes que o aluno tente acessar de novo), a função
`verificarAcessoMatricula()` já concentra toda a regra num único lugar.

A página `/aluno/acesso-expirado` mostra a mensagem correspondente ao motivo
(`sem_matricula`/`pendente`/`bloqueada`/`cancelada`/`expirada`), com CTA para
`/planos` (renovar) e link de WhatsApp (suporte). Se o aluno acessar essa
página sem estar realmente bloqueado, ela redireciona de volta pra `/aluno`.

### Middleware (`middleware.ts`, raiz do projeto)

Protege `/admin/*`, `/aluno/*` e `/parceiro/*`, nesta ordem:
1. Sem sessão → redireciona pro `/login?redirect=<rota original>`.
2. Conta desativada (`profiles.ativo = false`) → `signOut()` + `/login?erro=conta-desativada`.
3. Role errada pra área (ex. aluno tentando `/admin`) → redireciona pro painel correto (`/admin`, `/aluno` ou `/parceiro`).
4. Só para `/aluno/*`: matrícula vencida/bloqueada/cancelada → `/aluno/acesso-expirado?motivo=...`.

Toda página dentro de `(admin)`, `(aluno)` ou `(parceiro)` também chama
`requireAdmin()` / `requireAluno()` / `requireParceiro()`
(`lib/auth/permissions.ts`) no próprio layout ou página — é uma segunda
camada de proteção, redundante de propósito.

---

## 5. Integração com Asaas

Toda chamada HTTP pro Asaas está concentrada em `src/lib/asaas/client.ts`
(customer, cobrança, QR Code Pix). Nada fora desse arquivo faz `fetch` direto
pra API do Asaas — se a documentação deles mudar, é o único lugar a revisar.

### Checkout (`POST /api/matricula`)

1. Recebe `planoId`, dados do aluno, forma de pagamento e opcionalmente `cupomCodigo`.
2. Cria (ou reaproveita) o `pre_cadastro` no Supabase.
3. Se veio cupom, **revalida no servidor** (`lib/cupons/validar.ts`) — nunca confia no desconto calculado no front.
4. Cria/reaproveita o cliente no Asaas e gera a cobrança já com o valor final.
5. Devolve pro front o payload de `types/matricula.ts` (`MatriculaChargeResult`), consumido pela página de confirmação.

### Webhook (`POST /api/asaas/webhook`)

Único ponto que **de fato libera acesso** vindo do fluxo de checkout — nunca
confiar em retorno do navegador para isso (o checkout front-end só *inicia*
o pagamento).

Valida o header `asaas-access-token` contra `ASAAS_WEBHOOK_TOKEN`, e para
eventos `PAYMENT_CONFIRMED`/`PAYMENT_RECEIVED`:
1. Localiza o `pre_cadastro` pelo `externalReference`.
2. Se o cupom usado for um cupom de afiliado (`cupons.parceiro_id`), calcula a comissão (`percentual_comissao` × valor pago).
3. Se é a primeira confirmação: convida o aluno (`inviteUserByEmail`), cria `profiles`, cria `matriculas` (já calculando `acesso_expira_em` a partir da duração do plano, `origem_pagamento = 'asaas'`) e marca o cupom como usado.
4. Se é reenvio de evento (idempotência): só localiza a matrícula já existente.
5. Faz upsert em `pagamentos` (chave de conflito: `asaas_payment_id`) — sempre, em ambos os casos, já com `comprador_nome`/`comprador_email`/`plano_nome`/`parceiro_id`/`comissao_centavos` preenchidos. A trigger `sync_comissao_parceiro` cuida de gerar a linha em `comissoes_parceiro`.

### Vendas manuais e cortesias (fora do Asaas)

`/admin/usuarios/actions.ts` → `criarAlunoManual()` cria, numa única server
action: o usuário no Auth (convite), o `profiles`, a `matriculas` (com
`origem_pagamento` = `manual` ou `cortesia`) e um registro em `pagamentos`
correspondente (valor zero para cortesia) — para que a venda apareça
normalmente em `/admin/vendas`, mesmo não tendo passado pelo Asaas. Também
grava em `historico_admin` que a matrícula foi criada manualmente.

### Cupons

`lib/cupons/validar.ts` é chamado em dois lugares: `/api/cupons/validar`
(preview em tempo real, enquanto o aluno digita o cupom no formulário) e
dentro de `/api/matricula` (cálculo definitivo, no momento de gerar a
cobrança). O contador `cupons.usos` só incrementa no webhook, na primeira
confirmação de pagamento — nunca no pré-cadastro, pra não contar cupom de
quem começou e não pagou. Cupons podem opcionalmente estar vinculados a um
parceiro (`parceiro_id` + `percentual_comissao`), gerenciado em
`/admin/cupons`.

---

## 6. Mapa de páginas

### Site público — `(site)`

| Rota | O quê |
|---|---|
| `/` | "Sobre a plataforma" — página de vendas |
| `/planos` | Lista os planos ativos |
| `/inscricao/[slug]` | **Link fixo por plano** — não expira, vários alunos podem comprar pelo mesmo link. Carrega o plano pelo slug e mostra o formulário com o plano já travado. |
| `/matricula` | Formulário genérico com plano selecionável (usado quando não se tem um slug específico) |
| `/matricula/confirmacao` | Mostra Pix (QR Code + copia-e-cola) / Boleto / link do cartão, lendo os dados salvos em `sessionStorage` (sem chamar o Asaas de novo) |
| `/contato` | Botão de WhatsApp |

### Auth — `(auth)`

`/login`, `/recuperar-senha`, `/redefinir-senha` — ver seção 4.

### Admin — `(admin)/admin` (protegido, `role = admin`)

| Rota | O quê |
|---|---|
| `/admin` | Dashboard com contadores (alunos, matrículas ativas, planos ativos, parceiros, total vendido) |
| `/admin/planos` | CRUD de planos + botão "copiar link" + "ver inscritos" |
| `/admin/planos/[id]/editar` | Edição completa de um plano |
| `/admin/cupons` | CRUD de cupons + vínculo com parceiro/percentual de comissão |
| `/admin/matriculas` | Lista de matrículas, liberar/bloquear/cancelar manualmente (reflete direto no bloqueio de acesso do aluno — ver seção 4), botão WhatsApp, filtrável por `?planoId=` |
| `/admin/usuarios` | Lista de usuários com filtro por papel, cadastro manual de aluno, ações administrativas (reenviar convite/senha, ativar/desativar, promover/rebaixar admin ou parceiro — todas com confirmação), botão WhatsApp |
| `/admin/usuarios/[id]` | **Detalhes do aluno**: dados pessoais, matrícula atual (plano/status/datas), cupom e parceiro responsável, total pago, histórico de pagamentos e eventos administrativos |
| `/admin/vendas` | Dashboard de vendas: resumo (total vendido, líquido, ticket médio, vendas por plano) + tabela filtrável por período/plano/status/cupom/parceiro |
| `/admin/configuracoes` | Textos/contatos do site (chave/valor em `configuracoes`) |

O visual de todo o admin (sidebar, cards, tabelas, ícones) segue o design
"Decola Med Admin" (Claude Design) — ver `components/admin/card.tsx` e
`components/admin/icon.tsx` para as primitivas compartilhadas. Nenhuma
lógica de negócio das páginas acima mudou nessa restilização: mesmas
queries, mesmas server actions, mesmo RLS/service role de sempre.

#### Seções de conteúdo (`/admin/cursos`, `/cronograma`, `/questoes`,
`/simulados`, `/flashcards`, `/pdfs`, `/links`, `/banners`, `/conquistas`,
`/notificacoes`, `/relatos`)

Novas no admin, uma para cada área de conteúdo que o app do aluno já
mostra (ver seção 6, `decola-app.tsx`). Todas são Client Components com
estado em memória (`useState`, dados de exemplo iguais aos do app do
aluno) e mostram um `PreviewBanner` deixando isso explícito — é uma prévia
funcional (todo botão/toggle/formulário reage de verdade), mas nada
persiste: atualizar a página volta pros dados de exemplo, e não há tabela
no banco nem conexão com o que o aluno realmente vê. Implementar de
verdade exige criar as tabelas correspondentes (ver seção 10) e trocar o
`useState` inicial por fetch ao Supabase + server actions, no mesmo
padrão das páginas de gestão acima.

### Aluno — `(aluno)/aluno` (protegido, `role = aluno`, matrícula ativa e dentro do prazo)

| Rota | O quê |
|---|---|
| `/aluno` | App gamificado completo (ver abaixo) — mapa de missões, painel de desempenho, banco de questões, simulados, flashcards, cronograma, copiloto IA, ranking, conquistas, perfil e configurações |
| `/aluno/acesso-expirado` | Exibida quando a matrícula está vencida/bloqueada/cancelada/pendente — mensagem + CTA de renovação/suporte |
| `/aluno/briefing`, `/copiloto`, `/cronograma`, `/desempenho`, `/flashcards`, `/questoes`, `/raio-x`, `/ranking`, `/redacao`, `/simulados[/[id]]`, `/tutorial`, `/conquistas` | Páginas reais equivalentes às telas do app gamificado, já ligadas às tabelas do banco (seção 3) via Server Actions próprias — ver ressalva importante na seção 10: **ainda não há link nenhum saindo do `decola-app.tsx` para essas rotas** |

**Convenção para páginas de conteúdo futuras**: sempre chamar
`requireAcessoAluno()` (não só `requireAluno()`) no topo da página, senão o
bloqueio de acesso vencido não é aplicado nela.

#### `/aluno` — app gamificado (`decola-app.tsx`)

Porte do protótipo navegável "Decola Med App" (Claude Design) para dentro do
Next.js: `src/app/(aluno)/aluno/decola-app.tsx` é um único Client Component de
classe (`DecolaApp`) que renderiza ~25 telas via um dispatcher interno
(`app()` lê `state.screen`), sem roteamento próprio do Next — é uma SPA dentro
da rota `/aluno`. `decola-app.module.css` isola o reset visual (fonte
Montserrat, esconde scrollbar, keyframes) para não vazar pro resto do site.
`src/app/(aluno)/aluno/layout.tsx` não tem chrome visual (só `requireAluno()`)
porque o app cuida da própria navegação (cabeçalho, abas, menus).

`page.tsx` (server) busca, em paralelo, tudo que o app precisa direto das
tabelas reais (seção 3): `profile`, matrícula/plano, WhatsApp configurado,
banco de questões e flashcards ativos, simulados + `simulado_questoes` (sem
`resposta_correta` — nunca vai pra props de Client Component, só o servidor
vê isso), tentativas de simulado, `ranking_geral`, `respostas_aluno` +
`flashcard_revisoes` (agrupadas por matéria), `materias_peso`,
`aluno_missoes`/`cronograma_dias` (dependendo de `planos.tem_copiloto`),
`copiloto_recomendacoes` pendentes, `notificacoes`, `aluno_briefing` e
créditos de redação — tudo isso vira o prop único `dados` (`DecolaAppDados`
em `decola-app.tsx`), montado por `data()`. **Não existe mais estado de
demonstração nem persistência em `localStorage` para dado acadêmico** —
questões, flashcards, simulados, ranking, conquistas, missões, cronograma,
copiloto, notificações, redação e briefing são 100% lidos e gravados nas
tabelas reais.

Cada mutação chama a mesma Server Action que a rota dedicada equivalente
usa (`registrarResposta`, `registrarRevisao`, `submeterSimulado`,
`marcarMissaoConcluida`, `marcarRecomendacao`, `marcarNotificacaoLida`,
`salvarBriefing`) — nenhuma lógica de gravação foi duplicada; o app
gamificado e as rotas `/aluno/questoes`, `/aluno/flashcards` etc. reusam
exatamente as mesmas `actions.ts`. A correção de questões/simulados nunca
acontece no cliente: `mapQuestao()` remove `resposta_correta` do que vai pra
tela, e só depois de `registrarResposta()`/`submeterSimulado()` responderem
é que a UI sabe o que estava certo — o mesmo padrão de segurança das rotas
dedicadas.

Duas peças ficaram de fora desta integração, de propósito:
- **Hangar/Estudos** continuam sendo um menu estático (contadores como "86
  aulas", "215 materiais") — não há tabela de aulas/vídeos/PDFs com conteúdo
  navegável hoje; o único contador real ali é o de flashcards.
- **Conquistas** (badges) são calculadas em `badgesReais()`, espelhando
  exatamente os critérios de `/aluno/conquistas/page.tsx` — não há tabela de
  conquistas própria (nem precisa: é só uma leitura derivada dos contadores
  reais).

"Alterar senha" (`scrSenha`) continua chamando `supabase.auth.updateUser()`
de verdade, como antes.

O que foi deixado de fora do protótipo de propósito: telas de
login/cadastro/onboarding (a autenticação real já roda antes desta página) e
a barra de status falsa de celular (relógio/sinal/bateria — só fazia sentido
dentro do preview do Claude Design). As imagens do mascote
(`assets/mascote/copiloto-*.png`) já foram incorporadas de verdade —
`mascoteBadge(name, size, opts)` mapeia cada contexto (`bot`, `trophy`,
`award`, `check`, `cards`, `compass`, `alert`, `laptop`, `wink`) pro PNG
correspondente em vez de um selo de ícone genérico.

**Responsivo (design "Decola Med Desktop")**: `DecolaApp.wide()` (>= 1150px
de largura, ouvindo `resize`) troca a barra de abas + cartão de celular
centralizado por uma sidebar fixa em tela cheia (`sidebarDesktop()`), igual
ao design de desktop importado depois — reaproveitando exatamente as mesmas
telas (`scrMapa`, `scrPainel` etc.), só muda o chrome ao redor
(`screenWrap()` decide qual dos dois renderizar). Não é um port separado do
design de desktop: aquele arquivo tinha uma tela mais enxuta (sem
missões/hangar/anotações/redação/tutorial/config, por exemplo) que já são
cobertas pelo `decola-app.tsx` mobile — em vez de duplicar em um componente
paralelo (que divergiria com o tempo), a sidebar do design de desktop foi
absorvida como só mais um breakpoint do mesmo componente.

### Parceiro — `(parceiro)/parceiro` (protegido, `role = parceiro`)

| Rota | O quê |
|---|---|
| `/parceiro` | Dashboard do afiliado: cupom(ns) próprio(s), quantidade de vendas, comissão acumulada, lista de compradores que usaram o cupom |

Sem acesso ao painel administrativo geral nem a dados de outros alunos,
cupons ou parceiros — ver policies de RLS na seção 3.

---

## 7. Componentes administrativos reutilizáveis

| Componente | Uso |
|---|---|
| `components/admin/submit-button.tsx` | Botão de submit com estado de loading (`useFormStatus`) |
| `components/admin/confirm-submit-button.tsx` | Igual ao acima, mas pede `window.confirm()` antes de submeter — usado em toda ação administrativa sensível (desativar usuário, promover a admin, etc.) |
| `components/admin/whatsapp-button.tsx` | Monta link `wa.me` a partir do telefone cadastrado (reaproveita `lib/site/whatsapp.ts`); mostra aviso se não houver telefone |
| `components/admin/admin-alert.tsx` | Lê `?erro=`/`?sucesso=` da query string e mostra banner — usado após redirects de server actions |

---

## 8. Padrões de código a seguir

- **Toda página do admin** chama `requireAdmin()` no topo, mesmo que o
  layout já chame — redundância proposital.
- **Toda escrita no banco feita pelo admin** usa `createAdminClient()`
  (service role, ignora RLS) — só depois de já ter confirmado
  `requireAdmin()`. Nunca usar `createAdminClient()` num Client Component ou
  expor a service role key ao navegador.
- **Ações administrativas sensíveis** (desativar, promover/rebaixar role,
  reenviar e-mail) pedem confirmação (`ConfirmSubmitButton`) e gravam em
  `historico_admin` via `registrarHistoricoAdmin()`.
- **Campos monetários** são sempre `integer` em centavos no banco
  (`valor_centavos`, `comissao_centavos`, etc.) — nunca `float`. Formatar
  para exibição com `formatarCentavos()` de `lib/formatacao.ts`.
- **Nunca confiar em valor calculado no navegador** para cupom, comissão ou
  liberação de acesso — sempre recalcular/revalidar no servidor.

---

## 9. Variáveis de ambiente (`.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # só server-side — nunca expor com NEXT_PUBLIC_

ASAAS_API_KEY=
ASAAS_API_URL=                   # sandbox ou produção
ASAAS_WEBHOOK_TOKEN=             # configurado também no painel do Asaas

NEXT_PUBLIC_SITE_URL=            # usado nos redirectTo de e-mail — precisa bater com o domínio real em cada ambiente
```

No painel do Supabase, em **Authentication → URL Configuration**, a
allowlist de **Redirect URLs** precisa incluir `<seu domínio>/auth/callback`
(local e produção) — sem isso os e-mails de recuperação/convite não
completam o fluxo mesmo com o código acima correto.

**Na Vercel**, as 6 variáveis acima precisam estar configuradas em
Project Settings → Environment Variables, para os ambientes Production e
Preview (pelo menos `NEXT_PUBLIC_SITE_URL` normalmente difere entre eles —
domínio de produção vs. URL de preview). `SUPABASE_SERVICE_ROLE_KEY` e
`ASAAS_API_KEY`/`ASAAS_WEBHOOK_TOKEN` são segredos — nunca commitar valores
reais no repositório, só no `.env.example` com os nomes vazios.

---

## 10. O que ainda não existe (débito técnico conhecido)

**Atualização importante**: as migrações 008–017 (seção 3) já criaram tabelas
reais para banco de questões, flashcards, simulados, créditos de redação,
ranking, cronograma e a fundação do Copiloto IA, com RLS e Server Actions
próprias (`src/app/(admin)/admin/{questoes,flashcards,simulados,...}/actions.ts`
e `src/app/(aluno)/aluno/{questoes,flashcards,simulados,...}/actions.ts`).
As seções de conteúdo do admin (`/admin/cursos` até `/admin/relatos`) já
escrevem nessas tabelas de verdade através dos `*-manager.tsx` — não são
mais só prévias com estado em memória.

**Atualização (resolvido)**: o app gamificado (`decola-app.tsx`) já foi
integrado à infraestrutura real — ver a subseção `/aluno` — app gamificado
acima. Não há mais duas implementações paralelas: a SPA e as rotas
dedicadas (`/aluno/questoes`, `/aluno/flashcards` etc.) chamam as mesmas
Server Actions e leem das mesmas tabelas. As rotas dedicadas continuam
existindo como pontos de entrada alternativos (por exemplo, para links
enviados pelo Copiloto) e são úteis pra testar uma funcionalidade
isoladamente, mas não são mais a única forma real de usar o sistema.

**Atualização (Parte 1 concluída)**: do levantamento de 15 pontos do
protótipo original, os itens abaixo já foram resolvidos:

- **Papel "Professor"**: migração `018_professor_role.sql` adicionou
  `professor` ao enum `user_role`. `/admin/usuarios` já filtra por ele, tem
  formulário próprio de cadastro manual (`criarProfessorManual`, sem
  matrícula/plano — só cria o login) e ações `tornarProfessor`/
  `removerProfessor`. **Decisão de escopo**: professor ainda não tem área
  própria no app — por enquanto usa o mesmo painel do admin (mesmo nível de
  acesso), só com o role diferente para fins de gestão/relatório. Isso evita
  um loop de redirecionamento no middleware (todo role precisa de um "home"
  válido) sem inventar uma área nova fora do que foi pedido. Se no futuro
  for necessário restringir o que um professor pode ver dentro do admin,
  é em `requireAdmin()` (`src/lib/auth/permissions.ts`) e no middleware
  (`middleware.ts`, raiz do projeto) que essa distinção entra.
- **Banners reais no app do aluno**: `bannerRow()` em `decola-app.tsx` lia
  um array hardcoded de 3 banners fake — agora lê de `this.props.dados.banners`
  (tabela `banners`, já com CRUD real em `/admin/banners`). Convenção do
  campo `link`: valores começando com `"app/"` navegam para dentro do
  próprio app (`irParaLinkBanner()` faz `nav(link.slice(4))`); qualquer outro
  valor abre como link externo no browser in-app.
- **Notificações**: fluxo admin → aluno (`/admin/notificacoes` →
  `enviarNotificacao` → tabela `notificacoes` → RLS `usuario_id = auth.uid()
  OR is_admin()`) já estava correto, só foi verificado. Foi adicionado um
  "Histórico de envios" agregando `notificacoes` por (título, `created_at`)
  já que o envio insere uma linha por destinatário e não existe uma tabela
  de campanha própria.
- **Relatos de erro**: fluxo aluno → admin (`relato-actions.ts` →
  `/admin/relatos/actions.ts`) já estava correto ponta a ponta, verificado
  sem necessidade de mudança.
- **Responsividade tablet**: adicionado um breakpoint intermediário em
  `decola-app.module.css` (`min-width: 768px`, antes do salto direto para a
  sidebar de desktop em 1150px) que aumenta a largura do cartão para 680px
  em vez de deixar o cartão de celular de 480px flutuando no meio de um
  viewport bem maior. O chrome continua sendo o de mobile (barra de abas)
  nessa faixa — criar uma terceira variante de chrome (tipo a sidebar do
  desktop) só para tablet foi considerado desproporcional ao ganho.

Pontos que continuam pendentes (Parte 2, ainda não iniciada):

- **Renovação de plano por um aluno já existente**: hoje o webhook do Asaas
  assume que todo `pre_cadastro` novo é um aluno novo (`inviteUserByEmail`).
  Se um aluno já cadastrado comprar de novo (renovação) com o mesmo e-mail,
  o convite falha silenciosamente (`already registered`) e nenhuma
  matrícula nova é criada automaticamente — hoje a renovação de um aluno
  existente precisa ser feita manualmente pelo admin (`/admin/usuarios` →
  cadastro manual, ou diretamente em `/admin/matriculas`).
- **Pagamento de comissão ao parceiro**: `comissoes_parceiro` já tem o
  campo `status` (`pendente`/`paga`/`cancelada`) e `data_pagamento`, mas
  ainda não existe UI para o admin marcar uma comissão como paga.
- **Checkout Asaas retornando erro ao gerar cobrança**: fluxo de criação de
  plano → link → matrícula está com uma falha em produção ("Não foi possível
  gerar a cobrança") a diagnosticar — precisa checar logs reais do Asaas
  (`get_logs`/credenciais/sandbox vs. produção), não só o código.
- **Importação em lote** (questões via PDF/texto, aulas via links do
  YouTube, flashcards via PDF/texto): não implementado. É um recurso novo
  (parsing de documento/vídeo), não uma reconexão de algo que já existia —
  precisa de uma biblioteca de parsing de PDF e decisão de produto sobre
  como validar o resultado antes de salvar.
- **Cronograma dinâmico (dias/missões arbitrários com anexos variados)**:
  o cronograma admin atual (`cronograma_dias`) é uma semana fixa de 7 linhas;
  `aluno_missoes` já suporta datas arbitrárias e missões individuais, mas
  não há UI no admin para o admin compor um cronograma de N dias anexando
  aulas/questões/simulados/flashcards/redações a cada missão.
- **Módulo de "Atividades"** (avaliação configurável a partir de questões,
  com opções de gabarito imediato/no final, peso FACAPE, tempo limite):
  não existe uma entidade própria — hoje o mais próximo é `simulados`.
- **Onboarding de primeiro acesso + instalação PWA**: `TutorialSlideboard`
  já existe e explica a plataforma; o botão "Instalar aplicativo" ainda não
  foi conectado ao evento `beforeinstallprompt` do navegador.
- **Perfil individual do aluno no admin com cronograma próprio editável**:
  `/admin/usuarios/[id]` mostra dados cadastrais, mas não o cronograma real
  daquele aluno nem permite ajustá-lo sem afetar o cronograma geral.
