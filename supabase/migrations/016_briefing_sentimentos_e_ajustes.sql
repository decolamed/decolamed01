-- DECOLA MED — MIGRAÇÃO 016: alinhar briefing ao protótipo original
alter table aluno_briefing add column if not exists inicio_estudos date;
alter table aluno_briefing add column if not exists sentimentos jsonb not null default '{}'::jsonb;
insert into materias_peso (materia, peso, observacao) values
  ('Biologia', 3, 'Peso oficial FACAPE'),
  ('Português', 2, 'Peso oficial FACAPE'),
  ('Física', 2, 'Peso oficial FACAPE'),
  ('Química', 2, 'Peso oficial FACAPE'),
  ('Matemática', 1, 'Peso oficial FACAPE'),
  ('História', 1, 'Peso oficial FACAPE'),
  ('Geografia', 1, 'Peso oficial FACAPE')
on conflict (materia) do nothing;
