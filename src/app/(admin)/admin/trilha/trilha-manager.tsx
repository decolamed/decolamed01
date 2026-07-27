"use client";

import { useState, useTransition } from "react";
import { Card, PageHeader } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { PrimaryButton, GhostButton, TextInput, Toast, useToast } from "@/components/admin/interactive";
import { salvarDiaTrilha, removerDiaTrilha } from "./actions";
import type { TrilhaDia, TrilhaItem, TrilhaItemTipo, ConteudoBiblioteca, LinkExterno, Simulado } from "@/types/database";

const TIPOS: { valor: TrilhaItemTipo; label: string }[] = [
  { valor: "aula", label: "Aula" },
  { valor: "pdf", label: "PDF" },
  { valor: "link", label: "Link" },
  { valor: "questoes", label: "Questões (por matéria)" },
  { valor: "flashcards", label: "Flashcards (por matéria)" },
  { valor: "simulado", label: "Simulado" },
  { valor: "leitura", label: "Leitura (livro/resumo)" },
  { valor: "redacao", label: "Redação" },
  { valor: "revisao", label: "Revisão geral" },
  { valor: "atividade", label: "Outra atividade" }
];

// Tipos que não têm tabela de conteúdo pra referenciar — o admin só digita
// um título livre (ex.: "Leitura do resumo do Livro 3", "Redação 1").
const TIPOS_TEXTO_LIVRE = new Set<TrilhaItemTipo>(["leitura", "redacao", "revisao", "atividade"]);

interface Props {
  dias: TrilhaDia[];
  aulas: ConteudoBiblioteca[];
  pdfs: ConteudoBiblioteca[];
  links: LinkExterno[];
  simulados: Simulado[];
  materias: string[];
  questoesPorMateria: Record<string, number>;
  flashcardsPorMateria: Record<string, number>;
}

export function TrilhaManager({ dias, aulas, pdfs, links, simulados, materias, questoesPorMateria, flashcardsPorMateria }: Props) {
  const [diasState, setDiasState] = useState<TrilhaDia[]>(dias);
  const [expandido, setExpandido] = useState<number | null>(null);
  const { toast, show } = useToast();

  const ordenados = [...diasState].sort((a, b) => a.dia_numero - b.dia_numero);
  const proximoNumero = ordenados.length > 0 ? Math.max(...ordenados.map((d) => d.dia_numero)) + 1 : 1;

  function aoSalvar(diaNumero: number, titulo: string, itens: TrilhaItem[]) {
    setDiasState((v) => {
      const existe = v.some((d) => d.dia_numero === diaNumero);
      if (existe) {
        return v.map((d) => (d.dia_numero === diaNumero ? { ...d, titulo, itens } : d));
      }
      return [...v, { id: `novo-${diaNumero}`, dia_numero: diaNumero, titulo, itens, atividades: [], created_at: "", updated_at: "" }];
    });
  }

  function aoRemover(diaNumero: number) {
    setDiasState((v) => v.filter((d) => d.dia_numero !== diaNumero));
    setExpandido(null);
  }

  return (
    <div>
      <PageHeader
        title="Trilha do Curso"
        subtitle="Sequência linear de dias (Dia 1, Dia 2...) contada a partir da entrada de cada aluno na plataforma — separado do cronograma semanal fixo"
      />

      <div className="mt-4 flex justify-end">
        <PrimaryButton onClick={() => setExpandido(proximoNumero)}>
          <Icon name="plus" size={14} /> Adicionar Dia {proximoNumero}
        </PrimaryButton>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {ordenados.map((dia) => (
          <DiaEditor
            key={dia.dia_numero}
            diaNumero={dia.dia_numero}
            dia={dia}
            aberto={expandido === dia.dia_numero}
            onToggle={() => setExpandido(expandido === dia.dia_numero ? null : dia.dia_numero)}
            aulas={aulas}
            pdfs={pdfs}
            links={links}
            simulados={simulados}
            materias={materias}
            questoesPorMateria={questoesPorMateria}
            flashcardsPorMateria={flashcardsPorMateria}
            onSalvo={(msg, titulo, itens) => {
              show(msg);
              aoSalvar(dia.dia_numero, titulo, itens);
            }}
            onRemovido={(msg) => {
              show(msg);
              aoRemover(dia.dia_numero);
            }}
          />
        ))}

        {expandido === proximoNumero && !ordenados.some((d) => d.dia_numero === proximoNumero) && (
          <DiaEditor
            diaNumero={proximoNumero}
            dia={undefined}
            aberto
            onToggle={() => setExpandido(null)}
            aulas={aulas}
            pdfs={pdfs}
            links={links}
            simulados={simulados}
            materias={materias}
            questoesPorMateria={questoesPorMateria}
            flashcardsPorMateria={flashcardsPorMateria}
            onSalvo={(msg, titulo, itens) => {
              show(msg);
              aoSalvar(proximoNumero, titulo, itens);
              setExpandido(null);
            }}
            onRemovido={() => setExpandido(null)}
          />
        )}
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
  aulas,
  pdfs,
  links,
  simulados,
  materias,
  questoesPorMateria,
  flashcardsPorMateria,
  onSalvo,
  onRemovido
}: {
  diaNumero: number;
  dia: TrilhaDia | undefined;
  aberto: boolean;
  onToggle: () => void;
  aulas: ConteudoBiblioteca[];
  pdfs: ConteudoBiblioteca[];
  links: LinkExterno[];
  simulados: Simulado[];
  materias: string[];
  questoesPorMateria: Record<string, number>;
  flashcardsPorMateria: Record<string, number>;
  onSalvo: (msg: string, titulo: string, itens: TrilhaItem[]) => void;
  onRemovido: (msg: string) => void;
}) {
  const [titulo, setTitulo] = useState(dia?.titulo ?? `Dia ${diaNumero}`);
  const [itens, setItens] = useState<TrilhaItem[]>(dia?.itens ?? []);
  const [tipoNovo, setTipoNovo] = useState<TrilhaItemTipo>("aula");
  const [refNovo, setRefNovo] = useState("");
  const [tituloLivre, setTituloLivre] = useState("");
  const [pending, startTransition] = useTransition();

  const opcoesPorTipo: Partial<Record<TrilhaItemTipo, { valor: string; label: string }[]>> = {
    aula: aulas.map((a) => ({ valor: a.id, label: a.titulo })),
    pdf: pdfs.map((p) => ({ valor: p.id, label: p.titulo })),
    link: links.map((l) => ({ valor: l.id, label: l.titulo })),
    simulado: simulados.map((s) => ({ valor: s.id, label: s.titulo })),
    questoes: materias.map((m) => ({ valor: m, label: `${m} (${questoesPorMateria[m] ?? 0} questões)` })),
    flashcards: materias.map((m) => ({ valor: m, label: `${m} (${flashcardsPorMateria[m] ?? 0} cards)` }))
  };
  const ehTextoLivre = TIPOS_TEXTO_LIVRE.has(tipoNovo);
  const opcoes = opcoesPorTipo[tipoNovo] ?? [];

  function adicionarItem() {
    let item: TrilhaItem | null = null;
    if (tipoNovo === "aula") {
      const c = aulas.find((a) => a.id === refNovo);
      if (c) item = { tipo: "aula", ref_id: c.id, url: c.url, materia: c.materia, titulo: c.titulo };
    } else if (tipoNovo === "pdf") {
      const c = pdfs.find((p) => p.id === refNovo);
      if (c) item = { tipo: "pdf", ref_id: c.id, url: c.url, materia: c.materia, titulo: c.titulo };
    } else if (tipoNovo === "link") {
      const l = links.find((x) => x.id === refNovo);
      if (l) item = { tipo: "link", ref_id: l.id, url: l.url, materia: null, titulo: l.titulo };
    } else if (tipoNovo === "simulado") {
      const s = simulados.find((x) => x.id === refNovo);
      if (s) item = { tipo: "simulado", ref_id: s.id, url: null, materia: null, titulo: s.titulo };
    } else if (tipoNovo === "questoes" || tipoNovo === "flashcards") {
      if (!refNovo) return;
      item = { tipo: tipoNovo, ref_id: null, url: null, materia: refNovo, titulo: `${tipoNovo === "questoes" ? "Praticar questões" : "Revisar flashcards"} de ${refNovo}` };
    } else if (ehTextoLivre) {
      if (!tituloLivre.trim()) return;
      item = { tipo: tipoNovo, ref_id: null, url: null, materia: null, titulo: tituloLivre.trim() };
    }
    if (item) setItens((v) => [...v, item as TrilhaItem]);
    setRefNovo("");
    setTituloLivre("");
  }

  function removerItem(i: number) {
    setItens((v) => v.filter((_, idx) => idx !== i));
  }

  function salvar() {
    startTransition(async () => {
      const res = await salvarDiaTrilha(diaNumero, titulo, itens);
      if (res.ok) onSalvo(`Dia ${diaNumero} atualizado.`, titulo, itens);
      else onSalvo(`Não foi possível salvar o Dia ${diaNumero}.`, titulo, itens);
    });
  }

  function remover() {
    if (!dia) {
      onRemovido("");
      return;
    }
    startTransition(async () => {
      const res = await removerDiaTrilha(diaNumero);
      onRemovido(res.ok ? `Dia ${diaNumero} removido.` : `Não foi possível remover o Dia ${diaNumero}.`);
    });
  }

  if (!aberto) {
    return (
      <Card>
        <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left">
          <div>
            <span className="rounded-full bg-navy-dark/5 px-2 py-0.5 text-[10px] font-extrabold text-navy-dark">Dia {diaNumero}</span>
            <span className="ml-2 font-display font-bold text-navy-dark">{dia?.titulo ?? `Dia ${diaNumero}`}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-navy-dark/50">
            <span>{dia?.itens.length ?? 0} {(dia?.itens.length ?? 0) === 1 ? "item" : "itens"}</span>
            <Icon name="chevR" size={14} />
          </div>
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold text-navy-dark">Dia {diaNumero}</h2>
        <div className="flex items-center gap-2">
          {dia && (
            <button type="button" onClick={remover} className="text-navy-dark/40 hover:text-red">
              <Icon name="trash" size={14} />
            </button>
          )}
          <button type="button" onClick={onToggle} className="text-navy-dark/40 hover:text-navy-dark">
            <Icon name="x" size={14} />
          </button>
        </div>
      </div>
      <TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do dia" className="mt-2" />

      <div className="mt-3 flex flex-col gap-1.5">
        {itens.map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-[10px] bg-navy-dark/5 px-2.5 py-2 text-xs">
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-navy-dark">
              {TIPOS.find((t) => t.valor === item.tipo)?.label}
            </span>
            <span className="flex-1 truncate font-semibold text-navy-dark">{item.titulo}</span>
            <button type="button" onClick={() => removerItem(i)} className="text-navy-dark/40 hover:text-red">
              <Icon name="x" size={12} />
            </button>
          </div>
        ))}
        {itens.length === 0 && <p className="text-xs text-navy-dark/40">Nenhum item anexado ainda.</p>}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <select
          value={tipoNovo}
          onChange={(e) => {
            setTipoNovo(e.target.value as TrilhaItemTipo);
            setRefNovo("");
            setTituloLivre("");
          }}
          className="rounded-[9px] border border-navy-dark/15 px-2 py-1.5 text-[11px] font-bold text-navy-dark"
        >
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>{t.label}</option>
          ))}
        </select>

        {ehTextoLivre ? (
          <TextInput
            value={tituloLivre}
            onChange={(e) => setTituloLivre(e.target.value)}
            placeholder="Título da atividade (ex.: Leitura do resumo do Livro 3)"
            className="min-w-0 flex-1"
          />
        ) : (
          <select
            value={refNovo}
            onChange={(e) => setRefNovo(e.target.value)}
            className="min-w-0 flex-1 rounded-[9px] border border-navy-dark/15 px-2 py-1.5 text-[11px] font-semibold text-navy-dark"
          >
            <option value="">Selecione...</option>
            {opcoes.map((o) => (
              <option key={o.valor} value={o.valor}>{o.label}</option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={adicionarItem}
          disabled={ehTextoLivre ? !tituloLivre.trim() : !refNovo}
          className="rounded-[9px] bg-navy-dark/10 px-3 py-1.5 text-[11px] font-extrabold text-navy-dark disabled:opacity-40"
        >
          + Anexar
        </button>
      </div>

      <PrimaryButton onClick={salvar} className={`mt-3 ${pending ? "opacity-60" : ""}`}>
        {pending ? "Salvando..." : `Salvar Dia ${diaNumero}`}
      </PrimaryButton>
    </Card>
  );
}
