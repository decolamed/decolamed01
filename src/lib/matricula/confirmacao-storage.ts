import type { MatriculaChargeResult } from "@/types/matricula";

// A página de confirmação precisa dos dados completos da cobrança (inclusive
// o QR Code em base64, que é grande demais para ir na URL). Em vez de expor
// um endpoint público "GET /api/matricula/:chargeId" — que vazaria dados de
// cobrança para qualquer um com o id — guardamos a resposta que o form já
// recebeu do POST em sessionStorage e a confirmação apenas lê de lá.
//
// sessionStorage sobrevive a um refresh da mesma aba, mas não é compartilhado
// entre abas/dispositivos. Se os dados não estiverem lá (ex: aluno abriu o
// link da confirmação em outro lugar, ou fechou a aba), a página cai num
// estado de fallback pedindo para conferir o e-mail — sem tentar re-buscar a
// cobrança sem autenticação.
const STORAGE_KEY = "decolamed:matricula:confirmacao";

export const MATRICULA_CONFIRMACAO_STORAGE_KEY = STORAGE_KEY;

export function salvarConfirmacaoMatricula(dados: MatriculaChargeResult) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  } catch {
    // sessionStorage pode falhar (modo privado, quota etc.) — nesse caso a
    // página de confirmação simplesmente cai no fallback. Não é crítico.
  }
}

export function lerConfirmacaoMatricula(chargeId: string | undefined): MatriculaChargeResult | null {
  if (!chargeId) return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const dados = JSON.parse(raw) as MatriculaChargeResult;
    // Garante que não estamos exibindo a cobrança de uma matrícula anterior
    // feita na mesma aba (ex: aluno voltou e preencheu o form de novo).
    return dados.chargeId === chargeId ? dados : null;
  } catch {
    return null;
  }
}
