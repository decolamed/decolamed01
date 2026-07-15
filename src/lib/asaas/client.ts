// Integração com a API oficial do Asaas.
// Docs: https://docs.asaas.com/reference/comece-por-aqui
//
// Este arquivo concentra TODAS as chamadas HTTP ao Asaas para facilitar
// manutenção caso a documentação oficial seja atualizada. Ajuste os campos
// enviados conforme a versão vigente da documentação sempre que necessário.

const ASAAS_API_URL = process.env.ASAAS_API_URL ?? "https://sandbox.asaas.com/api/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY!;

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ASAAS_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Asaas API error (${res.status}) em ${path}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ----------------------------------------------------------------------------
// CLIENTE (customer)
// Campos obrigatórios/recomendados conforme docs oficiais para permitir
// emissão de Pix, boleto e cartão sem restrições.
// ----------------------------------------------------------------------------
export interface AsaasCustomerInput {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
  postalCode?: string;
  addressNumber?: string;
  externalReference?: string; // usamos o id do pre_cadastro no Supabase
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
}

export async function findOrCreateCustomer(input: AsaasCustomerInput): Promise<AsaasCustomer> {
  // Evita duplicar clientes: busca por CPF/CNPJ antes de criar.
  const existing = await asaasFetch<{ data: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(input.cpfCnpj)}`
  );

  if (existing.data.length > 0) {
    return existing.data[0];
  }

  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

// ----------------------------------------------------------------------------
// COBRANÇA (payment)
// ----------------------------------------------------------------------------
export type AsaasBillingType = "PIX" | "BOLETO" | "CREDIT_CARD";

export interface AsaasChargeInput {
  customer: string; // id do cliente Asaas
  billingType: AsaasBillingType;
  value: number; // em reais, ex: 397.00
  dueDate: string; // YYYY-MM-DD
  description?: string;
  externalReference?: string; // id do pre_cadastro no Supabase
  // Dados de cartão só são exigidos quando billingType === "CREDIT_CARD".
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}

export interface AsaasCharge {
  id: string;
  status: string;
  invoiceUrl: string;
  bankSlipUrl?: string;
  billingType: AsaasBillingType;
}

export async function createCharge(input: AsaasChargeInput): Promise<AsaasCharge> {
  return asaasFetch<AsaasCharge>("/payments", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

// Pix: o QR Code é obtido em uma chamada separada, após a cobrança criada.
export interface AsaasPixQrCode {
  encodedImage: string; // base64 do QR Code
  payload: string; // copia-e-cola
  expirationDate: string;
}

export async function getPixQrCode(chargeId: string): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(`/payments/${chargeId}/pixQrCode`);
}

// ----------------------------------------------------------------------------
// WEBHOOK
// Eventos relevantes: PAYMENT_CONFIRMED (cartão/pix aprovado) e
// PAYMENT_RECEIVED (boleto/pix compensado). Consulte a documentação para a
// lista completa de eventos: https://docs.asaas.com/docs/webhook
// ----------------------------------------------------------------------------
export interface AsaasWebhookPayload {
  event: string;
  payment: {
    id: string;
    customer: string;
    value: number;
    status: string;
    billingType: AsaasBillingType;
    externalReference?: string;
    paymentDate?: string;
  };
}

export const ASAAS_CONFIRMATION_EVENTS = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"];

// O Asaas usa "CREDIT_CARD" para cartão; o Supabase usa o enum forma_pagamento
// ('pix' | 'boleto' | 'cartao'). Um simples toLowerCase() não cobre esse caso
// (viraria "credit_card"), então mapeamos explicitamente.
export function mapBillingTypeToFormaPagamento(
  billingType: AsaasBillingType | undefined
): "pix" | "boleto" | "cartao" | null {
  switch (billingType) {
    case "PIX":
      return "pix";
    case "BOLETO":
      return "boleto";
    case "CREDIT_CARD":
      return "cartao";
    default:
      return null;
  }
}
