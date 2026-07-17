"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { registrarHistoricoAdmin } from "@/lib/historico/registrar";

const PATH = "/admin/usuarios";

function erro(mensagem: string): never {
  redirect(`${PATH}?erro=${encodeURIComponent(mensagem)}`);
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
  const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/redefinir-senha`,
    data: { nome }
  });

  if (inviteError || !invited?.user) {
    const jaExiste = inviteError?.message?.toLowerCase().includes("already");
    erro(jaExiste ? "Já existe um usuário cadastrado com esse e-mail." : "Não foi possível criar o usuário.");
  }

  const alunoId = invited.user.id;

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
  const acessoLiberadoEm = statusMatricula === "ativa" ? new Date(dataInicio).toISOString() : null;
  const acessoExpiraEm = dataVencimento ? new Date(dataVencimento).toISOString() : null;

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
  sucesso(`Aluno ${nome} cadastrado com sucesso. Um e-mail de acesso foi enviado.`);
}

// ----------------------------------------------------------------------------
// 2. Ações administrativas de usuário
// ----------------------------------------------------------------------------

export async function reenviarConvite(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const email = String(formData.get("email"));
  const nome = String(formData.get("nome") ?? "");

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
  sucesso("E-mail de acesso reenviado.");
}

export async function reenviarSenha(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  const email = String(formData.get("email"));

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
  sucesso("E-mail de redefinição de senha reenviado.");
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
