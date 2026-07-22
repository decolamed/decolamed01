-- DECOLA MED — MIGRAÇÃO 017: nota FACAPE ponderada + desempenho por matéria
alter table simulado_tentativas
  add column if not exists nota_facape numeric,
  add column if not exists desempenho_por_materia jsonb not null default '{}'::jsonb;
