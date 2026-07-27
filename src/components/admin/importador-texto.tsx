"use client";

import { useState } from "react";
import { TextArea, PrimaryButton } from "./interactive";
import { extrairTextoPdf } from "@/lib/importacao/pdf-actions";

function bufferParaBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binario = "";
  const tamanhoBloco = 8000;
  for (let i = 0; i < bytes.length; i += tamanhoBloco) {
    binario += String.fromCharCode(...bytes.subarray(i, i + tamanhoBloco));
  }
  return btoa(binario);
}

// Widget compartilhado pelos importadores em massa (questões e flashcards):
// cola texto direto ou envia um PDF (o texto é extraído no servidor via
// pdf-parse) e manda o resultado pra quem estiver usando analisar/mostrar
// a prévia — cada tela decide como fazer o parsing específico dela.
export function ImportadorTexto({ onAnalisar, placeholder }: { onAnalisar: (texto: string) => void; placeholder: string }) {
  const [texto, setTexto] = useState("");
  const [carregandoPdf, setCarregandoPdf] = useState(false);
  const [erroPdf, setErroPdf] = useState<string | null>(null);

  async function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setCarregandoPdf(true);
    setErroPdf(null);
    try {
      const base64 = bufferParaBase64(await arquivo.arrayBuffer());
      const res = await extrairTextoPdf(base64);
      if (!res.ok) {
        setErroPdf(res.erro);
        return;
      }
      setTexto(res.texto);
    } finally {
      setCarregandoPdf(false);
    }
  }

  return (
    <div>
      <TextArea rows={10} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={placeholder} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="cursor-pointer rounded-[11px] border border-navy-dark/15 px-3 py-2 text-xs font-bold text-navy-dark hover:bg-navy-dark/5">
          {carregandoPdf ? "Lendo PDF..." : "Enviar PDF"}
          <input type="file" accept="application/pdf" className="hidden" onChange={handleArquivo} disabled={carregandoPdf} />
        </label>
        <PrimaryButton onClick={() => onAnalisar(texto)} className="!w-auto">
          Analisar texto
        </PrimaryButton>
      </div>
      {erroPdf && <p className="mt-1.5 text-xs text-red">{erroPdf}</p>}
    </div>
  );
}
