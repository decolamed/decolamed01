import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import type { Cupom } from "@/types/database";

async function criarCupom(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createAdminClient();
  const validoAte = String(formData.get("valido_ate") ?? "");
  const limite = String(formData.get("limite_usos") ?? "");
  const parceiroId = String(formData.get("parceiro_id") ?? "");
  const percentualComissao = String(formData.get("percentual_comissao") ?? "");

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
    percentual_comissao: parceiroId && percentualComissao ? Number(percentualComissao) : 0
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
  const { data: cupons } = await supabase
    .from("cupons")
    .select("*, parceiros:parceiro_id(nome)")
    .order("created_at", { ascending: false });
  const { data: parceiros } = await supabase
    .from("profiles")
    .select("id, nome")
    .eq("role", "parceiro")
    .order("nome");
  const lista = (cupons as (Cupom & { parceiros: { nome: string } | null })[]) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Cupons</h1>
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy-dark/70">
            <tr>
              <th className="p-3">Código</th>
              <th className="p-3">Desconto</th>
              <th className="p-3">Validade</th>
              <th className="p-3">Usos</th>
              <th className="p-3">Status</th>
              <th className="p-3">Parceiro (afiliado)</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((cupom) => (
              <tr key={cupom.id} className="border-t">
                <td className="p-3 font-mono">{cupom.codigo}</td>
                <td className="p-3">{cupom.tipo === "percentual" ? `${cupom.valor}%` : `R$ ${cupom.valor.toFixed(2)}`}</td>
                <td className="p-3">{cupom.valido_ate ? new Date(cupom.valido_ate).toLocaleDateString("pt-BR") : "Sem prazo"}</td>
                <td className="p-3">{cupom.usos}{cupom.limite_usos ? ` / ${cupom.limite_usos}` : ""}</td>
                <td className="p-3">{cupom.ativo ? "Ativo" : "Inativo"}</td>
                <td className="p-3">
                  <form action={vincularParceiro} className="flex items-center gap-1">
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
                </td>
                <td className="p-3">
                  <div className="flex gap-3">
                    <form action={alternarAtivo}>
                      <input type="hidden" name="id" value={cupom.id} />
                      <input type="hidden" name="ativo" value={String(cupom.ativo)} />
                      <button className="text-orange-dark hover:underline">
                        {cupom.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </form>
                    <form action={excluirCupom}>
                      <input type="hidden" name="id" value={cupom.id} />
                      <button className="text-red-600 hover:underline">Excluir</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-navy-dark/50">Nenhum cupom cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
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
