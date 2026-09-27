import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
      },
      boxShadow: {
        neon: "0 0 28px rgb(var(--primary) / .22)",
        panel: "0 20px 60px rgba(0,0,0,.22)",
      },
      animation: { float: "float 6s ease-in-out infinite" },
      keyframes: { float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } } },
    },
  },
  plugins: [],
} satisfies Config;
