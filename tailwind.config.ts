import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Paleta nova (Fase 1 — visual "aviação"), extraída do protótipo.
        // Mantém os mesmos NOMES de cor (navy/orange/sky) usados em toda a
        // base de código atual — só os valores exatos mudaram — assim
        // nenhuma classe (bg-navy-dark, text-orange, etc.) precisa ser
        // reescrita em nenhuma página.
        navy: {
          DEFAULT: "#01395E",
          dark: "#07223a",
          light: "#0e3a5c"
        },
        sky: {
          DEFAULT: "#F2F7FB",
          light: "#BFDDF2"
        },
        orange: {
          DEFAULT: "#F36C21",
          dark: "#d95a12"
        },
        // Cores do design Admin
        green: "#0d8a4d",
        red: "#c53f36",
        "blue-soft": "#EAF3FB",
        "green-soft": "#d8f4e6",
        "red-soft": "#fbe4e2",
        // ------------------------------------------------------------------
        // Paleta do app do aluno — os MESMOS valores de decola-app.tsx
        // (colors(), tema escuro, que é o padrão de quem abre a plataforma).
        //
        // O Banco de Questões é o padrão visual aprovado: fundo azul escuro,
        // enunciado numa caixa azul mais clara, cada alternativa na sua
        // própria caixa. As rotas dedicadas (atividade, sessão do cronograma,
        // simulado) são páginas Next separadas do app imersivo e não têm
        // acesso ao objeto de cores dele — por isso os valores vivem aqui,
        // como tokens, em vez de serem copiados classe a classe.
        //
        // Atenção: `green` e `red` acima são as cores PLANAS do admin. Não
        // existe `green-500` nem `red-50` neste tema — para os estados de
        // acerto/erro das telas do aluno, use `app-green`/`app-red`.
        // ------------------------------------------------------------------
        app: {
          bg: "#07223a",
          card: "#0c3557",
          card2: "#123f66",
          line: "rgba(191,221,242,0.14)",
          txt: "#F4F9FD",
          sub: "rgba(191,221,242,0.66)",
          faint: "rgba(191,221,242,0.38)",
          chip: "rgba(191,221,242,0.09)",
          green: "#3dd68c",
          "green-soft": "rgba(61,214,140,0.15)",
          "green-deep": "#7fe8b5",
          red: "#ff6b5e",
          "red-soft": "rgba(255,107,94,0.15)",
          "orange-soft": "rgba(243,108,33,0.16)",
          "orange-txt": "#ffc9a3"
        }
      },
      fontFamily: {
        display: ["var(--font-baloo)", "sans-serif"],
        body: ["var(--font-nunito)", "sans-serif"]
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
