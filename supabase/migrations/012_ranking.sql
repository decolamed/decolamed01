-- DECOLA MED — MIGRAÇÃO 012: ranking geral (view calculada em tempo real)
create or replace view ranking_geral as
select p.id as aluno_id, p.nome, coalesce(q.pts, 0) + coalesce(f.pts, 0) + coalesce(s.pts, 0) as xp
from profiles p
left join (select aluno_id, count(*) filter (where correta) * 10 as pts from respostas_aluno group by aluno_id) q on q.aluno_id = p.id
left join (select aluno_id, count(*) filter (where lembrou) * 5 as pts from flashcard_revisoes group by aluno_id) f on f.aluno_id = p.id
left join (select aluno_id, count(*) * 50 as pts from simulado_tentativas group by aluno_id) s on s.aluno_id = p.id
where p.role = 'aluno' order by xp desc;
grant select on ranking_geral to anon, authenticated, service_role;
