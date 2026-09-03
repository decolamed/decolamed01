# Jarvis

Assistente de estudos para quem faz medicina por **PBL**.

Você conversa com ele sobre a situação-problema, ele pesquisa no **PubMed**, e o
que sobra do estudo não é um rolo de chat — é um **resumo formatado**, guardado
na pasta da tutoria certa, com as fontes numeradas no rodapé e pronto para
imprimir ou salvar em PDF.

```
Tutoria 1 — Dor torácica
  └── SP 1.1 — Homem de 58 anos com dor precordial
        ├── objetivos de aprendizagem
        ├── a conversa com o Jarvis
        └── os resumos salvos
  └── SP 1.2 — ...
```

---

## O que ele faz de diferente

**Pesquisa de verdade, e só quando faz sentido.** O prompt separa explicitamente
o que exige evidência (conduta, dose, número, critério diagnóstico, diretriz) do
que é livro-texto consolidado (anatomia, fisiologia básica). Ele não busca no
PubMed para dizer que o coração tem quatro câmaras, e não responde de cabeça
sobre esquema terapêutico.

**Não consegue inventar fonte.** Não por boa vontade do modelo: a ferramenta
`salvar_resumo` resolve **cada PMID contra o PubMed** antes de gravar. Se o
resumo citar um identificador que não existe, o resumo é **recusado** e o modelo
recebe de volta a lista do que precisa corrigir. O prompt pede; o código impede.
Ver `src/lib/jarvis/ferramentas.ts`.

**Lembra de você.** Ele anota fatos duradouros sobre o aluno (período,
faculdade, data de prova, dificuldade recorrente) e usa isso em todas as
tutorias. Tudo fica visível e apagável em `/configuracoes` — memória que não dá
para auditar não é memória, é um palpite escondido.

**O resumo é um documento.** Blocos de conceito, de aplicação clínica, de
atenção e de passo a passo; termos grifados; tabelas comparativas; citações
numeradas que levam à fonte. O CSS de impressão faz o `Ctrl+P → Salvar como PDF`
sair limpo, sem menu e sem barra lateral.

**Dois motores, trocáveis.** Claude (Anthropic) ou Gemini (Google), escolhido em
`/configuracoes`. A busca no PubMed é a mesma nos dois; o que muda é quem pensa
e escreve.

---

> **Quer só colocar para funcionar?** Vá direto para **[COMECE-AQUI.md](COMECE-AQUI.md)**
> — passo a passo, clique a clique, sem pressupor nada. Este README explica o
> projeto; aquele coloca no ar.

---

## Rodando

### 1. Dependências

```bash
npm install
```

### 2. Supabase

1. Crie um projeto em <https://supabase.com>.
2. No **SQL Editor**, rode o conteúdo inteiro de `supabase/schema.sql`. Isso cria
   tabelas, gatilhos, RLS e os GRANTs.
3. Em **Authentication → URL Configuration**, aponte a Site URL para o seu
   domínio e adicione `/auth/callback` às Redirect URLs.
4. Copie as chaves de **Project Settings → API**.

### 3. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha. **Configure pelo menos um**
dos dois motores de IA — a tela de configurações só oferece aquele cuja chave
existe no servidor.

A chave do NCBI é opcional (sem ela são 3 requisições por segundo; com ela, 10),
mas `NCBI_EMAIL` deve ser preenchido: é exigência da política de uso do PubMed, e
sem ele o bloqueio por IP é uma questão de tempo.

### 4. Desenvolvimento

```bash
npm run dev
```

### 5. Antes de subir

```bash
npm run typecheck   # tipos
npm run lint        # eslint
npm test            # 50 testes: PubMed, renderizador e os dois motores de IA
npm run build       # build de produção
```

---

## Como virar um repositório próprio

Este projeto foi escrito **autocontido de propósito**: `package.json`,
`node_modules`, banco, build e deploy são todos dele. Ele apenas mora dentro do
repositório `decolamed01` por uma limitação da sessão em que foi criado — não há
uma linha de código compartilhada com a Decola Med.

Para separar:

```bash
# de dentro da pasta jarvis/
git init
git add .
git commit -m "Jarvis: primeira versão"
git remote add origin git@github.com:SEU-USUARIO/jarvis.git
git push -u origin main
```

Depois, na Vercel: importe o repositório, adicione as mesmas variáveis de
ambiente do `.env.local` e ajuste `NEXT_PUBLIC_SITE_URL` para o domínio final.

---

## Mapa do código

```
src/
  app/
    (auth)/          entrar, criar conta
    (app)/
      tutorias/      as pastas e as situações-problema
      sp/[id]/       a tela de estudo: conversa + objetivos + resumos
      resumos/[id]/  o documento formatado, pronto para imprimir
      configuracoes/ motor de IA, nome, memória do Jarvis
    comece-aqui/     a tela que aparece quando falta configuração
    diagnostico/     testa banco, PubMed e IA separadamente, ao vivo
  lib/
    config.ts        confere o .env e diz o que falta, em português
    pubmed/          E-utilities do NCBI: busca, parse do XML, fila de saída
    ia/              a fronteira com o modelo
      claude.ts        laço de ferramentas com o SDK da Anthropic
      gemini.ts        o mesmo laço, na API da Google
    jarvis/
      prompt.ts        QUEM ele é — o arquivo mais importante do projeto
      ferramentas.ts   o que ele pode fazer, e a trava contra fonte inventada
      conversar.ts     um turno completo, do banco ao banco
    resumo/
      renderizar.ts    markdown estendido → HTML, com escape e citações
    supabase/        clientes: servidor (RLS), navegador, admin (sem RLS)
supabase/schema.sql  tabelas, gatilhos, RLS e GRANTs
src/middleware.ts    renovação de sessão e roteamento por login
                     (dentro de src/ porque o projeto usa src/ — na raiz o
                      Next ignora o arquivo, silenciosamente)
```

### Onde estão as decisões

Os arquivos comentam o **porquê**, não o quê. Se for mexer em algo, vale ler o
cabeçalho antes:

| Arquivo | O que ele decide |
|---|---|
| `src/lib/jarvis/prompt.ts` | Quando pesquisar, quando não, como conversar, como escrever o resumo |
| `src/lib/jarvis/ferramentas.ts` | A trava que impede fonte inventada |
| `src/lib/pubmed/client.ts` | Fila de requisições ao NCBI e o parse do XML (que tem cinco jeitos de dizer a mesma coisa) |
| `src/lib/resumo/renderizar.ts` | A gramática do resumo e o escape que torna seguro o `dangerouslySetInnerHTML` |
| `supabase/schema.sql` | RLS, e por que `usuario_id` é redundante nas tabelas filhas |
| `src/app/globals.css` | Por que essas classes não podem ser utilitários do Tailwind |

---

## O que ainda não existe

Sendo honesto sobre o estado disto:

- **Cobrança, planos e cotas.** Removidos de propósito: este build é para uso
  próprio. Quando virar produto, o teto por usuário precisa entrar ANTES do
  primeiro cliente — a unidade natural de cobrança aqui é a situação-problema,
  que é também a unidade real de custo.
- **Deploy.** Roda com `npm run dev` na sua máquina. Não há nada hospedado.
- **A fila do PubMed é por instância.** Rodando local, é exatamente o que se
  quer. Num deploy com várias instâncias, o teto real do NCBI é o desta fila
  vezes o número de instâncias.
- **Sem streaming.** A resposta chega inteira quando fica pronta. Com busca no
  PubMed no meio, isso pode levar alguns segundos.
- **Nunca rodou contra o Supabase nem contra as APIs de IA de verdade.** O
  ambiente onde foi escrito não alcança `eutils.ncbi.nlm.nih.gov` nem as APIs
  dos modelos. O que É coberto por teste: o parse do XML do PubMed, o
  renderizador do resumo, e o formato dos pedidos aos dois motores (o do Claude
  contra um servidor HTTP local, para testar a serialização real do SDK). O que
  falta é a primeira execução com chave de verdade — para isso existe a tela
  `/diagnostico`.
