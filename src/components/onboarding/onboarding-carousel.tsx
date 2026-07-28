"use client";

import { useState } from "react";

// Onboarding genérico (sem depender de sessão/dados de aluno) — por isso
// pode ser mostrado tanto ANTES do login (primeiro acesso ao site, ver
// OnboardingGate) quanto de dentro do app já autenticado (botão em
// Configurações), com o mesmo componente e o mesmo conteúdo.
const SLIDES = [
  {
    emoji: "✈️",
    titulo: "Bem-vindo à Decola Med",
    texto: "Sua plataforma de preparação para o FACAPE: aulas, questões, flashcards e simulados num só lugar, com um cronograma que te guia dia a dia."
  },
  {
    emoji: "🗓️",
    titulo: "Cronograma inteligente",
    texto: "Todo dia tem uma missão própria — aulas, atividades e revisões escolhidas para você. No plano Voo Guiado, o Copiloto IA adapta tudo ao seu desempenho real."
  },
  {
    emoji: "🎯",
    titulo: "Questões, flashcards e simulados",
    texto: "Pratique com um banco real de questões, revise com flashcards organizados por matéria ou assunto, e treine em simulados com nota calculada pelos pesos oficiais."
  },
  {
    emoji: "📲",
    titulo: "Instale no seu celular",
    texto: 'Depois de entrar, você pode instalar a Decola Med como aplicativo — ícone na tela inicial, sem ocupar espaço e com acesso rápido, direto do seu celular.'
  }
];

export function OnboardingCarousel({ onFinish }: { onFinish: () => void }) {
  const [passo, setPasso] = useState(0);
  const slide = SLIDES[passo];
  const ultimo = passo === SLIDES.length - 1;

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col"
      style={{ background: "radial-gradient(1200px 700px at 50% -10%, #0e3a5c 0%, #0a2438 60%, #071a2a 100%)" }}
    >
      <div className="flex items-center px-5 pt-6">
        <img src="/assets/logo.png" alt="Decola Med" className="h-6" />
        <div className="flex-1" />
        <button type="button" onClick={onFinish} className="text-xs font-bold text-white/50">
          Pular
        </button>
      </div>

      <div className="flex gap-1.5 px-6 pt-4">
        {SLIDES.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= passo ? "bg-orange" : "bg-white/15"}`} />
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="text-6xl">{slide.emoji}</div>
        <h2 className="mt-5 font-display text-xl font-extrabold text-white">{slide.titulo}</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">{slide.texto}</p>
      </div>

      <div className="flex gap-3 px-6 pb-10">
        {passo > 0 && (
          <button
            type="button"
            onClick={() => setPasso((p) => p - 1)}
            className="flex-1 rounded-xl border border-white/20 py-3.5 text-sm font-extrabold text-white"
          >
            Voltar
          </button>
        )}
        <button
          type="button"
          onClick={() => (ultimo ? onFinish() : setPasso((p) => p + 1))}
          className="flex-[2] rounded-xl bg-orange py-3.5 text-sm font-extrabold text-white shadow-lg"
        >
          {ultimo ? "COMEÇAR →" : "PRÓXIMO →"}
        </button>
      </div>
    </div>
  );
}
