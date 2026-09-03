# Jarvis — como colocar para funcionar

Guia para **você usar**. Nada de venda, cobrança ou plano — o app abre e funciona.

Você vai rodar na sua máquina. O banco fica na nuvem (grátis, sem cartão). Custo
total: **R$ 0**, se você usar o Gemini.

São 6 passos e leva uns 15 minutos. Você faz isso **uma vez na vida**.

---

## Antes de começar

Você precisa do **Node.js** instalado. Para conferir, abra o terminal e digite:

```bash
node --version
```

Se aparecer um número (v18 ou maior), está pronto. Se der erro, instale em
<https://nodejs.org> — pegue a versão **LTS**.

---

## Passo 1 · Baixar o projeto

```bash
git clone https://github.com/decolamed/decolamed01.git
cd decolamed01
git checkout claude/jarvis-medical-assistant-yxnyx7
cd jarvis
npm install
```

O `npm install` demora uns 2 minutos e enche a tela de texto. Enquanto ele roda,
já vá para o passo 2 em outra aba do navegador.

---

## Passo 2 · Criar o banco no Supabase

1. Entre em <https://supabase.com> e crie uma conta. **Não pede cartão.**
2. Clique em **New project**.
   - Nome: `jarvis`
   - **Database Password:** ele gera uma. Copie e guarde num lugar seguro — você
     não vai usar agora, mas não dá para ver de novo depois.
   - Region: escolha **South America (São Paulo)**, que é a mais perto.
3. Clique em **Create new project** e espere uns 2 minutos.

---

## Passo 3 · Criar as tabelas

1. No menu da esquerda, clique em **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo `jarvis/supabase/schema.sql` (o que você acabou de baixar),
   selecione **tudo** e copie.
4. Cole na caixa do SQL Editor e clique em **Run** (ou Ctrl+Enter).
5. Deve aparecer **Success. No rows returned**. É isso — as tabelas existem.

> Se der erro em vermelho, copie a mensagem e me manda. Quase sempre é o arquivo
> ter sido colado pela metade.

---

## Passo 4 · Copiar as chaves

1. No Supabase, vá em **Project Settings** (a engrenagem, embaixo à esquerda) →
   **API**.
2. Copie os dois valores:
   - **Project URL** — algo como `https://abcdefgh.supabase.co`
   - **anon / public** (também chamada de *publishable*) — uma chave longa
3. Na pasta `jarvis`, crie um arquivo chamado **`.env.local`** e cole:

```
NEXT_PUBLIC_SUPABASE_URL=cole_a_project_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_a_chave_anon_aqui
NCBI_EMAIL=seu-email@exemplo.com
```

> ⚠️ **Não** copie a chave `service_role`. Ela é outra, é secreta, e não é a
> desta variável.
>
> O `.env.local` nunca vai para o GitHub — já está no `.gitignore`.

---

## Passo 5 · Pegar uma chave de IA

Escolha um dos dois. Dá para configurar os dois e trocar depois dentro do app,
em **Configurações**.

### Opção grátis — Gemini (recomendo começar por aqui)

1. Entre em <https://aistudio.google.com/apikey>
2. Clique em **Create API key** e copie.
3. Acrescente no `.env.local`:

```
GEMINI_API_KEY=cole_aqui
```

**O preço escondido:** no plano gratuito do Gemini, o Google pode usar suas
conversas para melhorar os produtos deles, **inclusive com revisão humana**.
Para estudar fisiologia isso provavelmente não te incomoda — mas você precisa
saber que é assim.

### Opção paga — Claude (escreve resumo bem melhor)

1. Entre em <https://console.anthropic.com> → **API keys** → **Create key**.
2. Você precisa pôr crédito (o mínimo costuma ser US$ 5, e dura bastante).
3. Acrescente no `.env.local`:

```
ANTHROPIC_API_KEY=cole_aqui
```

---

## Passo 6 · Rodar

```bash
npm run dev
```

Abra <http://localhost:3000> no navegador.

- Se faltar alguma coisa, ele te leva sozinho para uma tela dizendo **o que**
  falta.
- Para conferir se está tudo certo, abra <http://localhost:3000/diagnostico>.
  Ela testa banco, PubMed e IA separadamente e diz qual dos três tem problema.

**Crie sua conta** em `/criar-conta`. É uma vez só — depois o navegador te mantém
logado.

> **Dica de segurança:** depois de criar a sua conta, vá no Supabase em
> **Authentication → Sign In / Providers** e **desligue** *Allow new users to
> sign up*. Assim ninguém mais consegue criar conta no seu Jarvis.

---

## Como se usa

1. **Crie uma tutoria.** Ex.: "Tutoria 1 — Dor torácica".
2. **Crie a situação-problema** e **cole o enunciado** que você recebeu. Isso
   importa mais do que parece: é o contexto principal que o Jarvis recebe.
3. **Converse.** Coisas que funcionam bem:
   - *"Tira os objetivos de aprendizagem desse enunciado."*
   - *"Vamos estudar o objetivo 2. Eu já sei X, mas travei em Y."*
   - *"Isso está atualizado? Procura diretriz dos últimos 5 anos."*
   - *"Salva isso como resumo."*
4. **Abra o resumo** e use **Imprimir / salvar em PDF**. Sai limpo, sem menu.

O Jarvis lembra de você entre as conversas. O que ele anotou fica visível — e
apagável — em **Configurações**.

---

## Quando alguma coisa der errado

| Sintoma | O que é |
|---|---|
| Tela mandando para `/comece-aqui` | Falta chave no `.env.local`. A própria tela diz qual. |
| Editei o `.env.local` e nada mudou | O Next só lê ao iniciar. Ctrl+C no terminal e `npm run dev` de novo. |
| "Não consegui alcançar ...supabase.co" | URL errada, **ou** o projeto pausou. No plano gratuito ele pausa após 1 semana sem uso — entre no painel e clique em **Restore**. |
| "as tabelas não existem" | O passo 3 não rodou. Repita. |
| A conversa falha, mas o resto funciona | Chave de IA. Teste em `/diagnostico`. |
| "A cota do Gemini estourou" | Limite do plano gratuito. Espere alguns minutos. |

---

## O que ainda não existe

- **Cobrança e planos.** De propósito — você pediu sem isso.
- **Deploy.** Roda só na sua máquina. Para pôr no ar depois é importar na Vercel
  e colar as mesmas variáveis.
- **Streaming.** A resposta aparece inteira quando fica pronta. Com busca no
  PubMed no meio, leva alguns segundos.
- **Teste real ponta a ponta.** O ambiente onde isto foi escrito não alcança o
  PubMed nem as APIs de IA. O parse do PubMed e o renderizador têm 50 testes
  automatizados; a conversa de verdade, com chave de verdade, **você vai ser o
  primeiro a rodar**. Se quebrar, me manda o erro que eu conserto.
