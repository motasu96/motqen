import type { Config } from "tailwindcss";

function withAlpha(cssVar: string) {
  return `rgb(var(${cssVar}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: withAlpha("--color-bg"),
        card: withAlpha("--color-card"),
        gold: {
          DEFAULT: withAlpha("--color-gold"),
          dark: withAlpha("--color-gold-dark"),
          light: withAlpha("--color-gold-light"),
        },
        ink: {
          DEFAULT: withAlpha("--color-ink"),
          soft: withAlpha("--color-ink-soft"),
        },
        line: withAlpha("--color-line"),
      },
      fontFamily: {
        sans: ["var(--font-tajawal)", "Tajawal", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        "card-lg": "24px",
        pill: "999px",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, rgb(var(--color-gold)) 0%, rgb(var(--color-gold-dark)) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
