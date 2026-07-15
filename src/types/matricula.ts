// Formato retornado por POST /api/matricula.
// A página de confirmação consome exatamente este payload (via sessionStorage,
// veja matricula-form.tsx) em vez de buscar os dados de novo no Asaas.

export type MatriculaBillingType = "PIX" | "BOLETO" | "CREDIT_CARD";

export interface MatriculaPixData {
  encodedImage: string; // base64 do QR Code (sem prefixo data:)
  payload: string; // Pix copia-e-cola
  expirationDate: string;
}

export interface MatriculaChargeResult {
  chargeId: string;
  billingType: MatriculaBillingType;
  value: number; // em reais (ex: 397.00)
  dueDate: string; // YYYY-MM-DD
  invoiceUrl: string;
  bankSlipUrl: string | null;
  pix: MatriculaPixData | null;
}
