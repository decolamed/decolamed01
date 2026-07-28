-- ============================================================================
-- DECOLA MED — SEED: FACAPE 2025.1 - Rede PEBA/Bolsistas
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
  'Português', null, '“A forma física e a boa saúde não são
sinônimos, mas complementares entre si.
Enquanto uma boa saúde significa simplesmente
a ausência de doenças, a forma física pressupõe
energia suficiente para buscar as recompensas
da vida e não depender fisicamente de outras
pessoas. Na Medicina do Esporte, considera-se
de capital importância o problema de prevenir ou
remediar os efeitos negativos de um estilo de
vida sedentário e do envelhecimento. Portanto, a
atividade física adequada constitui-se em um
componente importante dos regimes
terapêuticos para o controle e tratamento da
doença coronariana, da hipertensão arterial, da
obesidade, das doenças musculoesqueléticas,
das doenças respiratórias e da depressão. A
forma física pode proporcionar também
sensação de bem-estar e autoestima.”
Disponível em: https://www.scielo.br (adaptado)
Sobre o texto, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "os médicos do esporte aconselham que todos devem fortalecer a musculatura para melhorar a questão postural como também definir o corpo."}, {"id": "b", "texto": "os profissionais da Medicina do Esporte somente reconhecem uma pessoa saudável quando praticam esportes e consomem produtos que complementam a alimentação."}, {"id": "c", "texto": "a estratégia mais recomendada pelos médicos do esporte é a prática intensa de exercícios físicos uma vez que potencializa a coordenação motora e aumenta a força muscular."}, {"id": "d", "texto": "se trata de uma reportagem com o objetivo de esclarecer os efeitos negativos do sedentarismo visto que é um problema crescente na sociedade atual, afetando a saúde de inúmeras pessoas."}, {"id": "e", "texto": "no período “A forma física pode proporcionar também sensação de bem-estar e autoestima.”, os termos “bem-estar” e “autoestima” são regidos pelo termo regente “sensação”."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Português', null, '“A base da neurociência está no entendimento
dos neurônios, que são células especializadas do
sistema nervoso. E tais células atuam na
transmissão de sinais elétricos e químicos,
chamados de impulsos nervosos, por meio do
corpo.
Essas comunicações sucedem nas sinapses,
que se tratam das junções entre os neurônios,
onde há a liberação dos neurotransmissores para
que esses transmitam os sinais entre neurônios.
Esses processos constituem a base da
comunicação neural que ampara os aspectos do
pensamento, do comportamento e da percepção
humana.”
Disponível em: https://conceito.de/neurociencia
(adaptado)
Assinale a alternativa em que se faz um
comentário CORRETO acerca dos recursos
coesivos empregados no texto.',
  '[{"id": "a", "texto": "O coesivo “que” em “A base da neurociência está no entendimento dos neurônios, que são células especializadas do sistema nervoso.” inicia uma oração de natureza adjetiva que explica uma informação sobre o termo antecedente."}, {"id": "b", "texto": "A palavra “tais” em “E tais células atuam na transmissão de sinais elétricos e químicos, chamados de impulsos nervosos, por meio do corpo.” serve para conectar uma relação lógica que estabelece uma ideia de consequência."}, {"id": "c", "texto": "O demonstrativo “Essas” em “Essas comunicações sucedem nas sinapses, que se tratam das junções entre os neurônios...” é um coesivo que faz referência a um termo subsequente a várias informações contidas no texto."}, {"id": "d", "texto": "O coesivo destacado em “...onde há a liberação dos neurotransmissores para que esses transmitam os sinais entre neurônios.” introduz uma sequência que estabelece relação lógico- semântica de condição."}, {"id": "e", "texto": "O coesivo “que” em “Esses processos constituem a base da comunicação neural que ampara os aspectos do pensamento, do comportamento e da percepção humana.” serve para expressar uma sequência de ações com aspectos da dimensão espaço-temporal."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Português', null, 'Considere o texto de Michael Laub e assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "A palavra “inconformado” orienta o leitor sobre o uso exagerado das redes sociais que pode causar impactos na saúde mental."}, {"id": "b", "texto": "A palavra “excessivo” cumpre a função de evidenciar que as redes sociais são ações involuntárias de quem as acessa."}, {"id": "c", "texto": "A palavra “clichê” é um recurso expressivo que, no contexto, foi utilizada para garantir a originalidade e a qualidade do texto."}, {"id": "d", "texto": "A palavra “que” em “que vê na genialidade...” é um recurso linguístico em processo de coesão textual."}, {"id": "e", "texto": "A palavra “prolongamento” expressa uma circunstância adverbial de intensidade."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 3, null, false,
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
  'Português', null, 'Epigrama Nº2
“És precária e veloz, Felicidade.
Custas a vir, e, quando vens, não te demoras.
Foste tu que ensinaste aos homens que havia
tempo,
e, para te medir, se inventaram as horas.
Felicidade, és coisa estranha e dolorosa.
Fizeste para sempre a vida ficar triste:
porque um dia se vê que as horas todas passam,
e um tempo, despovoado e profundo, persiste.”
A partir da leitura do poema de Cecília Meireles,
analise as afirmações a seguir:
I. O tema abordado é sobre os caminhos que as
pessoas devem trilhar para alcançar a
extrema felicidade.
II. O emprego da forma verbal “Foste” no verso
“Foste tu que ensinaste aos homens que havia
tempo,” faz com que as pessoas passassem a
acreditar mais no tempo.
III. As palavras sublinhadas no verso “Felicidade,
és coisa estranha e dolorosa.” enfatizam o
emprego de uma hipérbole.
IV. No verso “porque um dia se vê que as horas
todas passam,”, o substantivo “horas” e a
forma verbal “passam” sugerem que a
felicidade é transitória.
Dentre as afirmativas acima, estão CORRETAS:',
  '[{"id": "a", "texto": "apenas I e II."}, {"id": "b", "texto": "apenas II e IV."}, {"id": "c", "texto": "apenas II e III."}, {"id": "d", "texto": "apenas III e IV."}, {"id": "e", "texto": "apenas I, II e III."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Português', null, '“Os Dispositivos Eletrônicos para Fumar (DEFs),
que englobam os cigarros eletrônicos e produtos
de tabaco aquecido, possuem quantidades
variáveis de nicotina e outras substâncias tóxicas,
tornando suas emissões prejudiciais tanto para
quem faz o uso direto quanto para quem é
exposto aos aerossóis. Mesmo alguns produtos
que alegam não conter nicotina, eles podem
apresentar a substância em sua composição e
suas emissões são nocivas.
A nicotina causa dependência e pode afetar
negativamente o desenvolvimento cerebral de
crianças e adolescentes, impactando no
aprendizado e na saúde mental. O consumo de
tabaco é um importante fator de risco para
doenças cardiovasculares e respiratórias, mais
de 20 tipos ou subtipos diferentes de câncer e
muitas outras condições de saúde debilitantes.”
Disponível em:https://www.canalsaude.fiocruz.br
Sobre o texto, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "na passagem “Os Dispositivos Eletrônicos para Fumar (DEFs), que englobam os cigarros eletrônicos e produtos de tabaco aquecido...”, os termos sublinhados exercem, respectivamente, a função morfológica de preposição e conjunção."}, {"id": "b", "texto": "o autor propõe uma consulta pública sobre o uso dos cigarros eletrônicos no Brasil."}, {"id": "c", "texto": "na passagem “Mesmo alguns produtos que alegam não conter nicotina, eles podem apresentar a substância em sua composição e suas emissões são nocivas.”, os termos sublinhados exercem, do ponto de vista sintático, a função de adjunto adnominal."}, {"id": "d", "texto": "o objetivo do autor é informar ao leitor que nem todo tipo de nicotina afeta o desenvolvimento cerebral do fumante."}, {"id": "e", "texto": "através desta afirmativa “O consumo de tabaco é um importante fator de risco para doenças cardiovasculares e respiratórias...”, o autor esclarece que o consumo de cigarros eletrônicos causa envelhecimento precoce."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 5, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q05-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Português', null, 'Disponível em: https://www.fhemig.mg.gov.br
Sobre a campanha, no cartaz acima, pode-se
afirmar que:',
  '[{"id": "a", "texto": "a palavra “azul” foi empregada para esclarecer que essa luta é direcionada apenas para os homens com probabilidade de contrair câncer de próstata."}, {"id": "b", "texto": "a imagem dos personagens sorridentes evidencia o entusiasmo do autor pelo fato de ter criado a campanha."}, {"id": "c", "texto": "o uso da palavra “Saúde”, em destaque, recomenda que todo homem, acima dos sessenta anos, deve se manter ativo e buscar hábitos de vida saudáveis como também realizar exames de rastreio para um diagnóstico precoce."}, {"id": "d", "texto": "A frase exclamativa é característica linguística de uma função da linguagem que pretende influenciar o leitor a aderir o objetivo da campanha."}, {"id": "e", "texto": "o emprego da palavra “prevenção” sugere que um paciente deve consultar regularmente um médico proctologista para que possa avaliar o tamanho, a forma e a textura da próstata."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 6, null, false,
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
  'Português', null, '“A arritmia cardíaca é uma condição
caracterizada pela falta de ritmo nos batimentos
do coração. Ela pode ser sintoma de algum
problema (físico ou psicológico) para o
organismo ou fruto de um desequilíbrio do
próprio órgão.
Dentro das arritmias, existem as taquicardias
(quando o ritmo é acelerado) e as bradicardias
(quando a cadência é lenta demais). Ambas
podem se agravar e levar ao colapso do coração.
Disponível em: https://www.gov.br/pt-br
Com o intuito de atingir seu objetivo
comunicativo, o autor produziu esse texto para:',
  '[{"id": "a", "texto": "sensibilizar as pessoas que praticam esporte, sem orientação de um especialista, a respeito dos cuidados com a arritmia cardíaca."}, {"id": "b", "texto": "orientar o leitor que arritmia cardíaca deve ser tratada através de medicamentos e da prática de vida saudável (alimentação balanceada e exercícios físicos)."}, {"id": "c", "texto": "demonstrar que somente as bradicardias podem causar danos irreversíveis à saúde."}, {"id": "d", "texto": "convencer o leitor de que as arritmias cardíacas também podem ser assintomáticas."}, {"id": "e", "texto": "apresentar ao leitor, através de uma linguagem denotativa, informações sobre arritmia cardíaca."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Inglês', null, 'De acordo com a tirinha abaixo, o beija-flor:
https://andrewsmcmedsyndication.com',
  '[{"id": "a", "texto": "faz pouco barulho ao voar."}, {"id": "b", "texto": "é um grande pássaro."}, {"id": "c", "texto": "o metabolismo dele é simples."}, {"id": "d", "texto": "bebe metade do próprio peso em água açucarada por dia."}, {"id": "e", "texto": "voa, ininterrupatamente, 12 horas por dia."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 11, 'ingles', false,
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
  'Inglês', null, 'Mike felt like a fish out of water at the business
convention his new girlfriend begged him to
attend.
A expressão idiomática – like a fish out of water –
da expressão acima significa:',
  '[{"id": "a", "texto": "sentir-se inadequado em algum lugar."}, {"id": "b", "texto": "fica-se à vontade."}, {"id": "c", "texto": "desfrutar ao máximo de oportunidades em curto período de tempo."}, {"id": "d", "texto": "misturar-se a outras pessoas para não ser notado."}, {"id": "e", "texto": "ser o mais inteligente do grupo."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 12, 'ingles', false,
  '[{"url": "/questoes-facape/2025.1-peba-q12-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Inglês', null, '“You have brains in your head. You have feet in
your shoes. You can steer yourself any direction
you choose.” Dr. Seuss
O ditado de dr. Seuss afirma que:',
  '[{"id": "a", "texto": "Estar-se preso ao próprio destino."}, {"id": "b", "texto": "Nada acontece às pessoas por acaso."}, {"id": "c", "texto": "Sem estudo não se alcança o sucesso."}, {"id": "d", "texto": "Depende-se de outras pessoas para ser guiado."}, {"id": "e", "texto": "Pode-se escolher qual caminho seguir."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 13, 'ingles', false,
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
  'Inglês', null, 'A palavra ‘you’ na expressão – you have brains in
your head - do dito da questão 13, analisada
sintaticamente é um:',
  '[{"id": "a", "texto": "Objeto direto."}, {"id": "b", "texto": "Sujeito."}, {"id": "c", "texto": "Pronome reflexivo."}, {"id": "d", "texto": "Adjunto adnominal restritivo."}, {"id": "e", "texto": "Pronome relativo."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Inglês', null, 'California auto insurance rates are skyrocketing:
Here’s why and how to save
https://latimes.com
Qual é o significado da palavra ‘skyrocketing’?',
  '[{"id": "a", "texto": "Aumentar o valor do seguro de carro lentamente."}, {"id": "b", "texto": "Aumentar o valor de seguro de carro tanto quanto a média histórica."}, {"id": "c", "texto": "Continuar nos mesmos valores de anos anteriores."}, {"id": "d", "texto": "Diminuir os valores de forma jamais vista."}, {"id": "e", "texto": "Aumentar os valores do seguro automotivo de forma significativa. TEXTO PARA AS QUESTÕES 11 A 14 En el corazón del turismo masivo de Barcelona: “Que el Park Güell esté lleno demuestra que hay que verlo” Los visitantes de tres de las zonas elegidas por el Ayuntamiento para gestionar la masificación aplauden la idea de una ‘app’ que les avise de la afluencia Un verano de récord de turistas en Barcelona. Con la perspectiva de que la ciudad supere las cifras de visitantes previas a la pandemia (2019 se cerró con 17 millones de pernoctaciones y casi 28 millones de visitantes en total) la masificación turística molesta a los vecinos de las zonas más tensionadas y preocupa al Ayuntamiento. Coincidiendo con un verano en el que ha habido varias protestas ciudadanas contra los efectos de la turistificación (subida de precio de la vivienda, presión sobre los servicios públicos o pérdida de la identidad local); el Gobierno de Jaume Collboni ha delimitado las 16 zonas más masificadas de la ciudad y estrena las primeras medidas en tres de los llamados Espacios de Gran Afluencia (EGA). Son la Sagrada Familia, el Park Güell y el mercado de la Boqueria, sobre los que se actuará de forma prioritaria. Visitados los tres espacios, los turistas no muestran disgusto por la masificación, entienden que si hay tanta gente es porque valen la pena y aplauden la idea del consistorio de crear, en el futuro, una aplicación de móvil que avise de la afluencia de visitantes en los principales puntos de interés. CALVO, S. En el corazón del turismo masivo de Barcelona: “Que el Park Güell esté lleno demuestra que hay que verlo”. Disponível em: <https://elpais.com/espana/catalunya/2024-08- 20/en-el-corazon-del-turismo-masivo-de-barcelona-que-el-park-guell-este-lleno-demuestra-que-hay-que-verlo.html>. Acesso em: 10 ago. 2024."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Espanhol', null, 'Qual é o objetivo principal da nova ''app''
mencionada no texto?',
  '[{"id": "a", "texto": "Oferecer descontos em restaurantes."}, {"id": "b", "texto": "Avisar sobre a afluência de visitantes nos principais pontos turísticos."}, {"id": "c", "texto": "Melhorar a qualidade dos serviços públicos."}, {"id": "d", "texto": "Facilitar a compra de bilhetes para o transporte público."}, {"id": "e", "texto": "Promover eventos culturais na cidade."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 11, 'espanhol', false,
  '[{"url": "/questoes-facape/2025.1-peba-q11-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Espanhol', null, 'Qual é uma das consequências da turistificação
mencionadas no texto?',
  '[{"id": "a", "texto": "Redução dos preços dos imóveis."}, {"id": "b", "texto": "Melhoria dos serviços públicos."}, {"id": "c", "texto": "Aumento da pressão sobre os serviços públicos."}, {"id": "d", "texto": "Criação de novas áreas comerciais."}, {"id": "e", "texto": "Ampliação dos espaços culturais."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Espanhol', null, 'O que pensam os turistas sobre a massificação
dos locais visitados?',
  '[{"id": "a", "texto": "Eles estão insatisfeitos e querem alternativas."}, {"id": "b", "texto": "Eles acham que a masificação é um problema sério e devem ser tomados cuidados."}, {"id": "c", "texto": "Eles acreditam que se há tanta gente é porque os locais são valiosos e aplaudem a ideia da ''app''."}, {"id": "d", "texto": "Eles pedem para que o governo tome medidas para diminuir a quantidade de turistas."}, {"id": "e", "texto": "Eles preferem evitar esses locais devido à quantidade de visitantes."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 13, 'espanhol', false,
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
  'Espanhol', null, 'Na frase “16 zonas” como se escreveria o
número em questão por extenso em espanhol?',
  '[{"id": "a", "texto": "diciseis"}, {"id": "b", "texto": "deziseis"}, {"id": "c", "texto": "deseis"}, {"id": "d", "texto": "diesseis"}, {"id": "e", "texto": "dieciséis"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 14, 'espanhol', false,
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
  'Espanhol', null, 'As frases a seguir estão CORRETAS quanto ao
uso de preposições, EXCETO:',
  '[{"id": "a", "texto": "todas las mujeres del curso han estudiado mucho."}, {"id": "b", "texto": "los valores de las casas están en aumento potencial."}, {"id": "c", "texto": "no recuerdo bien la cara de tu padre."}, {"id": "d", "texto": "me gusta cocinar por las mañanas."}, {"id": "e", "texto": "comí manzana por la noche."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 15, 'espanhol', false,
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
  'Matemática', null, 'Um maratonista vai disputar a maratona de São
Paulo e optou por correr os 21 km de prova.
Para isso ele intensificou seu treinamento em
uma pista de atletismo na qual cada volta
corresponde a 400 metros. Ele iniciou o seu
primeiro dia de treinamento correndo 15 voltas
nessa pista. Para cada um dos dias seguintes de
treino ele planeja dar duas voltas a mais na pista
do que no treino do dia anterior, até o dia em
que a distância total da maratona que ele vai
correr seja ultrapassada. Se ele cumpriu
rigorosamente o planejamento dos treinos, então
ele atingiu a meta da distância desejada no:',
  '[{"id": "a", "texto": "19º dia."}, {"id": "b", "texto": "20º dia."}, {"id": "c", "texto": "38º dia."}, {"id": "d", "texto": "39º dia."}, {"id": "e", "texto": "40º dia"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 16, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q16-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'O proprietário de uma academia de ginástica
adquiriu uma bicicleta ergométrica nova e a usou
em seu estabelecimento por alguns meses. Após
o período de uso, resolveu vender a bicicleta
ergométrica usada para adquirir uma mais
moderna. No entanto, nessa negociação, ele
vendeu por R$ 4.160,00, o que representou uma
desvalorização de 20% com relação ao preço
pelo qual ele havia adquirido a bicicleta.
Conclui–se, portanto, que o valor da bicicleta
ergométrica nova, quando o proprietário da
academia a adquiriu foi igual a:',
  '[{"id": "a", "texto": "R$ 3.328,00"}, {"id": "b", "texto": "R$ 4.992,00"}, {"id": "c", "texto": "R$ 5.000,00"}, {"id": "d", "texto": "R$ 5.200,00"}, {"id": "e", "texto": "R$ 5.892,00"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 17, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q17-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'O aparelho popularmente conhecido como
“bafômetro”, que é usado pelos agentes de
fiscalização do trânsito para medir o teor do
consumo de álcool por parte dos condutores de
veículos, indicará a ocorrência de crime de
trânsito quando o aparelho marcar o consumo
igual ou superior a 0,34 mg de álcool por litro de
ar expelido pelos pulmões. Assim, se um novo
aparelho passar a indicar a medição em g/L
(gramas por litro), a indicação da ocorrência de
crime de trânsito feita por esse aparelho será:',
  '[{"id": "a", "texto": "34 g/L."}, {"id": "b", "texto": "3,4 g/L."}, {"id": "c", "texto": "0,034 g/L."}, {"id": "d", "texto": "0,0034 g/L."}, {"id": "e", "texto": "0,00034 g/L."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 18, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q18-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-peba-q18-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Matemática', null, 'Tem–se duas equipes de um curso de medicina:
a equipe A composta por 6 alunos e a equipe B
formada por 8 alunos. Deverão ser selecionados
6 alunos para apresentação de um trabalho,
sendo 3 alunos de cada equipe. A quantidade de
maneiras diferentes como essas equipes
poderão ser formadas será igual a:',
  '[{"id": "a", "texto": "20"}, {"id": "b", "texto": "56"}, {"id": "c", "texto": "760"}, {"id": "d", "texto": "1120"}, {"id": "e", "texto": "1200"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 19, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q19-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'Uma esfera decorativa de vidro possui um orifício
que permite que seja colocado um líquido
colorido dentro dessa esfera, de modo que a
pessoa que vai fazer a decoração do ambiente
possa encher a esfera com o líquido da forma
como desejar. Durante uma decoração evitou–se
encher completamente a esfera com o líquido,
colocando dentro dela somente 70% de sua
capacidade. Sabendo que o raio interno da
esfera é igual a 10 cm, e adotando 3 como o
valor de π, é possível concluir que o volume do
líquido, em litros, que foi colocado na esfera de
vidro nessa decoração do ambiente foi:',
  '[{"id": "a", "texto": "280"}, {"id": "b", "texto": "28"}, {"id": "c", "texto": "2,80"}, {"id": "d", "texto": "0,28"}, {"id": "e", "texto": "0,028 FÍSICA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 20, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q20-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-peba-q20-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Física', null, 'Uma esfera carregada 8𝜇𝐶 é suspensa por um
fio inextensível e sem massa. O sistema é então
submetido a um campo eletrostático de
intensidade 106 𝑉⁄𝑚 , conforme a figura.
Sabendo-se que o ângulo formado após o
equilíbrio é de 30° , determine o valor da tensão
no fio:
(dados: 𝑠𝑖𝑛 30° = 0,50 e 𝑠𝑖𝑛 60° = 0,87)',
  '[{"id": "a", "texto": "8 𝑁"}, {"id": "b", "texto": "16 𝑁"}, {"id": "c", "texto": "18 𝑁"}, {"id": "d", "texto": "20 𝑁"}, {"id": "e", "texto": "32 𝑁"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 21, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q21-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Dado um condutor circular de raio 𝑅 , um
portador de carga 𝑞 a percorre com velocidade
escalar 𝑣 . Podemos encontrar a intensidade
média da corrente elétrica através da relação:',
  '[{"id": "a", "texto": "𝑞 𝑅 𝑣"}, {"id": "b", "texto": "𝑞 𝑣 𝑅"}, {"id": "c", "texto": "2𝜋𝑞𝑅"}, {"id": "d", "texto": "𝑞 𝑣 𝜋𝑅2"}, {"id": "e", "texto": "𝑞 𝑣 2𝜋𝑅"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 22, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q22-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Considere uma régua cujo comprimento próprio
é de 40 𝑐𝑚 . Esta régua está se movendo
paralelamente à sua maior dimensão com uma
velocidade de 0,8𝑐 (onde (𝑐) é a velocidade da
luz) em relação a um observador fixo. De acordo
com a teoria da relatividade restrita, o
comprimento de um objeto em movimento é
percebido com dimensões diferentes por um
observador que não está em movimento com o
objeto. Esse fenômeno é conhecido como
contração do comprimento. Desse modo, qual é
o comprimento da régua para esse observador
fixo?',
  '[{"id": "a", "texto": "24 𝑐𝑚"}, {"id": "b", "texto": "32 𝑐𝑚"}, {"id": "c", "texto": "50 𝑐𝑚"}, {"id": "d", "texto": "64 𝑐𝑚"}, {"id": "e", "texto": "67 𝑐𝑚"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 23, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q23-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-peba-q23-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Física', null, 'Um projétil é lançado horizontalmente, com
velocidade mínima suficiente para entrar em
órbita circular rasante à superfície da Terra. Qual
o valor do período de sua órbita, sabendo-se que
o raio da Terra é 6400𝑘𝑚 e considerando o valor
de 𝜋 igual á 3 e 𝑔 = 10 𝑚 𝑠
2 ⁄ ?',
  '[{"id": "a", "texto": "2800𝑠"}, {"id": "b", "texto": "3800𝑠"}, {"id": "c", "texto": "4800𝑠"}, {"id": "d", "texto": "5800𝑠"}, {"id": "e", "texto": "6800𝑠 QUÍMICA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 25, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q25-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-peba-q25-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'Um estudo recém-publicado aponta que
pessoas que consomem adoçantes artificiais
em excesso podem ter maior risco de
desenvolver alguns tipos de câncer. O trabalho
incluiu mais de 100 mil franceses, que tiveram
seus hábitos alimentares avaliados por um
tempo médio de sete anos. No fim da análise,
os participantes que tinham um consumo
“acima da média” de adoçantes estavam 13%
mais propensos a desenvolver algum tumor.
Acessulfame–k e aspartame, dois aditivos de
origem sintética usados em bebidas e
alimentos, foram os mais relacionados à
doença. Esses compostos são representados
pelas estruturas abaixo.
Dados: 16S (16), 6C (14), 7N (15), 8O (16), 19K (1) e
1H (1)
Acessulfame–k
Aspartame
Disponível
em:https://saude.abril.com.br/alimentacao/
novo-estudo-relaciona-adocante-a-cancer-ha-motivo-para-se-preocupar Acesso em
12.08.2024.
Analisando as estruturas do acessulfame–k e
aspartame temos:',
  '[{"id": "a", "texto": "as mesmas funções orgânicas nos dois compostos."}, {"id": "b", "texto": "o enxofre compartilhando dois pares de elétrons na estrutura do acessulfame–k."}, {"id": "c", "texto": "grupo metil na estrutura do aspartame."}, {"id": "d", "texto": "a função cetona no acessulfame–k."}, {"id": "e", "texto": "menos de 10 pares de elétrons não compartilhados na estrutura do aspartame."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 26, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q26-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.1-peba-q26-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-peba-q26-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'O resveratrol, um tipo de polifenol, pode ser
encontrado em mais de 70 espécies de plantas,
sendo mais abundante na casca e nas sementes
das uvas. Naturalmente, essa substância protege
plantas e frutos contra radiação ultravioleta e
infecções microbianas, o que lhe confere
propriedades antioxidantes e anti-inflamatórias
notáveis. Sabemos que as uvas vermelhas,
especialmente aquelas mais escuras e suas
cascas, são fontes significativas desse composto.
Estudos indicam que o resveratrol pode ajudar a
reduzir os níveis de colesterol LDL (mau
colesterol) e aumentar os níveis de colesterol
HDL (bom colesterol), contribuindo assim para a
saúde cardiovascular.
colesterol
resveratrol
Disponível em:
https://www.clinicavascullarefoz.com.b
r/beneficios-do-resveratrol-para-a-saude-vascular-conheca Acesso em
12.08.2024.
Analisando as estruturas do colesterol e
resveratrol temos:',
  '[{"id": "a", "texto": "nove carbonos quirais no colesterol."}, {"id": "b", "texto": "que o colesterol é gordura que circula pelo sangue podendo provocar doenças fatais."}, {"id": "c", "texto": "elevado caráter alcalino no resveratrol."}, {"id": "d", "texto": "aproximadamente quatro vezes mais hidrogênios na estrutura do colesterol."}, {"id": "e", "texto": "o resveratrol com dois anéis aromáticos três hidrogênios não ionizáveis."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 27, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q27-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.1-peba-q27-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-peba-q27-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'O zinco metálico reage fortemente com uma
solução aquosa de ácido clorídrico. O resultado
é uma produção de uma grande quantidade de
gás hidrogênio e formação de cloreto de zinco
na solução. Considere que 9,75g de zinco
impuro e sólido são consumidos completamente
por uma solução ácida de HCℓ. Na reação
coleta–se 8,2L de hidrogênio sobre água a 27°C
a pressão total de 257mmHg.
Dados massas molares (g/mol): Zn = 65, H = 1,
Cℓ = 35,5.
R = 0,082L.atm/mol.K, 1 atm = 760 mmHg e N =
6.1023mol–1.
Considerando que a pressão de vapor da água a
27ºC é igual a 29 mmHg, é correto concluir
como verdadeiro que na reação:',
  '[{"id": "a", "texto": "são produzidos 0,1g de hidrogênio."}, {"id": "b", "texto": "a pureza do zinco utilizado é próxima de 70%."}, {"id": "c", "texto": "foram utilizados 9.1023 átomos de zinco."}, {"id": "d", "texto": "foram consumidos 3,25g de zinco."}, {"id": "e", "texto": "6,5g de impurezas não reagem com a solução ácida."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 28, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q28-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.1-peba-q28-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-peba-q28-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'O tampão bicarbonato é o principal
sistema tampão do fluido extracelular (plasma,
linfa e interstício) e baseia–se no equilíbrio entre
a quantidade de dióxido de carbono dissolvido
no plasma e o íon bicarbonato proveniente da
dissociação do ácido carbônico. O íon
bicarbonato, em solução aquosa, estabelece
simultaneamente os seguintes equilíbrios:
I. HCO–
3(aq) + H2O(ℓ) ⇌ H3O+(aq) + CO2–3(aq) Ka =
4,7x10–11
II. HCO–
3(aq) + H2O(ℓ) ⇌ H2CO3(aq) + OH–(aq) Kb =
2,2x10–8
Com base na informação e equações acima, é
CORRETO afirmar que:',
  '[{"id": "a", "texto": "o íon bicarbonato age como ácido e base de Bronsted–Lowry."}, {"id": "b", "texto": "a hidrólise do íon bicarbonato ocorre apenas em I."}, {"id": "c", "texto": "uma solução de HCO3 – (aq) apresenta pH < 7."}, {"id": "d", "texto": "adicionando–se H2CO3(aq) ao sistema em equilíbrio ocorrerá deslocamento diminuindo a concentração de HCO– 3(aq)."}, {"id": "e", "texto": "em solução aquosa o ácido carbônico é monoprótico"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 29, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q29-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.1-peba-q29-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2025.1-peba-q29-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Química', null, 'O processo Haber–Bosch é uma importante
reação química utilizada para a produção em
larga escala de amônia, a partir do nitrogênio e
do hidrogênio. Desenvolvido por Fritz Haber e
Carl Bosch no início do século XX, esse
processo é fundamental para a produção de
fertilizantes e outros produtos químicos.
Disponível em:
https://brasilescola.uol.com.br/tire-duvidas/descreva-o-processo-haber-bosch Acesso em 13.08.24.
A reação abaixo representa a síntese de amônia
pelo processo Harber.
N2(g) + 3H2(g) ⇌ 2NH3(g) + 52,4 Kcal (P, T)
Dados massas molares (g/mol): N = 14 e H = 1.
A partir da análise desse sistema pode–se
afirmar que:',
  '[{"id": "a", "texto": "na formação de 1 mol de NH3(g) , a P e T constantes, há absorção de uma quantidade de calor igual a 26,2 Kcal."}, {"id": "b", "texto": "a conversão de N2(g) em NH3(g) é favorecida pelo aumento da temperatura."}, {"id": "c", "texto": "a decomposição da amônia, em fase gasosa, é uma reação endotérmica."}, {"id": "d", "texto": "ocorre expansão de volume na reação de formação de NH3(g), a pressão constante."}, {"id": "e", "texto": "a reação de 28g de N2(g) com 6g de H2(g) indicam que o nitrogênio encontra–se em excesso. BIOLOGIA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 30, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q30-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-peba-q30-full2.png", "legenda": null, "ordem": 92}, {"url": "/questoes-facape/2025.1-peba-q30-full3.png", "legenda": null, "ordem": 93}]'::jsonb, true
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
  'Biologia', null, 'As enzimas são proteínas que atuam como
catalisadores biológicos. Elas apresentam
características de especificidades, garantindo
assim condições especiais em seu mecanismo
de atuação. Ainda sobre essas proteínas, pode-se dizer também, que atuam dentro das suas
particularidades, no metabolismo celular no
comando do material genético.
Sobre as características de especificidades das
enzimas, NÃO se pode falar que:',
  '[{"id": "a", "texto": "São suscetíveis a temperatura, quando muito elevada, são desnaturadas por modificar o centro ativo."}, {"id": "b", "texto": "Atuam em pH específicos, assim, cada enzima tem um pH próprio."}, {"id": "c", "texto": "São chamadas de catalizadores orgânicos."}, {"id": "d", "texto": "São sensíveis a variações de substratos."}, {"id": "e", "texto": "Quando estas alcançam a velocidade máxima no metabolismo, atuam com maior rapidez, ativando o centro ativo na concentração de substratos."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Biologia', null, 'Com relação ao enunciado da questão 31, pode-se dizer que as enzimas são produzidas nas
células em orgânulos denominados:',
  '[{"id": "a", "texto": "Ribossomos e Ergastoplasmas."}, {"id": "b", "texto": "Mitocôndrias e Lisossomos."}, {"id": "c", "texto": "Lisossomos e Golgiossomos."}, {"id": "d", "texto": "Centrossomos e Golgiossomos."}, {"id": "e", "texto": "Ergastoplasmas e Lisossomos."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Biologia', null, 'Assinale a alternativa INCORRETA:',
  '[{"id": "a", "texto": "O núcleo celular é uma estrutura das células eucarióticas, representa o centro de controle das atividades celulares."}, {"id": "b", "texto": "O núcleo contém maquinarias moleculares especiais para o desenvolvimento do processo de duplicação do DNA."}, {"id": "c", "texto": "O núcleo não é responsável pela síntese de processamento dos tipos de RNAs."}, {"id": "d", "texto": "O núcleo não sintetiza proteínas, mas, são dependentes das proteínas produzidas no citoplasma e assim direcionadas para o núcleo."}, {"id": "e", "texto": "O núcleo tem forma variável e adquire características referentes à cada tipo celular, mas apresenta-se, geralmente, como uma estrutura arredondada ou alongada."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 33, null, false,
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
  'Biologia', null, '“A equipe brasileira de ginástica rítmica ficou de
fora da final nas Olimpíadas de Paris-2024, pois
Victoria Borges sofreu uma lesão na panturrilha e
não conseguiu realizar corretamente seus
movimentos na apresentação das
classificatórias,”
(Por Carol Knoploch — Paris, França
09/08/2024 22h26)”
O trecho acima fala de uma lesão na panturrilha
da atleta brasileira, que apresentou dificuldades
de movimentos musculares em sua
apresentação. Diante desse fato, pode-se dizer
que lesões musculares ocorrem:
I. Quando um indivíduo apresenta falta de
condicionamento físico e não utiliza técnica
adequada na hora de realizar exercícios antes
de exercer alguma atividade física.
II. Quando há falta de aquecimento antes da
prática dos exercícios e cansaço extremo.
III. Quando um músculo ou um tendão que se
prende ao osso é submetido a um esforço
muito grande, podendo romper ou lesionar
algumas fibras musculares.
IV. Em atletas ou esportistas devido ao excesso
de atividades físicas.
Estão CORRETAS:',
  '[{"id": "a", "texto": "I, II e III"}, {"id": "b", "texto": "I, II e IV"}, {"id": "c", "texto": "III e IV"}, {"id": "d", "texto": "I, II e IV"}, {"id": "e", "texto": "I e IV."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Biologia', null, 'As principais causas do aquecimento global
estão relacionadas a atividades humanas. Diante
do quadro abaixo, é INCORRETO afirmar que:
https://www.unicef.org/brazil/blog/compreendendo-mudancas-climaticas',
  '[{"id": "a", "texto": "O aquecimento global, que hoje o mundo vivencia, sempre aconteceu, pois, é uma forma natural do ambiente relacionar com o seu meio físico-químico. Portanto, não deve ser um fenômeno preocupante para a sociedade."}, {"id": "b", "texto": "As ações humanas contribuem fortemente para o aumento das mudanças climáticas por meio da queima de combustíveis fósseis, desmatamento e queimadas, que por sua vez liberam diversos gases de efeito estufa na atmosfera."}, {"id": "c", "texto": "O aumento da temperatura no planeta eleva a intensidade e frequência de secas, enchentes e tempestades severas, além de contribuir para o aumento do nível do mar, derretimento das calotas polares e interferir na biodiversidade."}, {"id": "d", "texto": "O aquecimento global é uma consequência do uso abusivo e exacerbado dos recursos naturais que tem contribuído para o aumento das mudanças climáticas, transformando assim o cenário natural em um caos mundial."}, {"id": "e", "texto": "Que as consequências climáticas afetam diferentes comunidades e grupos étnicos. Essas desigualdades prejudicam em especial as parcelas mais vulneráveis da sociedade."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 35, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q35-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.1-peba-q35-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'Biologia', null, 'A intolerância à lactose é a incapacidade de
digerir o açúcar lactose devido a uma deficiência
da enzima digestiva lactase, provocando diarreia
e cólicas abdominais. Os sintomas em crianças
incluem diarreia e baixo ganho de peso,
enquanto os sintomas em adultos incluem
distensão abdominal, cólicas, diarreia, flatulência
e náusea.
Sobre a lactose e a lactase analise as seguintes
afirmativas.
I. A lactose, predominante presente no leite e
laticínios, é decomposta pela enzima lactase,
produzida por células do revestimento interno
do intestino delgado.
II. A lactase decompõe a lactose, um açúcar
complexo, em seus dois compostos: glicose e
galactose. Posteriormente, esses açúcares
simples são absorvidos pela parede intestinal
e entram na corrente sanguínea.
III. A lactose e a lactase são proteínas presentes
no leite e normalmente são absorvidas pelas
células intestinais.
IV.A lactose e a lactase são carboidratos
presentes no leite produzidas pelo organismo
respectivamente.
Estão CORRETAS:',
  '[{"id": "a", "texto": "III e IV"}, {"id": "b", "texto": "I e III"}, {"id": "c", "texto": "I e IV"}, {"id": "d", "texto": "II e IV"}, {"id": "e", "texto": "I e II"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Biologia', null, 'Relacione a 2ª coluna de acordo com a 1ª.
1ª COLUNA
(1) Ecótono
(2) Biocenose
(3) Biosfera
(4) Bioma
(5) Ecossistemas
2ª COLUNA
(....) é a unidade básica ao redor da qual se
pode organizar a teoria e a prática em ecologia.
(....) são diferenciados pelas plantas
predominantes associadas a um clima
particular (especialmente temperatura e
precipitação).
(....) a parte do ambiente da Terra onde são
encontrados os organismos vivos.
(....) comunidades bióticas que habitam um
espaço definido ao mesmo tempo.
(....) a existência de interação ativa entre dois
ou mais ecossistemas.
Assinale a alternativa que preenche
CORRETAMENTE a 2ª coluna:',
  '[{"id": "a", "texto": "1, 2, 3, 4 e 5"}, {"id": "b", "texto": "2, 3, 4, 5 e 1"}, {"id": "c", "texto": "3, 4, 5, 2 e 1"}, {"id": "d", "texto": "5, 4, 3, 2 e 1"}, {"id": "e", "texto": "4, 5, 3, 2 e 1."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Biologia', null, 'A anemia falciforme é uma alteração genética,
autossômica recessiva, causada por uma
mutação no gene da globina beta da
hemoglobina, originando, no lugar da
hemoglobina A (HbA), uma hemoglobina mutante
denominada hemoglobina S (HbS). Esta
hemoglobina S. em algumas situações, provoca
a distorção dos eritrócitos, fazendo-os tomar a
forma de “foice” ou “meia-lua”, com
consequente anemia, vaso-oclusão, dor e lesões
de órgãos-alvos. Um casal portador para esse
tipo de herança, apresenta-se como:',
  '[{"id": "a", "texto": "portador de um gene de hemoglobina normal (HbA) e um gene com a mutação falciforme (HbS), formando o genótipo HbAS. O indivíduo HbAS é assintomático."}, {"id": "b", "texto": "portador de um gene de hemoglobina normal (HbS) e um gene com a mutação falciforme (HbS), formando o genótipo HbSS. O indivíduo HbSS é assintomático."}, {"id": "c", "texto": "portador de um gene de hemoglobina normal (HbAA) e um gene com a mutação falciforme (HbSS), formando o genótipo HbAASS. O indivíduo HbAASS é assintomático."}, {"id": "d", "texto": "portador de um gene de hemoglobina normal (HbAS) e um gene com a mutação falciforme (HbAA), formando o genótipo HbAS. O indivíduo HbAS é assintomático."}, {"id": "e", "texto": "portador de um gene de hemoglobina normal (HbSS) e um gene com a mutação falciforme (HbAS), formando o genótipo HbAS. O indivíduo HbAS é assintomático."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Biologia', null, '“Campanha Nacional de Vacinação contra a
Poliomielite será realizada no período de 27 de
maio a 14 de junho, sendo o dia 8 de junho o dia
“D” de divulgação e mobilização nacional, data
proposta para a adesão dos estados e dos
municípios. Na ocasião, as Unidades Federadas
e os municípios terão autonomia para definir a
realização de outras datas de mobilização para a
vacinação, em conformidade com a realidade
local.”
https://www.cosemssp.org.br/noticias/ca
mpanha-nacional-de-vacinacao-contra-a-poliomielite/
A Poliomielite é uma doença grave, caracterizada
por um quadro de paralisia flácida. Essa doença
é causada:',
  '[{"id": "a", "texto": "por uma bactéria que em geral acomete os membros inferiores de forma assimétrica e irreversível."}, {"id": "b", "texto": "por um protozoário que não só ataca os membros inferiores, mas também os comandos motores superiores de forma irreversível."}, {"id": "c", "texto": "por poliovírus que pode causar paralisia muscular dos membros inferiores de forma assimétrica e irreversível."}, {"id": "d", "texto": "por um retrovírus que não só ataca os membros superiores e inferiores, como também provoca a paralisia cerebral."}, {"id": "e", "texto": "por um retrovírus que pode causar paralisia muscular dos membros inferiores de forma assimétrica e irreversível. HISTÓRIA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'História', null, '"Concluídas as pesquisas nos arredores, e
recolhidas as armas e munições de guerra, os
jagunços reuniram os cadáveres que jaziam
esparsos em vários pontos. Decapitaram-nos.
Queimaram os corpos. Alinharam depois, nas
duas bordas da estrada, as cabeças,
regularmente espaçadas, fronteando-se, faces
volvidas para o caminho. Por cima, nos arbustos
marginais mais altos, dependuraram os restos de
fardas, calças e dólmãs multicores, selins,
cinturões, quepes de listras rubras, capotes,
mantas, cantis e mochilas...
CUNHA, Euclides da. Os Sertões. São Paulo:
Martins Fontes, 2000.
Com base no contexto histórico da obra e sua
importância para a historiografia brasileira,
assinale a alternativa que identifica o conflito da
Primeira República abordado no livro
mencionado.',
  '[{"id": "a", "texto": "Revolta da Vacina."}, {"id": "b", "texto": "Revolta da Chibata."}, {"id": "c", "texto": "Guerra de Canudos."}, {"id": "d", "texto": "Guerra do Contestado."}, {"id": "e", "texto": "Revolta de Juazeiro."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'História', null, 'Sólon contribuiu significativamente para a
redução das tensões sociais e estabeleceu as
bases para o desenvolvimento futuro de Atenas.
Assinale a alternativa que apresenta uma das
reformas implementadas por Sólon durante seu
período como legislador.',
  '[{"id": "a", "texto": "Abolir a escravidão por dívida."}, {"id": "b", "texto": "Criar a Democracia ateniense."}, {"id": "c", "texto": "Fornecer legislação favorável aos Eupátridas."}, {"id": "d", "texto": "Redistribuir terras da aristocracia."}, {"id": "e", "texto": "Pagamentos em espécie para os soldados de Atenas."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'História', null, 'Caio Júlio César (Gaius Julius Caesar) foi um dos
líderes mais importantes de Roma, nascido em
100 a.C. e assassinado em 44 a.C. Sua influência
marcou profundamente a história romana.
Assinale a alternativa que identifica o cargo que
caracterizou Júlio César e foi sua função nos
últimos dias de sua vida.',
  '[{"id": "a", "texto": "Soldado Romano."}, {"id": "b", "texto": "Senador Romano."}, {"id": "c", "texto": "Monarca Romano."}, {"id": "d", "texto": "Imperador Romano."}, {"id": "e", "texto": "Ditador vitalício Romano."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 43, null, false,
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
  'História', null, 'Getúlio Vargas é amplamente reconhecido como
o "pai" da legislação trabalhista no Brasil.
Durante seu governo, especialmente durante a
Era Vargas (1930-1945), Vargas implementou
uma série de leis que transformaram as relações
de trabalho no país. assinale a alternativa
INCORRETA sobre as leis trabalhistas criadas
durante seu governo:',
  '[{"id": "a", "texto": "Jornada de Trabalho de 8 horas."}, {"id": "b", "texto": "Adicional de férias."}, {"id": "c", "texto": "Salário-Mínimo."}, {"id": "d", "texto": "Férias Remuneradas."}, {"id": "e", "texto": "Direito à Organização Sindical."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 44, null, false,
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
  'História', null, 'A charge apresentada faz referência a qual
evento específico da Segunda Guerra Mundial?',
  '[{"id": "a", "texto": "O ataque de Hitler à Polônia em 1939."}, {"id": "b", "texto": "A Batalha na França."}, {"id": "c", "texto": "A Criação do EIXO."}, {"id": "d", "texto": "O pacto nazi-soviético de não agressão."}, {"id": "e", "texto": "O Holoucasto. GEOGRAFIA"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 45, null, false,
  '[{"url": "/questoes-facape/2025.1-peba-q45-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Geografia', null, 'A produção industrial também é uma das
principais responsáveis pela poluição das águas
fluviais, lacustres e oceânicas. As indústrias
químicas, petroquímicas e as usinas nucleares
apresentam maior risco de poluição das águas e
do solo, tanto no seu processo de produção
como nos chamados acidentes ambientais.
Durante os séculos XX, foram registrados
dezenas de casos com consequências sociais e
ambientais desastrosas, sobretudo nas regiões
industriais mais importantes dos países. Na
América do sul, a principal área sujeita a esse
tipo de acidente é o eixo formado pelas regiões
industriais do Sudeste do Brasil.
LUÍS, A. J. Geografia: Leituras e interação. 1. Ed.
Leya. São Paulo, 2013.
Um dos elementos que promove o fenômeno
apresentado no texto é:',
  '[{"id": "a", "texto": "fatores locacionais."}, {"id": "b", "texto": "fiscalização dos órgãos governamentais."}, {"id": "c", "texto": "efetivação das legislações ambientais."}, {"id": "d", "texto": "concentração restrita das indústrias."}, {"id": "e", "texto": "polo de fiscalização."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Geografia', null, 'Numa nação caracterizada pelo poder de
grandes proprietários rurais, muitos deles donos
de imensos e insolados latifúndios que podiam
alcançar o tamanho de uma cidade, autoritarismo
e personalismo foram sempre realidades fortes, a
enfraquecer o exercício livre do poder público, a
desestimular o fortalecimento das instituições e
com isso a luta por direitos.
Lilia M. Schwarcz e Eloisa M. Starling. Brasil uma
biografia. Editora: Companhia das Letras. São
Paulu, 2015.
Uma ação capaz de reparar historicamente o
problema mencionado no texto é o(a):',
  '[{"id": "a", "texto": "repartição de bens."}, {"id": "b", "texto": "reforma tributária."}, {"id": "c", "texto": "redistribuição latifundiária."}, {"id": "d", "texto": "flexibilização das leis de terra."}, {"id": "e", "texto": "manutenção das terras improdutivas."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Geografia', null, 'Em “Os Sertões”, Euclides da Cunha, delimita as
características da paisagem do Sertão brasileiro:
“[...] linha variável ao longo do tempo que se
encontra no meio da junção mais profunda de
um vale ou rio.”
A situação descrita no texto, é característica
própria de:',
  '[{"id": "a", "texto": "Planaltos elevados."}, {"id": "b", "texto": "Serras complexas."}, {"id": "c", "texto": "Talwegs deprimidos."}, {"id": "d", "texto": "Encostas íngremes."}, {"id": "e", "texto": "Enseadas costeiras."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
  'peba', 48, null, false,
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
Os “Anos de Chumbo”, foi um período de
desenvolvimento econômico exploratório e
concentrador de renda, voltado unicamente aos
interesses das classes dominantes. Apesar do
hiato atemporal, hoje se percebe o quanto
“comportamento geral” ainda reflete muito sobre
a situação social do Brasil.
PINHEIRO, P. H. "Tudo vai bem": Gonzaguinha e
a infeliz atemporalidade de "Comportamento
Geral". TMDQA, 2020. Disponível em:
https://www.tenhomaisdiscosqueamigos.com/20
20/04/08/gonzaguinha-comportamento-geral/
(Adaptado).
A situação social que afetou o Brasil do século
XX é mencionado nos versos da canção, de
1973 pela ideia de:',
  '[{"id": "a", "texto": "Conformidade."}, {"id": "b", "texto": "Transcendência."}, {"id": "c", "texto": "Harmonia."}, {"id": "d", "texto": "Censura."}, {"id": "e", "texto": "Condenação."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
  'Geografia', null, 'As rochas são agregados naturais, formados por
um ou mais minerais. Entre os minerais, minérios
são aqueles dos quais é possível extrair
substâncias de interesse econômico. Os
minérios só são considerados, portanto, uma
classe especial no interior dos minerais em
função da atividade humana. No conjunto dos
minérios, destacam-se por suas propriedades
particulares aqueles utilizados para obtenção de
metais, como ferro, o alumínio, o manganês, o
cobre, o estanho, o níquel, o ouro, a prata e
outros. Denominados minérios metálicos.
Os minérios mencionados no texto, sua formação
é resultante do processo de:',
  '[{"id": "a", "texto": "Gentrificação."}, {"id": "b", "texto": "Solidificação."}, {"id": "c", "texto": "Erosão."}, {"id": "d", "texto": "Sedimentação."}, {"id": "e", "texto": "Segregação. Você deve notar que não tem mais tutu E dizer que não está preocupado Você deve lutar pela xepa da feira E dizer que está recompensado Você deve estampar sempre um ar de alegria E dizer: tudo tem melhorado Você deve rezar pelo bem do patrão E esquecer que está desempregado Você merece, você merece Tudo vai bem, tudo legal Cerveja, samba, e amanhã, Seu Zé Se acabarem teu carnaval? Você merece, você merece Tudo vai bem, tudo legal In. GONZAGUINHA, L. G. J. Comportamento Geral. 1973"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Rede PEBA/Bolsistas',
  '2025.1-peba', 'FACAPE 2025.1 - Rede PEBA/Bolsistas', 2025, 1,
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
