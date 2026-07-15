const MODULOS_FUTUROS = [
  { titulo: "Cursos", desc: "Videoaulas organizadas por matéria e frente." },
  { titulo: "Questões", desc: "Banco de questões comentadas com filtros." },
  { titulo: "Flashcards", desc: "Revisão espaçada dos temas mais cobrados." },
  { titulo: "Desempenho", desc: "Gráficos de evolução e pontos de atenção." },
  { titulo: "Redação", desc: "Envio e correção humana de redações." },
  { titulo: "Simulados", desc: "Simulados cronometrados com correção automática." }
];

export default function AlunoHomePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-dark">Bem-vindo à sua plataforma 🚀</h1>
      <p className="mt-2 text-navy-dark/70">
        Sua matrícula está ativa. Os módulos abaixo serão liberados nas próximas atualizações.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULOS_FUTUROS.map((m) => (
          <div key={m.titulo} className="rounded-2xl border border-navy/10 bg-white p-5 opacity-70">
            <h2 className="font-display font-bold text-navy-dark">{m.titulo}</h2>
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
