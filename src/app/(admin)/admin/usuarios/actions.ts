"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { registrarHistoricoAdmin } from "@/lib/historico/registrar";
import { destinoDoAdmin } from "@/lib/auth/destino-do-admin";
import { instanteNoFuso, MEIO_DIA, FIM_DO_DIA } from "@/lib/site/data";

const PATH = "/admin/usuarios";

function erro(mensagem: string): never {
  redirect(`${PATH}?erro=${encodeURIComponent(mensagem)}`);
}

/**
 * Para onde voltar depois de enviar o e-mail.
 *
 * As ações de envio nasceram na lista e sempre voltavam para ela. Chamadas da
 * página do aluno — que é de onde se troca o e-mail e se entrega o acesso —
 * isso tirava o administrador da tela no meio do processo. O formulário diz
 * para onde voltar; sem dizer nada, continua indo para a lista.
 *
 * A restrição a caminhos internos vive em `lib/auth/destino-do-admin.ts`, que
 * é onde ela pode ser testada. Aqui fica só a leitura do campo, que é o que
 * esta action conhece.
 */
function destinoDeRetorno(formData: FormData): string {
  return destinoDoAdmin(formData.get("voltarPara") as string | null);
}

function sucesso(mensagem: string): never {
  redirect(`${PATH}?sucesso=${encodeURIComponent(mensagem)}`);
}

// ----------------------------------------------------------------------------
// 1. Adicionar aluno manualmente
// ----------------------------------------------------------------------------
const criarAlunoSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo."),
  // .toLowerCase() evita problema de duas contas "diferentes" por causa de
  // maiúscula/minúscula (Supabase Auth já normaliza e-mail para minúsculo
  // internamente — sem isso, profiles.email podia ficar dessincronizado
  // do e-mail real usado pra login).
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  telefone: z.string().trim().min(8, "Informe um telefone/WhatsApp válido."),
  planoId: z.string().uuid("Selecione um plano."),
  dataInicio: z.string().min(1, "Informe a data de início."),
  dataVencimento: z.string().optional(),
  statusMatricula: z.enum(["pendente", "ativa", "bloqueada", "cancelada"]),
  origemPagamento: z.enum(["asaas", "manual", "cortesia"])
});

export async function criarAlunoManual(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = criarAlunoSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    planoId: formData.get("planoId"),
    dataInicio: formData.get("dataInicio"),
    dataVencimento: formData.get("dataVencimento") || undefined,
    statusMatricula: formData.get("statusMatricula"),
    origemPagamento: formData.get("origemPagamento")
  });

  if (!parsed.success) {
    erro(parsed.error.errors[0]?.message ?? "Dados inválidos.");
  }

  const { nome, email, telefone, planoId, dataInicio, dataVencimento, statusMatricula, origemPagamento } =
    parsed.data;

  const supabase = createAdminClient();

  const { data: plano } = await supabase.from("planos").select("*").eq("id", planoId).single();
  if (!plano) erro("Plano não encontrado.");

  // 1. Cria o usuário no Supabase Auth via convite — mesmo mecanismo do fluxo
  //    automático (webhook do Asaas): o aluno define a própria senha pelo
  //    link recebido por e-mail, nunca enviamos senha pronta. Isso já
  //    "libera o acesso" ao aluno.
  //
  //    O CONVITE ENVIA UM E-MAIL, e envio de e-mail tem cota. O serviço de
  //    e-mail embutido do Supabase limita poucos envios por hora; estourada
  //    a cota, `/invite` responde 429 "email rate limit exceeded" e NENHUMA
  //    conta é criada. Foi exatamente o que aconteceu aqui: cinco 429
  //    seguidos nos logs de autenticação, nenhum usuário novo no banco, e o
  //    administrador vendo só "Não foi possível criar o usuário" — porque o
  //    código descartava a mensagem real do erro.
  //
  //    O cadastro não pode depender de uma cota de envio. Quando o limite
  //    estoura, a conta é criada assim mesmo (sem e-mail) e o administrador
  //    manda o acesso depois pelo botão "Enviar acesso", que já existe na
  //    página do aluno.
  const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/redefinir-senha`,
    data: { nome }
  });

  let alunoId: string;
  let acessoEnviado = true;

  if (invited?.user) {
    alunoId = invited.user.id;
  } else {
    const mensagem = inviteError?.message ?? "";
    if (/already|registered|exists/i.test(mensagem)) {
      erro("Já existe um usuário cadastrado com esse e-mail.");
    }

    const limiteDeEmail = inviteError?.status === 429 || /rate limit/i.test(mensagem);
    if (!limiteDeEmail) {
      // Qualquer outra falha continua sendo bloqueante — mas agora o
      // administrador vê a causa em vez de uma frase genérica.
      erro(`Não foi possível criar o usuário: ${mensagem || "erro desconhecido na autenticação."}`);
    }

    const { data: criado, error: erroCriacao } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: { nome }
    });
    if (erroCriacao || !criado?.user) {
      const jaExiste = /already|registered|exists/i.test(erroCriacao?.message ?? "");
      erro(
        jaExiste
          ? "Já existe um usuário cadastrado com esse e-mail."
          : `Não foi possível criar o usuário: ${erroCriacao?.message ?? "erro desconhecido."}`
      );
    }
    alunoId = criado.user.id;
    acessoEnviado = false;
  }

  // 2. Profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: alunoId,
    nome,
    email,
    telefone,
    role: "aluno",
    plano_id: planoId,
    ativo: true,
    criado_manualmente: true,
    criado_por: admin.id
  });

  if (profileError) {
    console.error("Erro ao criar profile manual:", profileError);
    erro("Usuário criado no login, mas falhou ao salvar o perfil. Contate o suporte técnico.");
  }

  // 3. Matrícula
  //
  // As datas vêm de <input type="date">, ou seja, dias de calendário sem
  // hora. `new Date("2026-08-18")` os fixava à meia-noite UTC — que em
  // Brasília ainda é dia 17, às 21h. A venda registrada como "18/08"
  // aparecia no dia 17 no filtro de período de /admin/vendas. Ao meio-dia
  // do fuso da plataforma o dia é o mesmo em qualquer leitura, com 12h de
  // folga para os dois lados (mesmo motivo de `somarDias` em site/data.ts).
  const acessoLiberadoEm = statusMatricula === "ativa" ? instanteNoFuso(dataInicio, MEIO_DIA).toISOString() : null;
  // O vencimento é o último dia COM acesso, então vale até o fim dele. Com a
  // meia-noite UTC de antes, "acesso até 30/09" cortava o aluno às 21h do
  // dia 29 — um dia inteiro a menos do que foi vendido.
  const acessoExpiraEm = dataVencimento ? instanteNoFuso(dataVencimento, FIM_DO_DIA).toISOString() : null;

  const { data: matricula, error: matriculaError } = await supabase
    .from("matriculas")
    .insert({
      aluno_id: alunoId,
      plano_id: planoId,
      status: statusMatricula,
      acesso_liberado_em: acessoLiberadoEm,
      acesso_liberado_manualmente: true,
      acesso_expira_em: acessoExpiraEm,
      origem_pagamento: origemPagamento,
      criado_por: admin.id,
      observacao: "Matrícula criada manualmente pelo administrador."
    })
    .select("id")
    .single();

  if (matriculaError || !matricula) {
    console.error("Erro ao criar matrícula manual:", matriculaError);
    erro("Usuário criado, mas falhou ao criar a matrícula. Ajuste manualmente em /admin/matriculas.");
  }

  // 4. Venda correspondente — para aparecer no dashboard de Vendas mesmo
  //    sendo uma matrícula criada fora do checkout normal. Cortesia entra
  //    com valor zero (não é uma "venda" de fato, mas mantém o histórico
  //    completo de como o aluno ganhou acesso).
  const valorCentavos = origemPagamento === "cortesia" ? 0 : plano.preco_centavos;
  const { error: pagamentoError } = await supabase.from("pagamentos").insert({
    matricula_id: matricula.id,
    valor_centavos: valorCentavos,
    status: statusMatricula === "ativa" ? "confirmado" : "pendente",
    data_pagamento: acessoLiberadoEm ?? new Date().toISOString(),
    origem_pagamento: origemPagamento,
    criado_por: admin.id,
    comprador_nome: nome,
    comprador_email: email,
    plano_nome: plano.nome,
    plano_id: planoId
  });
  // Não bloqueia o fluxo aqui de propósito: a essa altura o aluno já foi
  // criado e já tem acesso liberado, que é o que mais importa. Só loga para
  // o admin conseguir investigar depois se a venda não aparecer em
  // /admin/vendas.
  if (pagamentoError) {
    console.error("Erro ao registrar pagamento da matrícula manual:", pagamentoError);
  }

  // 5. Auditoria — obrigatório pela spec: registrar que foi criado
  //    manualmente pelo administrador.
  await registrarHistoricoAdmin(supabase, {
    tipo: "matricula_criada_manual",
    usuarioAlvoId: alunoId,
    adminId: admin.id,
    detalhes: { plano: plano.nome, origem_pagamento: origemPagamento, status_matricula: statusMatricula }
  });

  revalidatePath(PATH);
  sucesso(
    acessoEnviado
      ? `Aluno ${nome} cadastrado com sucesso. Um e-mail de acesso foi enviado.`
      : `Aluno ${nome} cadastrado com sucesso — mas o e-mail de acesso NÃO saiu: o limite de envios por hora do ` +
        `serviço de e-mail foi atingido. A conta já existe e está na lista. Abra o aluno e use "Enviar acesso" ` +
        `quando o limite liberar (ou configure um SMTP próprio no Supabase para não ter mais essa cota).`
  );
}

// ----------------------------------------------------------------------------
// 2. Ações administrativas de usuário
// ----------------------------------------------------------------------------

/**
 * O e-mail e o nome do destinatário SEMPRE vêm do banco, pelo id — nunca do
 * formulário.
 *
 * Antes vinham dos campos ocultos da linha da tabela. Isso funcionava até o
 * momento em que o e-mail da conta muda: a página aberta antes da troca
 * continua carregando o endereço antigo, e o clique mandaria o acesso para
 * ele. É exatamente o caso de uso de trocar o e-mail provisório pelo real —
 * o envio precisa ir para o endereço que está valendo agora.
 */
async function destinatario(supabase: ReturnType<typeof createAdminClient>, id: string) {
  const { data } = await supabase.from("profiles").select("nome, email").eq("id", id).maybeSingle();
  const email = ((data?.email as string | undefined) ?? "").trim();
  if (!email) erro("Não foi possível identificar o e-mail desta conta.");
  return { email, nome: (data?.nome as string | undefined) ?? "" };
}

export async function reenviarConvite(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const { email, nome } = await destinatario(supabase, id);

  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/redefinir-senha`,
    data: { nome }
  });

  // Se o usuário já confirmou o convite anteriormente, o Supabase recusa um
  // novo convite ("User already registered"). Nesse caso, reenviar um link
  // de redefinição de senha cumpre o mesmo papel prático de "recuperar o
  // acesso" — é o fallback funcional mais próximo do que foi pedido.
  if (inviteError) {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/redefinir-senha`
    });
    if (resetError) erro("Não foi possível reenviar o e-mail de acesso.");
  }

  await registrarHistoricoAdmin(supabase, {
    tipo: "convite_reenviado",
    usuarioAlvoId: id,
    adminId: admin.id,
    detalhes: { email }
  });

  revalidatePath(PATH);
  redirect(`${destinoDeRetorno(formData)}?sucesso=${encodeURIComponent(`E-mail de acesso enviado para ${email}.`)}`);
}

export async function reenviarSenha(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const { email } = await destinatario(supabase, id);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/redefinir-senha`
  });
  if (error) erro(`Não foi possível reenviar o e-mail: ${error.message}`);

  await registrarHistoricoAdmin(supabase, {
    tipo: "senha_redefinicao_reenviada",
    usuarioAlvoId: id,
    adminId: admin.id,
    detalhes: { email }
  });

  revalidatePath(PATH);
  redirect(`${destinoDeRetorno(formData)}?sucesso=${encodeURIComponent(`E-mail de redefinição de senha enviado para ${email}.`)}`);
}

export async function desativarUsuario(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));

  if (id === admin.id) erro("Você não pode desativar a própria conta.");

  const supabase = createAdminClient();

  // Bane o usuário no nível do Supabase Auth (bloqueia login de fato, não só
  // a exibição no painel) e espelha o status em profiles.ativo para a UI e
  // para as regras de negócio que já leem o profile.
  const { error: banError } = await supabase.auth.admin.updateUserById(id, { ban_duration: "876000h" });
  if (banError) erro("Não foi possível desativar o usuário.");

  const { error: profileError } = await supabase.from("profiles").update({ ativo: false }).eq("id", id);
  if (profileError) erro("Usuário banido no login, mas falhou ao atualizar o status no perfil. Contate o suporte técnico.");

  await registrarHistoricoAdmin(supabase, {
    tipo: "usuario_desativado",
    usuarioAlvoId: id,
    adminId: admin.id
  });

  revalidatePath(PATH);
  sucesso("Usuário desativado.");
}

export async function reativarUsuario(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = createAdminClient();

  const { error: unbanError } = await supabase.auth.admin.updateUserById(id, { ban_duration: "none" });
  if (unbanError) erro("Não foi possível reativar o usuário.");

  const { error: profileError } = await supabase.from("profiles").update({ ativo: true }).eq("id", id);
  if (profileError) erro("Usuário desbanido no login, mas falhou ao atualizar o status no perfil. Contate o suporte técnico.");

  await registrarHistoricoAdmin(supabase, {
    tipo: "usuario_reativado",
    usuarioAlvoId: id,
    adminId: admin.id
  });

  revalidatePath(PATH);
  sucesso("Usuário reativado.");
}

export async function tornarAdmin(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = createAdminClient();

  const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", id);
  if (error) erro("Não foi possível promover o usuário a administrador.");

  await registrarHistoricoAdmin(supabase, {
    tipo: "usuario_promovido_admin",
    usuarioAlvoId: id,
    adminId: admin.id
  });

  revalidatePath(PATH);
  sucesso("Usuário promovido a administrador.");
}

export async function removerAdmin(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));

  if (id === admin.id) erro("Você não pode remover a própria permissão de administrador.");

  const supabase = createAdminClient();
  const { error } = await supabase.from("profiles").update({ role: "aluno" }).eq("id", id);
  if (error) erro("Não foi possível remover a permissão de administrador.");

  await registrarHistoricoAdmin(supabase, {
    tipo: "usuario_rebaixado_admin",
    usuarioAlvoId: id,
    adminId: admin.id
  });

  revalidatePath(PATH);
  sucesso("Permissão de administrador removida.");
}

export async function tornarParceiro(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = createAdminClient();

  const { error } = await supabase.from("profiles").update({ role: "parceiro" }).eq("id", id);
  if (error) erro("Não foi possível tornar o usuário parceiro.");

  await registrarHistoricoAdmin(supabase, {
    tipo: "usuario_promovido_parceiro",
    usuarioAlvoId: id,
    adminId: admin.id
  });

  revalidatePath(PATH);
  sucesso("Usuário agora é parceiro. Vincule um cupom a ele em /admin/cupons.");
}

export async function removerParceiro(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = createAdminClient();

  const { error } = await supabase.from("profiles").update({ role: "aluno" }).eq("id", id);
  if (error) erro("Não foi possível remover a permissão de parceiro.");

  await registrarHistoricoAdmin(supabase, {
    tipo: "usuario_rebaixado_parceiro",
    usuarioAlvoId: id,
    adminId: admin.id
  });

  revalidatePath(PATH);
  sucesso("Permissão de parceiro removida.");
}

// ----------------------------------------------------------------------------
// 3. Adicionar professor manualmente
// ----------------------------------------------------------------------------
const criarProfessorSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo."),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  telefone: z.string().trim().optional()
});

export async function criarProfessorManual(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = criarProfessorSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone") || undefined
  });

  if (!parsed.success) {
    erro(parsed.error.errors[0]?.message ?? "Dados inválidos.");
  }

  const { nome, email, telefone } = parsed.data;
  const supabase = createAdminClient();

  const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/redefinir-senha`,
    data: { nome }
  });

  if (inviteError || !invited?.user) {
    const jaExiste = inviteError?.message?.toLowerCase().includes("already");
    erro(jaExiste ? "Já existe um usuário cadastrado com esse e-mail." : "Não foi possível criar o usuário.");
  }

  const professorId = invited.user.id;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: professorId,
    nome,
    email,
    telefone: telefone ?? null,
    role: "professor",
    ativo: true,
    criado_manualmente: true,
    criado_por: admin.id
  });

  if (profileError) {
    console.error("Erro ao criar profile de professor:", profileError);
    erro("Usuário criado no login, mas falhou ao salvar o perfil. Contate o suporte técnico.");
  }

  await registrarHistoricoAdmin(supabase, {
    tipo: "professor_criado_manual",
    usuarioAlvoId: professorId,
    adminId: admin.id
  });

  revalidatePath(PATH);
  sucesso(`Professor ${nome} cadastrado com sucesso. Um e-mail de acesso foi enviado.`);
}

export async function tornarProfessor(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = createAdminClient();

  const { error } = await supabase.from("profiles").update({ role: "professor" }).eq("id", id);
  if (error) erro("Não foi possível tornar o usuário professor.");

  await registrarHistoricoAdmin(supabase, {
    tipo: "usuario_promovido_professor",
    usuarioAlvoId: id,
    adminId: admin.id
  });

  revalidatePath(PATH);
  sucesso("Usuário agora é professor.");
}

export async function removerProfessor(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = createAdminClient();

  const { error } = await supabase.from("profiles").update({ role: "aluno" }).eq("id", id);
  if (error) erro("Não foi possível remover a permissão de professor.");

  await registrarHistoricoAdmin(supabase, {
    tipo: "usuario_rebaixado_professor",
    usuarioAlvoId: id,
    adminId: admin.id
  });

  revalidatePath(PATH);
  sucesso("Permissão de professor removida.");
}

export async function alterarPlano(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ plano_id: String(formData.get("planoId")) })
    .eq("id", String(formData.get("id")));
  if (error) erro("Não foi possível atualizar o plano do usuário.");
  revalidatePath(PATH);
}
