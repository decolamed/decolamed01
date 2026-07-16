"use client";

import { useState } from "react";

export function CopiarLinkButton({ path }: { path: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copie o link:", url);
    }
  }

  return (
    <button type="button" onClick={copiar} className="text-navy hover:underline">
      {copiado ? "Copiado!" : "Copiar link"}
    </button>
  );
}
