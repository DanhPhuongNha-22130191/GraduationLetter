"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/language-context";

interface BackToEnvelopeButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export const BackToEnvelopeButton: React.FC<BackToEnvelopeButtonProps> = ({ isVisible, onClick }) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.85, x: -10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.85, x: -10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          aria-label={t.nav.backToEnvelope}
          title={t.nav.backToEnvelope}
          className="fixed top-4 left-[60px] sm:left-[64px] z-40 h-10 px-3 sm:px-3.5 rounded-full flex items-center gap-1.5 bg-emerald-deep/90 text-gold border border-gold/45 hover:border-gold hover:bg-gold/20 shadow-lg backdrop-blur-md transition-all duration-300 active:scale-95 touch-manipulation cursor-pointer group"
        >
          <Mail className="w-4 h-4 stroke-[2.2] text-gold group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-xs font-sans font-bold tracking-wider text-ivory group-hover:text-gold transition-colors whitespace-nowrap">
            {t.nav.envelope}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
