"use client";
import { useState, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Toggle, Toast, useToast, PrimaryButton, TextInput, FieldLabel } from "@/components/admin/interactive";
import { criarLink, alternarAtivoLink, excluirLink } from "./actions";

export function LinksManager({ links: inicial }: { links: any[] }) {
  const [links, setLinks] = useState(inicial);
  const [titulo, setTitulo] = useState("");
  const [url, setUrl] = useState("");
  const [, startTransition] = useTransition();
  const { toast, show } = useToast();

  function adicionar() {
    startTransition(async () => {
      const res = await criarLink(titulo, url);
      if (!res.ok) { show(res.erro ?? "Erro."); return; }
      setTitulo(""); setUrl("");
      show("Link adicionado.");
      setLinks((a) => [{ id: crypto.randomUUID(), titulo, url, ativo: true }, ...a]);
    });
  }

  function alternar(id: string, ativo: boolean) {
    setLinks((a) => a.map((x) => x.id === id ? { ...x, ativo: !ativo } : x));
    startTransition(() => alternarAtivoLink(id, ativo));
  }

  function excluir(id: string) {
    startTransition(async () => {
      const res = await excluirLink(id);
      if (res.ok) { setLinks((a) => a.filter((x) => x.id !== id)); show("Link removido."); }
    });
  }

  return (
    <div>
      <PageHeader title="Links Externos" subtitle="Páginas parceiras que abrem no app do aluno" />
      <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <h2 className="text-sm font-extrabold text-navy-dark">Adicionar link</h2>
          <FieldLabel>Título</FieldLabel>
          <TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Livro digital · Química" />
          <FieldLabel>URL</FieldLabel>
          <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          <PrimaryButton onClick={adicionar} className="mt-4">ADICIONAR LINK</PrimaryButton>
          <div className="mt-4 flex items-center gap-2 rounded-[11px] bg-blue-soft p-3 text-[10.5px] font-semibold leading-relaxed text-navy-dark">
            <Icon name="bot" size={14} className="shrink-0 text-orange" />
            Os links abrem no app sem tirar o aluno da plataforma.
          </div>
        </Card>
        <Card className="!p-0 sm:!px-[18px]">
          {links.map((l, i) => (
            <div key={l.id} className={`flex items-center gap-3 py-3.5 ${i < links.length - 1 ? "border-b border-navy-dark/10" : ""}`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-blue-soft text-navy-dark">
                <Icon name="link2" size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-navy-dark">{l.titulo}</p>
                <p className="truncate text-xs font-semibold text-navy-dark/40">{l.url}</p>
              </div>
              <Toggle on={l.ativo} onClick={() => alternar(l.id, l.ativo)} />
              <button type="button" onClick={() => excluir(l.id)} className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-red/10 text-red" title="Excluir">
                <Icon name="trash" size={14} />
              </button>
            </div>
          ))}
          {links.length === 0 && <p className="py-6 text-center text-sm text-navy-dark/50">Nenhum link cadastrado.</p>}
        </Card>
      </div>
      <Toast message={toast} />
    </div>
  );
}
