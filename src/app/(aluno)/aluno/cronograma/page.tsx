import { hojeISO, somarDias } from "@/lib/site/data";
import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { alunoTemCopiloto } from "@/lib/copiloto/permissao";
import { calcularDiaTrilha } from "@/lib/trilha/dia";
import { resolverCronograma } from "@/lib/trilha/resolver";
import { cronogramaDeTela, datasDaRota, diaAtualDaRota } from "@/lib/trilha/rota";
import { rotaDoAluno } from "@/lib/trilha/rota-persistencia";
import { chaveDeItemTrilha } from "@/lib/trilha/progresso";
import { nomeDoDiaDaSemana, dataBR } from "@/lib/site/data";
import type { TrilhaDia, TrilhaItem } from "@/types/database";
import { CronogramaCopiloto } from "@/components/aluno/cronograma-copiloto";

import { ICONE_TIPO } from "@/lib/trilha/catalogo";

const ICONE_TRILHA = ICONE_TIPO;

// Monta o link de destino de cada missão a partir do tipo + ref_id. Sem isso
// a lista fica só de leitura; com isso o aluno toca no item e vai direto pra
// aula/atividade/simulado/redação real.
function montarHref(
  tipo: string,
  refId: string | null,
  urlsAula: Map<string, string>
): string | null {
  switch (tipo) {
    case "aula":
      return refId ? urlsAula.get(refId) ?? null : null;
    case "questoes":
      return refId ? `/aluno/atividades/${refId}` : "/aluno/questoes";
    case "simulado":
      return refId ? `/aluno/simulados/${refId}` : "/aluno/simulados";
    case "flashcards":
      return "/aluno/flashcards";
    default:
      return null;
  }
}

// Item da trilha já traz a URL da aula/pdf/link direto (sem precisar de
// join com conteudos_biblioteca/links_externos), então o link é bem mais
// simples que o do Copiloto.
function montarHrefTrilha(item: TrilhaItem): string | null {
  switch (item.tipo) {
    case "aula":
    case "pdf":
    case "link":
      return item.url;
    case "questoes":
      return item.materia ? `/aluno/questoes?materia=${encodeURIComponent(item.materia)}` : "/aluno/questoes";
    case "flashcards":
      return item.materia ? `/aluno/flashcards?materia=${encodeURIComponent(item.materia)}` : "/aluno/flashcards";
    case "simulado":
      return item.ref_id ? `/aluno/simulados/${item.ref_id}` : "/aluno/simulados";
    case "atividade":
      return item.ref_id ? `/aluno/atividades/${item.ref_id}` : "/aluno/atividades";
    case "pagina":
      // A rota interna escolhida pelo admin vem gravada em `url`.
      return item.url || "/aluno";
    case "redacao":
      return "/aluno/redacao";
    default:
      // "leitura", "revisao" e "livre" não abrem nada de propósito: são
      // blocos de marcar como feito, não conteúdo com destino.
      return null;
  }
}

// O cronograma (trilha_dias) é a BASE de estudo de todo mundo — inclusive de
// quem tem Copiloto. As missões individuais (aluno_missoes) são um ACRÉSCIMO
// adaptativo em cima dele, não um substituto.
//
// Esta página ramificava em "tem Copiloto? → só missões" e nunca chegava ao
// cronograma: um aluno do plano PRO sem missões geradas via "sem cronograma"
// mesmo com os dias todos preenchidos pelo admin. Agora as duas fontes são
// buscadas sempre e renderizadas juntas.
export default async function AlunoCronogramaPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();
  const temCopiloto = await alunoTemCopiloto(profile.id);

  // Fuso da plataforma, não UTC — ver lib/site/data.ts.
  const hojeStr = hojeISO();
  const fimStr = somarDias(hojeStr, 7);

  const [{ data: missoesBrutas }, { data: matricula }, { data: progresso }, { data: briefing }] = await Promise.all([
    supabase
      .from("aluno_missoes")
      .select("*")
      .eq("aluno_id", profile.id)
      .gte("data", hojeStr)
      .lte("data", fimStr)
      .order("data")
      .order("prioridade", { ascending: false }),
    supabase
      .from("matriculas")
      .select("acesso_liberado_em")
      .eq("aluno_id", profile.id)
      .not("acesso_liberado_em", "is", null)
      .order("acesso_liberado_em", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // O que o aluno já concluiu. Sem isso esta tela mostrava o cronograma
    // inteiro sem nenhuma marca de progresso — o aluno via a mesma lista
    // depois de cumprir metade dela.
    supabase.from("aluno_progresso_itens").select("chave").eq("aluno_id", profile.id).eq("concluida", true),
    // Data da prova, início e disponibilidade: é o que define a janela real
    // usada para projetar o cronograma do Voo Guiado.
    supabase
      .from("aluno_briefing")
      .select("data_prova, inicio_estudos, dias_estuda, horas_por_dia_semana")
      .eq("aluno_id", profile.id)
      .maybeSingle()
  ]);

  // Dia do cronograma como esta tela o recebe: da rota (com data e tipo) no
  // Voo Guiado, do template puro no Decolando.
  type DiaDoCronograma = TrilhaDia & { scheduled_date?: string; tipo_rota?: string };

  const concluidas = new Set(((progresso as { chave: string }[]) ?? []).map((p) => p.chave));
  const itemConcluido = (diaNumero: number, indice: number, item: TrilhaItem) => {
    const chave = chaveDeItemTrilha(diaNumero, indice, item);
    return chave ? concluidas.has(chave) : false;
  };

  // ---- Dia de hoje no cronograma ----
  //
  // Esta tela e o painel (aluno/page.tsx) PRECISAM chegar ao mesmo dia. Antes
  // cada uma derivava o seu por conta própria e elas divergiam. Agora as duas
  // passam por `rotaDoAluno()` + `diaAtualDaRota()`, que é a fonte única.
  let diaAtual: number | null = null;
  let diaTrilha: DiaDoCronograma | null = null;
  let todosOsDias: DiaDoCronograma[] = [];
  let cronogramaCompactado = false;
  let datasDoCronograma: Record<number, string> | null = null;

  // Busca o cronograma inteiro, não só o dia de hoje: esta rota é o
  // "cronograma completo", e mostrar um dia só era o que dava a impressão
  // de que os demais tinham sumido. O painel do admin é a fonte oficial.
  const { data: trilhaData } = await supabase.from("trilha_dias").select("*").order("dia_numero");
  // Idem à tela do painel: o cronograma lê o conteúdo atual da biblioteca,
  // não a cópia gravada no jsonb quando o dia foi montado.
  const resolvidos = await resolverCronograma((trilhaData as TrilhaDia[]) ?? []);

  const rota = await rotaDoAluno(supabase, profile.id, {
    temCopiloto,
    briefing: briefing as Parameters<typeof rotaDoAluno>[2]["briefing"],
    template: resolvidos,
    hoje: hojeStr
  });

  if (rota) {
    todosOsDias = cronogramaDeTela(rota);
    datasDoCronograma = datasDaRota(rota);
    cronogramaCompactado = rota.dias.length < resolvidos.length;
    diaAtual = diaAtualDaRota(rota.dias, hojeStr)?.routeDay ?? null;
    diaTrilha = todosOsDias.find((d) => d.dia_numero === diaAtual) ?? null;
  } else if (matricula?.acesso_liberado_em) {
    // Plano Decolando: 40 dias fixos a partir da matrícula, sem briefing.
    todosOsDias = resolvidos;
    diaAtual = calcularDiaTrilha(matricula.acesso_liberado_em);
    diaTrilha = todosOsDias.find((d) => d.dia_numero === diaAtual) ?? null;
  }

  /** "Segunda-feira · 12/08/2026" a partir da rota — sem extrapolar datas. */
  const rotuloData = (diaNumero: number): string | null => {
    const iso = datasDoCronograma?.[diaNumero];
    return iso ? `${nomeDoDiaDaSemana(iso)} · ${dataBR(iso)}` : null;
  };

  // ---- Missões individuais (Copiloto ou cadastradas pelo admin) ----
  const idsAula = (missoesBrutas ?? []).filter((m) => m.tipo === "aula" && m.ref_id).map((m) => m.ref_id as string);
  const urlsAula = new Map<string, string>();
  if (idsAula.length > 0) {
    const { data: conteudos } = await supabase.from("conteudos_biblioteca").select("id, url").in("id", idsAula);
    (conteudos ?? []).forEach((c) => c.url && urlsAula.set(c.id, c.url));
  }
  const missoes = (missoesBrutas ?? []).map((m) => ({ ...m, href: montarHref(m.tipo, m.ref_id, urlsAula) }));

  const semNada = !diaTrilha && missoes.length === 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">🗓️ Cronograma</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">
          ← Voltar ao painel
        </Link>
      </div>

      {temCopiloto && (
        <div className="mt-4 rounded-2xl p-4 text-sm text-white" style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}>
          <p className="font-display font-bold">✈️ Sua rota até a prova</p>
          <p className="mt-1 text-white/70">
            {todosOsDias.length > 0
              ? `São ${todosOsDias.length} dias de estudo, com 2 simulados no caminho, terminando antes da prova. `
              : ""}
            O Copiloto acompanha seu desempenho e acrescenta missões de reforço quando identifica um ponto fraco.
          </p>
          {/* Mesmo aviso do painel: sem ele, o aluno que vê a rota agrupada
              acha que perdeu conteúdo. */}
          {cronogramaCompactado && (
            <p className="mt-2 border-t border-white/15 pt-2 text-white/70">
              Como sua janela é menor que o conteúdo completo, alguns dias reúnem mais de um tema — respeitando as horas por
              dia informadas no briefing. Nenhum conteúdo foi removido.
            </p>
          )}
        </div>
      )}

      {/* Hoje é o dia da prova: nenhuma missão, só o evento. */}
      {diaTrilha?.tipo_rota === "prova" && (
        <div className="mt-4 rounded-2xl p-4 text-sm text-white" style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
            {rotuloData(diaAtual!) ?? "Hoje"}
          </p>
          <p className="mt-1 font-display text-lg font-bold">🎯 {diaTrilha.titulo}</p>
          <p className="mt-1 text-white/70">
            Sem missões hoje. Confira o local da prova, leve documento e caneta. Você se preparou para este dia.
          </p>
        </div>
      )}

      {diaTrilha && diaTrilha.tipo_rota !== "prova" && (
        <>
          <div className="mt-4 rounded-2xl p-4 text-sm text-white" style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
              Dia {diaAtual}
              {todosOsDias.length > 0 ? ` de ${todosOsDias.filter((d) => d.tipo_rota !== "prova").length}` : ""}
            </p>
            <p className="mt-1 font-display font-bold">{diaTrilha.titulo}</p>
            <p className="mt-1 text-white/70">
              {rotuloData(diaAtual!) ?? "Sua missão de hoje, a partir do seu início na plataforma."}
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {diaTrilha.itens.length === 0 && (
              <p className="rounded-2xl bg-white p-4 text-sm text-navy-dark/60 shadow">
                Dia livre — aproveite pra revisar o que quiser.
              </p>
            )}
            {diaTrilha.itens.map((item, i) => {
              const href = montarHrefTrilha(item);
              const feito = itemConcluido(diaTrilha!.dia_numero, i, item);
              const conteudo = (
                <>
                  <span className="text-xl">{ICONE_TRILHA[item.tipo] ?? "📌"}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-display font-bold ${feito ? "text-navy-dark/45 line-through" : "text-navy-dark"}`}>
                      {item.titulo}
                      {feito && <span className="ml-2 align-middle text-[10px] font-black text-green">✓ CONCLUÍDO</span>}
                    </p>
                    {item.materia && <p className="text-xs text-navy-dark/50">{item.materia}</p>}
                  </div>
                  {href && <span className="text-navy-dark/30">↗</span>}
                </>
              );
              return href ? (
                <a
                  key={i}
                  href={href}
                  target={item.tipo === "aula" || item.tipo === "pdf" || item.tipo === "link" ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow hover:bg-navy-dark/5"
                >
                  {conteudo}
                </a>
              ) : (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow">
                  {conteudo}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Cronograma completo — todos os dias cadastrados pelo admin, com o de
          hoje já destacado acima. Antes esta tela mostrava só o dia atual. */}
      {todosOsDias.length > 1 && (
        <>
          <h2 className="mt-8 font-display text-lg font-bold text-navy-dark">
            {/* O dia da prova fecha a rota, mas não é um dia de estudo — não
                entra na contagem anunciada ao aluno. */}
            Cronograma completo · {todosOsDias.filter((d) => d.tipo_rota !== "prova").length} dias
          </h2>
          <div className="mt-3 space-y-2">
            {todosOsDias.map((d) => {
              // Dia da prova: só o evento, sem lista de itens para abrir.
              if (d.tipo_rota === "prova") {
                return (
                  <div
                    key={d.dia_numero}
                    className="rounded-2xl p-4 text-white shadow"
                    style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}
                  >
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-white/60">
                      {rotuloData(d.dia_numero) ?? "Dia da prova"}
                    </p>
                    <p className="mt-1 font-display text-base font-bold">🎯 {d.titulo}</p>
                    <p className="mt-1 text-sm text-white/70">
                      Sem estudo hoje. Confira o local da prova e leve documento e caneta.
                    </p>
                  </div>
                );
              }

              // Véspera reservada para descanso — nada de conteúdo novo.
              if (d.tipo_rota === "descanso") {
                return (
                  <div key={d.dia_numero} className="rounded-2xl border border-orange/40 bg-orange/5 p-4 shadow">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-orange">
                      Dia {d.dia_numero}
                      {rotuloData(d.dia_numero) ? ` · ${rotuloData(d.dia_numero)}` : ""}
                    </p>
                    <p className="mt-1 font-display text-base font-bold text-navy-dark">😴 {d.titulo}</p>
                    <p className="mt-1 text-sm text-navy-dark/60">
                      Durma bem e chegue descansado. Nada de conteúdo novo hoje.
                    </p>
                  </div>
                );
              }

              const passado = diaAtual != null && d.dia_numero < diaAtual;
              const hoje = d.dia_numero === diaAtual;
              const itensDoDia = d.itens ?? [];
              const feitos = itensDoDia.filter((it, i) => itemConcluido(d.dia_numero, i, it)).length;
              const diaConcluido = itensDoDia.length > 0 && feitos === itensDoDia.length;
              return (
                <details
                  key={d.dia_numero}
                  // Dia concluído abre junto com o de hoje: o aluno precisa
                  // conseguir voltar e reassistir o que já cumpriu.
                  open={hoje || diaConcluido}
                  className={`rounded-2xl p-4 shadow ${
                    diaConcluido ? "border border-green/40 bg-green/5" : "bg-white"
                  } ${passado && !diaConcluido ? "opacity-70" : ""}`}
                >
                  <summary className="flex cursor-pointer items-center gap-3">
                    {diaConcluido && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green text-[11px] font-black text-white">
                        ✓
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                        diaConcluido ? "bg-green/15 text-green" : "bg-navy-dark/5 text-navy-dark/60"
                      }`}
                    >
                      Dia {d.dia_numero}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display font-bold text-navy-dark">{d.titulo}</span>
                      {/* Data lida da rota, não extrapolada a partir de hoje. */}
                      {rotuloData(d.dia_numero) && (
                        <span className="block text-[11px] font-semibold text-navy-dark/45">{rotuloData(d.dia_numero)}</span>
                      )}
                    </span>
                    <span className={`text-xs font-semibold ${diaConcluido ? "text-green" : "text-navy-dark/40"}`}>
                      {itensDoDia.length > 0 ? `${feitos}/${itensDoDia.length}` : "0 itens"}
                    </span>
                  </summary>
                  <div className="mt-3 space-y-1.5">
                    {(d.itens ?? []).length === 0 && (
                      <p className="text-sm text-navy-dark/50">Dia livre.</p>
                    )}
                    {itensDoDia.map((item, i) => {
                      const href = montarHrefTrilha(item);
                      const feito = itemConcluido(d.dia_numero, i, item);
                      const linha = (
                        <>
                          {/* O item cumprido permanece na lista e clicável —
                              só ganha a marca. Removê-lo tiraria do aluno a
                              chance de rever a aula. */}
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                              feito ? "bg-green text-white" : "border border-navy-dark/20"
                            }`}
                          >
                            {feito ? "✓" : ""}
                          </span>
                          <span>{ICONE_TRILHA[item.tipo] ?? "📌"}</span>
                          <span
                            className={`min-w-0 flex-1 truncate text-sm ${
                              feito ? "text-navy-dark/45 line-through" : "text-navy-dark"
                            }`}
                          >
                            {item.titulo}
                          </span>
                          {href && <span className="text-navy-dark/30">↗</span>}
                        </>
                      );
                      return href ? (
                        <a
                          key={i}
                          href={href}
                          target={item.tipo === "aula" || item.tipo === "pdf" || item.tipo === "link" ? "_blank" : undefined}
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-navy-dark/5"
                        >
                          {linha}
                        </a>
                      ) : (
                        <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                          {linha}
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        </>
      )}

      {missoes.length > 0 && (
        <>
          <h2 className="mt-8 font-display text-lg font-bold text-navy-dark">
            {temCopiloto ? "Missões extras do Copiloto" : "Missões individuais"}
          </h2>
          <CronogramaCopiloto missoes={missoes} hojeStr={hojeStr} />
        </>
      )}

      {semNada && (
        <div className="mt-6 rounded-2xl p-6 text-white" style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}>
          <p className="font-display text-xl font-bold">Sem missão cadastrada hoje</p>
          <p className="mt-2 text-sm text-white/70">Fale com a coordenação ou aguarde o próximo dia do cronograma.</p>
        </div>
      )}
    </div>
  );
}
