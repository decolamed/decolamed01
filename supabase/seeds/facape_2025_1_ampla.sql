-- ============================================================================
-- DECOLA MED — SEED: FACAPE 2025.1 - Ampla Concorrência
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
  'Português', null, 'https://monitordomercado.com.br/
Na manchete acima, ocorre um desvio da norma
culta no que se refere à:',
  '[{"id": "a", "texto": "acentuação gráfica."}, {"id": "b", "texto": "regência verbal."}, {"id": "c", "texto": "regência nominal."}, {"id": "d", "texto": "concordância nominal."}, {"id": "e", "texto": "concordância verbal."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 1, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q01-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Português', null, '“A saúde mental não se limita apenas ao que
sentimos individualmente. Ela é uma rede de
fatores relacionados. De acordo com a
Organização Mundial de Saúde (OMS), a Saúde
Mental pode ser considerada um estado de bem-estar vivido pelo indivíduo, que possibilita o
desenvolvimento de suas habilidades pessoais
para responder aos desafios da vida e contribuir
com a comunidade.
O bem-estar de uma pessoa não depende
apenas do aspecto psicológico e emocional, mas
também de condições fundamentais, como
saúde física, apoio social, condições de vida.
Além dos aspectos individuais, a saúde mental é
também determinada pelos aspectos sociais,
ambientais e econômicos.
A saúde mental não é algo isolado, é também
influenciada pelo ambiente ao nosso redor. Isso
significa que se deve considerar que a saúde
mental resulta da interação de fatores biológicos,
psicológicos e sociais. Pode-se afirmar que a
saúde mental tem características
biopsicossociais.
Entender a saúde mental como algo que envolve
o corpo, as emoções e a forma como interagimos
ajuda a ver que todos têm um papel importante
em cuidar do bem-estar de todos, cuidando de
nós mesmos e apoiando uns aos outros.”
Disponível em: https://www.gov.br (adaptado)
Sobre o texto, é CORRETO afirmar que:',
  '[{"id": "a", "texto": "no segundo parágrafo, as palavras sublinhadas exercem, do ponto de vista morfológico, a função de substantivo."}, {"id": "b", "texto": "a boa saúde mental depende de condicionamentos e esforços físicos e de práticas esportivas."}, {"id": "c", "texto": "na passagem “...que possibilita o desenvolvimento de suas habilidades pessoais para responder aos desafios da vida e contribuir com a comunidade.”, o termo sublinhado exerce, do ponto de vista sintático, a função de adjunto adnominal."}, {"id": "d", "texto": "se configura como uma narrativa que tem a intenção de exemplificar uma visão subjetiva do autor."}, {"id": "e", "texto": "o último parágrafo orienta como os médicos podem cuidar da sua própria saúde mental."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 2, null, false,
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
  'Português', null, 'A Rua
“Bem sei que, muitas vezes,
o único remédio
é adiar tudo. É adiar a sede, a fome, a viagem,
a dívida, o divertimento,
o pedido de emprego, ou a própria alegria.
A esperança é também uma forma
de contínuo adiamento.
Sei que é preciso prestigiar a esperança,
numa sala de espera.
Mas sei também que espera significa luta e não,
[apenas,
esperança sentada.
Não abdicação diante da vida
A esperança
nunca é a forma burguesa, sentada e tranquila
da
[espera.
Nunca é a figura de mulher
do quadro antigo.
Sentada, dando milho aos pombos.”
Cassiano Ricardo
Nesse poema, Cassiano Ricardo:',
  '[{"id": "a", "texto": "satiriza o tradicionalismo da época visto que restringe o poder da criação artística."}, {"id": "b", "texto": "valoriza a política da época, propondo que haja uma sociedade mais solidária."}, {"id": "c", "texto": "através dos versos “A esperança é também uma forma/de contínuo adiamento.”, aponta as falcatruas da classe política da época."}, {"id": "d", "texto": "faz uma crítica social e política, estabelecendo uma relação entre o homem e sua época."}, {"id": "e", "texto": "relata os momentos dificílimos da época, provocados pelos horrores da Segunda Guerra Mundial."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 3, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q03-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.1-ampla-q03-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'Português', null, 'https://website.cfo.org.br
Sobre a campanha, acima, veiculada para
divulgar o “Dia Mundial de Prevenção ao
Suicídio”, considere as afirmativas a seguir.
I. O coesivo “SE” inicia uma oração que
expressa valor semântico de condição.
II. A forma verbal “PEÇA” foi empregada no
modo subjuntivo.
III. O vocábulo “AJUDA”, em negrito, e as mãos
estendidas fortalecem o pedido de
acolhimento das pessoas com pensamentos e
sentimentos de querer acabar com a própria
vida.
IV. Na frase “Mês de prevenção ao suicídio”, que
introduz a campanha, a palavra sublinhada é
acentuada porque é paroxítona terminada em
“o”.
Dentre as afirmativas acima, está CORRETA
apenas:',
  '[{"id": "a", "texto": "I e IV."}, {"id": "b", "texto": "III e IV."}, {"id": "c", "texto": "I, II e III."}, {"id": "d", "texto": "II, III e IV."}, {"id": "e", "texto": "I e III."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 4, null, false,
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
  'Português', null, '“Foi nos bailes da vida ou num bar
Em troca de pão
Que muita gente boa pôs o pé na profissão
De tocar um instrumento e de cantar
Não importando se quem pagou quis ouvir
Foi assim
Cantar era buscar o caminho
Que vai dar no sol
Tenho comigo as lembranças do que eu era
Para cantar nada era longe tudo tão bom
Até a estrada de terra na boleia de caminhão
Era assim
Com a roupa encharcada, a alma
Repleta de chão
Todo artista tem de ir aonde o povo está
Se foi assim, assim será
Cantando me disfarço e não me canso
De viver nem de cantar
.........................................................................”
Sobre o uso dos recursos linguísticos nas
estrofes de Fernando Brant e Milton Nascimento,
assinale a alternativa CORRETA.',
  '[{"id": "a", "texto": "No verso “Que muita gente boa pôs o pé na profissão”, a palavra “muita” expressa valor circunstancial de intensidade."}, {"id": "b", "texto": "Nos versos “Não importando se quem pagou quis ouvir/Foi assim”, a palavra sublinhada é um elemento de referência proporcional."}, {"id": "c", "texto": "No verso “Tenho comigo as lembranças do que eu era”, a forma verbal destacada exprime uma ação totalmente concluída."}, {"id": "d", "texto": "Nos versos “Cantando me disfarço e não me canso/De viver nem de cantar”, a oração reduzida de gerúndio sublinhada expressa valor semântico de tempo."}, {"id": "e", "texto": "Nos versos “Com a roupa encharcada, a alma/Repleta de chão”, a expressão sublinhada completa a significação do nome “Repleta”."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Português', null, '“O mês de agosto é dedicado ao incentivo do
aleitamento materno, reforçando os benefícios da
amamentação para a mãe e para o bebê. O leite
materno é considerado o alimento padrão ouro
para os bebês, porque contém tudo que a
criança precisa até os 6 meses.
De acordo com a Organização Mundial da Saúde
(OMS) e o Fundo das Nações Unidas para a
Infância (Unicef), por ano, cerca de seis milhões
de vidas são salvas por causa do aumento das
taxas de amamentação exclusiva até o sexto mês
de idade. É nele que estão contidas todas as
proteínas, vitaminas, gorduras, água e os
nutrientes necessários para o saudável
desenvolvimento dos bebês.
O leite materno contém componentes
imunológicos que conferem ao bebê a condição
de desenvolver seu sistema imune da melhor
forma. Nesse sentido, os benefícios do
aleitamento materno refletem até na vida adulta.
A quantidade e qualidade da proteína do leite
humano são perfeitamente adequadas ao
metabolismo e desenvolvimento dos bebês. A
proporção da substância não sobrecarrega a
função renal, favorece a digestibilidade e
promove o crescimento dos recém-nascidos.”
Disponível em: https://www.gov.br/ (adaptado)
Assinale a alternativa em que se faz um
comentário INCORRETO acerca dos recursos
coesivos empregados no texto.',
  '[{"id": "a", "texto": "A oração sublinhada em “O mês de agosto é dedicado ao incentivo do aleitamento materno, reforçando os benefícios da amamentação para a mãe e para o bebê.” retoma o antecedente “incentivo do aleitamento materno”."}, {"id": "b", "texto": "O coesivo sublinhado em “De acordo com a Organização Mundial da Saúde (OMS) e o Fundo das Nações Unidas para a Infância (Unicef), por ano, cerca de seis milhões de vidas são salvas por causa do aumento das taxas de amamentação exclusiva até o sexto mês de idade.” introduz uma articulação com valor de causa."}, {"id": "c", "texto": "O coesivo “que” em “O leite materno contém componentes imunológicos que conferem ao bebê a condição de desenvolver seu sistema imune da melhor forma.” inicia uma oração de natureza adjetiva."}, {"id": "d", "texto": "Visando manter o sentido original do contexto, a expressão destacada em “Nesse sentido, os benefícios do aleitamento materno refletem até na vida adulta.” poderia ser substituída por dessa maneira."}, {"id": "e", "texto": "O coesivo que inicia a oração sublinhada em “A quantidade e qualidade da proteína do leite humano são perfeitamente adequadas ao metabolismo e desenvolvimento dos bebês. A proporção da substância não sobrecarrega a função renal, favorece a digestibilidade e promove o crescimento dos recém-nascidos.” aponta um valor de acréscimo."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Português', null, 'Eu Acredito
“Aprendi que fazendo um gesto de solidariedade
À impunidade não tem vencedores
E posso ser a única a trabalhar em um projeto
Mas se eu acreditar, terei apoio de muitos
Se eu fizer a minha parte.
Cada um de uma maneira simples fará a sua.
E se eu desejar mudar a história nunca estarei
sozinha
E se eu tiver a humildade de pedir ajuda
Milhares vêm ao meu auxílio
Podemos juntos acreditar em dias melhores, em
pessoas melhores.
E juntos construir um mundo melhor
Sou sonhadora?
Não, faço parte desse mundo que vivo.
E desejo ele cada dia melhor
Meus filhos fazem parte dele
E quem sabe contar a história para meus netos
que nós mudamos
Porque aprendemos a trabalhar juntos
Para a construção de uma vida melhor
Uma vida mais digna, mais humana e mais
solidária.”
Tereza Cristina Saraiva
O poema de Teresa Cristina Saraiva se evidencia
pela:',
  '[{"id": "a", "texto": "ênfase no emprego da metáfora exemplificado pelo verso “Podemos juntos acreditar em dias melhores, em pessoas melhores.”."}, {"id": "b", "texto": "ênfase no emprego da metonímia para atribuir uma ideia de genialidade à obra da autora."}, {"id": "c", "texto": "ênfase no emprego da função emotiva da linguagem em toda a estrutura do poema."}, {"id": "d", "texto": "ênfase no emprego da função metalinguística da linguagem através do verso “E quem sabe contar a história para meus netos que nós mudamos”."}, {"id": "e", "texto": "ênfase no emprego da prosopopeia com o objetivo de ressaltar a importância da poesia que valoriza um gesto de solidariedade."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 7, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q07-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Inglês', null, 'Responda à pergunta abaixo de acordo com a
tirinha acima.
Por que Barlow interrompeu a corrida e decidiu
voltar até Crock?',
  '[{"id": "a", "texto": "Para tomar emprestado um meio de transporte."}, {"id": "b", "texto": "Porque não entendeu o local para o qual foi mandado."}, {"id": "c", "texto": "Porque esqueceu de pegar alguns documentos."}, {"id": "d", "texto": "Para perguntar o significado da palavra ‘expeditious’."}, {"id": "e", "texto": "Para pedir dinheiro para cumprir a missão encomendada a ele."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 11, 'ingles', false,
  '[{"url": "/questoes-facape/2025.1-ampla-q11-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.1-ampla-q11-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'Inglês', null, 'De acordo com a tirinha ao lado, qual o
significado da palavra ‘expeditious’?',
  '[{"id": "a", "texto": "Ferozmente."}, {"id": "b", "texto": "Prontamente."}, {"id": "c", "texto": "Amigavelmente."}, {"id": "d", "texto": "Lentamente."}, {"id": "e", "texto": "Distraidamente."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 12, 'ingles', false,
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
  'Inglês', null, '“Compared to people living only a few
generations ago, we have enormously greater
opportunities to have a good time, yet there is no
indication that we actually enjoy life more than
our ancestors did.”
https://www.goodreads.com/author/qu
otes/274.Mih_ly_Cs_kszentmih_lyi?pag
e=3
Segundo o ditado acima:',
  '[{"id": "a", "texto": "Hoje em dia as pessoas se divertem mais do que as gerações anteriores."}, {"id": "b", "texto": "Há muita evidência de que as pessoas curtem mais a vida atualmente por causa de grandes oportunidades."}, {"id": "c", "texto": "Não há indicadores de que as pessoas hoje são mais felizes do que nossos ancestrais."}, {"id": "d", "texto": "Tanto a geração anterior quanto a atual igualam-se no aspecto da felicidade."}, {"id": "e", "texto": "O autor afirma que não se pode comparar uma geração a outra por não haver parâmetros para tal mister."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Inglês', null, 'Na linha 3 do texto da questão 13, a palavra ‘yet’
é:',
  '[{"id": "a", "texto": "um numeral."}, {"id": "b", "texto": "uma conjunção."}, {"id": "c", "texto": "uma interjeição."}, {"id": "d", "texto": "um substantivo."}, {"id": "e", "texto": "um pronome pessoal do caso reto."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Inglês', null, 'Escolha a alternativa CORRETA quanto ao tempo
verbal em relação a seguinte frase:
How does walking improve your health and
longevity?',
  '[{"id": "a", "texto": "Presente do indicativo."}, {"id": "b", "texto": "Pretérito perfeito."}, {"id": "c", "texto": "Futuro do presente."}, {"id": "d", "texto": "Futuro do pretérito."}, {"id": "e", "texto": "Pretérito mais-que-perfeito. TEXTO PARA AS QUESTÕES 11 A 15 Trucos de WhatsApp sencillos y prácticos que probablemente no conocías • Hacer una copia de los chats de WhatsApp y enviarlos por correo electrónico: primero, se debe abrir los ajustes de la aplicación y hacer clic en la sección de \"Chats\". Desde allí, seleccionar \"Ajustes de chat\" y luego \"Historial de chats\". Eligir la opción \"Exportar chat\", donde se podrá seleccionar el chat individual o grupal que deseas guardar. Se puede optar por incluir únicamente el texto o también los archivos multimedia que estén adjuntos. En cuestión de segundos, dependiendo del tamaño del chat, se abrirá una pantalla donde podrás escoger cómo quieres enviar el archivo. • Unirse a un grupo mediante un código QR: para sumarte a un grupo a través de esta función, el administrador del grupo debe generar un código QR. Este código está disponible en la sección de ajustes del grupo en la aplicación. Una vez que tengas el código, solo se deberá escanear con el celular y te unirás al grupo de manera instantánea. • Salir de un grupo en WhatsApp sin hacer una salida visible: en lugar de abandonar el grupo, se puede silenciar permanentemente. Para hacerlo, se debe acceder a la información del grupo y seleccionar la opción de silenciar notificaciones para siempre. Luego, archiva el chat para que desaparezca de la lista de conversaciones. Con esta opción, ya no se recibirán notificaciones de nuevos mensajes y el grupo quedará oculto en la lista de chats archivados. • Enviar un mismo mensaje a varias personas al mismo tiempo: para esto se puede utilizar la lista de difusión, la cual permite enviar mensajes a múltiples contactos sin que ellos vean a los demás destinatarios, y manteniendo el chat en forma individual. En iPhone, accede a esta función desde la configuración de la aplicación, mientras que en Android se puede encontrar tocando los tres puntos en la parte superior de la pantalla. Disponível em: https://www.clarin.com/tecnologia/trucos-whatsapp-sencillos-practicos-probablemente conocias_0_ySXwyp1N44.html#google_vign ette. Acesso em: 10 ago. 2024."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 15, 'ingles', false,
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
  'Espanhol', null, 'De acordo com o texto qual é a opção CORRETA
para enviar um chat de WhatsApp por e-mail?',
  '[{"id": "a", "texto": "Ir para \"Ajustes\" e selecionar \"Exportar chat\" na seção \"Contatos\"."}, {"id": "b", "texto": "Abrir o chat e tocar em \"Compartilhar\" para enviar por e-mail."}, {"id": "c", "texto": "Acessar \"Ajustes de chat\", selecionar \"Histórico de chats\" e escolher \"Exportar chat\"."}, {"id": "d", "texto": "Utilizar o menu de opções do grupo e escolher \"Enviar por e-mail\"."}, {"id": "e", "texto": "Escolher \"Exportar chat\" diretamente na tela principal do WhatsApp."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 11, 'espanhol', false,
  '[{"url": "/questoes-facape/2025.1-ampla-q11-3.png", "legenda": null, "ordem": 3}, {"url": "/questoes-facape/2025.1-ampla-q11-4.png", "legenda": null, "ordem": 4}]'::jsonb, true
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
  'Espanhol', null, 'Qual é o método descrito no texto para sair de
um grupo do WhatsApp sem que sua saída seja
visível?',
  '[{"id": "a", "texto": "Deletar o grupo da lista de chats."}, {"id": "b", "texto": "Silenciar as notificações permanentemente e arquivar o chat."}, {"id": "c", "texto": "Bloquear o administrador do grupo."}, {"id": "d", "texto": "Deixar o grupo e não participar de novas conversas."}, {"id": "e", "texto": "Silenciar as notificações por 1 semana e depois sair."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 12, 'espanhol', false,
  '[{"url": "/questoes-facape/2025.1-ampla-q12-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Espanhol', null, 'Se substituirmos o tempo verbal do verbo deber
do futuro do presente para o condicional
simples na frase: "Una vez que tengas el código,
solo se deberá escanear con el celular."
Como ficaria a escrita CORRETA no novo tempo
proposto?',
  '[{"id": "a", "texto": "debe."}, {"id": "b", "texto": "debió."}, {"id": "c", "texto": "debería."}, {"id": "d", "texto": "deber."}, {"id": "e", "texto": "deberías."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 13, 'espanhol', false,
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
  'Espanhol', null, 'Qual alternativa apresenta a tradução para a
palavra pantalla utilizada no texto na dica “Envie
a mesma mensagem para várias pessoas ao
mesmo tempo”?',
  '[{"id": "a", "texto": "tela."}, {"id": "b", "texto": "mural."}, {"id": "c", "texto": "celular."}, {"id": "d", "texto": "botão."}, {"id": "e", "texto": "clique."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Espanhol', null, 'A palavra sencillos no título no texto se traduz
como:',
  '[{"id": "a", "texto": "sensíveis."}, {"id": "b", "texto": "úteis."}, {"id": "c", "texto": "práticos."}, {"id": "d", "texto": "legais."}, {"id": "e", "texto": "simples."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Matemática', null, 'Para a realização de uma palestra foi feito o
levantamento de auditórios que pudessem
comportar o número de pessoas previstas pela
organização do evento. O auditório escolhido
tinha as cadeiras dispostas em 15 linhas, no
formato aproximado de um triângulo, com 8
cadeiras na primeira linha. Sabendo que a partir
da segunda linha de cadeiras até a última, o
número de cadeiras por linha vai aumentando
sempre a mesma quantidade com relação ao
número da linha anterior, e que na décima linha
há 35 cadeiras, pode–se concluir que a
quantidade total de cadeiras que contém nesse
auditório é igual a:',
  '[{"id": "a", "texto": "120"}, {"id": "b", "texto": "280"}, {"id": "c", "texto": "315"}, {"id": "d", "texto": "435"}, {"id": "e", "texto": "525"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 16, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q16-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'Uma farmácia adquiriu um lote com 10 caixas de
um medicamento para comercialização. Ao
vender todas as caixas por um total de R$
1.748,00, verificou com isso que obteve um lucro
de 15% sobre o valor da compra. Conclui–se,
portanto, que o valor de compra de cada uma
das caixas desse medicamento foi igual a:',
  '[{"id": "a", "texto": "R$ 148,58"}, {"id": "b", "texto": "R$ 152,00"}, {"id": "c", "texto": "R$ 162,00"}, {"id": "d", "texto": "R$ 163,30"}, {"id": "e", "texto": "R$ 262,20"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 17, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q17-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'O rótulo de um medicamento indica que seu
conteúdo é de 35 mL (mililitros). Diariamente um
paciente deve ingerir um sétimo desse conteúdo.
Assim, após 5 dias ingerindo o medicamento
conforme o que foi prescrito, a quantidade do
medicamento que ainda resta na embalagem,
convertida em L (litros), é igual a:',
  '[{"id": "a", "texto": "0,001"}, {"id": "b", "texto": "0,01"}, {"id": "c", "texto": "0,025"}, {"id": "d", "texto": "10"}, {"id": "e", "texto": "25"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 18, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q18-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.1-ampla-q18-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-ampla-q18-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Matemática', null, 'Um grupo de 10 estudantes do curso de
medicina vai enviar 3 de seus componentes para
a apresentação de um trabalho em um
congresso. A probabilidade de o grupo
composto por Maria, José e João ser o grupo
enviado para essa apresentação, dentre todos os
grupos possíveis é (considere que não há mais
de um estudante com o mesmo nome):',
  '[{"id": "a", "texto": ""}, {"id": "b", "texto": ""}, {"id": "c", "texto": ""}, {"id": "d", "texto": ""}, {"id": "e", "texto": ""}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 19, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q19-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.1-ampla-q19-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Matemática', null, 'Um tubo de ensaio possui o formato cilíndrico
com diâmetro interno da base igual a 4 cm e
altura 10 cm. Em determinado momento foi
colocado um líquido nesse tubo de ensaio e,
para evitar o seu derramamento, o líquido
ocupou apenas 80% da altura total do tubo.
Assim, a quantidade de litros que continha no
tubo de ensaio naquele momento era (considere
π = 3):',
  '[{"id": "a", "texto": "0,096"}, {"id": "b", "texto": "0,960"}, {"id": "c", "texto": "0,048"}, {"id": "d", "texto": "0,024"}, {"id": "e", "texto": "0,120 FÍSICA"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 20, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q20-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-ampla-q20-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Física', null, 'Considere um corpo em queda livre sujeito à
aceleração da gravidade. Ao passar pelo ponto A
sua velocidade é de 5𝑚/𝑠 e ao passar pelo ponto
B é de 15𝑚/𝑠. Qual A distância entre os pontos
𝐴 e 𝐵 ? (Dado 𝑔 = 10 𝑚 𝑠
2 ⁄ )',
  '[{"id": "a", "texto": "5𝑚"}, {"id": "b", "texto": "10𝑚"}, {"id": "c", "texto": "15𝑚"}, {"id": "d", "texto": "20𝑚"}, {"id": "e", "texto": "25𝑚"}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 21, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q21-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Sabendo-se que a massa do corpo A é 12𝑘𝑔 ,
do corpo 𝐵 é 8𝑘𝑔 e do corpo 𝐶 é 20𝑘𝑔 ,
determine a força que o corpo A exerce no
corpo 𝐵. Considere o atrito desprezível e a polia
e o fio ideias, determine a força que o corpo 𝐴
exerce no corpo 𝐵. (Dados: sin 𝜃 = 0,6, cos 𝜃 =
0,8 e 𝑔 = 10 𝑚 𝑠
2 ⁄ )',
  '[{"id": "a", "texto": "4 𝑁"}, {"id": "b", "texto": "8 𝑁"}, {"id": "c", "texto": "16 𝑁"}, {"id": "d", "texto": "32 𝑁"}, {"id": "e", "texto": "64 𝑁"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 22, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q22-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'As frentes de ondas planas mudam de direção
ao atravessar meios com índice de refração
diferentes, conforme ilustrado na figura.
Sabendo-se que a velocidade de propagação no
meio 2 é de 87 𝑚/𝑠, determine sua velocidade
de propagação no meio 1. (Dados: sin 30° = 0,50
e sin 60° = 0,87)',
  '[{"id": "a", "texto": "50 𝑚/𝑠"}, {"id": "b", "texto": "76 𝑚/𝑠"}, {"id": "c", "texto": "87 𝑚/𝑠"}, {"id": "d", "texto": "142 𝑚/𝑠"}, {"id": "e", "texto": "151 𝑚/𝑠"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 23, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q23-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.1-ampla-q23-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-ampla-q23-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Física', null, 'Um aluno apresenta hipermetropia, uma
condição ocular que dificulta a visão de objetos
próximos, fazendo com que ele só consiga ler
textos que estejam a uma distância mínima de
2 𝑚. Para que ele possa ler confortavelmente um
texto colocado a uma distância de 40 𝑐𝑚 de seus
olhos, é necessário o uso de lentes corretivas.
Qual deve ser a distância focal dessas lentes
corretivas para corrigir sua visão e permitir que
ele leia o texto a 40 𝑐𝑚 de distância?',
  '[{"id": "a", "texto": "20 𝑐𝑚"}, {"id": "b", "texto": "30 𝑐𝑚"}, {"id": "c", "texto": "40 𝑐𝑚"}, {"id": "d", "texto": "50 𝑐𝑚"}, {"id": "e", "texto": "60 𝑐𝑚"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 24, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q24-full1.png", "legenda": null, "ordem": 91}]'::jsonb, true
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
  'Física', null, 'Dado um circuito formado por dois resistores 𝑅1
e 𝑅2, ambos com 10,0 𝛺 de resistência elétrica,
uma bateria de 120 𝑉, um capacitor de 10−5 𝐹 e
um amperímetro, conforme a figura.
Considerando que o capacitor está totalmente
carregado, calcule a carga elétrica armazenada
no capacitor.',
  '[{"id": "a", "texto": "60𝜇𝐶"}, {"id": "b", "texto": "120𝜇𝐶"}, {"id": "c", "texto": "600𝜇𝐶"}, {"id": "d", "texto": "700𝜇𝐶"}, {"id": "e", "texto": "1200𝜇𝐶 QUÍMICA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 25, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q25-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-ampla-q25-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'Pesquisadores da Universidade de Berkeley
encontraram chumbo e cádmio em diversas
marcas "campeãs de venda" de absorventes.
Porém, ainda não se sabe qual é o risco real de
contaminação do corpo humano através desses
produtos. Os efeitos de metais pesados na saúde
já são bem documentados pela ciência e incluem
danos aos sistemas cardiovascular, nervoso e
endócrino; ao fígado, rins e cérebro; bem como
maior risco de desenvolver demência, câncer,
diabetes e infertilidade, e de comprometer a
saúde de gestantes e seus fetos.
Disponível em:
https://www.terra.com.br/noticias/estudo-acha-metais-toxicos-em-absorventes-internos,345636bf154f5e441e8c3d87b96162
aaj66t52fa.html?utm_source=clipboard
Acesso em 12.08.2024.
De acordo com o texto e sabendo–se que os
absorventes também contêm ftalatos, compostos
orgânicos voláteis, parabenos, fenóis ambientais,
fragrâncias, dioxinas e compostos semelhantes a
dioxinas é CORRETO afirmar que:
Dados: Pb (Z = 82) e Cd (Z = 48)',
  '[{"id": "a", "texto": "o cádmio é um elemento representativo."}, {"id": "b", "texto": "o raio atômico do cádmio é maior que o do chumbo."}, {"id": "c", "texto": "os compostos orgânicos voláteis interagem, de maneira geral, por meio de ligações dipolo–induzido – dipolo–permanente."}, {"id": "d", "texto": "as dioxinas são contaminantes persistentes que podem ser encontrados na água, no solo contaminado e no ar."}, {"id": "e", "texto": "devido à presença de grupos OH em sua estrutura, os fenóis apresentam leve caráter alcalino."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 26, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q26-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-ampla-q26-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'A Porsche deu um passo audacioso rumo ao futuro
ao abrir a primeira fábrica comercial de gasolina
sintética, chamada e–Fuel, no Chile. Este
combustível inovador é produzido sem petróleo,
utilizando apenas vento e água, e promete
revolucionar a indústria automobilística global. A
produção da gasolina sintética é um processo
inovador. Utilizando eletrolisadores, a água é
dividida em oxigênio e hidrogênio com a ajuda
de energia eólica, representada na figura
abaixo.
Disponível em:
https://rce.casadasciencias.org/rceapp/art/2022/025/
O dióxido de carbono capturado da atmosfera é
então filtrado e combinado com o hidrogênio para
produzir metanol sintético, que é posteriormente
convertido em e–Fuel. Este método garante que o
combustível seja sustentável e contribua para a
redução das emissões de carbono.
https://clickpetroleoegas.com.b
r/ Acesso em 12.08.2024.
De acordo com as informações do texto e sobre
os fenômenos e as substâncias envolvidas,
assinale a alternativa CORRETA.
Dados: 47Ag (11), 6C (14), 7N (15), 8O (16) e 1H (1)',
  '[{"id": "a", "texto": "Na eletrólise aquosa do AgNO3 o pH da solução formada, na cuba eletrolítica, deve ser menor que sete."}, {"id": "b", "texto": "A equação de produção do combustível pode ser representada simplificadamente por: 2CO2 + 3H2 → C2H6O"}, {"id": "c", "texto": "A destilação fracionada é um processo químico de separação dos componentes do petróleo."}, {"id": "d", "texto": "O dióxido de carbono é uma molécula apolar de geometria angular."}, {"id": "e", "texto": "O metanol, em condições adequadas, sofre redução produzindo metanal."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 27, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q27-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.1-ampla-q27-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-ampla-q27-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'O plástico é um dos grandes problemas
ambientais, mas o brasileiro segue no páreo para
encontrar soluções inovadoras para ele.
Pesquisadores do Instituto de Pesquisa em
Bioenergia, da Unesp de Rio Claro (SP), criaram
um bioplástico a partir de folhas de bananeira e
bagaço de cana–de–açúcar e de goiaba.
O bioplástico criado pelos pesquisadores da
Unesp soluciona uma das grandes questões do
material: a decomposição ocorre de 3 a 30 dias.
A diferença é grande: plásticos convencionais
levam de 90 a 700 anos para desaparecer por
completo.
Disponível em:
https://www.uol.com.br/tilt/noticias/red
acao/2024/07/18/brasileiros-criam-plastico-de-cana-e-bananeira-e-que-se-decompoe-em-30-
dias.htm?cmpid=copiaecola Acesso
em 12.08.2024.
Sobre o assunto abordado no texto relacionado
com conhecimentos de química pode–se afirmar
que:',
  '[{"id": "a", "texto": "os plásticos são derivados diretos do petróleo."}, {"id": "b", "texto": "o etanol de segunda geração é produzido da palha e do bagaço da cana–de–açúcar."}, {"id": "c", "texto": "os polímeros estão completamente dissociados dos plásticos."}, {"id": "d", "texto": "o etileno, monômero do polietileno, apresenta cadeia normal e saturada."}, {"id": "e", "texto": "a folha de bananeira é rica em antioxidantes, substâncias que recebem elétrons."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 28, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q28-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-ampla-q28-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'Organismos fotossintéticos, como plantas,
plâncton e algas, usam a luz solar para produzir
oxigênio que se desloca para as profundezas
do oceano, mas estudos anteriores realizados
no mar profundo mostraram que o oxigênio é
apenas consumido, não produzido, pelos
organismos que vivem lá, disse o cientista
Andrew Sweetman que fez a observação
inesperada de que oxigênio “negro” estava
sendo produzido no fundo do mar enquanto
avaliava a biodiversidade marinha em uma área
destinada à mineração de nódulos polimetálicos
do tamanho de batatas.
Os nódulos se formam ao longo de milhões de
anos através de processos químicos que fazem
com que os metais precipitem da água ao redor
de fragmentos de conchas, bicos de lula
e dentes de tubarão, cobrindo uma área
surpreendentemente grande do fundo do mar.
Disponível em:
https://www.cnnbrasil.com.br/tecno
logia/cientistas-descobrem-oxigenio-negro-sendo-produzido-no-fundo-do-oceano/ Acesso em
12.08.2024.
Dados: 20Ca (2), 6C (14), 15P (15), 8O (16) e 1H (1)
Das substâncias citadas no texto está CORRETO
afirmar que:',
  '[{"id": "a", "texto": "o oxigênio negro é uma forma alotrópica do oxigênio existente no ar atmosférico."}, {"id": "b", "texto": "a reação de produção de oxigênio por meio dos organismos fotossintéticos é exotérmica."}, {"id": "c", "texto": "a reação de fissão nuclear é um processo químico."}, {"id": "d", "texto": "os dentes dos tubarões têm esmalte composto por fluorapatite, um mineral muito duro representado por Ca10(PO4)6(OH)2."}, {"id": "e", "texto": "O carbonato de cálcio, constituinte principal da composição química das conchas, é um sal de hidrólise básica."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 29, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q29-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-ampla-q29-full2.png", "legenda": null, "ordem": 92}]'::jsonb, true
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
  'Química', null, 'Pesquisadores descobriram uma forma de
produzir combustível de hidrogênio com água do
mar, pó de café e alumínio. De acordo com a
equipe, a invenção poderia ser usada para
alimentar motores ou células de combustível em
embarcações que sugam a água do mar,
produzindo o combustível sob demanda no
próprio veículo. Os cientistas se basearam na
reação química entre oxigênio e alumínio: ao
entrar em contato com a água, o alumínio retira
dela o oxigênio, deixando apenas o hidrogênio
para trás.
A equipe usou pellets de alumínio, que são mais
fáceis de trabalhar graças à sua estabilidade.
Conforme descrito na Cell Reports Physical
Science, um único pellet de alumínio de 0,3g
gerou 400mL de hidrogênio em cinco minutos ao
ser colocado em água fresca deionizada. Um dos
problemas encontrados pela equipe foi o
acúmulo de óxido de alumínio na superfície do
metal, bloqueando parte da interação com o
oxigênio. Isso foi resolvido com uma liga feita de
gálio e índio, capaz de quebrar o óxido e permitir
que a reação dure por mais tempo.
Disponível em:
https://olhardigital.com.br/2024/07/26
/ciencia-e-espaco/cientistas-criam-combustivel-de-hidrogenio-com-agua-do-mar-e-po-de-cafe/ Acesso
em 12.08.2024.
Dados: Considere a densidade do H = 0,09g/L.
Ga (Z = 31) e In (Z = 49)
T.F. (Ga) = 29,76°C
Considerando as informações do texto,
condições ambientais e conhecimentos sobre os
elementos envolvidos, assinale a alternativa
CORRETA.',
  '[{"id": "a", "texto": "A reação entre oxigênio e alumínio é de deslocamento."}, {"id": "b", "texto": "A estimativa é de que 1g de pellets de alumínio poderia gerar 0,12mg de hidrogênio no mesmo espaço de tempo."}, {"id": "c", "texto": "O acúmulo de óxido de alumínio na superfície do metal é conhecido como passivação que protege o material contra a corrosão mais profunda."}, {"id": "d", "texto": "O índio e o gálio apresentam três elétrons no subnível mais energético."}, {"id": "e", "texto": "O gálio é um metal que não sofre fusão na palma da mão. BIOLOGIA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 30, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q30-full1.png", "legenda": null, "ordem": 91}, {"url": "/questoes-facape/2025.1-ampla-q30-full2.png", "legenda": null, "ordem": 92}, {"url": "/questoes-facape/2025.1-ampla-q30-full3.png", "legenda": null, "ordem": 93}]'::jsonb, true
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
  'Biologia', null, 'O Sistema digestório é formado por órgãos
especiais que desenvolvem funções relevantes
para o metabolismo celular. Cada célula que
reveste o trato gastrintestinal é, portanto, exposta
ao alimento, aos produtos da digestão
absorvíveis e aos produtos da decomposição
metabólica.
Dentro das funções desenvolvidas pelo trato
gastrointestinal NÃO se pode incluir:',
  '[{"id": "a", "texto": "Mobilidade, que se refere aos processos de ingestão, mastigação, deglutição e peristaltismo."}, {"id": "b", "texto": "Secreção, que se refere ao processo de produção de alguns líquidos e hormônios."}, {"id": "c", "texto": "Digestão, que se refere ao processo da quebra das moléculas alimentares em partículas menores."}, {"id": "d", "texto": "Absorção, que se refere ao processo de absorvência e passagem dos produtos digeridos para a corrente sanguínea."}, {"id": "e", "texto": "Regulação, refere-se à independência das funções de digestão e absorção na relação extrínseca com o sistema nervoso autônomo."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Biologia', null, 'A aroeira popularmente conhecida como
Aroeira-do-Sertão e Aroeira Preta, Myracrodruon
urundeuva Allemão, “é uma das plantas mais
usadas na medicina popular no nordeste do
Brasil como anti-inflamatória, cicatrizante e
antiúlcera” (Rao; Viana; Menezes; Gadelha, 1987;
Pereira et al., 2014). Esta planta encontra-se em
via de extinção, devido ao modo incorreto da
coleta de material para o uso medicinal, uma vez
que é o material mais utilizado está na retirada
da entrecasca da planta. Sobre isso, pode-se
afirmar que:',
  '[{"id": "a", "texto": "O transporte e a distribuição dos sais minerais liberados pelos vasos crivados, são afetados, de forma direta, causando a morte desses vegetais, levando-os a extinção."}, {"id": "b", "texto": "O transporte e a distribuição de elementos nutritivos, principalmente açúcares, são afetados, causando, a morte desses vegetais, levando-os a extinção."}, {"id": "c", "texto": "O xilema também denominado vaso liberiano é atingido, causando a morte desse vegetal, levando-o a extinção."}, {"id": "d", "texto": "O floema ou vaso crivado sendo rico em água e sais minerais, são atingidos, causando assim a desidratação e consequentemente a morte da planta."}, {"id": "e", "texto": "O transporte e distribuição de açúcares realizados pelo xilema é atingido, causando a morte desse vegetal, levando-o à extinção."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Biologia', null, 'O processo do ciclo e divisão celular é de suma
importância para a realização da Duplicação do
DNA (Ácido desoxirribonucleico). Durante esse
processo as células filhas recebem o material
genético idêntico ao da célula mãe, ou seja,
recebem uma cópia fiel. Ainda, durante o
processo as organelas também são duplicadas, a
fim de desenvolverem as respectivas funções.
Antecedendo todo esse processo divisório,
pode-se citar as suas etapas com as suas
transformações, respectivamente:',
  '[{"id": "a", "texto": "G1 – antecede a fase S, ocorre a diminuição das atividades metabólicas, S – aumento do metabolismo cromossômico; G2 – ocorre a síntese proteica."}, {"id": "b", "texto": "G1 – diminuição do metabolismo celular; S – duplicação do material genético e dos centríolos; G2 – diminuição do metabolismo cromossômico e separação das organelas."}, {"id": "c", "texto": "G1 – diminuição das atividades metabólicas; S – duplicação do centríolo; G2 – duplicação do material genético."}, {"id": "d", "texto": "G1 – Duplicação do DNA; S – duplicação dos centríolos; G2 – aumento das atividades metabólicas."}, {"id": "e", "texto": "G1 - as células são metabolicamente ativas, e continuam seu processo de crescimento e aumento de volume; S – Ocorre a replicação do DNA; G2 - célula reabastece seu estoque de energia, continua seu crescimento e sintetiza proteínas necessárias para a manipulação e movimentação dos cromossomos."}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Biologia', null, 'Sobre a evolução biológica são realizadas as
seguintes afirmativas:
I. Os fósseis são compreendidos como restos
ou vestígios de ancestrais de seres vivos que
podem comprovar os antecedentes de
algumas espécies já extintas.
II. Ancestralidades e parentescos são
características estudadas por evolucionistas,
visando evidenciar à proximidade de forma
comparativa analisando diferentes
características.
III. As estruturas vestigiais são normalmente de
tamanho reduzidos e, aparentemente,
apresentam mais função ancestral em
determinada espécie, ou sua ausência não é
significante.
IV.As estruturas vestigiais por estarem presentes
em indivíduos da mesma espécie, podem ser
indícios de ancestralidade comum,
evidenciando relação de proximidade
evolutiva entre as espécies.
Estão CORRETAS:',
  '[{"id": "a", "texto": "I e II"}, {"id": "b", "texto": "II e III"}, {"id": "c", "texto": "III e IV"}, {"id": "d", "texto": "I e IV"}, {"id": "e", "texto": "II e IV"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 35, null, false,
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
  'Biologia', null, 'O termo protozoários é empregado pelos
biólogos para designar um grupo de organismos
unicelulares heterotróficos. A maioria dos
protozoários é aquática e vive em água doce,
água salgada, regiões lodosas e terra úmida.
Algumas espécies são parasitas, habitando o
interior do corpo de animais invertebrados e
vertebrados, em muitos casos provocando
doenças.
São exemplos de protozoários que apresentam
flagelos e têm importância médica por provocar
algumas patologias:',
  '[{"id": "a", "texto": "Giardia lambia, Trypassoma cruzi, Entomoeba histolytica, Leishmania chagasi."}, {"id": "b", "texto": "Giardia lambia, Trypassoma cruzi, Entomoeba histolytica, Trycomona vaginalis."}, {"id": "c", "texto": "Giardia lambia, Trypassoma cruzi, Tricomona vaginalis, Leishmania chagasi."}, {"id": "d", "texto": "Tricomona vaginalis, Trypassoma cruzi, Entomoeba histolytica, Escherichia coli."}, {"id": "e", "texto": "Giardia lambia, Escherichia coli, Entomoeba hiDstolytica, Leishmania chagas."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Biologia', null, 'As relações ecológicas são interações que
acontecem entre os seres vivos da mesma
espécie ou de espécies diferentes. Essas
relações podem ser de natureza: harmônicas ou
desarmônicas. Dentro desse contexto, coloque
(V) para as afirmativas verdadeiras e (F) para as
afirmativas falsas. Assinale a alternativa que
preenche CORRETAMENTE a sequência.
(....) A competição é uma disputa entre indivíduos
da mesma espécie ou de espécies
diferentes por um ou mais recursos do
ambiente.
(....) Mutualismo é um tipo de simbiose em que
ambas as espécies ao interagirem obtêm
benefícios.
(....) A antibiose é um tipo de amensalismo, que
consiste na liberação de toxinas por
algumas plantas, que inibem o crescimento
de outras plantas.
(....) O comensalismo é um tipo de relação
desarmônica, em que a mesma espécie se
beneficia do recurso buscado pelo
comensal.
(....) A protocooperação é também chamada de
mutualismo facultativo.
Preenche CORRETAMENTE:',
  '[{"id": "a", "texto": "V, F, V, F e F"}, {"id": "b", "texto": "F, V, F, V e V"}, {"id": "c", "texto": "V, V, F, V e V"}, {"id": "d", "texto": "V, V, V, F e V"}, {"id": "e", "texto": "V, V, F, F e F"}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Biologia', null, 'A hemofilia é uma doença genética caracterizada
por uma falha no sistema de coagulação do
sangue, o que faz com que pessoas hemofílicas
possam apresentar hemorragias abundantes
mesmo em pequenos ferimentos. Sabendo que a
hemofilia é uma condição ligada ao cromossomo
X e é mais comum em homens, pode-se afirmar
que:',
  '[{"id": "a", "texto": "A hemofilia afeta igualmente homens e mulheres, pois ambos possuem cromossomos X."}, {"id": "b", "texto": "Um homem hemofílico necessariamente herdou o gene causador da hemofilia de sua mãe."}, {"id": "c", "texto": "Filhos homens de um pai hemofílico também terão hemofilia, independentemente do genótipo da mãe."}, {"id": "d", "texto": "Homens portadores da hemofilia transmitem o gene causador da hemofilia para os seus filhos e filhas."}, {"id": "e", "texto": "Homens hemofílicos transmitem a hemofilia diretamente para suas filhas, mas não para seus filhos."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Biologia', null, 'O aquecimento global é uma realidade
vivenciada em todo o planeta. Pois as causas
provocadas pelo aumento das ações antrópicas
através do uso exacerbado e abusivo para com
os recursos naturais, trazem como
consequências vários fatores, provocando assim,
mudanças significativas no clima do planeta.
Entre as alternativas abaixo assinale, qual delas
representa uma consequência direta do aumento
das temperaturas globais.',
  '[{"id": "a", "texto": "Aumento da frequência de terremotos em regiões costeiras."}, {"id": "b", "texto": "Redução na ocorrência de tempestades tropicais devido ao aumento da evaporação."}, {"id": "c", "texto": "Aumento do nível do mar devido à expansão térmica dos oceanos e ao derretimento das calotas polares."}, {"id": "d", "texto": "Redução na quantidade de gases de efeito estufa na atmosfera devido à maior absorção de CO2 pelas plantas."}, {"id": "e", "texto": "Diminuição da acidez dos oceanos causada pela maior dissolução de CO2 na água."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 39, null, false,
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
  'Biologia', null, 'A educação ambiental é descrita como um
processo permanente e contínuo que envolve a
mudança de hábitos e atitudes individuais e
coletivas em prol da proteção ao meio ambiente.
Considerando essa definição, assinale a
alternativa que apresenta a melhor aplicação
prática da educação ambiental.',
  '[{"id": "a", "texto": "Reciclagem de materiais quando for conveniente, sem necessidade de compromisso diário."}, {"id": "b", "texto": "Implementação de campanhas esporádicas de limpeza de praias, sem continuidade."}, {"id": "c", "texto": "Criação e implantação de projetos, que envolvam a comunidade de forma participativa."}, {"id": "d", "texto": "Dependência política do governo para ações de proteção ambiental, sem a participação da comunidade."}, {"id": "e", "texto": "Uso esporádico de transporte público, optando pelo carro particular na maioria das vezes. HISTÓRIA"}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'História', null, 'A Idade Média é o período histórico que se
estendeu aproximadamente do século V ao
século XV, situado entre a queda do Império
Romano e o início da Renascença. É geralmente
dividida em três subperíodos: Alta Idade Média,
Idade Média Central e Baixa Idade Média.
Escolha a alternativa que NÃO corresponde a
uma característica do período da Idade Média.',
  '[{"id": "a", "texto": "Cultura Humanista."}, {"id": "b", "texto": "Centralidade da Igreja Católica na vida social e cultural."}, {"id": "c", "texto": "Desenvolvimento das universidades e escolas escolásticas."}, {"id": "d", "texto": "Influência da literatura épica e dos romances de cavalaria."}, {"id": "e", "texto": "Predominância da arte e arquitetura gótica."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 41, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q41-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'História', null, 'Martírio de Tiradentes, óleo sobre tela de Francisco Aurélio de
Figueiredo e Melo (1854 — 1916).
A figura de Joaquim José da Silva Xavier,
conhecido como Tiradentes, é frequentemente
exaltada como um herói nacional no Brasil. No
entanto, sua figura também é marcada por
controvérsias. Qual das seguintes afirmações
reflete uma das controvérsias associadas a
Tiradentes?',
  '[{"id": "a", "texto": "Tiradentes é amplamente criticado por não ter participado ativamente da Inconfidência Mineira."}, {"id": "b", "texto": "A sua exaltação como herói nacional pode ser vista como uma glorificação exagerada a fim de criar uma imagem de protagonista republicano, já que sua memória foi resgatada após a Proclamação da República."}, {"id": "c", "texto": "A figura de Tiradentes é controversa principalmente por seu envolvimento em atividades econômicas ilegais na época."}, {"id": "d", "texto": "Tiradentes é criticado por sua falta de liderança durante a Inconfidência Mineira, o que levou ao sucesso do movimento."}, {"id": "e", "texto": "A controvérsia sobre Tiradentes se deve ao fato de ele ter recebido pouca atenção na historiografia brasileira."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 42, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q42-1.png", "legenda": null, "ordem": 1}, {"url": "/questoes-facape/2025.1-ampla-q42-2.png", "legenda": null, "ordem": 2}]'::jsonb, true
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
  'História', null, 'Pensar contra foi sempre a maneira menos difícil
de pensar.
Jacques Bossuet (1627-1704)
Jacques Bossuet e Jean Bodin, ambos
importantes pensadores da política e da filosofia
moderna, compartilharam a visão sobre:',
  '[{"id": "a", "texto": "O direito ao governo limitado e à separação de poderes."}, {"id": "b", "texto": "A teoria do utilitarismo."}, {"id": "c", "texto": "O Direito Divino do Rei."}, {"id": "d", "texto": "O contrato social."}, {"id": "e", "texto": "A crítica ao absolutismo e a defesa da liberdade individual."}]'::jsonb, 'c', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 43, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q43-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'História', null, 'Durante os mandatos de Getúlio Vargas, várias
políticas e reformas foram implementadas para
promover o desenvolvimento econômico e social
do Brasil. Qual das seguintes alternativas melhor
descreve uma das principais iniciativas
econômicas de Vargas?',
  '[{"id": "a", "texto": "Criação de Empresas Estatais como exemplo a Petrobras."}, {"id": "b", "texto": "Introdução do Plano Real e a estabilização da moeda."}, {"id": "c", "texto": "Nacionalização do setor bancário e criação do Banco Central."}, {"id": "d", "texto": "Implementação do Programa de Ação Econômica do Governo (PAEG) e reforma tributária."}, {"id": "e", "texto": "Aumento dos investimentos na construção e manutenção de rodovias e pela diminuição dos investimentos em ferrovias"}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 44, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q44-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'História', null, 'As democracias moderna e ateniense
apresentam várias diferenças em termos de
estrutura e funcionamento. Qual das seguintes
alternativas melhor destaca diferenças
fundamentais entre a democracia de Atenas
antiga e as democracias contemporâneas?',
  '[{"id": "a", "texto": "A democracia ateniense permitia a participação de todos os residentes, incluindo mulheres e escravos, enquanto nas democracias modernas, apenas cidadãos adultos têm direito de voto e participação política."}, {"id": "b", "texto": "Nas democracias modernas, as decisões são tomadas por uma única assembleia centralizada, enquanto na Atenas antiga, a tomada de decisões era feita por um corpo executivo restrito a um grupo pequeno e privilegiado."}, {"id": "c", "texto": "A democracia ateniense utilizava um sistema de representação proporcional nas eleições para garantir a equidade entre diferentes grupos políticos, ao passo que as democracias modernas utilizam um sistema de votação por sorteio."}, {"id": "d", "texto": "Na Atenas antiga, o sistema político era baseado na escolha de líderes por meio de eleições diretas e periódicas, enquanto nas democracias modernas, os cidadãos não têm o direito de participar diretamente nas decisões governamentais."}, {"id": "e", "texto": "Na democracia ateniense, todos os cidadãos participavam diretamente da elaboração das leis e das decisões políticas, enquanto nas democracias modernas, os cidadãos elegem representantes que tomam essas decisões em seu nome. GEOGRAFIA"}]'::jsonb, 'e', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Geografia', null, 'O geoprocessamento em muitas academias é
tratado como uma disciplina, que objetiva a
explanação de assuntos espaciais, voltado às
questões ambientais, sociais, políticas e
produtivas. A concepção dessa ciência teve
inicio na Engenharia Militar, alguns estudiosos
reconhecem suas primeiras aplicações durante o
período da 2ª Guerra Mundial, e em programas
no período da Guerra Fria entre os EUA e a
antiga URSS, no inicio da década de 90. Sua
essência estar baseada em conceitos e critérios
da engenharia; com fundamentos da Física,
Hidrologia. No entanto com o advento da
tecnologia e dos estudos de caso em diversas
áreas do conhecimento técnico – ciêntifico, os
critérios do geoprocessamento vêm sendo
aprimorados e inseridos nas diversas áreas .
Como por exemplo: na causas sociais – reforma
agrária; análises epidemológicas – medicina; e
em avaliações e definições de parâmetros
ecológicos e ambientais.
RAMOS, R. R. D. Noções básicas de
geoprocessamento para análises da
paisagem. Editora e Gráfica
Franciscana, 2015. Petrolina, PE.
Os conceitos e fundamentos abordados no texto,
são representadas por uma interface: avaliador –
software. Em que a acurácia e precisão,
dependem, exclusivamente, da',
  '[{"id": "a", "texto": "Perícia do avaliador, e não do software utilizado."}, {"id": "b", "texto": "Análise do software, como única ferramenta."}, {"id": "c", "texto": "Integração dos dados obtidos do software, descartando o trabalho empírico."}, {"id": "d", "texto": "Coleta dos dados espaciais, desviando os dados obtidos para distintos temas."}, {"id": "e", "texto": "Avaliação do software como aplicação restrita e precisa."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Geografia', null, 'TEXTO I
Estamos tratando de uma obra-prima – que sem
dúvida entrará para a história do cinema nacional
- rica em questões contemporâneas que urgem
em serem discutidas. Apesar disso, o Fantástico
do último domingo – desprezando qualquer
resquício de inteligência e senso crítico de seus
telespectadores – preferiu classificar o filme
como um retrato da relação de “amor, carinho e
respeito” entre empregados e patrões. Todo
esse amor e respeito pode ser visto já nas
primeiras cenas, quando Val se reporta a sua
patroa para lhe fazer um pedido: “Você sabe que
é como se fosse da família, querida. A lasanha
está no forno?”
O pobre está passando dos limites da
cozinha: a grande mensagem do filme
“Que Horas Ela Volta”. Por Nathali Macedo.
25 de setembro de 2015. Disponível em:
https://www.diariodocentrodomundo.com.
br/o-pobre-esta-passando-dos-limites-da-cozinha-a-grande-mensagem-do-filme-que-horas-ela-volta/
TEXTO II
[...] Depois de tantos séculos de vigência de um
sistema violento como o escravocrata – que
pressupunha a propriedade de uma pessoa por
outra e criava uma forte hierarquia entre brancos
que detinham o mando e negros que deveriam
obedecer, mas não raro se revoltavam -, era no
mínimo complicado simplesmente exaltar a
harmonia.
SCHWARCZ, L. M. Sobre o autoritarismo
brasileiro. 1ª ed. – São Paulo: Companhia das
Letras, 2019.
A crítica contida nos dois textos evidencia o
seguinte aspecto da sociedade brasileira que
traduz o pensamento de uma sociedade',
  '[{"id": "a", "texto": "Simbólica, caracterizada por seus bens culturais."}, {"id": "b", "texto": "Desigual, apresentando elementos do sistema colonial."}, {"id": "c", "texto": "Progressista, valorizando bens de patrimônio."}, {"id": "d", "texto": "Equânime, demostrando uma igualdade racial."}, {"id": "e", "texto": "Acordante, distinguindo as diferentes classes sociais."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
  'ampla', 47, null, false,
  '[{"url": "/questoes-facape/2025.1-ampla-q47-1.png", "legenda": null, "ordem": 1}]'::jsonb, true
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
  'Geografia', null, '[...] Uma verdade que não está bem, que se
infiltra no nosso ar, nos nossos rios, nos nossos
solos, nas nossas casas, nas nossas veias e pode
ser nomeada. Está marcada. É comercializada e
sua venda é imposta aos agricultores pobres.
Seus diferentes nomes estão em inglês, francês
e alemão. Esses nomes são infiltrados por
laboratórios em Washington, Londres, Paris e
Berlim, a partir dos corredores abertos pela vista
grossa de governos e inescrupulosos cientistas
treinados para focar em problemas imediatos e
não em crises globais. Patentes que retornam
lucros a cada novo produto criado e tem como
único propósito matar. Fungi-”cida”, herbi-“cida”,
inseti-“cida”, pesti-“cida”. O sufixo “cida” tem
como sentido literal “matar”. Devemos agora
acrescentar homi-“cidio”, infanti-“cidio”, sui-
“cidio” e polui-“cidio” às façanhas desses
produtos químicos? Infiltração a partir de aviões,
dos topos das montanhas aos rios, dos ombros
dos trabalhadores às roupas, lares, e jardins, da
cidade à aldeia e das fábricas aos nossos pratos.
Nos pedem para acreditar que a fome, as
mudanças climáticas e a pobreza podem ser
resolvidas pelos mesmos interesses que
causaram esses problemas.
BOMBARDI. L. M. Geografia do Uso de
Agrotóxico no Brasil e Conexões com a
União Europeia. FFLCH – USP. São Paulo,
2017.
O texto descreve um problema atual que é
provocado pela',
  '[{"id": "a", "texto": "Adoção de cultivos irrigados."}, {"id": "b", "texto": "Ampliação do campesinato."}, {"id": "c", "texto": "Diversificação da mata ciliar."}, {"id": "d", "texto": "Expansão do agronegócio."}, {"id": "e", "texto": "Amplificação de Reforma agrária."}]'::jsonb, 'd', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Geografia', null, 'Existe uma infinidade de projeções, mas todas
elas geram alguma espécie de distorção. As
projeções semelhantes, ou conformes, são as
que conservam a relação entre as formas da
esfera e as do planisfério, mas distorcem a
relação entre as superfícies. As projeções
equivalentes, ou de área-igual, ao contrário,
conservam a relação entre as superfícies da
esfera e as do planisfério, mas distorcem a
relação entre as formas. Nenhuma projeção
pode ser, simultaneamente, semelhante e
equivalentes. A mais célebre de todas é a
projeção de Mercator, que conserva as formas,
mas distorce as superfícies das massas
continentais.
DEMÉTRIO. M. Geografia: a construção do
mundo: Geografia Geral e do Brasil.
Comunicação cartográfica Marcello
Martinelli. – 1. Ed. Editora: Moderna. São
Paulo, 2005.
Conforme o texto, a projeção representada pelo
holandês Gerhard Kramer, o Mercator, é:',
  '[{"id": "a", "texto": "Plana."}, {"id": "b", "texto": "Cilíndrica."}, {"id": "c", "texto": "Cônica."}, {"id": "d", "texto": "Policônica."}, {"id": "e", "texto": "Azimutal."}]'::jsonb, 'b', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
  'Geografia', null, 'As bacias sedimentares podem ser de formação
antiga ou recente. As mais antigas, consolidadas
ao longo das Eras Paleozóicas e Mesozóicas,
resultaram da ação destrutiva da erosão sobre os
maciços pré-cambrianos e da deposição dos
materiais (sedimentação) nas áreas rebaixadas.
As mais recentes originaram-se de sedimentação
da Era Cenozóica.
ONNIG, T. J. Geografia geral e do
Brasil: estudos para compreensão do
espaço: ensino médio. Editora: FTD.
São Paulo, 2005
Tais estruturas geológicas constituem em',
  '[{"id": "a", "texto": "planícies fluviais e litorâneas."}, {"id": "b", "texto": "dobramentos antigos e modernos."}, {"id": "c", "texto": "montanhas e vales."}, {"id": "d", "texto": "serras e canyons."}, {"id": "e", "texto": "enseadas e chapadas."}]'::jsonb, 'a', null,
  'media', 'FACAPE 2025.1 - Ampla Concorrência',
  '2025.1-ampla', 'FACAPE 2025.1 - Ampla Concorrência', 2025, 1,
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
