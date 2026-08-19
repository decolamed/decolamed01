import Link from "next/link";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/admin/submit-button";
import { TabelaResponsiva } from "@/components/admin/tabela-responsiva";
import { AdminAlert } from "@/components/admin/admin-alert";
import { Card, PageHeader, StatCard } from "@/components/admin/card";
import { formatarCentavos, formatarData } from "@/lib/formatacao";
import { consultaDeVendas, resumoDeVendas } from "@/lib/vendas/consulta";
import { descreverPeriodo, limitesDoPeriodo } from "@/lib/vendas/periodo";
import { atalhosDePeriodo } from "@/lib/vendas/atalhos";
import { marcarComissaoPaga } from "./actions";
import type { Pagamento, ComissaoParceiro } from "@/types/database";

const COMISSAO_STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  paga: "Paga",
  cancelada: "Cancelada"
};

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  recebido: "Recebido",
  estornado: "Estornado",
  falhou: "Falhou"
};

const ORIGEM_LABEL: Record<string, string> = {
  asaas: "Asaas",
  manual: "Manual",
  cortesia: "Cortesia/bolsa"
};

interface VendasSearchParams {
  erro?: string;
  sucesso?: string;
  de?: string;
  ate?: string;
  planoId?: string;
  status?: string;
  cupom?: string;
  parceiroId?: string;
}

export default async function AdminVendasPage({ searchParams }: { searchParams: VendasSearchParams }) {
  await requireAdmin();
  const supabase = createAdminClient();

  // Os mesmos filtros da tabela, aplicados num lugar só (ver
  // lib/vendas/consulta.ts) — é o que garante que o total do topo é o total
  // das vendas listadas embaixo.
  const filtros = {
    de: searchParams.de,
    ate: searchParams.ate,
    planoId: searchParams.planoId,
    status: searchParams.status,
    cupom: searchParams.cupom,
    parceiroId: searchParams.parceiroId
  };
  const { invertido } = limitesDoPeriodo(searchParams.de, searchParams.ate);

  const [{ data: vendas }, { data: planos }, { data: cupons }, { data: parceiros }, { data: comissoesData }, totais] = await Promise.all([
    consultaDeVendas(supabase, filtros),
    supabase.from("planos").select("id, nome").order("ordem"),
    supabase.from("cupons").select("codigo").order("codigo"),
    supabase.from("profiles").select("id, nome").eq("role", "parceiro").order("nome"),
    // As comissões são geradas por trigger a partir de `pagamentos` (migração
    // 005) e ficam em "pendente" até alguém dar baixa — o que só é possível
    // por aqui. Não segue os filtros da tabela de vendas de propósito: é um
    // controle de contas a pagar, e esconder uma comissão pendente porque o
    // filtro de data está estreito seria justamente o jeito de esquecê-la.
    supabase
      .from("comissoes_parceiro")
      .select("*, parceiro:parceiro_id(nome), pagamento:pagamento_id(comprador_nome, plano_nome, data_pagamento)")
      .order("created_at", { ascending: false }),
    // O resumo é uma consulta própria, que varre TODAS as linhas do período
    // em blocos — não uma soma das linhas que couberam na tabela acima.
    resumoDeVendas(supabase, filtros)
  ]);

  const lista = (vendas as Pagamento[]) ?? [];
  type ComissaoComRelacoes = ComissaoParceiro & {
    parceiro: { nome: string } | null;
    pagamento: { comprador_nome: string | null; plano_nome: string | null; data_pagamento: string | null } | null;
  };
  const comissoes = (comissoesData as ComissaoComRelacoes[] | null) ?? [];
  const comissoesPendentes = comissoes.filter((c) => c.status === "pendente");
  const totalComissaoPendenteCentavos = comissoesPendentes.reduce((soma, c) => soma + c.valor_centavos, 0);

  // O resumo vem do banco, não das linhas acima: `lista` é limitada pelo teto
  // de linhas por resposta do PostgREST, e um total que para de crescer em
  // silêncio é pior do que total nenhum.
  const { resumo, incompleto, erro: erroDoResumo } = totais;
  const avisoDoResumo = invertido
    ? "A data inicial é posterior à data final — nenhum período foi somado. Corrija as datas."
    : erroDoResumo
      ? `Não foi possível calcular o total do período: ${erroDoResumo}`
      : incompleto
        ? "O período tem vendas demais para somar de uma vez — o total abaixo está incompleto. Filtre um intervalo menor."
        : undefined;

  // Os atalhos trocam só o período: plano, status, cupom e parceiro que já
  // estiverem aplicados continuam valendo, senão trocar de mês significaria
  // perder o resto do filtro sem avisar.
  const atalhos = atalhosDePeriodo();
  function linkDoAtalho(de: string, ate: string): string {
    const params = new URLSearchParams({ de, ate });
    for (const chave of ["planoId", "status", "cupom", "parceiroId"] as const) {
      const valor = searchParams[chave];
      if (valor) params.set(chave, valor);
    }
    return `/admin/vendas?${params.toString()}`;
  }

  return (
    <div>
      <PageHeader title="Vendas" subtitle="Tudo que entrou, no período que você escolher. Use o filtro abaixo para mudar o intervalo." />
      <AdminAlert erro={avisoDoResumo ?? searchParams.erro} sucesso={searchParams.sucesso} />

      {/* O total do período é o número que o admin veio buscar — vem primeiro
          e sozinho, com o intervalo escrito por extenso embaixo para não
          restar dúvida de qual período foi somado. */}
      <div className="mt-5 grid gap-3 lg:grid-cols-[1.4fr_2fr]">
        <Card className="border-green/25 bg-green/[0.04]">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-green/70">Vendas no período</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-green sm:text-4xl">
            {formatarCentavos(resumo.totalCentavos)}
          </p>
          <p className="mt-1 text-xs font-semibold text-navy-dark/60">
            {descreverPeriodo(searchParams.de, searchParams.ate)}
          </p>
          <p className="mt-2.5 border-t border-green/20 pt-2.5 text-[11px] font-semibold text-navy-dark/50">
            {resumo.quantidade} venda{resumo.quantidade !== 1 ? "s" : ""} paga
            {resumo.quantidade !== 1 ? "s" : ""} · líquido {formatarCentavos(resumo.liquidoCentavos)}
          </p>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Ticket médio" value={formatarCentavos(resumo.ticketMedioCentavos)} />
          <StatCard label="Vendas pagas" value={String(resumo.quantidade)} />
          <StatCard label="Líquido recebido" value={formatarCentavos(resumo.liquidoCentavos)} />
        </div>
      </div>

      <div className="mt-3">
        <Card>
          <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-navy-dark/40">Vendas por plano no período</h2>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {resumo.porPlano.map((dados) => (
              <div key={dados.plano} className="rounded-xl bg-navy/5 px-3.5 py-2.5">
                <p className="text-sm font-bold text-navy-dark">{dados.plano}</p>
                <p className="text-[11px] font-semibold text-navy-dark/60">
                  {dados.quantidade} venda{dados.quantidade !== 1 ? "s" : ""} · {formatarCentavos(dados.totalCentavos)}
                </p>
              </div>
            ))}
            {resumo.porPlano.length === 0 && (
              <p className="text-sm font-semibold text-navy-dark/50">Nenhuma venda paga no período/filtro selecionado.</p>
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

      <form className="mt-3 flex flex-wrap items-end gap-3 rounded-2xl border border-navy-dark/10 bg-white p-[18px]" action="/admin/vendas">
        <div>
          <label className="text-xs font-semibold text-navy-dark/60" htmlFor="de">De</label>
          <input id="de" name="de" type="date" defaultValue={searchParams.de} className="mt-1 rounded-lg border p-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-navy-dark/60" htmlFor="ate">Até</label>
          <input id="ate" name="ate" type="date" defaultValue={searchParams.ate} className="mt-1 rounded-lg border p-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-navy-dark/60" htmlFor="planoId">Plano</label>
          <select id="planoId" name="planoId" defaultValue={searchParams.planoId ?? ""} className="mt-1 rounded-lg border p-2 text-sm">
            <option value="">Todos</option>
            {(planos ?? []).map((p: any) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-navy-dark/60" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={searchParams.status ?? ""} className="mt-1 rounded-lg border p-2 text-sm">
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="recebido">Recebido</option>
            <option value="estornado">Estornado</option>
            <option value="falhou">Falhou</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-navy-dark/60" htmlFor="cupom">Cupom</label>
          <select id="cupom" name="cupom" defaultValue={searchParams.cupom ?? ""} className="mt-1 rounded-lg border p-2 text-sm">
            <option value="">Todos</option>
            {(cupons ?? []).map((c: any) => (
              <option key={c.codigo} value={c.codigo}>{c.codigo}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-navy-dark/60" htmlFor="parceiroId">Parceiro</label>
          <select id="parceiroId" name="parceiroId" defaultValue={searchParams.parceiroId ?? ""} className="mt-1 rounded-lg border p-2 text-sm">
            <option value="">Todos</option>
            {(parceiros ?? []).map((p: any) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
        <SubmitButton pendingText="..." className="rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white">
          Filtrar
        </SubmitButton>
        <a href="/admin/vendas" className="text-sm text-navy-dark/50 underline">Limpar filtros</a>
      </form>

      <div className="mt-6">
        <TabelaResponsiva
          linhas={lista}
          chave={(v) => v.id}
          vazio="Nenhuma venda encontrada para este filtro."
          colunas={[
            {
              titulo: "Comprador",
              principal: true,
              celula: (v) => (
                <div>
                  <p>{v.comprador_nome ?? "—"}</p>
                  <p className="break-all text-xs text-navy-dark/50">{v.comprador_email ?? "—"}</p>
                </div>
              )
            },
            { titulo: "Plano", celula: (v) => v.plano_nome ?? "—" },
            { titulo: "Valor bruto", celula: (v) => formatarCentavos(v.valor_centavos) },
            { titulo: "Valor líquido", celula: (v) => formatarCentavos(v.valor_liquido_centavos ?? v.valor_centavos) },
            { titulo: "Forma", celula: (v) => v.forma_pagamento ?? "—" },
            { titulo: "Origem", celula: (v) => ORIGEM_LABEL[v.origem_pagamento] ?? v.origem_pagamento },
            { titulo: "Status", celula: (v) => STATUS_LABEL[v.status] ?? v.status },
            { titulo: "Data", celula: (v) => formatarData(v.data_pagamento) },
            { titulo: "Cupom", celula: (v) => <span className="font-mono text-xs">{v.cupom_codigo ?? "—"}</span> },
            { titulo: "Comissão", celula: (v) => (v.comissao_centavos > 0 ? formatarCentavos(v.comissao_centavos) : "—") }
          ]}
        />
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-navy-dark">Comissões de parceiros</h2>
      <p className="mt-1 text-sm text-navy-dark/60">
        Geradas automaticamente quando uma venda com cupom de parceiro é confirmada.{" "}
        {comissoesPendentes.length > 0
          ? `${comissoesPendentes.length} pendente${comissoesPendentes.length !== 1 ? "s" : ""} · ${formatarCentavos(totalComissaoPendenteCentavos)} a pagar.`
          : "Nenhuma comissão pendente."}
      </p>

      <div className="mt-4">
        <TabelaResponsiva
          linhas={comissoes}
          chave={(c) => c.id}
          vazio="Nenhuma comissão gerada ainda. Elas aparecem aqui quando uma venda com cupom de parceiro é confirmada."
          colunas={[
            { titulo: "Parceiro", principal: true, celula: (c) => c.parceiro?.nome ?? "—" },
            {
              titulo: "Venda",
              celula: (c) => (
                <div>
                  <p>{c.pagamento?.comprador_nome ?? "—"}</p>
                  <p className="text-xs text-navy-dark/50">
                    {c.pagamento?.plano_nome ?? "—"} · {formatarData(c.pagamento?.data_pagamento ?? null)}
                  </p>
                </div>
              )
            },
            { titulo: "Valor", celula: (c) => <span className="font-semibold">{formatarCentavos(c.valor_centavos)}</span> },
            { titulo: "Status", celula: (c) => COMISSAO_STATUS_LABEL[c.status] ?? c.status },
            { titulo: "Pago em", celula: (c) => (c.data_pagamento ? formatarData(c.data_pagamento) : "—") }
          ]}
          acoes={(c) =>
            c.status === "pendente" ? (
              <form action={marcarComissaoPaga}>
                <input type="hidden" name="id" value={c.id} />
                <SubmitButton pendingText="..." className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white">
                  Marcar como paga
                </SubmitButton>
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
