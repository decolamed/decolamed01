import { requireProfessor } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { PageHeader, Card, Th, Td } from "@/components/admin/card";
import { formatarCentavos, formatarData } from "@/lib/formatacao";
import { resumirRepasses, ehDevida, STATUS_LABEL, TIPO_LABEL, type ComissaoDevida } from "@/lib/repasses/agrupar";

// ============================================================================
// O FINANCEIRO DA PROFESSORA
//
// O espelho de /admin/repasses, do lado de quem recebe: quanto já foi gerado,
// quanto ainda está a receber, e de que venda veio cada comissão.
//
// IMPORTANTE: mesmo usando o client com service role (o mesmo padrão do resto
// do painel), a consulta filtra explicitamente por
// `beneficiario_id = profile.id`. A professora nunca deve ver comissão de mais
// ninguém — nem de outra professora, nem de parceiro. A policy
// `comissoes_parceiro_select_own` (migração 005, reescrita na 072 quando a
// coluna foi renomeada) reforça a mesma regra caso um dia esses dados sejam
// buscados direto do client com a anon key.
//
// Nada de aluno aparece aqui além do nome de quem comprou o plano — que é a
// única forma de a professora conferir de onde veio a comissão.
// ============================================================================

export default async function ProfessorFinanceiroPage() {
  const profile = await requireProfessor();
  const supabase = createAdminClient();

  const { data: comissoesData, error: erroComissoes } = await supabase
    .from("comissoes_parceiro")
    .select(
      "id, beneficiario_id, tipo, valor_centavos, status, data_pagamento, " +
        "beneficiario:beneficiario_id(nome, role), " +
        "pagamento:pagamento_id(comprador_nome, plano_nome, data_pagamento, status)"
    )
    .eq("beneficiario_id", profile.id)
    .order("created_at", { ascending: false });

  // Dinheiro: uma lista vazia por falha faria a professora ler "nenhuma
  // comissão" e concluir que não tem nada a receber. Ver
  // lib/supabase/resultado.ts.
  if (erroComissoes) {
    console.error("Financeiro do professor: falha ao ler as comissões:", profile.id, erroComissoes.message);
  }
  const comissoes = (comissoesData ?? []) as unknown as ComissaoDevida[];
  const resumo = resumirRepasses(comissoes);

  return (
    <div>
      <PageHeader
        title="Meu financeiro"
        subtitle="As comissões geradas pelas suas correções de redação, e o que ainda está a receber."
      />

      {erroComissoes && (
        <div className="mt-4 rounded-2xl border border-orange/30 bg-orange/[0.06] p-4">
          <p className="font-display text-sm font-bold text-orange-dark">
            Não conseguimos carregar suas comissões agora
          </p>
          <p className="mt-1 text-sm text-navy-dark/70">
            Os valores abaixo estão zerados por falha de leitura, não porque não existem. Recarregue em
            instantes.
          </p>
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Card className="border-green/25 bg-green/[0.04]">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-green/70">A receber</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-green">
            {formatarCentavos(resumo.aPagarCentavos)}
          </p>
          <p className="mt-1 text-xs font-semibold text-navy-dark/60">
            de {resumo.quantidade} comissão(ões) no total
          </p>
        </Card>
        <Card>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-navy-dark/40">Já recebido</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-navy-dark">
            {formatarCentavos(resumo.pagoCentavos)}
          </p>
        </Card>
        <Card>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-navy-dark/40">Total gerado</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-navy-dark">
            {formatarCentavos(resumo.aPagarCentavos + resumo.pagoCentavos)}
          </p>
        </Card>
      </div>

      <Card className="mt-4 !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <Th>Venda de origem</Th>
                <Th>Tipo</Th>
                <Th>Valor</Th>
                <Th>Situação</Th>
              </tr>
            </thead>
            <tbody>
              {comissoes.map((c) => (
                <tr key={c.id} className="border-t border-navy-dark/10 align-top">
                  <Td className="font-bold text-navy-dark">
                    {c.pagamento?.plano_nome ?? "—"}
                    <p className="mt-0.5 font-normal text-navy-dark/50">
                      {c.pagamento?.comprador_nome ?? "—"} · {formatarData(c.pagamento?.data_pagamento ?? null)}
                    </p>
                  </Td>
                  <Td>{TIPO_LABEL[c.tipo] ?? c.tipo}</Td>
                  <Td>
                    <span className="font-display text-base font-extrabold text-navy-dark">
                      {formatarCentavos(c.valor_centavos)}
                    </span>
                  </Td>
                  <Td>
                    {STATUS_LABEL[c.status] ?? c.status}
                    {c.data_pagamento && (
                      <p className="text-navy-dark/50">recebido em {formatarData(c.data_pagamento)}</p>
                    )}
                    {/* A comissão existe, mas a venda ainda não entrou. Dizer
                        só "a pagar" faria a professora contar com um dinheiro
                        que depende de uma cobrança em aberto. */}
                    {c.status === "pendente" && !ehDevida(c) && (
                      <p className="text-orange-dark">aguardando o pagamento da venda</p>
                    )}
                  </Td>
                </tr>
              ))}
              {comissoes.length === 0 && (
                <tr>
                  <Td className="text-navy-dark/50">
                    Nenhuma comissão ainda. Elas são geradas automaticamente a cada venda de um plano em que
                    você é a professora responsável.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
