// Leitura e escrita de `configuracoes.valor`, que é uma coluna **jsonb**.
//
// O bug que motivou este módulo: a tela de configurações gravava
// `JSON.stringify(texto)`. Como o supabase-js já serializa o valor que
// recebe, o texto chegava ao banco com um par de aspas a mais — e como o
// formulário é preenchido com o que foi lido, cada novo "Salvar" somava
// mais uma camada. Em produção o WhatsApp do site já estava com três:
//
//   "\"\\\"557498141244\\\"\""
//
// O código lia `valor as string` e montava wa.me/"557498141244" (com as
// aspas dentro da URL), então os botões de WhatsApp, o Instagram do
// rodapé e o link da Base de Temas simplesmente não abriam.
//
// `textoConfig` desfaz as camadas na leitura, para que instalações que já
// gravaram valores tortos voltem a funcionar sem depender da migração de
// dados, e `valorConfig` garante que a escrita grave o texto puro.

// Desembrulha um valor de `configuracoes.valor` para o texto que o resto
// da aplicação espera. Aceita o formato correto (string jsonb) e também
// os valores duplamente/triplamente escapados gravados antes da correção.
export function textoConfig(valor: unknown): string {
  let atual = valor;

  // Limite de segurança: valores legítimos não têm mais que um punhado de
  // camadas, e um laço sem teto travaria com uma string patológica.
  for (let i = 0; i < 5; i += 1) {
    if (typeof atual !== "string") break;
    const t = atual.trim();
    // Só desembrulha o que é claramente uma string JSON aninhada
    // ("...") — um texto legítimo que apenas contenha aspas no meio
    // (Instagram: @decola"med) não entra aqui.
    if (t.length < 2 || !t.startsWith('"') || !t.endsWith('"')) break;
    try {
      const interno = JSON.parse(t);
      if (typeof interno !== "string") break;
      atual = interno;
    } catch {
      break;
    }
  }

  return typeof atual === "string" ? atual : "";
}

// Valor a gravar na coluna jsonb. O supabase-js serializa sozinho, então
// aqui basta o texto puro — foi o `JSON.stringify` extra que criou o
// problema descrito acima.
export function valorConfig(texto: string): string {
  return texto.trim();
}
