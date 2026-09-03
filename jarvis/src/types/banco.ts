// Espelho de supabase/schema.sql. Quando o schema mudar, este arquivo muda
// junto — é ele que faz o TypeScript reclamar antes do banco reclamar.

import type { Motor } from "@/lib/ia/tipos";
import type { Referencia } from "@/lib/resumo/tipos";

export type Plano = "gratis" | "pro";

export interface Perfil {
  id: string;
  nome: string;
  email: string;
  motor_ia: Motor;
  plano: Plano;
  acesso_ate: string | null;
  criado_em: string;
}

export interface Tutoria {
  id: string;
  usuario_id: string;
  numero: number;
  titulo: string;
  modulo: string;
  arquivada: boolean;
  criado_em: string;
}

export interface SituacaoProblema {
  id: string;
  tutoria_id: string;
  usuario_id: string;
  ordem: number;
  titulo: string;
  enunciado: string;
  encerrada: boolean;
  criado_em: string;
}

export interface Objetivo {
  id: string;
  sp_id: string;
  usuario_id: string;
  ordem: number;
  texto: string;
  concluido: boolean;
  criado_em: string;
}

export interface AcaoSalva {
  ferramenta: string;
  descricao: string;
  erro: boolean;
}

export interface Mensagem {
  id: string;
  sp_id: string;
  usuario_id: string;
  papel: "usuario" | "jarvis";
  conteudo: string;
  acoes: AcaoSalva[];
  criado_em: string;
}

export interface Resumo {
  id: string;
  sp_id: string;
  usuario_id: string;
  titulo: string;
  corpo: string;
  referencias: Referencia[];
  motor: string;
  criado_em: string;
  atualizado_em: string;
}

export interface Memoria {
  id: string;
  usuario_id: string;
  fato: string;
  origem_sp_id: string | null;
  criado_em: string;
}

/** "SP 1.2" — o código que o aluno usa para se referir à situação-problema. */
export function codigoDaSp(tutoria: Pick<Tutoria, "numero">, sp: Pick<SituacaoProblema, "ordem">): string {
  return `${tutoria.numero}.${sp.ordem}`;
}
