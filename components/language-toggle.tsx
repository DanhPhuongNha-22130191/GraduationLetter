"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/language-context";
import { Language } from "@/config/i18n";
import { Globe } from "lucide-react";

export const LanguageToggle: React.FC = () => {
  const { lang, setLang } = useLanguage();

  const options: Array<{ code: Language; label: string }> = [
    { code: "vi", label: "VI" },
    { code: "en", label: "EN" },
    { code: "km", label: "KM" },
  ];

  return (
    <div className="fixed top-4 left-4 z-40">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-9 px-2 rounded-full bg-emerald-deep/90 border border-gold/35 backdrop-blur-md flex items-center gap-0.5 shadow-md"
      >
        <Globe className="w-3.5 h-3.5 text-gold shrink-0 mx-1 opacity-90 stroke-[2]" />

        {options.map((opt) => {
          const isActive = lang === opt.code;
          return (
            <button
              key={opt.code}
              onClick={() => setLang(opt.code)}
              aria-label={`Switch to ${opt.label}`}
              className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold tracking-wider transition-all duration-200 active:scale-95 touch-manipulation ${
                isActive
                  ? "bg-gold text-emerald-deep shadow-sm"
                  : "text-ivory/70 hover:text-ivory"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};
