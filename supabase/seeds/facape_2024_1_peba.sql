-- ============================================================================
-- DECOLA MED — SEED: FACAPE 2024.1 - Rede PEBA/Bolsistas
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
  'Português', null, 'Na produção de um texto ocorre articulações das
informações por meio de relações de sentido. Com
base nessa afirmativa, assinale a sequência que
expressa concessão:',
  '[{"id": "a", "texto": "“De acordo com dados do Sistema de Informações sobre Nascidos Vivos (Sinasc)...”"}, {"id": "b", "texto": "“...estima-se que, a cada ano, cerca de 24 mil recém-nascidos são registrados no Brasil com algum tipo de anomalia congênita diagnosticada ao nascimento.”."}, {"id": "c", "texto": "“...sabe-se que este número ainda está sub-representado, se comparado a estimativas internacionais...”."}, {"id": "d", "texto": "“...uma vez que o diagnóstico das anomalias congênitas ao nascimento é bastante heterogêneo e varia amplamente nas diferentes regiões do país.”."}, {"id": "e", "texto": "“...embora passíveis de diagnóstico ao nascimento, exigem instrumentos ou conhecimentos técnicos específicos...”. Imagem para a questão 02. http://www.ivancabral.com"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 1, null, false,
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
  'Português', null, 'A intenção comunicativa na charge de Ivan Cabral é:',
  '[{"id": "a", "texto": "sugerir que a chuva fosse constante na região do semiárido do nordeste brasileiro."}, {"id": "b", "texto": "alertar a Agência Pernambucana de Águas e Clima que haverá chuva forte no sertão pernambucano."}, {"id": "c", "texto": "personificar um ser inanimado, utilizando-se de características próprias de seres humanos."}, {"id": "d", "texto": "retratar a precariedade do homem sertanejo."}, {"id": "e", "texto": "provocar a reflexão sobre a realidade das pessoas que vivem no sertão nordestino. Texto para a questão 03. “[…] sou mulher feita de poesia. …, nasci tem pouco tempo, depois de perceber que a vida só precisa fazer sentido do lado de dentro. E do lado de dentro, sou poema. Nas horas vagas sou médica, e muitas vezes chego a pôr em receituário as orientações de tratamento complementar de poesia para meus pacientes.” Claudia Quintana"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 2, null, false,
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
  'Português', null, 'Sobre as escolhas linguísticas feitas pela autora, é
CORRETO afirmar que:',
  '[{"id": "a", "texto": "utiliza a função apelativa para fortalecer a linguagem denotativa."}, {"id": "b", "texto": "emprega um tom de espontaneidade, através do uso constante da linguagem coloquial."}, {"id": "c", "texto": "festeja o fato de ser médica e prescrever sempre orientações de tratamento complementar de poesia para seus pacientes."}, {"id": "d", "texto": "Na passagem “...nasci tem pouco tempo, depois de perceber que a vida só precisa fazer sentido do lado de dentro.”, as palavras destacadas, exercem, do ponto de vista morfológico, funções respectivamente de advérbio de intensidade e conjunção causal."}, {"id": "e", "texto": "em “E do lado de dentro, sou poema.”, a autora faz uso da linguagem conotativa. Texto para a questão 04. “Abuso sexual infantil ocorre quando é utilizado o corpo de uma criança e/ou adolescente em prática de qualquer ato de natureza sexual, por uma pessoa adulta ou adolescente. Não entendendo a situação, a criança, por conseguinte, torna-se incapaz de compreender a prática do ato como abuso, em alguns casos cometidos por familiares e pessoas próximas. Os atos e práticas cruéis de violência ocorrem por meio de toques e carícias na vítima pelo abusador (adulto ou adolescente). É qualquer ato que pretende gratificar ou satisfazer as necessidades sexuais do abusador, incluindo indução ou coerção da vítima para o ato de violência.” https://www.oab.org.br"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 3, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q03-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Português', null, 'Os textos fazem uso constante de recursos que
permitem a articulação entre suas partes. Quanto à
construção desse fragmento, podemos afirmar que:',
  '[{"id": "a", "texto": "em “... incluindo indução ou coerção da vítima para o ato de violência.”, o termo “da vítima” foi empregado para completar a significação de um verbo transitivo."}, {"id": "b", "texto": "“por conseguinte” é um recurso coesivo que expressa valor de conformidade."}, {"id": "c", "texto": "na frase “...alguns casos cometidos por familiares e pessoas próximas.”, a palavra “alguns” faz referência ao termo “familiares”."}, {"id": "d", "texto": "as formas verbais “ocorre”, “torna-se” e “pretende” foram empregadas no presente do modo indicativo."}, {"id": "e", "texto": "o trecho “Os atos e práticas cruéis de violência ocorrem por meio de toques e carícias na vítima pelo abusador (adulto ou adolescente).” evidencia a solidariedade do autor e convida o leitor a apiedar-se do próximo. Texto para a questão 05. https://csplacas.com.br"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 4, null, false,
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
  'Português', null, 'Sobre a linguagem verbal do texto e a relação de seu
autor com a língua portuguesa, está CORRETO afirmar
que:',
  '[{"id": "a", "texto": "empregou a palavra “AVISO” para persuadir o leitor a vestir camisa ao entrar em qualquer recinto."}, {"id": "b", "texto": "a expressão “SEM CAMISA” estabelece com o termo “PROIBIDO” uma relação sintática de regência."}, {"id": "c", "texto": "a forma verbal “É”, no singular, foi empregada para reforçar o conteúdo da mensagem."}, {"id": "d", "texto": "contém um desvio linguístico no que se refere à concordância nominal."}, {"id": "e", "texto": "o texto verbal da placa corretamente seria: a entrada sem camisa é proibido. Texto para a questão 06. “As infecções causadas pelos vírus das hepatites B ou C frequentemente se tornam crônicas. Contudo, por nem sempre apresentarem sintomas, grande parte das pessoas desconhecem ter a infecção. Isso faz com que a doença possa evoluir por décadas sem o devido diagnóstico. O avanço da infecção compromete o fígado sendo causa de fibrose avançada ou de cirrose, que podem levar ao desenvolvimento de câncer e necessidade de transplante do órgão.” https://www.gov.br"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 5, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q05-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.1-peba-q05-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'Português', null, 'Assinale a alternativa que apresenta uma afirmação
CORRETA de acordo com o texto:',
  '[{"id": "a", "texto": "Na oração “Contudo, por nem sempre apresentarem sintomas...”, o coesivo “Contudo pode ser substituído, sem alteração do sentido original, por De maneira que."}, {"id": "b", "texto": "A oração “grande parte das pessoas desconhecem ter a infecção.” Pode também ser construída com a forma verbal “desconhecem” no singular."}, {"id": "c", "texto": "Na passagem “...Isso faz com que a doença possa evoluir por décadas sem o devido diagnóstico.”, a palavra sublinhada está empregada inadequadamente."}, {"id": "d", "texto": "A oração “O avanço da infecção compromete o fígado...” foi construída na voz passiva."}, {"id": "e", "texto": "Em “...que podem levar ao desenvolvimento de câncer e necessidade de transplante do órgão.”, o termo em destaque é complemento de uma forma verbal. Texto para a questão 07. Maria, Maria “Maria, Maria é um dom, uma certa magia Uma força que nos alerta Uma mulher que merece viver e amar Como outra qualquer do planeta Maria, Maria é o som, é a cor, é o suor É a dose mais forte e lenta De uma gente que ri quando deve chorar E não vive, apenas aguenta Mas é preciso ter força, é preciso ter raça É preciso ter gana sempre Quem traz no corpo a marca Maria, Maria mistura a dor e a alegria Mas é preciso ter manha, é preciso ter graça É preciso ter sonho sempre Quem traz na pele essa marca Possui a estranha mania de ter fé na vida Mas é preciso ter força, é preciso ter raça É preciso ter gana sempre Quem traz no corpo a marca Maria, Maria mistura a dor e a alegria” Fernando Brant e Milton Nascimento"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 6, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q06-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Português', null, 'A letra da canção, composta por Fernando Brant e
Milton Nascimento, relata:',
  '[{"id": "a", "texto": "a força de uma mulher laboriosa que tem ideais e enfrenta dificuldades, todavia não desanima. Tem esperança na vida para alcançar seus desejos, sonhos e objetivos."}, {"id": "b", "texto": "os obstáculos que as mulheres enfrentam no cotidiano por conta da violência doméstica e disparidade salarial."}, {"id": "c", "texto": "uma força inigualável que cresce junto de uma mulher empoderada, que futuramente procura se libertar para conquistar tudo o que deseja."}, {"id": "d", "texto": "a união da mulher guerreira que, com sua magia, pode transformar o mundo."}, {"id": "e", "texto": "a natureza feminina é a maior força das Marias, por isso são capazes de potencializar uma sociedade plural, dinâmica e justa."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 7, null, false,
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
  'Inglês', null, 'Over the next few billion years, single-celled organisms
fused and became multicellular; body plans diversified
and radiated, exploding into an array of invertebrates.
Yet all this abundance and life was restricted to the
seas, and a vast and bountiful land sat unused.
http://Blogs.scientificamerican.com
De acordo com o texto.',
  '[{"id": "a", "texto": "Apesar de abundante, a vida restringia-se aos mares."}, {"id": "b", "texto": "Esqueletos diversificaram-se e mantiveram o tamanho original."}, {"id": "c", "texto": "Animais invertebrados tornaram-se organismos unicelulares."}, {"id": "d", "texto": "A vida era abundante no mar e na terra."}, {"id": "e", "texto": "Organismos unicelulares juntaram-se para criar mais organismos unicelulares."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 11, 'ingles', false,
  '[{"url": "/questoes-facape/2024.1-peba-q11-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Inglês', null, 'Qual é a opção CORRETA de acordo com a tirinha
abaixo:
https://www.gocomics.com',
  '[{"id": "a", "texto": "Charlie levará o cachorro chamado Snoopy para passear no parque."}, {"id": "b", "texto": "O cachorro está sendo levado ao consultório de um veterinário para ser vacinado."}, {"id": "c", "texto": "Snoopy pretende cooperar com o veterinário."}, {"id": "d", "texto": "Charlie quer que Snoopy finja estar cooperando com o veterinário."}, {"id": "e", "texto": "‘Pretend’ não é um falso cognato."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 12, 'ingles', false,
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
  'Inglês', null, '“Those fearless travellers and explorers whose
energetic temperaments had borne them through
every quarter or the globe, many of them grown old and
worn out in the service of science. All had, in some
degree, physically or morally, undergone the sorest
trials.
Jules Vernes – Five Weeks in a Balloon',
  '[{"id": "a", "texto": "‘fearless’ é conjunção e significa medroso."}, {"id": "b", "texto": "Esses viajantes estiveram em quase todas as partes do globo."}, {"id": "c", "texto": "Poucos deles conseguem envelhecer a serviço da ciência."}, {"id": "d", "texto": "Na linha 4, a palavra ‘sorest na expressão ‘undergone the sorest trials’ é adjetivo superlativo e significa o mais doloroso."}, {"id": "e", "texto": "‘Temperaments’, na primeira linha, é verbo conjugado no presente do indicativo."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 13, 'ingles', false,
  '[{"url": "/questoes-facape/2024.1-peba-q13-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Inglês', null, 'Qual é a alternativa CORRETA de acordo com o texto
de William James?
“There is no more miserable human being than one in
whom nothing is habitual but indecision, and for whom
the lighting of every cigar, the drinking of every cup, the
time of rising and going to bed every day, and the
beginning of every bit of work, are subjects of express
volitional deliberation.”
Fonte: William James – The Principles of
Psychology – Volume One',
  '[{"id": "a", "texto": "O autor afirma que as pessoas que levam a vida sem horário fixo vivem bem."}, {"id": "b", "texto": "Afirma-se, no texto, que usar da rotina para desfrutar dos próprios vícios ajuda a ter uma disciplina rígida."}, {"id": "c", "texto": "Ser pontual e rotineiro torna as pessoas felizes."}, {"id": "d", "texto": "A maioria das pessoas é infeliz por não ter rotina."}, {"id": "e", "texto": "As pessoas que não fazem ações de forma habitual são presas de atos volitivos."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 14, 'ingles', false,
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
  'Inglês', null, 'Qual das alternativas abaixo é a mais apropriada de
acordo com o texto acima:',
  '[{"id": "a", "texto": "A expressão ‘No more miserable human being than one . . .’ na linha 1 é superlativa absoluta sintética."}, {"id": "b", "texto": "Na linha 1, a palavra ‘one’ é numeral cardinal."}, {"id": "c", "texto": "Na linha 2, a palavra ‘lighting’ é verbo e significa acender."}, {"id": "d", "texto": "Na linha 3, as palavras ‘time’ . . . ‘ e ‘bed’ são adjetivos e verbo, respectivamente."}, {"id": "e", "texto": "Na quarta linha, a palavra ‘volitional’ significa volitivo."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 15, 'ingles', false,
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
  'Espanhol', null, 'Considere o seguinte fragmento:
En el tren de Portugalete de la una de la tarde llegó ayer
de Bilbao el joven de dieciséis años Pedro Nava. Como
llevaba la cabeza fuera de la ventanilla, al entrar el tren
en el puente de hierro de Burceña recibió un tremendo
golpe en la cabeza, que le privó del conocimiento y le
causó una herida.
(BENITO, C. A mazazos y hachazos
en Muskiz y otras noticias de hace un
siglo. Disponível em:
<https://www.elcorreo.com/tiempo-de-historias/mazazos-hachazos-muskiz-20220501113415-nt.html>.
Acesso em: 5 set. 2023.
Segundo trecho do jornal, é CORRETO afirmar:',
  '[{"id": "a", "texto": "Pedro Nava foi atropelado por um jovem que vinha de Bilbau no mesmo comboio que ele."}, {"id": "b", "texto": "Pedro Nava não percebeu que havia um pedaço de ferro no trem e machucou a cabeça."}, {"id": "c", "texto": "Pedro Nava se feriu ao bater a cabeça numa ponte durante uma viagem de trem."}, {"id": "d", "texto": "Pedro Nava sentiu fortes dores no trem ao bater a cabeça na janela."}, {"id": "e", "texto": "Quando Pedro Nava entrou no trem, percebeu que estava com um ferimento na cabeça devido a uma pancada."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 11, 'espanhol', false,
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
  'Espanhol', null, 'Considere o seguinte texto:
Pese a las malas noticias en cuestión sanitaria de los
últimos días, parece que hay algunos que no
escarmientan. Alrededor de 120 personas celebraron
ayer una fiesta privada en un catamarán saltándose las
actuales normativas sanitarias.
PROVINCIAS, L. Noticas de la
comarca La Marina Alta. Disponível
em: <https://lasprovincias.es/marina-alta/>. Acesso em: 5 set. 2023.
Segundo o texto, a expressão sublinhada e em negrito
significa que algumas pessoas não:',
  '[{"id": "a", "texto": "aprendem com sua própria experiência."}, {"id": "b", "texto": "querem cair nos mesmos erros."}, {"id": "c", "texto": "vão a festas privadas."}, {"id": "d", "texto": "são desrespeitosas quando se amontoam num barco."}, {"id": "e", "texto": "tomaram conhecimento das normas sanitárias."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 12, 'espanhol', false,
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
  'Espanhol', null, 'A alternativa em que o uso de MUY e MUCHO está
corretamente aplicada é a:',
  '[{"id": "a", "texto": "En la actualidad, ciertas profesiones se practican MUCHO menos que antes."}, {"id": "b", "texto": "Los fanáticos suelen ser MUCHO groseros."}, {"id": "c", "texto": "Los actores deben ser MUCHO dedicados."}, {"id": "d", "texto": "Durante el invierno, en los estadios suele hacer MUY frio."}, {"id": "e", "texto": "El baloncesto es MUY mejor que el futbol."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 13, 'espanhol', false,
  '[{"url": "/questoes-facape/2024.1-peba-q13-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'Espanhol', null, 'Na placa que o Menino Maluquinho usa no peito falta o
verbo VENDER em espanhol.
Qual das seguintes alternativas estaria CORRETA?',
  '[{"id": "a", "texto": "Vende-se."}, {"id": "b", "texto": "Véndenos."}, {"id": "c", "texto": "Vénden se."}, {"id": "d", "texto": "Se venden."}, {"id": "e", "texto": "Véndo le."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 14, 'espanhol', false,
  '[{"url": "/questoes-facape/2024.1-peba-q14-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.1-peba-q14-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'Espanhol', null, 'Considere o seguinte texto:
¿Qué géneros musicales se destacan en América del
Sur?
América del Sur es conocida por su rica diversidad
cultural y musical. En esta región, se destacan diversos
géneros musicales que reflejan la identidad y
tradiciones de cada país.
Uno de los géneros más reconocidos en América del
Sur es la salsa. Originaria de Cuba, la salsa se ha
extendido por toda la región y se ha convertido en un
símbolo de la música latina. La salsa es conocida por
su ritmo y energía contagiosos.
Otro género musical destacado en América del Sur es
el tango. Originario de Argentina y Uruguay,
el tango es un estilo de música y danza que expresa el
sentimiento melancólico y apasionado de la región del
Río de la Plata.
En Brasil, el samba es uno de los géneros musicales
más populares. El samba es una mezcla de ritmos
africanos y brasileños, y se caracteriza por su ritmo
alegre y contagioso. Es parte integral de la celebración
del carnaval en Brasil.
El reggaetón es otro género musical que se ha
destacado en América del Sur en los últimos años.
Originario de Puerto Rico, el reggaetón ha ganado
popularidad en toda la región y se ha convertido en una
de las corrientes musicales más escuchadas en
América Latina. Además de estos géneros, existen
otros estilos musicales que se destacan en América del
Sur, como el folklore, el cumbia, el vallenato y
el merengue. Estos géneros representan la diversidad
cultural y musical de la región.
Los 10 Géneros Musicales Más
Populares de Latinoamérica | Un día
una canción. Disponível em:
<https://www.undiaunacancion.es/lo
s-10-generos-musicales-mas-populares-de-latinoamerica/?expand_article=1>.
Acesso em: 5 set. 2023.
Segundo o texto, quais são alguns dos géneros
musicais que mais se destacam na América do Sul?',
  '[{"id": "a", "texto": "Salsa, bachata, tango, y reggae."}, {"id": "b", "texto": "Salsa, tango, samba, y reggaetón."}, {"id": "c", "texto": "Rock, cumbia, merengue, y vallenato."}, {"id": "d", "texto": "Flamenco, jazz, samba, y reggaetón."}, {"id": "e", "texto": "Hip-hop, reggae, tango, y cumbia."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 15, 'espanhol', false,
  '[{"url": "/questoes-facape/2024.1-peba-q15-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Matemática', null, 'Durante uma corrida automobilística realizada na
Inglaterra, um dos pilotos registrou com seu veículo
uma velocidade média de 236,25 milhas por hora.
Fazendo a conversão dessa velocidade média para
metros por segundo, teremos: (considere 1 milha = 1,6
km):',
  '[{"id": "a", "texto": "37,8 m/s"}, {"id": "b", "texto": "63,0 m/s"}, {"id": "c", "texto": "95 m/s"}, {"id": "d", "texto": "105 m/s"}, {"id": "e", "texto": "125 m/s"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 16, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q16-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2024.1-peba-q16-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Matemática', null, 'Considerando a necessidade de ser feita a atualização
monetária de R$ 35.000,00, referente a um litígio, para
que esse valor, ao final de 60 meses, não tenha seu
poder de compra defasado, foi feito o depósito da
quantia em questão em uma conta que remunera seus
depósitos a juros compostos. A expressão que fornece
a taxa mensal de juros – i –, necessária para que essa
quantia, ao final do prazo estabelecido, seja triplicada
é:',
  '[{"id": "a", "texto": "i = ( √105 60− 1)%"}, {"id": "b", "texto": "i = ( √3 − 1)%"}, {"id": "c", "texto": "i = ( √35 60− 1)%"}, {"id": "d", "texto": "i = (√105 3− 1)%"}, {"id": "e", "texto": "i = (√3 − 1)%"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 17, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q17-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'A quantidade de pessoas inscritas, no mês de
fevereiro, para participar de uma palestra que acontece
mensalmente foi 280. Esse número é 12% superior ao
que foi verificado de inscritos no mês de janeiro.
Planeja–se, para a palestra de março, que a quantidade
de participantes supere o mês anterior, alcançando–se
20% a mais de inscritos quando comparado ao mês de
janeiro. Espera–se, portanto, que para o mês de março
o número de participantes nessa palestra seja:',
  '[{"id": "a", "texto": "247"}, {"id": "b", "texto": "296"}, {"id": "c", "texto": "300"}, {"id": "d", "texto": "304"}, {"id": "e", "texto": "330"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 18, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q18-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.1-peba-q18-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2024.1-peba-q18-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Matemática', null, 'A biblioteca de uma faculdade de medicina vai adquirir
para seu acervo 3 livros de biologia e 2 livros de
química. Na pesquisa que foi feita, chegou–se a 6
publicações possíveis de biologia que atendiam às
necessidades definidas pela coordenação de ensino, e
5 títulos possíveis para química. De quantas maneiras
diferentes essa faculdade poderá adquirir os livros de
que necessita para acrescentar ao acervo de sua
biblioteca?',
  '[{"id": "a", "texto": "30"}, {"id": "b", "texto": "72"}, {"id": "c", "texto": "180"}, {"id": "d", "texto": "190"}, {"id": "e", "texto": "200"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 19, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q19-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'A numeração dos exames que são feitos pelos clientes
de um laboratório obedece ao seguinte padrão:
primeiramente coloca–se a numeração referente ao
ano com quatro dígitos, seguido do mês com dois
dígitos (01 para janeiro, 02 para fevereiro até 12 para
dezembro) e finalmente o número do exame, com três
dígitos, de acordo com a ordem em que são realizados
no mês, iniciando-se com 001 para o primeiro, 011
para o segundo, 021 para o terceiro, e assim
sucessivamente, sempre acrescentando–se 10 ao
número do exame anterior para gerar o número do
próximo exame. Por exemplo: o primeiro exame
realizado no mês de março do ano 2023, tem como
numeração 2023 03 001. Assim sendo, o vigésimo
exame realizado nesse laboratório no mês de abril de
2023, terá como numeração:',
  '[{"id": "a", "texto": "2023 04 191"}, {"id": "b", "texto": "2023 04 020"}, {"id": "c", "texto": "2023 04 201"}, {"id": "d", "texto": "2023 04 024"}, {"id": "e", "texto": "2023 04 181 FÍSICA"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 20, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q20-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Considere o sistema da figura abaixo. O bloco A e o
bloco B apresentam massas respectivamente de 3𝑘𝑔
e 7𝑘𝑔. O coeficiente de atrito estático entre todas as
superfícies de contato é de 0,4. Qual o módulo da força
𝐹, aplicada ao bloco B, capaz de colocá-lo na iminência
de movimento (dada 𝑔 = 10𝑚/𝑠
)?',
  '[{"id": "a", "texto": "12N"}, {"id": "b", "texto": "28N"}, {"id": "c", "texto": "40N"}, {"id": "d", "texto": "52N"}, {"id": "e", "texto": "60N"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 21, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q21-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Dado um feixe de luz vermelho com comprimento de
onda de 700𝑛𝑚 no ar. Qual o valor do seu
comprimento de onda, em 𝑛𝑚, após ser refratado na
água, onde a velocidade da luz vale 75% do seu valor
no ar?',
  '[{"id": "a", "texto": "525"}, {"id": "b", "texto": "575"}, {"id": "c", "texto": "625"}, {"id": "d", "texto": "675"}, {"id": "e", "texto": "700"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 22, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q22-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Sejam dois fios condutores, paralelos, longos e retos.
Ao serem percorridos por correntes elétricas
contínuas, de mesmo sentido e de intensidades 𝑖1 e 𝑖2,
eles interagem através das forças 𝐹1 e 𝐹2, conforme a
figura.
Sabendo-se que 𝑖1 = 3𝑖2, os módulos de 𝐹1 e 𝐹2 das
forças são tais que:',
  '[{"id": "a", "texto": "𝐹1 = 𝐹2"}, {"id": "b", "texto": "𝐹1 = 3𝐹2"}, {"id": "c", "texto": "𝐹1 = 6𝐹2"}, {"id": "d", "texto": "𝐹1 = 9𝐹2"}, {"id": "e", "texto": "𝐹1 = 12𝐹2"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 23, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q23-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.1-peba-q23-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2024.1-peba-q23-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Física', null, 'Os pneus de uma bicicleta foram calibrados a uma
temperatura de 27 °𝐶. Devido ao atrito e ao contato
com a estrada, houve um aumento de 21°𝐶 .
Desprezando a variação do volume, o aumento
percentual da pressão dos pneus foi de?',
  '[{"id": "a", "texto": "29%"}, {"id": "b", "texto": "28%"}, {"id": "c", "texto": "21%"}, {"id": "d", "texto": "14%"}, {"id": "e", "texto": "7%"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 24, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q24-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Quando completamente mergulhado na água, um
objeto apresenta peso aparente igual a quatro quintos
do seu peso real. O número de vezes que a densidade
média desse objeto é maior que a densidade da água
é:',
  '[{"id": "a", "texto": "1/5"}, {"id": "b", "texto": "4/5"}, {"id": "c", "texto": "2"}, {"id": "d", "texto": "5"}, {"id": "e", "texto": "10 QUÍMICA"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 25, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q25-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.1-peba-q25-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2024.1-peba-q25-3.png", "legenda": null, "ordem": 3}, {"url": "/questoes-facape/2024.1-peba-q25-4.png", "legenda": null, "ordem": 4}, {"url": "/questoes-facape/2024.1-peba-q25-5.png", "legenda": null, "ordem": 5}, {"url": "/questoes-facape/2024.1-peba-q25-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Química', null, 'O ácido pirúvico, também designado por ácido 2–
oxopropanóico, consiste num ácido cetocarboxílico de
fórmula CH3COCOOH. É um composto intermediário
no metabolismo dos carboidratos. Em nosso
organismo, esse composto provém da degradação da
glicose. Sua concentração está correlacionada à
do ácido lático e à da vitamina B1. Abaixo tem–se a
representação das fórmulas dos ácidos citados os
valores de suas constantes de ionização.
Ácido pirúvico
Ka = 3,2.10–3
Ácido lático
Ka = 1,4.10–4
Considerando−se as informações e os conhecimentos
sobre reações químicas, equilíbrios ácido−base e
compostos orgânicos, é CORRETO afirmar:',
  '[{"id": "a", "texto": "O ácido pirúvico é isômero funcional do ácido lático."}, {"id": "b", "texto": "No equilíbrio químico estabelecido durante a ionização do ácido lático sua base conjugada é o íon 2−hidróxi−propanoato."}, {"id": "c", "texto": "A transformação do ácido pirúvico em ácido lático é de substituição."}, {"id": "d", "texto": "O ácido pirúvico é um ácido mais fraco que o ácido lático."}, {"id": "e", "texto": "O ácido lático é o enantiômero do ácido pirúvico."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 26, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q26-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.1-peba-q26-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2024.1-peba-q26-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'O etanol não é um produto encontrado de forma pura
na natureza. Para produzi–lo, é necessário extrair
o álcool de outras substâncias. A forma mais simples
e comum de obtê–lo é através das moléculas de
açúcar, encontradas em vegetais como cana–de–
açúcar, milho, beterraba, batata, trigo e mandioca. O
processo que utiliza essas matérias–primas é chamado
de fermentação, representada abaixo, porém há mais
maneiras de fazer álcool, que consiste em reações
químicas controladas em laboratório.
C6H12O6(aq) → 2H3CCH2OH(aq) + 2CO2(g) + energia
Com base nessas informações e nos conhecimentos
sobre compostos orgânicos, é correto afirmar que:',
  '[{"id": "a", "texto": "Quando o vinho azeda é formado ácido etanóico através da oxidação do etanol."}, {"id": "b", "texto": "O composto C6H12O6 é um poliálcool–cetona."}, {"id": "c", "texto": "O gás carbônico formado apresenta geometria angular."}, {"id": "d", "texto": "O H3CCH2OH pode ser produzido pela desidratação intramolecular do etóxi–etano."}, {"id": "e", "texto": "A reação de fermentação ocorre com absorção de energia."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 27, null, false,
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
  'Química', null, 'As bactérias autotróficas classificam–se em
quimiossintetizantes (retiram energia de compostos
inorgânicos do ambiente) e fotossintetizantes (usam a
energia da luz).
Quanto à necessidade de gás oxigênio nos processos
de obtenção de energia a partir de compostos
orgânicos, as bactérias podem ser aeróbias ou
anaeróbias. Além disso, usam o dióxido de carbono ou
carbonatos como fonte de carbono para sintetizar as
proteínas, enzimas e outros materiais necessários aos
processos biológicos. Na presença de oxigênio,
algumas dessas bactérias, utilizam o sulfeto ferroso
como fonte de energia, de acordo com a equação
química representada abaixo.
4FeS(s) + 9O2(g) + 10H2O(ℓ) →
→ 4Fe(OH)3(s) + 4SO4
2–
(aq) + 8H+(aq) + energia
De acordo com as informações e seus conhecimentos
compostos químicos pode–se afirmar que:',
  '[{"id": "a", "texto": "no processo bioquímico representado a entalpia dos produtos é maior que a dos reagentes."}, {"id": "b", "texto": "o ferro é o único elemento que sofre oxidação."}, {"id": "c", "texto": "a base formada libera íons hidroxila com facilidade em meio aquoso."}, {"id": "d", "texto": "o íon sulfato apresenta geometria tetraédrica."}, {"id": "e", "texto": "o meio formado apresenta pH maior que sete."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 28, null, false,
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
  'Química', null, 'A prata já é um metal bastante conhecido e utilizado na
humanidade, tendo o registro de seu primeiro uso
desde 3000a.C. Ela é bastante utilizada em joias,
talheres, espelhos, objetos decorativos além de várias
outras aplicações. Uma dessas aplicações é a
utilização da prata na Radiologia. A prata se encontra
presente nos filmes radiográficos nos quais a radiação
é projetada. Para evitar o descarte inadequado desse
metal, as chapas dos filmes radiográficos que foram
utilizadas em exames são colocadas em uma cuba de
plástico imersas em uma solução básica de hidróxido
de sódio conforme representado abaixo:
2Ag+(aq) + 2OH–(aq) → Ag2O(s) + H2O(ℓ)
O óxido de prata formado é separado da água e
decomposto formando prata metálica e liberando gás
oxigênio. Com relação aos processos envolvidos,
citados no texto, pode–se afirmar que:',
  '[{"id": "a", "texto": "a reação química representada é de oxirredução."}, {"id": "b", "texto": "a prata é um metal nobre que apresenta baixo potencial padrão de redução."}, {"id": "c", "texto": "o hidróxido de sódio pode ser obtido pela eletrólise ígnea do cloreto de sódio."}, {"id": "d", "texto": "o óxido de prata formado apresenta caráter anfótero."}, {"id": "e", "texto": "o processo de separação de misturas adequado para separar o óxido de prata da água é a filtração a vácuo."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 29, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q29-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2024.1-peba-q29-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'Quando se fala em química, aí vem logo à mente
laboratórios, reações químicas, propriedades da
matéria e fórmulas matemáticas. Mas, na real, vai bem
além de tudo isso. Ela está bem presente no cotidiano
e ainda explica o que acontece na natureza. Assar um
pão ou bolo, respirar, utilizar água sanitária nas roupas,
queimar um combustível ou acender uma vela são
alguns exemplos de fenômenos químicos. Há reações,
mudança de cores, forma. Tudo praticamente envolve
química. Até um beijo.
dopamina (prazer)
serotonina (humor)
Na saúde, pode–se afirmar que, se a química não
existisse, a saúde das pessoas teria os dias contados.
Afinal, como um médico iria receitar um medicamento
se ele não soubesse a sua composição química e os
efeitos que eles podem causar ao doente. Na indústria
de alimentos, utilizam–se técnicas químicas para
conservar ou retardar a decomposição de alimentos.
https://pe.unit.br/blog/noticias/a-quimica-nossa-de-cada-dia/#:~:text=Assar%20um%20p%C
3%A3o%20ou%20bolo,At%C3%A9
%20um%20beijo.
Sobre as propriedades das substâncias químicas
presentes no dia–a–dia, é CORRETO afirmar:
Dados da massa molar dos elementos (g.mol–1): Mg =
24; O = 16 e H = 1.',
  '[{"id": "a", "texto": "Uma suspensão aquosa de hidróxido de magnésio, Mg(OH)2(aq), 0,14mol/L, utilizada como antiácido, possui mais de 8g dessa base em 1 litro de água."}, {"id": "b", "texto": "A dopamina e a serotonina apresentam grupos característicos de funções diferentes."}, {"id": "c", "texto": "Na decomposição de 25g de carbonato de cálcio, CaCO3(s), em condições ideais, são formados 25g de óxidos."}, {"id": "d", "texto": "Na produção de detergente em pó é utilizado carbonato de sódio, Na2CO3(s), um sal de hidrólise neutra."}, {"id": "e", "texto": "Utilizado na fabricação de tecidos para roupa de inverno a poliacrifonitrila, - ―[CH2CH(CN)]n―, é uma fibra natural. BIOLOGIA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 30, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q30-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.1-peba-q30-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Biologia', null, 'A reprodução humana começa com a fecundação de
um ovócito por um espermatozoide. Cada uma dessas
células contém a metade da informação genética, logo
a nova célula, o zigoto, recebe toda a informação
genética necessária para o desenvolvimento de um ser
humano.
(Embriologia Básica. MOORE, K.L;
PERSAUD, T.V.N. 2008.p.10).
Dentro do processo de desenvolvimento do zigoto
NÃO se pode afirmar que:',
  '[{"id": "a", "texto": "é uma célula geneticamente haploide."}, {"id": "b", "texto": "é uma célula geneticamente diploide."}, {"id": "c", "texto": "contém cromossomos e genes derivados da mãe e do pai."}, {"id": "d", "texto": "é uma célula totipotente."}, {"id": "e", "texto": "é uma célula altamente especializada."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 31, null, false,
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
  'Biologia', null, 'Ecossistema, segundo o dicionário do Meio Ambiente
(BARSA, 2009), é unidade da natureza ativa que
combina o conjunto de organismos vivos (fauna, flora
e microorganismos) e o ambiente físico no qual
habitam e com o qual interagem. Nas últimas décadas
os ecossistemas, vêm sofrendo constantemente ações
antrópicas, além das interferências naturais que
acontecem normalmente.
Dicionário BARSA do Meio Ambiente.
Barsa Planeta. Internacional – São
Paulo. 2009.
Dessa forma, leia as afirmativas abaixo e assinale a
alternativa correta relacionada à interferência humana
em ecossistemas naturais.
I. A extensão das terras cultivadas e o crescimento
das cidades têm causado destruição de florestas e
de outros ambientes naturais.
II. A introdução de espécies exóticas, devido a
deslocamentos humanos, é de suma importância
para a disseminação e equilíbrio ambiental das
biodiversidades nativas.
III. A extinção de espécies pode causar desequilíbrio
de um ecossistema devido à expansão da
população humana.
IV. O desmatamento indiscriminado da vegetação
nativa pode levar comunidades e espécies a
extinção.
Estão CORRETAS as afirmativas:',
  '[{"id": "a", "texto": "I, II, III e IV."}, {"id": "b", "texto": "I, III e IV."}, {"id": "c", "texto": "II, III e IV."}, {"id": "d", "texto": "I e II apenas."}, {"id": "e", "texto": "II e IV apenas."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 32, null, false,
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
  'Biologia', null, 'As organelas são miniaturas de órgãos com formas e
funções definidas, que atuam nas células organizando
todos os seres vivos. Algumas organelas são
específicas em determinados tipos de células, agindo
de acordo a necessidade sobre a qual atua. Observe o
desenho ao lado, e assinale a alternativa correta.
Fonte: Manual de Biologia.',
  '[{"id": "a", "texto": "A organela 1 é responsável pelo processo de respiração celular."}, {"id": "b", "texto": "O processo de síntese com a presença de enzimas hidrolíticas sempre ocorre na organela 2."}, {"id": "c", "texto": "O armazenamento e distribuição de enzimas acontece na organela 3."}, {"id": "d", "texto": "A síntese proteica se dá na organela 2 que automaticamente repassa para o armazenamento na organela 1."}, {"id": "e", "texto": "A organela 3 possui DNA próprio e desempenha função energética."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 33, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q33-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Biologia', null, 'A Histologia é o ramo da Biologia que estuda os
tecidos, que por sua vez são formados por células
especializadas em executar funções definidas.
Reconhecendo a importância estrutural e funcional do
corpo e compreendendo as características presentes
no desenvolvimento funcional dos tecidos animais, os
histologistas classificaram os tecidos em quatro
grandes categorias: Epitelial, Conjuntivo, Muscular e
Nervoso.
Pode-se afirmar com relação aos tipos teciduais que:',
  '[{"id": "a", "texto": "o tecido epitelial é formado por células anastomosadas, ricas em vasos sanguíneos."}, {"id": "b", "texto": "o tecido muscular é de origem ectodérmica e sua característica principal está na contratilidade das suas células elásticas."}, {"id": "c", "texto": "o tecido conjuntivo caracteriza-se pela diversidade de funções desenvolvidas pelas suas variedades, suas células são ricas em substâncias e materiais intercelulares."}, {"id": "d", "texto": "o tecido epitelial apresenta-se de forma específica com células bem separadas e avascularizadas."}, {"id": "e", "texto": "o tecido nervoso é altamente especializado, devido ao processo mitótico que as suas células apresentam para se renovarem."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 34, null, false,
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
  'Biologia', null, 'Observe a figuras abaixo e logo em seguida leia as
informações relacionadas as estruturas presentes e
assinale a alternativa CORRETA com relação aos
elementos figurados do sangue.
Fonte: Junqueira e Carneiro, 2018.
Após o processo de centrifugação do sangue, pode-se
observar que:',
  '[{"id": "a", "texto": "as hemácias também chamadas de glóbulos vermelhos ou ainda eritrócitos, realmente são as células encontradas em maior quantidade, exercendo a função de diapedese."}, {"id": "b", "texto": "os leucócitos são as células de defesa contra os invasores do organismo, exercendo também as mesmas funções das hemácias."}, {"id": "c", "texto": "o plasma corresponde ao sobrenadante, que é constituído por 90% de água, onde se encontram dissolvidos proteínas, açúcares, gorduras e sais minerais, elementos nutritivos necessários à vida das células."}, {"id": "d", "texto": "as plaquetas também são sobrenadantes e atuam com nutrientes essenciais do sangue."}, {"id": "e", "texto": "os trombócitos, os eritrócitos e os linfócitos são tipos de leucócitos responsáveis pela defesa do corpo."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 35, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q35-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Biologia', null, 'Uma mulher albina, casa-se com um homem normal
para albinismo, cujo pai era albino e um dos seus
irmãos também albino. Pergunta-se: Quais os possíveis
genótipos do futuro casal?',
  '[{"id": "a", "texto": "Aa X aa"}, {"id": "b", "texto": "Aa X Aa"}, {"id": "c", "texto": "aa X Aa"}, {"id": "d", "texto": "aa X aa"}, {"id": "e", "texto": "AA x aa"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 36, null, false,
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
  'Biologia', null, 'Atualmente, tem se ouvido falar sobre algumas
doenças já esquecidas por uma parte da população, as
chamadas de atenção e alertas para o processo de
vacinação, são constantes, mas até o momento, a
população mundial esquece do compromisso com a
saúde da presente e futura geração. As doenças como
o sarampo, a hanseníase, a AIDS, tuberculose, têm
aumentado e causado mortes e contaminações que
poderiam ser evitadas.
Assinale a alternativa correta que identifica os tipos de
microorganismos que causam as doenças acima
citados, respectivamente:',
  '[{"id": "a", "texto": "vírus, vírus, bactéria e vírus."}, {"id": "b", "texto": "bactéria, vírus, vírus e vírus."}, {"id": "c", "texto": "vírus, vírus, vírus, bactéria."}, {"id": "d", "texto": "bactérias, vírus, bactérias e bactérias."}, {"id": "e", "texto": "vírus, bactéria, vírus, bactéria."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 37, null, false,
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
  'Biologia', null, 'Sobre o DNA foram feitas as seguintes afirmativas:
I. É formado por uma fita dupla em forma de espiral
(dupla hélice), composta por nucleotídeos.
II. A ligação entre as bases complementares da dupla
fita do DNA é feita através de pontes de Hidrogênio.
III. As bases nitrogenadas presentes no DNA, são:
Adenina (A), Uracila (U), Citosina (C) e Guanina (G);
Está CORRETA apenas a alternativa:',
  '[{"id": "a", "texto": "I."}, {"id": "b", "texto": "I e II."}, {"id": "c", "texto": "II."}, {"id": "d", "texto": "II e III."}, {"id": "e", "texto": "I e III."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 39, null, false,
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
  'Biologia', null, 'As ações antrópicas são consideradas as causas mais
importantes do declínio da biodiversidade em todo o
mundo. Isso também é verdade para a Caatinga, o
ecossistema menos estudado e menos protegido do
Brasil. Dentro desse contexto, leia as afirmativas abaixo
sobre as características da Caatinga e assinale a
alternativa CORRETA:
I. A caatinga é um ecossistema rico em
biodiversidades endêmicas, e nessas últimas
décadas vem sofrendo com o declínio da
biodiversidade em geral.
II. A caatinga por ser um bioma menos estudado e o
mais agredido com relação aos demais biomas,
torna-se assim menos importante e invisível
socioambientalmente.
III.A caatinga apresenta vegetação dentro do seu
aspecto biogeográfico de natureza xerófilas.
IV.A caatinga é caracterizada por apresentar árvores
com tronco retorcidos, de cascas espessas e folhas
coriáceas em área de índice pluviométricos entre
1.100 e 2.000mm por ano.
Estão CORRETAS as afirmativas:',
  '[{"id": "a", "texto": "I, II, III e IV."}, {"id": "b", "texto": "I, II e IV."}, {"id": "c", "texto": "I e IV."}, {"id": "d", "texto": "I, II e III."}, {"id": "e", "texto": "III e IV. HISTÓRIA"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 40, null, false,
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
  'História', null, 'Fundada em 1949, a Organização do Tratado do
Atlântico Norte (OTAN) passou por uma fase de
ampliação a partir da década de 1990, conforme
ilustrado no mapa. No momento atual, a OTAN conta
com 31 países membros.
No contexto das relações internacionais, esse
processo de ampliação ocorre devido ao seguinte
cenário:',
  '[{"id": "a", "texto": "ascensão da China"}, {"id": "b", "texto": "persistência da Guerra Fria"}, {"id": "c", "texto": "colapso da União Soviética"}, {"id": "d", "texto": "estabelecimento da multipolaridade"}, {"id": "e", "texto": "ataque Russo na Ucrânia"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 41, null, false,
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
  'História', null, 'AGROPECUÁRIA, CONSTRUÇÃO CIVIL E CARVOARIAS
SÃO AS MAIORES FONTES DO TRABALHO ANÁLOGO À
ESCRAVIDÃO
Trabalhador agropecuário em geral, servente de obras,
pedreiro e carvoeiro. O que aproxima essas
atividades? Elas são as ocupações mais comuns entre
as vítimas de trabalho análogo à escravidão resgatadas
no Brasil no período de 2003 a 2020, apontam dados
compilados pelo Observatório da Erradicação do
Trabalho Escravo e do Tráfico de Pessoas. Ainda
segundo o Observatório, de 1995 a 2020, foram
encontrados, no país, 55712 trabalhadores em
condições análogas às de escravo.
De acordo com a juíza Mirella Cahú, o trabalho análogo
ao escravo é crime tipificado no artigo 149 do Código
Penal e é “definido como aquele em que seres
humanos estão submetidos a trabalhos forçados,
jornadas tão intensas que podem causar danos físicos,
condições degradantes e restrição de locomoção em
razão de dívida contraída com empregador ou
preposto. A pena se agrava quando o crime for
cometido contra criança ou adolescente ou por motivo
de preconceito de raça, cor, etnia, religião ou origem”,
explicou.
Para a juíza, na figura do trabalho escravo
contemporâneo, o indivíduo permanece com
liberdade, mas, por circunstâncias decorrentes do
próprio trabalho, essa liberdade é relativizada, ficando
o indivíduo impossibilitado de exercer seu direito.
As características fundamentais das relações de
produção no Brasil são responsáveis pela existência do
chamado "trabalho escravo contemporâneo" e pela
sua prevalência em certos setores econômicos,
conforme mencionado na matéria.
Disponível em: https://www.trt13.jus.br
Um desses elementos estruturais é:',
  '[{"id": "a", "texto": "aumento das jornadas de trabalho com horas extras."}, {"id": "b", "texto": "desvalorização do trabalho manual."}, {"id": "c", "texto": "falta de aumento nos salários ao longo do tempo."}, {"id": "d", "texto": "inflexibilidade das regras contratuais."}, {"id": "e", "texto": "informalidade nas atividades profissionais."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 42, null, false,
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
  'História', null, 'As capitanias hereditárias no Brasil concederam vastos
territórios a nobres e fidalgos para a exploração
econômica.
Sobre a ocupação territorial e o processo colonial
português no Brasil, analise as afirmações a seguir.
I. As capitanias hereditárias representaram grandes
áreas distribuídas pela coroa portuguesa, cuja
atividade econômica central era a agromanufatura.
II. Os capitães-donatários tinham a autorização, em
nome da coroa, para exercer a justiça, comandar as
forças militares, recrutar colonos, estabelecer
milícias e explorar o trabalho dos indígenas.
III. Através da implementação das capitanias
hereditárias, a coroa portuguesa abdicou de seu
controle sobre o território, descentralizando
totalmente seus poderes governamentais aos
capitães-donatários.
Quais estão CORRETAS?',
  '[{"id": "a", "texto": "Apenas I."}, {"id": "b", "texto": "Apenas II."}, {"id": "c", "texto": "Apenas III."}, {"id": "d", "texto": "Apenas I e II."}, {"id": "e", "texto": "I, II e III."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 43, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q43-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'História', null, 'Nenhuma área do Brasil experimentou com mais
intensidade a chegada da Corte do que o Rio de
Janeiro, que havia se tornado a sede do vice-reinado
desde 1763 e foi selecionada para ser a capital
temporária do Império luso-brasileiro. A título de
ilustração, a população aumentou de 70.000
residentes em 1808 para 112.000 em 1821, quando a
família real retornou a Portugal.
MALERBA, Jurandir. O Brasil
Imperial (1808-1889): Panorama da
História do Brasil no século XIX.
Maringá: Eduem, 1992, p. 9.
Com a chegada da família real portuguesa ao Brasil,
ocorreram diversas transformações que deixaram sua
marca na sociedade da época. Assinale a alternativa
que identifica uma dessas mudanças de maneira
precisa.',
  '[{"id": "a", "texto": "A abertura dos portos, com a França como única nação a ser favorecida."}, {"id": "b", "texto": "Promulgação da Lei Áurea, encerrando o sistema de escravidão na região."}, {"id": "c", "texto": "Confisco e desapropriação de várias propriedades para abrigar a corte."}, {"id": "d", "texto": "Diminuição nos preços dos aluguéis devido à grande disponibilidade de imóveis."}, {"id": "e", "texto": "Conquista da autonomia política do Brasil em relação a Portugal."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 44, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q44-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.1-peba-q44-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'História', null, 'Fundada durante a administração de Getúlio Vargas
(1950-1954), em um cenário de debates e
mobilizações fervorosas relacionados à campanha "O
petróleo é nosso", a Petrobras se associou, naquela
época, à promoção do "bandeira nacionalista", como
evidenciado no cartaz.
No que concerne à exploração do petróleo, essa
promoção se refletiu na seguinte atribuição da
empresa.',
  '[{"id": "a", "texto": "Controle estatal exclusivo da extração, refinamento e transporte."}, {"id": "b", "texto": "Fiscalização tributária da produção, matérias-primas e tributos."}, {"id": "c", "texto": "Regulação institucional da distribuição, importação e exportação."}, {"id": "d", "texto": "Gestão administrativa da força de trabalho, capacitação e subcontratação."}, {"id": "e", "texto": "Domínio absoluto das operações de marketing, publicidade e patrocínio. GEOGRAFIA"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 45, null, false,
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
  'Geografia', null, 'Apesar de o deserto ser um fenômeno natural, sua área
vem crescendo nas últimas décadas por causa da ação
humana. É o caso, por exemplo, do forte
desmatamento em regiões vizinhas, especialmente ao
sul do Saara, com o estabelecimento de atividades
agrárias inadequadas para conter essa expansão do
deserto, como criações extensivas e monoculturas
voltadas para a exportação.
ARACY LEAL... [et all]. Ensino
Fundamental 8º ano - - 2. Ed. São
Paulo: SOMOS Sistemas de Ensino,
220.
Tal fenômeno, é discutido como um problema, sendo
este:',
  '[{"id": "a", "texto": "desertificação."}, {"id": "b", "texto": "gentrificação."}, {"id": "c", "texto": "segregação."}, {"id": "d", "texto": "sazonalidade;"}, {"id": "e", "texto": "transumância."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 46, null, false,
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
  'Geografia', null, 'O esboço de uma “captura” da subjetividade do
trabalhador, que foi sistematizado com o toyotismo, já
estava presente em Ford na medida em que “se um
operário deseja progredir e conseguir alguma coisa, o
apito será um sinal para que comece a repassar no
espírito o trabalho feito a fim de descobrir meios de
aperfeiçoá-lo”.
BATISTA, E. “Fordismo, taylorismo e toyotismo:
apontamentos sobre suas rupturas e continuidades.
(FORD, 1967: 41)
De acordo com o texto, na primeira metade do século
XX, o capitalismo produziu um novo espaço da
produção que está relacionada com a:',
  '[{"id": "a", "texto": "passagem do sistema de produção artesanal para o sistema de produção fabril, concentrando-se, principalmente, na produção têxtil destinada ao mercado interno."}, {"id": "b", "texto": "preocupação de uma organização descentralizada da produção e redução dos níveis hierárquicos."}, {"id": "c", "texto": "racionalização do desperdício, que era formentado nas ideias de Taylor, sob princípios e leis “científicas” da produção e consumo."}, {"id": "d", "texto": "constituição de uma classe de assalariados, que possuíam como fonte de subsistência a venda de sua força de trabalho e que lutavam pela melhoria das condições de trabalho nas fábricas."}, {"id": "e", "texto": "técnica de produção fordista que instituiu a homogeneização do trabalho. TEXTO I A chegada dos portugueses ao Brasil representada com humor em charge da cartunista Laerte, 2002. TEXTO II A “expressão América Latina” foi criada pelos Franceses, quando o então imperador Napoleão III almejava expandir seus domínios para essa parte do planeta. Por esse motivo, a América Latina, também pode ser chamada de América Ibérica. Como dito por Eduardo Galeno, um grande jornalista e ensaista político uruguaio: “A América Latina foi inventada”. GALEANO, E. H. As veias abertas da América Latina/tradução de Sergio Faraco. Rio Grande do Sul: L&PM, 2019. (Adaptado)"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 47, null, false,
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
  'Geografia', null, 'De acordo com os textos acima, a formação territorial
da América Latina se deu pela:',
  '[{"id": "a", "texto": "concentração de renda."}, {"id": "b", "texto": "desapropriação de latifúndios."}, {"id": "c", "texto": "concentração fundiária."}, {"id": "d", "texto": "reparação da aculturação."}, {"id": "e", "texto": "promoção cultural dos povos tradicionais."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 48, null, false,
  '[{"url": "/questoes-facape/2024.1-peba-q48-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.1-peba-q48-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'Geografia', null, 'Guerras do Brasil. Doc: série de documentários.
Produção NETFLIX. São Paulo, 2019.
Os três países: Paraguai, Argentina e Uruguai -, são
banhados pelos rios formadores da bacia do Prata.
Durante grande parte do período da colonização
espanhola, esses países fizeram parte de uma única
administração.
Os países citados acima, correspondem a?',
  '[{"id": "a", "texto": "América Andina."}, {"id": "b", "texto": "América Anglo-Saxônica."}, {"id": "c", "texto": "América Central."}, {"id": "d", "texto": "América Platina."}, {"id": "e", "texto": "América das Guianas."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 49, null, false,
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
  'Geografia', null, 'TEXTO I
TEXTO II
A taxa de desemprego ficou estável no trimestre
encerrado em novembro, em 14,1%, mantendo-se no
patamar recorde de 14 milhões de pessoas, segundo
dados da Pnad Contínua (Pesquisa Nacional por
Amostra de Domicílios), divulgados nesta quinta (28)
pelo IBGE (Instituto Brasileiro de Geografia e
Estatística). A população ocupada aumentou 4,7% nos
três meses até novembro e chegou a 85,6 milhões de
pessoas, um incremento de 3,9 milhões ante o
trimestre anterior. Esse avanço é o maior de toda a
série histórica, segundo a analista da Pnad, Adriana
Beringuy. O crescimento foi puxado principalmente
pela informalidade, que está em 39,1%. […] Entre os
informais, o número de trabalhadores sem carteira
assinada cresceu 11,2% no trimestre e chegou a 9,7
milhões de pessoas. Somadas todas as categorias de
informais, que incluem os domésticos, trabalhadores
por conta própria sem CNPJ e os familiares, 33,5
milhões de pessoas estão na informalidade.
Fonte:
https://www1.folha.uol.com.br/merc
ado/ 2021/01/trabalho-informal-cresce-mas- taxa-de-desemprego-segue-em-141.shtml
Nos textos acima, há uma problemática discutida na
contemporaneidade, reflexo do avanço tecnológico e
do neoliberalismo, que impacta as relações
trabalhistas. Este fenômeno é nomeado pela geografia
de:',
  '[{"id": "a", "texto": "capitalização."}, {"id": "b", "texto": "regionofilia."}, {"id": "c", "texto": "aporofobia."}, {"id": "d", "texto": "uberização."}, {"id": "e", "texto": "racionalização."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.1 - Rede PEBA/Bolsistas',
  '2024.1-peba', 'FACAPE 2024.1 - Rede PEBA/Bolsistas', 2024, 1,
  'peba', 50, null, false,
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
