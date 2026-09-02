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
          deep: "#123C32",
          DEFAULT: "#1F5A46",
          soft: "#6F8F7A",
          light: "#E3ECE6",
        },
        gold: {
          DEFAULT: "#C9A96E",
          light: "#E8D5B5",
          dark: "#9E7B3B",
          shimmer: "#F4E7CE",
        },
        ivory: {
          DEFAULT: "#F8F5EC",
          light: "#FCFAF4",
          card: "#FAF8F2",
        },
        charcoal: "#202522",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Cormorant Garamond", "serif"],
        sans: ["var(--font-sans)", "Be Vietnam Pro", "Inter", "sans-serif"],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A96E 0%, #F4E7CE 50%, #9E7B3B 100%)',
        'gold-subtle': 'linear-gradient(135deg, rgba(201,169,110,0.15) 0%, rgba(244,231,206,0.05) 100%)',
        'emerald-gradient': 'linear-gradient(180deg, #123C32 0%, #1F5A46 100%)',
      },
      boxShadow: {
        'invitation': '0 10px 40px -10px rgba(18, 60, 50, 0.12), 0 0 1px 1px rgba(201, 169, 110, 0.25)',
        'card-glow': '0 8px 30px rgba(18, 60, 50, 0.08)',
        'gold-glow': '0 0 20px rgba(201, 169, 110, 0.3)',
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
