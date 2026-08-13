import Link from "next/link";
import { requireAcessoAluno } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { PaginaAluno } from "@/components/aluno/pagina-aluno";
import { carregarDesempenho } from "@/lib/site/desempenho-servidor";

export default async function AlunoDesempenhoPage() {
  const profile = await requireAcessoAluno();
  const supabase = createClient();

  // As contas saem de lib/site/desempenho*.ts — as MESMAS que o painel do
  // administrador usa. Enquanto cada tela calculava por conta própria, nada
  // impedia o aluno ver 78% e o admin ver 74% para a mesma pessoa.
  const desempenho = await carregarDesempenho(supabase, profile.id);
  const { resumo } = desempenho;

  const listaTentativas = desempenho.tentativas;
  const totalQuestoes = resumo.questoes;
  const acertosQuestoes = resumo.acertos;
  const precisaoGeral = resumo.precisao;
  const totalFlashcards = resumo.flashcards;
  const lembrados = resumo.lembrados;
  const precisaoFlashcards = resumo.precisaoFlashcards;
  const mediaSimulados = resumo.mediaSimulados;

  const materiasOrdenadas: [string, { acertos: number; total: number }][] = desempenho.porMateria.map((m) => [
    m.materia,
    { acertos: m.acertos, total: m.total }
  ]);

  const semDadosAinda = resumo.semDados;

  // Só a moldura mudou (item 11): fundo navy, título centralizado, sem
  // emoji e com o "Voltar ao painel" no padrão da plataforma em vez de um
  // link de texto solto. O que a tela calcula e mostra segue igual.
  return (
    <PaginaAluno
      titulo="Desempenho"
      descricao="Como você vem indo em questões, flashcards e simulados."
    >

      {semDadosAinda ? (
        <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow">
          <p className="text-navy-dark/70">
            Você ainda não praticou nada por aqui. Responda algumas questões, revise flashcards ou faça um simulado
            pra começar a ver seu desempenho aparecer.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/aluno/questoes" className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white">
              Praticar questões
            </Link>
            <Link href="/aluno/flashcards" className="rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-white">
              Revisar flashcards
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow">
              <span className="block h-1 w-8 rounded-full bg-orange" />
              <p className="mt-3 text-sm text-navy-dark/60">Precisão em questões</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-navy-dark">{precisaoGeral}%</p>
              <p className="text-xs text-navy-dark/40">{acertosQuestoes} de {totalQuestoes} respondidas</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow">
              <span className="block h-1 w-8 rounded-full bg-orange" />
              <p className="mt-3 text-sm text-navy-dark/60">Memorização (flashcards)</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-navy-dark">{precisaoFlashcards}%</p>
              <p className="text-xs text-navy-dark/40">{lembrados} de {totalFlashcards} lembrados</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow">
              <span className="block h-1 w-8 rounded-full bg-orange" />
              <p className="mt-3 text-sm text-navy-dark/60">Média em simulados</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-navy-dark">{mediaSimulados}%</p>
              <p className="text-xs text-navy-dark/40">{listaTentativas.length} simulado(s) feito(s)</p>
            </div>
          </div>

          {materiasOrdenadas.length > 0 && (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow">
              <h2 className="font-display font-bold text-navy-dark">Precisão por matéria</h2>
              <div className="mt-4 space-y-3">
                {materiasOrdenadas.map(([materia, dados]) => {
                  const pct = Math.round((dados.acertos / dados.total) * 100);
                  return (
                    <div key={materia}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-navy-dark">{materia}</span>
                        <span className="text-navy-dark/60">{pct}% ({dados.acertos}/{dados.total})</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-navy/10">
                        <div
                          className={`h-full ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-orange" : "bg-red-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {listaTentativas.length > 0 && (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow">
              <h2 className="font-display font-bold text-navy-dark">Histórico de simulados</h2>
              <ul className="mt-3 divide-y">
                {listaTentativas.map((t: any, i: number) => (
                  <li key={i} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-semibold text-navy-dark">{t.simulados?.titulo ?? "Simulado"}</p>
                      <p className="text-xs text-navy-dark/50">
                        {new Date(t.created_at).toLocaleDateString("pt-BR")} — {t.acertos}/{t.total} acertos
                      </p>
                    </div>
                    <span className="font-display text-lg font-bold text-navy-dark">{Math.round(t.nota)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </PaginaAluno>
  );
}
