import Image from "next/image";
import { LinkButton } from "@/components/ui/button";

const CHECKLIST = [
  { emoji: "📅", label: "Cronograma de estudo inteligente" },
  { emoji: "📚", label: "Resumos estratégicos" },
  { emoji: "📝", label: "Questões comentadas" },
  { emoji: "🧠", label: "Estratégia de prova" },
  { emoji: "🩺", label: "Diagnóstico contínuo de evolução" },
  { emoji: "📈", label: "Simulados" },
  { emoji: "🔍", label: "Raio-X do vestibular (análise da prova)" },
  { emoji: "✈️", label: "Mentorias e acompanhamento" },
  { emoji: "🎯", label: "Correção de redação" }
];

const DIFERENCIAIS = [
  "Questões direto na plataforma",
  "Raio-X com análise dos assuntos que mais caem",
  "Estratégia específica de prova",
  "Cronograma inteligente de estudos",
  "Simulados com análise de desempenho"
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-5 pb-16 pt-14 text-center">
        <Image src="/assets/logo.png" alt="Decola Med" width={160} height={160} priority />
        <h1 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl">
          A sua aprovação em <mark className="rounded bg-orange px-2 text-white">Medicina</mark> começa aqui
        </h1>
        <p className="max-w-xl text-white/80">
          Preparação estratégica, focada e acompanhada de perto — do primeiro dia de estudo até o dia da prova.
        </p>
        <LinkButton href="/planos" className="mt-2">
          Quero agora
        </LinkButton>
        <p className="text-xs uppercase tracking-widest text-white/50">Clique para acessar</p>

        <div className="mt-8 flex items-center gap-4 rounded-2xl bg-white/5 p-4 text-left">
          <Image
            src="/assets/testimonial_guy.png"
            alt="Aluno aprovado, 2º lugar em bolsa de estudos"
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <p className="font-display text-lg font-bold text-white">2° lugar</p>
            <p className="text-sm text-white/70">Bolsa de estudos em Medicina</p>
          </div>
        </div>
      </section>

      {/* ILHA / PLATAFORMA */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-5 py-16">
        <Image src="/assets/island.png" alt="Preparação Decola Med" width={480} height={320} />
        <p className="text-center font-display text-2xl font-bold text-white">
          Quer entrar em Medicina? Sua preparação está aqui.
        </p>
        <div className="grid items-center gap-8 rounded-3xl bg-white/5 p-6 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-xl font-bold text-orange">Estudo inteligente</h2>
            <p className="mt-2 text-white/80">
              Responda questões dentro da plataforma, acompanhe gráficos de evolução e veja seu progresso em
              tempo real.
            </p>
          </div>
          <Image
            src="/assets/phone_mockup.png"
            alt="Dashboard de desempenho no aplicativo"
            width={280}
            height={400}
            className="mx-auto"
          />
        </div>
      </section>

      {/* COMPARATIVO */}
      <section className="mx-auto max-w-4xl px-5 py-16 text-center">
        <p className="font-display text-2xl font-bold text-white">
          Uma plataforma feita para quem tem um objetivo claro: aprovação em Medicina.
        </p>
        <Image
          src="/assets/laptop_mockup.png"
          alt="Plataforma Decola Med no notebook e celular"
          width={520}
          height={340}
          className="mx-auto my-8"
        />
        <div className="rounded-2xl bg-white p-6 text-left text-navy-dark shadow-xl">
          <p className="font-display font-bold">
            Enquanto muitos oferecem preparo genérico, a Decola Med é{" "}
            <mark className="bg-orange/20 text-orange-dark">especializada</mark>.
          </p>
          <ul className="mt-4 space-y-2">
            {DIFERENCIAIS.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-orange">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CHECKLIST */}
      <section className="mx-auto max-w-4xl px-5 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <ul className="grid gap-3 sm:grid-cols-2">
            {CHECKLIST.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-white/90">
                <span className="text-xl">{item.emoji}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-3xl bg-orange/10 p-6">
          <h3 className="font-display text-xl font-bold text-orange">Corretor de redação</h3>
          <p className="mt-2 text-white/80">
            Sua redação é analisada por um corretor humano, com direcionamento real de melhoria.
          </p>
        </div>
      </section>

      {/* PAGAMENTO SEGURO */}
      <section className="mx-auto max-w-3xl px-5 py-16 text-center">
        <p className="font-display text-lg font-bold text-white">🔐 Pagamento 100% seguro</p>
        <p className="mt-3 text-white/70">
          Todos os pagamentos da Decola Med são processados pela Asaas, instituição regulamentada pelo Banco
          Central do Brasil.
        </p>
        <p className="mt-2 text-white/70">
          Compra protegida pelo Código de Defesa do Consumidor, conforme a legislação brasileira.
        </p>
        <LinkButton href="/planos" className="mt-6">
          Quero agora
        </LinkButton>
      </section>
    </>
  );
}
