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
        "green-soft": "#d8f4e6"
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
