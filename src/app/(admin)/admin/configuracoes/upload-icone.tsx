"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

// ============================================================================
// UPLOAD DO ÍCONE DO APLICATIVO (Alteração 7.3)
//
// Antes existia só um campo "URL do ícone": o admin tinha que hospedar a
// imagem em algum outro serviço e colar o link. Além de nada intuitivo, um
// link externo que sai do ar leva junto o ícone do app instalado.
//
// O upload vai direto do navegador para o Storage do Supabase, sem passar por
// uma Server Action: arquivos binários em Server Action seriam serializados
// no corpo da requisição do Next sem ganho nenhum, e o Storage já valida tipo
// e tamanho no servidor (ver migração 044).
// ============================================================================

const TAMANHO_MAXIMO = 2 * 1024 * 1024;
const TIPOS_ACEITOS = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export function UploadIcone({ valorAtual, nomeCampo }: { valorAtual: string; nomeCampo: string }) {
  const [url, setUrl] = useState(valorAtual);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function enviar(arquivo: File) {
    setErro(null);

    // Validação no cliente é só cortesia — quem realmente barra é o Storage.
    // Existe para o admin saber o motivo na hora, em vez de esperar o upload
    // inteiro para receber um erro genérico.
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      setErro("Formato não aceito. Use PNG, JPG, WEBP ou SVG.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro(`A imagem tem ${(arquivo.size / 1024 / 1024).toFixed(1)} MB. O limite é 2 MB.`);
      return;
    }

    setEnviando(true);
    try {
      const supabase = createClient();
      const extensao = arquivo.name.split(".").pop()?.toLowerCase() || "png";
      // Nome novo a cada envio: sobrescrever o mesmo caminho faria o navegador
      // e o cache do PWA continuarem servindo o ícone antigo por tempo
      // indeterminado, e o admin acharia que o upload não funcionou.
      const caminho = `icone-${Date.now()}.${extensao}`;

      const { error } = await supabase.storage.from("marca").upload(caminho, arquivo, {
        cacheControl: "31536000",
        upsert: false
      });
      if (error) {
        setErro("Não foi possível enviar a imagem. Verifique sua conexão e tente de novo.");
        return;
      }

      const { data } = supabase.storage.from("marca").getPublicUrl(caminho);
      setUrl(data.publicUrl);
    } catch {
      setErro("Não foi possível enviar a imagem. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      {/* A URL continua sendo o que é salvo — o upload só preenche o campo,
          então colar um link de fora continua funcionando para quem preferir. */}
      <input type="hidden" name={nomeCampo} value={url} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-navy-dark/15 bg-navy-dark/5">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Prévia do ícone" className="h-full w-full object-cover" />
          ) : (
            <Image src="/assets/icone-192.png" alt="Ícone padrão" width={64} height={64} className="h-full w-full object-cover opacity-50" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={enviando}
              className="rounded-[10px] bg-navy-dark px-4 py-2 text-xs font-extrabold text-white disabled:opacity-60"
            >
              {enviando ? "Enviando…" : url ? "Trocar imagem" : "Escolher imagem"}
            </button>
            {url && (
              <button
                type="button"
                onClick={() => {
                  setUrl("");
                  setErro(null);
                }}
                className="rounded-[10px] border border-navy-dark/15 px-4 py-2 text-xs font-extrabold text-navy-dark/60"
              >
                Usar o padrão
              </button>
            )}
          </div>
          <p className="mt-1.5 text-[11px] font-semibold text-navy-dark/45">
            PNG quadrado (512×512) com fundo opaco funciona melhor. Máx. 2 MB.
            {url ? " Lembre de salvar as configurações abaixo." : ""}
          </p>
          {erro && <p className="mt-1 text-[11px] font-bold text-red">{erro}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={TIPOS_ACEITOS.join(",")}
        className="hidden"
        onChange={(e) => {
          const arquivo = e.target.files?.[0];
          if (arquivo) enviar(arquivo);
          // Zera o input para permitir reenviar o MESMO arquivo depois de
          // clicar em "Usar o padrão" — sem isso o onChange não dispara.
          e.target.value = "";
        }}
      />
    </div>
  );
}
