"use client";

import { useState } from "react";
import { TIPOS_DE_ITEM, TIPO_PADRAO } from "@/lib/trilha/itens-do-mentor";

// ============================================================================
// O DIA DA ROTA DE UM ALUNO, EDITÁVEL
//
// Renomear a aula, trocar o link, acrescentar material, excluir item, esvaziar
// o dia — tudo é a mesma operação: o mentor define A LISTA do dia. Ela vai
// para o servidor como JSON num campo oculto, e lá `lerItensDoFormulario`
// valida antes de gravar (ver lib/trilha/itens-do-mentor.ts).
//
// Só a lista mora no estado do React. O envio é um <form> comum com server
// action: o mentor edita, clica em Salvar, a página recarrega com o dia novo
// — sem estado pendurado entre requisições, que é onde este tipo de tela
// costuma passar a mentir sobre o que está salvo.
// ============================================================================

export interface ItemDoDia {
  tipo: string;
  titulo: string;
  materia: string | null;
  url: string | null;
  ref_id: string | null;
}

const ROTULO_DO_TIPO: Record<string, string> = {
  aula: "Aula",
  pdf: "PDF",
  link: "Link",
  questoes: "Questões",
  flashcards: "Flashcards",
  simulado: "Simulado",
  atividade: "Atividade",
  redacao: "Redação",
  leitura: "Leitura",
  revisao: "Revisão",
  livre: "Livre"
};

const vazio = (): ItemDoDia => ({ tipo: TIPO_PADRAO, titulo: "", materia: null, url: null, ref_id: null });

export function EditorDoDia({ itensIniciais }: { itensIniciais: ItemDoDia[] }) {
  const [itens, setItens] = useState<ItemDoDia[]>(itensIniciais);

  const alterar = (indice: number, campo: keyof ItemDoDia, valor: string) =>
    setItens((atual) =>
      atual.map((item, i) => (i === indice ? { ...item, [campo]: campo === "tipo" ? valor : valor || null } : item))
    );

  const remover = (indice: number) => setItens((atual) => atual.filter((_, i) => i !== indice));
  const acrescentar = () => setItens((atual) => [...atual, vazio()]);

  // Mover é o que permite reordenar o dia sem apagar e recriar o item — e sem
  // perder o `ref_id`, que é o que faz o material abrir de verdade.
  const mover = (indice: number, direcao: -1 | 1) =>
    setItens((atual) => {
      const destino = indice + direcao;
      if (destino < 0 || destino >= atual.length) return atual;
      const copia = [...atual];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });

  return (
    <div className="mt-2 space-y-3">
      {/* A lista inteira num campo só. O servidor revalida tudo — o que sai
          daqui é entrada de formulário, não verdade. */}
      <input type="hidden" name="itens" value={JSON.stringify(itens)} />

      {itens.length === 0 && (
        <p className="rounded-lg bg-sky p-3 text-xs text-navy-dark/60">
          Dia sem conteúdo. Acrescente itens abaixo, ou salve assim para deixá-lo vazio — o dia continua no
          cronograma, com a mesma data.
        </p>
      )}

      {itens.map((item, indice) => (
        <div key={indice} className="rounded-xl border border-navy/10 bg-sky/40 p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-navy-dark/40">{indice + 1}</span>
            <select
              aria-label="Tipo do item"
              value={item.tipo}
              onChange={(e) => alterar(indice, "tipo", e.target.value)}
              className="rounded-lg border border-navy/15 bg-white p-1.5 text-xs"
            >
              {TIPOS_DE_ITEM.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {ROTULO_DO_TIPO[tipo] ?? tipo}
                </option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => mover(indice, -1)}
                disabled={indice === 0}
                aria-label="Mover para cima"
                className="rounded px-2 py-1 text-xs text-navy disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => mover(indice, 1)}
                disabled={indice === itens.length - 1}
                aria-label="Mover para baixo"
                className="rounded px-2 py-1 text-xs text-navy disabled:opacity-25"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remover(indice)}
                className="rounded px-2 py-1 text-xs font-semibold text-red hover:underline"
              >
                Excluir
              </button>
            </div>
          </div>

          <input
            value={item.titulo}
            onChange={(e) => alterar(indice, "titulo", e.target.value)}
            placeholder="Título do item (obrigatório)"
            aria-label="Título do item"
            className="mt-2 w-full rounded-lg border border-navy/15 p-2 text-sm"
          />

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input
              value={item.materia ?? ""}
              onChange={(e) => alterar(indice, "materia", e.target.value)}
              placeholder="Matéria"
              aria-label="Matéria"
              className="w-full rounded-lg border border-navy/15 p-2 text-xs"
            />
            <input
              value={item.url ?? ""}
              onChange={(e) => alterar(indice, "url", e.target.value)}
              placeholder="https://… (link direto, opcional)"
              aria-label="Link do item"
              className="w-full rounded-lg border border-navy/15 p-2 text-xs"
            />
          </div>

          {item.ref_id && (
            // O vínculo com o material cadastrado é o que faz o item abrir no
            // visualizador interno. Mostramos que ele existe, mas não deixamos
            // editar um id à mão: um id trocado por engano leva o aluno ao
            // conteúdo errado, sem nenhum aviso.
            <p className="mt-2 text-[11px] text-navy-dark/45">
              Vinculado a um material do acervo. O título acima é o que o aluno vê. Para trocar o material,
              exclua este item e acrescente outro.
            </p>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={acrescentar}
        className="rounded-full border border-dashed border-navy/30 px-4 py-2 text-xs font-semibold text-navy hover:bg-sky"
      >
        + Acrescentar item
      </button>
    </div>
  );
}
