"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { renderizar } from "@/lib/resumo/renderizar";
import { enviarMensagem } from "@/app/(app)/sp/[id]/acoes";
import type { AcaoSalva, Mensagem } from "@/types/banco";

interface Bolha {
  id: string;
  papel: "usuario" | "jarvis";
  conteudo: string;
  acoes: AcaoSalva[];
}

function RastroDasAcoes({ acoes }: { acoes: AcaoSalva[] }) {
  if (acoes.length === 0) return null;
  return (
    <ul className="mb-3 space-y-1 border-l-2 border-tinta-200 pl-3">
      {acoes.map((a, i) => (
        <li
          key={i}
          className={`text-xs ${a.erro ? "text-alerta-600" : "text-tinta-500"}`}
        >
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-tinta-400">
            {a.ferramenta.replace(/_/g, " ")}
          </span>{" "}
          {a.descricao}
        </li>
      ))}
    </ul>
  );
}

function Fala({ bolha }: { bolha: Bolha }) {
  if (bolha.papel === "usuario") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-tinta-950 px-4 py-2.5 text-sm leading-relaxed text-white">
          {bolha.conteudo}
        </div>
      </div>
    );
  }

  // A fala do Jarvis usa a MESMA gramática do resumo — ele escreve blocos,
  // grifos e citações também na conversa. A diferença é que aqui não há lista
  // de fontes no rodapé, então a citação abre o PubMed direto.
  const { html } = renderizar(bolha.conteudo, [], { citacaoAbrePubmed: true });

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ciano-600">Jarvis</p>
      <RastroDasAcoes acoes={bolha.acoes} />
      <div
        className="resumo resumo-conversa"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function Conversa({
  spId,
  iniciais,
  codigo
}: {
  spId: string;
  iniciais: Mensagem[];
  codigo: string;
}) {
  const router = useRouter();
  const [rascunho, setRascunho] = useState("");
  const [extras, setExtras] = useState<Bolha[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizando, iniciarTransicao] = useTransition();

  const precisaLimpar = useRef(false);
  const fim = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLTextAreaElement>(null);

  const bolhas: Bolha[] = [
    ...iniciais.map((m) => ({
      id: m.id,
      papel: m.papel,
      conteudo: m.conteudo,
      acoes: m.acoes ?? []
    })),
    ...extras
  ];

  // As bolhas locais só somem depois que o refresh do servidor terminou — se
  // sumissem antes, a mensagem piscaria para fora da tela e voltaria.
  useEffect(() => {
    if (!atualizando && precisaLimpar.current) {
      precisaLimpar.current = false;
      setExtras([]);
    }
  }, [atualizando]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [bolhas.length, enviando]);

  async function enviar() {
    const texto = rascunho.trim();
    if (!texto || enviando) return;

    setErro(null);
    setRascunho("");
    setEnviando(true);
    setExtras((atuais) => [
      ...atuais,
      { id: `local-${Date.now()}`, papel: "usuario", conteudo: texto, acoes: [] }
    ]);

    const resultado = await enviarMensagem(spId, texto);
    setEnviando(false);

    if (resultado.erro) {
      // Devolve o texto ao campo: o aluno acabou de escrever isso e não pode
      // perder o que digitou porque a API do modelo estava fora do ar.
      setErro(resultado.erro);
      setRascunho(texto);
      setExtras((atuais) => atuais.slice(0, -1));
      return;
    }

    setExtras((atuais) => [
      ...atuais,
      {
        id: `local-${Date.now()}-jarvis`,
        papel: "jarvis",
        conteudo: resultado.texto ?? "",
        acoes: resultado.acoes ?? []
      }
    ]);

    precisaLimpar.current = true;
    iniciarTransicao(() => router.refresh());
    campo.current?.focus();
  }

  return (
    <div className="flex h-[calc(100vh-11rem)] flex-col rounded-xl border border-tinta-200 bg-white">
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {bolhas.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-tinta-700">
              Começando a SP {codigo}.
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-tinta-500">
              Diga o que vocês vão estudar. Se você colou o enunciado, pode pedir para ele
              tirar os objetivos de aprendizagem dali.
            </p>
          </div>
        ) : (
          bolhas.map((b) => <Fala key={b.id} bolha={b} />)
        )}

        {enviando ? (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ciano-600">
              Jarvis
            </p>
            <p className="text-sm text-tinta-500">
              <span className="inline-block animate-pulse">Pesquisando e pensando…</span>
              <span className="mt-1 block text-xs text-tinta-400">
                Quando ele busca no PubMed, pode levar alguns segundos.
              </span>
            </p>
          </div>
        ) : null}

        <div ref={fim} />
      </div>

      <div className="border-t border-tinta-200 p-4">
        {erro ? (
          <p role="alert" className="mb-3 rounded-lg bg-alerta-100 px-3.5 py-2.5 text-sm text-alerta-600">
            {erro}
          </p>
        ) : null}

        <div className="flex items-end gap-2">
          <textarea
            ref={campo}
            value={rascunho}
            onChange={(e) => setRascunho(e.target.value)}
            onKeyDown={(e) => {
              // Enter envia, Shift+Enter quebra linha. Mas nunca durante a
              // composição de acento ou de teclado IME: aí o Enter é o que
              // confirma o caractere, e enviar ali cortaria a palavra no meio.
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void enviar();
              }
            }}
            rows={2}
            disabled={enviando}
            placeholder={`Fale com o Jarvis sobre a SP ${codigo}…`}
            className="max-h-40 flex-1 resize-y rounded-lg border border-tinta-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-tinta-400 focus:border-ciano-500 focus:ring-2 focus:ring-ciano-100 disabled:bg-tinta-100"
          />
          <button
            type="button"
            onClick={() => void enviar()}
            disabled={enviando || rascunho.trim().length === 0}
            className="rounded-lg bg-ciano-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ciano-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
