# Auditoria geral da plataforma — Decola Med

Data: 19/08/2026 · Branch `claude/decola-med-app-design-hdor3m` · Commit `0db4c95`
Projeto Supabase: `cdoukrnmdsrlcbxusojm`

---

## 0. O que pôde e o que não pôde ser testado

Isto vem antes de tudo porque muda como o resto do relatório deve ser lido.

**Não foi possível navegar pela plataforma.** A saída de rede desta sessão
recusa conexão com `decolamed01.vercel.app` e com `cdoukrnmdsrlcbxusojm.supabase.co`
(`CONNECT tunnel failed, response 403` no proxy — política de rede do ambiente,
não configuração da aplicação). Sem isso não há como clicar em botões, medir
tempo de carregamento, ver o console do navegador ou testar responsividade em
telas reais. Subir a aplicação localmente também não resolve: ela precisaria
alcançar o mesmo Supabase bloqueado.

**O que foi testado de verdade:** o banco de produção, por SQL, incluindo
execução de ataques reais contra as políticas de segurança em transações
desfeitas ao final. Esse canal é forte justamente onde mais importa — foi
assim que a falha crítica apareceu, e foi assim que a correção foi conferida.

| Frente | Como foi verificada |
|---|---|
| Permissões e RLS | **Teste real** — impersonação de aluno/admin/service role no banco |
| Integridade de dados | **Teste real** — 15 consultas de consistência |
| Cálculo de vendas e período | **Teste real** — totais conferidos por SQL contra a regra do código |
| Cobrança duplicada | **Evidência real** — 5 casos encontrados no banco |
| Fluxo de pagamento, checkout, parcelamento | Leitura de código + verificação das travas no banco |
| Formulários, navegação, cálculos | Leitura de código + testes automatizados |
| Responsividade, console, tempo de carga | **Não verificado** — exige navegador |

---

## 1. Problemas encontrados

### 1.1 CRÍTICO — Qualquer aluno logado conseguia virar administrador

**Onde:** política `profiles_update_own_or_admin`, tabela `public.profiles`.

**Causa.** A política permite que a pessoa edite a própria linha:

```
USING      ((auth.uid() = id) OR is_admin())
WITH CHECK ((auth.uid() = id) OR is_admin())
```

A regra prende a **linha** ao dono, mas não diz nada sobre as **colunas** — e a
linha do próprio usuário contém `role`. Com a chave anônima que vai no pacote
JavaScript do navegador (pública por definição), isto bastava:

```
PATCH /rest/v1/profiles?id=eq.<meu_id>    {"role":"admin"}
```

**Verificação, no banco de produção, em transação desfeita.** Passei-me pela
aluna Clara (papel de banco `authenticated`, `auth.uid()` = id dela,
`is_admin()` = `false`) e executei só o UPDATE acima:

```
--> UPDATE profiles SET role=admin WHERE id=EU: 1 linha
is_admin() DEPOIS: t
pagamentos de todos: 4
perfis de todos: 6
precos de plano reescritos: 4
```

Ou seja: um cliente pagante podia ler o faturamento inteiro, os dados pessoais
de todos os alunos, e reescrever o preço dos planos.

**Correção.** Migração `068_perfil_nao_muda_o_proprio_papel.sql`. Um gatilho
`BEFORE UPDATE` congela `role`, `ativo`, `plano_id`, `criado_por` e
`criado_manualmente` para quem chega como `authenticated` sem ser admin. A
política **não** foi alterada — mexer nela quebraria o painel. Nome, e-mail,
telefone e CPF seguem editáveis. Nenhuma escrita em `profiles` parte do
navegador hoje (todas passam por server action com service role), então nada
do produto muda.

**Detalhe que quase passou:** a primeira versão do gatilho reconhecia a service
role por `current_user` e **não funcionava** — dentro de uma função
`SECURITY DEFINER`, `current_user` é o *dono* da função (postgres), não quem
chamou, então o gatilho liberava tudo. O reteste é que mostrou isso. A versão
final lê o papel do JWT da requisição.

**Reteste (mesma transação desfeita):**

```
[ok] virar admin: BLOQUEADO
[ok] alterar ativo: BLOQUEADO
[ok] trocar plano_id: BLOQUEADO
[ok] mexer em criado_por: BLOQUEADO
[ok] editar nome/telefone: continua funcionando (1 linha)
[ok] is_admin() ao final: f
[ok] admin promove/rebaixa: continua funcionando (1 linha)
[ok] service role (painel): muda papel / desativa / altera vínculos — 1 linha cada
```

---

### 1.2 ALTO — A mesma compra virava duas cobranças no Asaas

**Onde:** `POST /api/matricula`.

**Causa.** O botão do formulário se desabilita durante o envio, então o duplo
clique imediato já era evitado. O que não era evitado é o **reenvio alguns
segundos depois** — a pessoa volta, acha que não funcionou e confirma de novo.
Cada confirmação criava um `pre_cadastros` novo e uma cobrança nova.

**Evidência, no banco:** cinco casos, com intervalos de 9 a 36 segundos.

| E-mail | Cobranças | Intervalo | Cobranças Asaas emitidas |
|---|---|---|---|
| matheusbs0002@gmail.com | 2 | 36s | `pay_br4ds00c0yx4xy0k`, `pay_3k35yy24p2nlls3d` |
| decolamed0001@gmail.com | 2 | 16s | (antes da integração) |
| speed815xs@gmail.com | 3 | 9s | (antes da integração) |
| decolamed0001@gmail.com | 3 | 13s | (antes da integração) |
| alunodecolamed@gmail.com | 3 | 12s | (antes da integração) |

No primeiro caso, **duas cobranças reais** foram emitidas para a mesma pessoa e
o mesmo plano. Duas cobranças em aberto significam que o cliente pode pagar as
duas — e aí a plataforma precisa estornar.

**Correção.** Antes de emitir, a rota procura uma cobrança recente da mesma
pessoa para o mesmo plano (janela de 30 minutos) e pergunta o estado dela ao
próprio Asaas. Se ainda está em aberto e com **exatamente** os mesmos termos —
forma de pagamento, valor em centavos e número de parcelas — devolve aquela em
vez de emitir outra. Qualquer diferença (trocou de Pix para boleto, aplicou um
cupom, mudou as parcelas) é compra nova e ganha cobrança nova.

A regra ficou num módulo puro com 11 testes (`cobranca-reaproveitavel.ts`), e
recusa em toda dúvida: status desconhecido gera cobrança nova, porque no pior
caso emitimos uma a mais — nunca mandamos o cliente para um boleto cancelado.

**De quebra:** o cálculo do parcelamento subiu para antes da gravação do
pré-cadastro. Antes, um pedido de 12x num plano de 3x devolvia 400 mas já tinha
deixado uma linha órfã em `pre_cadastros`.

---

### 1.3 ALTO — Resposta de questão podia sumir sem ninguém saber

**Onde:** `registrarResposta`, em `src/app/(aluno)/aluno/questoes/actions.ts`.

**Causa.** O erro do `insert` em `respostas_aluno` era descartado, e a função
devolvia `ok: true` de qualquer jeito. Se a gravação falhasse, o aluno veria
"acertou/errou" e a explicação normalmente, mas a resposta não existiria no
banco — XP, precisão, Raio X, ranking e o histórico do Copiloto passariam a
contar uma questão a menos, sem sinal na tela nem no log.

**Situação hoje:** a falha é **latente, não ativa**. Conferi as políticas de
`respostas_aluno` (`aluno_id = auth.uid() OR is_admin()`, para todos os
comandos) e elas permitem a gravação normalmente. O defeito é a ausência de
rede de proteção, não uma perda em curso.

**Correção.** O erro passa a ser registrado com aluno e questão, e o retorno
traz `registrada: boolean`. A correção da questão continua aparecendo mesmo se
a gravação falhar — o aluno respondeu e merece ver o resultado —, mas agora
quem chama *sabe* se a resposta entrou na contagem.

---

### 1.4 MÉDIO — 61 consultas de leitura descartam o erro

**Onde:** páginas do aluno e do admin, no padrão `const { data } = await supabase…`.

**Causa.** Quando a consulta falha, `data` vem nulo e a tela renderiza "nenhum
registro" — indistinguível de "realmente não há registros".

**Este padrão já causou dois incidentes reais nesta plataforma:** a página de
Matrículas dizendo "Nenhuma matrícula ainda" com 5 matrículas ativas no banco
(corrigido no commit `78ed172`), e os planos que "não salvavam" quando na
verdade o banco recusava o slug duplicado.

**Correção parcial, deliberada.** Corrigi os casos de impacto comprovado
(Matrículas, Vendas). Os outros 59 **não** foram alterados: reescrevê-los seria
a refatoração geral que você pediu para não fazer, e nenhum deles tem impacto
demonstrado. Fica registrado como dívida conhecida, com a recomendação de
tratar sempre que uma dessas telas for tocada por outro motivo.

---

### 1.5 BAIXO — Nove tabelas de backup esquecidas no schema

`conteudos_antes`, `flashcards_2026_08_02`, `flashcards_materia_antes_literatura`,
`materias_antes`, `questoes_2026_08_02`, `questoes_antes_conversao_latex`,
`questoes_materia_antes_split_idioma`, `trilha_dias_antes`,
`trilha_dias_antes_titulos`.

São cópias de segurança de migrações passadas. Estão com RLS ligado e **sem
nenhuma política**, ou seja, inacessíveis pela API — não são um risco de
segurança. São peso morto no schema e aparecem em toda listagem de tabelas.

**Não apaguei.** São dados, a decisão de descartá-los é sua. Diga e eu removo.

---

### 1.6 BAIXO — Ajustes de segurança recomendados pelo Supabase

Três configurações que dependem do painel do Supabase (não tenho acesso):

- **Proteção contra senhas vazadas desligada.** Ativar em Authentication →
  Policies faz o Supabase recusar senhas já expostas em vazamentos conhecidos.
- **Expiração de OTP acima de uma hora.** O recomendado é menos de uma hora.
- **View `ranking_geral` com `SECURITY DEFINER`.** Ela ignora o RLS de quem
  consulta. É provavelmente intencional (um ranking precisa mostrar todo mundo),
  mas vale conferir se ela expõe só nome e pontuação, e não e-mail.

---

### 1.7 BAIXO — Desempenho: 13 políticas reavaliam `auth` por linha

Tabelas: `banners`, `trilha_dias`, `questoes`, `flashcards`, `simulados`,
`atividades`, `conteudos_biblioteca`, `materias_peso`, `simulado_questoes`,
`atividade_questoes`, `aluno_rota_dias_ajustes`, `aluno_simulados_rota`,
`questoes_contexto_incorporado`.

Elas chamam `auth.uid()`/`is_admin()` uma vez por linha em vez de
`(select auth.uid())`. A maioria das políticas do projeto já usa a forma
otimizada; estas 13 ficaram para trás. Com o volume atual é imperceptível.

**Não alterei.** São políticas de segurança, e reescrevê-las por desempenho, no
meio de uma auditoria cujo achado principal foi justamente uma política mal
escrita, é risco desproporcional ao ganho. Fica como recomendação.

Também há 2 chaves estrangeiras sem índice (`aluno_simulados_rota`,
`questoes_contexto_incorporado`) e 16 índices nunca usados.

---

## 2. O que foi verificado e está correto

Isto também é resultado de auditoria — vale tanto quanto a lista de problemas.

**Permissões**
- Todas as tabelas têm RLS ligado. As únicas sem política são as 9 de backup, que ficam inacessíveis.
- **Todas** as páginas de `/admin` chamam `requireAdmin`. Nenhuma exceção.
- **Todas** as server actions têm guarda de permissão (`requireAdmin`, `requireAcessoAluno`, `requireProfessor`, `requireParceiro`). Nenhuma exceção.
- Aluno não enxerga perfil, matrícula, resposta, briefing ou cupom de outra pessoa — testado por impersonação: `0` em cada caso.
- Toda política de escrita não-admin prende a linha ao dono (`aluno_id = auth.uid()`). `profiles` era a única exceção, agora corrigida.
- `redefinir_perfil_aluno` (que apaga o progresso inteiro de um aluno) não é executável por `anon`, e verifica permissão para `authenticated`.

**Segredos**
- Só três variáveis `NEXT_PUBLIC_` existem: URL do site, URL do Supabase e chave anônima — todas públicas por design.
- Nenhuma chave de Asaas, Resend, Gemini ou service role aparece em componente client.
- Nenhuma chave literal no código. Nenhum `.env` versionado.

**Integridade dos dados** — 15 verificações, todas limpas: nenhuma matrícula ativa
sem aluno, nenhum pagamento órfão, nenhum perfil sem usuário de autenticação,
nenhum slug de plano duplicado, nenhum valor negativo, nenhuma configuração de
parcelamento inválida.

**Pagamento**
- O preço vem sempre do banco. O cupom é revalidado no servidor mesmo já tendo passado por `/api/cupons/validar`.
- O número de parcelas vindo do navegador é conferido contra o teto do plano; fora do teto, 400.
- O valor exibido e o valor enviado ao gateway saem da mesma função.
- O webhook exige o token e devolve 503 se `ASAAS_WEBHOOK_TOKEN` não estiver configurada — nunca "libera por omissão".
- A idempotência tem trava no banco, não só no código: índices únicos em `matriculas.pre_cadastro_id` e `pagamentos.asaas_payment_id`.
- O front nunca declara pagamento. `/api/matricula/status` pergunta ao Asaas e, se o Asaas estiver fora do ar, responde "pendente" — nunca um falso negativo que mande o aluno para a tela de sucesso sem conta criada.

**Acesso do aluno** — `verificarAcessoMatricula` roda no servidor, sob RLS, com
o relógio do servidor, e trata os cinco casos (sem matrícula, pendente,
bloqueada, cancelada, expirada) com mensagem própria.

**Funcionalidades recentes** (o item 8 do seu pedido) — todas continuam
passando: parcelamento por plano (22 testes), limite de parcelas e juros,
filtros de vendas e total do período (29 testes), fluxo de compra, Pix, boleto,
cartão. **471 testes, 471 passando.** Typecheck e build limpos.

---

## 3. Problemas que não puderam ser corrigidos

| Item | Por quê | O que seria necessário |
|---|---|---|
| Erros no console do navegador | Sem acesso HTTP à aplicação | Rodar a auditoria de um ambiente que alcance `decolamed01.vercel.app` |
| Responsividade em telas reais | Idem | Idem — ou você abrir em celular/tablet e me dizer o que quebra |
| Tempo de carregamento, requisições duplicadas | Idem | Idem |
| Senhas vazadas, expiração de OTP | Configuração do painel Supabase, sem MCP nem token de gestão | Você ativar em Authentication → Policies |
| Tabelas de backup | São dados; apagar é decisão sua | Sua autorização |
| 13 políticas lentas | Risco desproporcional ao ganho agora | Uma rodada dedicada, com reteste de permissão política a política |
| 59 leituras que descartam erro | Seria a refatoração geral que você pediu para não fazer | Tratar quando cada tela for tocada |

---

## 4. Testes realizados após as correções

1. Ataque de escalação de privilégio, repetido contra a correção — **bloqueado**.
2. Aluno alterando `ativo`, `plano_id`, `criado_por` — **bloqueado** em cada um.
3. Aluno editando o próprio nome e telefone — **continua funcionando**.
4. Admin promovendo e rebaixando usuário — **continua funcionando**.
5. Service role (o caminho do painel) alterando papel, status e vínculos — **continua funcionando**.
6. Leitura cruzada aluno → dados de outro aluno — **0 linhas** em perfis, matrículas, respostas, briefings e cupons.
7. Regra de reaproveitamento de cobrança — 11 testes: paga não reaproveita, cancelada não reaproveita, status desconhecido não reaproveita, forma/valor/parcelas diferentes não reaproveitam, termos idênticos reaproveitam.
8. Total de vendas por período — conferido por SQL em 7 janelas (tudo, mês, dia único, últimos 30 dias, período vazio).
9. Integridade referencial — 15 consultas.
10. Suíte completa: **471 testes, 471 passando**. Typecheck limpo. Build compilando.

---

## 5. Resultado final

**A plataforma está funcionando, e agora está segura para receber dinheiro
real.** O achado 1.1 era grave o bastante para justificar sozinho esta
auditoria: qualquer um dos seus alunos pagantes podia, do próprio navegador,
virar administrador e ver o faturamento inteiro. Estava aberto desde que a
política foi escrita. Está fechado e conferido.

Os outros dois achados relevantes tocam dinheiro e confiança nos números:
cobrança duplicada (com dois casos reais já emitidos) e perda silenciosa de
resposta.

**Ainda precisa de atenção:**

1. **A correção crítica está no banco de produção, mas o código desta branch não
   está em produção.** A migração 068 já vale agora — o buraco está fechado no
   Supabase que a aplicação usa. As correções de código (cobrança duplicada,
   resposta perdida, Matrículas, total de vendas, parcelamento) só passam a
   valer com o deploy.
2. **Pendências suas, de sessões anteriores:** cadastrar o webhook no Asaas,
   colar os dois templates de e-mail no Supabase, ligar o parcelamento nos
   planos desejados.
3. **A venda real do Matheus (R$ 7,00) não está em `pagamentos`** — a conversão
   rodou dois minutos antes do deploy que corrigiu isso. Não entra em nenhum
   total. Posso inserir à mão se você quiser o histórico completo.
4. **Auditoria de navegador continua pendente** — console, responsividade e
   tempo de carga precisam de um ambiente com acesso HTTP à aplicação.
