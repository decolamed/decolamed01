import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";

const MODULOS_FUTUROS = [
  { icone: "🗺️", titulo: "Cursos", desc: "Videoaulas organizadas por matéria e frente." },
  { icone: "🃏", titulo: "Flashcards", desc: "Revisão espaçada dos temas mais cobrados." },
  { icone: "📊", titulo: "Desempenho", desc: "Gráficos de evolução e pontos de atenção." },
  { icone: "✍️", titulo: "Redação", desc: "Envio e correção humana de redações." },
  { icone: "⏱️", titulo: "Simulados", desc: "Simulados cronometrados com correção automática." }
];

export default async function AlunoHomePage() {
  // Camada 2 de proteção (a camada 1 é o middleware): garante que mesmo que
  // a rota seja alcançada por algum outro caminho, o conteúdo só renderiza
  // para quem tem matrícula ativa e dentro do prazo.
  const profile = await requireAcessoAluno();

  return (
    <div>
      <div
        className="rounded-2xl p-6 text-white sm:p-8"
        style={{ background: "linear-gradient(160deg,#0d4a79 0%,#01395E 55%,#062b47 100%)" }}
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-white/60">Painel de voo</p>
        <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
          Bem-vindo a bordo, {profile.nome.split(" ")[0]} ✈️
        </h1>
        <p className="mt-2 max-w-lg text-white/70">
          Sua matrícula está ativa e sua rota rumo à aprovação já começou. Os módulos abaixo entram no ar nas
          próximas atualizações.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/aluno/questoes"
          className="rounded-2xl border-2 border-orange bg-orange/5 p-5 shadow-sm transition hover:bg-orange/10"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange text-xl">🎯</span>
          <h2 className="mt-3 font-display font-bold text-navy-dark">Questões</h2>
          <p className="mt-1 text-sm text-navy-dark/60">Banco de questões comentadas com filtro por matéria.</p>
          <span className="mt-3 inline-block rounded-full bg-orange px-3 py-1 text-xs font-semibold text-white">
            Praticar agora →
          </span>
        </Link>

        {MODULOS_FUTUROS.map((m) => (
          <div key={m.titulo} className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange/10 text-xl">
              {m.icone}
            </span>
            <h2 className="mt-3 font-display font-bold text-navy-dark">{m.titulo}</h2>
            <p className="mt-1 text-sm text-navy-dark/60">{m.desc}</p>
            <span className="mt-3 inline-block rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold text-navy/50">
              Em breve
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
