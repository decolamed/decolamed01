// ============================================================================
// VÍNCULOS AMBÍGUOS ENTRE TABELAS
//
// Quando existem DUAS chaves estrangeiras ligando as mesmas duas tabelas, o
// PostgREST se recusa a adivinhar qual delas seguir: devolve PGRST201 e recusa
// a consulta inteira. Como o `error` costuma ser descartado por quem chama, a
// falha não aparece como erro — aparece como lista vazia.
//
// Isso já aconteceu duas vezes neste projeto:
//
//   1. `matriculas` → `profiles` (aluno_id e criado_por), que fazia a tela de
//      Matrículas dizer "Nenhuma matrícula ainda" com matrículas ativas no
//      banco;
//   2. `profiles` → `planos`, quando a comissão de redação criou
//      `planos.professor_id` apontando de volta para `profiles`. A partir daí
//      `planos(nome)` virou ambíguo, e a lista de Usuários ficou vazia.
//
// O segundo caso é pior que o primeiro porque as duas chaves apontam em
// DIREÇÕES OPOSTAS — `profiles.plano_id → planos` e `planos.professor_id →
// profiles`. Nada na tela de Planos sugere que mexer nela apagaria a tela de
// Usuários.
//
// Os nomes ficam aqui, num lugar só, para que uma chave nova criada amanhã
// tenha um lugar óbvio para ser conferida — e para que a busca por
// "profiles_plano_id_fkey" encontre todos os pontos afetados de uma vez.
// ============================================================================

/**
 * O plano do ALUNO (`profiles.plano_id`), e não o plano do qual ele é
 * professor responsável (`planos.professor_id`).
 *
 * O PostgREST devolve o resultado sob a chave `planos`, como antes — só a
 * escolha do caminho fica explícita.
 */
export const PLANO_DO_ALUNO = "planos!profiles_plano_id_fkey";
