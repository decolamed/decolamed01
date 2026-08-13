-- A rota passou a ter dois tipos de dia que não são estudo:
--   'descanso' — véspera da prova, reservada quando há tempo;
--   'prova'    — o dia do vestibular, sempre presente e sempre sem conteúdo.
alter table public.aluno_rota_dias drop constraint if exists aluno_rota_dias_tipo_check;
alter table public.aluno_rota_dias
  add constraint aluno_rota_dias_tipo_check
  check (tipo in ('estudo', 'simulado', 'revisao', 'descanso', 'prova'));
