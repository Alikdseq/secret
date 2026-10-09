import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F6F1EA",
        paper: "#FBF8F3",
        ink: "#171717",
        cta: "#1B2621",
        blush: "#E4C6C2",
        sage: "#9AA58F",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      boxShadow: {
        soft: "0 24px 60px rgba(40, 32, 24, 0.08)",
      },
      maxWidth: {
        stage: "1480px",
      },
    },
  },
  plugins: [],
};

export default config;
