"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { ehMotor } from "@/lib/ia/tipos";

export interface Estado {
  erro?: string;
}

async function usuarioAtual() {
  const supabase = criarClienteServidor();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return { supabase, usuarioId: user.id };
}

/**
 * Próximo número livre de uma sequência (tutoria dentro de um módulo, SP dentro
 * de uma tutoria).
 *
 * Vale dizer o que isto NÃO é: uma reserva. Duas abas criando tutoria ao mesmo
 * tempo podem ler o mesmo número. Quem resolve isso de fato é a chave única no
 * banco — aqui só evita-se o caso comum, e o raro vira um erro honesto em vez
 * de duas pastas com o mesmo nome.
 */
async function proximoNumero(
  supabase: Awaited<ReturnType<typeof usuarioAtual>>["supabase"],
  tabela: "tutorias" | "situacoes_problema",
  coluna: "numero" | "ordem",
  filtro: Record<string, string>
): Promise<number> {
  let consulta = supabase.from(tabela).select(coluna).order(coluna, { ascending: false }).limit(1);
  for (const [campo, valor] of Object.entries(filtro)) consulta = consulta.eq(campo, valor);

  const { data } = await consulta.returns<Array<Record<string, number>>>();
  return (data?.[0]?.[coluna] ?? 0) + 1;
}

export async function criarTutoria(_anterior: Estado, formulario: FormData): Promise<Estado> {
  const { supabase, usuarioId } = await usuarioAtual();

  const titulo = String(formulario.get("titulo") ?? "").trim();
  const modulo = String(formulario.get("modulo") ?? "").trim();
  if (!titulo) return { erro: "Dê um nome à tutoria." };

  const numeroInformado = Number(formulario.get("numero"));
  const numero =
    Number.isInteger(numeroInformado) && numeroInformado > 0
      ? numeroInformado
      : await proximoNumero(supabase, "tutorias", "numero", { usuario_id: usuarioId, modulo });

  const { data, error } = await supabase
    .from("tutorias")
    .insert({ usuario_id: usuarioId, numero, titulo, modulo })
    .select("id")
    .single();

  if (error) {
    return {
      erro: error.code === "23505" ? `Você já tem uma Tutoria ${numero} nesse módulo.` : error.message
    };
  }

  revalidatePath("/tutorias");
  redirect(`/tutorias/${data.id}`);
}

export async function criarSituacaoProblema(_anterior: Estado, formulario: FormData): Promise<Estado> {
  const { supabase, usuarioId } = await usuarioAtual();

  const tutoriaId = String(formulario.get("tutoria_id") ?? "");
  const titulo = String(formulario.get("titulo") ?? "").trim();
  const enunciado = String(formulario.get("enunciado") ?? "").trim();
  if (!tutoriaId) return { erro: "Tutoria não informada." };
  if (!titulo) return { erro: "Dê um nome à situação-problema." };

  const ordem = await proximoNumero(supabase, "situacoes_problema", "ordem", { tutoria_id: tutoriaId });

  // O `usuario_id` daqui é descartado: o gatilho `sp_herda_dono` sobrescreve
  // com o dono REAL da tutoria antes de a linha entrar. Esse par — gatilho
  // seguido da RLS — é o que impede criar uma SP na pasta de outra pessoa: se
  // `tutoria_id` for de outro dono, o gatilho grava o id da vítima e aí o
  // `with check (usuario_id = auth.uid())` da policy recusa a inserção.
  const { data, error } = await supabase
    .from("situacoes_problema")
    .insert({ tutoria_id: tutoriaId, usuario_id: usuarioId, ordem, titulo, enunciado })
    .select("id")
    .single();

  if (error) return { erro: error.message };

  revalidatePath(`/tutorias/${tutoriaId}`);
  redirect(`/sp/${data.id}`);
}

export async function salvarEnunciado(_anterior: Estado, formulario: FormData): Promise<Estado> {
  const { supabase } = await usuarioAtual();

  const spId = String(formulario.get("sp_id") ?? "");
  const enunciado = String(formulario.get("enunciado") ?? "").trim();
  if (!spId) return { erro: "Situação-problema não informada." };

  const { error } = await supabase.from("situacoes_problema").update({ enunciado }).eq("id", spId);
  if (error) return { erro: error.message };

  revalidatePath(`/sp/${spId}`);
  return {};
}

export async function alternarObjetivo(objetivoId: string, concluido: boolean) {
  const { supabase } = await usuarioAtual();

  const { data } = await supabase
    .from("objetivos")
    .update({ concluido })
    .eq("id", objetivoId)
    .select("sp_id")
    .maybeSingle<{ sp_id: string }>();

  if (data) revalidatePath(`/sp/${data.sp_id}`);
}

export async function salvarMotor(_anterior: Estado, formulario: FormData): Promise<Estado> {
  const { supabase, usuarioId } = await usuarioAtual();

  const motor = String(formulario.get("motor") ?? "");
  if (!ehMotor(motor)) return { erro: "Motor inválido." };

  const { error } = await supabase.from("perfis").update({ motor_ia: motor }).eq("id", usuarioId);
  if (error) return { erro: error.message };

  revalidatePath("/configuracoes");
  return {};
}

export async function salvarNome(_anterior: Estado, formulario: FormData): Promise<Estado> {
  const { supabase, usuarioId } = await usuarioAtual();

  const nome = String(formulario.get("nome") ?? "").trim();
  if (!nome) return { erro: "O nome não pode ficar vazio." };

  const { error } = await supabase.from("perfis").update({ nome }).eq("id", usuarioId);
  if (error) return { erro: error.message };

  revalidatePath("/configuracoes");
  return {};
}

export async function esquecerMemoria(memoriaId: string) {
  const { supabase } = await usuarioAtual();
  await supabase.from("memorias").delete().eq("id", memoriaId);
  revalidatePath("/configuracoes");
}

export async function apagarResumo(resumoId: string) {
  const { supabase } = await usuarioAtual();

  const { data } = await supabase
    .from("resumos")
    .delete()
    .eq("id", resumoId)
    .select("sp_id")
    .maybeSingle<{ sp_id: string }>();

  if (data) {
    revalidatePath(`/sp/${data.sp_id}`);
    redirect(`/sp/${data.sp_id}`);
  }
  redirect("/tutorias");
}
