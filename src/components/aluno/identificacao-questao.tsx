import {
  codigoDaQuestao,
  provaDaQuestao,
  referenciaDaQuestao,
  type OrigemDaQuestao
} from "@/lib/site/questao-identidade";

// ============================================================================
// A FAIXA DE IDENTIFICAÇÃO E O BLOCO DE RESULTADO
//
// Atividades, simulados e sessões mostravam só o enunciado. O aluno não tinha
// como saber de que prova a questão veio, que número tinha no caderno
// original, nem que código informar ao suporte — e "questão 12" não
// identifica nada, porque existe uma questão 12 em toda prova de todo ano.
//
// Uma área só, com tudo junto, em vez da mesma informação repetida em três
// lugares da tela. Ordem de leitura: prova → questão e matéria → código, do
// mais legível ao mais técnico, com o código visualmente discreto.
// ============================================================================

export function IdentificacaoQuestao({
  questao,
  posicao,
  className = ""
}: {
  questao: OrigemDaQuestao;
  /** Posição na lista atual, usada só quando a questão não tem número de prova. */
  posicao?: number;
  className?: string;
}) {
  const prova = provaDaQuestao(questao);
  const referencia = referenciaDaQuestao(questao, posicao);
  const codigo = codigoDaQuestao(questao.id);

  return (
    <div className={`border-b border-navy/10 pb-3 ${className}`}>
      {prova && <p className="font-display text-sm font-bold text-navy-dark">{prova}</p>}
      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {referencia && <p className="text-xs font-semibold text-navy-dark/60">{referencia}</p>}
        {questao.anulada && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-800">
            Anulada
          </span>
        )}
        {/* Discreto de propósito: precisa estar disponível para o aluno
            reportar um erro, sem virar o elemento mais visível da tela. */}
        <span className="ml-auto select-all rounded-full bg-navy/5 px-2 py-0.5 font-mono text-[10px] font-bold text-navy-dark/50">
          {codigo}
        </span>
      </div>
    </div>
  );
}

/**
 * O que o aluno vê depois de responder: acertou ou errou, o gabarito, a
 * resolução e — só quando o Copiloto realmente agiu — o aviso da revisão.
 *
 * O estado nunca depende só de cor: vem sempre com ícone e com texto, para
 * quem não distingue verde de vermelho continuar entendendo o resultado.
 */
export function ResultadoDaResposta({
  correta,
  respostaCorreta,
  explicacao,
  revisaoCriada,
  children
}: {
  correta: boolean;
  respostaCorreta: string;
  explicacao?: string | null;
  /** Só true quando existe uma revisão de verdade no banco. */
  revisaoCriada?: boolean;
  /** Ação seguinte (Próxima questão / Enviar), à direita do bloco. */
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-4 space-y-3">
      <div
        className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
          correta ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
        }`}
        role="status"
      >
        <span aria-hidden className="font-display text-lg font-black">
          {correta ? "✓" : "✕"}
        </span>
        <span className="font-display font-bold">{correta ? "Você acertou" : "Você errou"}</span>
        <span className="ml-auto text-xs font-semibold">
          Gabarito: <strong className="font-display text-sm">{respostaCorreta.toUpperCase()}</strong>
        </span>
      </div>

      {explicacao && (
        <div className="rounded-xl bg-navy/5 p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-navy-dark/45">Resolução</p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-navy-dark/80">{explicacao}</p>
        </div>
      )}

      {/* Aparece só quando o Copiloto de fato criou a revisão. Uma mensagem
          dizendo "adicionei uma revisão" sem revisão nenhuma no banco seria
          uma promessa que o aluno não encontraria depois. */}
      {revisaoCriada && (
        <p className="flex items-center gap-2 rounded-xl bg-orange/10 px-4 py-2.5 text-xs font-semibold text-orange-dark">
          <span aria-hidden>🤖</span>
          Erro identificado. O Copiloto adicionou uma revisão.
        </p>
      )}

      {children}
    </div>
  );
}
