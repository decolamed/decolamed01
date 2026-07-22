"use client";
import { useState, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Toggle, Toast, useToast, PrimaryButton, GhostButton, TextInput, FieldLabel } from "@/components/admin/interactive";
import { salvarBanner, alternarAtivoBanner, excluirBanner } from "./actions";

const CORES = [
  ["Azul Decola", "linear-gradient(140deg,#0d4a79,#01395E)"],
  ["Laranja", "linear-gradient(140deg,#F36C21,#c9560f)"],
  ["Verde", "linear-gradient(140deg,#0c6b4f,#0a4a38)"],
  ["Foto · Montanha", "linear-gradient(140deg,rgba(1,30,50,.78),rgba(1,30,50,.38)),url(/assets/mountain_lake.png) center/cover"],
  ["Foto · Ilha", "linear-gradient(140deg,rgba(1,30,50,.78),rgba(1,30,50,.30)),url(/assets/island.png) center/cover"],
  ["Foto · Passagem", "linear-gradient(140deg,rgba(1,30,50,.80),rgba(1,30,50,.40)),url(/assets/boarding_pass.png) center/cover"],
] as const;

export function BannersManager({ banners: inicial }: { banners: any[] }) {
  const [banners, setBanners] = useState(inicial);
  const [editId, setEditId] = useState<string | "novo" | null>(null);
  const [draft, setDraft] = useState<{ titulo: string; link: string; bg: string; ativo: boolean }>({ titulo: "", link: "", bg: CORES[0][1], ativo: false });
  const [, startTransition] = useTransition();
  const { toast, show } = useToast();

  function editar(b: any) {
    setEditId(b.id);
    setDraft({ titulo: b.titulo, link: b.link ?? "", bg: b.bg, ativo: b.ativo });
  }

  function novo() {
    setEditId("novo");
    setDraft({ titulo: "", link: "", bg: CORES[0][1], ativo: false });
  }

  function salvar() {
    startTransition(async () => {
      const id = editId === "novo" ? null : editId;
      const res = await salvarBanner(id, draft.titulo, draft.link, draft.bg, draft.ativo);
      if (!res.ok) { show(res.erro ?? "Erro."); return; }
      show("Banner salvo.");
      setEditId(null);
      window.location.reload();
    });
  }

  function alternar(id: string, ativo: boolean) {
    setBanners((a) => a.map((x) => x.id === id ? { ...x, ativo: !ativo } : x));
    startTransition(() => alternarAtivoBanner(id, ativo));
  }

  function excluir(id: string) {
    startTransition(async () => {
      const res = await excluirBanner(id);
      if (res.ok) { setBanners((a) => a.filter((x) => x.id !== id)); show("Banner removido."); }
    });
  }

  return (
    <div>
      <PageHeader title="Banners" subtitle="Banners exibidos no topo da home do aluno" />
      <div className="mb-3 flex justify-end">
        <PrimaryButton onClick={novo}>+ Novo banner</PrimaryButton>
      </div>

      {editId && (
        <Card className="mb-4">
          <h2 className="text-sm font-extrabold text-navy-dark">{editId === "novo" ? "Novo banner" : "Editar banner"}</h2>
          <div className="mb-3 mt-2 rounded-xl p-4 text-white" style={{ background: draft.bg }}>
            <p className="font-extrabold">{draft.titulo || "Prévia do banner"}</p>
          </div>
          <FieldLabel>Título</FieldLabel>
          <TextInput value={draft.titulo} onChange={(e) => setDraft({ ...draft, titulo: e.target.value })} placeholder="Aulão FACAPE ao vivo" />
          <FieldLabel>Link de destino</FieldLabel>
          <TextInput value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="app/estudos" />
          <FieldLabel>Cor/Fundo</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CORES.map(([nome, bg]) => (
              <button key={nome} type="button" onClick={() => setDraft({ ...draft, bg })} title={nome}
                className={`h-8 w-8 rounded-[9px] border-2 ${draft.bg === bg ? "border-orange" : "border-transparent"}`}
                style={{ background: bg }} />
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <PrimaryButton onClick={salvar}>SALVAR</PrimaryButton>
            <GhostButton onClick={() => setEditId(null)}>Cancelar</GhostButton>
          </div>
        </Card>
      )}

      <Card className="!p-0 sm:!px-[18px]">
        {banners.map((b, i) => (
          <div key={b.id} className={`flex flex-wrap items-center gap-3 py-3.5 ${i < banners.length - 1 ? "border-b border-navy-dark/10" : ""}`}>
            <div className="h-10 w-16 shrink-0 rounded-[9px]" style={{ background: b.bg }} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-navy-dark">{b.titulo}</p>
              <p className="truncate text-xs font-semibold text-navy-dark/40">{b.link || "sem link"}</p>
            </div>
            <Toggle on={b.ativo} onClick={() => alternar(b.id, b.ativo)} />
            <button type="button" onClick={() => editar(b)} className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-navy-dark/5 text-navy-dark/60" title="Editar">
              <Icon name="pencil" size={13} />
            </button>
            <button type="button" onClick={() => excluir(b.id)} className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-red/10 text-red" title="Excluir">
              <Icon name="trash" size={13} />
            </button>
          </div>
        ))}
        {banners.length === 0 && <p className="py-6 text-center text-sm text-navy-dark/50">Nenhum banner cadastrado.</p>}
      </Card>
      <Toast message={toast} />
    </div>
  );
}
