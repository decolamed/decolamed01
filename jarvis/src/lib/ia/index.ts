import { conversarComClaude, claudeDisponivel } from "./claude";
import { conversarComGemini, geminiDisponivel } from "./gemini";
import { ErroDeMotor, MOTORES, type Conversa, type Motor, type Resposta } from "./tipos";

export * from "./tipos";

/**
 * Quais motores este servidor tem chave para usar. A tela de configurações só
 * oferece estes — deixar o aluno escolher um motor sem chave só produz uma
 * conversa que falha depois, quando ele já digitou a pergunta.
 */
export function motoresDisponiveis(): Motor[] {
  return MOTORES.filter((m) => (m === "claude" ? claudeDisponivel() : geminiDisponivel()));
}

/**
 * Resolve qual motor de fato vai rodar.
 *
 * A preferência do aluno não é uma garantia: a chave pode ter sido removida do
 * servidor depois que ele escolheu. Cair no outro motor é melhor do que
 * devolver erro — a conversa continua, só com voz diferente.
 */
export function motorEfetivo(preferido: Motor): Motor {
  const disponiveis = motoresDisponiveis();
  if (disponiveis.includes(preferido)) return preferido;
  if (disponiveis.length > 0) return disponiveis[0];
  throw new ErroDeMotor(
    preferido,
    "Nenhum motor de IA está configurado neste servidor. Defina ANTHROPIC_API_KEY ou GEMINI_API_KEY."
  );
}

export async function conversar(conversa: Conversa): Promise<Resposta> {
  const motor = motorEfetivo(conversa.motor);
  const pedido = { ...conversa, motor };
  return motor === "claude" ? conversarComClaude(pedido) : conversarComGemini(pedido);
}
