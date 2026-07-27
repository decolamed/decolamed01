-- ============================================================================
-- DECOLA MED — SEED: FACAPE 2026.1 - Rede PEBA/Bolsistas
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
  'Português', null, '“Sarcopenia é uma doença musculoesquelética
em que ocorre a redução da força, desempenho
e massa muscular, causando sintomas como
fraqueza muscular, perda do equilíbrio e do
desempenho físico para realizar atividades, como
caminhar, subir escadas ou se levantar da cama.
A sarcopenia é mais comum após os 50 anos, o
período onde há maior redução da quantidade e
tamanho das fibras musculares, diminuição da
produção de hormônios, como estrogênio e
testosterona, além da redução da prática de
atividade física. Para recuperar os músculos, é
importante evitar o sedentarismo e praticar
atividades físicas como musculação e
caminhada, além de manter uma alimentação
rica em proteínas, vitaminas e minerais,
priorizando carnes magras, leite e derivados e
vegetais, como soja, lentilha e quinoa.”
Disponível em:
https://www.tuasaude.com (adaptado)
Sobre o texto, constata-se que:',
  '[{"id": "a", "texto": "no trecho “Para recuperar os músculos, é importante evitar o sedentarismo e praticar atividades físicas como musculação e caminhada...”, a oração “Para recuperar os músculos...” expressa ideia de finalidade."}, {"id": "b", "texto": "o fragmento “...causando sintomas como fraqueza muscular, perda do equilíbrio e do desempenho físico para realizar atividades, como caminhar, subir escadas ou se levantar da cama.” divide opiniões dos especialistas sobre “sarcopenia”."}, {"id": "c", "texto": "o emprego das palavras “estrogênio” e “testosterona” no período “A sarcopenia é mais comum após os 50 anos, o período onde há maior redução da quantidade e tamanho das fibras musculares, diminuição da produção de hormônios, como estrogênio e testosterona, além da redução da prática de atividade física.” enumera as causas provocadas pela doença em pessoas com mais de cinquenta anos."}, {"id": "d", "texto": "o substantivo “desempenho” em “Sarcopenia é uma doença musculoesquelética em que ocorre a redução da força, desempenho e massa muscular...” é a palavra que mais evidencia o conceito de “sarcopenia”."}, {"id": "e", "texto": "as palavras “soja”, “lentilha” e “quinoa” em “...além de manter uma alimentação rica em proteínas, vitaminas e minerais, priorizando carnes magras, leite e derivados e vegetais, como soja, lentilha e quinoa.” foram empregadas para sensibilizar os jovens para que não percam o equilíbrio e a diminuição da produção de hormônios."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Português', null, 'Disponível em: https://portalemfoco.com.br
O objetivo da campanha sobre o Dia do Médico
acima é:',
  '[{"id": "a", "texto": "informar sobre a importância do médico cardiologista na prevenção de doenças cardiovasculares."}, {"id": "b", "texto": "evidenciar o ponto de exclamação como o principal objetivo da mensagem."}, {"id": "c", "texto": "refletir acerca das expectativas na relação entre médico e pacientes depressivos."}, {"id": "d", "texto": "reconhecer a importância de quem escolheu a medicina como missão de vida."}, {"id": "e", "texto": "defender os direitos dos médicos e a qualidade da assistência à saúde."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 2, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q02-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Português', null, '"Diabete é uma doença causada pela produção
insuficiente ou má absorção de insulina,
hormônio que regula a glicose no sangue e
garante energia para o organismo. A insulina é
um hormônio que tem a função de quebrar as
moléculas de glicose (açúcar), transformando-a
em energia para manutenção das células do
nosso organismo. O diabete pode causar o
aumento da glicemia e as altas taxas podem
levar a complicações no coração, nas artérias,
nos olhos, nos rins e nos nervos. Em casos mais
graves, o diabetes pode levar à morte.
De acordo com a Sociedade Brasileira de
Diabetes, existem atualmente, no Brasil, mais de
13 milhões de pessoas vivendo com a doença, o
que representa 6,9% da população nacional. A
melhor forma de prevenir é praticando atividades
físicas regularmente, mantendo uma alimentação
saudável e evitando consumo de álcool, tabaco e
outras drogas. Comportamentos saudáveis
evitam não apenas o diabetes, mas outras
doenças crônicas, como o câncer.”
Disponível em: https://www.gov.br
(adaptado)
De acordo com a leitura do texto acima, pode-se
afirmar que:',
  '[{"id": "a", "texto": "a mudança de humor é o principal sintoma que resulta em números crescentes de pacientes diagnosticados com diabetes."}, {"id": "b", "texto": "no período “O diabete pode causar o aumento da glicemia e as altas taxas podem levar a complicações no coração, nas artérias, nos olhos, nos rins e nos nervos. Em casos mais graves, o diabetes pode levar à morte.”, os substantivos “glicemia” e “complicações” estabelecem com as palavras a que se referem uma relação de concordância verbal."}, {"id": "c", "texto": "no período “Comportamentos saudáveis evitam não apenas o diabetes, mas outras doenças crônicas, como o câncer.”, o emprego da palavra “câncer” causa um forte impacto na vida social para as pessoas que convivem com diabetes."}, {"id": "d", "texto": "no período “A melhor forma de prevenir é praticando atividades físicas regularmente, mantendo uma alimentação saudável e evitando consumo de álcool, tabaco e outras drogas.”, o termo “uma alimentação saudável” estabelece com “mantendo” uma relação de concordância nominal."}, {"id": "e", "texto": "no período “De acordo com a Sociedade Brasileira de Diabetes, existem atualmente, no Brasil, mais de 13 milhões de pessoas vivendo com a doença, o que representa 6,9% da população nacional.”, o recurso linguístico “De acordo com” é um elemento de articulação da sequência do texto que expressa conformidade."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Português', null, '“A síndrome do intestino irritável (SII) faz parte
de um grupo maior de distúrbios gastrointestinais
funcionais (DGIFs), que apresentam diferentes
localizações corporais e padrões de sintomas,
mas que compartilham distúrbios na regulação
das vias periféricas, espinhais e centrais que não
são completamente compreendidos. Pacientes
com SII sofrem de um distúrbio gastrointestinal
(GI) crônico caracterizado por dor abdominal
recorrente associada a hábitos intestinais
alterados, sem anormalidades estruturais óbvias
observadas na endoscopia ou raio-X. A
prevalência é alta, afetando até 20% dos adultos.
Quando de intensidade moderada a grave, os
pacientes sofrem com dor ou desconforto
intensos, hábitos intestinais anormais, qualidade
de vida relacionada à saúde (QVRS) prejudicada
e incapacidade. Isso pode levar a alto
absenteísmo no trabalho, consultas médicas e
custos com assistência médica.”
Disponível em: https://www.jnmjournal.org
(adaptado)
Sobre o texto, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "no trecho “A síndrome do intestino irritável (SII) faz parte de um grupo maior de distúrbios gastrointestinais funcionais (DGIFs) que apresentam diferentes localizações corporais e padrões de sintomas...”, as palavras “irritável” e “gastrointestinais” indicam que o tratamento da síndrome consiste em manejo dietético e tratamento através de medicamentos."}, {"id": "b", "texto": "no período “Isso pode levar a alto absenteísmo no trabalho, consultas médicas e custos com assistência médica.”, o demonstrativo “Isso” faz referência a uma informação mencionada anteriormente."}, {"id": "c", "texto": "no período “Pacientes com SII sofrem de um distúrbio gastrointestinal (GI) crônico caracterizado por dor abdominal recorrente associada a hábitos intestinais alterados, sem anormalidades estruturais óbvias observadas na endoscopia ou raio-X.”, o termo “hábitos intestinais alterados” expressa valor circunstancial de intensidade."}, {"id": "d", "texto": "no período “A prevalência é alta, afetando até 20% dos adultos. Quando de intensidade moderada a grave, os pacientes sofrem com dor ou desconforto intensos, hábitos intestinais anormais, qualidade de vida relacionada à saúde (QVRS) prejudicada e incapacidade.”, a forma verbal “afetando” expressa uma ação concluída."}, {"id": "e", "texto": "no trecho “...mas que compartilham distúrbios na regulação das vias periféricas, espinhais e centrais que não são completamente compreendidos.”, o conectivo “mas” inicia uma sequência que reforça a ideia de conclusão."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Português', null, 'Disponível em: https://www.biosanas.com.br
A expressão “de medula óssea” exerce, do ponto
de vista sintático, a função de:',
  '[{"id": "a", "texto": "objeto indireto."}, {"id": "b", "texto": "complemento nominal."}, {"id": "c", "texto": "adjunto adverbial de causa."}, {"id": "d", "texto": "adjunto adverbial de modo."}, {"id": "e", "texto": "adjunto adverbial de finalidade."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 5, null, false,
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
  'Português', null, '“O transtorno bipolar do humor (TB) era
antigamente denominado de psicose maníaco-depressiva. Esta nomenclatura deixou de ser
utilizada nas classificações atuais porque este
transtorno não apresenta necessariamente
sintomas psicóticos. A principal característica do
TB são os episódios de aceleração psicomotora
e humor eufórico. A fase depressiva não é
obrigatória para o diagnóstico, apesar de muito
frequente. O TB caracteriza-se por oscilações
importantes do humor entre os polos da
exaltação (tecnicamente denominada de
“mania”) e depressão, apresenta curso
recorrente e crônico, implicando em elevado
grau de morbidade e incapacidade para os
indivíduos. Atinge em torno de 2% da população
ao longo da vida.”
Disponível em: https://www.anm.org.br/
(adaptado)
A partir da leitura do texto acima, assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "O propósito comunicativo do texto é divulgar novos sintomas sobre transtorno bipolar do humor."}, {"id": "b", "texto": "O texto contém várias passagens empregadas no sentido figurado."}, {"id": "c", "texto": "No parágrafo “A fase depressiva não é obrigatória para o diagnóstico, apesar de muito frequente.”, a expressão “apesar de” pode ser substituída, sem perda do sentido expresso no texto, por embora."}, {"id": "d", "texto": "parágrafo “A principal característica do TB são os episódios de aceleração psicomotora e humor eufórico.” indica a necessidade de capacitação dos especialistas."}, {"id": "e", "texto": "O parágrafo “O TB caracteriza-se por oscilações importantes do humor entre os polos da exaltação (tecnicamente denominada de “mania”) e depressão, apresenta curso recorrente e crônico, implicando em elevado grau de morbidade e incapacidade para os indivíduos. Atinge em torno de 2% da população ao longo da vida.” é um alerta para os especialistas diagnosticarem com precisão o transtorno bipolar em adolescentes."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Português', null, 'O Transtorno Obsessivo-Compulsivo (TOC) é
uma ansiedade crônica que provoca
pensamentos e rituais repetitivos que a pessoa
não pode controlar. Esses pensamentos que se
repetem e persistem geram sensação de medo
ou de desconforto muito grande, que a obriga a
repetir determinados rituais para aliviar a
ansiedade. O Transtorno, costuma surgir durante
a adolescência ou mesmo na infância, mas,
normalmente só é devidamente diagnosticado na
vida adulta, pode ser o mais incapacitante dos
tipos de ansiedade, pois, a mente é atormentada
por repetir as obsessões – pensamentos, ideias e
imagens que invadem a pessoa insistentemente,
sem que ela queira, provocando alterações na
maneira de pensar, no comportamento, nas
emoções e que pode interferir no desempenho
das atividades rotineiras prejudicando muito a
qualidade de vida, carreira e vida social dos
indivíduos acometidos. A origem do TOC não
está bem esclarecida, porém, certamente, trata-se de um problema com várias causas. Estudos
sugerem que ocorram alterações na
comunicação entre determinadas zonas
cerebrais, mas fatores psicológicos e histórico
familiar também estão entre as possíveis causas.
Disponível em:
https://bvsms.saude.gov.br (adaptado)
Sobre os aspectos linguísticos do texto acima, é
CORRETO afirmar que:',
  '[{"id": "a", "texto": "é bastante perceptível, em vários parágrafos do texto, que há incoerência entre as ideias."}, {"id": "b", "texto": "o emprego da palavra “esclarecida” no período “A origem do TOC não está bem esclarecida, porém, certamente, trata-se de um problema com várias causas.” destaca a importância do principal sintoma do TOC."}, {"id": "c", "texto": "no período “Esses pensamentos que se repetem e persistem geram sensação de medo ou de desconforto muito grande, que a obriga a repetir determinados rituais para aliviar a ansiedade.”, a sequência “...para aliviar a ansiedade.” expressa valor de consequência."}, {"id": "d", "texto": "a forma verbal “provoca” no parágrafo “O Transtorno Obsessivo-Compulsivo (TOC) é uma ansiedade crônica que provoca pensamentos e rituais repetitivos que a pessoa não pode controlar.” foi empregada no modo indicativo."}, {"id": "e", "texto": "no período “Estudos sugerem que ocorram alterações na comunicação entre determinadas zonas cerebrais, mas fatores psicológicos e histórico familiar também estão entre as possíveis causas.”, a palavra “também é um elemento de referência temporal."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 7, null, false,
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
  'Português', null, '“Digo: outro mês, outro longe – na Aroeirinha
fizemos paragem. Ao que, num portal, vi uma
mulher moça, vestida de vermelho, se ria. – “Ô
moço da barba feita...” – ela falou. Na frente da
boca, ela quando ria tinha os todos dentes,
mostrava em fio. Tão bonita, só. Eu apeei e
amarrei o animal num pau da cerca. Pelo dentro,
minhas pernas doíam, por tanto que desses três
dias a gente se sustava de custoso varar:
circunstância de trinta léguas. Diadorim não
estava perto, para me reprovar. De repente,
passaram, aos galopes e gritos, uns
companheiros, que tocavam um boi preto que
iam sangrar e carnear em beira d’água. Eu nem
tinha começado a conversar com aquela moça, e
a poeira forte que deu no ar ajuntou nós dois,
num grosso rojo avermelhado. Então eu entrei,
tomei um café coado por mão de mulher, tomei
refresco, limonada de pera-do-campo. Se
chamava Nhorinhá.”
O trecho, transcrito acima, faz parte da obra:',
  '[{"id": "a", "texto": "“Grande Sertão: Veredas”."}, {"id": "b", "texto": "“Os Homens de Barro”."}, {"id": "c", "texto": "“Terras do Sem-Fim”."}, {"id": "d", "texto": "“A Moreninha”."}, {"id": "e", "texto": "“Vidas Secas”."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 8, null, false,
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
  'Português', null, 'Sobre a obra “Terras do Sem-Fim” de Jorge
Amado, conclui-se que:',
  '[{"id": "a", "texto": "é uma novela que narra episódios dramáticos."}, {"id": "b", "texto": "é um romance que tem como cenário os grandes latifúndios e os anos dourados do cacau e dos coronéis da região de Ilhéus no sul da Bahia."}, {"id": "c", "texto": "é um conto cujo tema é o conflito de terras que reflete uma visão determinista da existência humana."}, {"id": "d", "texto": "é uma crônica que aborda as questões agrárias seculares no contexto do ciclo do cacau, revelando o pensamento moderno com a clareza racional."}, {"id": "e", "texto": "é uma peça teatral que satiriza os latifundiários do recôncavo baiano."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
obra “Os Homens de Barro”.',
  '[{"id": "a", "texto": "“A mulher não é inferior nem superior ao homem. é diferente. No dia em que compreendermos isso a fundo, muitos mal-entendidos desaparecerão da face da terra.”."}, {"id": "b", "texto": "“Durante anos e anos haviam-se encontrado todos os dias, haviam estado juntos todas as noites, com ou sem dinheiro, fartos de bem comer ou morrendo de fome, dividindo a bebida, juntos na alegria e na tristeza.”."}, {"id": "c", "texto": "“A beleza não está nem na luz da manhã nem na sombra da noite, está no crepúsculo, nesse meio tom, nessa incerteza.”."}, {"id": "d", "texto": "“O meu fim evidente era atar as duas pontas da vida, e restaurar na velhice a adolescência. Pois, senhor, não consegui recompor o que foi nem o que fui. Em tudo, se o rosto é igual, a fisionomia é diferente.”."}, {"id": "e", "texto": "“Ouça o que estou lhe dizendo, homem! Eu não acredito em nenhuma dessas histórias, mas você sabe como é o pessoal da rua: o Povo continua a achar que você é um Santo; mas os outros acreditam no crime e no pecado. Principalmente por causa de todas as mortes que aconteceram nestas Pedras!”."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 10, null, false,
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
  'Inglês', null, 'A gramática enfatiza a necessidade de se
conhecer as classes gramaticais de palavras
para saber usá-las adequadamente e para
montar frases de acordo com as regras da
norma culta.
Seguindo esse pressuposto, nas frases “Your
bike is blue. Mine is black.” as palavras em
negrito são, respectivamente:',
  '[{"id": "a", "texto": "pronome possessivo adjetivo e um pronome possessivo substantivado."}, {"id": "b", "texto": "interjeição e um pronome possessivo."}, {"id": "c", "texto": "um pronome possesivo, um adjetivo."}, {"id": "d", "texto": "numeral e verbo."}, {"id": "e", "texto": "pronome indefinido adjetivo e substantivo."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Inglês', null, 'Entender um texto em uma segunda língua é útil
e presume-se, prazeroso. Os sites em língua
inglesa são ricos em informação sobre todos os
aspectos inerentes à vida. A ‘AP NEWS’ fornece
a seguinte informação.
“The hastily arranged Alaska summit produced
nothing for Mr. Trump and gave Mr. Putin most of
what he was looking for,” said Laurie Bristow, a
former British ambassador to Russia.”
https://apnews.com/article/russia-ukraine-war-putin-trump-alaska
Segundo o excerto acima, do site AP NEWS, a
cúpula entre Trump e Putin no Alaska em 15 de
agosto de 2025:',
  '[{"id": "a", "texto": "foi maravilhosa para os dois presidentes."}, {"id": "b", "texto": "foi benéfica para Putin e inalterável para Trump."}, {"id": "c", "texto": "foi positiva para Putin e melhor para Trump."}, {"id": "d", "texto": "aconteceu em um estado Russo."}, {"id": "e", "texto": "Laurie Bristow é professora de comércio exterior da Inglaterra."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Inglês', null, 'O FDA – The Food and Drug Administration - é a
agência do Departamento de Saúde e Serviços
Humanos dos Estados Unidos responsável pela
produção e promoção da saúde pública daquele
país.
Leia o excerto abaixo sobre a decisão da FDA e
escolha a alternativa CORRETA quanto a
informação do site health.harvard.
It''s official: the FDA has approved the first blood
test to check for signs of colorectal cancer. The
approval came late in July 2024, for a blood test
called Shield.
https://www.health.harvard.edu/staying-healthy
De acordo com a informação acima, a agência
‘The Food and Drug Administration’ dos Estados
Unidos:',
  '[{"id": "a", "texto": "melhorou um teste de sangue já usado anteriormente."}, {"id": "b", "texto": "juntou esse teste de sangue aos exames colorretais já tradicionais para facilitar a vida dos médicos e pacientes."}, {"id": "c", "texto": "a FDA – The Food and Drug administration - assentiu com o primeiro teste de sangue para sinais de câncer colorretal."}, {"id": "d", "texto": "‘The Food and Drug Administration” e a Universidade de Harvard são parceiras em pesquisa."}, {"id": "e", "texto": "‘to check’, na primeira linha, é adjetivo ligado ao substantivo ‘test’."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Inglês', null, 'A classe gramatical que remete a ideia de
quantidade de seres e coisas chama-se numeral.
Ela é uma das dez classes gramaticais existentes
na língua inglesa e portuguesa. Saber identificar
o significado de cada palavra e a classe à qual
ela pertence, facilita a vida das pessoas.
assinale, nas alternativas abaixo, as palavras que
são numerais.',
  '[{"id": "a", "texto": "Clownfish, dogs, cats and balls."}, {"id": "b", "texto": "To be, to give, to see and to love."}, {"id": "c", "texto": "Tenth, first, third, and fourth."}, {"id": "d", "texto": "Loveable, correct, fair and loyal."}, {"id": "e", "texto": "Hapiness, kindness, trustworthiness and darkness."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 14, 'ingles', false,
  '[{"url": "/questoes-facape/2026.1-peba-q14-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Inglês', null, 'The most important skill a student can learn
is critical thinking, according with the site
Indeed.com. It allows them to analyze
information, solve problems effectively, and make
informed decisions, which are essential for
academic and professional success.
Por que o pensamento crítico é a habilidade mais
importante que o aluno pode aprender?',
  '[{"id": "a", "texto": "Porque esse conhecimento pode ser passado de geração em geração."}, {"id": "b", "texto": "Porque pode analisar informações úteis e assuntos banais."}, {"id": "c", "texto": "Porque tem como objetivo estudar informações dadas por professores laureados que ajudam às pessoas a tomarem decisões adequadas."}, {"id": "d", "texto": "Porque pode aprender ciências exatas e humanas de forma dinâmica."}, {"id": "e", "texto": "Porque tem a finalidade de analisar informações, resolver problemas de forma efetiva e fazer escolhas baseadas em informações."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Espanhol', null, 'TEXTO PARA AS QUESTÕES 11 A 13.
“Miles de personas atraviesan fronteras cada
año, empujadas por guerras, crisis económicas o
desastres ambientales. Para algunos países, esos
migrantes representan una amenaza: se les
acusa de competir por empleos, de alterar la
identidad nacional o de sobrecargar los servicios
públicos. Sin embargo, múltiples estudios
muestran que la llegada de migrantes también
significa dinamismo económico, diversidad
cultural y rejuvenecimiento de sociedades
envejecidas. El choque surge cuando la política
se limita a cifras y no considera las historias
individuales: cada migrante lleva consigo una
memoria, una lengua y una esperanza de
reconstrucción. La pregunta no es solo cuántos
llegan, sino cómo serán recibidos y qué espacios
tendrán para integrarse sin perder su dignidad.”
De acordo com o texto, o principal desafio
apontado em relação às migrações está em:',
  '[{"id": "a", "texto": "reduzir drasticamente o número de migrantes aceitos por cada país."}, {"id": "b", "texto": "equilibrar a integração social sem comprometer a dignidade dos migrantes."}, {"id": "c", "texto": "impedir que migrantes mantenham sua língua e memória cultural."}, {"id": "d", "texto": "proibir que os migrantes participem do mercado de trabalho formal."}, {"id": "e", "texto": "adotar políticas que privilegiem apenas refugiados de origem europeia."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Espanhol', null, '“Para algunos países, esos migrantes
representan una amenaza: se les acusa de
competir por empleos, de alterar la identidad
nacional o de sobrecargar los servicios
públicos.”
No fragmento destacado, os pronomes “se” e
“les” exercem, respectivamente, quais funções
gramaticais?',
  '[{"id": "a", "texto": "“se” = pronome reflexivo; “les” = objeto direto plural."}, {"id": "b", "texto": "“se” = pronome passivo; “les” = sujeito da oração."}, {"id": "c", "texto": "“se” = pronome recíproco; “les” = sujeito plural."}, {"id": "d", "texto": "“se” = partícula enfática; “les” = complemento circunstancial."}, {"id": "e", "texto": "“se” = marca de impessoalidade; “les” = objeto indireto plural."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 12, 'espanhol', false,
  '[{"url": "/questoes-facape/2026.1-peba-q12-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Espanhol', null, '“Sin embargo, múltiples estudios muestran que
la llegada de migrantes también significa
dinamismo económico, diversidad cultural y
rejuvenecimiento de sociedades envejecidas.”
No trecho destacado, a expressão “sin
embargo” poderia ser substituída, sem alteração
de sentido, por qual das alternativas abaixo?',
  '[{"id": "a", "texto": "A pesar de eso."}, {"id": "b", "texto": "En cambio."}, {"id": "c", "texto": "Por lo tanto."}, {"id": "d", "texto": "Es decir."}, {"id": "e", "texto": "De hecho."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Espanhol', null, '“Un hombre se despertó una mañana con la
extraña sensación de que el mundo había
cambiado de lugar. Las calles eran las mismas,
pero los rostros no lo reconocían; los árboles
crecían torcidos hacia el norte y el reloj de la
plaza marcaba horas que nadie sabía leer.
Caminó confundido, preguntando por su casa, y
todos respondían con palabras que parecían las
suyas, pero dispuestas de manera distinta.
Entonces comprendió que lo que había
cambiado no era la ciudad, sino su forma de
mirar: ya no podía habitar el mundo como antes,
porque una pregunta lo acompañaba en silencio
—¿y si todo esto que llamamos realidad fuera
apenas una traducción incompleta?”
O texto literário explora uma experiência em que
o personagem percebe que:',
  '[{"id": "a", "texto": "sua visão do mundo se transformou, revelando a fragilidade da percepção da realidade."}, {"id": "b", "texto": "os elementos da cidade se tornaram irreconhecíveis por mudanças físicas."}, {"id": "c", "texto": "a realidade objetiva permanece estável e independe da percepção humana."}, {"id": "d", "texto": "os habitantes conspiram contra ele, distorcendo intencionalmente a linguagem."}, {"id": "e", "texto": "a tradução literal das palavras é suficiente para garantir compreensão plena."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Espanhol', null, '“En la última década, las redes sociales se han
convertido en una de las principales fuentes de
información para millones de personas. Sin
embargo, el consumo rápido de noticias a través
de titulares breves y mensajes virales plantea un
problema: la dificultad de verificar la veracidad
de los contenidos. Diversos estudios señalan que
las noticias falsas circulan más rápido que las
verdaderas, porque apelan a la emoción y se
comparten sin contraste. Los medios
tradicionales han perdido parte de su influencia,
pero también han encontrado un nuevo espacio
en estas plataformas, donde intentan recuperar
la confianza del público ofreciendo periodismo
de calidad en medio de un océano de
información dudosa.”
Segundo o texto, um dos principais desafios
trazidos pelas redes sociais para o jornalismo
atual é:',
  '[{"id": "a", "texto": "a redução total do público leitor de jornais impressos."}, {"id": "b", "texto": "a perda completa da relevância dos meios tradicionais, que deixaram de ter qualquer influência informativa."}, {"id": "c", "texto": "a eliminação da necessidade de profissionais formados em comunicação."}, {"id": "d", "texto": "a dificuldade de verificar a veracidade diante da circulação acelerada de notícias falsas."}, {"id": "e", "texto": "a substituição definitiva dos meios tradicionais pelas redes sociais."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 15, 'espanhol', false,
  '[{"url": "/questoes-facape/2026.1-peba-q15-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Matemática', null, 'O gráfico a seguir demonstra a variação V, em
porcentagem, registrada no preço das ações de
uma empresa, em função do tempo, t em horas,
verificada a partir de 0 h, quando comparada ao
mesmo período do dia anterior.
Considerando a função representada pelo
gráfico, é possível determinar o seu domínio,
cujo intervalo é:',
  '[{"id": "a", "texto": "[0, 12["}, {"id": "b", "texto": "[−2, 8]"}, {"id": "c", "texto": "[−2, 12]"}, {"id": "d", "texto": "]0, 12]"}, {"id": "e", "texto": "[−2, 10]"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 16, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q16-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'Uma atividade de educação financeira consiste
em incentivar os participantes a colocarem em
um cofre uma determinada quantia em dinheiro
todos os dias, durante 8 dias. No primeiro dia
eles deveriam colocar nesse cofre R$ 0,25; no
segundo dia R$ 0,50, no terceiro R$ 1,00, e
assim sucessivamente. Até o final da atividade, a
sucessão dos valores a serem colocados no
cofre diariamente deveria obedecer ao mesmo
padrão verificado nos três primeiros dias. Se os
participantes da atividade cumpriram
rigorosamente o que foi solicitado, o valor que
cada um deles tem no cofre é:',
  '[{"id": "a", "texto": "R$ 63,75"}, {"id": "b", "texto": "R$ 32,00"}, {"id": "c", "texto": "R$ 31,75"}, {"id": "d", "texto": "R$ 64,00"}, {"id": "e", "texto": "R$ 127,75"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 17, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q17-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.1-peba-q17-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.1-peba-q17-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Matemática', null, 'Um medicamento estava sendo vendido nas
farmácias por R$ 230,00. Passados alguns dias,
as farmácias reajustaram o preço desse
medicamento, passando a ser vendido com um
acréscimo de 5%. Uma semana após esse
primeiro aumento, novamente houve um novo
reajuste de 10% sobre o preço pelo qual estava
sendo vendido, elevando mais uma vez o seu
valor de venda. Um mês após esse último
reajuste, as redes de farmácias resolveram fazer
uma promoção e ofereceram desconto de 20%
sobre o preço do medicamento, fazendo com
que o seu preço de venda passasse a ser:',
  '[{"id": "a", "texto": "R$ 184,00"}, {"id": "b", "texto": "R$ 193,00"}, {"id": "c", "texto": "R$ 241,50"}, {"id": "d", "texto": "R$ 212,52"}, {"id": "e", "texto": "R$ 265,65"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 18, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q18-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'Durante quatro dias consecutivos foi observada a
crescente variação no preço de um produto e
constatou-se que: o preço registrado no segundo
dia foi maior em R$ 13,00 com relação ao dia
anterior; o preço no terceiro dia foi maior em R$
15,00 com relação ao dia anterior; e finalmente
no quarto dia, o preço desse produto chegou ao
quíntuplo do praticado no primeiro dia. Se ao
longo desses quatro dias for adquirida
diariamente uma unidade desse produto, o valor
total da compra será R$ 137,00. Assim, o valor
cobrado no segundo dia foi:',
  '[{"id": "a", "texto": "R$ 12,00"}, {"id": "b", "texto": "R$ 75,00"}, {"id": "c", "texto": "R$ 40,00"}, {"id": "d", "texto": "R$ 60,00"}, {"id": "e", "texto": "R$ 25,00"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 19, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q19-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'Um container utilizado para transporte de cargas
foi dimensionado para suportar 28.500
quilogramas. Na parte externa desse container
será feita a pintura indicando a sua capacidade
de carga na unidade de medida tonelada. Assim,
o valor indicado na parte externa desse container
será:',
  '[{"id": "a", "texto": "2.850"}, {"id": "b", "texto": "285"}, {"id": "c", "texto": "28,5"}, {"id": "d", "texto": "28.500"}, {"id": "e", "texto": "285.000 FÍSICA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 20, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q20-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Em um parque aquático costeiro, a equipe de
engenharia quer evitar que a luz das luminárias
subaquáticas cause ofuscamento para quem está
fora da piscina à noite. Uma lâmpada pontual está
no fundo de uma piscina com profundidade de
3,0 𝑚. Na superfície deseja-se posicionar um disco
opaco de raio 𝑟 para que nenhum raio de luz saia
da água para o ar. Considere 𝑛𝑎𝑟 = 1,00 e a água
levemente salgada com 𝑛𝑎𝑔𝑢𝑎 = 1,4. Determine o
raio mínimo 𝑟 do disco.
Dado: √6 = 2,45',
  '[{"id": "a", "texto": "2,14"}, {"id": "b", "texto": "2,27"}, {"id": "c", "texto": "3,44"}, {"id": "d", "texto": "3,06"}, {"id": "e", "texto": "1,80"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 21, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q21-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Um calorímetro de capacidade térmica desprezível
possui uma de suas paredes inclinada, conforme
mostrado na figura. Um bloco de gelo, inicialmente
a 0 °𝐶, é abandonado de uma altura de ℎ = 0,24𝑚
e desliza pela parede até atingir a base do
calorímetro, onde permanece em repouso. Admita
que toda a energia potencial gravitacional perdida
pelo bloco se converta em calor no interior do
calorímetro. Considerando o Calor latente de fusão
do gelo: 𝐿𝑓𝑢𝑠ã𝑜 = 3,36 ∙ 105𝐽/𝐾𝑔 e aceleração da
gravidade: 𝑔 = 10 𝑚/𝑠
. Determine a fração da
massa do bloco que se funde.',
  '[{"id": "a", "texto": "7,1 ∙ 10−5"}, {"id": "b", "texto": "7,1 ∙ 10−6"}, {"id": "c", "texto": "2,4 ∙ 10−6"}, {"id": "d", "texto": "2,4 ∙ 10−5"}, {"id": "e", "texto": "3,6 ∙ 10−6"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 22, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q22-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.1-peba-q22-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Física', null, 'Na análise de redes elétricas, circuitos em ponte
são usados em sensores de medição, como em
balanças eletrônicas. O circuito abaixo
representa um desses sistemas: a bateria
fornece uma tensão de 12 𝑉 , e todos os
resistores possuem resistência de 2,0 𝛺 .
Determine o valor da corrente i que percorre o
resistor diagonal interno da ponte.',
  '[{"id": "a", "texto": "1,0 𝐴"}, {"id": "b", "texto": "2,0 𝐴"}, {"id": "c", "texto": "6,0 𝐴"}, {"id": "d", "texto": "4,0 𝐴"}, {"id": "e", "texto": "3,0 𝐴"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 24, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q24-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.1-peba-q24-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Um engenheiro de tráfego está projetando uma
curva de 250 𝑚 e a tangente do ângulo de
inclinação da pista é 𝑑𝑒 0,25. Qual a velocidade
máxima (em 𝑘𝑚/ℎ ) que um veículo pode
percorrer essa curva sem risco de derrapagem,
considerando que a superelevação elimina a
necessidade de atrito? Considere a aceleração
da gravidade como 𝑔 = 10 𝑚/𝑠',
  '[{"id": "a", "texto": "25𝐾𝑚/ℎ"}, {"id": "b", "texto": "36𝐾𝑚/ℎ"}, {"id": "c", "texto": "54𝐾𝑚/ℎ"}, {"id": "d", "texto": "90𝐾𝑚/ℎ"}, {"id": "e", "texto": "72𝐾𝑚/ℎ QUÍMICA"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 25, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q25-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Química', null, 'O descarte de elementos químicos radioativos na
área da medicina, a exemplo do ferro–59,
cobalto–60, tecnécio–99, iodo–131 e césio–137,
também conhecido como resíduos radioativos
hospitalares é um processo cuidadoso que
envolve a segregação, identificação,
armazenamento temporário e transporte para
locais de tratamento e disposição final
adequados, seguindo rigorosamente as normas
estabelecidas pela Comissão Nacional de
Energia Nuclear (CNEN).
Disponível em: https://www.ilhaambiental.com.br/residuos-radioativos-saiba-o-que-diz-a-legislacao/ Acesso em 20.08.25.
Sobre o tema abordado no texto e das
substâncias químicas envolvidas, é CORRETO
afirmar:
Dados: 26Fe (8), 27Co (9), 43Tc (7), 53I (17) e 55Cs
(1)',
  '[{"id": "a", "texto": "50% dos elementos químicos radioativos são de transição externa."}, {"id": "b", "texto": "O Cs e I, quando ligados, formam um composto que apresenta alta captura fotoelétrica devido aos números atômicos dos elementos serem relativamente pequenos."}, {"id": "c", "texto": "A transmutação do ferro–59 em cobalto–60 indica que o ferro–59 é um emissor gama."}, {"id": "d", "texto": "Dentre os elementos citados no texto o iodo– 131 apresenta o menor número de elétrons na camada de valência."}, {"id": "e", "texto": "Os isômeros nucleares 99mTc e 99Tc possuem, no núcleo atômico, mesmo número de prótons e nêutrons apresentando diferença apenas energética."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 26, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q26-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.1-peba-q26-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.1-peba-q26-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Química', null, 'A solução aquosa de hipoclorito de sódio,
comumente encontrado na forma de água
sanitária, é amplamente utilizado para limpeza e
desinfecção devido às suas propriedades
antimicrobianas. Ele age eliminando germes,
bactérias, fungos e vírus, sendo eficaz na
remoção de manchas e sujeiras. Essa solução
reage com ácido clorídrico de acordo com a
equação:
NaCℓO(aq) + 2HCℓ(aq) ⇌ NaCℓ(aq) + Cℓ2(g)
+ H2O(ℓ)
De acordo com as informações do texto,
substâncias químicas envolvidas e analisando a
reação acima é CORRETO afirmar que:
Dados:
volume molar nas CNTP = 22,7L/mol.
Massas molares: Na = 23g/mol; Cℓ = 35,5g/mol;
O = 16g/mol e H = 1g/mol.',
  '[{"id": "a", "texto": "o gás cloro pode ser produzido pela eletrólise ígnea do cloreto de sódio."}, {"id": "b", "texto": "a liberação do cloro para o ambiente é favorecida com o aumento da pressão sobre o sistema reacional."}, {"id": "c", "texto": "o hipoclorito de sódio apresenta ação redutora."}, {"id": "d", "texto": "o ácido clorídrico é um ácido que apresenta um grau de ionização relativamente baixo."}, {"id": "e", "texto": "223,5g de hipoclorito de sódio, isento de impurezas, liberam 70L de gás cloro, nas CNTP, com rendimento de 100%."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 27, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q27-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.1-peba-q27-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.1-peba-q27-3.png", "legenda": null, "ordem": 3}, {"url": "/questoes-facape/2026.1-peba-q27-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Química', null, 'As pilhas são essenciais no cotidiano
moderno, fornecendo energia para uma vasta
gama de dispositivos eletrônicos que usamos
diariamente, desde controles remotos e
brinquedos até lanternas e equipamentos
médicos. Elas permitem a portabilidade e a
autonomia desses aparelhos, tornando-os mais
práticos e acessíveis. O descarte inadequado de
pilhas e baterias no cotidiano acarreta graves
problemas ambientais devido à presença de
metais pesados como mercúrio, chumbo e
cádmio, que podem contaminar o solo, a água e
o ar, além de afetar a saúde humana. É crucial
descartá-las corretamente em locais de coleta
específicos para evitar esses impactos
negativos.
Disponível em:
https://maceio.al.gov.br/noticias/alurb/prefeitura-orienta-sobre-descarte-de-pilhas-e-baterias-sem-prejudicar-a-natureza
Acesso em 20.08.25.
Com base nessas informações, e nos
conhecimentos sobre átomos, ligações químicas,
soluções e eletroquímica, é CORRETO afirmar
que:',
  '[{"id": "a", "texto": "o invólucro da pilha, geralmente feito de aço (liga de ferro–carbono) tem composição fixa, porque é formado por substâncias simples."}, {"id": "b", "texto": "uma pilha constituída por ferro metálico (EºRED = –0,44V) e uma pasta úmida contendo óxido de prata (EºRED = +0,80V) e hidróxido de potássio possui ddp igual a +1,24V."}, {"id": "c", "texto": "o processo mais indicado para a separação do aço, presente no invólucro da pilha, dos demais componentes é a centrifugação."}, {"id": "d", "texto": "o peróxido de lítio é um intermediário utilizado em baterias de lítio–oxigênio para acelerar reações químicas sem serem consumidos no processo, melhorando o desempenho e a eficiência das pilhas."}, {"id": "e", "texto": "uma bateria de chumbo–ácido de carro, com massa total de 14kg que contém 30% em massa de chumbo (massa molar = 207g/mol) possui, aproximadamente, 21mol desse metal."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 28, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q28-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.1-peba-q28-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'O bisacodil é um tipo de laxante que estimula a
atividade e as movimentações dos intestinos
delgado e grosso. Ele costuma ser utilizado para
tratar quadros de constipação ou ainda antes da
realização de cirurgias ou certos procedimentos
médicos que exigem um preparo adequado,
como a colonoscopia. Os efeitos colaterais do
bisacodil podem incluir náusea, dor ou
desconforto estomacal, tontura e sensação de
queimação retal. Mais raramente, é possível que
o tratamento leve a desmaio e sangramento retal
– casos em que se deve interromper o uso do
remédio e procurar imediatamente atendimento
médico.
bisacodil
A análise da molécula do bisacodil, representada
acima, permite afirmar que essa estrutura:
Dados: Massas molares (g.mol–1): H = 1; C = 12,
O = 16 e N = 14',
  '[{"id": "a", "texto": "envolve a participação de elétrons presentes nos orbitais p, do oxigênio e sp2 do carbono na ligação entre o átomo de oxigênio e o anel aromático."}, {"id": "b", "texto": "possui fórmula molecular igual a C22H18NO4."}, {"id": "c", "texto": "quando é hidrolisada produz ácido etanóico e um álcool aromático."}, {"id": "d", "texto": "contém, aproximadamente, 1,5.10‒5mol de moléculas desse composto em um comprimido de 5,0mg."}, {"id": "e", "texto": "apresenta os grupos funcionais das cetonas, ésteres e aminas aromáticas."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 29, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q29-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.1-peba-q29-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.1-peba-q29-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Química', null, 'O dióxido de carbono (CO2), ou gás carbônico,
pode influenciar o estresse de algumas maneiras,
tanto em relação à sua presença no ambiente
quanto em relação ao corpo humano. A
exposição a altos níveis de CO2 pode causar
desconforto, como dores de cabeça e fadiga, e
em situações extremas, desmaios, o que pode
gerar estresse. Por outro lado, o CO2 também
desempenha um papel na regulação do estresse
no corpo, como por exemplo, na resposta ao
calor. Além disso, a forma como respiramos, que
envolve a troca de oxigênio por CO2, pode
influenciar o estado de ansiedade e estresse, e
técnicas de respiração podem ser usadas para
gerenciar esses estados. Considerando–se as
informações acima e as propriedades das
substâncias químicas gasosas é CORRETO
afirmar:
Dados:
1H (1), 6C (14), 8O (16), 16S (16), 9F (17) e 7N (15)
R = 0,082atm.L.mol–1.K–1
Massa molar (g.mol–1): H = 1; C = 12, O = 16, S =
32 e N = 14',
  '[{"id": "a", "texto": "O gás carbônico apresenta geometria molecular do tipo angular."}, {"id": "b", "texto": "Os elementos mais eletronegativos formam substâncias gasosas nas condições ambiente."}, {"id": "c", "texto": "A combustão completa das substâncias gasosas libera gás carbônico e água."}, {"id": "d", "texto": "A massa molar de um mol de ar que contém apenas 20% de gás oxigênio e 80% de gás nitrogênio é aproximadamente igual a 30g.mol–1."}, {"id": "e", "texto": "A quantidade de matéria de gás hidrogênio contido em um cilindro de volume interno igual a 20L sob pressão de 15atm a 127ºC é igual a 9mol. BIOLOGIA"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 30, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q30-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.1-peba-q30-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Biologia', null, 'Durante uma aula prática de Biologia, uma
professora levou materiais como lâminas,
lamínulas, corantes, cebola e raspagem da
mucosa bucal para que os alunos identificassem
diferentes tipos celulares. No momento da
atividade, ela percebeu que havia esquecido de
enumerar as lâminas para facilitar a identificação.
Ainda assim, os alunos puderam diferenciar
facilmente as estruturas, pois as características
morfofisiológicas previamente explicadas eram
evidentes.
Considerando os conhecimentos prévios sobre
tipos celulares e suas estruturas, assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "Tanto as células da cebola quanto as da mucosa bucal apresentam as mesmas características morfofisiológicas, tais como: parede celular e núcleo bem definido, classificadas como células eucarióticas."}, {"id": "b", "texto": "As células da mucosa bucal possuem núcleo e cloroplastos, enquanto as células da cebola apresentam membrana plasmática, classificando-se ambas como células eucarióticas animais."}, {"id": "c", "texto": "As células da mucosa bucal apresentam parede celular e cloroplastos, enquanto as células da cebola apresentam núcleo e membrana plasmática, características de células procarióticas."}, {"id": "d", "texto": "As células da cebola e da mucosa bucal não possuem núcleo individualizado, sendo classificadas como células procarióticas, diferenciando-se apenas pela presença de parede celular nas células da cebola."}, {"id": "e", "texto": "As células da cebola apresentam na sua morfofisiologia, parede celular e vacúolo, características de células eucarióticas vegetais, enquanto as células da mucosa bucal apresentam membrana plasmática e núcleo, características de células eucarióticas animais."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Biologia', null, '“A Conferência das Partes (COP) é o órgão
decisório da Convenção-Quadro das Nações
Unidas sobre Mudança do Clima (CQNUMC ou
UNFCCC). Sua função é implementar os
compromissos globais de combate às mudanças
climáticas, assumidos pelos países signatários e
ratificadores da Convenção. Atualmente, 198
nações participam da UNFCCC, tornando-a um
dos maiores organismos multilaterais da
Organização das Nações Unidas (ONU).
(fonte: ENERGIE, julho.2025).
Considerando esse contexto, assinale a
alternativa que NÃO representa a importância
desse evento na luta contra o aquecimento
global.',
  '[{"id": "a", "texto": "Esse órgão representa a cúpula global do clima, realizada anualmente em um país diferente com objetivo de discutir e aprofundar o conhecimento sobre os impactos mundiais das mudanças climáticas."}, {"id": "b", "texto": "Ele funciona como Reunião das Partes para o Protocolo de Quioto (CMP) e o Acordo de Paris, a fim de mitigar o aquecimento global e manter o aumento da temperatura global abaixo de 2º C, com esforços para limitá-lo a 1,5º C."}, {"id": "c", "texto": "O evento prioriza de forma especial as mudanças climáticas e suas consequências, mas desconsidera os principais fatores que as causam, deixando de enfrentar de maneira efetiva os impactos globais."}, {"id": "d", "texto": "Durante os eventos ocorrem simultaneamente todos os dias. A conferência é dividida em Zona Azul e Zona Verde. A Zona Azul, que é gerenciada diretamente pela ONU, é onde acontecem as negociações políticas e os encontros diplomáticos. Já a Zona Verde sedia painéis para o público geral, apresentação de ONGs e outras atividades, inclusive as culturais."}, {"id": "e", "texto": "Em sua dinamicidade, ocorre ao longo de duas semanas, sendo assim distribuídas: a primeira semana dedicada a discussões técnicas, enquanto a segunda é voltada para encontros políticos e assinatura dos acordos. Os resultados devem ser alcançados por consenso, garantindo que todos os países tenham direito a voto."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 32, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q32-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Biologia', null, '“O sangue coletado por punção venosa, tratado
por anticoagulantes (p. ex., heparina) e, em
seguida, centrifugado separa-se em várias
camadas, que refletem sua heterogeneidade. O
resultado obtido por essa sedimentação,
realizada em tubos de vidro de dimensões
padronizadas, chama-se hematócrito. Nessa
figura, observa-se o plasma corresponde ao
sobrenadante translúcido e amarelado. Os
glóbulos sedimentam em duas camadas
facilmente distinguíveis. A camada inferior (35 a
50% do volume total do sangue) tem cor
vermelha e é formada pelos eritrócitos. A
camada imediatamente superior (1% do volume
de sangue) tem cor acinzentada e contém os
leucócitos, que são menos densos do que os
eritrócitos. Sobre os leucócitos, repousa delgada
camada de plaquetas, não distinguível a olho nu.”
Fonte. (Junqueira e Carneiro, Histologia Básica, 2025, p. 238).
Sobre as células sanguíneas, podemos afirmar
que essas são caracterizadas por suas
funcionalidades. Assinale a alternativa CORRETA
sobre essas funcionalidades.',
  '[{"id": "a", "texto": "As células sanguíneas são sintetizadas na medula óssea vermelha, sendo que cada uma apresenta as suas especificidades: os eritrócitos ou hemácias, transporte de gases; leucócitos atuam na defesa do organismo e trombócitos participam coagulação sanguínea."}, {"id": "b", "texto": "Todas as células sanguíneas são sintetizadas na medula óssea vermelha, sendo que cada uma apresenta as suas especificidades, os eritrócitos atuam no transporte de gases, leucócitos na coagulação sanguínea e trombócitos defesa das células."}, {"id": "c", "texto": "As células sanguíneas são sintetizadas na medula óssea vermelha, sendo que cada uma apresenta as suas especificidades: os eritrócitos atuam na defesa celular; leucócitos fazem o transporte de gases e trombócitos coagulação sanguínea."}, {"id": "d", "texto": "Os Eritrócitos são sintetizados na medula óssea vermelha e participam de todo o processo respiratório. Os leucócitos são produzidos na medula óssea amarela e são responsáveis pela defesa do organismo. as plaquetas, chamadas de trombócitos, são responsáveis pelo processo da coagulação sanguínea."}, {"id": "e", "texto": "As células sanguíneas são sintetizadas na medula óssea vermelha, sendo que cada uma apresenta as suas especificidades: os eritrócitos participam da coagulação sanguínea; os leucócitos, realizam diapedese e transporte de gases e os trombócitos participam da coagulação sanguínea."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 33, null, false,
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
  'Biologia', null, 'O tecido nervoso é formado de células altamente
especializadas e classificadas como
permanentes, devido a sua capacidade de atingir
o processo de maturação não mais se dividindo.
Sobre esse tecido foram feitas as seguintes
afirmativas:
I. Ele é constituído de dois grupos de células:
os neurônios e as células da neuróglia,
também denominadas células da glia.
II. Os componentes desse tecido estão
distribuídos pelo corpo em uma rede de
órgãos e estruturas interligadas, constituindo
o sistema nervoso.
III. Os neurônios são as células que recebem e
processam informações, e as transmitem a
outras células. Eles são constituídos de um
corpo celular e de prolongamentos do corpo
celular, os dendritos e o axônio.
IV. As sinapses são as estruturas celulares
responsáveis pela transmissão unidirecional
de uma sinalização, isto é, um sinal é
transmitido sempre do axônio para outra
célula podendo acontecer de em sentido
inverso.
Assinale a alternativa CORRETA sobre esse tipo
de tecido:',
  '[{"id": "a", "texto": "As alternativas I, II, III e IV estão corretas."}, {"id": "b", "texto": "Somente as alternativas I e III estão corretas."}, {"id": "c", "texto": "Somente as alternativas II e III estão corretas."}, {"id": "d", "texto": "Somente as alternativas I, II e III estão corretas."}, {"id": "e", "texto": "Somente as alternativas III e IV estão corretas."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Biologia', null, '“O sistema digestório consiste em cavidade oral,
esôfago, estômago, intestinos delgado e grosso,
que compõem o tubo digestório, e suas
glândulas associadas (glândulas salivares, fígado
e pâncreas). Sua função é obter as moléculas
necessárias para a manutenção, o crescimento e
as demais necessidades energéticas do
organismo a partir dos alimentos ingeridos.
Moléculas grandes, como proteínas, lipídios,
carboidratos complexos e ácidos nucleicos, são
quebradas em moléculas menores, e junto a
água, vitaminas e minerais, também obtidos dos
alimentos, são absorvidos por meio do
revestimento do tubo digestório. Fonte: (Junqueira e
Carneiro, 2025)
Sobre o processo digestório, NÃO podemos
afirmar que:',
  '[{"id": "a", "texto": "a primeira etapa do processo conhecido como digestão ocorre na boca, onde o alimento é umedecido pela saliva e triturado pelos dentes, formando pedaços menores; a saliva também inicia a digestão de carboidratos."}, {"id": "b", "texto": "a deglutição é o processo em que o alimento é engolido passando da boca para o esôfago por meio dos movimentos peristálticos."}, {"id": "c", "texto": "a absorção de água ocorre no intestino grosso, tornando semissólido o conteúdo luminal que não foi totalmente digerido."}, {"id": "d", "texto": "a digestão continua no estômago por meio do processo de quilificação sendo assim liberado as enzimas que iniciam a quebra das proteínas."}, {"id": "e", "texto": "a digestão propriamente dita ocorre no Intestino delgado, especialmente no duodeno, onde enzimas e secreções biliares realizam a maior parte da quebra de moléculas complexas."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Biologia', null, 'No processo da divisão celular Meiose I,
especialmente na Prófase I, Não ocorre:',
  '[{"id": "a", "texto": "divisão do citoplasma."}, {"id": "b", "texto": "o crossing over."}, {"id": "c", "texto": "os quiasmas."}, {"id": "d", "texto": "fase longa de todo o processo."}, {"id": "e", "texto": "a sinapse."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 36, null, false,
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
  'Biologia', null, 'O bioma Caatinga se caracteriza de forma
especial por ser o único bioma exclusivamente
brasileiro e apresentar características próprias
que o identificam, principalmente no que se
refere ao endemismo.
Assim, podemos destacar plantas que são
nativas e típica da Caatinga.
Assinale a alternativa que apresenta apenas
espécies nativas desse bioma.',
  '[{"id": "a", "texto": "Caatingueira verdadeira, mulungu, algaroba e palma."}, {"id": "b", "texto": "Mulungu, caatingueira verdadeira, mandacaru e xique-xique."}, {"id": "c", "texto": "Palma, mandacaru, xique-xique e caatingueira verdadeira."}, {"id": "d", "texto": "Algaroba, palma, mandacaru e mulungu."}, {"id": "e", "texto": "Palma, mulungu, mandacaru e xique-xique."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 37, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q37-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Biologia', null, 'Os grupos sanguíneos ABO são determinados
por três alelos diferentes de um único gene: IA,
IB e i. Esses três alelos são os responsáveis por
garantir na espécie humana a presença de
quatro fenótipos: sangue A, sangue B, sangue
AB e sangue O. Sobre esses tipos sanguíneos é
INCORRETO afirmar que:',
  '[{"id": "a", "texto": "O sangue A pode ser representado pelos genótipos IAIA ou IAi, este sangue apresenta aglutinogênio A."}, {"id": "b", "texto": "O Sangue B pode ser representado genotipicamente por IBIB ou Ibi, este apresenta aglutinogênio B."}, {"id": "c", "texto": "O Sangue AB, genotipicamente é representado por IAIB e não possuem aglutinogênios."}, {"id": "d", "texto": "O sangue O é representado genotipicamente por ii, não possuem aglutinogênios."}, {"id": "e", "texto": "O sangue AB possuem aglutinogênios A e B, por isso levando em consideração apenas esse fator, pode receber doações de todos os demais grupos."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 38, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q38-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Biologia', null, '“Com o início da temporada sazonal de mão-pé-boca (DMPB) em vários países e territórios da
região das Américas, a Organização Pan-Americana da Saúde/Organização Mundial da
Saúde (OPAS/OMS) insta os Estados Membros a
fortalecer a prevenção e o controle da DMPB,
especialmente em crianças, devido à sua alta
vulnerabilidade e ao risco de complicações
graves do sistema nervoso central (SNC),
especialmente no contexto de surtos
relacionados aos enterovírus A71 (1).
(OPAS/OMS, março 2025)
Sobre essa doença podemos afirmar os
seguintes informações verdadeiras EXCETO:',
  '[{"id": "a", "texto": "uma doença de infecção viral."}, {"id": "b", "texto": "se manifesta com lesões nas mãos, mal-estar, falta de apetite, diarreia, vómitos e dificuldade para engolir devido à dor na boca."}, {"id": "c", "texto": "tosse, coriza e gripe."}, {"id": "d", "texto": "apesar de se manifestar com maior índice na fase infantil na faixa etária de 6 meses aos 5 anos, podem aparecer ocasionalmente em adolescentes e adultos."}, {"id": "e", "texto": "erupções nos pés, podendo aparecer nas nádegas."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 39, null, false,
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
  'Biologia', null, 'Sobre a nutrição das plantas, sabemos que são
produzidas por meio da fotossíntese. Assim
relacione as estruturas com as suas
funcionalidades, relacionando a 2ª Coluna de
acordo com a 1ª Coluna.
1ª COLUNA
(1) Estômatos
(2) Cloroplastos
(3) Xilema
(4) Floema
(5) Cutícula
2ª COLUNA
(....) Transporte de seiva bruta (água e sais
minerais) das raízes até as folhas.
(....) Local onde ocorre a produção de glicose e
oxigênio a partir da fotossíntese.
(....) Estruturas responsáveis pela transpiração e
trocas gasosas.
(....) Camada protetora que evita a perda
excessiva de água.
(....) Transporte da seiva elaborada, rica em
glicose, das folhas para outras partes da planta.
Assinale a alternativa que preenche
CORRETAMENTE a 2ª coluna:',
  '[{"id": "a", "texto": "1 – 3 – 2 – 5 – 4"}, {"id": "b", "texto": "3 – 2 – 1 – 5 – 4"}, {"id": "c", "texto": "1 – 2 – 3 – 5 – 4"}, {"id": "d", "texto": "1 – 5 – 4 – 2 – 3"}, {"id": "e", "texto": "2 – 1 – 3 – 4 – 5 HISTÓRIA"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'História', null, 'A oligarquia cafeeira da república velha
alternava a presidência do país entre os estados
de São Paulo e Minas Gerais, enquanto que,
através da Política dos Governadores de
Campos Salles, a federação apaziguava os
ânimos das elites das outras regiões e de outros
estados importantes, através de benefícios
políticos e financeiros.
Em relação a este período da História brasileira
e suas contestações, assinale a alternativa
CORRETA.',
  '[{"id": "a", "texto": "O movimento sebastianista ocorrido em Canudos visava destruir a oligarquia cafeeira do sudeste brasileiro."}, {"id": "b", "texto": "A eleição do então sucessor de Epitácio Pessoa, Arthur Bernardes, em 1922, foi questionada por militares que o acusavam de associação a movimentos socialistas e de caráter revolucionário."}, {"id": "c", "texto": "Um dos movimentos mais importantes de contestação da oligarquia que governava o Brasil foi o movimento tenentista, que teve como estopim a eleição de Arthur Bernardes."}, {"id": "d", "texto": "A revolução tenentista em São Paulo de 1924 pôs fim ao grupo político que governava o país, colocando na presidência Getúlio Vargas."}, {"id": "e", "texto": "Virgulino Ferreira da Silva, conhecido como “Lampião”, foi líder de um grupo de bandoleiros cuja vontade política estava na mudança de uma república oligárquica das elites agrárias para uma república de representação plena da população, incluindo o desejo por voto feminino."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'História', null, 'Com as invasões holandesas e sua consequente
ocupação do Nordeste do Brasil a partir de 1630
os africanos trazidos para a colônia para a
execução de trabalhos braçais nos engenhos de
cana-de-açúcar agora estavam concentrados
nos domínios holandeses, que tomaram dos
portugueses a parte mais produtiva e populosa
do Brasil, uma importante consequência desses
eventos foi:',
  '[{"id": "a", "texto": "a intensificação de grupos de aventureiros, muitos dos quais eram mamelucos e indígenas, na Capitania de São Vicente, para o apresamento de povos nativos americanos do interior dos sertões, por causa do escasseamento de braços africanos."}, {"id": "b", "texto": "a derrocada do Império português e sua eventual anexação pela Espanha através da União Ibérica em 1640."}, {"id": "c", "texto": "a incorporação por quase 200 anos da Capitania de Pernambuco para o território holandês, que só retornaria para os portugueses através do levante sedicioso conhecido como Insurreição Pernambucana em 1817."}, {"id": "d", "texto": "a mudança do eixo econômico do Nordeste para Sudeste por consequência das plantações de café iniciadas no século 17."}, {"id": "e", "texto": "o desmembramento temporário de vários territórios da América Portuguesa, como a República Juliana no Sul e a Independência da Bahia através da Conjuração Baiana."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'História', null, '“Diversas palavras de origem árabes são
iniciadas com al-, um artigo invariável na língua
árabe, correspondente aos artigos definidos o,
a, os, as. Por não ser do conhecimento dos
portugueses, que apenas ouviam as palavras, o
artigo árabe al- acabou sendo incorporado às
palavras árabes aquando da sua apropriação.”
https://www.normaculta.com.br/palavra
s-de-origem-arabe/
Algumas palavras de origem Árabe no
Português são: Alambique, Açúcar, Algodão,
Aldeia, Azeitona, etc...
A fortíssima influência desta língua provinda do
Oriente Médio em uma outra língua de um país
nos limites ocidentais da Europa pode ser
explicada através:',
  '[{"id": "a", "texto": "da expansão árabe e muçulmana em direção à Europa, consolidando seu domínio na Península Ibérica a partir de 711, sendo impedidos de avançarem mais além em territórios europeus por causa da resistência dos Francos."}, {"id": "b", "texto": "das Invasões Vikings na Península Ibérica, que por serem grandes comerciantes, trouxeram incontáveis elementos culturais de diversos países, incluindo o Alcorão, trazido pelo comércio com os marroquinos do Norte da África, região muito próxima de Portugal."}, {"id": "c", "texto": "das Cruzadas a partir do ano de 1096, pelos quais os portugueses, que estiveram presentes, adquiriram inúmeros aspectos de povos do Oriente, incluindo os Árabes."}, {"id": "d", "texto": "da conversão em massa de portugueses do sul ao Islamismo por causa da proximidade pacífica com o norte do continente africano, que é território de maioria islâmica."}, {"id": "e", "texto": "da incorporação de elementos islâmicos trazidos pela imigração de centenas de milhares de turcos, sírios e outros povos orientais durante os finais do século 19 e o início do século 20 no Brasil, principalmente na região sudeste."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 43, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q43-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'História', null, 'Aproximadamente em 3500 a.C surge a primeira
forma de escrita que se tem conhecimento,
chamada de Cuneiforme, pois se utilizava de
cunhas de madeira para a marcação de
símbolos em argila úmida. A invenção da escrita
foi muito importante para o desenvolvimento das
civilizações, pois permitiu a consolidação de
tratados entre Estados, registros de comércio e
transações, registros históricos, etc...
Sobre o processo histórico necessário para a
eventual criação de um método de escrever,
assinale a alternativa CORRETA.',
  '[{"id": "a", "texto": "A escrita surge em decorrência da pressão exercida pelos Povos do Mar durante o colapso da Era do Bronze, pois era necessário que as civilizações da Mesopotâmia registrassem os eventos para as gerações posteriores."}, {"id": "b", "texto": "Foi possível por causa do gradual assentamento humano em locais fixos em decorrência do surgimento da agricultura e pecuária, facilitando a criação das primeiras cidades, necessitando, em consequência, de uma sistematização das relações sociais e econômicas entre diferentes elementos das civilizações em formação."}, {"id": "c", "texto": "O processo histórico que levou a construção da escrita não tem qualquer influência, pois é fato notório que um método de registro surgiria inevitavelmente em todas as civilizações do mundo."}, {"id": "d", "texto": "A escrita não foi parte culminante de um processo de desenvolvimentos graduais, ela foi um descobrimento acidental da humanidade, tal qual o fogo."}, {"id": "e", "texto": "A escrita só foi possível graças à influência climática na Mesopotâmia, única região a desenvolvê-la. Espalhando-a para outras regiões do globo."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 44, null, false,
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
  'História', null, 'A Primeira Guerra Mundial foi um dos maiores e
mais violentos conflitos acontecidos no mundo,
uniu diferentes países com diferentes interesses
em um complexo sistema de alianças. A guerra
viu pela primeira vez o uso do tanque de guerra
e do avião de combate, bem como também a
evolução de antigos sistemas de armamentos,
que, muito mais modernos que as próprias
doutrinas militares da época, causaram
morticínio em escala jamais vista até então.
Sobre o conflito acontecido de 1914 a 1918,
podemos afirmar que:',
  '[{"id": "a", "texto": "aconteceu em todos os continentes do mundo, tendo grande impacto na América do Norte."}, {"id": "b", "texto": "teve como consequência o fim da hegemonia dos Estados Unidos, que, ao entrar no conflito em 1917, arcou com pesadas consequências humanas, materiais e financeiras, entrando em crise e dando espaço para a ascensão do Império Britânico."}, {"id": "c", "texto": "o Império Alemão logrou êxito inicial na guerra de movimento por causa de sua inovadora tática de Blitzkrieg."}, {"id": "d", "texto": "findou, em 1918, com o descobrimento pelas tropas da entente de campos de extermínio em territórios de Europa Central cujas principais vítimas foram os Judeus."}, {"id": "e", "texto": "opôs dois grandes grupos distintos de alianças, a Tríplice Entente, que contava primariamente com a República da França, o Império Britânico e o Império Russo contra a Tríplice Aliança do Império Alemão, Império Austro-Húngaro e Império Turco-Otomano. GEOGRAFIA"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Geografia', null, 'Segundo David Harvey, a lógica capitalista utiliza
o espaço urbano como forma de reprodução do
capital, transformando a cidade em mercadoria.
Nesse processo, observa-se a intensificação das
desigualdades sociais, já que o direito à cidade é
restrito a quem possui condições de consumo.
HARVEY, D. Cidades rebeldes: do direito à cidade
à revolução urbana; tradução Jerferson Camargo
– São Paulo: Martins Fontes – selo Martins. 2014.
A análise de Harvey permite compreender que,
nas cidades contemporâneas:',
  '[{"id": "a", "texto": "o espaço urbano, sob a lógica do capital, funciona como mercadoria, reforçando a exclusão social."}, {"id": "b", "texto": "o direito à cidade se realiza por meio da garantia universal de acesso a bens e serviços."}, {"id": "c", "texto": "a produção do espaço urbano é resultado da apropriação coletiva e democrática do território."}, {"id": "d", "texto": "a urbanização é um processo natural, fruto do crescimento populacional, independente das lógicas econômicas."}, {"id": "e", "texto": "a cidade constitui um ambiente neutro, onde as diferenças sociais se equilibram pela convivência."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 46, null, false,
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
  'Geografia', null, 'Em O mundo que o português criou (1940),
Gilberto Freyre destacou o caráter antropofágico
da cultura brasileira, capaz de absorver e
transformar referências culturais externas em
novas formas de identidade. Ao observar
comunidades de descendentes alemães no sul
do Brasil, o autor percebeu tanto a incorporação
de hábitos da cultura luso-brasileira — como a
alimentação e a música — quanto à introdução
de elementos europeus que se mesclaram ao
cenário local, criando realidades culturais
híbridas.
FREYRE, G. Interpretação do Brasil. São
Paulo: Global, 2015.
Esse processo descrito por Freyre evidencia que
a construção da identidade nacional brasileira
está relacionada à:',
  '[{"id": "a", "texto": "preservação de identidades étnicas isoladas que se mantêm impermeáveis às culturas locais."}, {"id": "b", "texto": "imposição autoritária da cultura europeia sobre as práticas tradicionais brasileiras."}, {"id": "c", "texto": "homogeneização completa das tradições culturais trazidas pelos imigrantes."}, {"id": "d", "texto": "valorização da herança indígena como única referência formadora da cultura nacional."}, {"id": "e", "texto": "integração dinâmica de diferentes matrizes culturais, que, em contato, produzem novas formas de expressão coletiva."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
  'Geografia', null, '“Já em 1946 Josué de Castro escrevia que a
fome era o problema ecológico número um.
Afinal, todo ser vivo precisa se alimentar. A
alimentação é uma questão-chave para a
reprodução das espécies, tanto quanto o
acasalamento e a proteção (abrigo) dos filhos,
constituindo hábitats e hábitos, territórios e
culturas.” A reflexão de Josué de Castro
antecipa debates atuais sobre a fome e a
alimentação, entendidas como questões
ecológicas, sociais e culturais. No cenário
contemporâneo, marcado por mudanças
climáticas, desmatamento e expansão do
agronegócio em larga escala, a relação entre
meio ambiente e acesso à comida continua
sendo central.
PORTO, G. C. W. O desafio ambiental. Rio de
Janeiro: Record, 2012.
Nesse contexto, o principal desafio para o
combate à fome no Brasil está associado à:',
  '[{"id": "a", "texto": "substituição das práticas alimentares tradicionais por dietas globais padronizadas, impulsionadas pela indústria."}, {"id": "b", "texto": "preservação da biodiversidade e promoção da soberania alimentar, garantindo produção sustentável e acesso justo aos alimentos."}, {"id": "c", "texto": "aumento da produtividade agrícola baseada em monoculturas voltadas à exportação de commodities."}, {"id": "d", "texto": "expansão do mercado consumidor urbano, que impulsiona a demanda por alimentos ultra processados."}, {"id": "e", "texto": "intensificação do uso de tecnologias químicas e transgênicas para garantir maior oferta de alimentos."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 48, null, false,
  '[{"url": "/questoes-facape/2026.1-peba-q48-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Geografia', null, 'O conceito de bioma, conforme a Ecologia e a
Geografia Física, envolve grandes unidades
ambientais caracterizadas por fatores climáticos,
edáficos (do solo), hídricos e pela vegetação
dominante. No Brasil, o bioma Amazônia
apresenta uma notável diversidade interna, com
formações como matas de terra firme, matas de
várzea e matas inundadas, que se diferenciam
pela disponibilidade de água, altura das árvores
e densidade da vegetação.
A diferenciação interna da vegetação amazônica
ilustra que:',
  '[{"id": "a", "texto": "um mesmo bioma pode abrigar formações vegetais distintas, definidas por fatores edáficos e hídricos, além do clima regional."}, {"id": "b", "texto": "a classificação dos biomas deve considerar apenas o aspecto climático global, desconsiderando variações locais."}, {"id": "c", "texto": "um bioma apresenta uniformidade absoluta de espécies e ecossistemas, pois depende apenas do tipo climático predominante."}, {"id": "d", "texto": "os biomas são delimitados unicamente por fronteiras políticas e econômicas, sem relação com a natureza."}, {"id": "e", "texto": "a presença de diferentes formações vegetais na Amazônia invalida a noção de bioma, já que este exige homogeneidade estrutural."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
  'peba', 49, null, false,
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
  'Geografia', null, 'TEXTO I
TEXTO II
Autores como Adorno e Horkheimer, ao
discutirem a Indústria Cultural, destacaram como
os meios de comunicação de massa e o
marketing constroem uma padronização do
gosto e do comportamento, enfraquecendo a
autonomia do indivíduo diante das pressões
sociais e mercadológicas.
Com base nessa perspectiva, a crítica feita pela
charge de Mafalda ao consumo cultural está
relacionada à:',
  '[{"id": "a", "texto": "valorização das identidades."}, {"id": "b", "texto": "democratização da informação."}, {"id": "c", "texto": "homogeneização dos comportamentos."}, {"id": "d", "texto": "pluralidade de opiniões políticas."}, {"id": "e", "texto": "fortalecimento das tradições locais."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Rede PEBA/Bolsistas',
  '2026.1-peba', 'FACAPE 2026.1 - Rede PEBA/Bolsistas', 2026, 1,
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
