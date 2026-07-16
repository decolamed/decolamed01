import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { WhatsappButton } from "@/components/admin/whatsapp-button";
import { formatarCentavos, formatarData } from "@/lib/formatacao";
import type { Matricula, Pagamento, HistoricoAdmin, Profile } from "@/types/database";

const STATUS_MATRICULA_LABEL: Record<string, string> = {
  pendente: "Pendente",
  ativa: "Ativa",
  bloqueada: "Bloqueada",
  cancelada: "Cancelada"
};

const STATUS_PAGAMENTO_LABEL: Record<string, string> = {
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

const EVENTO_LABEL: Record<string, string> = {
  matricula_criada_manual: "Matrícula criada manualmente pelo administrador",
  convite_reenviado: "E-mail de acesso reenviado",
  senha_redefinicao_reenviada: "E-mail de redefinição de senha reenviado",
  usuario_desativado: "Usuário desativado",
  usuario_reativado: "Usuário reativado",
  usuario_promovido_admin: "Promovido a administrador",
  usuario_rebaixado_admin: "Permissão de administrador removida",
  usuario_promovido_parceiro: "Promovido a parceiro",
  usuario_rebaixado_parceiro: "Permissão de parceiro removida"
};

function StatusBadge({ ativo }: { ativo: boolean }) {
  return ativo ? (
    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">Ativo</span>
  ) : (
    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">Desativado</span>
  );
}

export default async function AdminDetalhesUsuarioPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: usuario } = await supabase
    .from("profiles")
    .select("*, planos(nome)")
    .eq("id", params.id)
    .maybeSingle();

  if (!usuario) notFound();

  const profile = usuario as Profile & { planos: { nome: string } | null };

  const { data: matriculasData } = await supabase
    .from("matriculas")
    .select("*, planos(nome)")
    .eq("aluno_id", params.id)
    .order("created_at", { ascending: false });

  const matriculas = (matriculasData as (Matricula & { planos: { nome: string } | null })[]) ?? [];
  const matriculaAtual = matriculas[0] ?? null;

  const matriculaIds = matriculas.map((m) => m.id);
  const { data: pagamentosData } =
    matriculaIds.length > 0
      ? await supabase
          .from("pagamentos")
          .select("*")
          .in("matricula_id", matriculaIds)
          .order("data_pagamento", { ascending: false })
      : { data: [] as Pagamento[] };
  const pagamentos = (pagamentosData as Pagamento[]) ?? [];

  // Cupom utilizado / parceiro responsável — a partir da matrícula atual.
  // Buscamos o cupom pelo código (não há FK cupom_id em matriculas, só o
  // código denormalizado, mesmo padrão já usado em pre_cadastros).
  let cupomInfo: { codigo: string; parceiroNome: string | null; percentualComissao: number } | null = null;
  if (matriculaAtual?.cupom_codigo) {
    const { data: cupom } = await supabase
      .from("cupons")
      .select("codigo, percentual_comissao, parceiro:parceiro_id(nome)")
      .eq("codigo", matriculaAtual.cupom_codigo)
      .maybeSingle();
    if (cupom) {
      cupomInfo = {
        codigo: cupom.codigo,
        parceiroNome: (cupom as any).parceiro?.nome ?? null,
        percentualComissao: cupom.percentual_comissao
      };
    }
  }

  const { data: historicoData } = await supabase
    .from("historico_admin")
    .select("*")
    .eq("usuario_alvo_id", params.id)
    .order("created_at", { ascending: false });
  const historico = (historicoData as HistoricoAdmin[]) ?? [];

  const totalPagoCentavos = pagamentos
    .filter((p) => p.status === "confirmado" || p.status === "recebido")
    .reduce((soma, p) => soma + p.valor_centavos, 0);

  return (
    <div>
      <Link href="/admin/usuarios" className="text-sm text-navy hover:underline">
        ← Voltar para Usuários
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">{profile.nome}</h1>
        <StatusBadge ativo={profile.ativo} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-navy-dark/60">Contato</p>
          <p className="mt-1 font-semibold text-navy-dark">{profile.email}</p>
          <p className="text-sm text-navy-dark/70">{profile.telefone ?? "sem telefone"}</p>
          <div className="mt-2">
            <WhatsappButton telefone={profile.telefone} nome={profile.nome} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-navy-dark/60">Cadastro</p>
          <p className="mt-1 font-semibold text-navy-dark">{formatarData(profile.created_at)}</p>
          <p className="text-sm text-navy-dark/70">
            {profile.criado_manualmente ? "Criado manualmente pelo administrador" : "Criado pelo checkout"}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-navy-dark/60">Plano atual</p>
          <p className="mt-1 font-semibold text-navy-dark">
            {matriculaAtual?.planos?.nome ?? profile.planos?.nome ?? "Sem plano"}
          </p>
          <p className="text-sm text-navy-dark/70">
            Status da matrícula: {matriculaAtual ? STATUS_MATRICULA_LABEL[matriculaAtual.status] : "—"}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-navy-dark/60">Data de início</p>
          <p className="mt-1 font-semibold text-navy-dark">
            {matriculaAtual ? formatarData(matriculaAtual.acesso_liberado_em) : "—"}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-navy-dark/60">Data de vencimento</p>
          <p className="mt-1 font-semibold text-navy-dark">
            {matriculaAtual?.acesso_expira_em ? formatarData(matriculaAtual.acesso_expira_em) : "Sem vencimento"}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-navy-dark/60">Cupom / parceiro</p>
          {cupomInfo ? (
            <>
              <p className="mt-1 font-mono font-semibold text-navy-dark">{cupomInfo.codigo}</p>
              <p className="text-sm text-navy-dark/70">
                {cupomInfo.parceiroNome
                  ? `Parceiro: ${cupomInfo.parceiroNome} (${cupomInfo.percentualComissao}% comissão)`
                  : "Cupom sem parceiro vinculado"}
              </p>
            </>
          ) : (
            <p className="mt-1 text-navy-dark/70">Nenhum cupom utilizado</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-navy-dark/60">Valores pagos</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-navy-dark">
            {formatarCentavos(totalPagoCentavos)}
          </p>
          <p className="text-sm text-navy-dark/70">
            {pagamentos.length} pagamento{pagamentos.length !== 1 ? "s" : ""} registrado
            {pagamentos.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-lg font-bold text-navy-dark">Histórico de pagamentos</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy-dark/70">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Plano</th>
              <th className="p-3">Valor bruto</th>
              <th className="p-3">Valor líquido</th>
              <th className="p-3">Origem</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{formatarData(p.data_pagamento)}</td>
                <td className="p-3">{p.plano_nome ?? "—"}</td>
                <td className="p-3">{formatarCentavos(p.valor_centavos)}</td>
                <td className="p-3">{formatarCentavos(p.valor_liquido_centavos ?? p.valor_centavos)}</td>
                <td className="p-3">{ORIGEM_LABEL[p.origem_pagamento] ?? p.origem_pagamento}</td>
                <td className="p-3">{STATUS_PAGAMENTO_LABEL[p.status] ?? p.status}</td>
              </tr>
            ))}
            {pagamentos.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-navy-dark/50">Nenhum pagamento registrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-lg font-bold text-navy-dark">Eventos importantes</h2>
      <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow">
        <ul className="divide-y">
          {historico.map((h) => (
            <li key={h.id} className="p-4 text-sm">
              <p className="font-semibold text-navy-dark">{EVENTO_LABEL[h.tipo] ?? h.tipo}</p>
              <p className="text-xs text-navy-dark/50">{formatarData(h.created_at)}</p>
            </li>
          ))}
          {historico.length === 0 && (
            <li className="p-6 text-center text-sm text-navy-dark/50">Nenhum evento administrativo registrado.</li>
          )}
        </ul>
      </div>

      {matriculas.length > 1 && (
        <>
          <h2 className="mt-10 font-display text-lg font-bold text-navy-dark">Outras matrículas</h2>
          <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy/5 text-navy-dark/70">
                <tr>
                  <th className="p-3">Plano</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Início</th>
                  <th className="p-3">Vencimento</th>
                </tr>
              </thead>
              <tbody>
                {matriculas.slice(1).map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="p-3">{m.planos?.nome ?? "—"}</td>
                    <td className="p-3">{STATUS_MATRICULA_LABEL[m.status] ?? m.status}</td>
                    <td className="p-3">{formatarData(m.acesso_liberado_em)}</td>
                    <td className="p-3">{m.acesso_expira_em ? formatarData(m.acesso_expira_em) : "Sem vencimento"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
