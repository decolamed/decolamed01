"use client";

import { useState, useTransition } from "react";
import { Card, PageHeader } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { PrimaryButton, TextInput, Toast, useToast } from "@/components/admin/interactive";
import { salvarDiaComItens } from "./actions";
import type { CronogramaDia, CronogramaItem, CronogramaItemTipo, ConteudoBiblioteca, LinkExterno, Simulado } from "@/types/database";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const TIPOS: { valor: CronogramaItemTipo; label: string }[] = [
  { valor: "aula", label: "Aula" },
  { valor: "pdf", label: "PDF" },
  { valor: "link", label: "Link" },
  { valor: "questoes", label: "Questões (por matéria)" },
  { valor: "flashcards", label: "Flashcards (por matéria)" },
  { valor: "simulado", label: "Simulado" }
];

interface Props {
  dias: CronogramaDia[];
  aulas: ConteudoBiblioteca[];
  pdfs: ConteudoBiblioteca[];
  links: LinkExterno[];
  simulados: Simulado[];
  materias: string[];
  questoesPorMateria: Record<string, number>;
  flashcardsPorMateria: Record<string, number>;
}

export function CronogramaManager({ dias, aulas, pdfs, links, simulados, materias, questoesPorMateria, flashcardsPorMateria }: Props) {
  const porDia = new Map(dias.map((d) => [d.dia_semana, d]));
  const { toast, show } = useToast();

  return (
    <div>
      <PageHeader
        title="Cronograma & Missões"
        subtitle="Cronograma Base fixo, igual para todos os alunos sem Copiloto — anexe conteúdo real a cada dia"
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {DIAS.map((nome, i) => (
          <DiaEditor
            key={i}
            nome={nome}
            diaSemana={i}
            dia={porDia.get(i)}
            aulas={aulas}
            pdfs={pdfs}
            links={links}
            simulados={simulados}
            materias={materias}
            questoesPorMateria={questoesPorMateria}
            flashcardsPorMateria={flashcardsPorMateria}
            onSalvo={(msg) => show(msg)}
          />
        ))}
      </div>
      <Toast message={toast} />
    </div>
  );
}

function DiaEditor({
  nome,
  diaSemana,
  dia,
  aulas,
  pdfs,
  links,
  simulados,
  materias,
  questoesPorMateria,
  flashcardsPorMateria,
  onSalvo
}: {
  nome: string;
  diaSemana: number;
  dia: CronogramaDia | undefined;
  aulas: ConteudoBiblioteca[];
  pdfs: ConteudoBiblioteca[];
  links: LinkExterno[];
  simulados: Simulado[];
  materias: string[];
  questoesPorMateria: Record<string, number>;
  flashcardsPorMateria: Record<string, number>;
  onSalvo: (msg: string) => void;
}) {
  const [titulo, setTitulo] = useState(dia?.titulo ?? "Missão do dia");
  const [itens, setItens] = useState<CronogramaItem[]>(dia?.itens ?? []);
  const [tipoNovo, setTipoNovo] = useState<CronogramaItemTipo>("aula");
  const [refNovo, setRefNovo] = useState("");
  const [pending, startTransition] = useTransition();

  const opcoesPorTipo: Record<CronogramaItemTipo, { valor: string; label: string }[]> = {
    aula: aulas.map((a) => ({ valor: a.id, label: a.titulo })),
    pdf: pdfs.map((p) => ({ valor: p.id, label: p.titulo })),
    link: links.map((l) => ({ valor: l.id, label: l.titulo })),
    simulado: simulados.map((s) => ({ valor: s.id, label: s.titulo })),
    questoes: materias.map((m) => ({ valor: m, label: `${m} (${questoesPorMateria[m] ?? 0} questões)` })),
    flashcards: materias.map((m) => ({ valor: m, label: `${m} (${flashcardsPorMateria[m] ?? 0} cards)` }))
  };
  const opcoes = opcoesPorTipo[tipoNovo];

  function adicionarItem() {
    if (!refNovo) return;
    let item: CronogramaItem | null = null;
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
      item = { tipo: tipoNovo, ref_id: null, url: null, materia: refNovo, titulo: `${tipoNovo === "questoes" ? "Praticar questões" : "Revisar flashcards"} de ${refNovo}` };
    }
    if (item) setItens((v) => [...v, item as CronogramaItem]);
    setRefNovo("");
  }

  function removerItem(i: number) {
    setItens((v) => v.filter((_, idx) => idx !== i));
  }

  function salvar() {
    startTransition(async () => {
      const res = await salvarDiaComItens(diaSemana, titulo, itens);
      onSalvo(res.ok ? `${nome} atualizado(a).` : `Não foi possível salvar ${nome}.`);
    });
  }

  return (
    <Card>
      <h2 className="text-sm font-extrabold text-navy-dark">{nome}</h2>
      <TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título da missão" className="mt-2" />

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
        {itens.length === 0 && <p className="text-xs text-navy-dark/40">Dia livre — nenhum item anexado.</p>}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <select
          value={tipoNovo}
          onChange={(e) => {
            setTipoNovo(e.target.value as CronogramaItemTipo);
            setRefNovo("");
          }}
          className="rounded-[9px] border border-navy-dark/15 px-2 py-1.5 text-[11px] font-bold text-navy-dark"
        >
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>{t.label}</option>
          ))}
        </select>
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
        <button
          type="button"
          onClick={adicionarItem}
          disabled={!refNovo}
          className="rounded-[9px] bg-navy-dark/10 px-3 py-1.5 text-[11px] font-extrabold text-navy-dark disabled:opacity-40"
        >
          + Anexar
        </button>
      </div>

      <PrimaryButton onClick={salvar} className={`mt-3 ${pending ? "opacity-60" : ""}`}>
        {pending ? "Salvando..." : `Salvar ${nome}`}
      </PrimaryButton>
    </Card>
  );
}
