"use client";
import { useState, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Toggle, Toast, useToast, PrimaryButton, TextInput, FieldLabel } from "@/components/admin/interactive";
import { criarConteudo, alternarAtivoConteudo, excluirConteudo } from "../cursos/actions";

export function PdfsManager({ pdfs: inicial }: { pdfs: any[] }) {
  const [pdfs, setPdfs] = useState(inicial);
  const [titulo, setTitulo] = useState("");
  const [materia, setMateria] = useState("Biologia");
  const [assunto, setAssunto] = useState("");
  const [url, setUrl] = useState("");
  const [, startTransition] = useTransition();
  const { toast, show } = useToast();

  function adicionar() {
    startTransition(async () => {
      const res = await criarConteudo("pdf", titulo, materia, assunto, url, 0);
      if (!res.ok) { show(res.erro ?? "Erro."); return; }
      show("PDF adicionado.");
      setTitulo(""); setUrl(""); setAssunto("");
      setPdfs((a) => [{ id: crypto.randomUUID(), titulo, materia, assunto, url, tipo: "pdf", ativo: true }, ...a]);
    });
  }

  function alternar(id: string, ativo: boolean) {
    setPdfs((a) => a.map((x) => x.id === id ? { ...x, ativo: !ativo } : x));
    startTransition(() => alternarAtivoConteudo(id, ativo));
  }

  function excluir(id: string) {
    startTransition(async () => {
      const res = await excluirConteudo(id);
      if (res.ok) { setPdfs((a) => a.filter((x) => x.id !== id)); show("PDF removido."); }
    });
  }

  return (
    <div>
      <PageHeader title="Gerenciador de PDFs" subtitle="Materiais em PDF disponíveis na Bagagem Essencial do aluno" />
      <div className="grid gap-3 lg:grid-cols-[1fr_1.5fr]">
        <Card>
          <h2 className="text-sm font-extrabold text-navy-dark">Adicionar material</h2>
          <FieldLabel>Título</FieldLabel>
          <TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Resumo · Sistema Digestório" />
          <FieldLabel>Matéria</FieldLabel>
          <TextInput value={materia} onChange={(e) => setMateria(e.target.value)} placeholder="Biologia" />
          <FieldLabel>Assunto (opcional)</FieldLabel>
          <TextInput value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Citologia" />
          <FieldLabel>URL do arquivo (Google Drive, etc.)</FieldLabel>
          <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/..." />
          <PrimaryButton onClick={adicionar} className="mt-4">ADICIONAR PDF</PrimaryButton>
        </Card>

        <Card className="!p-0 sm:!px-[18px]">
          {pdfs.length === 0 && <p className="py-6 text-center text-sm text-navy-dark/50">Nenhum PDF cadastrado ainda.</p>}
          {pdfs.map((p, i) => (
            <div key={p.id} className={`flex flex-wrap items-center gap-3 py-3.5 ${i < pdfs.length - 1 ? "border-b border-navy-dark/10" : ""}`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-red/10 text-red">
                <Icon name="file" size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-navy-dark">{p.titulo}</p>
                <p className="text-xs font-semibold text-navy-dark/50">{p.materia}{p.assunto ? ` · ${p.assunto}` : ""}</p>
              </div>
              <span className={`text-[10px] font-extrabold ${p.ativo ? "text-green" : "text-navy-dark/35"}`}>{p.ativo ? "Disponível" : "Oculto"}</span>
              <Toggle on={p.ativo} onClick={() => alternar(p.id, p.ativo)} />
              <button type="button" onClick={() => excluir(p.id)} className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-red/10 text-red" title="Excluir">
                <Icon name="trash" size={13} />
              </button>
            </div>
          ))}
        </Card>
      </div>
      <Toast message={toast} />
    </div>
  );
}
