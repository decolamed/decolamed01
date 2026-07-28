import { createClient } from "@/lib/supabase/server";

// Nome do vestibular/instituição alvo da plataforma. Fica em `configuracoes`
// (editável em /admin/configuracoes) em vez de escrito no código porque a
// mesma plataforma pode ser usada para outros processos seletivos — antes,
// "FACAPE" estava fixo em textos de onboarding, briefing e resultados de
// simulado, o que impedia reaproveitar o produto sem mexer no código.
//
// O padrão é intencionalmente genérico: sem nada configurado, a interface
// fala em "vestibular", que é verdadeiro em qualquer cenário.
export const VESTIBULAR_PADRAO = "vestibular";

export async function getNomeVestibular(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.from("configuracoes").select("valor").eq("chave", "site.marca.vestibular").maybeSingle();
  const valor = typeof data?.valor === "string" ? data.valor.trim() : "";
  return valor || VESTIBULAR_PADRAO;
}

// Rótulo da nota ponderada mostrada ao aluno nos simulados/atividades. Com
// um vestibular configurado vira "Nota FACAPE (ponderada)"; sem ele, apenas
// "Nota ponderada" — nunca um nome de instituição escrito no código.
export function rotuloNotaPonderada(nomeVestibular: string): string {
  return nomeVestibular === VESTIBULAR_PADRAO ? "Nota ponderada" : `Nota ${nomeVestibular} (ponderada)`;
}
