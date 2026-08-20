"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

// ============================================================================
// EXCLUSÃO PERMANENTE — A CONFIRMAÇÃO
//
// As outras ações destrutivas do painel usam `ConfirmSubmitButton`, que abre
// um window.confirm. Aqui isso não serve: um confirm é um clique depois do
// outro, e a diferença entre "desativar" (reversível, um clique em Reativar
// desfaz) e "excluir" (sem volta) precisa ficar impossível de confundir.
//
// Por isso a exclusão exige DIGITAR o e-mail da pessoa. É o padrão de quem
// destrói dado de verdade, e tem uma propriedade que o confirm não tem:
// obriga a olhar de quem é a conta. Clicar no botão errado numa lista de
// alunos parecidos é o erro que realmente acontece — e digitar o e-mail
// errado não apaga ninguém.
//
// O botão só existe depois que o texto bate. Enquanto não bate, não há o que
// clicar por engano.
// ============================================================================

function BotaoExcluir() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-red px-4 py-2.5 text-xs font-extrabold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Excluindo..." : "Excluir permanentemente"}
    </button>
  );
}

export function ExcluirUsuario({
  id,
  nome,
  email,
  acao
}: {
  id: string;
  nome: string | null;
  email: string | null;
  acao: (formData: FormData) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [digitado, setDigitado] = useState("");

  // Sem e-mail não há como confirmar por digitação. É raro (todo usuário vem
  // do Auth, que exige e-mail), mas se acontecer é melhor não oferecer a
  // exclusão do que oferecer uma confirmação que qualquer texto satisfaz.
  const alvo = (email ?? "").trim().toLowerCase();
  const confere = alvo.length > 0 && digitado.trim().toLowerCase() === alvo;

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-xs font-bold text-red hover:underline"
      >
        Excluir
      </button>
    );
  }

  return (
    <div className="mt-2 w-full rounded-xl border border-red/30 bg-red/[0.04] p-3">
      <p className="text-xs font-extrabold uppercase tracking-wide text-red">Exclusão permanente</p>

      <p className="mt-1.5 text-xs font-semibold leading-relaxed text-navy-dark">
        Isto apaga <strong>{nome ?? email}</strong> e todo o estudo da pessoa: respostas, flashcards, simulados,
        cronograma, missões e Copiloto. <strong>Não tem como desfazer.</strong>
      </p>

      <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-navy-dark/60">
        As matrículas e os pagamentos continuam no faturamento, e o conteúdo que a pessoa tenha cadastrado
        continua no acervo. Se você só quer tirar o acesso, use <strong>Desativar</strong> — mantém tudo e pode
        ser desfeito.
      </p>

      <form action={acao} className="mt-3 space-y-2">
        <input type="hidden" name="id" value={id} />
        <label className="block text-[11px] font-bold text-navy-dark/70" htmlFor={`confirmar-${id}`}>
          Para confirmar, digite <span className="font-mono text-red">{email}</span>
        </label>
        <input
          id={`confirmar-${id}`}
          value={digitado}
          onChange={(e) => setDigitado(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg border border-navy-dark/20 p-2 text-sm"
          placeholder={email ?? ""}
        />

        {confere ? (
          <BotaoExcluir />
        ) : (
          <p className="text-[11px] font-semibold text-navy-dark/40">
            O botão aparece quando o e-mail estiver correto.
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setAberto(false);
            setDigitado("");
          }}
          className="w-full rounded-lg border border-navy-dark/15 px-4 py-2 text-xs font-bold text-navy-dark/60 hover:bg-navy-dark/5"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
