// Resolve o alias "@/..." (definido no tsconfig) e acrescenta a extensão
// .ts quando ela está implícita, para os testes rodarem no node puro, sem o
// bundler do Next. Uso exclusivo de teste.
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "../../..");

function comExtensao(alvo) {
  if (fs.existsSync(alvo) && fs.statSync(alvo).isFile()) return alvo;
  for (const ext of [".ts", ".tsx", ".mjs", ".js"]) {
    if (fs.existsSync(alvo + ext)) return alvo + ext;
  }
  for (const ext of ["/index.ts", "/index.tsx"]) {
    if (fs.existsSync(alvo + ext)) return alvo + ext;
  }
  return alvo;
}

export function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const alvo = comExtensao(path.join(raiz, "src", specifier.slice(2)));
    return next(pathToFileURL(alvo).href, context);
  }
  return next(specifier, context);
}
