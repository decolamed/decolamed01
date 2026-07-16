"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { salvarConfirmacaoMatricula } from "@/lib/matricula/confirmacao-storage";
import type { Plano } from "@/types/database";
import type { MatriculaChargeResult } from "@/types/matricula";

type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD";

function formatarReais(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function MatriculaForm({
  planos,
  planoInicialId
}: {
  planos: Plano[];
  planoInicialId: string;
}) {
  const planoSelecionado = planos.find((p) => p.id === planoInicialId) ?? planos[0];
  return (
    <FormularioInscricao
      planos={planos}
      planoSelecionavel
      planoAtual={planoSelecionado}
    />
  );
}

/** Usado pela página pública de link fixo /inscricao/[slug] — plano travado, sem seletor. */
export function InscricaoForm({ plano }: { plano: Plano }) {
  return <FormularioInscricao planos={[plano]} planoSelecionavel={false} planoAtual={plano} />;
}

function FormularioInscricao({
  planos,
  planoSelecionavel,
  planoAtual
}: {
  planos: Plano[];
  planoSelecionavel: boolean;
  planoAtual: Plano;
}) {
  const router = useRouter();
  const [planoId, setPlanoId] = useState(planoAtual.id);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [billingType, setBillingType] = useState<BillingType>("PIX");

  const [cupomInput, setCupomInput] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<{ codigo: string; descontoCentavos: number } | null>(null);
  const [cupomErro, setCupomErro] = useState<string | null>(null);
  const [validandoCupom, setValidandoCupom] = useState(false);

  const plano = planos.find((p) => p.id === planoId) ?? planoAtual;
  const valorFinalCentavos = cupomAplicado ? plano.preco_centavos - cupomAplicado.descontoCentavos : plano.preco_centavos;

  async function aplicarCupom() {
    if (!cupomInput.trim()) return;
    setValidandoCupom(true);
    setCupomErro(null);
    try {
      const res = await fetch("/api/cupons/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: cupomInput, planoId: plano.id })
      });
      const data = await res.json();
      if (!res.ok) {
        setCupomErro(data.error ?? "Cupom inválido.");
        setCupomAplicado(null);
        return;
      }
      setCupomAplicado({ codigo: cupomInput.trim().toUpperCase(), descontoCentavos: data.descontoCentavos });
    } catch {
      setCupomErro("Não foi possível validar o cupom agora.");
    } finally {
      setValidandoCupom(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      planoId,
      nome: form.get("nome"),
      email: form.get("email"),
      cpf: form.get("cpf"),
      telefone: form.get("telefone"),
      cep: form.get("cep"),
      numeroEndereco: form.get("numeroEndereco"),
      billingType,
      ...(cupomAplicado ? { cupomCodigo: cupomAplicado.codigo } : {})
    };

    try {
      const res = await fetch("/api/matricula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Não foi possível processar a matrícula.");
      }

      const data = (await res.json()) as MatriculaChargeResult;
      // Guarda a resposta completa (inclui o QR Code do Pix em base64, grande
      // demais para ir na URL) para a página de confirmação ler sem precisar
      // buscar a cobrança de novo. Ver src/lib/matricula/confirmacao-storage.ts.
      salvarConfirmacaoMatricula(data);
      router.push(`/matricula/confirmacao?chargeId=${data.chargeId}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-3xl bg-white p-6 text-navy-dark shadow-xl">
      {planoSelecionavel ? (
        <div>
          <label className="text-sm font-semibold">Plano</label>
          <select
            name="planoId"
            value={planoId}
            onChange={(e) => setPlanoId(e.target.value)}
            className="mt-1 w-full rounded-lg border p-3"
          >
            {planos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="rounded-lg bg-navy/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-navy-dark/50">Plano escolhido</p>
          <p className="font-display font-bold">{plano.nome}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo" name="nome" required />
        <Field label="E-mail" name="email" type="email" required />
        <Field label="CPF" name="cpf" required placeholder="000.000.000-00" />
        <Field label="Telefone" name="telefone" required placeholder="(00) 00000-0000" />
        <Field label="CEP" name="cep" required placeholder="00000-000" />
        <Field label="Número do endereço" name="numeroEndereco" required />
      </div>

      <div>
        <label className="text-sm font-semibold" htmlFor="cupom">Possui cupom?</label>
        <div className="mt-1 flex gap-2">
          <input
            id="cupom"
            value={cupomInput}
            onChange={(e) => {
              setCupomInput(e.target.value);
              setCupomAplicado(null);
              setCupomErro(null);
            }}
            placeholder="Código do cupom"
            className="w-full rounded-lg border p-3 uppercase"
          />
          <button
            type="button"
            onClick={aplicarCupom}
            disabled={validandoCupom || !cupomInput.trim()}
            className="shrink-0 rounded-lg border border-navy px-4 text-sm font-semibold text-navy disabled:opacity-50"
          >
            {validandoCupom ? "Validando..." : "Aplicar"}
          </button>
        </div>
        {cupomErro && <p className="mt-1 text-xs text-red-600">{cupomErro}</p>}
        {cupomAplicado && (
          <p className="mt-1 text-xs text-green-700">
            Cupom {cupomAplicado.codigo} aplicado: -{formatarReais(cupomAplicado.descontoCentavos)}
          </p>
        )}
      </div>

      <div className="flex items-baseline justify-between rounded-lg bg-navy/5 p-3">
        <span className="text-sm font-semibold">Total</span>
        <span className="font-display text-lg font-bold text-navy-dark">
          {cupomAplicado && <span className="mr-2 text-xs font-normal text-navy-dark/40 line-through">{formatarReais(plano.preco_centavos)}</span>}
          {formatarReais(valorFinalCentavos)}
        </span>
      </div>

      <div>
        <label className="text-sm font-semibold">Forma de pagamento</label>
        <div className="mt-2 flex gap-3">
          {(["PIX", "BOLETO", "CREDIT_CARD"] as BillingType[]).map((tipo) => (
            <button
              type="button"
              key={tipo}
              onClick={() => setBillingType(tipo)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                billingType === tipo ? "border-orange bg-orange/10 text-orange-dark" : "border-gray-300"
              }`}
            >
              {tipo === "PIX" ? "Pix" : tipo === "BOLETO" ? "Boleto" : "Cartão"}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-navy-dark/60">
          Pagamento com cartão de crédito depende da forma como sua conta Asaas está habilitada.
        </p>
      </div>

      {erro && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{erro}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Processando..." : "Confirmar matrícula"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border p-3"
      />
    </div>
  );
}
