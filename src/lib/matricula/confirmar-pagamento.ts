import type { SupabaseClient } from "@supabase/supabase-js";
import { mapBillingTypeToFormaPagamento, type AsaasBillingType } from "@/lib/asaas/client";

// ============================================================================
// PAGAMENTO CONFIRMADO → CONTA LIBERADA
//
// Um pagamento confirmado vira: usuário no Auth (por convite, para o aluno
// criar a própria senha), perfil, matrícula ativa e a linha de venda. Este
// módulo é o ÚNICO lugar onde isso acontece.
//
// Ele existe porque a confirmação chega por dois caminhos, e os dois precisam
// produzir exatamente o mesmo resultado:
//
//   1. o WEBHOOK do Asaas — o caminho oficial, que avisa sozinho;
//   2. a CONSULTA de status, quando a tela do checkout pergunta "já pagou?".
//
// O segundo caminho existe porque o primeiro pode não chegar: webhook não
// cadastrado, token divergente, indisponibilidade momentânea. Sem ele, um Pix
// pago fica pendente para sempre na tela — com o dinheiro já na conta. Foi
// exatamente o que aconteceu no primeiro teste real de compra.
//
// IDEMPOTÊNCIA é o requisito central. O Asaas manda PAYMENT_CONFIRMED e
// PAYMENT_RECEIVED para a mesma cobrança, reenvia quando a resposta não é
// 200, e a tela pode consultar o status ao mesmo tempo. Nada disso pode criar
// aluno duplicado, matrícula duplicada, e-mail repetido ou contar o cupom
// duas vezes. A garantia vem de `pre_cadastros.convertido`: quem entra e o vê
// verdadeiro não repete nenhum dos passos de criação.
// ============================================================================

type Cliente = SupabaseClient<any, any, any>;

export interface PagamentoConfirmado {
  /** `payment.id` no Asaas — a chave de idempotência da linha de venda. */
  asaasPaymentId: string;
  /** `externalReference`: o id do pré-cadastro criado no checkout. */
  preCadastroId: string;
  /** Valor em reais, como o Asaas devolve. */
  valor: number;
  billingType?: AsaasBillingType;
  dataPagamento?: string | null;
  /** RECEIVED (compensado) marca a venda como recebida; o resto, confirmada. */
  recebido: boolean;
  /** O evento ou status bruto, guardado junto da venda para auditoria. */
  payload: Record<string, unknown>;
}

export type ResultadoDaConfirmacao =
  | { ok: true; jaEstavaConvertido: boolean; matriculaId: string | null }
  | { ok: false; motivo: string; repetir: boolean };

/**
 * Libera o acesso de um pagamento confirmado. Seguro para chamar N vezes.
 *
 * `repetir: true` no erro significa "vale a pena tentar de novo" — o webhook
 * responde 500 para o Asaas reenviar, e a consulta de status tenta na próxima
 * vez que a tela perguntar. `repetir: false` é problema que reenvio não
 * resolve (pré-cadastro inexistente, por exemplo).
 */
export async function confirmarPagamento(
  supabase: Cliente,
  dados: PagamentoConfirmado
): Promise<ResultadoDaConfirmacao> {
  const { data: preCadastro } = await supabase
    .from("pre_cadastros")
    .select("*, planos(*)")
    .eq("id", dados.preCadastroId)
    .maybeSingle();

  if (!preCadastro) {
    console.error("Confirmação de pagamento sem pré-cadastro:", dados.preCadastroId);
    return { ok: false, motivo: "Pré-cadastro não encontrado.", repetir: false };
  }

  // ---- Comissão do parceiro, quando a compra veio por cupom de afiliado ----
  let parceiroId: string | null = null;
  let comissaoCentavos = 0;
  if (preCadastro.cupom_codigo) {
    const { data: cupomInfo } = await supabase
      .from("cupons")
      .select("parceiro_id, percentual_comissao")
      .eq("codigo", preCadastro.cupom_codigo)
      .maybeSingle();
    if (cupomInfo?.parceiro_id) {
      parceiroId = cupomInfo.parceiro_id;
      comissaoCentavos = Math.round((dados.valor * 100 * (cupomInfo.percentual_comissao ?? 0)) / 100);
    }
  }

  let matriculaId: string | null = null;
  const jaEstavaConvertido = Boolean(preCadastro.convertido);

  if (jaEstavaConvertido) {
    // Segunda passagem (o outro evento do Asaas, um reenvio, ou a tela
    // consultando o status). A conta já existe — nada é criado de novo, e
    // nenhum e-mail sai. Só localizamos a matrícula para vincular a venda.
    const { data: matriculaExistente } = await supabase
      .from("matriculas")
      .select("id")
      .eq("pre_cadastro_id", preCadastro.id)
      .maybeSingle();
    matriculaId = matriculaExistente?.id ?? null;
  } else {
    const criacao = await criarContaDoAluno(supabase, preCadastro);
    if (!criacao.ok) return criacao;
    matriculaId = criacao.matriculaId;
  }

  // ---- A venda ------------------------------------------------------------
  // Idempotente por `asaas_payment_id`: reenvio atualiza a mesma linha em vez
  // de criar outra. É o que impede a mesma compra de aparecer duas vezes em
  // /admin/vendas e a comissão do parceiro de ser gerada em dobro.
  const { error: erroPagamento } = await supabase.from("pagamentos").upsert(
    {
      asaas_payment_id: dados.asaasPaymentId,
      pre_cadastro_id: preCadastro.id,
      matricula_id: matriculaId,
      valor_centavos: Math.round(dados.valor * 100),
      forma_pagamento: mapBillingTypeToFormaPagamento(dados.billingType),
      status: dados.recebido ? "recebido" : "confirmado",
      data_pagamento: dados.dataPagamento ?? new Date().toISOString(),
      payload: dados.payload,
      origem_pagamento: "asaas",
      cupom_codigo: preCadastro.cupom_codigo,
      parceiro_id: parceiroId,
      comissao_centavos: comissaoCentavos,
      comprador_nome: preCadastro.nome,
      comprador_email: preCadastro.email,
      plano_nome: preCadastro.planos?.nome ?? null,
      plano_id: preCadastro.plano_id
    },
    { onConflict: "asaas_payment_id" }
  );

  if (erroPagamento) {
    // O aluno já tem acesso (a matrícula foi criada acima) — isto não o
    // bloqueia. Mas sem esta linha a venda não aparece no painel e a comissão
    // não é gerada, então pedimos retentativa.
    console.error("Falha ao registrar a venda:", dados.asaasPaymentId, erroPagamento.message);
    return { ok: false, motivo: "Falha ao registrar o pagamento.", repetir: true };
  }

  return { ok: true, jaEstavaConvertido, matriculaId };
}

/**
 * Cria usuário, perfil e matrícula. Só roda na PRIMEIRA confirmação.
 *
 * A ordem importa e é a mesma de antes: o convite primeiro (é ele que tem a
 * unicidade de e-mail de verdade), depois o perfil, depois a matrícula. Uma
 * falha no meio devolve `repetir: true` e o Asaas reenvia — melhor do que
 * seguir em frente com um estado pela metade que só apareceria como bug muito
 * depois.
 */
async function criarContaDoAluno(
  supabase: Cliente,
  preCadastro: Record<string, any>
): Promise<{ ok: true; matriculaId: string } | { ok: false; motivo: string; repetir: boolean }> {
  // 1. O usuário. Por CONVITE: a senha nunca é criada pela plataforma nem
  //    enviada por e-mail — o aluno define a dele pelo link, que é individual
  //    e tem validade. É o mecanismo do Supabase Auth, não um paralelo.
  const { data: convidado, error: erroConvite } = await supabase.auth.admin.inviteUserByEmail(
    preCadastro.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/redefinir-senha`,
      data: { nome: preCadastro.nome }
    }
  );

  if (erroConvite || !convidado?.user) {
    const mensagem = erroConvite?.message ?? "";
    // Já existe conta com esse e-mail: pode ser um aluno que comprou de novo,
    // ou uma confirmação anterior que criou o usuário e falhou depois. Nos
    // dois casos, seguir com o usuário existente é o certo — criar outro não
    // é possível, e abortar deixaria a compra sem matrícula.
    // "duplicate key ... users_email_partial_key" entra aqui porque foi o que
    // o Supabase devolveu de verdade quando duas confirmações da MESMA compra
    // correram juntas (o webhook e a consulta da tela, em 19/08). A frase não
    // contém "already", "registered" nem "exists" — então a rede de segurança
    // acima não pegava, e a compra parava sem matrícula. Reconhecer o texto do
    // Postgres é reconhecer o mesmo fato: a conta já existe.
    if (/already|registered|exists|duplicate key|23505/i.test(mensagem)) {
      const existente = await usuarioPorEmail(supabase, preCadastro.email);
      if (existente) return finalizarConta(supabase, preCadastro, existente);
    }
    console.error("Falha ao convidar o aluno:", preCadastro.email, mensagem);
    return { ok: false, motivo: "Falha ao criar o usuário.", repetir: true };
  }

  return finalizarConta(supabase, preCadastro, convidado.user.id);
}

/** Perfil + matrícula + marcação de convertido + contagem do cupom. */
async function finalizarConta(
  supabase: Cliente,
  preCadastro: Record<string, any>,
  alunoId: string
): Promise<{ ok: true; matriculaId: string } | { ok: false; motivo: string; repetir: boolean }> {
  // `upsert` e não `insert`: numa retentativa o perfil já pode existir da
  // passagem anterior, e um erro de chave duplicada aqui abortaria a
  // liberação de um aluno que já pagou.
  const { error: erroPerfil } = await supabase.from("profiles").upsert(
    {
      id: alunoId,
      nome: preCadastro.nome,
      email: preCadastro.email,
      telefone: preCadastro.telefone,
      cpf: preCadastro.cpf,
      role: "aluno",
      plano_id: preCadastro.plano_id
    },
    { onConflict: "id" }
  );

  if (erroPerfil) {
    // Sem perfil o aluno teria login criado e nenhum jeito de o app
    // reconhecê-lo. Melhor pedir retentativa do que deixar meio-caminho.
    console.error("Falha ao criar o perfil do aluno:", alunoId, erroPerfil.message);
    return { ok: false, motivo: "Falha ao criar o perfil.", repetir: true };
  }

  const duracaoMeses: number | null = preCadastro.planos?.duracao_meses ?? null;
  let acessoExpiraEm: string | null = null;
  if (duracaoMeses) {
    const expira = new Date();
    expira.setMonth(expira.getMonth() + duracaoMeses);
    acessoExpiraEm = expira.toISOString();
  }

  const { data: matricula, error: erroMatricula } = await supabase
    .from("matriculas")
    .upsert(
      {
        aluno_id: alunoId,
        pre_cadastro_id: preCadastro.id,
        plano_id: preCadastro.plano_id,
        status: "ativa",
        asaas_customer_id: preCadastro.asaas_customer_id,
        asaas_charge_id: preCadastro.asaas_charge_id,
        acesso_liberado_em: new Date().toISOString(),
        acesso_expira_em: acessoExpiraEm,
        cupom_codigo: preCadastro.cupom_codigo
      },
      { onConflict: "pre_cadastro_id" }
    )
    .select("id")
    .single();

  if (erroMatricula || !matricula) {
    console.error("Falha ao criar a matrícula:", preCadastro.id, erroMatricula?.message);
    return { ok: false, motivo: "Falha ao criar a matrícula.", repetir: true };
  }

  // A marca de convertido é o que fecha a idempotência: daqui em diante,
  // qualquer nova confirmação da mesma compra não cria nada e não manda
  // e-mail. Por isso ela é gravada ANTES de contar o cupom.
  const { error: erroConvertido } = await supabase
    .from("pre_cadastros")
    .update({ convertido: true })
    .eq("id", preCadastro.id);

  if (erroConvertido) {
    // Não desfaz o que já foi criado — o aluno tem acesso, e isso é o que
    // importa. Mas fica o rastro: sem a marca, uma nova confirmação tentaria
    // convidar de novo e o aluno receberia um segundo e-mail.
    console.error("Falha ao marcar o pré-cadastro como convertido:", preCadastro.id, erroConvertido.message);
  }

  if (preCadastro.cupom_codigo) {
    const { data: cupom } = await supabase
      .from("cupons")
      .select("usos")
      .eq("codigo", preCadastro.cupom_codigo)
      .maybeSingle();
    if (cupom) {
      await supabase
        .from("cupons")
        .update({ usos: (cupom.usos ?? 0) + 1 })
        .eq("codigo", preCadastro.cupom_codigo);
    }
  }

  return { ok: true, matriculaId: matricula.id as string };
}

/** O id do usuário no Auth a partir do e-mail. */
async function usuarioPorEmail(supabase: Cliente, email: string): Promise<string | null> {
  // O perfil é a via mais direta e barata: se ele existe, o id do Auth é o
  // mesmo. Só recorremos à listagem do Auth quando o perfil não existe — que
  // é justamente o caso de uma confirmação anterior interrompida no meio.
  const { data: perfil } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
  if (perfil?.id) return perfil.id as string;

  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) {
    console.error("Falha ao localizar o usuário por e-mail:", error.message);
    return null;
  }
  const alvo = email.trim().toLowerCase();
  return data.users.find((u) => (u.email ?? "").toLowerCase() === alvo)?.id ?? null;
}
