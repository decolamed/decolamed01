"use client";
import { useState, useTransition } from "react";
import { PageHeader, Card } from "@/components/admin/card";
import { Icon } from "@/components/admin/icon";
import { Toggle, Toast, useToast, PrimaryButton, GhostButton, TextInput, FieldLabel } from "@/components/admin/interactive";
import { criarBotaoEstudos, atualizarBotaoEstudos, alternarAtivoBotaoEstudos, excluirBotaoEstudos } from "./actions";
import type { EstudosBotao, EstudosBotaoTipo } from "@/types/database";

const ICONES = ["book", "video", "file", "link2", "cards", "target", "note", "pencil", "flag", "bag", "bell", "trophy", "gift", "layers", "calendar", "gear"];

const TIPOS: { valor: EstudosBotaoTipo; label: string }[] = [
  { valor: "link", label: "Link (abre no navegador interno)" },
  { valor: "pdf", label: "PDF" },
  { valor: "aula", label: "Vídeo (abre no player integrado)" },
  { valor: "app", label: "Tela do app (interno)" }
];

const TELAS_APP = ["estudos", "questoes", "simulados", "flashcards", "copiloto", "redacao", "plano", "ranking", "conquistas", "perfil"];

export function EstudosBotoesManager({
  botoes: inicial,
  cursos
}: {
  botoes: EstudosBotao[];
  /** Planos ativos — a mesma lista que define o curso do aluno. */
  cursos: { id: string; nome: string }[];
}) {
  const [botoes, setBotoes] = useState(inicial);
  const [titulo, setTitulo] = useState("");
  const [icone, setIcone] = useState("book");
  const [tipo, setTipo] = useState<EstudosBotaoTipo>("link");
  const [link, setLink] = useState("");
  // "" = todos os cursos. O material antigo continua com null no banco e cai
  // aqui como "", que é exatamente o comportamento que ele já tinha.
  const [planoId, setPlanoId] = useState("");
  // Preenchido = o cartão da esquerda vira "editar", mesmo padrão das
  // outras telas de conteúdo.
  const [editId, setEditId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { toast, show } = useToast();

  function limpar() {
    setEditId(null);
    setTitulo("");
    setLink("");
    setIcone("book");
    setTipo("link");
    setPlanoId("");
  }

  function editar(b: EstudosBotao) {
    setEditId(b.id);
    setTitulo(b.titulo);
    setIcone(b.icone);
    setTipo(b.tipo);
    setLink(b.link);
    setPlanoId(b.plano_id ?? "");
  }

  function salvar() {
    startTransition(async () => {
      if (editId) {
        const res = await atualizarBotaoEstudos(editId, titulo, icone, tipo, link, planoId || null).catch(() => ({ ok: false, erro: undefined }));
        if (!res.ok) { show(res.erro ?? "Não foi possível salvar."); return; }
        setBotoes((a) => a.map((x) => (x.id === editId ? { ...x, titulo, icone, tipo, link, plano_id: planoId || null } : x)));
        limpar();
        show("Botão atualizado.");
        return;
      }
      const res = await criarBotaoEstudos(titulo, icone, tipo, link, planoId || null).catch(() => ({ ok: false, erro: undefined }));
      if (!res.ok) { show(res.erro ?? "Erro."); return; }
      setBotoes((a) => [{ id: crypto.randomUUID(), titulo, icone, tipo, link, ordem: 0, ativo: true, plano_id: planoId || null, criado_por: null, created_at: "", updated_at: "" }, ...a]);
      limpar();
      show("Botão adicionado.");
    });
  }

  // A troca é otimista (a lista muda antes da resposta do servidor). Se a
  // gravação falhar, desfaz e avisa — senão o admin ficaria com uma tela
  // dizendo "inativo" enquanto o item continua aparecendo para o aluno.
  function alternar(id: string, ativo: boolean) {
    const trocar = (valor: boolean) => setBotoes((a) => a.map((x) => (x.id === id ? { ...x, ativo: valor } : x)));
    trocar(!ativo);
    startTransition(async () => {
      // .catch aqui não é decoração: uma Server Action que rejeita (rede fora,
      // servidor reiniciando) vira exceção não tratada e derruba a tela inteira,
      // em vez de só falhar o botão. Verificado no navegador.
      const res = await alternarAtivoBotaoEstudos(id, ativo).catch(() => ({ ok: false }));
      if (!res.ok) {
        trocar(ativo);
        show("Não foi possível atualizar o botão. Tente de novo.");
      }
    });
  }

  function excluir(id: string) {
    startTransition(async () => {
      const res = await excluirBotaoEstudos(id);
      if (res.ok) {
        setBotoes((a) => a.filter((x) => x.id !== id));
        show("Botão removido.");
      }
    });
  }

  return (
    <div>
      <PageHeader title="Botões da aba Estudos" subtitle="Atalhos personalizados que aparecem pro aluno em Estudos, sem precisar alterar código" />
      <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <h2 className="text-sm font-extrabold text-navy-dark">{editId ? "Editar botão" : "Adicionar botão"}</h2>
          <FieldLabel>Nome</FieldLabel>
          <TextInput value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Bagagem Essencial" />
          <FieldLabel>Ícone</FieldLabel>
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
            {ICONES.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcone(ic)}
                className={`flex h-9 w-9 items-center justify-center rounded-[9px] ${icone === ic ? "bg-orange text-white" : "bg-navy-dark/5 text-navy-dark/60"}`}
                title={ic}
              >
                <Icon name={ic} size={15} />
              </button>
            ))}
          </div>
          <FieldLabel>Tipo</FieldLabel>
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as EstudosBotaoTipo);
              setLink("");
            }}
            className="w-full rounded-[10px] border border-navy-dark/15 bg-white px-3 py-2.5 text-xs font-semibold text-navy-dark outline-none focus:border-navy"
          >
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.label}
              </option>
            ))}
          </select>
          <FieldLabel>Exibir para</FieldLabel>
          <select
            value={planoId}
            onChange={(e) => setPlanoId(e.target.value)}
            className="w-full rounded-[10px] border border-navy-dark/15 bg-white px-3 py-2.5 text-xs font-semibold text-navy-dark outline-none focus:border-navy"
          >
            <option value="">Todos os cursos</option>
            {cursos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <FieldLabel>{tipo === "app" ? "Tela do app" : "Link"}</FieldLabel>
          {tipo === "app" ? (
            <select
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full rounded-[10px] border border-navy-dark/15 bg-white px-3 py-2.5 text-xs font-semibold text-navy-dark outline-none focus:border-navy"
            >
              <option value="">Selecione...</option>
              {TELAS_APP.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          ) : (
            <TextInput value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
          )}
          {editId && (
            <GhostButton onClick={limpar} className="mt-4 mr-2">Cancelar</GhostButton>
          )}
          <PrimaryButton onClick={salvar} className="mt-4">
            {editId ? "SALVAR ALTERAÇÕES" : "ADICIONAR BOTÃO"}
          </PrimaryButton>
        </Card>
        <Card className="!p-0 sm:!px-[18px]">
          {botoes.map((b, i) => (
            <div key={b.id} className={`flex items-center gap-3 py-3.5 ${i < botoes.length - 1 ? "border-b border-navy-dark/10" : ""}`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-blue-soft text-navy-dark">
                <Icon name={b.icone} size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-navy-dark">{b.titulo}</p>
                <p className="truncate text-xs font-semibold text-navy-dark/40">
                  {TIPOS.find((t) => t.valor === b.tipo)?.label} · {b.link}
                  {" · "}
                  {b.plano_id ? (cursos.find((c) => c.id === b.plano_id)?.nome ?? "Curso removido") : "Todos os cursos"}
                </p>
              </div>
              <Toggle on={b.ativo} onClick={() => alternar(b.id, b.ativo)} />
              <button type="button" onClick={() => editar(b)} className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-navy-dark/5 text-navy-dark/60" title="Editar">
                <Icon name="pencil" size={14} />
              </button>
              <button type="button" onClick={() => excluir(b.id)} className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-red/10 text-red" title="Excluir">
                <Icon name="trash" size={14} />
              </button>
            </div>
          ))}
          {botoes.length === 0 && <p className="py-6 text-center text-sm text-navy-dark/50">Nenhum botão personalizado cadastrado.</p>}
        </Card>
      </div>
      <Toast message={toast} />
    </div>
  );
}
