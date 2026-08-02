"use client";
import { useState, useMemo, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Toggle, Toast, useToast, PrimaryButton, GhostButton, TextArea, TextInput, FieldLabel } from "@/components/admin/interactive";
import { buscarInfoYoutube, type AulaYoutubeInfo } from "@/lib/importacao/youtube";
import { criarConteudo, criarConteudosEmLote, atualizarConteudo, alternarAtivoConteudo, excluirConteudo, atualizarTitulosGenericos } from "./actions";
import { normalizar } from "@/lib/trilha/catalogo";

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
  // Preenchido = o cartão de cadastro vira "editar".
  const [editId, setEditId] = useState<string | null>(null);
  const [duracao, setDuracao] = useState("30");
  const [, startTransition] = useTransition();
  const { toast, show } = useToast();

  // Busca e filtros. Com 253 aulas migradas do cronograma, rolar a lista
  // agrupada por matéria deixou de ser uma forma viável de achar uma aula.
  const [busca, setBusca] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("");
  const [filtroAssunto, setFiltroAssunto] = useState("");

  const [corrigindoTitulos, setCorrigindoTitulos] = useState(false);
  const [progressoTitulos, setProgressoTitulos] = useState("");

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

  // Chama a ação repetidamente porque cada rodada corrige um lote — ver o
  // comentário em atualizarTitulosGenericos(). O router.refresh no fim traz
  // os títulos novos; até lá o progresso vai aparecendo na tela.
  async function corrigirTitulos() {
    setCorrigindoTitulos(true);
    let total = 0;
    let falhas = 0;
    try {
      for (let volta = 0; volta < 40; volta++) {
        const r = await atualizarTitulosGenericos(25).catch(() => null);
        if (!r || !r.ok) { show("Não foi possível buscar os títulos agora."); break; }
        total += r.atualizados;
        falhas += r.semTitulo;
        setProgressoTitulos(`${total} corrigido(s)${r.restantes ? ` · ${r.restantes} restantes` : ""}`);
        // Nem só "restantes === 0" encerra: se um lote inteiro falhar
        // (vídeo removido, rede fora), insistir repetiria o mesmo erro para
        // sempre em vez de parar e informar.
        if (r.restantes === 0 || r.atualizados === 0) break;
      }
      show(`${total} título(s) atualizado(s)${falhas ? ` · ${falhas} sem título disponível` : ""}.`);
      if (total > 0) window.location.reload();
    } finally {
      setCorrigindoTitulos(false);
      setProgressoTitulos("");
    }
  }

  function limpar() {
    setEditId(null);
    setTitulo("");
    setUrl("");
    setAssunto("");
  }

  function editar(a: any) {
    setEditId(a.id);
    setTitulo(a.titulo);
    setMateria(a.materia);
    setAssunto(a.assunto ?? "");
    setUrl(a.url ?? "");
    setDuracao(String(a.duracao_minutos ?? 30));
  }

  function salvar() {
    startTransition(async () => {
      const min = Number(duracao) || 30;
      if (editId) {
        const res = await atualizarConteudo(editId, titulo, materia, assunto, url, min).catch(() => ({ ok: false, erro: undefined }));
        if (!res.ok) { show(res.erro ?? "Não foi possível salvar."); return; }
        setAulas((a) => a.map((x) => (x.id === editId ? { ...x, titulo, materia, assunto, url, duracao_minutos: min } : x)));
        limpar();
        show("Aula atualizada.");
        return;
      }
      const res = await criarConteudo("aula", titulo, materia, assunto, url, min).catch(() => ({ ok: false, erro: undefined }));
      if (!res.ok) { show(res.erro ?? "Erro."); return; }
      setAulas((a) => [{ id: crypto.randomUUID(), titulo, materia, assunto, url, duracao_minutos: min, ativo: true }, ...a]);
      limpar();
      show("Aula adicionada.");
    });
  }

  // A troca é otimista (a lista muda antes da resposta do servidor). Se a
  // gravação falhar, desfaz e avisa — senão o admin ficaria com uma tela
  // dizendo "inativo" enquanto o item continua aparecendo para o aluno.
  function alternar(id: string, ativo: boolean) {
    const trocar = (valor: boolean) => setAulas((a) => a.map((x) => (x.id === id ? { ...x, ativo: valor } : x)));
    trocar(!ativo);
    startTransition(async () => {
      // .catch aqui não é decoração: uma Server Action que rejeita (rede fora,
      // servidor reiniciando) vira exceção não tratada e derruba a tela inteira,
      // em vez de só falhar o botão. Verificado no navegador.
      const res = await alternarAtivoConteudo(id, ativo).catch(() => ({ ok: false }));
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
  // Aulas que vieram da importação com nome de posição em vez de nome de
  // conteúdo. Enquanto existirem, a busca por assunto não acha nada.
  const genericas = aulas.filter((a) => /^Aula \d+$/.test(a.titulo)).length;
  // Assuntos disponíveis acompanham a matéria escolhida — oferecer assunto de
  // Química com Biologia filtrada só produziria combinações vazias.
  const assuntos = Array.from(
    new Set(
      aulas
        .filter((a) => !filtroMateria || a.materia === filtroMateria)
        .map((a) => a.assunto)
        .filter(Boolean)
    )
  ).sort() as string[];

  const aulasFiltradas = useMemo(() => {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    return aulas.filter((a) => {
      if (filtroMateria && a.materia !== filtroMateria) return false;
      if (filtroAssunto && a.assunto !== filtroAssunto) return false;
      if (termos.length === 0) return true;
      // Título, matéria, assunto e URL — quem procura por "mitose" e quem
      // cola um link do YouTube para conferir se já está cadastrado precisam
      // dos dois caminhos.
      const alvo = normalizar([a.titulo, a.materia, a.assunto ?? "", a.url ?? ""].join(" "));
      return termos.every((t) => alvo.includes(t));
    });
  }, [aulas, busca, filtroMateria, filtroAssunto]);

  const materiasVisiveis = Array.from(new Set(aulasFiltradas.map((a) => a.materia))).sort();
  const filtrando = Boolean(busca.trim() || filtroMateria || filtroAssunto);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Cursos & Aulas" subtitle="Videoaulas cadastradas na Biblioteca — usadas pelo Cronograma e pelo Copiloto" />
        <div className="flex flex-wrap gap-2">
          {genericas > 0 && (
            <GhostButton onClick={corrigirTitulos} className={corrigindoTitulos ? "opacity-60" : ""}>
              {corrigindoTitulos ? progressoTitulos || "Buscando títulos…" : `🔎 Corrigir ${genericas} título(s) genérico(s)`}
            </GhostButton>
          )}
          <GhostButton onClick={() => setImportando((v) => !v)}>{importando ? "Fechar importação" : "Importar do YouTube"}</GhostButton>
        </div>
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
          <h2 className="text-sm font-extrabold text-navy-dark">{editId ? "Editar aula" : "Adicionar aula"}</h2>
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
          <div className="mt-4 flex gap-2">
            <PrimaryButton onClick={salvar}>{editId ? "SALVAR ALTERAÇÕES" : "ADICIONAR AULA"}</PrimaryButton>
            {editId && <GhostButton onClick={limpar}>Cancelar</GhostButton>}
          </div>
        </Card>

        <Card className="!p-0 sm:!px-[18px]">
          <div className="sticky top-0 z-10 -mx-[18px] space-y-2 border-b border-navy-dark/10 bg-white px-[18px] py-3">
            <div className="flex items-center gap-2 rounded-[10px] border border-navy-dark/15 px-2.5 py-2">
              <Icon name="search" size={14} className="shrink-0 text-navy-dark/40" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por título, assunto, matéria ou link"
                className="min-w-0 flex-1 text-xs font-semibold text-navy-dark outline-none"
              />
              {busca && (
                <button type="button" onClick={() => setBusca("")} className="shrink-0 text-navy-dark/40 hover:text-navy-dark" title="Limpar">
                  <Icon name="x" size={12} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <select
                value={filtroMateria}
                onChange={(e) => { setFiltroMateria(e.target.value); setFiltroAssunto(""); }}
                className="rounded-[9px] border border-navy-dark/15 px-2 py-1.5 text-[11px] font-bold text-navy-dark"
              >
                <option value="">Todas as matérias</option>
                {materias.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select
                value={filtroAssunto}
                onChange={(e) => setFiltroAssunto(e.target.value)}
                disabled={assuntos.length === 0}
                className="rounded-[9px] border border-navy-dark/15 px-2 py-1.5 text-[11px] font-bold text-navy-dark disabled:opacity-40"
              >
                <option value="">Todos os assuntos</option>
                {assuntos.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              {filtrando && (
                <button
                  type="button"
                  onClick={() => { setBusca(""); setFiltroMateria(""); setFiltroAssunto(""); }}
                  className="rounded-[9px] border border-navy-dark/15 px-2.5 py-1.5 text-[11px] font-extrabold text-navy-dark/60"
                >
                  Limpar filtros
                </button>
              )}
              <span className="ml-auto text-[11px] font-bold text-navy-dark/45">
                {aulasFiltradas.length} de {aulas.length}
              </span>
            </div>
          </div>

          {aulas.length === 0 && <p className="py-6 text-center text-sm text-navy-dark/50">Nenhuma aula cadastrada ainda.</p>}
          {aulas.length > 0 && aulasFiltradas.length === 0 && (
            <p className="py-6 text-center text-sm text-navy-dark/50">Nenhuma aula corresponde à busca.</p>
          )}
          {materiasVisiveis.map((mat) => (
            <div key={mat}>
              <p className="mt-3 px-0 text-[10px] font-extrabold uppercase tracking-widest text-navy-dark/40">{mat}</p>
              {aulasFiltradas.filter((a) => a.materia === mat).map((a, i, arr) => (
                <div key={a.id} className={`flex flex-wrap items-center gap-3 py-3 ${i < arr.length - 1 ? "border-b border-navy-dark/10" : ""}`}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-navy/10 text-navy-dark">
                    <Icon name="video" size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-navy-dark">{a.titulo}</p>
                    <p className="text-xs font-semibold text-navy-dark/40">{a.assunto ? `${a.assunto} · ` : ""}{a.duracao_minutos} min</p>
                  </div>
                  <Toggle on={a.ativo} onClick={() => alternar(a.id, a.ativo)} />
                  <button type="button" onClick={() => editar(a)} className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-navy-dark/5 text-navy-dark/60" title="Editar">
                    <Icon name="pencil" size={14} />
                  </button>
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
