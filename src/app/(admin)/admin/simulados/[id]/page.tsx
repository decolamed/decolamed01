import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { SeletorQuestoes } from "@/components/admin/seletor-questoes";
import { carregarUsoDasQuestoes } from "@/lib/site/uso-questoes";
import type { Questao, Simulado } from "@/types/database";

// Título, descrição e tempo do simulado. Só podiam ser definidos na
// criação — que usa "Novo simulado"/60min fixos — e não havia nenhuma tela
// para mudá-los depois: corrigir o nome obrigava a excluir o simulado, e
// junto iriam as questões já montadas.
async function salvarMetadadosSimulado(id: string, formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const tempo = Number(formData.get("tempo_minutos") ?? 60);
  // Configurações que antes só existiam em Atividades (Alteração 4.4).
  const gabaritoModo = String(formData.get("gabarito_modo") ?? "ao_final");
  const valorTotal = Number(formData.get("valor_total") ?? 1000);
  const usarPesos = formData.get("usar_pesos") === "on";

  // Item 16: variável Inglês/Espanhol. Com ela ligada, o admin pode cadastrar
  // questões dos dois idiomas no mesmo simulado; o aluno escolhe uma delas ao
  // iniciar e só essa entra na nota.
  const variavelIdioma = formData.get("variavel_idioma") === "on";

  // Item 17: proposta de redação. Só a proposta — a plataforma não coleta o
  // texto do aluno aqui; a correção segue pelo fluxo do professor.
  const temaRedacao = String(formData.get("redacao_tema") ?? "").trim();
  const textosRedacao = String(formData.get("redacao_textos") ?? "").trim();
  const instrucoesRedacao = String(formData.get("redacao_instrucoes") ?? "").trim();
  // Sem tema não há proposta: guardar textos motivadores soltos deixaria o
  // aluno com um item de redação sem saber sobre o que escrever.
  const redacao = temaRedacao
    ? {
        tema: temaRedacao,
        textos_motivadores: textosRedacao || null,
        instrucoes: instrucoesRedacao || null
      }
    : null;

  if (!titulo) {
    redirect(`/admin/simulados/${id}?erro=${encodeURIComponent("Informe um título para o simulado.")}`);
  }
  if (!Number.isFinite(tempo) || tempo <= 0) {
    redirect(`/admin/simulados/${id}?erro=${encodeURIComponent("O tempo precisa ser maior que zero.")}`);
  }
  if (!Number.isFinite(valorTotal) || valorTotal <= 0) {
    redirect(`/admin/simulados/${id}?erro=${encodeURIComponent("O valor total precisa ser maior que zero.")}`);
  }

  const { error } = await supabase
    .from("simulados")
    .update({
      titulo,
      descricao: descricao || null,
      tempo_minutos: tempo,
      gabarito_modo: gabaritoModo === "imediato" ? "imediato" : "ao_final",
      valor_total: valorTotal,
      usar_pesos: usarPesos,
      variavel_idioma: variavelIdioma,
      redacao
    })
    .eq("id", id);

  revalidatePath(`/admin/simulados/${id}`);
  revalidatePath("/admin/simulados");
  revalidatePath("/aluno");
  if (error) {
    redirect(`/admin/simulados/${id}?erro=${encodeURIComponent("Não foi possível salvar os dados do simulado.")}`);
  }
  redirect(`/admin/simulados/${id}?sucesso=${encodeURIComponent("Dados do simulado atualizados.")}`);
}

async function salvarQuestoesDoSimulado(id: string, formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const idsEscolhidos = formData.getAll("questao_id").map(String);

  // Substitui o conjunto inteiro pelo que foi marcado agora — mais simples e
  // previsível do que tentar calcular incrementalmente o que adicionar/remover.
  const { error: delError } = await supabase.from("simulado_questoes").delete().eq("simulado_id", id);
  if (delError) {
    redirect(`/admin/simulados/${id}?erro=${encodeURIComponent("Não foi possível salvar as questões do simulado.")}`);
  }

  if (idsEscolhidos.length > 0) {
    const linhas = idsEscolhidos.map((questaoId, index) => ({
      simulado_id: id,
      questao_id: questaoId,
      ordem: index
    }));
    const { error: insError } = await supabase.from("simulado_questoes").insert(linhas);
    if (insError) {
      redirect(`/admin/simulados/${id}?erro=${encodeURIComponent("Não foi possível salvar as questões do simulado.")}`);
    }
  }

  revalidatePath(`/admin/simulados/${id}`);
  revalidatePath("/admin/simulados");
  redirect(`/admin/simulados/${id}?sucesso=${encodeURIComponent(`${idsEscolhidos.length} questão(ões) salva(s) no simulado.`)}`);
}

export default async function EscolherQuestoesSimuladoPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { erro?: string; sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: simulado } = await supabase.from("simulados").select("*").eq("id", params.id).maybeSingle();
  if (!simulado) notFound();
  const s = simulado as Simulado;

  const { data: todasQuestoes } = await supabase.from("questoes").select("*").eq("ativo", true).order("materia");
  const questoes = (todasQuestoes as Questao[]) ?? [];

  const { data: jaSelecionadas } = await supabase.from("simulado_questoes").select("questao_id").eq("simulado_id", params.id);
  const idsJaSelecionados = new Set((jaSelecionadas ?? []).map((q: any) => q.questao_id));
  const uso = await carregarUsoDasQuestoes();

  const salvarComId = salvarQuestoesDoSimulado.bind(null, params.id);

  return (
    <div>
      <a href="/admin/simulados" className="text-sm text-navy hover:underline">← Voltar para Simulados</a>
      <h1 className="mt-2 font-display text-2xl font-bold text-navy-dark">Questões — {s.titulo}</h1>
      <p className="mt-1 text-sm text-navy-dark/60">
        Marque quais questões do banco fazem parte deste simulado. Só questões ativas aparecem aqui.
      </p>
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      <form action={salvarMetadadosSimulado.bind(null, params.id)} className="mt-6 rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Dados do simulado</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
          <div>
            <label className="text-xs font-semibold text-navy-dark/60" htmlFor="titulo">Título</label>
            <input id="titulo" name="titulo" defaultValue={s.titulo} className="mt-1 w-full rounded-lg border p-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-navy-dark/60" htmlFor="tempo_minutos">Tempo (minutos)</label>
            <input id="tempo_minutos" name="tempo_minutos" type="number" min={1} defaultValue={s.tempo_minutos} className="mt-1 w-full rounded-lg border p-2 text-sm" />
          </div>
        </div>
        <label className="mt-3 block text-xs font-semibold text-navy-dark/60" htmlFor="descricao">Descrição (opcional)</label>
        <input id="descricao" name="descricao" defaultValue={s.descricao ?? ""} className="mt-1 w-full rounded-lg border p-2 text-sm" />

        {/* Mesmas configurações que o módulo de Atividades já tinha. */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-navy-dark/60" htmlFor="gabarito_modo">Gabarito</label>
            <select id="gabarito_modo" name="gabarito_modo" defaultValue={s.gabarito_modo ?? "ao_final"} className="mt-1 w-full rounded-lg border p-2 text-sm">
              <option value="ao_final">Liberar somente ao final</option>
              <option value="imediato">Liberar imediatamente a cada questão</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-navy-dark/60" htmlFor="valor_total">Valor total do simulado</label>
            <input id="valor_total" name="valor_total" type="number" min={1} step="any" defaultValue={s.valor_total ?? 1000} className="mt-1 w-full rounded-lg border p-2 text-sm" />
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-navy-dark">
          <input type="checkbox" name="usar_pesos" defaultChecked={s.usar_pesos ?? false} />
          Calcular a nota pelos pesos das disciplinas
        </label>
        <p className="mt-1 text-[11px] font-semibold text-navy-dark/45">
          Com os pesos ativos, o aluno vê a nota ponderada (ex.: 720 / 1000) em vez de só o percentual de acertos. Os
          pesos vêm de Configurações → Pesos das disciplinas.
        </p>

        {/* Variável Inglês / Espanhol (item 16) */}
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-navy-dark">
          <input type="checkbox" name="variavel_idioma" defaultChecked={s.variavel_idioma ?? false} />
          Este simulado tem questões de Inglês e de Espanhol
        </label>
        <p className="mt-1 text-[11px] font-semibold text-navy-dark/45">
          Com a opção ligada você pode cadastrar questões dos dois idiomas aqui, junto com as demais matérias. Ao
          iniciar, o aluno escolhe qual vai fazer: ele vê apenas as questões daquele idioma, e só elas contam na
          quantidade de questões, nos pesos e na nota. As do outro idioma não existem para ele.
        </p>

        {/* Proposta de redação (item 17) */}
        <fieldset className="mt-5 rounded-xl border border-navy-dark/10 p-4">
          <legend className="px-1 text-xs font-extrabold uppercase tracking-wide text-navy-dark/50">
            Redação (opcional)
          </legend>
          <p className="text-[11px] font-semibold text-navy-dark/45">
            Preencha o tema para incluir uma redação como item deste simulado. Ela aparece para o aluno depois das
            questões, dentro do mesmo cronômetro. A plataforma apresenta apenas a proposta — o aluno escreve à mão e
            envia pelo fluxo de correção com a professora. Deixe o tema vazio para remover a redação.
          </p>

          <label className="mt-3 block text-xs font-semibold text-navy-dark/60" htmlFor="redacao_tema">
            Tema
          </label>
          <input
            id="redacao_tema"
            name="redacao_tema"
            defaultValue={s.redacao?.tema ?? ""}
            placeholder="Ex.: Os desafios do acesso à saúde mental no Brasil"
            className="mt-1 w-full rounded-lg border p-2 text-sm"
          />

          <label className="mt-3 block text-xs font-semibold text-navy-dark/60" htmlFor="redacao_textos">
            Textos motivadores
          </label>
          <textarea
            id="redacao_textos"
            name="redacao_textos"
            rows={5}
            defaultValue={s.redacao?.textos_motivadores ?? ""}
            className="mt-1 w-full rounded-lg border p-2 text-sm"
          />

          <label className="mt-3 block text-xs font-semibold text-navy-dark/60" htmlFor="redacao_instrucoes">
            Instruções da proposta
          </label>
          <textarea
            id="redacao_instrucoes"
            name="redacao_instrucoes"
            rows={3}
            defaultValue={s.redacao?.instrucoes ?? ""}
            className="mt-1 w-full rounded-lg border p-2 text-sm"
          />
        </fieldset>

        <SubmitButton pendingText="Salvando..." className="mt-4 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white">
          Salvar dados
        </SubmitButton>
      </form>

      <form action={salvarComId} className="mt-6">
        <div className="overflow-hidden rounded-2xl shadow">
          <SeletorQuestoes
            questoes={questoes}
            jaSelecionadas={idsJaSelecionados}
            uso={uso}
            contextoAtual={s.titulo}
          />
        </div>

        {questoes.length > 0 && (
          <SubmitButton
            pendingText="Salvando..."
            className="mt-5 rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
          >
            Salvar seleção
          </SubmitButton>
        )}
      </form>
    </div>
  );
}
