"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MailOpen, Sparkles, GraduationCap, Award } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { playBackgroundMusic } from "@/components/music-toggle";
import { useLanguage } from "@/context/language-context";

/* ── Animated background motifs ── */

const ORBS = [
  { x: "15%", y: "20%", size: 180, delay: 0 },
  { x: "70%", y: "60%", size: 220, delay: 4 },
  { x: "50%", y: "85%", size: 160, delay: 8 },
];

const AnimatedBackground: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Smoke gradient clouds */}
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 480, height: 320,
        top: "-10%", left: "-15%",
        background: "radial-gradient(ellipse, rgba(31,90,70,0.22) 0%, transparent 70%)",
        filter: "blur(40px)",
      }}
      animate={{ x: [0, 30, 0], y: [0, 20, 0], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 400, height: 280,
        bottom: "-8%", right: "-12%",
        background: "radial-gradient(ellipse, rgba(201,169,110,0.12) 0%, transparent 70%)",
        filter: "blur(50px)",
      }}
      animate={{ x: [0, -25, 0], y: [0, -18, 0], opacity: [0.5, 0.9, 0.5] }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
    />
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 300, height: 300,
        top: "30%", left: "40%",
        background: "radial-gradient(ellipse, rgba(15,50,38,0.18) 0%, transparent 70%)",
        filter: "blur(60px)",
      }}
      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 6 }}
    />

    {/* Floating gold bokeh orbs */}
    {ORBS.map((orb, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: orb.size, height: orb.size,
          left: orb.x, top: orb.y,
          background: "radial-gradient(circle, rgba(201,169,110,0.18) 0%, rgba(201,169,110,0.06) 50%, transparent 80%)",
          filter: "blur(20px)",
          transform: "translate(-50%, -50%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
      />
    ))}

    {/* Floating rotating botanical rings — top-left & bottom-right */}
    <motion.div
      className="absolute top-2 left-2 w-28 h-28 sm:w-36 sm:h-36 opacity-20 text-gold"
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="50" cy="50" r="44" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="38" strokeDasharray="2 6" />
        <path d="M50 6 A44 44 0 0 1 94 50" strokeWidth="1.6" />
        <path d="M50 94 A44 44 0 0 1 6 50" strokeWidth="1.6" />
        <circle cx="50" cy="6"  r="3" fill="currentColor" />
        <circle cx="94" cy="50" r="3" fill="currentColor" />
        <circle cx="50" cy="94" r="3" fill="currentColor" />
        <circle cx="6"  cy="50" r="3" fill="currentColor" />
      </svg>
    </motion.div>
    <motion.div
      className="absolute bottom-2 right-2 w-28 h-28 sm:w-36 sm:h-36 opacity-20 text-gold"
      animate={{ rotate: -360 }}
      transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
    >
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="50" cy="50" r="44" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="38" strokeDasharray="2 6" />
        <path d="M50 6 A44 44 0 0 1 94 50" strokeWidth="1.6" />
        <path d="M50 94 A44 44 0 0 1 6 50" strokeWidth="1.6" />
        <circle cx="50" cy="6"  r="3" fill="currentColor" />
        <circle cx="94" cy="50" r="3" fill="currentColor" />
        <circle cx="50" cy="94" r="3" fill="currentColor" />
        <circle cx="6"  cy="50" r="3" fill="currentColor" />
      </svg>
    </motion.div>

    {/* Animated diagonal shimmer line */}
    <motion.div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(135deg, transparent 40%, rgba(201,169,110,0.04) 50%, transparent 60%)",
        backgroundSize: "400% 400%",
      }}
      animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

export const EnvelopeOverlay: React.FC = () => {
  const { t } = useLanguage();
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenEnvelope = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpening || isOpen) return;
    setIsOpening(true);
    playBackgroundMusic();

    setTimeout(() => {
      setIsOpen(true);
      const el = document.getElementById("invitation");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 700);
  };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleOpenEnvelope}
          className="fixed inset-0 z-50 bg-[#0c2b24] text-ivory flex flex-col items-center justify-between p-4 sm:p-8 cursor-pointer overflow-y-auto overflow-x-hidden select-none touch-manipulation"
        >
          <div className="absolute inset-0 paper-texture opacity-30 pointer-events-none" />

          {/* Animated background motifs */}
          <AnimatedBackground />

          {/* Luxury Filigree Corner Frames */}
          <div className="absolute top-3 left-3 sm:top-6 sm:left-6 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-40 text-gold">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M 0,25 C 35,25 35,0 60,0 M 0,50 C 50,50 50,0 85,0" />
              <circle cx="25" cy="25" r="3" fill="currentColor" />
            </svg>
          </div>
          <div className="absolute top-3 right-3 sm:top-6 sm:right-6 w-16 h-16 sm:w-24 sm:h-24 pointer-events-none opacity-40 text-gold transform rotate-90">
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M 0,25 C 35,25 35,0 60,0 M 0,50 C 50,50 50,0 85,0" />
              <circle cx="25" cy="25" r="3" fill="currentColor" />
            </svg>
          </div>

          {/* Top Floating Crest Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10 mt-4 sm:mt-8 text-center"
          >
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full border border-gold/60 bg-emerald-deep text-[10px] sm:text-xs font-sans tracking-[0.2em] text-gold uppercase shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
              <span>OFFICIAL GRADUATION INVITATION</span>
              <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
            </div>
          </motion.div>

          {/* Interactive 3D Envelope Container */}
          <div className="z-10 w-full max-w-[340px] sm:max-w-md perspective-1000 my-auto py-4">
            <motion.div
              initial={{ scale: 0.88, y: 20 }}
              animate={isOpening ? { scale: 1.05, y: -10 } : { scale: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full bg-emerald-deep rounded-3xl p-5 sm:p-9 text-center border-2 border-gold/60 shadow-2xl overflow-hidden flex flex-col items-center"
            >
              {/* Inner Gold Foil Dashed Frame */}
              <div className="absolute inset-2.5 rounded-2xl border border-gold/35 pointer-events-none" />
              <div className="absolute inset-4 rounded-xl border border-gold/45 border-dashed pointer-events-none opacity-70" />

              {/* Gold Top Flap Accent Line */}
              <div className="w-20 sm:w-24 h-1 bg-gold-gradient rounded-full mb-5" />

              {/* Wax Seal Button — fixed size to prevent mobile breakage */}
              <motion.div
                animate={isOpening ? { scale: [1, 1.3, 0], rotate: [0, 15, 45] } : { scale: [1, 1.05, 1] }}
                transition={isOpening ? { duration: 0.6 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
                onClick={handleOpenEnvelope}
                className="rounded-full wax-seal border-2 border-gold-light flex flex-col items-center justify-center text-ivory mb-5 cursor-pointer shadow-xl relative group touch-manipulation flex-shrink-0"
                style={{ width: 112, height: 112 }}
              >
                <div className="absolute inset-1 rounded-full border border-gold/40 pointer-events-none" />
                <GraduationCap className="w-11 h-11 text-gold-shimmer" />
                <span className="text-[9px] font-sans font-bold tracking-widest text-gold-shimmer uppercase mt-1">SEAL</span>
              </motion.div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gold font-bold mb-2 leading-tight drop-shadow-md">
                LỄ TỐT NGHIỆP 2026
              </h1>

              <h2 className="font-serif text-xl sm:text-2xl font-medium text-ivory tracking-normal mb-3">
                {graduationConfig.name}
              </h2>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold-light font-sans text-[11px] sm:text-xs tracking-wider uppercase mb-5 font-semibold border border-gold/40">
                <Award className="w-3.5 h-3.5 text-gold" />
                <span>{graduationConfig.major}</span>
              </div>

              {/* Main Interactive Button */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleOpenEnvelope}
                className="w-full py-4 rounded-full bg-gold-gradient text-emerald-deep font-sans font-bold text-sm tracking-widest uppercase shadow-gold-glow flex items-center justify-center gap-2 border border-ivory/60 hover:brightness-110 transition-all touch-manipulation cursor-pointer shimmer-gold"
              >
                <MailOpen className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
                <span>{t.hero.openBtn}</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Footer instruction */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="z-10 mb-4 sm:mb-6 text-center text-gold text-[10px] sm:text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2"
          >
            <span>✦ Chạm để mở thiệp ✦</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
