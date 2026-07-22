import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

interface DesempenhoMateria {
  materia: string;
  peso: number;
  acertos: number;
  total: number;
  precisao: number;
  ganhoPotencial: number; // pontos que o aluno pode ganhar focando aqui
}

interface DesempenhoAssunto {
  materia: string;
  assunto: string;
  peso: number;
  acertos: number;
  total: number;
  precisao: number;
}

export default async function AlunoRaioXPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  // Pega todas as respostas de questões do aluno com matéria/assunto/peso
  const [{ data: respostas }, { data: pesos }, { data: tentativas }] = await Promise.all([
    supabase
      .from("respostas_aluno")
      .select("correta, questoes(materia, assunto)")
      .eq("aluno_id", profile.id),
    supabase.from("materias_peso").select("materia, peso"),
    supabase
      .from("simulado_tentativas")
      .select("nota_facape, created_at")
      .eq("aluno_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  const listaRespostas = respostas ?? [];
  const mapaPesos = new Map<string, number>();
  (pesos ?? []).forEach((p: any) => mapaPesos.set(p.materia, Number(p.peso)));

  // ---------- POR MATÉRIA ----------
  const porMateria = new Map<string, { acertos: number; total: number }>();
  listaRespostas.forEach((r: any) => {
    const materia = r.questoes?.materia;
    if (!materia) return;
    const atual = porMateria.get(materia) ?? { acertos: 0, total: 0 };
    atual.total++;
    if (r.correta) atual.acertos++;
    porMateria.set(materia, atual);
  });

  const desempenhoMaterias: DesempenhoMateria[] = [];
  porMateria.forEach((dados, materia) => {
    const precisao = dados.total > 0 ? (dados.acertos / dados.total) * 100 : 0;
    const peso = mapaPesos.get(materia) ?? 1;
    // "ganho potencial" = quanto de precisão falta × peso da matéria.
    // Serve pra priorizar o que estudar: uma matéria com precisão baixa E
    // peso alto sobe mais na lista do que uma matéria com precisão baixa
    // mas peso 1.
    const ganhoPotencial = (100 - precisao) * peso;
    desempenhoMaterias.push({
      materia,
      peso,
      acertos: dados.acertos,
      total: dados.total,
      precisao: Math.round(precisao * 10) / 10,
      ganhoPotencial: Math.round(ganhoPotencial * 10) / 10
    });
  });
  desempenhoMaterias.sort((a, b) => b.ganhoPotencial - a.ganhoPotencial);

  // ---------- POR ASSUNTO ----------
  const porAssunto = new Map<string, { materia: string; assunto: string; acertos: number; total: number }>();
  listaRespostas.forEach((r: any) => {
    const materia = r.questoes?.materia;
    const assunto = r.questoes?.assunto;
    if (!materia || !assunto) return;
    const chave = `${materia}||${assunto}`;
    const atual = porAssunto.get(chave) ?? { materia, assunto, acertos: 0, total: 0 };
    atual.total++;
    if (r.correta) atual.acertos++;
    porAssunto.set(chave, atual);
  });

  const desempenhoAssuntos: DesempenhoAssunto[] = [];
  porAssunto.forEach((d) => {
    const precisao = d.total > 0 ? (d.acertos / d.total) * 100 : 0;
    desempenhoAssuntos.push({
      materia: d.materia,
      assunto: d.assunto,
      peso: mapaPesos.get(d.materia) ?? 1,
      acertos: d.acertos,
      total: d.total,
      precisao: Math.round(precisao * 10) / 10
    });
  });
  // ordena por menor precisão × maior peso (o assunto mais crítico primeiro)
  desempenhoAssuntos.sort((a, b) => (100 - a.precisao) * a.peso - (100 - b.precisao) * b.peso).reverse();

  const notasSimulados = (tentativas ?? []).map((t: any) => t.nota_facape).filter((n: any) => n != null);
  const notaMediaFacape = notasSimulados.length > 0
    ? Math.round((notasSimulados.reduce((s: number, n: number) => s + n, 0) / notasSimulados.length) * 10) / 10
    : null;

  const semDados = listaRespostas.length === 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">🩻 Raio-X FACAPE</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">
          ← Voltar ao painel
        </Link>
      </div>
      <p className="mt-1 text-sm text-navy-dark/60">
        Análise do seu desempenho usando os pesos oficiais da FACAPE — quanto maior o peso da matéria, mais
        importante é acertar nela.
      </p>

      {semDados ? (
        <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-navy-dark/70">
            Você ainda não respondeu questões suficientes pra montar seu raio-x. Pratique um pouco e volte aqui.
          </p>
          <Link href="/aluno/questoes" className="mt-4 inline-block rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white">
            Praticar questões →
          </Link>
        </div>
      ) : (
        <>
          {notaMediaFacape != null && (
            <div className="mt-6 rounded-2xl bg-white p-5 shadow">
              <p className="text-xs font-bold uppercase tracking-wide text-navy-dark/50">
                Média dos seus {notasSimulados.length} último(s) simulado(s)
              </p>
              <p className="mt-1 font-display text-3xl font-extrabold text-navy-dark">{notaMediaFacape}%</p>
              <p className="text-xs text-navy-dark/50">Nota FACAPE ponderada</p>
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-white p-6 shadow">
            <h2 className="font-display font-bold text-navy-dark">Onde focar (por matéria)</h2>
            <p className="mt-1 text-xs text-navy-dark/50">
              Ordenado por maior ganho potencial: matérias com precisão baixa E peso alto aparecem primeiro.
            </p>
            <div className="mt-4 space-y-3">
              {desempenhoMaterias.map((m) => {
                const cor = m.precisao >= 70 ? "bg-green-500" : m.precisao >= 40 ? "bg-orange" : "bg-red-400";
                return (
                  <div key={m.materia}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-navy-dark">
                        {m.materia}
                        <span className="ml-2 rounded-full bg-navy/5 px-2 py-0.5 text-xs font-bold text-navy-dark/60">
                          peso {m.peso}
                        </span>
                      </span>
                      <span className="text-navy-dark/60">
                        {m.precisao}% ({m.acertos}/{m.total})
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-navy/10">
                      <div className={`h-full ${cor}`} style={{ width: `${m.precisao}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {desempenhoAssuntos.length > 0 && (
            <div className="mt-6 rounded-2xl bg-white p-6 shadow">
              <h2 className="font-display font-bold text-navy-dark">Assuntos mais críticos</h2>
              <p className="mt-1 text-xs text-navy-dark/50">
                Assuntos onde você tem mais espaço pra crescer, considerando o peso da matéria.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {desempenhoAssuntos.slice(0, 10).map((a, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-navy/5 p-3">
                    <div>
                      <p className="font-semibold text-navy-dark">{a.assunto}</p>
                      <p className="text-xs text-navy-dark/50">
                        {a.materia} · peso {a.peso}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        a.precisao >= 70
                          ? "bg-green-100 text-green-700"
                          : a.precisao >= 40
                          ? "bg-orange/20 text-orange-dark"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {a.precisao}% ({a.acertos}/{a.total})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
