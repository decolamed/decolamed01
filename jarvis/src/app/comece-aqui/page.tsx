import { faltaParaAIa, faltaParaOBanco } from "@/lib/config";

export const dynamic = "force-dynamic";

const PASSOS = [
  {
    titulo: "Crie um projeto no Supabase",
    corpo: [
      "Entre em supabase.com e crie uma conta (não pede cartão).",
      "Clique em New project. Dê um nome — pode ser 'jarvis' — e guarde a senha do banco que ele te mostrar.",
      "Espere uns 2 minutos até ficar verde."
    ]
  },
  {
    titulo: "Crie as tabelas",
    corpo: [
      "No menu da esquerda, abra o SQL Editor e clique em New query.",
      "Abra o arquivo supabase/schema.sql aqui do projeto, copie TUDO e cole lá.",
      "Clique em Run. Se aparecer 'Success', acabou esta parte."
    ]
  },
  {
    titulo: "Copie as chaves do Supabase",
    corpo: [
      "Vá em Project Settings → API.",
      "Copie a Project URL e a chave pública (anon / publishable).",
      "Cole as duas no arquivo .env.local, nas linhas NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    ]
  },
  {
    titulo: "Pegue uma chave de IA",
    corpo: [
      "O caminho gratuito é o Gemini: aistudio.google.com/apikey → Create API key. Cole em GEMINI_API_KEY.",
      "Se preferir o Claude (escreve resumo melhor, mas é pago por uso): console.anthropic.com → API keys. Cole em ANTHROPIC_API_KEY.",
      "Pode configurar os dois e trocar depois dentro do app, em Configurações."
    ]
  },
  {
    titulo: "Reinicie",
    corpo: [
      "Pare o servidor no terminal (Ctrl+C) e rode npm run dev de novo.",
      "O Next.js só lê o .env.local quando começa — editar com ele rodando não faz efeito nenhum.",
      "Depois volte aqui: esta tela some sozinha quando estiver tudo certo."
    ]
  }
];

export default function ComeceAqui() {
  const banco = faltaParaOBanco();
  const ia = faltaParaAIa();
  const tudoCerto = banco.length === 0 && ia.length === 0;

  return (
    <main className="min-h-screen bg-tinta-950 px-5 py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <p className="text-3xl font-bold tracking-tight text-white">
            Jarvis<span className="text-ciano-400">.</span>
          </p>
          <p className="mt-2 text-sm text-tinta-400">
            Falta pouco. São cinco passos, uma vez só.
          </p>
        </header>

        {/* O diagnóstico vem ANTES das instruções: quem já fez metade não
            precisa reler o começo para descobrir onde parou. */}
        <section className="mb-8 rounded-xl border border-tinta-800 bg-tinta-900 p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-tinta-400">
            O que falta agora
          </h2>

          {tudoCerto ? (
            <p className="text-sm text-ciano-300">
              Nada. Está tudo configurado — reinicie o servidor (Ctrl+C e{" "}
              <code className="rounded bg-tinta-800 px-1.5 py-0.5">npm run dev</code>) e vá para{" "}
              <a href="/tutorias" className="font-semibold underline">
                /tutorias
              </a>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {[...banco, ...ia].map((v) => (
                <li key={v.nome} className="text-sm">
                  <code className="rounded bg-alerta-600/20 px-1.5 py-0.5 font-mono text-xs text-alerta-100">
                    {v.nome}
                  </code>
                  <p className="mt-1 text-xs leading-relaxed text-tinta-400">{v.ondeConseguir}</p>
                </li>
              ))}
            </ul>
          )}

          {banco.length === 0 && ia.length > 0 ? (
            <p className="mt-4 border-t border-tinta-800 pt-3 text-xs leading-relaxed text-tinta-400">
              O banco já está ligado — o app abre e as pastas funcionam. Só a conversa com o
              Jarvis precisa da chave de IA.
            </p>
          ) : null}
        </section>

        <ol className="space-y-5">
          {PASSOS.map((passo, i) => (
            <li key={passo.titulo} className="rounded-xl border border-tinta-800 bg-tinta-900 p-5">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm font-bold text-ciano-400">{i + 1}</span>
                <h3 className="text-sm font-semibold text-white">{passo.titulo}</h3>
              </div>
              <ul className="mt-3 space-y-1.5 pl-7">
                {passo.corpo.map((linha) => (
                  <li key={linha} className="text-sm leading-relaxed text-tinta-300">
                    {linha}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-center text-xs leading-relaxed text-tinta-500">
          O arquivo <code className="text-tinta-400">.env.local</code> fica na raiz da pasta{" "}
          <code className="text-tinta-400">jarvis/</code>. Se ele não existir, copie o{" "}
          <code className="text-tinta-400">.env.example</code> e renomeie.
          <br />
          Ele nunca vai para o GitHub — está no <code className="text-tinta-400">.gitignore</code>.
        </p>
      </div>
    </main>
  );
}
