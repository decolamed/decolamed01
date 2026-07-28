import type { ImagemQuestao } from "@/types/database";

// Usado nos três lugares onde o aluno responde uma questão (prática avulsa,
// atividade e simulado). Cada `imagem.url` pode ser um caminho estático
// (/questoes-facape/...) ou uma data URI (data:image/png;base64,...) — o
// <img> não precisa saber a diferença.
export function ImagensQuestao({ imagens }: { imagens: ImagemQuestao[] | null | undefined }) {
  if (!imagens || imagens.length === 0) return null;

  const ordenadas = [...imagens].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="mt-4 space-y-3">
      {ordenadas.map((img, i) => (
        <figure key={i}>
          {/* eslint-disable-next-line @next/next/no-img-element -- fontes variam entre arquivo estático e data URI, next/image não serve pra data URI */}
          <img
            src={img.url}
            alt={img.legenda ?? "Imagem da questão"}
            className="max-w-full rounded-xl border border-navy-dark/10"
            loading="lazy"
          />
          {img.legenda && <figcaption className="mt-1 text-xs text-navy-dark/50">{img.legenda}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
