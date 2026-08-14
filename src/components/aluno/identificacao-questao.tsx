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
// A forma é a mesma do Banco de Questões (`questaoMeta` em decola-app.tsx):
// uma linha de destaque com matéria/assunto e, abaixo, o código em monoespaço
// junto da prova de origem — discreto, mas sempre disponível. Ordem de
// leitura do mais legível ao mais técnico.
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
  const materia = (questao.materia ?? "").trim();
  // A matéria já é o primeiro elemento da linha; pedi-la de novo na
  // referência produzia "BIOLOGIA · Questão 12 · Biologia".
  const referencia = referenciaDaQuestao(questao, posicao, { incluirMateria: !materia });
  const codigo = codigoDaQuestao(questao.id);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {materia && (
          <span className="text-[11.5px] font-extrabold uppercase tracking-[0.02em] text-app-green">{materia}</span>
        )}
        {materia && referencia && <span className="text-[11.5px] text-app-faint">·</span>}
        {referencia && <span className="text-[12.5px] font-bold text-app-txt">{referencia}</span>}
        {questao.anulada && (
          <span className="rounded-full bg-app-orange-soft px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-app-orange-txt">
            Anulada
          </span>
        )}
      </div>
      {/* Discreto de propósito: precisa estar disponível para o aluno reportar
          um erro, sem virar o elemento mais visível da tela. */}
      <p className="mt-0.5 font-mono text-[10.5px] font-semibold tracking-[0.01em] text-app-faint">
        <span className="select-all">{codigo}</span>
        {prova ? `  ·  ${prova}` : ""}
      </p>
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
        className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl px-4 py-3 ${
          correta ? "bg-app-green-soft text-app-green-deep" : "bg-app-red-soft text-app-red"
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
        <div className="rounded-2xl border border-app-line bg-app-card p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-app-faint">Resolução</p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-app-sub">{explicacao}</p>
        </div>
      )}

      {/* Aparece só quando o Copiloto de fato criou a revisão. Uma mensagem
          dizendo "adicionei uma revisão" sem revisão nenhuma no banco seria
          uma promessa que o aluno não encontraria depois. */}
      {revisaoCriada && (
        <p className="flex items-center gap-2 rounded-2xl bg-app-orange-soft px-4 py-2.5 text-xs font-semibold text-app-orange-txt">
          <span aria-hidden>🤖</span>
          Erro identificado. O Copiloto adicionou uma revisão.
        </p>
      )}

      {children}
    </div>
  );
}
