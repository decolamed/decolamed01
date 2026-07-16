// Tipos manuais que espelham supabase/schema.sql.
// Assim que o projeto estiver conectado ao Supabase, o ideal é substituir
// este arquivo pelo tipo gerado automaticamente:
//   npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.ts

export type UserRole = "aluno" | "admin" | "parceiro";
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
  created_at: string;
  updated_at: string;
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

// Tipo genérico simplificado — supabase-js aceita este formato sem exigir
// o schema completo do Database gerado pela CLI.
export type Database = any;
