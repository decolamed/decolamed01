// ===========================================================================
// Conferência da configuração
//
// Sem isto, um `.env.local` incompleto produz o pior tipo de falha: tela
// branca, ou um erro do Supabase sobre uma URL inválida que não diz a ninguém
// que o problema é uma variável que faltou preencher. Quem está montando o
// próprio Jarvis pela primeira vez não tem como adivinhar isso.
//
// A regra aqui é: descobrir o que falta ANTES de tentar usar, e dizer em
// português o que fazer.
// ===========================================================================

export interface VariavelFaltando {
  nome: string;
  ondeConseguir: string;
}

function vazia(nome: string): boolean {
  return !process.env[nome]?.trim();
}

/** O mínimo para o aplicativo subir: sem banco, não há o que mostrar. */
export function faltaParaOBanco(): VariavelFaltando[] {
  const faltando: VariavelFaltando[] = [];

  if (vazia("NEXT_PUBLIC_SUPABASE_URL")) {
    faltando.push({
      nome: "NEXT_PUBLIC_SUPABASE_URL",
      ondeConseguir: "Supabase → seu projeto → Project Settings → API → Project URL"
    });
  }
  if (vazia("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    faltando.push({
      nome: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ondeConseguir: "Supabase → seu projeto → Project Settings → API → a chave pública (anon / publishable)"
    });
  }

  return faltando;
}

/**
 * A IA é conferida separado do banco porque a falta dela é MENOS grave: o
 * aplicativo abre, as pastas e os resumos antigos funcionam, e só a conversa
 * não. Tratar as duas faltas como a mesma coisa esconderia isso.
 */
export function faltaParaAIa(): VariavelFaltando[] {
  if (!vazia("ANTHROPIC_API_KEY") || !vazia("GEMINI_API_KEY")) return [];

  return [
    {
      nome: "GEMINI_API_KEY ou ANTHROPIC_API_KEY",
      ondeConseguir:
        "Gemini (tem plano gratuito): aistudio.google.com/apikey · " +
        "Claude (pago por uso): console.anthropic.com"
    }
  ];
}

export function bancoConfigurado(): boolean {
  return faltaParaOBanco().length === 0;
}

/**
 * O e-mail exigido pela política de uso do NCBI. Não impede nada de funcionar
 * — por isso é aviso, e não erro —, mas sem ele o bloqueio por IP é questão de
 * tempo se o uso crescer.
 */
export function avisoDoPubmed(): string | null {
  return vazia("NCBI_EMAIL")
    ? "NCBI_EMAIL está vazio. O PubMed funciona assim, mas a política de uso deles pede um e-mail de contato — sem ele, o risco de bloqueio por IP aumenta."
    : null;
}
