"use client";

import { useState, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Chip, Toast, useToast, PrimaryButton, TextInput } from "@/components/admin/interactive";
import { salvarFlashcard, excluirFlashcard } from "./actions";
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

  const materias = ["Todas", ...materiasExistentes];
  const lista = cards.filter((x) => filtro === "Todas" || x.materia === filtro);

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
      <PageHeader title="Flashcards" subtitle="Flashcards nativos da plataforma — grava direto no banco" />

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
