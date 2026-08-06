import { createClient } from "@/lib/supabase/server";
import { materiasUnicas } from "@/lib/site/materia-canonica";

// Fonte única da lista de matérias mostrada ao aluno.
//
// Antes existiam TRÊS listas escritas à mão, e nenhuma batia com a outra
// nem com o banco:
//
//   briefing-wizard.tsx   7 matérias, "Português", sem língua estrangeira
//   decola-app scrBriefing 8 matérias, "Português/Literatura" e "Língua Estrangeira"
//   decola-app state.feels o mesmo conjunto da anterior
//
// Enquanto isso, `questoes.materia` guarda "Português", "Inglês" e
// "Espanhol", e `flashcards.materia` ainda acrescenta "Literatura". O
// Copiloto lê o sentimento por `sentimentos[materia]` usando o nome que
// vem do banco de questões (ver motor.ts), então tudo que o aluno
// respondia como "Português/Literatura" ou "Língua Estrangeira" caía num
// nome que não existe em lugar nenhum: a autoavaliação era descartada em
// silêncio e o algoritmo assumia "Atenção" para todo mundo.
//
// Derivar a lista do conteúdo real resolve os dois lados de uma vez — os
// nomes passam a casar com o que o Copiloto procura, e a plataforma deixa
// de ter matéria fixa no código (o mesmo motivo de lib/site/marca.ts:
// outro vestibular tem outro conjunto de matérias).

// Usado só quando ainda não há nenhum conteúdo cadastrado, para o briefing
// não aparecer vazio num projeto recém-criado.
export const MATERIAS_PADRAO = [
  "Biologia",
  "Química",
  "Física",
  "Matemática",
  "Linguagens",
  "História",
  "Geografia"
];

export async function getMateriasDoConteudo(): Promise<string[]> {
  const supabase = createClient();

  // Só questões e flashcards, de propósito: é exatamente por esses nomes
  // que o Copiloto procura o sentimento (`sentimentos[questoes.materia]`).
  // `materias_peso` ficou de fora porque serve a outra finalidade (peso na
  // nota) e hoje tem nomes agrupados como "Inglês/Espanhol" — incluí-la
  // faria o aluno ver "Inglês", "Espanhol" E "Inglês/Espanhol" na mesma
  // lista, e a autoavaliação do nome agrupado não casaria com questão
  // nenhuma. Ver o aviso de nomes divergentes em /admin/copiloto/pesos.
  const [{ data: questoes }, { data: flashcards }] = await Promise.all([
    supabase.from("questoes").select("materia").eq("ativo", true),
    supabase.from("flashcards").select("materia").eq("ativo", true)
  ]);

  // materiasUnicas() colapsa sinônimos: se sobrar alguma linha antiga como
  // "Português", ela vira "Linguagens" e não aparece duas vezes na lista.
  const brutos: (string | null)[] = [];
  [questoes, flashcards].forEach((linhas) => {
    (linhas ?? []).forEach((l: { materia: string | null }) => brutos.push(l.materia));
  });

  const lista = materiasUnicas(brutos).sort((a, b) => a.localeCompare(b, "pt-BR"));
  return lista.length ? lista : MATERIAS_PADRAO;
}
