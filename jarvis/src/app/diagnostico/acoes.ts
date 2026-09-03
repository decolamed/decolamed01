"use server";

import { conversarComClaude } from "@/lib/ia/claude";
import { conversarComGemini } from "@/lib/ia/gemini";
import type { Motor } from "@/lib/ia/tipos";

export interface ResultadoDoTeste {
  motor: Motor;
  ok: boolean;
  detalhe: string;
}

/**
 * Faz UMA chamada mínima ao motor escolhido.
 *
 * Este teste é o único jeito de saber que a chave presta: uma chave com erro
 * de digitação, uma conta sem crédito e um projeto do Google sem a API ligada
 * são todos indistinguíveis até alguém tentar de verdade. E ele é um botão, e
 * não algo que roda ao abrir a página, porque cada clique gasta alguns
 * centavos de token — pouco, mas não zero, e ninguém deve gastar sem saber.
 */
export async function testarMotor(motor: Motor): Promise<ResultadoDoTeste> {
  const pedido = {
    motor,
    sistema: "Você é um teste de conexão. Responda exatamente: FUNCIONANDO",
    turnos: [{ papel: "usuario" as const, texto: "teste" }],
    ferramentas: [],
    maxTokens: 2000
  };

  try {
    const r = motor === "claude" ? await conversarComClaude(pedido) : await conversarComGemini(pedido);
    const texto = r.texto.trim();
    if (!texto) {
      return { motor, ok: false, detalhe: "O modelo respondeu, mas veio vazio." };
    }
    return { motor, ok: true, detalhe: `Respondeu: "${texto.slice(0, 60)}"` };
  } catch (e) {
    return { motor, ok: false, detalhe: e instanceof Error ? e.message : "Falha desconhecida." };
  }
}
