-- ============================================================================
-- DECOLA MED — SEED: FACAPE 2026.1 - Ampla Concorrência
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
  'Português', null, '“Como você deve saber, as filas para transplantes
de órgãos, no Brasil, são imensas. Tal realidade
faz com que muitas pessoas faleçam antes
mesmo de serem chamadas para realizar o
procedimento. Porém, com a impressora 3D, esse
tipo de situação deve começar a mudar. Existem
estudos envolvendo células-tronco vivas, que são
colocadas nos equipamentos de impressão
tridimensional para que elas se reproduzam. De
tal maneira, os tecidos são construídos
biologicamente, gerando novos órgãos que
podem ser impressos e transplantados para o
paciente, substituindo o original, que está
comprometido por alguma doença. Conta-se
ainda com a vantagem de os órgãos impressos
serem feitos com base nas células do próprio
paciente que os receberá, o que reduz as chances
de ocorrer rejeição, algo que é muito comum nos
transplantes.”
Disponível em:
https://telemedicinamorsch.com.br
(adaptado)
Sobre o texto, constata-se que:',
  '[{"id": "a", "texto": "o substantivo “procedimento” em “Tal realidade faz com que muitas pessoas faleçam antes mesmo de serem chamadas para realizar o procedimento.” intensifica a informação de que as filas para transplantes de órgãos é uma realidade."}, {"id": "b", "texto": "o período “Existem estudos envolvendo células-tronco vivas, que são colocadas nos equipamentos de impressão tridimensional para que elas se reproduzam.” revela indignação do autor diante do desprezo da medicina pelo uso da impressora 3D."}, {"id": "c", "texto": "o advérbio “biologicamente” em “De tal maneira, os tecidos são construídos biologicamente...” foi empregado para dificultar a compreensão do leitor."}, {"id": "d", "texto": "o pronome “que” em “...gerando novos órgãos que podem ser impressos e transplantados para o paciente...” inicia uma oração que expressa a impossibilidade de transplantar novos órgãos através da impressão 3D."}, {"id": "e", "texto": "o último parágrafo explica que é vantajoso imprimir os órgãos com base nas células do próprio paciente para que não haja rejeição no transplante."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Português', null, 'Disponível em: https://www.sbam.org.br
O objetivo da campanha acima é:',
  '[{"id": "a", "texto": "orientar sobre a importância do direito de ter assistência médica gratuita."}, {"id": "b", "texto": "divulgar a importância dos neurologistas no que se refere à saúde mental."}, {"id": "c", "texto": "informar aos idosos que os transtornos mentais aumentam o risco de outras doenças."}, {"id": "d", "texto": "alertar as pessoas a respeito dos cuidados com a saúde mental."}, {"id": "e", "texto": "criar estratégias para que haja assistência às pessoas, acima de 40 anos, que necessitam de tratamentos e cuidados específicos em saúde mental."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 2, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q02-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Português', null, '“Arritmias são distúrbios no ritmo cardíaco que
ocorrem quando há uma alteração no processo de
geração e condução dos estímulos elétricos
responsáveis pelos batimentos cardíacos. Uma
arritmia pode ser um sinal de doenças cardíacas
subjacentes, como insuficiência cardíaca, infarto
agudo do miocárdio, problemas nas válvulas
cardíacas e hipertensão arterial. Além disso,
fatores como alterações nas concentrações de
substâncias (sódio, potássio e cálcio), uso
excessivo de álcool, drogas ou energéticos,
condições emocionais como ansiedade e
estresse, bem como influências genéticas, podem
contribuir para o desenvolvimento da doença.
Alguns dos sintomas mais comuns são
palpitações, sensação de falha no coração,
desmaios, tontura, falta de ar, mal-estar e fadiga.
Em casos mais graves, a arritmia pode levar a
confusão mental, pressão arterial baixa e até
parada cardiorrespiratória.”
Disponível em: https://sobrac.org
De acordo com a leitura do texto acima, pode-se
afirmar que:',
  '[{"id": "a", "texto": "as arritmias são causadas, principalmente, pelo uso de bebidas alcóolicas e excesso de exercícios físicos."}, {"id": "b", "texto": "os adjetivos “subjacentes” e “arterial” em “Uma arritmia pode ser um sinal de doenças cardíacas subjacentes, como insuficiência cardíaca, infarto agudo do miocárdio, problemas nas válvulas cardíacas e hipertensão arterial.” estabelecem com as palavras a que se referem uma relação de regência nominal."}, {"id": "c", "texto": "o recurso linguístico “Além disso” em “Além disso, fatores como alterações nas concentrações de substâncias (sódio, potássio e cálcio), uso excessivo de álcool, drogas ou energéticos, condições emocionais como ansiedade e estresse, bem como influências genéticas, podem contribuir para o desenvolvimento da doença é um elemento de articulação da sequência do texto que expressa contradição."}, {"id": "d", "texto": "em “Alguns dos sintomas mais comuns são palpitações, sensação de falha no coração, desmaios, tontura, falta de ar, mal-estar e fadiga.”, o termo destacado completa a significação da palavra “sensação”, o que justifica uma relação de regência nominal."}, {"id": "e", "texto": "no período “Em casos mais graves, a arritmia pode levar a confusão mental, pressão arterial baixa e até parada cardiorrespiratória.”, a expressão “Em casos mais graves” sugere que a arritmia pode desencadear cardiopatias."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Português', null, '“A medicina brasileira vive um momento decisivo.
De um lado, cresce a demanda por profissionais
de saúde em todas as regiões do país. De outro,
nos deparamos com um fenômeno preocupante:
a expansão descontrolada de faculdades de
medicina e a proliferação de especializações não
reconhecidas pela residência médica. Estamos
diante de uma encruzilhada e a escolha que
fizermos hoje terá impacto direto na qualidade do
cuidado prestado à população brasileira nas
próximas décadas.
Nos últimos anos, o número de universidades no
Brasil aumentou de forma exponencial, muitas
delas sem infraestrutura adequada, sem corpo
docente qualificado e, o mais grave, sem
compromisso com a formação ética e científica
que a própria medicina exige.”
Disponível em: https://forbes.com.br
Sobre o texto, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "no período “A medicina brasileira vive um momento decisivo.”, as palavras “brasileira” e “decisivo” enumeram as causas do crescimento dos profissionais de saúde no Brasil."}, {"id": "b", "texto": "no período “De um lado, cresce a demanda por profissionais de saúde em todas as regiões do país.”, o coesivo “De um lado” introduz um ponto de vista que expressa condição."}, {"id": "c", "texto": "no período “Estamos diante de uma encruzilhada e a escolha que fizermos hoje terá impacto direto na qualidade do cuidado prestado à população brasileira nas próximas décadas.”, a forma verbal “fizermos” expressa uma ação característica do modo subjuntivo."}, {"id": "d", "texto": "no trecho “Nos últimos anos, o número de universidades no Brasil aumentou de forma exponencial...”, o termo “de forma exponencial” exprime valor circunstancial de causa."}, {"id": "e", "texto": "no trecho “...muitas delas sem infraestrutura adequada, sem corpo docente qualificado e, o mais grave, sem compromisso com a formação ética e científica que a própria medicina exige.”, a palavra “que” funciona, do ponto de vista morfológico, como conjunção subordinativa integrante."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Português', null, 'Disponível em: https://www.unifap.br
Considerando a estrutura sintática, as palavras
“a” e “sua” em “Converse com a sua família.”, na
campanha acima, desempenham a função de:',
  '[{"id": "a", "texto": "adjunto adverbial de modo."}, {"id": "b", "texto": "adjunto adnominal."}, {"id": "c", "texto": "objeto indireto."}, {"id": "d", "texto": "objeto direto."}, {"id": "e", "texto": "adjunto adverbial de lugar."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 5, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q05-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Português', null, '“No Brasil, a maioria das mortes maternas por
hipertensão como causa obstétrica direta é de
mulheres negras (pretas e pardas). Assim,
compreende-se que a suplementação de cálcio se
configura como uma importante estratégia para
redução da morbimortalidade materna,
principalmente de mulheres negras e indígenas. A
adoção dessa prática no âmbito da APS, na rotina
das Unidades Básicas de Saúde (UBS),
possibilitará o cuidado integral às gestantes
durante o pré-natal, com vistas ao alcance do
cuidado em saúde com universalidade e equidade
étnico-racial.”
Disponível em:
https://portaldeboaspraticas.iff.fiocruz.br
(adaptado)
A partir da leitura do texto acima, assinale a
alternativa CORRETA.',
  '[{"id": "a", "texto": "O texto contém vocábulos empregados com registro de informalidade da língua."}, {"id": "b", "texto": "O texto, em sua totalidade, é construído através de contradição de ideias."}, {"id": "c", "texto": "O parágrafo “No Brasil, a maioria das mortes maternas por hipertensão como causa obstétrica direta é de mulheres negras (pretas e pardas)” sintetiza as ideias que ocorrem no cotidiano das mulheres brasileiras."}, {"id": "d", "texto": "O parágrafo “Assim, compreende-se que a suplementação de cálcio se configura como uma importante estratégia para redução da morbimortalidade materna, principalmente de mulheres negras e indígenas.” indica uma solução para os conflitos de mulheres negras e indígenas."}, {"id": "e", "texto": "O fragmento “...possibilitará o cuidado integral às gestantes durante o pré-natal, com vistas ao alcance do cuidado em saúde com universalidade e equidade étnico-racial.” poderia ser reescrito assim: ...possibilitará o cuidado integral às gestantes durante o pré-natal, com o intuito de alcançar o cuidado em saúde com universalidade e equidade étnico-racial."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Português', null, '“Dentro do contexto abrangente de estudar a
natureza e as causas das doenças e,
posteriormente, tratá-las e curá-las, o trabalho do
médico concentra-se em duas principais
vertentes: a da pesquisa e a da clínica. Em
atividades de pesquisa o profissional usa seus
conhecimentos a fim de descobrir as causas, os
agentes e o tratamento de determinadas doenças.
Na vertente clínica o médico está em contato
direto com paciente e também investiga os
melhores tratamentos para as doenças.”
Disponível em: https://bvsms.saude.gov.br (adaptado)
Sobre os aspectos linguísticos do texto acima, é
CORRETO afirmar que:',
  '[{"id": "a", "texto": "o nível de adequação da linguagem do texto indica que foi elaborado na norma padrão da língua."}, {"id": "b", "texto": "a palavra “posteriormente” em “Dentro do contexto abrangente de estudar a natureza e as causas das doenças e, posteriormente, tratá-las e curá-las...” é um elemento de referência pessoal."}, {"id": "c", "texto": "a forma verbal “concentra-se” no fragmento “...o trabalho do médico concentra-se em duas principais vertentes: a da pesquisa e a da clínica.” foi empregada no modo subjuntivo."}, {"id": "d", "texto": "o recurso linguístico “a fim de” no período “Em atividades de pesquisa o profissional usa seus conhecimentos a fim de descobrir as causas, os agentes e o tratamento de determinadas doenças.”, expressa valor de proporção."}, {"id": "e", "texto": "as formas verbais “está” e “investiga” no período “Na vertente clínica o médico está em contato direto com paciente e também investiga os melhores tratamentos para as doenças.” foram empregadas no pretérito perfeito do modo indicativo."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Português', null, '“Bravo! exclamou Filipe, entrando e despindo a
casaca, que pendurou em um cabide velho.
Bravo!... interessante cena! mas certo que
desonrosa fora para casa de um estudante de
Medicina e já no sexto ano, a não valer-lhe o
adágio antigo: - o hábito não faz o monge. - Temos
discurso!... atenção!... ordem!... gritaram a um
tempo três vozes. - Coisa célebre! acrescentou
Leopoldo. Filipe sempre se torna orador depois do
jantar... - E dá-lhe para fazer epigramas, disse
Fabrício. - Naturalmente, acudiu Leopoldo, que,
por dono da casa, maior quinhão houvera no
cumprimento do recém-chegado; naturalmente.
Bocage, quando tomava carraspana,
descompunha os médicos. - C’est trop fort!
bocejou Augusto, espreguiçando-se no canapé
em que se achava deitado.”
O trecho, transcrito acima, faz parte da obra:',
  '[{"id": "a", "texto": "“A Moreninha”."}, {"id": "b", "texto": "“A Namoradeira”."}, {"id": "c", "texto": "“Grande Sertão: Veredas”."}, {"id": "d", "texto": "“Os Homens de Barro”."}, {"id": "e", "texto": "“Terras do Sem-Fim”."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 8, null, false,
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
  'Português', null, 'Sobre a obra “Os Homens de Barro” de Ariano
Suassuna, conclui-se que:',
  '[{"id": "a", "texto": "é um romance marcado pela valorização da cultura popular nordestina."}, {"id": "b", "texto": "é uma peça teatral cujo ambiente é o sertão nordestino."}, {"id": "c", "texto": "é um conto que aborda uma reflexão sobre a fé do sertanejo."}, {"id": "d", "texto": "é uma crônica que satiriza os poderosos do sertão paraibano."}, {"id": "e", "texto": "é uma novela que critica as injustiças sociais sofridas pelos sertanejos."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 9, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q09-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Inglês', null, 'https://www.gocomics.com
As questões 11 e 12 referem-se ao quadrinho
acima.
No dia a dia, precisamos ler jornais, livros, sites da
internet e avisos em mural, dentre outros meios
de escrita, para aprendermos algo e nos
atualizarmos. Interpretar texto e o mundo ao
nosso redor é fundamental.
Escolha a alternativa CORRETA de acordo com o
diálogo da tirinha. No primeiro quadro, a jovem
pergunta se a pessoa na cadeira trouxe:',
  '[{"id": "a", "texto": "um pacote com livros."}, {"id": "b", "texto": "toalhas para os dois."}, {"id": "c", "texto": "protetor solar."}, {"id": "d", "texto": "óculos de mergulho."}, {"id": "e", "texto": "sanduíches."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Inglês', null, 'O verbo ‘realize’, no terceiro quadro, significa:',
  '[{"id": "a", "texto": "realizar algo."}, {"id": "b", "texto": "estar consciente de algo."}, {"id": "c", "texto": "não é um falso cognato."}, {"id": "d", "texto": "emprestar certa quantia de dinheiro."}, {"id": "e", "texto": "compartilhar o aparelho de som entre eles na praia."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Inglês', null, 'Conhecer as dez classes gramaticais de palavras
da língua inglesa é salutar para montar frases de
acordo com as regras da norma culta. Aliás, em
qualquer língua. Assim, ‘It´s’ e ‘its’ da frase abaixo
estão CORRETAMENTE explanadas,
respectivamente em:
“The Principles of Psychology is an excellent
book.” It´s logical and its text is easy to read.',
  '[{"id": "a", "texto": "‘It us’, um pronome possessivo."}, {"id": "b", "texto": "A forma contracta do verbo modal ‘should’ no presente do indicativo, um pronome possessivo."}, {"id": "c", "texto": "A forma contracta do verbo ‘it was’, um advérbio."}, {"id": "d", "texto": "Um numeral, um verbo."}, {"id": "e", "texto": "A forma contracta de ‘it is’, um pronome possessivo."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Inglês', null, 'Ditados populares resumem a sabedoria dos
nossos antepassados com conselhos úteis e
alguns engraçados para navegarmos na vida com
mais facilidade.
Escolha a alternativa que melhor corresponde ao
ditado de William James mencionado abaixo:
“Act as if what you do makes a difference. It
does."',
  '[{"id": "a", "texto": "Aja como se o que você faz fizesse a diferença; realmente faz."}, {"id": "b", "texto": "O desenrolar dos fatos da vida não depende de tua atitude."}, {"id": "c", "texto": "Teus atos importam a ti e a ninguém mais."}, {"id": "d", "texto": "Seguir uma religião é fundamental para o bem-estar da sociedade."}, {"id": "e", "texto": "Hoje é o dia apropriado para aprender algo novo."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Espanhol', null, 'TEXTO PARA AS QUESTÕES 11 E 12.
Durante años se repitió que las librerías
desaparecerían en silencio, como si fueran una
antigua estación de tren abandonada por la
modernidad. Sin embargo, las que resistieron se
transformaron: cambiaron la disposición de sus
estantes, invitaron a autores locales y recuperaron
viejas prácticas de recomendación boca a boca.
Ya no pretendían competir con la velocidad del
clic, sino ofrecer algo distinto: tiempo para hojear,
conversar y descubrir lo que no estaba en la lista
de “más vendidos”.
No se trata de nostalgia. Quien entra en una
librería hoy sabe que podría comprar el mismo
título en línea. Aun así, acepta la invitación a una
experiencia que combina quietud y encuentro: un
librero que pregunta qué te conmovió en la última
lectura, un lector que recomienda una novela
corta de un autor desconocido, una mesa con
ediciones pequeñas de poesía. En un mundo de
algoritmos, esos gestos siguen siendo una forma
de orientación y cuidado, una brújula humana
para perderse mejor entre los libros.
Com base no texto, a tese central defendida pelo
autor sobre o papel atual das livrarias é que elas:',
  '[{"id": "a", "texto": "sobrevivem quando se afirmam como espaços de encontro e curadoria humana, oferecendo experiência diferente da compra on-line."}, {"id": "b", "texto": "precisam reduzir preços ao mínimo para competir com a velocidade e a conveniência do comércio digital."}, {"id": "c", "texto": "devem abandonar o acervo impresso e concentrar-se em vender e-books e audiolivros."}, {"id": "d", "texto": "funcionam apenas por apego nostálgico dos leitores, sem proposta concreta de valor."}, {"id": "e", "texto": "dependem exclusivamente dos títulos “mais vendidos” para atrair público e manter-se abertas."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Espanhol', null, '“Ya no pretendían competir con la velocidad del
clic, sino ofrecer algo distinto: tiempo para hojear,
conversar y descubrir lo que no estaba en la lista
de ‘más vendidos’.”
En el fragmento, la forma verbal “pretendían”
está conjugada en:',
  '[{"id": "a", "texto": "pretérito perfecto simple, tercera persona plural."}, {"id": "b", "texto": "pretérito imperfecto de indicativo, tercera persona plural."}, {"id": "c", "texto": "futuro simple de indicativo, tercera persona plural."}, {"id": "d", "texto": "pretérito pluscuamperfecto de subjuntivo, tercera persona plural."}, {"id": "e", "texto": "condicional simple, tercera persona plural."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 12, 'espanhol', false,
  '[{"url": "/questoes-facape/2026.1-ampla-q12-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Espanhol', null, 'TEXTO PARA AS QUESTÕES 13 e 14.
“Durante mucho tiempo se pensó que la
automatización destruiría millones de empleos y
que las personas serían reemplazadas por
máquinas en casi todos los ámbitos. Hoy la
discusión es más compleja: no es solo la
desaparición de ciertos puestos, sino la
transformación del sentido mismo del trabajo. Las
plataformas digitales multiplican tareas
fragmentadas, pagadas por minuto o incluso por
clic, lo que genera una economía de la inmediatez.
Muchos trabajadores, aunque conectados a
través de aplicaciones, se sienten más aislados
que nunca, pues carecen de vínculos laborales
estables, sindicatos o beneficios básicos. Al
mismo tiempo, algunos defienden que estas
nuevas formas de empleo ofrecen flexibilidad y la
posibilidad de compatibilizar vida personal y
profesional. El debate, por lo tanto, no gira en
torno a si habrá o no trabajo en el futuro, sino en
qué condiciones será realizado y qué derechos
estarán asociados a él.”
A principal questão levantada pelo impacto da
tecnologia no mundo do trabalho refere-se a:',
  '[{"id": "a", "texto": "possibilidade de erradicação completa do emprego humano em todas as áreas."}, {"id": "b", "texto": "flexibilização e perda de vínculos trabalhistas nas novas formas de ocupação."}, {"id": "c", "texto": "maior estabilidade e fortalecimento dos sindicatos tradicionais."}, {"id": "d", "texto": "valorização da experiência presencial em detrimento das plataformas digitais."}, {"id": "e", "texto": "redução global do tempo de trabalho graças às inovações tecnológicas."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Espanhol', null, '“Muchos trabajadores, aunque conectados a
través de aplicaciones, se sienten más aislados
que nunca, pues carecen de vínculos laborales
estables, sindicatos o beneficios básicos.”
Qual a tradução mais adequada da palavra
“aislados” no contexto apresentado?',
  '[{"id": "a", "texto": "Livres."}, {"id": "b", "texto": "Organizados."}, {"id": "c", "texto": "Isolados."}, {"id": "d", "texto": "Ocupados."}, {"id": "e", "texto": "Distantes."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Espanhol', null, '“El cambio climático ya no es una advertencia
futurista: es una realidad que se manifiesta en
incendios forestales, sequías prolongadas,
inundaciones repentinas y olas de calor extremo.
Ningún país puede alegar indiferencia, pues las
consecuencias cruzan fronteras. Sin embargo, el
debate internacional revela profundas
desigualdades. Mientras las naciones
industrializadas reclaman compromisos comunes,
los países en desarrollo señalan que fueron los
menos responsables históricamente por las
emisiones y, al mismo tiempo, los más vulnerables
a sus efectos. De ahí surge la exigencia de justicia
climática: no basta con reducir gases de efecto
invernadero, es preciso reconocer las deudas
históricas, transferir tecnología y garantizar
financiamiento para la adaptación en regiones que
ya enfrentan pérdidas humanas y económicas
irreparables.”
O texto destaca que a discussão sobre mudanças
climáticas envolve, além da redução das
emissões, a necessidade de:',
  '[{"id": "a", "texto": "extinguir os tratados internacionais existentes e substituí-los por novas instituições."}, {"id": "b", "texto": "responsabilizar exclusivamente os países pobres pelas catástrofes ambientais."}, {"id": "c", "texto": "estabelecer justiça climática, com reconhecimento de responsabilidades históricas e apoio aos mais vulneráveis."}, {"id": "d", "texto": "priorizar o desenvolvimento industrial rápido, independentemente dos impactos ambientais."}, {"id": "e", "texto": "garantir que apenas as nações desenvolvidas possam propor soluções para o problema."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Matemática', null, 'O gráfico a seguir é uma parábola de função y =
ax2 + bx + c, que foi elaborado a partir das
variações das temperaturas de um determinado
ambiente, em ºC, em função do tempo “h”, em
horas. No gráfico é possível perceber que a maior
temperatura registrada foi 14ºC, que ocorreu às 6
h.
É possível determinar a imagem dessa função a
partir de sua representação gráfica, cujo intervalo
é:',
  '[{"id": "a", "texto": "[0, 14]"}, {"id": "b", "texto": "[5, 14]"}, {"id": "c", "texto": "[0, 5]"}, {"id": "d", "texto": "]0, 6]"}, {"id": "e", "texto": "[0, 12]"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 16, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q16-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.1-ampla-q16-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Matemática', null, 'Um produto é vendido em embalagens cujo rótulo
indica a quantidade de 10 mL (mililitros). Deseja-se modificar esse rótulo de modo que a
quantidade do produto passe a ser indicada na
unidade de medida cm3(centímetros cúbicos).
Assim, a quantidade indicada no novo rótulo será:',
  '[{"id": "a", "texto": "0,01 cm3"}, {"id": "b", "texto": "0,10 cm3"}, {"id": "c", "texto": "1 cm3"}, {"id": "d", "texto": "10 cm3"}, {"id": "e", "texto": "100 cm3"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 17, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q17-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.1-ampla-q17-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Matemática', null, 'Um comerciante adquiriu um produto para o
estoque de sua loja, pagando um determinado
preço de custo. Para colocá-lo à venda e obter
lucro, acrescentou 8% sobre o preço de
aquisição. No entanto, após algumas semanas,
verificou que o produto ainda estava no estoque,
e resolveu oferecer um desconto de 10% sobre o
preço de venda, passando, portanto, a vender o
produto por R$ 1.166,40. Assim, o preço inicial de
custo pelo qual esse comerciante adquiriu o
produto foi:',
  '[{"id": "a", "texto": "R$ 956,44"}, {"id": "b", "texto": "R$ 1.046,76"}, {"id": "c", "texto": "R$ 1.200,00"}, {"id": "d", "texto": "R$ 1.283,04"}, {"id": "e", "texto": "R$ 1.296,00"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 18, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q18-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Matemática', null, 'Com o fim de arrecadar doações em dinheiro para
desabrigados durante uma enchente, 40 pessoas
se dividiram em dois grupos A e B. Após um dia
de campanha foi feito o balanço das
arrecadações, e verificou-se que cada pessoa do
grupo A conseguiu arrecadar R$ 80,00, e cada
pessoa do grupo B, R$ 70,00. Se o total
arrecadado nesse dia foi R$ 2.950,00, conclui-se
que a quantidade de pessoas que formaram os
grupos A e B, respectivamente, foi:',
  '[{"id": "a", "texto": "28 e 12."}, {"id": "b", "texto": "20 e 20."}, {"id": "c", "texto": "25 e 15."}, {"id": "d", "texto": "12 e 28."}, {"id": "e", "texto": "15 e 25."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 19, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q19-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Matemática', null, 'O órgão responsável pela fiscalização do trânsito
em uma via pretende instalar 15 aparelhos para
medição de velocidade ao longo de um trecho
com 500 km de extensão. O primeiro aparelho
será implantado exatamente no marco
quilométrico que indica o km 10 da via, e a partir
de então, seguindo no sentido crescente da via,
continuará instalando os demais parelhos, sempre
mantendo a mesma distância de um para o outro.
Se o órgão quer instalar o último desses
aparelhos exatamente no marco quilométrico que
indica o km 500 da via, então a distância entre os
aparelhos de medição de velocidade, em km,
será:',
  '[{"id": "a", "texto": "30"}, {"id": "b", "texto": "34"}, {"id": "c", "texto": "35"}, {"id": "d", "texto": "36"}, {"id": "e", "texto": "50 FÍSICA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 20, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q20-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.1-ampla-q20-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.1-ampla-q20-full2.png", "legenda": null, "ordem": 92}, {"url": "/questoes-facape/2026.1-ampla-q20-full3.png", "legenda": null, "ordem": 93}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Física', null, 'Em um protótipo de iluminação inteligente para
eventos, a placa do controle de luz enxerga entre os
pontos A e B a associação de resistores mostrada na
figura (valores: 4𝛺, 6𝛺, 7𝛺, 10𝛺, 9𝛺 𝑒 12𝛺 ). Para
estimar a potência de repouso do circuito, determine
o valor que mais se aproxima da resistência
equivalente.',
  '[{"id": "a", "texto": "8Ω"}, {"id": "b", "texto": "9Ω"}, {"id": "c", "texto": "10Ω"}, {"id": "d", "texto": "12Ω"}, {"id": "e", "texto": "14Ω"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 21, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q21-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.1-ampla-q21-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Física', null, 'Em um estúdio de fotografia, uma lâmpada
fluorescente linear de 30 𝑐𝑚 esta presa ao teto, a
3,5 𝑚 do piso. 𝐴 1,4 𝑚 abaixo da lâmpada, encontra-se suspensa horizontalmente uma barra opaca de
0,8𝑚, paralela à lâmpada. Sabendo que os centros
da lâmpada e da barra estão alinhados
verticalmente, determine o tamanho da sombra
(umbra) projetada no piso.',
  '[{"id": "a", "texto": "0,80𝑚"}, {"id": "b", "texto": "2,00𝑚"}, {"id": "c", "texto": "1,55𝑚"}, {"id": "d", "texto": "2,45𝑚"}, {"id": "e", "texto": "3,00𝑚"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 22, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q22-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.1-ampla-q22-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Física', null, 'Um protótipo de kart elétrico com massa de 150 𝑘𝑔
desloca-se a 54,0 𝑘𝑚/ℎ. Ao frear até parar, toda a
energia cinética é convertida em calor no sistema de
freios. Determine a dilatação relativa do volume do
sistema de freios. Considere os dados: 1 𝑐𝑎𝑙 = 4,19 𝐽
ou 1 𝐽 = 0,239 𝑐𝑎𝑙 ,
𝛾
𝐶
= 5,00 × 10−7𝐶𝑎𝑙−1/𝐶, em que
𝛾 é o coeficiente de dilatação volumétrica e 𝐶 é a
capacidade térmica do sistema de freios.',
  '[{"id": "a", "texto": "2,00 ∙ 10−3"}, {"id": "b", "texto": "3,00 ∙ 10−3"}, {"id": "c", "texto": "4,00 ∙ 10−3"}, {"id": "d", "texto": "5,00 ∙ 10−3"}, {"id": "e", "texto": "6,00 ∙ 10−3"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 23, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q23-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Física', null, 'Um carrinho de massa 𝑚1 = 2,0𝐾𝑔 desloca-se em
uma superfície sem atrito com velocidade inicial
𝑣0 = 6,0 𝑚/𝑠. Ele colide com um bloco de massa
𝑚2 = 2,0𝐾𝑔 , preso a uma mola de constante
elástica 𝑘 = 9,0 𝑁/𝑚 e em repouso. Admitindo que
a mola tem massa desprezível, determine a
compressão máxima da mola.',
  '[{"id": "a", "texto": "1,0𝑚"}, {"id": "b", "texto": "1,5𝑚"}, {"id": "c", "texto": "2,0𝑚"}, {"id": "d", "texto": "2,5𝑚"}, {"id": "e", "texto": "3,0𝑚"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 24, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q24-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.1-ampla-q24-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Física', null, 'Em um parque aquático, duas pequenas esferas
metálicas são abandonadas a partir da mesma
altura ℎ em relação ao solo. A esfera A cai em
queda livre vertical, enquanto a esfera B desliza,
sem atrito, por um escorregador inclinado a 45° em
relação à horizontal. Desprezando a resistência do
ar e quaisquer forças dissipativas, determine a
razão entre o tempo de queda de A 𝑡𝐴 e tempo de
queda de B 𝑡𝐵 , gastos pelas duas esferas para
atingirem o solo. (Dados sin 45° = cos 45° = √2 /2)',
  '[{"id": "a", "texto": "1/2"}, {"id": "b", "texto": "1/√2"}, {"id": "c", "texto": "√3/2"}, {"id": "d", "texto": "1"}, {"id": "e", "texto": "√2 QUÍMICA"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 25, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q25-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.1-ampla-q25-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Química', null, 'Os fogos de artifício, apesar de seu caráter festivo,
apresentam riscos significativos para o meio
ambiente e a saúde humana e animal, devido à
poluição do ar e sonora, além do risco de
incêndios e acidentes. A queima de fogos libera
poluentes como fuligem, dióxido de enxofre,
dióxido de nitrogênio, metais pesados (chumbo,
estrôncio, bário) e partículas finas na atmosfera,
contribuindo para a má qualidade do ar e
problemas respiratórios. Sobre as informações
do texto e das substâncias químicas envolvidas,
pode–se afirmar que:
Dados: 1H (1), 6C (14), 8O (16), 16S (16), 7N (15),
82Pb (14), 38Sr (2) e 56Ba (2).',
  '[{"id": "a", "texto": "de acordo com o modelo de Bohr a transição de um elétron do estrôncio de um nível mais interno para outro mais externo libera energia luminosa."}, {"id": "b", "texto": "o chumbo pode ser encontrado em diversas fontes, como tintas, canos antigos, brinquedos exceto em produtos alimentícios, tornando a prevenção um desafio."}, {"id": "c", "texto": "para remover íons estrôncio da água, podem ser utilizados diversos métodos, como a filtração e a osmose reversa."}, {"id": "d", "texto": "o óxido nítrico (NO) é uma mistura formada pelos elementos nitrogênio e oxigênio."}, {"id": "e", "texto": "o sulfato de bário (BaSO4) é considerado seguro devido à sua baixa solubilidade em água."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 26, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q26-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.1-ampla-q26-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Química', null, 'O estradiol é um hormônio presente nas
mulheres, em grandes quantidades, e nos
homens, em quantidades pequenas. Embora seja
conhecido como hormônio feminino devido ao
seu papel no desenvolvimento dos órgãos sexuais
das mulheres, o estradiol também é importante
para a saúde dos homens. Ele é produzido,
principalmente, pelos ovários nas mulheres e
pelos testículos nos homens. Outras áreas do
corpo que produzem estradiol: ossos, pele, fígado
e glândula adrenal.
Disponível em:
https://www.fleury.com.br/medico/artigos-cientificos/pet-ct-com-18f-fluoroestradiol-avaliacao-por-imagem-do-cancer-de-mama-agora-conta-com-mais-um-metodo-nuclear Acesso em 20.08.25.
Estradiol
A análise da estrutura química permite afirmar que
a molécula do estradiol:',
  '[{"id": "a", "texto": "apresenta em sua estrutura o grupo funcional dos álcoois primários."}, {"id": "b", "texto": "corresponde a uma mistura racêmica com número de isômeros ópticos igual a 32."}, {"id": "c", "texto": "apresenta alta solubilidade em água devido à presença de ligações de hidrogênio."}, {"id": "d", "texto": "pode se ligar a ácidos graxos através de uma reação de esterificação, formando éteres de estradiol."}, {"id": "e", "texto": "tem seu caráter básico acentuado devido à presença da hidroxila ligada diretamente ao anel aromático."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 27, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q27-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.1-ampla-q27-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Química', null, 'As substâncias químicas são essenciais em
diversos aspectos do nosso cotidiano, desde a
nossa alimentação e saúde até a produção de
materiais e energia. A química está presente em
processos naturais, como a digestão e a
respiração, e também em produtos que utilizamos
diariamente, como medicamentos, cosméticos e
produtos de limpeza.
Disponível em:
https://app.planejativo.com/estudar/208/resumo/quimica-substancias-puras-e-misturas Acesso em 18.08.25.
Sobre substâncias químicas utilizadas no
cotidiano pode–se afirmar que:',
  '[{"id": "a", "texto": "no sangue humano, uma concentração de ureia igual a 0,15g/L é superior a uma concentração plasmática, dessa mesma substância, de 18,00mg/dL."}, {"id": "b", "texto": "considerando–se que concentrações superiores a 5,0ppm (m/v) de monóxido de carbono na atmosfera indicam que o ar está poluído, concentrações abaixo de 5,0mg/mL revelam que o ar tem boa qualidade."}, {"id": "c", "texto": "blocos de gelo flutuantes em regiões do ártico não servem como fonte de água doce, após fundição, para pequenas populações que vivem no local."}, {"id": "d", "texto": "adubos nitrogenados possuem íons amônio, NH4 + , que reagem com a água existente no solo, produzindo íons hidrônio, H3O+, juntamente com uma base."}, {"id": "e", "texto": "o hipoclorito de sódio, NaCℓO, é muito utilizado no tratamento da água para consumo humano para eliminar germes causadores de doenças, por ser classificado como sal ácido."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 28, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q28-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.1-ampla-q28-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.1-ampla-q28-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Química', null, 'A energia em reações químicas refere-se
à energia liberada ou absorvida durante uma
transformação química, resultante da quebra e
formação de ligações químicas. Essa energia,
conhecida como energia química, pode se
manifestar como calor, eletricidade ou outras
formas de energia.
Disponível em:
https://www.preparaenem.com/quimica/como-reconhecer-uma-transformacao-quimica.htm
Acesso em 18.08.25.
De acordo com a energia existentes nas
substâncias químicas é CORRETO afirmar que:',
  '[{"id": "a", "texto": "o dióxido de carbono, quando utilizado em extintores de incêndio, combate o fogo, porque é uma substância comburente."}, {"id": "b", "texto": "em atratores luminosos ocorrem reações químicas onde o catalisador utilizado é um éster, o salicilato de sódio, que diminui a energia de ativação da reação."}, {"id": "c", "texto": "de acordo com a equação termoquímica 2H2(g) + O2(g) → 2H2O(g) + 484kJ pode–se concluir que a variação de entalpia–padrão do gelo formado a partir do H2(g) e do O2(g) tem valor inferior a – 242kJ/mol."}, {"id": "d", "texto": "uma solução 0,25mol/L de HF(aq) (Ka = 3,5.10−4) tem menos eficácia para a condução de corrente elétrica do que uma solução, de mesma concentração, de H3CCOOH (Ka = 1,8.10−5)."}, {"id": "e", "texto": "a temperatura do pico Everest, o sistema em equilíbrio representado por N2(g) + O2(g) ⇌ 2NO(g) ΔH° = +180,9kJ apresenta maior rendimento em NO(g).."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 29, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q29-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.1-ampla-q29-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Química', null, 'A química orgânica desempenha um papel crucial
em diversas áreas, incluindo a indústria
farmacêutica, petroquímica, alimentícia e na
produção de polímeros e tecidos sintéticos. Ela é
responsável pela síntese de muitos produtos que
usamos diariamente, desde medicamentos e
plásticos até tecidos e combustíveis.
Disponível em:
https://br.freepik.com/fotos-vetores-gratis/compostos-organicos/10 Acesso
em 18.08.25.
Sobre as características, propriedades e reações
dos compostos orgânicos é CORRETO afirmar
que:',
  '[{"id": "a", "texto": "a vitamina, com estrutura representada abaixo, cuja carência pode provocar raquitismo, não apresenta átomos de carbono no menor estado de oxidação."}, {"id": "b", "texto": "todo o lixo pode ser utilizado na obtenção de energia devido a sua enriquecedora característica, a heterogeneidade, o que potencializa a geração de biogás."}, {"id": "c", "texto": "o ácido linoleico, C17H31COOH, classificado como ômega–6, é um composto de cadeia saturada."}, {"id": "d", "texto": "a timina e a adenina fazem parte da estrutura do DNA e a presença de grupos –OH na estrutura desses compostos caracterizam pH acima de sete."}, {"id": "e", "texto": "recomenda–se o uso de etanol como combustível em vez da gasolina, pois a queima desse combustível consome menos energia do que a do etanol, que libera gás carbônico com menor teor de poluição por ser de origem vegetal. BIOLOGIA"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 30, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q30-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2026.1-ampla-q30-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2026.1-ampla-q30-full2.png", "legenda": null, "ordem": 92}, {"url": "/questoes-facape/2026.1-ampla-q30-full3.png", "legenda": null, "ordem": 93}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, 'Analise as afirmativas abaixo, relacionadas à
Ecologia.
I. Ecossistema é a unidade funcional básica da
ecologia, porque inclui os componentes
bióticos e abióticos relacionados entre si.
II. Comunidade é mesmo que biocenose, sendo,
portanto, o conjunto de populações que vivem
em uma determinada área geográfica.
III. O Nicho Ecológico está relacionado a várias
funções desempenhadas pela espécie em seu
ambiente natural.
IV. Nível trófico é o fator de identificação do habitat
de uma determinada espécie, portanto, o nível
trófico também pode ser reconhecido como o
próprio habitat de uma espécie.
Assinale a alternativa CORRETA:',
  '[{"id": "a", "texto": "Somente as alternativas I e II são corretas."}, {"id": "b", "texto": "Somente as alternativas II e III são corretas."}, {"id": "c", "texto": "Somente as alternativas I e IV são corretas."}, {"id": "d", "texto": "Somente as alternativas I, II e III são corretas."}, {"id": "e", "texto": "Somente as alternativas II, III e IV são corretas."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Biologia', null, '“A doença de Alzheimer (DA) é uma das doenças
neurodegenerativas mais prevalentes,
caracterizada pelo comprometimento da função
cognitiva devido à perda progressiva de
neurônios no cérebro. Ao microscópio, o acúmulo
neuronal de proteínas tau anormais e placas
amiloides são duas características patológicas
marcantes nas regiões cerebrais afetadas.
Embora o mecanismo detalhado da patogênese
da DA ainda seja indefinido, um grande conjunto
de evidências sugere que mitocôndrias
danificadas provavelmente desempenham papéis
fundamentais na patogênese da DA. Acredita-se
que um conjunto saudável de mitocôndrias não
apenas apoia a atividade neuronal, fornecendo
suprimento de energia suficiente e outras funções
mitocondriais relacionadas aos neurônios, mas
também protege os neurônios, minimizando o
dano oxidativo relacionado às mitocôndrias.”
(Wang et al, 2020,p.1).
Considerando o papel das mitocôndrias e os
efeitos de sua disfunção, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "a redução da produção de ATP limita o fornecimento de energia para os neurônios, comprometendo sua atividade."}, {"id": "b", "texto": "a diminuição da liberação de radicais livres aumenta o estresse oxidativo e acelera a degeneração neuronal."}, {"id": "c", "texto": "a ineficiência mitocondrial estimula a síntese de glicose como principal fonte de energia dos neurônios, reduzindo os sintomas da doença."}, {"id": "d", "texto": "a função mitocondrial prejudicada promove maior regeneração celular, o que retarda a evolução do Alzheimer."}, {"id": "e", "texto": "a falha na respiração celular favorece a neutralização de espécies reativas de oxigênio, preservando a função cerebral."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Biologia', null, 'A passagem em bloco de macromoléculas pela
membrana e de microrganismos ocorre por
processos que envolvem modificações na
membrana plasmática visíveis por microscopia
óptica ou eletrônica. As células podem internalizar
grande quantidade de material extracelular por
meio das vias endocíticas. Há três variedades de
vias endocíticas: pinocitose, endocitose mediada
por receptores e fagocitose.
(Junqueira e Carneiro, 2025, p.28).
Dentre as variedades citadas, NÃO se pode definir
que:',
  '[{"id": "a", "texto": "exocitose é um processo equivalente à endocitose, porém no sentido oposto – transporte de dentro para fora da célula. todavia, do ponto de vista molecular, a endocitose e a exocitose são processos diversos e dependem de proteínas diferentes."}, {"id": "b", "texto": "a pinocitose é praticada por todos os tipos celulares. caracteriza-se pela formação de pequenas invaginações da membrana, que envolvem qualquer material que estiver em solução, isto é, fluidos."}, {"id": "c", "texto": "endocitose mediada por receptores é um processo de especificidade da membrana."}, {"id": "d", "texto": "os macrófagos e os neutrófilos, são especializados em englobar e destruir bactérias, fungos, protozoários, células lesionadas, partículas orgânicas ou inertes e fragmentos de matriz extracelular, são exemplos de fagocitose."}, {"id": "e", "texto": "exocitose é a ingestão de material celular do meio externo da célula por meio da fusão entre vesículas citoplasmáticas e a membrana plasmática."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 34, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q34-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, 'Hemocitopoese é o processo contínuo e regulado
de produção de células do sangue, que envolve
renovação, proliferação, diferenciação e
maturação celular. As células do sangue têm vida
curta e são constantemente renovadas pela
proliferação mitótica de células localizadas nos
órgãos hemocitopoéticos.
(Junqueira e Carneiro,2025. p 255).
Os principais órgãos hemocitopoéticos são:',
  '[{"id": "a", "texto": "Medula óssea vermelha, baço e fígado."}, {"id": "b", "texto": "Medula óssea amarela, baço e fígado."}, {"id": "c", "texto": "Medula óssea amarela, medula óssea vermelha e fígado."}, {"id": "d", "texto": "Fígado, baço e pâncreas."}, {"id": "e", "texto": "Medula óssea vermelha, baço e pâncreas."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Biologia', null, 'Em um hospital público, chegou um paciente com
hemorragia interna devido a um grave acidente de
trânsito. Constatou-se a necessidade urgente de
transfusão de sangue e, ao verificar o prontuário,
observou-se que este paciente apresentava
diagnóstico confirmado de hemofilia. Graças a
essa informação, o tratamento pôde ser realizado
de forma adequada e imediata. Considerando as
características genéticas da hemofilia, esse
paciente pode ser identificado como:',
  '[{"id": "a", "texto": "uma pessoa do sexo feminino portadora de hemofilia."}, {"id": "b", "texto": "uma pessoa do sexo masculino portadora de hemofilia."}, {"id": "c", "texto": "uma pessoa do sexo feminino hemofílica."}, {"id": "d", "texto": "uma pessoa do sexo masculino hemofílica."}, {"id": "e", "texto": "uma pessoa sem predisposição genética para a hemofilia."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 36, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q36-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, 'Sobre os Biomas Brasileiros, relacione a 2ª coluna
de acordo com a 1ª coluna.
1ª COLUNA
(1) Amazônia
(2) Cerrado
(3) Caatinga
(4) Pantanal
(5) Pampa
(6) Mata Atlântica
2ª COLUNA
(....) Vegetação xerófita, caducifólia, com
presença de cactáceas e arbustos
adaptados à seca.
(....) Predomínio de gramíneas, com clima
subtropical e ocorrência de invernos
rigorosos.
(....) Maior planície alagável do mundo, com
biodiversidade aquática e terrestre.
(....) Vegetação perene, densa e heterogênea,
com elevado índice pluviométrico.
(....) Presença de árvores retorcidas, raízes
profundas e queimadas naturais na estação
seca.
(....) A vegetação é composta por formações
florestais densas, como a floresta ombrófila
mista e densa, e abrange uma extensa faixa
costeira do Brasil.',
  '[{"id": "a", "texto": "1, 2, 3, 4, 5 e 6."}, {"id": "b", "texto": "6, 2, 3, 4, 5 e 1."}, {"id": "c", "texto": "5, 4, 6, 3, 2 e 1."}, {"id": "d", "texto": "3, 5, 4, 1, 2 e 6."}, {"id": "e", "texto": "4, 3, 6, 5. 2 e 1."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Biologia', null, 'O Brasil ocupa a 2ª posição do mundo entre os
países que registram casos novos de hanseníase.
Em razão de sua elevada carga, a doença
permanece como um importante problema de
saúde pública no país, sendo de notificação
compulsória e investigação obrigatória. Sobre
essa doença, descreve-se que ela é causada pelo
bacilo
Mycobacterium leprae e se transmite através de
gotículas da via aérea superior, mas apenas de
uma pessoa para outra através de um contato
próximo e prolongado com um doente não
tratado.
(Ministério da Saúde, 2025).
NÃO são sinais e sintomas da Hanseníase:',
  '[{"id": "a", "texto": "manchas (brancas, avermelhadas, acastanhadas ou amarronzadas) e/ou área (s) da pele com alteração da sensibilidade térmica (ao calor e frio) e/ou dolorosa (à dor) e/ou tátil (ao tato)."}, {"id": "b", "texto": "comprometimento do (s) nervo (s) periférico (s) – geralmente espessamento (engrossamento) –, associado a alterações sensitivas e/ou motoras e/ou autonômicas."}, {"id": "c", "texto": "áreas com diminuição dos pelos e do suor."}, {"id": "d", "texto": "manchas brancas sensíveis a temperatura, com sensação de ardor."}, {"id": "e", "texto": "diminuição ou ausência da sensibilidade e/ou da força muscular na face, e/ou nas mãos e/ou nos pés."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Biologia', null, 'Observe a figura abaixo, analise as alternativas e
assinale a resposta INCORRETA quanto aos
estudos dos cromossomos.
(Educa Mais Brasil, 2020)',
  '[{"id": "a", "texto": "Os cromossomos são estruturas filamentosas localizadas no interior do núcleo das células."}, {"id": "b", "texto": "Os cromossomos contêm os genes que são os transmissores das características hereditárias."}, {"id": "c", "texto": "Os cromossomos podem ser visualizados de forma melhor durante a divisão celular, que é quando se apresentam condensados ao máximo, devido ao super enrolamento (ou empacotamento) do DNA."}, {"id": "d", "texto": "cromossomo apresenta uma constricção secundária, também denominada centrômero. A estrutura exata de um centrômero é ainda pouco clara, mas sabe-se que ele é responsável pelo movimento dos cromossomos durante a divisão celular."}, {"id": "e", "texto": "Morfologicamente, os cromossomos são classificados de acordo com a posição do centrômero."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 39, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q39-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Biologia', null, 'Os tecidos vegetais desempenham funções
distintas no crescimento, na sustentação e
transporte de substâncias na planta. Enquanto
alguns são formados por células vivas, capazes de
desempenhar metabolismo ativo, outros
apresentam células mortas na maturidade,
especializadas em conferir resistência mecânica
ou facilitar a condução de água. Sobre os tecidos
vegetais, relacione a 2ª Coluna de acordo com a
1ª Coluna.
1ª COLUNA
(1) Parênquima clorofiliano
(2) Floema (elementos crivados)
(3) Esclerênquima (fibras e esclereides)
(4) Xilema (traqueítes e elementos de vaso)
2ª COLUNA
(....) Formados por células vivas, responsáveis
pela fotossíntese, armazenamento e trocas
metabólicas.
(....) Formados por células vivas especializadas no
transporte de seiva elaborada (açúcares).
(....) Formados por células mortas, que conferem
sustentação rígida devido ao espessamento
lignificado.
(....) Formados por células mortas, ocas,
especializadas na condução de água e sais
minerais.
Assinale a alternativa que preenche
CORRETAMENTE a 2ª Coluna.',
  '[{"id": "a", "texto": "1, 2, 3, 4."}, {"id": "b", "texto": "2, 1, 4, 3."}, {"id": "c", "texto": "1, 3, 2, 4."}, {"id": "d", "texto": "4, 1, 2, 3."}, {"id": "e", "texto": "3, 4, 1, 2. HISTÓRIA"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'História', null, 'Construção da ponte Presidente Dutra, entre Juazeiro e
Petrolina, na década de 1950 — Foto: Brasil Constrói (RJ) 1948-
1960. Acervo da Biblioteca Nacional.
Em 1954, foi inaugurada a Ponte Presidente Dutra,
ligando as cidades de Petrolina (PE) e Juazeiro
(BA), sobre o Rio São Francisco. A obra teve início
em 1949 e simbolizou um marco de integração
entre o Nordeste e o restante do país, facilitando
o transporte de mercadorias, pessoas e a
circulação cultural. Sua inauguração ocorreu no
contexto do segundo governo de Getúlio Vargas
(1951-1954), período em que projetos de
infraestrutura ganharam destaque dentro de uma
política de fortalecimento do Estado e incentivo ao
desenvolvimento econômico.
— Adaptado de Arquivo Nacional; Fundação Getúlio Vargas.
A inauguração da Ponte Presidente Dutra, em
1954, pode ser associada ao contexto histórico do
Brasil caracterizado por:',
  '[{"id": "a", "texto": "consolidação do modelo agroexportador, com reforço das estruturas coloniais no sertão nordestino."}, {"id": "b", "texto": "implementação de políticas de integração regional e incentivo à industrialização no governo Vargas"}, {"id": "c", "texto": "retorno ao liberalismo econômico, com a redução do papel do Estado na economia brasileira"}, {"id": "d", "texto": "retomada da política do café-com-leite, fortalecendo oligarquias agrárias em nível nacional."}, {"id": "e", "texto": "completa exclusão do Nordeste dos projetos nacionais de desenvolvimento econômico."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'História', null, 'A cultura europeia medieval não se desenvolveu
de forma isolada: ela herdou, reelaborou e
reinterpretou elementos da Antiguidade greco-romana. A filosofia aristotélica, por exemplo, foi
retomada e adaptada pelos escolásticos
medievais; o direito romano forneceu bases para
as concepções jurídicas da cristandade; e a
tradição literária e arquitetônica inspirou novas
formas artísticas. Ao mesmo tempo, aspectos da
vida medieval, como a centralidade da Igreja,
conferiram um novo sentido a esse legado
cultural.
— Adaptado de LE GOFF, J. A Civilização do
Ocidente Medieval. Lisboa: Estampa, 1984.
Com base nas heranças da Antiguidade greco-romana reinterpretadas na Idade Média, analise
as afirmativas:
I.A filosofia de Aristóteles foi retomada por
pensadores medievais como Tomás de
Aquino, que buscou conciliar fé cristã e
razão.
II.O direito romano, especialmente na versão
compilada por Justiniano, influenciou a
formação do direito canônico medieval.
III.A democracia direta ateniense foi
reproduzida nas assembleias feudais,
onde todos os habitantes participavam das
decisões políticas.
IV.O latim, língua herdada dos romanos,
tornou-se idioma da Igreja e da produção
intelectual durante a Idade Média.
V.A literatura épica medieval, como a
Chanson de Roland, foi inspirada em
tradições exclusivamente germânicas,
sem qualquer influência clássica.',
  '[{"id": "a", "texto": "Apenas I, II e IV estão corretas."}, {"id": "b", "texto": "Apenas I, III e V estão corretas."}, {"id": "c", "texto": "Apenas II, IV e V estão corretas."}, {"id": "d", "texto": "Apenas I, II e III estão corretas."}, {"id": "e", "texto": "Apenas III, IV e V estão corretas."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'História', null, 'Ao longo da colonização portuguesa, diferentes
povos indígenas reagiram de variadas formas à
presença europeia. Além dos conflitos armados,
há registros de alianças estratégicas, fugas para
regiões de difícil acesso, manutenção de práticas
culturais próprias e uso da religião como forma de
reelaboração simbólica diante da pressão
colonial. Esses mecanismos de enfrentamento
revelam a diversidade das resistências indígenas
e a capacidade de adaptação frente às
imposições externas.
Adaptado de CUNHA, M. C. História dos
Índios no Brasil. São Paulo: Cia das
Letras, 1992.
Considerando as estratégias de resistência
indígena durante a colonização, é CORRETO
afirmar que elas incluíam:',
  '[{"id": "a", "texto": "a adesão irrestrita ao sistema colonial português, eliminando por completo as tradições locais."}, {"id": "b", "texto": "apenas o combate militar direto, já que todas as demais formas de resistência foram impossíveis."}, {"id": "c", "texto": "movimentos de preservação cultural, fugas e reelaborações religiosas diante da pressão externa."}, {"id": "d", "texto": "a aceitação integral da catequese, vista como caminho único de sobrevivência coletiva."}, {"id": "e", "texto": "a dependência das decisões das metrópoles europeias, sem protagonismo indígena."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'História', null, 'Entre os séculos XVII e XVIII, a Europa foi palco de
intensas transformações sociais e políticas. A
Revolução Inglesa resultou na limitação do poder
monárquico e no fortalecimento do Parlamento; a
Revolução Francesa questionou privilégios do
Antigo Regime e proclamou a igualdade jurídica;
e, em paralelo, o Iluminismo difundiu ideias de
liberdade, soberania popular e laicização do
Estado. Essas mudanças abalaram as estruturas
tradicionais e inauguraram novos modelos de
organização política que influenciaram outras
partes do mundo.
— Adaptado de HOBSBAWM, E. A Era
das Revoluções. Rio de Janeiro: Paz e
Terra, 2014.
No contexto das revoluções sociais e políticas da
Europa Moderna, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "a Revolução Inglesa consolidou o absolutismo monárquico, reforçando os privilégios aristocráticos."}, {"id": "b", "texto": "a Revolução Francesa suprimiu a igualdade jurídica, mantendo intactos os privilégios da nobreza e do clero."}, {"id": "c", "texto": "o Iluminismo legitimou o poder divino dos reis como fundamento da autoridade política."}, {"id": "d", "texto": "os movimentos revolucionários questionaram a ordem do Antigo Regime e propuseram novos princípios de cidadania."}, {"id": "e", "texto": "as revoluções europeias foram isoladas, sem repercussão fora do continente."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 44, null, false,
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
  'História', null, 'A situação apresentada pela charge sugere uma
analogia com a Guerra Fria, mas em um novo
contexto. Historicamente, a Guerra Fria (1947-
1991) foi marcada por:',
  '[{"id": "a", "texto": "a divisão do mundo em blocos ideológicos liderados por EUA e URSS, com disputas indiretas em diferentes territórios."}, {"id": "b", "texto": "a aliança estratégica entre Washington e Moscou para dividir o Leste Europeu em zonas de influência estáveis."}, {"id": "c", "texto": "a predominância das relações pacíficas entre EUA e URSS, sem interferência militar em países periféricos."}, {"id": "d", "texto": "a ausência de propaganda ideológica, já que os conflitos eram exclusivamente militares."}, {"id": "e", "texto": "o isolamento internacional da Europa Ocidental, sem participação nos embates políticos da época. GEOGRAFIA"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 45, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q45-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Geografia', null, 'Em 1850, foi promulgada no Brasil a Lei de
Terras, que estabeleceu que o acesso à terra só
poderia ocorrer por meio da compra, restringindo
a posse daqueles que nela já trabalhavam,
especialmente camponeses pobres, indígenas e a
população negra recém-liberta. Esse dispositivo
atendeu aos interesses da elite agrária e
contribuiu para a manutenção da estrutura
latifundiária. No mesmo período, nos Estados
Unidos, a Lei Lincoln, de 1862, buscava um
objetivo oposto: estimular a colonização interna e
a pequena propriedade, oferecendo terras a
preços simbólicos ou gratuitamente a quem
estivesse disposto a cultivá-las.
GALEANO, E. H., As veias abertas da América
Latina. Porto Alegre, RS: L&PM, 2019.
A Lei de Terras no Brasil e a Homestead Act nos
Estados Unidos evidenciam, respectivamente,
políticas que:',
  '[{"id": "a", "texto": "consolidam o poder latifundiário e democratizam o acesso à terra."}, {"id": "b", "texto": "impedem a expansão territorial e favorecem a imigração."}, {"id": "c", "texto": "restringem a mobilidade interna e estimulam a ocupação agrícola."}, {"id": "d", "texto": "garantem a posse aos despossuídos e impulsionam o crescimento industrial."}, {"id": "e", "texto": "ampliam os direitos civis e promovem a abolição da escravidão."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Geografia', null, '“Não havia sequer uma fábrica de canhões ao sul
da linha Mason-Dixie, poucas eram as fundições
de ferro existentes no Sul, assim como tecelagens
de lã, fábricas de algodão ou curtumes. Não se
tinha um único navio de guerra. Com tudo isso, os
ianques poderiam tomar conta dos portos em uma
semana, de modo que ficariam impedidos de
vender o algodão.”
Margaret Mitchell. E o Vento Levou. Principis,
2021.
O texto retrata a fragilidade econômica e industrial
do Sul dos Estados Unidos durante a Guerra de
Secessão (1861–1865), A análise do episódio
histórico e sua conexão com os conflitos atuais
revela que, em contextos de guerra, o bloqueio de
portos, rotas e sistemas de circulação de
mercadorias funciona como estratégia de:',
  '[{"id": "a", "texto": "evitar a expansão territorial de novos países."}, {"id": "b", "texto": "restringir o acesso a recursos essenciais e enfraquecer o inimigo."}, {"id": "c", "texto": "proteger a soberania política e reduzir a dependência tecnológica."}, {"id": "d", "texto": "ampliar os direitos sociais e consolidar a democracia."}, {"id": "e", "texto": "promover a industrialização acelerada em áreas periféricas."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 47, null, false,
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
  'Geografia', null, '“A globalização marca um momento de ruptura
nesse processo de evolução social e moral que se
vinha fazendo nos séculos precedentes. É irônico
recordar que o progresso técnico aparecia, desde
os séculos anteriores, como uma condição para
realizar essa sonhada globalização com a mais
completa humanização da vida no planeta.
Finalmente, quando esse progresso técnico
alcança um nível superior, a globalização se
realiza, mas não a serviço da humanidade.”
SANTOS, M. Por uma outra globalização: do
pensamento único à consciência universal.
Rio de Janeiro: Record, 2019 (Adaptado).
No trecho, Milton Santos problematiza a
contradição entre o avanço técnico e o uso social
da globalização, reforçando desigualdades. Nesse
contexto, a reflexão do geógrafo evidencia que:',
  '[{"id": "a", "texto": "a evolução tecnológica sempre esteve desvinculada das expectativas sociais de humanização."}, {"id": "b", "texto": "a globalização representa a realização plena da cidadania planetária, superando conflitos locais."}, {"id": "c", "texto": "o progresso técnico, subordinado ao mercado, limita-se a reforçar lógicas de consumo e exclusão."}, {"id": "d", "texto": "a globalização se caracteriza pela distribuição igualitária."}, {"id": "e", "texto": "o avanço tecnológico eliminou fronteiras e garantiu equilíbrio nas relações socias."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
  'ampla', 48, null, false,
  '[{"url": "/questoes-facape/2026.1-ampla-q48-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
)
on conflict (prova_codigo, numero_questao, idioma) do update set
  materia = excluded.materia,
  assunto = excluded.assunto,
  enunciado = excluded.enunciado,
  alternativas = excluded.alternativas,
  resposta_correta = excluded.resposta_correta,
  explicacao = excluded.explicacao,
  imagens = excluded.imagens,
  updated_at = now();

insert into questoes (
  materia, assunto, enunciado, alternativas, resposta_correta, explicacao,
  dificuldade, fonte, prova_codigo, prova_nome, ano, semestre, modalidade,
  numero_questao, idioma, anulada, imagens, ativo
) values (
  'Geografia', null, 'A expansão das áreas urbanas, as atividades de
construção de obras civis, a expansão das
atividades agrícolas e pastoris, entre outras
atividades desenvolvidas pelas sociedades ao
longo dos séculos, no Brasil e no mundo, vêm
alcançando estágios de desenvolvimento,
eficiência e domínio tecnológico que, na maioria
das vezes, não vêm acompanhados do processo
de organização e planejamento, necessários para
a sustentabilidade da natureza.
GUERRA, A. J. T. Geomorfologia
ambiental. Rio de Janeiro: Bertrand
Brasil, 2018.
Com base no texto, a falta de planejamento
urbano contribui para a reprodução da
desigualdade social no acesso a ambientes
seguros e sustentáveis, pois:',
  '[{"id": "a", "texto": "a ocupação desordenada de áreas de risco atinge preferencialmente grupos historicamente marginalizados, evidenciando um padrão de racismo ambiental."}, {"id": "b", "texto": "o crescimento urbano planejado e o acesso igualitário a áreas seguras eliminam qualquer desigualdade social."}, {"id": "c", "texto": "a tecnologia aplicada à agricultura e à construção civil garante proteção ambiental, independentemente do planejamento urbano."}, {"id": "d", "texto": "apenas políticas ambientais internacionais são responsáveis por reduzir a desigualdade no acesso ao solo seguro."}, {"id": "e", "texto": "os desastres ambientais ocorrem de forma igual para todos os grupos sociais."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
  'Geografia', null, 'As onze unidades de relevo classificados como
planaltos correspondem às áreas de maiores
atitudes, o que se deve à constituição rochosa,
que oferece maior resistência aos processos
erosivos. Dependendo do tipo de estrutura de
relevo em que se encontram, essas unidades se
subdividem, já que podem ser encontradas em:
bacias sedimentares, intrusões e coberturas
residuais de plataforma; cinturões orogênicos e
núcleos cristalinos arqueados.
LUÍS, J. A. Geografia: leituras e interação. São Paulo. Leya, 2013.
Considerando a distribuição das unidades de
planalto no território brasileiro, assinale a
alternativa que indica a região com maior
presença dessas formações de relevo.',
  '[{"id": "a", "texto": "Região Norte, devido às extensas bacias sedimentares amazônicas."}, {"id": "b", "texto": "Região Sul, pela predominância de terrenos cristalinos e intrusões magmáticas."}, {"id": "c", "texto": "Região Sudeste, devido à combinação de cinturões orogênicos e planaltos cristalinos."}, {"id": "d", "texto": "Região Nordeste, em função da ocorrência de planaltos residuais e formações semiáridas."}, {"id": "e", "texto": "Região Centro-Oeste, por concentrar grandes áreas de depressões sedimentares."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2026.1 - Ampla Concorrência',
  '2026.1-ampla', 'FACAPE 2026.1 - Ampla Concorrência', 2026, 1,
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
