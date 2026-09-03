"use server";

import { revalidatePath } from "next/cache";
import { ErroDaConversa, responder } from "@/lib/jarvis/conversar";
import type { AcaoSalva } from "@/types/banco";

export interface RespostaDoTurno {
  texto?: string;
  acoes?: AcaoSalva[];
  erro?: string;
}

export async function enviarMensagem(spId: string, texto: string): Promise<RespostaDoTurno> {
  try {
    const { texto: resposta, acoes } = await responder(spId, texto);
    // Objetivos e resumos são renderizados no servidor e o Jarvis pode ter
    // mexido nos dois durante o turno. Sem isto, o painel lateral continua
    // mostrando o estado de antes até a pessoa recarregar na mão.
    revalidatePath(`/sp/${spId}`);
    return { texto: resposta, acoes };
  } catch (e) {
    if (e instanceof ErroDaConversa) return { erro: e.message };
    console.error("[jarvis] turno falhou:", e);
    return { erro: "Alguma coisa quebrou do nosso lado. Tente de novo." };
  }
}
