"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import { enviarRelatoErro } from "./relato-actions";
import styles from "./decola-app.module.css";

interface DecolaAppProps {
  nome: string;
  email: string;
  plano: "decolando" | "voo-guiado";
  whatsappSuporte: string;
  whatsappRedacao: string;
}

// Porte do protótipo navegável "Decola Med App.dc.html" (Claude Design) para
// dentro do Next.js. Mantido como um único componente de classe, igual ao
// original, para preservar fielmente a lógica de navegação/estado entre as
// ~25 telas — quebrar em vários componentes teria alto risco de divergir do
// design aprovado sem ganho real (é uma área nova, ainda sem consumidores
// externos do estado).
//
// O que NÃO veio do protótipo, de propósito:
// - Telas de login/cadastro/onboarding: a autenticação real já existe
//   (Supabase Auth) e é feita antes desta tela renderizar.
// - A barra de status falsa (relógio "9:41", sinal, bateria) do mockup de
//   celular: fazia sentido só dentro do preview do Claude Design.
// - Imagens do mascote (assets/mascote/*.png): não puderam ser importadas
//   do projeto de design nesta rodada (arquivos grandes, acima do limite de
//   leitura da ferramenta) — substituídas por selos de ícone no mesmo
//   sistema visual já usado no resto do app.
//
// O restante (missões, XP, banco de questões, flashcards, simulados,
// cronograma, copiloto) usa os mesmos dados de demonstração e a mesma
// persistência em localStorage do protótipo original — ainda não existem
// tabelas no banco para isso (ver ARCHITECTURE.md, seção 10).
export default class DecolaApp extends React.Component<DecolaAppProps, any> {
  state: any = {
    theme: null,
    screen: "mapa",
    simView: null,
    simIdx: 0,
    simAns: {},
    simGrid: false,
    simSec: 0,
    practice: false,
    qIdx: 0,
    qPicked: null,
    qDone: false,
    reviewMode: false,
    revIdx: 0,
    revPicked: null,
    revDone: false,
    revScore: 0,
    revFinished: false,
    missTab: "diarias",
    upcomingOpen: false,
    qMateria: null,
    rankTab: "geral",
    achTab: "brasoes",
    notifOpen: false,
    moreOpen: false,
    push: true,
    feels: (function () {
      try {
        const s = localStorage.getItem("dm-feels");
        if (s) return JSON.parse(s);
      } catch (e) {}
      return {
        Biologia: "Domínio",
        Química: "Atenção",
        Física: "Turbulência",
        Matemática: "Atenção",
        "Português/Literatura": "Domínio",
        História: "Atenção",
        Geografia: "Domínio",
        "Língua Estrangeira": "Atenção"
      };
    })(),
    gabFrom: null,
    fcIdx: 0,
    fcFlip: false,
    fcOk: 0,
    browserTitle: null,
    browserUrl: null,
    browserBack: "mapa",
    contTitle: null,
    contBack: "estudos",
    brief: (function () {
      try {
        const s = localStorage.getItem("dm-brief");
        if (s) return JSON.parse(s);
      } catch (e) {}
      return { prova: "2026-11-16", inicio: "2026-07-19", dias: 5, horas: 3 };
    })(),
    chat: null,
    chatInput: "",
    copIdx: 0,
    copAns: {},
    calMonth: 0,
    calSel: null,
    errOpen: false,
    errSent: false,
    errText: "",
    errCat: "Questão",
    tutStep: 0,
    senhaNova: "",
    senhaConfirma: "",
    senhaErro: null as string | null,
    senhaSalvando: false,
    senhaSalva: false,
    w: 390
  };

  _t: any;
  _b: any;
  _r: any;

  componentDidMount() {
    this._r = () => this.setState({ w: window.innerWidth });
    window.addEventListener("resize", this._r);
    this._r();
    this._t = setInterval(() => {
      if (this.state.simView === "run") this.setState((s: any) => ({ simSec: s.simSec + 1 }));
    }, 1000);
    this._b = setInterval(() => {
      const el = document.getElementById("dm-ban");
      if (el && this.state.screen === "mapa" && el.children.length > 1) {
        const n = el.children.length - 1;
        const w = (el.children[0] as HTMLElement).offsetWidth + 10;
        const idx = Math.round(el.scrollLeft / w);
        if (idx >= n) {
          el.scrollTo({ left: 0, behavior: "auto" });
        } else {
          el.scrollTo({ left: (idx + 1) * w, behavior: "smooth" });
        }
      }
    }, 5000);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this._r);
    clearInterval(this._t);
    clearInterval(this._b);
  }

  // Breakpoint do layout "Decola Med Desktop": acima disso trocamos a barra
  // de abas + cartão centralizado (mobile/tablet) por uma sidebar fixa em
  // tela cheia, igual ao design de desktop — reaproveitando as mesmas telas
  // (scrMapa, scrPainel etc.), só muda o chrome ao redor.
  wide() {
    return (this.state.w || 0) >= 1150;
  }

  logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/login";
    }
  };

  primeiroNome() {
    return (this.props.nome || "Aluno").trim().split(/\s+/)[0];
  }
  iniciais() {
    const partes = (this.props.nome || "Aluno Decola").trim().split(/\s+/);
    const a = partes[0]?.[0] || "A";
    const b = partes[1]?.[0] || partes[0]?.[1] || "D";
    return (a + b).toUpperCase();
  }
  saudacao() {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }

  theme() {
    return this.state.theme ?? "dark";
  }
  colors() {
    const dark = this.theme() === "dark";
    return dark
      ? {
          dark: true,
          bg: "#07223a",
          card: "#0c3557",
          card2: "#123f66",
          line: "rgba(191,221,242,.14)",
          txt: "#F4F9FD",
          sub: "rgba(191,221,242,.66)",
          faint: "rgba(191,221,242,.38)",
          orange: "#F36C21",
          orangeSoft: "rgba(243,108,33,.16)",
          blueSoft: "rgba(191,221,242,.12)",
          peach: "rgba(251,226,206,.14)",
          peachTxt: "#FBE2CE",
          green: "#3dd68c",
          greenSoft: "rgba(61,214,140,.15)",
          red: "#ff6b5e",
          redSoft: "rgba(255,107,94,.15)",
          yellow: "#ffc94d",
          chip: "rgba(191,221,242,.09)",
          navBg: "rgba(4,26,44,.94)",
          headGrad: "linear-gradient(160deg,#0d4a79 0%,#01395E 55%,#062b47 100%)"
        }
      : {
          dark: false,
          bg: "#F2F7FB",
          card: "#ffffff",
          card2: "#EDF4FA",
          line: "rgba(1,57,94,.10)",
          txt: "#01395E",
          sub: "rgba(1,57,94,.62)",
          faint: "rgba(1,57,94,.38)",
          orange: "#F36C21",
          orangeSoft: "rgba(243,108,33,.12)",
          blueSoft: "#DCEBF6",
          peach: "#FBE2CE",
          peachTxt: "#9a5218",
          green: "#1fa565",
          greenSoft: "rgba(31,165,101,.12)",
          red: "#e04f42",
          redSoft: "rgba(224,79,66,.10)",
          yellow: "#e0a20f",
          chip: "rgba(1,57,94,.06)",
          navBg: "rgba(255,255,255,.96)",
          headGrad: "linear-gradient(160deg,#0d4a79 0%,#01395E 100%)"
        };
  }

  icon(name: string, size = 22, color = "currentColor", sw = 2) {
    const h = React.createElement;
    const P = (d: string, i: number) => h("path", { d, key: "p" + i });
    const defs: Record<string, string[]> = {
      map: ["M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z", "M9 4v14", "M15 6v14"],
      gauge: ["M12 15l3.5-5.5", "M20.2 17a9 9 0 1 0-16.4 0"],
      book: ["M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z", "M8 7h8"],
      plane: [
        "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
      ],
      bolt: ["M13 2 3 14h7l-1 8 10-12h-7z"],
      flame: [
        "M12 22c4 0 7-2.7 7-7 0-3-2-5.5-3.5-7C14 6 13 4 13 2c-3 2-5 5-5 8-1-1-1.6-2-2-3.5C4.6 8.6 4 10.6 4 12.5 4 17.5 8 22 12 22z"
      ],
      trophy: ["M8 21h8", "M12 17v4", "M7 4h10v6a5 5 0 0 1-10 0z", "M7 6H4a2 2 0 0 0 2 4h1", "M17 6h3a2 2 0 0 1-2 4h-1"],
      check: ["M4 12.5 9.5 18 20 6.5"],
      star4: ["M12 2c.8 4.5 3 7 8 8-5 1-7.2 3.5-8 8-.8-4.5-3-7-8-8 5-1 7.2-3.5 8-8z"],
      star: ["M12 2.5l2.9 5.9 6.6 1-4.7 4.6 1.1 6.5-5.9-3.1-5.9 3.1 1.1-6.5L2.5 9.4l6.6-1z"],
      file: ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M9 13h6", "M9 17h4"],
      bag: ["M6 8h12l1.5 12.5a1.8 1.8 0 0 1-1.8 2H6.3a1.8 1.8 0 0 1-1.8-2z", "M9 10V6a3 3 0 0 1 6 0v4"],
      send: ["M22 2 11 13", "M22 2 15 22l-4-9-9-4z"],
      x: ["M6 6l12 12", "M18 6 6 18"],
      pencil: ["M17 3l4 4L8 20l-5 1 1-5z"],
      note: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"],
      heart: [
        "M12 21S4 14.5 4 9.3C4 6.4 6.2 4.5 8.6 4.5c1.5 0 2.7.8 3.4 2 .7-1.2 2-2 3.4-2 2.4 0 4.6 1.9 4.6 4.8C20 14.5 12 21 12 21z"
      ],
      gift: [
        "M12 11v10",
        "M3 8h18v3H3z",
        "M12 8c-2 0-4.5-.5-4.5-2.7C7.5 3.6 9 3 10 3c1.7 0 2 2.5 2 5",
        "M12 8c2 0 4.5-.5 4.5-2.7C16.5 3.6 15 3 14 3c-1.7 0-2 2.5-2 5",
        "M5 11h14v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20z"
      ],
      wrench: ["M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3z"],
      logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
      moon: ["M21 13A9 9 0 0 1 11 3a7.5 7.5 0 1 0 10 10z"],
      arrowL: ["M19 12H5", "M11 18l-6-6 6-6"],
      bookmark: ["M6 3h12v18l-6-4-6 4z"],
      refresh: ["M21 12a9 9 0 1 1-2.6-6.3", "M21 3v6h-6"],
      flag: ["M5 21V4", "M5 4c4-2 8 2 14 0v9c-6 2-10-2-14 0"],
      layers: ["M12 3 2 8.5 12 14l10-5.5z", "M2 13.5 12 19l10-5.5"],
      dna: ["M6 3c0 6 12 6 12 12", "M18 3c0 6-12 6-12 12", "M6 15c0 3 2 6 6 6", "M18 15c0 3-2 6-6 6", "M8 7h8", "M8 17h8"],
      bell: ["M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7", "M10.3 20a2 2 0 0 0 3.4 0"],
      chevR: ["M9 5l7 7-7 7"],
      lock: [
        "M8 11V8a4 4 0 0 1 8 0v3",
        "M6.5 11h11a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-6A1.5 1.5 0 0 1 6.5 11z"
      ],
      clock: ["M12 7v5l3.5 2", "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"],
      video: [
        "M16 10.5 21 7.5v9l-5-3",
        "M5.5 6h8A2.5 2.5 0 0 1 16 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 3 15.5v-7A2.5 2.5 0 0 1 5.5 6z"
      ],
      cards: ["M8 2h11a2 2 0 0 1 2 2v13", "M5 5h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"],
      calendar: ["M3 10h18", "M8 3v4", "M16 3v4", "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"],
      target: [
        "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
        "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
        "M12 11.2a.8.8 0 1 0 0 1.6.8.8 0 0 0 0-1.6z"
      ],
      compass: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5z"],
      radar: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z", "M12 12 18 6"],
      bot: [
        "M12 8V4",
        "M12 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z",
        "M8 8h8a4 4 0 0 1 4 4v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3a4 4 0 0 1 4-4z",
        "M9.5 12.3a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z",
        "M14.5 12.3a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"
      ],
      search: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z", "M16.5 16.5 21 21"],
      user: ["M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M4 21c0-4 3.5-6 8-6s8 2 8 6"],
      gear: [
        "M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z",
        "M19 12a7 7 0 0 0-.14-1.4l2-1.55-2-3.46-2.36.95a7 7 0 0 0-2.42-1.4L13.7 2h-3.4l-.38 2.5a7 7 0 0 0-2.42 1.4l-2.36-.95-2 3.46 2 1.55a7.3 7.3 0 0 0 0 2.8l-2 1.55 2 3.46 2.36-.95a7 7 0 0 0 2.42 1.4l.38 2.5h3.4l.38-2.5a7 7 0 0 0 2.42-1.4l2.36.95 2-3.46-2-1.55c.1-.46.14-.93.14-1.4z"
      ],
      dots: ["M4 11h2v2H4z", "M11 11h2v2h-2z", "M18 11h2v2h-2z"],
      award: ["M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12z", "M9 14.5 8 22l4-2.5L16 22l-1-7.5"],
      alert: ["M12 3 2 20h20z", "M12 9.5V14", "M12 16.5v.5"],
      sun: [
        "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
        "M12 2v2",
        "M12 20v2",
        "M2 12h2",
        "M20 12h2",
        "M5 5l1.4 1.4",
        "M17.6 17.6 19 19",
        "M19 5l-1.4 1.4",
        "M6.4 17.6 5 19"
      ]
    };
    const isFill = ["plane", "bolt", "flame", "star4", "star", "heart", "bookmark", "dots"].includes(name);
    return h(
      "svg",
      {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: isFill ? color : "none",
        stroke: isFill ? "none" : color,
        strokeWidth: sw,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        style: { flexShrink: 0 }
      },
      (defs[name] || []).map(P)
    );
  }

  data() {
    return {
      subjects: [
        { n: "Biologia", v: 84, c: "#3dd68c" },
        { n: "Química", v: 62, c: "#ffc94d" },
        { n: "Física", v: 58, c: "#ff6b5e" },
        { n: "Matemática", v: 73, c: "#5aa9e6" },
        { n: "Linguagens", v: 69, c: "#c58fff" }
      ],
      checklist: [
        { t: "Aula · Sistema Digestório II", d: "Videoaula · 32 min", ic: "video", done: true, xp: 20 },
        { t: "Aula · Enzimas e Digestão", d: "Videoaula · 28 min", ic: "video", done: true, xp: 20 },
        { t: "Resumo · Bagagem Essencial", d: "Leitura · 10 min", ic: "file", done: false, xp: 10 },
        { t: "20 questões da missão", d: "12 de 20 respondidas", ic: "target", done: false, xp: 200 }
      ],
      daily: [
        { ic: "target", t: "Complete 20 questões hoje", p: 12, tot: 20, xp: 50 },
        { ic: "book", t: "Revise Biologia: Genética", p: 0, tot: 1, xp: 40 },
        { ic: "file", t: "Leia um resumo da Bagagem Essencial", p: 0, tot: 1, xp: 30 }
      ],
      weekly: [
        { ic: "clock", t: "Estude 12 horas nesta semana", p: 8.2, tot: 12, xp: 150, unit: "h" },
        { ic: "target", t: "Resolva 150 questões", p: 96, tot: 150, xp: 120 },
        { ic: "cards", t: "Revise 60 flashcards", p: 34, tot: 60, xp: 80 }
      ],
      special: [
        { ic: "gift", t: "Operação Aprovação FACAPE", d: "500 questões até domingo", p: 212, tot: 500, xp: 400 },
        { ic: "flame", t: "Missão bônus: estude 3h hoje", d: "Recompensa em dobro", p: 1.75, tot: 3, xp: 100, unit: "h" }
      ],
      ranking: [
        { p: 1, n: "João V.", xp: "2.580" },
        { p: 2, n: "Ana C.", xp: "2.150" },
        { p: 3, n: "Maria S.", xp: "1.980" },
        { p: 4, n: this.props.nome || "Aluno Decola", xp: "1.250", me: true },
        { p: 5, n: "Pedro L.", xp: "1.120" },
        { p: 6, n: "Lucas R.", xp: "980" },
        { p: 7, n: "Júlia M.", xp: "870" },
        { p: 8, n: "Beatriz F.", xp: "760" }
      ],
      badges: [
        { ic: "plane", t: "Primeira Missão", got: true },
        { ic: "flame", t: "7 Dias Seguidos", got: true },
        { ic: "target", t: "100 Questões", got: true },
        { ic: "star4", t: "Precisão 90%+", got: true },
        { ic: "dna", t: "Mestre da Biologia", prog: "72/90" },
        { ic: "file", t: "Simulado Expert", prog: "1/3" },
        { ic: "trophy", t: "Top 10 Ranking", prog: "0/1" },
        { ic: "award", t: "Lenda Decola", lock: true },
        { ic: "compass", t: "Rota Completa", lock: true }
      ],
      hangar: [
        { ic: "bag", t: "Bagagem Essencial", d: "PDFs, resumos e mapas", tone: "blue" },
        { ic: "calendar", t: "Plano de Voo", d: "Cronograma inteligente", tone: "peach" },
        { ic: "radar", t: "Raio-X FACAPE", d: "Assuntos mais cobrados", tone: "peach" },
        { ic: "file", t: "Resumos", d: "128 resumos", tone: "blue" },
        { ic: "book", t: "Livros Obrigatórios", d: "8 livros", tone: "blue" },
        { ic: "compass", t: "Estratégias e Guias", d: "Métodos de estudo", tone: "peach" },
        { ic: "note", t: "Modelos de Redação", d: "Temas e exemplos", tone: "peach" },
        { ic: "wrench", t: "Ferramentas", d: "Utilitários de estudo", tone: "blue" }
      ],
      estudos: [
        { ic: "video", t: "Videoaulas", d: "86 aulas" },
        { ic: "file", t: "PDFs", d: "215 materiais" },
        { ic: "note", t: "Resumos", d: "128 resumos" },
        { ic: "cards", t: "Flashcards", d: "540 cards" },
        { ic: "book", t: "Livros", d: "8 obrigatórios" },
        { ic: "pencil", t: "Anotações", d: "Suas notas" },
        { ic: "layers", t: "Revisões", d: "Mapas mentais" },
        { ic: "heart", t: "Favoritos", d: "Materiais salvos" }
      ],
      sims: [
        { t: "Simulado FACAPE 2024", q: 90, lvl: "Difícil", time: "3h" },
        { t: "Simulado FACAPE 2023", q: 90, lvl: "Médio", time: "3h" },
        { t: "Simulado Temático · Biologia", q: 60, lvl: "Médio", time: "2h" },
        { t: "Simulado Rápido", q: 12, lvl: "Fácil", time: "30min" }
      ],
      simHist: [
        { t: "Simulado FACAPE — 03", d: "18/05", v: 72 },
        { t: "Simulado Rápido — 12", d: "15/05", v: 65 },
        { t: "Simulado FACAPE — 02", d: "10/05", v: 61 }
      ],
      questions: [
        {
          code: "Q000001",
          materia: "Biologia",
          tema: "Sistema Digestório",
          fonte: "FACAPE 2024",
          q: "A estrutura responsável pela produção de bile no fígado é:",
          alts: ["Vesícula biliar", "Ducto colédoco", "Hepatócito", "Ducto pancreático", "Células de Kupffer"],
          ans: 2
        },
        {
          code: "Q000002",
          materia: "Biologia",
          tema: "Citologia",
          fonte: "FACAPE 2023",
          q: "Qual é a função principal dos ribossomos?",
          alts: ["Síntese de proteínas", "Produção de ATP", "Digestão intracelular", "Transporte de lipídios", "Armazenar cromatina"],
          ans: 0
        },
        {
          code: "Q000003",
          materia: "Química",
          tema: "Estequiometria",
          fonte: "FACAPE 2023",
          q: "Na combustão completa do metano (CH4), a proporção molar CH4:O2 é:",
          alts: ["1:1", "1:2", "2:1", "1:3", "2:3"],
          ans: 1
        }
      ],
      review: [
        {
          q: "A bile produzida pelos hepatócitos é armazenada:",
          alts: ["No pâncreas", "Na vesícula biliar", "No duodeno", "No baço", "No estômago"],
          ans: 1
        },
        {
          q: "A principal função da bile na digestão é:",
          alts: ["Digerir proteínas", "Emulsificar gorduras", "Absorver vitaminas", "Neutralizar o pH", "Produzir enzimas"],
          ans: 1
        },
        {
          q: "O ducto que leva a bile ao duodeno é o:",
          alts: ["Ducto cístico", "Ducto hepático", "Ducto colédoco", "Ducto pancreático", "Esfíncter de Oddi"],
          ans: 2
        },
        {
          q: "As células de Kupffer do fígado atuam como:",
          alts: ["Produtoras de bile", "Macrófagos", "Reserva de glicogênio", "Células-tronco", "Transportadoras de O2"],
          ans: 1
        },
        {
          q: "A vesícula biliar libera bile em resposta ao hormônio:",
          alts: ["Gastrina", "Secretina", "Insulina", "Colecistocinina", "Glucagon"],
          ans: 3
        }
      ],
      notifs: [
        { ic: "award", t: "Missão concluída!", d: "Você ganhou +50 XP", time: "09:41", tone: "orange", go: "missoes" },
        { ic: "bell", t: "Lembrete de estudo", d: "Seu plano de voo de hoje já está disponível.", time: "08:00", tone: "blue", go: "plano" },
        { ic: "star4", t: "Nova conquista", d: 'Brasão "Primeiro Voo" desbloqueado', time: "Ontem", tone: "orange", go: "conquistas" },
        { ic: "file", t: "Simulado disponível", d: "Simulado FACAPE 2024 já está liberado.", time: "Ontem", tone: "blue", go: "simulados" }
      ],
      recs: [
        { ic: "video", t: "Aula · Fígado e Vias Biliares", d: "Videoaula · 24 min", tag: "Prioritário" },
        { ic: "file", t: "Resumo · Sistema Digestório", d: "Bagagem Essencial · 8 min", tag: "Recomendado" },
        { ic: "cards", t: "Flashcards · Anexos do Digestório", d: "18 cards", tag: "Recomendado" }
      ]
    };
  }
  simQs() {
    const base = this.data().questions;
    return Array.from({ length: 12 }, (_, i) => ({ ...base[i % 3], n: i + 1 }));
  }

  // ---------- mascote com imagens reais ----------
  // Mapeamento de nome (usado no protótipo) → arquivo em /assets/mascote/.
  // Contextos: "bot" → default (copiloto padrão), "trophy" → comemorando,
  // "award" → animado (brasão), "check" → pulando (acertou/concluiu),
  // "cards" → ideia (flashcards/recomendação), "compass" → pensando,
  // "alert" → orgulhoso, qualquer outro → default.
  mascoteBadge(name: string, size: number, opts: any = {}) {
    const h = React.createElement;
    const mapa: Record<string, string> = {
      bot: "/assets/mascote/copiloto-default.png",
      trophy: "/assets/mascote/copiloto-comemorando.png",
      award: "/assets/mascote/copiloto-animado.png",
      check: "/assets/mascote/copiloto-pulando.png",
      cards: "/assets/mascote/copiloto-ideia.png",
      compass: "/assets/mascote/copiloto-pensando.png",
      alert: "/assets/mascote/copiloto-orgulhoso.png",
      laptop: "/assets/mascote/copiloto-laptop.png",
      wink: "/assets/mascote/copiloto-piscando.png"
    };
    const src = mapa[name] ?? "/assets/mascote/copiloto-default.png";
    return h("img", {
      src,
      alt: "Copiloto Decola",
      width: size,
      height: size,
      style: {
        width: size,
        height: size,
        objectFit: "contain",
        flexShrink: 0,
        animation: opts.anim || "none",
        ...(opts.style || {})
      }
    });
  }


  // ---------- ui helpers ----------
  ui() {
    const C = this.colors(),
      h = React.createElement,
      I = (n: string, s?: number, c?: string, w?: number) => this.icon(n, s, c, w);
    const card = (st: any, ch: any, onClick?: any) =>
      h(
        "div",
        { onClick, style: { background: C.card, border: "1px solid " + C.line, borderRadius: 18, padding: 16, cursor: onClick ? "pointer" : "default", ...st } },
        ch
      );
    const bar = (pct: number, color = C.orange, hgt = 7, track = C.chip) =>
      h(
        "div",
        { style: { height: hgt, borderRadius: 99, background: track, overflow: "hidden", flex: 1 } },
        h("div", { style: { width: Math.min(100, pct) + "%", height: "100%", borderRadius: 99, background: color, transition: "width .4s ease" } })
      );
    const chip = (txt: string, active: boolean, onClick?: any) =>
      h(
        "div",
        {
          onClick,
          style: {
            padding: "7px 14px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            background: active ? C.orange : C.chip,
            color: active ? "#fff" : C.sub,
            transition: "all .2s"
          }
        },
        txt
      );
    const btn = (txt: string, onClick?: any, st?: any) =>
      h(
        "div",
        {
          onClick,
          style: {
            background: C.orange,
            color: "#fff",
            borderRadius: 14,
            padding: "14px 18px",
            fontSize: 14,
            fontWeight: 800,
            textAlign: "center",
            cursor: "pointer",
            letterSpacing: ".02em",
            boxShadow: "0 6px 18px rgba(243,108,33,.35)",
            ...st
          }
        },
        txt
      );
    const ghost = (txt: string, onClick?: any, st?: any) =>
      h(
        "div",
        { onClick, style: { border: "1.5px solid " + C.line, color: C.txt, borderRadius: 14, padding: "13px 18px", fontSize: 14, fontWeight: 700, textAlign: "center", cursor: "pointer", ...st } },
        txt
      );
    const iconBox = (name: string, bg: string, color: string, size = 42, isz = 20) =>
      h(
        "div",
        { style: { width: size, height: size, borderRadius: size * 0.32, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 } },
        I(name, isz, color)
      );
    const stars = (n: number, size = 13) =>
      h(
        "div",
        { style: { display: "flex", gap: 2 } },
        [0, 1, 2].map((i) => h("span", { key: i, style: { color: i < n ? C.yellow : C.faint, display: "flex" } }, I("star", size, i < n ? C.yellow : C.faint)))
      );
    return { C, h, I, card, bar, chip, btn, ghost, iconBox, stars };
  }
  perf() {
    try {
      return JSON.parse(localStorage.getItem("dm-perf") || "{}");
    } catch (e) {
      return {};
    }
  }
  record(tema: string, ok: boolean) {
    const p = this.perf();
    const t = p[tema] || { ok: 0, err: 0 };
    if (ok) t.ok++;
    else t.err++;
    p[tema] = t;
    try {
      localStorage.setItem("dm-perf", JSON.stringify(p));
    } catch (e) {}
    try {
      const hs = JSON.parse(localStorage.getItem("dm-hist") || "[]");
      hs.push({ t: tema, ok: !!ok, ts: Date.now() });
      localStorage.setItem("dm-hist", JSON.stringify(hs.slice(-400)));
    } catch (e) {}
    this.setState({ perfTick: (this.state.perfTick || 0) + 1 });
  }
  weights(): Record<string, number> {
    return {
      Biologia: 3,
      "Português/Literatura": 2,
      Português: 2,
      Linguagens: 2,
      Física: 2,
      Química: 2,
      Matemática: 1,
      História: 1,
      Geografia: 1,
      "Língua Estrangeira": 1
    };
  }
  matOf(tema: string) {
    const m: Record<string, string> = {
      "Sistema Digestório": "Biologia",
      Citologia: "Biologia",
      "Sistema Respiratório": "Biologia",
      "Sistema Cardiovascular": "Biologia",
      "Genética Mendeliana": "Biologia",
      Ecologia: "Biologia",
      Evolução: "Biologia",
      "Fisiologia Humana": "Biologia",
      Estequiometria: "Química",
      Soluções: "Química",
      Termoquímica: "Química",
      "Química Orgânica": "Química",
      "Equilíbrio químico": "Química",
      Cinemática: "Física",
      Dinâmica: "Física",
      "Trabalho e Energia": "Física",
      Funções: "Matemática",
      "Geometria Plana": "Matemática",
      Probabilidade: "Matemática",
      "Interpretação de Texto": "Português/Literatura",
      "Brasil República": "História",
      Geopolítica: "Geografia"
    };
    return m[tema] || (this.weights()[tema] ? tema : "Biologia");
  }
  diffOf(tema: string) {
    const d: Record<string, string> = {
      Estequiometria: "Difícil",
      Cinemática: "Difícil",
      Termoquímica: "Difícil",
      "Química Orgânica": "Difícil",
      Dinâmica: "Difícil",
      Citologia: "Fácil",
      "Interpretação de Texto": "Fácil",
      Ecologia: "Fácil"
    };
    return d[tema] || "Média";
  }
  hist() {
    try {
      return JSON.parse(localStorage.getItem("dm-hist") || "[]");
    } catch (e) {
      return [];
    }
  }
  trendOf(tema: string) {
    const hs = this.hist().filter((x: any) => x.t === tema);
    if (hs.length < 4) return 1;
    const half = Math.floor(hs.length / 2);
    const err = (a: any[]) => a.filter((x) => !x.ok).length / a.length;
    const dE = err(hs.slice(half)) - err(hs.slice(0, half));
    return Math.max(0.7, Math.min(1.3, 1 + dE * 0.6));
  }
  priorities() {
    const W = this.weights(),
      perf = this.perf(),
      feels = this.state.feels || {};
    const recov: Record<string, number> = { Fácil: 1, Média: 0.75, Difícil: 0.55 };
    const out: any[] = [];
    for (const tema in perf) {
      const t = perf[tema],
        tot = t.ok + t.err;
      if (!tot || !t.err) continue;
      const errRate = t.err / tot,
        mat = this.matOf(tema),
        w = W[mat] || 1;
      const dif = this.diffOf(tema),
        conf = 0.5 + Math.min(1, tot / 10) * 0.5,
        tr = this.trendOf(tema);
      const gain = w * errRate * recov[dif] * conf * tr;
      out.push({
        tema,
        mat,
        w,
        errRate,
        tot,
        dif,
        gain,
        why:
          "peso " +
          w +
          " × " +
          Math.round(errRate * 100) +
          "% de erro × recuperação " +
          dif.toLowerCase() +
          (tr > 1.05 ? " × erros em alta" : tr < 0.95 ? " × em evolução" : "")
      });
    }
    Object.keys(feels).forEach((mat) => {
      if (feels[mat] === "Turbulência" && !out.some((o) => o.mat === mat)) {
        const w = W[mat] || 1;
        out.push({ tema: mat, mat, w, errRate: 0.5, tot: 0, dif: "Média", gain: w * 0.5 * 0.75 * 0.4, why: "peso " + w + " × turbulência no briefing" });
      }
    });
    out.sort((a, b) => b.gain - a.gain);
    return out;
  }
  weakest() {
    const pr = this.priorities();
    return pr.length ? pr[0].tema : null;
  }
  plan() {
    let ls = null;
    try {
      ls = localStorage.getItem("dm-plan");
    } catch (e) {}
    return this.props.plano ?? ls ?? "decolando";
  }
  extras() {
    try {
      return JSON.parse(localStorage.getItem("dm-extras") || "[]");
    } catch (e) {
      return [];
    }
  }
  addExtra(t: string, d: string) {
    const ex = this.extras();
    if (!ex.some((x: any) => x.t === t)) {
      ex.push({ t, d });
      try {
        localStorage.setItem("dm-extras", JSON.stringify(ex));
      } catch (e) {}
    }
  }
  fmtD(d: Date) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  isStudyDay(d: Date) {
    const B = this.state.brief || { dias: 5 };
    return ((d.getDay() + 6) % 7) < (B.dias || 5);
  }
  curriculum() {
    return [
      ["Biologia", "Sistema Digestório"],
      ["Química", "Estequiometria"],
      ["Biologia", "Sistema Respiratório"],
      ["Física", "Cinemática"],
      ["Biologia", "Sistema Cardiovascular"],
      ["Matemática", "Funções"],
      ["Química", "Soluções"],
      ["Biologia", "Genética Mendeliana"],
      ["Português", "Interpretação de Texto"],
      ["Física", "Dinâmica"],
      ["Biologia", "Ecologia"],
      ["Química", "Termoquímica"],
      ["Matemática", "Geometria Plana"],
      ["História", "Brasil República"],
      ["Biologia", "Evolução"],
      ["Geografia", "Geopolítica"],
      ["Física", "Trabalho e Energia"],
      ["Química", "Química Orgânica"],
      ["Biologia", "Fisiologia Humana"],
      ["Matemática", "Probabilidade"]
    ];
  }
  missionOfDate(ds: string) {
    const B = this.state.brief || {};
    const start = new Date((B.inicio || "2026-07-19") + "T12:00");
    const d = new Date(ds + "T12:00");
    if (d < start || !this.isStudyDay(d)) return null;
    if (B.prova && ds > B.prova) return null;
    let n = 0;
    const cur = new Date(start);
    while (cur <= d) {
      if (this.isStudyDay(cur)) n++;
      cur.setDate(cur.getDate() + 1);
    }
    const c = this.curriculum();
    const topic = c[(n - 1) % c.length];
    const sim = n % 6 === 0,
      red = n % 10 === 0;
    const acts: any[] = [];
    if (sim) {
      acts.push(
        { ic: "file", t: "Simulado de Voo · " + Math.ceil(n / 6) + "º", d: "12 questões · 30 min · pesos FACAPE", go: "simulados" },
        { ic: "refresh", t: "Correção e revisão dos erros", d: "Gabarito comentado · 30 min", go: "simulados" }
      );
    } else {
      acts.push(
        { ic: "video", t: "Aula · " + topic[1], d: topic[0] + " · videoaula · 35 min", go: "conteudo" },
        { ic: "target", t: "20 questões · " + topic[1], d: "Banco de Questões · 40 min", go: "questoes" },
        { ic: "file", t: "Resumo · " + topic[1], d: "Bagagem Essencial · 10 min", go: "conteudo" },
        { ic: "refresh", t: "Revisão programada", d: "Flashcards · 15 min", go: "flashcards" }
      );
    }
    if (red) acts.push({ ic: "note", t: "Produção de redação", d: "Envio pelo WhatsApp · 1h", go: "redacao" });
    if (this.plan() === "voo-guiado" && !sim) {
      const f = this.state.feels || {};
      const turb = Object.keys(f).filter((m2) => f[m2] === "Turbulência");
      if (turb.length)
        acts.splice(2, 0, {
          ic: "bolt",
          t: "Revisão extra · " + turb[(n - 1) % turb.length],
          d: "Ajuste do algoritmo · turbulência no briefing",
          ia: true,
          go: "flashcards"
        });
    }
    return { n, topic, acts, sim, red };
  }
  daysDone(): Record<string, boolean> {
    try {
      return JSON.parse(localStorage.getItem("dm-days-done") || "{}");
    } catch (e) {
      return {};
    }
  }
  setDayDone(ds: string, v: boolean) {
    const dd = this.daysDone();
    if (v) dd[ds] = true;
    else delete dd[ds];
    try {
      localStorage.setItem("dm-days-done", JSON.stringify(dd));
    } catch (e) {}
    this.forceUpdate();
  }
  checkinKey() {
    return "dm-checkin-" + this.fmtD(new Date());
  }
  checkinDone() {
    try {
      return JSON.parse(localStorage.getItem(this.checkinKey()) || "null");
    } catch (e) {
      return null;
    }
  }
  copQuestions() {
    return [
      { k: "desempenho", q: "Como foi seu desempenho hoje?", opts: ["Fui muito bem 💪", "Mais ou menos", "Tive dificuldades"] },
      { k: "missoes", q: "Conseguiu concluir todas as missões de hoje?", opts: ["Sim, todas", "Parcialmente", "Ainda não"] },
      { k: "disciplina", q: "Qual disciplina teve mais dificuldade?", opts: ["Biologia", "Química", "Física", "Matemática", "Nenhuma"] },
      { k: "confianca", q: "Como está seu nível de confiança para a prova?", opts: ["Alto 🚀", "Médio", "Baixo"] },
      { k: "tempo", q: "Quanto tempo conseguiu estudar hoje?", opts: ["Menos de 1h", "Entre 1h e 3h", "Mais de 3h"] },
      { k: "carga", q: "Deseja aumentar ou reduzir a carga de estudos?", opts: ["Aumentar", "Manter como está", "Reduzir"] }
    ];
  }
  copAck(k: string, opt: string) {
    if (k === "desempenho")
      return opt.indexOf("bem") >= 0
        ? "Excelente, piloto! Altitude subindo. 🛫"
        : opt === "Mais ou menos"
        ? "Entendido. Vamos ajustar a rota juntos."
        : "Sem problema — turbulência faz parte do voo.";
    if (k === "missoes") return opt === "Sim, todas" ? "Missão cumprida! Registrado no diário de bordo." : "Ok, vou repriorizar o que ficou pendente.";
    if (k === "disciplina") return opt === "Nenhuma" ? "Ótimo sinal!" : "Anotado: reforço de " + opt + " a caminho.";
    if (k === "confianca")
      return opt.indexOf("Alto") >= 0 ? "É assim que se fala!" : opt === "Médio" ? "Confiança se constrói com constância." : "Vou montar vitórias rápidas para elevar sua confiança.";
    if (k === "tempo") return "Registrado no seu diário de bordo.";
    return "Certo!";
  }
  copFinish(ans: any) {
    const acts: string[] = [];
    if (ans.disciplina && ans.disciplina !== "Nenhuma") {
      this.addExtra("Revisão extra · " + ans.disciplina, "Check-in do Copiloto · dificuldade relatada");
      acts.push("adicionei uma Revisão extra de " + ans.disciplina + " à sua Missão do Dia");
    }
    if (ans.missoes && ans.missoes !== "Sim, todas") acts.push("repriorizei os passos pendentes — eles abrem primeiro amanhã");
    if (ans.confianca === "Baixo") acts.push("incluí metas curtas de vitória rápida nas próximas missões");
    const B = { ...(this.state.brief || {}) };
    if (ans.carga === "Aumentar") {
      B.horas = Math.min(12, (B.horas || 3) + 1);
      acts.push("aumentei sua carga para " + B.horas + "h/dia");
    }
    if (ans.carga === "Reduzir") {
      B.horas = Math.max(1, (B.horas || 3) - 1);
      acts.push("reduzi sua carga para " + B.horas + "h/dia");
    }
    if (ans.carga && ans.carga !== "Manter como está") {
      this.setState({ brief: B });
      try {
        localStorage.setItem("dm-brief", JSON.stringify(B));
      } catch (e) {}
    }
    try {
      localStorage.setItem(this.checkinKey(), JSON.stringify(ans));
    } catch (e) {}
    return [
      {
        me: false,
        t: acts.length
          ? "Check-in registrado ✓ Com base nas suas respostas, " + acts.join("; ") + ". Confira na aba Hoje e no Cronograma."
          : "Check-in registrado ✓ Tudo em ordem — mantive seu cronograma como está. Continue assim, piloto!"
      }
    ];
  }
  checkinSummary(a: any) {
    return (
      'Resumo: desempenho "' +
      (a.desempenho || "—") +
      '" · missões "' +
      (a.missoes || "—") +
      '" · dificuldade em "' +
      (a.disciplina || "—") +
      '" · confiança "' +
      (a.confianca || "—") +
      '" · tempo "' +
      (a.tempo || "—") +
      '" · carga "' +
      (a.carga || "—") +
      '". Seu cronograma já reflete esses ajustes.'
    );
  }
  checkState(): Record<string, boolean> {
    try {
      return JSON.parse(localStorage.getItem("dm-check") || "{}");
    } catch (e) {
      return {};
    }
  }
  toggleCheck(k: string) {
    const c = this.checkState();
    c[k] = !c[k];
    try {
      localStorage.setItem("dm-check", JSON.stringify(c));
    } catch (e) {}
    this.forceUpdate();
  }
  qList() {
    const qs = this.data().questions;
    const m = this.state.qMateria;
    if (!m) return qs;
    const f = qs.filter((q) => q.materia === m);
    return f.length ? f : qs;
  }
  startReview() {
    this.setState({ screen: "questoes", reviewMode: true, revIdx: 0, revPicked: null, revDone: false, revScore: 0, revFinished: false, practice: false, moreOpen: false, notifOpen: false, simView: null });
  }
  todaySeq() {
    const pro = this.plan() === "voo-guiado";
    const list: any[] = [
      { ic: "video", t: "Aula · Sistema Digestório III", d: "Videoaula · 35 min", act: () => this.nav("conteudo", { contTitle: "Videoaulas", contBack: "mapa" }) },
      { ic: "target", t: "20 questões do tema", d: "Banco de Questões · 40 min", act: () => this.nav("questoes", { practice: true, qIdx: 0, qPicked: null, qDone: false, qMateria: null }) },
      { ic: "file", t: "Resumo · Bagagem Essencial", d: "Leitura · 10 min", act: () => this.nav("conteudo", { contTitle: "Resumos", contBack: "mapa" }) },
      { ic: "refresh", t: "Revisão programada · Citologia", d: "Flashcards · 15 min", act: () => this.nav("flashcards", { fcIdx: 0, fcFlip: false, fcOk: 0 }) }
    ];
    if (pro) {
      const feels = this.state.feels || {};
      const turb = Object.keys(feels).filter((m) => feels[m] === "Turbulência");
      if (turb.length)
        list.splice(1, 0, {
          ic: "bolt",
          t: "Revisão extra · " + turb[0],
          d: "Ajuste do algoritmo · você marcou turbulência no briefing",
          ia: true,
          act: () => this.nav("flashcards", { fcIdx: 0, fcFlip: false, fcOk: 0 })
        });
    }
    const pr0 = this.priorities();
    if (pr0.length) list.push({ ic: "bot", t: "Revisão do Copiloto · " + pr0[0].tema, d: "Maior ganho de nota agora · " + pr0[0].why, ia: true, act: () => this.startReview() });
    this.extras().forEach((x: any) => {
      if (!list.some((o) => o.t === x.t)) list.push({ ic: "bot", t: x.t, d: x.d, ia: true, act: () => this.startReview() });
    });
    return list;
  }
  nav(screen: string, extra?: any) {
    this.setState({ screen, practice: false, reviewMode: false, revFinished: false, moreOpen: false, notifOpen: false, simView: null, ...extra });
  }
  openBrowser(title: string, url: string, back?: string) {
    this.nav("browser", { browserTitle: title, browserUrl: url, browserBack: back || this.state.screen });
  }
  bannerRow() {
    const { h, I } = this.ui();
    const banners = [
      {
        t: "Aulão FACAPE ao vivo",
        d: "Sábado · 9h · transmissão no app",
        ic: "video",
        bg: "linear-gradient(140deg,#0d4a79,#01395E)",
        act: () => this.openBrowser("Aulão FACAPE ao vivo", "live.decolamed.com.br", "mapa")
      },
      { t: "Voo Guiado · PRO", d: "Cronograma inteligente adaptado a você", ic: "bolt", bg: "linear-gradient(140deg,#F36C21,#c9560f)", act: () => this.nav("plano") },
      {
        t: "Nova Bagagem Essencial",
        d: "12 resumos novos nos Estudos",
        ic: "bag",
        bg: "linear-gradient(140deg,rgba(1,30,50,.78),rgba(1,30,50,.38)),url(/assets/mountain_lake.png) center/cover",
        act: () => this.nav("hangar")
      }
    ];
    const bs = [...banners, { ...banners[0], clone: true }];
    return h(
      "div",
      {
        id: "dm-ban",
        onScroll: (e: any) => {
          const el = e.currentTarget;
          const n = el.children.length - 1;
          const w = el.children[0].offsetWidth + 10;
          if (el.scrollLeft >= n * w - 2) el.scrollTo({ left: 0, behavior: "auto" });
        },
        style: { display: "flex", gap: 10, overflowX: "auto", overflowY: "hidden", margin: "0 18px", scrollSnapType: "x mandatory", scrollbarWidth: "none" }
      },
      bs.map((b, i) =>
        h(
          "div",
          {
            key: i,
            onClick: b.act,
            style: {
              minWidth: "100%",
              scrollSnapAlign: "start",
              borderRadius: 18,
              padding: "15px 16px",
              background: b.bg,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              gap: 12,
              alignItems: "center",
              boxShadow: "0 8px 20px rgba(0,0,0,.18)"
            }
          },
          [
            h("div", { key: "i", style: { width: 42, height: 42, borderRadius: 14, background: "rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center" } }, I(b.ic, 20, "#fff")),
            h("div", { key: "t", style: { flex: 1 } }, [
              h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 900 } }, b.t),
              h("div", { key: "b", style: { fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,.75)", marginTop: 2 } }, b.d)
            ]),
            I("chevR", 16, "rgba(255,255,255,.7)")
          ]
        )
      )
    );
  }

  head(title: string, opts: any = {}) {
    const { C, h, I } = this.ui();
    return h("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "16px 18px 10px" } }, [
      opts.back !== false
        ? h(
            "div",
            {
              key: "b",
              onClick: () => this.nav(opts.back || "mapa"),
              style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.txt }
            },
            I("arrowL", 18, C.txt)
          )
        : null,
      h("div", { key: "t", style: { fontSize: 17, fontWeight: 800, color: C.txt, flex: 1 } }, title),
      opts.right ||
        h(
          "div",
          {
            key: "r",
            onClick: () => this.setState({ notifOpen: true }),
            style: { position: "relative", width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }
          },
          [I("bell", 18, C.txt), h("div", { key: "d", style: { position: "absolute", top: 7, right: 7, width: 8, height: 8, borderRadius: 99, background: C.orange } })]
        )
    ]);
  }
  tabbar() {
    const { C, h, I } = this.ui();
    const s = this.state.screen;
    const items = [
      { k: "mapa", ic: "plane", t: "Hoje" },
      { k: "painel", ic: "gauge", t: "Painel" },
      { k: "missoes", ic: "target", t: "Missões" },
      { k: "estudos", ic: "book", t: "Estudos" },
      { k: "mais", ic: "dots", t: "Mais" }
    ];
    return h(
      "div",
      { style: { position: "absolute", bottom: 0, left: 0, right: 0, background: C.navBg, backdropFilter: "blur(14px)", borderTop: "1px solid " + C.line, display: "flex", padding: "8px 8px 22px" } },
      items.map((it) => {
        const active = it.k === "mais" ? this.state.moreOpen : s === it.k;
        return h(
          "div",
          {
            key: it.k,
            onClick: () => (it.k === "mais" ? this.setState({ moreOpen: !this.state.moreOpen }) : this.nav(it.k)),
            style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", color: active ? C.orange : C.faint, padding: "4px 0" }
          },
          [I(it.ic, 21, active ? C.orange : C.faint), h("span", { key: "t", style: { fontSize: 9.5, fontWeight: 700 } }, it.t)]
        );
      })
    );
  }
  sidebarDesktop() {
    const { C, h, I } = this.ui();
    const s = this.state.screen;
    const items = [
      { k: "mapa", ic: "plane", t: "Mapa de Voo" },
      { k: "painel", ic: "gauge", t: "Painel de Bordo" },
      { k: "missoes", ic: "target", t: "Missões" },
      { k: "plano", ic: "calendar", t: "Cronograma" },
      { k: "estudos", ic: "book", t: "Estudos" },
      { k: "questoes", ic: "target", t: "Questões" },
      { k: "simulados", ic: "file", t: "Simulados" },
      { k: "flashcards", ic: "cards", t: "Flashcards" },
      { k: "copiloto", ic: "bot", t: "Copiloto IA" },
      { k: "ranking", ic: "trophy", t: "Ranking" },
      { k: "conquistas", ic: "award", t: "Conquistas" },
      { k: "perfil", ic: "user", t: "Perfil" },
      { k: "config", ic: "gear", t: "Configurações" }
    ];
    return h(
      "div",
      {
        style: {
          width: 240,
          flexShrink: 0,
          background: "linear-gradient(180deg,#0d4a79 0%,#01395E 45%)",
          display: "flex",
          flexDirection: "column",
          padding: "22px 16px",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto"
        }
      },
      [
        h("img", { key: "l", src: "/assets/logo.png", alt: "Decola Med", style: { height: 36, alignSelf: "flex-start", margin: "0 8px 20px" } }),
        ...items.map((it) => {
          const act = s === it.k;
          return h(
            "div",
            {
              key: it.k,
              onClick: () => this.nav(it.k),
              style: {
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 13px",
                borderRadius: 12,
                cursor: "pointer",
                marginBottom: 3,
                background: act ? C.orange : "transparent",
                color: act ? "#fff" : "rgba(255,255,255,.72)",
                fontSize: 12.5,
                fontWeight: act ? 800 : 600
              }
            },
            [I(it.ic, 18, act ? "#fff" : "rgba(255,255,255,.72)"), it.t]
          );
        }),
        h("div", { key: "sp", style: { flex: 1, minHeight: 14 } }),
        h(
          "div",
          {
            key: "out",
            onClick: this.logout,
            style: { display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 12, cursor: "pointer", color: "rgba(255,255,255,.6)", fontSize: 11.5, fontWeight: 700 }
          },
          [I("logout", 16, "rgba(255,255,255,.6)"), "Sair da conta"]
        )
      ]
    );
  }
  screenWrap(children: any, opts: any = {}) {
    const { C, h } = this.ui();
    if (this.wide()) {
      return h("div", { style: { display: "flex", alignItems: "flex-start" } }, [
        this.sidebarDesktop(),
        h("div", { key: "m", style: { flex: 1, minWidth: 0, minHeight: "100vh", position: "relative", background: C.bg, color: C.txt, padding: "26px 32px 60px" } }, [
          h("div", { key: "c", style: { display: "flex", flexDirection: "column", maxWidth: 640, margin: "0 auto" } }, children),
          this.state.notifOpen ? this.notifSheet() : null,
          this.state.errOpen ? this.errSheet() : null
        ])
      ]);
    }
    return h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg, color: C.txt } }, [
      h("div", { key: "c", style: { flex: 1, overflowY: "auto", paddingBottom: opts.noTab ? 24 : 110, display: "flex", flexDirection: "column" } }, children),
      opts.noTab ? null : this.tabbar(),
      this.state.notifOpen ? this.notifSheet() : null,
      this.state.moreOpen && !opts.noTab ? this.moreSheet() : null,
      this.state.errOpen ? this.errSheet() : null
    ]);
  }

  // ---------- overlays ----------
  notifSheet() {
    const { C, h, I, iconBox } = this.ui();
    const d = this.data();
    return h(
      "div",
      {
        onClick: () => this.setState({ notifOpen: false }),
        style: { position: "absolute", inset: 0, background: "rgba(2,15,26,.55)", backdropFilter: "blur(3px)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 50 }
      },
      h(
        "div",
        { onClick: (e: any) => e.stopPropagation(), style: { background: C.card, borderRadius: "26px 26px 0 0", padding: "18px 18px 34px", maxHeight: "70%", overflowY: "auto", animation: "dm-in .3s ease both" } },
        [
          h("div", { key: "h", style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 } }, [
            h("div", { key: "t", style: { fontSize: 16, fontWeight: 800, color: C.txt } }, "Notificações"),
            h("div", { key: "x", onClick: () => this.setState({ notifOpen: false }), style: { cursor: "pointer", color: C.sub } }, I("x", 18, C.sub))
          ]),
          ...d.notifs.map((n, i) =>
            h(
              "div",
              {
                key: i,
                onClick: () => this.nav(n.go || "mapa"),
                style: { display: "flex", gap: 12, alignItems: "center", padding: "11px 4px", cursor: "pointer", borderBottom: i < d.notifs.length - 1 ? "1px solid " + C.line : "none" }
              },
              [
                iconBox(n.ic, n.tone === "orange" ? C.orangeSoft : C.blueSoft, n.tone === "orange" ? C.orange : C.dark ? "#8fc3e8" : "#01395E", 40, 18),
                h("div", { key: "b", style: { flex: 1 } }, [
                  h("div", { key: "t", style: { fontSize: 13, fontWeight: 700, color: C.txt } }, n.t),
                  h("div", { key: "d", style: { fontSize: 11.5, color: C.sub, marginTop: 2 } }, n.d)
                ]),
                h("div", { key: "tm", style: { fontSize: 10.5, color: C.faint, fontWeight: 600 } }, n.time)
              ]
            )
          )
        ]
      )
    );
  }
  moreSheet() {
    const { C, h, I, iconBox } = this.ui();
    const items = [
      { k: "questoes", ic: "target", t: "Questões" },
      { k: "simulados", ic: "file", t: "Simulados" },
      { k: "copiloto", ic: "bot", t: "Copiloto IA" },
      { k: "plano", ic: "calendar", t: "Cronograma" },
      { k: "redacao", ic: "note", t: "Redação" },
      { k: "ranking", ic: "trophy", t: "Ranking" },
      { k: "conquistas", ic: "award", t: "Conquistas" },
      { k: "perfil", ic: "user", t: "Perfil" },
      { k: "config", ic: "gear", t: "Configurações" }
    ];
    return h(
      "div",
      {
        onClick: () => this.setState({ moreOpen: false }),
        style: { position: "absolute", inset: 0, background: "rgba(2,15,26,.55)", backdropFilter: "blur(3px)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 50 }
      },
      h("div", { onClick: (e: any) => e.stopPropagation(), style: { background: C.card, borderRadius: "26px 26px 0 0", padding: "20px 18px 96px", animation: "dm-in .3s ease both" } }, [
        h("div", { key: "t", style: { fontSize: 13, fontWeight: 800, color: C.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 14 } }, "Torre de Controle"),
        h(
          "div",
          { key: "g", style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 } },
          items.map((it) =>
            h(
              "div",
              { key: it.k, onClick: () => this.nav(it.k), style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "12px 4px", borderRadius: 16, background: C.chip, cursor: "pointer" } },
              [iconBox(it.ic, C.orangeSoft, C.orange, 40, 19), h("span", { key: "t", style: { fontSize: 10.5, fontWeight: 700, color: C.txt, textAlign: "center" } }, it.t)]
            )
          )
        )
      ])
    );
  }

  // ---------- telas ----------
  scrMapa() {
    const { C, h, I, card, bar, btn } = this.ui();
    const S = this.state;
    const seq = this.todaySeq();
    const ck = this.checkState();
    const doneN = seq.filter((o) => ck[o.t]).length;
    const pct = Math.round((doneN / seq.length) * 100);
    const nextI = seq.findIndex((o) => !ck[o.t]);
    const pro = this.plan() === "voo-guiado";
    const wk = this.weakest();
    const upcoming = [
      ["Missão 7 · Sistema Respiratório", "Amanhã"],
      ["Missão 8 · Sistema Cardiovascular", "Semana 4"],
      ["Missão 9 · Genética Mendeliana", "Semana 4"],
      ["Missão 10 · Estequiometria", "Semana 5"],
      ["Missão 11 · Cinemática", "Semana 5"]
    ];
    return this.screenWrap([
      h("div", { key: "brand", style: { display: "flex", justifyContent: "center", padding: "20px 0 6px" } }, h("img", { src: "/assets/logo.png", alt: "Decola Med", style: { height: 50, filter: "drop-shadow(0 4px 10px rgba(1,20,40,.25))" } })),
      h("div", { key: "hd", style: { padding: "6px 20px 6px", display: "flex", alignItems: "center", gap: 12 } }, [
        h("div", { key: "g", style: { flex: 1 } }, [
          h("div", { key: "a", style: { fontSize: 19, fontWeight: 900 } }, this.saudacao() + ", " + this.primeiroNome() + "!"),
          h(
            "div",
            { key: "b", style: { fontSize: 12.5, color: C.sub, marginTop: 2 } },
            (function (self) {
              const B = self.state.brief || {};
              const dd = B.prova ? Math.max(0, Math.ceil((+new Date(B.prova + "T12:00") - Date.now()) / 864e5)) : null;
              return dd != null ? "Prova em " + dd + " dias · " + B.dias + " dias/sem · " + B.horas + "h/dia" : "Sua rota de estudos está pronta.";
            })(this)
          )
        ]),
        h(
          "div",
          {
            key: "n",
            onClick: () => this.setState({ notifOpen: true }),
            style: { position: "relative", width: 38, height: 38, borderRadius: 13, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }
          },
          [
            I("bell", 19, C.txt),
            h(
              "div",
              {
                key: "d",
                style: { position: "absolute", top: 6, right: 6, minWidth: 15, height: 15, borderRadius: 99, background: C.orange, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }
              },
              "3"
            )
          ]
        )
      ]),
      h("div", { key: "ban", style: { marginTop: 10 } }, this.bannerRow()),
      h(
        "div",
        { key: "plan", style: { margin: "12px 18px 0", display: "flex", gap: 12, alignItems: "center", padding: "13px 15px", borderRadius: 16, background: C.card, border: "1px solid " + C.line, boxShadow: "0 6px 16px rgba(1,30,50,.08)" } },
        [
          h("div", { key: "i", style: { fontSize: 24, animation: "dm-fly 3.5s ease-in-out infinite", lineHeight: 1 } }, "🚀"),
          h("div", { key: "t", style: { flex: 1 } }, [
            h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 900, color: C.txt } }, "Tudo pronto para decolar!"),
            h("div", { key: "b", style: { fontSize: 11, fontWeight: 600, color: C.sub, marginTop: 2 } }, "Estas são as missões programadas para hoje.")
          ]),
          h(
            "span",
            { key: "p", style: { fontSize: 9, fontWeight: 900, color: pro ? "#fff" : C.orange, background: pro ? C.orange : C.orangeSoft, padding: "4px 10px", borderRadius: 99, letterSpacing: ".05em", whiteSpace: "nowrap" } },
            pro ? "VOO GUIADO · PRO" : "DECOLANDO"
          )
        ]
      ),
      h(
        "div",
        { key: "hero", style: { margin: "12px 18px 0" } },
        card({ padding: 0, overflow: "hidden" }, [
          h("div", { key: "top", onClick: () => this.setState({ upcomingOpen: !S.upcomingOpen }), style: { padding: "16px 16px 14px", background: C.headGrad, color: "#fff", cursor: "pointer" } }, [
            h("div", { key: "r", style: { display: "flex", alignItems: "center", gap: 12 } }, [
              h(
                "div",
                { key: "i", style: { width: 46, height: 46, borderRadius: 99, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", animation: "dm-fly 3.5s ease-in-out infinite", flexShrink: 0 } },
                I("plane", 22, "#F8935A")
              ),
              h("div", { key: "t", style: { flex: 1 } }, [
                h("div", { key: "a", style: { fontSize: 10.5, fontWeight: 800, color: "rgba(255,255,255,.65)", letterSpacing: ".08em", textTransform: "uppercase" } }, "Missão do Dia · Missão 6"),
                h("div", { key: "b", style: { fontSize: 17, fontWeight: 900 } }, "Sistema Digestório"),
                h("div", { key: "c", style: { fontSize: 10.5, color: "rgba(255,255,255,.7)", fontWeight: 600, marginTop: 2 } }, seq.length + " passos · toque para ver as próximas missões")
              ]),
              h("div", { key: "p", style: { textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 } }, [
                h("div", { key: "v", style: { fontSize: 18, fontWeight: 900, color: "#F8935A" } }, pct + "%"),
                h("div", { key: "c", style: { transform: S.upcomingOpen ? "rotate(90deg)" : "none", transition: "transform .2s", display: "flex" } }, I("chevR", 15, "rgba(255,255,255,.6)"))
              ])
            ]),
            h("div", { key: "bar", style: { display: "flex", marginTop: 12 } }, bar(pct, "#F8935A", 7, "rgba(255,255,255,.18)"))
          ]),
          S.upcomingOpen
            ? h("div", { key: "up", style: { padding: "12px 16px", background: C.card2, borderBottom: "1px solid " + C.line } }, [
                h("div", { key: "l", style: { fontSize: 10.5, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 8 } }, "Próximas missões planejadas"),
                ...upcoming.map((u, i) =>
                  h("div", { key: i, style: { display: "flex", gap: 10, alignItems: "center", padding: "7px 0", borderBottom: i < upcoming.length - 1 ? "1px solid " + C.line : "none" } }, [
                    I("lock", 14, C.faint),
                    h("span", { key: "t", style: { flex: 1, fontSize: 12, fontWeight: 700, color: C.sub } }, u[0]),
                    h("span", { key: "d", style: { fontSize: 10.5, fontWeight: 700, color: C.faint } }, u[1])
                  ])
                ),
                h(
                  "div",
                  { key: "n", style: { marginTop: 8, fontSize: 10, fontWeight: 600, color: C.faint, lineHeight: 1.5 } },
                  "As próximas missões são liberadas quando você conclui a missão do dia."
                )
              ])
            : null,
          h("div", { key: "steps", style: { padding: "4px 16px 16px" } }, [
            h("div", { key: "l", style: { fontSize: 10.5, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase", margin: "12px 0 2px" } }, "Sequência de hoje — siga na ordem"),
            ...seq.map((o, i) => {
              const dn = !!ck[o.t];
              const isNext = i === nextI;
              return h("div", { key: "s" + i, style: { display: "flex", gap: 11, alignItems: "center", padding: "10px 0", borderBottom: i < seq.length - 1 ? "1px solid " + C.line : "none", opacity: dn ? 0.55 : 1 } }, [
                h(
                  "div",
                  {
                    key: "n",
                    onClick: (e: any) => {
                      e.stopPropagation();
                      this.toggleCheck(o.t);
                    },
                    title: dn ? "Desmarcar" : "Marcar como concluído",
                    style: {
                      width: 28,
                      height: 28,
                      borderRadius: 99,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 900,
                      background: dn ? C.green : isNext ? C.orange : C.chip,
                      color: dn || isNext ? "#fff" : C.sub
                    }
                  },
                  dn ? I("check", 14, "#fff", 3) : i + 1
                ),
                h("div", { key: "t", onClick: o.act, style: { flex: 1, cursor: "pointer" } }, [
                  h("div", { key: "a", style: { fontSize: 12.5, fontWeight: 800, textDecoration: dn ? "line-through" : "none", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" } }, [
                    o.t,
                    o.ia ? h("span", { key: "g", style: { fontSize: 8.5, fontWeight: 900, color: C.orange, background: C.orangeSoft, padding: "2px 7px", borderRadius: 99, letterSpacing: ".04em" } }, "COPILOTO") : null
                  ]),
                  h("div", { key: "b", style: { fontSize: 10.5, color: C.sub, fontWeight: 600, marginTop: 1 } }, o.d)
                ]),
                h("div", { key: "go", onClick: o.act, style: { cursor: "pointer", display: "flex" } }, I("chevR", 16, isNext ? C.orange : C.faint))
              ]);
            }),
            nextI >= 0
              ? btn("COMEÇAR PASSO " + (nextI + 1) + " →", seq[nextI].act, { marginTop: 14, padding: "13px" })
              : h("div", { key: "done" }, [
                  h("div", { key: "a", style: { marginTop: 14, padding: "12px", borderRadius: 14, background: C.greenSoft, textAlign: "center", fontSize: 12.5, fontWeight: 800, color: C.green } }, "Missão do Dia concluída! ✓ +290 XP"),
                  this.checkinDone() ? null : btn("FAZER CHECK-IN COM O COPILOTO →", () => this.nav("copiloto"), { marginTop: 10, padding: "12px", fontSize: 12.5 })
                ]),
            h("div", { key: "pl", onClick: () => this.nav("plano"), style: { textAlign: "center", fontSize: 11, fontWeight: 800, color: C.orange, paddingTop: 12, cursor: "pointer" } }, "Ver cronograma completo →")
          ])
        ])
      ),
      h(
        "div",
        { key: "cop", style: { margin: "14px 18px 0" } },
        card(
          { display: "flex", gap: 12, alignItems: "center" },
          [
            this.mascoteBadge("bot", 44, { anim: "none" }),
            h("div", { key: "t", style: { flex: 1 } }, [
              h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 800 } }, "Copiloto Decola"),
              h(
                "div",
                { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2, lineHeight: 1.45 } },
                this.checkinDone() ? "Check-in de hoje feito ✓ cronograma ajustado com suas respostas." : wk ? "Detectei erros em " + wk + " e adicionei uma revisão à sua missão. Faça o check-in do dia →" : "Faça o check-in do dia: respondo com opções rápidas e ajusto seu cronograma."
              )
            ]),
            h("div", { key: "go", style: { fontSize: 11.5, fontWeight: 800, color: C.orange } }, "Abrir →")
          ],
          () => this.nav("copiloto")
        )
      )
    ]);
  }

  sparkline(vals: number[], color: string, w = 72, hgt = 26) {
    const h = React.createElement;
    const max = Math.max(...vals),
      min = Math.min(...vals);
    const pts = vals.map((v, i) => i * (w / (vals.length - 1)) + "," + (hgt - 3 - ((v - min) / (max - min || 1)) * (hgt - 6))).join(" ");
    return h("svg", { width: w, height: hgt }, h("polyline", { points: pts, fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }));
  }

  scrPainel() {
    const { C, h, I, card, bar } = this.ui();
    const d = this.data();
    const metrics = [
      { t: "Altitude (XP total)", v: "12.450", s: "+650 esta semana", vals: [3, 4, 4, 6, 7, 9, 11], c: "#5aa9e6" },
      { t: "Sequência", v: "7 dias", s: "Melhor: 12 dias", vals: [2, 4, 3, 5, 6, 6, 7], c: C.orange },
      { t: "Precisão geral", v: "78%", s: "+8% esta semana", vals: [60, 64, 66, 70, 72, 75, 78], c: C.green },
      { t: "Horas de voo", v: "87h 15m", s: "+12h esta semana", vals: [40, 50, 58, 66, 72, 80, 87], c: "#c58fff" }
    ];
    return this.screenWrap([
      this.head("Painel de Bordo", { back: "mapa" }),
      h(
        "div",
        { key: "prof", style: { margin: "6px 18px 0" } },
        card({ background: C.headGrad, border: "none", color: "#fff" }, [
          h("div", { key: "r", style: { display: "flex", gap: 13, alignItems: "center" } }, [
            h(
              "div",
              { key: "av", style: { width: 54, height: 54, borderRadius: 99, background: "#F8935A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 900, color: "#01395E", border: "2.5px solid rgba(255,255,255,.7)" } },
              this.iniciais()
            ),
            h("div", { key: "t", style: { flex: 1 } }, [
              h("div", { key: "a", style: { fontSize: 16, fontWeight: 900 } }, this.props.nome || "Aluno Decola"),
              h("div", { key: "b", style: { display: "flex", gap: 6, alignItems: "center", marginTop: 3 } }, [
                h("span", { key: "p", style: { fontSize: 10.5, fontWeight: 800, background: "rgba(255,255,255,.16)", padding: "3px 9px", borderRadius: 99 } }, "COPILOTO"),
                h("span", { key: "n", style: { fontSize: 11, color: "rgba(255,255,255,.7)", fontWeight: 700 } }, "Nível 12")
              ])
            ]),
            I("star4", 30, "#F8935A")
          ]),
          h("div", { key: "xp", style: { marginTop: 14 } }, [
            h("div", { key: "l", style: { display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,.7)", marginBottom: 6 } }, [
              h("span", { key: "a" }, "1.250 / 2.000 XP"),
              h("span", { key: "b" }, "Próxima patente: 1º Oficial")
            ]),
            h("div", { key: "b", style: { display: "flex" } }, bar(62, "#F8935A", 7, "rgba(255,255,255,.18)"))
          ])
        ])
      ),
      h(
        "div",
        { key: "mets", style: { margin: "14px 18px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        metrics.map((m, i) =>
          card({ padding: 14 }, [
            h("div", { key: "t", style: { fontSize: 10.5, fontWeight: 700, color: C.faint, letterSpacing: ".04em", textTransform: "uppercase" } }, m.t),
            h("div", { key: "v", style: { fontSize: 20, fontWeight: 900, margin: "4px 0 2px" } }, m.v),
            h("div", { key: "s", style: { fontSize: 10.5, fontWeight: 700, color: C.green, marginBottom: 8 } }, m.s),
            this.sparkline(m.vals, m.c)
          ])
        )
      ),
      (() => {
        const p = this.perf();
        const ks = Object.keys(p);
        if (!ks.length) return null;
        return h(
          "div",
          { key: "real", style: { margin: "14px 18px 0" } },
          card({ border: "1.5px solid " + C.orange }, [
            h("div", { key: "t", style: { fontSize: 14.5, fontWeight: 800, marginBottom: 4 } }, "Raio-X real · seus dados"),
            h("div", { key: "d", style: { fontSize: 10.5, color: C.sub, fontWeight: 600, marginBottom: 12 } }, "Calculado pelo algoritmo com as questões que VOCÊ respondeu neste dispositivo."),
            ...ks.map((k, i) => {
              const t = p[k],
                tot = t.ok + t.err,
                pct = Math.round((t.ok / tot) * 100);
              return h("div", { key: i, style: { display: "flex", alignItems: "center", gap: 10, marginBottom: i < ks.length - 1 ? 11 : 0 } }, [
                h("span", { key: "n", style: { flex: 1, fontSize: 12, fontWeight: 700, color: C.sub } }, k),
                h("span", { key: "v", style: { fontSize: 11, fontWeight: 800, color: pct >= 70 ? C.green : C.red } }, t.ok + "/" + tot + " · " + pct + "%"),
                bar(pct, pct >= 70 ? C.green : C.red, 6)
              ]);
            })
          ])
        );
      })(),
      (() => {
        const pr = this.priorities().slice(0, 4);
        if (!pr.length) return null;
        return h(
          "div",
          { key: "prio", style: { margin: "14px 18px 0" } },
          card({ border: "1.5px solid " + C.orange }, [
            h("div", { key: "t", style: { fontSize: 14.5, fontWeight: 800, marginBottom: 2 } }, "Rota de maior ganho · algoritmo"),
            h(
              "div",
              { key: "d", style: { fontSize: 10.5, color: C.sub, fontWeight: 600, marginBottom: 12, lineHeight: 1.5 } },
              "Ordena o estudo pelo maior aumento de nota no menor tempo: peso da disciplina × taxa de erro × facilidade de recuperação × confiança da amostra × tendência."
            ),
            ...pr.map((o, i) =>
              h("div", { key: i, style: { display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderTop: i ? "1px solid " + C.line : "none" } }, [
                h("div", { key: "n", style: { width: 22, height: 22, borderRadius: 8, background: i === 0 ? C.orange : C.chip, color: i === 0 ? "#fff" : C.sub, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, flexShrink: 0 } }, i + 1),
                h("div", { key: "t", style: { flex: 1 } }, [
                  h("div", { key: "a", style: { fontSize: 12.5, fontWeight: 800 } }, o.tema),
                  h("div", { key: "b", style: { fontSize: 9.5, color: C.sub, fontWeight: 600, marginTop: 1 } }, o.mat + " · " + o.why)
                ]),
                h("div", { key: "g", style: { fontSize: 11, fontWeight: 900, color: i === 0 ? C.orange : C.sub, whiteSpace: "nowrap" } }, "+" + o.gain.toFixed(1) + " pts/h")
              ])
            )
          ])
        );
      })(),
      h(
        "div",
        { key: "subj", style: { margin: "14px 18px 0" } },
        card({}, [
          h("div", { key: "t", style: { fontSize: 14.5, fontWeight: 800, marginBottom: 14 } }, "Desempenho por matéria"),
          ...d.subjects.map((s, i) =>
            h("div", { key: i, style: { display: "flex", alignItems: "center", gap: 10, marginBottom: i < d.subjects.length - 1 ? 12 : 0 } }, [
              h("span", { key: "n", style: { width: 86, fontSize: 12, fontWeight: 700, color: C.sub } }, s.n),
              bar(s.v, s.c, 7),
              h("span", { key: "v", style: { width: 38, textAlign: "right", fontSize: 12.5, fontWeight: 800, color: s.c } }, s.v + "%")
            ])
          ),
          h(
            "div",
            { key: "leg", style: { display: "flex", gap: 12, marginTop: 14, paddingTop: 12, borderTop: "1px solid " + C.line } },
            [
              ["#3dd68c", "Domínio"],
              ["#ffc94d", "Atenção"],
              ["#ff6b5e", "Turbulência"]
            ].map((l, i) => h("div", { key: i, style: { display: "flex", gap: 6, alignItems: "center", fontSize: 10.5, fontWeight: 700, color: C.sub } }, [h("div", { key: "d", style: { width: 8, height: 8, borderRadius: 99, background: l[0] } }), l[1]]))
          )
        ])
      ),
      h(
        "div",
        { key: "week", style: { margin: "14px 18px 4px" } },
        card({}, [
          h("div", { key: "h", style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } }, [
            h("div", { key: "t", style: { fontSize: 14.5, fontWeight: 800 } }, "Evolução semanal"),
            h("div", { key: "s", style: { fontSize: 11, fontWeight: 700, color: C.sub, background: C.chip, padding: "5px 11px", borderRadius: 99 } }, "Precisão")
          ]),
          h("svg", { key: "g", width: "100%", height: 110, viewBox: "0 0 320 110" }, [
            ...[0, 1, 2, 3].map((i) => h("line", { key: "l" + i, x1: 0, y1: 14 + i * 26, x2: 320, y2: 14 + i * 26, stroke: C.line, strokeWidth: 1 })),
            h("polyline", { key: "p", points: "10,72 60,64 110,68 160,50 210,42 260,34 310,22", fill: "none", stroke: C.orange, strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }),
            ...[
              [10, 72],
              [60, 64],
              [110, 68],
              [160, 50],
              [210, 42],
              [260, 34],
              [310, 22]
            ].map((p, i) => h("circle", { key: "c" + i, cx: p[0], cy: p[1], r: 3.5, fill: C.orange, stroke: C.dark ? "#0c3557" : "#fff", strokeWidth: 2 }))
          ]),
          h(
            "div",
            { key: "d", style: { display: "flex", justifyContent: "space-between", padding: "0 4px", fontSize: 10, fontWeight: 700, color: C.faint } },
            ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d2, i) => h("span", { key: i }, d2))
          )
        ])
      )
    ]);
  }

  scrMissoes() {
    const { C, h, I, card, bar, chip, iconBox } = this.ui();
    const d = this.data();
    const t = this.state.missTab;
    const list = t === "diarias" ? d.daily : t === "semanais" ? d.weekly : d.special;
    return this.screenWrap([
      this.head("Centro de Missões", { back: "mapa" }),
      h("div", { key: "tabs", style: { display: "flex", gap: 8, padding: "6px 18px 4px" } }, [
        chip("Diárias", t === "diarias", () => this.setState({ missTab: "diarias" })),
        chip("Semanais", t === "semanais", () => this.setState({ missTab: "semanais" })),
        chip("Especiais", t === "especiais", () => this.setState({ missTab: "especiais" }))
      ]),
      h(
        "div",
        { key: "list", style: { margin: "12px 18px 0", display: "flex", flexDirection: "column", gap: 10 } },
        list.map((m: any, i: number) =>
          card({ padding: 15 }, [
            h("div", { key: "r", style: { display: "flex", gap: 12, alignItems: "center", marginBottom: 11 } }, [
              iconBox(m.ic, i % 2 ? C.peach : C.orangeSoft, i % 2 ? (C.dark ? C.peachTxt : "#9a5218") : C.orange, 44, 20),
              h("div", { key: "t", style: { flex: 1 } }, [
                h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 800 } }, m.t),
                m.d ? h("div", { key: "b", style: { fontSize: 11.5, color: C.sub, fontWeight: 600, marginTop: 2 } }, m.d) : null
              ]),
              h("div", { key: "xp", style: { fontSize: 12, fontWeight: 900, color: C.orange, background: C.orangeSoft, padding: "5px 10px", borderRadius: 99 } }, "+" + m.xp + " XP")
            ]),
            h("div", { key: "p", style: { display: "flex", alignItems: "center", gap: 10 } }, [bar((m.p / m.tot) * 100), h("span", { key: "f", style: { fontSize: 11.5, fontWeight: 800, color: C.sub } }, m.p + (m.unit || "") + "/" + m.tot + (m.unit || ""))])
          ])
        )
      ),
      t === "especiais"
        ? h("div", { key: "note", style: { margin: "14px 18px 0", padding: "13px 15px", borderRadius: 16, background: C.peach, display: "flex", gap: 10, alignItems: "center" } }, [
            I("gift", 20, C.dark ? C.peachTxt : "#9a5218"),
            h("span", { key: "t", style: { fontSize: 12, fontWeight: 700, color: C.dark ? C.peachTxt : "#9a5218", lineHeight: 1.5 } }, "Missões especiais têm prazo e recompensas maiores. Fique de olho na torre de controle!")
          ])
        : null
    ]);
  }

  scrEstudos() {
    const { C, h, I, card, bar, iconBox } = this.ui();
    const d = this.data();
    return this.screenWrap([
      this.head("Estudos", { back: "mapa" }),
      h("div", { key: "search", style: { margin: "6px 18px 0", display: "flex", gap: 10, alignItems: "center", background: C.card, border: "1px solid " + C.line, borderRadius: 14, padding: "12px 14px" } }, [
        I("search", 17, C.faint),
        h("input", { key: "i", placeholder: "Buscar conteúdo, assuntos...", style: { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: C.txt, fontWeight: 600, fontFamily: "inherit" } })
      ]),
      h(
        "div",
        { key: "cont", style: { margin: "14px 18px 0" } },
        card({}, [
          h("div", { key: "l", style: { fontSize: 11, fontWeight: 700, color: C.faint, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 } }, "Continue estudando"),
          h("div", { key: "r", style: { display: "flex", gap: 12, alignItems: "center" } }, [
            iconBox("video", C.greenSoft, C.green, 46, 20),
            h("div", { key: "t", style: { flex: 1 } }, [
              h("div", { key: "a", style: { fontSize: 14, fontWeight: 800 } }, "Sistema Digestório — Parte 2"),
              h("div", { key: "b", style: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 } }, [bar(43, C.green, 5), h("span", { key: "p", style: { fontSize: 11, fontWeight: 700, color: C.sub } }, "43%")])
            ]),
            h(
              "div",
              {
                key: "p",
                onClick: () => this.openBrowser("Aula · Sistema Digestório — Parte 2", "youtube.com/embed/decolamed-sd2", "estudos"),
                style: { width: 40, height: 40, borderRadius: 99, background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }
              },
              h("div", { style: { width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "11px solid #fff", marginLeft: 3 } })
            )
          ])
        ])
      ),
      h(
        "div",
        { key: "bq", style: { margin: "14px 18px 0" } },
        card({}, [
          h("div", { key: "h", style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } }, [
            h("div", { key: "t", style: { fontSize: 14.5, fontWeight: 800 } }, "Banco de Questões"),
            h("div", { key: "v", onClick: () => this.nav("questoes"), style: { fontSize: 11.5, fontWeight: 800, color: C.orange, cursor: "pointer" } }, "Ver tudo →")
          ]),
          h("div", { key: "s", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginBottom: 4 } }, "Todas as questões cadastradas, organizadas por disciplina"),
          ...(function (self) {
            const qs = self.data().questions;
            const mats: Record<string, number> = {};
            qs.forEach((q) => {
              mats[q.materia] = (mats[q.materia] || 0) + 1;
            });
            return Object.keys(mats).map((m, i) =>
              h(
                "div",
                {
                  key: "m" + i,
                  onClick: () => self.nav("questoes", { practice: true, qIdx: 0, qPicked: null, qDone: false, qMateria: m }),
                  style: { display: "flex", gap: 11, alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + C.line, cursor: "pointer" }
                },
                [
                  iconBox("target", C.orangeSoft, C.orange, 38, 17),
                  h("div", { key: "t", style: { flex: 1 } }, [
                    h("div", { key: "a", style: { fontSize: 12.5, fontWeight: 800 } }, m),
                    h("div", { key: "b", style: { fontSize: 10.5, color: C.sub, fontWeight: 600 } }, mats[m] + (mats[m] > 1 ? " questões cadastradas" : " questão cadastrada"))
                  ]),
                  I("chevR", 16, C.faint)
                ]
              )
            );
          })(this),
          h("div", { key: "links", style: { display: "flex", gap: 10, marginTop: 12 } }, [
            h(
              "div",
              { key: "sim", onClick: () => this.nav("simulados"), style: { flex: 1, display: "flex", gap: 8, alignItems: "center", justifyContent: "center", padding: "11px", borderRadius: 12, background: C.chip, cursor: "pointer", fontSize: 11.5, fontWeight: 800, color: C.txt } },
              [I("file", 15, C.orange), "Simulados"]
            ),
            h(
              "div",
              {
                key: "lst",
                onClick: () => this.nav("conteudo", { contTitle: "Listas de exercícios", contBack: "estudos" }),
                style: { flex: 1, display: "flex", gap: 8, alignItems: "center", justifyContent: "center", padding: "11px", borderRadius: 12, background: C.chip, cursor: "pointer", fontSize: 11.5, fontWeight: 800, color: C.txt }
              },
              [I("layers", 15, C.orange), "Listas"]
            )
          ])
        ])
      ),
      h(
        "div",
        { key: "grid", style: { margin: "14px 18px 4px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        d.estudos.map((e, i) =>
          card(
            { padding: 16 },
            [
              iconBox(e.ic, i % 2 ? C.peach : C.blueSoft, i % 2 ? (C.dark ? C.peachTxt : "#9a5218") : C.dark ? "#8fc3e8" : "#01395E", 44, 20),
              h("div", { key: "t", style: { fontSize: 13.5, fontWeight: 800, marginTop: 12 } }, e.t),
              h("div", { key: "d", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2 } }, e.d)
            ],
            () => (e.t === "Flashcards" ? this.nav("flashcards", { fcIdx: 0, fcFlip: false, fcOk: 0 }) : e.t === "Anotações" ? this.nav("anotacoes") : this.nav("conteudo", { contTitle: e.t, contBack: "estudos" }))
          )
        )
      )
    ]);
  }

  scrHangar() {
    const { C, h, I, card, iconBox } = this.ui();
    const d = this.data();
    return this.screenWrap([
      this.head("Hangar", { back: "mapa" }),
      h("div", { key: "search", style: { margin: "6px 18px 0", display: "flex", gap: 10, alignItems: "center", background: C.card, border: "1px solid " + C.line, borderRadius: 14, padding: "12px 14px" } }, [
        I("search", 17, C.faint),
        h("input", { key: "i", placeholder: "Buscar no hangar", style: { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: C.txt, fontWeight: 600, fontFamily: "inherit" } })
      ]),
      h(
        "div",
        { key: "grid", style: { margin: "14px 18px 4px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        d.hangar.map((e, i) =>
          card(
            { padding: 16 },
            [
              iconBox(e.ic, e.tone === "peach" ? C.peach : C.blueSoft, e.tone === "peach" ? (C.dark ? C.peachTxt : "#9a5218") : C.dark ? "#8fc3e8" : "#01395E", 46, 21),
              h("div", { key: "t", style: { fontSize: 13.5, fontWeight: 800, marginTop: 12 } }, e.t),
              h("div", { key: "d", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2 } }, e.d)
            ],
            () => (e.t === "Plano de Voo" ? this.nav("plano") : e.t === "Raio-X FACAPE" ? this.nav("painel") : e.t === "Livros Obrigatórios" ? this.openBrowser("Biblioteca Digital", "biblioteca.decolamed.com.br", "hangar") : this.nav("conteudo", { contTitle: e.t, contBack: "hangar" }))
          )
        )
      )
    ]);
  }

  scrQuestoes(): any {
    const { C, h, I, card, bar, btn, ghost, iconBox } = this.ui();
    const d = this.data();
    const S = this.state;
    if (S.reviewMode) return this.scrReview();
    if (S.practice) {
      const qs = this.qList();
      const q = qs[S.qIdx];
      const picked = S.qPicked,
        done = S.qDone,
        correct = done && picked === q.ans;
      return this.screenWrap(
        [
          this.head(S.qMateria ? "Praticar · " + S.qMateria : "Praticar questões", { back: "questoes", right: h("div", { style: { fontSize: 12, fontWeight: 800, color: C.sub } }, S.qIdx + 1 + " / " + qs.length) }),
          h("div", { key: "p", style: { margin: "0 18px", display: "flex" } }, bar(((S.qIdx + (done ? 1 : 0)) / qs.length) * 100)),
          h("div", { key: "meta", style: { margin: "14px 18px 0", display: "flex", gap: 8 } }, [
            h("span", { key: "m", style: { fontSize: 11, fontWeight: 800, color: C.green, background: C.greenSoft, padding: "5px 11px", borderRadius: 99 } }, q.materia),
            h("span", { key: "qc", style: { fontSize: 10, fontWeight: 800, color: C.faint, background: C.chip, padding: "5px 9px", borderRadius: 99, fontFamily: "monospace" } }, q.code || "Q000000"),
            h("span", { key: "t", style: { fontSize: 11, fontWeight: 800, color: C.sub, background: C.chip, padding: "5px 11px", borderRadius: 99 } }, q.tema),
            q.fonte ? h("span", { key: "fn", style: { fontSize: 11, fontWeight: 800, color: C.dark ? "#8fc3e8" : "#0b6aa8", background: C.blueSoft, padding: "5px 11px", borderRadius: 99 } }, q.fonte) : null
          ]),
          h("div", { key: "q", style: { margin: "14px 18px 0" } }, card({}, h("div", { style: { fontSize: 15, fontWeight: 700, lineHeight: 1.55 } }, q.q))),
          h(
            "div",
            { key: "alts", style: { margin: "12px 18px 0", display: "flex", flexDirection: "column", gap: 9 } },
            q.alts.map((a: string, i: number) => {
              let bg = C.card,
                border = C.line,
                col = C.txt;
              if (done) {
                if (i === q.ans) {
                  bg = C.greenSoft;
                  border = C.green;
                  col = C.dark ? "#7fe8b5" : "#127347";
                } else if (i === picked) {
                  bg = C.redSoft;
                  border = C.red;
                  col = C.red;
                }
              } else if (i === picked) {
                bg = C.orangeSoft;
                border = C.orange;
              }
              return h(
                "div",
                {
                  key: i,
                  onClick: () => !done && this.setState({ qPicked: i }),
                  style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 14px", borderRadius: 14, background: bg, border: "1.5px solid " + border, cursor: done ? "default" : "pointer", transition: "all .15s" }
                },
                [
                  h(
                    "div",
                    { key: "l", style: { width: 26, height: 26, borderRadius: 9, background: i === picked && !done ? C.orange : C.chip, color: i === picked && !done ? "#fff" : C.sub, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 } },
                    String.fromCharCode(65 + i)
                  ),
                  h("span", { key: "t", style: { fontSize: 13, fontWeight: 600, color: col, lineHeight: 1.4 } }, a)
                ]
              );
            })
          ),
          h("div", { key: "erri", style: { margin: "4px 18px 0" } }, this.errInline()),
          h(
            "div",
            { key: "nota" + (q.code || S.qIdx), style: { margin: "10px 18px 0" } },
            card({ padding: 14 }, [
              h("div", { key: "l", style: { display: "flex", gap: 7, alignItems: "center", marginBottom: 8 } }, [
                I("pencil", 13, C.sub),
                h("span", { key: "t", style: { fontSize: 11, fontWeight: 800, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase" } }, "Minhas anotações · salva automaticamente")
              ]),
              h("textarea", {
                key: "ta",
                defaultValue: (function () {
                  try {
                    return localStorage.getItem("dm-note-" + (q.code || S.qIdx)) || "";
                  } catch (e) {
                    return "";
                  }
                })(),
                onChange: (e: any) => {
                  try {
                    localStorage.setItem("dm-note-" + (q.code || S.qIdx), e.target.value);
                  } catch (err) {}
                },
                placeholder: "Anote aqui seu raciocínio, macetes ou dúvidas sobre esta questão...",
                style: { width: "100%", height: 64, resize: "vertical", background: C.dark ? "rgba(191,221,242,.05)" : "#fff", border: "1.5px solid " + C.line, borderRadius: 11, padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: C.txt, outline: "none", fontFamily: "inherit" }
              })
            ])
          ),
          done && !correct
            ? h(
                "div",
                { key: "rev", style: { margin: "14px 18px 0" } },
                card({ border: "1.5px solid " + C.orange, background: C.dark ? "linear-gradient(150deg,#3a2410,#0c3557 60%)" : "linear-gradient(150deg,#fff4ec,#fff)" }, [
                  h("div", { key: "h", style: { display: "flex", gap: 10, alignItems: "center", marginBottom: 10 } }, [
                    this.mascoteBadge("compass", 46, { bg: C.orangeSoft, color: C.orange, shadow: "none" }),
                    h("div", { key: "t" }, [
                      h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 900 } }, "Rota de Revisão detectada"),
                      h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600 } }, "Assunto mapeado: " + q.tema + " · Matriz FACAPE")
                    ])
                  ]),
                  h("div", { key: "d", style: { fontSize: 12, color: C.sub, fontWeight: 600, lineHeight: 1.55, marginBottom: 12 } }, "Registrei este erro no seu Raio-X. Materiais recomendados para reforçar o assunto:"),
                  ...d.recs.map((r, i) =>
                    h("div", { key: i, style: { display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderTop: "1px solid " + C.line } }, [
                      iconBox(r.ic, C.blueSoft, C.dark ? "#8fc3e8" : "#01395E", 36, 16),
                      h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 12, fontWeight: 700 } }, r.t), h("div", { key: "b", style: { fontSize: 10.5, color: C.faint, fontWeight: 600 } }, r.d)]),
                      h("span", { key: "tag", style: { fontSize: 9.5, fontWeight: 800, color: r.tag === "Prioritário" ? C.orange : C.sub, background: r.tag === "Prioritário" ? C.orangeSoft : C.chip, padding: "3px 8px", borderRadius: 99 } }, r.tag)
                    ])
                  ),
                  btn("INICIAR REVISÃO · 5 QUESTÕES", () => this.setState({ reviewMode: true, revIdx: 0, revPicked: null, revDone: false, revScore: 0, revFinished: false }), { marginTop: 12, padding: "12px 14px", fontSize: 13 })
                ])
              )
            : null,
          done && correct
            ? h("div", { key: "ok", style: { margin: "14px 18px 0", padding: "13px 15px", borderRadius: 16, background: C.greenSoft, display: "flex", gap: 10, alignItems: "center" } }, [
                I("check", 18, C.green, 3),
                h("span", { key: "t", style: { fontSize: 12.5, fontWeight: 700, color: C.dark ? "#7fe8b5" : "#127347" } }, "Correto! +10 XP · Altitude subindo, piloto.")
              ])
            : null,
          h(
            "div",
            { key: "cta", style: { margin: "16px 18px 0", display: "flex", gap: 10 } },
            !done
              ? [
                  btn(
                    "CONFIRMAR RESPOSTA",
                    () => {
                      if (picked == null) return;
                      this.record(q.tema, picked === q.ans);
                      this.setState({ qDone: true });
                    },
                    { flex: 1, opacity: picked == null ? 0.45 : 1 }
                  )
                ]
              : [
                  ghost("Sair", () => this.setState({ practice: false, qPicked: null, qDone: false }), { flex: 1 }),
                  btn(
                    S.qIdx < qs.length - 1 ? "PRÓXIMA →" : "CONCLUIR",
                    () => (S.qIdx < qs.length - 1 ? this.setState({ qIdx: S.qIdx + 1, qPicked: null, qDone: false }) : this.setState({ practice: false, qIdx: 0, qPicked: null, qDone: false })),
                    { flex: 2 }
                  )
                ]
          )
        ],
        { noTab: true }
      );
    }
    const cats = [
      { ic: "layers", t: "Por disciplina", d: "Em Estudos → Banco de Questões", act: () => this.nav("estudos") },
      { ic: "x", t: "Questões erradas", d: "Refazer erros", act: () => this.startReview() },
      { ic: "note", t: "Cadernos", d: "Suas anotações", act: () => this.nav("anotacoes") },
      { ic: "heart", t: "Favoritas", d: "Materiais salvos", act: () => this.nav("conteudo", { contTitle: "Favoritos", contBack: "questoes" }) }
    ];
    return this.screenWrap([
      this.head("Banco de Questões", { back: "mapa" }),
      h(
        "div",
        { key: "donut", style: { margin: "6px 18px 0" } },
        card({ display: "flex", gap: 16, alignItems: "center" }, [
          h("svg", { key: "s", width: 86, height: 86, viewBox: "0 0 86 86" }, [
            h("circle", { key: "t", cx: 43, cy: 43, r: 36, fill: "none", stroke: C.chip, strokeWidth: 10 }),
            h("circle", { key: "v", cx: 43, cy: 43, r: 36, fill: "none", stroke: C.green, strokeWidth: 10, strokeDasharray: 2 * Math.PI * 36, strokeDashoffset: 2 * Math.PI * 36 * 0.28, strokeLinecap: "round", transform: "rotate(-90 43 43)" }),
            h("text", { key: "x", x: 43, y: 47, textAnchor: "middle", fontSize: 17, fontWeight: 900, fill: C.txt, fontFamily: "inherit" }, "72%")
          ]),
          h("div", { key: "t", style: { flex: 1 } }, [
            h("div", { key: "a", style: { fontSize: 14.5, fontWeight: 800 } }, "1.248 questões resolvidas"),
            h("div", { key: "b", style: { fontSize: 12, color: C.sub, fontWeight: 600, marginTop: 3, lineHeight: 1.5 } }, "898 acertos · 350 erros"),
            h("div", { key: "c", onClick: () => this.nav("painel"), style: { fontSize: 11.5, fontWeight: 800, color: C.orange, marginTop: 6, cursor: "pointer" } }, "Ver relatório completo →")
          ])
        ])
      ),
      h(
        "div",
        { key: "cats", style: { margin: "14px 18px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        cats.map((c2, i) =>
          card(
            { padding: 15 },
            [
              iconBox(c2.ic, i % 2 ? C.peach : C.blueSoft, i % 2 ? (C.dark ? C.peachTxt : "#9a5218") : C.dark ? "#8fc3e8" : "#01395E", 42, 19),
              h("div", { key: "t", style: { fontSize: 13, fontWeight: 800, marginTop: 10 } }, c2.t),
              h("div", { key: "d", style: { fontSize: 10.5, color: C.sub, fontWeight: 600, marginTop: 2 } }, c2.d)
            ],
            c2.act
          )
        )
      ),
      h("div", { key: "cta", style: { margin: "16px 18px 0" } }, btn("PRATICAR AGORA →", () => this.setState({ practice: true, qIdx: 0, qPicked: null, qDone: false, qMateria: null }))),
      h("div", { key: "note", style: { margin: "12px 18px 0", padding: "12px 14px", borderRadius: 14, background: C.chip, fontSize: 11.5, color: C.sub, fontWeight: 600, lineHeight: 1.55, display: "flex", gap: 9 } }, [
        I("bot", 16, C.orange),
        "Cada questão é ligada a um conteúdo da matriz FACAPE. Ao errar, o Copiloto registra o assunto, atualiza seu Raio-X e monta uma rota de revisão personalizada."
      ])
    ]);
  }

  scrReview() {
    const { C, h, I, card, bar, btn, ghost } = this.ui();
    const d = this.data();
    const S = this.state;
    if (S.revFinished) {
      const pct = Math.round((S.revScore / d.review.length) * 100);
      return this.screenWrap(
        [
          h("div", { key: "c", style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center" } }, [
            this.mascoteBadge("award", 124, { anim: "dm-pop .5s ease both", bg: C.greenSoft, color: C.green, shadow: "none" }),
            h("div", { key: "t", style: { fontSize: 22, fontWeight: 900, marginTop: 20 } }, "Revisão concluída!"),
            h("div", { key: "d", style: { fontSize: 13.5, color: C.sub, fontWeight: 600, marginTop: 8, lineHeight: 1.5 } }, "Você acertou " + S.revScore + " de " + d.review.length + " questões sobre Sistema Digestório."),
            h("div", { key: "pct", style: { fontSize: 44, fontWeight: 900, color: pct >= 70 ? C.green : C.orange, margin: "18px 0 4px" } }, pct + "%"),
            h("div", { key: "xp", style: { fontSize: 12.5, fontWeight: 800, color: C.orange, background: C.orangeSoft, padding: "6px 14px", borderRadius: 99 } }, "+" + (S.revScore * 10 + 10) + " XP · Raio-X atualizado"),
            h("div", { key: "note", style: { marginTop: 18, padding: "12px 14px", borderRadius: 14, background: C.chip, fontSize: 11.5, color: C.sub, fontWeight: 600, lineHeight: 1.55 } }, "O Copiloto seguirá recomendando este assunto até sua precisão passar de 80%.")
          ]),
          h("div", { key: "f", style: { padding: "0 24px 30px", display: "flex", gap: 10 } }, [
            ghost("Voltar às questões", () => this.setState({ reviewMode: false, revFinished: false, practice: false }), { flex: 1 }),
            btn("MISSÃO DO DIA", () => this.nav("mapa"), { flex: 1 })
          ])
        ],
        { noTab: true }
      );
    }
    const q = d.review[S.revIdx],
      picked = S.revPicked,
      done = S.revDone;
    return this.screenWrap(
      [
        this.head("Rota de Revisão", { back: "questoes", right: h("div", { style: { fontSize: 12, fontWeight: 800, color: C.sub } }, S.revIdx + 1 + " / " + d.review.length) }),
        h("div", { key: "p", style: { margin: "0 18px", display: "flex" } }, bar(((S.revIdx + (done ? 1 : 0)) / d.review.length) * 100, C.green)),
        h("div", { key: "tag", style: { margin: "14px 18px 0", display: "flex", gap: 8, alignItems: "center" } }, [
          I("refresh", 15, C.orange),
          h("span", { key: "t", style: { fontSize: 11.5, fontWeight: 800, color: C.orange } }, "Revisão dirigida · Sistema Digestório")
        ]),
        h("div", { key: "q", style: { margin: "12px 18px 0" } }, card({}, h("div", { style: { fontSize: 15, fontWeight: 700, lineHeight: 1.55 } }, q.q))),
        h(
          "div",
          { key: "alts", style: { margin: "12px 18px 0", display: "flex", flexDirection: "column", gap: 9 } },
          q.alts.map((a, i) => {
            let bg = C.card,
              border = C.line,
              col = C.txt;
            if (done) {
              if (i === q.ans) {
                bg = C.greenSoft;
                border = C.green;
                col = C.dark ? "#7fe8b5" : "#127347";
              } else if (i === picked) {
                bg = C.redSoft;
                border = C.red;
                col = C.red;
              }
            } else if (i === picked) {
              bg = C.orangeSoft;
              border = C.orange;
            }
            return h(
              "div",
              { key: i, onClick: () => !done && this.setState({ revPicked: i }), style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 14px", borderRadius: 14, background: bg, border: "1.5px solid " + border, cursor: done ? "default" : "pointer" } },
              [
                h(
                  "div",
                  { key: "l", style: { width: 26, height: 26, borderRadius: 9, background: i === picked && !done ? C.orange : C.chip, color: i === picked && !done ? "#fff" : C.sub, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 } },
                  String.fromCharCode(65 + i)
                ),
                h("span", { key: "t", style: { fontSize: 13, fontWeight: 600, color: col, lineHeight: 1.4 } }, a)
              ]
            );
          })
        ),
        h("div", { key: "erri", style: { margin: "4px 18px 0" } }, this.errInline()),
        h(
          "div",
          { key: "cta", style: { margin: "16px 18px 0" } },
          !done
            ? btn(
                "CONFIRMAR",
                () => {
                  if (picked == null) return;
                  this.record("Sistema Digestório", picked === q.ans);
                  this.setState({ revDone: true, revScore: this.state.revScore + (picked === q.ans ? 1 : 0) });
                },
                { opacity: picked == null ? 0.45 : 1 }
              )
            : btn(S.revIdx < d.review.length - 1 ? "PRÓXIMA →" : "VER RESULTADO", () => (S.revIdx < d.review.length - 1 ? this.setState({ revIdx: S.revIdx + 1, revPicked: null, revDone: false }) : this.setState({ revFinished: true })))
        )
      ],
      { noTab: true }
    );
  }

  scrSimulados() {
    const { C, h, I, card, btn, iconBox } = this.ui();
    const d = this.data();
    return this.screenWrap([
      this.head("Simulados de Voo", { back: "mapa" }),
      h(
        "div",
        { key: "next", style: { margin: "6px 18px 0" } },
        card({ background: C.headGrad, border: "none", color: "#fff" }, [
          h("div", { key: "l", style: { fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,.6)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 } }, "Próximo simulado"),
          h("div", { key: "t", style: { fontSize: 17, fontWeight: 900 } }, "Simulado Rápido · Demonstração"),
          h("div", { key: "d", style: { fontSize: 12, color: "rgba(255,255,255,.7)", fontWeight: 600, marginTop: 4 } }, "12 questões · 30 min · pesos oficiais FACAPE"),
          btn("INICIAR SIMULADO", () => this.setState({ simView: "run", simIdx: 0, simAns: {}, simSec: 0, simGrid: false }), { marginTop: 14, background: "#F36C21" })
        ])
      ),
      h(
        "div",
        { key: "stats", style: { margin: "14px 18px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } },
        [
          ["66%", "média de acertos"],
          ["8", "realizados"],
          ["Top 5%", "ranking"]
        ].map((s, i) => card({ padding: "14px 10px", textAlign: "center" }, [h("div", { key: "v", style: { fontSize: 17, fontWeight: 900, color: i === 0 ? C.green : C.txt } }, s[0]), h("div", { key: "t", style: { fontSize: 10, color: C.sub, fontWeight: 700, marginTop: 3 } }, s[1])]))
      ),
      h("div", { key: "lbl", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Disponíveis"),
      h(
        "div",
        { key: "sims", style: { margin: "0 18px", display: "flex", flexDirection: "column", gap: 10 } },
        d.sims.map((s, i) =>
          card({ padding: 14, display: "flex", gap: 12, alignItems: "center" }, [
            iconBox("file", C.blueSoft, C.dark ? "#8fc3e8" : "#01395E", 44, 19),
            h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 800 } }, s.t), h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2 } }, s.q + " questões · " + s.time + " · " + s.lvl)]),
            h("div", { key: "go", onClick: () => this.setState({ simView: "run", simIdx: 0, simAns: {}, simSec: 0, simGrid: false }), style: { fontSize: 11, fontWeight: 900, color: "#fff", background: C.orange, padding: "8px 13px", borderRadius: 10, cursor: "pointer" } }, "INICIAR")
          ])
        )
      ),
      h("div", { key: "lbl2", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Histórico"),
      h(
        "div",
        { key: "hist", style: { margin: "0 18px 4px", display: "flex", flexDirection: "column", gap: 10 } },
        d.simHist.map((s2, i) =>
          card(
            { padding: 14, display: "flex", gap: 12, alignItems: "center" },
            [
              h(
                "div",
                { key: "v", style: { width: 46, height: 46, borderRadius: 14, background: s2.v >= 70 ? C.greenSoft : C.orangeSoft, color: s2.v >= 70 ? C.green : C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 } },
                s2.v + "%"
              ),
              h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 13, fontWeight: 800 } }, s2.t), h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2 } }, s2.d + " · concluído")]),
              I("chevR", 17, C.faint)
            ],
            () => this.setState({ simView: "gabarito", gabFrom: "hist" })
          )
        )
      )
    ]);
  }

  scrSimRun() {
    const { C, h, I, card, btn, ghost } = this.ui();
    const S = this.state;
    const qs = this.simQs();
    const q = qs[S.simIdx];
    const total = 30 * 60,
      left = Math.max(0, total - S.simSec);
    const mm = String(Math.floor(left / 60)).padStart(2, "0"),
      ss = String(left % 60).padStart(2, "0");
    const answered = Object.keys(S.simAns).length;
    return h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg, color: C.txt } }, [
      h("div", { key: "top", style: { display: "flex", alignItems: "center", gap: 12, padding: "18px 18px 12px" } }, [
        h("div", { key: "x", onClick: () => this.setState({ simView: null }), style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } }, I("x", 17, C.txt)),
        h("div", { key: "t", style: { flex: 1 } }, [
          h("div", { key: "a", style: { fontSize: 10.5, fontWeight: 700, color: C.faint, letterSpacing: ".05em", textTransform: "uppercase" } }, "Simulado de Voo"),
          h("div", { key: "b", style: { fontSize: 14, fontWeight: 900 } }, "Questão " + (S.simIdx + 1) + " de " + qs.length)
        ]),
        h("div", { key: "c", style: { display: "flex", alignItems: "center", gap: 7, background: left < 300 ? C.redSoft : C.chip, padding: "8px 13px", borderRadius: 12 } }, [
          I("clock", 15, left < 300 ? C.red : C.orange),
          h("span", { key: "t", style: { fontSize: 14, fontWeight: 900, fontVariantNumeric: "tabular-nums", color: left < 300 ? C.red : C.txt } }, "0" + Math.floor(left / 3600) + ":" + mm + ":" + ss)
        ])
      ]),
      h("div", { key: "pb", style: { margin: "0 18px", display: "flex" } }, this.ui().bar((answered / qs.length) * 100)),
      h("div", { key: "body", style: { flex: 1, overflowY: "auto", paddingBottom: 20 } }, [
        h("div", { key: "meta", style: { margin: "14px 18px 0", display: "flex", gap: 8 } }, [
          h("span", { key: "m", style: { fontSize: 11, fontWeight: 800, color: C.green, background: C.greenSoft, padding: "5px 11px", borderRadius: 99 } }, q.materia),
          h("span", { key: "qc", style: { fontSize: 10, fontWeight: 800, color: C.faint, background: C.chip, padding: "5px 9px", borderRadius: 99, fontFamily: "monospace" } }, q.code || "Q000000"),
          h("span", { key: "t", style: { fontSize: 11, fontWeight: 800, color: C.sub, background: C.chip, padding: "5px 11px", borderRadius: 99 } }, q.tema),
          q.fonte ? h("span", { key: "fn", style: { fontSize: 11, fontWeight: 800, color: C.dark ? "#8fc3e8" : "#0b6aa8", background: C.blueSoft, padding: "5px 11px", borderRadius: 99 } }, q.fonte) : null
        ]),
        h("div", { key: "q", style: { margin: "12px 18px 0" } }, card({}, h("div", { style: { fontSize: 15, fontWeight: 700, lineHeight: 1.55 } }, q.q))),
        h(
          "div",
          { key: "alts", style: { margin: "12px 18px 0", display: "flex", flexDirection: "column", gap: 9 } },
          q.alts.map((a: string, i: number) => {
            const sel = S.simAns[S.simIdx] === i;
            return h(
              "div",
              { key: i, onClick: () => this.setState({ simAns: { ...S.simAns, [S.simIdx]: i } }), style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 14px", borderRadius: 14, background: sel ? C.orangeSoft : C.card, border: "1.5px solid " + (sel ? C.orange : C.line), cursor: "pointer" } },
              [
                h("div", { key: "l", style: { width: 26, height: 26, borderRadius: 9, background: sel ? C.orange : C.chip, color: sel ? "#fff" : C.sub, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 } }, String.fromCharCode(65 + i)),
                h("span", { key: "t", style: { fontSize: 13, fontWeight: 600, lineHeight: 1.4 } }, a)
              ]
            );
          })
        ),
        h("div", { key: "erri", style: { margin: "4px 18px 0" } }, this.errInline()),
        S.simGrid
          ? h(
              "div",
              { key: "grid", style: { margin: "14px 18px 0" } },
              card({}, [
                h("div", { key: "t", style: { fontSize: 12.5, fontWeight: 800, marginBottom: 10 } }, "Navegação · " + answered + " respondidas"),
                h(
                  "div",
                  { key: "g", style: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 } },
                  qs.map((_, i) =>
                    h(
                      "div",
                      {
                        key: i,
                        onClick: () => this.setState({ simIdx: i }),
                        style: {
                          height: 38,
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: "pointer",
                          background: i === S.simIdx ? C.orange : S.simAns[i] != null ? C.greenSoft : C.chip,
                          color: i === S.simIdx ? "#fff" : S.simAns[i] != null ? C.green : C.sub,
                          border: "1.5px solid " + (i === S.simIdx ? C.orange : S.simAns[i] != null ? C.green : "transparent")
                        }
                      },
                      i + 1
                    )
                  )
                )
              ])
            )
          : null
      ]),
      h("div", { key: "foot", style: { padding: "12px 18px 34px", borderTop: "1px solid " + C.line, display: "flex", gap: 10, background: C.navBg } }, [
        ghost(S.simGrid ? "Fechar mapa" : "Mapa de questões", () => this.setState({ simGrid: !S.simGrid }), { flex: 1, padding: "12px 10px", fontSize: 12.5 }),
        S.simIdx < qs.length - 1
          ? btn("PRÓXIMA →", () => this.setState({ simIdx: S.simIdx + 1 }), { flex: 1, padding: "12px 10px", fontSize: 12.5 })
          : btn(
              "ENVIAR ✓",
              () => {
                qs.forEach((qq, i) => {
                  if (S.simAns[i] != null) this.record(qq.tema, S.simAns[i] === qq.ans);
                });
                this.setState({ simView: "result" });
              },
              { flex: 1, padding: "12px 10px", fontSize: 12.5, background: C.green }
            )
      ])
    ]);
  }

  scrSimResult() {
    const { C, h, I, card, btn, ghost } = this.ui();
    const S = this.state;
    const qs = this.simQs();
    const correct = qs.filter((q, i) => S.simAns[i] === q.ans).length;
    const pct = Math.round((correct / qs.length) * 100);
    const mm = String(Math.floor(S.simSec / 60)).padStart(2, "0"),
      ss = String(S.simSec % 60).padStart(2, "0");
    return this.screenWrap(
      [
        h("div", { key: "c", style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 24px 0", textAlign: "center" } }, [
          this.mascoteBadge("trophy", 132, { anim: "dm-pop .5s ease both" }),
          h("div", { key: "t", style: { fontSize: 23, fontWeight: 900, marginTop: 18 } }, "Simulado concluído!"),
          h("div", { key: "d", style: { fontSize: 13, color: C.sub, fontWeight: 600, marginTop: 6 } }, "Parabéns, piloto. Voo finalizado com segurança."),
          h("div", { key: "pct", style: { fontSize: 52, fontWeight: 900, color: pct >= 70 ? C.green : C.orange, marginTop: 14 } }, pct + "%"),
          h("div", { key: "sub", style: { fontSize: 12.5, color: C.sub, fontWeight: 700 } }, "de acertos · nota calculada pelos pesos das disciplinas do curso"),
          h("div", { key: "obj", style: { marginTop: 10, fontSize: 11, fontWeight: 800, color: C.sub, background: C.chip, padding: "7px 13px", borderRadius: 99 } }, "Nota considerando apenas a prova objetiva."),
          h(
            "div",
            { key: "stats", style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 22, width: "100%" } },
            [
              [String(correct), "corretas", C.green],
              [String(qs.length - correct), "erradas", C.red],
              ["00:" + mm + ":" + ss, "tempo total", C.txt]
            ].map((s, i) => card({ padding: "14px 8px", textAlign: "center" }, [h("div", { key: "v", style: { fontSize: 17, fontWeight: 900, color: s[2] as string } }, s[0]), h("div", { key: "t", style: { fontSize: 10, color: C.sub, fontWeight: 700, marginTop: 3 } }, s[1])]))
          ),
          h("div", { key: "xp", style: { marginTop: 16, fontSize: 12.5, fontWeight: 800, color: C.orange, background: C.orangeSoft, padding: "7px 16px", borderRadius: 99 } }, "+" + (100 + correct * 10) + " XP · Ranking atualizado: Top 320")
        ]),
        h("div", { key: "f", style: { padding: "20px 24px 10px", display: "flex", flexDirection: "column", gap: 10 } }, [
          btn("VER GABARITO COMENTADO", () => this.setState({ simView: "gabarito", gabFrom: null })),
          ghost("Voltar ao painel", () => {
            this.setState({ simView: null });
            this.nav("mapa");
          })
        ])
      ],
      { noTab: true }
    );
  }

  scrCopiloto() {
    const { C, h, I, btn, ghost } = this.ui();
    const S = this.state;
    const wk = this.weakest();
    const p = this.perf();
    const tot = Object.keys(p).reduce((a, k) => ({ ok: a.ok + p[k].ok, err: a.err + p[k].err }), { ok: 0, err: 0 });
    const qs = this.copQuestions();
    const done = this.checkinDone();
    const intro = [
      {
        me: false,
        t:
          tot.ok + tot.err > 0
            ? "Olá, piloto! Analisei seu dia: " +
              tot.ok +
              " acertos e " +
              tot.err +
              " erros nas questões respondidas" +
              (function (self: DecolaApp) {
                const pr = self.priorities();
                return pr.length ? ". Maior ganho de nota agora: " + pr[0].tema + " (" + pr[0].mat + ", peso " + pr[0].w + ") — priorizo o que mais sobe sua nota, não só o que você mais erra" : "";
              })(this) +
              ". Vou fazer um check-in rápido para ajustar seu cronograma."
            : "Olá, piloto! Sou seu Copiloto. Faço perguntas objetivas em momentos-chave e ajusto seu cronograma com as respostas — é só tocar nas opções."
      },
      { me: false, t: qs[0].q }
    ];
    const msgs: any[] = S.chat || (done ? [{ me: false, t: "Check-in de hoje concluído ✓" }, { me: false, t: this.checkinSummary(done) }] : intro);
    const idx = S.copIdx || 0;
    const last = msgs[msgs.length - 1];
    const asking = idx < qs.length && last && !last.me && last.t === qs[idx].q;
    const finished = idx >= qs.length && S.chat;
    const pick = (opt: string) => {
      const ans = { ...(S.copAns || {}), [qs[idx].k]: opt };
      const base = S.chat || intro;
      this.setState({ chat: [...base, { me: true, t: opt }], copAns: ans, copIdx: idx + 1 });
      setTimeout(() => {
        if (idx < qs.length - 1) this.setState({ chat: [...(this.state.chat || []), { me: false, t: this.copAck(qs[idx].k, opt) }, { me: false, t: qs[idx + 1].q }] });
        else this.setState({ chat: [...(this.state.chat || []), ...this.copFinish(ans)] });
      }, 550);
    };
    const restart = () => this.setState({ chat: intro, copIdx: 0, copAns: {} });
    return this.screenWrap([
      this.head("Copiloto Decola", { back: "mapa" }),
      h("div", { key: "chat", style: { flex: 1, display: "flex", flexDirection: "column", gap: 10, padding: "8px 18px 0" } }, [
        h("div", { key: "bot", style: { display: "flex", justifyContent: "center", marginBottom: 6 } }, this.mascoteBadge("bot", 96, { anim: "dm-fly 4s ease-in-out infinite" })),
        ...msgs.map((m, i) =>
          h(
            "div",
            {
              key: i,
              style: {
                alignSelf: m.me ? "flex-end" : "flex-start",
                maxWidth: "82%",
                padding: "11px 14px",
                borderRadius: m.me ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.me ? C.orange : C.card,
                border: m.me ? "none" : "1px solid " + C.line,
                color: m.me ? "#fff" : C.txt,
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.5,
                animation: "dm-in .3s ease both"
              }
            },
            m.t
          )
        ),
        asking
          ? h(
              "div",
              { key: "opts" + idx, style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 2, justifyContent: "flex-end" } },
              qs[idx].opts.map((o: string, i: number) =>
                h(
                  "div",
                  {
                    key: i,
                    onClick: () => pick(o),
                    style: { padding: "10px 15px", borderRadius: 14, background: C.orangeSoft, border: "1.5px solid " + (C.dark ? "rgba(243,108,33,.4)" : "rgba(243,108,33,.3)"), color: C.dark ? "#FBD3B8" : "#a04a10", fontSize: 12.5, fontWeight: 800, cursor: "pointer", animation: "dm-in .3s ease both" }
                  },
                  o
                )
              )
            )
          : null,
        done && !S.chat ? h("div", { key: "redo", style: { display: "flex", justifyContent: "flex-end" } }, ghost("Refazer check-in", restart, { padding: "10px 16px", fontSize: 12 })) : null,
        finished
          ? h("div", { key: "end", style: { display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" } }, [
              ghost("Novo check-in", restart, { padding: "10px 14px", fontSize: 12 }),
              btn("VER CRONOGRAMA →", () => this.nav("plano"), { padding: "10px 14px", fontSize: 12 })
            ])
          : null
      ]),
      h("div", { key: "note", style: { margin: "12px 18px 4px", padding: "11px 13px", borderRadius: 13, background: C.chip, display: "flex", gap: 9, alignItems: "center", fontSize: 10.5, color: C.sub, fontWeight: 600, lineHeight: 1.5 } }, [
        I("bot", 15, C.orange),
        "O Copiloto conduz a conversa: perguntas objetivas ao fim do dia, após missões, simulados, redações ou atrasos — e ajusta o cronograma automaticamente."
      ])
    ]);
  }

  scrRanking() {
    const { C, h, card, chip } = this.ui();
    const d = this.data();
    const t = this.state.rankTab;
    const podium = [d.ranking[1], d.ranking[0], d.ranking[2]];
    return this.screenWrap([
      this.head("Ranking", { back: "mapa" }),
      h("div", { key: "tabs", style: { display: "flex", gap: 8, padding: "6px 18px 4px" } }, [
        chip("Geral", t === "geral", () => this.setState({ rankTab: "geral" })),
        chip("FACAPE", t === "facape", () => this.setState({ rankTab: "facape" })),
        chip("Amigos", t === "amigos", () => this.setState({ rankTab: "amigos" }))
      ]),
      h(
        "div",
        { key: "podium", style: { margin: "18px 18px 0", display: "flex", alignItems: "flex-end", gap: 10, justifyContent: "center" } },
        podium.map((p, i) => {
          const first = i === 1,
            hgt = first ? 118 : 88,
            medal = ["#c8d6e5", "#ffc94d", "#e08e5a"][i];
          return h("div", { key: i, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 } }, [
            h(
              "div",
              {
                key: "av",
                style: {
                  width: first ? 62 : 50,
                  height: first ? 62 : 50,
                  borderRadius: 99,
                  background: medal,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: first ? 20 : 16,
                  fontWeight: 900,
                  color: "#01395E",
                  border: "3px solid " + (C.dark ? "#0c3557" : "#fff"),
                  boxShadow: "0 6px 16px rgba(0,0,0,.25)",
                  animation: first ? "dm-pulse 3s ease-in-out infinite" : "none"
                }
              },
              p.n[0]
            ),
            h("div", { key: "n", style: { fontSize: 11.5, fontWeight: 800, textAlign: "center" } }, p.n),
            h(
              "div",
              {
                key: "bar",
                style: {
                  width: "100%",
                  height: hgt,
                  borderRadius: "14px 14px 0 0",
                  background: first ? "linear-gradient(180deg,#F36C21,#d95a12)" : C.card,
                  border: first ? "none" : "1px solid " + C.line,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2
                }
              },
              [h("div", { key: "p", style: { fontSize: 22, fontWeight: 900, color: first ? "#fff" : C.faint } }, p.p), h("div", { key: "x", style: { fontSize: 10.5, fontWeight: 800, color: first ? "rgba(255,255,255,.85)" : C.sub } }, p.xp + " XP")]
            )
          ]);
        })
      ),
      h(
        "div",
        { key: "list", style: { margin: "14px 18px 4px", display: "flex", flexDirection: "column", gap: 8 } },
        d.ranking.slice(3).map((r, i) =>
          card({ padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", border: r.me ? "1.5px solid " + C.orange : "1px solid " + C.line, background: r.me ? C.orangeSoft : C.card }, [
            h("div", { key: "p", style: { width: 26, fontSize: 13, fontWeight: 900, color: r.me ? C.orange : C.faint } }, "#" + r.p),
            h("div", { key: "av", style: { width: 36, height: 36, borderRadius: 99, background: C.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: C.dark ? "#8fc3e8" : "#01395E" } }, r.n[0]),
            h("div", { key: "n", style: { flex: 1, fontSize: 13, fontWeight: r.me ? 900 : 700 } }, r.n + (r.me ? " (você)" : "")),
            h("div", { key: "x", style: { fontSize: 12.5, fontWeight: 900, color: r.me ? C.orange : C.sub } }, r.xp + " XP")
          ])
        )
      )
    ]);
  }

  scrConquistas() {
    const { C, h, I, card, chip } = this.ui();
    const d = this.data();
    const t = this.state.achTab;
    const got = d.badges.filter((b) => b.got).length;
    return this.screenWrap([
      this.head("Conquistas", { back: "mapa" }),
      h(
        "div",
        { key: "sum", style: { margin: "6px 18px 0" } },
        card({ background: C.headGrad, border: "none", color: "#fff", display: "flex", gap: 14, alignItems: "center" }, [
          h("div", { key: "i", style: { width: 56, height: 56, borderRadius: 20, background: "rgba(255,255,255,.14)", display: "flex", alignItems: "center", justifyContent: "center" } }, I("award", 28, "#F8935A")),
          h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 22, fontWeight: 900 } }, got + " / " + d.badges.length), h("div", { key: "b", style: { fontSize: 12, color: "rgba(255,255,255,.7)", fontWeight: 600 } }, "brasões desbloqueados")]),
          I("star4", 26, "rgba(255,255,255,.4)")
        ])
      ),
      h("div", { key: "tabs", style: { display: "flex", gap: 8, padding: "14px 18px 4px" } }, [
        chip("Brasões", t === "brasoes", () => this.setState({ achTab: "brasoes" })),
        chip("Certificados", t === "cert", () => this.setState({ achTab: "cert" })),
        chip("Marcos", t === "marcos", () => this.setState({ achTab: "marcos" }))
      ]),
      h(
        "div",
        { key: "grid", style: { margin: "12px 18px 4px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } },
        d.badges.map((b, i) =>
          card({ padding: "16px 8px", textAlign: "center", opacity: b.lock ? 0.55 : 1 }, [
            h(
              "div",
              {
                key: "i",
                style: {
                  width: 52,
                  height: 52,
                  margin: "0 auto",
                  borderRadius: 99,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: b.got ? "linear-gradient(150deg,#F36C21,#d95a12)" : b.lock ? C.chip : C.blueSoft,
                  boxShadow: b.got ? "0 6px 16px rgba(243,108,33,.35)" : "none"
                }
              },
              I(b.lock ? "lock" : b.ic, 24, b.got ? "#fff" : b.lock ? C.faint : C.dark ? "#8fc3e8" : "#01395E")
            ),
            h("div", { key: "t", style: { fontSize: 10.5, fontWeight: 800, marginTop: 9, lineHeight: 1.3 } }, b.t),
            h("div", { key: "s", style: { fontSize: 9.5, fontWeight: 700, marginTop: 3, color: b.got ? C.green : C.faint } }, b.got ? "Conquistado" : b.prog ? b.prog : "Bloqueado")
          ])
        )
      )
    ]);
  }

  scrPerfil() {
    const { C, h, I, card, bar, iconBox } = this.ui();
    const d = this.data();
    const handle = "@" + (this.props.email || "aluno").split("@")[0];
    return this.screenWrap([
      this.head("Carteira de Piloto", {
        back: "mapa",
        right: h("div", { onClick: () => this.nav("config"), style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } }, I("gear", 18, C.txt))
      }),
      h(
        "div",
        { key: "card", style: { margin: "6px 18px 0" } },
        card({ background: C.headGrad, border: "none", color: "#fff", position: "relative", overflow: "hidden" }, [
          h("div", { key: "wm", style: { position: "absolute", right: -20, bottom: -24, opacity: 0.1 } }, I("plane", 130, "#fff")),
          h("div", { key: "top", style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } }, [
            h("div", { key: "l", style: { fontSize: 9.5, fontWeight: 800, letterSpacing: ".14em", color: "rgba(255,255,255,.55)", textTransform: "uppercase" } }, "Decola Med · Piloto em treinamento"),
            I("star4", 18, "#F8935A")
          ]),
          h("div", { key: "r", style: { display: "flex", gap: 14, alignItems: "center" } }, [
            h("div", { key: "av", style: { width: 62, height: 62, borderRadius: 20, background: "#F8935A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#01395E" } }, this.iniciais()),
            h("div", { key: "t", style: { flex: 1 } }, [
              h("div", { key: "a", style: { fontSize: 17, fontWeight: 900 } }, this.props.nome || "Aluno Decola"),
              h("div", { key: "b", style: { fontSize: 11.5, color: "rgba(255,255,255,.65)", fontWeight: 700 } }, handle),
              h("div", { key: "c", style: { display: "flex", gap: 6, marginTop: 6 } }, [h("span", { key: "p", style: { fontSize: 10, fontWeight: 800, background: "rgba(255,255,255,.16)", padding: "3px 9px", borderRadius: 99 } }, "COPILOTO · NÍVEL 12")])
            ])
          ]),
          h("div", { key: "xp", style: { marginTop: 16 } }, [
            h("div", { key: "l", style: { display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,.7)", marginBottom: 6 } }, [h("span", { key: "a" }, "1.250 / 2.000 XP"), h("span", { key: "b" }, "Faltam 750 XP para 1º Oficial")]),
            h("div", { key: "b", style: { display: "flex" } }, bar(62, "#F8935A", 7, "rgba(255,255,255,.18)"))
          ])
        ])
      ),
      h(
        "div",
        { key: "stats", style: { margin: "14px 18px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } },
        [
          ["87h 15m", "horas de voo"],
          ["7 dias", "sequência"],
          ["Top 3%", "ranking #320"]
        ].map((s, i) => card({ padding: "14px 8px", textAlign: "center" }, [h("div", { key: "v", style: { fontSize: 15, fontWeight: 900, color: i === 1 ? C.orange : C.txt } }, s[0]), h("div", { key: "t", style: { fontSize: 9.5, color: C.sub, fontWeight: 700, marginTop: 3 } }, s[1])]))
      ),
      h(
        "div",
        { key: "badges", style: { margin: "14px 18px 0" } },
        card({}, [
          h("div", { key: "h", style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } }, [
            h("div", { key: "t", style: { fontSize: 14, fontWeight: 800 } }, "Brasões conquistados"),
            h("div", { key: "v", onClick: () => this.nav("conquistas"), style: { fontSize: 11.5, fontWeight: 800, color: C.orange, cursor: "pointer" } }, "Ver todos →")
          ]),
          h(
            "div",
            { key: "g", style: { display: "flex", gap: 10 } },
            d.badges
              .filter((b) => b.got)
              .map((b, i) =>
                h(
                  "div",
                  { key: i, style: { width: 46, height: 46, borderRadius: 99, background: "linear-gradient(150deg,#F36C21,#d95a12)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 5px 12px rgba(243,108,33,.3)" } },
                  I(b.ic, 20, "#fff")
                )
              )
          )
        ])
      ),
      h(
        "div",
        { key: "menu", style: { margin: "14px 18px 4px" } },
        card(
          { padding: "6px 16px" },
          [
            ["note", "Redação · Correção via WhatsApp", "2 créditos"],
            ["calendar", "Recalibrar plano de voo", ""],
            ["bell", "Notificações", ""],
            ["logout", "Sair da conta", ""]
          ].map((r, i) =>
            h(
              "div",
              {
                key: i,
                onClick: [() => this.nav("redacao"), () => this.nav("briefing"), () => this.setState({ notifOpen: true }), this.logout][i],
                style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 0", borderBottom: i < 3 ? "1px solid " + C.line : "none", cursor: "pointer" }
              },
              [
                I(r[0], 18, i === 3 ? C.red : C.sub),
                h("span", { key: "t", style: { flex: 1, fontSize: 13, fontWeight: 700, color: i === 3 ? C.red : C.txt } }, r[1]),
                r[2] ? h("span", { key: "b", style: { fontSize: 10.5, fontWeight: 800, color: C.orange, background: C.orangeSoft, padding: "3px 9px", borderRadius: 99 } }, r[2]) : I("chevR", 15, C.faint)
              ]
            )
          )
        )
      )
    ]);
  }

  scrConfig() {
    const { C, h, I, card } = this.ui();
    const dark = this.theme() === "dark";
    const toggle = (on: boolean, cb: any) =>
      h(
        "div",
        { onClick: cb, style: { width: 46, height: 26, borderRadius: 99, background: on ? C.orange : C.chip, padding: 3, cursor: "pointer", transition: "background .2s" } },
        h("div", { style: { width: 20, height: 20, borderRadius: 99, background: "#fff", transform: on ? "translateX(20px)" : "none", transition: "transform .2s", boxShadow: "0 2px 6px rgba(0,0,0,.25)" } })
      );
    return this.screenWrap([
      this.head("Configurações", { back: "perfil" }),
      h("div", { key: "lbl", style: { margin: "8px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Aparência"),
      h(
        "div",
        { key: "ap", style: { margin: "0 18px" } },
        card({ padding: "6px 16px" }, [
          h("div", { key: "th", style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 0", borderBottom: "1px solid " + C.line } }, [
            I(dark ? "moon" : "sun", 18, C.sub),
            h("span", { key: "t", style: { flex: 1, fontSize: 13, fontWeight: 700 } }, "Tema escuro"),
            toggle(dark, () => this.setState({ theme: dark ? "light" : "dark" }))
          ]),
          h("div", { key: "nt", style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 0" } }, [
            I("bell", 18, C.sub),
            h("span", { key: "t", style: { flex: 1, fontSize: 13, fontWeight: 700 } }, "Notificações push"),
            toggle(this.state.push, () => this.setState({ push: !this.state.push }))
          ])
        ])
      ),
      h("div", { key: "lbl2", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Conta"),
      h(
        "div",
        { key: "ac", style: { margin: "0 18px" } },
        card(
          { padding: "6px 16px" },
          [
            ["user", "Editar perfil"],
            ["lock", "Alterar senha"],
            ["calendar", "Recalibrar plano de voo"],
            ["file", "Termos e privacidade"]
          ].map((r, i) =>
            h(
              "div",
              {
                key: i,
                onClick: [() => this.nav("perfil"), () => this.nav("senha"), () => this.nav("briefing"), () => this.openBrowser("Termos e Privacidade", "decolamed.com.br/termos", "config")][i],
                style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 0", borderBottom: i < 3 ? "1px solid " + C.line : "none", cursor: "pointer" }
              },
              [I(r[0], 18, C.sub), h("span", { key: "t", style: { flex: 1, fontSize: 13, fontWeight: 700 } }, r[1]), I("chevR", 15, C.faint)]
            )
          )
        )
      ),
      h("div", { key: "lbl3", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Como usar a plataforma"),
      h(
        "div",
        { key: "help", style: { margin: "0 18px" } },
        card(
          { padding: "6px 16px" },
          [
            ["compass", "Ver tutorial da plataforma"],
            ["bot", "Ajuda pelo WhatsApp oficial"],
            ["plane", "Instalar aplicativo"],
            ["alert", "Comunicar erro na plataforma"]
          ].map((r, i) =>
            h(
              "div",
              {
                key: i,
                onClick: [
                  () => this.nav("tutorial", { tutStep: 0 }),
                  () => window.open(this.props.whatsappSuporte, "_blank", "noopener,noreferrer"),
                  () => this.setState({ screen: "tutorial", tutStep: 0 }),
                  () => this.setState({ errOpen: true, errSent: false, errText: "", errCat: "Outro" })
                ][i],
                style: { display: "flex", gap: 12, alignItems: "center", padding: "13px 0", borderBottom: i < 3 ? "1px solid " + C.line : "none", cursor: "pointer" }
              },
              [I(r[0], 18, C.sub), h("span", { key: "t", style: { flex: 1, fontSize: 13, fontWeight: 700 } }, r[1]), I("chevR", 15, C.faint)]
            )
          )
        )
      ),
      h("div", { key: "ver", style: { textAlign: "center", fontSize: 10.5, color: C.faint, fontWeight: 700, marginTop: 22 } }, "Decola Med · Voo 001")
    ]);
  }

  scrBriefing() {
    const { C, h, btn } = this.ui();
    const B = this.state.brief;
    const save = (b: any) => {
      this.setState({ brief: b });
      try {
        localStorage.setItem("dm-brief", JSON.stringify(b));
      } catch (e) {}
    };
    const row = (label: string, control: any) =>
      h("div", { key: label, style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "13px 16px", borderRadius: 14, background: C.card, border: "1px solid " + C.line, marginBottom: 10 } }, [
        h("span", { key: "l", style: { fontSize: 13, fontWeight: 600, color: C.sub } }, label),
        control
      ]);
    const dateInp = (k: string) =>
      h("input", { type: "date", value: B[k] || "", onChange: (e: any) => save({ ...B, [k]: e.target.value }), style: { background: "transparent", border: "none", outline: "none", fontSize: 13.5, fontWeight: 800, color: C.txt, fontFamily: "inherit", colorScheme: C.dark ? "dark" : "light", textAlign: "right" } });
    const step = (k: string, min: number, max: number, suf: string) =>
      h("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, [
        h("div", { key: "-", onClick: () => save({ ...B, [k]: Math.max(min, B[k] - 1) }), style: { width: 28, height: 28, borderRadius: 9, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, fontWeight: 900, color: C.sub } }, "−"),
        h("span", { key: "v", style: { fontSize: 13.5, fontWeight: 800, color: C.txt, minWidth: 64, textAlign: "center" } }, B[k] + suf),
        h("div", { key: "+", onClick: () => save({ ...B, [k]: Math.min(max, B[k] + 1) }), style: { width: 28, height: 28, borderRadius: 9, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 15, fontWeight: 900, color: C.orange } }, "+")
      ]);
    return this.screenWrap([
      this.head("Briefing de Voo", { back: "perfil" }),
      h("div", { key: "c", style: { margin: "8px 18px 0" } }, [
        row("Data da prova", dateInp("prova")),
        row("Início dos estudos", dateInp("inicio")),
        row("Dias por semana", step("dias", 1, 7, " dias")),
        row("Horas por dia", step("horas", 1, 12, "h")),
        h("div", { key: "lb", style: { fontSize: 12.5, fontWeight: 700, color: C.sub, margin: "10px 0 8px" } }, "Como você se sente em cada matéria?"),
        h("div", { key: "lb2", style: { fontSize: 10.5, fontWeight: 600, color: C.faint, marginBottom: 10 } }, "Toque para alternar: Domínio (facilidade) → Atenção → Turbulência (dificuldade). O algoritmo usa isso para priorizar seu cronograma."),
        h(
          "div",
          { key: "ch", style: { display: "flex", flexDirection: "column", gap: 8 } },
          ["Biologia", "Química", "Física", "Matemática", "Português/Literatura", "História", "Geografia", "Língua Estrangeira"].map((m) => {
            const lvl = this.state.feels[m] || "Atenção";
            const cfg = ({ Domínio: ["#3dd68c", C.greenSoft], Atenção: ["#ffc94d", "rgba(255,201,77,.14)"], Turbulência: ["#ff6b5e", C.redSoft] } as Record<string, string[]>)[lvl];
            return h(
              "div",
              {
                key: m,
                onClick: () => {
                  const cur = this.state.feels[m] || "Atenção";
                  const nx = ({ Domínio: "Atenção", Atenção: "Turbulência", Turbulência: "Domínio" } as Record<string, string>)[cur];
                  const f = { ...this.state.feels, [m]: nx };
                  this.setState({ feels: f });
                  try {
                    localStorage.setItem("dm-feels", JSON.stringify(f));
                  } catch (e) {}
                },
                style: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 13, background: C.card, border: "1px solid " + C.line, cursor: "pointer" }
              },
              [h("span", { key: "n", style: { flex: 1, fontSize: 13, fontWeight: 700, color: C.txt } }, m), h("span", { key: "v", style: { fontSize: 11, fontWeight: 800, color: cfg[0], background: cfg[1], padding: "5px 12px", borderRadius: 99 } }, lvl)]
            );
          })
        )
      ]),
      h("div", { key: "f", style: { padding: "10px 18px 30px" } }, btn("CONCLUÍDO", () => this.nav("perfil")))
    ]);
  }

  scrPlano() {
    const { C, h, I, card, btn, ghost, iconBox } = this.ui();
    const S = this.state;
    const pro = this.plan() === "voo-guiado";
    const B = S.brief || {};
    const today = this.fmtD(new Date());
    const sel = S.calSel || today;
    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + (S.calMonth || 0));
    const y = base.getFullYear(),
      mo = base.getMonth();
    const monthName = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][mo] + " " + y;
    const lead = (new Date(y, mo, 1).getDay() + 6) % 7,
      ndays = new Date(y, mo + 1, 0).getDate();
    const dd = this.daysDone();
    const prova = B.prova || null;
    const cells: (string | null)[] = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d2 = 1; d2 <= ndays; d2++) cells.push(this.fmtD(new Date(y, mo, d2)));
    const ck = this.checkState();
    const seqToday = this.todaySeq();
    const todayDone = seqToday.every((o) => ck[o.t]);
    const isDone = (ds: string) => (ds === today ? todayDone || !!dd[ds] : !!dd[ds]);
    const m = sel === today ? { n: 6, topic: ["Biologia", "Sistema Digestório"], acts: [] as any[], sim: false, red: false } : this.missionOfDate(sel);
    const selLabel = new Date(sel + "T12:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    const isToday = sel === today,
      isPast = sel < today,
      isFuture = sel > today;
    const doneCount = Object.keys(dd).filter((k) => k !== today).length + (isDone(today) ? 1 : 0);
    const feels = S.feels || {};
    const turb = Object.keys(feels).filter((m2) => feels[m2] === "Turbulência");
    const dom = Object.keys(feels).filter((m2) => feels[m2] === "Domínio");
    return this.screenWrap([
      this.head("Cronograma de Estudos", { back: "mapa" }),
      h(
        "div",
        { key: "info", style: { margin: "6px 18px 0" } },
        card({ padding: 14 }, [
          h("div", { key: "r", style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, [
            h("span", { key: "p", style: { fontSize: 9.5, fontWeight: 900, color: pro ? "#fff" : C.orange, background: pro ? C.orange : C.orangeSoft, padding: "4px 10px", borderRadius: 99, letterSpacing: ".05em" } }, pro ? "VOO GUIADO · PRO" : "DECOLANDO"),
            h("span", { key: "d", style: { fontSize: 10.5, fontWeight: 700, color: C.sub } }, (prova ? "Prova " + prova.split("-").reverse().join("/") + " · " : "") + (B.dias || 5) + " dias/sem · " + (B.horas || 3) + "h/dia")
          ]),
          h(
            "div",
            { key: "t", style: { fontSize: 10.5, fontWeight: 600, color: C.faint, marginTop: 8, lineHeight: 1.55 } },
            "Gerado automaticamente do Cronograma Base + seu Briefing de Voo" + (pro ? " + ajustes do Copiloto" : "") + ". Alterou o briefing ou fez check-in? O calendário se recalcula na hora."
          )
        ])
      ),
      h(
        "div",
        { key: "cal", style: { margin: "12px 18px 0" } },
        card({ padding: 14 }, [
          h("div", { key: "mh", style: { display: "flex", alignItems: "center", marginBottom: 10 } }, [
            h("div", { key: "l", onClick: () => this.setState({ calMonth: (S.calMonth || 0) - 1 }), style: { width: 30, height: 30, borderRadius: 10, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transform: "rotate(180deg)" } }, I("chevR", 15, C.sub)),
            h("div", { key: "t", style: { flex: 1, textAlign: "center", fontSize: 13.5, fontWeight: 900 } }, monthName),
            h("div", { key: "r", onClick: () => this.setState({ calMonth: (S.calMonth || 0) + 1 }), style: { width: 30, height: 30, borderRadius: 10, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } }, I("chevR", 15, C.sub))
          ]),
          h(
            "div",
            { key: "wd", style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 } },
            ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((w, i) => h("div", { key: i, style: { textAlign: "center", fontSize: 8.5, fontWeight: 900, color: C.faint } }, w))
          ),
          h(
            "div",
            { key: "g", style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 } },
            cells.map((ds, i) => {
              if (!ds) return h("div", { key: "e" + i });
              const mm = ds === today ? true : this.missionOfDate(ds);
              const done2 = mm && isDone(ds);
              const isSel = ds === sel,
                isT = ds === today,
                isProva = prova === ds;
              const missed = mm && ds < today && !done2;
              let bg = "transparent",
                col = C.faint,
                bd = "1.5px solid transparent";
              if (mm) {
                bg = C.chip;
                col = C.txt;
              }
              if (done2) {
                bg = C.greenSoft;
                col = C.green;
              }
              if (missed) col = C.red;
              if (isProva) {
                bg = C.orange;
                col = "#fff";
              }
              if (isT) bd = "1.5px solid " + C.orange;
              if (isSel) {
                bg = C.orange;
                col = "#fff";
                bd = "1.5px solid " + C.orange;
              }
              return h(
                "div",
                { key: ds, onClick: () => this.setState({ calSel: ds }), style: { height: 42, borderRadius: 11, background: bg, border: bd, color: col, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer" } },
                [
                  h("span", { key: "n", style: { fontSize: 12, fontWeight: 800 } }, parseInt(ds.slice(8), 10)),
                  isProva ? h("span", { key: "p", style: { fontSize: 6, fontWeight: 900, letterSpacing: ".04em" } }, "PROVA") : done2 ? I("check", 9, isSel ? "#fff" : C.green, 3.5) : mm ? h("div", { key: "d", style: { width: 4, height: 4, borderRadius: 99, background: isSel ? "#fff" : missed ? C.red : C.orange } }) : null
                ]
              );
            })
          ),
          h(
            "div",
            { key: "leg", style: { display: "flex", gap: 11, flexWrap: "wrap", marginTop: 10, paddingTop: 10, borderTop: "1px solid " + C.line } },
            [
              [C.orange, "Dia de missão"],
              [C.green, "Concluído"],
              [C.red, "Atrasado"],
              [C.faint, "Descanso"]
            ].map((l, i) => h("div", { key: i, style: { display: "flex", gap: 5, alignItems: "center", fontSize: 9.5, fontWeight: 700, color: C.sub } }, [h("div", { key: "d", style: { width: 7, height: 7, borderRadius: 99, background: l[0] as string } }), l[1]]))
          )
        ])
      ),
      h("div", { key: "sum", style: { margin: "10px 20px 0", fontSize: 10.5, fontWeight: 700, color: C.sub } }, doneCount + " dia(s) de missão concluído(s) · toque em um dia para ver as atividades"),
      h(
        "div",
        { key: "det" + sel, style: { margin: "8px 18px 0" } },
        card({ padding: 15 }, [
          h("div", { key: "h", style: { display: "flex", alignItems: "center", gap: 9, marginBottom: m ? 10 : 6 } }, [
            h("div", { key: "t", style: { flex: 1 } }, [
              h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 900 } }, m ? "Missão " + m.n + (m.sim ? " · Simulado de Voo" : " · " + m.topic[1]) : "Dia de descanso"),
              h("div", { key: "b", style: { fontSize: 10.5, color: C.sub, fontWeight: 600, marginTop: 1, textTransform: "capitalize" } }, selLabel)
            ]),
            m && isDone(sel)
              ? h("span", { key: "ok", style: { fontSize: 9, fontWeight: 900, color: C.green, background: C.greenSoft, padding: "4px 10px", borderRadius: 99 } }, "CONCLUÍDO ✓")
              : isToday
              ? h("span", { key: "hj", style: { fontSize: 9, fontWeight: 900, color: "#fff", background: C.orange, padding: "4px 10px", borderRadius: 99 } }, "HOJE")
              : null
          ]),
          !m
            ? h(
                "div",
                { key: "rest", style: { fontSize: 11.5, color: C.sub, fontWeight: 600, lineHeight: 1.55 } },
                sel > today ? "Sem missões planejadas para este dia — descanso previsto no seu briefing. Quer estudar mesmo assim? Adiante o próximo dia de missão pelo calendário." : "Sem missões neste dia."
              )
            : null,
          m && isToday
            ? seqToday.map((o, i) => {
                const dn = !!ck[o.t];
                return h("div", { key: "s" + i, style: { display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: i < seqToday.length - 1 ? "1px solid " + C.line : "none", opacity: dn ? 0.55 : 1 } }, [
                  h(
                    "div",
                    {
                      key: "n",
                      onClick: () => this.toggleCheck(o.t),
                      style: { width: 24, height: 24, borderRadius: 99, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 10.5, fontWeight: 900, background: dn ? C.green : C.chip, color: dn ? "#fff" : C.sub }
                    },
                    dn ? I("check", 12, "#fff", 3) : i + 1
                  ),
                  h("div", { key: "t", onClick: o.act, style: { flex: 1, cursor: "pointer" } }, [
                    h("div", { key: "a", style: { fontSize: 12, fontWeight: 800, textDecoration: dn ? "line-through" : "none" } }, o.t),
                    h("div", { key: "b", style: { fontSize: 10, color: C.sub, fontWeight: 600 } }, o.d)
                  ]),
                  o.ia ? h("span", { key: "g", style: { fontSize: 8, fontWeight: 900, color: C.orange, background: C.orangeSoft, padding: "2px 7px", borderRadius: 99 } }, "COPILOTO") : I("chevR", 14, C.faint)
                ]);
              })
            : null,
          m && !isToday
            ? m.acts.map((o: any, i: number) =>
                h(
                  "div",
                  {
                    key: "a" + i,
                    onClick: () =>
                      this.nav(
                        o.go,
                        o.go === "conteudo" ? { contTitle: o.t, contBack: "plano" } : o.go === "questoes" ? { practice: true, qIdx: 0, qPicked: null, qDone: false, qMateria: null } : o.go === "flashcards" ? { fcIdx: 0, fcFlip: false, fcOk: 0 } : {}
                      ),
                    style: { display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: i < m.acts.length - 1 ? "1px solid " + C.line : "none", cursor: "pointer" }
                  },
                  [
                    iconBox(o.ic, o.ia ? C.orangeSoft : C.blueSoft, o.ia ? C.orange : C.dark ? "#8fc3e8" : "#01395E", 36, 16),
                    h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 12, fontWeight: 800 } }, o.t), h("div", { key: "b", style: { fontSize: 10, color: C.sub, fontWeight: 600 } }, o.d)]),
                    o.ia ? h("span", { key: "g", style: { fontSize: 8, fontWeight: 900, color: C.orange, background: C.orangeSoft, padding: "2px 7px", borderRadius: 99 } }, "COPILOTO") : I("chevR", 14, C.faint)
                  ]
                )
              )
            : null,
          m && isFuture && !dd[sel] ? btn("ADIANTAR · CONCLUIR ESTE DIA ✓", () => this.setDayDone(sel, true), { marginTop: 12, padding: "11px", fontSize: 12 }) : null,
          m && isFuture && dd[sel] ? ghost("Desfazer conclusão", () => this.setDayDone(sel, false), { marginTop: 12, padding: "10px", fontSize: 12 }) : null,
          m && isPast && !isDone(sel) ? btn("RECUPERAR · MARCAR COMO FEITO ✓", () => this.setDayDone(sel, true), { marginTop: 12, padding: "11px", fontSize: 12, background: C.green, boxShadow: "0 6px 18px rgba(31,165,101,.35)" }) : null,
          m && isFuture && !dd[sel]
            ? h("div", { key: "nt", style: { marginTop: 10, fontSize: 10, color: C.faint, fontWeight: 600, lineHeight: 1.5 } }, "Você pode adiantar seus estudos: conclua as atividades deste dia hoje mesmo — o progresso é registrado e as próximas missões seguem na sequência.")
            : null
        ])
      ),
      pro
        ? h(
            "div",
            { key: "fac", style: { margin: "14px 18px 4px" } },
            card({}, [
              h("div", { key: "t", style: { fontSize: 13, fontWeight: 800, marginBottom: 10 } }, "O que o algoritmo está considerando"),
              ...[
                ["gauge", "Desempenho por assunto", "78% de precisão"],
                [
                  "flag",
                  "Briefing · data da prova",
                  (function () {
                    const dd2 = B.prova ? Math.max(0, Math.ceil((+new Date(B.prova + "T12:00") - Date.now()) / 864e5)) : 0;
                    return (B.prova ? B.prova.split("-").reverse().join("/") : "—") + " · " + dd2 + " dias restantes";
                  })()
                ],
                ["calendar", "Dias e horas de estudo", (B.dias || 5) + " dias/sem · " + (B.horas || 3) + "h/dia"],
                ["star4", "Sentimento por matéria", (turb.length ? "Turbulência: " + turb.join(", ") : "Nenhuma turbulência marcada") + (dom.length ? " · Domínio: " + dom.join(", ") : "")],
                ["bot", "Check-in do Copiloto", this.checkinDone() ? "Feito hoje ✓ ajustes aplicados" : "Pendente hoje"],
                ["bolt", "Pesos das disciplinas", "Bio 3 · Port/Fís/Quí 2 · Mat/His/Geo 1"],
                [
                  "alert",
                  "Maior ganho agora",
                  (function (self: DecolaApp) {
                    const pr = self.priorities();
                    return pr.length ? pr[0].tema + " · +" + pr[0].gain.toFixed(1) + " pts/h" : "Nenhum erro registrado ainda";
                  })(this)
                ],
                ["clock", "Dias adiantados/recuperados", String(Object.keys(dd).length)]
              ].map((r, i, arr) =>
                h("div", { key: i, style: { display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid " + C.line : "none" } }, [
                  I(r[0], 16, C.orange),
                  h("span", { key: "t", style: { flex: 1, fontSize: 12, fontWeight: 700 } }, r[1]),
                  h("span", { key: "d", style: { fontSize: 10.5, fontWeight: 700, color: C.sub, textAlign: "right", maxWidth: 170 } }, r[2])
                ])
              )
            ])
          )
        : h(
            "div",
            { key: "up", style: { margin: "14px 18px 4px" } },
            card({ border: "1.5px solid " + C.orange, background: C.dark ? "linear-gradient(150deg,#3a2410,#0c3557 60%)" : "linear-gradient(150deg,#fff4ec,#fff)" }, [
              h("div", { key: "h", style: { display: "flex", gap: 10, alignItems: "center" } }, [
                iconBox("bolt", C.orangeSoft, C.orange, 40, 19),
                h("div", { key: "t", style: { flex: 1 } }, [
                  h("div", { key: "a", style: { fontSize: 13.5, fontWeight: 900 } }, "Conheça o Voo Guiado (PRO)"),
                  h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2 } }, "O algoritmo adapta seu cronograma a você. Seu plano atual não muda até você contratar.")
                ])
              ]),
              btn("SAIBA MAIS →", () => this.openBrowser("Voo Guiado (PRO) · Planos", "decolamed.com.br/planos", "plano"), { marginTop: 12, padding: "12px" })
            ])
          )
    ]);
  }

  scrBrowser() {
    const { C, h, I } = this.ui();
    const S = this.state;
    return h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg, color: C.txt } }, [
      h("div", { key: "bar", style: { display: "flex", alignItems: "center", gap: 10, padding: "18px 16px 10px" } }, [
        h("div", { key: "x", onClick: () => this.nav(S.browserBack || "mapa"), style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } }, I("x", 17, C.txt)),
        h("div", { key: "url", style: { flex: 1, display: "flex", alignItems: "center", gap: 8, background: C.card, border: "1px solid " + C.line, borderRadius: 12, padding: "10px 13px", minWidth: 0 } }, [
          I("lock", 13, C.green),
          h("span", { key: "u", style: { fontSize: 12, fontWeight: 700, color: C.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, S.browserUrl || "decolamed.com.br")
        ]),
        h("div", { key: "r", onClick: () => this.forceUpdate(), style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } }, I("refresh", 16, C.txt))
      ]),
      h("div", { key: "page", style: { flex: 1, margin: "4px 16px 0", borderRadius: "18px 18px 0 0", background: C.dark ? "#0e2f4b" : "#fff", border: "1px solid " + C.line, borderBottom: "none", overflow: "hidden", display: "flex", flexDirection: "column" } }, [
        h("div", { key: "c", style: { flex: 1, padding: "26px 22px", display: "flex", flexDirection: "column", gap: 14 } }, [
          h("img", { key: "l", src: "/assets/logo.png", alt: "Decola Med", style: { height: 26, alignSelf: "flex-start" } }),
          h("div", { key: "t", style: { fontSize: 17, fontWeight: 900 } }, S.browserTitle || "Conteúdo externo"),
          h("div", { key: "d", style: { fontSize: 12.5, color: C.sub, fontWeight: 600, lineHeight: 1.6 } }, "Este material é exibido no navegador interno do app — você continua dentro da Decola Med."),
          ...[92, 100, 78, 100, 64, 88].map((w, i) => h("div", { key: "s" + i, style: { height: i === 2 || i === 5 ? 26 : 10, width: w + "%", borderRadius: 8, background: C.chip } }))
        ])
      ]),
      h("div", { key: "foot", style: { padding: "12px 16px 30px", textAlign: "center", fontSize: 10.5, fontWeight: 700, color: C.faint, background: C.navBg, borderTop: "1px solid " + C.line } }, "Navegador interno · WebView Decola Med")
    ]);
  }

  scrAnotacoes() {
    const { C, h, I, card } = this.ui();
    const saved: { code: string; txt: string }[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf("dm-note-") === 0 && k !== "dm-note-livre") {
          const v = localStorage.getItem(k);
          if (v && v.trim()) saved.push({ code: k.replace("dm-note-", ""), txt: v });
        }
      }
    } catch (e) {}
    return this.screenWrap([
      this.head("Anotações", { back: "estudos" }),
      h(
        "div",
        { key: "free", style: { margin: "6px 18px 0" } },
        card({ padding: 14 }, [
          h("div", { key: "l", style: { display: "flex", gap: 7, alignItems: "center", marginBottom: 8 } }, [I("pencil", 13, C.sub), h("span", { key: "t", style: { fontSize: 11, fontWeight: 800, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase" } }, "Caderno livre · salva automaticamente")]),
          h("textarea", {
            key: "ta",
            defaultValue: (function () {
              try {
                return localStorage.getItem("dm-note-livre") || "";
              } catch (e) {
                return "";
              }
            })(),
            onChange: (e: any) => {
              try {
                localStorage.setItem("dm-note-livre", e.target.value);
              } catch (err) {}
            },
            placeholder: "Escreva aqui suas anotações de estudo...",
            style: { width: "100%", height: 150, resize: "vertical", background: C.dark ? "rgba(191,221,242,.05)" : "#fff", border: "1.5px solid " + C.line, borderRadius: 11, padding: "10px 12px", fontSize: 12.5, fontWeight: 600, color: C.txt, outline: "none", fontFamily: "inherit", lineHeight: 1.6 }
          })
        ])
      ),
      h("div", { key: "lbl", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Anotações por questão"),
      saved.length
        ? h(
            "div",
            { key: "list", style: { margin: "0 18px", display: "flex", flexDirection: "column", gap: 9 } },
            saved.map((n, i) =>
              card({ padding: 13 }, [
                h("div", { key: "h", style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 7 } }, [
                  h("span", { key: "c", style: { fontFamily: "monospace", fontSize: 10, fontWeight: 900, color: C.txt, background: C.chip, padding: "3px 9px", borderRadius: 99 } }, n.code),
                  h("div", { key: "sp", style: { flex: 1 } }),
                  h(
                    "div",
                    {
                      key: "x",
                      onClick: () => {
                        try {
                          localStorage.removeItem("dm-note-" + n.code);
                        } catch (e) {}
                        this.forceUpdate();
                      },
                      style: { cursor: "pointer" }
                    },
                    I("x", 14, C.faint)
                  )
                ]),
                h("textarea", {
                  key: "ta",
                  defaultValue: n.txt,
                  onChange: (e: any) => {
                    try {
                      localStorage.setItem("dm-note-" + n.code, e.target.value);
                    } catch (err) {}
                  },
                  style: { width: "100%", height: 56, resize: "vertical", background: C.dark ? "rgba(191,221,242,.05)" : "#fff", border: "1.5px solid " + C.line, borderRadius: 10, padding: "9px 11px", fontSize: 12, fontWeight: 600, color: C.txt, outline: "none", fontFamily: "inherit" }
                })
              ])
            )
          )
        : h(
            "div",
            { key: "empty", style: { margin: "0 18px", padding: "14px 15px", borderRadius: 13, background: C.chip, fontSize: 11.5, color: C.sub, fontWeight: 600, lineHeight: 1.6 } },
            'Você ainda não anotou em nenhuma questão. Ao praticar, use o campo "Minhas anotações" — tudo aparece aqui automaticamente.'
          )
    ]);
  }

  scrConteudo() {
    const { C, h, I, card, bar, iconBox } = this.ui();
    const S = this.state;
    const t = S.contTitle || "Conteúdos";
    const items = [
      { ic: "video", t: "Sistema Digestório — Parte 1", d: "Concluído · 28 min", done: true },
      { ic: "video", t: "Sistema Digestório — Parte 2", d: "Em andamento · 43%", prog: 43 },
      { ic: "video", t: "Sistema Digestório — Parte 3", d: "32 min" },
      { ic: "file", t: "Material de apoio (PDF)", d: "Bagagem Essencial · 12 págs", ext: true },
      { ic: "book", t: "Livro digital recomendado", d: "Abre no navegador interno", ext: true }
    ] as any[];
    return this.screenWrap([
      this.head(t, { back: S.contBack || "estudos" }),
      h(
        "div",
        { key: "list", style: { margin: "6px 18px 0", display: "flex", flexDirection: "column", gap: 10 } },
        items.map((m, i) =>
          card(
            { padding: 14, display: "flex", gap: 12, alignItems: "center" },
            [
              iconBox(m.ic, m.done ? C.greenSoft : m.ext ? C.peach : C.blueSoft, m.done ? C.green : m.ext ? (C.dark ? C.peachTxt : "#9a5218") : C.dark ? "#8fc3e8" : "#01395E", 44, 19),
              h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 13, fontWeight: 800 } }, m.t), h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2 } }, m.d), m.prog ? h("div", { key: "p", style: { display: "flex", marginTop: 7 } }, bar(m.prog, C.green, 5)) : null]),
              m.done ? I("check", 18, C.green, 3) : I("chevR", 17, C.faint)
            ],
            () => this.openBrowser(m.t, m.ext ? "materiais.decolamed.com.br" : "youtube.com/embed/decola-" + (i + 1), S.screen)
          )
        )
      ),
      h("div", { key: "n", style: { margin: "14px 18px 0", padding: "12px 14px", borderRadius: 14, background: C.chip, fontSize: 11.5, color: C.sub, fontWeight: 600, lineHeight: 1.55, display: "flex", gap: 9 } }, [
        I("bot", 16, C.orange),
        "Conteúdos externos e videoaulas do YouTube abrem no navegador interno, sem sair do app."
      ])
    ]);
  }

  scrGabarito() {
    const { C, h, I, card } = this.ui();
    const S = this.state;
    const qs = this.simQs();
    return this.screenWrap(
      [
        h("div", { key: "hd", style: { display: "flex", alignItems: "center", gap: 12, padding: "18px 18px 10px" } }, [
          h(
            "div",
            { key: "b", onClick: () => (S.gabFrom === "hist" ? this.nav("simulados") : this.setState({ simView: "result" })), style: { width: 36, height: 36, borderRadius: 12, background: C.chip, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } },
            I("arrowL", 18, C.txt)
          ),
          h("div", { key: "t", style: { fontSize: 17, fontWeight: 800, flex: 1 } }, "Gabarito comentado")
        ]),
        h(
          "div",
          { key: "list", style: { margin: "0 18px", display: "flex", flexDirection: "column", gap: 10 } },
          qs.map((q, i) => {
            const my = S.simAns[i];
            const ok = my === q.ans;
            return card({ padding: 14 }, [
              h("div", { key: "h", style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 8 } }, [
                h("div", { key: "n", style: { width: 26, height: 26, borderRadius: 9, background: ok ? C.greenSoft : C.redSoft, color: ok ? C.green : C.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 } }, i + 1),
                h("span", { key: "m", style: { fontSize: 10.5, fontWeight: 800, color: C.sub } }, (q.code ? q.code + " · " : "") + q.materia + " · " + q.tema + (q.fonte ? " · " + q.fonte : "")),
                h("span", { key: "s", style: { marginLeft: "auto", fontSize: 10, fontWeight: 900, color: ok ? C.green : C.red } }, ok ? "ACERTOU" : my == null ? "EM BRANCO" : "ERROU")
              ]),
              h("div", { key: "q", style: { fontSize: 12.5, fontWeight: 700, lineHeight: 1.5, marginBottom: 8 } }, q.q),
              h("div", { key: "a", style: { fontSize: 11.5, fontWeight: 700, color: C.green } }, "Correta: " + String.fromCharCode(65 + q.ans) + ") " + q.alts[q.ans]),
              my != null && !ok ? h("div", { key: "my", style: { fontSize: 11.5, fontWeight: 700, color: C.red, marginTop: 2 } }, "Sua resposta: " + String.fromCharCode(65 + my) + ") " + q.alts[my]) : null,
              h(
                "div",
                { key: "c", style: { marginTop: 8, padding: "9px 11px", borderRadius: 10, background: C.chip, fontSize: 11, color: C.sub, fontWeight: 600, lineHeight: 1.5 } },
                'Comentário: a alternativa "' + q.alts[q.ans] + '" é a correta segundo a matriz FACAPE. Este assunto foi registrado no seu Raio-X de desempenho.'
              )
            ]);
          })
        )
      ],
      { noTab: true }
    );
  }

  scrFlashcards() {
    const { C, h, I, card, bar, btn, ghost } = this.ui();
    const S = this.state;
    const cards = [
      { m: "Biologia", a: "Citologia", f: "O que é osmose?", v: "Passagem de água do meio hipotônico para o hipertônico, através da membrana." },
      { m: "Biologia", a: "Sistema Digestório", f: "O que emulsifica gorduras na digestão?", v: "A bile, produzida pelos hepatócitos e armazenada na vesícula biliar." },
      { m: "Física", a: "Cinemática", f: "Fórmula da velocidade média", v: "Vm = ΔS / Δt" },
      { m: "Química", a: "Estequiometria", f: "Número de Avogadro", v: "6,02 × 10²³ entidades por mol." }
    ];
    if (S.fcIdx >= cards.length) {
      return this.screenWrap([
        h("div", { key: "c", style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center" } }, [
          this.mascoteBadge("cards", 92, { anim: "dm-pop .5s ease both", bg: C.greenSoft, color: C.green, shadow: "none" }),
          h("div", { key: "t", style: { fontSize: 21, fontWeight: 900, marginTop: 18 } }, "Sessão concluída!"),
          h("div", { key: "d", style: { fontSize: 13, color: C.sub, fontWeight: 600, marginTop: 8 } }, "Você lembrou " + S.fcOk + " de " + cards.length + " flashcards."),
          h("div", { key: "xp", style: { marginTop: 14, fontSize: 12.5, fontWeight: 800, color: C.orange, background: C.orangeSoft, padding: "6px 14px", borderRadius: 99 } }, "+" + (S.fcOk * 5 + 10) + " XP · revisão registrada")
        ]),
        h("div", { key: "f", style: { padding: "0 24px 20px", display: "flex", gap: 10 } }, [
          ghost("Repetir", () => this.setState({ fcIdx: 0, fcFlip: false, fcOk: 0 }), { flex: 1 }),
          btn("VOLTAR AOS ESTUDOS", () => this.nav("estudos"), { flex: 1 })
        ])
      ]);
    }
    const c2 = cards[S.fcIdx];
    return this.screenWrap([
      this.head("Flashcards", { back: "estudos", right: h("div", { style: { fontSize: 12, fontWeight: 800, color: C.sub } }, S.fcIdx + 1 + " / " + cards.length) }),
      h("div", { key: "p", style: { margin: "0 18px", display: "flex" } }, bar((S.fcIdx / cards.length) * 100)),
      h("div", { key: "meta", style: { margin: "14px 18px 0", display: "flex", gap: 8 } }, [
        h("span", { key: "m", style: { fontSize: 11, fontWeight: 800, color: C.green, background: C.greenSoft, padding: "5px 11px", borderRadius: 99 } }, c2.m),
        h("span", { key: "a", style: { fontSize: 11, fontWeight: 800, color: C.sub, background: C.chip, padding: "5px 11px", borderRadius: 99 } }, c2.a)
      ]),
      h(
        "div",
        {
          key: "card",
          onClick: () => this.setState({ fcFlip: !S.fcFlip }),
          style: {
            margin: "14px 18px 0",
            minHeight: 300,
            borderRadius: 22,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            padding: "30px 24px",
            textAlign: "center",
            background: S.fcFlip ? C.headGrad : C.card,
            border: S.fcFlip ? "none" : "1.5px solid " + C.line,
            color: S.fcFlip ? "#fff" : C.txt,
            boxShadow: "0 14px 34px rgba(1,30,50,.18)",
            transition: "all .25s"
          }
        },
        [
          h("div", { key: "l", style: { fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: S.fcFlip ? "rgba(255,255,255,.6)" : C.faint } }, S.fcFlip ? "Resposta" : "Pergunta"),
          h("div", { key: "t", style: { fontSize: S.fcFlip ? 15 : 18, fontWeight: 800, lineHeight: 1.5 } }, S.fcFlip ? c2.v : c2.f),
          h("div", { key: "h", style: { fontSize: 10.5, fontWeight: 700, color: S.fcFlip ? "rgba(255,255,255,.55)" : C.faint } }, "Toque para virar")
        ]
      ),
      S.fcFlip
        ? h("div", { key: "cta", style: { margin: "16px 18px 0", display: "flex", gap: 10 } }, [
            ghost("Errei", () => this.setState({ fcIdx: S.fcIdx + 1, fcFlip: false }), { flex: 1, color: C.red, borderColor: C.red }),
            btn("ACERTEI ✓", () => this.setState({ fcIdx: S.fcIdx + 1, fcFlip: false, fcOk: S.fcOk + 1 }), { flex: 1, background: C.green, boxShadow: "0 6px 18px rgba(31,165,101,.35)" })
          ])
        : null
    ]);
  }

  errInline(label?: string) {
    const { C, h, I } = this.ui();
    return h(
      "div",
      { key: "erri", onClick: () => this.setState({ errOpen: true, errSent: false, errText: "" }), style: { display: "flex", gap: 6, alignItems: "center", justifyContent: "center", padding: "9px 0", cursor: "pointer", color: C.faint, fontSize: 11, fontWeight: 800 } },
      [I("alert", 13, C.faint), label || "Comunicar erro nesta questão"]
    );
  }
  errSheet() {
    const { C, h, I, btn, chip } = this.ui();
    const S = this.state;
    const d = this.data();
    const q = S.practice || S.simView === "run" ? (S.simView === "run" ? this.simQs()[S.simIdx] : this.qList()[S.qIdx]) : null;
    const auto = [
      ["Aluno", (this.props.nome || "Aluno Decola") + " · " + (this.props.email || "—")],
      ["Data e hora", new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })],
      ["Página", S.screen],
      q ? ["Questão", q.code + " · " + q.tema] : null,
      ["Dispositivo", "Navegador · Decola Med Web"]
    ].filter(Boolean) as string[][];
    return h(
      "div",
      { onClick: () => this.setState({ errOpen: false }), style: { position: "absolute", inset: 0, background: "rgba(2,15,26,.55)", backdropFilter: "blur(3px)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 60 } },
      h(
        "div",
        { onClick: (e: any) => e.stopPropagation(), style: { background: C.card, borderRadius: "26px 26px 0 0", padding: "18px 18px 34px", maxHeight: "86%", overflowY: "auto", animation: "dm-in .3s ease both" } },
        S.errSent
          ? [
              h("div", { key: "ok", style: { textAlign: "center", padding: "14px 6px" } }, [
                this.mascoteBadge("check", 96, { anim: "dm-pop .4s ease both", bg: C.greenSoft, color: C.green, shadow: "none" }),
                h("div", { key: "t", style: { fontSize: 17, fontWeight: 900, color: C.txt, marginTop: 12 } }, "Relato enviado!"),
                h(
                  "div",
                  { key: "d", style: { fontSize: 12, color: C.sub, fontWeight: 600, marginTop: 6, lineHeight: 1.6 } },
                  "Seu comunicado foi enviado ao e-mail configurado pela equipe e salvo no painel administrativo. Obrigado por ajudar a melhorar a Decola Med, piloto!"
                ),
                btn("FECHAR", () => this.setState({ errOpen: false }), { marginTop: 16 })
              ])
            ]
          : [
              h("div", { key: "h", style: { display: "flex", alignItems: "center", gap: 11, marginBottom: 12 } }, [
                this.mascoteBadge("alert", 46, { bg: C.orangeSoft, color: C.orange, shadow: "none" }),
                h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 16, fontWeight: 900, color: C.txt } }, "Comunicar erro"), h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600 } }, "Encontrou algo errado? Conta pra gente.")]),
                h("div", { key: "x", onClick: () => this.setState({ errOpen: false }), style: { cursor: "pointer" } }, I("x", 18, C.sub))
              ]),
              h(
                "div",
                { key: "cat", style: { display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 } },
                ["Questão", "Vídeo/Aula", "Material", "Pagamento", "Outro"].map((c2) => chip(c2, S.errCat === c2, () => this.setState({ errCat: c2 })))
              ),
              h("textarea", {
                key: "ta",
                value: S.errText,
                onChange: (e: any) => this.setState({ errText: e.target.value }),
                placeholder: "Descreva o problema...",
                style: { width: "100%", boxSizing: "border-box", height: 84, resize: "vertical", background: C.dark ? "rgba(191,221,242,.06)" : "#fff", border: "1.5px solid " + C.line, borderRadius: 12, padding: "11px 13px", fontSize: 12.5, fontWeight: 600, color: C.txt, outline: "none", fontFamily: "inherit" }
              }),
              h("div", { key: "auto", style: { marginTop: 10, borderRadius: 12, background: C.chip, padding: "10px 13px" } }, [
                h("div", { key: "l", style: { fontSize: 9.5, fontWeight: 800, color: C.faint, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 } }, "Enviado automaticamente com o relato"),
                ...auto.map((r, i) => h("div", { key: i, style: { display: "flex", gap: 8, fontSize: 10.5, fontWeight: 600, color: C.sub, padding: "2px 0" } }, [h("span", { key: "a", style: { fontWeight: 800, color: C.txt } }, r[0] + ":"), r[1]]))
              ]),
              btn(
                "ENVIAR RELATO",
                () => {
                  if (!S.errText.trim()) return;
                  const texto = S.errText;
                  const cat = S.errCat;
                  this.setState({ errSent: true });
                  // Envia de verdade em segundo plano — a tela já mostra
                  // "enviado" otimisticamente (a UX do protótipo original),
                  // e loga no console se falhar (não trava a experiência).
                  enviarRelatoErro(texto, cat).then((res) => {
                    if (!res.ok) console.error("Falha ao enviar relato de erro");
                  });
                },
                { marginTop: 14, opacity: S.errText.trim() ? 1 : 0.45 }
              )
            ]
      )
    );
  }

  scrRedacao() {
    const { C, h, card, btn, iconBox } = this.ui();
    const steps = [
      ["pencil", "1. Escolha um tema", "Acesse a Base de Temas (botão abaixo) ou os Modelos de Redação em Estudos."],
      ["note", "2. Escreva sua redação", "Pode ser digitada ou escrita à mão (foto legível)."],
      ["send", "3. Envie pelo WhatsApp", "Mande direto para a professora de redação pelo botão abaixo."],
      ["check", "4. Correção pelo WhatsApp", "A professora corrige e devolve com comentários pelo próprio WhatsApp."],
      ["star4", "5. Crédito consumido após a correção", "Só desconta quando a professora confirmar a correção realizada."]
    ];
    return this.screenWrap([
      this.head("Redação", { back: "perfil" }),
      h(
        "div",
        { key: "cred", style: { margin: "6px 18px 0" } },
        card({ background: C.headGrad, border: "none", color: "#fff", display: "flex", gap: 14, alignItems: "center" }, [
          iconBox("note", "rgba(255,255,255,.16)", "#fff", 64, 28),
          h("div", { key: "t", style: { flex: 1 } }, [
            h("div", { key: "a", style: { fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.6)", letterSpacing: ".06em", textTransform: "uppercase" } }, "Seus créditos de redação"),
            h("div", { key: "b", style: { fontSize: 24, fontWeight: 900 } }, "2 disponíveis"),
            h("div", { key: "c", style: { fontSize: 11, color: "rgba(255,255,255,.7)", fontWeight: 600 } }, "1 já consumido · plano Voo Guiado")
          ])
        ])
      ),
      h("div", { key: "lbl", style: { margin: "18px 20px 8px", fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: ".07em", textTransform: "uppercase" } }, "Como funciona"),
      h(
        "div",
        { key: "steps", style: { margin: "0 18px", display: "flex", flexDirection: "column", gap: 9 } },
        steps.map((s, i) =>
          card({ padding: 13, display: "flex", gap: 12, alignItems: "center" }, [
            iconBox(s[0], C.orangeSoft, C.orange, 40, 17),
            h("div", { key: "t", style: { flex: 1 } }, [h("div", { key: "a", style: { fontSize: 12.5, fontWeight: 800 } }, s[1]), h("div", { key: "b", style: { fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 2, lineHeight: 1.5 } }, s[2])])
          ])
        )
      ),
      h(
        "div",
        { key: "note", style: { margin: "12px 18px 0", padding: "11px 13px", borderRadius: 13, background: C.chip, fontSize: 11, color: C.sub, fontWeight: 600, lineHeight: 1.6 } },
        "A redação NÃO é enviada pela plataforma — todo o envio e acompanhamento acontecem pelo WhatsApp da professora. Aqui você acompanha apenas os seus créditos."
      ),
      h(
        "div",
        { key: "cta", style: { margin: "14px 18px 0" } },
        btn("ENVIAR REDAÇÃO PELO WHATSAPP →", () => window.open(this.props.whatsappRedacao, "_blank", "noopener,noreferrer"), { background: "#1fa565", boxShadow: "0 6px 18px rgba(31,165,101,.35)" })
      ),
      h(
        "div",
        { key: "cta2", style: { margin: "10px 18px 0" } },
        this.ui().ghost("BASE DE TEMAS →", () => this.openBrowser("Base de Temas · Redação", "decolamed.com.br/base-de-temas", "redacao"))
      )
    ]);
  }

  scrTutorial() {
    const { C, h, I, btn } = this.ui();
    const S = this.state;
    const slides = [
      { ic: "plane", t: "Instale o aplicativo", d: 'A Decola Med funciona como aplicativo no seu celular. Toque em "Instalar" e leve a plataforma na palma da mão — rápido e sem ocupar espaço.', cta: "INSTALAR APLICATIVO" },
      { ic: "target", t: "Missão do Dia", d: "Cada dia tem uma única sequência de estudos na aba Hoje: siga os passos na ordem e conclua a missão. O Mapa de Voo completo fica na versão para computador." },
      { ic: "calendar", t: "Cronograma e Missões", d: "Todos seguem o Cronograma Base com aulas, atividades, resumos, revisões, simulados e redações. No plano Voo Guiado, o algoritmo adapta tudo a você." },
      { ic: "compass", t: "Questões inteligentes", d: "Errou? O Copiloto identifica o assunto na matriz, registra no seu Raio-X e monta uma revisão com 5 novas questões + materiais recomendados." },
      { ic: "file", t: "Simulados de Voo", d: "Provas com timer e nota calculada pelos pesos oficiais das disciplinas. Sem redação? Mostramos a nota considerando apenas a prova objetiva." },
      { ic: "bot", t: "Conte com o Copiloto", d: 'Seu assistente IA recomenda aulas, flashcards, mapas mentais e PDFs conforme seu desempenho. Qualquer erro, use o botão "Comunicar erro". Bom voo!' }
    ];
    const sl = slides[S.tutStep];
    const last = S.tutStep === slides.length - 1;
    return h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: C.bg, color: C.txt } }, [
      h("div", { key: "top", style: { display: "flex", alignItems: "center", padding: "20px 20px 0" } }, [
        h("img", { key: "l", src: "/assets/logo.png", style: { height: 24 } }),
        h("div", { key: "sp", style: { flex: 1 } }),
        h("div", { key: "skip", onClick: () => this.nav("mapa"), style: { fontSize: 12, fontWeight: 800, color: C.faint, cursor: "pointer" } }, "Pular")
      ]),
      h(
        "div",
        { key: "p", style: { display: "flex", gap: 5, padding: "14px 22px 0" } },
        slides.map((_, i) => h("div", { key: i, style: { flex: 1, height: 4, borderRadius: 99, background: i <= S.tutStep ? C.orange : C.chip } }))
      ),
      h("div", { key: "c", style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 30px", textAlign: "center" } }, [
        this.mascoteBadge(sl.ic, 150, { anim: "dm-pop .45s ease both" }),
        h("div", { key: "t", style: { fontSize: 22, fontWeight: 900, marginTop: 18 } }, sl.t),
        h("div", { key: "d", style: { fontSize: 13, color: C.sub, fontWeight: 600, marginTop: 10, lineHeight: 1.65 } }, sl.d),
        sl.cta
          ? h(
              "div",
              {
                key: "cta",
                onClick: () => this.openBrowser("Instalar aplicativo", "decolamed.com.br/instalar", "tutorial"),
                style: { marginTop: 14, display: "inline-flex", gap: 8, alignItems: "center", border: "1.5px solid " + C.orange, color: C.orange, borderRadius: 12, padding: "11px 18px", fontSize: 12.5, fontWeight: 800, cursor: "pointer" }
              },
              [I("plane", 15, C.orange), sl.cta]
            )
          : null
      ]),
      h("div", { key: "f", style: { padding: "0 24px 46px", display: "flex", gap: 10 } }, [
        S.tutStep > 0 ? this.ui().ghost("Voltar", () => this.setState({ tutStep: S.tutStep - 1 }), { flex: 1 }) : null,
        btn(last ? "COMEÇAR A VOAR →" : "PRÓXIMO →", () => (last ? this.nav("mapa") : this.setState({ tutStep: S.tutStep + 1 })), { flex: 2 })
      ])
    ]);
  }

  scrSenha() {
    const { C, h, btn } = this.ui();
    const S = this.state;
    const inp = (value: string, onChange: any, ph: string, key: string) =>
      h("input", { key, type: "password", value, onChange, placeholder: ph, style: { width: "100%", boxSizing: "border-box", background: C.card, border: "1.5px solid " + C.line, borderRadius: 14, padding: "14px 15px", fontSize: 13, fontWeight: 600, color: C.txt, outline: "none", fontFamily: "inherit", marginBottom: 10 } });
    const salvar = async () => {
      if (!S.senhaNova || S.senhaNova.length < 6) {
        this.setState({ senhaErro: "A nova senha precisa ter pelo menos 6 caracteres." });
        return;
      }
      if (S.senhaNova !== S.senhaConfirma) {
        this.setState({ senhaErro: "As senhas não coincidem." });
        return;
      }
      this.setState({ senhaSalvando: true, senhaErro: null });
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: S.senhaNova });
      if (error) {
        this.setState({ senhaSalvando: false, senhaErro: error.message });
        return;
      }
      this.setState({ senhaSalvando: false, senhaSalva: true, senhaNova: "", senhaConfirma: "" });
    };
    return this.screenWrap([
      this.head("Alterar senha", { back: "config" }),
      h("div", { key: "f", style: { margin: "8px 18px 0" } }, [
        inp(S.senhaNova || "", (e: any) => this.setState({ senhaNova: e.target.value, senhaErro: null, senhaSalva: false }), "Nova senha", "a"),
        inp(S.senhaConfirma || "", (e: any) => this.setState({ senhaConfirma: e.target.value, senhaErro: null, senhaSalva: false }), "Confirmar nova senha", "b"),
        S.senhaErro ? h("div", { key: "err", style: { color: C.red, fontSize: 12, fontWeight: 700, marginBottom: 8 } }, S.senhaErro) : null,
        S.senhaSalva ? h("div", { key: "ok", style: { color: C.green, fontSize: 12, fontWeight: 700, marginBottom: 8 } }, "Senha atualizada com sucesso!") : null,
        btn(S.senhaSalvando ? "Salvando..." : "SALVAR NOVA SENHA", salvar, { marginTop: 6, opacity: S.senhaSalvando ? 0.6 : 1 })
      ])
    ]);
  }

  app() {
    const S = this.state;
    if (S.simView === "run") return this.scrSimRun();
    if (S.simView === "result") return this.scrSimResult();
    if (S.simView === "gabarito") return this.scrGabarito();
    const map: Record<string, () => any> = {
      mapa: () => this.scrMapa(),
      painel: () => this.scrPainel(),
      missoes: () => this.scrMissoes(),
      estudos: () => this.scrEstudos(),
      hangar: () => this.scrHangar(),
      questoes: () => this.scrQuestoes(),
      simulados: () => this.scrSimulados(),
      copiloto: () => this.scrCopiloto(),
      ranking: () => this.scrRanking(),
      conquistas: () => this.scrConquistas(),
      perfil: () => this.scrPerfil(),
      config: () => this.scrConfig(),
      briefing: () => this.scrBriefing(),
      plano: () => this.scrPlano(),
      browser: () => this.scrBrowser(),
      conteudo: () => this.scrConteudo(),
      senha: () => this.scrSenha(),
      flashcards: () => this.scrFlashcards(),
      redacao: () => this.scrRedacao(),
      tutorial: () => this.scrTutorial(),
      anotacoes: () => this.scrAnotacoes()
    };
    const fn = map[S.screen] || map.mapa;
    return fn();
  }

  render() {
    return React.createElement("div", { className: styles.shell }, this.app());
  }
}
