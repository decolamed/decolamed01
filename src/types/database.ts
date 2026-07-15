// Tipos manuais que espelham supabase/schema.sql.
// Assim que o projeto estiver conectado ao Supabase, o ideal é substituir
// este arquivo pelo tipo gerado automaticamente:
//   npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.ts

export type UserRole = "aluno" | "admin";
export type MatriculaStatus = "pendente" | "ativa" | "bloqueada" | "cancelada";
export type PagamentoStatus = "pendente" | "confirmado" | "recebido" | "estornado" | "falhou";
export type FormaPagamento = "pix" | "boleto" | "cartao";

export interface Plano {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco_centavos: number;
  ciclo: string;
  beneficios: string[];
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  cpf: string | null;
  role: UserRole;
  plano_id: string | null;
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
  created_at: string;
  updated_at: string;
}

export interface Pagamento {
  id: string;
  matricula_id: string | null;
  pre_cadastro_id: string | null;
  asaas_payment_id: string;
  valor_centavos: number;
  forma_pagamento: FormaPagamento | null;
  status: PagamentoStatus;
  data_pagamento: string | null;
  payload: Record<string, unknown> | null;
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
