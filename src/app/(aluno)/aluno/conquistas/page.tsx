import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

interface Badge {
  icone: string;
  titulo: string;
  desbloqueado: boolean;
  progresso: string;
}

export default async function AlunoConquistasPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  const [{ data: respostas }, { data: revisoes }, { data: tentativas }, { data: ranking }] = await Promise.all([
    supabase.from("respostas_aluno").select("correta").eq("aluno_id", profile.id),
    supabase.from("flashcard_revisoes").select("lembrou").eq("aluno_id", profile.id),
    supabase.from("simulado_tentativas").select("id").eq("aluno_id", profile.id),
    supabase.from("ranking_geral").select("aluno_id")
  ]);

  const totalQuestoes = respostas?.length ?? 0;
  const acertosQuestoes = (respostas ?? []).filter((r: any) => r.correta).length;
  const precisao = totalQuestoes > 0 ? Math.round((acertosQuestoes / totalQuestoes) * 100) : 0;
  const totalFlashcards = (revisoes ?? []).filter((r: any) => r.lembrou).length;
  const totalSimulados = tentativas?.length ?? 0;
  const minhaPosicao = (ranking ?? []).findIndex((r: any) => r.aluno_id === profile.id) + 1;

  const badges: Badge[] = [
    {
      icone: "🎯",
      titulo: "Primeiras 10 Questões",
      desbloqueado: totalQuestoes >= 10,
      progresso: `${Math.min(totalQuestoes, 10)}/10`
    },
    {
      icone: "💯",
      titulo: "100 Questões",
      desbloqueado: totalQuestoes >= 100,
      progresso: `${Math.min(totalQuestoes, 100)}/100`
    },
    {
      icone: "⭐",
      titulo: "Precisão 90%+",
      desbloqueado: totalQuestoes >= 20 && precisao >= 90,
      progresso: totalQuestoes >= 20 ? `${precisao}%` : `${totalQuestoes}/20 questões`
    },
    {
      icone: "🃏",
      titulo: "Revisor Dedicado",
      desbloqueado: totalFlashcards >= 50,
      progresso: `${Math.min(totalFlashcards, 50)}/50`
    },
    {
      icone: "📄",
      titulo: "Primeiro Simulado",
      desbloqueado: totalSimulados >= 1,
      progresso: `${Math.min(totalSimulados, 1)}/1`
    },
    {
      icone: "🏅",
      titulo: "Simulado Expert",
      desbloqueado: totalSimulados >= 3,
      progresso: `${Math.min(totalSimulados, 3)}/3`
    },
    {
      icone: "🏆",
      titulo: "Top 10 no Ranking",
      desbloqueado: minhaPosicao > 0 && minhaPosicao <= 10,
      progresso: minhaPosicao > 0 ? `#${minhaPosicao}` : "ainda sem pontos"
    }
  ];

  const desbloqueadas = badges.filter((b) => b.desbloqueado);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-navy-dark">🎖️ Conquistas</h1>
        <Link href="/aluno" className="text-sm text-navy hover:underline">
          ← Voltar ao painel
        </Link>
      </div>

      <div
        className="mt-6 flex items-center gap-4 rounded-2xl p-6 text-white"
        style={{ background: "linear-gradient(160deg,#0d4a79,#01395E)" }}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">🏅</span>
        <div>
          <p className="font-display text-2xl font-extrabold">{desbloqueadas.length} / {badges.length}</p>
          <p className="text-sm text-white/70">brasões desbloqueados</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((b) => (
          <div
            key={b.titulo}
            className={`rounded-2xl p-5 text-center shadow ${b.desbloqueado ? "bg-white" : "bg-white opacity-50"}`}
          >
            <span
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl"
              style={{
                background: b.desbloqueado ? "linear-gradient(150deg,#F36C21,#d95a12)" : "#e5e9ed"
              }}
            >
              {b.icone}
            </span>
            <p className="mt-3 font-display text-sm font-bold text-navy-dark">{b.titulo}</p>
            <p className="mt-1 text-xs text-navy-dark/50">{b.progresso}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
