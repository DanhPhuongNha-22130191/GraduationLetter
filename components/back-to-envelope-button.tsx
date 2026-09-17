"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
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
          initial={{ opacity: 0, scale: 0.8, x: -8 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onClick}
          aria-label={t.nav.backToEnvelope}
          title={t.nav.backToEnvelope}
          className="fixed top-4 left-[60px] sm:left-[62px] z-40 w-10 h-10 rounded-full flex items-center justify-center bg-emerald-deep/90 text-gold border border-gold/45 hover:border-gold hover:bg-gold/20 shadow-lg backdrop-blur-md transition-all duration-300 active:scale-95 touch-manipulation cursor-pointer group"
        >
          <ArrowLeft className="w-5 h-5 text-gold group-hover:-translate-x-0.5 transition-transform" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
