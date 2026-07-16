import { requireParceiro } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { formatarCentavos, formatarData } from "@/lib/formatacao";
import type { Pagamento, Cupom } from "@/types/database";

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  recebido: "Recebido",
  estornado: "Estornado",
  falhou: "Falhou"
};

export default async function ParceiroDashboardPage() {
  const profile = await requireParceiro();
  const supabase = createAdminClient();

  // IMPORTANTE: mesmo usando o client com service role key (mesmo padrão já
  // usado no resto do painel), toda consulta abaixo filtra explicitamente
  // por parceiro_id = profile.id — o parceiro nunca deve ver vendas, cupons
  // ou alunos de mais ninguém. As policies de RLS
  // "pagamentos_select_own_parceiro" / "cupons_select_own_parceiro"
  // (migração 005) reforçam a mesma regra caso esses dados um dia sejam
  // buscados direto do client com a anon key.
  const [{ data: cupons }, { data: vendas }] = await Promise.all([
    supabase.from("cupons").select("*").eq("parceiro_id", profile.id),
    supabase
      .from("pagamentos")
      .select("*")
      .eq("parceiro_id", profile.id)
      .order("created_at", { ascending: false })
  ]);

  const listaCupons = (cupons as Cupom[]) ?? [];
  const listaVendas = (vendas as Pagamento[]) ?? [];

  const vendasConfirmadas = listaVendas.filter((v) => v.status === "confirmado" || v.status === "recebido");
  const totalComissaoAcumulada = vendasConfirmadas.reduce((soma, v) => soma + v.comissao_centavos, 0);
  // Comissão já paga: preparado para quando a tela de pagamento de comissão
  // for implementada (marcar comissoes_parceiro.status = 'paga'). Por ora
  // toda comissão gerada aparece como "a receber".
  const totalComissaoPaga = 0;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Meu painel de afiliado</h1>
      <p className="mt-1 text-navy-dark/60">
        Aqui você acompanha apenas as vendas feitas com o seu cupom. Nenhum outro dado da plataforma fica visível
        para você.
      </p>

      {listaCupons.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow">
          <p className="text-navy-dark/70">
            Você ainda não tem nenhum cupom vinculado. Fale com o administrador para gerar seu cupom de afiliado.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          {listaCupons.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white px-5 py-4 shadow">
              <p className="font-mono text-lg font-bold text-navy-dark">{c.codigo}</p>
              <p className="text-xs text-navy-dark/50">
                {c.percentual_comissao}% de comissão por venda · {c.ativo ? "ativo" : "inativo"}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Vendas com meu cupom", value: String(vendasConfirmadas.length) },
          { label: "Comissão acumulada", value: formatarCentavos(totalComissaoAcumulada) },
          { label: "Comissão já paga", value: formatarCentavos(totalComissaoPaga) },
          { label: "Comissão a receber", value: formatarCentavos(totalComissaoAcumulada - totalComissaoPaga) }
        ].map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-navy-dark/60">{card.label}</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-navy-dark">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-lg font-bold text-navy-dark">Compradores com o seu cupom</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy-dark/70">
            <tr>
              <th className="p-3">Comprador</th>
              <th className="p-3">Plano</th>
              <th className="p-3">Data</th>
              <th className="p-3">Valor da venda</th>
              <th className="p-3">Comissão</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {listaVendas.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="p-3">
                  <p>{v.comprador_nome ?? "—"}</p>
                  <p className="text-xs text-navy-dark/50">{v.comprador_email}</p>
                </td>
                <td className="p-3">{v.plano_nome ?? "—"}</td>
                <td className="p-3">
                  {formatarData(v.data_pagamento)}
                </td>
                <td className="p-3">{formatarCentavos(v.valor_centavos)}</td>
                <td className="p-3 font-semibold text-green-700">{formatarCentavos(v.comissao_centavos)}</td>
                <td className="p-3">{STATUS_LABEL[v.status] ?? v.status}</td>
              </tr>
            ))}
            {listaVendas.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-navy-dark/50">
                  Nenhuma venda com o seu cupom ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
