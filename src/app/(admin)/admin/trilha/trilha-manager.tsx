"use client";

import { useState, useTransition } from "react";
import { Card, PageHeader, Badge } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { PrimaryButton, GhostButton, TextInput, Toast, useToast } from "@/components/admin/interactive";
import { salvarDiaTrilha, removerDiaTrilha, atualizarTitulosDoDia } from "./actions";
import type { TrilhaDia, TrilhaItem, TrilhaItemTipo, ConteudoBiblioteca, LinkExterno, Simulado } from "@/types/database";

const TIPOS: { valor: TrilhaItemTipo; label: string; icone: string }[] = [
  { valor: "aula", label: "Aula", icone: "🎬" },
  { valor: "pdf", label: "PDF", icone: "📄" },
  { valor: "link", label: "Link externo", icone: "🔗" },
  { valor: "questoes", label: "Questões (por matéria)", icone: "🎯" },
  { valor: "flashcards", label: "Flashcards (por matéria)", icone: "🃏" },
  { valor: "simulado", label: "Simulado", icone: "⏱️" },
  { valor: "revisao", label: "Revisão", icone: "🔁" },
  { valor: "livre", label: "Livre", icone: "☕" }
];

// Tipos que exigem escolher um conteúdo real cadastrado (aula/pdf/link/
// simulado por id, questões/flashcards por matéria) — revisão e livre não
// referenciam nenhum conteúdo, só um título.
const TIPOS_COM_REFERENCIA = new Set<TrilhaItemTipo>(["aula", "pdf", "link", "questoes", "flashcards", "simulado"]);

// Onde o admin cadastra cada tipo de conteúdo. Sem isso, escolher um tipo
// que ainda não tem nada cadastrado deixava um "Selecione..." vazio e sem
// saída — o admin não tinha como saber que faltava cadastrar o conteúdo
// antes de anexá-lo ao dia.
const ONDE_CADASTRAR: Record<string, { texto: string; href: string }> = {
  aula: { texto: "Nenhuma aula cadastrada ainda.", href: "/admin/cursos" },
  pdf: { texto: "Nenhum PDF cadastrado ainda.", href: "/admin/pdfs" },
  link: { texto: "Nenhum link externo cadastrado ainda.", href: "/admin/links" },
  simulado: { texto: "Nenhum simulado cadastrado ainda.", href: "/admin/simulados" },
  questoes: { texto: "Nenhuma matéria com questões cadastradas.", href: "/admin/questoes" },
  flashcards: { texto: "Nenhuma matéria com flashcards cadastrados.", href: "/admin/flashcards" }
};

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
  const porDia = new Map(dias.map((d) => [d.dia_numero, d]));
  const { toast, show } = useToast();
  const [numeros, setNumeros] = useState<number[]>(() => {
    const existentes = dias.map((d) => d.dia_numero).sort((a, b) => a - b);
    return existentes.length ? existentes : [1];
  });
  const [aberto, setAberto] = useState<number | null>(numeros[0] ?? null);
  const [removendo, startRemoverTransition] = useTransition();

  const totalAulas = dias.reduce((acc, d) => acc + d.itens.filter((i) => i.tipo === "aula").length, 0);
  const totalComTituloGenerico = dias.reduce(
    (acc, d) => acc + d.itens.filter((i) => i.tipo === "aula" && /^Aula \d+$/.test(i.titulo)).length,
    0
  );

  function adicionarDia() {
    const proximo = numeros.length ? Math.max(...numeros) + 1 : 1;
    setNumeros((prev) => [...prev, proximo]);
    setAberto(proximo);
  }

  function removerDia(n: number) {
    if (!confirm(`Remover o Dia ${n} do cronograma? Essa ação não pode ser desfeita.`)) return;
    startRemoverTransition(async () => {
      const r = await removerDiaTrilha(n);
      if (r.ok) {
        setNumeros((prev) => prev.filter((x) => x !== n));
        show(`Dia ${n} removido.`);
      } else {
        show(`Erro ao remover: ${r.erro}`);
      }
    });
  }

  return (
    <div>
      <PageHeader
        title="Cronograma"
        subtitle="Sequência de dias que começa quando o acesso de cada aluno é liberado — dia 1 é o primeiro dia de estudo, não um dia fixo do calendário. Totalmente editável: adicione, remova e edite dias e o conteúdo de cada um."
      />

      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-navy-dark/70">
          {numeros.length} dia(s) cadastrado(s) · {totalAulas} aulas
          {totalComTituloGenerico > 0 && (
            <span className="text-orange-dark">
              {" "}
              · {totalComTituloGenerico} ainda com título genérico (&quot;Aula N&quot;) — abra o dia e toque em &quot;Buscar
              títulos reais&quot; para corrigir.
            </span>
          )}
        </p>
        <GhostButton onClick={adicionarDia}>+ Adicionar dia</GhostButton>
      </Card>

      <div className="mt-4 space-y-2">
        {numeros.map((n) => (
          <DiaEditor
            key={n}
            diaNumero={n}
            dia={porDia.get(n)}
            aberto={aberto === n}
            onToggle={() => setAberto(aberto === n ? null : n)}
            onSalvo={(msg) => show(msg)}
            onRemover={() => removerDia(n)}
            removendo={removendo}
            aulas={aulas}
            pdfs={pdfs}
            links={links}
            simulados={simulados}
            materias={materias}
            questoesPorMateria={questoesPorMateria}
            flashcardsPorMateria={flashcardsPorMateria}
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
  onSalvo,
  onRemover,
  removendo,
  aulas,
  pdfs,
  links,
  simulados,
  materias,
  questoesPorMateria,
  flashcardsPorMateria
}: {
  diaNumero: number;
  dia: TrilhaDia | undefined;
  aberto: boolean;
  onToggle: () => void;
  onSalvo: (msg: string) => void;
  onRemover: () => void;
  removendo: boolean;
  aulas: ConteudoBiblioteca[];
  pdfs: ConteudoBiblioteca[];
  links: LinkExterno[];
  simulados: Simulado[];
  materias: string[];
  questoesPorMateria: Record<string, number>;
  flashcardsPorMateria: Record<string, number>;
}) {
  const [titulo, setTitulo] = useState(dia?.titulo ?? `Dia ${diaNumero}`);
  const [itens, setItens] = useState<TrilhaItem[]>(dia?.itens ?? []);
  const [tipoNovo, setTipoNovo] = useState<TrilhaItemTipo>("aula");
  const [refNovo, setRefNovo] = useState("");
  const [tituloLivre, setTituloLivre] = useState("");
  const [pending, startTransition] = useTransition();
  const [buscando, setBuscando] = useState(false);

  const aulasGenericas = itens.filter((i) => i.tipo === "aula" && /^Aula \d+$/.test(i.titulo)).length;

  const opcoesPorTipo: Partial<Record<TrilhaItemTipo, { valor: string; label: string }[]>> = {
    aula: aulas.map((a) => ({ valor: a.id, label: a.titulo })),
    pdf: pdfs.map((p) => ({ valor: p.id, label: p.titulo })),
    link: links.map((l) => ({ valor: l.id, label: l.titulo })),
    simulado: simulados.map((s) => ({ valor: s.id, label: s.titulo })),
    questoes: materias.map((m) => ({ valor: m, label: `${m} (${questoesPorMateria[m] ?? 0} questões)` })),
    flashcards: materias.map((m) => ({ valor: m, label: `${m} (${flashcardsPorMateria[m] ?? 0} cards)` }))
  };
  const opcoes = opcoesPorTipo[tipoNovo] ?? [];
  const precisaReferencia = TIPOS_COM_REFERENCIA.has(tipoNovo);

  function atualizarItem(i: number, patch: Partial<TrilhaItem>) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function removerItem(i: number) {
    setItens((prev) => prev.filter((_, idx) => idx !== i));
  }

  function adicionarItem() {
    if (!precisaReferencia) {
      const titulo = tituloLivre.trim() || (tipoNovo === "revisao" ? "Revisão" : "Dia livre");
      setItens((prev) => [...prev, { tipo: tipoNovo, ref_id: null, url: null, materia: null, titulo }]);
      setTituloLivre("");
      return;
    }
    if (!refNovo) return;
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
      item = { tipo: tipoNovo, ref_id: null, url: null, materia: refNovo, titulo: `${tipoNovo === "questoes" ? "Praticar questões" : "Revisar flashcards"} de ${refNovo}` };
    }
    if (item) setItens((v) => [...v, item as TrilhaItem]);
    setRefNovo("");
  }

  function salvar() {
    startTransition(async () => {
      const r = await salvarDiaTrilha(diaNumero, titulo, itens);
      onSalvo(r.ok ? `Dia ${diaNumero} salvo.` : `Erro: ${r.erro}`);
    });
  }

  function buscarTitulos() {
    setBuscando(true);
    startTransition(async () => {
      const r = await atualizarTitulosDoDia(diaNumero);
      setBuscando(false);
      if (r.ok) {
        onSalvo(`${r.atualizados} de ${r.total} títulos atualizados.`);
      } else {
        onSalvo(`Erro: ${r.erro}`);
      }
    });
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onToggle} className="flex flex-1 items-center justify-between gap-3 text-left">
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
        <button
          type="button"
          onClick={onRemover}
          disabled={removendo}
          title={`Remover Dia ${diaNumero}`}
          className="shrink-0 rounded-lg p-2 text-navy-dark/40 hover:bg-red/10 hover:text-red disabled:opacity-40"
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      {aberto && (
        <div className="mt-4 space-y-3 border-t border-navy-dark/10 pt-4">
          <TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={`Dia ${diaNumero}`} />

          <div className="space-y-2">
            {itens.map((item, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-navy-dark/5 p-2">
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-navy-dark">
                  {TIPOS.find((t) => t.valor === item.tipo)?.icone} {TIPOS.find((t) => t.valor === item.tipo)?.label}
                </span>
                <input
                  value={item.titulo}
                  onChange={(e) => atualizarItem(i, { titulo: e.target.value })}
                  placeholder="Título"
                  className="min-w-[160px] flex-1 rounded-lg border border-navy-dark/10 px-2 py-1.5 text-xs"
                />
                <button type="button" onClick={() => removerItem(i)} className="ml-auto text-xs font-bold text-red-500">
                  remover
                </button>
              </div>
            ))}
            {itens.length === 0 && <p className="text-xs text-navy-dark/40">Dia livre — nenhum item anexado ainda.</p>}
          </div>

          <div className="flex flex-wrap gap-1.5">
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
                <option key={t.valor} value={t.valor}>
                  {t.icone} {t.label}
                </option>
              ))}
            </select>
            {precisaReferencia && opcoes.length === 0 ? (
              <a
                href={ONDE_CADASTRAR[tipoNovo]?.href ?? "/admin"}
                className="min-w-0 flex-1 rounded-[9px] border border-dashed border-orange/50 bg-orange/5 px-2.5 py-1.5 text-[11px] font-semibold text-orange-dark hover:bg-orange/10"
              >
                {ONDE_CADASTRAR[tipoNovo]?.texto ?? "Nada cadastrado."} Cadastrar agora →
              </a>
            ) : precisaReferencia ? (
              <select
                value={refNovo}
                onChange={(e) => setRefNovo(e.target.value)}
                className="min-w-0 flex-1 rounded-[9px] border border-navy-dark/15 px-2 py-1.5 text-[11px] font-semibold text-navy-dark"
              >
                <option value="">Selecione...</option>
                {opcoes.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={tituloLivre}
                onChange={(e) => setTituloLivre(e.target.value)}
                placeholder={tipoNovo === "revisao" ? "Título da revisão (opcional)" : "Título do dia livre (opcional)"}
                className="min-w-0 flex-1 rounded-[9px] border border-navy-dark/15 px-2 py-1.5 text-[11px] font-semibold text-navy-dark"
              />
            )}
            <button
              type="button"
              onClick={adicionarItem}
              disabled={precisaReferencia && !refNovo}
              className="rounded-[9px] bg-navy-dark/10 px-3 py-1.5 text-[11px] font-extrabold text-navy-dark disabled:opacity-40"
            >
              + Anexar
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
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
