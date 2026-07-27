-- ============================================================================
-- DECOLA MED — SEED: FACAPE 2025.2 - Rede PEBA/Bolsistas
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
  'Português', null, '“A metabolômica é uma nova ciência ‘ômica’ que
investiga os produtos do metabolismo, os
metabólitos, em resposta a modificações em
sistemas biológicos – células, tecidos e fluidos
corporais. Esta ciência tem sido empregada em
diversos estudos visando compreender o
metabolismo e os mecanismos relacionados a
doenças, definir biomarcadores e verificar
toxicidade à fármacos.
Os instrumentos analíticos frequentemente
utilizados na metabolômica são a ressonância
magnética nuclear (NMR), cromatografia gasosa e
cromatografia liquida acopladas a espectrometria
de massas (GC-MS e LC-MS). Estas três
plataformas analíticas podem ser utilizadas
individualmente e/ou em conjunto para detectar
metabólitos como aminoácidos, lipídios, ácidos
orgânicos e açúcares. Além disto, a investigação
pode ser realizada de maneira target (alvo) ou
untarget (não-alvo), sendo que na primeira são
investigados compostos de interesse e na
segunda são mensurados o máximo de
metabólitos possível.”
Disponível em:
https://nutritotal.com.br (adaptado)
Sobre o texto, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "Essa nova ciência tem por objetivo investigar apenas os fluidos corporais."}, {"id": "b", "texto": "Em “Esta ciência tem sido empregada em diversos estudos visando compreender o metabolismo e os mecanismos relacionados a doenças, definir biomarcadores e verificar toxicidade à fármacos.”, o termo “a doenças” estabelece com a expressão “relacionados” uma relação de concordância nominal."}, {"id": "c", "texto": "Em “Os instrumentos analíticos frequentemente utilizados na metabolômica são a ressonância magnética nuclear (NMR), cromatografia gasosa e cromatografia liquida acopladas a espectrometria de massas (GC-MS e LC-MS).”, contém um vocábulo grafado inadequadamente."}, {"id": "d", "texto": "Em “Estas três plataformas analíticas podem ser utilizadas individualmente e/ou em conjunto para detectar metabólitos como aminoácidos, lipídios, ácidos orgânicos e açúcares.”, as palavras “três” e “açúcares são acentuadas pela mesma regra de acentuação gráfica."}, {"id": "e", "texto": "Em” ...sendo que na primeira são investigados compostos de interesse e na segunda são mensurados o máximo de metabólitos possível.”, o coesivo “sendo que” inicia uma sequência que expressa valor semântico de causa."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Português', null, 'Disponível em: https://www.instagram.com
Na placa acima, ocorre um desvio da norma culta
referente:',
  '[{"id": "a", "texto": "ao emprego da forma verbal “procura” no singular."}, {"id": "b", "texto": "ao emprego do acento gráfico da palavra “área”."}, {"id": "c", "texto": "ao emprego da partícula “se”."}, {"id": "d", "texto": "ao emprego da palavra “urgente”."}, {"id": "e", "texto": "à grafia da palavra “profissionais”."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 2, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q02-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Português', null, '“Misokinesia, também chamada de misocinesia, é
o incomodo aos movimentos repetitivos de outras
pessoas. A condição, considerada psicológica e
emocional, é paralela a misofonia: distúrbio onde
as pessoas ficam irritadas ao ouvir certos sons
repetitivos. Ou seja, enquanto a misofonia é a
aversão a certos sons, a misocinesia é a aversão
a certas movimentações — como aquela pessoa
que fica balançando a perna ou o pé sem parar ao
seu lado. Segundo a pesquisa, ambas reações
podem, inclusive, coexistir em um mesmo
indivíduo.”
Disponível em: https://olhardigital.com.br
(adaptado)
Assinale a alternativa, no texto acima, em que
ocorre um segmento expresso através de uma
relação lógico – semântica de conformidade.',
  '[{"id": "a", "texto": "“Misokinesia, também chamada de misocinesia, é o incomodo aos movimentos repetitivos de outras pessoas.”."}, {"id": "b", "texto": "“A condição, considerada psicológica e emocional, é paralela a misofonia...”."}, {"id": "c", "texto": "“...distúrbio onde as pessoas ficam irritadas ao ouvir certos sons repetitivos.”."}, {"id": "d", "texto": "“Ou seja, enquanto a misofonia é a aversão a certos sons, a misocinesia é a aversão a certas movimentações...”."}, {"id": "e", "texto": "“Segundo a pesquisa, ambas reações podem, inclusive, coexistir em um mesmo indivíduo.”."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Português', null, '“Embora a dor no peito seja frequentemente
associada a problemas cardíacos, é fundamental
lembrar que ela pode ter inúmeras causas,
incluindo condições graves como o câncer. No
entanto, não é comum que a dor no peito seja o
primeiro sintoma de câncer de pulmão ou de
outros tipos de câncer na região torácica.
Se você estiver enfrentando dor no peito
persistente ou acompanhada de sintomas
preocupantes, procure atendimento médico
imediato. Um diagnóstico preciso é essencial para
determinar a causa exata da dor e iniciar o
tratamento adequado o mais rápido possível.
Ignorar os sintomas pode levar a complicações
sérias, então não hesite em buscar ajuda.”
Disponível em: https:
https://vencerocancer.org.br(adaptado)
Considerando a intenção comunicativa do autor
no texto acima, pode-se afirmar que contém uma
sequência que registra a função conativa da
linguagem. Assinale-a.',
  '[{"id": "a", "texto": "“Embora a dor no peito seja frequentemente associada a problemas cardíacos, é fundamental lembrar que ela pode ter inúmeras causas...”."}, {"id": "b", "texto": "“...incluindo condições graves como o câncer.”."}, {"id": "c", "texto": "“No entanto, não é comum que a dor no peito seja o primeiro sintoma de câncer de pulmão ou de outros tipos de câncer na região torácica.”."}, {"id": "d", "texto": "“Se você estiver enfrentando dor no peito persistente ou acompanhada de sintomas preocupantes, procure atendimento médico imediato.”."}, {"id": "e", "texto": "“Um diagnóstico preciso é essencial para determinar a causa exata da dor e iniciar o tratamento adequado o mais rápido possível. Ignorar os sintomas pode levar a complicações sérias, então não hesite em buscar ajuda.”."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Português', null, 'Disponível em: https://laboratorioemilioribas.com.br
Sobre o título “Como identificar doenças auto
imunes?”, a palavra “como” desempenha,
morfologicamente, a função de:',
  '[{"id": "a", "texto": "conjunção subordinativa comparativa."}, {"id": "b", "texto": "advérbio interrogativo de modo."}, {"id": "c", "texto": "preposição."}, {"id": "d", "texto": "conjunção subordinativa causal."}, {"id": "e", "texto": "conjunção subordinativa conformativa."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Português', null, '“Ser médico é, acima de tudo, uma vocação e um
chamado. É um compromisso perene com a
humanidade, com a busca constante pelo bem-estar de cada paciente que cruzar o nosso
caminho, seja curando suas doenças, seja
aliviando o seu sofrimento.
A nossa jornada é construída com estudo,
esforço, dedicação e sacrifícios. A rotina cotidiana
do médico é intensa e desafiadora, exige não
apenas conhecimento técnico, mas também
empatia, paciência, determinação, carinho e
resiliência. Em muitos momentos sacrificamos
nossa vida pessoal e familiar, e até a nossa saúde
física e mental para cumprirmos o nosso mister. A
cada dia nos deparamos com o inesperado e, por
vezes, o inevitável. Testemunhamos momentos de
alegria e também de dor. Vivenciamos o
sofrimento do corpo e da alma em todas suas
formas de expressão. No entanto, é através
desses desafios que nos tornamos mais fortes e
mais conectados com aqueles a quem servimos.”
Disponível em: https://crmma.org.br
(adaptado)
Assinale a alternativa em que o autor empregou
uma oração, extraída do texto, com valor
semântico de alternância.',
  '[{"id": "a", "texto": "“Ser médico é, acima de tudo, uma vocação e um chamado. É um compromisso perene com a humanidade, com a busca constante pelo bem-estar de cada paciente que cruzar o nosso caminho, seja curando suas doenças, seja aliviando o seu sofrimento.”."}, {"id": "b", "texto": "“A nossa jornada é construída com estudo, esforço, dedicação e sacrifícios. A rotina cotidiana do médico é intensa e desafiadora, exige não apenas conhecimento técnico, mas também empatia, paciência, determinação, carinho e resiliência.”."}, {"id": "c", "texto": "“Em muitos momentos sacrificamos nossa vida pessoal e familiar, e até a nossa saúde física e mental para cumprirmos o nosso mister.”."}, {"id": "d", "texto": "“A cada dia nos deparamos com o inesperado e, por vezes, o inevitável. Testemunhamos momentos de alegria e também de dor. Vivenciamos o sofrimento do corpo e da alma em todas suas formas de expressão.”."}, {"id": "e", "texto": "“No entanto, é através desses desafios que nos tornamos mais fortes e mais conectados com aqueles a quem servimos.”."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Inglês', null, 'É imprescindível saber se comunicar usando as
diferentes formas inerentes ao ser humano:
através da oralidade, da escrita, das mídias visuais
e escritas e até mesmo do bate-papo entre
amigos.
A interpretação de textos é de grande valia por
permitir a aquisição de informações úteis e às
vezes prazerosas tal qual uma piada. Saber inferir
informações de um texto é primordial nos dias
atuais. Todas as formas de se comunicar são
importantes sendo o texto meio eficiente de dar-se e receber aprendizado.
Leia o texto abaixo e escolha a alternativa
CORRETA.
During a recent trip to the countryside, I had the
chance to experience something truly magical.
The air was fresh, the sky was clear, and the
silence was only broken by the sounds of birds
and rustling leaves.
I stayed at a small farmhouse where the locals
welcomed me warmly.
It reminded me of how important it is to
disconnect from our fast-paced digital lives and
reconnect with nature.',
  '[{"id": "a", "texto": "The author had a negative experience due to the isolation in the countryside."}, {"id": "b", "texto": "The countryside was loud and chaotic, unlike the city."}, {"id": "c", "texto": "The trip highlighted the importance of technology in daily life."}, {"id": "d", "texto": "The author enjoyed the peaceful environment and valued the experience."}, {"id": "e", "texto": "The locals were unfriendly and made the experience uncomfortable."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Inglês', null, 'As regras gramaticais são parecidas em algumas
línguas, porém, não são idênticas. Não há
equivalência perfeita entre as regras de inglês e
português, por exemplo.
Pode-se falar uma língua sem ser alfabetizado,
mas saber as dez classes gramaticais em inglês e
português ajuda muito a formulação de frases
claras e adequadas ao padrão culto usado na
academia e instituições governamentais.
De acordo com o explanado acima, escolha a
alternativa na qual o uso da classe gramatical está
CORRETA:',
  '[{"id": "a", "texto": "English are spoke here."}, {"id": "b", "texto": "It is great to watch the sunset in the summer time."}, {"id": "c", "texto": "These German cars is awesome."}, {"id": "d", "texto": "Smarts people help others in a daily basis."}, {"id": "e", "texto": "Jeremy speaks French wonderful."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 12, 'ingles', false,
  '[{"url": "/questoes-facape/2025.2-peba-q12-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Inglês', null, 'Textos científicos são apropriados a ajudar às
pessoas a lidarem com informações úteis e, por
conseguinte, confiáveis, pois são criadas por
cientistas e testados por seus pares que
confirmam ou não a validade de um ponto de vista
ou estudo de um problema analisado para se
provar algo.
O texto abaixo mostra uma pesquisa feita pela
NASA e a Fundação do Sono americana. Leia-o
cuidadosamente e assinale a alternativa que
resume esse artigo.
The Cognitive Benefits of Strategic Napping
Although often overlooked, strategic napping
has been shown to yield significant cognitive and
physiological advantages. Contrary to the
common perception that napping is merely a sign
of laziness or fatigue, recent neuroscientific
studies reveal that short, well-timed naps can
drastically enhance memory consolidation,
emotional regulation, and decision-making skills.
A study conducted at NASA on military pilots and
astronauts found that a 26-minute nap improved
performance by 34% and alertness by 54%. The
key is not the length of the nap alone, but also its
timing. Napping between 1 p.m. and 3 p.m., when
the human circadian rhythm naturally dips,
prevents the post-lunch energy crash without
interfering with nighttime sleep.
Sources: NASA and The National
Sleep Foundation',
  '[{"id": "a", "texto": "O cochilo é reconhecido como fator saudável pela maioria das pessoas de acordo com o estudo da NASA."}, {"id": "b", "texto": "Cochilar é sinal de preguiça ou fatiga de acordo com a percepção comum."}, {"id": "c", "texto": "Estudos científicos provam que dormir por duas horas de uma às três da manhã aumenta o desempenho em mais de sessenta porcento."}, {"id": "d", "texto": "Dormir à tarde atrapalha o sono à noite."}, {"id": "e", "texto": "Estudos neurocientíficos atuais mostram que cochilar melhora o desempenho e o estado de alerta."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 14, 'ingles', false,
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
  'Inglês', null, 'Há palavras inglesas, conhecidas dos estudantes
brasileiros, por serem usadas desde o início de
um curso de inglês. Contudo, algumas palavras
têm outro significado além do usual. Sendo a
língua inglesa considerada, por alguns linguistas,
como a de maior vocabulário não é de se
estranhar que o verbo ‘to get’ pode ter 104
acepções diferentes de acordo com o Webster´s.
Assim, o estudo contínuo aprimora o
conhecimento de novas palavras.
Qual das alternativas abaixo mostra a correta
tradução da palavra inglesa à esquerda da
tradução?',
  '[{"id": "a", "texto": "A school of fish. – Um cardume de peixes."}, {"id": "b", "texto": "Cobra – Significa as espécies de cobras em geral."}, {"id": "c", "texto": "Piscina – Piscina."}, {"id": "d", "texto": "Data - Indicação exata do dia, mês e ano de algum acontecimento."}, {"id": "e", "texto": "To assist (verbo) - Assistir ao filme."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Espanhol', null, '"El realismo mágico es una característica esencial
de la literatura latinoamericana del siglo XX.
Autores como Gabriel García Márquez y Jorge
Luis Borges utilizaron esta técnica para mezclar lo
fantástico con el rutinero, creando universos
donde lo imposible se vuelve real. Esta corriente
literaria no solo refleja la identidad cultural de
América Latina, sino que también cuestiona la
percepción de la realidad."
De acordo com o texto, o realismo mágico na
literatura latino-americana tem como principal
característica:',
  '[{"id": "a", "texto": "A negação completa da realidade em favor do fantástico."}, {"id": "b", "texto": "A mistura entre elementos fantásticos e cotidianos."}, {"id": "c", "texto": "A exclusão de autores como García Márquez e Borges."}, {"id": "d", "texto": "A priorização de temas políticos em detrimento da identidade cultural."}, {"id": "e", "texto": "A criação de universos totalmente desvinculados da realidade."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 11, 'espanhol', false,
  '[{"url": "/questoes-facape/2025.2-peba-q11-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Espanhol', null, '"La globalización ha generado un intercambio
cultural sin precedentes, pero también ha
provocado la homogenización de ciertas
expresiones artísticas. Muchos críticos
argumentan que esto ha llevado a la pérdida de
identidades locales, mientras que otros defienden
que la globalización enriquece las culturas al
permitir su difusión a nivel mundial."
O texto apresenta dois pontos de vista sobre a
globalização. Qual é a principal crítica
mencionada?',
  '[{"id": "a", "texto": "A globalização promove a diversidade cultural em todos os aspectos."}, {"id": "b", "texto": "A globalização causa a perda de identidades locais devido à homogeneização."}, {"id": "c", "texto": "A globalização impede a difusão de expressões artísticas."}, {"id": "d", "texto": "A globalização é responsável pelo aumento do isolamento cultural."}, {"id": "e", "texto": "A globalização não afeta as expressões artísticas locais."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 12, 'espanhol', false,
  '[{"url": "/questoes-facape/2025.2-peba-q12-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2025.2-peba-q12-3.png", "legenda": null, "ordem": 3}]'::jsonb, true
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
  'Espanhol', null, 'Sobre o uso dos artigos definidos e indefinidos
Qual alternativa completa CORRETAMENTE a
frase?
"Necesito comprar _____ manzanas y _____ pan
para la cena."',
  '[{"id": "a", "texto": "las / el"}, {"id": "b", "texto": "unas / un"}, {"id": "c", "texto": "los / la"}, {"id": "d", "texto": "unas / el"}, {"id": "e", "texto": "las / un"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 13, 'espanhol', false,
  '[{"url": "/questoes-facape/2025.2-peba-q13-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'Espanhol', null, 'Qual alternativa completa CORRETAMENTE a
frase?
"¿Le diste el libro a María? Sí, _____ di ayer."',
  '[{"id": "a", "texto": "se lo"}, {"id": "b", "texto": "le lo"}, {"id": "c", "texto": "se la"}, {"id": "d", "texto": "te lo"}, {"id": "e", "texto": "me lo"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Espanhol', null, 'Assinale a alternativa que apresenta o plural
CORRETO da frase:
"El niño tiene un lápiz y un cuaderno."',
  '[{"id": "a", "texto": "Los niños tienen unos lápices y unos cuadernos."}, {"id": "b", "texto": "Ellos niños tienen unos lápizes y unos cuadernos."}, {"id": "c", "texto": "Los niños tienen unos lápizs y unos cuadernos."}, {"id": "d", "texto": "Los niños tienen uns lápices y uns cuadernos."}, {"id": "e", "texto": "Los niños tienen unos lápizes y unos cuadernos."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 15, 'espanhol', false,
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
  'Matemática', null, 'Em um posto de saúde foi feita a contagem da
quantidade de pessoas atendidas em um dia. Na
hora de fazer a anotação dessa quantidade de
atendimentos, houve um equívoco na digitação do
número, de modo que o digitador inverteu o
algarismo das dezenas com o das unidades. Por
conta disso, a quantidade digitada ficou maior do
que o que realmente ocorreu em 9 atendimentos.
Se a soma desses dois algarismos é também igual
a 9, pode-se concluir que o número correto de
pessoas atendidas nesse dia foi igual a:',
  '[{"id": "a", "texto": "36"}, {"id": "b", "texto": "45"}, {"id": "c", "texto": "54"}, {"id": "d", "texto": "63"}, {"id": "e", "texto": "72"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 16, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q16-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'Um laboratório precisa adquirir 1.400 dL
(decilitros) de um dos compostos químicos que
utiliza na mistura e produção de alguns dos seus
medicamentos. A tabela de preços indica que 1 kg
desse composto custa R$ 300,00 e o rótulo da
embalagem mostra que 500 g correspondem a
4.000 cm3.
O valor que a fábrica vai pagar na aquisição da
quantidade do composto químico que precisa
adquirir será:',
  '[{"id": "a", "texto": "R$ 700,00"}, {"id": "b", "texto": "R$ 1.250,00"}, {"id": "c", "texto": "R$ 1.750,00"}, {"id": "d", "texto": "R$ 1.400,00"}, {"id": "e", "texto": "R$ 5.250,00"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 17, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q17-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-peba-q17-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Matemática', null, 'Suponha que na hora de envasar o soro que será
utilizado em pacientes nos hospitais, o fabricante
estima que haverá uma perda de 12% durante o
manuseio do produto quando vai ser ministrado
ao paciente. Por conta disso, é colocada na
embalagem uma quantidade a mais do que a
indicada no rótulo para compensar a perda. O
cálculo da quantidade de soro que haverá na
embalagem é feito da seguinte forma: pega-se a
quantidade útil desejada (que é a indicada no
rótulo), e acrescenta-se 12% dessa quantidade
(que é a perda estimada). Dessa forma, em uma
de suas embalagens foram colocados 560 mL
(mililitros) do soro.
Assim, a quantidade útil desejada de soro nessa
embalagem, em mL, é.',
  '[{"id": "a", "texto": "60"}, {"id": "b", "texto": "67,2"}, {"id": "c", "texto": "72"}, {"id": "d", "texto": "492,8"}, {"id": "e", "texto": "500"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 18, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q18-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'Em um posto de saúde há uma pequena sala no
formato do trapézio ABCD da figura abaixo, com
7,5 m2 de área. Deseja-se fazer sua ampliação,
retirando-se as paredes AB e CD, de modo que a
sala passe a ter a forma do retângulo AEFD.
Após a reforma e ampliação da sala, sua nova área
total ficou aumentada em:',
  '[{"id": "a", "texto": "4,5 m2"}, {"id": "b", "texto": "4,0 m2"}, {"id": "c", "texto": "9,0 m2"}, {"id": "d", "texto": "11,5 m2"}, {"id": "e", "texto": "12,0 m2"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 19, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q19-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-peba-q19-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-peba-q19-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Matemática', null, 'Foi feito o levantamento da quantidade de
pessoas que foram atendidas em um posto de
saúde durante uma semana e chegou-se ao
seguinte resultado:
• segunda-feira: 12 pessoas
• terça-feira: 15 pessoas
• quarta-feira: 8 pessoas
• quinta-feira: 13 pessoas
• sexta-feira: 14 pessoas
• sábado: 8 pessoas
A mediana da quantidade de pessoas atendidas
nesses dias é:',
  '[{"id": "a", "texto": "8"}, {"id": "b", "texto": "11,6"}, {"id": "c", "texto": "12"}, {"id": "d", "texto": "12,5"}, {"id": "e", "texto": "13 FÍSICA"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 20, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q20-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-peba-q20-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-peba-q20-full2.png", "legenda": null, "ordem": 92}, {"url": "/questoes-facape/2025.2-peba-q20-full3.png", "legenda": null, "ordem": 93}]'::jsonb, true
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
  'Física', null, 'Em um estudo clínico para avaliar a eficácia de
tratamentos térmicos em pacientes, foram
utilizadas amostras de água a diferentes
temperaturas. Suponha que você tenha 250𝑔 de
água aquecida a 85°𝐶, simulando uma aplicação
de compressa quente, e 350𝑔 de água a 25°𝐶,
representando a temperatura ambiente do
paciente. Essas duas amostras de água são
misturadas em um recipiente de capacidade
térmica desprezível. Qual será a temperatura final
da mistura? Dado: Capacidade térmica específica
da água = 4,18 𝐽/𝑔°𝐶',
  '[{"id": "a", "texto": "35°𝐶"}, {"id": "b", "texto": "40°𝐶"}, {"id": "c", "texto": "50°𝐶"}, {"id": "d", "texto": "60°𝐶"}, {"id": "e", "texto": "75°𝐶"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 21, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q21-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Uma ambulância está se movendo a uma
velocidade constante de 30𝑚/𝑠 em direção a um
pedestre parado na calçada. A sirene da
ambulância emite um som com frequência de
1200𝐻𝑧 . A velocidade do som no ar é de
aproximadamente 343 𝑚/𝑠. Qual é a frequência
que o pedestre irá perceber à medida que a
ambulância se aproxima?',
  '[{"id": "a", "texto": "1315𝐻𝑧"}, {"id": "b", "texto": "1103𝐻𝑧"}, {"id": "c", "texto": "13720𝐻𝑧"}, {"id": "d", "texto": "814𝐻𝑧"}, {"id": "e", "texto": "1115𝐻𝑧"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 22, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q22-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-peba-q22-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Física', null, 'O esquema abaixo representa uma associação de
capacitores utilizada em um circuito eletrônico de
um dispositivo. A tensão 𝑉 é aplicada entre os
pontos 𝐴 𝑒 𝐵 do circuito. Os números na figura
indicam as capacidades dos capacitores, medidas
em microfarads (𝜇𝐹). Com base nisso, determine
a capacitância equivalente à associação de
capacitores:',
  '[{"id": "a", "texto": "1,3 𝜇𝐹"}, {"id": "b", "texto": "2,2 𝜇𝐹"}, {"id": "c", "texto": "0,8 𝜇𝐹"}, {"id": "d", "texto": "1,6 𝜇𝐹"}, {"id": "e", "texto": "3,2 𝜇𝐹"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 23, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q23-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Em uma sala de cinema, o projetor está equipado
com uma objetiva de distância focal de 30 𝑐𝑚,
ideal para exibir filmes em alta definição. Para
projetar um filme com nitidez e clareza em uma
tela grande, é necessário obter uma ampliação de
20 vezes. Nessa situação, qual deve ser o
comprimento da sala de projeção para alcançar
essa ampliação?',
  '[{"id": "a", "texto": "2,25 𝑚"}, {"id": "b", "texto": "3,50 𝑚"}, {"id": "c", "texto": "6,30 𝑚"}, {"id": "d", "texto": "9,25 𝑚"}, {"id": "e", "texto": "12,20𝑚"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 24, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q24-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-peba-q24-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2025.2-peba-q24-3.png", "legenda": null, "ordem": 3}, {"url": "/questoes-facape/2025.2-peba-q24-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-peba-q24-full2.png", "legenda": null, "ordem": 92}, {"url": "/questoes-facape/2025.2-peba-q24-full3.png", "legenda": null, "ordem": 93}]'::jsonb, true
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
  'Física', null, 'Imagine uma fábrica de brinquedos educativos,
desenvolvendo um experimento de física para
crianças. Uma bolinha de massa 𝑚 desliza sem
atrito dentro de um aro circular de raio 𝑟. Ela é
liberada do ponto mais alto 𝐴 , em repouso e, após
percorrer um arco, atinge a posição 𝐵, formando
um ângulo 𝜃 em relação à vertical. Expressando a
gravidade por 𝑔, sua velocidade em 𝐵 pode ser
expressa por:',
  '[{"id": "a", "texto": "√2𝑔𝑟(1 − cos 𝜃)"}, {"id": "b", "texto": "√2𝑔𝑟(1 + cos 𝜃)"}, {"id": "c", "texto": "√2𝑔𝑟(1 − sin 𝜃)"}, {"id": "d", "texto": "√2𝑔𝑟(1 + sin 𝜃)"}, {"id": "e", "texto": "√2𝑔𝑟(1 − tan 𝜃) QUÍMICA"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 25, null, false,
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
  'Química', null, 'As lareiras a gás produzem até 99% menos
emissões nocivas do que as de alimentação a
lenha. A qualidade do ar interior também é maior
em sistemas de aquecimento de lareiras a gás,
pois as novas lareiras são desenvolvidas para
ventilar a maior parte dos poluentes para o
exterior e não para o espaço interior. Na lareira a
lenha, a queima de lenha pode liberar fumaça e
fuligem significativas no ambiente que está
aquecendo, o que resulta em mais bagunça e
comprometimento da qualidade do ar.
Disponível em: https://www.copagaz.com.br/blog/lareira-a-gas-ou-a-lenha/ Acesso em 16.02.2025.
Durante a combustão incompleta do carvão o
monóxido de carbono, CO(g), um gás tóxico,
incolor e inodoro, é liberado e pode levar pessoas
a óbito. A concentração do CO(g) no ar
atmosférico é, normalmente, aproximadamente
igual a 0,001%, em volume. Em concentração de
0,016%, no ar inspirado pelo indivíduo, o CO(g)
provoca uma série de problemas no organismo,
como tontura e fraqueza muscular, e, leva a óbito,
em concentrações iguais ou superiores a 0,1%.
Considerando−se essas informações, seus
conhecimentos de química e admitindo−se que o
CO(g) se comporta como um gás ideal, é
CORRETO concluir que:
Dados: Vm (CNTP) = 22,L.mol–1. N = 6.1023mol–1.
Massas molares (g.mol–1): C = 12 e O = 16. 1cal ≅
4,2J',
  '[{"id": "a", "texto": "Uma amostra que contém 300L de ar atmosférico, medidos nas CNTP, deve conter, aproximadamente, 4mg de CO(g)."}, {"id": "b", "texto": "Para obtenção de 9.1024 moléculas de CO(g) deve–se queimar 150g de carvão C(s)."}, {"id": "c", "texto": "Em um recipiente contendo 15dm3 de ar a quantidade de CO(g) que provoca uma série de problemas no organismo é de 2,0mL"}, {"id": "d", "texto": "Na queima incompleta do carvão com liberação de CO(g) a energia liberada para quebrar as ligações dos reagentes é menor que a energia absorvida para formar as ligações dos produtos."}, {"id": "e", "texto": "De acordo com a reação C(s) + ½O2(g) → CO(g) ΔH = –99kJ/mol, a queima de, aproximadamente, 12kg de C(s), libera a mesma quantidade de calor de um aquecedor que consome 25.000kcal durante seu funcionamento em 1h."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 26, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q26-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Química', null, 'O sistema tampão constituído pelo
bicabornato (HCO3
–
) e pelo ácido
carbônico (H2CO3) tem características especiais
nos líquidos do organismo. O ácido carbônico
(H2CO3) é um ácido bastante fraco e a sua
dissociação em íons hidrogênio (H+) e íons
bicarbonato é mínima, em comparação com
outros ácidos. Quando um ácido é adicionado ao
sangue, o bicarbonato do tampão reage com ele
produzindo um sal, formado com o sódio do
bicarbonato e ácido carbônico. O ácido carbônico
produzido pela reação do bicarbonato do tampão
se dissocia em CO2 e água e é eliminado nos
pulmões.
H
+
(aq) + HCO3
–
(aq) ⇄ H2CO3(aq)
Disponível em:
https://www.ufrgs.br/leo/site_ph/bicarbo
nato.htm Acesso em 16.02.2025.
Em relação ao sistema tampão acima e seus
conhecimentos de química, é CORRETO afirmar
que:',
  '[{"id": "a", "texto": "a adição de OH–(aq) não desloca o equilíbrio."}, {"id": "b", "texto": "substâncias líquidas reagem com maior velocidade que substâncias gasosas."}, {"id": "c", "texto": "quando uma base invade o organismo, o ácido carbônico (H2CO3) reage com ela, produzindo bicarbonato e água."}, {"id": "d", "texto": "o CO2 é um óxido de caráter neutro."}, {"id": "e", "texto": "a velocidade da reação é representada por V = K[H2CO3(aq)]."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 27, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q27-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-peba-q27-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-peba-q27-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'Produzido em reatores de energia em todo o
mundo, o Cobalto–60 (27Co60) emite raios gama, γ,
de alta energia usados no tratamento de
cânceres. O HSA Cobalto–60 está na vanguarda
de novas tecnologias médicas inovadoras. A
terapia com Cobalto–60 permite que os médicos
apliquem doses maiores de radiação em tumores
com danos limitados ao tecido saudável e/ou
órgãos circundantes. Para muitos tipos de câncer,
a terapia com Cobalto–60 é uma das formas mais
precisas e avançadas de tratamento de radiação
disponíveis.
Disponível em:
https://www.nordion.com/products/m
edical-grade-cobalt-60/ Acesso em
16.02.2025.
Sobre química e considerando–se que o tempo de
meia vida do 27Co60 é de, aproximadamente, 5,3
anos, temos que:',
  '[{"id": "a", "texto": "na equação simplificada da desintegração do cobalto–60, 27Co60 → X + –1β 0 + 0γ0 , X é um isótopo do 27Co60."}, {"id": "b", "texto": "os elétrons de maior energia do 27Co60 estão no subnível 4s."}, {"id": "c", "texto": "o radionuclídeo cobalto–60 deixa de emitir radiações β e γ em 5,3 anos."}, {"id": "d", "texto": "o cátion divalente do 27Co60 apresenta 35 nêutrons em seu núcleo."}, {"id": "e", "texto": "as radiações emitidas pelo átomo de 27Co60 apresentam, de maneira geral, elevado poder de penetração."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 28, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q28-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-peba-q28-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-peba-q28-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'A bateria de níquel cádmio é uma bateria com
muito tempo de uso no mercado. Assim é uma
tecnologia já desenvolvida e madura. As baterias
de Ni–Cd preferem carga rápida ao invés de carga
lenta e carga pulsada ao invés de carga contínua.
Todas as outras baterias preferem carga e
descarga moderadas. De fato, a bateria de Ni–Cd
é a única que tem um ótimo desempenho sob
condições rigorosas de trabalho.
Cd(s) + 2Ni(OH)3(s) → Cd(OH)2(s) + 2Ni(OH)2(s)
Disponível em: https://www.sta-eletronica.com.br/artigos/baterias-recarregaveis/baterias-de-nicd/vantagens-e-limitacoes-das-baterias-de-niquel-cadmio-nicd Acesso em 16.02.2025.
Considerando seus conhecimentos de química, as
informações do texto e a equação química acima
que representa a reação global que ocorre nessa
pilha, é CORRETO concluir que:
Dados: Ni (10) e Cd (12).',
  '[{"id": "a", "texto": "Cd sofre redução e o Ni sofre oxidação."}, {"id": "b", "texto": "Ni(OH)2 é uma base forte."}, {"id": "c", "texto": "o número de oxidação do Ni varia duas unidades."}, {"id": "d", "texto": "o Cd cede elétrons ao Ni."}, {"id": "e", "texto": "ocorre aumento da quantidade de matéria de íons OH– no decorrer da reação."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 29, null, false,
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
  'Química', null, 'O omeprazol, massa molar 345gmol–1, é um
fármaco usado para tratar úlceras gástricas
(estômago) e duodenais (intestino) e refluxo
gastresofágico (quando o suco gástrico do
estômago volta para o esôfago). Muitas vezes o
omeprazol é usado também na combinação com
antibióticos para tratar as úlceras associadas às
infecções causadas pela bactéria Helycobacter
pylori.
Disponível em: https://www.drogaraia.com.br/omeprazol-20mg-teuto-generico-com-28-capsulas-gelatinosas.html Acesso em
16.02.2025.
Dados: Massas molares (g.mol–1): C = 12, N = 14,
H = 1, S = 32 e O = 16.
Sobre a estrutura apresentada acima e seus
conhecimentos de química, existe na estrutura
molecular do omeprazol:',
  '[{"id": "a", "texto": "dois grupos funcionais da classe das aminas."}, {"id": "b", "texto": "aproximadamente, 12% em massa de nitrogênio."}, {"id": "c", "texto": "um átomo de enxofre atuando como um ácido de Lewis."}, {"id": "d", "texto": "grupos de classe funcional que reagem com ácidos carboxílicos produzindo éster."}, {"id": "e", "texto": "um carbono quiral. BIOLOGIA"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 30, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q30-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.2-peba-q30-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2025.2-peba-q30-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.2-peba-q30-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Biologia', null, 'A Ecologia estuda as relações entre os seres vivos
e o ambiente em diferentes níveis organizacionais.
Sobre a hierarquia ecológica, analise as
afirmativas a seguir e assinale a alternativa
CORRETA:
I. A hierarquia ecológica começa no organismo,
que é o nível individual.
II. Quando vários organismos da mesma espécie,
coexistem em uma determinada área, formam
comunidades reprodutivas chamadas de
populações.
III. Populações das diferentes espécies coexistem
em associações mais complexas são
denominadas comunidades ecológicas.
IV.As comunidades ecológicas são componentes
biológicos de entidades ainda maiores e mais
complexas chamadas de Biosfera.
V. Relação única e multidimensional de uma
espécie com o seu ambiente é chamada
Ecossistema',
  '[{"id": "a", "texto": "I, II, III, IV e V."}, {"id": "b", "texto": "II, III, IV e V."}, {"id": "c", "texto": "I, II, IV e V."}, {"id": "d", "texto": "I, II, III."}, {"id": "e", "texto": "III, IV e V."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Biologia', null, 'O crescimento populacional é um fenômeno que
pode impactar diversos aspectos ambientais,
sociais e econômicos de uma região. Segundo o
IBGE, a população de Petrolina-PE apresentou um
crescimento expressivo, passando de 293.962
habitantes para 386.791 no último censo (2022).
Com base nesse contexto, analise as afirmativas e
assinale a alternativa CORRETA.
I. O aumento da população pode resultar em
uma maior demanda por recursos naturais,
como água e alimentos, impactando o meio
ambiente.
II. O crescimento populacional pode influenciar
a expansão urbana, aumentando a
necessidade de infraestrutura e serviços
públicos, como saúde, transporte e
saneamento.
III. Um crescimento acelerado pode gerar
desafios socioeconômicos, como
desigualdade social, pressão sobre o
mercado de trabalho e maior produção de
resíduos urbanos.
IV.A densidade populacional de Petrolina
diminui à medida que sua população cresce,
pois há mais pessoas para compartilhar os
mesmos recursos urbanos.',
  '[{"id": "a", "texto": "I, II e III apenas."}, {"id": "b", "texto": "I e IV apenas."}, {"id": "c", "texto": "II e III apenas."}, {"id": "d", "texto": "I, II, III e IV."}, {"id": "e", "texto": "III e IV apenas."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Biologia', null, 'Os organoides são estruturas membranosas,
encontradas nas células eucariontes e que
participam ativamente do metabolismo celular.
Cada uma dessas estruturas tem a sua forma e
desenvolvem funções definidas. Dentro desse
contexto relacione a 2ª coluna de acordo com a
1ª. Assinale a resposta que apresenta o
preenchimento CORRETO.
1ª COLUNA
(1) Lisossomos
(2) Mitocôndrias
(3) Golgiossomos
(4) Retículo Endoplasmático liso
(5) Ergastoplasma
2ª COLUNA
(....) Contêm diversas enzimas digestivas que
degradam qualquer molécula biológica em
componentes menores.
(....) Sítio de síntese de proteínas da membrana
e de proteínas que serão secretadas pela
célula responsável.
(....) É o local de síntese de ácidos graxos e
fosfolipídios
(....) Tem o seu próprio DNA genômico.
(....) Constituída por um número variável de
vesículas circulares achatadas e por
vesículas esféricas de diferentes tamanhos,
que parecem brotar das primeiras.
Preencha CORRETAMENTE a alternativa:',
  '[{"id": "a", "texto": "1, 2, 3, 4 e 5."}, {"id": "b", "texto": "5, 4, 3, 2 e 1."}, {"id": "c", "texto": "1, 5, 4, 2, e 3."}, {"id": "d", "texto": "2, 1, 5, 4 e 3."}, {"id": "e", "texto": "4, 5, 2, 3 e 1."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Biologia', null, 'Durante uma cirurgia cardíaca, a equipe médica
percebeu que uma das válvulas do coração do
paciente estava parcialmente obstruída,
dificultando a passagem do sangue oxigenado
para o corpo. Com base no conhecimento básico
sobre o sistema circulatório, pode-se afirmar que
a válvula afetada é:',
  '[{"id": "a", "texto": "Válvula tricúspide."}, {"id": "b", "texto": "Válvula pulmonar."}, {"id": "c", "texto": "Válvula interventricular."}, {"id": "d", "texto": "Válvula mitral."}, {"id": "e", "texto": "Válvula intraventricular."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Biologia', null, 'O sistema digestório humano é responsável pela
quebra e absorção dos nutrientes essenciais para
o funcionamento do organismo. Considerando os
processos digestivos e a função dos nutrientes,
assinale a alternativa CORRETA:',
  '[{"id": "a", "texto": "A bile, produzida pelo fígado e armazenada no pâncreas, tem a função de digerir proteínas no estômago."}, {"id": "b", "texto": "As enzimas digestivas atuam no intestino delgado, onde ocorre toda a digestão dos alimentos."}, {"id": "c", "texto": "Os carboidratos são quebrados em monossacarídeos, como a glicose, que serve como principal fonte de energia para o organismo."}, {"id": "d", "texto": "As proteínas são absorvidas pelo estômago na forma de aminoácidos, sem necessidade de digestão posterior no intestino."}, {"id": "e", "texto": "As gorduras são absorvidas no intestino grosso após serem quebradas em glicerol e ácidos graxos."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Biologia', null, 'A diversidade biológica, ou biodiversidade, refere-se à variedade de formas de vida existentes no
planeta, abrangendo desde genes e espécies até
ecossistemas inteiros. Sobre esse tema, assinale
a alternativa CORRETA.',
  '[{"id": "a", "texto": "A biodiversidade é maior em regiões de clima temperado do que em regiões tropicais, devido à menor competição entre espécies."}, {"id": "b", "texto": "A fragmentação de habitats e a introdução de espécies exóticas são fatores que contribuem para a perda da biodiversidade."}, {"id": "c", "texto": "Os ecossistemas apresentam uma biodiversidade estática, ou seja, não sofrem alterações ao longo do tempo."}, {"id": "d", "texto": "A perda de uma única espécie em um ecossistema não afeta as demais, pois cada espécie age de forma independente."}, {"id": "e", "texto": "O bioma Amazônico apresenta baixa biodiversidade devido à acidez do solo e à baixa fertilidade natural."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Biologia', null, 'A Caatinga é um bioma exclusivamente brasileiro,
caracterizado por um clima semiárido, vegetação
adaptada à escassez de água e uma fauna
diversificada. Com o avanço das mudanças
climáticas e o aumento das temperaturas globais,
esse ecossistema enfrenta desafios ambientais
significativos. Sobre a relação entre o bioma
Caatinga e o aquecimento global, assinale a
alternativa CORRETA:',
  '[{"id": "a", "texto": "O aumento da temperatura global pode intensificar os períodos de seca na Caatinga, dificultando a regeneração da vegetação e impactando a biodiversidade local."}, {"id": "b", "texto": "A Caatinga não sofre impactos significativos com as mudanças climáticas, pois sua vegetação já é naturalmente adaptada a condições extremas de seca."}, {"id": "c", "texto": "O desmatamento na Caatinga contribui para o sequestro de carbono, ajudando a reduzir os efeitos do aquecimento global."}, {"id": "d", "texto": "O aquecimento global não afeta a fauna da Caatinga, pois os animais desse bioma conseguem se adaptar rapidamente a qualquer mudança climática."}, {"id": "e", "texto": "A degradação da Caatinga não influencia no aquecimento global, pois esse bioma tem pouca importância no ciclo do carbono."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 37, null, false,
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
  'Biologia', null, 'A membrana celular funciona como um filtro
especial com características bem seletivas,
facilitando ou dificultando a entrada e saída de
algumas moléculas ou substâncias para o interior
da célula, propriedade essa denominada
“Permeabilidade Seletiva”. Dentro dessa forma, e
observando a figura abaixo relacionada ao
transporte da membrana, assinale a resposta
CORRETA.',
  '[{"id": "a", "texto": "Trata-se de um tipo de transporte ativo, pois percebe-se a movimentação do soluto se deslocando."}, {"id": "b", "texto": "Trata-se de um tipo de transporte passivo, pois percebe-se a movimentação do soluto se deslocando para o lado hipertônico."}, {"id": "c", "texto": "Trata-se de um tipo de transporte ativo, pois percebe-se a movimentação do solvente se deslocando do local hipertônico para o hipotônico."}, {"id": "d", "texto": "Trata-se de um tipo de transporte passivo, pois percebe-se a movimentação do solvente se deslocando do meio hipotônico para o meio hipertônico."}, {"id": "e", "texto": "Trata-se de um tipo de transporte ativo, pois percebe-se a movimentação do solvente se deslocando do meio hipotônico para o meio hipertônico."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 38, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q38-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Biologia', null, 'Em 2024, as Américas registraram mais de 13
milhões de casos de dengue, dos quais 22.684
foram classificados como graves (0,17% do total)
e 8.186 resultaram em mortes (taxa de letalidade
de 0,063%). Nas primeiras semanas de 2025, 23
países e territórios da região notificaram um total
de 238.659 casos, com a maioria concentrada no
Brasil (87%), seguido pela Colômbia (5,6%),
Nicarágua (2,5%), Peru (2,5%) e México (2,5%).
Destes casos, 263 foram graves e 23 pessoas
morreram em decorrência da doença.
(Organização Pan-Americana da Saúde
(OPAS),10 de Fev. 2025). Diante desse alerta,
percebe-se que a dengue ainda continua sendo
um grande risco para a população. Analise as
afirmativas abaixo relacionada a essa doença e
assinale a alternativa CORRETA:
I. É transmitida pela picada de um mosquito
infectado com um dos quatro sorotipos do
vírus da dengue.
II. A doença não tem um padrão sazonal: a
maioria dos casos no hemisfério sul e no
hemisfério norte ocorrem em qualquer época
do ano.
III. A prevenção e o controle da dengue devem
ser intersetoriais envolvendo famílias e
comunidades.
IV. O crescimento das cidades está entre as
razões mais evidentes da explosão da
doença, pois as populações sofrem com a
falta infraestrutural.',
  '[{"id": "a", "texto": "I, II, III e IV."}, {"id": "b", "texto": "II, III e IV apenas."}, {"id": "c", "texto": "III e IV apenas."}, {"id": "d", "texto": "II e IV apenas."}, {"id": "e", "texto": "I, III e IV apenas."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Biologia', null, 'O sistema nervoso é responsável por coordenar e
regular as funções do organismo, permitindo
respostas a estímulos internos e externos. Entre
os transtornos que afetam esse sistema,
atualmente pode-se destacar: a ansiedade e a
depressão, que têm causas multifatoriais,
incluindo fatores genéticos, ambientais e
neuroquímicos. Estudos apontam que esses
transtornos estão relacionados a um desequilíbrio
na neurotransmissão, especialmente envolvendo
a serotonina, um neurotransmissor associado ao
humor e ao bem-estar.
Com base nesses conhecimentos, assinale a
alternativa que melhor explica o papel da
serotonina na fisiopatologia da ansiedade e
depressão.',
  '[{"id": "a", "texto": "A serotonina atua na regulação do ciclo sono-vigília, sem influência sobre o humor ou as emoções."}, {"id": "b", "texto": "A redução na disponibilidade de serotonina nas sinapses pode contribuir para os sintomas da depressão, levando a tratamentos que visam aumentar sua concentração no cérebro."}, {"id": "c", "texto": "A ansiedade e a depressão são causadas por eventos estressantes, sem influência de fatores neuroquímicos."}, {"id": "d", "texto": "O aumento da serotonina no cérebro leva à inibição completa das emoções, resultando em um estado de apatia permanente."}, {"id": "e", "texto": "O tratamento da depressão e da ansiedade baseia-se com intervenções psicológicas, sem necessidade de atuar sobre neurotransmissores. HISTÓRIA"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'História', null, 'Sobre os povos que habitaram a região de Atenas
antes da formação da cidade-estado como a
conhecemos, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "os atenienses foram os primeiros habitantes da região, sem influência de outros povos."}, {"id": "b", "texto": "os jônios, povo de origem asiática, foram fundamentais na formação de Atenas, trazendo com eles importantes elementos culturais e religiosos."}, {"id": "c", "texto": "os dórios foram os responsáveis pela fundação de Atenas, impondo sua cultura à região."}, {"id": "d", "texto": "os atenienses surgiram a partir da fusão entre os povos espartanos e coríntios, formando uma nova identidade cultural."}, {"id": "e", "texto": "a cidade de Atenas foi originalmente fundada pelos macedônios, que mais tarde se tornaram a principal força da região."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'História', null, 'Sobre a Idade Média Oriental, é CORRETO
afirmar que:',
  '[{"id": "a", "texto": "o Império Bizantino foi um exemplo de centralização política e religiosa, com a Igreja Ortodoxa exercendo grande influência sobre o governo."}, {"id": "b", "texto": "durante a Idade Média, o Império Mongol predominou no Oriente Médio, destruindo os impérios persas e bizantinos."}, {"id": "c", "texto": "o califado abássida rejeitou o conhecimento científico e filosófico grego, centrando-se apenas em questões religiosas."}, {"id": "d", "texto": "a sociedade no Império Bizantino era predominantemente nômade, com tribos em constante deslocamento."}, {"id": "e", "texto": "no Império Otomano, a religião não teve nenhuma influência sobre a política ou a organização social."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'História', null, 'Sobre o Renascimento, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "o Renascimento foi um movimento artístico que teve início na Inglaterra, centrando-se na literatura e na arte."}, {"id": "b", "texto": "o Renascimento foi caracterizado pela redescoberta dos ideais clássicos da Grécia e de Roma, e pelo foco na razão, na ciência e no humanismo."}, {"id": "c", "texto": "o Renascimento foi um movimento religioso, com foco na espiritualidade e nas reformas da Igreja Católica."}, {"id": "d", "texto": "o Renascimento surgiu como uma reação ao Barroco, enfatizando o misticismo e a religião."}, {"id": "e", "texto": "o Renascimento teve início no século XVII, após a Reforma Protestante, como uma reação ao absolutismo."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'História', null, 'Durante o Brasil Império, a saúde pública ainda
era um desafio, com poucos avanços em relação
ao período colonial. Sobre as questões de saúde
nesse período, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "a vacinação contra doenças como a varíola foi amplamente implementada desde o início do Império, alcançando todas as camadas sociais."}, {"id": "b", "texto": "o movimento sanitarista no Brasil Império começou a ganhar força com a \"Reforma Sanitária\" de 1850, implementando medidas eficazes de controle de doenças nas grandes cidades."}, {"id": "c", "texto": "as epidemias, como a febre amarela e a varíola, foram intensamente combatidas com a instalação de hospitais modernos e a construção de sistemas de saneamento básico nas grandes cidades."}, {"id": "d", "texto": "as políticas de saúde eram concentradas exclusivamente na corte imperial, não se estendendo às províncias."}, {"id": "e", "texto": "a figura do médico como profissional qualificado começou a ser valorizada no Império, mas a população rural continuava a recorrer apenas a curandeiros e práticas populares."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'História', null, 'No Brasil, o início do século XX foi marcado por
importantes mudanças na área da saúde pública.
Sobre as políticas de saúde durante a República
Velha (1889-1930), é CORRETO afirmar que:',
  '[{"id": "a", "texto": "as políticas públicas de saúde começaram a ser organizadas e universalizadas desde o início da República, com foco em uma grande rede de hospitais públicos."}, {"id": "b", "texto": "o Instituto Oswaldo Cruz foi criado durante esse período e foi fundamental na luta contra 5 epidemias como a febre amarela, principalmente nas regiões urbanas."}, {"id": "c", "texto": "as questões de saúde eram tratadas exclusivamente pelo governo federal, sem nenhuma parceria com as autoridades locais ou com a Igreja."}, {"id": "d", "texto": "durante a República Velha, a saúde pública no Brasil focava apenas na cura de doenças, sem qualquer preocupação com prevenção ou saneamento básico."}, {"id": "e", "texto": "não houve grande impacto de doenças como a tuberculose e a malária nas grandes cidades, que possuíam infraestrutura de saúde avançada. GEOGRAFIA"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 45, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q45-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Geografia', null, 'Mapa enviado por satélite mostra distribuição de emissões de
carbono no mundo Foto: Divulgação/Nasa.
O Observatório Orbital de Carbono, lançado pela
Nasa em julho de 2014 para monitorar as
emissões do planeta, enviou os primeiros mapas
mostrando os lugares de maior concentração de
dióxido de carbono. Os dados, colhidos durante
algumas semanas de outubro e novembro, podem
ajudar cientistas a entender melhor o impacto das
atividades do homem no clima. Nos mapas, fica
evidente que os gases são misturados por ventos,
formando grandes manchas horizontais ao longo
das linhas de latitude do planeta. É possível
identificar grandes concentrações de dióxido de
carbono, indicadas pela cor vermelha, sobre o
Brasil, o Norte da Austrália e o Sul da África,
provavelmente motivadas por queimadas. Seja a
floresta tropical brasileira ou a savana africana. O
mapa também mostra elevadas concentrações na
América do Norte, Europa e China. Estas podem
estar mais associadas a atividades industriais com
uso de combustíveis fósseis.
Disponível em
https://oglobo.globo.com/brasil/sustenta
bilidade/mapa-feito-via-satelite-mostra-grande-concentracao-de-emissao-de-carbono-no-brasil-14876467 . O Globo,
2014 (Adaptado).
Qual atividade, no Brasil, contribui
significativamente para as emissões?',
  '[{"id": "a", "texto": "Expansão agrícola."}, {"id": "b", "texto": "Incentivo aos fluxos migratórios."}, {"id": "c", "texto": "Expansão dos transportes marítimos."}, {"id": "d", "texto": "Contenção da reserva petrolífera."}, {"id": "e", "texto": "Controle das emissões clorofluorcarbonos (CFCs)."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Geografia', null, '“Nunca é demais repetir que não é por falta de
planos ou de legislação urbanística que as
cidades brasileiras crescem de modo predatório.
Um abundante aparato regulatório normatiza a
produção do espaço urbano no Brasil [...]. A
ineficiência dessa legislação é, de fato, apenas
aparente. Ao lado da detalhada legislação
urbanística (flexibilizada pela pequena corrupção
na cidade legal), é promovido um total laissez-faire
na cidade ilegal. A ocupação ilegal da terra urbana
não só é permitida como é parte do modelo de
desenvolvimento urbano no Brasil [...]. A
ilegalidade da provisão de grande parte das
moradias urbanas (expediente de subsistência e
não mercadoria capitalista) é funcional para a
manutenção do baixo custo da força de trabalho,
como também para um mercado imobiliário
especulativo [...] que se sustenta sobre a estrutura
fundiária arcaica.”
MARICATO, E. As ideias fora do lugar e o
lugar fora das ideias. In: MARICATO, E.;
ARANTES, O.; VAINER, C. A cidade do
pensamento único. Petrópolis: Vozes,
2000. p. 147.
O texto apresenta um problema que tem como
consequência:',
  '[{"id": "a", "texto": "reorganização coletiva."}, {"id": "b", "texto": "avanço tecnológico."}, {"id": "c", "texto": "adaptação ao meio."}, {"id": "d", "texto": "expectativa de vida."}, {"id": "e", "texto": "desigualdade social."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Geografia', null, 'Logo após o golpe, o marechal-presidente Castelo
Branco editou o Estatuto da Terra. A “reforma
agrária” do regime militar não contemplava a
alteração da estrutura fundiária concentradora,
mas sua manutenção. O Estatuto criava
mecanismo legais para a desapropriação dos
latifúndios e dos imóveis improdutivos. Contudo,
para além das palavras vazias, sua meta efetiva
consistia na retomada do caminho da colonização.
A estratégia, associada ao projeto geopolítico de
integração da Amazônia, destinava-se a desafogar
as áreas de conflitos rurais. Durante a ditadura
militar, os conflitos pela terra disseminaram-se por
todo o território nacional, envolvendo uma enorme
diversidade de situações sociais e uma violência
crescente.
A crise agrária é muito mais que um problema do
campo, ela é uma questão política, que resulta na',
  '[{"id": "a", "texto": "exclusão social."}, {"id": "b", "texto": "ampliação do trabalho."}, {"id": "c", "texto": "valorização do campo."}, {"id": "d", "texto": "divisão de latifúndios."}, {"id": "e", "texto": "promoção latifundiária."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
  'peba', 48, null, false,
  '[{"url": "/questoes-facape/2025.2-peba-q48-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Geografia', null, 'A política de abertura econômica transformou a
China em umas das mais importantes plataformas
de exportação de bens de consumo do mundo,
em especial nos setores intensivos em mão de
obra, tais como as indústrias têxtis, de calçados,
de brinquedos, de eletrodomésticos e eletrônicos.
A participação do país no comércio mundial
passou de menos de 1% em 1973 para perto de
5% em 2002.
DEMÉTRIO. M. Geografia: a construção
do mundo: Geografia Geral e do Brasil.
Comunicação cartográfica Marcello
Martinelli. – 1. Ed. Editora: Moderna. São
Paulo, 2005.
A introdução da China no mercado mundial
caracterizou-se pela:',
  '[{"id": "a", "texto": "subordinação de mercado."}, {"id": "b", "texto": "repartição de bens."}, {"id": "c", "texto": "violência de preço."}, {"id": "d", "texto": "integração da economia."}, {"id": "e", "texto": "diversificação da função."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
  'Geografia', null, 'Regiões onde as placas deslizam lateralmente,
sem destruição ou geração de crosta, ou seja,
suas bordas ficam conservadas, embora ocorram
tremores de terra. Esse tipo de limite é encontrado
na América do Norte, onde a Placa do Pacífico,
sobre a qual se localizam a cidade de Los Angeles
e a Zona da Baixa Califórnia, se desloca em
direção ao norte em relação à Placa Norte-Americana. Nesta placa se situa a cidade de San
Francisco, onde são registrados terremotos com
frequência.
LUÍS, J. A. Geografia: leituras e
interação, volume 1. 1. ed. São Paulo:
Leya, 2013.
Qual o tipo de limites de placa é descrito no texto?',
  '[{"id": "a", "texto": "Transformantes."}, {"id": "b", "texto": "Convergentes."}, {"id": "c", "texto": "Divergentes."}, {"id": "d", "texto": "Construtivos."}, {"id": "e", "texto": "Destrutivos."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.2 - Rede PEBA/Bolsistas',
  '2025.2-peba', 'FACAPE 2025.2 - Rede PEBA/Bolsistas', 2025, 2,
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
