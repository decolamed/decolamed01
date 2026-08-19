// Integração com a API oficial do Asaas.
// Docs: https://docs.asaas.com/reference/comece-por-aqui
//
// Este arquivo concentra TODAS as chamadas HTTP ao Asaas para facilitar
// manutenção caso a documentação oficial seja atualizada. Ajuste os campos
// enviados conforme a versão vigente da documentação sempre que necessário.

const ASAAS_API_URL = process.env.ASAAS_API_URL ?? "https://sandbox.asaas.com/api/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

// Chaves do Asaas sempre começam com "$aact_" (produção: "$aact_prod_",
// sandbox: "$aact_hmlg_" ou similar) — se ASAAS_API_URL bate com esse
// prefixo, as duas variáveis foram trocadas na configuração do ambiente
// (alguém colou a chave no campo da URL, ou vice-versa). Detectar isso aqui
// evita que o erro apareça como "Failed to parse URL from $aact_..." — o
// erro nativo do fetch() quando recebe uma string que não é uma URL válida,
// que não diz nada sobre a causa real pra quem está lendo o log.
function validarConfiguracao(): string {
  if (!ASAAS_API_KEY) {
    throw new Error("ASAAS_API_KEY não está configurada nas variáveis de ambiente.");
  }
  if (ASAAS_API_URL.startsWith("$aact_")) {
    throw new Error(
      "ASAAS_API_URL está configurada com o valor de uma chave de API (começa com \"$aact_\"), não com uma URL. " +
        "As variáveis ASAAS_API_URL e ASAAS_API_KEY foram trocadas na configuração do ambiente — corrija os valores " +
        "no painel da Vercel (ASAAS_API_URL deve ser https://api.asaas.com/v3 em produção ou " +
        "https://sandbox.asaas.com/api/v3 em sandbox)."
    );
  }
  let url: URL;
  try {
    url = new URL(ASAAS_API_URL);
  } catch {
    throw new Error(`ASAAS_API_URL não é uma URL válida: "${ASAAS_API_URL}". Confira o valor configurado no ambiente.`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`ASAAS_API_URL precisa usar https — valor atual: "${ASAAS_API_URL}".`);
  }
  // Chave de produção ("$aact_prod_...") com URL de sandbox (ou o oposto)
  // sempre falha na autenticação (401) — o Asaas mantém ambientes
  // completamente isolados. Avisamos antes de bater na API pra economizar
  // uma chamada e dar um diagnóstico direto em vez de um 401 genérico.
  const chaveDeProducao = ASAAS_API_KEY.startsWith("$aact_prod_");
  const urlDeProducao = url.hostname === "api.asaas.com";
  const urlDeSandbox = url.hostname === "sandbox.asaas.com";
  if (chaveDeProducao && urlDeSandbox) {
    throw new Error(
      "ASAAS_API_KEY é uma chave de produção (\"$aact_prod_...\"), mas ASAAS_API_URL aponta para o sandbox " +
        `("${ASAAS_API_URL}"). Use https://api.asaas.com/v3 para uma chave de produção.`
    );
  }
  if (!chaveDeProducao && urlDeProducao) {
    throw new Error(
      "ASAAS_API_URL aponta para produção (\"https://api.asaas.com/v3\"), mas ASAAS_API_KEY não parece ser uma " +
        "chave de produção (não começa com \"$aact_prod_\"). Confira se a chave de sandbox não foi colada por engano."
    );
  }
  return ASAAS_API_KEY;
}

/**
 * Erro de VALIDAÇÃO devolvido pelo Asaas (HTTP 400).
 *
 * A distinção importa: o Asaas responde 400 com uma explicação em português
 * sobre os dados enviados ("O valor mínimo para uma cobrança é R$ X", "CPF
 * inválido", "CEP não encontrado"). Essa mensagem é sobre o que a pessoa
 * digitou e pode — deve — chegar até ela. Já um 401/403/500 é problema de
 * configuração ou do servidor: aí vale a mensagem genérica, porque o texto
 * técnico não ajuda quem está comprando e pode revelar detalhes internos.
 *
 * Sem essa separação, o checkout dizia sempre "Não foi possível gerar a
 * cobrança no momento. Tente novamente em instantes." — uma frase que, para
 * um valor abaixo do mínimo do Asaas, é falsa nos dois sentidos: não é
 * momentâneo, e tentar de novo não resolve.
 */
export class AsaasValidacaoError extends Error {
  readonly codigos: string[];

  constructor(mensagem: string, codigos: string[]) {
    super(mensagem);
    this.name = "AsaasValidacaoError";
    this.codigos = codigos;
  }
}

/**
 * As descrições de erro do corpo da resposta do Asaas.
 *
 * Formato documentado: `{ "errors": [{ "code": "...", "description": "..." }] }`.
 * Deliberadamente tolerante — se o corpo não for o JSON esperado, devolve
 * lista vazia e quem chamou trata como erro técnico, em vez de estourar aqui
 * e esconder o status HTTP original.
 */
function errosDoCorpo(corpo: string): { codigo: string; descricao: string }[] {
  try {
    const json = JSON.parse(corpo) as { errors?: { code?: string; description?: string }[] };
    return (json.errors ?? [])
      .map((e) => ({ codigo: e.code ?? "", descricao: (e.description ?? "").trim() }))
      .filter((e) => e.descricao.length > 0);
  } catch {
    return [];
  }
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Falha cedo com uma mensagem clara em vez de deixar o fetch tentar
  // mandar um header inválido (access_token: undefined) ou uma URL
  // inválida — foi exatamente esse tipo de erro opaco que escondia a causa
  // real de "Não foi possível gerar a cobrança" (ver pingAsaas() e o botão
  // de teste em /admin/configuracoes).
  const apiKey = validarConfiguracao();
  const res = await fetch(`${ASAAS_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!res.ok) {
    const body = await res.text();
    const erros = errosDoCorpo(body);
    // 400 = o Asaas recusou os DADOS, e explicou o porquê. Preservamos essa
    // explicação em vez de dissolvê-la numa string de log.
    if (res.status === 400 && erros.length > 0) {
      throw new AsaasValidacaoError(
        erros.map((e) => e.descricao).join(" "),
        erros.map((e) => e.codigo).filter(Boolean)
      );
    }
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
  /**
   * Parcelamento no cartão. Só enviado quando há mais de uma parcela.
   *
   * O Asaas aceita `installmentCount` + `installmentValue` (o valor de CADA
   * parcela) e cobra exatamente esse valor N vezes. Mandamos o valor da
   * parcela, não o total dividido por lá: assim o que a plataforma calculou e
   * mostrou ao cliente é literalmente o que o gateway cobra — sem uma segunda
   * divisão, com outro arredondamento, do outro lado.
   */
  installmentCount?: number;
  installmentValue?: number;
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

// Diagnóstico do checkout: confirma se a chave/URL configuradas conseguem
// de fato autenticar no Asaas, sem precisar simular uma cobrança inteira.
// Usado pelo botão "Testar conexão" em /admin/configuracoes.
export async function pingAsaas(): Promise<{ ok: true } | { ok: false; mensagem: string }> {
  try {
    await asaasFetch<{ data: unknown[] }>("/customers?limit=1");
    return { ok: true };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * O status REAL de uma cobrança, direto no Asaas.
 *
 * O webhook é o caminho oficial, mas ele depende de estar cadastrado e de
 * chegar. Consultar a cobrança dá à plataforma uma segunda fonte da mesma
 * verdade — a do próprio Asaas — para o caso de o webhook não ter chegado.
 * Sem isso, um Pix pago com o webhook mal configurado fica pendente para
 * sempre na tela, mesmo com o dinheiro já na conta.
 */
export interface AsaasPagamento {
  id: string;
  status: string;
  value: number;
  billingType: AsaasBillingType;
  externalReference: string | null;
  paymentDate?: string | null;
  confirmedDate?: string | null;
}

/**
 * Status que significam "o dinheiro entrou".
 *
 * RECEIVED = compensado. CONFIRMED = confirmado pela operadora (cartão), o
 * repasse ainda vai cair. Os dois liberam o acesso — são os mesmos que o
 * webhook trata em ASAAS_CONFIRMATION_EVENTS.
 *
 * RECEIVED_IN_CASH fica de fora de propósito: é baixa manual registrada no
 * painel do Asaas, não pagamento pelo checkout.
 */
export const STATUS_PAGOS = ["RECEIVED", "CONFIRMED"] as const;

export function estaPago(status: string | null | undefined): boolean {
  return (STATUS_PAGOS as readonly string[]).includes(String(status ?? ""));
}

export async function getPayment(chargeId: string): Promise<AsaasPagamento> {
  return asaasFetch<AsaasPagamento>(`/payments/${encodeURIComponent(chargeId)}`);
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
