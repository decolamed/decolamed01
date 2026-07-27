import { requireProfessor } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { PageHeader, Card, Th, Td } from "@/components/admin/card";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { adicionarCredito, removerCredito, corrigirRedacao, removerDaLista } from "./actions";

export default async function ProfessorPage() {
  await requireProfessor();
  const supabase = createAdminClient();

  const { data: planosComRedacao } = await supabase.from("planos").select("id, creditos_redacao").gt("creditos_redacao", 0);
  const planoIds = (planosComRedacao ?? []).map((p: any) => p.id);
  const creditosPorPlano = new Map((planosComRedacao ?? []).map((p: any) => [p.id, p.creditos_redacao as number]));

  const { data: alunosData } =
    planoIds.length > 0
      ? await supabase.from("profiles").select("id, nome, email, plano_id").eq("role", "aluno").eq("ativo", true).in("plano_id", planoIds).order("nome")
      : { data: [] as any[] };

  const { data: ocultosData } = await supabase.from("redacoes_professor_ocultos").select("aluno_id");
  const ocultos = new Set((ocultosData ?? []).map((o: any) => o.aluno_id));

  const alunos = (alunosData ?? []).filter((a: any) => !ocultos.has(a.id));
  const alunoIds = alunos.map((a: any) => a.id);

  const [{ data: consumidosData }, { data: ajustesData }] =
    alunoIds.length > 0
      ? await Promise.all([
          supabase.from("redacoes_creditos_consumidos").select("aluno_id").in("aluno_id", alunoIds),
          supabase.from("redacoes_creditos_ajustes").select("aluno_id, quantidade").in("aluno_id", alunoIds)
        ])
      : [{ data: [] as any[] }, { data: [] as any[] }];

  const consumidosPorAluno = new Map<string, number>();
  (consumidosData ?? []).forEach((c: any) => consumidosPorAluno.set(c.aluno_id, (consumidosPorAluno.get(c.aluno_id) ?? 0) + 1));
  const ajustesPorAluno = new Map<string, number>();
  (ajustesData ?? []).forEach((a: any) => ajustesPorAluno.set(a.aluno_id, (ajustesPorAluno.get(a.aluno_id) ?? 0) + a.quantidade));

  const linhas = alunos.map((a: any) => {
    const base = creditosPorPlano.get(a.plano_id) ?? 0;
    const totais = base + (ajustesPorAluno.get(a.id) ?? 0);
    const consumidos = consumidosPorAluno.get(a.id) ?? 0;
    const disponiveis = Math.max(0, totais - consumidos);
    return { id: a.id, nome: a.nome, email: a.email, totais, consumidos, disponiveis };
  });

  return (
    <div>
      <PageHeader title="Créditos de redação" subtitle="Alunos matriculados em planos com redação — adicione, remova ou registre correções" />

      <Card className="mt-4 !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <Th>Aluno</Th>
                <Th>Créditos disponíveis</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.id} className="border-t border-navy-dark/10 align-top">
                  <Td className="font-bold text-navy-dark">
                    {l.nome}
                    <p className="mt-0.5 font-normal text-navy-dark/50">{l.email}</p>
                  </Td>
                  <Td>
                    <span className="font-display text-lg font-extrabold text-navy-dark">{l.disponiveis}</span>
                    <span className="text-navy-dark/40"> / {l.totais}</span>
                    <p className="text-navy-dark/50">{l.consumidos} já corrigida{l.consumidos !== 1 ? "s" : ""}</p>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <form action={adicionarCredito.bind(null, l.id)}>
                        <SubmitButton pendingText="..." className="rounded-full bg-navy/10 px-3 py-1.5 font-bold text-navy hover:bg-navy/20">
                          + crédito
                        </SubmitButton>
                      </form>
                      <form action={removerCredito.bind(null, l.id)}>
                        <ConfirmSubmitButton
                          pendingText="..."
                          confirmMessage={`Remover 1 crédito de redação de ${l.nome}?`}
                          className="rounded-full bg-red/10 px-3 py-1.5 font-bold text-red hover:bg-red/20"
                        >
                          − crédito
                        </ConfirmSubmitButton>
                      </form>
                      <form action={corrigirRedacao.bind(null, l.id)}>
                        <ConfirmSubmitButton
                          pendingText="..."
                          confirmMessage={`Marcar uma redação de ${l.nome} como corrigida? Isso consome 1 crédito e avisa o aluno.`}
                          className="rounded-full bg-orange px-3 py-1.5 font-bold text-white hover:bg-orange-dark"
                        >
                          Redação corrigida
                        </ConfirmSubmitButton>
                      </form>
                      <form action={removerDaLista.bind(null, l.id)}>
                        <ConfirmSubmitButton
                          pendingText="..."
                          confirmMessage={`Remover ${l.nome} desta lista? Ele continua com a conta normal — só some deste painel.`}
                          className="rounded-full px-3 py-1.5 font-bold text-navy-dark/40 hover:bg-navy-dark/5"
                        >
                          Remover da lista
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </Td>
                </tr>
              ))}
              {linhas.length === 0 && (
                <tr>
                  <Td className="text-navy-dark/50">Nenhum aluno com plano de redação no momento.</Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
