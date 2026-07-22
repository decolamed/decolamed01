"use client";

import { useState, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Chip, Toast, useToast, PrimaryButton, GhostButton, TextInput, TextArea, FieldLabel } from "@/components/admin/interactive";
import { salvarQuestao, excluirQuestao, type QuestaoForm } from "./actions";
import type { Questao } from "@/types/database";

const DIFICULDADE_LABEL: Record<string, "Fácil" | "Média" | "Difícil"> = { facil: "Fácil", media: "Média", dificil: "Difícil" };
const VAZIO: QuestaoForm = {
  enunciado: "",
  materia: "Biologia",
  assunto: "",
  dificuldade: "Média",
  gabarito: "a",
  comentario: "",
  fonte: "",
  alternativas: { a: "", b: "", c: "", d: "", e: "" }
};

function codigo(id: string) {
  return "Q" + id.slice(0, 6).toUpperCase();
}

export function QuestoesManager({ questoes, materiasExistentes }: { questoes: Questao[]; materiasExistentes: string[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todas");
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<QuestaoForm>(VAZIO);
  const [pending, startTransition] = useTransition();
  const { toast, show } = useToast();

  const materias = ["Todas", ...materiasExistentes];
  const termo = busca.trim().toLowerCase();
  const lista = questoes.filter(
    (q) =>
      (filtro === "Todas" || q.materia === filtro) &&
      (!termo || (codigo(q.id) + " " + q.enunciado + " " + q.materia + " " + (q.assunto ?? "")).toLowerCase().includes(termo))
  );

  function editar(q: Questao) {
    setEditId(q.id);
    const alt: Record<string, string> = { a: "", b: "", c: "", d: "", e: "" };
    q.alternativas.forEach((a) => (alt[a.id] = a.texto));
    setDraft({
      id: q.id,
      enunciado: q.enunciado,
      materia: q.materia,
      assunto: q.assunto ?? "",
      dificuldade: DIFICULDADE_LABEL[q.dificuldade] ?? "Média",
      gabarito: q.resposta_correta,
      comentario: q.explicacao ?? "",
      fonte: (q as any).fonte ?? "",
      alternativas: alt
    });
  }

  function limpar() {
    setEditId(null);
    setDraft(VAZIO);
  }

  function salvar() {
    startTransition(async () => {
      const res = await salvarQuestao(draft);
      if (!res.ok) {
        show(res.erro ?? "Não foi possível salvar.");
        return;
      }
      show(editId ? "Questão atualizada." : "Questão cadastrada.");
      limpar();
    });
  }

  function excluir(id: string) {
    if (!confirm("Excluir esta questão? Essa ação não pode ser desfeita.")) return;
    startTransition(async () => {
      const res = await excluirQuestao(id);
      show(res.ok ? "Questão excluída." : res.erro ?? "Erro ao excluir.");
      if (editId === id) limpar();
    });
  }

  return (
    <div>
      <PageHeader title="Banco de Questões" subtitle="Crie e edite questões ligadas à matriz FACAPE — grava direto no banco" />

      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Card className="mb-3">
            <TextInput
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por código, enunciado, disciplina ou assunto..."
              className="mb-3"
            />
            <div className="mb-3 flex flex-wrap gap-2">
              {materias.map((m) => (
                <Chip key={m} active={filtro === m} onClick={() => setFiltro(m)}>{m}</Chip>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {lista.map((q) => (
                <div key={q.id} className={`rounded-xl border p-3 ${editId === q.id ? "border-orange bg-orange/5" : "border-navy-dark/10 bg-white"}`}>
                  <p className="mb-2 text-sm font-semibold leading-snug text-navy-dark">{q.enunciado}</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-navy-dark/5 px-2.5 py-1 font-mono text-[10px] font-extrabold text-navy-dark">{codigo(q.id)}</span>
                    <span className="rounded-full bg-green/10 px-2.5 py-1 text-[10px] font-extrabold text-green">{q.materia}</span>
                    {q.assunto && <span className="rounded-full bg-navy-dark/5 px-2.5 py-1 text-[10px] font-extrabold text-navy-dark/60">{q.assunto}</span>}
                    <span className="rounded-full bg-orange/10 px-2.5 py-1 text-[10px] font-extrabold text-orange">
                      {DIFICULDADE_LABEL[q.dificuldade] ?? q.dificuldade} · Gabarito {q.resposta_correta.toUpperCase()}
                    </span>
                    {!q.ativo && <span className="rounded-full bg-red/10 px-2.5 py-1 text-[10px] font-extrabold text-red">Inativa</span>}
                    <div className="flex-1" />
                    <button type="button" onClick={() => editar(q)} className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-navy-dark/5 text-navy-dark/60" title="Editar">
                      <Icon name="pencil" size={12} />
                    </button>
                    <button type="button" onClick={() => excluir(q.id)} className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-red/10 text-red" title="Excluir">
                      <Icon name="trash" size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {lista.length === 0 && <p className="py-4 text-center text-sm text-navy-dark/50">Nenhuma questão encontrada.</p>}
            </div>
          </Card>
        </div>

        <Card className="h-fit">
          <h2 className="text-sm font-extrabold text-navy-dark">{editId ? "Editar questão" : "Nova questão"}</h2>
          <FieldLabel>Enunciado</FieldLabel>
          <TextArea rows={3} value={draft.enunciado} onChange={(e) => setDraft({ ...draft, enunciado: e.target.value })} placeholder="Digite o enunciado..." />
          <FieldLabel>Matéria</FieldLabel>
          <TextInput value={draft.materia} onChange={(e) => setDraft({ ...draft, materia: e.target.value })} placeholder="Biologia" />
          <FieldLabel>Assunto (matriz FACAPE)</FieldLabel>
          <TextInput value={draft.assunto} onChange={(e) => setDraft({ ...draft, assunto: e.target.value })} placeholder="Ex.: Sistema Digestório" />
          <FieldLabel>Origem (ano e prova, opcional)</FieldLabel>
          <TextInput value={draft.fonte ?? ""} onChange={(e) => setDraft({ ...draft, fonte: e.target.value })} placeholder="Ex.: FACAPE 2024 · 1ª fase" />

          <FieldLabel>Alternativas (deixe em branco as que não for usar)</FieldLabel>
          <div className="space-y-1.5">
            {(["a", "b", "c", "d", "e"] as const).map((letra) => (
              <div key={letra} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-xs font-extrabold text-navy-dark">{letra.toUpperCase()}</span>
                <TextInput
                  value={draft.alternativas[letra] ?? ""}
                  onChange={(e) => setDraft({ ...draft, alternativas: { ...draft.alternativas, [letra]: e.target.value } })}
                />
              </div>
            ))}
          </div>

          <FieldLabel>Dificuldade</FieldLabel>
          <div className="flex gap-1.5">
            {(["Fácil", "Média", "Difícil"] as const).map((n) => (
              <Chip key={n} active={draft.dificuldade === n} onClick={() => setDraft({ ...draft, dificuldade: n })}>{n}</Chip>
            ))}
          </div>

          <FieldLabel>Resposta correta</FieldLabel>
          <div className="flex gap-1.5">
            {(["a", "b", "c", "d", "e"] as const).map((o) => (
              <Chip key={o} active={draft.gabarito === o} onClick={() => setDraft({ ...draft, gabarito: o })}>{o.toUpperCase()}</Chip>
            ))}
          </div>

          <FieldLabel>Comentário do gabarito</FieldLabel>
          <TextArea rows={2} value={draft.comentario} onChange={(e) => setDraft({ ...draft, comentario: e.target.value })} placeholder="Explicação exibida ao aluno..." />

          <div className="mt-4 flex gap-2">
            <PrimaryButton onClick={salvar} className={pending ? "opacity-60" : ""}>
              {pending ? "Salvando..." : editId ? "SALVAR ALTERAÇÕES" : "CADASTRAR QUESTÃO"}
            </PrimaryButton>
            <GhostButton onClick={limpar}>Limpar</GhostButton>
          </div>
        </Card>
      </div>

      <Toast message={toast} />
    </div>
  );
}
