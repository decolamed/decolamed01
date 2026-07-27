-- ============================================================================
-- DECOLA MED — SEED: FACAPE 2026.2 - Rede PEBA/Bolsistas
--
-- Gerado a partir do caderno de prova e do gabarito definitivo publicados
-- pela FACAPE. Questoes anuladas pela banca e questoes de literatura sobre
-- obras fora do edital vigente nao entram.
--
-- Idempotente: o conflito e resolvido pelo indice unico da migracao 025,
-- entao reexecutar atualiza a questao em vez de criar outra.
-- ============================================================================


insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Português', null, '"De todas as formas de se vender um serviço ou
um produto a mais sedutora é a venda do sonho.
Existem no nosso país milhares de jovens que
sonham ser médicos. Grande parte desses,
movidos por sentimentos altruístas de ajudar o
próximo e melhorar a saúde das pessoas, e
também de forma concomitante por sentimentos
de ordem socioeconômica, como, certo status
profissional, ganhos financeiros futuros e
empregabilidade. Sabemos que não há vagas
nas nossas universidades (sejam públicas ou
particulares) para todos que desejam optar por
essa carreira e desta forma existe um mercado
de alunos em potencial gigantesco. o que gera
uma especulação grande do mercado de
ensino."
Disponível
em:https://academiamedica.com.br
(adaptado)
Com base na leitura do texto acima, pode-se
afirmar que:',
  '[{"id": "a", "texto": "a expressão “...venda do sonho...” no período \"De todas as formas de se vender um serviço ou um produto a mais sedutora é a venda do sonho.” não produz um efeito relevante na produção do texto."}, {"id": "b", "texto": "a sequência “...que sonham ser médicos.” no período “Existem no nosso país milhares de jovens que sonham ser médicos.” expressa valor semântico de consequência."}, {"id": "c", "texto": "a relação expressa pelo conectivo “e” no trecho “Grande parte desses, movidos por sentimentos altruístas de ajudar o próximo e melhorar a saúde das pessoas...” serve à finalidade de introduzir uma orientação argumentativa de acréscimo em relação à ideia anterior."}, {"id": "d", "texto": "a sequência “...que desejam optar por essa carreira...” em “Sabemos que não há vagas nas nossas universidades (sejam públicas ou particulares) para todos que desejam optar por essa carreira...” é introduzida por um coesivo que expressa ideia de condição."}, {"id": "e", "texto": "a expressão “...potencial gigantesco...” é uma característica descritiva no trecho “...desta forma existe um mercado de alunos em potencial gigantesco, o que gera uma especulação grande do mercado de ensino.\"."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 1, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Português', null, 'Disponível em: https://www.shutterstock.com
No texto acima, a palavra “que”, do ponto de
vista da estrutura morfológica, exerce a função
de:',
  '[{"id": "a", "texto": "conjunção subordinativa integrante."}, {"id": "b", "texto": "pronome relativo."}, {"id": "c", "texto": "conjunção subordinativa causal."}, {"id": "d", "texto": "advérbio de Intensidade."}, {"id": "e", "texto": "preposição."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 2, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q02-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Português', null, '“Doenças psicossomáticas são condições de
saúde causadas por alterações emocionais,
como estresse ou ansiedade, provocando
sintomas físicos, como dor, falta de ar, coração
acelerado, tremores ou diarreia, por exemplo.
Normalmente, os sintomas que resultam de
doenças psicossomáticas não são explicados por
nenhuma outra doença ou alteração física e/ou
orgânica. Por isso, uma pessoa que tenha uma
doença psicossomática, pode fazer várias
consultas e com vários médicos sem nunca
conseguir identificar uma causa. O tratamento
das doenças psicossomáticas, ou transtorno de
sintomas somáticos, é feito pelo psiquiatra e
geralmente inclui a realização de psicoterapia
e/ou uso de medicamentos, como
antidepressivos ou ansiolíticos, para ajudar a
aliviar os sintomas.”
Disponível em: https://www.tuasaude.com/(adaptado)
Leia o texto acima e assinale a alternativa
CORRETA.',
  '[{"id": "a", "texto": "Há uma certa redundância que se manifesta, por meio de repetição de frases, na construção do texto."}, {"id": "b", "texto": "O período “Doenças psicossomáticas são condições de saúde causadas por alterações emocionais, como estresse ou ansiedade, provocando sintomas físicos, como dor, falta de ar, coração acelerado, tremores ou diarreia, por exemplo.” apresenta características próprias da linguagem informal."}, {"id": "c", "texto": "O período “Normalmente, os sintomas que resultam de doenças psicossomáticas não são explicados por nenhuma outra doença ou alteração física e/ou orgânica.” foi construído sem preocupação com as exigências da modalidade escrita."}, {"id": "d", "texto": "No período “Por isso, uma pessoa que tenha uma doença psicossomática, pode fazer várias consultas e com vários médicos sem nunca conseguir identificar uma causa.” não há clareza na organização e apresentação das ideias."}, {"id": "e", "texto": "No período “O tratamento das doenças psicossomáticas, ou transtorno de sintomas somáticos, é feito pelo psiquiatra e geralmente inclui a realização de psicoterapia e/ou uso de medicamentos, como antidepressivos ou ansiolíticos, para ajudar a aliviar os sintomas.” contém características que incluem o uso formal da linguagem."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 3, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Português', null, '“O sintoma mais importante da fibromialgia é a
dor difusa pelo corpo. Habitualmente, o paciente
tem dificuldade de definir quando começou a
dor, se ela começou de maneira localizada que
depois se generalizou ou que já começou no
corpo todo. O paciente sente mais dor no final do
dia, mas pode haver também pela manhã. A dor
é sentida “nos ossos” ou “na carne” ou ao redor
das articulações. Existe uma maior sensibilidade
ao toque, sendo que muitos pacientes não
toleram ser “agarrados” ou mesmo abraçados.
Não há inchaço das articulações na FM, pois não
há inflamação nas articulações. A sensação de
inchaço pode aparecer pela contração da
musculatura em resposta à dor.”
 Disponível
em: https://www.reumatologia.org.br (adaptado)
Sobre o texto, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "a organização da composição textual é voltada apenas para os reumatologistas."}, {"id": "b", "texto": "é direcionado somente aos profissionais que atuam em hospitais especializados."}, {"id": "c", "texto": "esclarece mitos e verdades sobre a fibromialgia."}, {"id": "d", "texto": "a articulação entre ideias está de acordo com a norma culta."}, {"id": "e", "texto": "a estrutura da linguagem é uma sequência discursiva injuntiva."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 4, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Português', null, '“Além do profissionalismo e da ética, o cirurgião
cardiovascular precisa ser bastante atento, a fim
de observar os mínimos detalhes. Ele precisa ter
muita habilidade com as mãos e ser preciso, já
que boa parte dos procedimentos oferecem risco
à vida dos pacientes. A empatia e a sensibilidade
também devem fazer parte do perfil desse
profissional, para prestar a melhor assistência
aos indivíduos. E ainda, com os avanços
tecnológicos pelos quais a aérea passa, o
médico-cirurgião precisa ter habilidade com
cateteres e conhecer bastante os métodos de
imagem e cuidados pré e pós-operatório.
Desse modo, ele precisa estar sempre atualizado
e ser conhecedor das novas tecnologias em
saúde e de procedimentos minimamente
invasivos: a exemplo da cirurgia endovascular e
cirurgia por vídeo”
Disponível em:
https://www.eumedicoresidente.com.
br
Sobre o texto acima, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "em “Além do profissionalismo e da ética, o cirurgião cardiovascular precisa ser bastante atento, a fim de observar os mínimos detalhes.”, a palavra “bastante” exerce, do ponto de vista sintático, a função de adjunto adnominal."}, {"id": "b", "texto": "em “Ele precisa ter muita habilidade com as mãos e ser preciso, já que boa parte dos procedimentos oferecem risco à vida dos pacientes.” o recurso coesivo “já que” expressa valor de causa em relação à ideia anterior."}, {"id": "c", "texto": "em “A empatia e a sensibilidade também devem fazer parte do perfil desse profissional, para prestar a melhor assistência aos indivíduos.”, as palavras “empatia” e “sensibilidade” são inexpressivas na progressão textual."}, {"id": "d", "texto": "em “E ainda, com os avanços tecnológicos pelos quais a aérea passa, o médico-cirurgião precisa ter habilidade com cateteres e conhecer bastante os métodos de imagem e cuidados pré e pós-operatório”, as palavras “ainda” e “habilidade” são desnecessárias para organização da macroestrutura semântica."}, {"id": "e", "texto": "em “Desse modo, ele precisa estar sempre atualizado e ser conhecedor das novas tecnologias em saúde e de procedimentos minimamente invasivos: a exemplo da cirurgia endovascular e cirurgia por vídeo.”, o recurso “Desse modo” está desarticulado no processo de coesão textual."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 5, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q05-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q05-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Português', null, '“O avanço tecnológico e científico tem
revolucionado a medicina. São inovações que
vão desde a implementação de sistemas mais
interativos no atendimento ao paciente até a
produção de aparelhos que auxiliam no
diagnóstico mais rápido e preciso. Ao longo da
história da humanidade, profissionais da saúde
sempre enfrentaram grandes desafios no
diagnóstico de doenças, desenvolvimento de
medicamentos e suporte no tratamento de
enfermidades. Em paralelo, o amplo
desenvolvimento de recursos tecnológicos bem
aplicados na área da saúde sempre contribuíram
para a descoberta e tratamento de diversos tipos
de doenças. De acordo com informações da
Aliança Brasileira da Indústria Inovadora em
Saúde (ABIIS), estima-se que o Brasil possui, em
média, mais de 500 mil tecnologias médicas em
utilização, que engloba desde exames
laboratoriais de rotina até tratamentos para
doenças com alto grau de complexidade.”
Disponível em: https://pronep.com.br/ (adaptado)
Considerando os aspectos linguísticos do texto
acima, assinale a alternativa CORRETA.',
  '[{"id": "a", "texto": "Nos dois primeiros parágrafos, a coesão, a coerência e a pontuação não estão de acordo com a norma culta."}, {"id": "b", "texto": "No período “Ao longo da história da humanidade, profissionais da saúde sempre enfrentaram grandes desafios no diagnóstico de doenças, desenvolvimento de medicamentos e suporte no tratamento de enfermidades.”, a seleção vocabular compromete a clareza e a intenção comunicativa do texto."}, {"id": "c", "texto": "No período “Em paralelo, o amplo desenvolvimento de recursos tecnológicos bem aplicados na área da saúde sempre contribuíram para a descoberta e tratamento de diversos tipos de doenças.”, a forma verbal “contribuíram” foi empregada no pretérito perfeito do modo indicativo."}, {"id": "d", "texto": "No trecho “De acordo com informações da Aliança Brasileira da Indústria Inovadora em Saúde (ABIIS), estima-se que o Brasil possui, em média, mais de 500 mil tecnologias médicas em utilização...”, há um registro de informalidade que prejudica a compreensão do leitor."}, {"id": "e", "texto": "No trecho “...que engloba desde exames laboratoriais de rotina até tratamentos para doenças com alto grau de complexidade.”, o recuso coesivo “que” não se articula com as ideias anteriores do texto."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 6, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Português', null, 'No texto acima, a expressão “de amor”, do ponto
de vista da estrutura sintática, exerce a função
de:',
  '[{"id": "a", "texto": "agente da passiva."}, {"id": "b", "texto": "adjunto adnominal."}, {"id": "c", "texto": "objeto indireto."}, {"id": "d", "texto": "adjunto adverbial de modo."}, {"id": "e", "texto": "adjunto adverbial de causa."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 7, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q07-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q07-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-peba-q07-3.png", "legenda": null, "ordem": 3}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Português', null, 'Sobre a obra “Os Homens de Barro” de Ariano
Suassuna, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "é exclusivamente focada no folclore e na temática sertaneja."}, {"id": "b", "texto": "ironiza a resistência e a capacidade criativa do sertanejo."}, {"id": "c", "texto": "confunde o leitor através de uma mistura de história, mito e cultura popular."}, {"id": "d", "texto": "aborda a resistência contra a opressão dos fazendeiros, destacando a seca, o misticismo e a desigualdade."}, {"id": "e", "texto": "utiliza o humor e desvaloriza a religiosidade com o propósito de enfraquecer os poderosos do sertão pernambucano."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 8, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q08-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Português', null, '“A partir do cenário histórico do jaguncismo no
sertão brasileiro, em meio às mudanças da
modernização, o romance entrelaça temas
importantes como amor e guerra, ao mesmo
tempo em que evidencia a violência estrutural e
a desigualdade social que marcam a formação
do país. Riobaldo, o narrador em primeira
pessoa, centraliza a narrativa por meio da
rememoração em um longo monólogo
ininterrupto, ao contar sua história a um doutor
da cidade que não se manifesta diretamente.”
Disponível em: https://www.fflch.usp.br (adaptado)
O comentário transcrito acima é uma referência da
obra:',
  '[{"id": "a", "texto": "“São Bernardo” de Graciliano Ramos."}, {"id": "b", "texto": "“Grande Sertão: Veredas” de Guimarães Rosa."}, {"id": "c", "texto": "“Fogo Morto” de José Lins do Rego."}, {"id": "d", "texto": "“A Moreninha” de Joaquim Manuel de Macedo."}, {"id": "e", "texto": "“Terras do Sem Fim” de Jorge Amado."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 9, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Português', null, 'Assinale a alternativa cujo fragmento faz parte da
obra “A Moreninha” de Joaquim Manuel de
Macedo.',
  '[{"id": "a", "texto": "“D. Carolina brilhava no jardim e, mais que as outras, por graças e encantos que todos sentiam e que ninguém poderia bem descrever, confessava-se que não era bela, mas jurava-se que era encantadora; alguém queria que ela tivesse maiores olhos, porém não havia quem resistisse à viveza de seus olhares...”."}, {"id": "b", "texto": "B) “A noite estava escura. Era uma dessas noites de Petrópolis, envoltas em nevoeiro e cerração. Caminhávamos mais pelo tato do que pela vista, dificilmente distinguíamos os objetos a uma pequena distância; e muitas vezes, quando o meu guia se apressava, o seu vulto perdia-se nas trevas...”."}, {"id": "c", "texto": "“Os escravos ficaram pasmos, quando à hora do almoço Leôncio achou-se sozinho à mesa. Leôncio mandou chamar Malvina, mas esta, pretextando uma indisposição, não quis sair de seu quarto....”."}, {"id": "d", "texto": "“Apesar de tudo quanto havia já sofrido por amores, o Leonardo de modo algum queria emendar-se; enquanto se lembrou da cadeia, dos granadeiros e do Vidigal esqueceu-se da cigana, ou antes só pensava nela para jurar esquecê-la; quando porém as caçoadas dos companheiros foram cessando, começou a renovar-se a paixão...”."}, {"id": "e", "texto": "“Quando apaguei a minha vela ao deitar-me, na dúbia visão que oscila entre o sono e a vigília, foi que desenhou-se no meu espírito em viva cor a reminiscência que despertara em mim o encontro de Lúcia. Lembrei-me então perfeitamente quando e como a vira a primeira vez....”."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 10, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q10-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Inglês', null, 'Physical Conditioning for a Healthy Life
To achieve good health, it is essential to focus on
physical conditioning, which refers to improving
your body’s performance through regular
exercise. A well-rounded routine should include
both aerobic activities, like jogging or swimming,
and strength training, such as lifting weights.
Aerobic exercise strengthens the heart and
lungs, while strength training builds muscle mass
and protects your joints from injury. By
combining these two types of movement, you
ensure that your body remains functional and
resilient as you age.
Understanding the concept of physical effort is
also crucial for progress. You don’t need to push
yourself to the point of exhaustion every day;
instead, you should aim for “moderate-to-vigorous” intensity. This means your heart rate
increases and you breathe harder, but you can
still hold a brief conversation. Consistency is
much more important than occasional high-intensity bursts. Finding activities you enjoy
makes it easier to maintain the necessary effort
over the long term without feeling overwhelmed.
Finally, recovery is just as important as the
exercise itself. When we put effort into a workout,
we create tiny tears in our muscles; these
muscles grow stronger only during periods of
rest. Proper sleep, hydration, and healthy
nutrition are the fuel that allows the body to
repair itself. If you listen to your body and
balance hard work with adequate downtime, you
will see significant improvements in your energy
levels and overall well-being.
Based on the text about physical conditioning
and health, which of the following statements is
correct? Mark the right alternative:',
  '[{"id": "a", "texto": "Strength training is only important for professional athletes to prevent injuries."}, {"id": "b", "texto": "Physical effort should always reach the point of exhaustion to be effective for health."}, {"id": "c", "texto": "Aerobic activities and strength training should be combined for a functional and resilient body."}, {"id": "d", "texto": "Recovery and sleep are less important than the intensity of the workout itself."}, {"id": "e", "texto": "Consistency in exercise is less relevant than occasional high-intensity bursts of activity."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 11, 'ingles', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Inglês', null, 'According to the text, what is the specific role of
recovery in a fitness routine? Mark the correct
alternative:',
  '[{"id": "a", "texto": "It is less important than the workout because muscles only grow during exercise."}, {"id": "b", "texto": "It allows the body to repair tiny muscle tears and become stronger."}, {"id": "c", "texto": "It is only necessary if you feel extreme exhaustion after a training session."}, {"id": "d", "texto": "It consists only of drinking water and does not involve sleep or nutrition."}, {"id": "e", "texto": "It should be avoided if you want to see fast improvements in your energy levels."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 12, 'ingles', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Inglês', null, 'What is the passive voice of this sentence: “They
painted the house.” Mark the right alternative:',
  '[{"id": "a", "texto": "The house was painted."}, {"id": "b", "texto": "The house is painted."}, {"id": "c", "texto": "The house is being painted."}, {"id": "d", "texto": "The house was being by painted."}, {"id": "e", "texto": "The house is going to be painted."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 13, 'ingles', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Inglês', null, 'What is the correct sentence? Mark the right
choice:',
  '[{"id": "a", "texto": "The doctor said that sick been very had the patient."}, {"id": "b", "texto": "The doctor said patient sick been had the very."}, {"id": "c", "texto": "The doctor said that had the patient be very sick."}, {"id": "d", "texto": "The doctor said that the patient had been very sick."}, {"id": "e", "texto": "The doctor said that very sick been the patient had."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 14, 'ingles', false,
  '[{"url": "/questoes-facape/2026.2-peba-q14-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q14-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Inglês', null, 'This sentence: “She was able to help the
nurse.”, can be replaced by:',
  '[{"id": "a", "texto": "She got help the could nurse."}, {"id": "b", "texto": "She could help the nurse."}, {"id": "c", "texto": "She help the nurse."}, {"id": "d", "texto": "She able could help the nurse."}, {"id": "e", "texto": "She the nurse help her."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 15, 'ingles', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Espanhol', null, 'A pocos meses del pitazo inicial de la Copa
Mundial de la FIFA 2026, la organización
compartida entre México, Estados Unidos y
Canadá plantea desafíos que trascienden lo
estrictamente deportivo. En las sedes mexicanas,
como Ciudad de México, Guadalajara y
Monterrey, las masivas inversiones en
remodelación de estadios y modernización del
transporte urbano han reavivado un viejo debate.
Mientras las autoridades celebran la inyección
económica y la vitrina global que supone el
megaevento, diversas organizaciones civiles
advierten sobre los costos ocultos de esta
anhelada fiesta. La acelerada gentrificación de
los barrios aledaños a las zonas mundialistas ha
desplazado a cientos de familias de bajos
ingresos, incapaces de costear el abrupto
aumento de los alquileres. Así, la fiebre
mundialista visibiliza, una vez más, la histórica
tensión entre el desarrollo de infraestructuras de
clase mundial y la vulnerabilidad habitacional de
las poblaciones locales.
RODRÍGUEZ, L. El costo social de la pasión
mundialista. La Jornada, Ciudad de México,
15 mar. 2026 (adaptado).
A realização de megaeventos desportivos em
países latino-americanos frequentemente suscita
debates sobre as prioridades do investimento
público. Ao relatar os preparativos das cidades
mexicanas para a Copa do Mundo de 2026, o
texto jornalístico tem o propósito de:',
  '[{"id": "a", "texto": "enaltecer a modernização da infraestrutura de transporte urbano como uma solução definitiva para a histórica desigualdade socioeconómica nas metrópoles mexicanas."}, {"id": "b", "texto": "criticar a ineficiência estatal no planeamento do evento, argumentando que a falta de segurança pública compromete o potencial turístico da competição."}, {"id": "c", "texto": "evidenciar o contraste socioespacial entre os benefícios macroeconómicos celebrados pelo governo e a exclusão habitacional imposta às populações mais vulneráveis."}, {"id": "d", "texto": "condenar o modelo de organização partilhada entre três países, sustentando que a divisão de sedes impede que o México receba investimentos internacionais adequados."}, {"id": "e", "texto": "justificar a elitização dos bairros próximos aos estádios como um mecanismo necessário para garantir a rentabilidade econômica dos espaços desportivos modernizados."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 11, 'espanhol', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Espanhol', null, 'Yo estoy en PR, tranquilo, pero
Debí tirar más fotos de cuando te tuve
Debí darte más beso'' y abrazo'' las vece'' que
pude
Ey, ojalá que los mío'' nunca se muden
[...]
Vamo'' a disfrutar, que nunca se sabe si nos
queda poco
Debí tirar más fotos
Gente, lo'' quiero con cojone'', los amo
Gracias por estar aquí, de verdad
Para mí, es bien importante que estén aquí Cada
uno de ustede'' significa mucho para mí Así que,
vamo'' pa'' la foto, vengan pa''cá
Métase to''l mundo, to''l corillo, vamo''
BAD BUNNY. DtMF. In: DeBÍ TiRAR MáS FOToS.
San Juan: Rimas Entertainment, 2025.
A música urbana latino-americana
contemporânea frequentemente reflete
inquietações emocionais e o modo como as
novas gerações lidam com a passagem
incontrolável do tempo. No trecho da canção
DtMF, o lamento do eu lírico tem o propósito de:',
  '[{"id": "a", "texto": "refletir sobre a efemeridade da vida e expressar um arrependimento nostálgico, incentivando a valorização e o registro visual do momento presente ao lado das pessoas amadas."}, {"id": "b", "texto": "destacar o valor inestimável do afeto e das memórias partilhadas em comunidade, concluindo que a melhor forma de viver o presente é rejeitar ativamente o uso de câmaras e tecnologias."}, {"id": "c", "texto": "demonstrar a superficialidade das relações sociais em eventos festivos, argumentando que o excesso de fotografias serve apenas para mascarar a solidão sentida no convívio urbano."}, {"id": "d", "texto": "minimizar a dor imposta pelo distanciamento físico ao propor que a ausência seja superada pela simples capacidade da memória humana de reter os detalhes emocionais do passado."}, {"id": "e", "texto": "incentivar o isolamento emocional preventivo, argumentando que a criação de novos laços afetivos e registros visuais apenas gera mais sofrimento frente à imprevisibilidade do futuro."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 12, 'espanhol', false,
  '[{"url": "/questoes-facape/2026.2-peba-q12-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q12-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Espanhol', null, 'Las crecientes tensiones geopolíticas en el este
de Europa han llevado a varios países bálticos y
nórdicos a reconfigurar drásticamente sus
políticas de defensa en los primeros meses de
2026. Ante la amenaza de una escalada bélica
que desestabilice la región continental, diversos
gobiernos han reactivado el servicio militar
obligatorio y han emitido órdenes de movilización
de tropas de reserva. Sin embargo, esta
militarización del espacio público no ha sido
recibida con unanimidad. Mientras las
autoridades justifican las medidas como una
“disuasión necesaria para salvaguardar la
soberanía democrática”, amplios sectores de la
sociedad civil y movimientos pacifistas europeos
advierten que la retórica del rearme desvía
recursos cruciales de las agendas climática y
social. En las calles de ciudades como Helsinki y
Varsovia, las masivas protestas evidencian la
fractura entre la urgencia estratégica de los
Estados y el agotamiento de una población que
teme el retorno inminente a los tiempos más
oscuros de la Guerra Fría.
MARTÍNEZ, C. El rearme europeo y el eco de la
Guerra Fría. La Vanguardia, Barcelona, 22 mar.
2026 (adaptado).
A cobertura jornalística de crises geopolíticas
frequentemente expõe as contradições internas
dos países envolvidos. Ao relatar as recentes
políticas de mobilização militar no continente
europeu, o texto tem o propósito de:',
  '[{"id": "a", "texto": "enaltecer a coesão absoluta da sociedade europeia em torno do rearmamento como a única estratégia viável para garantir a estabilidade econômica da região."}, {"id": "b", "texto": "evidenciar a polarização entre o discurso oficial de segurança do Estado e as inquietações da sociedade civil, que teme os retrocessos do militarismo."}, {"id": "c", "texto": "minimizar o impacto real das ordens de mobilização de tropas, argumentando que as tensões no leste europeu são apenas manobras retóricas temporárias."}, {"id": "d", "texto": "denunciar o desvio de investimentos das áreas sociais e climáticas para as políticas de defesa, sugerindo que os governos organizem ataques militares preventivos."}, {"id": "e", "texto": "justificar a reativação do serviço militar obrigatório como um mecanismo necessário para conter as manifestações de civis que desestabilizam a ordem pública."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 13, 'espanhol', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Espanhol', null, 'GREENPEACE MÉXICO. Campaña contra el impacto de la
moda rápida. Ciudad de México, 2024 (adaptado).
Os textos publicitários de campanhas sociais
recorrem frequentemente a metáforas visuais
para confrontar o público e alterar o seu
comportamento. Ao articular a imagem da
ampulheta com o apelo verbal “Tu armario no
necesita respirar”, a campanha tem o propósito
principal de:',
  '[{"id": "a", "texto": "evidenciar que a doação sistemática de peças de vestuário não utilizadas a instituições de caridade soluciona o problema global da poluição têxtil."}, {"id": "b", "texto": "destacar a falta de espaço nas habitações urbanas modernas, incentivando a adoção de um estilo de vida minimalista focado na poupança financeira."}, {"id": "c", "texto": "relativizar a responsabilidade do consumidor individual, atribuindo a degradação do globo terrestre exclusivamente à ineficiência da reciclagem industrial."}, {"id": "d", "texto": "condenar o modelo de produção acelerada da indústria da moda, argumentando que a solução definitiva reside na substituição imediata de todas as peças do armário por tecidos ecológicos."}, {"id": "e", "texto": "alertar para o impacto destrutivo do ciclo de consumo e descarte acelerado de roupas, apelando a uma tomada de consciência em prol da preservação ambiental."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 14, 'espanhol', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Espanhol', null, 'La gentrificación en los barrios históricos de las
grandes metrópolis no solo expulsa a los
residentes tradicionales, sino que borra
sistemáticamente la memoria urbana de las
comunidades. Los vecinos más antiguos intentan
resistir organizando asambleas, pero muchos ya
no logran costear los alquileres repentinamente
inflados por la especulación. Ante la crisis, las
autoridades locales prometieron establecer leyes
para regular el mercado inmobiliario y proteger a
los más vulnerables. Sin embargo, no lo hicieron
a tiempo para salvar las emblemáticas plazas y
los comercios familiares que sostenían la
identidad del barrio. Hoy, los turistas pasean
maravillados por calles estandarizadas,
ignorando que, bajo esa reluciente fachada de
modernidad, late el silencio de quienes fueron
obligados a abandonar su hogar.
SÁNCHEZ, P. El costo de la ciudad escaparate:
crónicas de desplazamiento. Santiago: LOM
Ediciones, 2023 (adaptado).
O domínio de estruturas gramaticais, como o uso
de pronomes, é essencial para a compreensão
da progressão temática e da coesão nos textos
em língua espanhola. No excerto "Sin embargo,
no lo hicieron a tiempo", o pronome
complemento direto destacado desempenha
uma função anafórica, retomando a informação
prévia de que as autoridades deveriam:',
  '[{"id": "a", "texto": "organizar assembleias populares para resistir à forte especulação que atinge os moradores mais antigos."}, {"id": "b", "texto": "promover a modernização padronizada das ruas a fim de atrair os turistas aos bairros históricos da capital."}, {"id": "c", "texto": "abandonar os comércios familiares locais para facilitar a expansão ininterrupta do mercado imobiliário."}, {"id": "d", "texto": "regular o mercado imobiliário através de leis específicas destinadas a proteger os residentes vulneráveis."}, {"id": "e", "texto": "apagar sistematicamente a memória urbana das comunidades para construir uma fachada de progresso."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 15, 'espanhol', false,
  '[{"url": "/questoes-facape/2026.2-peba-q15-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q15-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Matemática', null, 'Foram verificadas as notas dos 30 alunos de uma
turma do 3º ano do ensino médio. Essas notas,
que variaram de 5 a 10, bem como a frequência,
foram anotadas na tabela abaixo:
Notas 5 6 8 9 10
Nº de
alunos 7 5 8 6 4
A nota média desses alunos, com aproximação
de uma casa decimal, foi:',
  '[{"id": "a", "texto": "7,0"}, {"id": "b", "texto": "7,2"}, {"id": "c", "texto": "7,4"}, {"id": "d", "texto": "7,6"}, {"id": "e", "texto": "7,8"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 16, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q16-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q16-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-peba-q16-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Matemática', null, 'Três estudantes fazem parte da equipe A, que
está participando de uma olimpíada de
deveria resolver alguns problemas matemáticos
e iam somando pontos a cada problema que
resolviam corretamente. Ao final da competição,
a equipe A somou um total de 3.600 pontos. Se a
soma desses pontos for proporcional à
quantidade de questões que cada componente
da equipe acertou, e sabendo que um deles
acertou 20 questões, o outro 25 e o terceiro 30,
então o número de pontos marcados por cada
membro da equipe, respectivamente, foi:',
  '[{"id": "a", "texto": "860; 1.100; 1.640."}, {"id": "b", "texto": "960; 1.200; 1.440."}, {"id": "c", "texto": "900; 1.200; 1.500."}, {"id": "d", "texto": "1.000; 1.250; 1350."}, {"id": "e", "texto": "1.100; 1.600; 900."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 17, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q17-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Matemática', null, 'O controle financeiro de uma empresa exige
cuidado e atenção na destinação dos recursos
disponíveis em caixa. Ao final de um mês, uma
empresa conta com R$ 120.000,00 e a
destinação desse valor é a seguinte: 40% do total
para cobrir as despesas que a empresa tem com
seus fornecedores; 25% para as despesas com a
folha de pagamento de seus funcionários; 20%
para outras despesas. O restante será
reinvestido na própria empresa. Portanto, o valor
destinado a ser reinvestido na própria empresa
é:',
  '[{"id": "a", "texto": "R$ 10.800,00"}, {"id": "b", "texto": "R$ 18.000,00"}, {"id": "c", "texto": "R$ 24.000,00"}, {"id": "d", "texto": "R$ 43.200,00"}, {"id": "e", "texto": "R$ 48.000,00"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 18, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q18-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Matemática', null, 'A figura a seguir é a representação de dois
círculos concêntricos. O raio do círculo maior é
representado por R e o raio do círculo menor por
r.
Considerando π = 3, a área da parte sombreada
da figura será igual a:',
  '[{"id": "a", "texto": "3R2 – r"}, {"id": "b", "texto": "3R + 3r"}, {"id": "c", "texto": "3(R – r)"}, {"id": "d", "texto": "3R2 + 3r2"}, {"id": "e", "texto": "3(R2 – r )"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 19, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q19-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q19-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-peba-q19-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-peba-q19-full2.png", "legenda": null, "ordem": 92}, {"url": "/questoes-facape/2026.2-peba-q19-full3.png", "legenda": null, "ordem": 93}, {"url": "/questoes-facape/2026.2-peba-q19-full4.png", "legenda": null, "ordem": 94}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Matemática', null, 'Considere uma progressão aritmética de 10
termos, sendo o primeiro deles −5 e a razão igual
a 6. Dessa sequência aritmética foram excluídos
sucessivamente os seguintes termos: 2º, 3º, 5º,
6º, 8º e 9º. Com isso, a sequência restante será:',
  '[{"id": "a", "texto": "uma progressão geométrica."}, {"id": "b", "texto": "uma sequência de soma dos termos negativa."}, {"id": "c", "texto": "uma progressão aritmética de razão 18."}, {"id": "d", "texto": "uma progressão aritmética de razão 13."}, {"id": "e", "texto": "uma progressão aritmética decrescente. FÍSICA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 20, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Física', null, 'Um vagão de testes transporta em seu teto um
pêndulo composto por um fio ideal e uma esfera
de massa 𝑚 = 2 𝑘𝑔 . O vagão realiza dois
movimentos simultâneos com acelerações
constantes: Acelera horizontalmente para a
direita com 𝑎𝐻 = 9 𝑚 𝑠
2 ⁄ e acelera verticalmente
para cima com 𝑎𝑉 = 2 𝑚 𝑠
2 ⁄ . Considerando a
aceleração da gravidade local como 𝑔 =
10 𝑚 𝑠
2 ⁄ , determine o valor numérico da tração T
no fio quando o pêndulo atinge o seu equilíbrio e
o valor da tangente do ângulo 𝜃 que o fio faz com
a vertical.',
  '[{"id": "a", "texto": "𝑇 = 20𝑁 ,tan 𝜃 = 0,75"}, {"id": "b", "texto": "𝑇 = 25𝑁 ,tan 𝜃 = 0,60"}, {"id": "c", "texto": "𝑇 = 30𝑁 ,tan 𝜃 = 0,75"}, {"id": "d", "texto": "𝑇 = 30𝑁 ,tan 𝜃 = 1,33"}, {"id": "e", "texto": "𝑇 = 40𝑁 ,tan 𝜃 = 0,50"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 21, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q21-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Física', null, 'Para estudar o comportamento de sistemas de
paraquedas, onde a resistência do ar é um fator
crítico para a estabilidade, um grupo de
pesquisadores realiza o seguinte experimento:
uma esfera técnica de 200 g é solta e, em um
determinado instante da queda, sensores de
telemetria registram que a esfera cai
verticalmente com uma aceleração de 4 𝑚 𝑠
2 ⁄ .
Sabendo que a aceleração da gravidade local é
10 𝑚 𝑠
2 ⁄ , determine o módulo da força de
resistência exercida pelo ar sobre essa esfera
nesse exato momento.',
  '[{"id": "a", "texto": "0,4 N"}, {"id": "b", "texto": "0,8N"}, {"id": "c", "texto": "1,0 N"}, {"id": "d", "texto": "1,2 N"}, {"id": "e", "texto": "2,0 N"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 22, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q22-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-peba-q22-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Física', null, 'Para avaliar a eficiência de para-choques de fim
de linha em terminais ferroviários, onde a energia
de um vagão em movimento deve ser transferida
para sistemas elásticos para evitar danos
estruturais, um grupo de engenheiros utiliza o
seguinte modelo: uma esfera de massa 𝑚 =
100𝑔 está em repouso sobre uma superfície sem
atrito, vinculada a uma mola de constante 𝑘 =
9 𝑁⁄𝑚. A esfera é atingida por um pêndulo de
mesma massa 𝑚 que cai de uma altura de 0,5 𝑚
em uma colisão perfeitamente elástica.
Considerando 𝑔 = 10 𝑚 𝑠
2 ⁄ , determine a
compressão máxima sofrida pela mola após o
impacto.',
  '[{"id": "a", "texto": "10,0 cm"}, {"id": "b", "texto": "25,0 cm"}, {"id": "c", "texto": "33,3 cm"}, {"id": "d", "texto": "50,3 cm"}, {"id": "e", "texto": "66,6 cm"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 23, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q23-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Física', null, 'Para investigar as técnicas de blindagem
eletromagnética em biociências, onde é
necessário criar ambientes de "silêncio
magnético" para que sinais elétricos delicados do
corpo humano não sofram interferência, um
pesquisador utiliza o modelo de uma espira
circular de raio 𝑅 percorrida por uma corrente 𝑖.
Posicionado a uma distância 2𝑅 de seu centro,
um fio retilíneo longo com corrente 𝑖1 gera um
campo que deve ser neutralizado, conforme a
figura. Dessa forma, determine as condições
necessárias para que o campo magnético
resultante no centro da espira seja nulo:',
  '[{"id": "a", "texto": "𝑖1 𝑖 = 2𝜋 , 𝑖 (𝑠𝑒𝑛𝑡𝑖𝑑𝑜 ℎ𝑜𝑟á𝑟𝑖𝑜)"}, {"id": "b", "texto": "𝑖1 𝑖 = 2𝜋 , 𝑖 (𝑠𝑒𝑛𝑡𝑖𝑑𝑜 𝑎𝑛𝑡𝑖 − ℎ𝑜𝑟á𝑟𝑖𝑜)"}, {"id": "c", "texto": "𝑖1 𝑖 = 𝜋 , 𝑖 (𝑠𝑒𝑛𝑡𝑖𝑑𝑜 ℎ𝑜𝑟á𝑟𝑖𝑜)"}, {"id": "d", "texto": "𝑖1 𝑖 = 𝜋, 𝑖 (𝑠𝑒𝑛𝑡𝑖𝑑𝑜 𝑎𝑛𝑡𝑖 − ℎ𝑜𝑟á𝑟𝑖𝑜)"}, {"id": "e", "texto": "𝑖1 𝑖 = 4𝜋 , 𝑖 (𝑠𝑒𝑛𝑡𝑖𝑑𝑜 ℎ𝑜𝑟á𝑟𝑖𝑜)"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 24, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q24-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q24-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-peba-q24-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-peba-q24-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Física', null, 'Para investigar as condições de segurança em
projetos de infraestrutura para esportes radicais,
onde é vital garantir que o atleta mantenha o
contato com a superfície em curvas elevadas, um
projetista utiliza o modelo de um bloco de massa
𝑚 que se move sob o efeito da gravidade 𝑔 em
um trilho sem atrito. O trilho é composto por dois
arcos de circunferência de raio 𝑅 que se
tangenciam, conforme ilustrado na figura. Para
que o bloco percorra toda a extensão do trilho
sem perder o contato com a pista ao passar pelo
ponto mais alto da segunda curva, ponto A, a
mínima altura inicial ℎ de onde ele deve partir, do
repouso, é:',
  '[{"id": "a", "texto": "𝑅"}, {"id": "b", "texto": "𝜋 𝑅"}, {"id": "c", "texto": "3 𝑅"}, {"id": "d", "texto": "2𝜋𝑅"}, {"id": "e", "texto": "5𝑅/2 QUÍMICA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 25, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q25-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q25-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-peba-q25-3.png", "legenda": null, "ordem": 3}, {"url": "/questoes-facape/2026.2-peba-q25-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-peba-q25-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Química', null, 'A teoria atômica evoluiu de esferas indivisíveis
de Dalton (1808) para modelos baseados em
partículas subatômicas: Thomson (elétrons),
Rutherford (núcleo positivo) e Bohr (níveis de
energia). Elementos químicos são definidos pelo
número de prótons, sendo a menor unidade da
matéria, compostos por núcleos e eletrosfera,
organizados na Tabela Periódica com base em
suas propriedades.
Disponível em:
https://www.institutoclaro.org.br/educacao/para-aprender/roteiros-de-estudo/estudar-em-casa-evolucao-do-modelo-atomico/ Acesso em 20.02.26.
Sobre a evolução da ciência, substâncias
químicas, ligações e meio ambiente pode–se
afirmar que:',
  '[{"id": "a", "texto": "a prata pode ser encontrada na natureza na forma de substâncias simples por ser um metal nobre e possui baixa tendência de sofrer oxidação."}, {"id": "b", "texto": "do ponto de vista ambiental, a substituição de usinas termoelétricas a carvão mineral por nucleraes não é considerada uma medida viável, sendo frequentemente classificada como um retrocesso na transição energética."}, {"id": "c", "texto": "Joseph Thomson formulou a Teoria Atômica no início do século XIX, baseando–se em evidências experimentais da época para explicar a natureza da matéria e o comportamento das reações químicas."}, {"id": "d", "texto": "a carga nuclear do íon sódio, 11Na+, é a metade da carga nuclear do íon cálcio, 20Ca2+."}, {"id": "e", "texto": "gelo–seco (CO2(s)) passa diretamente do estado sólido para o estado gasoso sendo rompidas, interações do tipo dipolo permanente–dipolo induzido."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 26, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q26-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q26-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-peba-q26-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Química', null, 'As reações entre substâncias (reações químicas)
são processos fundamentais nos quais os
átomos se reorganizam para formar novas
substâncias com propriedades distintas das
iniciais. Elas são essenciais para a manutenção
da vida, funcionamento do universo e
desenvolvimento tecnológico e industrial,
transformando matérias-primas em produtos
úteis.
Disponível em: https://olharquimico.com/exercicios-sobre-tipos-de-reacoes-quimicas-reacoes-inorganicas/ Acesso em
20.02.26.
Sobre substâncias químicas e suas
propriedades, reações químicas e fenômenos é
CORRETO afirmar que:
Dados: 29Cu (11), 26Fe (8) e 17Cℓ (17).',
  '[{"id": "a", "texto": "na reação 1Cu(s) + 2FeCℓ3(aq) → 1CuCℓ2(aq) + 2FeCℓ2(aq) o cobre metálico diminui o número de oxidação."}, {"id": "b", "texto": "são liberadas maior quantidade de íons H+ pelo HF(aq) do que o HI(aq), em soluções aquosas de mesma concentração molar."}, {"id": "c", "texto": "uma forte efervescência é liberada quando são misturadas duas soluções aquosas de Na2CO3 e HCℓ."}, {"id": "d", "texto": "o odor de um perfume ou de um solvente volátil é sentido rapidamente devido ao processo de efusão das moléculas dessas substâncias no ar atmosférico."}, {"id": "e", "texto": "a vida média de um composto radioativo é o tempo necessário para que a quantidade desse composto se reduza à metade da sua quantidade inicial."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 27, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Química', null, 'O butan–2–ol (ou sec–butanol) é um composto
orgânico de grande importância industrial,
funcionando principalmente como intermediário
químico e solvente. É um álcool secundário com
a fórmula (C4H10O). A sua principal relevância
reside na produção de outras substâncias,
especialmente a butanona (metiletilcetona –
MEK), um solvente industrial muito utilizado.
O químico russo Alexander Saytzeff observou
que, na desidratação intramolecular de
álcoois, quando há possibilidade de formar mais
de um alceno, a preferência é a formação do
alceno mais substituído, ou seja, o hidrogênio é
eliminado do carbono vizinho mais pobre em
hidrogênio. De acordo com o texto, a reação
apresentada e sobre os compostos envolvidos é
correto afirmar que:
Dados - massas molares em g.mol–1: 6C = 12, 8O
= 16 e 1H = 1.',
  '[{"id": "a", "texto": "but–1–eno e but–2–eno são isômeros de cadeia."}, {"id": "b", "texto": "a reação de desidratação intramolecular é de eliminação."}, {"id": "c", "texto": "butan–2–ol é um álcool secundário de cadeia ramificada."}, {"id": "d", "texto": "pode existir um éster isômero de função do butan–2–ol."}, {"id": "e", "texto": "a reação que produz 50,4g de but–1–eno a partir de 1 mol de butan–2–ol possui rendimento de 80%."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 28, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Química', null, 'A azatioprina (conhecida como Imuran) é um
medicamento imunossupressor potente, utilizado
para reduzir a atividade do sistema imunológico
em doenças autoimunes (artrite reumatoide,
Crohn) e prevenir a rejeição de órgãos
transplantados. Ela age diminuindo glóbulos
brancos, tratando inflamações crônicas, com
efeitos demorando semanas ou meses.
Solubilidade, à 25°C Meia vida biológica
272mg em 1L de água 3 horas
Dados, massa molares em g.mol–1: 7N = 14, 6C =
12, 8O = 16, 1H = 1 e 16S = 32.
De acordo com o texto, análise da fugira e os
dados da tabela pode–se afirmar que:',
  '[{"id": "a", "texto": "apresenta atividade óptica."}, {"id": "b", "texto": "possui massa molar igual a 276g.mol–1"}, {"id": "c", "texto": "é composta por seis classes funcionais das aminas."}, {"id": "d", "texto": "embora a conversão em metabólitos iniciais seja rápida, o processo completo de eliminação da droga e seus metabólitos do organismo leva algumas horas."}, {"id": "e", "texto": "são necessários 5.10–5mol de azatioprina para formarem 569mg de corpo de fundo do fármaco, em 3L de água, a 25°C."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 29, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q29-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q29-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-peba-q29-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Química', null, 'A ciência é fundamental para o progresso da
sociedade, pois fornece conhecimentos
essenciais para aumentar a expectativa e
qualidade de vida, desenvolver tecnologias,
fomentar o crescimento econômico e solucionar
grandes desafios, como doenças e mudanças
climáticas. Ela baseia-se na investigação
sistemática para entender o mundo natural,
resultando em vacinas, medicamentos,
saneamento e inovações que moldam o dia a dia.
Sem o avanço científico, a capacidade da
humanidade de enfrentar desafios futuros seria
severamente limitada.
Disponível em: https://jeonline.com.br/noticia/24320/ciencia
Acesso em 20.02.26.
Por isso, o investimento em pesquisa e a
valorização do conhecimento são essenciais para
uma sociedade desenvolvida e resiliente.
Cientificamente podemos afirmar que:
Dados: 6C (14)',
  '[{"id": "a", "texto": "O átomo de carbono utilizado na formação de chips em aparelhos elétricos pode ser trivalente ou tetravalente."}, {"id": "b", "texto": "A destilação fracionada é o método de separação de misturas mais indicado e comumente utilizado para separar o sangue humano em plasma (fase líquida, menos densa) e glóbulos/elementos figurados (fase sólida, mais densa, incluindo hemácias e leucócitos)."}, {"id": "c", "texto": "O decaimento radioativo é um fenômeno nuclear natural e espontâneo, caracterizado pela emissão de partículas (alfa, beta e gama) e por núcleos atômicos instáveis, visando alcançar maior estabilidade."}, {"id": "d", "texto": "O volume ocupado por 1,0g de vanádio metálico é maior do que o ocupado pela mesma massa de háfnio metálico, devido à maior densidade do vanádio."}, {"id": "e", "texto": "A coloração azul observada em compostos de cobre (como na queima ou testes de chama) é decorrente da emissão de fótons quando elétrons excitados retornam a níveis de energia mais baixos, e não diretamente da energia liberada na formação do cátion. BIOLOGIA"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 30, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q30-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q30-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-peba-q30-full2.png", "legenda": null, "ordem": 92}, {"url": "/questoes-facape/2026.2-peba-q30-full3.png", "legenda": null, "ordem": 93}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, 'Nós, seres humanos, exercemos um enorme
impacto sobre nosso planeta. Nossas atividades
transformaram aproximadamente metade da
superfície terrestre e alteraram a composição da
atmosfera, levando à mudança climática global.
Introduzimos muitas espécies em novas regiões,
ação que pode ter um efeito negativo grave,
tanto nas espécies nativas como na economia
humana.
(Cain, Michael L, p. 3, 2018).
Diante dessa declaração, pode-se afirmar que.
EXCETO:',
  '[{"id": "a", "texto": "a introdução de seres vivos exótico altera o ecossistema."}, {"id": "b", "texto": "o uso indiscriminado de agrotóxicos é um grande problema no que tange a alterações morfofisiológicas nos seres vivos."}, {"id": "c", "texto": "a ganância pelo aumento da produção de alimentos aumenta os riscos de contaminações e desequilíbrios ambientais."}, {"id": "d", "texto": "as atividades humanas podem causar impactos negativos tanto na biodiversidade quanto na economia humana."}, {"id": "e", "texto": "a introdução de espécies em novas regiões traz benefícios ecológicos e econômicos, sem causar impactos negativos ao ambiente."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 31, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, 'A Ararinha-azul (Cyanopsitta spixii) é uma ave
endêmica da Caatinga brasileira, especialmente
associada às matas ciliares do sertão nordestino.
A espécie foi considerada extinta na natureza no
início dos anos 2000, principalmente devido ao
tráfico de animais silvestres e à destruição de
seu habitat natural.
Nos últimos anos, programas de conservação
têm desenvolvido ações de reprodução em
cativeiro e reintrodução de indivíduos em áreas
protegidas do bioma, buscando restaurar
populações naturais e contribuir para a
preservação da biodiversidade local. A
preservação da biodiversidade em biomas como
a Caatinga envolve não apenas a proteção de
espécies ameaçadas, mas também a
manutenção das interações ecológicas e dos
habitats naturais.
Considerando essas informações, analise as
afirmativas a seguir:
I. Espécies endêmicas são aquelas que ocorrem
naturalmente dentro de uma determinada
região geográfica.
II. A destruição do habitat natural pode levar à
redução das populações de espécies e
aumentar o risco de extinção.
III. Programas de reprodução em cativeiro e
reintrodução podem contribuir para a
recuperação de espécies ameaçadas.
IV. A conservação e a preservação da
biodiversidade independem da proteção da
espécie considerada ameaçada.
Está CORRETA apenas a alternativa:',
  '[{"id": "a", "texto": "I e II."}, {"id": "b", "texto": "I, II e III."}, {"id": "c", "texto": "II e IV."}, {"id": "d", "texto": "I, III e IV."}, {"id": "e", "texto": "I, II, III e IV."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 32, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, 'A educação ambiental tem se tornado um
importante instrumento para promover a
sustentabilidade e incentivar atitudes
responsáveis em relação ao uso dos recursos
naturais. Nesse contexto, busca-se desenvolver
uma consciência crítica na sociedade, visando à
preservação do meio ambiente e à garantia de
qualidade de vida para as gerações presentes e
futuras.
Dentro desse contexto, pode-se afirmar que:',
  '[{"id": "a", "texto": "a educação ambiental deve incluir práticas pedagógicas que incentivem a consciência ecológica, a participação social e o uso sustentável dos recursos naturais."}, {"id": "b", "texto": "a educação ambiental deve limitar-se ao ensino de conteúdos teóricos sobre natureza, sem relacionar com a realidade social."}, {"id": "c", "texto": "a sustentabilidade depende das ações individuais, não sendo necessária a participação ou ações coletivas."}, {"id": "d", "texto": "a preservação ambiental impede o desenvolvimento econômico e social das comunidades."}, {"id": "e", "texto": "a responsabilidade pela conservação ambiental cabe aos órgãos governamentais, sem precisar envolver a sociedade."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 33, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q33-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, 'Em um estágio profissional, estudantes de
Biologia visitaram um zoológico estadual, que
abriga diferentes grupos de vertebrados, como
peixes, anfíbios, répteis, aves e mamíferos. A
professora pediu aos estagiários que fossem
observados as adaptações fisiológicas
relacionadas ao ambiente em que vivem,
especialmente no que se refere à respiração,
circulação e controle da temperatura corporal.
Considerando as diferenças fisiológicas entre
esses grupos, relacione a 2ª coluna de acordo
com a 1ª. Assinale a alternativa que preenche
CORRETAMENTE.
1ª COLUNA
(1) Peixes
(2) Anfíbios
(3) Répteis
(4) Aves
(5) Mamíferos
2ª COLUNA
(....)Respiração: Branquial; Circulação: Fechada,
simples; Temperatura: Ectotérmicos.
(....)Respiração: Pulmonar com pulmões
associados a sacos aéreos; Circulação:
Fechada, dupla e completa; Temperatura:
Endotérmicos.
(....)Respiração: Pulmonar; Circulação: Fechada,
dupla e incompleta; Temperatura:
Ectotérmicos.
(....)Respiração: Branquial, pulmonar, saculiforme
e cutânea; Circulação: Fechada, dupla e
incompleta; Temperatura: Ectotérmicos.
(....)Respiração: Pulmonar; Circulação: Fechada,
dupla e completa; Temperatura:
Endotérmicos.',
  '[{"id": "a", "texto": "1, 2, 3, 4 e 5."}, {"id": "b", "texto": "5, 4, 3, 2 e 1."}, {"id": "c", "texto": "1, 4, 3, 2 e 5."}, {"id": "d", "texto": "3, 2, 1, 4 e 5."}, {"id": "e", "texto": "2, 1, 4, 3 e 5."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 34, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, 'Durante a pandemia de COVID-19, vacinas
produzidas com tecnologia de RNA mensageiro
(RNAm) passaram a ser utilizadas em larga
escala. Diferentemente das vacinas tradicionais,
essas utilizam uma sequência de RNAm sintético
que, ao ser introduzida nas células humanas,
orienta a produção de uma proteína viral
específica. Essa proteína é então reconhecida
pelo sistema imunológico, que passa a produzir
anticorpos contra o vírus. O funcionamento
dessas vacinas está diretamente relacionado ao
processo de síntese de proteínas nas células.
Com base nos conhecimentos sobre ácidos
nucleicos e síntese proteica, assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "O RNAm da vacina é incorporado ao DNA da célula hospedeira, modificando permanentemente seu material genético."}, {"id": "b", "texto": "O RNAm sintético atua no núcleo celular, substituindo o DNA durante o processo de transcrição."}, {"id": "c", "texto": "A proteína viral é produzida diretamente pelo DNA da vacina, sem participação do RNA transportador."}, {"id": "d", "texto": "A sequência de bases do RNAm não interfere na sequência de aminoácidos da proteína produzida."}, {"id": "e", "texto": "O RNAm introduzido na célula é traduzido nos ribossomos, orientando a produção da proteína viral a partir da sequência de códons."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 35, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, '“A morte das células é um fenômeno comum
durante o desenvolvimento embrionário,
necessário para remover tecidos provisórios (p.
ex., as membranas interdigitais durante a
formação dos dedos), eliminar células supérfluas
(como ocorre com quase metade dos neurônios
ao longo da neurogênese), gerar ductos, formar
orifícios etc. Também ocorre morte celular
durante a vida pós-natal, quando o organismo
necessita remodelar tecidos ou remover células
danificadas, desnecessárias, redundantes,
envelhecidas ou perigosas para sua saúde,
como, por exemplo, as células infectadas, as
tumorais ou as autorreativas (p. ex., os linfócitos
T que reagem contra o próprio organismo).Como
as células destinadas a morrer costumam
perecer para que as restantes do corpo
sobrevivam, pode-se dizer que protagonizam
uma espécie de sacrifício biológico de imolação.”
(De Robertis, E. M. Biologia Celular e Molecular, 2025,
p.333).
Essa morte celular programada, silenciosa,
organizada e não inflamatória para o
desenvolvimento da homeostase recebe o nome
de:',
  '[{"id": "a", "texto": "Apoptose."}, {"id": "b", "texto": "Necrose."}, {"id": "c", "texto": "Hemólise."}, {"id": "d", "texto": "Autofagia."}, {"id": "e", "texto": "Autólise."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 36, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q36-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q36-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-peba-q36-3.png", "legenda": null, "ordem": 3}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, 'O hemograma completo é um exame laboratorial
amplamente utilizado para avaliar a saúde geral
do organismo. Esse exame analisa diferentes
tipos de células presentes no sangue, como
hemácias, leucócitos e plaquetas, permitindo
identificar alterações associadas a diversas
condições clínicas, como anemias, infecções,
inflamações e algumas doenças hematológicas,
incluindo a leucemia. Em um hemograma
realizado em um paciente, foi detectado um
aumento no número de linfócitos, um tipo de
leucócito relacionado à defesa do organismo.
Essa alteração pode indicar que o sistema
imunológico está reagindo a algum agente
patogênico.
Com base nessas informações e nos
conhecimentos sobre os componentes do
sangue, assinale a alternativa CORRETA.',
  '[{"id": "a", "texto": "As hemácias são células anucleadas, responsáveis pela defesa do organismo contra microrganismos patogênicos."}, {"id": "b", "texto": "Os linfócitos são células do sistema imunológico que participam da resposta contra vírus, bactérias e outros agentes infecciosos."}, {"id": "c", "texto": "As plaquetas têm como principal função transportar oxigênio para os tecidos do corpo."}, {"id": "d", "texto": "O aumento de linfócitos está diretamente relacionado à diminuição da resposta imunológica do organismo."}, {"id": "e", "texto": "Os leucócitos são responsáveis pelo transporte de nutrientes no sangue."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 37, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q37-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, '“A união do espermatozoide e do ovócito
constitui a fertilização. A aparente simplicidade e
a frequência deste fenômeno contrariam a
complexidade do processo. Para a fertilização
ser realizada, deve ocorrer uma maturação
adequada do ovócito em um folículo dominante,
a ovulação deve liberar com sucesso o ovócito, e
um número suficiente de espermatozoides deve
estar presente para que ocorra a fertilização.
Mesmo todos esses eventos não são suficientes
para assegurar uma fertilização ou gestação.”
(Smith, Roger P. Sistema Reprodutor, volume 1, 2015. p.232).
Dentro desse processo existe uma sequência de
etapas, para que ocorra a Fertilização e o
Desenvolvimento Embrionário. Assinale a
alternativa que apresenta a sequência
CORRETA.',
  '[{"id": "a", "texto": "Ovulação e fecundação, zigoto, clivagem e transporte, estágios de desenvolvimento e nidação."}, {"id": "b", "texto": "Ovulação e fecundação, zigoto, estágios de desenvolvimento e nidação, clivagem e transporte."}, {"id": "c", "texto": "Clivagem e transporte, ovulação e fecundação, zigoto, estágios de desenvolvimento e nidação."}, {"id": "d", "texto": "Estágios de desenvolvimento Ovulação e fecundação, zigoto, e nidação, clivagem e transporte."}, {"id": "e", "texto": "Fecundação e ovulação, clivagem e transporte, estágios de desenvolvimento e nidação."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 38, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q38-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, 'A prática de atividades físicas intensas ou
movimentos repetitivos pode provocar lesões no
sistema locomotor, especialmente em estruturas
responsáveis pela sustentação e movimentação
do corpo. Entre essas estruturas está o tendão
calcâneo (tendão de Aquiles), que conecta os
músculos da panturrilha ao osso do calcanhar.
Segundo estudos clínicos, “os sintomas mais
comuns que levam a um exame por ultrassom da
região posterior do tornozelo são aqueles
associados a distúrbios do tendão calcâneo ou
da aponeurose plantar (dor e/ou inchaço no
calcanhar). Em um quadro agudo, a
ultrassonografia é frequentemente realizada na
suspeita de ruptura do tendão calcâneo.”
(Mcnally, Eugene G. Ultrassonografia do sistema
musculoesquelético, 2015.)
Considerando a relação entre o tendão calcâneo
e o tecido muscular esquelético, assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "O tendão calcâneo liga diretamente os ossos do tornozelo, sendo formado por tecido cartilaginoso responsável pela proteção das articulações."}, {"id": "b", "texto": "O tecido muscular esquelético é responsável pelos movimentos voluntários do corpo, atuando em conjunto com tendões que conectam os músculos aos ossos."}, {"id": "c", "texto": "O tecido muscular esquelético apresenta contração involuntária e é responsável pelo funcionamento de órgãos internos."}, {"id": "d", "texto": "Os tendões são formados principalmente por tecido muscular e atuam produzindo energia para a contração muscular."}, {"id": "e", "texto": "A contração muscular ocorre independentemente da interação com ossos e tendões no sistema locomotor."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 39, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q39-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, 'A Caatinga é o único bioma exclusivamente
brasileiro e ocupa grande parte da região
Nordeste. Caracteriza-se por clima quente e
semiárido, com chuvas escassas e irregulares ao
longo do ano. Apesar das condições ambientais
adversas, a vegetação apresenta diversas
adaptações fisiológicas e morfológicas que
permitem a sobrevivência durante longos
períodos de seca. Entretanto, atividades
humanas como desmatamento, queimadas, uso
inadequado do solo e exploração intensiva dos
recursos naturais podem agravar a degradação
ambiental, favorecendo processos de
Desertificação. Além disso, as mudanças
climáticas podem intensificar períodos de seca e
alterar o regime de chuvas, aumentando a
vulnerabilidade desse bioma.
Considerando essas informações e os
conhecimentos sobre conservação ambiental,
analise as afirmativas:
I. A Caatinga apresenta vegetação adaptada à
escassez de água, com características como
perda de folhas durante o período seco,
raízes profundas e capacidade de
armazenamento de água.
II. O processo de desertificação no Nordeste
está relacionado a fatores naturais, não
sendo influenciado pelas atividades
humanas.
III. A preservação da vegetação nativa da
Caatinga contribui para a manutenção do
solo, redução da erosão e conservação da
biodiversidade regional.
IV. As mudanças climáticas podem agravar os
períodos de seca na região semiárida,
intensificando processos de degradação
ambiental.
Assinale a alternativa que apresenta apenas as
afirmativas CORRETAS.',
  '[{"id": "a", "texto": "I e II."}, {"id": "b", "texto": "I, III e IV."}, {"id": "c", "texto": "II e III."}, {"id": "d", "texto": "I, II e III."}, {"id": "e", "texto": "II, III e IV. HISTÓRIA"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 40, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'História', null, 'A Industrialização soviética ao final da década
de 20 e início da década de 30 tinha como
principal objetivo a indústria pesada, como a
expansão da energia e das siderurgias. O
campo também foi afetado pelo planejamento
estatal soviético do período, através da
coletivização das propriedades rurais e da
imposição de uma produção agrícola que fosse
compatível com as necessidades das indústrias,
o que causou grandes distúrbios no campo.
Sobre o período tratado acima, assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "Trata-se da reforma agrária prometida por Lênin aos camponeses de etnia russa, pelo que ficou conhecido como “russificação”."}, {"id": "b", "texto": "Eram as cooperativas rurais e os gulags, respectivamente. O primeiro pretendia a coletivização da agricultura com produção planificada e o segundo era como as fábricas de armamentos eram chamadas pelos operários durante a Segunda Guerra Mundial."}, {"id": "c", "texto": "Trata-se do NEP de Stálin, ou “Nova política econômica”, que pretendia a expansão da produção de bens de consumo duráveis através da industrialização."}, {"id": "d", "texto": "Era o plano quinquenal de Stálin, que enfatizava a industrialização e a imposição de cooperativas rurais, através do planejamento central vindo do Estado."}, {"id": "e", "texto": "Foi o que ficou conhecido como “Comunismo de Guerra”, em que o Estado soviético controlava todos os meios de produção, com resultados bem expressivos."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 41, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'História', null, 'O início da década de 30 trouxe aos Estados
Unidos da América grave calamidade
socioeconômica, acarretada pelo crash da Bolsa
de Valores de Nova York em 1929, que afetou o
mundo inteiro. Milhões de cidadãos americanos
se encontravam em situação de grande
vulnerabilidade econômica e social – enorme
desemprego e pobreza ditavam a vida das
pessoas.
Ao ser eleito presidente em 1932, o democrata
Franklin Delano Roosevelt pôs em prática um
plano econômico que visava combater a
situação caótica do país. Nesse plano proposto
pelo presidente democrata, o Estado buscaria
intervir na economia, em oposição à postura
liberal clássica anterior, com o objetivo de
financiar obras públicas para gerar empregos,
regulamentar operações financeiras e aplicar
reformas sociais. Tal plano teve como base as
teorias do economista John Maynard Keynes e
os resultados da medida econômica de
Roosevelt inspirariam o que se conhece hoje
como Welfare State (Estado de Bem-Estar
Social).
Tais ações do presidente Roosevelt ficaram
conhecidas na História como:',
  '[{"id": "a", "texto": "NEP, ou seja: Nova Política Econômica, inspirada pelas ações dos socialistas na União Soviética, que não foi afetada pela crise de 29."}, {"id": "b", "texto": "a Crise do Encilhamento, dado o resultado desastroso de sua política, causando enorme inflação e piorando a situação dos Estados Unidos."}, {"id": "c", "texto": "Blitzkrieg, ou “economia relâmpago”, que pretendia a rápida recuperação econômica através de investimentos pesados em construção civil e armamentos."}, {"id": "d", "texto": "New Deal, que resultou na recuperação econômica do país e aumentou a popularidade política de Roosevelt, que seria reeleito."}, {"id": "e", "texto": "Pacto Colonial, que previa a contribuição financeira de colônias americanas para a Metrópole, com sede financeira em Nova York."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 42, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'História', null, 'Os processos de independência dos países da
África foram influenciados por inúmeras razões,
dentre elas o Pan-africanismo, cujas ideias
defendidas eram a solidariedade e a consciência
de uma origem comum entre africanos e
afrodescendentes de outros continentes, bem
como o incentivo aos movimentos nacionalistas
da África em busca da libertação da exploração
colonial europeia.
Com relação ao movimento Pan-africanista no
Brasil, assinale a alternativa CORRETA.',
  '[{"id": "a", "texto": "O ativista Abdias Nascimento foi o difusor da importância do Pan-africanismo no país. Considerado um dos maiores defensores da cultura e igualdade para as populações afrodescendentes, ele conseguiu resultados positivos a partir de suas iniciativas na defesa e na inclusão dos direitos dos negros."}, {"id": "b", "texto": "O Pan-africanismo no Brasil vigorou principalmente nas regiões Sudeste e Sul, através das ideias de William du Bois, francês naturalizado gaúcho, que defendia a revolução aos moldes marxistas dos negros e mulatos dos pampas, com o objetivo de fundar uma nação independente no Brasil, livre da exploração dos latifúndios."}, {"id": "c", "texto": "Pensadores como Ibrahim Traoré e Amílcar Cabral, ambos baianos, foram os pioneiros dos estudos Pan-africanistas no Brasil no início do século XX. Inspirados pelas conferências africanistas realizadas em Paris e em outros países, lutaram pela atuação governamental em políticas afirmativas para a garantia da melhoria da qualidade de vida das populações afrodescendentes brasileiras."}, {"id": "d", "texto": "O Pan-africanismo no Brasil teve pouca adesão das camadas populares devido à vigorosa repressão do governo federal sob a liderança do Estado Novo de Vargas, que combatia movimentos considerados antinacionais e perseguia minorias culturais e linguísticas com a intenção de unificar a cultura nacional em torno de um ideal artificial."}, {"id": "e", "texto": "A difusão das ideias de solidariedade dos povos africanos e seus descendentes não teve adesão no Sudeste do Brasil, dado que a população negra sudestina é pouco significativa e a exploração do trabalho braçal de origem africana foi escassa, pontual e difusa, restrita a pequenas ilhas de produção latifundiária – O Sudeste brasileiro usufruiu, desde cedo, da pequena propriedade rural de colonos italianos e alemães, em oposição às sociedades mais atrasadas do Nordeste."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 43, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'História', null, 'A Constituição de 1988 garante a existência das
terras indígenas, cuja posse e usufruto são
assegurados aos povos originários residentes
naqueles territórios. O direito dos indígenas
brasileiros foi resguardado pela Constituição
como forma de garantir a proteção e
preservação das culturas e da materialidade da
existência de diversas etnias, após séculos de
perseguições, explorações e negligências.
Com relação à História dos povos originários no
Brasil, podemos afirmar que:',
  '[{"id": "a", "texto": "os povos Tupi-Guarani foram essenciais para o assentamento português na costa brasileira, já que o indígena, por possuir uma grande homogeneidade cultural e ausência de rixas étnicas, deu total suporte e auxílio ao colonizador, sendo completamente assimilado de forma cordial e pacífica, como constatado nos estudos genéticos brasileiros que evidencia o sangue indígena como o maior fator contribuinte da etnia “brasileira”."}, {"id": "b", "texto": "os povos indígenas no Brasil constituíam uma única grande civilização. As ruínas das grandes pirâmides e cidades de pedra no litoral do Brasil, com estruturas de saneamento e água corrente, evidenciam o esplendor do seu desenvolvimento."}, {"id": "c", "texto": "os povos originários brasileiros eram diversos e possuíam interesses distintos, se relacionando de forma heterogênea com o colonizador português, formando confederações para combatê-lo ou até mesmo se aliando com os inimigos de Portugal durante suas guerras coloniais. Em muitos casos foram perseguidos e exterminados, usados também como trabalho escravo, o que acarretou em grande diminuição de sua população."}, {"id": "d", "texto": "devido às doenças, perseguições e extermínio empreendido pelos colonos portugueses nos séculos da colonização brasileira os povos originários que aqui habitavam não deixaram praticamente nenhum legado cultural, linguístico e genético."}, {"id": "e", "texto": "com o advento da catequese imposta pelos jesuítas inúmeros assentamentos indígenas foram constituídos no interior do Brasil, que posteriormente seriam realocados para a Amazônia, de forma gradual, preservando o legado dos povos originários do litoral, mantendo suas tradições e demografias intactas, sem conflitos e distúrbios."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 44, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q44-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q44-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'História', null, 'Após a morte de um dos seus mais notórios reis,
Assurbanipal, o Império Assírio entraria em um
período turbulento que levaria à sua inevitável
queda. Sua expansão violenta e modo de
governar os povos conquistados alimentaram
uma série de ódios fervilhantes no coração de
seus inimigos e de súditos descontentes.
Com relação ao fim do Império Assírio, assinale
a alternativa CORRETA.',
  '[{"id": "a", "texto": "Com a morte de Assurbanipal, o Novo Império do Egito, liderado por Amenófis III, empreende uma campanha punitiva em direção aos domínios assírios em Canaã, prevelecendo o poderio egípcio na Batalha de Megido (1457 a.C.), o que desestabilizaria o status quo da Mesopotâmia ocidental, colapsando a Assíria."}, {"id": "b", "texto": "O destino do último reduto assírio é selado em Carquemis, após anos de luta contra uma aliança de Caldeus, Medos e Citas, que ao vencerem Sinsariscum em Kablini e Arrafa, tomam a capital Nínive em 612 a.C."}, {"id": "c", "texto": "No inverno de 532 d.C., após se saírem vitoriosos da Revolta de Nika, os Assírios padecem de uma pandemia de Peste Bubônica, no que hoje conhecemos como Praga de Justiniano, produzindo calamitosa mortandade no Império e abrindo caminho para uma invasão dos povos semitas do Reino de Moabe."}, {"id": "d", "texto": "As deportações em massa empreendidas por Assurbanipal, no período da história assíria conhecido como “kulakização”, foram o fator preponderante para o início do fim do seu império, já que etnias de culturas diversas, originalmente habitantes do Cáucaso, foram realocadas para diversas localidades da Assíria, o que incrementaria o conflito étnico e religioso."}, {"id": "e", "texto": "Os arameus, habitantes autóctones da Síria, foram destituídos de sua nação pela expansão assíria, o que culminaria na chamada Conspiração dos Arameus, liderada, em 612 a.C., por Tiglat-Pileser III, aliado de Sargão da Acádia, ambos inimigos fervorosos dos assírios, que conquistariam a cidade de Nínive em conjunto no ano de 607 a.C. GEOGRAFIA"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 45, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Geografia', null, 'Chamamos de intemperismo ou meteorização a
alteração das rochas em contato com a água, o
ar, as mudanças de temperatura e os e os seres
vivos. O intemperismo pode ser físico ou
mecânico e químico. O primeiro, podendo
desintegrar a rocha. É o que ocorre, por
exemplo, quando as rochas se quebram sob a
brusca mudança de temperatura ou quando a
água se infiltra em fendas das rochas,
desintegrando-as por pressão.
De acordo com o texto, o intemperismo físico
ocorre quando:',
  '[{"id": "a", "texto": "há dissolução química dos minerais presentes na rocha."}, {"id": "b", "texto": "ocorre desintegração da rocha sem alteração de sua composição química."}, {"id": "c", "texto": "a rocha se transforma por altas pressões e temperaturas internas."}, {"id": "d", "texto": "sedimentos são compactados e cimentados ao longo do tempo."}, {"id": "e", "texto": "minerais da rocha sofrem reações químicas com a água."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 46, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q46-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Geografia', null, 'Nevoeiro: É a suspensão de gotículas de água ou
cristais de gelo numa camada de ar próxima à
superfície da Terra. Forma-se quando o ar
quente e úmido, em contato com o solo frio ou
com superfície líquidas, perde calor e se
condensa.
A partir das informações apresentadas, esse
fenômeno atmosférico ocorre quando:',
  '[{"id": "a", "texto": "o ar quente e úmido perde calor ao entrar em contato com superfícies frias, ocorrendo condensação."}, {"id": "b", "texto": "massas de ar seco se deslocam rapidamente sobre áreas de baixa pressão."}, {"id": "c", "texto": "ventos intensos aquecem o ar próximo à superfície terrestre."}, {"id": "d", "texto": "o aumento da temperatura impede a condensação do vapor d’água."}, {"id": "e", "texto": "a radiação solar aquece rapidamente o solo durante o dia."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 47, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Geografia', null, 'A escrita da História é marcada por critérios que
estão conectados à cultura e às forças políticas
de cada época. Ela é, em suma, filha - e escrava -
de seu tempo, e carrega os cheiros, os medos e
os preconceitos das comunidades e dos
indivíduos que a produzem. Como consequência
disso, quanto mais forte e persistente for uma
intolerância específica em determinada
sociedade, mais ela deixará sua marca nos textos
e opiniões produzidos. Quando se trata da
misoginia, termo oriundo do grego e que significa
“ódio, preconceito ou desprezo contra
mulheres”, o caso se torna ainda mais grave, já
que esta forma de hostilidade esteve presente de
maneira evidente nas mais diversas culturas ao
longo dos milênios. Escrever uma História que
não invisibilize as mulheres é um desafio imenso,
mesmo para as pessoas mais competentes e
bem-intencionadas.
BIONE, R. Nós Humanos (ensaios sobre
Eugenia, Tempo, Doenças, Misoginia e
Canibalismo). Recife, 2019.
Considerando o texto e a persistência de
desigualdades de gênero no Brasil, o processo
histórico mencionado no texto evidencia a/o:',
  '[{"id": "a", "texto": "misoginia presente em diferentes épocas."}, {"id": "b", "texto": "preceito ético e moral equilibrado da sociedade."}, {"id": "c", "texto": "influencia aos princípios históricos."}, {"id": "d", "texto": "ampliação de leis rígidas."}, {"id": "e", "texto": "bloqueios de preconceitos nas narrativas sociais."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 48, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Geografia', null, '“Uma rua urbana preparada para receber
estranhos e que, por si só, faça da presença
deles um fator de segurança, como sempre
acontece nas ruas de bairros bem-sucedidos,
deve ter três qualidades principais: Primeiro,
deve haver uma clara demarcação entre o
espaço público e o espaço privado. Espaços
públicos e privados não podem se misturar como
geralmente ocorre em áreas suburbanas ou
conjuntos habitacionais. Segundo, deve haver
vigilância na rua, vigilância daqueles que
poderíamos chamar de proprietários naturais da
rua. Os edifícios em uma rua preparada para
receber estranhos e garantir a segurança tanto
de moradores quanto de visitantes devem estar
voltados para a rua. Eles não podem virar as
costas ou apresentar fachadas fechadas,
deixando-a sem visibilidade. E terceiro, a calçada
deve ter um fluxo constante de pessoas, tanto
para aumentar o número de vigilância efetiva na
rua quanto para incentivar os moradores dos
edifícios ao longo da rua a observarem as
calçadas em número suficiente. Ninguém gosta
de sentar em um degrau ou olhar pela janela
para uma rua vazia. Quase ninguém faz isso.
Muitas pessoas se divertem, de vez em quando,
"Observando a atividade nas ruas."
JACOBS, Jane. Morte e vida de grandes
cidades. Tradução de Carlos S. Mendes
Rosa. 3. ed. São Paulo: WMF Martins
Fontes, 2011. 532 p.
Considerando as ideias apresentadas, a
segurança no espaço urbano está associada
principalmente à:',
  '[{"id": "a", "texto": "separação completa entre edifícios e áreas de circulação pública."}, {"id": "b", "texto": "construção de muros altos e isolamento entre moradores e ruas."}, {"id": "c", "texto": "redução da circulação de pessoas nas áreas urbanas."}, {"id": "d", "texto": "presença constante de pessoas e vigilância natural no espaço público."}, {"id": "e", "texto": "diminuição do uso das calçadas nas cidades."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 49, null, false,
  '[{"url": "/questoes-facape/2026.2-peba-q49-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-peba-q49-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-peba-q49-3.png", "legenda": null, "ordem": 3}, {"url": "/questoes-facape/2026.2-peba-q49-4.png", "legenda": null, "ordem": 4}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Geografia', null, 'Terra é uma palavra no feminino em algumas
línguas latinas. Terra em português - para solo e
para planta; Terre - em francês, para o planeta e
para o solo; Tierra - em Espanhol para planeta e,
Terra, também em italiano, tanto para solo, como
para planeta. Em português, em francês e em
italiano usamos terra tanto para o solo quanto
para o Planeta Terra. É, portanto, na versão
feminina que o substantivo traduz esta dupla
identidade: a terra, enquanto húmus, enquanto
reprodução da vida e também enquanto lócus da
existência humana.
BOMBARDI, L. M.
Geografia do Uso de Agrotóxicos no Brasil
e Conexões com a União Europeia. São
Paulo: FFLCH - USP,
2017.
No contexto da Geografia agrária, quanto à
função social da terra, a concepção indicada no
texto corresponde a:',
  '[{"id": "a", "texto": "recurso natural voltado à produção e à reprodução da vida humana."}, {"id": "b", "texto": "elemento exclusivamente simbólico."}, {"id": "c", "texto": "espaço destinado apenas à preservação ambiental."}, {"id": "d", "texto": "área urbana utilizada para expansão das cidades."}, {"id": "e", "texto": "território sem relação com atividades sociais e produtivas."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.2 - Rede PEBA/Bolsistas',
  '2026.2-peba', 'FACAPE 2026.2 - Rede PEBA/Bolsistas', 2026, 2,
  'peba', 50, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();
