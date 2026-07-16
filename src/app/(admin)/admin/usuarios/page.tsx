import Link from "next/link";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { WhatsappButton } from "@/components/admin/whatsapp-button";
import type { Profile } from "@/types/database";
import {
  criarAlunoManual,
  alterarPlano,
  reenviarConvite,
  reenviarSenha,
  desativarUsuario,
  reativarUsuario,
  tornarAdmin,
  removerAdmin,
  tornarParceiro,
  removerParceiro
} from "./actions";

const ROLE_LABEL: Record<string, string> = {
  aluno: "Aluno",
  admin: "Administrador",
  parceiro: "Parceiro"
};

export default async function AdminUsuariosPage({
  searchParams
}: {
  searchParams: { q?: string; role?: string; erro?: string; sucesso?: string };
}) {
  const adminAtual = await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase.from("profiles").select("*, planos(nome)").order("created_at", { ascending: false });
  if (searchParams.q) {
    query = query.or(`nome.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%`);
  }
  if (searchParams.role) {
    query = query.eq("role", searchParams.role);
  }
  const { data: usuarios } = await query;
  const { data: planos } = await supabase.from("planos").select("id, nome").eq("ativo", true).order("ordem");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Usuários</h1>
      <AdminAlert erro={searchParams.erro} sucesso={searchParams.sucesso} />

      <form className="mt-4 flex flex-wrap gap-3" action="/admin/usuarios">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Buscar por nome ou e-mail"
          className="w-full max-w-sm rounded-lg border p-3"
        />
        <select name="role" defaultValue={searchParams.role ?? ""} className="rounded-lg border p-3">
          <option value="">Todos os papéis</option>
          <option value="aluno">Alunos</option>
          <option value="parceiro">Parceiros</option>
          <option value="admin">Administradores</option>
        </select>
        <SubmitButton pendingText="..." className="rounded-lg bg-navy px-5 py-3 font-semibold text-white">
          Filtrar
        </SubmitButton>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy-dark/70">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Contato</th>
              <th className="p-3">Papel</th>
              <th className="p-3">Plano</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(usuarios ?? []).map((u: Profile & { planos: { nome: string } | null }) => (
              <tr key={u.id} className="border-t align-top">
                <td className="p-3">
                  <Link href={`/admin/usuarios/${u.id}`} className="font-semibold text-navy-dark hover:underline">
                    {u.nome}
                  </Link>
                  {u.criado_manualmente && (
                    <span className="ml-2 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-semibold text-navy-dark/50">
                      manual
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <p>{u.email}</p>
                  <p className="text-xs text-navy-dark/50">{u.telefone ?? "sem telefone"}</p>
                  <div className="mt-1">
                    <WhatsappButton telefone={u.telefone} nome={u.nome} />
                  </div>
                </td>
                <td className="p-3">{ROLE_LABEL[u.role] ?? u.role}</td>
                <td className="p-3">
                  {u.role === "aluno" ? (
                    <form action={alterarPlano} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select name="planoId" defaultValue={u.plano_id ?? ""} className="rounded border p-1">
                        <option value="">—</option>
                        {(planos ?? []).map((p: any) => (
                          <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                      </select>
                      <SubmitButton pendingText="..." className="text-orange-dark hover:underline">
                        Salvar
                      </SubmitButton>
                    </form>
                  ) : (
                    <span className="text-navy-dark/40">—</span>
                  )}
                </td>
                <td className="p-3">
                  {u.ativo ? (
                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">Ativo</span>
                  ) : (
                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">Desativado</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex flex-col items-start gap-1.5">
                    <form action={reenviarConvite}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="email" value={u.email} />
                      <input type="hidden" name="nome" value={u.nome} />
                      <SubmitButton pendingText="Enviando..." className="text-navy hover:underline">
                        Reenviar e-mail de acesso
                      </SubmitButton>
                    </form>

                    <form action={reenviarSenha}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="email" value={u.email} />
                      <SubmitButton pendingText="Enviando..." className="text-navy hover:underline">
                        Reenviar redefinição de senha
                      </SubmitButton>
                    </form>

                    {u.id !== adminAtual.id && (
                      <form action={u.ativo ? desativarUsuario : reativarUsuario}>
                        <input type="hidden" name="id" value={u.id} />
                        <ConfirmSubmitButton
                          pendingText="..."
                          confirmMessage={
                            u.ativo
                              ? `Desativar o acesso de ${u.nome}? O login será bloqueado imediatamente.`
                              : `Reativar o acesso de ${u.nome}?`
                          }
                          className={u.ativo ? "text-red-600 hover:underline" : "text-green-700 hover:underline"}
                        >
                          {u.ativo ? "Desativar usuário" : "Reativar usuário"}
                        </ConfirmSubmitButton>
                      </form>
                    )}

                    {u.role !== "admin" ? (
                      <form action={tornarAdmin}>
                        <input type="hidden" name="id" value={u.id} />
                        <ConfirmSubmitButton
                          pendingText="..."
                          confirmMessage={`Tornar ${u.nome} administrador? Ele passará a ter acesso total ao painel.`}
                          className="text-orange-dark hover:underline"
                        >
                          Tornar administrador
                        </ConfirmSubmitButton>
                      </form>
                    ) : (
                      u.id !== adminAtual.id && (
                        <form action={removerAdmin}>
                          <input type="hidden" name="id" value={u.id} />
                          <ConfirmSubmitButton
                            pendingText="..."
                            confirmMessage={`Remover a permissão de administrador de ${u.nome}?`}
                            className="text-red-600 hover:underline"
                          >
                            Remover permissão de admin
                          </ConfirmSubmitButton>
                        </form>
                      )
                    )}

                    {u.role !== "admin" && (
                      u.role !== "parceiro" ? (
                        <form action={tornarParceiro}>
                          <input type="hidden" name="id" value={u.id} />
                          <ConfirmSubmitButton
                            pendingText="..."
                            confirmMessage={`Tornar ${u.nome} parceiro? Ele passará a ter acesso à área de afiliados.`}
                            className="text-navy hover:underline"
                          >
                            Tornar parceiro
                          </ConfirmSubmitButton>
                        </form>
                      ) : (
                        <form action={removerParceiro}>
                          <input type="hidden" name="id" value={u.id} />
                          <ConfirmSubmitButton
                            pendingText="..."
                            confirmMessage={`Remover a permissão de parceiro de ${u.nome}?`}
                            className="text-red-600 hover:underline"
                          >
                            Remover permissão de parceiro
                          </ConfirmSubmitButton>
                        </form>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {(usuarios ?? []).length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-navy-dark/50">Nenhum usuário encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 max-w-2xl rounded-2xl bg-white p-6 shadow">
        <h2 className="font-display font-bold text-navy-dark">Adicionar aluno manualmente</h2>
        <p className="mt-1 text-sm text-navy-dark/60">
          Cria a matrícula, libera o acesso e envia o e-mail de convite — sem passar pelo checkout do Asaas.
          Use para vendas fechadas fora da plataforma, cortesias ou bolsas.
        </p>
        <form action={criarAlunoManual} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold" htmlFor="nome">Nome</label>
              <input id="nome" name="nome" required className="mt-1 w-full rounded-lg border p-3" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="email">E-mail</label>
              <input id="email" name="email" type="email" required className="mt-1 w-full rounded-lg border p-3" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="telefone">Telefone/WhatsApp</label>
              <input id="telefone" name="telefone" required placeholder="(87) 99999-9999" className="mt-1 w-full rounded-lg border p-3" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="planoId">Plano</label>
              <select id="planoId" name="planoId" required className="mt-1 w-full rounded-lg border p-3">
                <option value="">Selecione...</option>
                {(planos ?? []).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="dataInicio">Data de início</label>
              <input id="dataInicio" name="dataInicio" type="date" required className="mt-1 w-full rounded-lg border p-3" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="dataVencimento">Data de vencimento (vazio = sem vencimento)</label>
              <input id="dataVencimento" name="dataVencimento" type="date" className="mt-1 w-full rounded-lg border p-3" />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="statusMatricula">Status da matrícula</label>
              <select id="statusMatricula" name="statusMatricula" defaultValue="ativa" className="mt-1 w-full rounded-lg border p-3">
                <option value="ativa">Ativa</option>
                <option value="pendente">Pendente</option>
                <option value="bloqueada">Bloqueada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="origemPagamento">Origem do pagamento</label>
              <select id="origemPagamento" name="origemPagamento" defaultValue="manual" className="mt-1 w-full rounded-lg border p-3">
                <option value="manual">Pagamento confirmado manualmente</option>
                <option value="asaas">Pagamento via Asaas</option>
                <option value="cortesia">Cortesia/bolsa</option>
              </select>
            </div>
          </div>
          <SubmitButton
            pendingText="Cadastrando..."
            className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
          >
            Cadastrar aluno
          </SubmitButton>
        </form>
      </div>

      <p className="mt-6 text-sm text-navy-dark/50">
        Precisa gerenciar cupons de parceiros? <Link href="/admin/cupons" className="underline">Vá para Cupons</Link>.
      </p>
    </div>
  );
}
