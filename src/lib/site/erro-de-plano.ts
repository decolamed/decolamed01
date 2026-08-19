// ============================================================================
// POR QUE O BANCO RECUSOU O PLANO
//
// A tabela `planos` tem UNIQUE(slug): o slug é o endereço público do plano
// (/inscricao/<slug>), então dois planos com o mesmo slug tornariam um deles
// inalcançável. Quando o admin repete um slug, o Postgres devolve 23505 e a
// gravação inteira é desfeita — nada é salvo.
//
// Do lado da tela isso aparecia como "o plano não aparece na lista" e "a
// edição não salva": a gravação falhava de verdade, mas o aviso saía sem
// cor nenhuma (as classes bg-red-50/text-red-600 não existem neste tema) e
// não dizia QUAL plano já usava o slug — então não havia como agir.
// ============================================================================

/** unique_violation no Postgres. */
export const CODIGO_UNICIDADE = "23505";

interface ErroDoBanco {
  code?: string | null;
  message?: string | null;
}

/**
 * O erro é uma violação de unicidade?
 *
 * O código é a fonte confiável: a mensagem do Postgres muda com a versão e
 * com o idioma do servidor, e a checagem antiga (`message.includes("duplicate")`)
 * dependia dela estar em inglês. A busca no texto fica só como rede de
 * segurança para clientes que não repassam o código.
 */
export function ehSlugDuplicado(erro: ErroDoBanco | null | undefined): boolean {
  if (!erro) return false;
  if (erro.code === CODIGO_UNICIDADE) return true;
  return /duplicate key|already exists|unique constraint/i.test(erro.message ?? "");
}

/**
 * O que dizer ao admin quando o slug já está em uso.
 *
 * Quando sabemos de quem é o slug, o nome entra na mensagem: sem isso o
 * admin precisa abrir os planos um a um para descobrir com qual conflitou.
 */
export function mensagemDeSlugDuplicado(slug: string, nomeDoOutroPlano?: string | null): string {
  const dono = (nomeDoOutroPlano ?? "").trim();
  return dono
    ? `O endereço "${slug}" já é usado pelo plano "${dono}". Escolha outro slug.`
    : `Já existe um plano com o endereço "${slug}". Escolha outro slug.`;
}
