import Link from "next/link";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { Card, PageHeader, StatCard } from "@/components/admin/card";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { TabelaResponsiva } from "@/components/admin/tabela-responsiva";
import { formatarCentavos, formatarData } from "@/lib/formatacao";
import { atalhosDePeriodo } from "@/lib/vendas/atalhos";
import { limitesDoPeriodo } from "@/lib/vendas/periodo";
import {
  resumirRepasses,
  ehDevida,
  descreverPeriodoDeRepasse,
  STATUS_LABEL,
  TIPO_LABEL,
  type ComissaoDevida
} from "@/lib/repasses/agrupar";
import { marcarRepassePago, marcarRepasseDaPessoaPago, desfazerRepasse } from "./actions";
import { falhaAoCarregar } from "@/lib/supabase/resultado";

// ============================================================================
// REPASSES — QUANTO PRECISO PAGAR PARA CADA UM
//
// A outra metade de /admin/vendas. Lá a pergunta é quanto entrou; aqui é
// quanto sai, e para quem.
//
// O PERÍODO É O DA VENDA, não o da comissão. Uma comissão gerada hoje sobre
// uma venda de agosto é dívida de agosto — é o que faz esta tela fechar com o
// mês escolhido na tela de vendas. Filtrar pela data da linha de comissão
// jogaria a mesma dívida para dois meses diferentes conforme o dia em que o
// webhook chegou.
//
// O filtro de período é aplicado sobre `pagamentos.data_pagamento` através do
// relacionamento — por isso o `!inner`: sem ele o PostgREST devolve a comissão
// com o pagamento nulo em vez de excluí-la do resultado, e uma venda fora do
// período apareceria como comissão órfã.
// ============================================================================

interface RepassesSearchParams {
  de?: string;
  ate?: string;
  beneficiarioId?: string;
  tipo?: string;
  status?: string;
  erro?: string;
  sucesso?: string;
}

const SELECT_DAS_COMISSOES =
  "id, beneficiario_id, tipo, valor_centavos, status, data_pagamento, " +
  "beneficiario:beneficiario_id(nome, role), " +
  "pagamento:pagamento_id!inner(comprador_nome, plano_nome, data_pagamento, status)";

export default async function AdminRepassesPage({ searchParams }: { searchParams: RepassesSearchParams }) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { inicio, fim, invertido } = limitesDoPeriodo(searchParams.de, searchParams.ate);

  let consulta = supabase.from("comissoes_parceiro").select(SELECT_DAS_COMISSOES);
  if (!invertido) {
    if (inicio) consulta = consulta.gte("pagamento.data_pagamento", inicio);
    if (fim) consulta = consulta.lte("pagamento.data_pagamento", fim);
  }
  if (searchParams.beneficiarioId) consulta = consulta.eq("beneficiario_id", searchParams.beneficiarioId);
  if (searchParams.tipo) consulta = consulta.eq("tipo", searchParams.tipo);
  if (searchParams.status) consulta = consulta.eq("status", searchParams.status);

  const [{ data: comissoesData, error: erroDaConsulta }, { data: pessoasData, error: erroPessoas }] = await Promise.all([
    consulta.order("created_at", { ascending: false }),
    // Só quem pode receber: parceiros e professores. Um admin nunca aparece
    // aqui, e um aluno muito menos.
    supabase.from("profiles").select("id, nome, role").in("role", ["parceiro", "professor"]).order("nome")
  ]);

  const comissoes = (comissoesData ?? []) as unknown as ComissaoDevida[];
  const pessoas = (pessoasData ?? []) as { id: string; nome: string; role: string }[];
  const resumo = resumirRepasses(comissoes);

  const aviso = invertido
    ? "A data inicial é posterior à data final — nenhum período foi somado. Corrija as datas."
    : (falhaAoCarregar({ comissões: { error: erroDaConsulta }, pessoas: { error: erroPessoas } }) ?? undefined);

  // Os ids pendentes de cada pessoa, para o botão de quitar a folha dela de
  // uma vez. Saem da MESMA lista que está na tela — a ação não recalcula o
  // período, senão uma venda confirmada entre a renderização e o clique
  // entraria numa baixa que o admin não conferiu.
  const pendentesPorPessoa = new Map<string, string[]>();
  for (const c of comissoes) {
    if (!ehDevida(c)) continue;
    pendentesPorPessoa.set(c.beneficiario_id, [...(pendentesPorPessoa.get(c.beneficiario_id) ?? []), c.id]);
  }

  const atalhos = atalhosDePeriodo();
  function linkDoAtalho(de: string, ate: string): string {
    const params = new URLSearchParams({ de, ate });
    for (const chave of ["beneficiarioId", "tipo", "status"] as const) {
      const valor = searchParams[chave];
      if (valor) params.set(chave, valor);
    }
    return `/admin/repasses?${params.toString()}`;
  }

  /** Os filtros atuais, para as ações voltarem para a mesma tela. */
  const camposDeFiltro = (
    <>
      {(["de", "ate", "beneficiarioId", "tipo", "status"] as const).map((chave) =>
        searchParams[chave] ? <input key={chave} type="hidden" name={chave} value={searchParams[chave]} /> : null
      )}
    </>
  );

  return (
    <div>
      <PageHeader
        title="Repasses"
        subtitle="Quanto você precisa pagar para cada professor e parceiro. Escolha o mês e dê baixa conforme for pagando."
      />
      <AdminAlert erro={aviso ?? searchParams.erro} sucesso={searchParams.sucesso} />

      {/* O total a pagar vem primeiro e sozinho — é o número que o admin veio
          buscar, do mesmo jeito que "Vendas no período" na tela ao lado. */}
      <div className="mt-5 grid gap-3 lg:grid-cols-[1.4fr_2fr]">
        <Card className="border-orange/25 bg-orange/[0.04]">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-orange-dark/70">A repassar no período</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-orange-dark sm:text-4xl">
            {formatarCentavos(resumo.aPagarCentavos)}
          </p>
          <p className="mt-1 text-xs font-semibold text-navy-dark/60">
            {descreverPeriodoDeRepasse(searchParams.de, searchParams.ate)}
          </p>
          <p className="mt-2.5 border-t border-orange/20 pt-2.5 text-[11px] font-semibold text-navy-dark/50">
            {resumo.porBeneficiario.length} pessoa{resumo.porBeneficiario.length !== 1 ? "s" : ""} ·{" "}
            {formatarCentavos(resumo.pagoCentavos)} já pago no período
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(["cupom", "redacao"] as const).map((tipo) => {
            const dados = resumo.porTipo.find((t) => t.tipo === tipo);
            return (
              <StatCard
                key={tipo}
                label={TIPO_LABEL[tipo]}
                value={formatarCentavos(dados?.aPagarCentavos ?? 0)}
              />
            );
          })}
          <StatCard label="Comissões no período" value={String(resumo.quantidade)} />
        </div>
      </div>

      {/* ---- Por pessoa: o número individual, e o botão de quitar a folha ---- */}
      <div className="mt-3">
        <Card>
          <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-navy-dark/40">
            Por pessoa, no período
          </h2>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {resumo.porBeneficiario.map((pessoa) => {
              const pendentes = pendentesPorPessoa.get(pessoa.beneficiarioId) ?? [];
              return (
                <div key={pessoa.beneficiarioId} className="rounded-xl border border-navy-dark/10 bg-white p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-navy-dark">{pessoa.nome}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-dark/40">
                        {pessoa.papel}
                      </p>
                    </div>
                    <Link
                      href={`/admin/repasses?${new URLSearchParams({
                        ...(searchParams.de ? { de: searchParams.de } : {}),
                        ...(searchParams.ate ? { ate: searchParams.ate } : {}),
                        beneficiarioId: pessoa.beneficiarioId
                      }).toString()}`}
                      className="shrink-0 text-[11px] font-semibold text-navy underline"
                    >
                      só esta
                    </Link>
                  </div>

                  <p className="mt-2 font-display text-2xl font-extrabold text-orange-dark">
                    {formatarCentavos(pessoa.aPagarCentavos)}
                  </p>
                  <p className="text-[11px] font-semibold text-navy-dark/50">
                    {pessoa.porTipo
                      .filter((t) => t.aPagarCentavos > 0)
                      .map((t) => `${TIPO_LABEL[t.tipo]}: ${formatarCentavos(t.aPagarCentavos)}`)
                      .join(" · ") || "nada pendente"}
                    {pessoa.pagoCentavos > 0 && ` · ${formatarCentavos(pessoa.pagoCentavos)} já pago`}
                  </p>

                  {pendentes.length > 0 && (
                    <form action={marcarRepasseDaPessoaPago} className="mt-2.5">
                      {camposDeFiltro}
                      <input type="hidden" name="ids" value={pendentes.join(",")} />
                      <ConfirmSubmitButton
                        pendingText="Dando baixa..."
                        confirmMessage={`Marcar como pagas as ${pendentes.length} comissão(ões) de ${pessoa.nome}, no total de ${formatarCentavos(pessoa.aPagarCentavos)}?`}
                        className="w-full rounded-lg bg-navy px-3 py-2 text-xs font-bold text-white hover:bg-navy-dark"
                      >
                        Marcar tudo como pago
                      </ConfirmSubmitButton>
                    </form>
                  )}
                </div>
              );
            })}
            {resumo.porBeneficiario.length === 0 && (
              <p className="text-sm font-semibold text-navy-dark/50">
                Nenhuma comissão no período e filtro selecionados.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-navy-dark/40">Período rápido</span>
        {atalhos.map((atalho) => (
          <Link
            key={atalho.rotulo}
            href={linkDoAtalho(atalho.de, atalho.ate)}
            className="rounded-full border border-navy-dark/10 bg-white px-3 py-1.5 text-xs font-bold text-navy-dark hover:border-orange/40 hover:text-orange"
          >
            {atalho.rotulo}
          </Link>
        ))}
      </div>

      <form
        className="mt-3 flex flex-wrap items-end gap-3 rounded-2xl border border-navy-dark/10 bg-white p-[18px]"
        action="/admin/repasses"
      >
        <div>
          <label className="text-xs font-semibold text-navy-dark/60" htmlFor="de">De (data da venda)</label>
          <input id="de" name="de" type="date" defaultValue={searchParams.de} className="mt-1 rounded-lg border p-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-navy-dark/60" htmlFor="ate">Até</label>
          <input id="ate" name="ate" type="date" defaultValue={searchParams.ate} className="mt-1 rounded-lg border p-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-navy-dark/60" htmlFor="beneficiarioId">Pessoa</label>
          <select
            id="beneficiarioId"
            name="beneficiarioId"
            defaultValue={searchParams.beneficiarioId ?? ""}
            className="mt-1 rounded-lg border p-2 text-sm"
          >
            <option value="">Todas</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.role})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-navy-dark/60" htmlFor="tipo">Tipo de comissão</label>
          <select id="tipo" name="tipo" defaultValue={searchParams.tipo ?? ""} className="mt-1 rounded-lg border p-2 text-sm">
            <option value="">Todos</option>
            <option value="cupom">{TIPO_LABEL.cupom}</option>
            <option value="redacao">{TIPO_LABEL.redacao}</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-navy-dark/60" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={searchParams.status ?? ""} className="mt-1 rounded-lg border p-2 text-sm">
            <option value="">Todos</option>
            <option value="pendente">A pagar</option>
            <option value="paga">Pagas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
        <SubmitButton pendingText="..." className="rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white">
          Filtrar
        </SubmitButton>
        <a href="/admin/repasses" className="text-sm text-navy-dark/50 underline">Limpar filtros</a>
      </form>

      {/* ---- A lista, comissão a comissão ---- */}
      <div className="mt-6">
        <TabelaResponsiva
          linhas={comissoes}
          chave={(c) => c.id}
          vazio="Nenhuma comissão encontrada para este filtro."
          colunas={[
            {
              titulo: "Quem recebe",
              principal: true,
              celula: (c) => (
                <div>
                  <p>{c.beneficiario?.nome ?? "—"}</p>
                  <p className="text-xs text-navy-dark/50">{c.beneficiario?.role ?? "—"}</p>
                </div>
              )
            },
            { titulo: "Tipo", celula: (c) => TIPO_LABEL[c.tipo] ?? c.tipo },
            {
              titulo: "Venda de origem",
              celula: (c) => (
                <div>
                  <p>{c.pagamento?.comprador_nome ?? "—"}</p>
                  <p className="text-xs text-navy-dark/50">
                    {c.pagamento?.plano_nome ?? "—"} · {formatarData(c.pagamento?.data_pagamento ?? null)}
                  </p>
                </div>
              )
            },
            {
              titulo: "Valor",
              celula: (c) => <span className="font-semibold">{formatarCentavos(c.valor_centavos)}</span>
            },
            {
              titulo: "Status",
              celula: (c) => (
                <div>
                  <p>{STATUS_LABEL[c.status] ?? c.status}</p>
                  {c.data_pagamento && (
                    <p className="text-xs text-navy-dark/50">pago em {formatarData(c.data_pagamento)}</p>
                  )}
                  {c.status === "pendente" && !ehDevida(c) && (
                    <p className="text-xs text-orange-dark">venda ainda não recebida</p>
                  )}
                </div>
              )
            }
          ]}
          acoes={(c) =>
            c.status === "pendente" ? (
              <form action={marcarRepassePago}>
                {camposDeFiltro}
                <input type="hidden" name="id" value={c.id} />
                <SubmitButton
                  pendingText="..."
                  className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white"
                >
                  Marcar como paga
                </SubmitButton>
              </form>
            ) : c.status === "paga" ? (
              <form action={desfazerRepasse}>
                {camposDeFiltro}
                <input type="hidden" name="id" value={c.id} />
                <ConfirmSubmitButton
                  pendingText="..."
                  confirmMessage="Desfazer a baixa desta comissão? Ela volta para a lista de a pagar."
                  className="text-red hover:underline"
                >
                  Desfazer baixa
                </ConfirmSubmitButton>
              </form>
            ) : (
              <span className="text-navy-dark/40">—</span>
            )
          }
        />
      </div>
    </div>
  );
}
