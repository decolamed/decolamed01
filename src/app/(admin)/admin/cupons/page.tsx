import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { TabelaResponsiva } from "@/components/admin/tabela-responsiva";
import { valorParaGravar, descreverAplicacao } from "@/lib/cupons/planos-aplicaveis";
import type { Cupom } from "@/types/database";
import { falhaAoCarregar } from "@/lib/supabase/resultado";

async function criarCupom(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const validoAte = String(formData.get("valido_ate") ?? "");
  const limite = String(formData.get("limite_usos") ?? "");
  const parceiroId = String(formData.get("parceiro_id") ?? "");
  const percentualComissao = String(formData.get("percentual_comissao") ?? "");

  // A tabela só garante valor > 0 — sem isso, um percentual digitado errado
  // (ex.: 500 em vez de 50) passa direto pro banco. O checkout já trava o
  // preço final em 0 no mínimo (nunca fica negativo), mas um cupom assim
  // ainda liberaria o plano de graça sem ninguém perceber o erro de digitação.
  const tipo = String(formData.get("tipo"));
  const valorNum = Number(formData.get("valor"));
  if (tipo === "percentual" && (valorNum <= 0 || valorNum > 100)) {
    redirect(`/admin/cupons?erro=${encodeURIComponent("Cupom percentual precisa ser um valor entre 1 e 100.")}`);
  }
  if (percentualComissao) {
    const comissaoNum = Number(percentualComissao);
    if (comissaoNum < 0 || comissaoNum > 100) {
      redirect(`/admin/cupons?erro=${encodeURIComponent("Percentual de comissão precisa estar entre 0 e 100.")}`);
    }
  }

  const { error } = await supabase.from("cupons").insert({
    codigo: String(formData.get("codigo")).trim().toUpperCase(),
    tipo: String(formData.get("tipo")),
    valor: Number(formData.get("valor")),
    valido_ate: validoAte ? new Date(validoAte).toISOString() : null,
    limite_usos: limite ? Number(limite) : null,
    ativo: true,
    // Vínculo de afiliado: quando um parceiro é selecionado, toda venda com
    // este cupom passa a gerar comissão automaticamente (ver migração 005 —
    // trigger sync_comissao_parceiro).
    parceiro_id: parceiroId || null,
    percentual_comissao: parceiroId && percentualComissao ? Number(percentualComissao) : 0,
    // Nenhum plano marcado = vale em todos, que é o comportamento de sempre.
    // `valorParaGravar` transforma lista vazia em nulo (ver
    // lib/cupons/planos-aplicaveis.ts).
    planos_aplicaveis: valorParaGravar(formData.getAll("planos_aplicaveis"))
  });

  revalidatePath("/admin/cupons");

  if (error) {
    const mensagem = error.message.includes("duplicate")
      ? "Já existe um cupom com esse código."
      : "Não foi possível criar o cupom.";
    redirect(`/admin/cupons?erro=${encodeURIComponent(mensagem)}`);
  }
  redirect("/admin/cupons?sucesso=Cupom criado com sucesso.");
}

async function vincularParceiro(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const parceiroId = String(formData.get("parceiro_id") ?? "");
  const percentualComissao = String(formData.get("percentual_comissao") ?? "");
  if (percentualComissao) {
    const comissaoNum = Number(percentualComissao);
    if (comissaoNum < 0 || comissaoNum > 100) {
      redirect(`/admin/cupons?erro=${encodeURIComponent("Percentual de comissão precisa estar entre 0 e 100.")}`);
    }
  }
  const { error } = await supabase
    .from("cupons")
    .update({
      parceiro_id: parceiroId || null,
      percentual_comissao: parceiroId && percentualComissao ? Number(percentualComissao) : 0
    })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/cupons");
  if (error) {
    redirect(`/admin/cupons?erro=${encodeURIComponent("Não foi possível salvar o vínculo com o parceiro. Confira se o percentual está entre 0 e 100.")}`);
  }
}

async function salvarPlanosDoCupom(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("cupons")
    .update({ planos_aplicaveis: valorParaGravar(formData.getAll("planos_aplicaveis")) })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/cupons");
  if (error) {
    redirect(`/admin/cupons?erro=${encodeURIComponent("Não foi possível salvar os planos deste cupom.")}`);
  }
  redirect(`/admin/cupons?sucesso=${encodeURIComponent("Planos do cupom atualizados.")}`);
}

async function alternarAtivo(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const ativo = formData.get("ativo") === "true";
  const { error } = await supabase.from("cupons").update({ ativo: !ativo }).eq("id", id);
  revalidatePath("/admin/cupons");
  if (error) {
    redirect(`/admin/cupons?erro=${encodeURIComponent("Não foi possível atualizar o status do cupom.")}`);
  }
}

async function excluirCupom(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("cupons").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/cupons");
  if (error) {
    redirect(`/admin/cupons?erro=${encodeURIComponent("Não foi possível excluir o cupom.")}`);
  }
}

export default async function AdminCuponsPage({
  searchParams
}: {
  searchParams: { erro?: string; sucesso?: string };
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: cupons, error: erro_cupons } = await supabase
    .from("cupons")
    .select("*, parceiros:parceiro_id(nome)")
    .order("created_at", { ascending: false });
  const { data: parceiros, error: erro_parceiros } = await supabase
    .from("profiles")
    .select("id, nome")
    .eq("role", "parceiro")
    .order("nome");
  // Todos os planos, inclusive inativos: um cupom pode estar preso a um plano
  // que foi desativado temporariamente, e sumir a marcação da tela faria o
  // admin salvar sem perceber que apagou a restrição.
  const { data: planos, error: erro_planos } = await supabase.from("planos").select("id, nome, ativo").order("ordem");
  const listaDePlanos = (planos as { id: string; nome: string; ativo: boolean }[]) ?? [];
  const nomePorPlano = new Map(listaDePlanos.map((p) => [p.id, p.nome]));
  const lista = (cupons as (Cupom & { parceiros: { nome: string } | null })[]) ?? [];

  // Uma consulta recusada chegava à tela como tabela vazia — o mesmo
  // defeito que fez /admin/matriculas e /admin/usuarios parecerem sem
  // registros. Ver lib/supabase/resultado.ts.
  const falhaDeCarga = falhaAoCarregar({ "cupons": { error: erro_cupons }, "parceiros": { error: erro_parceiros }, "planos": { error: erro_planos } });

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-navy-dark sm:text-2xl">Cupons</h1>
      <AdminAlert erro={falhaDeCarga ?? searchParams.erro} sucesso={searchParams.sucesso} />

      <div className="mt-6">
        <TabelaResponsiva
          linhas={lista}
          chave={(cupom) => cupom.id}
          vazio="Nenhum cupom cadastrado."
          colunas={[
            { titulo: "Código", principal: true, celula: (cupom) => <span className="font-mono">{cupom.codigo}</span> },
            {
              titulo: "Desconto",
              celula: (cupom) => (cupom.tipo === "percentual" ? `${cupom.valor}%` : `R$ ${cupom.valor.toFixed(2)}`)
            },
            {
              titulo: "Validade",
              celula: (cupom) => (cupom.valido_ate ? new Date(cupom.valido_ate).toLocaleDateString("pt-BR") : "Sem prazo")
            },
            { titulo: "Usos", celula: (cupom) => `${cupom.usos}${cupom.limite_usos ? ` / ${cupom.limite_usos}` : ""}` },
            { titulo: "Status", celula: (cupom) => (cupom.ativo ? "Ativo" : "Inativo") },
            {
              titulo: "Cursos/Planos aplicáveis",
              celula: (cupom) => (
                <div>
                  <form action={salvarPlanosDoCupom} className="space-y-1">
                    <input type="hidden" name="id" value={cupom.id} />
                    {listaDePlanos.map((plano) => (
                      <label key={plano.id} className="flex items-center gap-1.5 text-xs">
                        <input
                          type="checkbox"
                          name="planos_aplicaveis"
                          value={plano.id}
                          defaultChecked={(cupom.planos_aplicaveis ?? []).includes(plano.id)}
                        />
                        <span className={plano.ativo ? "" : "text-navy-dark/40"}>
                          {plano.nome}
                          {!plano.ativo && " (inativo)"}
                        </span>
                      </label>
                    ))}
                    <SubmitButton pendingText="..." className="text-orange-dark hover:underline text-xs">
                      Salvar planos
                    </SubmitButton>
                  </form>
                  <p className="mt-1 text-xs text-navy-dark/50">
                    {descreverAplicacao(cupom.planos_aplicaveis, nomePorPlano)}
                  </p>
                </div>
              )
            },
            {
              titulo: "Parceiro (afiliado)",
              celula: (cupom) => (
                <div>
                  <form action={vincularParceiro} className="flex flex-wrap items-center gap-1">
                    <input type="hidden" name="id" value={cupom.id} />
                    <select name="parceiro_id" defaultValue={cupom.parceiro_id ?? ""} className="rounded border p-1 text-xs">
                      <option value="">Sem parceiro</option>
                      {(parceiros ?? []).map((p: any) => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      name="percentual_comissao"
                      defaultValue={cupom.percentual_comissao || ""}
                      placeholder="% com."
                      min={0}
                      max={100}
                      step="0.01"
                      className="w-16 rounded border p-1 text-xs"
                    />
                    <SubmitButton pendingText="..." className="text-orange-dark hover:underline text-xs">
                      Salvar
                    </SubmitButton>
                  </form>
                  {cupom.parceiros?.nome && (
                    <p className="mt-1 text-xs text-navy-dark/50">
                      {cupom.parceiros.nome} · {cupom.percentual_comissao}% de comissão
                    </p>
                  )}
                </div>
              )
            }
          ]}
          acoes={(cupom) => (
            <>
              <form action={alternarAtivo}>
                <input type="hidden" name="id" value={cupom.id} />
                <input type="hidden" name="ativo" value={String(cupom.ativo)} />
                <button className="text-orange-dark hover:underline">
                  {cupom.ativo ? "Desativar" : "Ativar"}
                </button>
              </form>
              <form action={excluirCupom}>
                <input type="hidden" name="id" value={cupom.id} />
                <button className="text-red hover:underline">Excluir</button>
              </form>
            </>
          )}
        />
      </div>

      <div className="mt-8 max-w-xl rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Novo cupom</h2>
        <form action={criarCupom} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="codigo">Código</label>
              <input id="codigo" name="codigo" required placeholder="DECOLA10" className="mt-1 w-full rounded-lg border p-3 uppercase" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="tipo">Tipo de desconto</label>
              <select id="tipo" name="tipo" className="mt-1 w-full rounded-lg border p-3">
                <option value="percentual">Porcentagem (%)</option>
                <option value="fixo">Valor fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="valor">Valor do desconto</label>
              <input id="valor" name="valor" type="number" step="0.01" required className="mt-1 w-full rounded-lg border p-3" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="limite_usos">Limite de usos (vazio = ilimitado)</label>
              <input id="limite_usos" name="limite_usos" type="number" className="mt-1 w-full rounded-lg border p-3" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="valido_ate">Válido até (vazio = sem prazo)</label>
              <input id="valido_ate" name="valido_ate" type="date" className="mt-1 w-full rounded-lg border p-3" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="parceiro_id">Parceiro (afiliado) — opcional</label>
              <select id="parceiro_id" name="parceiro_id" className="mt-1 w-full rounded-lg border p-3">
                <option value="">Nenhum (cupom comum)</option>
                {(parceiros ?? []).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-navy-dark/50">
                Não vê o parceiro na lista? Torne o usuário parceiro em /admin/usuarios primeiro.
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="percentual_comissao">% de comissão do parceiro</label>
              <input
                id="percentual_comissao"
                name="percentual_comissao"
                type="number"
                min={0}
                max={100}
                step="0.01"
                placeholder="0"
                className="mt-1 w-full rounded-lg border p-3"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold">Cursos/Planos aplicáveis</label>
            <p className="mt-0.5 text-xs text-navy-dark/50">
              Nenhum marcado = vale em todos os planos. Marque um ou mais para restringir.
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {listaDePlanos.map((plano) => (
                <label key={plano.id} className="flex items-center gap-2 rounded-lg border p-2.5 text-sm">
                  <input type="checkbox" name="planos_aplicaveis" value={plano.id} />
                  <span className={plano.ativo ? "" : "text-navy-dark/40"}>
                    {plano.nome}
                    {!plano.ativo && " (inativo)"}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <SubmitButton
            pendingText="Cadastrando..."
            className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
          >
            Cadastrar cupom
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
