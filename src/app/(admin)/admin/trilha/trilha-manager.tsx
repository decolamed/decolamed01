"use client";

import { useState, useTransition } from "react";
import { Card, PageHeader, Badge } from "@/components/admin/card";
import { PrimaryButton, GhostButton, TextInput, TextArea, Toast, useToast } from "@/components/admin/interactive";
import { salvarDiaTrilha, atualizarTitulosDoDia } from "./actions";
import type { TrilhaDia, TrilhaItem, TrilhaItemTipo } from "@/types/database";

const TIPOS: { valor: TrilhaItemTipo; label: string; icone: string }[] = [
  { valor: "aula", label: "Aula", icone: "🎬" },
  { valor: "questoes", label: "Questões", icone: "🎯" },
  { valor: "flashcards", label: "Flashcards", icone: "🃏" },
  { valor: "simulado", label: "Simulado", icone: "⏱️" },
  { valor: "revisao", label: "Revisão", icone: "🔁" },
  { valor: "livre", label: "Livre", icone: "☕" }
];

interface Props {
  dias: TrilhaDia[];
}

export function TrilhaManager({ dias }: Props) {
  const porDia = new Map(dias.map((d) => [d.dia_numero, d]));
  const { toast, show } = useToast();
  const [aberto, setAberto] = useState<number | null>(1);

  const totalAulas = dias.reduce((acc, d) => acc + d.itens.filter((i) => i.tipo === "aula").length, 0);
  const totalComTituloGenerico = dias.reduce(
    (acc, d) => acc + d.itens.filter((i) => i.tipo === "aula" && /^Aula \d+$/.test(i.titulo)).length,
    0
  );

  return (
    <div>
      <PageHeader
        title="Trilha de 40 Dias"
        subtitle="Programa padrão que começa no dia em que o acesso do aluno é liberado — dia 1 é o primeiro dia de estudo, não um dia fixo do calendário."
      />

      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-navy-dark/70">
          {totalAulas} aulas cadastradas
          {totalComTituloGenerico > 0 && (
            <span className="text-orange-dark">
              {" "}
              · {totalComTituloGenerico} ainda com título genérico ("Aula N") — abra o dia e toque em "Buscar
              títulos reais" para corrigir.
            </span>
          )}
        </p>
      </Card>

      <div className="mt-4 space-y-2">
        {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => (
          <DiaEditor
            key={n}
            diaNumero={n}
            dia={porDia.get(n)}
            aberto={aberto === n}
            onToggle={() => setAberto(aberto === n ? null : n)}
            onSalvo={(msg) => show(msg)}
          />
        ))}
      </div>
      <Toast message={toast} />
    </div>
  );
}

function DiaEditor({
  diaNumero,
  dia,
  aberto,
  onToggle,
  onSalvo
}: {
  diaNumero: number;
  dia: TrilhaDia | undefined;
  aberto: boolean;
  onToggle: () => void;
  onSalvo: (msg: string) => void;
}) {
  const [titulo, setTitulo] = useState(dia?.titulo ?? `Dia ${diaNumero}`);
  const [itens, setItens] = useState<TrilhaItem[]>(dia?.itens ?? []);
  const [pending, startTransition] = useTransition();
  const [buscando, setBuscando] = useState(false);

  const aulasGenericas = itens.filter((i) => i.tipo === "aula" && /^Aula \d+$/.test(i.titulo)).length;

  function atualizarItem(i: number, patch: Partial<TrilhaItem>) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function removerItem(i: number) {
    setItens((prev) => prev.filter((_, idx) => idx !== i));
  }

  function adicionarItem() {
    setItens((prev) => [...prev, { tipo: "aula", url: "", ref_id: null, materia: null, titulo: "Nova aula" }]);
  }

  function salvar() {
    startTransition(async () => {
      const r = await salvarDiaTrilha(diaNumero, titulo, itens);
      onSalvo(r.ok ? "Dia salvo." : `Erro: ${r.erro}`);
    });
  }

  function buscarTitulos() {
    setBuscando(true);
    startTransition(async () => {
      const r = await atualizarTitulosDoDia(diaNumero);
      setBuscando(false);
      if (r.ok) {
        onSalvo(`${r.atualizados} de ${r.total} títulos atualizados.`);
        // A action já salvou no banco; recarrega os itens locais lendo de novo
        // não é possível sem um refetch — orienta o admin a reabrir o dia.
      } else {
        onSalvo(`Erro: ${r.erro}`);
      }
    });
  }

  return (
    <Card>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-dark/5 text-xs font-bold text-navy-dark/60">
            {diaNumero}
          </span>
          <div>
            <p className="font-display font-bold text-navy-dark">{dia?.titulo ?? `Dia ${diaNumero} (vazio)`}</p>
            <p className="text-xs text-navy-dark/50">{itens.length} itens</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {aulasGenericas > 0 && <Badge tone="orange">{aulasGenericas} título(s) genérico(s)</Badge>}
          <span className="text-navy-dark/40">{aberto ? "▲" : "▼"}</span>
        </div>
      </button>

      {aberto && (
        <div className="mt-4 space-y-3 border-t border-navy-dark/10 pt-4">
          <TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={`Dia ${diaNumero}`} />

          <div className="space-y-2">
            {itens.map((item, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-navy-dark/5 p-2">
                <select
                  value={item.tipo}
                  onChange={(e) => atualizarItem(i, { tipo: e.target.value as TrilhaItemTipo })}
                  className="rounded-lg border border-navy-dark/10 bg-white px-2 py-1.5 text-xs"
                >
                  {TIPOS.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.icone} {t.label}
                    </option>
                  ))}
                </select>
                <input
                  value={item.titulo}
                  onChange={(e) => atualizarItem(i, { titulo: e.target.value })}
                  placeholder="Título"
                  className="min-w-[160px] flex-1 rounded-lg border border-navy-dark/10 px-2 py-1.5 text-xs"
                />
                {item.tipo === "aula" && (
                  <input
                    value={item.url ?? ""}
                    onChange={(e) => atualizarItem(i, { url: e.target.value })}
                    placeholder="URL do YouTube"
                    className="min-w-[200px] flex-1 rounded-lg border border-navy-dark/10 px-2 py-1.5 text-xs"
                  />
                )}
                {(item.tipo === "questoes" || item.tipo === "flashcards") && (
                  <input
                    value={item.materia ?? ""}
                    onChange={(e) => atualizarItem(i, { materia: e.target.value })}
                    placeholder="Matéria"
                    className="w-32 rounded-lg border border-navy-dark/10 px-2 py-1.5 text-xs"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removerItem(i)}
                  className="ml-auto text-xs font-bold text-red-500"
                >
                  remover
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <GhostButton onClick={adicionarItem}>+ item</GhostButton>
            <GhostButton onClick={buscarTitulos} className={buscando ? "opacity-60" : ""}>
              {buscando ? "Buscando…" : "🔎 Buscar títulos reais no YouTube"}
            </GhostButton>
            <PrimaryButton onClick={salvar} className={pending ? "opacity-60" : ""}>
              Salvar dia
            </PrimaryButton>
          </div>
        </div>
      )}
    </Card>
  );
}
