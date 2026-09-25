import type { Config } from "tailwindcss";

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
          950: "#0B2A22",
          900: "#123C32",
          700: "#1F5A46",
          400: "#6F8F7A",
          deep: "#123C32",
          DEFAULT: "#1F5A46",
          soft: "#6F8F7A",
          light: "#E3ECE6",
        },
        gold: {
          700: "#8A682F",
          600: "#A88345",
          500: "#C9A96E",
          200: "#E8D5B5",
          DEFAULT: "#C9A96E",
          light: "#E8D5B5",
          dark: "#8A682F",
          shimmer: "#F4E7CE",
        },
        ivory: {
          50: "#FCFAF4",
          100: "#F8F5EC",
          200: "#EFE9DA",
          DEFAULT: "#F8F5EC",
          light: "#FCFAF4",
          card: "#FAF8F2",
        },
        charcoal: "#202522",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Cormorant Garamond", "serif"],
        sans: ["var(--font-sans)", "Be Vietnam Pro", "Inter", "sans-serif"],
        khmer: ["var(--font-khmer)", "Kantumruy Pro", "sans-serif"],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A96E 0%, #F4E7CE 50%, #8A682F 100%)',
        'gold-subtle': 'linear-gradient(135deg, rgba(201,169,110,0.12) 0%, rgba(244,231,206,0.04) 100%)',
        'emerald-gradient': 'linear-gradient(180deg, #0B2A22 0%, #123C32 50%, #1F5A46 100%)',
      },
      boxShadow: {
        'invitation': '0 12px 40px -12px rgba(11, 42, 34, 0.1), 0 0 0 1px rgba(201, 169, 110, 0.25)',
        'card-soft': '0 10px 30px -10px rgba(11, 42, 34, 0.08)',
        'card-glow': '0 8px 30px rgba(18, 60, 50, 0.06)',
        'gold-glow': '0 0 20px rgba(201, 169, 110, 0.18)',
        'gold-subtle': '0 4px 14px rgba(138, 104, 47, 0.12)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        shimmer: 'shimmer 3s infinite linear',
        float: 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
