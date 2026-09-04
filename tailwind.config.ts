import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FBF7EE",
        card: "#FFFFFF",
        gold: {
          DEFAULT: "#C89B4A",
          dark: "#A97F32",
          light: "#F1E3C4",
        },
        ink: {
          DEFAULT: "#2E2418",
          soft: "#8A7F70",
        },
        line: "#EDE3CD",
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
        soft: "0 20px 44px -24px rgba(120,90,40,0.30)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C89B4A 0%, #A97F32 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
