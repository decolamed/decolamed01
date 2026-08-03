# Relatório da auditoria final — Decola Med

Data: 03/08/2026 · Branch `claude/decola-med-app-design-hdor3m`
Projeto Supabase: `cdoukrnmdsrlcbxusojm`

---

## 0. Limitação de ambiente — leia antes do resto

Duas seções do roteiro pedido **não puderam ser executadas neste ambiente**, e
isso está declarado aqui em vez de marcado como concluído:

| Seção pedida | Situação |
|---|---|
| 1. Testes funcionais clicando em cada botão | **Não executada** |
| 2. Fluxos completos aluno/admin no app rodando | **Não executada** |

Motivo, verificado (não suposto):

* O contêiner desta sessão não alcança o Supabase. Qualquer conexão a
  `cdoukrnmdsrlcbxusojm.supabase.co` devolve `CONNECT tunnel failed,
  response 403` no proxy de saída — é política de rede da organização, não
  configuração da aplicação.
* Não há `.env` no contêiner e a `SUPABASE_SERVICE_ROLE_KEY` (exigida por
  `createAdminClient()`) não é obtível aqui.
* Consequência prática: `next start` sobe, mas **toda rota que toca o banco
  responde 500** com `Your project's URL and API key are required`. Um teste
  de clique nesse estado mede o erro de configuração, não a funcionalidade.

Isso invalidou uma rodada anterior de testes com Playwright: os achados
"rota desprotegida" e "escalação de privilégio" daquela rodada eram **falsos
positivos** — as páginas quebravam com 500 *antes* de o redirecionamento de
autenticação rodar, e o script leu "não redirecionou" como "não protegido".
Estão descartados.

O que foi feito no lugar: verificação estática exaustiva do código e
verificação **dinâmica no banco de produção** via MCP do Supabase, incluindo
simulação de sessões (`SET ROLE anon` / `SET ROLE authenticated` com claim
JWT), que é teste real de comportamento — só não passa pelo navegador.

**Pendência de aceitação:** os fluxos de clique precisam ser percorridos uma
vez num ambiente com `.env` preenchido (local ou preview da Vercel) antes de
considerar a plataforma liberada.

---

## 1. Segurança

### 1.1 Guardas de rota e de ação (estático)

* **45 arquivos `page.tsx`** — todos com guarda:
  `requireAdmin` (26), `requireAcessoAluno` (16), `requireAluno`,
  `requirePreviewAluno`, `requireProfessor`. `/parceiro` com `requireParceiro`.
* **Toda server action exportada** tem verificação de permissão na primeira
  linha. Nenhuma exceção encontrada.

### 1.2 RLS no banco (dinâmico)

* **Nenhuma tabela pública sem RLS habilitado.**
* Isolamento entre alunos, medido com sessão simulada de um aluno real:

  | Tabela | Linhas visíveis | Linhas de outro aluno |
  |---|---|---|
  | respostas_aluno, aluno_missoes, copiloto_recomendacoes, simulado_tentativas, atividade_tentativas | próprias | **0** |
  | aluno_briefing, matriculas, relatos_erro | próprias | **0** |
  | pagamentos | 1 de 2 (a sua) | **0** |
  | profiles | 1 de 3 (o seu) | **0** |
  | configuracoes_secretas (chave Gemini), cupons, comissoes_parceiro | **0** | — |

### 1.3 Problema encontrado e corrigido — banco de conteúdo aberto ao público

**Achado.** A chave publicável (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) vai no bundle
do navegador — é pública por definição. Com ela, um visitante **sem conta**
conseguia baixar, direto pela API REST:

```
GET /rest/v1/questoes?select=*             → 396 questões, com gabarito e explicação
GET /rest/v1/flashcards?select=*           → 352 flashcards
GET /rest/v1/conteudos_biblioteca?select=* → 254 aulas / PDFs / links
```

Mais `trilha_dias` (40), `materias_peso`, `simulado_questoes`,
`atividade_questoes`, `simulados`, `atividades`, `banners`. Ou seja: todo o
material vendido pela plataforma, de graça e sem cadastro. Confirmado
executando as consultas com `SET ROLE anon`.

**Verificação antes de mexer.** Nenhum código do navegador lê essas tabelas —
`lib/supabase/client.ts` só é usado para `auth.signOut()`,
`auth.updateUser()` e o upload do ícone no admin. Todas as leituras de
conteúdo acontecem em Server Components e server actions, que já rodam atrás
de `requireAcessoAluno()`/`requireAdmin()`.

**Correção** (migrações `conteudo_pago_exige_sessao` e
`biblioteca_e_avaliacoes_exigem_sessao`): as políticas de SELECT passaram a
exigir sessão — `(ativo = true and auth.uid() is not null) or is_admin()`.

**Depois da correção**, um anônimo enxerga exatamente o que a página de vendas
precisa e nada mais:

| Tabela | Visível para anônimo |
|---|---|
| `planos` (ativos) | 3 |
| `configuracoes` (marca, WhatsApp, Instagram — sem segredos) | 6 |
| **todo o resto** | **0** |

`planos` e `configuracoes` ficaram públicos **de propósito**:
`/inscricao/[slug]`, `/api/matricula` e `/api/cupons/validar` rodam antes de
existir sessão. Os segredos ficam em `configuracoes_secretas`, que é
`is_admin()` apenas.

Sem regressão: um aluno logado continua vendo 396 questões, 352 flashcards,
254 conteúdos, 40 dias de trilha, simulados, atividades e banners.

---

## 2. Consistência dos dados

Dez verificações, **todas com resultado 0**:

| Verificação | Resultado |
|---|---|
| Simulados sem questões | 0 |
| Atividades sem questões | 0 |
| `simulado_questoes` apontando para questão inexistente | 0 |
| `atividade_questoes` apontando para questão inexistente | 0 |
| Itens de trilha com `ref_id` inexistente | 0 |
| Itens de trilha sem `url` e sem `ref_id` (cartão que não abre nada) | 0 |
| Questões sem alternativas | 0 |
| Questões com resposta fora das alternativas | 0 |
| Flashcards sem frente ou sem verso | 0 |
| Missões órfãs (aluno inexistente) | 0 |
| `profiles` sem `auth.users` correspondente | 0 |
| `auth.users` sem `profiles` correspondente | 0 |

Integridade do conteúdo importado:

* 396 questões — impressão digital agregada `4ef6a3f6ccaeaef7f4d6c220c8f7a78d`,
  conferida contra os 10 arquivos `.md` de origem.
* 352 flashcards — ordem `1..352` sem furo nem repetição, idêntica ao arquivo.
* **Zero** registros ainda com matéria "Português" em questões ou flashcards:
  a unificação em "Linguagens" está completa no banco, não só na tela.

---

## 3. Algoritmo e Copiloto

### 3.1 Nada de valor fixo no código

`lib/copiloto/configuracao.ts` carrega **11 parâmetros** da tabela
`configuracoes` (prefixo `copiloto.`), com os valores antigos servindo apenas
de padrão para instalação nova:

* duração de missão por tipo — questões, flashcards, revisão, aula, simulado
* máximo de recomendações por modo — generoso, equilibrado, cirúrgico
* dias para entrar em modo cirúrgico
* mínimo de dias livres
* máximo de dias alterados por rodada

**Prova de efeito real** (feita e depois desfeita, banco restaurado): gravar
`copiloto.duracao.questoes = 55` e `copiloto.dias_modo_cirurgico = 21` em
`configuracoes` e ler de volta pelo caminho do algoritmo devolveu os valores
novos — a tela do admin muda o comportamento, não só a aparência.

### 3.2 Origem dos dados do motor

`motor.ts` lê tudo do banco: `respostas_aluno`, `simulado_tentativas`,
`materias_peso`, `aluno_briefing`, `questoes`, `flashcards`, `trilha_dias` e
`configuracoes`. Do briefing consome `horasPorDia`, `diasEstuda`, `dataProva`
e `sentimentos` — nenhum campo coletado do aluno fica sem uso.

Pontos de consumo da configuração conferidos linha a linha: 251 (carga), 343
(`diasParaModoCirurgico`/`diasLivresMinimos`), 455/494/553 (`duracaoPorTipo`),
548 (`maxDiasModificadosPorExecucao`), 1247 (`maxRecomendacoes`).

### 3.3 Produção sob demanda

`produzirMaterialSobDemanda()` checa cobertura antes de gerar (nunca duplica),
e **nunca lança**: sem Gemini ou YouTube configurados, devolve
`produziu: false` e o Copiloto segue com o material existente. O vídeo é
escolhido entre candidatos **reais** da API do YouTube — a IA só seleciona,
não inventa URL. Tudo registrado em `copiloto_producoes_ia`.

### 3.4 Dia da prova

Garantido em duas camadas: gatilho no banco
(`missao_nao_cai_no_dia_da_prova`) e nas quatro telas que listam missões.
Nenhuma missão é gerada nem exibida na data da prova.

---

## 4. Desempenho

* **Sem N+1 na tela mais pesada.** `/aluno` faz as 27 consultas num único
  `Promise.all` — não há consulta dependente em laço.
* **Índices:** das 19 colunas quentes de filtro, 18 já tinham índice. A única
  faltando era `conteudos_biblioteca (materia, assunto)`, usada a cada rodada
  do Copiloto por aluno — índice parcial criado (migração
  `indice_biblioteca_materia_assunto`).
* **Advisor de desempenho do Supabase:** 260 avisos, nenhum de correção
  obrigatória — 221 `multiple_permissive_policies` (efeito do padrão
  `admin_all` + `select_own`, que é o que garante a segurança), 33
  `unused_index` (esperado num banco novo) e 6 `no_primary_key`, todos em
  tabelas de backup das importações (`*_antes`, `*_2026_08_02`).
  Nenhum aviso `auth_rls_initplan`.

---

## 5. Responsividade

O padrão do painel administrativo é `components/admin/tabela-responsiva.tsx`:
uma única definição de colunas gera **tabela de verdade no desktop**
(`hidden md:block`) e **um cartão por registro no celular** (`md:hidden`) —
sem dois blocos de marcação para manter em sincronia.

Nesta rodada foram convertidas as duas últimas tabelas escritas à mão, no
perfil do aluno dentro do admin (`/admin/usuarios/[id]`): histórico de
pagamentos (6 colunas — o pior caso, obrigava a arrastar a tela de lado num
celular de 360px) e outras matrículas (4 colunas).

Varredura final: **nenhum `<table>` cru restante** em nenhuma tela do admin, e
nenhum `min-w-[...]` capaz de forçar rolagem horizontal no celular.

---

## 6. Produção

* `npx tsc --noEmit` — **limpo**, zero erros.
* `npx next build` — **limpo**, zero erros e zero avisos. 60 rotas compiladas.
* Nenhum arquivo `.env` no repositório nem no ZIP; só `.env.example` em branco.
* Nenhuma chave de API real em nenhum arquivo versionado (varredura por
  padrões `AIza…`, `eyJhbGciOi…`, `sk-…`, `$aact_…` — só há verificações de
  prefixo dentro de `lib/asaas/client.ts`).
* A chave do Gemini continua em `configuracoes_secretas`, com RLS
  restrita a admin.

*Erros de console e de hidratação em execução não foram medidos* — dependem
do app rodando contra o banco, que é a limitação da seção 0.

---

## 7. Limpeza pós-auditoria

O banco foi devolvido ao estado anterior à auditoria:

* As duas linhas de `configuracoes` criadas para provar o efeito da
  configuração foram **apagadas** (não existiam antes).
* As contas temporárias `auditoria.admin@teste.local` e
  `auditoria.aluno@teste.local` foram **removidas** de `public.matriculas`,
  `public.profiles`, `auth.identities` e `auth.users`.
* Confirmado depois: 3 usuários reais, 3 profiles, nenhuma conta `teste.local`,
  nenhuma chave `copiloto.*` sobrando.
* Processo `next start` da auditoria encerrado.

---

## 8. Pendências

| # | Pendência | Gravidade |
|---|---|---|
| 1 | **Percorrer os fluxos de clique** (aluno e admin) num ambiente com `.env` — seções 1 e 2 do roteiro, impossíveis aqui (ver seção 0). | **Bloqueante para liberação** |
| 2 | `git push` está bloqueado neste contêiner (403 no proxy git). Os commits estão locais em `claude/decola-med-app-design-hdor3m` e precisam ser enviados de um ambiente com acesso. | **Bloqueante para deploy** |
| 3 | RLS exige *sessão*, não *matrícula ativa*. Um aluno com acesso expirado ainda passaria pela RLS — mas é barrado por `requireAcessoAluno()` no servidor, que é por onde todo o app passa. Endurecer a RLS seria defesa em profundidade. | Baixa |
| 4 | Os pesos internos de remarcação (`PESO_TIPO`, `IMPORTANCIA_MINIMA`, `MAX_POR_RODADA` em `copiloto/pendencias.ts`) e `MIN_FLASHCARDS_ACEITAVEL` continuam fixos no código. São heurísticas internas de ordenação, não configurações que o admin pediu para controlar; expor as 13 na tela poluiria o painel. Ficam registradas caso se queira torná-las configuráveis. | Baixa |
| 5 | Seis tabelas de backup das importações (`questoes_2026_08_02`, `flashcards_2026_08_02`, `trilha_dias_antes`, `trilha_dias_antes_titulos`, `materias_antes`, `conteudos_antes`) continuam no banco. Estão com RLS e invisíveis para anônimo e para aluno. Foram mantidas de propósito — são o backup do conteúdo original — e só devem ser removidas por decisão explícita. | Informativa |
| 6 | `TableCard` (em `components/admin/card.tsx`, com `min-w-[720px]`) ficou sem uso após a migração para `TabelaResponsiva`. Não quebra nada; é candidato a remoção numa limpeza futura. | Informativa |

---

## 9. Resumo das correções desta rodada

1. Banco de conteúdo fechado para visitantes anônimos — 396 questões com
   gabarito, 352 flashcards e 254 conteúdos deixaram de ser baixáveis sem
   conta (2 migrações).
2. Índice criado em `conteudos_biblioteca (materia, assunto)` — a única
   coluna quente de filtro sem índice.
3. Duas últimas tabelas do admin convertidas para o padrão responsivo
   (cartões no celular) em `/admin/usuarios/[id]`.
4. Banco restaurado ao estado pré-auditoria (linhas de teste e contas
   temporárias removidas).
