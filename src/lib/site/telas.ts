// Nome legível de cada tela do app do aluno.
//
// O app é uma SPA: a URL não muda ao navegar entre Painel, Questões,
// Flashcards etc. Então, quando o aluno relata um erro, a tela de origem só
// pode vir de dentro do próprio app — não dá para inferir do referer nem da
// rota. E sem ela o relato é um chamado que o admin não consegue reproduzir:
// "o botão não funciona" sem dizer onde.
//
// Fica fora de relato-actions.ts porque aquele arquivo é "use server", onde
// todo export precisa ser uma função async — uma constante e uma função
// síncrona quebrariam o build.
export const NOME_TELA: Record<string, string> = {
  painel: "Painel de Bordo",
  estudos: "Estudos",
  questoes: "Questões",
  flashcards: "Flashcards",
  "flashcards-select": "Flashcards — seleção",
  simulados: "Simulados",
  plano: "Cronograma",
  copiloto: "Copiloto",
  ranking: "Ranking",
  conquistas: "Conquistas",
  redacao: "Redação",
  perfil: "Perfil",
  config: "Configurações",
  notificacoes: "Notificações",
  briefing: "Plano de voo",
  player: "Player de vídeo",
  conteudo: "Biblioteca",
  navegador: "Navegador interno",
  senha: "Alterar senha"
};

export function nomeDaTela(tela: string | undefined | null): string | null {
  if (!tela) return null;
  // Tela desconhecida devolve a própria chave em vez de null: um nome técnico
  // ainda localiza o problema, enquanto null apagaria a informação.
  return NOME_TELA[tela] ?? tela;
}
