"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, PageHeader, Badge } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { PrimaryButton, GhostButton, TextInput, Toast, useToast } from "@/components/admin/interactive";
import { salvarDiaTrilha, removerDiaTrilha, atualizarTitulosDoDia, criarConteudoParaDia } from "./actions";
import {
  buscarNoCatalogo, itemDoCatalogo, ROTULO_TIPO, ICONE_TIPO,
  type ItemCatalogo
} from "@/lib/trilha/catalogo";
import type { TrilhaDia, TrilhaItem, TrilhaItemTipo } from "@/types/database";

// Tipos que não vêm do catálogo porque não referenciam conteúdo nenhum — são
// só um rótulo no dia do aluno.
const TIPOS_SOLTOS: { valor: TrilhaItemTipo; label: string }[] = [
  { valor: "revisao", label: "Revisão" },
  { valor: "leitura", label: "Leitura" },
  { valor: "redacao", label: "Redação" },
  { valor: "livre", label: "Livre" }
];

// Filtros da busca. "todos" primeiro de propósito: o ponto do seletor novo é
// justamente não obrigar a escolher o tipo antes de procurar.
const FILTROS: { valor: TrilhaItemTipo | "todos"; label: string }[] = [
  { valor: "todos", label: "Tudo" },
  { valor: "aula", label: "Aulas" },
  { valor: "pdf", label: "PDFs" },
  { valor: "questoes", label: "Questões" },
  { valor: "flashcards", label: "Flashcards" },
  { valor: "simulado", label: "Simulados" },
  { valor: "atividade", label: "Atividades" },
  { valor: "link", label: "Links" },
  { valor: "pagina", label: "Páginas" }
];

interface Props {
  dias: TrilhaDia[];
  catalogo: ItemCatalogo[];
  materias: string[];
}

export function TrilhaManager({ dias, catalogo, materias }: Props) {
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
      const r = await removerDiaTrilha(n).catch(() => ({ ok: false, erro: "Falha de conexão." }));
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
          {numeros.length} dia(s) cadastrado(s) · {totalAulas} aulas · {catalogo.length} conteúdos disponíveis
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
            catalogo={catalogo}
            materias={materias}
          />
        ))}
      </div>
      <Toast message={toast} />
    </div>
  );
}

// ============================================================================
// BUSCA DE CONTEÚDO — o "Adicionar conteúdo" com lupa
// ============================================================================

function BuscaConteudo({
  catalogo,
  onEscolher
}: {
  catalogo: ItemCatalogo[];
  onEscolher: (item: ItemCatalogo, tituloExibido: string) => void;
}) {
  const [consulta, setConsulta] = useState("");
  const [filtro, setFiltro] = useState<TrilhaItemTipo | "todos">("todos");
  // Item em "confirmação": mostra o campo de título personalizado antes de
  // anexar de fato, que é onde o admin troca "Bagagem Essencial — Livro 1"
  // por "Resumo do Livro 1".
  const [escolhido, setEscolhido] = useState<ItemCatalogo | null>(null);
  const [tituloExibido, setTituloExibido] = useState("");

  const resultados = useMemo(() => buscarNoCatalogo(catalogo, consulta, filtro), [catalogo, consulta, filtro]);
  // Teto de renderização: sem busca o catálogo inteiro pode ter centenas de
  // itens, e desenhar tudo trava a tela sem ajudar ninguém.
  const visiveis = resultados.slice(0, 40);

  function confirmar(item: ItemCatalogo) {
    setEscolhido(item);
    setTituloExibido(item.titulo);
  }

  function anexar() {
    if (!escolhido) return;
    onEscolher(escolhido, tituloExibido);
    setEscolhido(null);
    setTituloExibido("");
    setConsulta("");
  }

  return (
    <div className="space-y-2 rounded-xl border border-navy-dark/15 bg-white p-3">
      <div className="flex items-center gap-2 rounded-[10px] border border-navy-dark/15 px-2.5 py-2">
        <Icon name="search" size={14} className="shrink-0 text-navy-dark/40" />
        <input
          value={consulta}
          onChange={(e) => {
            setConsulta(e.target.value);
            setEscolhido(null);
          }}
          placeholder="Buscar por nome, matéria ou palavra-chave (ex.: Citologia)"
          className="min-w-0 flex-1 text-xs font-semibold text-navy-dark outline-none"
        />
        {consulta && (
          <button type="button" onClick={() => setConsulta("")} className="shrink-0 text-navy-dark/40 hover:text-navy-dark">
            <Icon name="x" size={12} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            type="button"
            onClick={() => {
              setFiltro(f.valor);
              setEscolhido(null);
            }}
            className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold ${
              filtro === f.valor ? "bg-navy-dark text-white" : "bg-navy-dark/5 text-navy-dark/60 hover:bg-navy-dark/10"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Confirmação com título personalizável. Aparece no lugar da lista para
          o admin não perder de vista o que está prestes a anexar. */}
      {escolhido ? (
        <div className="space-y-2 rounded-[10px] border border-orange/40 bg-orange/[0.05] p-2.5">
          <p className="text-[10.5px] font-extrabold uppercase tracking-wide text-orange-dark">
            {ICONE_TIPO[escolhido.tipo]} {ROTULO_TIPO[escolhido.tipo]}
            {escolhido.materia ? ` · ${escolhido.materia}` : ""}
          </p>
          <p className="text-xs font-bold text-navy-dark">{escolhido.titulo}</p>
          <label className="block text-[10.5px] font-bold text-navy-dark/60">
            Título mostrado ao aluno
            <input
              value={tituloExibido}
              onChange={(e) => setTituloExibido(e.target.value)}
              placeholder={escolhido.titulo}
              className="mt-1 w-full rounded-[9px] border border-navy-dark/15 px-2.5 py-1.5 text-xs font-semibold text-navy-dark outline-none focus:border-navy"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={anexar}
              className="rounded-[9px] bg-navy-dark px-3 py-1.5 text-[11px] font-extrabold text-white"
            >
              + Anexar ao dia
            </button>
            <button
              type="button"
              onClick={() => setEscolhido(null)}
              className="rounded-[9px] border border-navy-dark/15 px-3 py-1.5 text-[11px] font-extrabold text-navy-dark/60"
            >
              Voltar
            </button>
          </div>
        </div>
      ) : (
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {visiveis.map((item) => (
            <button
              key={item.chave}
              type="button"
              onClick={() => confirmar(item)}
              className="flex w-full items-center gap-2 rounded-[9px] px-2 py-1.5 text-left hover:bg-navy-dark/5"
            >
              <span className="shrink-0 text-sm">{ICONE_TIPO[item.tipo]}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-navy-dark">{item.titulo}</span>
                <span className="block truncate text-[10.5px] font-semibold text-navy-dark/45">
                  {ROTULO_TIPO[item.tipo]}
                  {item.materia ? ` · ${item.materia}` : ""}
                  {item.detalhe ? ` · ${item.detalhe}` : ""}
                </span>
              </span>
              {item.nota && (
                <span className="shrink-0 rounded-full bg-navy-dark/5 px-2 py-0.5 text-[10px] font-extrabold text-navy-dark/50">
                  {item.nota}
                </span>
              )}
            </button>
          ))}
          {resultados.length === 0 && (
            <p className="px-2 py-4 text-center text-[11px] font-semibold text-navy-dark/45">
              Nada encontrado para &quot;{consulta}&quot;. Use &quot;Cadastrar novo&quot; abaixo ou cadastre o conteúdo no
              módulo correspondente.
            </p>
          )}
          {resultados.length > visiveis.length && (
            <p className="px-2 py-1.5 text-center text-[10.5px] font-semibold text-navy-dark/40">
              Mostrando {visiveis.length} de {resultados.length}. Refine a busca para ver o resto.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================

function DiaEditor({
  diaNumero,
  dia,
  aberto,
  onToggle,
  onSalvo,
  onRemover,
  removendo,
  catalogo,
  materias
}: {
  diaNumero: number;
  dia: TrilhaDia | undefined;
  aberto: boolean;
  onToggle: () => void;
  onSalvo: (msg: string) => void;
  onRemover: () => void;
  removendo: boolean;
  catalogo: ItemCatalogo[];
  materias: string[];
}) {
  const [titulo, setTitulo] = useState(dia?.titulo ?? `Dia ${diaNumero}`);
  const [itens, setItens] = useState<TrilhaItem[]>(dia?.itens ?? []);
  const [tipoSolto, setTipoSolto] = useState<TrilhaItemTipo>("revisao");
  const [tituloSolto, setTituloSolto] = useState("");
  const [criando, setCriando] = useState<"aula" | "pdf" | "link" | null>(null);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoUrl, setNovoUrl] = useState("");
  const [novaMateria, setNovaMateria] = useState("");
  const [erroCriar, setErroCriar] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [buscando, setBuscando] = useState(false);

  const aulasGenericas = itens.filter((i) => i.tipo === "aula" && /^Aula \d+$/.test(i.titulo)).length;

  function atualizarItem(i: number, patch: Partial<TrilhaItem>) {
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  function removerItem(i: number) {
    setItens((prev) => prev.filter((_, idx) => idx !== i));
  }

  // Reordenar importa: a ordem dos itens é a ordem em que o aluno estuda.
  function mover(i: number, delta: number) {
    setItens((prev) => {
      const destino = i + delta;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[i], copia[destino]] = [copia[destino], copia[i]];
      return copia;
    });
  }

  function anexarDoCatalogo(item: ItemCatalogo, tituloExibido: string) {
    setItens((prev) => [...prev, itemDoCatalogo(item, tituloExibido)]);
  }

  function adicionarSolto() {
    const t = tituloSolto.trim() || ROTULO_TIPO[tipoSolto];
    setItens((prev) => [...prev, { tipo: tipoSolto, ref_id: null, url: null, materia: null, titulo: t }]);
    setTituloSolto("");
  }

  // Cadastra o conteúdo e já o anexa ao dia, num passo só.
  function cadastrarEAnexar() {
    if (!criando) return;
    setErroCriar(null);
    startTransition(async () => {
      const r = await criarConteudoParaDia(criando, novoTitulo, novoUrl, novaMateria).catch(() => ({
        ok: false as const,
        erro: "Falha de conexão."
      }));
      if (!r.ok) {
        setErroCriar(r.erro);
        return;
      }
      setItens((v) => [...v, r.item]);
      setNovoTitulo("");
      setNovoUrl("");
      setNovaMateria("");
      setCriando(null);
      // Atualiza o catálogo desta tela com o conteúdo recém-criado.
      router.refresh();
    });
  }

  function salvar() {
    startTransition(async () => {
      const r = await salvarDiaTrilha(diaNumero, titulo, itens).catch(() => ({
        ok: false,
        erro: "Falha de conexão."
      }));
      onSalvo(r.ok ? `Dia ${diaNumero} salvo.` : `Erro: ${r.erro}`);
    });
  }

  function buscarTitulos() {
    setBuscando(true);
    startTransition(async () => {
      const r = await atualizarTitulosDoDia(diaNumero).catch(() => ({
        ok: false as const,
        erro: "Falha de conexão.",
        atualizados: 0,
        total: 0
      }));
      setBuscando(false);
      onSalvo(r.ok ? `${r.atualizados} de ${r.total} títulos atualizados.` : `Erro: ${"erro" in r ? r.erro : ""}`);
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
                  {ICONE_TIPO[item.tipo] ?? "📌"} {ROTULO_TIPO[item.tipo] ?? item.tipo}
                </span>
                <input
                  value={item.titulo}
                  onChange={(e) => atualizarItem(i, { titulo: e.target.value })}
                  placeholder="Título"
                  className="min-w-[160px] flex-1 rounded-lg border border-navy-dark/10 px-2 py-1.5 text-xs"
                />
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => mover(i, -1)}
                    disabled={i === 0}
                    title="Subir"
                    className="rounded-md px-1.5 py-0.5 text-[11px] font-bold text-navy-dark/50 hover:bg-white disabled:opacity-25"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(i, 1)}
                    disabled={i === itens.length - 1}
                    title="Descer"
                    className="rounded-md px-1.5 py-0.5 text-[11px] font-bold text-navy-dark/50 hover:bg-white disabled:opacity-25"
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => removerItem(i)} className="text-xs font-bold text-red-500">
                    remover
                  </button>
                </div>
              </div>
            ))}
            {itens.length === 0 && <p className="text-xs text-navy-dark/40">Dia livre — nenhum item anexado ainda.</p>}
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-navy-dark/50">
              Adicionar conteúdo
            </p>
            <BuscaConteudo catalogo={catalogo} onEscolher={anexarDoCatalogo} />
          </div>

          {/* Itens sem conteúdo associado (revisão, leitura, redação, livre) —
              só um rótulo no dia, sem referência a cadastro nenhum. */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10.5px] font-bold text-navy-dark/45">Ou marque um bloco sem conteúdo:</span>
            <select
              value={tipoSolto}
              onChange={(e) => setTipoSolto(e.target.value as TrilhaItemTipo)}
              className="rounded-[9px] border border-navy-dark/15 px-2 py-1.5 text-[11px] font-bold text-navy-dark"
            >
              {TIPOS_SOLTOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {ICONE_TIPO[t.valor]} {t.label}
                </option>
              ))}
            </select>
            <input
              value={tituloSolto}
              onChange={(e) => setTituloSolto(e.target.value)}
              placeholder="Título (opcional)"
              className="min-w-0 flex-1 rounded-[9px] border border-navy-dark/15 px-2 py-1.5 text-[11px] font-semibold text-navy-dark"
            />
            <button
              type="button"
              onClick={adicionarSolto}
              className="rounded-[9px] bg-navy-dark/10 px-3 py-1.5 text-[11px] font-extrabold text-navy-dark"
            >
              + Anexar
            </button>
          </div>

          {/* Cadastro do conteúdo sem sair do editor: cria o registro real
              (conteudos_biblioteca / links_externos) e já anexa ao dia. */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10.5px] font-bold text-navy-dark/45">Não achou? Cadastre agora:</span>
            {(["aula", "pdf", "link"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setCriando(criando === t ? null : t);
                  setErroCriar(null);
                }}
                className={`rounded-[9px] border px-3 py-1.5 text-[11px] font-extrabold ${
                  criando === t
                    ? "border-orange bg-orange/10 text-orange-dark"
                    : "border-orange/40 text-orange-dark hover:bg-orange/5"
                }`}
              >
                {ICONE_TIPO[t]} {ROTULO_TIPO[t]}
              </button>
            ))}
          </div>

          {criando && (
            <div className="space-y-2 rounded-xl border border-orange/30 bg-orange/[0.04] p-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-orange-dark">
                Cadastrar {ROTULO_TIPO[criando].toLowerCase()} e anexar ao Dia {diaNumero}
              </p>
              <TextInput value={novoTitulo} onChange={(e) => setNovoTitulo(e.target.value)} placeholder="Título" />
              <TextInput
                value={novoUrl}
                onChange={(e) => setNovoUrl(e.target.value)}
                placeholder={criando === "aula" ? "Link do YouTube" : "https://..."}
              />
              {criando !== "link" && (
                <input
                  list={`materias-${diaNumero}`}
                  value={novaMateria}
                  onChange={(e) => setNovaMateria(e.target.value)}
                  placeholder="Matéria"
                  className="w-full rounded-[10px] border border-navy-dark/15 bg-white px-3 py-2.5 text-xs font-semibold text-navy-dark outline-none focus:border-navy"
                />
              )}
              <datalist id={`materias-${diaNumero}`}>
                {materias.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
              {erroCriar && <p className="text-[11px] font-bold text-red">{erroCriar}</p>}
              <PrimaryButton onClick={cadastrarEAnexar} className={pending ? "opacity-60" : ""}>
                {pending ? "Cadastrando..." : "CADASTRAR E ANEXAR"}
              </PrimaryButton>
            </div>
          )}

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
