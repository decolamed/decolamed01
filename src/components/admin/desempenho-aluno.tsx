import { Card, StatCard, Badge } from "@/components/admin/card";
import { TabelaResponsiva } from "@/components/admin/tabela-responsiva";
import { diasSemEstudar, type DesempenhoAgrupado } from "@/lib/site/desempenho";
import type { DesempenhoCompleto } from "@/lib/site/desempenho-servidor";

// ============================================================================
// DESEMPENHO DO ALUNO NO PAINEL
//
// Os mesmos números que o aluno vê na tela de Desempenho e no Raio-X — pela
// mesma leitura e pelas mesmas contas (lib/site/desempenho.ts). Aqui é só a
// apresentação: o administrador precisa responder rápido "está indo bem?",
// "onde tem dificuldade?", "está evoluindo?", "ainda está estudando?".
//
// As tabelas usam `TabelaResponsiva`, que no celular vira um cartão por
// registro — o painel tem coluna demais para caber numa tela de 360px, e
// rolar a tabela de lado não é ler.
// ============================================================================

/**
 * Cor do aproveitamento. `green` e `red` são as cores do painel definidas em
 * tailwind.config.ts — e são PLANAS, sem escala: o tema substitui o verde e o
 * vermelho padrão do Tailwind por uma cor só. Escrever `bg-green-500` aqui
 * gera uma classe que não existe, e a barra sai sem cor nenhuma. Foi o que
 * aconteceu: só as barras entre 50% e 70% apareciam, porque `bg-orange` era a
 * única das três que existia de verdade.
 */
// Classes ESCRITAS POR INTEIRO: o Tailwind lê o código-fonte como texto e só
// gera o que encontra literalmente. `bg-${cor}` montado em tempo de execução
// não existe no CSS final — é a mesma falha, com outra roupa.
function corDoAproveitamento(valor: number): string {
  return valor >= 70 ? "bg-green" : valor >= 50 ? "bg-orange" : "bg-red";
}

/** Barra de aproveitamento. A cor reforça o número, nunca o substitui. */
function Barra({ valor }: { valor: number }) {
  const cor = corDoAproveitamento(valor);
  return (
    <div className="h-1.5 w-full min-w-[60px] overflow-hidden rounded-full bg-navy-dark/10">
      <div className={`h-full ${cor}`} style={{ width: `${Math.min(100, Math.max(0, valor))}%` }} />
    </div>
  );
}

function Aproveitamento({ valor }: { valor: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 shrink-0 font-extrabold text-navy-dark">{valor}%</span>
      <Barra valor={valor} />
    </div>
  );
}

export function DesempenhoDoAluno({ dados, hoje }: { dados: DesempenhoCompleto; hoje: string }) {
  const { resumo, porMateria, porAssunto, evolucao, tendencia: t } = dados;
  const parado = diasSemEstudar(resumo.ultimaAtividade, hoje);

  if (resumo.semDados) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm font-semibold text-navy-dark/60">
          Este aluno ainda não respondeu questões, revisou flashcards nem fez simulados. Não há desempenho para
          mostrar — e nenhum número aqui seria verdadeiro.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Aproveitamento"
          value={`${resumo.precisao}%`}
          tone={resumo.precisao >= 70 ? "green" : "orange"}
        />
        <StatCard label="Questões respondidas" value={resumo.questoes} />
        <StatCard label="Acertos / erros" value={`${resumo.acertos} / ${resumo.erros}`} />
        <StatCard
          label="Sem estudar há"
          value={parado === null ? "—" : parado === 0 ? "estudou hoje" : `${parado} dia(s)`}
          tone={parado !== null && parado >= 7 ? "orange" : "navy"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Flashcards revisados" value={resumo.flashcards} />
        <StatCard label="Lembrou" value={`${resumo.precisaoFlashcards}%`} />
        <StatCard label="Simulados feitos" value={resumo.simulados} />
        <StatCard label="Média nos simulados" value={`${resumo.mediaSimulados}%`} />
      </div>

      {/* Evolução — só aparece com semanas suficientes para significar alguma
          coisa. Uma barra sozinha não é uma curva. */}
      {evolucao.length >= 2 && (
        <Card className="p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-sm font-bold text-navy-dark">Evolução por semana</h3>
            {t && (
              <Badge tone={t.direcao === "subindo" ? "green" : t.direcao === "caindo" ? "red" : "neutral"}>
                {t.direcao === "subindo" ? "Subindo" : t.direcao === "caindo" ? "Caindo" : "Estável"}
                {t.variacao !== 0 ? ` ${t.variacao > 0 ? "+" : ""}${t.variacao} p.p.` : ""}
              </Badge>
            )}
          </div>
          <div className="mt-4 flex items-end gap-2 overflow-x-auto pb-1">
            {evolucao.map((p) => (
              <div key={p.semana} className="flex min-w-[46px] flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-navy-dark/60">{p.aproveitamento}%</span>
                <div className="flex h-24 w-full items-end rounded-md bg-navy-dark/5">
                  <div
                    className={`w-full rounded-md ${corDoAproveitamento(p.aproveitamento)}`}
                    style={{ height: `${Math.max(4, p.aproveitamento)}%` }}
                  />
                </div>
                <span className="text-[9px] font-semibold text-navy-dark/45">
                  {p.semana.slice(8, 10)}/{p.semana.slice(5, 7)}
                </span>
                <span className="text-[9px] font-semibold text-navy-dark/35">{p.total}q</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {porMateria.length > 0 && (
        <div>
          <h3 className="mb-2 font-display text-sm font-bold text-navy-dark">Desempenho por matéria</h3>
          <TabelaResponsiva<DesempenhoAgrupado>
            linhas={porMateria}
            chave={(m) => m.chave}
            colunas={[
              { titulo: "Matéria", principal: true, celula: (m) => m.materia },
              { titulo: "Questões", celula: (m) => m.total },
              { titulo: "Acertos", celula: (m) => m.acertos },
              { titulo: "Erros", celula: (m) => m.erros },
              { titulo: "Aproveitamento", celula: (m) => <Aproveitamento valor={m.aproveitamento} /> }
            ]}
          />
        </div>
      )}

      {/* Do pior para o melhor: esta é a lista de "o que precisa de atenção",
          e por isso ela começa pelo que dói. */}
      {porAssunto.length > 0 && (
        <div>
          <h3 className="mb-2 font-display text-sm font-bold text-navy-dark">Conteúdos que precisam de atenção</h3>
          <TabelaResponsiva<DesempenhoAgrupado>
            linhas={porAssunto.slice(0, 15)}
            chave={(a) => a.chave}
            colunas={[
              { titulo: "Conteúdo", principal: true, celula: (a) => a.assunto ?? "" },
              { titulo: "Matéria", celula: (a) => a.materia },
              { titulo: "Questões", celula: (a) => a.total },
              { titulo: "Acertos", celula: (a) => a.acertos },
              { titulo: "Aproveitamento", celula: (a) => <Aproveitamento valor={a.aproveitamento} /> }
            ]}
          />
          {porAssunto.length > 15 && (
            <p className="mt-2 text-[11px] font-semibold text-navy-dark/45">
              Mostrando os 15 conteúdos com menor aproveitamento, de {porAssunto.length} com pelo menos 2 questões
              respondidas.
            </p>
          )}
        </div>
      )}

      {dados.tentativas.length > 0 && (
        <div>
          <h3 className="mb-2 font-display text-sm font-bold text-navy-dark">Simulados</h3>
          <TabelaResponsiva
            linhas={dados.tentativas}
            chave={(t2) => String(t2.created_at ?? t2.nota)}
            colunas={[
              { titulo: "Simulado", principal: true, celula: (t2) => t2.simulados?.titulo ?? "Simulado" },
              {
                titulo: "Acertos",
                celula: (t2) => (t2.acertos != null && t2.total != null ? `${t2.acertos} de ${t2.total}` : "—")
              },
              { titulo: "Nota", celula: (t2) => `${t2.nota}%` },
              {
                titulo: "Data",
                celula: (t2) => (t2.created_at ? new Date(t2.created_at).toLocaleDateString("pt-BR") : "—")
              }
            ]}
          />
        </div>
      )}
    </div>
  );
}
