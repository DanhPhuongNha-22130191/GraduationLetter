"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, TranslationSchema } from "@/config/i18n";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "vi",
  setLang: () => {},
  t: translations.vi,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>("vi");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("graduation_lang") as Language;
      if (savedLang && (savedLang === "vi" || savedLang === "en" || savedLang === "km")) {
        setLangState(savedLang);
      }
    } catch (e) {
      console.warn("Could not load saved language:", e);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("graduation_lang", newLang);
    } catch (e) {
      console.warn("Could not save language:", e);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
