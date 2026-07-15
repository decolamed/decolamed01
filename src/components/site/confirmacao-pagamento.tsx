"use client";

import { useEffect, useState } from "react";
import { LinkButton } from "@/components/ui/button";
import { lerConfirmacaoMatricula } from "@/lib/matricula/confirmacao-storage";
import type { MatriculaChargeResult } from "@/types/matricula";

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

  useEffect(() => {
    const encontrados = lerConfirmacaoMatricula(chargeId);
    setDados(encontrados);
    setStatus(encontrados ? "encontrado" : "nao-encontrado");
  }, [chargeId]);

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

  if (status === "loading") {
    return null;
  }

  if (status === "nao-encontrado" || !dados) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-6 text-left text-navy-dark shadow-xl">
        <p className="text-sm text-navy-dark/60">Referência da cobrança</p>
        <p className="font-mono text-sm">{chargeId ?? "—"}</p>
        <p className="mt-4 text-sm">
          Não encontramos os detalhes dessa cobrança nesta aba. Assim que o pagamento for confirmado pela
          Asaas, você recebe um e-mail com o link para criar sua senha e acessar a plataforma — verifique
          também sua caixa de spam.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4 text-left">
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
