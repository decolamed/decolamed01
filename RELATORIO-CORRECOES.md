# Relatório de correções — Decola Med

Referência: `PROMPT DE CORREÇÃO — DECOLA` (22 itens)
Branch: `claude/decola-med-app-design-hdor3m` · Projeto Supabase: `cdoukrnmdsrlcbxusojm`

---

## Como ler este relatório

Cada item traz **o que estava causando o problema de verdade**, não só o que
foi trocado. Vários itens tinham sido "corrigidos" antes sem sucesso porque a
causa estava em outro lugar — e em três casos o componente apontado como
defeituoso estava funcionando corretamente o tempo todo.

Legenda: ✅ corrigido · ⚠️ corrigido parcialmente · ❌ não foi possível

---

## Item a item

### 1. Relatos de erro não chegam ao painel — ✅

**O envio nunca esteve quebrado.** Há **7 relatos gravados** no banco, todos
com perfil válido e status `pendente`, dois deles **posteriores** à última
correção. A RLS de INSERT, a chave estrangeira `aluno_id → profiles`, a
consulta do admin e o item de menu (com contador de pendentes) estavam todos
corretos. Por isso as correções anteriores, focadas no envio, não resolviam.

**Causa raiz:** `RelatosManager` fazia `useState(inicial)`. Esse `useState` lê
a prop **só na primeira montagem**. Voltando à tela pela navegação do Next
(que reaproveita o componente já montado) ou após um `revalidatePath`, o
servidor mandava a lista atualizada e o componente continuava exibindo a
antiga — sem erro nenhum na tela nem no console.

**Corrigido:** ressincronização com o servidor a cada render; erro da consulta
do admin passa a ser registrado em vez de virar lista vazia silenciosa.

**Também corrigido no mesmo item:** a tela de sucesso do aluno aparecia
**antes** da confirmação do banco — numa falha de rede ele lia "Relato
enviado!" e nada era gravado. Agora só aparece depois do banco confirmar.

**Mensagem falsa removida:** *"enviado ao e-mail configurado pela equipe"*.
Não existe esse campo nem esse disparo. O texto agora diz o que de fato
acontece: o relato entra na fila de atendimento.

### 2. Voo Guiado recebe o cronograma fixo de 40 dias — ✅

O cronograma (`trilha_dias`) é uma sequência linear única compartilhada por
todos. Para o Decolando está certo. Para o Voo Guiado, um aluno com 20 dias
até a prova recebia os mesmos 40 — metade do conteúdo caía depois da prova.

**Corrigido:** o cronograma-base passa a ser **projetado na janela real do
aluno** (início → prova, contando só os dias da semana que ele marcou),
agrupando dias até caberem e respeitando as horas diárias informadas. Nada é
descartado. É uma projeção de leitura: `trilha_dias` continua intacta, então o
**Plano Decolando não foi tocado**. A mesma função é usada nas duas telas que
mostram cronograma, para não divergirem. O aluno vê um aviso explicando o
agrupamento, para não achar que perdeu material.

### 3. Revisão do Copiloto carrega questões da matéria errada — ✅

`montarRevisao` procurava o assunto no **acervo inteiro** (`q.tema === tema`,
sem olhar matéria) e só caía para a matéria se achasse menos de três. Como o
mesmo assunto existe em matérias diferentes — "Interpretação de Texto" e
"Gramática · Verbos" aparecem em Linguagens, Inglês e Espanhol —, uma revisão
intitulada "Física" podia abrir com questões de Espanhol.

**Corrigido:** a matéria é o primeiro filtro, sempre; o assunto refina dentro
dela. Como pedido, a associação passou a ser por matéria canônica em toda a
cadeia (identificação → título → questões).

### 4. "Já revisei" não persiste — ✅

**A gravação sempre funcionou.** O `UPDATE` tem política de RLS, roda com a
sessão do aluno e grava `status='concluida'`.

**Causa raiz:** a checagem de duplicidade do Copiloto filtrava
`status = 'pendente'`. No instante em que o aluno concluía, a recomendação
saía do conjunto verificado e a rodada seguinte criava **uma nova, idêntica**.
O aluno via o cartão sumir, recarregava e ele estava lá — mas era outro
registro.

**Corrigido:** a checagem passa a considerar também as já respondidas, e só
volta a recomendar o assunto se houver **erro novo depois da conclusão** — que
é a diferença entre revisão estratégica e repetição.

### 5. Revisão no cronograma não marca conclusão — ✅

A revisão diária do Copiloto era o único item da sequência que não nasce de
uma linha do banco: era derivada do desempenho a cada render, com
`done: false` fixo e `toggle: null`. Não havia como marcá-la, e ela reaparecia
intacta.

**Corrigido:** passou a usar a mesma trilha de progresso dos demais itens
(`aluno_progresso_itens`), com chave por dia e matéria. Permanece no
cronograma, marcada, entre sessões — não é removida ao concluir.

### 6. Revisões com flashcards não são geradas — ✅

A condição era `precisao < 35 && flashPorMat > 0`, e `flashPorMat` conta
**revisões já feitas pelo aluno**, não flashcards existentes. Para todo aluno
novo esse contador é zero, então a condição nunca era verdadeira.

**Corrigido:** quem decide agora é o inventário real de flashcards, e o limiar
subiu para 60% — flashcard é a ferramenta certa para lacuna de memorização.
A geração via Gemini já funcionava (há **20 flashcards e 4 vídeo-aulas**
produzidos por IA no banco); o que faltava era o tipo de recomendação ser
escolhido.

### 7. Aula indicada na revisão não abre — ✅

**Todas as 11 missões de aula do banco tinham `ref_id` nulo** — o motor nunca
gravava o vínculo. O app procurava `conteudos.find(c => c.id === m.ref_id)` e,
com `ref_id` sempre nulo, caía **sempre** em "Esta aula não está mais
disponível". A aula existia; o vínculo é que nunca foi criado.

**Corrigido em três frentes:** o inventário do Copiloto passa a carregar as
aulas com id e título; a missão nasce apontando para o conteúdo real e com o
título da aula de verdade; e as 11 missões antigas foram vinculadas no banco
(hoje: 11 de 11 com vínculo). O app ainda resolve por título ou matéria como
rede de segurança.

### 8. Flashcards: 300 importados, 60 disponíveis — ✅

**Causa raiz compartilhada com os itens 9 e 21:** `POOL_LIMITE = 60` em
`aluno/page.tsx`, mais `.limit(50)` nas telas dedicadas. O app do aluno
recebia as 60 primeiras linhas numa ordem que o Postgres não garante.

**Corrigido:** teto removido. Payload medido sem ele: 542 kB de questões e
57 kB de flashcards — cabe folgado. Hoje o aluno recebe **372 flashcards**
(352 importados + 20 gerados pela IA) e **396 questões**.

**Contador no admin:** "X flashcards cadastrados" no cabeçalho e a contagem
por matéria, ambos calculados a cada carregamento (rota `force-dynamic`).
Sobe e desce a cada inclusão ou exclusão.

### 9. Banco de Questões: matérias faltando e contagem desatualizada — ✅

Mesma causa do item 8. A contagem **nunca foi fixa no código** — ela já era
calculada a cada render; o que estava errado era o conjunto que chegava até
ela (o recorte de 60). Com o teto removido, aparecem todas as matérias com ao
menos uma questão, com a contagem real. O agrupamento passou a usar o nome
canônico, para "Português"/"Linguagens" não virarem duas linhas.

### 10. Identidade visual — Raio-X — ✅

Fundo navy **#01395E**, emoji 🩻 removido, título centralizado com respiro e
barra laranja **#F36C21**, Montserrat (que já é a fonte de toda a plataforma).
Lógica, estrutura e conteúdo intactos — só a moldura mudou.

### 11. Identidade visual — Desempenho — ✅

Mesma casca do Raio-X. Emojis 🎯 🃏 ⏱️ substituídos pela barra laranja da
identidade. "Voltar ao painel" virou botão no padrão da plataforma em vez de
link de texto solto. Funcionamento e estrutura preservados.

### 12. Ranking: remover "Amigos" e "Ponderado" — ✅

As duas abas e o estado que as controlava foram removidos. Restou o Ranking
Geral, com o funcionamento de antes.

### 13. Unificar Atividades e Simulados — ✅

Uma aba só para o aluno: `/aluno/atividades` lista as duas origens juntas,
ordenadas por data, diferenciadas apenas pelo **título** que o administrador
escreveu. Cada item abre o seu executor original, então **nota, pesos,
cálculo, cronômetro e exibição de resultado seguem exatamente como estavam**.
A entrada "Simulados" saiu dos dois menus do app.

### 14. Eliminar a matéria conjunta "Inglês / Espanhol" — ✅

Eram **78 questões** sob o rótulo conjunto, mais a linha de peso. Como
`materia` é o critério de seleção de conteúdo, um aluno com dificuldade em
Inglês recebia questão de Espanhol — seleção errada, não problema de rótulo.

A separação não precisou de adivinhação: a coluna `questoes.idioma` já vinha
preenchida da importação (**40 espanhol / 38 inglês**). `materias_peso` ganhou
uma linha por idioma com o mesmo peso, porque o aluno faz um OU outro.

Conferido depois: **zero** ocorrências da matéria conjunta em questões,
flashcards ou pesos. Português permanece em "Linguagens", que é o nome
canônico já adotado na plataforma e o que os itens 9 e 21 usam.

### 15. Briefing: escolha de idioma — ✅

Pergunta obrigatória "Qual idioma você fará na prova?" nas **duas** telas de
briefing (onboarding e Recalibrar Voo). Gravada em
`aluno_briefing.idioma_prova`. Passa a governar a experiência inteira:
questões e flashcards do outro idioma somem do app, os itens genéricos do
cronograma são filtrados e o texto genérico ("5 questões de Inglês/Espanhol")
passa a citar só o idioma do aluno.

Quem ainda não respondeu continua vendo os dois — esconder metade do acervo de
quem nunca viu a pergunta trocaria um problema por outro, silencioso.

### 16. Variável Inglês/Espanhol no simulado, com efeito em nota e pesos — ✅

Nova opção no admin. Ligada, o admin cadastra questões dos dois idiomas no
mesmo simulado; ao iniciar, o aluno escolhe qual vai fazer (o idioma do
briefing entra como sugestão). As questões do outro idioma **não aparecem e
não existem para o cálculo**: fora do total, fora dos pesos, fora da nota.
O corte é aplicado nos dois lados — na tela e em `submeterSimulado()` — para
que o que o aluno vê e o que é calculado nunca divirjam. As regras de peso por
matéria não foram alteradas; o filtro acontece antes do cálculo.

### 17. Redação como item do simulado — ✅

Admin cadastra tema, textos motivadores e instruções. O aluno vê a proposta
como **último item**, dentro do **mesmo cronômetro**, identificada como
REDAÇÃO. **Não há campo de digitação nem upload**, de propósito, e um aviso
fixo explica que se escreve à mão e envia pelo fluxo de correção existente.
Cronômetro, navegação, nota e conclusão do simulado não foram tocados.

### 18. Recalibrar Voo com efeito real — ✅

Antes, gravava o formulário e parava. Agora, ao confirmar:

1. missões **futuras e não concluídas** geradas pelo Copiloto são descartadas
   (as do admin e todo o histórico ficam — requisito 18.3);
2. o Copiloto roda de novo com a nova janela, dificuldades e idioma;
3. o que sobrou agendado depois da nova data da prova é removido.

O cronograma não precisa de migração: ele é projetado na janela do aluno a
cada leitura (item 2), então a nova data já muda a rota na próxima tela.
Conteúdo concluído não retorna por padrão; volta como revisão quando os erros
indicarem (18.4).

### 19. Redefinir Perfil: reset completo — ✅

**O reset apagava tudo corretamente.** O que dava a impressão de que "não
concluía" era o que vinha logo depois: a função preservava o briefing e a
ação chamava o Copiloto na sequência, que **reconstruía missões e
recomendações na mesma hora**. A página recarregava e a jornada estava de
volta.

**Corrigido:** o briefing vai junto; o Copiloto não roda no reset; e o aluno é
levado por **navegação completa** até `/aluno/briefing` — o que também descarta
o estado que o app guardava em memória. A nova rota nasce das respostas novas,
sem influência do histórico. Conta, autenticação, matrícula, plano, créditos e
relatos permanecem intactos.

### 20. Símbolos corrompidos nas questões — ✅

**Não havia corrupção de bytes.** A varredura completa encontrou zero
caracteres de controle, zero U+FFFD e zero mojibake; o inventário de
caracteres não-ASCII só tem coisa legítima (acentos, ° ² ³ ⁻ ₂ Δ → ⇌ √).

O que existe é **LaTeX cru** vindo da extração dos PDFs por IA. Renderizado
como texto puro, `$27^{\circ}C$` é exatamente o "27 °C com caracteres
estranhos" relatado, e explica por que aparecia mais em Física.

**Corrigido no banco** (não na exibição), por uma função `latex_para_texto()`
que converte para Unicode: `$27^{\circ}C$` → `27°C`, `$CO_{2(g)}$` → `CO₂(g)`,
`\rightleftharpoons` → `⇌`, `$\sqrt[60]{105}$` → `⁶⁰√(105)`, `$Ca^{2+}$` →
`Ca²⁺`. Backup da versão anterior guardado em
`questoes_antes_conversao_latex`.

**Nenhuma questão precisou ser excluída** — todos os construtos encontrados
eram determináveis com segurança. Conferido depois: zero barras invertidas
restantes; os únicos `$` que sobraram são o símbolo de real (`R$ 700,00`), que
a função protege de propósito — apagá-lo trocaria um problema de exibição por
um erro de conteúdo.

### 21. Inconsistência admin × aluno × cronograma — ✅

Mesma causa dos itens 8 e 9. Auditoria de aceite pedida, feita depois da
correção:

| Matéria | No admin | Visível ao aluno | Flashcards | Aulas | Tem peso |
|---|---|---|---|---|---|
| Biologia | 82 | 82 | 152 | 105 | sim |
| Espanhol | 40 | 40 | 7 | 0 | sim |
| Física | 25 | 25 | 60 | 50 | sim |
| Geografia | 37 | 37 | 14 | 8 | sim |
| História | 33 | 33 | 14 | 14 | sim |
| Inglês | 38 | 38 | 8 | 0 | sim |
| Linguagens | 81 | 81 | 32 | 9 | sim |
| Matemática | 41 | 41 | 23 | 39 | sim |
| Química | 19 | 19 | 62 | 33 | sim |

As três colunas batem para todas as matérias. Química (19) e Linguagens (81),
as duas que "não apareciam", estão presentes com as contagens reais. Nenhuma
matéria ficou sem peso cadastrado.

### 22. Responsividade em tablet — ✅

O tablet recebia o cartão de celular travado em **680px fixos**. Medido num
Chromium de verdade:

| Aparelho | Largura | Antes | Agora |
|---|---|---|---|
| iPad mini retrato | 768px | 680px (89%) | 676px (88%) |
| iPad Air retrato | 820px | 680px (83%) | 722px (88%) |
| iPad Pro 11 retrato | 834px | 680px (82%) | 734px (88%) |
| **iPad Pro 12.9 retrato** | **1024px** | **680px (66%, 172px vazios de cada lado)** | **942px (92%)** |

As três faixas ficaram distintas de verdade: celular a 100% sem moldura,
tablet como cartão largo com barra de abas (navegação por toque, como pedido)
e desktop com sidebar em tela cheia. **Nenhuma das 10 larguras testadas
produz rolagem horizontal.**

---

## Problemas semelhantes encontrados e corrigidos (fora da lista)

Conforme a instrução 5 do documento:

1. **"Literatura" era matéria fantasma nos flashcards.** Mesmo defeito do item
   14 por outro nome: 13 flashcards em "Literatura", que não existe em
   `materias_peso`. Nenhum peso casava e a autoavaliação do aluno em
   Linguagens não os alcançava. Passaram a ser Linguagens.

2. **Banco de conteúdo aberto a visitantes anônimos.** A chave publicável vai
   no bundle do navegador; com ela, sem conta, era possível baixar as 396
   questões **com gabarito e explicação**, os flashcards e as 254 aulas.
   Verificado com `SET ROLE anon` no banco. Corrigido: as políticas passaram a
   exigir sessão. Hoje o anônimo enxerga só os 3 planos ativos e as 6
   configurações de marca — o que a página de vendas precisa.

3. **Missões de aula nasciam sem verificação de conteúdo.** O ciclo do modo
   generoso pedia "aula", mas a função que valida existência de conteúdo nunca
   devolvia esse tipo — as missões de aula escapavam da checagem. Agora passam
   por ela e, sem aula na matéria, o tipo é rebaixado para questões ou
   flashcards em vez de virar beco sem saída.

4. **Índice faltando** em `conteudos_biblioteca (materia, assunto)`, a única
   coluna quente de filtro sem índice, usada a cada rodada do Copiloto.

5. **Duas tabelas do admin ainda escritas à mão**, uma com seis colunas, no
   perfil do aluno — obrigavam a arrastar a tela de lado no celular.
   Convertidas para o padrão de cartões do resto do painel.

---

## Verificações de aceite (todas executadas no banco de produção)

| Verificação | Resultado |
|---|---|
| Matéria conjunta "Inglês/Espanhol" restante | **0** |
| Questões com matéria sem peso cadastrado | **0** |
| Flashcards com matéria sem peso cadastrado | **0** |
| Questões com LaTeX cru restante | **0** |
| Missões de aula sem vínculo | **0** (eram 11) |
| Simulados ativos sem questões e sem redação | **0** |
| Atividades ativas sem questões e sem redação | **0** |
| Tabelas visíveis a visitante anônimo | só `planos` (3) e `configuracoes` (6) |
| Questões ativas / flashcards ativos | **396 / 372** |
| `tsc --noEmit` | limpo |
| `next build` | limpo, sem erros nem avisos |

---

## Pendências

| # | Pendência | Gravidade |
|---|---|---|
| 1 | **Percorrer os fluxos clicando**, num ambiente com `.env`. Este contêiner não alcança o Supabase (`CONNECT tunnel failed, response 403`) e não tem `.env`: o app sobe, mas toda rota que toca o banco responde 500. Tudo aqui foi verificado por leitura de código e por consulta direta ao banco (inclusive com sessões simuladas via `SET ROLE`), o que é teste real de comportamento — só não passa pelo navegador. | **Bloqueante para liberação** |
| 2 | `git push` bloqueado neste contêiner (403 no proxy git). Os commits estão locais em `claude/decola-med-app-design-hdor3m`. As migrações do banco **já estão aplicadas em produção**. | **Bloqueante para deploy** |
| 3 | **Inglês e Espanhol não têm nenhuma aula cadastrada** (0 de 254). Não é defeito: é conteúdo que falta. O Copiloto rebaixa a missão para questões ou flashcards nessas matérias, então nada quebra — mas convém o admin cadastrar aulas dos dois idiomas. | Conteúdo |
| 4 | Os **2 briefings existentes** ainda não têm idioma definido: foram preenchidos antes da pergunta existir. Esses alunos verão a pergunta no próximo Recalibrar Voo; até lá recebem os dois idiomas, que é o comportamento seguro. | Informativa |
| 5 | A unificação do item 13 foi feita **na visão do aluno**. No admin, `/admin/simulados` e `/admin/atividades` continuam como duas telas. O documento diz que a área unificada "pode usar o termo Atividades" mas não exige a fusão das telas de gestão, e fundir as duas mexeria em dois motores de correção que hoje funcionam. Fica registrado como decisão. | Baixa |
| 6 | A variável de idioma e a redação foram implementadas no fluxo de **simulados** (a base técnica que o item 13 manda usar). As colunas equivalentes existem em `atividades`, mas o executor de atividades ainda não as lê. | Baixa |
