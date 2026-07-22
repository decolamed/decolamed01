import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

const MEDALHAS = ["#c8d6e5", "#ffc94d", "#e08e5a"];

export default async function AlunoRankingPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const { data: rankingData } = await supabase.from("ranking_geral").select("*");
  const ranking = rankingData ?? [];

  const pódio = ranking.slice(0, 3);
  // Pódio visual fica 2º-1º-3º (o primeiro lugar no meio, mais alto).
  const pódioOrdemVisual = [pódio[1], pódio[0], pódio[2]];
  const resto = ranking.slice(3);

  const minhaPosicao = ranking.findIndex((r: any) => r.aluno_id === profile.id) + 1;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">🏆 Ranking</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">
          ← Voltar ao painel
        </Link>
      </div>

      {minhaPosicao > 0 && (
        <p className="mt-2 text-sm text-navy-dark/60">
          Sua posição atual: <span className="font-bold text-orange-dark">#{minhaPosicao}</span>
        </p>
      )}

      {ranking.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-navy-dark/70">
            Ainda não há dados suficientes pra montar o ranking. Pratique questões, flashcards ou simulados pra
            começar a pontuar!
          </p>
        </div>
      ) : (
        <>
          {pódio.length > 0 && (
            <div className="mt-8 flex items-end justify-center gap-3">
              {pódioOrdemVisual.map((p, i) => {
                if (!p) return <div key={i} className="flex-1" />;
                const éPrimeiro = i === 1;
                return (
                  <div key={p.aluno_id} className="flex flex-1 flex-col items-center gap-2">
                    <span
                      className="flex items-center justify-center rounded-full font-display font-extrabold text-navy-dark shadow"
                      style={{
                        width: éPrimeiro ? 62 : 50,
                        height: éPrimeiro ? 62 : 50,
                        background: MEDALHAS[i],
                        fontSize: éPrimeiro ? 20 : 16
                      }}
                    >
                      {p.nome.charAt(0)}
                    </span>
                    <p className="text-center text-xs font-bold text-navy-dark">{p.nome.split(" ")[0]}</p>
                    <div
                      className={`flex w-full flex-col items-center justify-center gap-0.5 rounded-t-2xl ${
                        éPrimeiro ? "text-white" : "border border-navy/10 text-navy-dark/60"
                      }`}
                      style={{
                        height: éPrimeiro ? 118 : 88,
                        background: éPrimeiro ? "linear-gradient(180deg,#F36C21,#d95a12)" : "#fff"
                      }}
                    >
                      <span className="font-display text-2xl font-extrabold">{i === 1 ? 1 : i === 0 ? 2 : 3}º</span>
                      <span className="text-xs font-bold">{p.xp} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {resto.length > 0 && (
            <div className="mt-6 space-y-2">
              {resto.map((r: any, i: number) => {
                const éVoce = r.aluno_id === profile.id;
                return (
                  <div
                    key={r.aluno_id}
                    className={`flex items-center gap-3 rounded-2xl p-3 ${
                      éVoce ? "border-2 border-orange bg-orange/5" : "border border-navy/10 bg-white"
                    }`}
                  >
                    <span className={`w-8 text-sm font-extrabold ${éVoce ? "text-orange-dark" : "text-navy-dark/40"}`}>
                      #{i + 4}
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 text-sm font-bold text-navy-dark">
                      {r.nome.charAt(0)}
                    </span>
                    <span className={`flex-1 text-sm ${éVoce ? "font-extrabold" : "font-semibold"} text-navy-dark`}>
                      {r.nome.split(" ")[0]}{éVoce ? " (você)" : ""}
                    </span>
                    <span className={`text-sm font-extrabold ${éVoce ? "text-orange-dark" : "text-navy-dark/60"}`}>
                      {r.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
