"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { salvarConfirmacaoMatricula } from "@/lib/matricula/confirmacao-storage";
import type { Plano } from "@/types/database";
import type { MatriculaChargeResult } from "@/types/matricula";

type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD";

export function MatriculaForm({
  planos,
  planoInicialId
}: {
  planos: Plano[];
  planoInicialId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [billingType, setBillingType] = useState<BillingType>("PIX");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      planoId: form.get("planoId"),
      nome: form.get("nome"),
      email: form.get("email"),
      cpf: form.get("cpf"),
      telefone: form.get("telefone"),
      cep: form.get("cep"),
      numeroEndereco: form.get("numeroEndereco"),
      billingType
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
      <div>
        <label className="text-sm font-semibold">Plano</label>
        <select name="planoId" defaultValue={planoInicialId} className="mt-1 w-full rounded-lg border p-3">
          {planos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo" name="nome" required />
        <Field label="E-mail" name="email" type="email" required />
        <Field label="CPF" name="cpf" required placeholder="000.000.000-00" />
        <Field label="Telefone" name="telefone" required placeholder="(00) 00000-0000" />
        <Field label="CEP" name="cep" required placeholder="00000-000" />
        <Field label="Número do endereço" name="numeroEndereco" required />
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
