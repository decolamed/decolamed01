import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/admin/submit-button";
import { formatarCentavos, formatarData } from "@/lib/formatacao";
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

  let query = supabase.from("pagamentos").select("*").order("data_pagamento", { ascending: false });

  if (searchParams.de) query = query.gte("data_pagamento", new Date(searchParams.de).toISOString());
  if (searchParams.ate) {
    const fim = new Date(searchParams.ate);
    fim.setHours(23, 59, 59, 999);
    query = query.lte("data_pagamento", fim.toISOString());
  }
  if (searchParams.planoId) query = query.eq("plano_id", searchParams.planoId);
  if (searchParams.status) query = query.eq("status", searchParams.status);
  if (searchParams.cupom) query = query.eq("cupom_codigo", searchParams.cupom.trim().toUpperCase());
  if (searchParams.parceiroId) query = query.eq("parceiro_id", searchParams.parceiroId);

  const [{ data: vendas }, { data: planos }, { data: cupons }, { data: parceiros }, { data: comissoesData }] = await Promise.all([
    query,
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
      .order("created_at", { ascending: false })
  ]);

  const lista = (vendas as Pagamento[]) ?? [];
  type ComissaoComRelacoes = ComissaoParceiro & {
    parceiro: { nome: string } | null;
    pagamento: { comprador_nome: string | null; plano_nome: string | null; data_pagamento: string | null } | null;
  };
  const comissoes = (comissoesData as ComissaoComRelacoes[] | null) ?? [];
  const comissoesPendentes = comissoes.filter((c) => c.status === "pendente");
  const totalComissaoPendenteCentavos = comissoesPendentes.reduce((soma, c) => soma + c.valor_centavos, 0);

  // Resumo. "Vendido"/"líquido" considera apenas vendas confirmadas ou
  // recebidas — pendentes, estornadas e falhas não entram no faturamento.
  const efetivadas = lista.filter((v) => v.status === "confirmado" || v.status === "recebido");
  const totalVendidoCentavos = efetivadas.reduce((soma, v) => soma + v.valor_centavos, 0);
  const totalLiquidoCentavos = efetivadas.reduce(
    (soma, v) => soma + (v.valor_liquido_centavos ?? v.valor_centavos - v.comissao_centavos),
    0
  );
  const ticketMedioCentavos = efetivadas.length > 0 ? Math.round(totalVendidoCentavos / efetivadas.length) : 0;

  const vendasPorPlano = new Map<string, { quantidade: number; totalCentavos: number }>();
  for (const v of efetivadas) {
    const chave = v.plano_nome ?? "Sem plano";
    const atual = vendasPorPlano.get(chave) ?? { quantidade: 0, totalCentavos: 0 };
    atual.quantidade += 1;
    atual.totalCentavos += v.valor_centavos;
    vendasPorPlano.set(chave, atual);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Vendas</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total vendido", value: formatarCentavos(totalVendidoCentavos) },
          { label: "Total líquido recebido", value: formatarCentavos(totalLiquidoCentavos) },
          { label: "Quantidade de vendas", value: String(efetivadas.length) },
          { label: "Ticket médio", value: formatarCentavos(ticketMedioCentavos) }
        ].map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-navy-dark/60">{card.label}</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-navy-dark">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Vendas por plano</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {[...vendasPorPlano.entries()].map(([plano, dados]) => (
            <div key={plano} className="rounded-xl bg-navy/5 px-4 py-3">
              <p className="text-sm font-semibold text-navy-dark">{plano}</p>
              <p className="text-xs text-navy-dark/60">
                {dados.quantidade} venda{dados.quantidade !== 1 ? "s" : ""} · {formatarCentavos(dados.totalCentavos)}
              </p>
            </div>
          ))}
          {vendasPorPlano.size === 0 && <p className="text-sm text-navy-dark/50">Nenhuma venda no período/filtro selecionado.</p>}
        </div>
      </div>

      <form className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-6 shadow" action="/admin/vendas">
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

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy-dark/70">
            <tr>
              <th className="p-3">Comprador</th>
              <th className="p-3">Plano</th>
              <th className="p-3">Valor bruto</th>
              <th className="p-3">Valor líquido</th>
              <th className="p-3">Forma</th>
              <th className="p-3">Origem</th>
              <th className="p-3">Status</th>
              <th className="p-3">Data</th>
              <th className="p-3">Cupom</th>
              <th className="p-3">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-3">
                  <p>{v.comprador_nome ?? "—"}</p>
                  <p className="text-xs text-navy-dark/50">{v.comprador_email ?? "—"}</p>
                </td>
                <td className="p-3">{v.plano_nome ?? "—"}</td>
                <td className="p-3">{formatarCentavos(v.valor_centavos)}</td>
                <td className="p-3">{formatarCentavos(v.valor_liquido_centavos ?? v.valor_centavos)}</td>
                <td className="p-3">{v.forma_pagamento ?? "—"}</td>
                <td className="p-3">{ORIGEM_LABEL[v.origem_pagamento] ?? v.origem_pagamento}</td>
                <td className="p-3">{STATUS_LABEL[v.status] ?? v.status}</td>
                <td className="p-3">{formatarData(v.data_pagamento)}</td>
                <td className="p-3 font-mono text-xs">{v.cupom_codigo ?? "—"}</td>
                <td className="p-3">{v.comissao_centavos > 0 ? formatarCentavos(v.comissao_centavos) : "—"}</td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={10} className="p-6 text-center text-navy-dark/50">Nenhuma venda encontrada para este filtro.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-navy-dark">Comissões de parceiros</h2>
      <p className="mt-1 text-sm text-navy-dark/60">
        Geradas automaticamente quando uma venda com cupom de parceiro é confirmada.{" "}
        {comissoesPendentes.length > 0
          ? `${comissoesPendentes.length} pendente${comissoesPendentes.length !== 1 ? "s" : ""} · ${formatarCentavos(totalComissaoPendenteCentavos)} a pagar.`
          : "Nenhuma comissão pendente."}
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy-dark/70">
            <tr>
              <th className="p-3">Parceiro</th>
              <th className="p-3">Venda</th>
              <th className="p-3">Valor</th>
              <th className="p-3">Status</th>
              <th className="p-3">Pago em</th>
              <th className="p-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {comissoes.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.parceiro?.nome ?? "—"}</td>
                <td className="p-3">
                  <p>{c.pagamento?.comprador_nome ?? "—"}</p>
                  <p className="text-xs text-navy-dark/50">
                    {c.pagamento?.plano_nome ?? "—"} · {formatarData(c.pagamento?.data_pagamento ?? null)}
                  </p>
                </td>
                <td className="p-3 font-semibold">{formatarCentavos(c.valor_centavos)}</td>
                <td className="p-3">{COMISSAO_STATUS_LABEL[c.status] ?? c.status}</td>
                <td className="p-3">{c.data_pagamento ? formatarData(c.data_pagamento) : "—"}</td>
                <td className="p-3">
                  {c.status === "pendente" ? (
                    <form action={marcarComissaoPaga}>
                      <input type="hidden" name="id" value={c.id} />
                      <SubmitButton pendingText="..." className="rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white">
                        Marcar como paga
                      </SubmitButton>
                    </form>
                  ) : (
                    <span className="text-navy-dark/40">—</span>
                  )}
                </td>
              </tr>
            ))}
            {comissoes.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-navy-dark/50">
                  Nenhuma comissão gerada ainda. Elas aparecem aqui quando uma venda com cupom de parceiro é confirmada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
