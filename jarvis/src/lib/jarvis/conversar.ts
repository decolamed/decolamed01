import { conversar as conversarComMotor, ErroDeMotor, type Motor, type Turno } from "@/lib/ia";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { Memoria, Mensagem, Objetivo, Perfil, SituacaoProblema, Tutoria } from "@/types/banco";
import { criarFerramentas } from "./ferramentas";
import { montarPrompt } from "./prompt";

// Quantos turnos anteriores vão junto. O contexto do modelo comporta muito
// mais, mas cada turno é reenviado inteiro a cada mensagem — o custo cresce
// pelo quadrado. Vinte e quatro turnos cobrem uma sessão de estudo inteira; o
// que ficou para trás continua acessível pela memória e pelos resumos, que é
// exatamente para isso que eles existem.
const TURNOS_DE_HISTORICO = 24;

export interface RespostaDaConversa {
  texto: string;
  acoes: Array<{ ferramenta: string; descricao: string; erro: boolean }>;
}

export class ErroDaConversa extends Error {}

/**
 * Um turno completo: recebe o que o aluno escreveu, devolve o que o Jarvis
 * respondeu, e deixa os dois gravados.
 */
export async function responder(spId: string, textoDoAluno: string): Promise<RespostaDaConversa> {
  const texto = textoDoAluno.trim();
  if (!texto) throw new ErroDaConversa("Escreva alguma coisa antes de enviar.");

  const supabase = criarClienteServidor();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new ErroDaConversa("Sua sessão expirou. Entre de novo.");

  // Uma consulta por tabela, todas em paralelo. Cada uma passa pela RLS, então
  // uma SP de outro usuário simplesmente não volta — a checagem de dono está
  // no banco, não numa condição aqui que alguém pode esquecer de escrever.
  const [sp, perfil, objetivos, memorias, historico, resumos] = await Promise.all([
    supabase
      .from("situacoes_problema")
      .select("*, tutoria:tutorias(*)")
      .eq("id", spId)
      .maybeSingle<SituacaoProblema & { tutoria: Tutoria }>(),
    supabase.from("perfis").select("*").eq("id", user.id).maybeSingle<Perfil>(),
    supabase.from("objetivos").select("*").eq("sp_id", spId).order("ordem").returns<Objetivo[]>(),
    supabase
      .from("memorias")
      .select("*")
      .order("criado_em", { ascending: false })
      .limit(40)
      .returns<Memoria[]>(),
    supabase
      .from("mensagens")
      .select("*")
      .eq("sp_id", spId)
      .order("criado_em", { ascending: false })
      .limit(TURNOS_DE_HISTORICO)
      .returns<Mensagem[]>(),
    supabase.from("resumos").select("titulo").eq("sp_id", spId).returns<Array<{ titulo: string }>>()
  ]);

  if (!sp.data) throw new ErroDaConversa("Situação-problema não encontrada.");

  const motorPreferido: Motor = perfil.data?.motor_ia ?? "claude";

  const sistema = montarPrompt({
    tutoria: sp.data.tutoria,
    sp: sp.data,
    objetivos: objetivos.data ?? [],
    memorias: memorias.data ?? [],
    resumosExistentes: (resumos.data ?? []).map((r) => r.titulo),
    nomeDoAluno: perfil.data?.nome ?? ""
  });

  // O histórico volta do banco do mais novo para o mais velho (é assim que o
  // índice serve o LIMIT sem varrer a conversa inteira). O modelo lê na ordem
  // cronológica, então inverte aqui.
  const turnos: Turno[] = [...(historico.data ?? [])]
    .reverse()
    .map((m) => ({ papel: m.papel === "usuario" ? "usuario" : "jarvis", texto: m.conteudo }));

  turnos.push({ papel: "usuario", texto });

  // A mensagem do aluno é gravada ANTES da chamada ao modelo. Se a IA falhar,
  // o que ele escreveu não se perde junto — ele recarrega a página e a
  // pergunta continua lá.
  await supabase.from("mensagens").insert({
    sp_id: spId,
    usuario_id: user.id,
    papel: "usuario",
    conteudo: texto
  });

  let resposta;
  try {
    resposta = await conversarComMotor({
      motor: motorPreferido,
      sistema,
      turnos,
      ferramentas: criarFerramentas({ supabase, usuarioId: user.id, spId })
    });
  } catch (e) {
    if (e instanceof ErroDeMotor) throw new ErroDaConversa(e.message);
    throw e;
  }

  const conteudo =
    resposta.texto ||
    "(o modelo terminou o turno sem escrever nada — tente reformular a pergunta)";

  await supabase.from("mensagens").insert({
    sp_id: spId,
    usuario_id: user.id,
    papel: "jarvis",
    conteudo,
    acoes: resposta.acoes
  });

  return { texto: conteudo, acoes: resposta.acoes };
}
