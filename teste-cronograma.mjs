/**
 * TESTE: gerarCronogramaAdaptativo
 *
 * Simula o cenário:
 *   - Cronograma base: 40 dias de estudo (já inseridos no banco)
 *   - Disponibilidade: 80 dias até a prova
 *   - Dias livres: ~40 (os que o cronograma base não cobriu)
 *   - Briefing: Turbulência em Biologia e Química
 *   - Respostas de questões com erros concentrados (para testar o score)
 *
 * Roda com: node --env-file=.env.local teste-cronograma.mjs
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ALUNO_ID = "cf0273a5-35e4-4f00-a77c-1c48182c17c9";

async function sql(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });
  return res.json();
}

async function query(table, options = {}) {
  const params = new URLSearchParams();
  if (options.select) params.set("select", options.select);
  if (options.eq) Object.entries(options.eq).forEach(([k, v]) => params.set(k, `eq.${v}`));
  if (options.gte) Object.entries(options.gte).forEach(([k, v]) => params.set(k, `gte.${v}`));
  if (options.order) params.set("order", options.order);
  if (options.limit) params.set("limit", options.limit);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  return res.json();
}

async function insert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(Array.isArray(data) ? data : [data])
  });
  return res.status;
}

// ---- Lógica do gerador (idêntica ao motor.ts) ----

function calcularPrecisaoPorMateria(respostas, pesos) {
  const mapa = new Map();
  respostas.forEach((r) => {
    const mat = r.questoes_materia;
    if (!mat) return;
    const atual = mapa.get(mat) ?? { acertos: 0, total: 0 };
    atual.total++;
    if (r.correta) atual.acertos++;
    mapa.set(mat, atual);
  });

  const resultado = new Map();
  mapa.forEach(({ acertos, total }, materia) => {
    const precisao = total > 0 ? (acertos / total) * 100 : 50;
    const peso = pesos.get(materia) ?? 1;
    resultado.set(materia, { acertos, total, precisao, peso, ganhoPotencial: (100 - precisao) * peso });
  });
  return resultado;
}

async function testar() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   TESTE: Gerador de Cronograma Adaptativo   ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Variáveis de ambiente não encontradas.");
    console.log("   Rode com: node --env-file=.env.local teste-cronograma.mjs");
    process.exit(1);
  }

  // 1. Carregar briefing
  console.log("1. Carregando briefing...");
  const briefings = await query("aluno_briefing", {
    select: "data_prova,inicio_estudos,horas_por_dia_semana,dias_estuda,sentimentos",
    eq: { aluno_id: ALUNO_ID }
  });
  const briefing = briefings[0];
  if (!briefing) { console.error("❌ Briefing não encontrado."); process.exit(1); }
  console.log(`   Prova em: ${briefing.data_prova}`);
  console.log(`   Sentimentos: ${JSON.stringify(briefing.sentimentos)}`);

  // 2. Carregar missões existentes
  console.log("\n2. Missões já agendadas...");
  const hoje = new Date().toISOString().slice(0, 10);
  const missoesExistentes = await query("aluno_missoes", {
    select: "data,titulo,materia,origem",
    eq: { aluno_id: ALUNO_ID },
    order: "data.asc"
  });
  const missoesBase = missoesExistentes.filter((m) => m.origem === "briefing_inicial");
  const missoesCopiloto = missoesExistentes.filter((m) => m.origem === "copiloto");
  console.log(`   Base (briefing_inicial): ${missoesBase.length} missões`);
  console.log(`   Copiloto (geradas):       ${missoesCopiloto.length} missões`);

  // 3. Calcular dias livres
  const diasOcupados = new Set(missoesExistentes.map((m) => m.data));
  const dataProva = new Date(briefing.data_prova);
  const hojeDate = new Date();
  const diasTotais = Math.ceil((dataProva - hojeDate) / (1000 * 60 * 60 * 24));
  const diasEstuda = new Set(briefing.dias_estuda ?? []);
  const MAPA_DIA = { 0: "dom", 1: "seg", 2: "ter", 3: "qua", 4: "qui", 5: "sex", 6: "sab" };

  const diasLivres = [];
  for (let d = 1; d <= diasTotais; d++) {
    const data = new Date(hojeDate);
    data.setDate(hojeDate.getDate() + d);
    const iso = data.toISOString().slice(0, 10);
    const diaSemana = MAPA_DIA[data.getDay()];
    if (diasEstuda.size > 0 && !diasEstuda.has(diaSemana)) continue;
    if (!diasOcupados.has(iso)) diasLivres.push(iso);
  }

  console.log(`\n3. Análise temporal:`);
  console.log(`   Dias até a prova:   ${diasTotais}`);
  console.log(`   Dias com missão:    ${diasOcupados.size}`);
  console.log(`   Dias LIVRES:        ${diasLivres.length}`);

  // 4. Carregar respostas para calcular precisão
  console.log("\n4. Calculando precisão por matéria...");
  const respostas = await query("respostas_aluno", {
    select: "correta,questoes(materia)",
    eq: { aluno_id: ALUNO_ID }
  });
  // Normalizar join
  const respostasNorm = respostas.map((r) => ({
    correta: r.correta,
    questoes_materia: r.questoes?.materia ?? null
  }));

  const pesos = await query("materias_peso", { select: "materia,peso" });
  const pesosMap = new Map(pesos.map((p) => [p.materia, Number(p.peso)]));
  const precisaoPorMateria = calcularPrecisaoPorMateria(respostasNorm, pesosMap);

  // 5. Calcular scores
  const MATERIAS = ["Biologia", "Química", "Física", "Matemática", "Português", "História", "Geografia"];
  const SENTIMENTO_BONUS = { "Turbulência": 2.0, "Atenção": 1.3, "Domínio": 0.7 };
  const scores = MATERIAS.map((mat) => {
    const p = pesosMap.get(mat) ?? 1;
    const d = precisaoPorMateria.get(mat);
    const precisao = d?.precisao ?? 50;
    const sentimento = briefing.sentimentos?.[mat] ?? "Atenção";
    const bonus = SENTIMENTO_BONUS[sentimento] ?? 1.0;
    const score = (100 - precisao) * p * bonus;
    return { materia: mat, score, peso: p, precisao, sentimento };
  }).sort((a, b) => b.score - a.score);

  console.log("\n   PRIORIDADE CALCULADA PELO ALGORITMO:");
  console.log("   " + "─".repeat(72));
  scores.forEach((s, i) => {
    const bar = "█".repeat(Math.round(s.score / 20));
    const tag = s.sentimento === "Turbulência" ? "🔴" : s.sentimento === "Atenção" ? "🟡" : "🟢";
    console.log(`   ${(i + 1)}. ${tag} ${s.materia.padEnd(12)} | Score: ${String(Math.round(s.score)).padStart(5)} | Prec: ${String(Math.round(s.precisao)).padStart(3)}% | Peso: ${s.peso} | ${bar}`);
  });

  // 6. Distribuir slots
  const totalScore = scores.reduce((s, m) => s + m.score, 0);
  const slotsMateria = {};
  scores.forEach(({ materia, score }) => {
    slotsMateria[materia] = Math.max(1, Math.round((score / totalScore) * diasLivres.length));
  });

  // Ajustar para não ultrapassar total
  let totalSlots = Object.values(slotsMateria).reduce((s, n) => s + n, 0);
  for (let i = scores.length - 1; i >= 0 && totalSlots > diasLivres.length; i--) {
    const mat = scores[i].materia;
    const reduzir = Math.min(totalSlots - diasLivres.length, slotsMateria[mat] - 1);
    slotsMateria[mat] -= reduzir;
    totalSlots -= reduzir;
  }

  console.log("\n   DISTRIBUIÇÃO DE DIAS:");
  console.log("   " + "─".repeat(40));
  scores.forEach(({ materia }) => {
    const slots = slotsMateria[materia];
    const bar = "▓".repeat(slots);
    console.log(`   ${materia.padEnd(12)}: ${String(slots).padStart(2)} dias  ${bar}`);
  });
  console.log(`   ${"Total".padEnd(12)}: ${diasLivres.length} dias`);

  // 7. Gerar e inserir missões
  if (missoesCopiloto.length > 0) {
    console.log(`\n5. Já existem ${missoesCopiloto.length} missões do Copiloto. Pulando inserção.`);
    console.log("   (Delete as missões com origem='copiloto' para re-testar a geração)");
  } else {
    console.log("\n5. Gerando missões para os dias livres...");
    const TIPOS_CICLO = ["questoes", "questoes", "flashcards", "revisao", "aula"];
    const TITULO = { questoes: "Questões", flashcards: "Flashcards", revisao: "Revisão", aula: "Aula" };
    const DURACAO = { questoes: 40, flashcards: 25, revisao: 30, aula: 45 };

    // Monta sequência intercalada
    const buckets = scores.map(({ materia }) =>
      Array.from({ length: slotsMateria[materia] }, (_, i) => ({
        materia,
        tipo: TIPOS_CICLO[i % TIPOS_CICLO.length]
      }))
    );
    const sequencia = [];
    const max = Math.max(...buckets.map((b) => b.length));
    for (let i = 0; i < max; i++) {
      buckets.forEach((b) => { if (b[i]) sequencia.push(b[i]); });
    }

    const missoes = sequencia.slice(0, diasLivres.length).map((item, i) => {
      const s = scores.find((x) => x.materia === item.materia);
      return {
        aluno_id: ALUNO_ID,
        data: diasLivres[i],
        titulo: `${TITULO[item.tipo]} · ${item.materia} — Copiloto`,
        materia: item.materia,
        tipo: item.tipo,
        duracao_minutos: DURACAO[item.tipo],
        prioridade: s?.sentimento === "Turbulência" ? 2 : 1,
        origem: "copiloto",
        motivo_copiloto: `Copiloto: ${s?.sentimento} | precisão ${Math.round(s?.precisao ?? 50)}% | peso ${s?.peso ?? 1}`
      };
    });

    const status = await insert("aluno_missoes", missoes);
    if (status === 201) {
      console.log(`   ✅ ${missoes.length} missões inseridas com sucesso!`);
    } else {
      console.log(`   ❌ Erro ao inserir (status ${status})`);
    }
  }

  // 8. Resultado final
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║                RESULTADO FINAL               ║");
  console.log("╚══════════════════════════════════════════════╝");
  const missoesFinais = await query("aluno_missoes", {
    select: "data,titulo,materia,origem,prioridade",
    eq: { aluno_id: ALUNO_ID },
    order: "data.asc"
  });
  const base = missoesFinais.filter((m) => m.origem === "briefing_inicial");
  const copiloto = missoesFinais.filter((m) => m.origem === "copiloto");

  console.log(`\n Missões BASE (cronograma fixo):     ${base.length}`);
  console.log(` Missões COPILOTO (dias livres):     ${copiloto.length}`);
  console.log(` TOTAL:                              ${missoesFinais.length}`);
  console.log(` Cobertura de ${diasTotais} dias disponíveis: ${Math.round((missoesFinais.length / diasTotais) * 100)}%`);

  console.log("\n DISTRIBUIÇÃO FINAL DO COPILOTO:");
  const distFinal = {};
  copiloto.forEach((m) => { distFinal[m.materia] = (distFinal[m.materia] ?? 0) + 1; });
  Object.entries(distFinal).sort((a, b) => b[1] - a[1]).forEach(([mat, qtd]) => {
    const s = scores.find((x) => x.materia === mat);
    const tag = s?.sentimento === "Turbulência" ? "🔴" : s?.sentimento === "Atenção" ? "🟡" : "🟢";
    console.log(`  ${tag} ${mat.padEnd(12)}: ${qtd} dias`);
  });

  console.log("\n PRIMEIRAS 10 MISSÕES DO COPILOTO:");
  copiloto.slice(0, 10).forEach((m) => {
    const prio = m.prioridade >= 2 ? "⚡" : "  ";
    console.log(`  ${prio} ${m.data}  ${m.titulo}`);
  });
  console.log("");
}

testar().catch(console.error);
