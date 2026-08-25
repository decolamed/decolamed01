import Link from "next/link";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAlert } from "@/components/admin/admin-alert";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { ExcluirUsuario } from "@/components/admin/excluir-usuario";
import { WhatsappButton } from "@/components/admin/whatsapp-button";
import { TabelaResponsiva } from "@/components/admin/tabela-responsiva";
import { AcaoDeCadastro } from "@/components/admin/acao-de-cadastro";
import { PLANO_DO_ALUNO } from "@/lib/supabase/vinculos";
import { resumosDosAlunos } from "@/lib/site/desempenho-servidor";
import { diasSemEstudar } from "@/lib/site/desempenho";
import { hojeISO } from "@/lib/site/data";
import type { Profile } from "@/types/database";
import {
  criarAlunoManual,
  criarProfessorManual,
  criarParceiroManual,
  alterarPlano,
  reenviarConvite,
  reenviarSenha,
  desativarUsuario,
  reativarUsuario,
  excluirUsuario,
  tornarAdmin,
  removerAdmin,
  tornarParceiro,
  removerParceiro,
  tornarProfessor,
  removerProfessor
} from "./actions";

const ROLE_LABEL: Record<string, string> = {
  aluno: "Aluno",
  admin: "Administrador",
  parceiro: "Parceiro",
  professor: "Professor"
};

export default async function AdminUsuariosPage({
  searchParams
}: {
  searchParams: { q?: string; role?: string; erro?: string; sucesso?: string };
}) {
  const adminAtual = await requireAdmin();
  const supabase = createAdminClient();

  // `PLANO_DO_ALUNO` e não `planos(nome)`: desde que a comissão de redação
  // criou `planos.professor_id`, existem DUAS chaves estrangeiras entre
  // `profiles` e `planos`, e o PostgREST recusa a consulta inteira em vez de
  // escolher uma. Ver lib/supabase/vinculos.ts.
  let query = supabase
    .from("profiles")
    .select(`*, ${PLANO_DO_ALUNO}(nome)`)
    .order("created_at", { ascending: false });
  if (searchParams.q) {
    query = query.or(`nome.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%`);
  }
  if (searchParams.role) {
    query = query.eq("role", searchParams.role);
  }
  const { data: usuarios, error: erroDaLista } = await query;
  const { data: planos } = await supabase.from("planos").select("id, nome").eq("ativo", true).order("ordem");

  // Indicadores de acompanhamento na própria listagem: quem está evoluindo,
  // quem praticou pouco e quem parou de estudar. Vêm das mesmas contas do
  // perfil individual (lib/site/desempenho.ts), numa leitura só para toda a
  // lista em vez de uma consulta por aluno.
  const alunos = ((usuarios ?? []) as Profile[]).filter((u) => u.role === "aluno");
  const desempenhos = await resumosDosAlunos(supabase, alunos.map((a) => a.id));
  const hoje = hojeISO();

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-navy-dark sm:text-2xl">Usuários</h1>
      {/* A falha da consulta é MOSTRADA, não engolida. Descartar o `error` foi
          o que transformou uma consulta recusada pelo PostgREST em "nenhum
          usuário encontrado" — uma tela que parece funcionar e está vazia é
          pior do que uma que avisa que quebrou. */}
      <AdminAlert
        erro={
          erroDaLista
            ? `Não foi possível carregar a lista de usuários: ${erroDaLista.message}`
            : searchParams.erro
        }
        sucesso={searchParams.sucesso}
      />

      {/* As três ações de cadastro ficam AQUI, antes de tudo. Antes viviam
          depois da tabela: com a lista crescendo, encontrá-las virava uma
          rolagem até o fim de centenas de linhas. */}
      <div className="mt-4 flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap">
        <AcaoDeCadastro
          titulo="Adicionar usuário"
          descricao="Cria a matrícula, libera o acesso e envia o e-mail de convite — sem passar pelo checkout do Asaas. Use para vendas fechadas fora da plataforma, cortesias ou bolsas."
        >
          <form action={criarAlunoManual} className="space-y-4">
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
        </AcaoDeCadastro>

        <AcaoDeCadastro
          titulo="Adicionar parceiro"
          descricao="Cria o acesso de um afiliado, que passa a ver o próprio painel de vendas e comissões. Depois de criado, gere o cupom dele em Cupons. Sem matrícula e sem plano — é um papel de trabalho, não de estudo."
        >
          <form action={criarParceiroManual} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" htmlFor="parc-nome">Nome</label>
                <input id="parc-nome" name="nome" required className="mt-1 w-full rounded-lg border p-3" />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="parc-email">E-mail</label>
                <input id="parc-email" name="email" type="email" required className="mt-1 w-full rounded-lg border p-3" />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="parc-telefone">Telefone/WhatsApp (opcional)</label>
                <input id="parc-telefone" name="telefone" placeholder="(87) 99999-9999" className="mt-1 w-full rounded-lg border p-3" />
              </div>
            </div>
            <SubmitButton
              pendingText="Cadastrando..."
              className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
            >
              Cadastrar parceiro
            </SubmitButton>
          </form>
        </AcaoDeCadastro>

        <AcaoDeCadastro
          titulo="Adicionar professor"
          descricao="Cria o acesso de um professor, que passa a ver os créditos de redação dos alunos e o próprio financeiro. Sem matrícula e sem plano. Ele recebe um e-mail para definir a própria senha."
        >
          <form action={criarProfessorManual} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold" htmlFor="prof-nome">Nome</label>
                <input id="prof-nome" name="nome" required className="mt-1 w-full rounded-lg border p-3" />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="prof-email">E-mail</label>
                <input id="prof-email" name="email" type="email" required className="mt-1 w-full rounded-lg border p-3" />
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="prof-telefone">Telefone/WhatsApp (opcional)</label>
                <input id="prof-telefone" name="telefone" placeholder="(87) 99999-9999" className="mt-1 w-full rounded-lg border p-3" />
              </div>
            </div>
            <SubmitButton
              pendingText="Cadastrando..."
              className="rounded-full bg-orange px-6 py-3 font-display font-bold text-white hover:bg-orange-dark"
            >
              Cadastrar professor
            </SubmitButton>
          </form>
        </AcaoDeCadastro>
      </div>

      <form className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap" action="/admin/usuarios">
        <input
          name="q"
          defaultValue={searchParams.q}
          placeholder="Buscar por nome ou e-mail"
          className="w-full rounded-lg border p-3 sm:max-w-sm"
        />
        <select name="role" defaultValue={searchParams.role ?? ""} className="w-full rounded-lg border p-3 sm:w-auto">
          <option value="">Todos os papéis</option>
          <option value="aluno">Alunos</option>
          <option value="parceiro">Parceiros</option>
          <option value="professor">Professores</option>
          <option value="admin">Administradores</option>
        </select>
        <SubmitButton pendingText="..." className="rounded-lg bg-navy px-5 py-3 font-semibold text-white">
          Filtrar
        </SubmitButton>
      </form>

      <div className="mt-6">
        <TabelaResponsiva
          linhas={(usuarios ?? []) as (Profile & { planos: { nome: string } | null })[]}
          chave={(u) => u.id}
          vazio="Nenhum usuário encontrado."
          colunas={[
            {
              titulo: "Nome",
              principal: true,
              celula: (u) => (
                <>
                  <Link href={`/admin/usuarios/${u.id}`} className="font-semibold text-navy-dark hover:underline">
                    {u.nome}
                  </Link>
                  {u.criado_manualmente && (
                    <span className="ml-2 rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-semibold text-navy-dark/50">
                      manual
                    </span>
                  )}
                </>
              )
            },
            {
              titulo: "Contato",
              celula: (u) => (
                <div>
                  <p className="break-all">{u.email}</p>
                  <p className="text-xs text-navy-dark/50">{u.telefone ?? "sem telefone"}</p>
                  <div className="mt-1">
                    <WhatsappButton telefone={u.telefone} nome={u.nome} />
                  </div>
                </div>
              )
            },
            { titulo: "Papel", celula: (u) => ROLE_LABEL[u.role] ?? u.role },
            {
              titulo: "Desempenho",
              celula: (u) => {
                if (u.role !== "aluno") return "—";
                const d = desempenhos.get(u.id);
                if (!d || d.semDados) return <span className="text-navy-dark/40">sem atividade</span>;
                return (
                  <div className="whitespace-nowrap">
                    <span
                      className={`font-extrabold ${
                        d.precisao >= 70 ? "text-green" : d.precisao >= 50 ? "text-orange" : "text-red"
                      }`}
                    >
                      {d.precisao}%
                    </span>
                    <span className="text-navy-dark/50"> · {d.questoes} questões</span>
                  </div>
                );
              }
            },
            {
              titulo: "Última atividade",
              celula: (u) => {
                if (u.role !== "aluno") return "—";
                const parado = diasSemEstudar(desempenhos.get(u.id)?.ultimaAtividade ?? null, hoje);
                if (parado === null) return <span className="text-navy-dark/40">nunca estudou</span>;
                if (parado === 0) return "hoje";
                return (
                  <span className={parado >= 7 ? "font-semibold text-orange" : ""}>há {parado} dia(s)</span>
                );
              }
            },
            {
              titulo: "Plano",
              celula: (u) =>
                u.role === "aluno" ? (
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
                )
            },
            {
              titulo: "Status",
              celula: (u) =>
                u.ativo ? (
                  <span className="rounded-full bg-green-soft px-2 py-1 text-xs font-semibold text-green">Ativo</span>
                ) : (
                  <span className="rounded-full bg-red-soft px-2 py-1 text-xs font-semibold text-red">Desativado</span>
                )
            }
          ]}
          acoes={(u) => (
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
                    className={u.ativo ? "text-red hover:underline" : "text-green hover:underline"}
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
                      className="text-red hover:underline"
                    >
                      Remover permissão de admin
                    </ConfirmSubmitButton>
                  </form>
                )
              )}

              {u.role !== "admin" &&
                (u.role !== "parceiro" ? (
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
                      className="text-red hover:underline"
                    >
                      Remover permissão de parceiro
                    </ConfirmSubmitButton>
                  </form>
                ))}

              {u.role !== "admin" &&
                (u.role !== "professor" ? (
                  <form action={tornarProfessor}>
                    <input type="hidden" name="id" value={u.id} />
                    <ConfirmSubmitButton
                      pendingText="..."
                      confirmMessage={`Tornar ${u.nome} professor?`}
                      className="text-navy hover:underline"
                    >
                      Tornar professor
                    </ConfirmSubmitButton>
                  </form>
                ) : (
                  <form action={removerProfessor}>
                    <input type="hidden" name="id" value={u.id} />
                    <ConfirmSubmitButton
                      pendingText="..."
                      confirmMessage={`Remover a permissão de professor de ${u.nome}?`}
                      className="text-red hover:underline"
                    >
                      Remover permissão de professor
                    </ConfirmSubmitButton>
                  </form>
                ))}

              {/* Separado do resto de propósito: tudo acima é reversível, isto
                  não é. A exclusão pede o e-mail digitado antes de mostrar o
                  botão — ver components/admin/excluir-usuario.tsx. */}
              {u.id !== adminAtual.id && (
                <div className="mt-1 w-full border-t border-navy-dark/10 pt-1.5">
                  <ExcluirUsuario id={u.id} nome={u.nome} email={u.email} acao={excluirUsuario} />
                </div>
              )}
            </div>
          )}
        />
      </div>

      <p className="mt-6 text-sm text-navy-dark/50">
        Precisa gerenciar cupons de parceiros? <Link href="/admin/cupons" className="underline">Vá para Cupons</Link>.
      </p>
    </div>
  );
}
