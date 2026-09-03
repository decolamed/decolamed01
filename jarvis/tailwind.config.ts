import type { Config } from "tailwindcss";

// Identidade do Jarvis: base "tinta" escura e fria (ambiente de estudo noturno),
// um ciano de sinalização que marca tudo que é ação do assistente, e um âmbar
// reservado EXCLUSIVAMENTE para destaque de conteúdo dentro do resumo — assim o
// olho aprende que âmbar = "isso importa na tutoria", e não vira enfeite.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tinta: {
          950: "#0a0f14",
          900: "#0f151c",
          850: "#141c25",
          800: "#1a232e",
          700: "#25313f",
          500: "#5a6b7d",
          400: "#8798a8",
          300: "#b4c1cd",
          200: "#dbe3ea",
          100: "#eef3f7"
        },
        ciano: {
          600: "#0b7f8c",
          500: "#0fa3b1",
          400: "#2dc3d0",
          300: "#7fdde6",
          100: "#e0f7fa"
        },
        ambar: {
          600: "#b45309",
          500: "#e08700",
          400: "#f5a623",
          100: "#fff3d6"
        },
        alerta: {
          600: "#b42318",
          500: "#dc4437",
          100: "#fdecea"
        }
      },
      fontFamily: {
        // Sem download de fonte: o app não pode depender de rede no build.
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        leitura: ["Charter", "Bitstream Charter", "Georgia", "Cambria", "Times New Roman", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"]
      },
      maxWidth: { leitura: "68ch" },
      boxShadow: { carta: "0 1px 2px rgba(10,15,20,.06), 0 8px 24px -12px rgba(10,15,20,.25)" }
    }
  },
  plugins: []
};

export default config;
