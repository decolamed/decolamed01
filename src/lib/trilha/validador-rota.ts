import { capacidadeDaData, diasDeEstudoDaRota, SIMULADOS_POR_ROTA, type Rota } from "@/lib/trilha/rota";

// ============================================================================
// VALIDADOR DA ROTA — nada é publicado sem passar por aqui
//
// O gerador é determinístico e cuidadoso, mas "cuidadoso" não é garantia. A
// rota que chegou ao aluno com 154 passos num dia foi gerada por um código
// que também se achava correto. O validador é a rede: uma etapa explícita,
// entre gerar e gravar, que responde sim ou não.
//
// Ele não conserta nada — só descreve o que está errado. Quem gera decide o
// que fazer, e quem grava se recusa a gravar uma rota inválida.
// ============================================================================

export interface Violacao {
  regra: string;
  detalhe: string;
  /** Dia da rota onde o problema aparece, quando é localizável. */
  routeDay?: number;
}

export interface ResultadoValidacao {
  ok: boolean;
  violacoes: Violacao[];
}

/**
 * Confere a rota contra as regras que não podem ser quebradas.
 *
 * Capacidade, datas, numeração, conteúdo, simulados. Cada uma tem um motivo
 * concreto atrás — todas foram, em algum momento, um defeito real na tela do
 * aluno.
 */
export function validarRota(rota: Rota): ResultadoValidacao {
  const v: Violacao[] = [];
  const { dias, parametros: p } = rota;

  if (dias.length === 0) return { ok: true, violacoes: [] };

  const estudo = diasDeEstudoDaRota(dias);

  // ---- Capacidade -------------------------------------------------------
  // A restrição central: o aluno disse quanto consegue estudar por dia, e
  // isso é um teto, não uma sugestão.
  dias.forEach((d) => {
    if (d.tipo === "prova" || d.tipo === "descanso") return;
    const teto = capacidadeDaData(d.scheduledDate, p);
    if (d.minutos > teto) {
      v.push({
        regra: "capacidade-do-dia",
        routeDay: d.routeDay,
        detalhe: `Dia ${d.routeDay} (${d.scheduledDate}) tem ${d.minutos} min para uma capacidade de ${teto} min.`
      });
    }
  });

  const capacidadeTotal = estudo
    .filter((d) => d.tipo !== "descanso")
    .reduce((s, d) => s + capacidadeDaData(d.scheduledDate, p), 0);
  const cargaTotal = dias.reduce((s, d) => s + d.minutos, 0);
  if (cargaTotal > capacidadeTotal) {
    v.push({
      regra: "capacidade-total",
      detalhe: `A rota pede ${cargaTotal} min e o aluno tem ${capacidadeTotal} min até a prova.`
    });
  }

  // ---- Datas ------------------------------------------------------------
  dias.forEach((d) => {
    if (d.scheduledDate < p.inicio) {
      v.push({
        regra: "data-antes-do-inicio",
        routeDay: d.routeDay,
        detalhe: `Dia ${d.routeDay} caiu em ${d.scheduledDate}, antes do início (${p.inicio}).`
      });
    }
    if (d.tipo !== "prova" && d.scheduledDate >= p.dataProva) {
      v.push({
        regra: "estudo-no-dia-da-prova",
        routeDay: d.routeDay,
        detalhe: `Dia ${d.routeDay} é ${d.tipo} e caiu em ${d.scheduledDate}, na prova ou depois.`
      });
    }
  });

  dias.forEach((d, i) => {
    if (i > 0 && d.scheduledDate <= dias[i - 1].scheduledDate) {
      v.push({
        regra: "datas-fora-de-ordem",
        routeDay: d.routeDay,
        detalhe: `Dia ${d.routeDay} (${d.scheduledDate}) não vem depois do dia anterior (${dias[i - 1].scheduledDate}).`
      });
    }
  });

  // ---- Numeração --------------------------------------------------------
  // 1..N sem buraco. O número do template nunca é o número da missão.
  dias.forEach((d, i) => {
    if (d.routeDay !== i + 1) {
      v.push({
        regra: "numeracao",
        routeDay: d.routeDay,
        detalhe: `A posição ${i + 1} da rota está numerada como ${d.routeDay}.`
      });
    }
  });

  // ---- Dia da prova -----------------------------------------------------
  const provas = dias.filter((d) => d.tipo === "prova");
  if (provas.length !== 1) {
    v.push({ regra: "dia-da-prova", detalhe: `A rota tem ${provas.length} dias de prova; deveria ter 1.` });
  }
  provas.forEach((d) => {
    if (d.itens.length > 0) {
      v.push({
        regra: "dia-da-prova-com-conteudo",
        routeDay: d.routeDay,
        detalhe: "O dia da prova não pode ter atividade nenhuma."
      });
    }
    if (d.scheduledDate !== p.dataProva) {
      v.push({
        regra: "dia-da-prova",
        routeDay: d.routeDay,
        detalhe: `O dia da prova está em ${d.scheduledDate} e a prova é em ${p.dataProva}.`
      });
    }
  });

  // ---- Conteúdo ---------------------------------------------------------
  // Nenhum dia de estudo chega vazio ao aluno. Descanso é uma decisão
  // explícita e tem título próprio; vazio é falha de planejamento.
  dias.forEach((d) => {
    if (d.tipo === "prova" || d.tipo === "descanso") return;
    if (d.itens.length === 0) {
      v.push({
        regra: "dia-de-estudo-vazio",
        routeDay: d.routeDay,
        detalhe: `Dia ${d.routeDay} (${d.tipo}) chegaria ao aluno sem nenhuma atividade.`
      });
    }
  });

  // ---- Simulados --------------------------------------------------------
  const simulados = dias.filter((d) => d.tipo === "simulado");
  if (estudo.length >= SIMULADOS_POR_ROTA && simulados.length !== SIMULADOS_POR_ROTA) {
    v.push({
      regra: "quantidade-de-simulados",
      detalhe: `A rota tem ${simulados.length} simulados; toda rota precisa de ${SIMULADOS_POR_ROTA}.`
    });
  }
  if (simulados.length === SIMULADOS_POR_ROTA) {
    const [s1, s2] = simulados;
    if (s1.scheduledDate >= s2.scheduledDate) {
      v.push({ regra: "ordem-dos-simulados", detalhe: "Os dois simulados estão no mesmo dia ou fora de ordem." });
    }
    // O 2º simulado precisa deixar tempo de corrigir o que ele revelar. Numa
    // janela curta demais nem sempre dá — mas ficar no ÚLTIMO dia antes da
    // prova nunca serve, porque não sobra nada para revisar.
    const ultimoDeEstudo = estudo[estudo.length - 1];
    if (estudo.length > 2 && s2.routeDay === ultimoDeEstudo.routeDay) {
      v.push({
        regra: "simulado-2-no-ultimo-dia",
        routeDay: s2.routeDay,
        detalhe: "O 2º simulado ficou no último dia antes da prova, sem espaço para corrigir os erros."
      });
    }
  }

  return { ok: v.length === 0, violacoes: v };
}

/** Uma linha por violação — para log de servidor. */
export function descreverViolacoes(r: ResultadoValidacao): string {
  return r.violacoes.map((x) => `[${x.regra}] ${x.detalhe}`).join("\n");
}
