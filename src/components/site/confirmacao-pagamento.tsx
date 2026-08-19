"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { InstalarApp } from "@/components/site/instalar-app";
import { lerConfirmacaoMatricula } from "@/lib/matricula/confirmacao-storage";
import type { MatriculaChargeResult } from "@/types/matricula";

// ============================================================================
// A TELA ENTRE O PAGAMENTO E O ACESSO
//
// Enquanto a cobrança está pendente, mostra o meio de pagamento (QR Code do
// Pix, boleto, cartão). Quando o pagamento é confirmado, troca sozinha para a
// tela de sucesso — sem o aluno precisar recarregar nada.
//
// Quem decide que foi pago NÃO é esta tela: ela pergunta a /api/matricula/status,
// que confere no banco e, se ainda estiver pendente, no próprio Asaas. O
// front nunca afirma pagamento; ele só reage à resposta do servidor.
//
// Antes desta mudança a tela era estática: lia a cobrança do sessionStorage e
// ficava ali para sempre. Um Pix pago continuava mostrando o QR Code como se
// nada tivesse acontecido — foi o defeito relatado no primeiro teste real.
// ============================================================================

/** De quanto em quanto tempo perguntamos se o pagamento caiu. */
const INTERVALO_MS = 5000;

/**
 * Depois disto, paramos de perguntar sozinhos.
 *
 * Quinze minutos cobre com folga um Pix (que cai em segundos) e um cartão. Boleto
 * leva dias — para ele o caminho é o e-mail, que chega quando compensar. Continuar
 * perguntando para sempre gastaria chamada à API do Asaas numa aba esquecida aberta.
 */
const LIMITE_DE_ESPERA_MS = 15 * 60 * 1000;

function formatValor(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatVencimento(dueDate: string) {
  // dueDate vem como YYYY-MM-DD; parse com hora fixa evita o dia "voltar" por
  // causa do fuso horário do navegador.
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString("pt-BR");
}

export function ConfirmacaoPagamento({ chargeId }: { chargeId?: string }) {
  // "loading" evita um flash do estado de fallback antes do efeito rodar
  // (sessionStorage só existe no client).
  const [status, setStatus] = useState<"loading" | "encontrado" | "nao-encontrado">("loading");
  const [dados, setDados] = useState<MatriculaChargeResult | null>(null);
  const [copiado, setCopiado] = useState(false);

  // O estado do PAGAMENTO, que é outra coisa do estado da tela acima.
  const [pagamento, setPagamento] = useState<"pendente" | "confirmado" | "parou">("pendente");
  const [emailDoAluno, setEmailDoAluno] = useState<string | null>(null);
  const desdeRef = useRef<number>(Date.now());

  useEffect(() => {
    const encontrados = lerConfirmacaoMatricula(chargeId);
    setDados(encontrados);
    setStatus(encontrados ? "encontrado" : "nao-encontrado");
  }, [chargeId]);

  const consultar = useCallback(async (): Promise<boolean> => {
    if (!chargeId) return true;
    try {
      const res = await fetch(`/api/matricula/status?chargeId=${encodeURIComponent(chargeId)}`, {
        cache: "no-store"
      });
      if (!res.ok) return false;
      const dados = (await res.json()) as { status?: string; email?: string };
      if (dados.status === "confirmado") {
        setPagamento("confirmado");
        setEmailDoAluno(dados.email ?? null);
        return true;
      }
    } catch {
      // Rede instável não pode virar erro na tela: o aluno está esperando um
      // pagamento, não navegando. A próxima tentativa resolve.
    }
    return false;
  }, [chargeId]);

  useEffect(() => {
    if (!chargeId || pagamento === "confirmado") return;

    let ativo = true;
    let timer: ReturnType<typeof setTimeout>;

    const rodar = async () => {
      if (!ativo) return;
      const pronto = await consultar();
      if (!ativo || pronto) return;
      if (Date.now() - desdeRef.current > LIMITE_DE_ESPERA_MS) {
        setPagamento("parou");
        return;
      }
      timer = setTimeout(rodar, INTERVALO_MS);
    };

    // A primeira consulta é imediata: se o aluno voltou para esta página
    // depois de já ter pago (fechou a aba, clicou no link de novo), ele
    // precisa ver a tela de sucesso agora, não daqui a cinco segundos.
    rodar();

    // Voltar para a aba é um sinal forte de que ele acabou de pagar no app do
    // banco — vale perguntar na hora, sem esperar o próximo ciclo.
    const aoVoltar = () => {
      if (document.visibilityState === "visible") consultar();
    };
    document.addEventListener("visibilitychange", aoVoltar);

    return () => {
      ativo = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [chargeId, consultar, pagamento]);

  async function copiarPixCopiaECola(payload: string) {
    try {
      await navigator.clipboard.writeText(payload);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Clipboard pode falhar (ex: contexto não seguro) — o payload já está
      // visível na tela para o aluno copiar manualmente.
    }
  }

  // Confirmado vence tudo: mesmo que os dados da cobrança não estejam nesta
  // aba, o que importa agora é que o pagamento entrou.
  if (pagamento === "confirmado") {
    return <PagamentoConfirmado email={emailDoAluno} />;
  }

  if (status === "loading") {
    return null;
  }

  if (status === "nao-encontrado" || !dados) {
    return (
      <>
      <div className="mb-4 text-center">
        <h1 className="font-display text-3xl font-extrabold text-white">Falta pouco! 🚀</h1>
      </div>
      <div className="rounded-2xl bg-white p-6 text-left text-navy-dark shadow-xl">
        <p className="text-sm text-navy-dark/60">Referência da cobrança</p>
        <p className="font-mono text-sm">{chargeId ?? "—"}</p>
        <p className="mt-4 text-sm">
          Não encontramos os detalhes dessa cobrança nesta aba. Assim que o pagamento for confirmado pela
          Asaas, você recebe um e-mail com o link para criar sua senha e acessar a plataforma — verifique
          também sua caixa de spam.
        </p>
      </div>
      </>
    );
  }

  return (
    <div className="space-y-4 text-left">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold text-white">Falta pouco! 🚀</h1>
        <p className="mt-3 text-white/80">
          Sua cobrança foi gerada. Assim que o pagamento cair, esta tela muda sozinha e o seu acesso é liberado.
        </p>
      </div>

      {/* O aluno precisa ver que a plataforma está ESPERANDO, não parada. Sem
          este sinal, a única leitura possível de uma tela imóvel depois de
          pagar é "não funcionou". */}
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 p-3 text-sm text-white/80">
        {pagamento === "parou" ? (
          <>
            <span>Ainda não identificamos o pagamento.</span>
            <button
              type="button"
              onClick={() => {
                desdeRef.current = Date.now();
                setPagamento("pendente");
              }}
              className="font-semibold text-white underline"
            >
              Verificar de novo
            </button>
          </>
        ) : (
          <>
            <span className="h-2 w-2 animate-pulse rounded-full bg-orange" aria-hidden />
            <span>Aguardando pagamento…</span>
          </>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 text-navy-dark shadow-xl">
        <p className="text-sm text-navy-dark/60">Referência da cobrança</p>
        <p className="font-mono text-sm">{dados.chargeId}</p>
      </div>

      {dados.billingType === "PIX" && dados.pix && (
        <div className="rounded-2xl bg-white p-6 text-center text-navy-dark shadow-xl">
          <p className="font-display text-lg font-bold">Pague com Pix</p>
          <p className="mt-1 text-sm text-navy-dark/70">
            {formatValor(dados.value)} · válido até {new Date(dados.pix.expirationDate).toLocaleString("pt-BR")}
          </p>

          {/* eslint-disable-next-line @next/next/no-img-element -- data URI em base64, next/image não se aplica aqui */}
          <img
            src={`data:image/png;base64,${dados.pix.encodedImage}`}
            alt="QR Code Pix para pagamento da matrícula"
            className="mx-auto mt-4 h-56 w-56 rounded-xl border"
          />

          <label className="mt-4 block text-left text-xs font-semibold text-navy-dark/60">
            Pix Copia e Cola
          </label>
          <textarea
            readOnly
            value={dados.pix.payload}
            rows={3}
            className="mt-1 w-full resize-none rounded-lg border bg-sky p-3 font-mono text-xs"
            onFocus={(e) => e.currentTarget.select()}
          />

          <button
            type="button"
            onClick={() => copiarPixCopiaECola(dados.pix!.payload)}
            className="mt-3 inline-flex items-center justify-center rounded-full bg-orange px-6 py-3 font-display text-base font-bold text-white shadow-lg shadow-orange/30 transition hover:bg-orange-dark"
          >
            {copiado ? "Copiado!" : "Copiar código Pix"}
          </button>
        </div>
      )}

      {dados.billingType === "BOLETO" && (
        <div className="rounded-2xl bg-white p-6 text-center text-navy-dark shadow-xl">
          <p className="font-display text-lg font-bold">Pague com boleto</p>
          <p className="mt-1 text-sm text-navy-dark/70">
            Valor: {formatValor(dados.value)} · Vencimento: {formatVencimento(dados.dueDate)}
          </p>
          <LinkButton
            href={dados.bankSlipUrl ?? dados.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4"
          >
            Abrir boleto
          </LinkButton>
        </div>
      )}

      {dados.billingType === "CREDIT_CARD" && (
        <div className="rounded-2xl bg-white p-6 text-center text-navy-dark shadow-xl">
          <p className="font-display text-lg font-bold">Pague com cartão de crédito</p>
          <p className="mt-1 text-sm text-navy-dark/70">Valor: {formatValor(dados.value)}</p>
          <LinkButton href={dados.invoiceUrl} target="_blank" rel="noopener noreferrer" className="mt-4">
            Pagar com cartão
          </LinkButton>
        </div>
      )}
    </div>
  );
}

/**
 * O que o aluno vê quando o Asaas confirma o pagamento.
 *
 * Ela é uma comemoração e um manual ao mesmo tempo: quem acabou de pagar
 * precisa saber que deu certo E o que fazer a seguir, porque o próximo passo
 * acontece fora daqui (na caixa de entrada dele). Deixar isso implícito é o
 * que gera "paguei e não recebi nada".
 */
function PagamentoConfirmado({ email }: { email: string | null }) {
  const passos = [
    {
      titulo: "Acesse seu e-mail",
      texto: "Você receberá uma mensagem da Decola MED com as instruções para acessar sua conta."
    },
    {
      titulo: "Crie sua senha",
      texto: "Clique no link enviado por e-mail e cadastre sua primeira senha de acesso."
    },
    {
      titulo: "Acesse a plataforma",
      texto:
        "Depois de criar sua senha, você poderá entrar na Decola MED utilizando seu e-mail e a senha cadastrada."
    }
  ];

  return (
    <div className="mt-8 space-y-4 text-left">
      <div className="rounded-2xl bg-white p-8 text-center text-navy-dark shadow-xl">
        <p className="text-5xl">🎉</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold text-navy-dark">Pagamento confirmado!</h2>
        <p className="mt-2 font-display text-lg font-bold text-orange">Bem-vindo à Decola MED! ✈️</p>
        <p className="mt-4 text-navy-dark/70">Seu pagamento foi confirmado com sucesso.</p>
        <p className="mt-1 text-navy-dark/70">
          Seu acesso à plataforma será enviado para{" "}
          {email ? (
            <strong className="text-navy-dark">{email}</strong>
          ) : (
            "o e-mail informado no cadastro"
          )}
          .
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 text-navy-dark shadow-xl">
        <p className="font-display font-bold">Seus próximos passos</p>
        <ol className="mt-4 space-y-4">
          {passos.map((passo, i) => (
            <li key={passo.titulo} className="flex gap-3">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-orange font-display text-sm font-bold text-white">
                {i + 1}
              </span>
              <span>
                <strong className="block text-navy-dark">{passo.titulo}</strong>
                <span className="text-sm text-navy-dark/70">{passo.texto}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-5 rounded-xl bg-sky p-3 text-xs text-navy-dark/60">
          O e-mail costuma chegar em alguns minutos. Se não encontrar, confira a caixa de <strong>spam</strong> ou
          promoções — e, se ainda assim não aparecer, fale conosco pelo WhatsApp que a gente reenvia.
        </p>
      </div>

      <InstalarApp />
    </div>
  );
}
