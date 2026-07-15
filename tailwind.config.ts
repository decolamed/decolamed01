import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B2A4A",
          dark: "#071B30",
          light: "#123A63"
        },
        sky: {
          DEFAULT: "#EAF4FF"
        },
        orange: {
          DEFAULT: "#F2871F",
          dark: "#D9720F"
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
