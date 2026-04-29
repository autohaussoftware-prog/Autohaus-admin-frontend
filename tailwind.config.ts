import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        autohaus: {
          black: "#050505",
          surface: "#0A0A0A",
          panel: "#101010",
          border: "#242424",
          gold: "#D6A93D",
          goldSoft: "#C89B32",
          muted: "#8A8A8A",
        },
      },
      boxShadow: {
        premium: "0 24px 80px rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        premium: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
