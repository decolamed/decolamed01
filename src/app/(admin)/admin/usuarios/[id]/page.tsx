import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { WhatsappButton } from "@/components/admin/whatsapp-button";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { formatarCentavos, formatarData } from "@/lib/formatacao";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { TabelaResponsiva } from "@/components/admin/tabela-responsiva";
import { DesempenhoDoAluno } from "@/components/admin/desempenho-aluno";
import { carregarDesempenho } from "@/lib/site/desempenho-servidor";
import { hojeISO } from "@/lib/site/data";
import { adicionarMissaoIndividual, excluirMissaoIndividual } from "./actions";
import type { Matricula, Pagamento, HistoricoAdmin, Profile, AlunoMissao } from "@/types/database";

const TIPO_MISSAO_LABEL: Record<string, string> = {
  aula: "Aula",
  questoes: "Questões",
  flashcards: "Flashcards",
  simulado: "Simulado",
  revisao: "Revisão",
  livre: "Livre"
};

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
  usuario_rebaixado_parceiro: "Permissão de parceiro removida",
  professor_criado_manual: "Cadastrado manualmente como professor",
  usuario_promovido_professor: "Promovido a professor",
  usuario_rebaixado_professor: "Permissão de professor removida"
};

function StatusBadge({ ativo }: { ativo: boolean }) {
  return ativo ? (
    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">Ativo</span>
  ) : (
    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">Desativado</span>
  );
}

async function registrarConsumoRedacao(alunoId: string, formData: FormData) {
  "use server";
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("redacoes_creditos_consumidos").insert({
    aluno_id: alunoId,
    registrado_por: admin.id,
    observacao: String(formData.get("observacao") ?? "").trim() || null
  });
  revalidatePath(`/admin/usuarios/${alunoId}`);
  if (error) {
    redirect(`/admin/usuarios/${alunoId}?erro=${encodeURIComponent("Não foi possível registrar o consumo de crédito.")}`);
  }
  redirect(`/admin/usuarios/${alunoId}?sucesso=${encodeURIComponent("Correção de redação registrada.")}`);
}

export default async function AdminDetalhesUsuarioPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { erro?: string; sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: usuario } = await supabase
    .from("profiles")
    .select("*, planos(nome, creditos_redacao)")
    .eq("id", params.id)
    .maybeSingle();

  if (!usuario) notFound();

  const profile = usuario as Profile & { planos: { nome: string; creditos_redacao: number } | null };

  const { data: consumidos } = await supabase
    .from("redacoes_creditos_consumidos")
    .select("*")
    .eq("aluno_id", params.id)
    .order("created_at", { ascending: false });
  const { data: ajustes } = await supabase.from("redacoes_creditos_ajustes").select("quantidade").eq("aluno_id", params.id);
  const totalConsumidos = (consumidos ?? []).length;
  const ajustesManuais = (ajustes ?? []).reduce((soma, a: any) => soma + a.quantidade, 0);
  const creditosTotais = (profile.planos?.creditos_redacao ?? 0) + ajustesManuais;
  const creditosDisponiveis = Math.max(0, creditosTotais - totalConsumidos);

  const registrarComId = registrarConsumoRedacao.bind(null, params.id);

  const { data: missoesData } = await supabase
    .from("aluno_missoes")
    .select("*")
    .eq("aluno_id", params.id)
    .order("data", { ascending: false })
    .limit(30);
  const missoes = ((missoesData as AlunoMissao[]) ?? []).sort((m1, m2) => m1.data.localeCompare(m2.data));
  const adicionarMissaoComId = adicionarMissaoIndividual.bind(null, params.id);

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

  // Desempenho pela MESMA leitura e pelas MESMAS contas da tela do aluno
  // (lib/site/desempenho*.ts). Uma segunda implementação aqui é como o painel
  // e o aluno passam a mostrar percentuais diferentes da mesma pessoa.
  const desempenho = await carregarDesempenho(supabase, params.id);

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
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

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

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-sm text-navy-dark/60">Créditos de redação</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-navy-dark">
            {creditosDisponiveis} <span className="text-sm font-normal text-navy-dark/50">de {creditosTotais}</span>
          </p>
          <p className="text-sm text-navy-dark/70">{totalConsumidos} já corrigida{totalConsumidos !== 1 ? "s" : ""}</p>
          {creditosDisponiveis > 0 && (
            <form action={registrarComId} className="mt-3 space-y-2">
              <input
                name="observacao"
                placeholder="Observação (opcional)"
                className="w-full rounded-lg border p-2 text-sm"
              />
              <SubmitButton
                pendingText="Registrando..."
                className="w-full rounded-lg bg-orange px-3 py-2 text-sm font-semibold text-white hover:bg-orange-dark"
              >
                Registrar correção realizada
              </SubmitButton>
            </form>
          )}
        </div>
      </div>

      <h2 className="mt-10 font-display text-lg font-bold text-navy-dark">Histórico de pagamentos</h2>
      {/* Seis colunas numa tabela comum obrigam o admin a arrastar a tela de
          lado no celular. TabelaResponsiva mantém a tabela no desktop e
          transforma cada pagamento num cartão no celular. */}
      <div className="mt-3">
        <TabelaResponsiva
          linhas={pagamentos}
          chave={(p) => p.id}
          vazio="Nenhum pagamento registrado."
          colunas={[
            { titulo: "Data", celula: (p) => formatarData(p.data_pagamento), principal: true },
            { titulo: "Plano", celula: (p) => p.plano_nome ?? "—" },
            { titulo: "Valor bruto", celula: (p) => formatarCentavos(p.valor_centavos) },
            {
              titulo: "Valor líquido",
              celula: (p) => formatarCentavos(p.valor_liquido_centavos ?? p.valor_centavos)
            },
            { titulo: "Origem", celula: (p) => ORIGEM_LABEL[p.origem_pagamento] ?? p.origem_pagamento },
            { titulo: "Status", celula: (p) => STATUS_PAGAMENTO_LABEL[p.status] ?? p.status }
          ]}
        />
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

      <h2 className="mt-10 font-display text-lg font-bold text-navy-dark">Desempenho do aluno</h2>
      <p className="mb-3 mt-1 text-xs font-semibold text-navy-dark/50">
        Os mesmos números que o aluno vê no painel dele — mesma fonte, mesma conta.
      </p>
      <DesempenhoDoAluno dados={desempenho} hoje={hojeISO()} />

      <h2 className="mt-10 font-display text-lg font-bold text-navy-dark">Cronograma individual</h2>
      <p className="mt-1 text-sm text-navy-dark/60">
        Missões só deste aluno — não afeta o cronograma geral (/admin/trilha). Assim que ele tiver pelo menos
        uma missão aqui, o app passa a mostrar essas missões em vez do cronograma compartilhado.
      </p>
      <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow">
        <ul className="divide-y">
          {missoes.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
              <div className="flex-1">
                <p className="font-semibold text-navy-dark">{formatarData(m.data)} · {m.titulo}</p>
                <p className="text-xs text-navy-dark/50">
                  {TIPO_MISSAO_LABEL[m.tipo] ?? m.tipo}{m.materia ? ` · ${m.materia}` : ""} · {m.duracao_minutos} min
                  {m.origem !== "admin" && ` · origem: ${m.origem}`}
                  {m.concluida && " · concluída"}
                </p>
              </div>
              <form action={excluirMissaoIndividual.bind(null, params.id, m.id)}>
                <ConfirmSubmitButton
                  pendingText="..."
                  confirmMessage={`Remover a missão "${m.titulo}" do cronograma de ${profile.nome}?`}
                  className="text-red-600 hover:underline"
                >
                  Remover
                </ConfirmSubmitButton>
              </form>
            </li>
          ))}
          {missoes.length === 0 && (
            <li className="p-6 text-center text-sm text-navy-dark/50">Nenhuma missão individual — este aluno segue o cronograma geral.</li>
          )}
        </ul>
        <form action={adicionarMissaoComId} className="grid gap-2 border-t p-4 sm:grid-cols-5">
          <input type="date" name="data" required className="rounded-lg border p-2 text-sm sm:col-span-1" />
          <input name="titulo" required placeholder="Título da missão" className="rounded-lg border p-2 text-sm sm:col-span-2" />
          <select name="tipo" defaultValue="livre" className="rounded-lg border p-2 text-sm">
            {Object.entries(TIPO_MISSAO_LABEL).map(([valor, label]) => (
              <option key={valor} value={valor}>{label}</option>
            ))}
          </select>
          <input name="materia" placeholder="Matéria (opcional)" className="rounded-lg border p-2 text-sm" />
          <input type="number" name="duracao" defaultValue={30} placeholder="Minutos" className="rounded-lg border p-2 text-sm" />
          <SubmitButton pendingText="Adicionando..." className="rounded-lg bg-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-dark sm:col-span-5">
            + Adicionar missão individual
          </SubmitButton>
        </form>
      </div>

      {matriculas.length > 1 && (
        <>
          <h2 className="mt-10 font-display text-lg font-bold text-navy-dark">Outras matrículas</h2>
          <div className="mt-3">
            <TabelaResponsiva
              linhas={matriculas.slice(1)}
              chave={(m) => m.id}
              vazio="Nenhuma outra matrícula."
              colunas={[
                { titulo: "Plano", celula: (m) => m.planos?.nome ?? "—", principal: true },
                { titulo: "Status", celula: (m) => STATUS_MATRICULA_LABEL[m.status] ?? m.status },
                { titulo: "Início", celula: (m) => formatarData(m.acesso_liberado_em) },
                {
                  titulo: "Vencimento",
                  celula: (m) => (m.acesso_expira_em ? formatarData(m.acesso_expira_em) : "Sem vencimento")
                }
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
