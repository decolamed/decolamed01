// ============================================================================
// PARA ONDE O ADMIN VOLTA DEPOIS DE ENVIAR ACESSO
//
// As ações de envio nasceram na lista de usuários e sempre voltavam para ela.
// Chamadas da página de um aluno — que é de onde se troca o e-mail e se
// entrega o acesso — isso tirava o administrador da tela no meio do processo.
// O formulário diz para onde voltar; sem dizer nada, continua indo para a
// lista.
//
// O valor vem do formulário, então é ENTRADA NÃO CONFIÁVEL: sem restrição
// viraria redirecionamento aberto. Só caminhos internos de /admin/usuarios
// passam — a lista, ou a página de um aluno identificado por UUID.
//
// Vive num módulo próprio, e não dentro da server action, porque a regra
// precisa ser verificável. Enquanto ela morava lá dentro, o teste mantinha
// uma CÓPIA dela: se a regra mudasse na action, o teste continuaria passando
// sozinho e a proteção deixaria de ser verificada — que é o defeito que este
// arquivo existe para eliminar.
// ============================================================================

/** Destino padrão: a lista de usuários. */
export const DESTINO_PADRAO_ADMIN = "/admin/usuarios";

/**
 * O caminho pedido, se for interno e reconhecido; senão, a lista.
 *
 * Recebe o valor cru (string) em vez do FormData para poder ser testado sem
 * montar um FormData — a leitura do campo fica na server action, que é quem
 * conhece o nome dele.
 */
export function destinoDoAdmin(pedido: string | null | undefined): string {
  const valor = String(pedido ?? "");
  return /^\/admin\/usuarios(\/[0-9a-f-]{36})?$/i.test(valor) ? valor : DESTINO_PADRAO_ADMIN;
}
