-- ============================================================================
-- DECOLA MED — SEED: FACAPE 2025.2 - Ampla Concorrência
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
  'Português', null, '“A Bioinformática é uma disciplina multidisciplinar
que combina conceitos e técnicas da biologia,
informática e matemática para analisar e
interpretar dados biológicos complexos. Ela se
concentra principalmente na manipulação e
análise de grandes conjuntos de dados biológicos,
como sequências de DNA, proteínas e estruturas
moleculares. As aplicações da Bioinformática são
vastas e abrangem diversas áreas da biologia,
medicina e biotecnologia.
Ela é utilizada para entender a função dos genes,
estudar a expressão gênica, modelar estruturas
de proteínas, analisar variações genéticas
associadas a doenças, comparar genomas de
diferentes espécies, entre muitas outras
aplicações. Em resumo, a Bioinformática
desempenha um papel fundamental na
compreensão e exploração da informação contida
nos dados biológicos, contribuindo para avanços
significativos em diversas áreas da ciência e da
medicina.”
Disponível em: https://www.educamaisbrasil.com.br (adaptado)
Sobre o texto, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "A aplicação da Bioinformática abrange apenas o profissional que atua com a Oncogenética."}, {"id": "b", "texto": "Em “Ela se concentra principalmente na manipulação e análise de grandes conjuntos de dados biológicos, como sequências de DNA, proteínas e estruturas moleculares.”, o pronome “ela” é um recurso coesivo referencial denominado anáfora."}, {"id": "c", "texto": "Em “...a função dos genes, estudar a expressão gênica, modelar estruturas de proteínas...”, as palavras “gênica” e “proteínas” são acentuadas pela mesma regra de acentuação gráfica."}, {"id": "d", "texto": "Em “...analisar variações genéticas associadas a doenças...”, o termo “associadas” estabelece com a expressão “a doenças” uma relação de regência verbal."}, {"id": "e", "texto": "Em “...desempenha um papel fundamental na compreensão e exploração da informação contida nos dados biológicos...”, contém um vocábulo grafado incorretamente."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 1, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Português', null, 'Disponível em: https://www.towbar.com.br
Na placa acima, ocorre um desvio da norma culta
referente:',
  '[{"id": "a", "texto": "ao emprego da palavra “portadores” no plural."}, {"id": "b", "texto": "ao emprego da palavra “proibido” no singular."}, {"id": "c", "texto": "ao emprego da preposição “de” em “entrada de portadores”."}, {"id": "d", "texto": "ao emprego da palavra “entrada”."}, {"id": "e", "texto": "à grafia da palavra “marca passos”."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 2, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q02-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Português', null, '“A Medicina Integrativa é uma modalidade médica
que avalia os aspectos clínicos, medicamentosos
e emocionais do paciente, bem como todos os
demais fatores que podem influenciar em suas
condições de saúde. O objetivo é fazer um
levantamento de todas as questões que
interferem no desequilíbrio do organismo, seja no
âmbito físico ou emocional, causando alterações
e problemas de saúde.
Esta especialidade entende que as condições
mentais e emocionais interferem diretamente no
aspecto físico, ao mesmo tempo em que as
condições físicas podem causar complicações
psicológicas. Nesse sentido, a Medicina
Integrativa propõe justamente integrar todos os
pontos do indivíduo ao lidar com um problema de
saúde ou alteração física que cause incômodo ao
paciente.”
Disponível em: https://drdanielstellin.com.br (adaptado)
Sobre o texto, transcrito acima, pode-se afirmar
que:',
  '[{"id": "a", "texto": "cumpre o propósito de orientar o médico especialista em neurocirurgia sobre a importância da Medicina Integrativa."}, {"id": "b", "texto": "estabelece uma relação entre o desequilíbrio do organismo físico e do emocional."}, {"id": "c", "texto": "busca sensibilizar o médico em relação às questões que interferem no desequilíbrio do organismo."}, {"id": "d", "texto": "a função de linguagem que predomina é a referencial já que tem como objetivo informar o leitor sobre a Medicina Integrativa."}, {"id": "e", "texto": "enaltece a Medicina Integrativa, principalmente, no que se refere às complicações psicológicas."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 3, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q03-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Português', null, 'A imagem da capa, acima, é de uma obra
produzida pelo cirurgião geral Ivan Gregório
Ivankovics. Ele foi vencedor da 1ª edição do
Prêmio Literário da Comunidade Médica de
Nos Une”, o “O” funciona, do ponto de vista
morfológico, como:',
  '[{"id": "a", "texto": "artigo indefinido."}, {"id": "b", "texto": "artigo definido."}, {"id": "c", "texto": "pronome demonstrativo."}, {"id": "d", "texto": "conjunção coordenativa aditiva."}, {"id": "e", "texto": "conjunção subordinativa integrante."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 4, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q04-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Português', null, '“A medicina do esporte é uma especialidade
médica que se concentra na prevenção,
diagnóstico e tratamento de lesões e doenças
relacionadas à prática esportiva e à atividade
física.
Seu objetivo principal é promover a saúde e o
bem-estar dos atletas, desde amadores até
profissionais, e ajudá-los a alcançar seu máximo
potencial atlético. Além disso, ela tem um papel
importante no exercício como solução de
problemas de saúde pública.
Essa área da medicina abrange uma ampla gama
de disciplinas, incluindo ortopedia, cardiologia,
fisiologia do exercício, nutrição esportiva,
reabilitação física, medicina de emergência,
psicologia do esporte e farmacologia, entre
outras.
Os médicos do esporte trabalham ainda em
estreita colaboração com atletas, treinadores,
fisioterapeutas e outros profissionais de saúde
para fornecer cuidados abrangentes e
personalizados.”
Disponível em: https://educa.cetrus.com.br (adaptado)
Sobre o texto, é CORRETO afirmar que nos
fragmentos:',
  '[{"id": "a", "texto": "“...à prática esportiva e à atividade física.” são termos complementares de um adjetivo."}, {"id": "b", "texto": "“...a saúde e o bem-estar dos atletas...” são termos complementares de um adjetivo."}, {"id": "c", "texto": "“...de problemas de saúde pública.” é termo complementar de uma forma verbal."}, {"id": "d", "texto": "“Essa área da medicina abrange uma ampla gama de disciplinas...” foi construído na voz passiva."}, {"id": "e", "texto": "“Os médicos do esporte trabalham ainda em estreita colaboração com atletas, treinadores, fisioterapeutas e outros profissionais de saúde...”, a forma verbal “trabalham” se refere a um fato inconcluso, transmitindo ideia de continuidade."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 5, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Português', null, '“A hipertensão é um dos principais fatores de
risco para doenças cardíacas. Muitas vezes, a
pressão alta não apresenta sintomas evidentes,
mas pode estar danificando silenciosamente o
coração. Por isso, é fundamental monitorar a
pressão regularmente, principalmente se houver
histórico familiar de doenças cardíacas. Se você
for diagnosticado com hipertensão, siga
rigorosamente as orientações médicas, mantendo
uma dieta saudável e praticando exercícios
físicos.”
Disponível em: hhttps://www.bp.org.br (adaptado)
Assinale a alternativa, no texto acima, em que
ocorre um segmento expresso através de uma
relação lógico – semântica de condicionalidade.',
  '[{"id": "a", "texto": "“A hipertensão é um dos principais fatores de risco para doenças cardíacas.”."}, {"id": "b", "texto": "“Muitas vezes, a pressão alta não apresenta sintomas evidentes, mas pode estar danificando silenciosamente o coração.”."}, {"id": "c", "texto": "“Por isso, é fundamental monitorar a pressão regularmente...”."}, {"id": "d", "texto": "“Se você for diagnosticado com hipertensão, siga rigorosamente as orientações médicas...”."}, {"id": "e", "texto": "“...mantendo uma dieta saudável e praticando exercícios físicos.”."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 6, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Português', null, '“Por meio de uma abordagem proativa e baseada
em evidências, os cardiologistas oferecem aos
pacientes as ferramentas necessárias para
entender seu risco pessoal e tomar medidas
preventivas. Assim, a consulta regular com um
cardiologista se torna não apenas um
componente importante na prevenção de
doenças cardíacas, mas também um passo vital
para garantir uma vida saudável e longa.”
Disponível em: https://www.hipnose.com.br (adaptado)
Com base na sintaxe de concordância, regência e
colocação, no texto acima, assinale a alternativa
CORRETA.',
  '[{"id": "a", "texto": "Em “Por meio de uma abordagem proativa e baseada em evidências...”, o termo “baseada” estabelece com “em evidências” uma relação de regência verbal."}, {"id": "b", "texto": "Em “...os cardiologistas oferecem aos pacientes as ferramentas necessárias para entender seu risco pessoal...”, o termo “necessárias” estabelece com “ferramentas” uma relação de concordância nominal."}, {"id": "c", "texto": "Em “...e tomar medidas preventivas.”, o termo “tomar” estabelece com “medidas preventivas” uma relação de regência nominal."}, {"id": "d", "texto": "Em “Assim, a consulta regular com um cardiologista se torna não apenas um componente importante na prevenção de doenças cardíacas...”, o pronome “se” foi empregado de forma enclítica."}, {"id": "e", "texto": "Em “...mas também um passo vital para garantir uma vida saudável e longa.”, o termo “saudável” estabelece com “vida” uma relação de concordância verbal."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 7, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Inglês', null, 'Qual é o antônimo de big?',
  '[{"id": "a", "texto": "Large."}, {"id": "b", "texto": "Small."}, {"id": "c", "texto": "Tall."}, {"id": "d", "texto": "Short."}, {"id": "e", "texto": "Heavy."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 11, 'ingles', false,
  '[{"url": "/questoes-facape/2025.2-ampla-q11-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Inglês', null, 'Qual (quais) é (são) a (s) desinência (as) que
deve(m) ser obrigatoriamente acrescentada (s)
aos verbos regulares na terceira pessoa do
singular na afirmativa no presente do indicativo
em inglês?',
  '[{"id": "a", "texto": "X"}, {"id": "b", "texto": "L"}, {"id": "c", "texto": "Y"}, {"id": "d", "texto": "K"}, {"id": "e", "texto": "‘S’,‘ES’ e ‘IES’"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 12, 'ingles', false,
  '[{"url": "/questoes-facape/2025.2-ampla-q12-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Inglês', null, 'A que classe gramatical a palavra quickly
pertence?',
  '[{"id": "a", "texto": "Substantivo."}, {"id": "b", "texto": "Adjetivo."}, {"id": "c", "texto": "Advérbio."}, {"id": "d", "texto": "Verbo."}, {"id": "e", "texto": "Pronome."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 13, 'ingles', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Inglês', null, 'OMPTON, Calif. (AP) — Math is the subject sixth
grader Harmoni Knight finds hardest, but that’s
changing.
In-class tutors and “data chats” at her middle
school in Compton, California, have made a
dramatic difference, the 11-year-old said. She
proudly pulled up a performance tracker at a
tutoring session last week, displaying a column of
perfect 100% scores on all her weekly quizzes
from January.
https://apnews.com/article/math-reading-school-district-test-scores-f110ef05fb62f673530f44b120863bec
De acordo com o texto acima, Harmoni Knight:',
  '[{"id": "a", "texto": "é uma aluna universitária."}, {"id": "b", "texto": "acha matemática a mais fácil das matérias."}, {"id": "c", "texto": "a matemática é fácil, mas isso mudou com tutores em sala de aula e programas escolares de bate papo."}, {"id": "d", "texto": "conseguiu a nota máxima em testes semanais de janeiro."}, {"id": "e", "texto": "não sabe o que fará com o aprendizado de"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 14, 'ingles', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Inglês', null, 'https://br.pinterest.com/pin/8092474325784542/
A expressão supper dish significa:',
  '[{"id": "a", "texto": "um prato de jantar."}, {"id": "b", "texto": "um prato com um supertransmissor interno."}, {"id": "c", "texto": "um utensílio tão moderno que recebe pagamento via cartão de crédito."}, {"id": "d", "texto": "utensílio usado para qualquer refeição."}, {"id": "e", "texto": "tigela para dar água a gatos e cachorros. TEXTO PARA AS QUESTÕES 11 E 12 \"En la historia de la humanidad, las migraciones han sido una constante. Desde los primeros grupos nómadas hasta las actuales crisis de refugiados, el movimiento humano ha moldeado civilizaciones, culturas y economías. Sin embargo, la percepción de la migración ha variado con el tiempo: mientras en algunos periodos se valoró como una oportunidad de enriquecimiento cultural, en otros fue vista con recelo, generando políticas restrictivas y discursos de exclusión.\""}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 15, 'ingles', false,
  '[{"url": "/questoes-facape/2025.2-ampla-q15-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Espanhol', null, 'A principal tese do texto é que:',
  '[{"id": "a", "texto": "as migrações humanas sempre foram bem recebidas ao longo da história."}, {"id": "b", "texto": "o deslocamento populacional é um fenômeno recente, impulsionado por crises econômicas."}, {"id": "c", "texto": "a percepção sobre a migração varia conforme o contexto histórico e político."}, {"id": "d", "texto": "a migração não teve grande impacto na formação das civilizações."}, {"id": "e", "texto": "as políticas restritivas são a única resposta possível às crises migratórias."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 11, 'espanhol', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Espanhol', null, 'Segundo o texto, o movimento migratório pode
ser visto como:',
  '[{"id": "a", "texto": "um fator que sempre causa instabilidade social e econômica."}, {"id": "b", "texto": "um fenômeno homogêneo que ocorre da mesma forma em todas as épocas."}, {"id": "c", "texto": "um elemento irrelevante para a formação cultural das sociedades."}, {"id": "d", "texto": "uma questão complexa que pode ser tanto valorizada quanto rejeitada."}, {"id": "e", "texto": "um processo que só ocorre em tempos de guerra ou perseguição política."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 12, 'espanhol', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Espanhol', null, 'Em qual das frases abaixo o pretérito imperfecto
foi usado corretamente?',
  '[{"id": "a", "texto": "Ayer fui al cine y vi una película fantástica."}, {"id": "b", "texto": "Cuando era niño, jugaba en el parque todos los días."}, {"id": "c", "texto": "El mes pasado compré un coche nuevo."}, {"id": "d", "texto": "María llegó temprano a la reunión."}, {"id": "e", "texto": "La semana pasada viajamos a Barcelona."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 13, 'espanhol', false,
  '[{"url": "/questoes-facape/2025.2-ampla-q13-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Espanhol', null, '"En una cafetería de Buenos Aires, Clara hojea un
libro mientras espera a su amiga. Afuera llueve, y
el aroma del café recién hecho llena el ambiente.
De repente, escucha una voz familiar llamándola
desde la entrada."
O ambiente descrito no texto transmite uma
sensação de:',
  '[{"id": "a", "texto": "movimento intenso e barulho."}, {"id": "b", "texto": "ternura e agitação."}, {"id": "c", "texto": "conforto e tranquilidade."}, {"id": "d", "texto": "perigo iminente."}, {"id": "e", "texto": "indiferença e frieza."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 14, 'espanhol', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Espanhol', null, 'Qual das frases abaixo contém uma preposição
INCORRETA em espanhol?',
  '[{"id": "a", "texto": "Vivo en Madrid desde hace cinco años."}, {"id": "b", "texto": "Estoy buscando por mi teléfono en la casa."}, {"id": "c", "texto": "Mañana salgo para Barcelona temprano."}, {"id": "d", "texto": "Me encontré con Juan en el supermercado."}, {"id": "e", "texto": "No puedo vivir sin música."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 15, 'espanhol', false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Matemática', null, 'Em certo dia havia no estoque de uma farmácia,
no início do expediente, 105 caixas quando se
somavam os dois tipos de medicamentos “A” e
“B”. No final do dia, após algumas vendas,
verificou-se que havia a mesma quantidade de
caixas desses medicamentos, pois foi vendida a
metade das caixas do medicamento do tipo “B” e
um terço do tipo “A”.
A quantidade de caixas dos medicamentos “A” e
“B”, respectivamente, que havia no estoque da
farmácia no início do expediente desse dia era.',
  '[{"id": "a", "texto": "33 e 72."}, {"id": "b", "texto": "45 e 60."}, {"id": "c", "texto": "54 e 51."}, {"id": "d", "texto": "51 e 54."}, {"id": "e", "texto": "39 e 66."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 16, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q16-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Matemática', null, 'Um consultório de atendimento médico possui um
comprimento de 2,5 m, ocupando uma área total
de 5 m2. Para colocar novos equipamentos nesse
consultório e ainda conseguir manter espaço livre
suficiente para o atendimento dos pacientes, será
necessário fazer uma reforma e aumentar sua
área para 8 m2. Para executar a reforma foi
verificado que havia espaço para recuar uma
parede, fazendo com que a largura do consultório
aumentasse em 0,5 m. Assim, para atingir a área
desejada, o comprimento desse consultório deve
ser aumentado em:',
  '[{"id": "a", "texto": "0,7 m"}, {"id": "b", "texto": "0,8 m"}, {"id": "c", "texto": "1,2 m"}, {"id": "d", "texto": "3,2 m"}, {"id": "e", "texto": "3,6 m"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 17, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q17-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Matemática', null, 'Um paciente necessita tomar 10 mL de uma
solução injetável de glicose 50%. Uma indústria
farmacêutica produz esse medicamento e envasa
em ampolas de cinco capacidades diferentes em
mL (mililitros).
• Ampola tipo I: 10 mL
• Ampola tipo II: 10,5 mL
• Ampola tipo III: 11 mL
• Ampola tipo IV: 11,5 mL
• Ampola tipo V: 12 mL
Suponha que durante o manuseio para aplicação
desse medicamento nos pacientes haja uma
perda de 10% do conteúdo da ampola.
Assim sendo, o paciente vai tomar o medicamento
e deseja adquirir a ampola menor possível, de
modo que lhe seja administrada a dosagem
receitada.
A ampola que ele deverá adquirir será do tipo:',
  '[{"id": "a", "texto": "I."}, {"id": "b", "texto": "II."}, {"id": "c", "texto": "III."}, {"id": "d", "texto": "IV."}, {"id": "e", "texto": "V."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 18, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q18-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-ampla-q18-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Matemática', null, 'No estudo das equações exponenciais e dos
logaritmos é comum ser realizado o cálculo de
meia vida, que é o tempo necessário para que
determinada quantidade de uma substância seja
reduzida à metade. Supondo que a meia vida de
uma substância seja calculada pela expressão: M
= Mo × (
)
n
, na qual Mo é a quantidade inicial da
substância e n é o número de meias vidas para se
chegar à quantidade final M. Se forem lançados
10 mg de uma substância no corpo de um
indivíduo, o número de meias vidas necessárias
para que restem apenas 1,25 mg em seu corpo
será. (considere log 2 = 0,301 e log 125 = 2,097)',
  '[{"id": "a", "texto": "1"}, {"id": "b", "texto": "2"}, {"id": "c", "texto": "3"}, {"id": "d", "texto": "4"}, {"id": "e", "texto": "5"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 19, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q19-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Matemática', null, 'Artista plástico de Petrolina está construindo a
maior escultura do Brasil
A cidade de Petrolina, no Sertão de Pernambuco,
testemunha o surgimento de um gigante. Com 57
metros de altura, a nova escultura do artista
plástico Ranilson Viana será o maior monumento
do Brasil.
Fonte: https://g1.globo.com/pe/petrolina-regiao/noticia/2024/07/16/artistas-plastico-de-petrolina-esta-construindo-a-maior-escultura-do-brasil.ghtml
(acesso em 17/02/2025)
Ranilson Viana ao lado da cabeça de
Maria, que fará parte da maior escultura
do Brasil — Foto: Levi Varjão/ g1 Petrolina
Considere que antes de iniciar a obra da maior
escultura do Brasil, o artista Ranilson Viana tenha
modelado a escultura em miniatura com 28,5 cm
de altura para servir de base para seu trabalho.
Nesse caso, a escala utilizada pelo artista para
executar sua obra foi:',
  '[{"id": "a", "texto": "1 : 5.000"}, {"id": "b", "texto": "1 : 2.000"}, {"id": "c", "texto": "1 : 500"}, {"id": "d", "texto": "1 : 400"}, {"id": "e", "texto": "1 : 200 FÍSICA"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 20, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q20-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-ampla-q20-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-ampla-q20-full2.png", "legenda": null, "ordem": 92}, {"url": "/questoes-facape/2025.2-ampla-q20-full3.png", "legenda": null, "ordem": 93}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Física', null, 'Em um laboratório de pesquisa médica, estão
sendo estudadas as propriedades térmicas de
soluções fisiológicas. Considere 1,2 𝑘𝑔 de gelo a
−5°𝐶 (usado para simulações de baixas
temperaturas) e uma massa 𝑥 de vapor de água a
100°𝐶 (usado para esterilização), colocados em
um recipiente de capacidade térmica desprezível.
A temperatura final de equilíbrio térmico é 0°𝐶, e
o sistema está totalmente no estado líquido. Qual
o valor aproximado da massa de vapor?
Dados: Calor latente de vaporização da água =
540 𝑐𝑎𝑙/𝑔 , calor latente de fusão do gelo =
80 𝑐𝑎𝑙/𝑔 , calor específico do gelo 0,5 𝑐𝑎𝑙/𝑔°𝐶 e
calor específico da água = 1,0 𝑐𝑎𝑙/𝑔°𝐶',
  '[{"id": "a", "texto": "0,123 𝐾𝑔"}, {"id": "b", "texto": "0,155 𝐾𝑔"}, {"id": "c", "texto": "0,134 𝐾𝑔"}, {"id": "d", "texto": "0,170 𝐾𝑔"}, {"id": "e", "texto": "188,89𝑔"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 21, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q21-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Física', null, 'Duas pequenas esferas, 𝐴 e 𝐵, de massas iguais a
80𝑔 e 120𝑔, respectivamente, são colocadas à
distância de 40 𝑐𝑚 sobre o plano inclinado
(conforme a figura), cujo ângulo de inclinação é
45°. Fixa-se a esfera 𝐵 ao plano e fornece-se a
cada esfera a mesma quantidade de carga
elétrica. Considerando desprezível o atrito entre
as esferas e o plano, qual o valor mais se
aproxima, em módulo, da carga fornecida a cada
esfera, de modo que a esfera 𝐴 se mantenha em
equilíbrio na sua posição inicial? (Dados: 𝑔 =
9,8 𝑚/𝑠
, 𝑘 = 8,99 ⋅ 109 𝑁 ⋅ 𝑚2/𝐶
2 e sin 45° ≈
0,71)',
  '[{"id": "a", "texto": "3,14 𝜇𝐶"}, {"id": "b", "texto": "4,14 𝜇𝐶"}, {"id": "c", "texto": "2,14 𝜇𝐶"}, {"id": "d", "texto": "1,56 𝜇𝐶"}, {"id": "e", "texto": "3,14 ⋅ 10-1 𝜇𝐶"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 22, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q22-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-ampla-q22-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-ampla-q22-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Física', null, 'Em um laboratório de pesquisas médicas, um
experimento está sendo conduzido para estudar o
funcionamento de desfibriladores em
emergências. Para isso, aplica-se uma diferença
de potencial de 200𝑉 entre dois eletrodos 𝐴 e 𝐵
de um desfibrilador, simulando a aplicação em um
paciente, conforme figura abaixo. Determine a
energia potencial elétrica armazenada na
associação dos capacitores.',
  '[{"id": "a", "texto": "0,2563 𝐽"}, {"id": "b", "texto": "0,1175 𝐽"}, {"id": "c", "texto": "0,2356 𝐽"}, {"id": "d", "texto": "1,1750 𝐽"}, {"id": "e", "texto": "2,355 𝐽"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 23, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q23-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Física', null, 'Considere um telescópio refrator para observar
estrelas distantes. Para ajustar o foco e obter uma
imagem nítida, uma pequena lâmpada
fluorescente é posicionada perpendicularmente
ao eixo principal de uma lente delgada
convergente utilizada no telescópio. A imagem,
formada por essa lente, tem um quarto do
tamanho da lâmpada original e é projetada sobre
um anteparo a 40𝑐𝑚 da lente. Nessas condições,
determine a distância focal da lente.',
  '[{"id": "a", "texto": "16 𝑐𝑚"}, {"id": "b", "texto": "24 𝑐𝑚"}, {"id": "c", "texto": "32 𝑐𝑚"}, {"id": "d", "texto": "40 𝑐𝑚"}, {"id": "e", "texto": "48 𝑐𝑚"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 24, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q24-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Física', null, 'Considere uma empresa especializada na
fabricação de drones submarinos. Para projetar
corretamente os sistemas de flutuação, é
fundamental medir a força de empuxo exercida
sobre diferentes materiais quando imersos em
água (densidade 1𝑔/𝑐𝑚3). Como parte dos
testes, utiliza-se um bloco de aço de formato
cúbico, com aresta de 9,000 𝑐𝑚 e densidade de
7,700 𝑔/𝑐𝑚³, para avaliar o empuxo.
No experimento, o bloco de aço é submerso em
um recipiente, de massa desprezível, contendo
água (massa igual a 2,000 𝑘𝑔) e sustentado por
uma mola graduada, enquanto o recipiente
contendo água e o bloco suspenso é apoiado em
um dos pratos de uma balança, o outro prato é
equilibrado por uma massa 𝑚. Sabendo-se que
ambos os pratos estão equidistantes do ponto de
equilíbrio da balança, determine qual valor mais
se aproxima da massa 𝑚.',
  '[{"id": "a", "texto": "1998,542𝑔"}, {"id": "b", "texto": "1999,271𝑔"}, {"id": "c", "texto": "2000,000𝑔"}, {"id": "d", "texto": "2000,001𝑔"}, {"id": "e", "texto": "2001,458𝑔 QUÍMICA"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 25, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q25-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-ampla-q25-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-ampla-q25-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Química', null, 'O Instituto Butantan é um dos maiores centros de
pesquisa do mundo responsável por grande
influência na pesquisa acadêmica nacional e
internacional. O Centro de Desenvolvimento
Científico (CDC) é composto por pesquisadores
que trabalham na fronteira do conhecimento
científico em diferentes áreas da Ciência. Cada
pesquisa é única e fundamental para desvendar
sistemas biológicos, criar e adequar modelos,
aprimorar processos.
Disponível em:
https://butantan.gov.br/pesquisa/des
envolvimento-cientifico-cdc. Acesso
em 16.02.2025
Baseando–se nos conhecimentos sobre os
modelos atômicos, construção da tabela periódica
e modelos de ligações químicas pode–se afirmar
que:
Dados: Cℓ e F (17)',
  '[{"id": "a", "texto": "O modelo atômico atualmente aceito pela comunidade científica é baseado na teoria da mecânica ondulatória desenvolvida por Niels Bohr."}, {"id": "b", "texto": "O único isótopo do hidrogênio existente na molécula de água, H2O, é o próton 1H1."}, {"id": "c", "texto": "Toda molécula polar possui ligação polar."}, {"id": "d", "texto": "Na tabela periódica nem sempre o elemento mais eletronegativo apresenta a maior afinidade eletrônica."}, {"id": "e", "texto": "A molécula do CℓF3 apresenta geometria piramidal."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 26, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q26-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Química', null, 'A luteína é um antioxidante eficaz, o que significa
que ajuda a neutralizar os radicais livres,
substâncias instáveis que podem danificar as
células do olho. Essa ação antioxidante ajuda a
prevenir danos nos tecidos oculares e pode
contribuir para a prevenção de doenças oculares.
Sua fórmula estrutural pode ser representada por
Disponível em:
https://www.cemahospital.com.br/blog/lute
ina-para-que-serve Acesso em 16.02.2025.
Sobre a fórmula apresentada acima e seus
conhecimentos de química é CORRETO afirmar
que:',
  '[{"id": "a", "texto": "para hidrogenar completamente a luteína, em condições adequadas, são necessários 10 mol de H2."}, {"id": "b", "texto": "a luteína pode apresentar um éter como isômero de função."}, {"id": "c", "texto": "na fórmula da luteína a quantidade de átomos de hidrogênio é 50% maior que a quantidade de átomos de carbono."}, {"id": "d", "texto": "existem dois radicais s–propil na estrutura da luteína."}, {"id": "e", "texto": "o antioxidante acima apresenta 32 isômeros opticamente ativos."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 27, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q27-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-ampla-q27-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Química', null, 'Teoricamente, exercícios aeróbicos moderados e
leves usam gordura como principal fonte de
energia, enquanto atividades intensas priorizam o
consumo de glicose, pois o corpo necessita de
energia rápida. Mas isso não quer dizer que um
treino moderado é o mais eficiente para reduzir o
estoque de gordura corporal, como se acreditou
durante muito tempo.
Disponível em:
https://www.uol.com.br/vivabem/noti
cias/redacao/2024/10/08/caminhada-emagrece-veja-como-perder-peso-com-o-exercicio.htm Acesso em
16.02.2025.
Com base em seus conhecimentos de química e
considerando que o valor do calor de combustão
para 1g de gordura é de 9,4kcal e que o gasto
calórico por minuto de caminhada, calculado para
uma pessoa de 70,0kg, é aproximadamente de
5,5kcal, pode–se afirmar que:',
  '[{"id": "a", "texto": "A reação de esterificação é uma reação química que transforma gorduras e óleos em sabão e glicerol."}, {"id": "b", "texto": "A combustão ocorre quando um material comburente reage com um material combustível, geralmente o oxigênio."}, {"id": "c", "texto": "Uma caloria é a quantidade de energia necessária para elevar a temperatura de 1g de H2O(ℓ) em 1ºC."}, {"id": "d", "texto": "Os ácidos graxos são substâncias inorgânicas que atuam como fonte de energia para o corpo."}, {"id": "e", "texto": "Uma pessoa de 70,0kg que caminha durante 1h30min em uma pista plana, consegue metabolizar a energia equivalente à da combustão de, aproximadamente, 53g de gordura."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 28, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q28-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-ampla-q28-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2025.2-ampla-q28-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Química', null, 'Substâncias corrosivas são aquelas que podem
causar severas queimaduras quando em contato
com tecidos vivos. Podem existir no estado sólido
ou líquido. Também causam corrosão ao aço.
Disponível em:
https://www.embtec.com.br/br/notici
as/interna/classe-8-substancias-corrosivas-o-que-precisamos-saber
Acesso em 16.02.2025.
Basicamente, existem dois principais grupos de
materiais que apresentam essas propriedades, e
são conhecidos por ácidos e bases. A tabela
abaixo apresenta algumas informações sobre
algumas dessas substâncias.
Substância Classificação Principais
propriedades
H2SO4 Ácido forte 1
2 Ácido fraco Usado para tratar
infecções, limpar os
olhos e como
fertilizante.
HNO2 3 Reagente na
formação de
compostos
químicos, como
sais de diazônio
4 Base forte • Desentupir canos,
pias, ralos e vasos
sanitários.
NH4OH 5 Tem diversas
aplicações
industriais, na
agricultura, na
alimentação e na
limpeza.
Os números 1, 2, 3, 4 e 5 podem ser substituídos,
respectivamente, por:',
  '[{"id": "a", "texto": "Concentrado reage com sacarose formando carvão, H3BO3, ácido moderado, NaOH e base fraca."}, {"id": "b", "texto": "Corrói metais e reage com proteínas do tecido vivo, H3BO3, ácido moderado, NaOH e base fraca."}, {"id": "c", "texto": "Concentrado reage com sacarose formando apenas água, H2CO3, ácido moderado, NaOH e base fraca."}, {"id": "d", "texto": "Corrói metais e reage com proteínas do tecido vivo, H3BO3, ácido fraco, KOH e base fraca."}, {"id": "e", "texto": "Concentrado reage com sacarose formando sal, H3BO3, ácido moderado, KOH e base moderada."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 29, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q29-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-ampla-q29-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2025.2-ampla-q29-3.png", "legenda": null, "ordem": 3}, {"url": "/questoes-facape/2025.2-ampla-q29-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-ampla-q29-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Química', null, 'Bezafibrato reduz os níveis de triglicérides e
colesterol, o VLDL e o LDL (mau colesterol) e
aumenta os níveis de HDL (bom colesterol). O
bezafibrato também reduz a produção de
fibrinogênio (fator de coagulação) plasmático,
deixando o sangue menos espesso.
bezafibrato
Disponível em:
https://www.drogaraia.com.br/bulas/be
zafibrato-glenmark Acesso em
16.02.2025.
De acordo com a estrutura química acima e as
propriedades do bezafibrato, podemos afirmar
que;',
  '[{"id": "a", "texto": "São constituintes da estrutura química do bezafibrato O grupo funcional da classe das amidas e o da classe dos aldeídos."}, {"id": "b", "texto": "O número de átomos de carbono que utilizam orbitais híbridos sp3 é a metade do número de átomos de carbono que usam orbitais do tipo sp2."}, {"id": "c", "texto": "A solubilidade do bezafibrato em água deve ser elevada devido a formação de interações dipolo permanente–dipolo induzido entre o solvente e o grupo carboxila do soluto."}, {"id": "d", "texto": "Em meio aquoso a ionização do hidrogênio ligado ao oxigênio é mais fácil do que a ionização do hidrogênio associado ao nitrogênio."}, {"id": "e", "texto": "O átomo de carbono associado ao anel aromático ligado ao átomo de cloro apresenta geometria diferente do átomo de carbono associado ao outro anel aromático ligado ao átomo de oxigênio. BIOLOGIA"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 30, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q30-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-ampla-q30-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2025.2-ampla-q30-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-ampla-q30-full2.png", "legenda": null, "ordem": 92}, {"url": "/questoes-facape/2025.2-ampla-q30-full3.png", "legenda": null, "ordem": 93}, {"url": "/questoes-facape/2025.2-ampla-q30-full4.png", "legenda": null, "ordem": 94}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Biologia', null, 'A febre amarela é uma doença viral transmitida
por mosquitos infectados. Os sintomas mais
comuns incluem febre, dores musculares
(principalmente na região lombar), dor de cabeça,
perda de apetite, náusea e vômito. Na maioria dos
casos, os sintomas desaparecem após 3 ou 4 dias.
No entanto, entre 15% e 25% dos pacientes
evoluem para uma fase mais grave, caracterizada
por icterícia (pele e olhos amarelados), urina
escura, dores abdominais, vômitos, sangramentos
e um alto risco de morte. (Fonte: OPAS –
Organização Pan-Americana da Saúde, fevereiro
de 2025).
Com base nas informações sobre a transmissão
da febre amarela, assinale a alternativa
INCORRETA:',
  '[{"id": "a", "texto": "Os macacos não transmitem a febre amarela. Eles são apenas hospedeiros do vírus e servem como sentinelas, alertando sobre a circulação da doença em determinada região."}, {"id": "b", "texto": "Quando encontrados mortos, os macacos devem ser analisados em exames específicos para verificar se a causa da morte foi a febre amarela, auxiliando na vigilância epidemiológica."}, {"id": "c", "texto": "A febre amarela não é transmitida de pessoa para pessoa."}, {"id": "d", "texto": "O vírus da febre amarela é transmitido pela picada de mosquitos infectados. Apenas as fêmeas transmitem o vírus, pois necessitam do sangue para a maturação dos ovos."}, {"id": "e", "texto": "O vírus da febre amarela é transmitido pela picada de mosquitos infectados. Apenas os machos transmitem o vírus, pois precisam do sangue para a maturação dos ovos."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 31, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Biologia', null, 'As células são as unidades funcionais e
estruturais dos seres vivos. Apesar da grande
variedade de animais, plantas, fungos, protistas,
bactérias e arqueobactérias, há somente dois
tipos básicos de células: procariontes e
eucariontes. Sobre as diferenças básicas nesses
tipos celulares, assinale a alternativa correta.',
  '[{"id": "a", "texto": "Ambas são indiferenciáveis, pois tanto as células procariontes quanto os eucariontes apresentam as mesmas estruturas funcionais."}, {"id": "b", "texto": "As células eucariontes se diferenciam pelo fato de terem em seu interior compartimentos delimitados por membranas, conhecidos como organelas, portanto são células ricas em estruturas membranosas."}, {"id": "c", "texto": "As células procariontes não apresentam núcleos enquanto as células eucariontes apresentam núcleos indefinidos."}, {"id": "d", "texto": "As células procariontes apresentam núcleos bem visualizados, portanto deferem dos eucariontes que por sua vez os núcleos são desprovidos de membranas."}, {"id": "e", "texto": "Tanto as células procariontes quanto as células eucariontes são ricas em estruturas membranosas e os seus núcleos são individualizados."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 32, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Biologia', null, 'Sobre o papel do Ciclos Biogeoquímicos no meio
ambiente são feitas as seguintes afirmativas:
I. São processos exclusivamente biológicos
que garantem a produção de energia pelos
seres vivos.
II. Representam o movimento contínuo de
elementos químicos essenciais entre os
componentes bióticos e abióticos do
ecossistema.
III. São ciclos que ocorrem em ambientes
terrestres e não possuem influência nos
ecossistemas aquáticos.
IV.Dependem da atividade humana para
ocorrer, pois a natureza não consegue
reciclar nutrientes sozinha.
V. Envolvem a circulação do carbono e do
oxigênio, pois outros elementos não
possuem importância ecológica.
Assinale a alternativa CORRETA:',
  '[{"id": "a", "texto": "Apena a afirmativa I está correta."}, {"id": "b", "texto": "Apenas a afirmativa II está correta."}, {"id": "c", "texto": "As afirmativas III e IV estão corretas."}, {"id": "d", "texto": "As afirmativas IV e V estão corretas."}, {"id": "e", "texto": "Apenas a Alternativa IV está correta."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 33, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Biologia', null, '“A divisão das células é um requisito para todas
as formas de vida, uma vez que uma célula dá
origem a outras. A importância da divisão celular
na homeostase tecidual ganha destaque quando
ocorre alguma falha nesse processo, como
excesso de divisões ou divisões insuficientes. Em
seres multicelulares, divisões celulares
insuficientes podem causar anemias e doenças
degenerativas. Em contrapartida, o excesso de
divisões celulares também é observado nas
células do câncer. Divisões malsucedidas podem
acarretar aneuploidia (alteração no número de
cromossomos). A perda de cromossomos nos
organismos unicelulares durante a divisão
geralmente provoca a morte desse organismo.”
(Junqueira e Carneiro, 2023). Sobre o processo
de divisão celular podemos caracterizar a divisão
meiótica, descrevendo que:',
  '[{"id": "a", "texto": "ocorre em todos os tipos celulares."}, {"id": "b", "texto": "ocorre em células somáticas."}, {"id": "c", "texto": "ocorre em células haploides."}, {"id": "d", "texto": "ocorre em células sexuais."}, {"id": "e", "texto": "ocorre em células procariontes."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 34, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Biologia', null, 'A tradução é o processo pelo qual os ácidos
ribonucleicos mensageiros (mRNAs) são
decodificados em cadeias polipeptídicas, levando
à formação de proteínas. Esse processo ocorre
nos ribossomos e envolve a interação de
diferentes tipos de RNA e aminoácidos. Para que
esse processo ocorra, é necessário EXCETO:',
  '[{"id": "a", "texto": "que ocorra a organização os nucleotídios dos mrnas em combinações de três (trincas)."}, {"id": "b", "texto": "a presença de ácidos ribonucleicos transportadores (trnas)."}, {"id": "c", "texto": "que as trincas denominadas códons indiquem o aminoácido a ser incluído na cadeia polipeptídica em formação."}, {"id": "d", "texto": "que os trnas apresentem uma sequência anticódon em uma extremidade, que é complementar aos códons dos mrnas."}, {"id": "e", "texto": "que o rrnas ácido ribonucleico ribossomal denominado anticódon apresentem uma sequência anticódon em uma extremidade, que é complementar aos códons dos mrnas."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 35, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q35-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-ampla-q35-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Biologia', null, 'Sobre os componentes celulares do tecido
hematopoiético, relacione a 2ª coluna de acordo
com a 1ª, e assinale a alternativa que preenche
corretamente a coluna:
1ª COLUNA
(1) Eritrócitos
(2) Leucócitos
(3) Trombócitos
2 ª COLUNA
(...) São produzidos na medula óssea ou em
tecidos linfoides e permanecem
temporariamente no sangue. Utilizam o
sangue como meio de transporte para
alcançar o seu destino final, os tecidos.
São classificados em dois grupos:
granulócitos e agranulócitos.
(...) São corpúsculos anucleados, em forma de
disco, derivados de células gigantes e
poliploides da medula óssea, os
megacariócitos. Promovem a coagulação
do sangue e auxiliam a reparação da
parede dos vasos sanguíneos, evitando
perda de sangue.
(...) Produzidos na medula óssea, são
anucleados e contêm grande quantidade
de hemoglobina, uma proteína
transportadora de O2 e CO2.
(...) Basófilo, monócitos, acidófilos, neutrófilos
e basófilos.
(...) Fibrina e fibrinogênio.
(...) Reticulócitos.
Preenche CORRETAMENTE a alternativa:',
  '[{"id": "a", "texto": "2, 3, 1, 2, 3, 1."}, {"id": "b", "texto": "1, 2, 3, 1, 2, 3."}, {"id": "c", "texto": "1, 1, 2, 2, 3, 3."}, {"id": "d", "texto": "2, 3, 2, 3, 1, 1."}, {"id": "e", "texto": "3, 2, 1, 3, 2, 1."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 36, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Biologia', null, 'Observe as figuras abaixo, leia as alternativas
sobre fisiologia de transporte vegetal e assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "Na figura B o Xilema localizado de forma mais externa e o floema localizado mais internamente, constatando também um recorte no xilema na figura A."}, {"id": "b", "texto": "Na figura B o Xilema, localizado de forma mais externa sendo responsável pela condução da seiva bruta, e o floema localizado mais internamente responsável pela condução da seiva elaborada, constatando também um recorte no xilema na figura A."}, {"id": "c", "texto": "A figura A, visualiza, lesões em um dos sistemas condutores da planta, identificando assim a retirada do floema que conduz a seiva bruta, podendo levar morte ao vegetal; enquanto que a figura B apresenta o xilema e o floema intactos."}, {"id": "d", "texto": "As figuras A, e B, apresentam os vasos condutores Floema e Xilema, sendo que em A ocorre um processo de interrupção no xilema, impedindo assim o transporte de água e sais minerais para todo o vegetal; enquanto em B os vasos se mantem intactos."}, {"id": "e", "texto": "As figuras A e B, apresentam vasos condutores. Sendo que em A foi retirada um anel de floema localizada de forma mais externa sendo responsável pela condução da seiva elaborada, e o xilema localizado internamente responsável pela condução da seiva bruta continua intacto, e em B ambos os sistemas mantem-se intactos."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 37, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Biologia', null, 'A replicação do DNA celular, constitui um
processo necessário para assegurar que as
instruções contidas no DNA sejam passadas
fielmente adiante para as células-filhas. Nesse
contexto, pode-se afirmar que o processo de
replicação celular:',
  '[{"id": "a", "texto": "ocorre durante a fase s do ciclo celular."}, {"id": "b", "texto": "ocorre durante a prófase da mitose."}, {"id": "c", "texto": "ocorre durante a fase g1 do ciclo celular."}, {"id": "d", "texto": "ocorre em metáfase, fase de melhor visualização dos cromossomos."}, {"id": "e", "texto": "ocorre em cada fase do processo do ciclo celular."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 38, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Biologia', null, '"Foi pensando em estimular o público do Sertão
que a equipe do Hospital Dom Tomás e do
HEMOPE Petrolina promove a campanha de
doação de sangue “Uma Gota de Amor Pode
Salvar Vidas”
(Grande Rio Informa, G1, 12/02/2025).
A doação de sangue é um ato solidário em que
uma pequena quantidade do próprio sangue é
cedida para salvar vidas. Esse recurso é essencial
para transplantes, transfusões e cirurgias,
destacando a importância do conhecimento sobre
o Sistema ABO. Com base nessas informações,
analise as afirmativas abaixo e assinale a
alternativa INCORRETA.',
  '[{"id": "a", "texto": "O sistema ABO é formado por três alelos."}, {"id": "b", "texto": "O sistema ABO é trabalhado de forma independente."}, {"id": "c", "texto": "O sistema ABO é fundamental para que transfusões ocorram de maneira adequada."}, {"id": "d", "texto": "Os tipos sanguíneos são diferenciados pelos polissacarídeos encontrados na membrana celular das hemácias, denominados aglutinogênios, e pelos anticorpos encontrados no plasma, chamados de aglutininas."}, {"id": "e", "texto": "Cada tipo sanguíneo possui um aglutinogênio na hemácia e uma aglutinina no plasma contra os outros tipos de aglutinogênio existentes. Fonte: Google"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 39, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q39-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Biologia', null, 'Com relação à Teoria Evolucionista de Darwin,
marque verdadeiro (V) ou falso (F) diante das
afirmativas abaixo.
(...) A seleção natural explica por que os
organismos atendem às demandas dos seus
ambientes, um fenômeno chamado de
adaptação.
(...) A adaptação é o resultado esperado de um
processo acumulador das variantes mais
favoráveis em uma população ao longo do
tempo evolutivo.
(...) A adaptação já foi vista como uma forte
evidência a favor da evolução, e da teoria da
seleção de Darwin.
(...) A teoria da evolução de Darwin e a teoria da
herança cromossômica não incluem a
genética mendeliana.
Assinale a alternativa que apresenta a sequência
CORRETA:',
  '[{"id": "a", "texto": "F, F, V, V"}, {"id": "b", "texto": "V, F, V, F"}, {"id": "c", "texto": "F, V, F, V"}, {"id": "d", "texto": "V, V, F, F"}, {"id": "e", "texto": "F, F, F, V HISTÓRIA"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 40, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'História', null, 'Sobre os povos que habitaram a região de Roma
antes da formação do Império Romano, é
CORRETO afirmar que:',
  '[{"id": "a", "texto": "os latinos foram o único povo a habitar a região de Roma e desempenharam papel central na sua fundação."}, {"id": "b", "texto": "os sabinos foram conhecidos por suas habilidades como comerciantes e tinham grande influência no governo romano."}, {"id": "c", "texto": "os etruscos foram um povo originário da Ásia Menor que teve grande influência na cultura e na organização social de Roma tendo os últimos reis de Roma."}, {"id": "d", "texto": "os samnitas dominaram a região central de Roma, sendo derrotados em batalhas decisivas pelos romanos."}, {"id": "e", "texto": "os romanos, inicialmente, não tiveram contato com os etruscos, os latinos e os sabinos."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 41, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q41-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'História', null, 'Sobre a sociedade na Idade Média Europeia, é
CORRETO afirmar que:',
  '[{"id": "a", "texto": "a principal característica da sociedade medieval foi a ausência de uma estrutura social hierárquica, com todos os membros possuindo direitos iguais."}, {"id": "b", "texto": "a Igreja Católica não tinha influência sobre a vida política e econômica, sendo restrita apenas ao âmbito espiritual."}, {"id": "c", "texto": "a maioria da população medieval era composta por camponeses, que viviam sob um sistema feudal, com obrigações para com os senhores locais."}, {"id": "d", "texto": "o sistema feudal envolvia obrigações de senhores aos servos, sendo apenas no pagamento de impostos."}, {"id": "e", "texto": "as cidades medievais eram grandes centros de comércio e desenvolvimento intelectual, onde a classe nobre se estabelecia."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 42, null, false,
  '[{"url": "/questoes-facape/2025.2-ampla-q42-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-ampla-q42-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'História', null, 'Sobre o Iluminismo, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "pregava a subordinação da razão à fé religiosa, reforçando o poder absoluto das monarquias."}, {"id": "b", "texto": "foi um movimento de caráter artístico que se concentrou nas artes plásticas, como pintura e escultura."}, {"id": "c", "texto": "advogava o uso da razão e da ciência como meios para alcançar o progresso e a liberdade, sendo um movimento crítico ao absolutismo e à Igreja."}, {"id": "d", "texto": "defendia a manutenção das desigualdades sociais, apoiando-se nas tradições feudais."}, {"id": "e", "texto": "se limitava à Europa, não tendo nenhuma influência nas colônias e no Novo Mundo."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 43, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'História', null, 'Durante o período colonial brasileiro, as práticas
de saúde eram predominantemente influenciadas
pelas crenças e pela medicina europeia. Sobre a
saúde no Brasil colonial, é CORRETO afirmar
que:',
  '[{"id": "a", "texto": "a medicina indígena era completamente ignorada pelos colonizadores, que impuseram de imediato a prática europeia sem qualquer intercâmbio de saberes."}, {"id": "b", "texto": "as doenças como a varíola e a malária foram erradicadas pelos colonizadores ainda no século XVI, com a implementação de medidas de saúde pública."}, {"id": "c", "texto": "a maioria das curas era realizada por boticários e curandeiros, com remédios feitos a partir de ervas nativas e práticas indígenas, misturadas com conhecimentos europeus."}, {"id": "d", "texto": "não havia doenças epidêmicas no brasil colonial, e a saúde pública era organizada com hospitais modernos desde o início da colonização."}, {"id": "e", "texto": "os jesuítas eram responsáveis por fornecer atendimento médico gratuito a toda a população."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 44, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'História', null, 'Durante o regime militar no Brasil, houve avanços
e retrocessos na área da saúde. Qual das
alternativas abaixo descreve uma característica
marcante da saúde pública nesse período?',
  '[{"id": "a", "texto": "A criação do INPS (Instituto Nacional de Previdência Social), que unificou a previdência e garantiu assistência médica apenas para trabalhadores formais, sem ampliar significativamente o acesso à saúde para a população em geral."}, {"id": "b", "texto": "A priorização de políticas de saúde preventiva, com foco em campanhas de vacinação em massa para toda a população, com um grande investimento em educação sanitária."}, {"id": "c", "texto": "A descentralização do sistema de saúde, garantindo autonomia aos municípios."}, {"id": "d", "texto": "A proibição de medicamentos importados, incentivando a indústria farmacêutica nacional."}, {"id": "e", "texto": "A extinção de hospitais públicos, substituídos por clínicas particulares. GEOGRAFIA"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 45, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Geografia', null, 'As variações de temperatura levam os minerais
que constituem as rochas a se dilatarem e a se
contraírem, provocando o fraturamento. Essas
fraturas, em áreas de clima úmido, facilitam a
entrada da água e, consequentemente, o
intemperismo químico. Em regiões de clima seco
(desertos e regiões de clima semiárido), a
tendência é a formação de solos pedregosos,
resultantes da meteorização física.
GUERRA, A. J. T. Geomorfologia Ambietal.
8ª ed. Rio de Janeiro: Bertrand Brasil,
2018 (Adaptado).
O processo apresentado no texto resulta em:',
  '[{"id": "a", "texto": "desagregação das rochas."}, {"id": "b", "texto": "congelamento rochoso."}, {"id": "c", "texto": "fratura nas geleiras."}, {"id": "d", "texto": "desmatamento da mata ciliar."}, {"id": "e", "texto": "surgimento de barras fluviais."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 46, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Geografia', null, 'Grande parte da população brasileira vive na área
que compreende a unidade de relevo
denominada “Planaltos e serras do Atlântico leste-sudeste”. Essa unidade caracteriza-se pela
presença de encostas íngremes, vales fluviais
estreitos e profundos, solos rasos e clima tropical
úmido. Tais características naturais favorecem os
deslizamentos ou escorregamento de terra nas
encostas, assim como a inundação das planícies
por causa do grande volume e velocidade de
escoamento das águas dos rios.
LUÍS, J. A. Geografia: leituras e interação,
volume 1. 1. ed. São Paulo: Leya, 2013.
O problema descrito no texto, enfrentado pela
população brasileira, tem como consequência o/a',
  '[{"id": "a", "texto": "sustentabilidade."}, {"id": "b", "texto": "promoção social."}, {"id": "c", "texto": "inserção do trabalho."}, {"id": "d", "texto": "racismo ambiental."}, {"id": "e", "texto": "conservação."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 47, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Geografia', null, '[...] Os “semeadores” de cidades irregulares,
nascidos e crescidos aos deus-dará, rebeldes à
norma abstrata. Esse tipo de aglomerados urbano
“não chega a contradizer o quadro da natureza, e
sua silhueta se enlaça na linha da paisagem”.
HOLANDA, S. B. de. Raízes do Brasil. 27ª ed.
São Paulo: Companhia das Letras, 2014.
Com base no conceito de urbanização presente
no texto, o autor refere-se:',
  '[{"id": "a", "texto": "às áreas desordenadas de solo."}, {"id": "b", "texto": "à crise ambiental."}, {"id": "c", "texto": "à competição urbana."}, {"id": "d", "texto": "à especulação imobiliária."}, {"id": "e", "texto": "à construção de condomínios."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 48, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Geografia', null, 'Bactérias e vírus foram os aliados mais eficazes.
Os europeus traziam, como pragas bíblicas, a
varíola e o tétano, várias enfermidades
pulmonares, intestinais e venéreas, o tracoma, o
tifo, a lepra, a febre amarela, as cáries que
apodreciam as bocas. A varíola foi a primeira a
aparecer. Não seria um castigo sobrenatural
aquela epidemia desconhecida e repugnante que
provoca a febre e descompunha a carne? “Lá
foram se meter em Tlaxcala”, narra um
testemunho indígena, “então se espalhou a
epidemia: tosse, grãos ardentes, que queimam”. E
outro: “A muitos deu morte a pegajosa, pesada,
dura doença dos grãos”. Os índios morriam como
moscas; seus organismos não opunham
resistência às novas enfermidades, e os que
sobreviviam ficavam debilitados e inúteis. O
antropólogo brasileiro Darcy Ribeiro estima que
mais de metade da população aborígene da
América, Austrália e ilhas oceânicas morreu
contaminada.
GALEANO, E. As veias abertas da América
Latina. Porto Alegre, RS: L&PM, 2019.
Com base nas informações do texto, as doenças
que se disseminaram por toda a América, foi
consequência da/do:',
  '[{"id": "a", "texto": "discriminação de raça."}, {"id": "b", "texto": "contato com os europeus."}, {"id": "c", "texto": "urbanização desenfreada."}, {"id": "d", "texto": "política de higienização."}, {"id": "e", "texto": "cultural dos povos autóctones."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 49, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
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
  'Geografia', null, 'O período das Grandes Navegações e do
colonialismo europeu (século XV a XVII) é
certamente um dos mais representativos quando
se trata de mapas como ferramentas estratégicas
nas relações políticas entre países. Isso porque,
além de sua importância para localizar as colônias
das potências europeias na América, Ásia e África,
as cartas náuticas e os registros das terras
conquistadas eram fundamentais para traçar as
rotas comerciais marítimas. Os mapas eram,
portanto, instrumentos vitais para o domínio
político e econômico.
Qual fator foi determinante para o uso dos mapas
no período das grandes navegações?',
  '[{"id": "a", "texto": "Territorialização."}, {"id": "b", "texto": "Expansão migratória."}, {"id": "c", "texto": "Predomínio da vegetação nativa."}, {"id": "d", "texto": "Diminuição cambial."}, {"id": "e", "texto": "Mecanização do cultivo."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Ampla Concorrência',
  '2025.2-ampla', 'FACAPE 2025.2 - Ampla Concorrência', 2025, 2,
  'ampla', 50, null, false,
  '[]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) where prova_codigo is not null do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();
