"use client";
import { useState, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Toggle, Toast, useToast, PrimaryButton, GhostButton, TextArea, TextInput, FieldLabel } from "@/components/admin/interactive";
import { buscarInfoYoutube, type AulaYoutubeInfo } from "@/lib/importacao/youtube";
import { criarConteudo, criarConteudosEmLote, alternarAtivoConteudo, excluirConteudo } from "./actions";

interface AulaYoutubePrevia extends AulaYoutubeInfo {
  materiaEditada: string;
  duracao: string;
}

export function CursosManager({ aulas: inicial }: { aulas: any[] }) {
  const [aulas, setAulas] = useState(inicial);
  const [titulo, setTitulo] = useState("");
  const [materia, setMateria] = useState("Biologia");
  const [assunto, setAssunto] = useState("");
  const [url, setUrl] = useState("");
  const [duracao, setDuracao] = useState("30");
  const [, startTransition] = useTransition();
  const { toast, show } = useToast();

  const [importando, setImportando] = useState(false);
  const [links, setLinks] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [previa, setPrevia] = useState<AulaYoutubePrevia[] | null>(null);
  const [salvandoLote, setSalvandoLote] = useState(false);

  async function buscarLinks() {
    const urls = links.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!urls.length) return;
    setBuscando(true);
    try {
      const infos = await buscarInfoYoutube(urls);
      setPrevia(infos.map((info) => ({ ...info, materiaEditada: info.materiaSugerida ?? "Biologia", duracao: "30" })));
    } finally {
      setBuscando(false);
    }
  }

  function atualizarPrevia(i: number, campo: "titulo" | "materiaEditada" | "duracao", valor: string) {
    setPrevia((atual) => atual?.map((p, idx) => (idx === i ? { ...p, [campo]: valor } : p)) ?? null);
  }

  async function importarLote() {
    if (!previa) return;
    const validas = previa.filter((p) => p.titulo && !p.erro);
    setSalvandoLote(true);
    try {
      const res = await criarConteudosEmLote(
        validas.map((p) => ({ titulo: p.titulo as string, materia: p.materiaEditada, assunto: null, url: p.url, duracao: Number(p.duracao) || 30 }))
      );
      show(`${res.sucesso} aula(s) importada(s)${res.falha ? `, ${res.falha} falharam` : ""}.`);
      setAulas((a) => [
        ...validas.map((p) => ({
          id: crypto.randomUUID(),
          titulo: p.titulo,
          materia: p.materiaEditada,
          assunto: null,
          url: p.url,
          duracao_minutos: Number(p.duracao) || 30,
          ativo: true
        })),
        ...a
      ]);
      setPrevia(null);
      setLinks("");
      setImportando(false);
    } finally {
      setSalvandoLote(false);
    }
  }

  function adicionar() {
    startTransition(async () => {
      const res = await criarConteudo("aula", titulo, materia, assunto, url, Number(duracao) || 30);
      if (!res.ok) { show(res.erro ?? "Erro."); return; }
      show("Aula adicionada.");
      setTitulo(""); setUrl(""); setAssunto("");
      setAulas((a) => [{ id: crypto.randomUUID(), titulo, materia, assunto, url, duracao_minutos: Number(duracao), ativo: true }, ...a]);
    });
  }

  // A troca é otimista (a lista muda antes da resposta do servidor). Se a
  // gravação falhar, desfaz e avisa — senão o admin ficaria com uma tela
  // dizendo "inativo" enquanto o item continua aparecendo para o aluno.
  function alternar(id: string, ativo: boolean) {
    const trocar = (valor: boolean) => setAulas((a) => a.map((x) => (x.id === id ? { ...x, ativo: valor } : x)));
    trocar(!ativo);
    startTransition(async () => {
      const res = await alternarAtivoConteudo(id, ativo);
      if (!res.ok) {
        trocar(ativo);
        show("Não foi possível atualizar a aula. Tente de novo.");
      }
    });
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Cursos & Aulas" subtitle="Videoaulas cadastradas na Biblioteca — usadas pelo Cronograma e pelo Copiloto" />
        <GhostButton onClick={() => setImportando((v) => !v)}>{importando ? "Fechar importação" : "Importar do YouTube"}</GhostButton>
      </div>

      {importando && (
        <Card className="mb-3">
          <h2 className="text-sm font-extrabold text-navy-dark">Importar aulas do YouTube em massa</h2>
          <p className="mt-1 text-xs text-navy-dark/50">
            Cole um link do YouTube por linha — o título vem automático e a matéria é sugerida (revise antes de
            importar).
          </p>
          <div className="mt-3">
            <TextArea rows={6} value={links} onChange={(e) => setLinks(e.target.value)} placeholder={"https://youtube.com/watch?v=...\nhttps://youtu.be/..."} />
            <PrimaryButton onClick={buscarLinks} className={`mt-2 ${buscando ? "opacity-60" : ""}`}>
              {buscando ? "Buscando..." : "Buscar informações"}
            </PrimaryButton>
          </div>

          {previa && (
            <div className="mt-4">
              <div className="flex flex-col gap-2">
                {previa.map((p, i) => (
                  <div key={i} className={`rounded-xl border p-3 text-xs ${p.erro ? "border-red/30 bg-red/5" : "border-green/30 bg-green/5"}`}>
                    {p.erro ? (
                      <p className="font-bold text-red">{p.erro} <span className="font-normal text-navy-dark/50">({p.url})</span></p>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <TextInput
                          value={p.titulo ?? ""}
                          onChange={(e) => atualizarPrevia(i, "titulo", e.target.value)}
                          className="!w-64 flex-1"
                        />
                        <TextInput
                          value={p.materiaEditada}
                          onChange={(e) => atualizarPrevia(i, "materiaEditada", e.target.value)}
                          className="!w-36"
                        />
                        <TextInput
                          type="number"
                          value={p.duracao}
                          onChange={(e) => atualizarPrevia(i, "duracao", e.target.value)}
                          className="!w-20"
                        />
                        <span className="text-navy-dark/40">min</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <PrimaryButton onClick={importarLote} className={`mt-3 ${salvandoLote ? "opacity-60" : ""}`}>
                {salvandoLote ? "Importando..." : `Importar ${previa.filter((p) => p.titulo && !p.erro).length} aula(s)`}
              </PrimaryButton>
            </div>
          )}
        </Card>
      )}

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
