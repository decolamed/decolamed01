// ============================================================================
// O QUE DIZER AO ALUNO QUANDO A RECUPERAÇÃO DE SENHA FALHA
//
// As duas telas do fluxo mostravam uma frase genérica para qualquer erro, e o
// motivo real ia só para o console. Isso não é detalhe de texto: medido nos
// logs de autenticação do projeto, o aluno REPETIU a mesma senha porque a
// tela não disse que o problema era esse —
//
//   16:49:13  PUT /user  422  same_password
//   16:49:23  PUT /user  422  same_password   ← dez segundos depois
//
// e a mensagem ainda sugeria "peça um novo link de redefinição", mandando
// refazer um fluxo que estava funcionando. O mesmo vale para o limite de
// envio: sem saber que precisa esperar, o aluno clica de novo e toma outro
// 429, que é exatamente o que os logs mostram acontecendo.
//
// O que NÃO muda: nada aqui altera o fluxo, o link ou a sessão. É só a
// tradução do erro que o Supabase já devolvia.
//
// Sobre expor o motivo: dizer "essa senha é igual à anterior" a quem já está
// autenticado pela sessão de recuperação não revela nada que ele não saiba —
// ele acabou de digitar as duas. Já no PEDIDO do link (a outra tela), o
// motivo continua genérico de propósito: ali qualquer um digita qualquer
// e-mail, e confirmar se a conta existe entregaria isso a quem só chutou.
// ============================================================================

/** O formato do erro do supabase-js que interessa aqui. */
export interface ErroDeAutenticacao {
  code?: string | null;
  message?: string | null;
  status?: number | null;
}

/** Mensagem quando nada mais casa: honesta, sem inventar causa. */
export const MENSAGEM_PADRAO_SALVAR =
  "Não foi possível salvar a nova senha. Tente novamente em instantes.";

export const MENSAGEM_PADRAO_ENVIO =
  "Não foi possível enviar o e-mail de recuperação. Tente novamente em instantes.";

/**
 * O código do erro, com a mensagem como segunda fonte.
 *
 * Versões do supabase-js diferem: `code` é recente, e antes disso só existia
 * o texto. Ler os dois evita que a tela volte à mensagem genérica só porque a
 * biblioteca foi atualizada — ou não foi.
 */
function codigoDo(erro: ErroDeAutenticacao | null | undefined): string {
  if (!erro) return "";
  const codigo = String(erro.code ?? "").toLowerCase();
  if (codigo) return codigo;

  const texto = String(erro.message ?? "").toLowerCase();
  if (texto.includes("should be different from the old password")) return "same_password";
  if (texto.includes("rate limit") || texto.includes("you can only request this after")) {
    return "over_email_send_rate_limit";
  }
  if (texto.includes("password should be at least") || texto.includes("weak password")) {
    return "weak_password";
  }
  if (texto.includes("session") && texto.includes("not found")) return "session_not_found";
  return "";
}

/**
 * Quantos segundos o Supabase mandou esperar, quando ele diz.
 *
 * A mensagem do limite por endereço vem no formato "For security purposes,
 * you can only request this after 40 seconds." — e um número concreto é a
 * diferença entre o aluno esperar e o aluno clicar de novo.
 */
export function segundosDeEspera(erro: ErroDeAutenticacao | null | undefined): number | null {
  const texto = String(erro?.message ?? "");
  const achado = texto.match(/after (\d+) seconds?/i);
  if (!achado) return null;
  const n = Number(achado[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** A tela de criar a nova senha (`updateUser`). */
export function mensagemAoSalvarSenha(erro: ErroDeAutenticacao | null | undefined): string {
  switch (codigoDo(erro)) {
    case "same_password":
      return "Essa é a senha que você já usa. Escolha uma diferente para continuar.";

    case "weak_password":
      return "Essa senha é muito simples. Use uma combinação menos óbvia de letras e números.";

    case "over_email_send_rate_limit": {
      const s = segundosDeEspera(erro);
      return s
        ? `Muitas tentativas seguidas. Aguarde ${s} segundos e tente de novo.`
        : "Muitas tentativas seguidas. Aguarde um instante e tente de novo.";
    }

    case "session_not_found":
    case "session_expired":
      return "Seu link de acesso expirou. Peça um novo link de redefinição para continuar.";

    default:
      return MENSAGEM_PADRAO_SALVAR;
  }
}

/** A tela de pedir o link (`resetPasswordForEmail`). */
export function mensagemAoPedirLink(erro: ErroDeAutenticacao | null | undefined): string {
  if (codigoDo(erro) === "over_email_send_rate_limit") {
    const s = segundosDeEspera(erro);
    return s
      ? `Você acabou de pedir um link. Aguarde ${s} segundos antes de pedir outro.`
      : "Você acabou de pedir um link. Aguarde um instante antes de pedir outro — o anterior continua valendo.";
  }
  return MENSAGEM_PADRAO_ENVIO;
}
