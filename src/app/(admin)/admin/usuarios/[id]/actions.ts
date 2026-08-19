"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/server";
import { registrarHistoricoAdmin } from "@/lib/historico/registrar";
import { z } from "zod";
import { salvarBriefingDoAluno } from "@/lib/briefing/salvar-briefing";
import type { AlunoMissaoTipo } from "@/types/database";
import { lerItensDoFormulario } from "@/lib/trilha/itens-do-mentor";

// Cronograma individual de um aluno específico (aluno_missoes) — não mexe
// em trilha_dias (o cronograma geral, compartilhado por todo mundo sem
// Copiloto). decola-app.tsx passa a usar essas missões em vez do
// cronograma compartilhado assim que o aluno tiver pelo menos uma (ver scrPlano()).
export async function adicionarMissaoIndividual(alunoId: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const data = String(formData.get("data") ?? "").trim();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "livre") as AlunoMissaoTipo;
  const materia = String(formData.get("materia") ?? "").trim() || null;
  const assunto = String(formData.get("assunto") ?? "").trim() || null;
  const duracao = Number(formData.get("duracao") ?? 30) || 30;

  // O CONTEÚDO da missão — o que faltava.
  //
  // A missão manual gravava só data/título/tipo/matéria/duração e nunca
  // preenchia `ref_id`, que é justamente a coluna que `navMissao` usa para
  // abrir o material. Uma missão de aula criada pelo admin caía no fallback
  // por título e, não achando nada, avisava "ainda não há aulas publicadas".
  //
  // Duas formas de anexar, e as duas terminam no MESMO lugar
  // (`conteudos_biblioteca`), que é a estrutura que o app do aluno já sabe
  // abrir. Não existe um segundo cadastro de material.
  const conteudoId = String(formData.get("conteudo_id") ?? "").trim() || null;
  const urlNova = String(formData.get("url") ?? "").trim();

  const erro = (msg: string) =>
    redirect(`/admin/usuarios/${alunoId}?erro=${encodeURIComponent(msg)}`);

  if (!data || !titulo) erro("Informe a data e o título da missão.");
  if (urlNova && !/^https?:\/\//i.test(urlNova)) {
    erro("O link precisa começar com http:// ou https://.");
  }

  let refId: string | null = conteudoId;

  // Link novo: vira um material da biblioteca e a missão aponta para ele.
  // Assim o material fica reutilizável em outros cronogramas e o aluno o abre
  // pelo mesmo visualizador interno de sempre.
  if (!refId && urlNova) {
    const { data: criado, error: erroConteudo } = await supabase
      .from("conteudos_biblioteca")
      .insert({
        tipo: "link",
        titulo,
        materia,
        assunto,
        url: urlNova,
        ativo: true
      })
      .select("id")
      .single();
    if (erroConteudo || !criado) erro("Não foi possível salvar o link do material.");
    refId = criado!.id as string;
  }

  const { error } = await supabase.from("aluno_missoes").insert({
    aluno_id: alunoId,
    data,
    titulo,
    tipo,
    materia,
    assunto,
    ref_id: refId,
    duracao_minutos: duracao,
    duracao_estimada_min: duracao,
    prioridade: 1,
    origem: "admin",
    concluida: false
  });

  revalidatePath(`/admin/usuarios/${alunoId}`);
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  if (error) erro("Não foi possível adicionar a missão.");
  redirect(`/admin/usuarios/${alunoId}?sucesso=${encodeURIComponent("Missão adicionada ao cronograma individual.")}`);
}

export async function excluirMissaoIndividual(alunoId: string, missaoId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("aluno_missoes").delete().eq("id", missaoId).eq("aluno_id", alunoId);
  revalidatePath(`/admin/usuarios/${alunoId}`);
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  // Antes o redirect anunciava "Missão removida." mesmo quando a exclusão
  // falhava: o admin lia a confirmação e a missão continuava na lista logo
  // abaixo, no mesmo carregamento.
  if (error) {
    redirect(`/admin/usuarios/${alunoId}?erro=${encodeURIComponent("Não foi possível remover a missão.")}`);
  }
  redirect(`/admin/usuarios/${alunoId}?sucesso=${encodeURIComponent("Missão removida.")}`);
}

// ============================================================================
// O MENTOR EDITA UM DIA DA ROTA DESTE ALUNO
//
// Renomear aula, trocar link, acrescentar material, excluir item, esvaziar o
// dia — tudo é a mesma operação: o mentor define A LISTA do dia, e ela
// substitui a que o gerador montaria. Esvaziar é o caso de lista vazia.
//
// Por que não gravar direto em `aluno_rota_dias`: a rota é REGERADA a cada
// leitura da tela do aluno (rotaDoAluno → gerarRota → sincronizarRota). Uma
// escrita ali voltaria atrás sozinha no carregamento seguinte.
// `aluno_rota_dias` é RESULTADO; `aluno_rota_dias_ajustes` é INTENÇÃO, e é a
// intenção que sobrevive à regeração — mesmo padrão de `aluno_simulados_rota`.
//
// É sempre por aluno: o cronograma compartilhado (`trilha_dias`, em
// Conteúdo → Cronograma) não é tocado por nada aqui.
// ============================================================================

export async function salvarDiaDaRota(alunoId: string, routeDay: number, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const erro = (msg: string) => redirect(`/admin/usuarios/${alunoId}?erro=${encodeURIComponent(msg)}`);
  if (!Number.isInteger(routeDay) || routeDay < 1) erro("Dia inválido.");

  const bruto = String(formData.get("itens") ?? "[]");
  const itens = lerItensDoFormulario(bruto);
  const titulo = String(formData.get("titulo") ?? "").trim() || null;

  // Só um caso merece recusa: o mentor mandou conteúdo e NADA sobreviveu à
  // validação. Salvar em silêncio deixaria o dia vazio sem ele saber por quê.
  // Lista vazia de propósito continua valendo — é como se esvazia um dia.
  if (itens.length === 0 && bruto.trim() !== "[]") {
    erro("Nenhum item válido: todo item precisa de um título, e o link precisa começar com http:// ou https://.");
  }

  const { error } = await supabase.from("aluno_rota_dias_ajustes").upsert(
    { aluno_id: alunoId, route_day: routeDay, titulo, itens, atualizado_em: new Date().toISOString() },
    { onConflict: "aluno_id,route_day" }
  );

  if (error) {
    console.error("Falha ao salvar o dia da rota:", alunoId, routeDay, error.code, error.message);
    erro("Não foi possível salvar o dia.");
  }

  // A rota persistida é reescrita na próxima leitura da tela do aluno, a
  // partir deste ajuste. Aqui só limpamos o cache das telas.
  revalidatePath(`/admin/usuarios/${alunoId}`);
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  redirect(
    `/admin/usuarios/${alunoId}?sucesso=${encodeURIComponent(
      itens.length === 0
        ? `Dia ${routeDay} esvaziado. Ele continua no cronograma, com a mesma data.`
        : `Dia ${routeDay} salvo com ${itens.length} ${itens.length === 1 ? "item" : "itens"}.`
    )}`
  );
}

/**
 * Devolve um dia ao que o gerador decide.
 *
 * Não é "desfazer a última edição": é remover o ajuste inteiro, e o dia volta
 * a ser calculado pelo algoritmo a partir do briefing e do desempenho.
 */
export async function restaurarDiaDaRota(alunoId: string, routeDay: number) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("aluno_rota_dias_ajustes")
    .delete()
    .eq("aluno_id", alunoId)
    .eq("route_day", routeDay);

  if (error) {
    console.error("Falha ao restaurar dia da rota:", alunoId, routeDay, error.message);
    redirect(`/admin/usuarios/${alunoId}?erro=${encodeURIComponent("Não foi possível restaurar o dia.")}`);
  }

  revalidatePath(`/admin/usuarios/${alunoId}`);
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  redirect(
    `/admin/usuarios/${alunoId}?sucesso=${encodeURIComponent(
      `Dia ${routeDay} voltou a ser montado pelo cronograma automático.`
    )}`
  );
}

// ============================================================================
// EDITAR PERFIL — incluindo a troca de e-mail da conta
//
// O caso de uso: preparar a conta inteira com um e-mail provisório (perfil,
// briefing, cronograma do Copiloto, data da prova) e, na hora de entregar o
// acesso, trocar para o e-mail real do aluno.
//
// O detalhe que faz isso dar certo ou errado: o e-mail mora em DOIS lugares
// e não há trigger nenhum ligando um ao outro —
//
//   auth.users.email  → é o que serve para login e recuperação de senha;
//   profiles.email    → é o que a plataforma exibe e usa nas telas.
//
// Mexer só em `profiles` (que é o caminho óbvio, e o que uma edição de
// formulário faria naturalmente) deixaria a conta num estado pior do que o
// inicial: o painel mostrando o e-mail novo e o aluno só conseguindo entrar
// pelo antigo. Por isso a autenticação é alterada PRIMEIRO — é ela que tem a
// unicidade de verdade — e, se a gravação do perfil falhar depois, o e-mail
// da autenticação é devolvido ao que era.
//
// Nada além dos três campos é tocado: mesmo `id`, mesma matrícula, mesmo
// briefing, mesmo cronograma, mesmo progresso.
// ============================================================================

const perfilSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo."),
  // .toLowerCase() pelo mesmo motivo do cadastro manual: o Supabase Auth
  // normaliza o e-mail internamente, e sem isso `profiles.email` ficaria
  // divergindo do e-mail real de login por causa de uma maiúscula.
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  telefone: z.string().trim().optional()
});

export async function atualizarPerfilDoUsuario(alunoId: string, formData: FormData) {
  const admin = await requireAdmin();
  const destino = `/admin/usuarios/${alunoId}`;
  const falhar: (mensagem: string) => never = (mensagem) =>
    redirect(`${destino}?erro=${encodeURIComponent(mensagem)}`);

  const parsed = perfilSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone") ?? ""
  });
  if (!parsed.success) falhar(parsed.error.errors[0]?.message ?? "Dados inválidos.");

  const { nome, email, telefone } = parsed.data;
  const supabase = createAdminClient();

  const { data: atual, error: erroLeitura } = await supabase
    .from("profiles")
    .select("id, nome, email, telefone")
    .eq("id", alunoId)
    .maybeSingle();
  if (erroLeitura || !atual) falhar("Usuário não encontrado.");

  const emailAntigo = (atual.email as string) ?? "";
  const trocouEmail = email !== emailAntigo.trim().toLowerCase();

  if (trocouEmail) {
    // Checagem amigável antes de tentar: o erro do Supabase para e-mail
    // duplicado é genérico, e o administrador precisa saber DE QUEM é o
    // e-mail para resolver.
    const { data: jaUsado } = await supabase
      .from("profiles")
      .select("id, nome")
      .ilike("email", email)
      .neq("id", alunoId)
      .maybeSingle();
    if (jaUsado) {
      falhar(
        `Este e-mail já pertence à conta de ${(jaUsado as { nome: string }).nome}. ` +
          "Use outro endereço ou ajuste a conta existente."
      );
    }

    // A troca de verdade: mesma linha de `auth.users`, mesmo id, só o e-mail
    // muda. `email_confirm` marca o endereço como confirmado porque quem
    // está trocando é o administrador — a posse do endereço é comprovada
    // logo em seguida, quando o aluno abre o link de acesso que só chega
    // nele. Sem isso a conta ficaria com um e-mail pendente e o aluno não
    // conseguiria entrar.
    const { error: erroAuth } = await supabase.auth.admin.updateUserById(alunoId, {
      email,
      email_confirm: true
    });
    if (erroAuth) {
      const duplicado = /already|registered|exists|duplicate/i.test(erroAuth.message);
      falhar(
        duplicado
          ? "Este e-mail já está em uso por outra conta na autenticação. Escolha outro endereço."
          : `Não foi possível alterar o e-mail de acesso: ${erroAuth.message}`
      );
    }
  }

  const { error: erroPerfil } = await supabase
    .from("profiles")
    .update({ nome, email, telefone: telefone || null })
    .eq("id", alunoId);

  if (erroPerfil) {
    // O perfil não gravou, mas a autenticação já mudou. Sem este desfazer, a
    // conta ficaria com um e-mail para login e outro na tela — exatamente a
    // dessincronização que esta função existe para evitar.
    if (trocouEmail) {
      await supabase.auth.admin.updateUserById(alunoId, { email: emailAntigo, email_confirm: true });
    }
    falhar("Não foi possível salvar o perfil. Nada foi alterado.");
  }

  await registrarHistoricoAdmin(supabase, {
    tipo: trocouEmail ? "email_alterado" : "perfil_editado",
    usuarioAlvoId: alunoId,
    adminId: admin.id,
    detalhes: trocouEmail ? { de: emailAntigo, para: email } : { nome, telefone: telefone || null }
  });

  revalidatePath(destino);
  revalidatePath("/admin/usuarios");
  redirect(
    `${destino}?sucesso=` +
      encodeURIComponent(
        trocouEmail
          ? `E-mail alterado para ${email}, na conta e no acesso. Use "Enviar acesso" para avisar o aluno no endereço novo.`
          : "Perfil atualizado."
      )
  );
}

// ============================================================================
// BRIEFING INICIAL DO VOO GUIADO — preenchido pelo mentor
//
// O briefing inicial deixou de ser do aluno. O mentor faz a mentoria, entende
// o perfil, e só então preenche aqui. Ao enviar, o cronograma é gerado na
// hora — sem etapa de aprovação no meio.
//
// O motor é o MESMO de sempre: `salvarBriefingDoAluno` grava em
// `aluno_briefing` e chama `reprojetarJornada`, que usa `regerarRotaDoAluno`
// (que por sua vez chama `gerarRota`) e roda o Copiloto. Não existe segundo
// motor, segundo formato de briefing nem tabela nova.
//
// Reenviar não duplica: `regerarRotaDoAluno` APAGA a rota anterior antes de
// gravar a nova (`limparRotaDoAluno`), e o briefing é upsert por `aluno_id`.
// Clicar duas vezes deixa o aluno com uma rota, não com duas.
//
// O RECALIBRAR VOO continua sendo do aluno e não foi tocado: ele chama o
// mesmo núcleo pelo caminho dele, com a permissão dele.
// ============================================================================
export async function gerarCronogramaDoAluno(alunoId: string, formData: FormData) {
  await requireAdmin();
  const destino = `/admin/usuarios/${alunoId}`;

  const resultado = await salvarBriefingDoAluno(alunoId, formData);
  if (!resultado.ok) {
    redirect(`${destino}?erro=${encodeURIComponent(resultado.erro)}`);
  }

  // As telas do aluno leem a rota no servidor; sem revalidar, ele continuaria
  // vendo "seu plano está sendo preparado" até o cache expirar.
  revalidatePath(destino);
  revalidatePath("/aluno");
  revalidatePath("/aluno/cronograma");
  revalidatePath("/admin/usuarios");

  redirect(
    `${destino}?sucesso=` +
      encodeURIComponent("Briefing salvo e cronograma gerado — já está disponível para o aluno.")
  );
}
