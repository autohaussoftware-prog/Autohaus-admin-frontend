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
        // Legacy alias — kept for backward compatibility
        autohaus: {
          black:    "#070707",
          surface:  "#0a0a0a",
          panel:    "#0f0f0f",
          border:   "#1f1f1f",
          gold:     "#D4A843",
          goldSoft: "#C89830",
          muted:    "#888888",
        },
        // New systematic tokens
        surface: {
          bg:  "#070707",
          0:   "#0a0a0a",
          1:   "#0f0f0f",
          2:   "#141414",
          3:   "#1c1c1c",
        },
        gold: {
          DEFAULT: "#D4A843",
          dim:     "#A07D2C",
          bright:  "#E8BC55",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "card":      "0 4px 20px rgba(0,0,0,0.40), 0 1px 3px rgba(0,0,0,0.25)",
        "elevated":  "0 8px 40px rgba(0,0,0,0.50), 0 2px 8px rgba(0,0,0,0.30)",
        "modal":     "0 24px 80px rgba(0,0,0,0.60), 0 4px 20px rgba(0,0,0,0.35)",
        "gold":      "0 0 28px rgba(212,168,67,0.22), 0 0 10px rgba(212,168,67,0.14)",
        "gold-sm":   "0 0 14px rgba(212,168,67,0.18)",
        "inner-hi":  "inset 0 1px 0 rgba(255,255,255,0.07)",
        "premium":   "0 24px 80px rgba(0,0,0,0.40)",
      },
      backgroundImage: {
        "gold-grad":   "linear-gradient(135deg, #C89830 0%, #E8BC55 50%, #C08820 100%)",
        "shimmer":     "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
        "radial-gold": "radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.10) 0%, transparent 60%)",
      },
      borderRadius: {
        "premium": "1.25rem",
        "4xl":     "2rem",
      },
      transitionTimingFunction: {
        "premium": "cubic-bezier(0.16, 1, 0.3, 1)",
        "snap":    "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      animation: {
        "fade-in":    "fadeIn 0.18s ease forwards",
        "slide-up":   "slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in":   "scaleIn 0.20s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer":    "shimmer 2s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "scan":       "scan 1.5s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 14px rgba(212,168,67,0.18)" },
          "50%":      { boxShadow: "0 0 32px rgba(212,168,67,0.32)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
