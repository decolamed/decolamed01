import { revalidatePath } from "next/cache";
import { UploadIcone } from "./upload-icone";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { pingAsaas } from "@/lib/asaas/client";
import { getGeminiApiKey, salvarGeminiApiKey, removerGeminiApiKey, gerarTextoGemini } from "@/lib/gemini/client";
import { getYoutubeApiKey, salvarYoutubeApiKey, removerYoutubeApiKey } from "@/lib/youtube/client";
import { CAMPOS_CONFIG_COPILOTO } from "@/lib/copiloto/configuracao";
import { textoConfig, valorConfig } from "@/lib/site/configuracoes";
import { CHAVES_DOS_RESUMOS, TOTAL_DE_LIVROS, chaveDoResumo } from "@/lib/site/resumos-livros";
import { CHAVES_DOS_SIMULADOS, ORDENS_DE_SIMULADO, chaveDoSimulado } from "@/lib/trilha/simulados-da-rota";
import { disponivelParaAluno, motivoIndisponivel } from "@/lib/site/avaliacoes";

const CAMPOS = [
  { chave: "site.marca.vestibular", label: "Nome do vestibular/instituição (ex.: FACAPE) — deixe vazio para textos genéricos" },
  // Renderizado à parte, com upload e prévia (ver UploadIcone). Continua no
  // array porque a gravação é a mesma: o upload só preenche a URL.
  { chave: "site.marca.icone_url", label: "Ícone do aplicativo", upload: true },
  { chave: "site.contato.whatsapp", label: "WhatsApp (somente números, com DDI)" },
  { chave: "site.contato.instagram", label: "Usuário do Instagram" },
  { chave: "redacao.whatsapp", label: "WhatsApp da professora de redação (somente números, com DDI)" },
  { chave: "redacao.base_temas_url", label: "Link da Base de Temas de redação" },
  // O app do aluno já tinha o botão "Termos de Uso", mas não havia onde
  // dizer para onde ele aponta — o botão existia sem destino.
  { chave: "site.termos_uso_url", label: "Link dos Termos de Uso (aceita qualquer URL, inclusive Canva)" }
];

// Parâmetros do algoritmo do Copiloto. Antes eram constantes no código —
// o painel prometia controlar o algoritmo e não controlava nada.
async function salvarConfigCopiloto(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const resultados = await Promise.all(
    CAMPOS_CONFIG_COPILOTO.map((campo) => {
      const bruto = String(formData.get(campo.chave) ?? "").trim();
      // Vazio significa "usar o padrão": grava string vazia e o carregador
      // cai no fallback (ver lib/copiloto/configuracao.ts).
      return supabase
        .from("configuracoes")
        .upsert({ chave: campo.chave, valor: valorConfig(bruto) }, { onConflict: "chave" });
    })
  );

  revalidatePath("/admin/configuracoes");
  if (resultados.some((r) => r.error)) {
    redirect("/admin/configuracoes?erro=" + encodeURIComponent("Não foi possível salvar os parâmetros do Copiloto."));
  }
  redirect("/admin/configuracoes?sucesso=" + encodeURIComponent("Parâmetros do Copiloto salvos — valem na próxima rodada."));
}

// Os quatro links dos resumos de livro. Ficam numa gravação própria para o
// admin poder salvar só esta seção sem passar pelo formulário inteiro — e
// para a mensagem de sucesso dizer exatamente o que foi salvo.
async function salvarResumosDosLivros(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const resultados = await Promise.all(
    CHAVES_DOS_RESUMOS.map((chave) => {
      const bruto = String(formData.get(chave) ?? "").trim();
      // Sem protocolo, o link vira caminho relativo no `<a href>` da tela de
      // cronograma (o app do aluno normaliza sozinho, a página não). O campo
      // é type="url" e o navegador já cobra o https://, mas isto protege quem
      // grava por outro caminho.
      const url = bruto && !/^https?:\/\//i.test(bruto) ? `https://${bruto}` : bruto;
      return supabase.from("configuracoes").upsert({ chave, valor: valorConfig(url) }, { onConflict: "chave" });
    })
  );

  // Todo lugar que mostra cronograma passa por `resolverCronograma`, que lê
  // estas chaves. Revalidar as telas do aluno é o que faz a troca de link
  // aparecer sem o aluno precisar sair e voltar.
  revalidatePath("/admin/configuracoes");
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  revalidatePath("/admin/trilha");
  revalidatePath("/preview-aluno");
  if (resultados.some((r) => r.error)) {
    redirect("/admin/configuracoes?erro=" + encodeURIComponent("Não foi possível salvar os links dos resumos."));
  }
  redirect(
    "/admin/configuracoes?sucesso=" +
      encodeURIComponent("Links dos resumos salvos — já valem em todos os cronogramas.")
  );
}

// Os dois simulados que a rota do Voo Guiado usa. Gravação própria, para o
// admin salvar só esta seção — e para a mensagem dizer o que mudou e para
// quem passa a valer.
async function salvarSimuladosDoVooGuiado(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const resultados = await Promise.all(
    CHAVES_DOS_SIMULADOS.map((chave) => {
      const id = String(formData.get(chave) ?? "").trim();
      return supabase.from("configuracoes").upsert({ chave, valor: valorConfig(id) }, { onConflict: "chave" });
    })
  );

  // A rota é regerada na leitura da tela do aluno, então basta revalidar.
  // Quem já tem vínculo em `aluno_simulados_rota` continua com o simulado
  // que recebeu — é a regra, não um efeito da revalidação.
  revalidatePath("/admin/configuracoes");
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  if (resultados.some((r) => r.error)) {
    redirect("/admin/configuracoes?erro=" + encodeURIComponent("Não foi possível salvar os simulados do Voo Guiado."));
  }
  redirect(
    "/admin/configuracoes?sucesso=" +
      encodeURIComponent(
        "Simulados do Voo Guiado salvos — valem para os cronogramas gerados a partir de agora."
      )
  );
}

async function salvarConfiguracoes(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const resultados = await Promise.all(
    CAMPOS.map((campo) =>
      supabase
        .from("configuracoes")
        .upsert(
          { chave: campo.chave, valor: valorConfig(String(formData.get(campo.chave) ?? "")) },
          { onConflict: "chave" }
        )
    )
  );

  // Usado no rodapé das páginas de inscrição (/inscricao/[slug]) e de
  // confirmação de pagamento — não existe mais home/contato pra revalidar.
  revalidatePath("/admin/configuracoes");
  revalidatePath("/inscricao/[slug]", "page");

  const falhou = resultados.some((r) => r.error);
  if (falhou) {
    redirect("/admin/configuracoes?erro=Não foi possível salvar uma ou mais configurações.");
  }
  redirect("/admin/configuracoes?sucesso=Configurações salvas com sucesso.");
}

// Diagnóstico do checkout Asaas: o erro real (chave ausente/errada, ou
// mistura de chave de produção com URL de sandbox e vice-versa) hoje só
// aparece no log do servidor — este botão deixa o próprio admin ver a
// causa sem precisar de acesso a logs.
async function testarAsaas() {
  "use server";
  await requireAdmin();
  const resultado = await pingAsaas();
  if (!resultado.ok) {
    redirect(`/admin/configuracoes?asaasErro=${encodeURIComponent(resultado.mensagem)}`);
  }
  redirect("/admin/configuracoes?asaasOk=1");
}

// Salva/atualiza a chave da API do Gemini. Fica em `configuracoes_secretas`
// (sem policy de select público — ver migração 023), nunca em `configuracoes`.
async function salvarGemini(formData: FormData) {
  "use server";
  await requireAdmin();
  const valor = String(formData.get("gemini_api_key") ?? "").trim();
  if (!valor) {
    redirect("/admin/configuracoes?geminiErro=Cole a chave antes de salvar.");
  }
  await salvarGeminiApiKey(valor);
  revalidatePath("/admin/configuracoes");
  redirect("/admin/configuracoes?geminiSucesso=Chave da Gemini salva com sucesso.");
}

async function removerGemini() {
  "use server";
  await requireAdmin();
  await removerGeminiApiKey();
  revalidatePath("/admin/configuracoes");
  redirect("/admin/configuracoes?geminiSucesso=Chave da Gemini removida.");
}

// Testa a chave configurada com uma chamada real e simples à API do Gemini —
// mesmo diagnóstico que o botão do Asaas, pra não deixar o admin adivinhando
// se a chave colada está certa.
async function testarGemini() {
  "use server";
  await requireAdmin();
  const resposta = await gerarTextoGemini('Responda apenas "ok".');
  if (!resposta) {
    redirect(
      "/admin/configuracoes?geminiTesteErro=" +
        encodeURIComponent("Não foi possível gerar uma resposta. Confira se a chave está correta e ativa.")
    );
  }
  redirect("/admin/configuracoes?geminiTesteOk=1");
}

// ---- YouTube Data API (usada na Produção sob Demanda do Copiloto) ----------
// Diferente do Gemini: essa chave serve pra BUSCAR vídeos REAIS no YouTube,
// não pra gerar texto. É o que garante que o link de vídeo-aula que o
// Copiloto manda pro aluno existe de verdade — o Gemini sozinho não tem
// como confirmar isso.
async function salvarYoutube(formData: FormData) {
  "use server";
  await requireAdmin();
  const valor = String(formData.get("youtube_api_key") ?? "").trim();
  if (!valor) {
    redirect("/admin/configuracoes?youtubeErro=" + encodeURIComponent("Cole a chave antes de salvar."));
  }
  await salvarYoutubeApiKey(valor);
  revalidatePath("/admin/configuracoes");
  redirect("/admin/configuracoes?youtubeSucesso=" + encodeURIComponent("Chave do YouTube salva com sucesso."));
}

async function removerYoutube() {
  "use server";
  await requireAdmin();
  await removerYoutubeApiKey();
  revalidatePath("/admin/configuracoes");
  redirect("/admin/configuracoes?youtubeSucesso=" + encodeURIComponent("Chave do YouTube removida."));
}

export default async function AdminConfiguracoesPage({
  searchParams
}: {
  searchParams: {
    sucesso?: string;
    erro?: string;
    asaasOk?: string;
    asaasErro?: string;
    geminiSucesso?: string;
    geminiErro?: string;
    geminiTesteOk?: string;
    geminiTesteErro?: string;
    youtubeSucesso?: string;
    youtubeErro?: string;
  };
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: config } = await supabase.from("configuracoes").select("chave, valor");

  const valores = new Map((config ?? []).map((c) => [c.chave, textoConfig(c.valor)]));

  // Catálogo de simulados para a seção do Voo Guiado. Traz TODOS (inclusive
  // os desativados) e diz por que cada um não serve — é a informação que o
  // admin precisa para entender por que um simulado não aparece na rota.
  const [{ data: simuladosData }, { data: vinculosSimulado }] = await Promise.all([
    supabase.from("simulados").select("id, titulo, ativo, redacao").order("titulo"),
    supabase.from("simulado_questoes").select("simulado_id")
  ]);
  const questoesPorSimulado = new Map<string, number>();
  ((vinculosSimulado as { simulado_id: string }[]) ?? []).forEach((v) => {
    questoesPorSimulado.set(v.simulado_id, (questoesPorSimulado.get(v.simulado_id) ?? 0) + 1);
  });
  const simuladosDoCatalogo = ((simuladosData as { id: string; titulo: string; ativo: boolean; redacao?: unknown }[]) ?? []).map(
    (s) => {
      const avaliacao = {
        ativo: Boolean(s.ativo),
        totalQuestoes: questoesPorSimulado.get(s.id) ?? 0,
        temRedacao: Boolean(s.redacao)
      };
      return {
        id: s.id,
        titulo: s.titulo,
        totalQuestoes: avaliacao.totalQuestoes,
        utilizavel: disponivelParaAluno(avaliacao),
        motivo: motivoIndisponivel(avaliacao)
      };
    }
  );
  const escolhidosVooGuiado = ORDENS_DE_SIMULADO.map((ordem) => valores.get(chaveDoSimulado(ordem)) ?? "");
  const repetido =
    escolhidosVooGuiado[0] !== "" && escolhidosVooGuiado[0] === escolhidosVooGuiado[1];
  const geminiConfigurada = Boolean(await getGeminiApiKey());
  const geminiViaEnv = Boolean(process.env.GEMINI_API_KEY);
  const youtubeConfigurada = Boolean(await getYoutubeApiKey());
  const youtubeViaEnv = Boolean(process.env.YOUTUBE_API_KEY);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Configurações do site</h1>
      <p className="mt-2 text-navy-dark/70">
        Textos e informações institucionais exibidos no site público — nada fica fixo no código.
      </p>
      <AdminAlert sucesso={searchParams.sucesso} />

      <form action={salvarConfiguracoes} className="mt-6 max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow">
        {CAMPOS.map((campo) =>
          campo.upload ? (
            <div key={campo.chave}>
              <label className="text-sm font-semibold">{campo.label}</label>
              <div className="mt-2">
                <UploadIcone valorAtual={valores.get(campo.chave) ?? ""} nomeCampo={campo.chave} />
              </div>
            </div>
          ) : (
            <div key={campo.chave}>
              <label className="text-sm font-semibold" htmlFor={campo.chave}>{campo.label}</label>
              <input
                id={campo.chave}
                name={campo.chave}
                defaultValue={valores.get(campo.chave) ?? ""}
                className="mt-1 w-full rounded-lg border p-3"
              />
              {/* "Testar link" abre o endereço salvo numa aba nova, para o
                  admin conferir o destino sem sair do painel. Só aparece
                  quando já existe algo salvo. */}
              {campo.chave.endsWith("_url") && (valores.get(campo.chave) ?? "") !== "" && (
                <a
                  href={valores.get(campo.chave)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs font-bold text-navy hover:underline"
                >
                  Testar link ↗
                </a>
              )}
            </div>
          )
        )}
        {/* Os pesos alimentam o Copiloto e a nota ponderada dos simulados, e
            o admin procurava por eles aqui — a tela em si já existe,
            faltava o caminho até ela. */}
        <a
          href="/admin/copiloto/pesos"
          className="flex items-center justify-between rounded-lg border border-navy-dark/15 p-3 hover:bg-navy-dark/5"
        >
          <span>
            <span className="block text-sm font-semibold text-navy-dark">Pesos das disciplinas</span>
            <span className="block text-xs text-navy-dark/50">
              Peso, quantidade de questões e pontuação máxima de cada disciplina — usados pelo Copiloto e pela nota
              ponderada dos simulados.
            </span>
          </span>
          <span className="text-navy-dark/40">→</span>
        </a>

        <SubmitButton
          pendingText="Salvando..."
          className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Salvar alterações
        </SubmitButton>
      </form>

      {/* ----------------------------------------------------------------
          Resumos dos livros

          Fonte oficial dos quatro endereços. Todo cronograma passa por
          `resolverCronograma`, que lê estas chaves — então trocar o link
          aqui muda o destino em todos os lugares que mostram o resumo, em
          qualquer plano e em qualquer variação de cronograma.
          ---------------------------------------------------------------- */}
      <form action={salvarResumosDosLivros} className="mt-8 max-w-xl rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Resumos dos livros</h2>
        <p className="mt-1 text-sm text-navy-dark/60">
          Endereço de cada um dos quatro resumos obrigatórios. É a fonte única: o botão do resumo abre este link em
          todos os cronogramas — personalizado pelo Copiloto, padrão, Decolando ou Voo Guiado. Trocar aqui vale
          imediatamente para todos os alunos.
        </p>
        <div className="mt-4 space-y-3">
          {Array.from({ length: TOTAL_DE_LIVROS }, (_, i) => i + 1).map((numero) => {
            const chave = chaveDoResumo(numero);
            const atual = valores.get(chave) ?? "";
            return (
              <div key={chave}>
                <label className="text-sm font-semibold text-navy-dark" htmlFor={chave}>
                  Resumo do Livro {numero} → URL
                </label>
                <input
                  id={chave}
                  name={chave}
                  type="url"
                  inputMode="url"
                  placeholder="https://..."
                  defaultValue={atual}
                  className="mt-1 w-full rounded-lg border p-3"
                />
                {atual !== "" && (
                  <a
                    href={atual}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-xs font-bold text-navy hover:underline"
                  >
                    Testar link ↗
                  </a>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-navy-dark/50">
          Campo em branco deixa o resumo sem botão — melhor do que um botão que abre uma página vazia.
        </p>
        <SubmitButton
          pendingText="Salvando..."
          className="mt-5 rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Salvar alterações
        </SubmitButton>
      </form>

      {/* ----------------------------------------------------------------
          Simulados do Voo Guiado

          Antes a rota pegava os dois simulados mais antigos por `created_at`
          e o admin não escolhia nada. Aqui ele escolhe.

          Isto NÃO é o simulado do cronograma padrão: os itens de simulado de
          /admin/trilha continuam valendo só para o plano Decolando. São dois
          sistemas separados de propósito, e a tela diz isso.
          ---------------------------------------------------------------- */}
      <form action={salvarSimuladosDoVooGuiado} className="mt-8 max-w-xl rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Simulados do Voo Guiado</h2>
        <p className="mt-1 text-sm text-navy-dark/60">
          Quais simulados a rota personalizada do Copiloto usa. O Copiloto continua decidindo <strong>quando</strong>{" "}
          cada um cai no cronograma, de acordo com a janela até a prova; aqui você define <strong>quais</strong> são.
        </p>
        <p className="mt-2 rounded-xl bg-navy-dark/5 p-3 text-xs text-navy-dark/60">
          Não confundir com os itens de simulado do <strong>cronograma padrão</strong> (Conteúdo → Cronograma), que
          valem para o plano Decolando. Os dois são independentes: mudar um não mexe no outro.
        </p>

        <div className="mt-4 space-y-3">
          {ORDENS_DE_SIMULADO.map((ordem) => {
            const chave = chaveDoSimulado(ordem);
            const atual = valores.get(chave) ?? "";
            return (
              <div key={chave}>
                <label className="text-sm font-semibold text-navy-dark" htmlFor={chave}>
                  Simulado {ordem} do Voo Guiado
                </label>
                <select
                  id={chave}
                  name={chave}
                  defaultValue={atual}
                  className="mt-1 w-full rounded-lg border bg-white p-3 text-sm"
                >
                  <option value="">— nenhum —</option>
                  {simuladosDoCatalogo.map((s) => (
                    <option key={s.id} value={s.id} disabled={!s.utilizavel && s.id !== atual}>
                      {s.titulo}
                      {s.utilizavel ? ` · ${s.totalQuestoes} questões` : ` · ${s.motivo}`}
                    </option>
                  ))}
                </select>
                {atual === "" && (
                  <p className="mt-1 text-xs font-semibold text-orange-dark">
                    Sem simulado escolhido: o dia continua reservado na rota, mas leva o aluno à lista de simulados em
                    vez de abrir uma prova. Ele <strong>não</strong> repete o Simulado {ordem === 1 ? 2 : 1}.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {repetido && (
          <p className="mt-3 rounded-xl border border-orange/40 bg-orange/5 p-3 text-xs font-semibold text-orange-dark">
            Os dois estão apontando para o mesmo simulado. O aluno vai fazer a mesma prova duas vezes — se for
            intencional, tudo bem; se não, escolha outro para uma das posições.
          </p>
        )}
        {simuladosDoCatalogo.filter((s) => s.utilizavel).length < 2 && (
          <p className="mt-3 rounded-xl border border-orange/40 bg-orange/5 p-3 text-xs font-semibold text-orange-dark">
            Só há {simuladosDoCatalogo.filter((s) => s.utilizavel).length} simulado(s) que o aluno consegue abrir.
            Cadastre outro em Conteúdo → Simulados para preencher as duas posições.
          </p>
        )}

        <p className="mt-3 text-xs text-navy-dark/50">
          A troca vale para os cronogramas gerados a partir de agora. Alunos que já receberam um simulado continuam com
          o que foi atribuído — e um simulado já realizado nunca é substituído.
        </p>
        <SubmitButton
          pendingText="Salvando..."
          className="mt-5 rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Salvar alterações
        </SubmitButton>
      </form>

      <form action={salvarConfigCopiloto} className="mt-8 max-w-xl rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Algoritmo do Copiloto</h2>
        <p className="mt-1 text-sm text-navy-dark/60">
          Parâmetros que o algoritmo usa para montar as missões. Deixe um campo <strong>vazio</strong> para usar o
          valor padrão indicado ao lado. As mudanças valem na próxima rodada do Copiloto.
        </p>
        <div className="mt-4 space-y-3">
          {CAMPOS_CONFIG_COPILOTO.map((campo) => (
            <div key={campo.chave}>
              <label className="text-sm font-semibold text-navy-dark" htmlFor={campo.chave}>
                {campo.rotulo}
              </label>
              <input
                id={campo.chave}
                name={campo.chave}
                type="number"
                min="1"
                step="1"
                placeholder={`padrão: ${campo.padrao}`}
                defaultValue={valores.get(campo.chave) ?? ""}
                className="mt-1 w-full rounded-lg border p-3"
              />
              <p className="mt-0.5 text-xs text-navy-dark/50">{campo.ajuda}</p>
            </div>
          ))}
        </div>
        <SubmitButton
          pendingText="Salvando..."
          className="mt-5 rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Salvar parâmetros
        </SubmitButton>
      </form>

      <div className="mt-8 max-w-xl rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Checkout Asaas</h2>
        <p className="mt-1 text-sm text-navy-dark/60">
          A chave (<code className="font-mono">ASAAS_API_KEY</code>) e a URL da API (
          <code className="font-mono">ASAAS_API_URL</code>) ficam nas variáveis de ambiente do projeto, não aqui.
          Use este botão para confirmar que estão configuradas corretamente antes de investigar uma cobrança que
          falhou.
        </p>

        {searchParams.asaasOk && (
          <div className="mt-4 rounded-lg border border-green/30 bg-green-soft p-4 text-sm font-semibold text-green">
            Conexão com o Asaas funcionando normalmente.
          </div>
        )}
        {searchParams.asaasErro && (
          <div className="mt-4 rounded-lg border border-red/30 bg-red-soft p-4 text-sm text-red">
            <p className="font-semibold">Falha ao conectar com o Asaas:</p>
            <p className="mt-1 break-words font-mono text-xs">{searchParams.asaasErro}</p>
            <p className="mt-2 text-xs">
              Confira se <code className="font-mono">ASAAS_API_KEY</code> está definida e se ela é do mesmo ambiente
              (sandbox ou produção) que <code className="font-mono">ASAAS_API_URL</code> aponta — uma chave de
              produção com URL de sandbox (ou o contrário) sempre falha na autenticação.
            </p>
          </div>
        )}

        <form action={testarAsaas} className="mt-4">
          <SubmitButton pendingText="Testando..." className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark">
            Testar conexão
          </SubmitButton>
        </form>
      </div>

      <div className="mt-8 max-w-xl rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Chave da API do Gemini (Copiloto)</h2>
        <p className="mt-1 text-sm text-navy-dark/60">
          Usada pelo Copiloto pra reescrever o motivo de cada recomendação de um jeito mais pessoal pro aluno. Sem
          essa chave, o Copiloto continua funcionando normalmente com os textos padrão — a chave só personaliza o
          texto.
        </p>

        <div
          className={`mt-4 rounded-lg p-3 text-sm font-semibold ${
            geminiConfigurada ? "bg-green-soft text-green" : "bg-navy/5 text-navy-dark/70"
          }`}
        >
          {geminiConfigurada
            ? geminiViaEnv
              ? "Chave configurada (via variável de ambiente do servidor)."
              : "Chave configurada."
            : "Nenhuma chave configurada — o Copiloto está usando os textos padrão."}
        </div>

        {searchParams.geminiSucesso && (
          <div className="mt-3 rounded-lg bg-green-soft p-3 text-sm font-semibold text-green">
            {searchParams.geminiSucesso}
          </div>
        )}
        {searchParams.geminiErro && (
          <div className="mt-3 rounded-lg bg-red-soft p-3 text-sm text-red">{searchParams.geminiErro}</div>
        )}
        {searchParams.geminiTesteOk && (
          <div className="mt-3 rounded-lg bg-green-soft p-3 text-sm font-semibold text-green">
            Chave testada com sucesso — o Gemini respondeu normalmente.
          </div>
        )}
        {searchParams.geminiTesteErro && (
          <div className="mt-3 rounded-lg bg-red-soft p-3 text-sm text-red">{searchParams.geminiTesteErro}</div>
        )}

        {geminiViaEnv && (
          <p className="mt-3 text-xs text-navy-dark/50">
            A chave está fixada na variável de ambiente <code className="font-mono">GEMINI_API_KEY</code> do
            servidor, que tem prioridade sobre qualquer valor salvo aqui. Pra trocar, remova a variável de ambiente
            ou atualize-a diretamente na Vercel.
          </p>
        )}

        <form action={salvarGemini} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            name="gemini_api_key"
            placeholder="Cole a chave da API do Gemini"
            className="w-full rounded-lg border p-3 text-sm"
            autoComplete="off"
          />
          <SubmitButton
            pendingText="Salvando..."
            className="whitespace-nowrap rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-dark"
          >
            Salvar chave
          </SubmitButton>
        </form>

        <div className="mt-3 flex gap-2">
          <form action={testarGemini}>
            <SubmitButton
              pendingText="Testando..."
              className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark"
            >
              Testar conexão
            </SubmitButton>
          </form>
          {geminiConfigurada && !geminiViaEnv && (
            <form action={removerGemini}>
              <SubmitButton
                pendingText="Removendo..."
                className="rounded-full border border-red/30 px-5 py-2.5 text-sm font-semibold text-red hover:bg-red-soft"
              >
                Remover chave
              </SubmitButton>
            </form>
          )}
        </div>
      </div>

      <div className="mt-8 max-w-xl rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Chave da YouTube Data API (Produção sob Demanda)</h2>
        <p className="mt-1 text-sm text-navy-dark/60">
          Quando o Copiloto identifica um assunto crítico sem material suficiente na plataforma, ele gera
          flashcards com o Gemini e busca uma vídeo-aula <strong>real</strong> aqui — o Gemini sozinho não
          consegue verificar se um link de vídeo existe de verdade, então essa chave é obrigatória pra essa
          funcionalidade específica. Sem ela, o Copiloto continua gerando flashcards normalmente, só não busca
          vídeo.
        </p>
        <p className="mt-2 text-xs text-navy-dark/50">
          Gratuita: crie em{" "}
          <a
            href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            console.cloud.google.com
          </a>{" "}
          → ative a &quot;YouTube Data API v3&quot; → crie uma chave de API.
        </p>

        <div
          className={`mt-4 rounded-lg p-3 text-sm font-semibold ${
            youtubeConfigurada ? "bg-green-soft text-green" : "bg-navy/5 text-navy-dark/70"
          }`}
        >
          {youtubeConfigurada
            ? youtubeViaEnv
              ? "Chave configurada (via variável de ambiente do servidor)."
              : "Chave configurada."
            : "Nenhuma chave configurada — a busca de vídeo-aula real está desativada."}
        </div>

        {searchParams.youtubeSucesso && (
          <div className="mt-3 rounded-lg bg-green-soft p-3 text-sm font-semibold text-green">
            {searchParams.youtubeSucesso}
          </div>
        )}
        {searchParams.youtubeErro && (
          <div className="mt-3 rounded-lg bg-red-soft p-3 text-sm text-red">{searchParams.youtubeErro}</div>
        )}

        {youtubeViaEnv && (
          <p className="mt-3 text-xs text-navy-dark/50">
            A chave está fixada na variável de ambiente <code className="font-mono">YOUTUBE_API_KEY</code> do
            servidor. Pra trocar, atualize-a diretamente na Vercel.
          </p>
        )}

        <form action={salvarYoutube} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            name="youtube_api_key"
            placeholder="Cole a chave da YouTube Data API"
            className="w-full rounded-lg border p-3 text-sm"
            autoComplete="off"
          />
          <SubmitButton
            pendingText="Salvando..."
            className="whitespace-nowrap rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-dark"
          >
            Salvar chave
          </SubmitButton>
        </form>

        {youtubeConfigurada && !youtubeViaEnv && (
          <form action={removerYoutube} className="mt-3">
            <SubmitButton
              pendingText="Removendo..."
              className="rounded-full border border-red/30 px-5 py-2.5 text-sm font-semibold text-red hover:bg-red-soft"
            >
              Remover chave
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
