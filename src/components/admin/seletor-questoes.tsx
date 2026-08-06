"use client";

import { useState, useMemo } from "react";
import { Icon } from "@/components/admin/icon";
import {
  filtrarQuestoes, opcoesCompativeis, rotuloProva, rotuloModalidade, FILTROS_VAZIOS,
  type FiltrosQuestao, type QuestaoFiltravel
} from "@/lib/site/filtro-questoes";

// ============================================================================
// SELEÇÃO DE QUESTÕES — usada por Atividades e por Simulados
//
// Os dois módulos montam a mesma coisa: uma lista de questões escolhidas do
// banco. Tinham duas telas separadas, ambas sem filtro e sem busca, e o admin
// precisava rolar o banco inteiro agrupado por matéria.
//
// Um componente só (Alteração 4.3) com filtros combináveis (4.5) e os selos
// de onde a questão já foi usada (4.6).
// ============================================================================

export interface UsoQuestao {
  /** Títulos das atividades em que a questão já aparece. */
  atividades: string[];
  /** Títulos dos simulados em que a questão já aparece. */
  simulados: string[];
}

export function SeletorQuestoes({
  questoes,
  jaSelecionadas,
  uso,
  nomeCampo = "questao_id",
  contextoAtual
}: {
  questoes: QuestaoFiltravel[];
  jaSelecionadas: Set<string>;
  /** questaoId → onde ela já é usada. */
  uso: Record<string, UsoQuestao>;
  nomeCampo?: string;
  /** Título do simulado/atividade sendo editado — omitido dos selos. */
  contextoAtual?: string;
}) {
  const [filtros, setFiltros] = useState<FiltrosQuestao>(FILTROS_VAZIOS);
  const [soSelecionadas, setSoSelecionadas] = useState(false);
  // Fonte da verdade da seleção enquanto a tela está aberta. Sem isso, filtrar
  // desmontaria os checkboxes fora do filtro e o navegador não enviaria os
  // marcados — o admin filtraria por "Biologia", salvaria, e perderia tudo o
  // que tinha marcado nas outras matérias.
  const [selecao, setSelecao] = useState<Set<string>>(() => new Set(jaSelecionadas));

  const opcoes = useMemo(() => opcoesCompativeis(questoes, filtros), [questoes, filtros]);
  const filtradas = useMemo(() => {
    const base = filtrarQuestoes(questoes, filtros);
    return soSelecionadas ? base.filter((q) => selecao.has(q.id)) : base;
  }, [questoes, filtros, soSelecionadas, selecao]);

  const algumFiltro =
    Boolean(filtros.busca.trim()) || Boolean(filtros.materia || filtros.assunto || filtros.prova || filtros.ano || filtros.modalidade);

  function alternar(id: string) {
    setSelecao((s) => {
      const nova = new Set(s);
      if (nova.has(id)) nova.delete(id);
      else nova.add(id);
      return nova;
    });
  }

  function marcarVisiveis(marcar: boolean) {
    setSelecao((s) => {
      const nova = new Set(s);
      filtradas.forEach((q) => (marcar ? nova.add(q.id) : nova.delete(q.id)));
      return nova;
    });
  }

  const campo = (
    k: keyof FiltrosQuestao,
    label: string,
    valores: (string | number)[],
    // A modalidade é gravada em código ("ampla"), mas ninguém monta prova
    // procurando por "ampla" — o texto por extenso vai só na exibição.
    rotulo: (v: string | number) => string = String
  ) => (
    <select
      value={filtros[k]}
      onChange={(e) => setFiltros((f) => ({ ...f, [k]: e.target.value }))}
      disabled={valores.length === 0}
      className="rounded-[9px] border border-navy-dark/15 px-2 py-1.5 text-[11px] font-bold text-navy-dark disabled:opacity-40"
    >
      <option value="">{label}</option>
      {valores.map((v) => (
        <option key={String(v)} value={String(v)}>
          {rotulo(v)}
        </option>
      ))}
    </select>
  );

  return (
    <div>
      {/* A seleção viaja em inputs escondidos, não nos checkboxes visíveis —
          assim o que está fora do filtro continua sendo enviado no submit. */}
      {Array.from(selecao).map((id) => (
        <input key={id} type="hidden" name={nomeCampo} value={id} />
      ))}

      <div className="space-y-2 rounded-t-2xl border-b border-navy-dark/10 bg-white p-3">
        <div className="flex items-center gap-2 rounded-[10px] border border-navy-dark/15 px-2.5 py-2">
          <Icon name="search" size={14} className="shrink-0 text-navy-dark/40" />
          <input
            value={filtros.busca}
            onChange={(e) => setFiltros((f) => ({ ...f, busca: e.target.value }))}
            placeholder="Buscar por enunciado, ID, número da questão ou prova"
            className="min-w-0 flex-1 text-xs font-semibold text-navy-dark outline-none"
          />
          {filtros.busca && (
            <button type="button" onClick={() => setFiltros((f) => ({ ...f, busca: "" }))} className="text-navy-dark/40">
              <Icon name="x" size={12} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {campo("materia", "Todas as disciplinas", opcoes.materias)}
          {campo("assunto", "Todos os assuntos", opcoes.assuntos)}
          {campo("prova", "Todas as provas", opcoes.provas)}
          {campo("ano", "Todos os anos", opcoes.anos)}
          {campo("modalidade", "Todas as modalidades", opcoes.modalidades, (v) => rotuloModalidade(String(v)) ?? String(v))}
          {algumFiltro && (
            <button
              type="button"
              onClick={() => setFiltros(FILTROS_VAZIOS)}
              className="rounded-[9px] border border-navy-dark/15 px-2.5 py-1.5 text-[11px] font-extrabold text-navy-dark/60"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-navy-dark/50">
            {filtradas.length} de {questoes.length} · <span className="text-navy">{selecao.size} selecionada(s)</span>
          </span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setSoSelecionadas((v) => !v)}
            className={`rounded-[9px] px-2.5 py-1 text-[10.5px] font-extrabold ${
              soSelecionadas ? "bg-navy-dark text-white" : "bg-navy-dark/5 text-navy-dark/60"
            }`}
          >
            Só as selecionadas
          </button>
          <button
            type="button"
            onClick={() => marcarVisiveis(true)}
            className="rounded-[9px] bg-navy-dark/5 px-2.5 py-1 text-[10.5px] font-extrabold text-navy-dark/70"
          >
            Marcar {filtradas.length}
          </button>
          <button
            type="button"
            onClick={() => marcarVisiveis(false)}
            className="rounded-[9px] bg-navy-dark/5 px-2.5 py-1 text-[10.5px] font-extrabold text-navy-dark/70"
          >
            Desmarcar
          </button>
        </div>
      </div>

      <div className="max-h-[55vh] overflow-y-auto bg-white">
        {filtradas.slice(0, 300).map((q) => {
          const u = uso[q.id];
          const emAtividades = (u?.atividades ?? []).filter((t) => t !== contextoAtual);
          const emSimulados = (u?.simulados ?? []).filter((t) => t !== contextoAtual);
          const prova = rotuloProva(q);
          return (
            <label key={q.id} className="flex cursor-pointer items-start gap-3 border-b p-3 last:border-0 hover:bg-navy/5">
              <input type="checkbox" checked={selecao.has(q.id)} onChange={() => alternar(q.id)} className="mt-1" />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-navy-dark/5 px-2 py-0.5 text-[10px] font-extrabold text-navy-dark/60">
                    {q.materia}
                  </span>
                  {q.assunto && (
                    <span className="rounded-full bg-navy-dark/5 px-2 py-0.5 text-[10px] font-extrabold text-navy-dark/60">
                      {q.assunto}
                    </span>
                  )}
                  {prova && (
                    <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-extrabold text-navy">{prova}</span>
                  )}
                  {q.numero_questao != null && (
                    <span className="text-[10px] font-extrabold text-navy-dark/40">nº {q.numero_questao}</span>
                  )}
                  {q.anulada && (
                    <span className="rounded-full bg-red/10 px-2 py-0.5 text-[10px] font-extrabold text-red">ANULADA</span>
                  )}
                  {/* Selos de reuso (4.6): informam, não impedem. O admin pode
                      querer a mesma questão em dois lugares — só não pode
                      fazer isso sem saber. */}
                  {emAtividades.length > 0 && (
                    <span
                      title={"Já usada em: " + emAtividades.join(", ")}
                      className="rounded-full bg-orange/15 px-2 py-0.5 text-[10px] font-extrabold text-orange-dark"
                    >
                      ATIVIDADE{emAtividades.length > 1 ? ` ×${emAtividades.length}` : ""}
                    </span>
                  )}
                  {emSimulados.length > 0 && (
                    <span
                      title={"Já usada em: " + emSimulados.join(", ")}
                      className="rounded-full bg-green/15 px-2 py-0.5 text-[10px] font-extrabold text-green"
                    >
                      SIMULADO{emSimulados.length > 1 ? ` ×${emSimulados.length}` : ""}
                    </span>
                  )}
                </div>
                <p className="line-clamp-3 text-sm text-navy-dark">{q.enunciado}</p>
              </div>
            </label>
          );
        })}

        {filtradas.length > 300 && (
          <p className="p-3 text-center text-[11px] font-bold text-navy-dark/45">
            Mostrando 300 de {filtradas.length}. Refine os filtros — as já selecionadas continuam salvas mesmo fora da
            lista.
          </p>
        )}
        {filtradas.length === 0 && (
          <p className="p-6 text-center text-sm text-navy-dark/50">
            {questoes.length === 0
              ? "Nenhuma questão ativa no banco ainda — cadastre em /admin/questoes primeiro."
              : "Nenhuma questão corresponde aos filtros."}
          </p>
        )}
      </div>
    </div>
  );
}
