"use client";

import { useState, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Chip, Toast, useToast, PrimaryButton, GhostButton, TextInput } from "@/components/admin/interactive";
import { ImportadorTexto } from "@/components/admin/importador-texto";
import { parseFlashcardsTexto, type FlashcardParseado } from "@/lib/importacao/parse-flashcards";
import { materiaCanonica, mesmaMateria } from "@/lib/site/materia-canonica";
import { salvarFlashcard, salvarFlashcardsEmLote, excluirFlashcard } from "./actions";
import type { Flashcard } from "@/types/database";

export function FlashcardsManager({ cards, materiasExistentes }: { cards: Flashcard[]; materiasExistentes: string[] }) {
  const [filtro, setFiltro] = useState("Todas");
  const [editId, setEditId] = useState<string | "novo" | null>(null);
  const [f, setF] = useState("");
  const [v, setV] = useState("");
  const [materia, setMateria] = useState("Biologia");
  const [assunto, setAssunto] = useState("");
  const [pending, startTransition] = useTransition();
  const { toast, show } = useToast();

  const [importando, setImportando] = useState(false);
  const [previa, setPrevia] = useState<FlashcardParseado[] | null>(null);
  const [materiaLote, setMateriaLote] = useState("Biologia");
  const [assuntoLote, setAssuntoLote] = useState("");

  function analisarTexto(texto: string) {
    setPrevia(parseFlashcardsTexto(texto));
  }

  function importarLote() {
    if (!previa) return;
    const validos = previa.filter((p) => !p.erro);
    startTransition(async () => {
      const res = await salvarFlashcardsEmLote(
        validos.map((p) => ({ frente: p.frente, verso: p.verso, materia: materiaLote, assunto: assuntoLote }))
      );
      show(`${res.sucesso} flashcard(s) importado(s)${res.falha ? `, ${res.falha} falharam` : ""}.`);
      setPrevia(null);
      setImportando(false);
    });
  }

  const materias = ["Todas", ...materiasExistentes];
  const lista = cards.filter((x) => filtro === "Todas" || mesmaMateria(x.materia, filtro));

  // Contadores derivados de `cards`, que é o resultado da consulta ao banco
  // feita a cada carregamento da página (a rota é dinâmica). Não há número
  // guardado: incluir ou excluir um flashcard muda esta conta na hora, que é
  // o que faltava para o admin saber quantos cartões existem de fato.
  const totalCards = cards.length;
  const totalAtivos = cards.filter((c) => c.ativo).length;
  const porMateria = new Map<string, number>();
  cards.forEach((c) => {
    const nome = materiaCanonica(c.materia);
    if (nome) porMateria.set(nome, (porMateria.get(nome) ?? 0) + 1);
  });

  function iniciarEdicao(card: Flashcard) {
    setEditId(card.id);
    setF(card.frente);
    setV(card.verso);
    setMateria(card.materia);
    setAssunto(card.assunto ?? "");
  }

  function novo() {
    setEditId("novo");
    setF("");
    setV("");
    setMateria("Biologia");
    setAssunto("");
  }

  function salvar() {
    startTransition(async () => {
      const res = await salvarFlashcard({
        id: editId !== "novo" ? (editId ?? undefined) : undefined,
        frente: f,
        verso: v,
        materia,
        assunto
      });
      if (!res.ok) {
        show(res.erro ?? "Erro ao salvar.");
        return;
      }
      show("Flashcard salvo.");
      setEditId(null);
    });
  }

  function excluir(id: string) {
    if (!confirm("Excluir este flashcard?")) return;
    startTransition(async () => {
      const res = await excluirFlashcard(id);
      show(res.ok ? "Flashcard excluído." : res.erro ?? "Erro ao excluir.");
      if (editId === id) setEditId(null);
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Flashcards"
          subtitle={
            totalCards === 0
              ? "Nenhum flashcard cadastrado ainda"
              : `${totalCards} flashcard${totalCards === 1 ? "" : "s"} cadastrado${totalCards === 1 ? "" : "s"}` +
                (totalAtivos === totalCards ? "" : ` · ${totalAtivos} ativo${totalAtivos === 1 ? "" : "s"}`)
          }
        />
        <GhostButton onClick={() => setImportando((v) => !v)}>{importando ? "Fechar importação" : "Importar em massa"}</GhostButton>
      </div>

      {totalCards > 0 && (
        <Card className="mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40">Por matéria</h2>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
            {Array.from(porMateria.entries())
              .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
              .map(([nome, qtd]) => (
                <span key={nome} className="text-sm font-semibold text-navy-dark">
                  {nome} <span className="font-extrabold text-orange">{qtd}</span>
                </span>
              ))}
          </div>
        </Card>
      )}

      {importando && (
        <Card className="mb-3">
          <h2 className="text-sm font-extrabold text-navy-dark">Importar flashcards em massa</h2>
          <p className="mt-1 text-xs text-navy-dark/50">
            Cole o texto (ou envie um PDF) com blocos &quot;Frente:&quot;/&quot;Verso:&quot;, ou uma linha por card no
            formato &quot;pergunta | resposta&quot;. Você revisa tudo antes de importar de verdade.
          </p>
          <div className="mt-3">
            <ImportadorTexto
              onAnalisar={analisarTexto}
              placeholder={"Frente: O que é mitose?\nVerso: Divisão celular que gera duas células idênticas.\n\nFrente: O que é meiose?\nVerso: Divisão celular que gera células com metade dos cromossomos."}
            />
          </div>

          {previa && (
            <div className="mt-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-navy-dark">Aplicar a todos:</span>
                <TextInput value={materiaLote} onChange={(e) => setMateriaLote(e.target.value)} placeholder="Matéria" className="!w-40" />
                <TextInput value={assuntoLote} onChange={(e) => setAssuntoLote(e.target.value)} placeholder="Assunto (opcional)" className="!w-48" />
              </div>
              <div className="flex flex-col gap-2">
                {previa.map((p, i) => (
                  <div key={i} className={`rounded-xl border p-3 text-xs ${p.erro ? "border-red/30 bg-red/5" : "border-green/30 bg-green/5"}`}>
                    <p className="font-semibold text-navy-dark">{p.frente || "(sem frente)"}</p>
                    {p.verso && <p className="mt-1 text-navy-dark/60">{p.verso}</p>}
                    {p.erro && <p className="mt-1 font-bold text-red">{p.erro}</p>}
                  </div>
                ))}
                {previa.length === 0 && <p className="text-xs text-navy-dark/50">Nenhum bloco reconhecido nesse texto.</p>}
              </div>
              <PrimaryButton onClick={importarLote} className={`mt-3 ${pending ? "opacity-60" : ""}`}>
                {pending ? "Importando..." : `Importar ${previa.filter((p) => !p.erro).length} flashcard(s) válido(s)`}
              </PrimaryButton>
            </div>
          )}
        </Card>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {materias.map((m) => (
          <Chip key={m} active={filtro === m} onClick={() => setFiltro(m)}>{m}</Chip>
        ))}
        <div className="flex-1" />
        <PrimaryButton onClick={novo}>+ Novo flashcard</PrimaryButton>
      </div>

      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        {editId === "novo" && (
          <Card className="border-orange">
            <div className="mb-2 flex gap-2">
              <TextInput value={materia} onChange={(e) => setMateria(e.target.value)} placeholder="Matéria" />
              <TextInput value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Assunto" />
            </div>
            <TextInput className="mb-2" value={f} onChange={(e) => setF(e.target.value)} placeholder="Frente (pergunta)" />
            <TextInput value={v} onChange={(e) => setV(e.target.value)} placeholder="Verso (resposta)" />
            <div className="mt-3 flex gap-2">
              <PrimaryButton onClick={salvar} className={pending ? "opacity-60" : ""}>{pending ? "Salvando..." : "Cadastrar"}</PrimaryButton>
              <button type="button" onClick={() => setEditId(null)} className="text-xs font-bold text-navy-dark/50">Cancelar</button>
            </div>
          </Card>
        )}

        {lista.map((card) => {
          const editing = editId === card.id;
          return (
            <Card key={card.id}>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="rounded-full bg-green/10 px-2.5 py-1 text-[10px] font-extrabold text-green">{card.materia}</span>
                {card.assunto && <span className="rounded-full bg-navy-dark/5 px-2.5 py-1 text-[10px] font-bold text-navy-dark/60">{card.assunto}</span>}
                <div className="flex-1" />
                {editing ? (
                  <button type="button" onClick={salvar} className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-green/10 text-green" title="Salvar">
                    <Icon name="check" size={13} />
                  </button>
                ) : (
                  <button type="button" onClick={() => iniciarEdicao(card)} className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-navy-dark/5 text-navy-dark/60" title="Editar">
                    <Icon name="pencil" size={13} />
                  </button>
                )}
                <button type="button" onClick={() => excluir(card.id)} className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-red/10 text-red" title="Excluir">
                  <Icon name="trash" size={13} />
                </button>
              </div>
              {editing ? <TextInput className="mb-2" value={f} onChange={(e) => setF(e.target.value)} /> : <p className="mb-2 font-extrabold text-navy-dark">{card.frente}</p>}
              <div className="my-2.5 h-px bg-navy-dark/10" />
              {editing ? <TextInput value={v} onChange={(e) => setV(e.target.value)} /> : <p className="text-xs font-semibold leading-relaxed text-navy-dark/60">{card.verso}</p>}
            </Card>
          );
        })}
        {lista.length === 0 && editId !== "novo" && (
          <p className="col-span-2 py-6 text-center text-sm text-navy-dark/50">Nenhum flashcard cadastrado ainda.</p>
        )}
      </div>

      <Toast message={toast} />
    </div>
  );
}
