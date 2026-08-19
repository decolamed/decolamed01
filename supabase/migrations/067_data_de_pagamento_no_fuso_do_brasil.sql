-- ===========================================================================
-- A DATA DA VENDA PASSA A SER O DIA EM QUE ELA ACONTECEU, EM BRASÍLIA
--
-- `pagamentos.data_pagamento` é timestamptz, mas quem escrevia nele mandava
-- só o dia: o Asaas manda `paymentDate` como "2026-08-18", e a matrícula
-- manual usava `new Date("2026-08-18")`. O Postgres fixa isso à meia-noite
-- UTC — que em Brasília ainda é dia 17, às 21h.
--
-- Enquanto a tela também lia tudo em UTC (a Vercel roda em UTC), os dois
-- erros se cancelavam e ninguém via. Agora que o filtro por período e a data
-- exibida usam o fuso da plataforma — para que uma venda das 22h caia no dia
-- em que foi paga, e não no dia seguinte — essas linhas antigas passariam a
-- aparecer um dia antes do dia em que foram registradas.
--
-- A correção move a hora para meio-dia de Brasília, mantendo exatamente o dia
-- que o admin escolheu. Nenhum valor, status ou vínculo é tocado: só o
-- horário dentro do mesmo dia. Ao meio-dia sobram 12h de folga para cada
-- lado, então o dia é o mesmo em qualquer fuso que venha a ler.
--
-- Só as linhas exatamente à meia-noite UTC entram: são as que vieram de um
-- campo de data. Pagamento com hora real (Asaas via webhook novo) fica como
-- está, porque ali o instante é a informação verdadeira.
-- ===========================================================================

update public.pagamentos
   set data_pagamento = (((data_pagamento at time zone 'UTC')::date + time '12:00')
                          at time zone 'America/Sao_Paulo')
 where data_pagamento is not null
   and data_pagamento = date_trunc('day', data_pagamento at time zone 'UTC') at time zone 'UTC';
