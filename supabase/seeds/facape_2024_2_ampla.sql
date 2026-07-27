-- ============================================================================
-- DECOLA MED — SEED: FACAPE 2024.2 - Ampla Concorrência
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
  'Português', null, 'Na passagem “... mesmo que você seja doador de
órgãos...” o operador coesivo destacado
estabelece:',
  '[{"id": "a", "texto": "uma relação lógico-semântica de causalidade."}, {"id": "b", "texto": "a localização temporal dos fatos anteriormente expostos."}, {"id": "c", "texto": "uma restrição com relação ao que está exposto anteriormente."}, {"id": "d", "texto": "um acréscimo de argumentos a favor de determinada condição."}, {"id": "e", "texto": "um valor de concessão que pode ser substituído, sem alteração de sentido, por ‘embora’."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 1, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q01-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Português', null, '“Ando com uma vontade tão grande de receber
todos os afetos, todos os carinhos, todas as
atenções. Quero colo, quero beijo, quero cafuné,
abraço apertado, mensagem na madrugada,
quero flores, quero doces, quero música, vento,
cheiros, quero parar de me doar e começar a
receber. Sabe, eu acho que não sei fechar ciclos,
colocar pontos finais. Comigo são sempre
vírgulas, aspas, reticências. Eu vou gostando, eu
vou cuidando, eu vou desculpando, eu vou
superando, eu vou compreendendo, eu vou
relevando, eu vou… e continuo indo, assim, desse
jeito, sem virar páginas, sem colocar pontos. E vou
dando muito de mim, e aceitando o pouquinho
que os outros tem para me dar.”
Caio Fernando Abreu
O propósito comunicativo do texto é:',
  '[{"id": "a", "texto": "através da função conativa da linguagem, atrair a atenção do leitor com a intenção de influenciá-lo."}, {"id": "b", "texto": "através da função informativa da linguagem, demonstrar que as formas verbais empregadas no gerúndio caracterizam conflitos antagônicos."}, {"id": "c", "texto": "através da função emotiva da linguagem, enfatizar aspectos emocionais."}, {"id": "d", "texto": "através da função metalinguística da linguagem, denunciar que vivemos em uma sociedade marcada pela violência e pela dominação."}, {"id": "e", "texto": "através da função fática da linguagem, criticar a realidade social do seu tempo."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 2, null, false,
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
  'Português', null, 'As frases abaixo são de autoria do médico
psicanalista Roberto Shinyashiki. Assinale a
alternativa em que o termo sublinhado funciona,
do ponto de vista morfológico, como conjunção
subordinativa integrante.',
  '[{"id": "a", "texto": "“Às vezes os problemas são sinais de que chegou a hora de o guerreiro iniciar uma nova batalha.”."}, {"id": "b", "texto": "“Você tem mais valor do que qualquer cargo.”."}, {"id": "c", "texto": "“Se você faz o que todo mundo faz, chega aonde todos chegam. Se você quer chegar aonde a maioria não chega, precisa fazer algo que a maioria não faz.”."}, {"id": "d", "texto": "“Tudo que um sonho precisa para ser realizado é alguém que acredite que ele possa ser realizado.”."}, {"id": "e", "texto": "“A pessoa que comete erros e não consegue assumi-los e mudar de atitude, faz de sua vida um campo de batalha.”."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 3, null, false,
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
  'Português', null, 'Despedida
“Por mim, e por vós, e por mais aquilo
que está onde as outras coisas nunca estão,
deixo o mar bravo e o céu tranquilo:
quero solidão.
Meu caminho é sem marcos nem paisagens.
E como o conheces? - me perguntarão.
- Por não ter palavras, por não ter imagens.
Nenhum inimigo e nenhum irmão.
Que procuras? - Tudo. Que desejas? - Nada.
Viajo sozinha com o meu coração.
Não ando perdida, mas desencontrada.
Levo o meu rumo na minha mão.
A memória voou da minha fronte.
Voou meu amor, minha imaginação...
Talvez eu morra antes do horizonte.
Memória, amor e o resto onde estarão?
Deixo aqui meu corpo, entre o sol e a terra.
(Beijo-te, corpo meu, todo desilusão!
Estandarte triste de uma estranha guerra...)
Quero solidão.”
Cecília Meireles
Sobre o poema de Cecília Meireles, pode-se
afirmar que a autora:',
  '[{"id": "a", "texto": "fez uso de uma prosopopeia no verso “A memória voou da minha fronte.”."}, {"id": "b", "texto": "manifesta o desejo de orientar o leitor a ter inspiração poética através do verso “Meu caminho é sem marcos nem paisagens.”."}, {"id": "c", "texto": "demonstra, nitidamente, um preconceito da sociedade com relação à busca da solidão."}, {"id": "d", "texto": "explora um tom intensamente irônico nos versos “Viajo sozinha com o meu coração.” e “Não ando perdida, mas desencontrada.”."}, {"id": "e", "texto": "sensibiliza o leitor para a importância da solidão no verso “Memória, amor e o resto onde estarão?”."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 4, null, false,
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
  'Português', null, '“A arte é a capacidade humana de criação. É a
expressão ou aplicação de habilidades criativas e
a imaginação para criar obras que são apreciadas
principalmente por sua beleza, intelecto ou poder
emocional. Seus resultados são obtidos por
distintos meios. A arte de cozinhar, de pintar
quadros, de grafitar, as artes plásticas, a arte de
compor (poemas e partituras musicais), a gravura,
a impressão de livros e, até mesmo, atrelados a
um conceito mais severo, meios, hoje em dia,
causadores de grande repulsa social, como a
caça e a guerra, podem ser considerados como
arte. O ser humano e a arte estão rigorosamente
conectados. A arte liberta. E, atualmente, a arte de
viver cada vez mais se faz indispensável para a
emancipação humana.”
Disponível em: https://www.significados.com.br
(adaptado)
Sobre os aspectos linguísticos presentes no texto,
assinale a alternativa CORRETA.',
  '[{"id": "a", "texto": "O termo destacado na frase “A arte é a capacidade humana de criação.” tem valor circunstancial de modo."}, {"id": "b", "texto": "O termo destacado na passagem “É a expressão ou aplicação de habilidades criativas e a imaginação para criar obras...” expressa valor de referência temporal."}, {"id": "c", "texto": "A frase “Seus resultados são obtidos por distintos meios.” foi construída na voz passiva sintética."}, {"id": "d", "texto": "O termo destacado na frase “O ser humano e a arte estão rigorosamente conectados.” exerce, do ponto de vista morfológico, a função de substantivo."}, {"id": "e", "texto": "O termo destacado no trecho “E, atualmente, a arte de viver cada vez mais se faz indispensável para a emancipação humana.” funciona, do ponto de vista sintático, como complemento de um nome."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 5, null, false,
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
  'Português', null, 'Disponível em: https://www.politicadistrital.com.br
A campanha publicitária, acima, veiculada em
forma de literatura de cordel, tem por objetivo:',
  '[{"id": "a", "texto": "evidenciar a importância da água na agricultura irrigada."}, {"id": "b", "texto": "estimular a captação de água da chuva e reaproveitá-la para uso doméstico."}, {"id": "c", "texto": "informar a sociedade que o volume de água em todo o planeta é distribuído de forma desigual."}, {"id": "d", "texto": "divulgar para a população rural que o consumo crescente de água e energia causam um impacto negativo na natureza."}, {"id": "e", "texto": "alertar a população sobre a importância do consumo consciente da água."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 6, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q06-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Português', null, '“Um dos principais motores do avanço da ciência
é a curiosidade humana, descompromissada de
resultados concretos e livre de qualquer tipo de
tutela ou orientação. A produção científica movida
simplesmente por essa curiosidade tem sido
capaz de abrir novas fronteiras do conhecimento,
de nos tornar mais sábios e de, no longo prazo,
gerar valor e mais qualidade de vida para o ser
humano.
Por meio dos seus métodos e instrumentos, a
ciência nos permite analisar o mundo ao redor e
ver além do que os olhos podem enxergar. O
empreendimento científico e tecnológico do ser
humano ao longo de sua história é, sem dúvida
alguma, o principal responsável por tudo que a
humanidade construiu até aqui.”
Disponível em: https://www.ipea.gov.br (adaptado)
O uso dos recursos linguísticos morfológicos e
sintáticos, em relação ao contexto, são
organizados através do emprego de palavras e
expressões. Nessa perspectiva, assinale a
alternativa que define CORRETAMENTE o
emprego adequado desses recursos.',
  '[{"id": "a", "texto": "A expressão avanço da ciência em “Um dos principais motores do avanço da ciência é a curiosidade humana...” expressa uma circunstância de modo."}, {"id": "b", "texto": "A palavra capaz e a expressão de abrir novas fronteiras em “A produção científica movida simplesmente por essa curiosidade tem sido capaz de abrir novas fronteiras do conhecimento...” estabelecem uma relação de regência nominal."}, {"id": "c", "texto": "A palavra mais em “...gerar valor e mais qualidade de vida para o ser humano.” é um advérbio que expressa valor de intensidade."}, {"id": "d", "texto": "Os adjetivos métodos e instrumentos em “Por meio dos seus métodos e instrumentos, a ciência nos permite analisar o mundo ao redor e ver além do que os olhos podem enxergar.” fortalecem uma análise mais profunda sobre a ciência."}, {"id": "e", "texto": "O pronome sua estabelece com a palavra história em “O empreendimento científico e tecnológico do ser humano ao longo de sua história é, sem dúvida alguma, o principal responsável por tudo que a humanidade construiu até aqui.” uma relação de concordância verbal."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 7, null, false,
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
  'Inglês', null, 'O homem em pé afirma que:',
  '[{"id": "a", "texto": "gosta do relógio do bebedor de café."}, {"id": "b", "texto": "admira a filosofia de vida do homem sentado à mesa."}, {"id": "c", "texto": "a frase – don´t talk to me until I´ve had coffee – significa que o apreciador de café já tomou a xícara de café."}, {"id": "d", "texto": "houve perfeito entendimento entre os personagens desde a primeira frase do diálogo."}, {"id": "e", "texto": "o apreciador de café mostrou a camisa com dizeres errados ao ruivo em um dos quadrinhos."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 11, 'ingles', false,
  '[{"url": "/questoes-facape/2024.2-ampla-q11-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Inglês', null, 'Escolha a alternativa CORRETA de acordo com as
regras da norma culta da língua inglesa.',
  '[{"id": "a", "texto": "O verbo like na seguinte oração – I like your shirt. – está conjugado no presente do indicativo."}, {"id": "b", "texto": "A expressão ‘don´t talk to me’ – refere-se ao homem em pé."}, {"id": "c", "texto": "O verbo ‘don´t’ é usado em frases afirmativas para expressar algo de forma convincente."}, {"id": "d", "texto": "Os dois homens adoram conversar."}, {"id": "e", "texto": "A palavra ‘so’ na expressão – so why aren´t you listening to it?’ – é pronome pessoal do caso reto."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 12, 'ingles', false,
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
  'Inglês', null, 'Escolha a opção que completa, apropriadamente,
o sentido da frase abaixo.
The plane ____________________ at 9:30 a.m.',
  '[{"id": "a", "texto": "Commited suicide"}, {"id": "b", "texto": "Landed"}, {"id": "c", "texto": "Worked"}, {"id": "d", "texto": "Insisted"}, {"id": "e", "texto": "Taught"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 13, 'ingles', false,
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
  'Inglês', null, 'Selecione o item CORRETO abaixo de acordo
com a definição de inteligência.
A very general mental capability that, among other
things, involves the ability to reason, plan, solve
problems, think abstractly, comprehend complex
ideas, learn quickly and learn from experience. It
is not merely book learning, a narrow academic
skill, or test-taking smarts. Rather, it reflects a
broader and deeper capability for comprehending
our surroundings—"catching on," "making sense"
of things, or "figuring out" what to do.
https://en.wikipedia.org/wiki/Intelligence',
  '[{"id": "a", "texto": "Depende exclusivamente do aprendizado através de leitura."}, {"id": "b", "texto": "A palavra ‘rather’, na quarta linha, significa desta forma."}, {"id": "c", "texto": "A palavra surroundings na quinta linha é verbo conjugado no presente do indicativo."}, {"id": "d", "texto": "Broader and deeper são substantivos que significam mais largo e mais profundo."}, {"id": "e", "texto": "Inclui os diversos aspectos da capacidade mental."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 14, 'ingles', false,
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
  'Inglês', null, 'Qual das alternativas abaixo mostra a CORRETA
desinência que se deve usar para se conjugar um
verbo regular no pretérito perfeito:',
  '[{"id": "a", "texto": "Will"}, {"id": "b", "texto": "Es"}, {"id": "c", "texto": "Ed"}, {"id": "d", "texto": "A letra x."}, {"id": "e", "texto": "Ies. Leia o texto a seguir para responder às questões de 11 a 15. TEXTO: En 1988, la Autoridad de Asignación de Números de Internet distribuía los dominios de dos letras para cada país. Para España .es, a México .mx, .uk para Reino Unido. Anguila no lo sabía, pero tuvo suerte de que le otorgaran .ai. Casi 40 años después, el auge de la inteligencia artificial ha beneficiado a esta isla, que tiene el dominio que coincide con las siglas en inglés para esta tecnología. Cada vez más empresas, grandes y pequeñas, quieren hacer sitios especializados con IA y utilizar sus siglas en la web, pero tienen que pagar para hacerlo. La suerte de Anguila se convirtió en fortuna, pues estas inversiones ahora representan un tercio de los ingresos del Gobierno de este pequeño territorio británico ubicado a unos 250 kilómetros de Puerto Rico. Las playas de mar azul, la arena blanca y los arrecifes de coral son los principales atractivos de esta isla, que depende en gran medida del turismo. Era así hasta que a finales de 2020 llegó la primera pincelada de un nuevo negocio: se produjo la primera venta del dominio más caro de la isla, el portal expert.ai, a cambio de 95.000 euros. Sin embargo, la verdadera suerte empezó el 30 de noviembre de 2022, fecha del lanzamiento de ChatGPT y cuando se dispararon las compras de dominios con esa misma terminación. Solo cinco meses después, las ventas habían aumentado casi cuatro veces, relata a EL PAÍS Vince Cate, quien maneja los registros para el gobierno de Anguila. “Ya representamos aproximadamente un tercio del presupuesto de Gobierno”, agrega. Cada Gobierno gestiona las tasas y la duración de los dominios, explica Gonzalo de la Cruz, de Especialistas Web. En España, el coste de cada .es va desde uno hasta 10 euros aproximadamente y se renueva cada año. Anguila ha ganado tres millones de dólares tan solo en enero (unos 2.700.000 euros), pero Cate estima que la cifra se duplicará cuando deban renovarse. “Hacemos los dominios por dos años, así que todo nuestro dinero ahora son dominios nuevos”, apunta. “Si mantenemos este nivel de tres millones por mes para nuevos dominios, cuando las renovaciones entren en vigor dentro de un año, saltaremos a seis millones por mes”. El PAÍS, 2024."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 15, 'ingles', false,
  '[{"url": "/questoes-facape/2024.2-ampla-q15-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Espanhol', null, 'Considerando que o título de um texto prenuncia
seu tema central, selecione a alternativa que
melhor condiz com o texto acima.',
  '[{"id": "a", "texto": "Cada vez más empresas, grandes y pequeñas, quieren hacer sitios especializados con IA."}, {"id": "b", "texto": "Las playas de mar azul, la arena blanca y los arrecifes de coral son los principales atractivos de esta isla caribeña."}, {"id": "c", "texto": "Anguila ha ganado tres millones de dólares."}, {"id": "d", "texto": "Una pequeña isla caribeña está haciendo una fortuna gracias a la inteligencia artificial."}, {"id": "e", "texto": "La venta del dominio más caro del Caribe."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 11, 'espanhol', false,
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
  'Espanhol', null, 'De acordo com o texto como a ilha de Anguila está
fazendo fortuna atualmente?',
  '[{"id": "a", "texto": "Através da venda de domínios de internet com a terminação \".ai\", que coincide com as siglas em inglês para inteligência artificial."}, {"id": "b", "texto": "Explorando o turismo com suas belas praias de mar azul e areia branca."}, {"id": "c", "texto": "Lançando uma nova versão “pirata” do ChatGPT."}, {"id": "d", "texto": "Renovando diversos tipos de licenças."}, {"id": "e", "texto": "Anguila está fazendo fortuna através da exportação de produtos agrícolas locais para países vizinhos."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 12, 'espanhol', false,
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
  'Espanhol', null, 'Qual dos seguintes fatos sobre Anguila é
verdadeiro, de acordo com o texto?',
  '[{"id": "a", "texto": "Anguila é conhecida por suas montanhas imponentes e ricas tradições culturais."}, {"id": "b", "texto": "O turismo é a única fonte de renda para o governo de Anguila."}, {"id": "c", "texto": "Anguila recebeu o domínio \".ai\" por acaso e/ou sorte."}, {"id": "d", "texto": "O governo de Anguila não cobra taxa de renovação para os domínios \".ai\"."}, {"id": "e", "texto": "A venda do domínio mais caro de Anguila ocorreu em 2010."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 13, 'espanhol', false,
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
  'Espanhol', null, 'No trecho "el auge de la inteligencia artificial ha
beneficiado a esta isla", qual é a função gramatical
da palavra "esta" na frase?',
  '[{"id": "a", "texto": "Artículo definido."}, {"id": "b", "texto": "Pronombre personal."}, {"id": "c", "texto": "Pronombre posesivo."}, {"id": "d", "texto": "Pronombre relativo."}, {"id": "e", "texto": "Pronombre demostrativo."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 14, 'espanhol', false,
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
  'Espanhol', null, 'Qual é o significado da expressão sublinhada
"pincelada" no contexto do texto?',
  '[{"id": "a", "texto": "Uma técnica de pintura utilizada para retratar paisagens."}, {"id": "b", "texto": "Uma pequena quantidade de dinheiro adicionado."}, {"id": "c", "texto": "Um gesto artístico que envolve movimentos econômicos."}, {"id": "d", "texto": "Uma breve introdução ou indício de uma nova atividade."}, {"id": "e", "texto": "Um tipo de pincel especializado utilizado na arte abstrata."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 15, 'espanhol', false,
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
  'Matemática', null, 'A Secretaria de Saúde do Município deseja formar
equipes para atuarem no programa de saúde da
família. Para isso a Secretaria conta com 5
médicos, 4 enfermeiros e 3 assistentes sociais.
Cada uma dessas equipes será formada por 7
profissionais, sendo, 3 médicos, 2 enfermeiros e 2
assistentes sociais. A quantidade de maneiras
distintas que essas equipes de profissionais da
saúde poderão ser formadas para atuarem no
município é:',
  '[{"id": "a", "texto": "19"}, {"id": "b", "texto": "29"}, {"id": "c", "texto": "60"}, {"id": "d", "texto": "180"}, {"id": "e", "texto": "190"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 16, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q16-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'Um maratonista desenvolveu uma série de treinos
durante 15 dias. Ele não anotou a distância que
correu no seu primeiro dia de treino, mas sabe
que no terceiro dia a distância que ele correu foi
8.000 m. Como programação do seu treino, esse
maratonista deverá aumentar a cada dia o seu
percurso, sempre correndo a distância do dia
anterior mais uma nova distância fixa, até que no
último dia de treino ele corra exatamente 26 km.
Com base nessas informações, pode–se concluir
que a distância, em km, que esse maratonista irá
correr no seu 12º dia de treino será:',
  '[{"id": "a", "texto": "17,5"}, {"id": "b", "texto": "20,0"}, {"id": "c", "texto": "21,5"}, {"id": "d", "texto": "22,0"}, {"id": "e", "texto": "24,0"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 17, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q17-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'Analisando os dados dos seus pacientes, um
endocrinologista separou as fichas médicas
sendo, 70% das fichas de pacientes do sexo
feminino e o restante de pacientes do sexo
masculino. Verificou que 40% dos pacientes do
sexo feminino apresentavam obesidade grau I e
50% dos pacientes do sexo masculino também
estavam no índice de obesidade grau I. O
percentual de seus pacientes que estavam com
índice de obesidade grau I é:',
  '[{"id": "a", "texto": "43%"}, {"id": "b", "texto": "48%"}, {"id": "c", "texto": "55%"}, {"id": "d", "texto": "60%"}, {"id": "e", "texto": "90%"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 18, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q18-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2024.2-ampla-q18-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Matemática', null, 'Uma palestra sobre prevenção da dengue reuniu
em um auditório mais de 100 pessoas. Não se
sabe quantos homens e quantas mulheres
estavam presentes. Sabe–se apenas que a razão
entre a quantidade de homens e a quantidade de
mulheres nesse auditório era 3 para 4. Assim, a
quantidade mínima de pessoas presentes é igual
a:',
  '[{"id": "a", "texto": "101"}, {"id": "b", "texto": "102"}, {"id": "c", "texto": "103"}, {"id": "d", "texto": "104"}, {"id": "e", "texto": "105 FÍSICA"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 20, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q20-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2024.2-ampla-q20-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Física', null, 'Uma motocicleta trafega com velocidade
constante de 20 𝑚/𝑠 quando se aproxima de um
semáforo com fiscalização eletrônica. Quando a
motocicleta se encontra a uma distância de 40 𝑚
do semáforo, o sinal muda de verde para amarelo.
O motociclista, então, decide parar antes de
atravessá-lo. Sabendo que o sinal permanece
amarelo por 2,2 𝑠 e que o tempo de reação do
motociclista é 0,5 𝑠 (intervalo de tempo entre o
momento em que vê a mudança de sinal e o
momento em que realiza alguma ação), qual é a
mínima aceleração constante que deve ter para
parar antes de atravessar o semáforo?',
  '[{"id": "a", "texto": "−6,7𝑚/𝑠"}, {"id": "b", "texto": "−5,0𝑚/𝑠"}, {"id": "c", "texto": "5,0𝑚/𝑠"}, {"id": "d", "texto": "6,7𝑚/𝑠"}, {"id": "e", "texto": "−20 𝑚/𝑠"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 21, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q21-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Num tubo de vácuo, elétrons são acelerados por
uma diferença de potencial de 8 ∗ 104 𝑉, e em
seguida, submetidos a uma forte desaceleração
ao colidirem com um alvo metálico, produzindo
emissão de radiação em forma de Raio 𝑋. Qual o
valor, mais de aproxima, do comprimento de onda
𝜆, em ångström, desses Raios 𝑋?
Dados: ℎ = 4,13 ∗ 10−15𝑒𝑉, 𝑐 = 3 ∗ 108𝑚/𝑠 e 𝑒 =
1,6 ∗ 10−19𝐶',
  '[{"id": "a", "texto": "0,961"}, {"id": "b", "texto": "0,724"}, {"id": "c", "texto": "0,576"}, {"id": "d", "texto": "0,311"}, {"id": "e", "texto": "0,154"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 22, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q22-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Um condutor, de comprimento 10 𝑐𝑚 , é
atravessado por uma corrente elétrica 𝑖 = 12 𝐴.
Suas extremidades encontram-se livres sobre
trilhos que mantém o condutor na mesma
diferença de potencial. Preso ao seu centro e a
uma parede fixa, há uma mola de constante
elástica 𝑘 = 10 ∗ 10−2𝑁/𝑚. O condutor é então
submetido a um campo magnético uniforme e
perpendicular ao seu plano, passando então a se
mover até atingir a posição de equilíbrio com a
mola esticada. Sabendo-se que a velocidade
média de deslocamento do fio é de 10𝑚/𝑠 e que
o tempo decorrido até o equilíbrio foi de 12 ∗
10−2𝑠, qual é a intensidade do campo magnético?',
  '[{"id": "a", "texto": "1𝑇"}, {"id": "b", "texto": "10−1𝑇"}, {"id": "c", "texto": "102𝑇"}, {"id": "d", "texto": "4 ∗ 10−1𝑇"}, {"id": "e", "texto": "4 ∗ 102𝑇"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 23, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q23-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2024.2-ampla-q23-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Física', null, 'O sistema abaixo representa duas partículas, de
massa 𝑚1 e 𝑚2 vinculadas uma à outra através de
uma mola de constante elástica 𝜅 e tal que 𝑚2 =
3𝑚1. Inicialmente, a mola está comprimida e após,
o sistema passa a oscilar livremente.
Desprezando as forças resistivas, podemos
afirmar que o período de oscilação é dado por:',
  '[{"id": "a", "texto": "𝑇 = 2𝜋√𝑚⁄𝜅"}, {"id": "b", "texto": "𝑇 = 2𝜋√3𝑚⁄2𝜅"}, {"id": "c", "texto": "𝑇 = 2𝜋√3𝑚⁄𝜅"}, {"id": "d", "texto": "𝑇 = 𝜋√𝑚⁄𝜅"}, {"id": "e", "texto": "𝑇 = 𝜋√3𝑚⁄𝜅"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 24, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q24-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Num recipiente térmico ideal, contendo 400 𝑐𝑚3
de água a 90°𝐶 é acrescentado 200 𝑐𝑚3 de água
a 20 °𝐶 . Admitindo-se que não haja trocas de
calor com o meio, a temperatura final da água, em
°𝐶, será?
Dados 𝑐á𝑔𝑢𝑎 = 1 𝑐𝑎𝑙/𝑔 °𝐶 e 𝜌á𝑔𝑢𝑎 = 1𝑔/𝑐𝑚3',
  '[{"id": "a", "texto": "86,7"}, {"id": "b", "texto": "76,7"}, {"id": "c", "texto": "66,7"}, {"id": "d", "texto": "56,7"}, {"id": "e", "texto": "46,7 QUÍMICA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 25, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q25-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Química', null, 'O químico alemão Othmar Zeidler sintetizou em
1874 o diclorodifeniltricloroetano (DDT). Em 1939
o químico suíço Paul Müller, após estudos,
descobriu que o DDT apresentava propriedades
inseticidas sendo muito utilizado na Segunda
Guerra Mundial combatendo insetos vetores de
muitas doenças como malária e tifo. Pela ingestão
de alimentos contaminados ou inalação do
produto, representado pela fórmula abaixo, esse
composto organoclorado pode se depositar nas
camadas do tecido adiposo dos seres vivos.
diclorodifeniltricloroetano (DDT)
Sobre a estrutura do diclorodifeniltricloroetano,
DDT, os elementos presentes e conhecimentos
químicos, é CORRETO afirmar que
Dados: 6C (14), 1H (1) e 17Cℓ (17)',
  '[{"id": "a", "texto": "existem três pares de elétrons não compartilhados pelos átomos de cloro."}, {"id": "b", "texto": "a energia da ligação C–Cℓ é mais forte que a energia da ligação C–H."}, {"id": "c", "texto": "todos os átomos de carbono apresentam hibridização sp2."}, {"id": "d", "texto": "a geometria dos átomos de carbono ligados aos átomos de cloro é do tipo trigonal plana."}, {"id": "e", "texto": "é um composto orgânico com características lipofílicas."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 26, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q26-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.2-ampla-q26-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Química', null, 'Em alimentos de origem vegetal podemos
encontrar carboidratos que fornecem grande
parte da energia necessária para manter
atividades dos seres humanos e funcionamento
do cérebro. Podem ser divididos em açúcares,
amidos e fibras. Com exceção das fibras são
rapidamente convertidos em glicose depois de
ingeridos. Abaixo tem–se as fórmulas estruturais
de dois açúcares importantes.
Após análise das estruturas acima e
conhecimentos de Química podemos afirmar que:',
  '[{"id": "a", "texto": "as cadeias carbônicas são saturadas e homogêneas."}, {"id": "b", "texto": "nas reações orgânicas o grupo OH– geralmente atua como reagente nucleofílico."}, {"id": "c", "texto": "a estrutura da glicose apresenta grupos característicos das cetonas."}, {"id": "d", "texto": "ambos são compostos com baixa solubilidade em água."}, {"id": "e", "texto": "são compostos sem atividade óptica."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 27, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q27-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.2-ampla-q27-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2024.2-ampla-q27-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Química', null, 'Cinábrio é o nome dado ao minério de sulfeto de
mercúrio II (HgS), composto tóxico e insolúvel em
água. Esse composto apresenta densidade de
8,1gcm–3, a 25ºC. A 580°C sofre decomposição,
além de constituir um dos pigmentos usados na
pintura rupestre representada abaixo.
Disponível em: https://jornal.usp.br/ciencias/ciencias-humanas/arte-rupestre-pode-ajudar-a-entender-como-linguagem-humana-evoluiu/ Acessado em 19.02.2024.
Os compostos de mercúrio podem poluir o meio
ambiente desde quando sua extração, uso e
descarte ocorram de maneira inadequada.
Considerando–se essas informações e as
propriedades associadas aos elementos e
compostos envolvidos pode–se afirmar que:
Dados: dágua = 1,0gcm–3(25ºC/1atm), 16S (16) e
80Hg (12).',
  '[{"id": "a", "texto": "a cor vermelha é uma propriedade específica utilizada na identificação das substâncias."}, {"id": "b", "texto": "o sistema formado pela mistura de sulfeto de mercúrio II e água a 25°C pode ser separado por destilação fracionada."}, {"id": "c", "texto": "pode–se obter o mercúrio metálico aquecendo o HgS a seco em ausência de ar e umidade."}, {"id": "d", "texto": "o sulfeto de mercúrio II é um hidreto metálico de elevada temperatura de fusão."}, {"id": "e", "texto": "o número de oxidação do enxofre no HgS é igual a –1."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 28, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q28-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Química', null, 'Em contato com a matéria orgânica o
permanganato de potássio, KMnO4, se decompõe
pela liberação de oxigênio de acordo com a
reação representada abaixo.
2KMnO4 + H2O → MnO2↓ + 2KOH + 3[O]
Esse composto exerce função antisséptica e em
caso de ingestão acidental deve–se procurar
ajuda médica, pois pode irritar o tecido cutâneo
além de provocar tingimento marrom na pele. De
acordo com suas propriedades, características e
reações o permanganato de potássio
Dados: K (1), Mn (7) e O (16).
Massa molar (g.mol–1): K = 39, Mn = 55, H = 1 e O
= 16.',
  '[{"id": "a", "texto": "é um poderoso oxidante."}, {"id": "b", "texto": "reage com água sem produção de precipitado."}, {"id": "c", "texto": "em solução, apresenta concentração 0,5mol/L quando dissolvemos 39,5g do sal em 0,5L de água."}, {"id": "d", "texto": "ao reagir com 3,6g de água produz 22,4g de uma base fraca."}, {"id": "e", "texto": "atuaria como catalisador se aumentasse a energia de ativação do sistema."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 29, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q29-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.2-ampla-q29-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2024.2-ampla-q29-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'Tabela: Propriedades de alguns elementos
Elemento
químico
1ª
energia
de
ionização
(kJ.mol–1)
2ª energia
de
ionização
(kJ.mol–1)
Temperatura
de fusão, °C,
1,0atm
Zinco 906 1733 419,5
Cádmio 876 1631 321,1
Alumínio 577 1820 660,3
A importância do zinco na saúde humana,
recentemente, tem sido alvo de pesquisas
experimentais e clínicas por possibilitar várias
funções bioquímicas, pois é componente de
muitas enzimas. Já o cádmio é um elemento
tóxico ao organismo. Quando seu íon, Cd2+, é
ingerido pode substituir o zinco provocando sérios
riscos à saúde. Os principais contribuintes de
alumínio em dietas são grãos e produtos
granulados (leite, queijo e iogurte), sobremesas e
bebidas. O excesso de alumínio na alimentação
pode causar doenças como demência, Alzheimer
e até autismo em bebês ainda no ventre da mãe.
Para a Organização Mundial de Saúde (OMS)
1mg de alumínio/kg de massa corporal é a dose
tolerável para evitar riscos à saúde.
Considerando–se as informações do texto, da
tabela, e conhecimentos sobre ciências da
natureza é CORRETO afirmar que:
Dados: Massa molar (g.mol–1): 30Zn = 65, 48Cd =
112, 13Aℓ = 27 e 36Kr = 84.',
  '[{"id": "a", "texto": "de acordo com a oms o consumo semanal de 2,9.10–2mol de alumínio para uma pessoa de 80kg fica abaixo da dose tolerável."}, {"id": "b", "texto": "a configuração eletrônica [Kr] 5s24d9 corresponde ao íon de cádmio após a retirada do primeiro elétron do nível de valência."}, {"id": "c", "texto": "a reação de dupla–troca entre alumínio e água, a 25°c, produz hidróxido de alumínio e hidrogênio aumentando o ph do sistema."}, {"id": "d", "texto": "a 3ª energia de ionização do zinco deve ser maior que a 3ª energia de ionização do alumínio."}, {"id": "e", "texto": "acima de 1000°c, a 1 atm, apenas o alumínio encontra–se na fase gasosa. BIOLOGIA"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 30, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q30-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2024.2-ampla-q30-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Biologia', null, 'Assinale a alternativa INCORRETA.',
  '[{"id": "a", "texto": "A membrana celular ou membrana plasmática ainda plasmalema, é uma película que reveste e está presente em todos os tipos de células."}, {"id": "b", "texto": "As microvilosidades são especializações da membrana celular, geralmente digitiformes, presentes em células de alta absorção."}, {"id": "c", "texto": "A composição química biomolecular fosfolipídica da membrana plasmática, estão dispersas em moléculas de proteínas globulares em forma de mosaico."}, {"id": "d", "texto": "Permeabilidade celular é o nome dado à propriedade da membrana de selecionar o que entra e sai da célula. Os principais mecanismos de permeabilidade celular são a permeabilidade passiva e a ativa."}, {"id": "e", "texto": "A difusão é um processo físico-químico decorrente da movimentação das partículas, essa movimentação ocorre da região em que as partículas estão mais concentradas para aquelas em que há menos. Pode-se dizer que esse movimento ocorre contra o gradiente de concentração, buscando sempre o equilíbrio dinâmico dos meios de forma passiva."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 31, null, false,
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
  'Biologia', null, 'Em um corte histológico de um certo tecido a ser
identificado, foram observadas algumas
características específicas e diferenciadas. Nesse
sentido, e descrevendo as especificidades e
diferenciações, foram encontradas: células
poliédricas, bem justapostas, com pouca
substância intercelular e ausência de vasos
sanguíneos, ainda, células bastante dinâmicas,
possuindo uma elevada atividade mitótica. Pode-se afirmar que se trata do tecido:',
  '[{"id": "a", "texto": "muscular"}, {"id": "b", "texto": "ósseo"}, {"id": "c", "texto": "conjuntivo"}, {"id": "d", "texto": "epitelial"}, {"id": "e", "texto": "nervoso"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 32, null, false,
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
  'Biologia', null, '“O Brasil registrou uma explosão no número de
casos de dengue nas duas primeiras semanas
deste ano, com 55.859 casos prováveis da
doença e seis mortes devido a complicações
causadas por ela. Esse número é mais do que o
dobro do registrado no mesmo período de 2023,
quando foram contabilizados 26.801 casos
prováveis da doença e 17 óbitos. Os números são
do Ministério da Saúde.
Para evitar essa situação é preciso ficar atento aos
sintomas e complicações que podem evoluir para
a forma hemorrágica da doença.”
(Simone Machado Role, De São José
do Rio Preto (SP) para a BBC News
Brasil, 23 janeiro 2024).
Diante das informações registradas pela BBC
News, a dengue é uma doença que causa muita
preocupação, mediante as consequências que
podem ser letais. A mídia tem chamado a atenção,
com alertas e orientações que já deveriam ser
praticadas pela população brasileira, uma vez que
se trata de uma doença que pode ser evitada, com
cuidados e prevenções advindos do poder
público e da própria população.
Assinale a alternativa INCORRETA sobre
cuidados e prevenção da dengue.',
  '[{"id": "a", "texto": "Campanhas de conscientização que orientem as pessoas a acabar com qualquer reservatório desprotegido de água parada nas casas."}, {"id": "b", "texto": "Ações públicas de saneamento básico."}, {"id": "c", "texto": "Manejo de lixões e vaporização de inseticidas (o popular fumacê)."}, {"id": "d", "texto": "A vacinação como uma medida adicional e métodos que tentam controlar a quantidade de vírus que os mosquitos carregam."}, {"id": "e", "texto": "A vacinação e / ou o método Wolbachia sozinhos são capazes de colocar um ponto final na histórica epidemia de dengue."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 33, null, false,
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
  'Biologia', null, 'Os cromossomos são estruturas muito
importantes no que se refere à presença de
material genético, contidos em pequenos
espaços, permitindo e satisfazendo as suas
necessidades de replicação e de transcrição.
Além do DNA, os cromossomos também são
compostos pelo ácido ribonucleico (RNA) e por
proteínas ácidas e básicas.
(Becker e Barbosa, 2018, texto adaptado).
Dessa forma, os cromossomos podem
apresentar-se como aglomerados de filamentos,
destacando-se com duas regiões bem distintas.
Assinale a alternativa CORRETA, na qual constam
o nome desses aglomerados de filamentos com as
suas respectivas regiões.',
  '[{"id": "a", "texto": "Cromatina, telômero e centrômero."}, {"id": "b", "texto": "Zona SAT, cromatina e eucromatina."}, {"id": "c", "texto": "Cromatina, zona SAT e heterocromatina."}, {"id": "d", "texto": "Cromatina, eucromatina e heterocromatina."}, {"id": "e", "texto": "Centrômero, eucromatina e heterocromatina."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 34, null, false,
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
  'Biologia', null, '“Na espécie humana, as informações genéticas
apresentam um delicado equilíbrio, segundo o
qual a adição ou a perda de um ou mais
cromossomos pode estar associada ao
desenvolvimento de um fenótipo anormal ou à
morte do indivíduo. Além disso, os rearranjos das
informações genéticas podem afetar a viabilidade
dos gametas e os fenótipos dos organismos
originados a partir desses gametas. Em conjunto,
essas mudanças são denominadas mutações ou
alterações cromossômicas.”
(Becker e Barbosa, 2018, p.79).
Dentro das informações, acima citadas, leia as
afirmativas abaixo e assinale a alternativa
CORRETA, referente às mutações.
I. Mutações ou alterações cromossômicas são
mudanças nas informações genéticas que
podem incluir a adição ou perda de
cromossomos, afetando a viabilidade dos
gametas e os fenótipos dos organismos
originados a partir desses gametas.
II. Mutações ou alterações cromossômicas são
mudanças nas informações genéticas que
podem incluir a adição ou perda de
cromossomos, afetando a viabilidade dos
gametas, mas não alterando os fenótipos dos
organismos originados a partir desses
gametas.
III. As consequências associadas à adição ou
perda de cromossomos na espécie humana
podem incluir o desenvolvimento de um
fenótipo anormal ou até mesmo a morte do
indivíduo.
Estão CORRETAS:',
  '[{"id": "a", "texto": "apenas a afirmativa I."}, {"id": "b", "texto": "as afirmativas I e II."}, {"id": "c", "texto": "apenas a afirmativa II."}, {"id": "d", "texto": "apenas a afirmativa III."}, {"id": "e", "texto": "as afirmativas I e III."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 35, null, false,
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
  'Biologia', null, 'Um dos grandes desafios no que diz respeito ao
desenvolvimento sustentável é o
desflorestamento. Segundo Dias (2004, p.13),
“Cinquenta por cento das florestas do mundo já
foram consumidas. Cerca de 38 mil hectares de
florestas nativas são destruídas por dia!
As últimas áreas nativas contínuas da Terra são o
Pantanal e a Amazonia. A derrubada de florestas
é uma das mais graves alterações que o ser
humano impõe à terra e a si mesmo.”
(Dias, 2004. Ecopercepção).
Diante de tão grandes desafios podemos citar as
principais causas para o desflorestamento,
EXCETO:',
  '[{"id": "a", "texto": "agricultura extensiva;"}, {"id": "b", "texto": "exploração predatória de madeiras;"}, {"id": "c", "texto": "exposição do solo à erosão e os rios e lagos ao assoreamento;"}, {"id": "d", "texto": "incêndios/queimadas"}, {"id": "e", "texto": "urbanização"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 36, null, false,
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
  'Biologia', null, 'A algaroba (Prosopis juliflora) foi introduzida no
Brasil no final do século XIX, por volta de 1870.
Sua introdução teve como principal finalidade a
utilização como planta forrageira, visando à
alimentação do gado em regiões áridas e
semiáridas do Nordeste brasileiro. A algaroba é
conhecida por sua resistência a condições de
seca e solos pobres, características que a
tornaram uma opção atraente para contribuir na
alimentação animal em áreas com escassez de
recursos hídricos e forragens mais convencionais.
Além disso, ela também foi empregada para
combater a desertificação, ajudando na fixação de
solos arenosos. Entretanto ao longo do tempo
vieram as consequências socioambientais
causadas por essa introdução.
As alternativas abaixo apresentam implicações
socioambientais que podem surgir ao introduzir
uma espécie não nativa em um novo ambiente.
EXCETO:',
  '[{"id": "a", "texto": "Competição - Espécies não nativas podem competir com as espécies nativas por recursos como água, luz solar, nutrientes e espaço, muitas vezes resultando na diminuição da biodiversidade local. Isso pode levar à extinção ou redução das populações de espécies nativas."}, {"id": "b", "texto": "Mudanças no ecossistema - Alteração significativa dos ecossistemas locais. Podendo incluir mudanças nos padrões de crescimento da vegetação, ciclos de nutrientes, regimes de incêndio e até mesmo na estrutura física do solo."}, {"id": "c", "texto": "Algumas espécies não nativas podem se tornar pragas, prejudicando a agricultura e causando danos aos recursos naturais."}, {"id": "d", "texto": "Espécies não nativas podem afetar negativamente os serviços ecossistêmicos, como a polinização, regulação do clima, controle de pragas e purificação da água."}, {"id": "e", "texto": "O controle de espécies não nativas invasoras não é difícil, mas se torna muito custoso, pois, uma vez estabelecidas, essas espécies são fáceis de erradicar, exigindo algumas vezes somente os recursos para o seu manejo."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 37, null, false,
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
  'Biologia', null, 'O sistema digestório dos seres humanos pode ser
dividido em um trato gastrointestinal e em órgãos
acessórios. Dentro desse contexto, coloque (V)
para as afirmativas verdadeiras e (F) para as
afirmativas falsas. Assinale a alternativa que
preenche corretamente a sequência das
afirmativas verdadeiras e falsas.
(...) Ao longo do trato gastrointestinal, ocorrem a
digestão dos alimentos ingeridos e a
absorção de nutrientes.
(...) Ao serem ingeridos pela boca, os alimentos
sofrem a ação das enzimas ácidas presentes
na saliva produzidas pelas glândulas salivares
(...) O bolo alimentar é deglutido para a faringe,
que se conecta ao esôfago.
(...) No estômago, há a secreção do suco gástrico
produzido pelo próprio órgão, que possui pH
6,8 aproximadamente.
Preenche CORRETAMENTE a alternativa:',
  '[{"id": "a", "texto": "V, F, V, F."}, {"id": "b", "texto": "F, F. V, V."}, {"id": "c", "texto": "V, V, F, F."}, {"id": "d", "texto": "V, V, V, F."}, {"id": "e", "texto": "F, F, F, V."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 38, null, false,
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
  'Biologia', null, 'O número de animais domésticos de ruas (Cães e
gatos), tem aumentado muito nas cidades de
Petrolina e Juazeiro, aumentando assim, o risco
de doenças que podem ser transmitidas não só
entre eles, mas, podendo contaminar a
população, sendo vetores e transmissores direto
e indireto de doenças.
Assinale a alternativa que constam exemplo de
doenças transmitidas por esses animais.',
  '[{"id": "a", "texto": "Leishmaniose, Toxoplasmose e raiva."}, {"id": "b", "texto": "Toxoplasmose, Histoplasmose e toxoplasmose."}, {"id": "c", "texto": "Leishmaniose, Histoplasmose e leptospirose."}, {"id": "d", "texto": "Toxoplasmose Histoplasmose e leptospirose."}, {"id": "e", "texto": "Leptospirose, raiva e Histoplasmose."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 39, null, false,
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
  'Biologia', null, 'Na natureza, muitas espécies possuem mais de
uma opção alimentar e, com isso, participam de
várias cadeias alimentares, podendo, inclusive,
ocupar níveis tróficos distintos em cada uma
delas. O entrelaçamento das cadeias alimentares
existentes em um mesmo ambiente denomina-se:',
  '[{"id": "a", "texto": "nicho ecológico."}, {"id": "b", "texto": "teia alimentar."}, {"id": "c", "texto": "níveis tróficos."}, {"id": "d", "texto": "produção alimentar."}, {"id": "e", "texto": "habitat natural. HISTÓRIA"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 40, null, false,
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
  'História', null, 'A democracia contemporânea é um campo de
tensões e transformações, em que os governos e
as sociedades continuam a buscar formas de
fortalecer os princípios democráticos e enfrentar
os desafios emergentes.
Acerca da história da democracia no Ocidente,
assinale a alternativa que descreve
adequadamente uma experiência histórica que
contribuiu para sua formação.',
  '[{"id": "a", "texto": "Sob a perspectiva da democracia direta, proposta pelo filósofo iluminista Rousseau, a legitimidade da soberania \"popular\" só se concretizaria se o povo a exercesse por meio dos representantes jacobinos, os quais eram os únicos a defenderem a equidade."}, {"id": "b", "texto": "No contexto da democracia clássica em Atenas, a participação política direta era estabelecida para todos os cidadãos adultos, tanto homens quanto mulheres, com exceção de estrangeiros e escravos, tendo como principais instâncias de decisão a bulé e a eclesia."}, {"id": "c", "texto": "A democracia brasileira, instituída pela Constituição de 1988, restabeleceu a soberania popular em relação ao direito ao voto e à escolha dos representantes através do sufrágio universal, com voto direto, aberto e com igual valor para todos os eleitores."}, {"id": "d", "texto": "A democracia moderna foi estabelecida a partir de dois pilares: a separação dos poderes, princípio consolidado pelas revoluções liberais, e o sufrágio universal, cuja conquista plena se deu ao longo do século XX, incluindo a garantia do direito ao voto feminino, entre outros avanços."}, {"id": "e", "texto": "A consolidação da democracia representativa ocorreu no século XIX, após os movimentos liberais, caracterizando-se pela participação plena, porém mediada, da soberania popular, com representantes no parlamento, como observado no Brasil independente desde 1822."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 41, null, false,
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
  'História', null, 'Quando a frota de Cabral chegou ao Brasil, os
portugueses já possuíam uma vasta experiência
em conquista e colonização. Sobre a expansão
portuguesa, qual afirmação está CORRETA?',
  '[{"id": "a", "texto": "O Tratado de Tordesilhas foi um acordo relevante apenas para portugueses e espanhóis, pois suas disposições não afetavam outros países."}, {"id": "b", "texto": "A principal meta da primeira expedição de Cabral era de ir ao Brasil buscar especiarias e metais preciosos, relegando a colonização a um plano secundário para os portugueses."}, {"id": "c", "texto": "As regulamentações fiscais e os estímulos econômicos concedidos aos portugueses estabelecidos no Brasil tinham como objetivo principal fortalecer as capitanias hereditárias."}, {"id": "d", "texto": "A estrutura política estabelecida na colônia, através da implementação das capitanias hereditárias, assemelhava-se ao modelo de governo metropolitano."}, {"id": "e", "texto": "O controle de Portugal sobre as rotas comerciais do Oriente colocou o Brasil, nos primeiros anos, em uma posição secundária para o Estado Português."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 42, null, false,
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
  'História', null, 'Com base na imagem e nos conhecimentos sobre
Revolução Industrial e Teoria da História, assinale
a alternativa CORRETA.',
  '[{"id": "a", "texto": "As fontes primárias legítimas para a compreensão do Ludismo limitam-se à documentação escrita, que oferece acesso direto aos princípios que caracterizam o movimento. As imagens, por outro lado, desempenham um papel ilustrativo e, portanto, superficial para a análise do contexto histórico."}, {"id": "b", "texto": "Os ludistas reconheciam que a responsabilidade pela precarização do trabalho e baixa remuneração estava relacionada às condições impostas pelos proprietários das fábricas. O movimento indicava um distanciamento dos agentes envolvidos da política, entendida em sentido amplo."}, {"id": "c", "texto": "O Ludismo estava associado a outras questões além da destruição dos meios de produção, como a resistência dos homens à inclusão das mulheres como mão de obra nas fábricas. Recebendo salários mais baixos, as mulheres eram vistas como uma ameaça pelos trabalhadores."}, {"id": "d", "texto": "Na cena mais distante da imagem, é possível observar uma corporação de ofício em chamas, sugerindo a rebelião dos trabalhadores contra novas formas de organização do trabalho, que envolviam o controle dos operários sobre todas as etapas do processo produtivo."}, {"id": "e", "texto": "O Ludismo é um movimento do século XIX e surgiu durante a Revolução Industrial. Portanto, o princípio que orienta o movimento, ou seja, o ataque aos meios de produção, permaneceu dentro do contexto histórico em que surgiu."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 43, null, false,
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
  'História', null, 'A charge abaixo satiriza Napoleão Bonaparte. O
título principal, "Um homem pequeno com um
grande apetite para o jantar", refere-se à estatura
reduzida do imperador e sua "fome" por
conquistas territoriais, evidenciada pelo
expansionismo que ele praticava. Os processos
de Independência dos países da América Latina,
incluindo o Brasil, estão associados a essa
expansão napoleônica pela Europa.
Como esse "apetite" de Napoleão Bonaparte
contribuiu para desencadear o processo de
Independência das colônias portuguesa e
espanhola na América?',
  '[{"id": "a", "texto": "A invasão da Rússia por Napoleão força Portugal e Espanha a participarem do conflito; assim, as metrópoles ibéricas não conseguem mais controlar suas colônias, levando-as a iniciar o processo de independência."}, {"id": "b", "texto": "Napoleão promove as independências das colônias luso-hispânicas na América, esperando contar com o apoio desses novos países na luta contra os antigos países imperialistas europeus."}, {"id": "c", "texto": "Com a invasão de Portugal e Espanha por Napoleão, a corte portuguesa foge para o Brasil. Aproveitando a prisão do rei espanhol Fernando VII pelo imperador francês, as colônias hispânicas iniciam o processo de independência."}, {"id": "d", "texto": "Ao ampliar o território, Napoleão Bonaparte impediu que as regiões conquistadas comercializassem com os ingleses. Com isso, sem mercado para seus produtos, a Inglaterra apoia as independências latino-americanas para abrir novos mercados, enviando sua marinha para auxiliar os \"libertadores\" da América."}, {"id": "e", "texto": "Insatisfeito com a expansão territorial na Europa, Napoleão Bonaparte patrocina o processo de independência na América, visando exercer domínio político e econômico sobre os novos países emergentes."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 44, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q44-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2024.2-ampla-q44-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'História', null, 'O desfecho da Segunda Guerra Mundial em 1945
influenciou a política brasileira da época, ao expor
a dicotomia entre:',
  '[{"id": "a", "texto": "o triunfo externo da defesa da democracia liberal e a permanência, internamente, de um regime ditatorial."}, {"id": "b", "texto": "a militarização de países estrangeiros e a firme defesa, pelo governo varguista, de uma política externa pacifista."}, {"id": "c", "texto": "o esforço nacional para promover mercados regionais e a integração, no contexto internacional, do mercado global."}, {"id": "d", "texto": "a prevalência das ideologias de esquerda na arena global e a mudança para uma abordagem de direita, no âmbito interno, do governo ditatorial."}, {"id": "e", "texto": "a preferência industrialista do governo de Vargas e a crescente demanda, no mercado global, por exportações de produtos agrícolas. GEOGRAFIA"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 45, null, false,
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
  'Geografia', null, 'A imagem acima mostra uma variação sazonal média de um sistema atmosférico sobre a Mesoamérica
e norte da América do Sul. Tais variações controlam os períodos regionais de chuva, com estações secas
ocorrendo na Mesoamérica e no Caribe quando está mais ao sul. A localização de alguns dos registros
mencionados no texto é mostrada (1) Lago Verde, (2) Aguada X’caamal, (3) Punta Laguna, (4) Lago
Chichancanab, (5) Costa de Porto Rico, (6) Cariaco, (7) Andes venezuelanos, (8) Chilibrillo, (9)
Quelccaya, (10) Cordilheira Branca, (11) Lago Titicaca, (12) Charquini, (13) Lago Frías, (14) Patagônia.
O sistema atmosférico demostrado no texto refere-se ao (a):
a) frentes frias.
b) ciclone subtropical.
c) zona de convergência intertropical.
d) baixas nebulosidades.
e) alta pressão.',
  '[]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 46, null, false,
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
  'Geografia', null, 'Ao sair da estação Fradique Coutinho, linha 4-
amarela do metrô, na zona oeste de São Paulo, é
possível saber para que lado fica a Vila Madalena
e a avenida Brigadeiro Faria Lima. As informações
foram escritas à mão em uma placa pendurada em
um poste, logo na saída da estação.
Outras dezenas de sinalizações como essa foram
espalhadas por ruas de Pinheiros e Vila Madalena,
na zona oeste, e República, no centro da capital,
pelo estudante de design Lucas Neumann, 24. Ele
é o idealizador do projeto “Mapa Daqui”, que
propõe uma forma mais acessível e colaborativa
de sinalizar a cidade. [...]
“Percebi que a cidade precisava de sinalização
para pedestre. Daí decidi propor um sistema [de]
sinalização alternativo ao sistema oficial que as
prefeituras instalam; um sistema colaborativo, no
qual as pessoas ajudem a sinalizar”, explica
Neumann.
Os primeiros mapas foram colocados por ele em
agosto em Pinheiros, bairro onde mora. Não
demorou muito para Neumann perceber a
participação da população. “Vi as pessoas
colocando [dicas de] restaurante, café, lojinha de
rua”, lembra. [...]
MARANHÃO, Fabiana. Projeto espalha
sinalização alternativa pelas ruas de São
Paulo. UOL, 14 out. 2015. Disponível em:
https://noticias.uol.com.br/cotidiano/ultimas-noticias/2015/10/14/projeto-espalha-sinalizacao-alternativa-pelas-ruas-de-sao-paulo.htm. Acesso em: 27 mar. 2023.
No texto, há uma ideia simples baseada no uso de
mapas que, além de demonstrar a localização e as
características espaciais de um local, também tem
a função de:',
  '[{"id": "a", "texto": "promover uma cidade mais democrática, colaborativa e acessível."}, {"id": "b", "texto": "fornecer a mão de obra qualificada para o trabalho no trânsito."}, {"id": "c", "texto": "preservar a diversidade biológica das áreas urbanas."}, {"id": "d", "texto": "incorporar a inovação tecnológica no transporte público."}, {"id": "e", "texto": "garantir a permanência da população na cidade."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 47, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q47-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Geografia', null, 'Em contato com o núcleo terrestre
superaquecido, o magma é aquecido e ascende
em direção à crosta terrestre. Em contato com
camadas mais frias e externas do planeta, o
magma resfria e afunda novamente para porções
inferiores mais próximas do núcleo. Esse
movimento forma correntes de convecção do
magma. Observe, no esquema a seguir, como
funciona a dinâmica descrita anteriormente.
Fonte: GROTZINGER, John; JORDAN, Tom. Para entender a
Terra. 6. ed. Porto Alegre: Bookman, 2013. p. 16.
O movimento das correntes de convecção no
interior da terra demostrada pode provocar
alterações no (na):',
  '[{"id": "a", "texto": "vegetação."}, {"id": "b", "texto": "padrão climático."}, {"id": "c", "texto": "litosfera."}, {"id": "d", "texto": "urbanização."}, {"id": "e", "texto": "sistema atmosférico."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 48, null, false,
  '[{"url": "/questoes-facape/2024.2-ampla-q48-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Geografia', null, 'A vertente é a superfície inclinada por onde
escorrem as águas das chuvas. Já o vale é uma
depressão entre as vertentes que, às vezes, é
preenchida por sedimentos dos rios ou dos lagos.
Vertentes e vales estão significantemente
relacionados. A presença ou a ausência de
vegetação em uma vertente, influenciará o vale,
uma vez que a água da chuva escorre pela
vertente e chega até o fundo do vale. Além disso,
os sedimentos são transportados entre a vertente
e o vale, por isso ambos os tipos de relevo sofrem
processos de transformação por erosão e
sedimentação.
De acordo com o texto acima, o processo de
erosão pluvial é intensificado quando há:',
  '[{"id": "a", "texto": "retirada da vegetação natural."}, {"id": "b", "texto": "drenagem artificial."}, {"id": "c", "texto": "redução da infiltração."}, {"id": "d", "texto": "reservação da infiltração."}, {"id": "e", "texto": "moderação no escoamento."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 49, null, false,
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
  'Geografia', null, 'Expansão econômica em países africanos
emergentes
A atenção mundial está voltada para o chamado
“despertar” de países africanos, que apresentam
taxas de crescimento semelhantes ou até mesmo
maiores que as das principais economias
emergentes asiáticas. Entre esses países,
destacam-se África do Sul, Botsuana, Zâmbia,
Angola, Moçambique, Tanzânia, Quênia, Nigéria,
Senegal, Marrocos, Tunísia e Argélia.
De acordo com o texto acima, esses países têm
aspectos socioeconômicos em comum que se
baseia no (a):',
  '[{"id": "a", "texto": "retrocesso nos índices de desenvolvimento humano."}, {"id": "b", "texto": "redução do poder de compra."}, {"id": "c", "texto": "regresso do nível de instrução da população."}, {"id": "d", "texto": "difusão de redes informacionais e de comunicações."}, {"id": "e", "texto": "redução das redes de infraestrutura."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2024.2 - Ampla Concorrência',
  '2024.2-ampla', 'FACAPE 2024.2 - Ampla Concorrência', 2024, 2,
  'ampla', 50, null, false,
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
