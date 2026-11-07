import type { Config } from "tailwindcss";

// Mọi màu đều đọc từ CSS variables (app/globals.css) -> đổi theme chỉ cần sửa :root.
const c = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          950: c("emerald-950"),
          900: c("emerald-900"),
          700: c("emerald-700"),
          400: c("emerald-400"),
          deep: c("emerald-900"),
          DEFAULT: c("emerald-700"),
          soft: c("emerald-400"),
          light: c("emerald-light"),
        },
        gold: {
          700: c("gold-700"),
          600: c("gold-600"),
          500: c("gold-500"),
          200: c("gold-200"),
          DEFAULT: c("gold-500"),
          light: c("gold-200"),
          dark: c("gold-700"),
          shimmer: c("gold-shimmer"),
        },
        ivory: {
          50: c("ivory-50"),
          100: c("ivory-100"),
          200: c("ivory-200"),
          DEFAULT: c("ivory-100"),
          light: c("ivory-50"),
          card: c("ivory-card"),
        },
        charcoal: c("charcoal"),
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "Pinyon Script", "cursive"],
        khmer: ["var(--font-khmer)", "Kantumruy Pro", "sans-serif"],
      },
      transitionTimingFunction: {
        lux: "cubic-bezier(.22,.61,.36,1)",
      },
      backgroundImage: {
        // Không còn gradient chói: chỉ là mặt phẳng đồng thau rất nhẹ
        "gold-gradient": "linear-gradient(180deg, rgb(var(--c-gold-500)) 0%, rgb(var(--c-gold-600)) 100%)",
        "gold-subtle": "linear-gradient(135deg, rgb(var(--c-gold-500) / 0.10) 0%, rgb(var(--c-gold-500) / 0.02) 100%)",
        "emerald-gradient": "linear-gradient(180deg, rgb(var(--c-emerald-950)) 0%, rgb(var(--c-emerald-900)) 100%)",
        radial: "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
      },
      boxShadow: {
        "soft-xs": "0 1px 2px rgb(var(--c-emerald-950) / 0.06)",
        "soft-sm": "0 2px 8px rgb(var(--c-emerald-950) / 0.06)",
        "soft-md": "0 6px 18px -6px rgb(var(--c-emerald-950) / 0.10)",
        "soft-lg": "0 12px 32px -12px rgb(var(--c-emerald-950) / 0.12)",
        "soft-xl": "0 20px 48px -16px rgb(var(--c-emerald-950) / 0.18)",
        invitation: "0 12px 40px -12px rgb(var(--c-emerald-950) / 0.10), 0 0 0 1px rgb(var(--c-gold-500) / 0.25)",
        "card-soft": "0 10px 30px -10px rgb(var(--c-emerald-950) / 0.08)",
        "card-glow": "0 8px 30px rgb(var(--c-emerald-900) / 0.06)",
        "gold-glow": "0 4px 16px -4px rgb(var(--c-gold-500) / 0.35)",
        "gold-subtle": "0 4px 14px rgb(var(--c-gold-700) / 0.12)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        shimmer: "shimmer 3s infinite linear",
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
