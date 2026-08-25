import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { PLANO_DO_ALUNO } from "@/lib/supabase/vinculos";
import { WhatsappButton } from "@/components/admin/whatsapp-button";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { formatarCentavos, formatarData } from "@/lib/formatacao";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EditorDoDia } from "@/components/admin/editor-do-dia";
import { TabelaResponsiva } from "@/components/admin/tabela-responsiva";
import { DesempenhoDoAluno } from "@/components/admin/desempenho-aluno";
import { carregarDesempenho } from "@/lib/site/desempenho-servidor";
import { hojeISO } from "@/lib/site/data";
import { alunoTemCopiloto } from "@/lib/copiloto/permissao";
import { getMateriasDoConteudo } from "@/lib/site/materias";
import { SENTIMENTOS_VALIDOS } from "@/lib/site/sentimentos";
import {
  adicionarMissaoIndividual,
  excluirMissaoIndividual,
  atualizarPerfilDoUsuario,
  gerarCronogramaDoAluno,
  salvarDiaDaRota,
  restaurarDiaDaRota
} from "./actions";
import { reenviarConvite, reenviarSenha } from "../actions";
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
    <span className="rounded-full bg-green-soft px-2 py-1 text-xs font-semibold text-green">Ativo</span>
  ) : (
    <span className="rounded-full bg-red-soft px-2 py-1 text-xs font-semibold text-red">Desativado</span>
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

// Mesma lógica do Painel do Professor (`adicionarCredito` em
// app/professor/actions.ts): um ajuste manual de +1 em
// `redacoes_creditos_ajustes`. O admin já sabia DIMINUIR crédito
// ("Registrar correção realizada", que grava em
// `redacoes_creditos_consumidos`), mas não tinha como devolver um — se
// registrasse uma correção por engano, não havia volta pelo painel.
//
// O total do aluno é sempre `plano + ajustes − consumidos`, então somar aqui
// é exatamente o que o professor já faz, pela mesma tabela.
async function adicionarCreditoRedacao(alunoId: string) {
  "use server";
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("redacoes_creditos_ajustes").insert({
    aluno_id: alunoId,
    quantidade: 1,
    motivo: "Crédito adicionado manualmente pelo administrador",
    criado_por: admin.id
  });
  revalidatePath(`/admin/usuarios/${alunoId}`);
  if (error) {
    console.error("Falha ao adicionar crédito de redação:", error);
    redirect(`/admin/usuarios/${alunoId}?erro=${encodeURIComponent("Não foi possível adicionar o crédito.")}`);
  }
  redirect(`/admin/usuarios/${alunoId}?sucesso=${encodeURIComponent("Crédito de redação adicionado.")}`);
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
    .select(`*, ${PLANO_DO_ALUNO}(nome, creditos_redacao)`)
    .eq("id", params.id)
    .maybeSingle();

  if (!usuario) notFound();

  const profile = usuario as Profile & { planos: { nome: string; creditos_redacao: number } | null };

  // Briefing e cronograma do Voo Guiado. O briefing INICIAL passou a ser
  // preenchido aqui pelo mentor, depois da mentoria — o aluno não preenche
  // mais (ele mantém só o Recalibrar Voo). `aluno_rota_dias` é a MESMA tabela
  // que a tela do aluno lê: não existe cronograma "administrativo" separado.
  const [temCopiloto, materiasDoBriefing] = await Promise.all([
    alunoTemCopiloto(params.id),
    getMateriasDoConteudo()
  ]);
  const [{ data: briefingDoAluno }, { data: rotaDoAlunoDias }, { data: diasEditadosData }] = await Promise.all([
    supabase.from("aluno_briefing").select("*").eq("aluno_id", params.id).maybeSingle(),
    supabase
      .from("aluno_rota_dias")
      .select("route_day, scheduled_date, tipo, titulo, itens, minutos")
      .eq("aluno_id", params.id)
      .order("route_day"),
    // Quais dias o mentor já editou. A rota persistida já reflete a edição
    // (ela é regerada a cada leitura da tela do aluno); esta marca é o que
    // permite oferecer "Voltar ao automático" só nos dias certos.
    supabase.from("aluno_rota_dias_ajustes").select("route_day").eq("aluno_id", params.id)
  ]);
  const diasEditados = new Set(((diasEditadosData as { route_day: number }[]) ?? []).map((d) => d.route_day));
  const briefing = briefingDoAluno as Record<string, any> | null;
  const rotaGerada =
    (rotaDoAlunoDias as {
      route_day: number;
      scheduled_date: string;
      tipo: string;
      titulo: string;
      // `itens` sempre trouxe o item inteiro do banco; era o tipo declarado
      // aqui que descrevia menos, porque a tela só usava o comprimento da
      // lista. O editor precisa de todos os campos.
      itens: {
        titulo: string;
        tipo?: string | null;
        materia?: string | null;
        url?: string | null;
        ref_id?: string | null;
      }[];
      minutos: number;
    }[]) ?? [];

  // Totais da rota, para o cabeçalho da visão completa dizer o tamanho real
  // do que está abaixo em vez de só a contagem de dias.
  const totalDeItens = rotaGerada.reduce((s, d) => s + (d.itens ?? []).length, 0);
  const totalDeMinutos = rotaGerada.reduce((s, d) => s + (d.minutos ?? 0), 0);

  const sentimentosSalvos = (briefing?.sentimentos ?? {}) as Record<string, string>;
  const diasSalvos = (briefing?.dias_estuda as string[] | null) ?? [];

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
    // 30 não cobria uma rota longa: as missões dos últimos dias ficavam de
    // fora e o dia aparecia vazio na visão completa mesmo tendo conteúdo.
    .limit(300);
  const missoes = ((missoesData as AlunoMissao[]) ?? []).sort((m1, m2) => m1.data.localeCompare(m2.data));
  const adicionarMissaoComId = adicionarMissaoIndividual.bind(null, params.id);

  // Materiais que a missão manual pode abrir. Vêm da MESMA biblioteca que o
  // app do aluno já lê (`conteudos_biblioteca`) — anexar aqui é apontar para
  // um registro que existe, não cadastrar um material paralelo.
  const { data: materiaisData } = await supabase
    .from("conteudos_biblioteca")
    .select("id, titulo, tipo, materia")
    .eq("ativo", true)
    .not("url", "is", null)
    .order("materia")
    .order("titulo");
  const materiais = (materiaisData ?? []) as { id: string; titulo: string; tipo: string; materia: string | null }[];

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
          <a href="#editar-perfil" className="mt-3 inline-block text-xs font-bold text-navy hover:underline">
            Editar perfil ↓
          </a>
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
          <form action={adicionarCreditoRedacao.bind(null, params.id)} className="mt-3">
            <SubmitButton
              pendingText="Adicionando..."
              className="w-full rounded-lg border-2 border-navy px-3 py-2 text-sm font-semibold text-navy hover:bg-navy hover:text-white"
            >
              ➕ Adicionar crédito de redação
            </SubmitButton>
          </form>
          {creditosDisponiveis > 0 && (
            <form action={registrarComId} className="mt-2 space-y-2">
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

      {/* ----------------------------------------------------------------
          Editar perfil

          Existe para o fluxo de preparar a conta com um e-mail provisório e
          trocar pelo real na entrega. A troca mexe na AUTENTICAÇÃO junto —
          ver `atualizarPerfilDoUsuario`; alterar só a exibição deixaria o
          aluno entrando pelo e-mail antigo.
          ---------------------------------------------------------------- */}
      {/* ----------------------------------------------------------------
          Briefing inicial do Voo Guiado — preenchido pelo MENTOR

          O aluno não preenche mais o briefing inicial: o mentor faz a
          mentoria e transcreve aqui. "Gerar e enviar" grava o briefing e
          chama o MESMO motor de sempre (salvarBriefingDoAluno →
          reprojetarJornada → regerarRotaDoAluno → gerarRota). Reenviar não
          duplica: a rota anterior é apagada antes da nova.

          Só aparece para quem tem Copiloto. O Decolando não usa briefing e
          não vê esta seção.
          ---------------------------------------------------------------- */}
      {temCopiloto && (
        <>
          <h2 id="briefing" className="mt-10 font-display text-lg font-bold text-navy-dark">
            Briefing e cronograma do Voo Guiado
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-navy-dark/60">
            {briefing
              ? "O cronograma deste aluno já foi gerado. Ajuste os dados e envie de novo para regerá-lo — a rota anterior é substituída, sem duplicar."
              : "Este aluno ainda está vendo “seu plano de voo está sendo preparado”. Preencha o briefing da mentoria e envie para gerar o cronograma dele."}
          </p>

          <form
            action={gerarCronogramaDoAluno.bind(null, params.id)}
            className="mt-3 max-w-2xl rounded-2xl bg-white p-6 shadow"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-navy-dark" htmlFor="data_prova">
                  Data da prova
                </label>
                <input
                  id="data_prova"
                  name="data_prova"
                  type="date"
                  required
                  defaultValue={(briefing?.data_prova as string | null) ?? ""}
                  className="mt-1 w-full rounded-lg border p-3"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-navy-dark" htmlFor="inicio_estudos">
                  Início dos estudos
                </label>
                <input
                  id="inicio_estudos"
                  name="inicio_estudos"
                  type="date"
                  defaultValue={(briefing?.inicio_estudos as string | null) ?? hojeISO()}
                  className="mt-1 w-full rounded-lg border p-3"
                />
                <p className="mt-1 text-xs text-navy-dark/50">Vazio = começa hoje.</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-navy-dark" htmlFor="dias_por_semana">
                  Dias de estudo por semana
                </label>
                <input
                  id="dias_por_semana"
                  name="dias_por_semana"
                  type="number"
                  min={1}
                  max={7}
                  required
                  defaultValue={diasSalvos.length || 5}
                  className="mt-1 w-full rounded-lg border p-3"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-navy-dark" htmlFor="horas_por_dia">
                  Horas de estudo por dia
                </label>
                <input
                  id="horas_por_dia"
                  name="horas_por_dia"
                  type="number"
                  min={1}
                  max={12}
                  required
                  defaultValue={(briefing?.horas_por_dia_semana as number | null) ?? 3}
                  className="mt-1 w-full rounded-lg border p-3"
                />
                <p className="mt-1 text-xs text-navy-dark/50">Teto por dia — o algoritmo nunca passa disso.</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-navy-dark">Idioma que o aluno fará na prova</p>
              <div className="mt-2 flex gap-4">
                {[
                  { valor: "ingles", rotulo: "Inglês" },
                  { valor: "espanhol", rotulo: "Espanhol" }
                ].map((o) => (
                  <label key={o.valor} className="flex items-center gap-2 text-sm text-navy-dark">
                    <input
                      type="radio"
                      name="idioma_prova"
                      value={o.valor}
                      required
                      defaultChecked={(briefing?.idioma_prova as string | null) === o.valor}
                    />
                    {o.rotulo}
                  </label>
                ))}
              </div>
            </div>

            {/* Autoavaliação por matéria. Os nomes dos campos são ASCII e
                indexados de propósito — a matéria viaja como VALOR, nunca
                como nome de campo (ver lib/site/sentimentos.ts). */}
            <div className="mt-5">
              <p className="text-sm font-semibold text-navy-dark">Como o aluno está em cada matéria</p>
              <p className="mt-1 text-xs text-navy-dark/50">
                É o que mais pesa na personalização: Turbulência puxa a matéria para cima, Domínio reduz a
                frequência — sem nunca zerar a matéria.
              </p>
              <div className="mt-3 space-y-2">
                {materiasDoBriefing.map((materia, i) => (
                  <div key={materia} className="flex flex-wrap items-center gap-3 rounded-xl bg-navy-dark/5 p-3">
                    <input type="hidden" name={`sentimento_materia_${i}`} value={materia} />
                    <span className="min-w-[120px] text-sm font-semibold text-navy-dark">{materia}</span>
                    <div className="flex flex-wrap gap-3">
                      {[...SENTIMENTOS_VALIDOS].map((valor) => (
                        <label key={valor} className="flex items-center gap-1.5 text-xs text-navy-dark/80">
                          <input
                            type="radio"
                            name={`sentimento_valor_${i}`}
                            value={valor}
                            defaultChecked={(sentimentosSalvos[materia] ?? "Atenção") === valor}
                          />
                          {valor}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold text-navy-dark" htmlFor="observacoes">
                Observações da mentoria
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                rows={3}
                defaultValue={(briefing?.observacoes as string | null) ?? ""}
                className="mt-1 w-full rounded-lg border p-3"
                placeholder="Rotina, dificuldades, objetivos — o que ajudar a entender o aluno depois."
              />
            </div>

            <ConfirmSubmitButton
              pendingText="Gerando cronograma..."
              confirmMessage={
                briefing
                  ? `Regerar o cronograma de ${profile.nome}?\n\nA rota atual é substituída pela nova. O progresso e o histórico do aluno são preservados.`
                  : `Gerar e enviar o cronograma de ${profile.nome}?\n\nEle passa a ver o cronograma imediatamente.`
              }
              className="mt-5 rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
            >
              {briefing ? "Regerar e enviar cronograma" : "Gerar e enviar cronograma"}
            </ConfirmSubmitButton>
          </form>

          {/* O cronograma gerado, lido de `aluno_rota_dias` — a MESMA tabela
              que a tela do aluno usa. É a conferência que o mentor precisa. */}
          <div className="mt-4 max-w-4xl rounded-2xl bg-white p-6 shadow">
            <h3 className="font-display font-bold text-navy-dark">Cronograma gerado</h3>
            {rotaGerada.length === 0 ? (
              <p className="mt-2 text-sm text-navy-dark/60">
                Nenhuma rota gerada ainda. Ela aparece aqui assim que você enviar o briefing.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-navy-dark/60">
                  {rotaGerada.length} dias, {totalDeItens} itens, {Math.round(totalDeMinutos / 60)}h no total — é
                  exatamente o que <strong>{profile.nome}</strong> está vendo.{" "}
                  <strong className="text-navy-dark">Clique em qualquer dia para abrir e editar.</strong>
                </p>
                {/* Esta frase substituiu um link para /admin/trilha que dizia
                    "para ajustar o conteúdo dos dias, use Conteúdo →
                    Cronograma". Era o convite errado: /admin/trilha é o
                    TEMPLATE de 40 dias, compartilhado por todos os alunos —
                    quem fosse até lá para acertar o cronograma de um aluno
                    mudaria o de todo mundo, sem nada na tela avisando. Agora a
                    edição acontece aqui, e o aviso é sobre a diferença. */}
                <p className="mt-2 rounded-lg bg-sky p-3 text-xs text-navy-dark/70">
                  O que você editar aqui vale <strong>só para este aluno</strong>. O cronograma de 40 dias em{" "}
                  <Link href="/admin/trilha" className="font-semibold text-navy hover:underline">
                    Conteúdo → Cronograma
                  </Link>{" "}
                  é o modelo compartilhado por <strong>todos</strong> — alterá-lo muda o cronograma de todo mundo, não o
                  deste aluno.
                </p>
                {/* Visão COMPLETA: cada dia com os itens que o aluno vai abrir.
                    Antes esta lista era um resumo — uma linha por dia, com
                    "N itens · M min" e nada sobre o que eram esses itens. O
                    mentor conferia a forma do cronograma sem conseguir
                    conferir o conteúdo, que é justamente o que ele precisa
                    revisar depois da mentoria.

                    Sem altura máxima: "cronograma completo" quer dizer rolar a
                    página, não rolar uma caixinha de 384px dentro dela. */}
                <ul className="mt-3 divide-y divide-navy-dark/10 text-sm">
                  {rotaGerada.map((d) => {
                    const editado = diasEditados.has(d.route_day);
                    const itens = d.itens ?? [];
                    // Missões que o mentor colocou NA DATA deste dia. Elas
                    // vivem em `aluno_missoes` e são um acréscimo ao dia —
                    // não fazem parte da lista que ele edita aqui.
                    const manuais = missoes.filter((m) => m.data === d.scheduled_date);
                    // Simulado e dia da prova são a espinha da rota: o resto
                    // se organiza em volta deles, e trocar o conteúdo de um
                    // dia desses desalinharia o cronograma inteiro.
                    const editavel = d.tipo !== "simulado" && d.tipo !== "prova";
                    return (
                      <li key={d.route_day} className="py-2">
                        <details>
                          <summary className="flex cursor-pointer flex-wrap items-baseline gap-2 marker:text-navy-dark/30">
                            <span className="min-w-[64px] text-xs font-extrabold text-navy-dark/50">
                              Dia {d.route_day}
                            </span>
                            <span className="text-xs text-navy-dark/50">{formatarData(d.scheduled_date)}</span>
                            <span className={`font-semibold ${itens.length === 0 ? "text-navy-dark/40" : "text-navy-dark"}`}>
                              {d.titulo}
                            </span>
                            {editado && (
                              <span className="rounded bg-blue-soft px-2 py-0.5 text-[11px] font-semibold text-navy">
                                editado por você
                              </span>
                            )}
                            {manuais.length > 0 && (
                              <span className="rounded bg-blue-soft px-2 py-0.5 text-[11px] font-semibold text-navy">
                                +{manuais.length} {manuais.length === 1 ? "missão" : "missões"}
                              </span>
                            )}
                            <span className="ml-auto text-xs text-navy-dark/50">
                              {itens.length === 0 ? "vazio" : `${itens.length} itens · ${d.minutos} min`}
                            </span>
                            <span className="text-xs font-semibold text-navy">
                              {editavel ? "editar" : "ver"}
                            </span>
                          </summary>

                          <div className="mt-2 pl-2 sm:pl-[72px]">
                            {editavel ? (
                              <form action={salvarDiaDaRota.bind(null, params.id, d.route_day)}>
                                <input
                                  name="titulo"
                                  defaultValue={editado ? d.titulo : ""}
                                  placeholder="Título do dia (vazio = automático)"
                                  aria-label={`Título do dia ${d.route_day}`}
                                  className="w-full rounded-lg border border-navy/15 p-2 text-sm font-semibold"
                                />
                                <EditorDoDia
                                  itensIniciais={itens.map((i) => ({
                                    tipo: i.tipo ?? "aula",
                                    titulo: i.titulo,
                                    materia: i.materia ?? null,
                                    url: i.url ?? null,
                                    ref_id: i.ref_id ?? null
                                  }))}
                                />
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                  <SubmitButton
                                    pendingText="Salvando..."
                                    className="rounded-full bg-orange px-5 py-2 text-sm font-bold text-white hover:bg-orange-dark"
                                  >
                                    Salvar o Dia {d.route_day}
                                  </SubmitButton>
                                  {editado && (
                                    <ConfirmSubmitButton
                                      formAction={restaurarDiaDaRota.bind(null, params.id, d.route_day)}
                                      confirmMessage={`Descartar a sua edição do Dia ${d.route_day}?\n\nEle volta a ser montado pelo cronograma automático, a partir do briefing e do desempenho do aluno.`}
                                      className="text-xs font-semibold text-navy hover:underline"
                                    >
                                      Voltar ao automático
                                    </ConfirmSubmitButton>
                                  )}
                                </div>
                              </form>
                            ) : (
                              <div className="rounded-lg bg-sky p-3 text-xs text-navy-dark/60">
                                {itens.map((i, k) => (
                                  <p key={k}>• {i.titulo}</p>
                                ))}
                                <p className="mt-2">
                                  {d.tipo === "prova" ? "O dia da prova" : "O dia de simulado"} não é editável: ele é a
                                  referência que posiciona todo o resto da rota.
                                </p>
                              </div>
                            )}

                            {manuais.length > 0 && (
                              <div className="mt-3 rounded-lg bg-blue-soft p-3">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-navy/60">
                                  Missões avulsas nesta data
                                </p>
                                {manuais.map((m) => (
                                  <p key={m.id} className="mt-1 text-xs text-navy">
                                    + {m.titulo}
                                    {m.materia ? ` · ${m.materia}` : ""}
                                  </p>
                                ))}
                                <p className="mt-2 text-[11px] text-navy/60">
                                  Estas vêm de “Cronograma individual”, mais abaixo, e são um acréscimo ao dia.
                                </p>
                              </div>
                            )}
                          </div>
                        </details>
                      </li>
                    );
                  })}
                </ul>
                {diasEditados.size > 0 && (
                  <p className="mt-3 rounded-lg bg-blue-soft p-3 text-xs text-navy-dark/70">
                    {diasEditados.size === 1 ? "1 dia foi editado" : `${diasEditados.size} dias foram editados`} por
                    você. Esses dias deixam de ser recalculados pelo cronograma automático e passam a valer como você
                    os deixou — só para este aluno. Use <strong>Voltar ao automático</strong> dentro do dia para
                    devolvê-lo ao algoritmo.
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}

      <h2 id="editar-perfil" className="mt-10 font-display text-lg font-bold text-navy-dark">
        Editar perfil
      </h2>
      <form
        action={atualizarPerfilDoUsuario.bind(null, params.id)}
        className="mt-3 max-w-xl rounded-2xl bg-white p-6 shadow"
      >
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-navy-dark" htmlFor="perfil-nome">
              Nome completo
            </label>
            <input
              id="perfil-nome"
              name="nome"
              defaultValue={profile.nome}
              required
              minLength={3}
              className="mt-1 w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-navy-dark" htmlFor="perfil-email">
              E-mail da conta
            </label>
            <input
              id="perfil-email"
              name="email"
              type="email"
              defaultValue={profile.email}
              required
              className="mt-1 w-full rounded-lg border p-3"
            />
            <p className="mt-1 text-xs text-navy-dark/55">
              É o endereço usado para <strong>entrar na plataforma</strong> e recuperar a senha. Trocar aqui muda os
              dois — a conta continua sendo a mesma, com o mesmo cronograma, progresso e histórico.
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-navy-dark" htmlFor="perfil-telefone">
              Telefone/WhatsApp
            </label>
            <input
              id="perfil-telefone"
              name="telefone"
              defaultValue={profile.telefone ?? ""}
              className="mt-1 w-full rounded-lg border p-3"
            />
          </div>
        </div>

        <ConfirmSubmitButton
          pendingText="Salvando..."
          confirmMessage={`Salvar o perfil de ${profile.nome}?\n\nSe o e-mail mudou, ele passa a valer para login e recuperação de senha imediatamente. Nada mais da conta é alterado.`}
          className="mt-5 rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Salvar alterações
        </ConfirmSubmitButton>
      </form>

      <div className="mt-4 max-w-xl rounded-2xl bg-white p-6 shadow">
        <h3 className="font-display font-bold text-navy-dark">Enviar acesso ao aluno</h3>
        <p className="mt-1 text-sm text-navy-dark/60">
          Envia para <strong>{profile.email}</strong> — o endereço que está gravado agora, não o que estava na tela
          quando ela foi aberta.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <form action={reenviarConvite}>
            <input type="hidden" name="id" value={params.id} />
            <input type="hidden" name="voltarPara" value={`/admin/usuarios/${params.id}`} />
            <ConfirmSubmitButton
              pendingText="Enviando..."
              confirmMessage={`Enviar o e-mail de acesso para ${profile.email}?`}
              className="rounded-full border-2 border-navy px-5 py-2.5 text-sm font-display font-bold text-navy hover:bg-navy hover:text-white"
            >
              Enviar acesso
            </ConfirmSubmitButton>
          </form>
          <form action={reenviarSenha}>
            <input type="hidden" name="id" value={params.id} />
            <input type="hidden" name="voltarPara" value={`/admin/usuarios/${params.id}`} />
            <ConfirmSubmitButton
              pendingText="Enviando..."
              confirmMessage={`Enviar o link de redefinição de senha para ${profile.email}?`}
              className="rounded-full border-2 border-navy/30 px-5 py-2.5 text-sm font-display font-bold text-navy-dark/70 hover:border-navy hover:text-navy"
            >
              Redefinir senha
            </ConfirmSubmitButton>
          </form>
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
                  className="text-red hover:underline"
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
        <form action={adicionarMissaoComId} className="grid gap-2 border-t p-4 sm:grid-cols-6">
          <input type="date" name="data" required className="rounded-lg border p-2 text-sm sm:col-span-2" />
          <input name="titulo" required placeholder="Título da missão" className="rounded-lg border p-2 text-sm sm:col-span-4" />
          <select name="tipo" defaultValue="livre" className="rounded-lg border p-2 text-sm sm:col-span-2">
            {Object.entries(TIPO_MISSAO_LABEL).map(([valor, label]) => (
              <option key={valor} value={valor}>{label}</option>
            ))}
          </select>
          <input name="materia" placeholder="Matéria (opcional)" className="rounded-lg border p-2 text-sm sm:col-span-2" />
          <input name="assunto" placeholder="Conteúdo/assunto (opcional)" className="rounded-lg border p-2 text-sm sm:col-span-2" />

          {/* O que a missão ABRE. Sem isto a missão manual nascia sem
              `ref_id` e o clique do aluno não levava a lugar nenhum. */}
          <select name="conteudo_id" defaultValue="" className="rounded-lg border p-2 text-sm sm:col-span-3">
            <option value="">Material da biblioteca (opcional)</option>
            {materiais.map((m) => (
              <option key={m.id} value={m.id}>
                {m.materia ? `${m.materia} · ` : ""}{m.titulo} ({m.tipo})
              </option>
            ))}
          </select>
          <input
            name="url"
            type="url"
            placeholder="…ou cole um link novo (https://)"
            className="rounded-lg border p-2 text-sm sm:col-span-3"
          />

          <input type="number" name="duracao" defaultValue={30} min={5} placeholder="Minutos" className="rounded-lg border p-2 text-sm sm:col-span-2" />
          <SubmitButton pendingText="Adicionando..." className="rounded-lg bg-orange px-4 py-2 text-sm font-semibold text-white hover:bg-orange-dark sm:col-span-4">
            + Adicionar missão individual
          </SubmitButton>
          <p className="text-[11px] font-semibold text-navy-dark/50 sm:col-span-6">
            Missões de <strong>Questões</strong> e <strong>Flashcards</strong> abrem o acervo da matéria escolhida. Para
            abrir um material específico (aula, PDF, link), escolha o tipo <strong>Aula/Material</strong> ou{" "}
            <strong>Livre</strong> e anexe o conteúdo acima — um link novo é salvo na biblioteca e fica reutilizável.
          </p>
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
