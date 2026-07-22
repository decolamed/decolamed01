"use client";
import { useState, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Toggle, Toast, useToast, PrimaryButton, TextInput, FieldLabel } from "@/components/admin/interactive";
import { criarConteudo, alternarAtivoConteudo, excluirConteudo } from "./actions";

export function CursosManager({ aulas: inicial }: { aulas: any[] }) {
  const [aulas, setAulas] = useState(inicial);
  const [titulo, setTitulo] = useState("");
  const [materia, setMateria] = useState("Biologia");
  const [assunto, setAssunto] = useState("");
  const [url, setUrl] = useState("");
  const [duracao, setDuracao] = useState("30");
  const [, startTransition] = useTransition();
  const { toast, show } = useToast();

  function adicionar() {
    startTransition(async () => {
      const res = await criarConteudo("aula", titulo, materia, assunto, url, Number(duracao) || 30);
      if (!res.ok) { show(res.erro ?? "Erro."); return; }
      show("Aula adicionada.");
      setTitulo(""); setUrl(""); setAssunto("");
      setAulas((a) => [{ id: crypto.randomUUID(), titulo, materia, assunto, url, duracao_minutos: Number(duracao), ativo: true }, ...a]);
    });
  }

  function alternar(id: string, ativo: boolean) {
    setAulas((a) => a.map((x) => x.id === id ? { ...x, ativo: !ativo } : x));
    startTransition(() => alternarAtivoConteudo(id, ativo));
  }

  function excluir(id: string) {
    startTransition(async () => {
      const res = await excluirConteudo(id);
      if (res.ok) { setAulas((a) => a.filter((x) => x.id !== id)); show("Aula removida."); }
    });
  }

  const materias = Array.from(new Set(aulas.map((a) => a.materia))).sort();

  return (
    <div>
      <PageHeader title="Cursos & Aulas" subtitle="Videoaulas cadastradas na Biblioteca — usadas pelo Cronograma e pelo Copiloto" />
      <div className="grid gap-3 lg:grid-cols-[1fr_1.5fr]">
        <Card>
          <h2 className="text-sm font-extrabold text-navy-dark">Adicionar aula</h2>
          <FieldLabel>Título</FieldLabel>
          <TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Introdução à Citologia" />
          <FieldLabel>Matéria</FieldLabel>
          <TextInput value={materia} onChange={(e) => setMateria(e.target.value)} placeholder="Biologia" />
          <FieldLabel>Assunto (opcional)</FieldLabel>
          <TextInput value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Citologia" />
          <FieldLabel>URL do vídeo (YouTube, etc.)</FieldLabel>
          <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          <FieldLabel>Duração estimada (minutos)</FieldLabel>
          <TextInput type="number" value={duracao} onChange={(e) => setDuracao(e.target.value)} placeholder="30" />
          <PrimaryButton onClick={adicionar} className="mt-4">ADICIONAR AULA</PrimaryButton>
        </Card>

        <Card className="!p-0 sm:!px-[18px]">
          {aulas.length === 0 && <p className="py-6 text-center text-sm text-navy-dark/50">Nenhuma aula cadastrada ainda.</p>}
          {materias.map((mat) => (
            <div key={mat}>
              <p className="mt-3 px-0 text-[10px] font-extrabold uppercase tracking-widest text-navy-dark/40">{mat}</p>
              {aulas.filter((a) => a.materia === mat).map((a, i, arr) => (
                <div key={a.id} className={`flex flex-wrap items-center gap-3 py-3 ${i < arr.length - 1 ? "border-b border-navy-dark/10" : ""}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-navy/10 text-navy-dark">
                    <Icon name="video" size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-navy-dark">{a.titulo}</p>
                    <p className="text-xs font-semibold text-navy-dark/40">{a.assunto ? `${a.assunto} · ` : ""}{a.duracao_minutos} min</p>
                  </div>
                  <Toggle on={a.ativo} onClick={() => alternar(a.id, a.ativo)} />
                  <button type="button" onClick={() => excluir(a.id)} className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-red/10 text-red" title="Excluir">
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </Card>
      </div>
      <Toast message={toast} />
    </div>
  );
}
