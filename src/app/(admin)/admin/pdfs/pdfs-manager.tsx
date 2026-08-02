"use client";
import { useState, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Toggle, Toast, useToast, PrimaryButton, GhostButton, TextInput, FieldLabel } from "@/components/admin/interactive";
import { criarConteudo, atualizarConteudo, alternarAtivoConteudo, excluirConteudo } from "../cursos/actions";

export function PdfsManager({ pdfs: inicial }: { pdfs: any[] }) {
  const [pdfs, setPdfs] = useState(inicial);
  const [titulo, setTitulo] = useState("");
  const [materia, setMateria] = useState("Biologia");
  const [assunto, setAssunto] = useState("");
  const [url, setUrl] = useState("");
  // Preenchido = o cartão da esquerda vira "editar".
  const [editId, setEditId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { toast, show } = useToast();

  function limpar() {
    setEditId(null);
    setTitulo("");
    setUrl("");
    setAssunto("");
  }

  function editar(p: any) {
    setEditId(p.id);
    setTitulo(p.titulo);
    setMateria(p.materia);
    setAssunto(p.assunto ?? "");
    setUrl(p.url ?? "");
  }

  function salvar() {
    startTransition(async () => {
      if (editId) {
        const res = await atualizarConteudo(editId, titulo, materia, assunto, url, 0).catch(() => ({ ok: false, erro: undefined }));
        if (!res.ok) { show(res.erro ?? "Não foi possível salvar."); return; }
        setPdfs((a) => a.map((x) => (x.id === editId ? { ...x, titulo, materia, assunto, url } : x)));
        limpar();
        show("Material atualizado.");
        return;
      }
      const res = await criarConteudo("pdf", titulo, materia, assunto, url, 0).catch(() => ({ ok: false, erro: undefined }));
      if (!res.ok) { show(res.erro ?? "Erro."); return; }
      setPdfs((a) => [{ id: crypto.randomUUID(), titulo, materia, assunto, url, tipo: "pdf", ativo: true }, ...a]);
      limpar();
      show("PDF adicionado.");
    });
  }

  // A troca é otimista (a lista muda antes da resposta do servidor). Se a
  // gravação falhar, desfaz e avisa — senão o admin ficaria com uma tela
  // dizendo "inativo" enquanto o item continua aparecendo para o aluno.
  function alternar(id: string, ativo: boolean) {
    const trocar = (valor: boolean) => setPdfs((a) => a.map((x) => (x.id === id ? { ...x, ativo: valor } : x)));
    trocar(!ativo);
    startTransition(async () => {
      // .catch aqui não é decoração: uma Server Action que rejeita (rede fora,
      // servidor reiniciando) vira exceção não tratada e derruba a tela inteira,
      // em vez de só falhar o botão. Verificado no navegador.
      const res = await alternarAtivoConteudo(id, ativo).catch(() => ({ ok: false }));
      if (!res.ok) {
        trocar(ativo);
        show("Não foi possível atualizar o material. Tente de novo.");
      }
    });
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
          <h2 className="text-sm font-extrabold text-navy-dark">{editId ? "Editar material" : "Adicionar material"}</h2>
          <FieldLabel>Título</FieldLabel>
          <TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Resumo · Sistema Digestório" />
          <FieldLabel>Matéria</FieldLabel>
          <TextInput value={materia} onChange={(e) => setMateria(e.target.value)} placeholder="Biologia" />
          <FieldLabel>Assunto (opcional)</FieldLabel>
          <TextInput value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Citologia" />
          <FieldLabel>URL do arquivo (Google Drive, etc.)</FieldLabel>
          <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/..." />
          <div className="mt-4 flex gap-2">
            <PrimaryButton onClick={salvar}>{editId ? "SALVAR ALTERAÇÕES" : "ADICIONAR PDF"}</PrimaryButton>
            {editId && <GhostButton onClick={limpar}>Cancelar</GhostButton>}
          </div>
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
              <button type="button" onClick={() => editar(p)} className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-navy-dark/5 text-navy-dark/60" title="Editar">
                <Icon name="pencil" size={14} />
              </button>
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
