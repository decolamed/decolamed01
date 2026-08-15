# Relatório da plataforma Decola Med

Data: 15/08/2026 · Branch `claude/decola-med-report-ei7u3i`
Projeto Supabase: `cdoukrnmdsrlcbxusojm`

Este documento consolida, num só lugar, as oito rodadas de trabalho da
plataforma. Ele substitui `RELATORIO-AUDITORIA-FINAL.md` e
`RELATORIO-CORRECOES.md`, cujo conteúdo integral permanece no histórico do
Git.

| Parte | Rodada | Quando |
|---|---|---|
| I | Busca da tela Estudos e edição de perfil pelo painel | 15/08/2026 |
| II | Camada de questões extras no cronograma | 15/08/2026 |
| III | Simulados do admin, resumos com endereço e cobertura | 14/08/2026 |
| IV | Reforço que responde ao erro e questões dependentes | 14/08/2026 |
| V | Rota por capacidade, requisitos fixos e desempenho | 13/08/2026 |
| VI | Rota do aluno, sessão de questões e autoavaliação | 13/08/2026 |
| VII | As 22 correções do documento `PROMPT DE CORREÇÃO — DECOLA` | 09/08/2026 |
| VIII | Auditoria de segurança, dados, desempenho e produção | 03/08/2026 |

**Como ler.** Cada item registra *o que estava causando o problema de
verdade*, não só o que foi trocado. Em vários casos o componente apontado como
defeituoso estava funcionando corretamente o tempo todo, e a causa estava em
outro lugar — é por isso que algumas correções anteriores não pegavam.

---

## Estado atual — verificado nesta sessão

| Verificação | Resultado |
|---|---|
| `npx tsc --noEmit` | **limpo**, zero erros |
| `npx next build` | **limpo**, zero erros e zero avisos — 63 rotas, 54 páginas estáticas |
| `npm test` | **317 testes, 317 passando, 0 falhando** (20 arquivos) |
| Chaves de API reais em arquivo versionado | **nenhuma** (varredura `AIza…`, `eyJhbGciOi…`, `sk-…`, `$aact_…`) |
| Arquivo `.env` no repositório | **nenhum**; só `.env.example` em branco |

As migrações `041`–`062` **já estão aplicadas em produção**; foram escritas e
executadas contra o banco na rodada em que nasceram.

---

# Parte I — Busca da tela Estudos e edição de perfil pelo painel

Rodada sem migração. Duas telas ganharam o que faltava, e uma delas mexe em
autenticação — que é o item a ler com atenção.

## 1. O campo de busca da tela Estudos era decorativo

O campo "Buscar conteúdo, assuntos…" era um `<input>` **sem `value`, sem
`onChange` e sem nada na tela reagindo**. O aluno digitava, via o texto
aparecer e a tela continuava exatamente igual.

Agora o acervo dele vira uma lista pesquisável. A busca é a **mesma** que o
admin já usa para anexar conteúdo ao cronograma (`buscarNoCatalogo`): todos os
termos precisam casar, acento e caixa não contam, e o resultado é ordenado
pela qualidade do casamento — título que começa com o termo antes de título
que só o contém, e este antes de casar apenas pela matéria. Reaproveitar
significa que **as duas telas encontram as mesmas coisas com as mesmas
palavras**, em vez de divergirem com o tempo.

O aluno busca por conteúdo, não por tabela, então entram na mesma lista: aulas,
PDFs e links (da biblioteca **e** dos dias do cronograma), as matérias do banco
de questões, os baralhos de flashcards, os simulados e os materiais avulsos
que o admin publicou. (`busca-estudos.ts`, 16 testes.)

## 2. Edição de perfil pelo painel, incluindo a troca de e-mail

**O caso de uso:** preparar a conta inteira com um e-mail provisório — perfil,
briefing, cronograma do Copiloto, data da prova — e, na hora de entregar o
acesso, trocar para o e-mail real do aluno.

**O detalhe que faz isso dar certo ou errado:** o e-mail mora em **dois
lugares**, e não há trigger nenhum ligando um ao outro.

| Onde | Para que serve |
|---|---|
| `auth.users.email` | login e recuperação de senha |
| `profiles.email` | o que a plataforma exibe e usa nas telas |

Mexer só em `profiles` — que é o caminho óbvio, e o que uma edição de
formulário faria naturalmente — deixaria a conta **num estado pior do que o
inicial**: o painel mostrando o e-mail novo e o aluno conseguindo entrar só
pelo antigo.

Por isso a ordem importa e está registrada no código: a **autenticação é
alterada primeiro** (é ela que tem a unicidade de verdade) e, se a gravação do
perfil falhar depois, o e-mail da autenticação é **devolvido ao que era**. O
`.toLowerCase()` é aplicado pelo mesmo motivo do cadastro manual — o Supabase
Auth normaliza internamente, e sem isso `profiles.email` divergiria do e-mail
real de login por causa de uma maiúscula.

**Nada além dos três campos é tocado:** mesmo `id`, mesma matrícula, mesmo
briefing, mesmo cronograma, mesmo progresso. Na auditoria, `email_alterado` é
registrado **à parte** de `perfil_editado`, por ser a única alteração que mexe
na autenticação da conta — e a que alguém vai querer auditar depois ("por que
este aluno entra com outro e-mail?").

## 3. O admin deixou de ser jogado para fora da página do aluno

A ação de enviar acesso passou a aceitar "para onde voltar" vindo do
formulário, para o administrador não perder a página do aluno no meio da
entrega.

**Um destino que vem do formulário é entrada não confiável.** Sem restrição,
viraria **redirecionamento aberto** — o admin clica em "Enviar acesso" e vai
parar em outro site. A regra aceita apenas caminhos internos de
`/admin/usuarios` (com ou sem UUID); qualquer outra coisa cai na lista.
`destino-admin.test.mjs` (5 testes) fixa o comportamento, incluindo a recusa
de `https://exemplo.test`, `//exemplo.test` e `javascript:`.

Um registro honesto sobre esse teste: ele mantém uma **cópia** da regra em vez
de importar a função, porque ela vive dentro de uma server action. É
exatamente o padrão que a Parte V, item 6 aponta como divergência esperando
para acontecer — se a regra na action mudar, o teste continuará passando
sozinho. Fica anotado como candidato a extrair para um módulo próprio.

---

# Parte II — Camada de questões extras no cronograma

Rodada sem migração: a camada se apoia na rota e nas sessões de questões que
já existem.

## 1. O problema — a plataforma quase não media o aluno

O cronograma já traz itens de questões vindos do template, mas eles
**disputam a capacidade do dia** com aulas, leituras e redações. Numa janela
curta a disputa é dura, e sobram **um ou dois dias com questões na rota
inteira**: o aluno atravessa dez dias e a plataforma quase não mede nada dele
— o que, por consequência, deixa o Copiloto sem sinal para trabalhar.

## 2. A solução, e as três coisas que ela deliberadamente não faz

A camada de questões extras é aplicada **depois** que a rota está pronta. As
três diferenças em relação a um item comum do cronograma são o ponto todo:

| | Comportamento |
|---|---|
| **Não compete por capacidade** | nenhum item principal sai do lugar para abrir espaço |
| **Não conta como carga horária** | o dia continua com os mesmos minutos planejados |
| **Não é obrigatória** | um bloco não feito não deixa o dia incompleto, não vira dívida e não é reagendado |

Ela decide **só** em que dias cabe um bloco e de que matéria ele é. *Quais*
questões entram continua sendo trabalho de `sessao-questoes.ts`, que já não
repete questão que o aluno tenha visto.

## 3. Os três limites, e por que cada um existe

* **Teto de 20 blocos por rota.** Sem ele, "5 questões todo dia" viraria **250
  questões numa rota de 50 dias** — consumo que esvaziaria o banco antes da
  prova. Com 20 blocos, a rota mais longa gasta 100 questões, e o acervo
  (≈350 utilizáveis por aluno, já descontado o idioma que ele não faz) segue
  com folga para as atividades principais, os simulados e o reforço do
  Copiloto.
* **No máximo 2 blocos seguidos da mesma matéria.** Regra dura, **acima da
  pontuação**: mesmo que uma matéria domine a prioridade, cinco dias seguidos
  dela não é acompanhamento, é monotonia. Só é relaxada quando não existe
  outra matéria com questões disponíveis.
* **Fricção por distância** — um **freio, não um bloqueio**. Uma matéria muito
  mais prioritária que as outras atravessa o freio e volta rápido, que é
  exatamente a priorização que o aluno pediu para preservar. O efeito prático,
  com uma matéria bem à frente, é o padrão **A, B, A, C, A**: prioridade
  mantida, com variedade.

## 4. O impulso de cobertura — priorizar sem excluir, de novo

Mesmo princípio já aplicado na distribuição do cronograma (Parte III, item 4).
Sem esse empurrão, medido com os pesos reais desta prova e o aluno do relato
(dificuldade em Exatas), **uma rota de 10 dias entregava blocos de só quatro
matérias**: Matemática — declarada em **Turbulência** — ficava de fora do
começo ao fim, e História e Geografia também.

Isso contraria o propósito da camada, que existe para *acompanhar* o aluno nas
diferentes matérias: ela **não mede o que nunca pergunta**. O empurrão vale
apenas enquanto a matéria está zerada; a partir do primeiro bloco ela volta a
disputar pela nota pura, e a matéria prioritária continua sendo a que mais
aparece.

A decisão inteira é pura e testável sem banco (`questoes-extras.ts`, 22
testes); a leitura de banco e a costura com a rota ficam separadas em
`questoes-extras-servidor.ts`.

---

# Parte III — Simulados do admin, resumos com endereço e cobertura

Quatro migrações (`059`–`062`), três módulos novos com testes. O fio comum é
tirar decisões da mão do acaso — data de criação, ausência de link, algoritmo
sem piso — e devolvê-las a quem deve tomá-las.

## 1. O admin passou a escolher os dois simulados do Voo Guiado

**Como era.** `contextoDaRota` pegava os dois simulados mais antigos da tabela:

```js
.order("created_at", { ascending: true }).order("id").slice(0, 2)
```

Três problemas nisso:

1. **o administrador não escolhia nada.** Cadastrar um simulado novo não dava
   jeito de usá-lo — a única alavanca era a data de criação, que a interface
   não deixa editar;
2. **com um único simulado utilizável** (que é o caso hoje), o fallback
   `simulados[ordem - 1] ?? simulados[0]` fazia os **dois** dias de simulado
   abrirem o mesmo simulado, em silêncio;
3. **a escolha era refeita a cada leitura da tela**, porque a rota é regerada.
   Desativar um simulado trocava o simulado de todo mundo no meio do caminho,
   inclusive de quem já o tinha feito.

**Agora** quem escolhe é o admin, em `/admin/configuracoes`, sob
`voo_guiado.simulado_1_id` e `voo_guiado.simulado_2_id`, e o vínculo do aluno
fica gravado. Isso é **separado** dos itens de simulado do cronograma padrão
(`trilha_dias`), que continuam valendo só para o plano Decolando — os dois
sistemas não se tocam. O *posicionamento* não mudou: `posicionarSimulados`
continua decidindo em que dia cada um cai. (`simulados-da-rota.ts`, 22 testes.)

**A migração `062` existe por causa do instante do deploy.** A `061` cria a
escolha e a tabela de vínculo, mas as duas nascem vazias — e sem mais nada,
no segundo do deploy: nenhum aluno tem vínculo → a rota consulta a
configuração → a configuração está vazia → **as duas posições ficam sem
simulado**. Quem estava com "Simulado 1" no dia 3 passaria a ver um dia de
simulado sem prova nenhuma, que é exatamente a troca inesperada de conteúdo
que a mudança existe para evitar. A `062` faz a configuração nascer valendo o
simulado que a regra antiga usaria.

## 2. Os quatro resumos de livro ganharam endereço (`060`)

Os quatro itens obrigatórios de leitura estavam assim em `trilha_dias`:

```json
{"tipo":"leitura","titulo":"Leitura do resumo do Livro 1","url":null,"ref_id":null}
```

Nenhum tinha endereço, nenhum tinha conteúdo correspondente em
`conteudos_biblioteca`, e `abrirItemTrilha` trazia a linha explícita
`// "leitura" e "livre" não abrem nada`. O aluno via o item, marcava como
concluído e **não havia para onde ir** — não era link errado, era ausência de
link.

Os endereços passaram a morar em `configuracoes`
(`livros.resumo_1_url` … `resumo_4_url`), que é a **fonte oficial**: quem
exibe um resumo não guarda link nenhum, resolve por
`lib/site/resumos-livros.ts` (14 testes). Trocar o link no painel muda o
destino em todos os cronogramas ao mesmo tempo — template, rota do Voo Guiado,
plano Decolando — sem republicar nada. As chaves **nascem com string vazia,
não com um endereço inventado**.

## 3. Questões de simulado passaram a contar como feitas (`059`)

`submeterSimulado` gravava a tentativa em `simulado_tentativas` mas **nunca
gravava `respostas_aluno`** — que é a tabela que responde "o aluno já fez esta
questão?". Tudo que ele respondia num simulado continuava inédito para o resto
da plataforma:

* a questão **voltava** no Banco de Questões e na atividade de 5 questões como
  se ele nunca a tivesse visto (`continuidade.ts` lê `respostas_aluno.questao_id`);
* o **desempenho por assunto** não a enxergava — o agregado da tentativa só
  guarda matéria, então o Raio-X não sabia *qual* conteúdo foi errado;
* o **Copiloto** só conseguia mirar a matéria inteira, nunca o assunto.

O código foi corrigido e a migração preenche as tentativas **anteriores** à
correção — sem isso, quem já fez simulado continuaria recebendo aquelas
questões como novas. A conversão é fiel ao que está gravado.

## 4. O desempenho passou a priorizar sem excluir

**Caso relatado:** aluno com dificuldade em Exatas e bom desempenho em
Biologia, janela de 10 dias. O algoritmo priorizava Exatas corretamente — **e
apagava Biologia do cronograma**. Com os pesos reais desta prova, Biologia é a
matéria de **maior potencial** (peso 3 × 10 questões); zerá-la porque o aluno
vai bem nela é o oposto de estratégico.

Medido antes da correção, com o mesmo template e os mesmos pesos:

| Janela | Itens de Biologia | Em quantos dias |
|---|---|---|
| 10 dias, 3h/dia | 3 | 3 de 10 |
| 10 dias, 2h/dia | 2 | 2 de 10 |

A regra passou a ser explícita — **priorizar, nunca excluir** — e está fixada
por 10 testes em `cobertura-materias.test.mjs`.

## 5. Itens do cronograma resolvidos pela fonte

Um item do cronograma guarda uma **cópia** do título e da URL do conteúdo,
para o dia poder ser renderizado sem join. O efeito colateral: corrigir o link
de uma aula em "Cursos e Aulas" **não chegava ao cronograma** — o item
continuava apontando para o vídeo antigo, e as duas telas divergiam em
silêncio.

A regra agora: quando o item tem `ref_id`, o registro em
`conteudos_biblioteca` é a fonte da verdade — **menos pelo título**, se o admin
o tiver personalizado. É para isso que existe `titulo_custom`: sem essa marca
não há como distinguir um título personalizado de uma cópia desatualizada.
(`resolver-itens.ts`, com a parte pura separada para poder ser testada.)

---

# Parte IV — Reforço que responde ao erro e questões dependentes

Três migrações (`056`–`058`), dois módulos novos com testes e a paleta do app
do aluno virando token. O tema desta rodada é o Copiloto deixar de dar sempre
a mesma resposta.

## 1. O reforço passou a depender do erro, não do modo

**O sintoma no banco:** 11 missões, **todas** "Questões · <matéria> · 40 min",
enquanto **160 flashcards e 108 aulas de Biologia** ficavam paradas no acervo.

**A causa não era um bug, eram três caminhos independentes** que terminavam na
mesma resposta:

1. `TIPOS_CICLO.cirurgico = ["questoes","questoes","questoes"]` — no modo
   cirúrgico o ciclo só continha questões, então flashcard e aula não eram
   *rejeitados*: nunca chegavam a ser pedidos;
2. `modo === "cirurgico" ? "questoes"` na escolha do tipo da recomendação;
3. `tipoComConteudo()` conferia o tipo preferido e, se ele não tivesse
   material, caía em `if (inv.questoes > 0) return "questoes"` **antes** de
   tentar os outros formatos.

**A correção** (`lib/copiloto/reforco.ts`, 16 testes): a decisão deixou de
depender do **modo** e passou a depender do **erro**, que é a informação que
realmente diz qual reforço serve:

| O que o desempenho mostra | O que falta | Reforço |
|---|---|---|
| precisão muito baixa | a base | **aula** primeiro |
| precisão intermediária | memória | **flashcards** primeiro |
| erro em volume, base ok | aplicação | **questões** primeiro |

Sobre isso, a regra que impede a repetição: **um tipo já pendente naquela
matéria vai para o fim da fila** — é o que transforma "mais uma de questões de
Biologia" em "agora uma aula de Biologia". Nada aqui inventa conteúdo:
`escolherReforco` só devolve um tipo que tem material de verdade no
inventário, e devolve `null` quando não há nenhum.

## 2. Duas travas para o reforço duplicado

* **`056` — duplicata exata.** O aluno recebeu, no mesmo dia, duas missões
  idênticas: mesma data, mesma matéria, mesmo tipo e o **mesmo GEN no motivo**,
  gravadas por execuções a **1,9 s de distância**:

  ```
  03:13:17.614  →  15/08  Biologia  questoes  GEN=949.1
  03:13:19.513  →  15/08  Biologia  questoes  GEN=949.1
  ```

  É a mesma classe de corrida das migrações `050` e `051`: a guarda era um
  `Set` em memória montado no início da execução, ou seja, leitura anterior à
  escrita, e a tabela só tinha PK por `id`. Agora há índice único **parcial**
  (só `origem = 'copiloto'`, para não atingir missão do admin nem do briefing)
  e o motor grava missão a missão, tratando o código `23505` como "a outra
  execução chegou primeiro" — que é o resultado correto, não um erro.

* **`057` — excedente acumulado.** Sobrou o outro sintoma do mesmo defeito:
  **oito missões "Questões · Biologia — 40 min", uma por dia, em dias
  consecutivos**. Não são duplicatas (cada uma tem sua data), são o mesmo
  reforço repetido — porque o ciclo cirúrgico só tinha "questoes" e não havia
  teto por matéria, então a matéria de GEN mais alto levava quase todas as
  vagas até a prova. As duas causas foram corrigidas no código
  (`reforco.ts` e `MAX_REFORCOS_PENDENTES_POR_MATERIA` no motor); a migração é
  só a limpeza do que já estava gravado. Preserva as **primeiras de cada
  matéria** — as mais próximas de hoje, que o aluno já viu no cronograma — e
  não toca em missão do admin, do briefing inicial ou já concluída.

## 3. Questões que dependiam do texto de outra questão (`058`)

Na prova impressa, a questão 15 podia dizer *"(Referente ao texto da Questão
14)"*: as duas estavam na mesma página. Na plataforma cada questão aparece
isolada — no Banco de Questões, numa atividade de 5 questões, num simulado.
Sem o texto-base, **o aluno erra por defeito de cadastro, não por não saber**.

Foi o caso da Q86A665 (FACAPE 2024.1, Inglês, questão 15). A varredura das
**396 questões ativas encontrou 7** nessa situação, e para **todas** a
questão-fonte existe no banco, na mesma prova, com o texto-base íntegro.

Duas decisões sobre *como* corrigir:

* **O texto é o material original já cadastrado** — nada é inventado, escrito
  ou completado por fora.
* **A extração é feita pelo próprio SQL** a partir da linha real (o texto-base
  é tudo o que vem antes do último parágrafo em branco da questão-fonte).
  Transcrever à mão sete textos longos seria a forma mais provável de
  introduzir um erro.

`lib/site/questao-dependente.ts` (10 testes) reconhece o padrão, e é usado na
auditoria do acervo e na importação em massa para o problema não voltar a
entrar em silêncio. O que ele **não** faz: marcar como dependente uma questão
que traz o próprio texto — "De acordo com o texto, …" depois de três
parágrafos citados é questão íntegra.

## 4. A paleta do app do aluno virou token

O Banco de Questões é o padrão visual aprovado: fundo azul escuro, enunciado
numa caixa azul mais clara, cada alternativa na sua própria caixa. As rotas
dedicadas (atividade, sessão do cronograma, simulado) são **páginas Next
separadas do app imersivo** e não alcançam o objeto de cores dele.

Os valores viraram tokens `app-*` no `tailwind.config.ts` — os mesmos de
`decola-app.tsx` — em vez de serem copiados classe a classe. Fica registrado
no próprio arquivo que `green` e `red` são as cores **planas do admin**, e que
os estados de acerto/erro das telas do aluno usam `app-green` / `app-red`.

---

# Parte V — Rota por capacidade, requisitos fixos e desempenho

Rodada imediatamente posterior à Parte VI, no mesmo dia. Onde a Parte VI fez a
rota **existir**, esta faz a rota **caber** — e acrescenta a rede que impede
uma rota impossível de chegar ao aluno.

## 1. A rota passou a ser guiada por capacidade e prioridade

**A pergunta mudou.** A rota deixou de perguntar *"como faço todo o template
caber?"* e passou a perguntar *"com a capacidade real deste aluno, o que rende
mais até a prova?"*.

Quem responde é `lib/trilha/prioridade.ts`: dá uma nota a cada item do
template, e a rota seleciona de cima para baixo até encher a capacidade. A
nota é uma **combinação**, nunca um critério só — "peso maior = estudar tudo
da matéria" seria regra burra, porque uma matéria de peso alto que o aluno já
domina rende menos do que uma de peso médio em que ele erra tudo:

| Componente | O que mede |
|---|---|
| **Retorno** | peso da matéria na prova × quantas questões ela vale |
| **Carência** | o quanto o aluno erra nela hoje (desempenho real) |
| **Dificuldade** | o que ele declarou no briefing (Turbulência / Atenção / Domínio) |

Parte da capacidade fica **fora** do plano inicial, de reserva, para o
Copiloto ter onde encaixar as missões depois — sem isso, todo dia nasceria
cheio e qualquer recomendação estouraria o limite que o aluno declarou.

## 2. Validador da rota — nada é publicado sem passar por aqui

**Uma rota chegou ao aluno com 154 passos num único dia.** Ela foi gerada por
um código que também se achava correto, e é essa a lição: o gerador ser
determinístico e cuidadoso não é garantia.

`lib/trilha/validador-rota.ts` é uma etapa explícita entre **gerar** e
**gravar**. Ele **não conserta nada** — só descreve o que está errado, com a
regra violada e o dia onde aparece. Quem gera decide o que fazer, e quem grava
se recusa a gravar uma rota inválida. (26 testes de capacidade em
`rota-capacidade.test.mjs`.)

## 3. Os requisitos fixos do Voo Guiado deixaram de ser derrubados

2 simulados, 4 redações e as 4 leituras dos livros **não são conteúdo
acadêmico que compete por espaço**: o aluno os contratou. Nenhuma janela
curta, nenhuma prioridade e nenhuma recalibragem pode fazê-los sumir.

**A seleção por prioridade da seção 1 os derrubava** — foi o defeito que estes
17 testes (`requisitos-fixos.test.mjs`) passaram a impedir:

| Janela | O que a rota entregava | O que deve entregar |
|---|---|---|
| 10 dias | 2 dos 4 livros, 1 das 2 redações | 4 livros, 2 redações |
| 5 dias | 1 livro, nenhuma redação | 4 livros, 2 redações |

Numa janela apertada, **quem cede espaço é o conteúdo acadêmico**. Os testes
também fixam que as 4 redações do plano são 2 no cronograma + 1 por simulado,
que um simulado sem proposta de redação não é contado como se tivesse, e que
as redações não se empilham num dia só.

## 4. Desempenho com uma conta só

A tela de Desempenho do aluno calculava tudo inline; o Raio-X calculava de
novo, à sua maneira; e o painel administrativo não calculava nada. Somar o
admin como **quarta implementação** garantiria o que ninguém quer: o aluno
vendo 78% e o admin vendo 74% para a mesma pessoa, sem ninguém saber qual está
certo.

`lib/site/desempenho.ts` (19 testes) centraliza as contas como funções puras
sobre as linhas que já existem — `respostas_aluno`, `flashcard_revisoes`,
`simulado_tentativas`. **Nenhuma métrica nova, nenhuma tabela nova**; quem
chama decide o que mostrar. O admin ganhou a visão em
`components/admin/desempenho-aluno.tsx`.

## 5. "Continuar de onde parou" nos bancos de questões e flashcards

As duas telas montavam a rodada assim:

```js
[...todos].sort(() => Math.random() - 0.5).slice(0, LIMITE)
```

Sorteio novo a cada visita. O aluno respondia 5 das 82 questões de Biologia,
saía, voltava — e recebia 10 questões sorteadas de novo, quase sempre
começando por alguma que já tinha feito.

**O diagnóstico que importa:** não é que a posição não fosse salva; é que
**não existia ordem nenhuma para salvar posição dentro**. Por isso a correção
não é guardar um índice — índice não sobrevive a filtro trocado, a questão
nova cadastrada pelo admin ou a item pulado. O que se guarda (e já se
guardava) é *o que o aluno fez*, por id: `respostas_aluno.questao_id` e
`flashcard_revisoes.flashcard_id`. Duas regras, e só: o que ele ainda não fez
vem primeiro, na ordem do acervo; o que ele já fez continua acessível, logo em
seguida. (`lib/site/continuidade.ts`, 11 testes.)

## 6. Identidade da questão — uma regra só

O código que identifica uma questão existia **escrito duas vezes**, com a
mesma regra, no painel do admin e na tela de prática. Duas cópias da mesma
regra é uma divergência esperando para acontecer — e o dia em que uma delas
mudasse seria o dia em que o aluno reportaria "erro na questão Q3F9A2" e o
admin não acharia nada.

Agora é uma regra só (`lib/site/questao-identidade.ts`, 13 testes), e as telas
de atividade, simulado e sessão — que não mostravam código nenhum — passaram a
usar a mesma. O código é **derivado do id**: não há coluna para ele, e criar
uma exigiria gerar e migrar 396 valores para resolver um problema que a
derivação já resolve, mantendo código e questão sincronizados por construção.

## 7. Botão da Tela de Estudo por curso (migração `055`)

`estudos_botoes` ganhou `plano_id`. O vínculo usa a chave que **já existe** —
`planos` é a tabela de cursos e `profiles.plano_id` é o vínculo do aluno, o
mesmo que `alunoTemCopiloto()` usa — em vez de comparar nome de plano em
texto: a plataforma já teve o defeito de decidir plano por
`nome.includes("guiado")`, que quebra no dia em que o admin renomeia.

Dois padrões escolhidos de propósito:

* **`NULL` = todos os cursos.** É o comportamento que os botões já cadastrados
  têm hoje (nenhum some), e é o padrão seguro — esquecer de escolher publica
  para todos, nunca esconde de todos.
* **`on delete set null`.** Apagar um curso não pode apagar o material do
  admin: ele volta a valer para todos, visível no painel, em vez de sumir da
  tela.

---

# Parte VI — Rota do aluno, sessão de questões e autoavaliação

Rodada posterior ao commit `DECOLA 2.0 OK`. São 14 migrações (`041`–`054`),
três módulos novos com testes, e a remoção do canal de relatos.

## 1. A rota do aluno passou a existir

**O que estava errado.** Não havia rota. O cronograma do Voo Guiado era
derivado a cada leitura de **três fontes que discordavam entre si**:

```
conteúdo      → trilha_dias (template global, dia_numero 1..40)
"dia de hoje" → dias desde matriculas.acesso_liberado_em
datas         → hoje + (dia_numero − dia_de_hoje)
```

A data de início que o aluno informa no briefing (`inicio_estudos`) **nunca
entrava nessa conta** — quem ancorava a linha do tempo era a data da
matrícula. Medido no banco: matrícula em 22/07, início informado 12/08, hoje
12/08 → o sistema calculava "dia 22" e datava o dia 1 em 22/07.

Daí saíam, todos pela mesma causa, os defeitos que pareciam separados:

* "Dia 22" aparecendo como segundo dia do cronograma;
* "21 dias anteriores" logo na estreia;
* atividades datadas em julho num cronograma que começa em agosto (não era
  fuso horário — era âncora errada);
* a compactação renumerava o conteúdo para 1..N mas deixava o ponteiro e as
  datas na régua do template, então `find(dia_numero === hoje)` não achava
  nada e a rota inteira caía em "dias anteriores".

**A correção.** A rota virou objeto de primeira classe
(`aluno_rota_dias`, migração `041`), separando três conceitos que estavam
fundidos num único `dia_numero`:

| Conceito | O que é |
|---|---|
| `route_day` | posição do aluno na **sua** rota (1..N) — é o que a tela mostra |
| `template_days` | de quais dias do template veio o conteúdo — só referência |
| `scheduled_date` | a data real em que ele executa aquele dia |

`trilha_dias` continua intacta: é a fonte de conteúdo dos dois planos, não a
régua de ninguém. **O Plano Decolando não foi tocado.**

**Migrações de apoio:**

* `042` — RLS de escrita da rota (a rota é dado derivado do briefing do
  próprio aluno; sem poder gravá-la, a primeira geração falharia em silêncio e
  a tela cairia de volta na régua do template). Na mesma migração,
  `redefinir_perfil_aluno` passou a apagar a rota — sem isso o aluno zerava
  tudo e continuava vendo o cronograma antigo, com as datas antigas, que é
  exatamente o sintoma de "o reset não resetou".
* `044` — dois tipos de dia que não são estudo: `descanso` (véspera da prova,
  reservada quando há tempo) e `prova` (sempre presente, sempre sem conteúdo).
* `047` — **uma rota ativa por aluno, garantido pelo banco.** A aplicação
  apaga a rota anterior antes de gravar a nova, mas isso era promessa do
  código: uma gravação parcial e duas rotas passariam a conviver, com o aluno
  vendo datas de duas gerações misturadas. Agora cada rota tem uma assinatura
  (início | prova | dias da semana | min/dia) e duas assinaturas para o mesmo
  aluno são recusadas.

## 2. A atividade diária virou uma atividade de verdade

**O que estava errado.** O item "5 questões de Biologia" do cronograma não
tinha existência própria — era um atalho para o Banco de Questões filtrado
pela matéria. Na tela do app o aluno recebia **as 82 questões de Biologia**
("1 / 82" no cabeçalho); na versão web, um sorteio novo a cada carregamento,
então sair e voltar trocava as questões.

**A correção** (`aluno_sessao_questoes`, migração `048`): as questões são
escolhidas **uma vez**, ficam gravadas e são as mesmas em toda reabertura. A
mesma tabela permite **não repetir questões entre atividades da mesma
matéria** — o que já foi usado por aquele aluno sai do sorteio seguinte.
Padrão de 5 questões por sessão, com teto de 20 para que nenhuma sessão vire
"o banco inteiro" por engano.

A lógica ficou pura (`lib/trilha/sessao-questoes.ts`, 13 testes) e a
persistência separada (`sessao-questoes-servidor.ts`).

**Migração `049`:** o Redefinir Perfil passou a apagar as sessões também. Sem
isso o reset seria parcial de um jeito invisível — o histórico de "questões já
usadas" sobreviveria ao apagamento de tudo o mais, e num banco de 82 questões
de Biologia **dois resets seguidos deixariam a matéria sem questões inéditas**.

## 3. A autoavaliação do briefing era descartada em silêncio

**A causa.** O briefing mandava a resposta com a **matéria dentro do nome do
campo** do FormData:

```js
fd.set(`sentimento_${materia}`, sentimento)   // sentimento_Física
```

Nome de campo em `multipart/form-data` viaja no cabeçalho
`Content-Disposition` — território de bytes latin-1 por herança (RFC
2183/7578). Não há garantia de que um nome com acento chegue do outro lado
como saiu. O **valor**, esse sim, tem codificação definida e atravessa
intacto. Foi o que se viu no banco:

```
"FÃ­sica": "Turbulência"     ← chave corrompida, resposta perfeita
```

O Copiloto lê o sentimento por `sentimentos[matéria]`. `"FÃ­sica"` nunca casa
com `"Física"`, então a resposta virava "Atenção" no cálculo do GEN. **As
cinco matérias acentuadas — Física, Química, Inglês, História e Matemática —
eram descartadas**; Biologia, Geografia, Linguagens e Espanhol passavam. O
aluno marcava Turbulência na matéria que mais precisava e ela perdia
prioridade.

Vale notar por que a limpeza de acento não resolvia: `chaveMateria` tira
acento, mas o caractere no meio de `FÃ­sica` é um **hífen-suave (U+00AD)**,
que não é acento e não sai.

**A correção** (`lib/site/sentimentos.ts`, 15 testes): a matéria **deixou de
ser nome de campo** e virou valor, com nomes ASCII e indexados:

```
sentimento_materia_0 = "Física"     sentimento_valor_0 = "Turbulência"
sentimento_materia_1 = "Biologia"   sentimento_valor_1 = "Domínio"
```

As migrações `053` e `054` consertam o que já estava gravado. A `053` veio
primeiro, quando o defeito ainda parecia resíduo antigo; **depois dela um
briefing novo entrou corrompido do mesmo jeito**, o que provou que a causa
continuava viva no produtor — daí a correção no código e a `054`. O reparo
recupera, não inventa: só a chave é redecodificada (os bytes latin-1 do nome
relidos como UTF-8 devolvem exatamente o acento original) e a resposta do
aluno é copiada como está. Nenhum sentimento é adivinhado.

## 4. Duplicações por corrida — duas travas no banco

`rodarCopiloto` é disparado de vários pontos ao mesmo tempo (responder
questão, enviar simulado, abrir a tela). O motor já tentava evitar duplicata,
mas com um "lê e depois escreve" sem trava — que sob concorrência não segura.

* **`050` — uma recomendação pendente por (aluno, matéria, assunto).**
  Medido no banco: três linhas "Urgente: Biologia", todas pendentes, criadas
  **no mesmo segundo** (22:29:37) — três execuções simultâneas, cada uma lendo
  "não há pendente" antes de qualquer uma gravar. Eram os três cartões de
  prioridade repetidos que apareciam depois de cada erro. O índice usa
  `coalesce(assunto, '')` porque dois `NULL` não colidem em índice único no
  Postgres, e a recomendação de matéria inteira tem assunto nulo — justamente
  o caso que duplicava.

* **`051` — um vídeo de IA por (matéria, assunto).** Mesma corrida em
  `produzirMaterialSobDemanda`. Carimbos a milissegundos de distância:

  | Assunto | Linhas | Horário |
  |---|---|---|
  | Física · Termodinâmica · Gases Ideais | 2 | 23:35:05.720 / .724 |
  | Linguagens · Interpretação e Funções | 2 | 21:10:56.738 / .752 |
  | Linguagens · Morfossintaxe · Sintaxe | 3 | 21:11:07.022 / .594 / .937 |

  O último caso guardou **duas URLs diferentes para o mesmo assunto** — cada
  execução perguntou ao YouTube por conta própria. Uma chave única só pela URL
  não pegaria isso: a regra que o código sempre quis é uma aula por assunto.
  As duplicatas saíram por `ativo = false`, não por `delete` — tira da
  biblioteca do aluno sem apagar histórico.

## 5. O orçamento diário de estudo passou a existir num lugar só

O Copiloto criava missão em **cinco lugares diferentes** (cenário 1, cenário
2, reagendamento de pendências e duas ações de check-in), e cada um refazia a
conta do "quanto ainda cabe hoje" à sua maneira. Três consequências reais,
todas violando o limite que o aluno declarou no briefing:

1. quase todos somavam apenas `aluno_missoes` e **ignoravam o conteúdo do
   cronograma** daquele dia — um dia com 3h de rota e 2h de missões passava no
   teste `2h <= 3h`, e o aluno recebia 5h de tarefa;
2. as missões criadas na **mesma execução** não entravam na conta seguinte,
   então dois trechos de código enchiam o mesmo dia sem se ver;
3. as ações de check-in agendavam em qualquer data, **inclusive no dia da
   prova e na véspera reservada para descanso**.

`lib/copiloto/agenda.ts` (11 testes) passou a ser a agenda única: sabe o que
está ocupado (rota + missões), quais datas são intocáveis, e reserva o tempo a
cada missão criada.

## 6. Afinidade de assunto — o elo que faltava

A revisão de flashcards abria o hub geral porque a cadeia "questão errada →
assunto → flashcards daquele assunto" nunca chegava ao fim. São dois
vocabulários diferentes para a mesma matéria:

```
questões   → "Reações Químicas · Oxirredução e Funções Inorgânicas"
              (texto livre, praticamente um assunto por questão)
flashcards → "Termoquímica", "Funções Orgânicas", "Eletroquímica"
              (temas curtos, às vezes com "· Continuação")
```

Comparar por igualdade de string — que é o que o sistema fazia — dava zero
acerto. `lib/site/assunto.ts` (15 testes) resolve a afinidade entre os dois
vocabulários, sempre dentro da matéria canônica.

## 7. Limites reforçados no banco

* **`045` — nenhuma missão no dia da prova nem depois dele.** O bloqueio do
  dia da prova já existia; missões *posteriores* só eram limpas na
  recalibragem do briefing, então uma execução do Copiloto entre duas
  recalibragens podia agendar estudo para depois do vestibular.
* **`046` — missão de aula exige vínculo com o conteúdo.** O código que criava
  missão de aula sem `ref_id` já tinha sido corrigido (Parte VII, item 7), mas
  as linhas antigas continuaram no banco — dado órfão sobrevivendo à correção
  do código. A migração remove as pendentes (só as do Copiloto e não
  concluídas: histórico do aluno e o que o admin agendou à mão não são
  tocados) e o gatilho passa a recusar a criação, para a classe inteira não
  voltar por outro caminho.
* **`052` — `search_path` fixo nas três funções novas.** O projeto já tinha
  endurecido isso nas migrações `024` e `030`; `latex_para_texto`,
  `translate_marcado` e `aluno_rota_uma_assinatura` nasceram depois e ficaram
  de fora, aparecendo no linter do Supabase como *role mutable search_path*.

## 8. Relatos de erro removidos

O relato passou a ser feito pelo **WhatsApp geral da plataforma**. A fila
interna (`relatos_erro` + `/admin/relatos`) não tinha mais quem a alimentasse
nem quem a lesse — mantê-la seria acumular registros que ninguém veria, que é
pior do que não ter o canal.

Conferido antes de remover (migração `043`): nenhuma view, função ou chave
estrangeira de outra tabela dependia dela, e as 9 linhas existentes eram todas
de teste. **Isto substitui o item 1 da Parte VII.**

## 9. Suíte de testes

O projeto ganhou `npm test` (`scripts/testes.sh`), rodando os arquivos
`*.test.mjs` com o test runner do próprio Node. Esta rodada criou a suíte com
99 testes em 6 arquivos; as rodadas seguintes a levaram a **317 em 20
arquivos**, que é o estado atual:

| Arquivo | Testes | Nasceu na |
|---|---|---|
| `lib/copiloto/agenda.test.mjs` | 11 | Parte VI |
| `lib/copiloto/reforco.test.mjs` | 16 | Parte IV |
| `lib/site/assunto.test.mjs` | 15 | Parte VI |
| `lib/site/continuidade.test.mjs` | 11 | Parte V |
| `lib/site/desempenho.test.mjs` | 19 | Parte V |
| `lib/site/materia-canonica.test.mjs` | 11 | Parte VI |
| `lib/site/questao-dependente.test.mjs` | 10 | Parte IV |
| `lib/site/questao-identidade.test.mjs` | 14 | Parte V |
| `lib/site/resumos-livros.test.mjs` | 14 | Parte III |
| `lib/site/sentimentos.test.mjs` | 15 | Parte VI |
| `lib/trilha/cobertura-materias.test.mjs` | 10 | Parte III |
| `lib/trilha/requisitos-fixos.test.mjs` | 17 | Parte V |
| `lib/trilha/resumos-no-cronograma.test.mjs` | 13 | Parte III |
| `lib/trilha/rota-capacidade.test.mjs` | 26 | Parte V |
| `lib/trilha/rota.test.mjs` | 37 | Parte VI |
| `lib/trilha/sessao-questoes.test.mjs` | 13 | Parte VI |
| `lib/trilha/simulados-da-rota.test.mjs` | 22 | Parte III |
| `lib/site/busca-estudos.test.mjs` | 16 | Parte I |
| `lib/site/destino-admin.test.mjs` | 5 | Parte I |
| `lib/trilha/questoes-extras.test.mjs` | 22 | Parte II |
| **Total** | **317, todos passando** | |

A lógica testável foi deliberadamente mantida pura e separada da persistência
— é o que permite testar rota, sessão, agenda, prioridade e desempenho sem
banco.

---

# Parte VII — As 22 correções

Referência: documento `PROMPT DE CORREÇÃO — DECOLA`.
Legenda: ✅ corrigido · ⚠️ parcial · ⏹ substituído por trabalho posterior

### 1. Relatos de erro não chegam ao painel — ⏹ substituído

**O envio nunca esteve quebrado**: havia 7 relatos gravados, todos com perfil
válido, dois posteriores à última correção. A causa era `useState(inicial)` em
`RelatosManager`, que lê a prop **só na primeira montagem** — voltando à tela
pela navegação do Next, o servidor mandava a lista atualizada e o componente
seguia exibindo a antiga, sem erro na tela nem no console. Corrigido com
ressincronização a cada render.

Também corrigido à época: a tela de sucesso do aluno aparecia **antes** da
confirmação do banco (numa falha de rede ele lia "Relato enviado!" e nada era
gravado); e removida a mensagem falsa *"enviado ao e-mail configurado pela
equipe"*, que descrevia um disparo que não existia.

**Hoje isto não se aplica mais:** o canal virou WhatsApp e a fila interna foi
removida (Parte VI, item 8).

### 2. Voo Guiado recebe o cronograma fixo de 40 dias — ✅ (refeito na Parte VI)

Um aluno com 20 dias até a prova recebia os mesmos 40 dias do template, e
metade do conteúdo caía depois da prova. A correção desta rodada projetava o
cronograma na janela real do aluno a cada leitura.

**A rodada seguinte substituiu a abordagem:** projetar a cada leitura ainda
deixava a linha do tempo ancorada na matrícula. Hoje a rota é persistida e
ancorada no início informado pelo aluno (Parte VI, item 1), e
`lib/trilha/ajuste-voo-guiado.ts` deu lugar a `lib/trilha/rota.ts`.

### 3. Revisão do Copiloto carrega questões da matéria errada — ✅

`montarRevisao` procurava o assunto no **acervo inteiro** (`q.tema === tema`,
sem olhar matéria) e só caía para a matéria se achasse menos de três. Como o
mesmo assunto existe em matérias diferentes — "Interpretação de Texto" e
"Gramática · Verbos" aparecem em Linguagens, Inglês e Espanhol —, uma revisão
intitulada "Física" podia abrir com questões de Espanhol. A matéria passou a
ser o primeiro filtro, sempre; o assunto refina dentro dela.

### 4. "Já revisei" não persiste — ✅

**A gravação sempre funcionou.** A checagem de duplicidade do Copiloto
filtrava `status = 'pendente'`: no instante em que o aluno concluía, a
recomendação saía do conjunto verificado e a rodada seguinte criava **uma
nova, idêntica**. O aluno via o cartão sumir, recarregava e ele estava lá —
mas era outro registro. A checagem passou a considerar também as já
respondidas, e só volta a recomendar o assunto se houver **erro novo depois da
conclusão**.

### 5. Revisão no cronograma não marca conclusão — ✅

A revisão diária era o único item da sequência que não nasce de uma linha do
banco: era derivada do desempenho a cada render, com `done: false` fixo e
`toggle: null`. Passou a usar a mesma trilha de progresso dos demais itens
(`aluno_progresso_itens`), com chave por dia e matéria.

### 6. Revisões com flashcards não são geradas — ✅

A condição era `precisao < 35 && flashPorMat > 0`, e `flashPorMat` conta
**revisões já feitas pelo aluno**, não flashcards existentes — para todo aluno
novo esse contador é zero, então a condição nunca era verdadeira. Quem decide
agora é o inventário real de flashcards, com limiar em 60%.

### 7. Aula indicada na revisão não abre — ✅

**Todas as 11 missões de aula do banco tinham `ref_id` nulo** — o motor nunca
gravava o vínculo, e o app caía sempre em "Esta aula não está mais
disponível". A aula existia; o vínculo é que nunca foi criado. Corrigido em
três frentes: o inventário do Copiloto carrega as aulas com id e título, a
missão nasce apontando para o conteúdo real, e as 11 missões antigas foram
vinculadas. (A migração `046`, na Parte VI, fechou a porta no banco.)

### 8. Flashcards: 300 importados, 60 disponíveis — ✅

Causa compartilhada com os itens 9 e 21: `POOL_LIMITE = 60` em
`aluno/page.tsx`, mais `.limit(50)` nas telas dedicadas. Teto removido —
payload medido: 542 kB de questões e 57 kB de flashcards. O aluno passou a
receber **372 flashcards** (352 importados + 20 gerados por IA) e **396
questões**.

### 9. Banco de Questões: matérias faltando e contagem desatualizada — ✅

Mesma causa do item 8. A contagem **nunca foi fixa no código** — já era
calculada a cada render; o errado era o conjunto que chegava até ela.

### 10 e 11. Identidade visual — Raio-X e Desempenho — ✅

Fundo navy **#01395E**, emojis (🩻 🎯 🃏 ⏱️) substituídos pela barra laranja
**#F36C21**, título centralizado, Montserrat. "Voltar ao painel" virou botão
no padrão da plataforma. Lógica, estrutura e conteúdo intactos.

### 12. Ranking: remover "Amigos" e "Ponderado" — ✅

As duas abas e o estado que as controlava foram removidos.

### 13. Unificar Atividades e Simulados — ✅

Uma aba só para o aluno: `/aluno/atividades` lista as duas origens juntas,
ordenadas por data, diferenciadas apenas pelo título. Cada item abre o seu
executor original, então **nota, pesos, cálculo, cronômetro e resultado seguem
exatamente como estavam**.

### 14. Eliminar a matéria conjunta "Inglês / Espanhol" — ✅

Eram **78 questões** sob o rótulo conjunto. Como `materia` é o critério de
seleção de conteúdo, um aluno com dificuldade em Inglês recebia questão de
Espanhol — seleção errada, não problema de rótulo. A separação não precisou de
adivinhação: a coluna `questoes.idioma` já vinha preenchida da importação
(**40 espanhol / 38 inglês**).

### 15. Briefing: escolha de idioma — ✅

Pergunta obrigatória nas duas telas de briefing, gravada em
`aluno_briefing.idioma_prova`. Governa a experiência inteira: questões e
flashcards do outro idioma somem, os itens genéricos do cronograma são
filtrados. Quem ainda não respondeu continua vendo os dois — esconder metade
do acervo de quem nunca viu a pergunta trocaria um problema por outro,
silencioso.

### 16. Variável Inglês/Espanhol no simulado — ✅

Ligada, o admin cadastra questões dos dois idiomas no mesmo simulado e o aluno
escolhe ao iniciar. As questões do outro idioma **não aparecem e não existem
para o cálculo**: fora do total, dos pesos e da nota. O corte é aplicado nos
dois lados — na tela e em `submeterSimulado()` — para que o que o aluno vê e o
que é calculado nunca divirjam.

### 17. Redação como item do simulado — ✅

O aluno vê a proposta como último item, dentro do mesmo cronômetro. **Não há
campo de digitação nem upload**, de propósito, e um aviso explica que se
escreve à mão e envia pelo fluxo de correção existente.

### 18. Recalibrar Voo com efeito real — ✅

Antes, gravava o formulário e parava. Agora: missões futuras e não concluídas
do Copiloto são descartadas (as do admin e o histórico ficam), o Copiloto roda
de novo com a nova janela, e o que sobrou agendado depois da nova data da
prova é removido.

### 19. Redefinir Perfil: reset completo — ✅

**O reset apagava tudo corretamente.** O que dava impressão de "não concluir"
era o que vinha depois: a função preservava o briefing e a ação chamava o
Copiloto na sequência, que **reconstruía missões e recomendações na mesma
hora**. Corrigido: o briefing vai junto, o Copiloto não roda no reset, e o
aluno é levado por navegação completa até `/aluno/briefing`. (As migrações
`042` e `049`, na Parte VI, acrescentaram a rota e as sessões de questões ao
que o reset apaga.)

### 20. Símbolos corrompidos nas questões — ✅

**Não havia corrupção de bytes**: zero caracteres de controle, zero U+FFFD,
zero mojibake. O que existia era **LaTeX cru** vindo da extração dos PDFs por
IA — renderizado como texto puro, `$27^{\circ}C$` é exatamente o "27 °C com
caracteres estranhos" relatado, e explica por que aparecia mais em Física.
Corrigido no banco por `latex_para_texto()`: `$CO_{2(g)}$` → `CO₂(g)`,
`\rightleftharpoons` → `⇌`, `$Ca^{2+}$` → `Ca²⁺`. Os únicos `$` restantes são
o símbolo de real (`R$ 700,00`), protegido de propósito.

### 21. Inconsistência admin × aluno × cronograma — ✅

Mesma causa dos itens 8 e 9. Auditoria de aceite após a correção:

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

As três colunas batem para todas as matérias.

### 22. Responsividade em tablet — ✅

O tablet recebia o cartão de celular travado em 680px fixos. Medido em
Chromium:

| Aparelho | Largura | Antes | Agora |
|---|---|---|---|
| iPad mini retrato | 768px | 680px (89%) | 676px (88%) |
| iPad Air retrato | 820px | 680px (83%) | 722px (88%) |
| iPad Pro 11 retrato | 834px | 680px (82%) | 734px (88%) |
| **iPad Pro 12.9 retrato** | **1024px** | **680px (66%)** | **942px (92%)** |

**Nenhuma das 10 larguras testadas produz rolagem horizontal.**

### Problemas semelhantes corrigidos fora da lista

1. **"Literatura" era matéria fantasma nos flashcards** — 13 flashcards numa
   matéria que não existe em `materias_peso`. Nenhum peso casava e a
   autoavaliação do aluno em Linguagens não os alcançava.
2. **Banco de conteúdo aberto a visitantes anônimos** (ver Parte VIII, §1.3).
3. **Missões de aula nasciam sem verificação de conteúdo** — o ciclo do modo
   generoso pedia "aula", mas a função que valida existência nunca devolvia
   esse tipo. Sem aula na matéria, o tipo passou a ser rebaixado para questões
   ou flashcards em vez de virar beco sem saída.
4. **Índice faltando** em `conteudos_biblioteca (materia, assunto)`.
5. **Duas tabelas do admin ainda escritas à mão**, uma com seis colunas.

---

# Parte VIII — Auditoria

## 1. Segurança

### 1.1 Guardas de rota e de ação

**45 arquivos `page.tsx`** — todos com guarda: `requireAdmin` (26),
`requireAcessoAluno` (16), `requireAluno`, `requirePreviewAluno`,
`requireProfessor`; `/parceiro` com `requireParceiro`. **Toda server action
exportada** tem verificação de permissão na primeira linha, sem exceção.

### 1.2 RLS no banco

Nenhuma tabela pública sem RLS. Isolamento entre alunos, medido com sessão
simulada de um aluno real:

| Tabela | Linhas visíveis | Linhas de outro aluno |
|---|---|---|
| respostas_aluno, aluno_missoes, copiloto_recomendacoes, simulado_tentativas, atividade_tentativas | próprias | **0** |
| aluno_briefing, matriculas | próprias | **0** |
| pagamentos | 1 de 2 (a sua) | **0** |
| profiles | 1 de 3 (o seu) | **0** |
| configuracoes_secretas, cupons, comissoes_parceiro | **0** | — |

### 1.3 Corrigido — banco de conteúdo aberto ao público

**O achado.** A chave publicável (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) vai no
bundle do navegador — é pública por definição. Com ela, um visitante **sem
conta** baixava, direto pela API REST:

```
GET /rest/v1/questoes?select=*             → 396 questões, com gabarito e explicação
GET /rest/v1/flashcards?select=*           → 352 flashcards
GET /rest/v1/conteudos_biblioteca?select=* → 254 aulas / PDFs / links
```

Mais `trilha_dias`, `materias_peso`, `simulado_questoes`, `atividade_questoes`,
`simulados`, `atividades`, `banners`. Ou seja: **todo o material vendido pela
plataforma, de graça e sem cadastro.** Confirmado com `SET ROLE anon`.

**Verificação antes de mexer.** Nenhum código do navegador lê essas tabelas —
`lib/supabase/client.ts` só é usado para `auth.signOut()`, `auth.updateUser()`
e o upload do ícone no admin. Todas as leituras de conteúdo acontecem em
Server Components e server actions, atrás de `requireAcessoAluno()` /
`requireAdmin()`.

**A correção** (migrações `conteudo_pago_exige_sessao` e
`biblioteca_e_avaliacoes_exigem_sessao`): as políticas de SELECT passaram a
exigir sessão — `(ativo = true and auth.uid() is not null) or is_admin()`.
Depois dela, o anônimo enxerga **só** os 3 planos ativos e as 6 configurações
de marca — exatamente o que a página de vendas precisa. `planos` e
`configuracoes` são públicos de propósito: `/inscricao/[slug]`,
`/api/matricula` e `/api/cupons/validar` rodam antes de existir sessão, e os
segredos ficam em `configuracoes_secretas`, restrita a `is_admin()`.

Sem regressão: o aluno logado continua vendo tudo.

## 2. Consistência dos dados

Doze verificações, **todas com resultado 0**: simulados e atividades sem
questões; `simulado_questoes` e `atividade_questoes` apontando para questão
inexistente; itens de trilha com `ref_id` inexistente ou sem `url` e sem
`ref_id`; questões sem alternativas ou com resposta fora das alternativas;
flashcards sem frente ou verso; missões órfãs; `profiles` sem `auth.users` e
vice-versa.

Integridade do conteúdo importado: 396 questões com impressão digital agregada
`4ef6a3f6ccaeaef7f4d6c220c8f7a78d`, conferida contra os 10 arquivos `.md` de
origem; 352 flashcards em ordem `1..352` sem furo nem repetição; **zero**
registros com matéria "Português" — a unificação em "Linguagens" está completa
no banco, não só na tela.

## 3. Algoritmo e Copiloto

### 3.1 Nada de valor fixo no código

`lib/copiloto/configuracao.ts` carrega **11 parâmetros** da tabela
`configuracoes` (prefixo `copiloto.`), com os valores antigos servindo apenas
de padrão para instalação nova: duração de missão por tipo, máximo de
recomendações por modo, dias para entrar em modo cirúrgico, mínimo de dias
livres e máximo de dias alterados por rodada.

**Prova de efeito real** (feita e depois desfeita, banco restaurado): gravar
`copiloto.duracao.questoes = 55` e `copiloto.dias_modo_cirurgico = 21` e ler
de volta pelo caminho do algoritmo devolveu os valores novos — a tela do admin
muda o comportamento, não só a aparência.

### 3.2 Origem dos dados do motor

`motor.ts` lê tudo do banco: `respostas_aluno`, `simulado_tentativas`,
`materias_peso`, `aluno_briefing`, `questoes`, `flashcards`, `trilha_dias` e
`configuracoes`. Do briefing consome `horasPorDia`, `diasEstuda`, `dataProva`
e `sentimentos` — **nenhum campo coletado do aluno fica sem uso**.

### 3.3 Produção sob demanda

`produzirMaterialSobDemanda()` checa cobertura antes de gerar e **nunca
lança**: sem Gemini ou YouTube configurados, devolve `produziu: false` e o
Copiloto segue com o material existente. O vídeo é escolhido entre candidatos
**reais** da API do YouTube — a IA só seleciona, não inventa URL. Tudo
registrado em `copiloto_producoes_ia`.

### 3.4 Dia da prova

Garantido em duas camadas: gatilho no banco e nas quatro telas que listam
missões. (Reforçado depois pela migração `045`, que estendeu o bloqueio para
qualquer data **posterior** à prova.)

## 4. Desempenho

* **Sem N+1 na tela mais pesada** — `/aluno` faz as 27 consultas num único
  `Promise.all`, sem consulta dependente em laço.
* **Índices** — das 19 colunas quentes de filtro, 18 já tinham índice; a que
  faltava (`conteudos_biblioteca (materia, assunto)`, usada a cada rodada do
  Copiloto) recebeu índice parcial.
* **Advisor do Supabase** — 260 avisos, nenhum de correção obrigatória: 221
  `multiple_permissive_policies` (efeito do padrão `admin_all` + `select_own`,
  que é o que garante a segurança), 33 `unused_index` (esperado num banco novo)
  e 6 `no_primary_key`, todos em tabelas de backup das importações. Nenhum
  aviso `auth_rls_initplan`.

## 5. Responsividade

O padrão do painel é `components/admin/tabela-responsiva.tsx`: uma única
definição de colunas gera **tabela de verdade no desktop** (`hidden md:block`)
e **um cartão por registro no celular** (`md:hidden`) — sem dois blocos de
marcação para manter em sincronia.

As duas últimas tabelas escritas à mão (histórico de pagamentos, 6 colunas, e
outras matrículas, 4 colunas, em `/admin/usuarios/[id]`) foram convertidas.
Varredura final: **nenhum `<table>` cru restante** em nenhuma tela do admin, e
nenhum `min-w-[...]` capaz de forçar rolagem horizontal no celular.

---

# Pendências

| # | Pendência | Gravidade |
|---|---|---|
| 1 | **Percorrer os fluxos clicando** (aluno e admin). Os contêineres onde este trabalho foi feito não alcançam o Supabase (`CONNECT tunnel failed, response 403`, política de rede da organização) e não têm `.env`: o app sobe, mas toda rota que toca o banco responde 500. Tudo foi verificado por leitura de código, por testes automatizados e por consulta direta ao banco (inclusive com sessões simuladas via `SET ROLE`), o que é teste real de comportamento — só não passa pelo navegador. **Erros de console e de hidratação em execução também não foram medidos**, pela mesma razão. **O código já está em produção** (a `main` foi promovida em 13/08), então este teste agora acontece em produção: se algo estiver errado no fluxo do aluno, quem encontra é o usuário. | **Aberta — agora em produção** |
| 2 | **Inglês e Espanhol não têm nenhuma aula cadastrada** (0 de 254). Não é defeito: é conteúdo que falta. O Copiloto rebaixa a missão para questões ou flashcards nessas matérias, então nada quebra — mas convém o admin cadastrar aulas dos dois idiomas. | Conteúdo |
| 3 | Os **briefings preenchidos antes da pergunta de idioma existir** não têm idioma definido. Esses alunos verão a pergunta no próximo Recalibrar Voo; até lá recebem os dois idiomas, que é o comportamento seguro. | Informativa |
| 4 | A unificação de Atividades e Simulados (item 13) foi feita **na visão do aluno**. No admin, `/admin/simulados` e `/admin/atividades` continuam como duas telas — fundi-las mexeria em dois motores de correção que hoje funcionam. Decisão registrada. | Baixa |
| 5 | A variável de idioma e a redação foram implementadas no fluxo de **simulados**. As colunas equivalentes existem em `atividades`, mas o executor de atividades ainda não as lê. | Baixa |
| 6 | RLS exige *sessão*, não *matrícula ativa*. Um aluno com acesso expirado ainda passaria pela RLS — mas é barrado por `requireAcessoAluno()` no servidor, por onde todo o app passa. Endurecer a RLS seria defesa em profundidade. | Baixa |
| 7 | Os pesos internos de remarcação (`PESO_TIPO`, `IMPORTANCIA_MINIMA`, `MAX_POR_RODADA` em `copiloto/pendencias.ts`) e `MIN_FLASHCARDS_ACEITAVEL` continuam fixos no código. São heurísticas internas de ordenação, não configurações que o admin pediu para controlar; expor as 13 na tela poluiria o painel. Ficam registradas caso se queira torná-las configuráveis. | Baixa |
| 8 | Seis tabelas de backup das importações (`questoes_2026_08_02`, `flashcards_2026_08_02`, `trilha_dias_antes`, `trilha_dias_antes_titulos`, `materias_antes`, `conteudos_antes`), mais `questoes_antes_conversao_latex`, continuam no banco. Estão com RLS e invisíveis para anônimo e para aluno. Foram mantidas de propósito — são o backup do conteúdo original — e só devem ser removidas por decisão explícita. | Informativa |
| 9 | `TableCard` (em `components/admin/card.tsx`, com `min-w-[720px]`) ficou sem uso após a migração para `TabelaResponsiva`. Não quebra nada; é candidato a remoção numa limpeza futura. | Informativa |
| 10 | `destino-admin.test.mjs` mantém uma **cópia** da regra `destinoDeRetorno` em vez de importá-la, porque ela vive dentro de uma server action. É o mesmo padrão que a Parte V, item 6 trata como divergência esperando para acontecer: se a regra na action mudar, o teste continua passando sozinho e a proteção contra redirecionamento aberto deixa de ser verificada. Extrair para um módulo próprio resolveria. | Baixa |

**Resolvidas desde os relatórios anteriores:**

* ~~`git push` bloqueado no contêiner (403 no proxy git); os commits estão
  locais~~ — o código das oito rodadas está no repositório e na `main`.
* ~~Item 1 da Parte VII (fila de relatos)~~ — o canal virou WhatsApp e a fila
  foi removida (migração `043`).
* ~~Rota entregando 154 passos num único dia~~ — a rota passou a ser limitada
  pela capacidade declarada do aluno, e o validador recusa rota inválida antes
  de gravar (Parte V, itens 1 e 2).
* ~~Requisitos fixos do Voo Guiado sumindo em janelas curtas~~ — 2 simulados,
  4 redações e 4 leituras passaram a sobreviver a qualquer janela (Parte V,
  item 3).
* ~~Copiloto entregando sempre "Questões · 40 min", com 160 flashcards e 108
  aulas paradas no acervo~~ — o reforço passou a ser escolhido pelo erro, e um
  tipo já pendente na matéria vai para o fim da fila (Parte IV, item 1).
* ~~7 questões impossíveis de responder por dependerem do texto de outra~~ —
  o texto-base foi incorporado a partir da questão-fonte já cadastrada
  (Parte IV, item 3).
* ~~Os quatro resumos de livro não abriam nada~~ — os endereços passaram a
  morar em `configuracoes`, editáveis pelo admin (Parte III, item 2).
* ~~Os dois dias de simulado abrindo o mesmo simulado, escolhido por data de
  criação~~ — quem escolhe passou a ser o admin, e o vínculo do aluno fica
  gravado (Parte III, item 1).
* ~~Questões respondidas em simulado voltando como inéditas~~ —
  `submeterSimulado` passou a gravar `respostas_aluno`, e as tentativas
  antigas foram preenchidas (Parte III, item 3).
* ~~Cronograma zerando a matéria em que o aluno vai bem~~ — a regra passou a
  ser priorizar sem excluir (Parte III, item 4).
* ~~Janelas curtas atravessadas quase sem questões, deixando o Copiloto sem
  sinal~~ — a camada de questões extras acompanha o aluno sem competir por
  capacidade nem virar dívida (Parte II).
* ~~Campo de busca da tela Estudos sem efeito nenhum~~ — passou a pesquisar
  o acervo do aluno, com a mesma busca que o admin já usa (Parte I, item 1).

---

## Limpeza pós-auditoria

O banco foi devolvido ao estado anterior à auditoria: as duas linhas de
`configuracoes` criadas para provar o efeito da configuração foram apagadas
(não existiam antes), e as contas temporárias `auditoria.admin@teste.local` e
`auditoria.aluno@teste.local` foram removidas de `public.matriculas`,
`public.profiles`, `auth.identities` e `auth.users`. Confirmado depois: 3
usuários reais, 3 profiles, nenhuma conta `teste.local`, nenhuma chave
`copiloto.*` sobrando.
