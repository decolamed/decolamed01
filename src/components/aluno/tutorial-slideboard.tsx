"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SLIDES = [
  {
    icone: "📱",
    titulo: "Instale o aplicativo",
    descricao:
      "A Decola Med funciona como aplicativo no seu celular. Toque em \"Instalar\" e leve a plataforma na palma da mão — rápido e sem ocupar espaço.",
    cta: "Instalar aplicativo"
  },
  {
    icone: "🎯",
    titulo: "Missão do Dia",
    descricao:
      "Cada dia tem uma única sequência de estudos na aba Hoje: siga os passos na ordem e conclua a missão. O Mapa de Voo completo fica na versão para computador."
  },
  {
    icone: "🗺️",
    titulo: "Cronograma e Missões",
    descricao:
      "Todos seguem o Cronograma Base com aulas, atividades, resumos, revisões, simulados e redações. No plano Voo Guiado, o algoritmo adapta tudo a você."
  },
  {
    icone: "❓",
    titulo: "Questões inteligentes",
    descricao:
      "Errou? O Copiloto identifica o assunto na matriz, registra no seu Raio-X e monta uma revisão com 5 novas questões + materiais recomendados."
  },
  {
    icone: "⏱️",
    titulo: "Simulados de Voo",
    descricao:
      "Provas com timer e nota calculada pelos pesos oficiais das disciplinas. Sem redação? Mostramos a nota considerando apenas a prova objetiva."
  },
  {
    icone: "🤖",
    titulo: "Conte com o Copiloto",
    descricao:
      "Seu assistente IA recomenda aulas, flashcards, mapas mentais e PDFs conforme seu desempenho. Qualquer erro, use o botão \"Comunicar erro\". Bom voo!"
  }
];

export function TutorialSlideboard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const last = step === SLIDES.length - 1;
  const s = SLIDES[step];

  function finalizar() {
    router.push("/aluno");
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Topo: logo + "Pular" */}
      <div className="flex items-center px-6 pt-4">
        <Image src="/assets/logo.png" alt="Decola Med" width={28} height={28} />
        <div className="flex-1" />
        <button
          onClick={finalizar}
          className="text-xs font-black uppercase tracking-wide text-navy-dark/50 hover:text-navy-dark"
        >
          Pular
        </button>
      </div>

      {/* Barra de progresso */}
      <div className="flex gap-1.5 px-6 pt-4">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full"
            style={{ background: i <= step ? "#F36C21" : "#e6ecf1" }}
          />
        ))}
      </div>

      {/* Conteúdo do slide */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div
          key={step}
          className="mb-6 flex h-40 w-40 items-center justify-center rounded-3xl shadow-lg"
          style={{
            background: "linear-gradient(160deg,#0d4a79,#01395E)",
            animation: "dm-pop .45s ease both"
          }}
        >
          <span className="text-6xl">{s.icone}</span>
        </div>
        <h1 className="font-display text-2xl font-black text-navy-dark">{s.titulo}</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-navy-dark/70">{s.descricao}</p>
        {s.cta && (
          <button className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-orange px-4 py-2.5 text-xs font-black uppercase tracking-wide text-orange">
            ✈️ {s.cta}
          </button>
        )}
      </div>

      {/* Botões inferiores */}
      <div className="flex gap-3 px-6 pb-8">
        {step > 0 && (
          <button
            onClick={() => setStep((n) => n - 1)}
            className="flex-1 rounded-full border border-navy/20 px-6 py-4 font-display font-black uppercase tracking-wide text-navy-dark"
          >
            Voltar
          </button>
        )}
        <button
          onClick={() => (last ? finalizar() : setStep((n) => n + 1))}
          className="rounded-full bg-orange px-6 py-4 font-display font-black uppercase tracking-wide text-white hover:bg-orange-dark"
          style={{ flex: step > 0 ? 2 : 1 }}
        >
          {last ? "Começar a voar →" : "Próximo →"}
        </button>
      </div>

      <style jsx>{`
        @keyframes dm-pop {
          from {
            transform: scale(0.85);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
