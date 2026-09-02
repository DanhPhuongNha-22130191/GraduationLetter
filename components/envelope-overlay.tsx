"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MailOpen, Sparkles, GraduationCap } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { playBackgroundMusic } from "@/components/music-toggle";
import { useLanguage } from "@/context/language-context";

export const EnvelopeOverlay: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenEnvelope = () => {
    playBackgroundMusic();
    setIsOpen(true);
    setTimeout(() => {
      const el = document.getElementById("invitation");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 400);
  };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          onClick={handleOpenEnvelope}
          className="fixed inset-0 z-50 bg-emerald-deep text-ivory flex flex-col items-center justify-between p-6 sm:p-10 cursor-pointer overflow-hidden select-none"
        >
          {/* Paper Texture Overlay */}
          <div className="absolute inset-0 paper-texture opacity-40 pointer-events-none" />

          {/* Gold Decorative Corner Lines */}
          <div className="absolute top-4 left-4 w-20 h-20 pointer-events-none opacity-40">
            <svg viewBox="0 0 100 100" fill="none" stroke="#C9A96E" strokeWidth="2">
              <path d="M 0,20 C 30,20 30,0 50,0 M 0,40 C 40,40 40,0 70,0" />
            </svg>
          </div>
          <div className="absolute top-4 right-4 w-20 h-20 pointer-events-none opacity-40 transform rotate-90">
            <svg viewBox="0 0 100 100" fill="none" stroke="#C9A96E" strokeWidth="2">
              <path d="M 0,20 C 30,20 30,0 50,0 M 0,40 C 40,40 40,0 70,0" />
            </svg>
          </div>

          {/* Top Badge */}
          <div className="z-10 mt-6 sm:mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-xs font-sans tracking-widest text-gold uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
              <span>GRADUATION INVITATION</span>
              <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
            </div>
          </div>

          {/* Central Envelope Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="z-10 w-full max-w-sm sm:max-w-md bg-emerald-main/90 border border-gold/40 rounded-2xl p-8 shadow-2xl text-center relative flex flex-col items-center border-dashed"
          >
            <div className="absolute inset-2 rounded-xl border border-gold/20 pointer-events-none" />

            {/* Central Graduation Cap Icon Seal */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-deep border-2 border-gold shadow-gold-glow flex items-center justify-center text-gold mb-6 transform hover:scale-105 transition-transform">
              <GraduationCap className="w-9 h-9 sm:w-10 sm:h-10 stroke-[1.5]" />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ivory tracking-tight mb-2">
              {graduationConfig.name}
            </h1>

            <p className="font-sans text-xs uppercase tracking-[0.25em] text-gold mb-6 font-semibold">
              {graduationConfig.major} · CLASS OF {graduationConfig.year}
            </p>

            <div className="w-16 h-[1px] bg-gold/50 mb-6" />

            {/* Main Interactive Button: MỞ THIỆP */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleOpenEnvelope}
              className="w-full py-4 rounded-full bg-gold-gradient text-emerald-deep font-sans font-bold text-sm tracking-widest uppercase shadow-gold-glow flex items-center justify-center gap-2 border border-ivory/40 hover:brightness-110 transition-all touch-manipulation"
            >
              <MailOpen className="w-5 h-5 stroke-[2]" />
              <span>{t.hero.openBtn}</span>
            </motion.button>
          </motion.div>

          {/* Footer instruction */}
          <div className="z-10 mb-6 text-center text-ivory/70 text-xs font-sans">
            <p className="tracking-widest uppercase flex items-center justify-center gap-1">
              <span>Chạm bất kỳ đâu để mở thiệp</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
