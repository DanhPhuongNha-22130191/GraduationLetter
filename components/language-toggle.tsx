"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/language-context";
import { Language } from "@/config/i18n";
import { Globe, Check } from "lucide-react";

export const LanguageToggle: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options: Array<{ code: Language; label: string; title: string }> = [
    { code: "vi", label: "VI", title: "Tiếng Việt" },
    { code: "en", label: "EN", title: "English" },
    { code: "km", label: "KM", title: "ភាសាខ្មែរ" },
  ];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: Language) => {
    setLang(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="fixed top-4 left-4 z-40">
      {/* Globe Icon Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Chọn ngôn ngữ / Select language"
        aria-expanded={isOpen}
        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all active:scale-95 touch-manipulation cursor-pointer backdrop-blur-md ${
          isOpen
            ? "bg-gold-gradient text-emerald-950 border-gold-200/50 shadow-gold-glow"
            : "bg-emerald-950/90 text-gold-200 border-gold-500/30 hover:border-gold-500 shadow-soft-sm"
        }`}
      >
        <Globe className="w-4.5 h-4.5 stroke-[2]" />
      </motion.button>

      {/* Language Selection Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.92 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-12 left-0 min-w-[130px] p-1.5 rounded-2xl bg-emerald-950/95 border border-gold-500/30 shadow-soft-xl backdrop-blur-lg flex flex-col gap-1 z-50"
          >
            {options.map((opt) => {
              const isActive = lang === opt.code;
              return (
                <button
                  key={opt.code}
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-sans font-semibold flex items-center justify-between transition-all duration-150 active:scale-95 touch-manipulation cursor-pointer ${
                    isActive
                      ? "bg-gold-gradient text-emerald-950 font-bold shadow-soft-xs"
                      : "text-ivory-100/85 hover:bg-gold-500/15 hover:text-gold-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[11px] uppercase tracking-wider">{opt.label}</span>
                    <span className="text-[11px] opacity-80">{opt.title}</span>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

