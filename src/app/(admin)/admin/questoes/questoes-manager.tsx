"use client";

import { useRef, useState, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Chip, Toast, useToast, PrimaryButton, GhostButton, TextInput, TextArea, FieldLabel } from "@/components/admin/interactive";
import { ImportadorTexto } from "@/components/admin/importador-texto";
import { parseQuestoesTexto, type QuestaoParseada } from "@/lib/importacao/parse-questoes";
import { ROTULO_MODALIDADE, rotuloModalidade } from "@/lib/site/filtro-questoes";
import { materiaCanonica } from "@/lib/site/materia-canonica";
import { salvarQuestao, salvarQuestoesEmLote, excluirQuestao, alternarAtivoQuestao, type QuestaoForm } from "./actions";
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
  alternativas: { a: "", b: "", c: "", d: "", e: "" },
  imagens: [],
  provaNome: "",
  ano: "",
  semestre: "",
  modalidade: "",
  numeroQuestao: "",
  anulada: false
};

function codigo(id: string) {
  return "Q" + id.slice(0, 6).toUpperCase();
}

export function QuestoesManager({
  questoes,
  materiasExistentes,
  usoPorQuestao,
  nomeVestibular
}: {
  questoes: Questao[];
  materiasExistentes: string[];
  usoPorQuestao: Record<string, { tipo: "Simulado" | "Atividade"; titulo: string }[]>;
  // Vem de `configuracoes` (site.marca.vestibular) — ver lib/site/marca.ts.
  // O nome da instituição não pode estar escrito no código porque a mesma
  // plataforma atende outros processos seletivos.
  nomeVestibular: string;
}) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todas");
  const [filtroProva, setFiltroProva] = useState("Todas");
  const [filtroAno, setFiltroAno] = useState("Todos");
  const [filtroAssunto, setFiltroAssunto] = useState("Todos");
  const [editId, setEditId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  // Sobrescreve `ativo` só até o servidor confirmar (a lista vem por props).
  const [listaLocal, setListaLocal] = useState<Record<string, boolean>>({});
  const [novaImagem, setNovaImagem] = useState("");
  const [novaLegenda, setNovaLegenda] = useState("");
  const [draft, setDraft] = useState<QuestaoForm>(VAZIO);
  const [pending, startTransition] = useTransition();
  const { toast, show } = useToast();

  const [importando, setImportando] = useState(false);
  const [previa, setPrevia] = useState<QuestaoParseada[] | null>(null);
  const [materiaLote, setMateriaLote] = useState("Biologia");
  const [dificuldadeLote, setDificuldadeLote] = useState<"Fácil" | "Média" | "Difícil">("Média");

  function analisarTexto(texto: string) {
    setPrevia(parseQuestoesTexto(texto));
  }

  function importarLote() {
    if (!previa) return;
    const validas = previa.filter((p) => !p.erro);
    const forms: QuestaoForm[] = validas.map((p) => {
      const alternativas: Record<string, string> = {};
      p.alternativas.forEach((a) => (alternativas[a.letra] = a.texto));
      return {
        enunciado: p.enunciado,
        materia: materiaLote,
        assunto: "",
        dificuldade: dificuldadeLote,
        gabarito: p.gabarito ?? "a",
        comentario: "",
        fonte: "",
        alternativas
      };
    });
    startTransition(async () => {
      const res = await salvarQuestoesEmLote(forms);
      show(`${res.sucesso} questão(ões) importada(s)${res.falha ? `, ${res.falha} falharam` : ""}.`);
      setPrevia(null);
      setImportando(false);
    });
  }

  const materias = ["Todas", ...materiasExistentes];

  // Contagem por matéria calculada a cada render sobre a lista vinda do
  // banco. É a mesma conta que o aluno vê no Banco de Questões — se as duas
  // divergirem, o problema está na consulta de um dos lados, não aqui.
  const totalAtivas = questoes.filter((q) => q.ativo).length;
  const contagemPorMateria = new Map<string, number>();
  questoes.forEach((q) => {
    const nome = materiaCanonica(q.materia);
    if (nome) contagemPorMateria.set(nome, (contagemPorMateria.get(nome) ?? 0) + 1);
  });

  // Opções de filtro derivadas das próprias questões — nada fixo no código:
  // conforme o admin importa provas novas, elas aparecem aqui sozinhas.
  const opcoes = (campo: (q: Questao) => string | null | undefined) =>
    Array.from(new Set(questoes.map((q) => (campo(q) ?? "").toString().trim()).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "pt-BR", { numeric: true })
    );
  const provas = opcoes((q) => q.prova_nome);
  const anos = opcoes((q) => (q.ano != null ? String(q.ano) : null)).reverse();
  const assuntos = opcoes((q) => q.assunto);

  const termo = busca.trim().toLowerCase();
  const lista = questoes.filter((q) => {
    if (filtro !== "Todas" && q.materia !== filtro) return false;
    if (filtroProva !== "Todas" && (q.prova_nome ?? "") !== filtroProva) return false;
    if (filtroAno !== "Todos" && String(q.ano ?? "") !== filtroAno) return false;
    if (filtroAssunto !== "Todos" && (q.assunto ?? "") !== filtroAssunto) return false;
    if (!termo) return true;
    // A busca cobre o que o admin realmente usa para achar uma questão:
    // código curto, id completo, número na prova, enunciado e identificação
    // da prova.
    const alvo = [
      codigo(q.id),
      q.id,
      q.enunciado,
      q.materia,
      q.assunto ?? "",
      q.prova_nome ?? "",
      q.modalidade ?? "",
      q.fonte ?? "",
      q.ano != null ? String(q.ano) : "",
      q.numero_questao != null ? String(q.numero_questao) : ""
    ]
      .join(" ")
      .toLowerCase();
    return alvo.includes(termo);
  });
  const temFiltro = filtro !== "Todas" || filtroProva !== "Todas" || filtroAno !== "Todos" || filtroAssunto !== "Todos" || !!termo;

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
      alternativas: alt,
      imagens: (q.imagens ?? [])
        .slice()
        .sort((a, b) => a.ordem - b.ordem)
        .map((img) => ({ url: img.url, legenda: img.legenda })),
      provaNome: q.prova_nome ?? "",
      ano: q.ano != null ? String(q.ano) : "",
      semestre: q.semestre != null ? String(q.semestre) : "",
      modalidade: q.modalidade ?? "",
      numeroQuestao: q.numero_questao != null ? String(q.numero_questao) : "",
      anulada: q.anulada ?? false
    });
    // Em telas menores que `lg` o grid vira uma coluna só e o formulário
    // fica abaixo da lista inteira — com centenas de questões, clicar no
    // lápis parecia não fazer nada, porque o formulário preenchido estava
    // longe demais para aparecer. Levar o admin até ele é parte do botão
    // cumprir o que promete.
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function limpar() {
    setEditId(null);
    setDraft(VAZIO);
    setNovaImagem("");
    setNovaLegenda("");
  }

  const imagens = draft.imagens ?? [];

  function adicionarImagem() {
    const url = novaImagem.trim();
    if (!url) return;
    setDraft({ ...draft, imagens: [...imagens, { url, legenda: novaLegenda.trim() || null }] });
    setNovaImagem("");
    setNovaLegenda("");
  }

  function removerImagem(indice: number) {
    setDraft({ ...draft, imagens: imagens.filter((_, i) => i !== indice) });
  }

  // A ordem de exibição para o aluno é a ordem desta lista (a action grava
  // `ordem` pela posição), então mover para cima/baixo é o que permite
  // corrigir a sequência de um enunciado com vários trechos de prova.
  function moverImagem(indice: number, direcao: -1 | 1) {
    const destino = indice + direcao;
    if (destino < 0 || destino >= imagens.length) return;
    const novas = imagens.slice();
    [novas[indice], novas[destino]] = [novas[destino], novas[indice]];
    setDraft({ ...draft, imagens: novas });
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

  // Troca otimista com desfazer, como nas outras telas de conteúdo.
  function alternarAtivo(q: Questao) {
    const trocar = (valor: boolean) => setListaLocal((a) => ({ ...a, [q.id]: valor }));
    trocar(!q.ativo);
    startTransition(async () => {
      // .catch aqui não é decoração: uma Server Action que rejeita (rede fora,
      // servidor reiniciando) vira exceção não tratada e derruba a tela inteira,
      // em vez de só falhar o botão. Verificado no navegador.
      const res = await alternarAtivoQuestao(q.id, q.ativo).catch(() => ({ ok: false }));
      if (!res.ok) {
        trocar(q.ativo);
        show("Não foi possível alterar a situação da questão. Tente de novo.");
      }
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Banco de Questões"
          subtitle={
            questoes.length === 0
              ? `Nenhuma questão cadastrada — crie ou importe questões da matriz do ${nomeVestibular}`
              : `${questoes.length} questão${questoes.length === 1 ? "" : "ões"} cadastrada${questoes.length === 1 ? "" : "s"}` +
                (totalAtivas === questoes.length ? "" : ` · ${totalAtivas} ativa${totalAtivas === 1 ? "" : "s"}`) +
                ` · matriz do ${nomeVestibular}`
          }
        />
        <GhostButton onClick={() => setImportando((v) => !v)}>{importando ? "Fechar importação" : "Importar em massa"}</GhostButton>
      </div>

      {questoes.length > 0 && (
        <Card className="mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-navy-dark/40">Por matéria</h2>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
            {Array.from(contagemPorMateria.entries())
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
          <h2 className="text-sm font-extrabold text-navy-dark">Importar questões em massa</h2>
          <p className="mt-1 text-xs text-navy-dark/50">
            Cole o texto (ou envie um PDF) com uma questão por bloco, alternativas com letra e o gabarito indicado
            (ex.: &quot;Gabarito: B&quot;). Você revisa tudo antes de importar de verdade.
          </p>
          <div className="mt-3">
            <ImportadorTexto
              onAnalisar={analisarTexto}
              placeholder={"1) Qual organela é responsável pela respiração celular?\na) Complexo de Golgi\nb) Mitocôndria\nc) Ribossomo\nGabarito: B"}
            />
          </div>

          {previa && (
            <div className="mt-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-navy-dark">Aplicar a todas:</span>
                <TextInput value={materiaLote} onChange={(e) => setMateriaLote(e.target.value)} placeholder="Matéria" className="!w-40" />
                <div className="flex gap-1">
                  {(["Fácil", "Média", "Difícil"] as const).map((n) => (
                    <Chip key={n} active={dificuldadeLote === n} onClick={() => setDificuldadeLote(n)}>{n}</Chip>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {previa.map((p, i) => (
                  <div key={i} className={`rounded-xl border p-3 text-xs ${p.erro ? "border-red/30 bg-red/5" : "border-green/30 bg-green/5"}`}>
                    <p className="font-semibold text-navy-dark">{p.enunciado || "(sem enunciado)"}</p>
                    {p.alternativas.length > 0 && (
                      <p className="mt-1 text-navy-dark/60">
                        {p.alternativas.map((a) => `${a.letra.toUpperCase()}) ${a.texto}`).join(" · ")}
                      </p>
                    )}
                    <p className={`mt-1 font-bold ${p.erro ? "text-red" : "text-green-700"}`}>
                      {p.erro ?? `OK · Gabarito ${p.gabarito?.toUpperCase()}`}
                    </p>
                  </div>
                ))}
                {previa.length === 0 && <p className="text-xs text-navy-dark/50">Nenhum bloco reconhecido nesse texto.</p>}
              </div>
              <PrimaryButton onClick={importarLote} className={`mt-3 ${pending ? "opacity-60" : ""}`}>
                {pending ? "Importando..." : `Importar ${previa.filter((p) => !p.erro).length} questão(ões) válida(s)`}
              </PrimaryButton>
            </div>
          )}
        </Card>
      )}

      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Card className="mb-3">
            <TextInput
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por código, ID, nº da questão, prova ou enunciado..."
              className="mb-3"
            />
            <div className="mb-2 flex flex-wrap gap-2">
              {materias.map((m) => (
                <Chip key={m} active={filtro === m} onClick={() => setFiltro(m)}>{m}</Chip>
              ))}
            </div>
            {(provas.length > 0 || anos.length > 0 || assuntos.length > 0) && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {provas.length > 0 && (
                  <select
                    value={filtroProva}
                    onChange={(e) => setFiltroProva(e.target.value)}
                    className="rounded-[10px] border border-navy-dark/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy-dark outline-none focus:border-navy"
                  >
                    <option value="Todas">Todas as provas</option>
                    {provas.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                )}
                {anos.length > 0 && (
                  <select
                    value={filtroAno}
                    onChange={(e) => setFiltroAno(e.target.value)}
                    className="rounded-[10px] border border-navy-dark/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy-dark outline-none focus:border-navy"
                  >
                    <option value="Todos">Todos os anos</option>
                    {anos.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                )}
                {assuntos.length > 0 && (
                  <select
                    value={filtroAssunto}
                    onChange={(e) => setFiltroAssunto(e.target.value)}
                    className="rounded-[10px] border border-navy-dark/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy-dark outline-none focus:border-navy"
                  >
                    <option value="Todos">Todos os assuntos</option>
                    {assuntos.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                )}
                <span className="text-xs font-semibold text-navy-dark/50">
                  {lista.length} de {questoes.length}
                </span>
                {temFiltro && (
                  <button
                    type="button"
                    onClick={() => { setBusca(""); setFiltro("Todas"); setFiltroProva("Todas"); setFiltroAno("Todos"); setFiltroAssunto("Todos"); }}
                    className="text-xs font-semibold text-navy-dark/50 underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
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
                    {/* Prova de origem no mesmo padrão visual das outras
                        etiquetas — é o que permite bater o olho e saber de
                        onde a questão veio, sem abrir a edição. */}
                    {(q.prova_nome || q.ano) && (
                      <span className="rounded-full bg-navy/10 px-2.5 py-1 text-[10px] font-extrabold text-navy">
                        {[q.prova_nome, q.ano ? `${q.ano}${q.semestre ? `.${q.semestre}` : ""}` : null, rotuloModalidade(q.modalidade)]
                          .filter(Boolean)
                          .join(" ")}
                        {q.numero_questao != null ? ` · Q${q.numero_questao}` : ""}
                      </span>
                    )}
                    {q.anulada && (
                      <span className="rounded-full bg-red/10 px-2.5 py-1 text-[10px] font-extrabold text-red">Anulada</span>
                    )}
                    {!(listaLocal[q.id] ?? q.ativo) && (
                      <span className="rounded-full bg-red/10 px-2.5 py-1 text-[10px] font-extrabold text-red">Inativa</span>
                    )}
                    {q.imagens?.length > 0 && (
                      <span className="rounded-full bg-navy/10 px-2.5 py-1 text-[10px] font-extrabold text-navy">
                        🖼️ {q.imagens.length}
                      </span>
                    )}
                    <div className="flex-1" />
                    <button type="button" onClick={() => editar(q)} className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-navy-dark/5 text-navy-dark/60" title="Editar">
                      <Icon name="pencil" size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => alternarAtivo({ ...q, ativo: listaLocal[q.id] ?? q.ativo })}
                      className="rounded-[8px] bg-navy-dark/5 px-2 py-1 text-[10px] font-extrabold text-navy-dark/60"
                      title={(listaLocal[q.id] ?? q.ativo) ? "Tirar do ar (sem excluir)" : "Voltar a exibir para os alunos"}
                    >
                      {(listaLocal[q.id] ?? q.ativo) ? "Desativar" : "Ativar"}
                    </button>
                    <button type="button" onClick={() => excluir(q.id)} className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-red/10 text-red" title="Excluir">
                      <Icon name="trash" size={12} />
                    </button>
                  </div>
                  {(usoPorQuestao[q.id]?.length ?? 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 border-t border-navy-dark/10 pt-2">
                      <span className="text-[10px] font-bold text-navy-dark/40">Usada em:</span>
                      {usoPorQuestao[q.id].map((u, i) => (
                        <span key={i} className="rounded-full bg-navy-dark/5 px-2 py-0.5 text-[10px] font-bold text-navy-dark/60">
                          {u.tipo} · {u.titulo}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {lista.length === 0 && <p className="py-4 text-center text-sm text-navy-dark/50">Nenhuma questão encontrada.</p>}
            </div>
          </Card>
        </div>

        <div ref={formRef} className="h-fit scroll-mt-4">
        <Card className="h-fit">
          <h2 className="text-sm font-extrabold text-navy-dark">{editId ? "Editar questão" : "Nova questão"}</h2>
          <FieldLabel>Enunciado</FieldLabel>
          <TextArea rows={3} value={draft.enunciado} onChange={(e) => setDraft({ ...draft, enunciado: e.target.value })} placeholder="Digite o enunciado..." />
          <FieldLabel>Matéria</FieldLabel>
          <TextInput value={draft.materia} onChange={(e) => setDraft({ ...draft, materia: e.target.value })} placeholder="Biologia" />
          <FieldLabel>{`Assunto (matriz do ${nomeVestibular})`}</FieldLabel>
          <TextInput value={draft.assunto} onChange={(e) => setDraft({ ...draft, assunto: e.target.value })} placeholder="Ex.: Sistema Digestório" />
          <FieldLabel>Origem (texto livre, opcional)</FieldLabel>
          <TextInput value={draft.fonte ?? ""} onChange={(e) => setDraft({ ...draft, fonte: e.target.value })} placeholder={`Ex.: ${nomeVestibular} 2024 · 1ª fase`} />

          <FieldLabel>Prova de origem</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            <TextInput value={draft.provaNome ?? ""} onChange={(e) => setDraft({ ...draft, provaNome: e.target.value })} placeholder={`Prova (ex.: ${nomeVestibular})`} />
            {/* Lista fechada porque o banco tem CHECK em ampla/peba: digitar
                qualquer outra coisa aqui devolveria um erro cru do Postgres. */}
            <select
              value={draft.modalidade ?? ""}
              onChange={(e) => setDraft({ ...draft, modalidade: e.target.value })}
              className="w-full rounded-[10px] border border-navy-dark/15 px-3 py-2 text-xs font-semibold text-navy-dark outline-none"
            >
              <option value="">Modalidade (opcional)</option>
              {Object.entries(ROTULO_MODALIDADE).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
            <TextInput type="number" value={draft.ano ?? ""} onChange={(e) => setDraft({ ...draft, ano: e.target.value })} placeholder="Ano (2025)" />
            <TextInput value={draft.semestre ?? ""} onChange={(e) => setDraft({ ...draft, semestre: e.target.value })} placeholder="Semestre (1 ou 2)" />
            <TextInput type="number" value={draft.numeroQuestao ?? ""} onChange={(e) => setDraft({ ...draft, numeroQuestao: e.target.value })} placeholder="Nº da questão" />
            <label className="flex items-center gap-2 px-1 text-xs font-semibold text-navy-dark">
              <input type="checkbox" checked={draft.anulada ?? false} onChange={(e) => setDraft({ ...draft, anulada: e.target.checked })} />
              Questão anulada
            </label>
          </div>

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

          <FieldLabel>Imagens da questão</FieldLabel>
          {imagens.length === 0 ? (
            <p className="text-xs text-navy-dark/50">Nenhuma imagem. Questões de gráfico, mapa ou trecho de prova precisam de pelo menos uma.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {imagens.map((img, i) => (
                <div key={img.url + i} className="flex items-center gap-2 rounded-[10px] border border-navy-dark/10 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.legenda ?? `Imagem ${i + 1}`} className="h-12 w-12 shrink-0 rounded-[6px] object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-navy-dark">{img.url}</p>
                    <TextInput
                      value={img.legenda ?? ""}
                      placeholder="Legenda (opcional)"
                      onChange={(e) => {
                        const novas = imagens.slice();
                        novas[i] = { ...novas[i], legenda: e.target.value };
                        setDraft({ ...draft, imagens: novas });
                      }}
                    />
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button type="button" onClick={() => moverImagem(i, -1)} disabled={i === 0} title="Mover para cima"
                      className="flex h-5 w-6 items-center justify-center rounded-[6px] bg-navy-dark/5 text-[10px] font-extrabold text-navy-dark/60 disabled:opacity-30">▲</button>
                    <button type="button" onClick={() => moverImagem(i, 1)} disabled={i === imagens.length - 1} title="Mover para baixo"
                      className="flex h-5 w-6 items-center justify-center rounded-[6px] bg-navy-dark/5 text-[10px] font-extrabold text-navy-dark/60 disabled:opacity-30">▼</button>
                  </div>
                  <button type="button" onClick={() => removerImagem(i)} title="Remover imagem"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-red/10 text-red">
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-col gap-1.5 rounded-[10px] bg-navy-dark/[0.03] p-2">
            <TextInput value={novaImagem} onChange={(e) => setNovaImagem(e.target.value)} placeholder="/questoes-facape/arquivo.png ou https://..." />
            <TextInput value={novaLegenda} onChange={(e) => setNovaLegenda(e.target.value)} placeholder="Legenda (opcional)" />
            <GhostButton onClick={adicionarImagem}>+ Adicionar imagem</GhostButton>
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
      </div>

      <Toast message={toast} />
    </div>
  );
}
