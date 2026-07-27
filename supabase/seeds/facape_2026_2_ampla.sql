-- ============================================================================
-- DECOLA MED — SEED: FACAPE 2026.2 - Ampla Concorrência
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
  'Português', 'Coesão Textual', '“O Botulismo é uma doença não-contagiosa,
resultante da ação de potente neurotoxina.
Apresenta-se sob três formas: Botulismo
alimentar, Botulismo por ferimentos e Botulismo
intestinal. O local de produção da toxina
botulínica é diferente em cada uma dessas
formas, porém todas se caracterizam
clinicamente por manifestações neurológicas
e/ou gastrintestinais. É uma doença de elevada
letalidade, considerada como emergência
médica e de saúde pública. Para minimizar o
risco de morte e sequelas, é essencial que o
diagnóstico seja feito rapidamente e o tratamento
instituído precocemente por meio das medidas
gerais de urgência. Suas manifestações clínicas
serão descritas de acordo com o modo de
transmissão.”
Disponível em: https://www.gov.br (adaptado)
Com base na leitura do texto acima, pode-se
afirmar que:',
  '[{"id": "a", "texto": "no período “O Botulismo é uma doença não-contagiosa, resultante da ação de potente neurotoxina.”, o emprego da palavra “neurotoxina” é um recurso inexpressivo na construção do texto."}, {"id": "b", "texto": "no período “O local de produção da toxina botulínica é diferente em cada uma dessas formas, porém todas se caracterizam clinicamente por manifestações neurológicas e/ou gastrintestinais.”, a relação expressa pelo operador coesivo “porém” serve à finalidade de introduzir uma orientação argumentativa de acréscimo em relação à ideia anterior."}, {"id": "c", "texto": "no período “É uma doença de elevada letalidade, considerada como emergência médica e de saúde pública.”, o emprego da palavra “letalidade” não se articula com as sequências do texto."}, {"id": "d", "texto": "no período “Para minimizar o risco de morte e sequelas, é essencial que o diagnóstico seja feito rapidamente e o tratamento instituído precocemente por meio das medidas gerais de urgência.”, a sequência “Para minimizar o risco de morte e sequelas...” expressa uma ideia de finalidade."}, {"id": "e", "texto": "no período “Suas manifestações clínicas serão descritas de acordo com o modo de transmissão.”, o coesivo “de acordo com” introduz uma ideia com valor de consequência."}]'::jsonb, 'd', 'A alternativa D está correta: "Para minimizar o risco de morte e sequelas" é uma oração reduzida de infinitivo que expressa finalidade — o motivo pelo qual o diagnóstico e o tratamento precisam ser rápidos.

As demais erram o valor semântico ou o julgamento sobre o texto. Em A, "neurotoxina" é um termo técnico central, não um recurso inexpressivo. Em B, "porém" é conjunção adversativa, que introduz contraste, e não acréscimo. Em C, "letalidade" se articula perfeitamente com "emergência médica e de saúde pública", ao contrário do que a alternativa afirma. Em E, "de acordo com" expressa conformidade, não consequência.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 1, null, false,
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
  'Português', 'Classes Gramaticais', 'Disponível em: https://www.instagram.com
Considerando a estrutura morfológica, a palavra
“mais”, na foto do perfil acima, desempenha a
função de:',
  '[{"id": "a", "texto": "pronome adjetivo demonstrativo."}, {"id": "b", "texto": "pronome adjetivo indefinido."}, {"id": "c", "texto": "pronome adjetivo possessivo."}, {"id": "d", "texto": "advérbio de intensidade."}, {"id": "e", "texto": "advérbio de modo."}]'::jsonb, 'b', 'A imagem traz uma peça publicitária de Instagram com o texto "BEBA MAIS ÁGUA NO VERÃO". Nesse contexto, "mais" acompanha o substantivo "água" indicando uma quantidade indeterminada, maior do que a habitual, sem precisar um valor exato. É esse valor de indefinição que caracteriza o pronome adjetivo indefinido, alternativa B.

Não é demonstrativo (não aponta para algo específico no espaço ou tempo), nem possessivo (não indica posse), nem advérbio: como está diretamente ligado a um substantivo, e não a um verbo, adjetivo ou outro advérbio, sua função é adjetiva, e não adverbial.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'Português', 'Coesão Textual', '“A anorexia nervosa é um transtorno alimentar e
uma condição de saúde mental que leva a
pessoa a restringir a quantidade de comida que
ingere. Pessoas com anorexia restringem a
alimentação para manter o peso corporal o mais
baixo possível. Elas têm medo de ganhar peso e
podem ficar obcecadas com a magreza. A
anorexia pode afetar pessoas de todos os
tamanhos e tipos de corpo. Anorexia significa
não querer comer, mas a condição é muito mais
do que isso. É um transtorno mental grave que
se desenvolve a partir de pensamentos e
sentimentos negativos sobre alimentação, peso e
imagem corporal. Esses pensamentos tomam
conta de toda a sua vida. Eles podem fazer com
que você pense, sinta e aja de maneiras
extremas para evitar comer.”
Disponível em: https://my.clevelandclinic.org (adaptado)
Leia o texto acima e assinale a alternativa
CORRETA.',
  '[{"id": "a", "texto": "As palavras “transtorno” “mental” e “quantidade”, no primeiro período, são elementos de referência temporal."}, {"id": "b", "texto": "A relação estabelecida entre o termo “...de ganhar peso...” e a palavra “medo”, no terceiro período, é de regência verbal."}, {"id": "c", "texto": "A sequência “...que se desenvolve a partir de pensamentos e sentimentos negativos sobre alimentação, peso e imagem corporal.”, no sexto período, é introduzida por uma conjunção integrante."}, {"id": "d", "texto": "O recurso linguístico “Esses”, no sétimo período, é um elemento de articulação da sequência do texto que retoma uma ideia mencionada anteriormente."}, {"id": "e", "texto": "As formas verbais “pense”, “sinta” e “aja”, no sétimo período, expressam uma ação no modo indicativo."}]'::jsonb, 'd', 'A alternativa D está correta. Em "Esses pensamentos tomam conta de toda a sua vida", o demonstrativo "Esses" retoma anaforicamente os "pensamentos e sentimentos negativos sobre alimentação, peso e imagem corporal" citados no período anterior, funcionando como elemento de coesão que costura as ideias do texto.

As demais alternativas atribuem funções erradas: "transtorno", "mental" e "quantidade" não são referências temporais (A); a relação entre "medo" e "de ganhar peso" é de regência nominal, já que "medo" é substantivo, e não regência verbal (B); o "que" antes de "se desenvolve" é pronome relativo, retomando "transtorno mental grave", e não conjunção integrante (C); e "pense", "sinta" e "aja" estão no modo subjuntivo, não no indicativo (E).',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 3, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q03-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Português', 'Norma Culta', '"Se você quer ser um médico, eu o encorajo.
Não há melhor emprego no mundo para tentar
ajudar as pessoas e torná-las melhores."
(Andrew Ross Lorimer)
"A alegria que senti na perspectiva diante de
mim de ser o instrumento destinado a tirar do
mundo uma das suas maiores calamidades foi
tão excessiva que algumas vezes me encontrei
em uma espécie de devaneio."
(Edward Jenner)
"Entre as artes, a medicina, por sua utilidade
eminente, devem sempre ocupar o lugar mais
alto."
(Henry Thomas Buckle)
"Não considere nenhuma prática como imutável.
Mude e esteja pronto a mudar novamente. Não
aceite verdade eterna. Experimente."
(Burrhus Frederic Skinner)
“A primeira qualificação para um médico é a
esperança.”
(James Little)
Sobre a leitura dos textos acima, assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "No texto de Andrew Ross Lorimer, a linguagem é informal, portanto, não segue a norma culta."}, {"id": "b", "texto": "No texto de Edward Jenner, o coesivo “que” em “...que algumas vezes me encontrei em uma espécie de devaneio.” expressa valor semântico de condição."}, {"id": "c", "texto": "No texto de Henry Thomas Buckle, o emprego da palavra “eminente” está de acordo com a norma culta."}, {"id": "d", "texto": "No texto de Burrhus Frederic Skinner, as formas verbais “esteja” e “aceite” expressam uma possibilidade."}, {"id": "e", "texto": "No texto de James Little, o termo “primeira”, do ponto de vista sintático, exerce a função de adjunto adverbial."}]'::jsonb, 'c', 'A alternativa C está correta: na citação de Henry Thomas Buckle, "eminente" (com e) significa notável, de grande destaque, e está empregada de acordo com a norma culta ao qualificar a utilidade da medicina como excepcional.

As demais interpretam mal seus respectivos textos. Em A, a fala de Lorimer é apenas coloquial no tom, mas segue a norma culta — não a contraria. Em B, o "que" na citação de Jenner integra uma estrutura consecutiva ("tão excessiva que"), com valor de consequência, e não de condição. Em D, "esteja" e "aceite", na fala de Skinner, estão no modo imperativo, exprimindo ordem, e não possibilidade. Em E, "primeira" qualifica o substantivo "qualificação", funcionando como adjunto adnominal, e não adjunto adverbial.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 4, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q04-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Português', 'Tipologia Textual', '“A cirurgia de coração aberto pode tratar
problemas cardíacos como insuficiência
cardíaca, arritmias, aneurismas e doença arterial
coronariana. Os procedimentos de cirurgia de
coração aberto podem incluir cirurgia de
revascularização do miocárdio (ponte de safena),
transplante cardíaco, substituição de válvulas e
cirurgias para corrigir problemas congênitos.”
Disponível em: https://my.clevelandclinic.org
A estrutura da linguagem, no texto acima, é uma
sequência discursiva denominada:',
  '[{"id": "a", "texto": "explicativa."}, {"id": "b", "texto": "narrativa."}, {"id": "c", "texto": "argumentativa."}, {"id": "d", "texto": "descritiva."}, {"id": "e", "texto": "injuntiva."}]'::jsonb, 'a', 'O texto apresenta informações objetivas sobre o que a cirurgia de coração aberto trata e quais procedimentos abrange, sem contar uma história (o que descartaria narrativa), sem defender um ponto de vista (o que descartaria argumentativa) e sem dar ordens (o que descartaria injuntiva). Esse caráter informativo e didático caracteriza a sequência explicativa, alternativa A.

A diferença para a descritiva (D) está no foco: descrever seria detalhar características físicas de algo, enquanto aqui o texto expõe e esclarece conceitos e finalidades — típico de textos de divulgação em saúde.',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 5, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q05-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Português', 'Interpretação de Texto', 'Disponível em: https://impactteachers.com
A ilustração, acima, tem como propósito
comunicativo:',
  '[{"id": "a", "texto": "garantir que pessoas com deficiência possam realizar, gratuitamente, consultas médicas periódicas."}, {"id": "b", "texto": "oferecer tratamentos médicos especializados para desenvolver potencialidades e habilidades."}, {"id": "c", "texto": "valorizar as capacidades individuais de pessoas com necessidades educativas especiais."}, {"id": "d", "texto": "alertar os médicos especialistas para auxiliar famílias e pacientes a entender as necessidades específicas das pessoas com deficiência."}, {"id": "e", "texto": "proporcionar atendimento médico adequado, especialmente para os cadeirantes."}]'::jsonb, 'c', 'A ilustração vem de um site voltado à formação de professores (impactteachers.com), o que já indica um propósito educacional, não clínico. A imagem mostra crianças com diferentes habilidades sendo incluídas e valorizadas em suas capacidades individuais — é essa mensagem de inclusão educacional que a alternativa C capta corretamente.

A armadilha da questão está em A, B, D e E, que reinterpretam a cena por uma chave médico-assistencial (consultas, tratamentos, atendimento clínico) que a fonte e o contexto do texto não sustentam: o propósito comunicativo é pedagógico, voltado à valorização das capacidades de alunos com necessidades educativas especiais, não ao acesso a serviços de saúde.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 6, null, false,
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
  'Português', 'Coesão Textual', '“No cerne da medicina holística está a ideia da
conexão mente-corpo. Essencialmente, isso
significa que pensamentos e sentimentos podem
afetar nossa saúde física de forma positiva ou
negativa. A maior parte das recomendações
médicas que recebemos foca no corpo: alimente-se bem, pratique exercícios e durma o suficiente.
Mas mesmo seguindo todos esses passos, o
estresse, a ansiedade e a depressão ainda
podem ter efeitos negativos na sua saúde. O
contrário também é verdadeiro: um estado físico
debilitado pode afetar negativamente a sua
saúde mental. Um médico holístico leva em
consideração essa relação complexa entre
mente e corpo para fornecer um plano de
tratamento abrangente para seus pacientes.”
Disponível em:
https://www.floridamedicalclinic.co
m (adaptado)
Sobre o texto acima, é CORRETO afirmar que o
autor:',
  '[{"id": "a", "texto": "influencia o leitor com o intuito de estabelecer relações interpessoais."}, {"id": "b", "texto": "usa recursos linguísticos, objetivando criticar o profissional que pratica a medicina holística para a manutenção da saúde."}, {"id": "c", "texto": "emprega formas verbais no presente do modo indicativo, apenas para facilitar o processo de comunicação com o leitor."}, {"id": "d", "texto": "utiliza substantivos, verbos e adjetivos para tornar o argumento bastante persuasivo."}, {"id": "e", "texto": "usa o mecanismo da coesão textual com o objetivo de estabelecer uma conexão lógico-semântica entre as ideias."}]'::jsonb, 'e', 'O texto encadeia suas ideias por meio de mecanismos de coesão: "isso significa" retoma a ideia anterior para explicá-la, "mas" contrapõe a recomendação médica tradicional ao papel das emoções, e "o contrário também é verdadeiro" espelha a relação já apresentada em sentido inverso. É esse encadeamento lógico-semântico entre as partes do texto que a alternativa E descreve corretamente.

As demais atribuem finalidades que o texto não tem como foco principal: não visa estabelecer relações interpessoais com o leitor (A), não critica o médico holístico, mas explica sua abordagem (B), o uso do presente do indicativo serve para enunciar verdades gerais sobre saúde, e não apenas facilitar a comunicação (C), e o texto é majoritariamente explicativo, não construído para persuadir por meio de adjetivos (D).',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'Português', 'Literatura Brasileira - A Moreninha', 'Pode-se afirmar, em relação a “A Moreninha” de
Joaquim Manuel de Macedo, que:',
  '[{"id": "a", "texto": "é um romance de caráter psicológico que mescla a oralidade da gíria com a linguagem formal."}, {"id": "b", "texto": "é um romance cuja narrativa é marcada por elementos românticos, como o amor idealizado, o nacionalismo e a exploração das relações sociais da época."}, {"id": "c", "texto": "é uma crônica que evidencia apenas as questões regionalistas."}, {"id": "d", "texto": "é um conto cuja narrativa se passa durante o início do século XX, na cidade do Rio de janeiro."}, {"id": "e", "texto": "é uma novela em que o amor é evidenciado como um sentimento baseado nas diferentes classes sociais do Rio de Janeiro."}]'::jsonb, 'b', '"A Moreninha", de Joaquim Manuel de Macedo, é considerado o primeiro romance urbano do Romantismo brasileiro. Sua narrativa reúne traços típicos do movimento: o amor idealizado entre Augusto e Carolina, o tom nacionalista de valorização de cenários e costumes brasileiros, e o retrato das relações sociais da elite carioca da época — exatamente o que descreve a alternativa B.

As demais erram o gênero ou o enfoque da obra: não é um romance psicológico introspectivo (A), não é uma crônica regionalista (C), não é um conto ambientado no início do século XX — é um romance do século XIX (D), e não é construída sobre um amor entre classes sociais diferentes, já que os personagens centrais pertencem ao mesmo círculo social da juventude carioca (E).',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 8, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q08-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Português', 'Literatura Brasileira - Terras do Sem-Fim', 'Assinale a alternativa cujo fragmento faz parte da
obra “Terras do Sem-Fim”.',
  '[{"id": "a", "texto": "\"O apito do navio era como um lamento e cortou o crepúsculo que cobria a cidade. O capitão João Magalhães encostou-se na amurada e viu o casario de construção antiga, as torres das igrejas. Os telhados negros, ruas calçadas de pedras enormes.\"."}, {"id": "b", "texto": "\"O negro investiu com fúria e os lutadores se atracaram em meio ao tablado. A multidão berrava: - derruba ele! derruba ele! O largo da Sé pegara uma enchente naquela noite. Os homens se apertavam nos bancos, suados, os olhos puxados para o tablado onde o negro Antônio Balduíno lutava com Ergin, o alemão.\"."}, {"id": "c", "texto": "“Ao longe, as luzes brilhavam sobre o asfalto molhado da cidade. Grupos de homens que já não tinham nem pressa, nem medo, se encaminhavam para o grande elevador. Lívia se voltou para o mar. Há oito dias que não via Guma. Ela ficara na casinha velha do cais.”."}, {"id": "d", "texto": "“O carrossel armado no capim da praça da Matriz estava parado fazia uma semana. Nhozinho França esperava a noite de sábado e a tarde de domingo para ver se fazia algum cobre para arribar para um lugar melhor. Mas na sexta-feira Lampião entrou na vila com vinte e dois homens e então o carrossel teve muito que trabalhar.”."}, {"id": "e", "texto": "“- Ouça, Doutor: fala-se muito de progresso, de civilização, da necessidade de mudar tudo em Ilhéus. Não ouço outra conversa o dia inteiro. Mas, me diga uma coisa: quem é que fez esse progresso? Não fomos nós, os fazendeiros de cacau? Temos nossos compromissos, tomados numa hora difícil, não somos homens de duas palavras. Enquanto eu for vivo, meus votos são de meu compadre Ramiro Bastos e pra quem ele indicar. Nem quero saber o nome.”."}]'::jsonb, 'a', '"Terras do Sem-Fim", de Jorge Amado, abre com a chegada de um navio à região cacaueira do sul da Bahia, tendo como um dos personagens centrais dessa cena inicial o "capitão" João Magalhães, um jogador que se passa por engenheiro militar. O trecho da alternativa A, com o apito do navio e o capitão João Magalhães observando o casario da cidade, corresponde a essa abertura do romance.

Os demais trechos pertencem a outras obras do próprio Jorge Amado ou de outros autores regionalistas, com cenários e personagens que não fazem parte de Terras do Sem-Fim.',
  'dificil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 9, null, false,
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
  'Português', 'Escolas Literárias', 'Sobre a ruptura entre os diversos momentos da
literatura brasileira, assinale a alternativa
CORRETA.',
  '[{"id": "a", "texto": "O Realismo e Naturalismo rompem com a realidade colonial e crítica social do Arcadismo."}, {"id": "b", "texto": "O Parnasianismo rompe com o sentimentalismo romântico, todavia introduz o emprego da linguagem coloquial."}, {"id": "c", "texto": "O Pré-Modernismo rompe com o realismo, porém opta pela valorização da perfeição formal e pela métrica."}, {"id": "d", "texto": "O Modernismo rompe com os movimentos anteriores, todavia mantém as formas clássicas e o sentimentalismo romântico."}, {"id": "e", "texto": "O Romantismo valoriza os temas nacionais, enaltecendo a figura do índio e a natureza tropical para romper com as tradições europeias."}]'::jsonb, 'e', 'A alternativa E está correta: o Romantismo brasileiro, sobretudo em sua vertente indianista, valorizou temas nacionais e enalteceu a figura do índio e a natureza tropical como símbolos de identidade, rompendo com o classicismo e com os modelos estéticos europeus que dominavam a literatura colonial.

As demais associam características que não correspondem: Realismo e Naturalismo rompem com o idealismo romântico, não com o Arcadismo (A); o Parnasianismo mantém linguagem culta e elaborada, e não coloquial (B); o Pré-Modernismo não valoriza a perfeição formal e a métrica, marca do Parnasianismo, mas volta o olhar para temas sociais e regionais (C); e o Modernismo justamente rompe com as formas clássicas e o sentimentalismo romântico, ao invés de mantê-los (D).',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 10, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q10-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Inglês', 'Reading Comprehension', 'The Vital Role of Exercise in Modern Medicine
Physical exercise is no longer viewed merely as a
lifestyle choice but as a fundamental clinical
intervention for maintaining systemic health.
From a physiological standpoint, regular
movement triggers a cascade of beneficial
adaptations, including improved cardiovascular
efficiency, enhanced insulin sensitivity, and the
regulation of lipid profiles. By strengthening the
myocardium and reducing arterial stiffness,
exercise serves as a primary defense against
hypertension and coronary artery disease,
effectively acting as a “polypill” with minimal side
effects.
Beyond metabolic and cardiovascular health, the
medical community increasingly recognizes the
profound impact of physical activity on
neurological and psychological well-being.
Engaging in aerobic exercise stimulates the
release of neurotrophic factors, such as BDNF
(Brain-Derived Neurotrophic Factor), which
supports neurogenesis and cognitive function.
Furthermore, the modulation of neurotransmitters
like serotonin and dopamine during physical
exertion provides a robust mechanism for
combating clinical depression and anxiety,
making it an essential component of
comprehensive mental health treatment plans.
Finally, the role of resistance training and weight-bearing activities is crucial in preventing age-related degenerative conditions such as
sarcopenia and osteoporosis. By placing
controlled mechanical stress on the
musculoskeletal system, exercise promotes bone
mineral density and preserves muscle mass,
which are vital for maintaining functional
independence in geriatric populations. Ultimately,
integrating personalized exercise prescriptions
into standard medical practice is indispensable
for increasing both the lifespan and the
“healthspan” of patients worldwide.
According to the first paragraph of the text, how
is physical exercise currently viewed by the
medical community? Mark the CORRECT
alternative:',
  '[{"id": "a", "texto": "As a secondary activity that only complements pharmacological treatment."}, {"id": "b", "texto": "As a fundamental clinical intervention for maintaining systemic health."}, {"id": "c", "texto": "As a treatment that often causes more side effects than traditional medicine."}, {"id": "d", "texto": "As a method restricted only to patients with existing heart disease."}, {"id": "e", "texto": "Solely as a lifestyle choice for aesthetic purposes."}]'::jsonb, 'b', 'O texto afirma, já na segunda linha, que o exercício físico deixou de ser visto apenas como estilo de vida e passou a ser tratado "as a fundamental clinical intervention for maintaining systemic health" — exatamente o que a alternativa B reproduz.

As demais contrariam o texto: ele não trata o exercício como atividade secundária que só complementa remédios (A), não diz que causa mais efeitos colaterais que a medicina tradicional — ao contrário, chama-o de "polypill" com efeitos colaterais mínimos (C), não o restringe a pacientes cardíacos (D) e não o reduz a uma escolha estética (E).',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 11, 'ingles', false,
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
  'Inglês', 'Reading Comprehension', 'Based on the second paragraph of the text, what
is the relationship between aerobic exercise and
mental health? Mark the CORRECT alternative:',
  '[{"id": "a", "texto": "Aerobic exercise is recommended only for physical ailments, having little to no impact on neurological disorders."}, {"id": "b", "texto": "Physical activity reduces the production of serotonin, necessitating the use of medication to balance mood."}, {"id": "c", "texto": "Exercise stimulates the release of neurotransmitters such as serotonin and dopamine, helping to combat depression and anxiety."}, {"id": "d", "texto": "Mental health is primarily improved by the social isolation found in exercise, rather than biological mechanisms."}, {"id": "e", "texto": "The release of BDNF (Brain-Derived Neurotrophic Factor) is considered harmful to long-term cognitive function."}]'::jsonb, 'c', 'O segundo parágrafo afirma que o exercício aeróbico estimula a liberação do BDNF (fator neurotrófico derivado do cérebro), que sustenta a neurogênese, e modula neurotransmissores como serotonina e dopamina, fornecendo um mecanismo robusto contra depressão e ansiedade clínicas. É exatamente essa relação que a alternativa C descreve.

As demais invertem ou distorcem essa relação: o texto não diz que o exercício tem pouco impacto neurológico (A), não afirma que a atividade física reduz a serotonina (B) — pelo contrário, modula-a positivamente —, não atribui o benefício ao isolamento social (D), e trata o BDNF como benéfico, não prejudicial à cognição (E).',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 12, 'ingles', false,
  '[{"url": "/questoes-facape/2026.2-ampla-q12-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Inglês', 'Passive Voice', 'What is the passive voice of this sentence:
“The doctor gave the patient another pill.”
Mark the CORRECT alternative:',
  '[{"id": "a", "texto": "The patient was given another pill by the doctor."}, {"id": "b", "texto": "The patient given was another pill by the doctor."}, {"id": "c", "texto": "The pill and the patient were given."}, {"id": "d", "texto": "The patient and the pill were given."}, {"id": "e", "texto": "The doctor gave the patient and the pill to the patient by the doctor himself."}]'::jsonb, 'a', 'Na voz ativa, "The doctor gave the patient another pill", o objeto indireto (the patient) passa a sujeito da voz passiva, e o sujeito original vira agente da passiva, introduzido por "by": "The patient was given another pill by the doctor." É a construção correta, alternativa A.

As demais alteram a ordem das palavras (B), duplicam ou embaralham os elementos da frase (C, D) ou repetem "the patient" e "by the doctor himself" de forma redundante e gramaticalmente incorreta (E).',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'Inglês', 'Conditional Sentences', 'What is the CORRECT sentence? Mark the right
alternative:',
  '[{"id": "a", "texto": "If I see the accident, I would have called the ambulance."}, {"id": "b", "texto": "If I had seen the accident, I called the ambulance."}, {"id": "c", "texto": "If I saw the accident, I will call the ambulance."}, {"id": "d", "texto": "If I saw had the accident, I would called the ambulance."}, {"id": "e", "texto": "If I had seen the accident, I would have called the ambulance."}]'::jsonb, 'e', 'A frase descreve uma condição hipotética não cumprida no passado, o chamado terceiro condicional (third conditional): if + past perfect na oração condicional, e would have + particípio passado na oração principal. "If I had seen the accident, I would have called the ambulance" segue exatamente essa estrutura, alternativa E.

As demais misturam tempos verbais de condicionais diferentes: A combina presente simples com would have; B usa past perfect com passado simples; C mistura passado simples com futuro; D duplica marcadores de tempo de forma incorreta ("saw had", "would called").',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 14, 'ingles', false,
  '[{"url": "/questoes-facape/2026.2-ampla-q14-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q14-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'Inglês', 'Future Tense', 'What is the simple future of this sentence:
“Can you drive?”
Mark the CORRECT alternative:',
  '[{"id": "a", "texto": "Will can you drive?"}, {"id": "b", "texto": "Can will you drive?"}, {"id": "c", "texto": "Will you can drive?"}, {"id": "d", "texto": "Will you be able to drive?"}, {"id": "e", "texto": "Will can you able be to drive?"}]'::jsonb, 'd', 'A pergunta "Can you drive?" usa o modal "can" para expressar habilidade no presente. Como dois modais não podem ser combinados diretamente em inglês (não existe "will can"), a habilidade precisa ser expressa pela construção "be able to". No futuro simples, a pergunta correta é "Will you be able to drive?", alternativa D.

As demais combinam "will" e "can" lado a lado, o que a gramática inglesa não permite (A, B, C, E).',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 15, 'ingles', false,
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
  'Espanhol', 'Interpretação de Texto', 'El espectáculo del medio tiempo del Super Bowl
LX quedará grabado en la memoria colectiva no
solo por el despliegue escénico de Bad Bunny,
sino por su contundente mensaje sociopolítico.
Ante más de cien millones de espectadores, el
artista puertorriqueño transformó el campo en un
altar de la resistencia cultural latina y caribeña.
Sin ceder a la presión de la industria para
interpretar sus éxitos en inglés, Benito Martínez
reivindicó su lengua materna y proyectó
imágenes de las luchas sociales
contemporáneas, desde la crisis migratoria en la
frontera hasta la defensa de los territorios
originarios. La controversia estalló
inmediatamente en las plataformas digitales:
mientras algunos sectores conservadores
tildaron la actuación de “politización innecesaria
del deporte”, diversos colectivos y activistas
celebraron la visibilización de una identidad a
menudo marginada y estereotipada en los
grandes espacios hegemónicos de Estados
Unidos. Una vez más, la música urbana demostró
su capacidad para ser un vehículo de
reivindicación.
PÉREZ, J. Bad Bunny transforma el Super Bowl
en un escenario de resistencia latina. El País,
Madrid, 10 feb. 2026 (adaptado).
A participação de artistas latino-americanos em
eventos de alcance global frequentemente
suscita tensões culturais. Ao relatar a
performance de Bad Bunny no Super Bowl LX, o
texto jornalístico evidencia que a atitude do
cantor teve o propósito de:',
  '[{"id": "a", "texto": "subverter a lógica hegemônica do entretenimento para promover a afirmação identitária e política de grupos minorizados."}, {"id": "b", "texto": "priorizar a denúncia das políticas de imigração fronteiriças em detrimento do impacto comercial de seu próprio repertório."}, {"id": "c", "texto": "ceder às pressões do mercado fonográfico estadunidense ao adaptar sua performance para garantir aceitação internacional."}, {"id": "d", "texto": "provocar a rejeição unânime do público local ao inserir temáticas sociopolíticas alheias à tradição do esporte americano."}, {"id": "e", "texto": "restringir a valorização da cultura caribenha aos aspectos puramente estéticos e musicais apreciados pelos conservadores."}]'::jsonb, 'a', 'O texto descreve a apresentação de Bad Bunny no intervalo do Super Bowl como um ato de resistência cultural: ele manteve as letras em espanhol apesar da pressão do mercado e projetou imagens ligadas a lutas sociais latinas e caribenhas, como a crise migratória e a defesa de territórios originários. Isso é, em essência, usar um evento de entretenimento hegemônico para afirmar identidade e política de um grupo minorizado — exatamente o que descreve a alternativa A.

As demais distorcem o relato: o artista não abandonou seu repertório em favor da denúncia migratória, apenas os combinou (B); ele resistiu à pressão do mercado, não cedeu a ela (C); o texto menciona controvérsia, não rejeição unânime (D); e a performance foi criticada exatamente por ir além do estético, com forte conteúdo político (E).',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'Espanhol', 'Leitura de Imagem', 'MINISTERIO DE LA MUJER Y POBLACIONES
VULNERABLES. Campaña contra el ciberacoso. Lima:
Gobierno del Perú, 2023 (adaptado).
As campanhas de consciencialização utilizam
frequentemente a conjugação de linguagem
verbal e não verbal para potenciar a sua
mensagem junto do público. Analisar a interação
entre os elementos do cartaz permite concluir
que o propósito principal da campanha é:',
  '[{"id": "a", "texto": "evidenciar que a eliminação de mensagens ofensivas nos dispositivos soluciona os traumas psicológicos das vítimas."}, {"id": "b", "texto": "consciencializar a sociedade sobre a urgência de limitar o tempo de uso de telemóveis por adolescentes nas escolas."}, {"id": "c", "texto": "alertar para a gravidade inescondível da violência digital e incentivar a denúncia ativa através de canais oficiais."}, {"id": "d", "texto": "atribuir às grandes plataformas de tecnologia a responsabilidade primária pelo controle e punição de crimes virtuais."}, {"id": "e", "texto": "relativizar o impacto das agressões na internet ao reconhecê-las como brincadeiras comuns no convívio juvenil moderno."}]'::jsonb, 'c', 'O cartaz da campanha peruana traz a frase de que o ciberacosso deixa cicatrizes que o botão de "apagar" não consegue esconder, seguida do apelo "Se dói, não é brincadeira" e do convite a falar e denunciar pela linha oficial 100. A combinação entre a imagem de impacto e esse texto direto tem como objetivo alertar para a gravidade real da violência digital e estimular a denúncia por canais oficiais — o que descreve a alternativa C.

As demais extrapolam ou distorcem a mensagem: o cartaz não sugere que apagar mensagens resolve o trauma psicológico (A), não trata do tempo de uso de celulares (B), não atribui às plataformas a responsabilidade central (D) e, ao contrário de E, rejeita explicitamente relativizar o ciberacosso como brincadeira — é justamente essa banalização que a campanha combate.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 12, 'espanhol', false,
  '[{"url": "/questoes-facape/2026.2-ampla-q12-3.png", "legenda": null, "ordem": 3}]'::jsonb, true
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
  'Espanhol', 'Leitura de Charge', 'VILA, J. Tierras arrasadas: el humor gráfico frente al
neoextractivismo. Buenos Aires: Ediciones de la Flor, 2022
(adaptado).
Analisar a charge à luz da realidade
socioeconómica latino-americana exige
compreender o conflito histórico entre diferentes
visões e usos do espaço geográfico. Ao
contrastar a argumentação da personagem de
fato e gravata com a representação visual do
cenário, o cartunista tem o propósito de:',
  '[{"id": "a", "texto": "criticar a reduzida qualificação técnica das populações originárias, que as impede de atuar ativamente no mercado de matérias-primas."}, {"id": "b", "texto": "demonstrar que as novas políticas de desenvolvimento sustentável reconciliam a mineração intensiva com a manutenção do património cultural."}, {"id": "c", "texto": "denunciar estritamente a exclusão financeira das comunidades locais face à distribuição desigual dos lucros gerados por corporações estrangeiras."}, {"id": "d", "texto": "problematizar a retórica econômica hegemônica que camufla a espoliação de territórios tradicionais sob o verniz discursivo da modernização."}, {"id": "e", "texto": "enaltecer a capacidade inevitável de adaptação das culturas ancestrais perante as exigências impostas pelo comércio internacional de bens."}]'::jsonb, 'd', 'Na charge, o personagem de terno e gravata diz que a perda da terra sagrada ancestral não deve ser vista como algo irreparável, mas como uma "inserção bem-sucedida" no mercado. É um discurso que emprega o vocabulário do desenvolvimento e do progresso econômico para maquiar a espoliação de um território tradicional — o contraste entre essa fala e a cena visual de devastação é o que evidencia a crítica do cartunista, descrita corretamente pela alternativa D.

As demais erram o alvo da crítica: a charge não questiona a qualificação técnica das populações originárias (A), não reconcilia mineração e patrimônio cultural — mostra justamente o oposto (B), não se limita à exclusão financeira, mas à espoliação territorial mais ampla (C), e não enaltece a adaptação das culturas ancestrais, e sim denuncia a retórica que naturaliza sua perda (E).',
  'dificil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'Espanhol', 'Interpretação de Texto', 'El racismo se justifica, a menudo, apelando a una
supuesta herencia genética: los marginados no
sufren por culpa de las estructuras de la historia,
sino por obra de la biología. En nuestra América,
esta discriminación también rige las palabras y
los silencios. Llevamos más de cinco siglos
aprendiendo a mirarnos con los ojos de quien
nos desprecia, conviviendo con una memoria
arrancada y una identidad fracturada. El indígena
y el afrodescendiente son presentados en la
narrativa oficial apenas como pintorescas figuras
del folclore, casi nunca como sujetos activos y
verdaderos forjadores de la trama histórica
nacional. Sin embargo, lejos de los despachos
académicos, en las comunidades y en las calles
de toda América Latina, late y respira una
contranarrativa incesante: es la de los rituales, las
lenguas originarias, los tambores y los cantos
que se negaron a morir, resistiendo
silenciosamente en el tenaz subsuelo de la
cultura hegemónica.
GALEANO, E. Patas arriba: la escuela del
mundo al revés. Madrid: Siglo XXI, 1998
(adaptado).
O fragmento do escritor uruguaio Eduardo
Galeano problematiza a construção histórica da
identidade latino-americana através de uma
leitura crítica da sociedade. Ao abordar a forma
como as populações negra e indígena são
retratadas e como reagem, o texto tem o
propósito de:',
  '[{"id": "a", "texto": "evidenciar que o forte sincretismo cultural da região eliminou as barreiras estruturais herdadas do período da colonização europeia."}, {"id": "b", "texto": "denunciar o apagamento sistemático de grupos subalternizados na história oficial e valorizar as suas formas contínuas de resistência cultural."}, {"id": "c", "texto": "legitimar o argumento científico de que as desigualdades socioeconômicas profundas derivam de heranças biológicas e genéticas inalteráveis."}, {"id": "d", "texto": "criticar a redução histórica das populações originárias e afrodescendentes a meras figuras folclóricas, sugerindo que a superação desse preconceito exige o abandono dos seus rituais tradicionais."}, {"id": "e", "texto": "minimizar a influência prejudicial do discurso eurocêntrico na formação da autoimagem e da memória coletiva dos povos latino-americanos."}]'::jsonb, 'b', 'O texto denuncia como indígenas e afrodescendentes são reduzidos, na narrativa histórica oficial, a figuras pitorescas do folclore, quase nunca reconhecidos como sujeitos ativos da história, e contrapõe a isso uma contranarrativa viva de rituais e resistência cultural presente nas comunidades. Essa dupla denúncia — do apagamento oficial e da persistência da resistência — corresponde à alternativa B.

As demais não fecham com o texto: ele não afirma que o sincretismo eliminou as barreiras estruturais coloniais (A); rejeita, e não legitima, a explicação biológica das desigualdades, chamando-a de justificativa do racismo (C); não pede o abandono dos rituais tradicionais, mas sua valorização como resistência (D); e não minimiza a influência do discurso eurocêntrico — denuncia-a com força (E).',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 14, 'espanhol', false,
  '[{"url": "/questoes-facape/2026.2-ampla-q14-3.png", "legenda": null, "ordem": 3}]'::jsonb, true
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
  'Espanhol', 'Interpretação de Texto', 'Para vivir en la línea de la frontera debes saber
que el viento no entiende de muros ni de
aduanas. Aquí mi lengua es un puente
suspendido, a veces hablo en inglés para
sobrevivir en la calle, a veces lloro en español
para recordar mi casa. Y en el medio, en el cruce
implacable de los mundos, nace y respira
nuestro Spanglish. No lo mires como un idioma
roto o un balbuceo, sino como una patria
remendada, cosida a mano con hilos tenaces de
dos colores.
ANZALDÚA, G. Borderlands/La Frontera: The New
Mestiza. San Francisco: Aunt Lute Books, 1987
(adaptado).
A literatura chicana e fronteiriça explora
frequentemente a língua como um espaço de
negociação e conflito. No poema de Gloria
Anzaldúa, a alternância entre o espanhol e o
inglês e a emergência do Spanglish são
representadas como:',
  '[{"id": "a", "texto": "um obstáculo severo à integração social e econômica dos imigrantes latinos nas comunidades estadunidenses."}, {"id": "b", "texto": "evidenciar o fenômeno de assimilação cultural, através do qual as populações fronteiriças abdicam progressivamente das suas raízes hispânicas."}, {"id": "c", "texto": "uma falha estrutural no processo de aprendizagem linguística, resultante da precariedade do sistema educativo na região da fronteira."}, {"id": "d", "texto": "refletir a hegemonia absoluta do idioma inglês, que elimina por completo a expressividade emocional da língua materna dos falantes."}, {"id": "e", "texto": "um instrumento de resistência e afirmação identitária, capaz de conectar heranças culturais perante a iminência do apagamento."}]'::jsonb, 'e', 'No poema, a voz que vive na fronteira descreve a língua como uma ponte suspensa entre o inglês, falado para sobreviver, e o espanhol, para lembrar de casa; o Spanglish que nasce desse cruzamento é apresentado não como um idioma quebrado, mas como uma pátria remendada, costurada com fios de duas cores. Essa imagem afirma a língua híbrida como forma de resistência e de conexão entre heranças culturais diante do risco de apagamento — o que a alternativa E expressa corretamente.

As demais contrariam o sentido do poema: ele não trata o Spanglish como obstáculo à integração (A), nem como abandono das raízes hispânicas (B) — muito pelo contrário, reafirma-as —, não o atribui a uma falha educativa (C) e não descreve o inglês como hegemonia absoluta que apaga o espanhol (D); os dois idiomas convivem e se entrelaçam no poema.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'Matemática', 'Conjuntos Numéricos', 'A seguir tem-se as igualdades de alguns
números racionais:
I. 0,424242... = 14
II. 4
=
III. 0,222 = 2
IV. 2
= 40%
A sequência que classifica corretamente cada
um dos respectivos itens como V (verdadeiro) ou
F (falso), é:',
  '[{"id": "a", "texto": "V, F, V, V."}, {"id": "b", "texto": "V, V, V, F."}, {"id": "c", "texto": "V, V, F, V."}, {"id": "d", "texto": "F, V, F, V."}, {"id": "e", "texto": "F, F, V, F."}]'::jsonb, 'c', 'Basta analisar três dos quatro itens para chegar à resposta.

Item I é verdadeiro. A dízima periódica 0,424242... tem período 42, então vale 42/99, que simplificado por 3 dá 14/33.

Item III é falso, e essa é a pegadinha da questão. O número 0,222 é decimal exato, com apenas três casas, e equivale a 222/1000 = 111/500. Já 2/9 é a dízima 0,222..., com infinitas casas. Faltou a reticência que indicaria a periodicidade, de modo que os dois números são diferentes.

Item IV é verdadeiro: 2/5 = 0,4 = 40%.

Com I verdadeiro, III falso e IV verdadeiro, a única sequência compatível entre as alternativas é V, V, F, V — a letra C. Não é sequer necessário avaliar o item II, já que nenhuma outra opção combina esses três resultados.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 16, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q16-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q16-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-ampla-q16-3.png", "legenda": null, "ordem": 3}, {"url": "/questoes-facape/2026.2-ampla-q16-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-ampla-q16-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Matemática', 'Progressões', 'A tabela a seguir, preenchida parcialmente,
relaciona as quantidades crescentes de pessoas
que responderam a uma pesquisa sobre
doenças sexualmente transmissíveis, durante
três semanas consecutivas, sempre realizada de
segunda a sexta feira:
1ª
semana
2ª
semana
3ª
semana
Seg 3
Ter 6
Qua 9 10
Qui 12
Sex 15 17
Se o padrão verificado na 1ª semana se mantiver
nas duas semanas seguintes, a quantidade total
de pessoas que responderam a essa pesquisa
nas três semanas será:',
  '[{"id": "a", "texto": "95"}, {"id": "b", "texto": "100"}, {"id": "c", "texto": "105"}, {"id": "d", "texto": "145"}, {"id": "e", "texto": "150"}]'::jsonb, 'e', 'Na 1ª semana os valores são 3, 6, 9, 12 e 15: uma progressão aritmética de razão 3, somando 45 pessoas.

O padrão a manter é essa razão 3 de um dia para o outro. Os dados parciais das semanas seguintes fixam cada sequência:

2ª semana — quarta-feira é 10, logo os dias são 4, 7, 10, 13 e 16, somando 50.
3ª semana — sexta-feira é 17, logo os dias são 5, 8, 11, 14 e 17, somando 55.

O total das três semanas é 45 + 50 + 55 = 150, alternativa E.

Um atalho útil: em uma PA com número ímpar de termos, a soma é o termo central multiplicado pela quantidade de termos. Assim, 9 × 5 = 45, 10 × 5 = 50 e 11 × 5 = 55.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 17, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q17-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q17-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-ampla-q17-3.png", "legenda": null, "ordem": 3}, {"url": "/questoes-facape/2026.2-ampla-q17-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-ampla-q17-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Matemática', 'Sistemas Lineares', 'As fichas médicas de três crianças foram
selecionadas ao acaso por um pediatra, para a
verificação de suas pesagens na última consulta.
Selecionando-se duas a duas, verificou-se que
as crianças A e B, juntas, somaram 50 kg; as
crianças A e C, juntas, 45 kg; as crianças B e C,
35 kg. Assim, se for verificada a pesagem das
três crianças A, B e C juntas, o resultado obtido,
em kg, será:',
  '[{"id": "a", "texto": "15"}, {"id": "b", "texto": "20"}, {"id": "c", "texto": "30"}, {"id": "d", "texto": "65"}, {"id": "e", "texto": "130"}]'::jsonb, 'd', 'O sistema é:
A + B = 50
A + C = 45
B + C = 35

Somando as três equações, cada criança aparece exatamente duas vezes:
2A + 2B + 2C = 50 + 45 + 35 = 130

Logo, 2(A + B + C) = 130 e A + B + C = 65 kg, alternativa D.

O erro que a questão espera é marcar 130 (alternativa E), esquecendo de dividir por 2. Não é preciso descobrir o peso individual de cada criança, embora ele saia facilmente: A = 30, B = 20 e C = 15.',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 18, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q18-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', 'Geometria Plana', 'Em um jardim há um canteiro de flores no
formato circular, com 1,5 m de raio. Em volta
desse canteiro foi plantada grama, ocupando
uma faixa de 50 cm. A figura a seguir demonstra
a situação descrita, na qual a parte sombreada
representa a faixa de grama que foi plantada, e a
parte clara, o canteiro de flores.
Foi instalada uma cerca em volta da faixa de
grama, cercando a sua parte interna, que fica
junto ao canteiro de flores, como também a sua
parte externa. Considerando π = 3, tem-se que o
total de metros lineares de cerca utilizado foi:',
  '[{"id": "a", "texto": "5,25"}, {"id": "b", "texto": "6,75"}, {"id": "c", "texto": "12"}, {"id": "d", "texto": "21"}, {"id": "e", "texto": "48"}]'::jsonb, 'd', 'A cerca foi instalada em duas circunferências: a interna, que contorna o canteiro, e a externa, que contorna a faixa de grama.

Raio interno: 1,5 m, o próprio canteiro.
Raio externo: 1,5 + 0,5 = 2 m, somando a faixa de 50 cm de grama.

Com C = 2πr e π = 3:
Circunferência interna = 2 × 3 × 1,5 = 9 m
Circunferência externa = 2 × 3 × 2 = 12 m

Total de cerca = 9 + 12 = 21 m, alternativa D.

Quem cerca apenas a parte externa marca 12 (alternativa C). Atenção também à conversão dos 50 cm para 0,5 m antes de somar ao raio.',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 19, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q19-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-ampla-q19-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Matemática', 'Função do 2º Grau', 'O momento da cobrança de falta em uma partida
de futebol exige habilidade por parte do jogador,
para que este consiga chutar a bola para a
frente, e com uma certa inclinação para cima,
fazendo com que essa bola passe sobre a
barreira formada por outros jogadores e atinja as
traves do gol, perfazendo assim um trajeto no
formato de uma parábola. Supondo que a
trajetória da bola obedeça à lei f(x) = −1,5x2 + 6x,
na qual f(x) representa a altura da bola em
metros, conclui-se que a altura máxima que a
bola atingiu após a cobrança dessa falta, foi:',
  '[{"id": "a", "texto": "2m"}, {"id": "b", "texto": "6m"}, {"id": "c", "texto": "8m"}, {"id": "d", "texto": "10m"}, {"id": "e", "texto": "12m FÍSICA"}]'::jsonb, 'b', 'A trajetória é f(x) = −1,5x² + 6x, uma parábola com concavidade para baixo, já que a = −1,5 é negativo. A altura máxima é a ordenada do vértice.

Primeiro a abscissa do vértice:
x = −b/(2a) = −6/(2 × −1,5) = −6/−3 = 2

Agora a altura nesse ponto:
f(2) = −1,5 × (2)² + 6 × 2 = −6 + 12 = 6

A altura máxima é 6 m, alternativa B.

O deslize mais comum é parar em x = 2 e marcar a alternativa A, confundindo a posição horizontal do ponto mais alto com a própria altura.',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 20, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q20-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q20-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-ampla-q20-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Física', 'Cinemática', 'Uma sonda pousa em Encélado, uma das luas de
Saturno. Para calibrar os sensores de pouso, a
sonda libera uma pequena esfera metálica de
teste a partir do repouso, rente à superfície. Uma
câmera, configurada para capturar 600 fotos por
minuto, registra a queda da esfera. Ao analisar os
dados telemétricos da imagem, os cientistas
observam que a esfera levou exatamente 6
quadros (frames) para percorrer uma distância
vertical de 75 cm. Considerando que o primeiro
quadro registra o exato momento em que a
esfera é solta (𝑣0 = 0), qual é a aceleração da
gravidade registrada?',
  '[{"id": "a", "texto": "3 m/s2"}, {"id": "b", "texto": "6 m/s2"}, {"id": "c", "texto": "10 m/s2"}, {"id": "d", "texto": "12 m/s2"}, {"id": "e", "texto": "15 m/s2"}]'::jsonb, 'b', 'A câmera captura 600 fotos por minuto, ou seja, 10 quadros por segundo, e o intervalo entre quadros consecutivos é de 0,1 s.

O detalhe decisivo é a contagem: o primeiro quadro marca o instante da soltura (t = 0). Do quadro 1 ao quadro 6 há 5 intervalos, e não 6. Logo, o tempo de queda é t = 5 × 0,1 = 0,5 s.

Como a esfera parte do repouso, vale h = g·t²/2. Isolando a gravidade:
g = 2h/t² = (2 × 0,75)/(0,5)² = 1,5/0,25 = 6 m/s².

A resposta é a alternativa B. Contar 6 intervalos em vez de 5 levaria a cerca de 4,2 m/s², valor que sequer aparece entre as opções — é justamente essa a armadilha da questão.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 21, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q21-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', 'Dinâmica', 'Para estudar o comportamento de embreagens
multidisco, onde o empilhamento de placas
aumenta a capacidade de transmissão de torque
sem que ocorra deslizamento, um técnico de
laboratório monta o seguinte experimento: três
placas metálicas idênticas (A, B e C), de peso
𝑃 = 10𝑁 cada, são empilhadas sobre uma
bancada onde a placa C, a base, está fixa. O
coeficiente de atrito estático entre todas as
superfícies em contato é 0,5. Uma máquina de
tração aplica uma força horizontal F diretamente
na placa intermediária B. Determine o maior
valor que F pode admitir sem que a placa B
comece a deslizar.',
  '[{"id": "a", "texto": "5𝑁"}, {"id": "b", "texto": "10𝑁"}, {"id": "c", "texto": "15𝑁"}, {"id": "d", "texto": "20𝑁"}, {"id": "e", "texto": "30𝑁"}]'::jsonb, 'c', 'A placa B está presa entre duas superfícies e, para deslizar, precisa vencer o atrito nas duas ao mesmo tempo: o contato de cima, com A, e o de baixo, com C.

No contato A–B, a força normal é apenas o peso de A: N₁ = 10 N. O atrito máximo vale f₁ = 0,5 × 10 = 5 N.

No contato B–C, a normal sustenta o peso de A e de B: N₂ = 10 + 10 = 20 N. O atrito máximo vale f₂ = 0,5 × 20 = 10 N.

A força máxima que B suporta sem deslizar é a soma das duas resistências:
F = f₁ + f₂ = 5 + 10 = 15 N, alternativa C.

O erro comum é considerar só o contato com a bancada, o que daria 10 N (alternativa B), ou usar o peso das três placas na normal inferior — mas a placa B não sustenta o próprio peso somado ao de C, já que C está abaixo e fixa.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 22, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q22-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q22-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-ampla-q22-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Física', 'Energia e Quantidade de Movimento', 'Para investigar os mecanismos de dissipação de
energia em sistemas de amortecimento de docas
portuárias, onde é vital calcular a deformação de
grandes molas de aço para evitar que o impacto
de containers danifique a estrutura do cais, um
pesquisador utiliza um modelo em escala. No
experimento, um corpo de massa 𝑚 desliza sem
atrito e colide com uma mola de constante
elástica 𝑘 , resultando em uma compressão
máxima 𝑥. Considerando o instante do impacto, a
expressão que define a quantidade de
movimento do corpo é:',
  '[{"id": "a", "texto": "𝑥𝑚𝑘"}, {"id": "b", "texto": "𝑥 2𝑚𝑘"}, {"id": "c", "texto": "𝑥 𝑚2𝑘"}, {"id": "d", "texto": "𝑥√𝑚𝑘"}, {"id": "e", "texto": "√𝑥𝑚𝑘"}]'::jsonb, 'd', 'Como não há atrito, toda a energia cinética do corpo no instante do impacto se converte em energia potencial elástica na compressão máxima:

m·v²/2 = k·x²/2  →  v² = k·x²/m  →  v = x·√(k/m)

A quantidade de movimento é p = m·v:

p = m · x · √(k/m) = x · √(m²·k/m) = x·√(m·k)

A resposta é a alternativa D. As demais falham na álgebra da raiz: em A a raiz desaparece, em B e C aparecem fatores 2 que não vêm da conservação de energia, e em E o próprio x foi colocado dentro do radical.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 23, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q23-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', 'Eletromagnetismo', 'Para investigar o funcionamento de discos
rígidos (HDs) e sensores magnéticos, onde a
inversão de campos em nanoescala é usada para
ler dados binários, um engenheiro de
computação utiliza o seguinte modelo: um próton
de carga 𝑞 e massa 𝑚 é lançado do ponto A,
com vetor velocidade 𝑣 perpendicular a duas
regiões com campos magnéticos opostos de
magnitudes 𝐵1 e 𝐵2. Após um intervalo de tempo
∆𝑡, o próton passa pelo ponto C com o mesmo
vetor velocidade inicial 𝑣 (módulo, direção e
sentido). Qual é o menor valor desse intervalo de
tempo?',
  '[{"id": "a", "texto": "𝑚𝜋 𝑞 (𝐵1+𝐵2) 𝐵1𝐵2"}, {"id": "b", "texto": "2𝑚𝜋 𝑞 (𝐵1+𝐵2) 𝐵1𝐵2"}, {"id": "c", "texto": "𝑚𝜋 2𝑞 (𝐵1+𝐵2) 𝐵1𝐵2"}, {"id": "d", "texto": "𝑚𝜋 𝑞 (𝐵1+𝐵2)"}, {"id": "e", "texto": "2𝑚𝜋(𝐵1+𝐵2) 𝑞"}]'::jsonb, 'a', 'Em um campo magnético uniforme, uma carga lançada perpendicularmente descreve movimento circular uniforme com período T = 2πm/(qB), independente da velocidade.

Para que o próton chegue a C com o mesmo vetor velocidade inicial, ele percorre meia circunferência em cada região, pois os campos são opostos e a segunda curva desfaz o desvio da primeira. O tempo de cada semicircunferência é T/2 = πm/(qB).

Somando as duas regiões:

Δt = πm/(q·B₁) + πm/(q·B₂) = (πm/q) · (1/B₁ + 1/B₂) = πm·(B₁ + B₂)/(q·B₁·B₂)

A resposta é a alternativa A. A alternativa B corresponderia a voltas completas em vez de semicircunferências, e D e E perdem o produto B₁·B₂ no denominador, que vem justamente da soma das frações.',
  'dificil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 24, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q24-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q24-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-ampla-q24-3.png", "legenda": null, "ordem": 3}, {"url": "/questoes-facape/2026.2-ampla-q24-4.png", "legenda": null, "ordem": 4}, {"url": "/questoes-facape/2026.2-ampla-q24-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-ampla-q24-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Física', 'Indução Eletromagnética', 'Para investigar o funcionamento de balanças
analíticas de precisão, onde se utilizam
pequenos freios magnéticos para amortecer a
oscilação do prato, um pesquisador utiliza o
seguinte modelo técnico: Um condutor retilíneo,
em posição horizontal, move-se com velocidade
constante de 0,5 m/s, sem atrito, sobre dois
condutores fixos, retos e paralelos, cuja distância
entre si é de 25 cm. O condutor móvel mantém
seu movimento uniforme graças à tração
exercida por um fio ideal conectado a um corpo
suspenso, conforme a figura. O conjunto está
imerso em um campo magnético uniforme de
intensidade igual a 2 T. O condutor móvel, de
secção transversal com 0,1 cm² de área, possui
resistividade igual a 2 ∙ 10−3 Ω 𝑐𝑚. Considerando
que os condutores fixos não têm resistência
considerável e adotando 𝑔 = 10 𝑚 𝑠
2 ⁄ , a massa
𝑚 do corpo suspenso, em gramas, é:',
  '[{"id": "a", "texto": "2,4 g"}, {"id": "b", "texto": "6,3g"}, {"id": "c", "texto": "25g"}, {"id": "d", "texto": "120g"}, {"id": "e", "texto": "253g QUÍMICA"}]'::jsonb, 'c', 'O condutor se move com velocidade constante, então a tração do fio equilibra exatamente a força magnética que se opõe ao movimento. O cálculo segue em quatro passos.

1) Resistência do condutor móvel. Com ρ = 2·10⁻³ Ω·cm = 2·10⁻⁵ Ω·m, L = 25 cm = 0,25 m e A = 0,1 cm² = 1·10⁻⁵ m²:
R = ρL/A = (2·10⁻⁵ × 0,25)/(1·10⁻⁵) = 0,5 Ω

2) Força eletromotriz induzida:
ε = B·L·v = 2 × 0,25 × 0,5 = 0,25 V

3) Corrente induzida (os trilhos fixos têm resistência desprezível):
i = ε/R = 0,25/0,5 = 0,5 A

4) Força magnética sobre o condutor, igual ao peso do corpo suspenso:
F = B·i·L = 2 × 0,5 × 0,25 = 0,25 N
m = F/g = 0,25/10 = 0,025 kg = 25 g

A resposta é a alternativa C. O erro mais provável é esquecer a conversão de Ω·cm para Ω·m, que altera a resistência por um fator 100.',
  'dificil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 25, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q25-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q25-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-ampla-q25-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', 'Estequiometria', 'O cloreto de cálcio (CaCℓ2) é um agente secante
extremamente eficaz e higroscópico,
amplamente utilizado para absorver a umidade
do ar em ambientes fechados (armários, gavetas,
locais com mofo). Ele transforma a umidade em
líquido, sendo muito comum na forma de sílica
ou pequenas esferas/escamas em potes
antimofo, e também utilizado para secar gases e
líquidos.
Temperatura
de fusão, °C,
1atm
Densidade,
g.cm–3,
20°C
Solubilidade
em água, 20°C
772 2,15 75g em 100mL
de água
Dados:
massa molares em g.mol–1:
20Ca = 40
17Cℓ = 35,5
Sobre o cloreto de cálcio, suas propriedades e
de acordo com os dados da tabela é CORRETO
afirmar que:',
  '[{"id": "a", "texto": "o cloreto de cálcio é um composto molecular."}, {"id": "b", "texto": "aproximadamente 3,6.10–1mol de íons cloreto são formados na dissolução de 20g de cloreto de cálcio."}, {"id": "c", "texto": "o volume ocupado por um mol de CaCℓ2 nas CNTP é igual a 22,4L/mol."}, {"id": "d", "texto": "a reação de decomposição do cloreto de cálcio ocorre a 772°C e 1atm."}, {"id": "e", "texto": "a mistura entre 1,4mol de cloreto de cálcio e 200mL de água destilada, a 20°C, forma uma solução aquosa insaturada."}]'::jsonb, 'b', 'A massa molar do CaCℓ₂ é 40 + 2(35,5) = 111 g/mol. Em 20 g há n = 20/111 ≈ 0,18 mol. Como cada fórmula libera 2 íons cloreto na dissolução, formam-se 2 × 0,18 = 0,36 mol ≈ 3,6·10⁻¹ mol de Cℓ⁻. A alternativa B está correta.

A está errada porque o CaCℓ₂ é um composto iônico, formado entre metal e ametal — o que também explica sua alta temperatura de fusão, 772 °C. C aplica o volume molar de 22,4 L/mol, válido apenas para gases nas CNTP, a um sólido. D confunde os conceitos: 772 °C é a temperatura de fusão indicada na tabela, não de decomposição. E não fecha com a solubilidade: em 200 mL cabem no máximo 150 g, mas 1,4 mol equivalem a 155,4 g, de modo que a solução seria saturada com corpo de fundo, e não insaturada.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 26, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q26-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q26-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Química', 'Propriedades das Substâncias', 'Ácidos, bases, sais e óxidos são fundamentais no
cotidiano, essenciais para a digestão, limpeza,
agricultura e indústria. Exemplos incluem o ácido
clorídrico no estômago, base de soda cáustica,
sal de cozinha (NaCℓ) e óxidos como cal viva
(CaO). Eles regulam pH e reagem entre si para
criar produtos úteis.
Disponível
em:https://www.quimica.com.br/pesquisa-e-desenvolvimento-na-industria-quimica/ Acesso
em 20.02.26.
O conhecimento sobre substâncias químicas e
suas propriedades permite afirmar que:
Dados
massa molares em g.mol–1:
20Ca = 40
16S = 32',
  '[{"id": "a", "texto": "a liga de ferro, cromo e níquel é a base do aço inoxidável, que oferece altíssima resistência à corrosão, oxidação e durabilidade."}, {"id": "b", "texto": "o Aℓ2O3, também chamado de alumina, é um composto químico inorgânico de cor branca, abundante na natureza de alto ponto de fusão é classificado como sal anfótero porque reage com ácidos e bases fortes."}, {"id": "c", "texto": "a dissociação iônica do sulfato férrico Fe2(SO4)3, amplamente utilizado no tratamento de água potável, esgoto e efluentes industriais, produz em uma maior quantidade de matéria de cátions que de ânions."}, {"id": "d", "texto": "um aumento da temperatura de 50°C, de um cilindro contendo 2 mol de gás ideal, para 100°C duplica o valor da pressão interna cilindro metálico."}, {"id": "e", "texto": "a fração em massa de enxofre que permanece inalterada quando massas iguais de cálcio e enxofre são misturadas e o cálcio é totalmente transformado em CaS é igual a 8g."}]'::jsonb, 'a', 'A alternativa A está correta: o aço inoxidável é uma liga metálica de ferro com cromo e níquel. O cromo é o elemento decisivo, pois forma na superfície uma camada fina e aderente de óxido que se refaz sozinha quando arranhada, protegendo o metal abaixo — é essa passivação que garante a resistência à corrosão.

Entre as demais, a mais fácil de descartar é D. Para um gás ideal a volume constante, a pressão é proporcional à temperatura absoluta, medida em kelvin. Indo de 50 °C para 100 °C, passa-se de 323 K para 373 K, um aumento de apenas 15%, muito longe de dobrar a pressão. O erro está em raciocinar com a escala Celsius.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 27, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q27-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q27-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-ampla-q27-3.png", "legenda": null, "ordem": 3}, {"url": "/questoes-facape/2026.2-ampla-q27-4.png", "legenda": null, "ordem": 4}, {"url": "/questoes-facape/2026.2-ampla-q27-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-ampla-q27-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', 'Isomeria', 'A tujona (ou tuiona) é um composto químico
terpenoide, encontrado em óleos essenciais de
plantas como absinto (Artemisia absinthium), tuia
e sálvia, conhecido por seu alto potencial
neurotóxico. É famosa como o componente
"ativo" do licor absinto, capaz de provocar efeitos
como convulsões, alucinações e tremores se
ingerido em grandes quantidades, sendo tóxico
ao sistema nervoso central.
Temperatura de
ebulição, °C,
1atm
Densidade,
g.cm–3, 20°C
Pressão de
vapor a
20°C em Pa
201 0,92 –
Tujona
Dados: 6C (14), 1H (1) e 8O (16).
Analisando o texto, os dados fornecidos na
tabela e a figura que a representa a tujona é
CORRETO afirmar que:',
  '[{"id": "a", "texto": "a pressão de vapor da Tujona deve ser igual a zero."}, {"id": "b", "texto": "entre o átomo de carbono e o de oxigênio a ligação é covalente do tipo σ(sp–p)."}, {"id": "c", "texto": "a cadeia carbônica da Tujona é alicíclica e heterogênea."}, {"id": "d", "texto": "um mol de Tujona, a 20°C, ocupa um volume aproximado de 166mL"}, {"id": "e", "texto": "a Tujona possui, teoricamente, quatro pares de enântiomeros."}]'::jsonb, 'e', 'A tujona possui três carbonos assimétricos em sua estrutura bicíclica. O número máximo de estereoisômeros é 2ⁿ, com n igual ao número de centros quirais: 2³ = 8 estereoisômeros, que se organizam em 8/2 = 4 pares de enantiômeros. A alternativa E está correta.

A contraria o próprio texto: a tujona é um líquido volátil, com temperatura de ebulição de 201 °C, logo sua pressão de vapor a 20 °C é baixa, mas não nula. B erra a hibridização, pois o carbono da carbonila é sp², e não sp. C erra ao chamar a cadeia de heterogênea: o oxigênio está na função cetona, fora do anel, e a cadeia cíclica é formada apenas por carbonos, portanto homogênea. D não fecha com os dados fornecidos na questão, que atribuem massa 14 ao carbono.',
  'dificil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 28, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q28-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-ampla-q28-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', 'Equilíbrio Químico', 'Bebidas com gás carbônico (CO2), ou
carbonatadas, são aquelas que passam por um
processo de injeção de dióxido de carbono sob
pressão, criando efervescência, realçando
sabores e conservando o produto conforme
representado pela equação abaixo.
CO2(g) + 2H2O(ℓ) ⇄ HCO3
–
(aq) + H3O+(aq)
Os principais exemplos incluem refrigerantes,
água com gás, águas tónicas, águas
aromatizadas, espumantes, cervejas e bebidas
energéticas. Sobre a reação e os compostos
envolvidos, pode–se afirmar que:',
  '[{"id": "a", "texto": "a espuma produzida pelo champanhe ao ser aberta é um exemplo clássico de uma solução líquida."}, {"id": "b", "texto": "de acordo com os conceitos de Bronsted– Lowry, CO2(g) e H3O+(aq) constituem par conjugado ácido–base."}, {"id": "c", "texto": "A reação direta entre (CO2) e água (H2O) geralmente libera energia em processos naturais e industriais."}, {"id": "d", "texto": "o sistema em equilíbrio representa a eletrólise do gás carbônico."}, {"id": "e", "texto": "o pH dessas bebidas é reduzido com o aumento da pressão sobre o sistema em equilíbrio."}]'::jsonb, 'e', 'Aumentar a pressão sobre o sistema força mais CO₂ a se dissolver, deslocando o equilíbrio para a direita e elevando a concentração de H₃O⁺. Mais íons hidrônio significam pH menor, exatamente o que afirma a alternativa E. É o mesmo fenômeno observado ao abrir uma garrafa: a pressão cai, o CO₂ escapa e a bebida perde acidez e gás.

A está errada porque a espuma é um colóide, com gás disperso em líquido, e não uma solução. B contraria a definição de Brönsted-Lowry: um par conjugado difere por exatamente um H⁺, o que não é o caso de CO₂ e H₃O⁺. D não descreve eletrólise, que exigiria corrente elétrica decompondo a substância.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 29, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q29-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q29-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-ampla-q29-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.2-ampla-q29-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', 'Termoquímica', 'A metanação é a conversão de óxidos de
carbono (CO) ou (CO2) em metano (CH4) através
da hidrogenação, tipicamente usando
catalisadores de níquel ou rutênio. Conhecida
como Reação de Sabatier (CO2(g) + 4H2(g) ⇄ CH4(g)
+ 2H2O(ℓ) ΔH° = –165,0kJ.mol–1), é um processo
altamente exotérmico, fundamental no
armazenamento de energia renovável (power–to–
gas) e produção de gás natural sintético.
Considerando essas informações, os
conhecimentos sobre os compostos envolvidos,
é CORRETO afirmar que:
Dados: 6C (14), 8O (16) e 1H (1).',
  '[{"id": "a", "texto": "a concentração de metano diminui com a adição de H2O(ℓ)."}, {"id": "b", "texto": "as geometrias das moléculas presentes na Reação de Sabatier são linear, tetraédrica e trigonal plana."}, {"id": "c", "texto": "a reação é de terceira ordem."}, {"id": "d", "texto": "a reação inversa absorve 82,5kJ.mol–1 de água."}, {"id": "e", "texto": "a utilização de níquel ou rutênio aumentam a energia cinética das moléculas dos reagentes. BIOLOGIA"}]'::jsonb, 'd', 'A reação direta libera 165,0 kJ por mol de reação. Pelo princípio da reversibilidade, a reação inversa absorve a mesma quantidade, com sinal trocado: +165,0 kJ. Como cada mol de reação envolve 2 mol de água, por mol de água o valor é 165,0/2 = 82,5 kJ. A alternativa D está correta.

A está errada porque a água aparece no estado líquido: substâncias puras nesse estado não entram na expressão do equilíbrio e sua adição não desloca a reação. B erra as geometrias, já que o H₂ é uma molécula diatômica linear e a água é angular, não havendo geometria trigonal plana entre os participantes. C confunde estequiometria com cinética, pois a ordem de reação é determinada experimentalmente e não pelos coeficientes da equação. E descreve mal o papel do catalisador, que reduz a energia de ativação sem alterar a energia cinética das moléculas.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 30, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q30-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q30-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Biologia', 'Fisiologia Humana', 'A alimentação equilibrada é fundamental para a
manutenção da saúde e para o bom
funcionamento do organismo. Os alimentos
fornecem nutrientes essenciais, como
carboidratos, proteínas, lipídios, vitaminas e sais
minerais, que são digeridos no sistema digestório
e posteriormente absorvidos pelo organismo.
Cada nutriente desempenha funções específicas,
contribuindo para a produção de energia,
construção de tecidos e regulação de processos
metabólicos. Entretanto, dietas desequilibradas,
com excesso ou deficiência de determinados
nutrientes, podem provocar diversos problemas
de saúde, como obesidade, desnutrição,
diabetes e doenças cardiovasculares.
Considerando a relação entre digestão, nutrição
e equilíbrio alimentar, assinale a alternativa
CORRETA:',
  '[{"id": "a", "texto": "Os carboidratos são nutrientes que não participam da produção de energia no organismo, sendo utilizados apenas na formação de tecidos."}, {"id": "b", "texto": "As proteínas são nutrientes importantes para a construção e reparação dos tecidos do corpo, além de participarem da formação de enzimas e hormônios."}, {"id": "c", "texto": "Os lipídios não possuem função no organismo humano, devendo ser totalmente eliminados da alimentação."}, {"id": "d", "texto": "A digestão ocorre exclusivamente no estômago, sendo nesse órgão que todos os nutrientes são absorvidos pelo organismo."}, {"id": "e", "texto": "Vitaminas e sais minerais são nutrientes energéticos responsáveis pela maior parte da produção de energia no corpo."}]'::jsonb, 'b', 'As proteínas são os nutrientes plásticos por excelência: fornecem os aminoácidos usados na construção e na reparação dos tecidos e são a matéria-prima de enzimas e de vários hormônios. Por isso a alternativa B está correta.

As demais invertem o papel de cada nutriente: os carboidratos são a principal fonte de energia (A), os lipídios são essenciais como reserva energética e como componentes das membranas e de hormônios (C), a digestão começa na boca e a maior parte da absorção acontece no intestino delgado, não no estômago (D), e vitaminas e sais minerais são reguladores, não energéticos (E).',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'Biologia', 'Fisiologia Humana', 'A respiração é um processo fisiológico essencial
para a manutenção da vida, pois permite a
entrada de oxigênio no organismo e a eliminação
de dióxido de carbono produzido nas células.
Durante esse processo, o oxigênio é
transportado pelo sangue até os tecidos, onde
participa da respiração celular, responsável pela
produção de energia necessária para as
atividades do corpo. Além do funcionamento
biológico, hábitos cotidianos também influenciam
a qualidade da respiração. Práticas como manter
uma postura adequada, realizar atividades físicas
regulares, evitar ambientes poluídos e adotar
técnicas de respiração consciente podem
contribuir para melhorar a oxigenação do
organismo e o funcionamento do sistema
respiratório.
Considerando o funcionamento do sistema
respiratório e a importância de hábitos saudáveis
para uma boa respiração, assinale a alternativa
CORRETA.',
  '[{"id": "a", "texto": "O oxigênio inspirado participa da respiração celular, processo em que ocorre a produção de energia para as atividades do corpo."}, {"id": "b", "texto": "A respiração saudável depende apenas da quantidade de ar inspirado, não sendo influenciada por hábitos ou condições ambientais."}, {"id": "c", "texto": "O dióxido de carbono inspirado é utilizado pelas células para produzir energia durante a respiração celular."}, {"id": "d", "texto": "A troca gasosa no organismo ocorre principalmente no coração, responsável pela absorção de oxigênio pelo sangue."}, {"id": "e", "texto": "A respiração humana ocorre exclusivamente nos pulmões, onde também é produzida toda a energia utilizada pelo organismo."}]'::jsonb, 'a', 'O oxigênio captado na respiração pulmonar é levado pelo sangue até as células, onde participa da respiração celular e permite a produção de ATP. É exatamente o que descreve a alternativa A.

O próprio texto derruba a B, ao citar hábitos e ambiente como fatores que influenciam a respiração. Em C há inversão: o gás carbônico é produto da respiração celular, não reagente. Em D, as trocas gasosas ocorrem nos alvéolos pulmonares — o coração apenas bombeia o sangue. Em E, a energia é produzida nas mitocôndrias de todas as células do corpo, e não nos pulmões.',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 32, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q32-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Biologia', 'Evolução', 'O avanço dos estudos em genética permitiu
compreender melhor os mecanismos
responsáveis pela diversidade dos seres vivos e
pela evolução das espécies. A partir das
descobertas sobre a hereditariedade e a
transmissão das características genéticas,
tornou-se possível explicar como variações
surgem nas populações e como essas variações
podem ser favorecidas ou eliminadas ao longo
do tempo por processos evolutivos. A integração
entre genética e teoria evolutiva deu origem ao
que os cientistas chamam de Síntese Moderna
da Evolução, que explica a evolução como
resultado de alterações nas frequências gênicas
das populações ao longo das gerações.
Com base nessas informações e nos
conhecimentos sobre evolução e genética,
assinale a alternativa CORRETA.',
  '[{"id": "a", "texto": "A evolução ocorre apenas quando os indivíduos desenvolvem características necessárias para sobreviver durante sua vida e as transmitem diretamente aos descendentes."}, {"id": "b", "texto": "A evolução das espécies ocorre independentemente das variações genéticas presentes nas populações."}, {"id": "c", "texto": "As mutações genéticas impedem a evolução, pois alteram negativamente as características dos organismos."}, {"id": "d", "texto": "A genética contribuiu para a compreensão da evolução ao explicar como as características hereditárias são transmitidas e como as variações genéticas podem ser selecionadas ao longo do tempo."}, {"id": "e", "texto": "A teoria evolutiva explica apenas mudanças individuais, não sendo aplicada às populações de organismos."}]'::jsonb, 'd', 'A Síntese Moderna uniu a genética à teoria darwiniana: a genética explicou a origem da variabilidade (mutação e recombinação) e como as características são transmitidas, enquanto a seleção natural age sobre essa variação alterando as frequências gênicas da população. É o que afirma a alternativa D.

A alternativa A descreve o lamarckismo, já refutado, pois caracteres adquiridos ao longo da vida não são transmitidos. B e C contrariam o princípio central: sem variação genética não há evolução, e as mutações são justamente a fonte primária dessa variação. E inverte a escala do processo — a evolução ocorre em populações, não em indivíduos isolados.',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 33, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q33-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q33-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'Biologia', 'Saúde Pública', 'A Mpox (anteriormente conhecida como varíola
dos macacos) é uma doença infecciosa causada
por um vírus que pode ser transmitido entre
animais e seres humanos. Esse tipo de
enfermidade é classificado como zoonose, ou
seja, uma doença que pode ser transmitida de
animais para humanos. Estudos em saúde
pública indicam que o surgimento e a
disseminação de doenças zoonóticas também
podem estar associados a alterações ambientais,
como desmatamento, tráfico de animais
silvestres e maior aproximação entre seres
humanos e a fauna silvestre. Essas mudanças
podem favorecer o contato com patógenos
anteriormente restritos a determinados
ambientes naturais.
Considerando essas informações e os
conhecimentos sobre saúde pública e meio
ambiente, assinale a alternativa INCORRETA.',
  '[{"id": "a", "texto": "O contato direto com lesões, secreções ou objetos contaminados pode favorecer a transmissão do vírus da Mpox entre pessoas ou entre animais e humanos."}, {"id": "b", "texto": "A Mpox no Brasil é monitorada pelo Ministério da Saúde, que orienta prevenção através do isolamento de infectados, uso de máscaras/luvas e higienização, conforme o Ministério da Saúde."}, {"id": "c", "texto": "A taxa de letalidade é baixa (inferior a 1%) nas Américas e Europa, com alto índice de recuperação."}, {"id": "d", "texto": "Em 2026, casos isolados continuam surgindo, exigindo monitoramento e ação das autoridades locais."}, {"id": "e", "texto": "Devido à baixa letalidade, pessoas com sintomas não devem procurar imediatamente uma unidade básica de saúde, deve manter contato social normalmente."}]'::jsonb, 'e', 'A questão pede a alternativa INCORRETA. A letra E orienta o oposto da conduta recomendada: diante de sintomas suspeitos de Mpox, a pessoa deve procurar uma unidade de saúde e evitar contato próximo com outras pessoas, justamente para interromper a cadeia de transmissão. Letalidade baixa não elimina a necessidade de diagnóstico e isolamento.

As outras alternativas estão de acordo com as orientações do Ministério da Saúde: a transmissão se dá por contato com lesões, secreções e objetos contaminados (A), a prevenção envolve isolamento, uso de máscaras e luvas e higienização (B), a letalidade é baixa nas Américas e na Europa (C) e o surgimento de casos isolados mantém a exigência de monitoramento (D).',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 34, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q34-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Biologia', 'Citologia', 'As características essenciais das células
eucarióticas são mantidas, bem como as
diferenças entre os meios interno e externo, por
uma finíssima película, de espessura variante
entre 7,5 e 10 nm, chamada membrana celular,
membrana plasmática ou plasmalema. Sobre a
membrana plasmática são feitas as seguintes
afirmativas:
I. A membrana celular regula a entrada e
saída de moléculas e íons da célula, sendo
responsável por manter o equilíbrio celular.
II. A membrana plasmática possui estruturas
que a possibilitam responder a estímulos
externos e promover a movimentação
celular.
III. A membrana celular também está
envolvida em processos de secreção
celular, na síntese de proteínas importantes
como os anticorpos e na divisão celular.
IV. A presença de moléculas de colesterol
ajuda a diminuir a fluidez característica da
membrana plasmática.
Estão CORRETAS apenas as afirmativas:',
  '[{"id": "a", "texto": "I e II."}, {"id": "b", "texto": "I e III."}, {"id": "c", "texto": "I e IV."}, {"id": "d", "texto": "I, II e III."}, {"id": "e", "texto": "II, III e IV."}]'::jsonb, 'a', 'Apenas I e II estão corretas, o que leva à alternativa A.

I está correta porque a permeabilidade seletiva da membrana controla a entrada e a saída de íons e moléculas, mantendo a homeostase celular. II também, já que a membrana possui receptores que reconhecem estímulos externos e participa de movimentos celulares, como a formação de pseudópodes.

III está errada: a síntese de proteínas, inclusive dos anticorpos, ocorre nos ribossomos do retículo endoplasmático rugoso, e não na membrana plasmática. IV está errada porque o colesterol atua como modulador da fluidez, e não simplesmente reduzindo-a: ele impede o empacotamento dos fosfolipídios em temperaturas baixas e restringe a mobilidade em temperaturas altas, estabilizando a membrana.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'Biologia', 'Citologia', 'As organelas são estruturas características das
células eucarióticas e representam
compartimentos do citoplasma envoltos por
membranas, constituindo unidades funcionais
interrelacionadas e bastante específicas para o
funcionamento global da célula. Sobre essas
estruturas relacione a 2ª coluna de acordo com a
1ª coluna.
1ª COLUNA
1. Retículo endoplasmático granular.
2. Lisossomos.
3. Complexo Golgiense.
4. Centríolos.
5. Mitocôndrias.
2ª COLUNA
(...)Representa, de forma geral, o maior sítio de
sínteses proteica da célula e varia de forma e
tamanho, de acordo com as especificidades
morfofuncionais da célula.
(...)Interposto entre o retículo endoplasmático e a
membrana plasmática, os sacos
membranosos achatados que os compõem
são chamados dictiossomas.
(...)Derivadas do complexo golgiense, possuem
em seu interior enzimas digestivas
sintetizadas no retículo endoplasmático
rugoso e empacotadas no complexo
golgiense.
(...)Transformam a energia química contida nos
metabólitos citoplasmáticos em energia
facilmente utilizável pela célula.
(...)São essenciais na constituição da estrutura
interna de cílios e flagelos.
Preenche CORRETAMENTE a alternativa:',
  '[{"id": "a", "texto": "1, 3, 2, 5 e 4."}, {"id": "b", "texto": "1, 2, 3, 4 e 5."}, {"id": "c", "texto": "5, 4, 3, 2, e 1."}, {"id": "d", "texto": "3, 2, 1, 4 e 5."}, {"id": "e", "texto": "4, 3, 5, 2 e 1."}]'::jsonb, 'a', 'A sequência correta é 1, 3, 2, 5 e 4, alternativa A.

O maior sítio de síntese proteica é o retículo endoplasmático rugoso, pelos ribossomos aderidos à sua face externa. Os sacos membranosos achatados chamados dictiossomas são a unidade estrutural do complexo golgiense. Os lisossomos derivam do complexo golgiense e carregam enzimas digestivas produzidas no retículo rugoso. As mitocôndrias convertem a energia química dos metabólitos em ATP, forma diretamente utilizável pela célula. Por fim, os centríolos organizam os microtúbulos que formam o eixo interno de cílios e flagelos.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'Biologia', 'Metabolismo Energético', 'No homem, a produção de ácido lático é comum
nos músculos, quando há́ esforço muscular
exagerado. A quantidade de oxigênio que as
células musculares recebem é insuficiente para a
liberação de energia e as células começam a
fermentar a glicose presente nos músculos na
forma de glicogênio, na tentativa de produzir
energia extra. O problema é que esse processo
de fermentação da glicose vai gerar ácido lático,
que irá se acumular e provocar a fadiga
muscular, reduzindo a capacidade do músculo
em continuar a se retrair. Se o esforço físico for
continuado, podem surgir também câimbras, na
forma de espasmos dolorosos.
Medrado Leandro, Citologia e Histologia Humana/
fundamentos de morfofisiologia celular e
tecidual.2014.
Com base na fisiologia muscular e nos processos
metabólicos envolvidos na produção de energia,
é CORRETO afirmar que:',
  '[{"id": "a", "texto": "a fermentação lática ocorre nas mitocôndrias das células musculares e produz grande quantidade de ATP, suficiente para manter o esforço físico prolongado."}, {"id": "b", "texto": "a produção de ácido lático ocorre quando há redução do oxigênio disponível, levando as células musculares a produzirem energia por meio de um metabolismo anaeróbio menos eficiente."}, {"id": "c", "texto": "o ácido lático é produzido exclusivamente para aumentar a força de contração muscular, sendo essencial para melhorar o desempenho durante exercícios prolongados."}, {"id": "d", "texto": "durante o esforço físico intenso, o metabolismo aeróbio aumenta a produção de ácido lático como principal fonte de energia para as fibras musculares."}, {"id": "e", "texto": "a fermentação lática ocorre apenas em células nervosas e não está relacionada com a atividade muscular."}]'::jsonb, 'b', 'Quando o esforço é intenso e a oferta de oxigênio ao músculo se torna insuficiente, a célula muscular passa a obter energia por via anaeróbia — a fermentação lática — cujo produto final é o ácido lático, associado à fadiga. É o que descreve a alternativa B.

A está errada em dois pontos: a fermentação ocorre no citosol, não nas mitocôndrias, e rende pouquíssimo ATP (2 por molécula de glicose, contra cerca de 30 a 38 da respiração aeróbia). C inverte causa e efeito, pois o acúmulo de ácido lático reduz o desempenho em vez de melhorá-lo. D é contraditória: metabolismo aeróbio, por definição, ocorre com oxigênio e não gera ácido lático. E está errada porque a fermentação lática é característica justamente do tecido muscular em esforço.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'Biologia', 'Ecologia', 'As plantas exercem um importante papel nos
ecossistemas, sendo responsáveis pela
transformação de carbono inorgânico (dióxido de
carbono — CO₂) em matéria orgânica por meio
da fotossíntese. Além disso, contribuem para a
produção de oxigênio, manutenção das cadeias
alimentares e regulação do equilíbrio climático. O
conhecimento sobre a anatomia e a fisiologia
vegetal é fundamental para o desenvolvimento
de técnicas agrícolas, bem como para ações de
preservação e conservação ambiental que visam
evitar a extinção de espécies vegetais.
Considerando essas informações e os
conhecimentos sobre a importância dos vegetais
nos ecossistemas, é INCORRETO afirmar que:',
  '[{"id": "a", "texto": "as plantas são organismos autotróficos capazes de produzir seu próprio alimento por meio da fotossíntese, utilizando luz solar, água e dióxido de carbono."}, {"id": "b", "texto": "a preservação da vegetação natural contribui para a manutenção da biodiversidade e para o equilíbrio das cadeias alimentares nos ecossistemas."}, {"id": "c", "texto": "o desmatamento e a degradação de habitats naturais podem provocar perda de espécies vegetais e afetar diretamente outros organismos que dependem dessas plantas."}, {"id": "d", "texto": "a conservação de espécies vegetais é importante para a produção agrícola, não influenciando o equilíbrio ecológico dos ecossistemas naturais."}, {"id": "e", "texto": "as plantas desempenham papel importante no ciclo do carbono ao incorporar CO₂ atmosférico na produção de compostos orgânicos durante a fotossíntese."}]'::jsonb, 'd', 'A questão pede a alternativa INCORRETA. A letra D separa artificialmente duas coisas que andam juntas: a conservação das espécies vegetais não interessa só à agricultura, ela é decisiva para o equilíbrio ecológico. As plantas são produtoras, sustentam as cadeias alimentares, participam do ciclo do carbono e da água e mantêm o habitat de inúmeras espécies.

As demais estão corretas: as plantas são autotróficas e realizam fotossíntese a partir de luz, água e CO₂ (A), a vegetação preservada sustenta a biodiversidade e as cadeias alimentares (B), o desmatamento provoca perda de espécies e afeta os organismos que delas dependem (C) e a fotossíntese incorpora carbono atmosférico em compostos orgânicos (E).',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'Biologia', 'Biomas Brasileiros', 'A Caatinga, é um bioma localizado
exclusivamente no Brasil. A Caatinga é
caracterizada por um clima quente e semiárido,
fortemente sazonal, com menos de 1.000 mm
anuais de chuva, distribuídos quase totalmente
num período de três a seis meses. (Sampaio e
Pareyn, 2002.). Sobre esse Bioma, NÃO se pode
afirmar:
I. A Caatinga é um ambiente caracterizado por
altos índices de radiação solar, pelo fato de a
região estar localizada próximo à linha do
equador, na qual o ângulo de radiação é mais
direto.
II. A Caatinga é caracterizada por uma fisionomia
geralmente caducifólia, em razão de grande
parte do bioma apresentar clima sazonal seco.
III. Em relação aos outros biomas brasileiros, a
restauração natural da Caatinga é rápida e
não muito complexa devido aos fatores
climáticos, como a seca.
IV.A vegetação da Caatinga mostra seu potencial
genético de resistência à seca ao rebrotar
intensamente, promovendo crescimento e
desenvolvimento em curto prazo, pois as
plantas acionam vários mecanismos para se
ajustar rapidamente aos períodos favoráveis,
com o objetivo de armazenar água e
nutrientes para sobreviver durante os
períodos desfavoráveis.
Assinale a alternativa que apresentam as
afirmativas CORRETAS.',
  '[{"id": "a", "texto": "As afirmativas I, II, III e IV."}, {"id": "b", "texto": "As afirmativas I, II e III apenas."}, {"id": "c", "texto": "As afirmativas I, II e IV apenas."}, {"id": "d", "texto": "As afirmativas III e IV apenas."}, {"id": "e", "texto": "As afirmativas II e IV apenas."}]'::jsonb, 'c', 'Atenção ao comando: apesar de o texto começar com "NÃO se pode afirmar", a instrução final da questão é "assinale a alternativa que apresentam as afirmativas CORRETAS" — e é ela que vale. As corretas são I, II e IV, o que leva à alternativa C.

I está correta porque a proximidade da linha do Equador faz a radiação solar incidir de forma mais direta, elevando os índices na região. II está correta: o clima sazonal seco explica a fisionomia caducifólia, com perda das folhas na estiagem para reduzir a transpiração. IV descreve bem a estratégia da vegetação, que rebrota rapidamente assim que chove e acumula água e nutrientes para atravessar o período seco.

III é a afirmativa falsa: a restauração natural da Caatinga é lenta e complexa, justamente porque a baixa disponibilidade hídrica e a fragilidade do solo dificultam o restabelecimento da vegetação.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 39, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q39-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q39-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'Biologia', 'Divisão Celular', '“A capacidade de se reproduzir é uma
propriedade fundamental da célula. É possível ter
uma ideia da magnitude da reprodução celular
se considerarmos que um indivíduo adulto é
formado por bilhões de células, todas
provenientes de apenas uma, o zigoto. A
multiplicação celular segue, sendo notável
mesmo em um ser adulto que já deixou de
crescer. Um exemplo interessante são os
eritrócitos, cuja vida média é de somente 120
dias. Portanto, o organismo deve produzir cerca
de 2,5 milhões de eritrócitos por segundo para
manter seu número relativamente constante.
Essa reprodução celular deve ser regulada de
modo perfeito para que a formação de novas
células compense as perdas e o equilíbrio seja
mantido.”
De Robertis, E. M. Biologia Celular e Molecular, 2025, p.264.
Assinale a alternativa que NÃO está relacionada
com o texto.',
  '[{"id": "a", "texto": "As células passam por um ciclo que compreende dois períodos fundamentais: a interfase e a divisão celular."}, {"id": "b", "texto": "O ciclo celular pode ser considerado como uma complexa série de fenômenos que culminam quando o material celular duplicado se distribui nas células-filhas."}, {"id": "c", "texto": "Antes que a célula se divida por mitose, seus principais componentes já foram duplicados."}, {"id": "d", "texto": "Métodos citoquímicos revelou os primeiros indícios de que a duplicação do DNA ocorre durante a fase de prófase da mitose."}, {"id": "e", "texto": "A síntese ocorre em um momento limitado da interfase, denominado fase S (de síntese de DNA), que é precedido e seguido, respectivamente, pelas fases G1 e G2, nas quais não ocorre síntese de DNA. HISTÓRIA"}]'::jsonb, 'd', 'A questão pede a alternativa que NÃO se relaciona com o texto — na prática, a afirmação incorreta. É a letra D: a duplicação do DNA não ocorre na prófase da mitose, e sim na fase S da interfase, antes de a divisão começar.

A própria alternativa E descreve corretamente esse ponto ao situar a síntese de DNA na fase S, precedida por G1 e seguida por G2. As alternativas A, B e C também estão de acordo com o texto, ao apresentarem o ciclo celular dividido em interfase e divisão, a distribuição do material duplicado entre as células-filhas e a duplicação prévia dos componentes celulares.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'História', 'Revolução Americana', 'A independência dos Estados Unidos da
América, declarada em 1776, teve inúmeras
consequências em outras localidades do
planeta. Inspirados também por ideais
iluministas, os revolucionários americanos
inspiraram os franceses na revolução de 1789
e a independência das colônias ibéricas na
América.
Entre as causas da revolução americana,
assinale a alternativa CORRETA.',
  '[{"id": "a", "texto": "Só aconteceu graças ao financiamento dos exércitos revolucionários através da coleta de impostos de sua própria população colonial, como a Lei do Açúcar e Lei do Selo."}, {"id": "b", "texto": "A França, ao vencer a Guerra dos 7 anos, assume a tutela das treze colônias, enfurecendo as lideranças locais, dando o estopim da revolução."}, {"id": "c", "texto": "Só foi possível porque, durante muito tempo, em grande parte por causa do desinteresse da própria metrópole, as treze colônias prosperaram, o que fortaleceu a coesão dos colonos que não tolerariam as futuras medidas opressivas inglesas na colônia."}, {"id": "d", "texto": "Foi iniciada no sul dos Estados Unidos, região de pequenas propriedades e policultura, onde vigorava o trabalho livre, em oposição às regiões mais ao norte, em que o trabalho escravo de monocultura latifundiária era predominante."}, {"id": "e", "texto": "Esforços ingleses de extinguir grandes latifúndios de monocultura foram a principal causa da revolução. A Inglaterra pretendia diminuir o trabalho escravo e dar poder ao trabalho assalariado, para que eles pudessem vender seus produtos industrializados na colônia."}]'::jsonb, 'c', 'A alternativa C descreve o que os historiadores chamam de "negligência salutar": por décadas a Inglaterra deixou as Treze Colônias relativamente livres, o que permitiu que prosperassem e desenvolvessem autonomia política e identidade própria. Quando a metrópole passou a intervir e a tributar com rigor, após a Guerra dos Sete Anos, os colonos já não aceitaram.

A inverte o papel dos impostos: a Lei do Açúcar e a Lei do Selo foram causas da revolta, não fonte de financiamento dos revolucionários. B erra o vencedor da Guerra dos Sete Anos, que foi a Inglaterra, não a França. D troca as regiões: o Sul era de grandes propriedades monocultoras e escravistas, e o movimento começou no Norte, em Boston. E é infundada, pois a Inglaterra não pretendia extinguir os latifúndios nem substituir o trabalho escravo.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'História', 'Revoluções Liberais do Século XIX', 'Carlos X, um ultrarrealista, assume o trono
francês após a morte do seu irmão Luís XVIII em
1824, em meio ao período pós-napoleônico, em
que ideais liberais estavam se fortalecendo cada
vez mais na Europa. Carlos X, em contrapartida,
buscava retomar os ideais pré-revolucionários,
tomando medidas que desagradavam inúmeros
setores mais liberais da sociedade francesa, o
que findaria em movimentos de reação à
autoridade real.
Sobre a revolução de 1830, assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "A burguesia francesa, temendo um fortalecimento do movimento republicano após a abdicação de Carlos X, oferece o trono ao seu primo Luís Felipe, movimentação esta que ocorreu durante os “Três Dias Gloriosos”."}, {"id": "b", "texto": "A monarquia francesa, sob o comando de Carlos X, oferece aos revoltosos a opção de uma nova assembleia constituinte para a instauração de uma monarquia constitucional, que previa a revogação do Tratado de Paris (1815), alternativa melhor do que abdicar do trono."}, {"id": "c", "texto": "Carlos X, ao sufocar a revolução, consegue restaurar a monarquia absolutista francesa, ao mesmo tempo que esmaga movimentos liberais em todo o país, fortalecendo os preceitos do Congresso de Viena."}, {"id": "d", "texto": "Foi o movimento que deu o estopim da famosa Revolução Francesa, que tomaria caráter burguês e colocaria no comando do país o jovem general Napoleão Bonaparte."}, {"id": "e", "texto": "Ao abdicar ao trono, Carlos X deixa a sucessão para o seu filho, Luís Bonaparte, que esmaga o movimento revolucionário através do que ficou conhecido como o Golpe de 18 de Brumário."}]'::jsonb, 'a', 'A alternativa A está correta. Durante as chamadas "Três Gloriosas" — os três dias de julho de 1830 —, a reação às Ordenações de Saint-Cloud levou Carlos X a abdicar. A burguesia, temendo que a revolta desembocasse numa república, ofereceu o trono a Luís Filipe de Orléans, inaugurando a Monarquia de Julho.

B está errada porque Carlos X fez o oposto: restringiu a liberdade de imprensa e dissolveu a Câmara. C também, já que ele não sufocou o movimento nem restaurou o absolutismo, e sim abdicou. D confunde 1830 com a Revolução Francesa de 1789. E acumula erros: Luís Bonaparte não era filho de Carlos X, e o Golpe de 18 de Brumário foi em 1799, com Napoleão Bonaparte.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 42, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q42-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'História', 'Brasil Império', 'Ao se desvincular de Portugal e sob a liderança
do jovem Dom Pedro I, o mais novo país
independente da América necessitava de uma
nova constituição que regesse um novo pacto
político.
Sobre a constituição de 1824, assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "Teve como principal característica a obediência de Dom Pedro I aos preceitos impostos na assembleia constituinte de 1823, que previa limites ao poder real."}, {"id": "b", "texto": "Foi promulgada, ou seja, elaborada democraticamente por uma assembleia constituinte. A constituição de 1824 definia aspectos de voto censitário em alqueires de farinha, ficando conhecida como Constituição da Mandioca."}, {"id": "c", "texto": "Foi mal recebida no nordeste brasileiro, pois a assembleia constituinte não obteve participação de representantes de Pernambuco, Bahia e Ceará, acarretando a conhecida Confederação do Equador."}, {"id": "d", "texto": "Foi outorgada por Pedro I, em que constava em seu novo texto a instituição do Poder Moderador, que dava poderes ao novo monarca de “vigiar a constituição” e “harmonizar” os poderes."}, {"id": "e", "texto": "Assegurava o voto de pobres e de pessoas analfabetas, mas não conseguiu criar mecanismos para evitar o Voto de Cabresto e o coronelismo."}]'::jsonb, 'd', 'A alternativa D está correta. Dom Pedro I dissolveu a Assembleia Constituinte de 1823 e outorgou a Constituição de 1824, isto é, impôs o texto sem aprovação de uma assembleia. Sua marca mais característica foi o Poder Moderador, um quarto poder exclusivo do imperador, que lhe permitia intervir sobre os demais sob a justificativa de zelar pela Constituição e harmonizar os poderes.

A está errada porque ele rompeu com a Constituinte em vez de obedecê-la. B erra o conceito central: a Constituição foi outorgada, e não promulgada. C atribui a Confederação do Equador à ausência de representantes, quando a revolta de 1824 reagiu justamente ao autoritarismo da outorga e ao Poder Moderador. E é anacrônica: o voto era censitário e excluía os mais pobres, e voto de cabresto e coronelismo são fenômenos da República Velha.',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
  'História', 'Antiguidade e Queda do Império Romano', 'O Völkerwanderung, ou Migração dos Povos, foi
um movimento de vários séculos de migrações
e invasões de povos “bárbaros” em diversas
regiões da Europa, Ásia e África.
Ao se chocarem contra os limes (fronteiras) do
mundo romano, os germânicos empreenderam
diversas campanhas em direção ao território
imperial.
Sobre o período histórico acima, assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "Os germanos promoveram apenas saques e vandalismos nos territórios pertencentes a Roma, por isso eram chamados de “vândalos” pelo mundo romano."}, {"id": "b", "texto": "Os Vândalos, povo germânico, alcançaram o Norte da África e tomaram Cartago do domínio romano, instaurando um reino de terror que causaria o saque de Roma em 410 a.C."}, {"id": "c", "texto": "Os Godos impuseram diversas derrotas aos romanos, como em Adrianópolis e no saque de Roma de 410 d.C, bem como a tomada da Península ibérica."}, {"id": "d", "texto": "Foi o período das invasões vikings, iniciadas em 793 d.C após o saque do mosteiro de Lindisfarne, dando início ao colapso do Império Romano."}, {"id": "e", "texto": "Foram migrações lentas e graduais que não influenciaram objetivamente na queda do Império Romano do Ocidente, que caiu por causas unicamente internas."}]'::jsonb, 'c', 'A alternativa C reúne corretamente três marcos da pressão goda sobre Roma: a derrota romana em Adrianópolis, em 378 d.C., o saque de Roma por Alarico e seus visigodos, em 410 d.C., e a posterior fixação dos visigodos na Península Ibérica.

A reduz o processo a saques, ignorando que muitos povos germânicos se estabeleceram e fundaram reinos. B traz um erro de cronologia decisivo, ao datar o saque de Roma em 410 a.C., além de atribuí-lo aos vândalos — que saquearam Roma em 455 d.C. D confunde períodos, pois as invasões vikings começaram em 793 d.C., mais de três séculos após a queda do Império Romano do Ocidente. E contraria o consenso historiográfico, que reconhece as pressões externas como fator relevante, ao lado das crises internas.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 44, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q44-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q44-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'História', 'Guerra Fria', 'Ao assumir o governo da URSS, que estava
afundada em crise econômica e tecnológica,
Mikhail Gorbatchev instaura uma série de
medidas que se sustentavam basicamente em
dois princípios: A reestruturação (perestroika) e
a transparência (glasnost).
Sobre a perestroika e a glasnost, assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "A glasnost, princípio da transparência, defendia que houvesse o acesso de potências estrangeiras ao processo de produção nuclear soviético, possibilitando que outras nações mais fracas obtivessem o know-how de armas atômicas."}, {"id": "b", "texto": "A perestroika defendia uma maior abertura da economia soviética, como maior liberdade para empresas estrangeiras, pequena propriedade privada e diminuição de monopólios estatais."}, {"id": "c", "texto": "A glasnost e perestroika foram bem recebidas pela burocracia soviética, que buscava desesperadamente meios para controlar a grande instabilidade civil. Ambas permitiram que a URSS sobrevivesse por mais 30 anos."}, {"id": "d", "texto": "A glasnost defendia a abertura de inquéritos contra criminosos de guerra e dos processos sigilosos militares do envolvimento soviético na Guerra do Golfo."}, {"id": "e", "texto": "A glasnost, ao dar maior liberdade política e civil à população soviética, conseguiu suplantar movimentos de libertação política, dando ao regime soviético maior controle sobre sua população. GEOGRAFIA"}]'::jsonb, 'b', 'A alternativa B define corretamente a perestroika: uma reestruturação econômica que flexibilizou o modelo soviético, admitindo pequena propriedade privada, abrindo espaço para empresas estrangeiras e reduzindo os monopólios estatais.

A distorce a glasnost, que tratava de transparência política interna e não de compartilhar tecnologia nuclear. C erra em dois pontos: a burocracia resistiu às reformas, e a URSS não sobreviveu — foi dissolvida em 1991. D confunde conflitos, já que o envolvimento militar soviético do período foi no Afeganistão, não na Guerra do Golfo. E inverte o efeito da glasnost: a maior liberdade de expressão estimulou os movimentos nacionalistas e de independência nas repúblicas, acelerando a desagregação da URSS.',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 45, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q45-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Geografia', 'Indicadores Sociais', 'Recorde de Feminicídio no Brasil (2025)
Em 2025, o Brasil registrou 1.470 feminicídio,
segundo dados do Ministério da Justiça e
Segurança Pública (Sinesp). O número supera
os 1.464 casos de 2024 e representa
crescimento de 316% em relação a 2015,
quando a tipificação foi criada (535 registros). Os
dados indicam uma média de quase quatro
mulheres assassinadas por dia, evidenciando a
gravidade estrutural da violência de gênero no
país.
O texto apresenta dados sobre feminicídio no
Brasil entre 2015 e 2025. A partir das
informações apresentadas, os números indicam:',
  '[{"id": "a", "texto": "violência de gênero como um problema estrutural."}, {"id": "b", "texto": "efetividade de políticas de prevenção."}, {"id": "c", "texto": "seguridade social e garantia de segurança."}, {"id": "d", "texto": "diminuição da violência nos ambientes públicos."}, {"id": "e", "texto": "aumento do feminicídio nos espaços urbanos."}]'::jsonb, 'a', 'Os dados mostram crescimento de 316% nos registros de feminicídio entre 2015 e 2025 e uma média próxima de quatro mulheres assassinadas por dia. Números dessa magnitude, sustentados por uma década inteira, não se explicam por casos isolados: indicam uma violência de gênero enraizada nas relações sociais, ou seja, estrutural. Daí a alternativa A.

As demais são contrariadas pelos próprios dados. Não há sinal de efetividade das políticas de prevenção (B) nem de garantia de segurança (C), já que os registros subiram. D afirma diminuição da violência, o oposto do apresentado. E até aponta aumento, mas restringe o fenômeno aos espaços urbanos, recorte que o texto não faz.',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 46, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q46-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Geografia', 'Rochas e Minerais', 'O diorito é formado no processo de resfriamento
do magma, dando origem a cristais relativamente
grandes. As rochas magmáticas extrusivas ou
vulcânicas, como o basalto e a obsidiana, são
formadas pelo magma expelido em erupções.
Como o resfriamento e a solidificação do magma
ocorrem rapidamente, não há tempo para a
formação de macrocristais.
O texto descreve processos de formação de
diferentes rochas magmáticas. A partir das
informações apresentadas, o diorito se forma
quando ocorre:',
  '[{"id": "a", "texto": "resfriamento rápido do magma na superfície terrestre."}, {"id": "b", "texto": "solidificação imediata da lava após erupções vulcânicas."}, {"id": "c", "texto": "resfriamento lento do magma, permitindo a formação de cristais."}, {"id": "d", "texto": "compactação de sedimentos acumulados ao longo do tempo."}, {"id": "e", "texto": "transformação de rochas por altas pressões e temperaturas."}]'::jsonb, 'c', 'O próprio texto dá a chave: o diorito apresenta cristais relativamente grandes, e macrocristais só se formam quando o magma esfria devagar, no interior da crosta. Esse é o comportamento das rochas magmáticas intrusivas ou plutônicas, o que confirma a alternativa C.

A e B descrevem o caso oposto, o das rochas extrusivas ou vulcânicas, como o basalto e a obsidiana: o resfriamento rápido na superfície não dá tempo para os cristais crescerem. D corresponde à origem das rochas sedimentares e E à das metamórficas — nenhuma delas é magmática.',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 47, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q47-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Geografia', 'Relevo', 'Parte das águas das chuvas que caem sobre a
superfície da Terra infiltra-se no subsolo,
formando água subterrânea. Essa água
subterrânea realiza um trabalho de erosão no
subsolo, modelando formas bem características,
principalmente em terrenos constituídos por
rochas de fácil dissolução. O calcário é uma
delas, e as regiões onde ele é trabalho pelas
águas formam um relevo típico denominado
karst.
O texto descreve a ação da água subterrânea
sobre rochas de fácil dissolução, como o
calcário. A partir dessas informações, formas de
relevo como cavernas, lapiás e dolinas
resultam de:',
  '[{"id": "a", "texto": "erosão marinha provocada pelas ondas do oceano."}, {"id": "b", "texto": "dissolução química das rochas calcárias pela água subterrânea."}, {"id": "c", "texto": "resfriamento do magma no interior da crosta terrestre."}, {"id": "d", "texto": "deposição de sedimentos transportados pelos rios."}, {"id": "e", "texto": "compactação de materiais orgânicos ao longo do tempo."}]'::jsonb, 'b', 'Cavernas, lapiás e dolinas são as formas típicas do relevo cárstico, originadas quando a água da chuva, levemente ácida por dissolver CO₂, infiltra-se no subsolo e dissolve quimicamente o carbonato de cálcio do calcário. Trata-se, portanto, de dissolução química pela água subterrânea, como diz a alternativa B.

A remete à erosão marinha, que atua no litoral e não no subsolo. C descreve a origem das rochas magmáticas, não uma forma de relevo esculpida pela água. D trata de deposição fluvial, processo de acumulação e não de dissolução. E corresponde à formação de rochas como o carvão, sem relação com o modelado cárstico.',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 48, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q48-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Geografia', 'Climatologia', 'O peso do ar sobre a superfície da Terra é
chamado de pressão atmosférica. Como esse
peso não é exercido de maneira uniforme em
todos os lugares, temos diferenças de pressão
atmosférica na superfície terrestre. Dessa
diferença se originam os ventos.
A imagem compara duas cidades com altitudes
diferentes, evidenciando variações na coluna de
ar e na pressão atmosférica.
Considerando o texto e a imagem, essa diferença
ocorre porque:',
  '[{"id": "a", "texto": "locais mais elevados apresentam menor coluna de ar e, portanto, menor pressão atmosférica."}, {"id": "b", "texto": "regiões ao nível do mar possuem menor quantidade de ar e menor pressão atmosférica."}, {"id": "c", "texto": "a pressão atmosférica aumenta conforme a altitude se eleva."}, {"id": "d", "texto": "locais de maior altitude possuem maior concentração de ar sobre a superfície."}, {"id": "e", "texto": "a pressão atmosférica não varia com a altitude."}]'::jsonb, 'a', 'A pressão atmosférica é o peso da coluna de ar que está acima de um ponto. Quanto mais alto esse ponto, menor a quantidade de ar sobre ele e, portanto, menor a pressão — exatamente o que a imagem ilustra ao comparar as duas cidades. A resposta é a alternativa A.

B inverte a situação, pois é ao nível do mar que a coluna de ar é maior e a pressão mais alta. C e D afirmam o contrário da relação real entre altitude e pressão. E nega a variação que o texto e a imagem justamente demonstram.',
  'facil', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
  'ampla', 49, null, false,
  '[{"url": "/questoes-facape/2026.2-ampla-q49-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.2-ampla-q49-2.png", "legenda": null, "ordem": 2}, {"url": "/questoes-facape/2026.2-ampla-q49-3.png", "legenda": null, "ordem": 3}]'::jsonb, true
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
  'Geografia', 'Urbanização Brasileira', 'TEXTO I
“O texto do Decreto-Lei 399, que em 1938
regulamentu o salário mínimo diz: “O salário
mínimo será determinado pela soma das
despesas diárias com alimentação, habitação,
vestuário, higiene e transporte, necessários à
vida de um trabalhador adulto.”
RODRIGUES, A. M. Moradias nas cidades
brasileiras. São Paulo: Contexto, 2001.
TEXTO II
“Os preços aumentam igual as ondas do mar.
Cada qual mais forte.” Não surpreende: a
inflação foi de quase 90% nos dois anos entre
1959 e 60 em São Paulo. A água, que tinha que
ser buscada em uma torneira, custava Cr$ 25
por mês, que ela relata ter ficado seis meses sem
pagar. Com três crianças para alimentar,
Carolina gastava praticamente tudo que ganhava
em comida, buscando sobrevivência diária e
relatando diversos episódios de tontura e mal
estar pela fome.
O que o diário de uma favelada revela sobre a
pobreza urbana no Brasil.”
Disponível
em:https://www.archdaily.com.br/br/950
758/o-que-o-diario-de-uma-favelada-revela-sobre-a-pobreza-urbana-no-brasil#
Os textos abordam o conceito de salário mínimo
e a realidade vivida por moradores de áreas
pobres nas cidades brasileiras.
A partir das informações apresentadas, os textos
evidenciam:',
  '[{"id": "a", "texto": "redução das desigualdades sociais nas grandes cidades brasileiras."}, {"id": "b", "texto": "dificuldade de acesso à moradia digna e condições básicas de sobrevivência nas áreas urbanas."}, {"id": "c", "texto": "crescimento equilibrado das condições de vida entre diferentes grupos sociais."}, {"id": "d", "texto": "garantia efetiva do salário mínimo para todos os trabalhadores urbanos."}, {"id": "e", "texto": "melhoria geral das condições de infraestrutura nas periferias urbanas."}]'::jsonb, 'b', 'Os dois textos se completam. O primeiro mostra que o salário mínimo foi definido em 1938 para cobrir alimentação, habitação, vestuário, higiene e transporte. O segundo, com o relato de Carolina Maria de Jesus em plena inflação de quase 90%, mostra a distância entre essa promessa legal e a realidade: água comprada na torneira, meses de atraso no pagamento, renda consumida quase toda em comida e episódios de fome. O conjunto evidencia a dificuldade de acesso à moradia digna e às condições básicas de sobrevivência nas áreas urbanas, alternativa B.

A, C, D e E apontam redução de desigualdades, equilíbrio social, garantia do salário mínimo e melhoria da infraestrutura periférica — todas contrariadas pelo que os textos relatam.',
  'media', 'FACAPE 2026.2 - Ampla Concorrência',
  '2026.2-ampla', 'FACAPE 2026.2 - Ampla Concorrência', 2026, 2,
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
