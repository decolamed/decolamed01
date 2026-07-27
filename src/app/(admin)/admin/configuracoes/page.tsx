import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { pingAsaas } from "@/lib/asaas/client";
import { getGeminiApiKey, salvarGeminiApiKey, removerGeminiApiKey, gerarTextoGemini } from "@/lib/gemini/client";
import { getYoutubeApiKey, salvarYoutubeApiKey, removerYoutubeApiKey } from "@/lib/youtube/client";

const CAMPOS = [
  { chave: "site.contato.whatsapp", label: "WhatsApp (somente números, com DDI)" },
  { chave: "site.contato.instagram", label: "Usuário do Instagram" },
  { chave: "redacao.whatsapp", label: "WhatsApp da professora de redação (somente números, com DDI)" },
  { chave: "redacao.base_temas_url", label: "Link da Base de Temas de redação" }
];

async function salvarConfiguracoes(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();

  const resultados = await Promise.all(
    CAMPOS.map((campo) =>
      supabase
        .from("configuracoes")
        .upsert(
          { chave: campo.chave, valor: JSON.stringify(String(formData.get(campo.chave) ?? "")) },
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

  const valores = new Map((config ?? []).map((c) => [c.chave, c.valor as string]));
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
        {CAMPOS.map((campo) => (
          <div key={campo.chave}>
            <label className="text-sm font-semibold" htmlFor={campo.chave}>{campo.label}</label>
            <input
              id={campo.chave}
              name={campo.chave}
              defaultValue={valores.get(campo.chave) ?? ""}
              className="mt-1 w-full rounded-lg border p-3"
            />
          </div>
        ))}
        <SubmitButton
          pendingText="Salvando..."
          className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
        >
          Salvar alterações
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
          <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm font-semibold text-green-700">
            Conexão com o Asaas funcionando normalmente.
          </div>
        )}
        {searchParams.asaasErro && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
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
            geminiConfigurada ? "bg-green-50 text-green-700" : "bg-navy/5 text-navy-dark/70"
          }`}
        >
          {geminiConfigurada
            ? geminiViaEnv
              ? "Chave configurada (via variável de ambiente do servidor)."
              : "Chave configurada."
            : "Nenhuma chave configurada — o Copiloto está usando os textos padrão."}
        </div>

        {searchParams.geminiSucesso && (
          <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-700">
            {searchParams.geminiSucesso}
          </div>
        )}
        {searchParams.geminiErro && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{searchParams.geminiErro}</div>
        )}
        {searchParams.geminiTesteOk && (
          <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-700">
            Chave testada com sucesso — o Gemini respondeu normalmente.
          </div>
        )}
        {searchParams.geminiTesteErro && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{searchParams.geminiTesteErro}</div>
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
                className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
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
          → ative a "YouTube Data API v3" → crie uma chave de API.
        </p>

        <div
          className={`mt-4 rounded-lg p-3 text-sm font-semibold ${
            youtubeConfigurada ? "bg-green-50 text-green-700" : "bg-navy/5 text-navy-dark/70"
          }`}
        >
          {youtubeConfigurada
            ? youtubeViaEnv
              ? "Chave configurada (via variável de ambiente do servidor)."
              : "Chave configurada."
            : "Nenhuma chave configurada — a busca de vídeo-aula real está desativada."}
        </div>

        {searchParams.youtubeSucesso && (
          <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-700">
            {searchParams.youtubeSucesso}
          </div>
        )}
        {searchParams.youtubeErro && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{searchParams.youtubeErro}</div>
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
              className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Remover chave
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
