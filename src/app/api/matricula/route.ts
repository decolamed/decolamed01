import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { findOrCreateCustomer, createCharge, getPixQrCode } from "@/lib/asaas/client";

const bodySchema = z.object({
  planoId: z.string().uuid(),
  nome: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().min(11),
  telefone: z.string().min(8),
  cep: z.string().min(8),
  numeroEndereco: z.string().min(1),
  billingType: z.enum(["PIX", "BOLETO", "CREDIT_CARD"])
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", detalhes: parsed.error.flatten() }, { status: 400 });
  }

  const { planoId, nome, email, cpf, telefone, cep, numeroEndereco, billingType } = parsed.data;
  const supabase = createAdminClient();

  const { data: plano, error: planoError } = await supabase
    .from("planos")
    .select("*")
    .eq("id", planoId)
    .eq("ativo", true)
    .single();

  if (planoError || !plano) {
    return NextResponse.json({ error: "Plano não encontrado ou indisponível." }, { status: 404 });
  }

  // 1. Pré-cadastro no Supabase, antes de qualquer chamada externa.
  const { data: preCadastro, error: preCadastroError } = await supabase
    .from("pre_cadastros")
    .insert({ nome, email, cpf, telefone, plano_id: planoId })
    .select()
    .single();

  if (preCadastroError || !preCadastro) {
    return NextResponse.json({ error: "Não foi possível salvar o pré-cadastro." }, { status: 500 });
  }

  try {
    // 2. Cliente no Asaas (reaproveita se já existir pelo CPF).
    const customer = await findOrCreateCustomer({
      name: nome,
      email,
      cpfCnpj: cpf.replace(/\D/g, ""),
      mobilePhone: telefone.replace(/\D/g, ""),
      postalCode: cep.replace(/\D/g, ""),
      addressNumber: numeroEndereco,
      externalReference: preCadastro.id
    });

    // 3. Cobrança. dueDate = hoje + 2 dias úteis (ajuste conforme sua regra comercial).
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);

    const charge = await createCharge({
      customer: customer.id,
      billingType,
      value: plano.preco_centavos / 100,
      dueDate: dueDate.toISOString().slice(0, 10),
      description: `Matrícula Decola Med — ${plano.nome}`,
      externalReference: preCadastro.id
    });

    await supabase
      .from("pre_cadastros")
      .update({ asaas_customer_id: customer.id, asaas_charge_id: charge.id })
      .eq("id", preCadastro.id);

    // Response no formato MatriculaChargeResult (src/types/matricula.ts) — a
    // página de confirmação consome exatamente este payload via
    // sessionStorage, então billingType/value/dueDate precisam vir aqui
    // mesmo não sendo usados por esta rota em si.
    const response: Record<string, unknown> = {
      chargeId: charge.id,
      billingType,
      value: plano.preco_centavos / 100,
      dueDate,
      invoiceUrl: charge.invoiceUrl,
      bankSlipUrl: charge.bankSlipUrl ?? null,
      pix: null
    };

    if (billingType === "PIX") {
      const pix = await getPixQrCode(charge.id);
      response.pix = pix;
    }

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("Erro ao integrar com o Asaas:", err);
    return NextResponse.json(
      { error: "Não foi possível gerar a cobrança no momento. Tente novamente em instantes." },
      { status: 502 }
    );
  }
}
