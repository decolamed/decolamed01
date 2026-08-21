// Tipos manuais que espelham supabase/schema.sql.
// Assim que o projeto estiver conectado ao Supabase, o ideal é substituir
// este arquivo pelo tipo gerado automaticamente:
//   npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.ts

export type UserRole = "aluno" | "admin" | "parceiro" | "professor";
export type MatriculaStatus = "pendente" | "ativa" | "bloqueada" | "cancelada";
export type PagamentoStatus = "pendente" | "confirmado" | "recebido" | "estornado" | "falhou";
export type FormaPagamento = "pix" | "boleto" | "cartao";
export type OrigemPagamento = "asaas" | "manual" | "cortesia";
export type ComissaoStatus = "pendente" | "paga" | "cancelada";

export interface Plano {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco_centavos: number;
  ciclo: string;
  duracao_meses: number | null; // null = acesso ilimitado
  beneficios: string[];
  ativo: boolean;
  ordem: number;
  creditos_redacao: number;
  tem_copiloto: boolean;
  created_at: string;
  updated_at: string;
  // Parcelamento no cartão, por plano. Pix e boleto não têm parcela e não são
  // afetados. Todo plano nasce com parcelamento desligado — ligar é decisão
  // do administrador, plano a plano.
  parcelamento_ativo: boolean;
  parcelas_maximas: number;
  juros_ativo: boolean;
  /** Juros ao mês em porcentagem: 2.5 = 2,5% a.m. Só vale com juros_ativo. */
  juros_percentual: number;
}

export type CupomTipo = "percentual" | "fixo";

export interface Cupom {
  id: string;
  codigo: string;
  tipo: CupomTipo;
  valor: number; // percentual: 0-100 | fixo: reais
  valido_ate: string | null;
  limite_usos: number | null;
  usos: number;
  ativo: boolean;
  parceiro_id: string | null;
  percentual_comissao: number; // 0-100
  // Planos em que o cupom vale. Nulo ou vazio = todos os planos — é o que
  // mantém funcionando todo cupom criado antes desta coluna existir.
  // Ver lib/cupons/planos-aplicaveis.ts.
  planos_aplicaveis: string[] | null;
  created_at: string;
}

export interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  cpf: string | null;
  role: UserRole;
  plano_id: string | null;
  ativo: boolean;
  criado_manualmente: boolean;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreCadastro {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  plano_id: string;
  asaas_customer_id: string | null;
  asaas_charge_id: string | null;
  cupom_codigo: string | null;
  desconto_centavos: number;
  convertido: boolean;
  created_at: string;
}

export interface Matricula {
  id: string;
  aluno_id: string | null;
  pre_cadastro_id: string | null;
  plano_id: string;
  status: MatriculaStatus;
  asaas_customer_id: string | null;
  asaas_charge_id: string | null;
  acesso_liberado_em: string | null;
  acesso_liberado_manualmente: boolean;
  acesso_expira_em: string | null; // null = acesso ilimitado
  cupom_codigo: string | null;
  origem_pagamento: OrigemPagamento;
  criado_por: string | null;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pagamento {
  id: string;
  matricula_id: string | null;
  pre_cadastro_id: string | null;
  asaas_payment_id: string | null;
  valor_centavos: number;
  forma_pagamento: FormaPagamento | null;
  status: PagamentoStatus;
  data_pagamento: string | null;
  payload: Record<string, unknown> | null;
  origem_pagamento: OrigemPagamento;
  parceiro_id: string | null;
  cupom_codigo: string | null;
  comissao_centavos: number;
  valor_liquido_centavos: number | null;
  criado_por: string | null;
  comprador_nome: string | null;
  comprador_email: string | null;
  plano_nome: string | null;
  plano_id: string | null;
  created_at: string;
}

export interface ComissaoParceiro {
  id: string;
  parceiro_id: string;
  pagamento_id: string;
  valor_centavos: number;
  status: ComissaoStatus;
  data_pagamento: string | null;
  created_at: string;
  updated_at: string;
}

export interface HistoricoAdmin {
  id: string;
  tipo: string;
  usuario_alvo_id: string | null;
  admin_id: string | null;
  detalhes: Record<string, unknown>;
  created_at: string;
}

export interface Configuracao {
  chave: string;
  valor: unknown;
  updated_at: string;
}

export interface Notificacao {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  created_at: string;
}

export type Dificuldade = "facil" | "media" | "dificil";

export interface Alternativa {
  id: string;
  texto: string;
}

// Elemento visual de uma questão (gráfico, tabela, mapa, charge, ou até o
// recorte da questão inteira quando a fórmula se perde na extração de
// texto). `url` pode ser um caminho estático (/questoes-facape/...) ou uma
// data URI (data:image/png;base64,...) — o componente que renderiza não
// precisa se importar com qual dos dois é, um <img> aceita ambos.
export interface ImagemQuestao {
  url: string;
  legenda: string | null;
  ordem: number;
}

export interface Questao {
  id: string;
  materia: string;
  assunto: string | null;
  enunciado: string;
  alternativas: Alternativa[];
  resposta_correta: string;
  explicacao: string | null;
  dificuldade: Dificuldade;
  fonte: string | null;
  // Origem da prova (migração 029) — todas opcionais porque questões
  // cadastradas à mão pelo admin não têm prova de origem.
  prova_codigo: string | null;
  prova_nome: string | null;
  ano: number | null;
  semestre: number | null;
  modalidade: "ampla" | "peba" | null;
  numero_questao: number | null;
  idioma: "ingles" | "espanhol" | null;
  anulada: boolean;
  imagens: ImagemQuestao[];
  ativo: boolean;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface RespostaAluno {
  id: string;
  aluno_id: string;
  questao_id: string;
  alternativa_escolhida: string;
  correta: boolean;
  created_at: string;
}

export interface Flashcard {
  id: string;
  materia: string;
  assunto: string | null;
  frente: string;
  verso: string;
  ativo: boolean;
  gerado_por_ia: boolean;
  // Sequência pedagógica do lote importado. Null nos cartões criados à mão.
  ordem: number | null;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlashcardRevisao {
  id: string;
  aluno_id: string;
  flashcard_id: string;
  lembrou: boolean;
  created_at: string;
}

/** Proposta de redação anexada a um simulado ou atividade (item 17). */
export interface PropostaRedacaoSimulado {
  tema: string;
  textos_motivadores?: string | null;
  instrucoes?: string | null;
}

export interface Simulado {
  id: string;
  titulo: string;
  descricao: string | null;
  tempo_minutos: number;
  // Mesmas configurações do módulo de Atividades — os dois montam uma lista de
  // questões e não havia motivo para terem formulários diferentes (Alt. 4.4).
  gabarito_modo: "ao_final" | "imediato";
  /** Escala da nota quando `usar_pesos` está ligado (ex.: 1000). */
  valor_total: number;
  /** Nota calculada pelos pesos de `materias_peso` em vez de % de acertos. */
  usar_pesos: boolean;
  /**
   * O simulado tem questões de Inglês E de Espanhol; o aluno escolhe uma das
   * duas ao iniciar e só ela conta na contagem, nos pesos e na nota.
   */
  variavel_idioma: boolean;
  /**
   * Proposta de redação do simulado. Guarda só o enunciado da proposta — a
   * plataforma não coleta o texto do aluno, que escreve à mão e envia pelo
   * fluxo de correção com a professora.
   */
  redacao: PropostaRedacaoSimulado | null;
  ativo: boolean;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface SimuladoQuestao {
  id: string;
  simulado_id: string;
  questao_id: string;
  ordem: number;
}

export type AtividadeGabaritoModo = "imediato" | "apos_envio";

export interface Atividade {
  id: string;
  titulo: string;
  materia: string | null;
  descricao: string | null;
  gabarito_modo: AtividadeGabaritoModo;
  tempo_limite_minutos: number | null;
  peso_facape: number;
  ativo: boolean;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface AtividadeQuestao {
  id: string;
  atividade_id: string;
  questao_id: string;
  ordem: number;
}

export interface AtividadeTentativa {
  id: string;
  aluno_id: string;
  atividade_id: string;
  respostas: Record<string, string>;
  acertos: number;
  total: number;
  nota: number;
  iniciado_em: string;
  finalizado_em: string | null;
  created_at: string;
}

export interface SimuladoTentativa {
  id: string;
  aluno_id: string;
  simulado_id: string;
  respostas: Record<string, string>;
  acertos: number;
  total: number;
  nota: number;
  nota_facape: number | null;
  desempenho_por_materia: Record<string, { peso: number; acertos: number; total: number; precisao: number }>;
  iniciado_em: string;
  finalizado_em: string | null;
  created_at: string;
}

export interface RedacaoCreditoConsumido {
  id: string;
  aluno_id: string;
  registrado_por: string | null;
  observacao: string | null;
  created_at: string;
}

// Trilha de dias (trilha_dias) — ESTE é o cronograma: uma sequência linear
// de dias (dia_numero, relativo ao início do aluno na plataforma, não a um
// dia do calendário) totalmente editável pelo admin em /admin/trilha, com
// adicionar/remover/editar dia e anexar aulas, PDFs, links externos,
// questões, flashcards e simulados a cada um. Substitui o antigo
// cronograma_dias (semanal, fixo em 7 dias) — ver migração que o remove.
// "leitura" e "redacao" já existiam nos dias importados do material
// original, mas ficaram de fora desta união por um tempo: como `itens` é
// jsonb e chega ao código com um cast, o TypeScript não acusava nada — o
// item simplesmente não tinha ícone nem ação e o clique não fazia nada.
export type TrilhaItemTipo =
  | "aula"
  | "pdf"
  | "link"
  | "questoes"
  | "flashcards"
  | "simulado"
  | "atividade"
  | "pagina"
  | "revisao"
  | "leitura"
  | "redacao"
  | "livre";

export interface TrilhaItem {
  tipo: TrilhaItemTipo;
  ref_id: string | null;
  url: string | null;
  materia: string | null;
  titulo: string;
  // O admin renomeou este item só para exibição (ex.: "Bagagem Essencial —
  // Livro 1" mostrado como "Resumo do Livro 1"). Sem essa marca não há como
  // distinguir um título personalizado de uma cópia desatualizada do título
  // do conteúdo — e o cronograma continuaria mostrando o nome antigo depois
  // que o admin corrigisse a aula em "Cursos e Aulas". Ver lib/trilha/resolver.
  titulo_custom?: boolean;
  // Bloco de questões EXTRA, acrescentado pela camada de acompanhamento
  // (lib/trilha/questoes-extras.ts). Não conta na carga horária do dia, não
  // deixa o dia incompleto se ficar por fazer e não é reagendado como
  // pendência — é oportunidade, não obrigação.
  extra?: boolean;
}

export interface TrilhaDia {
  id: string;
  dia_numero: number; // 1..40
  titulo: string;
  itens: TrilhaItem[];
  atividades: unknown[]; // coluna legada, não usada pelo admin novo
  updated_at: string;
}

// Progresso genérico por item (aluno_progresso_itens) — chave identifica o
// item ("aula:<conteudo_id>" ou "trilha:<dia_numero>:<indice>"), ver
// comentário da migração 035 para o esquema completo.
export interface AlunoProgressoItem {
  aluno_id: string;
  chave: string;
  concluida: boolean;
  concluida_em: string | null;
  posicao_segundos: number;
  duracao_segundos: number | null;
  updated_at: string;
}

export interface MateriaPeso {
  materia: string;
  peso: number;
  observacao: string | null;
  updated_at: string;
}

export interface RankingLinha {
  aluno_id: string;
  nome: string;
  xp: number;
}

export type AlunoMissaoTipo = "aula" | "questoes" | "flashcards" | "simulado" | "revisao" | "livre";
export type AlunoMissaoOrigem = "admin" | "copiloto" | "briefing_inicial";

export interface AlunoMissao {
  id: string;
  aluno_id: string;
  data: string;
  titulo: string;
  materia: string | null;
  assunto: string | null;
  tipo: AlunoMissaoTipo;
  duracao_minutos: number;
  prioridade: number;
  origem: AlunoMissaoOrigem;
  motivo_copiloto: string | null;
  concluida: boolean;
  concluida_em: string | null;
  ref_id: string | null;
  created_at: string;
  updated_at: string;
}

export type CopilotoRecomendacaoTipo = "questoes" | "flashcards" | "aula" | "simulado";
export type CopilotoRecomendacaoStatus = "pendente" | "concluida" | "descartada";

export interface CopilotoRecomendacao {
  id: string;
  aluno_id: string;
  tipo: CopilotoRecomendacaoTipo;
  materia: string;
  assunto: string | null;
  titulo: string;
  motivo: string | null;
  payload: Record<string, unknown>;
  prioridade: number;
  status: CopilotoRecomendacaoStatus;
  fonte: string;
  gerado_em: string;
  concluida_em: string | null;
}

export interface AlunoBriefing {
  aluno_id: string;
  data_prova: string;
  inicio_estudos: string | null;
  horas_por_dia_semana: number;
  horas_por_dia_fim_semana: number;
  dias_estuda: string[];
  sentimentos: Record<string, string>;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  titulo: string;
  link: string | null;
  bg: string;
  ativo: boolean;
  ordem: number;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export type ConteudoBibliotecaTipo = "aula" | "artigo" | "pdf" | "video_externo" | "resumo_livro";

export interface ConteudoBiblioteca {
  id: string;
  tipo: ConteudoBibliotecaTipo;
  titulo: string;
  materia: string;
  assunto: string | null;
  url: string | null;
  duracao_minutos: number;
  descricao: string | null;
  ativo: boolean;
  gerado_por_ia: boolean;
  metadados_youtube: Record<string, unknown> | null;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface LinkExterno {
  id: string;
  titulo: string;
  url: string;
  categoria: string | null;
  ativo: boolean;
  ordem: number;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

// Botões personalizados da aba Estudos (estudos_botoes) — ver comentário da
// migração 036 pra como cada `tipo` abre pro aluno.
export type EstudosBotaoTipo = "link" | "aula" | "pdf" | "app";

export interface EstudosBotao {
  id: string;
  titulo: string;
  icone: string;
  tipo: EstudosBotaoTipo;
  link: string;
  ordem: number;
  ativo: boolean;
  /** Curso (plano) para o qual o botão aparece. null = todos os cursos. */
  plano_id: string | null;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

// Tipo genérico simplificado — supabase-js aceita este formato sem exigir
// o schema completo do Database gerado pela CLI.
export type Database = any;
