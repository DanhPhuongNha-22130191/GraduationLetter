"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MailOpen, Sparkles, GraduationCap, Award } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { playBackgroundMusic } from "@/components/music-toggle";
import { useLanguage } from "@/context/language-context";
import { useGuest, trackOpenInvitation } from "@/context/guest-context";

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
        background: "radial-gradient(ellipse, rgba(30,58,138,0.35) 0%, transparent 70%)",
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
        background: "radial-gradient(ellipse, rgba(201,169,110,0.22) 0%, transparent 70%)",
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
        background: "radial-gradient(ellipse, rgba(15,23,42,0.5) 0%, transparent 70%)",
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

    {/* Floating gold bokeh orbs */}
    {ORBS.map((orb, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: orb.size, height: orb.size,
          left: orb.x, top: orb.y,
          background: "radial-gradient(circle, rgba(201,169,110,0.14) 0%, rgba(201,169,110,0.03) 60%, transparent 80%)",
          filter: "blur(24px)",
          transform: "translate(-50%, -50%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
      />
    ))}

    {/* Subtle diagonal shimmer line */}
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: "linear-gradient(135deg, transparent 40%, rgba(201,169,110,0.03) 50%, transparent 60%)",
        backgroundSize: "400% 400%",
      }}
      animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

interface EnvelopeOverlayProps {
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export const EnvelopeOverlay: React.FC<EnvelopeOverlayProps> = ({
  isOpen: controlledIsOpen,
  onOpen,
  onClose,
}) => {
  const { t, lang } = useLanguage();
  const { guestName, hasCustomGuest, pronounMode, getGreetingPrefix } = useGuest();
  const [isOpening, setIsOpening] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // If controlledIsOpen is provided, use it; otherwise fallback to internalIsOpen
  const isCurrentlyOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  // Whenever the envelope is closed (e.g. user clicked Back to Envelope), reset isOpening
  React.useEffect(() => {
    if (!isCurrentlyOpen) {
      setIsOpening(false);
    }
  }, [isCurrentlyOpen]);

  const handleOpenEnvelope = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpening || isCurrentlyOpen) return;
    setIsOpening(true);
    playBackgroundMusic();

    // Ghi nhận lượt mở thiệp vào Google Sheets ngay khi bấm Mở Thiệp
    trackOpenInvitation(guestName, pronounMode);

    // Tự động kích hoạt tải lại kho ảnh mới nhất ngay khi người dùng bấm Mở Thiệp
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("refresh_gallery_photos"));
    }

    setTimeout(() => {
      setInternalIsOpen(true);
      onOpen?.();
      const el = document.getElementById("invitation");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 700);
  };

  return (
    <AnimatePresence>
      {!isCurrentlyOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleOpenEnvelope}
          className="fixed inset-0 z-50 bg-[#0B2A22] text-ivory-50 flex flex-col items-center justify-between p-4 sm:p-8 cursor-pointer overflow-y-auto overflow-x-hidden select-none touch-manipulation"
        >
          <div className="absolute inset-0 paper-texture opacity-25 pointer-events-none" />

          {/* Animated background motifs */}
          <AnimatedBackground />

          {/* Subtle Corner Accents */}
          <div className="absolute top-4 left-4 sm:top-7 sm:left-7 w-12 h-12 pointer-events-none opacity-30 text-gold-500">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M 0,20 L 0,0 L 20,0" />
            </svg>
          </div>
          <div className="absolute top-4 right-4 sm:top-7 sm:right-7 w-12 h-12 pointer-events-none opacity-30 text-gold-500 transform rotate-90">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M 0,20 L 0,0 L 20,0" />
            </svg>
          </div>

          {/* Top Floating Crest Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10 mt-4 sm:mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/35 bg-emerald-950/80 text-[10px] sm:text-xs font-sans tracking-[0.2em] text-gold-200 uppercase backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-gold-500" />
              <span>OFFICIAL GRADUATION INVITATION</span>
              <Sparkles className="w-3 h-3 text-gold-500" />
            </div>
          </motion.div>

          {/* Interactive 3D Envelope Container */}
          <div className="z-10 w-full max-w-[340px] sm:max-w-md perspective-1000 my-auto py-4">
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={isOpening ? { scale: 1.04, y: -10 } : { scale: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full bg-emerald-950 rounded-3xl p-6 sm:p-9 text-center border border-gold-500/35 shadow-2xl overflow-hidden flex flex-col items-center"
            >
              {/* Refined Single Inner Hairline Border */}
              <div className="absolute inset-3 rounded-2xl border border-gold-500/20 pointer-events-none" />

              {/* Gold Top Flap Accent Line */}
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent rounded-full mb-6 opacity-70" />

              {/* Wax Seal Button */}
              <motion.div
                animate={isOpening ? { scale: [1, 1.25, 0], rotate: [0, 15, 45] } : { scale: [1, 1.04, 1] }}
                transition={isOpening ? { duration: 0.6 } : { repeat: Infinity, duration: 4, ease: "easeInOut" }}
                onClick={handleOpenEnvelope}
                className="rounded-full wax-seal border border-gold-200/60 flex flex-col items-center justify-center text-ivory-50 mb-5 cursor-pointer shadow-xl relative group touch-manipulation flex-shrink-0"
                style={{ width: 104, height: 104 }}
              >
                <div className="absolute inset-1 rounded-full border border-gold-500/30 pointer-events-none" />
                <GraduationCap className="w-10 h-10 text-gold-200" />
                <span className="text-[8px] font-sans font-bold tracking-widest text-gold-200 uppercase mt-0.5">SEAL</span>
              </motion.div>

              <h1 className="font-serif text-2xl sm:text-3xl uppercase tracking-[0.18em] text-gold-200 font-bold mb-1.5 leading-tight">
                LỄ TỐT NGHIỆP 2026
              </h1>

              <h2 className="font-serif text-xl sm:text-2xl font-medium text-ivory-50 tracking-normal mb-3">
                {graduationConfig.name}
              </h2>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 text-gold-200 font-sans text-[11px] sm:text-xs tracking-wider uppercase mb-3 font-medium border border-gold-500/30">
                <Award className="w-3.5 h-3.5 text-gold-500" />
                <span>{graduationConfig.major}</span>
              </div>

              {/* Personalized Recipient Badge on Envelope */}
              {hasCustomGuest ? (
                <div className="w-full my-2.5 py-2.5 px-3 rounded-2xl bg-white/[0.04] border border-gold-500/30 text-center">
                  <span className="block text-[10px] font-sans uppercase tracking-[0.25em] text-gold-500 font-bold mb-0.5">
                    ✦ {getGreetingPrefix(lang).toUpperCase()} ✦
                  </span>
                  <span className="font-serif text-base sm:text-lg font-bold text-ivory-50 line-clamp-2">
                    {guestName}
                  </span>
                </div>
              ) : (
                <div className="my-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-gold-500/20 text-center">
                  <span className="text-xs font-sans uppercase tracking-[0.25em] text-gold-200 font-medium">
                    ✦ {t.invitation.guestEyebrow.toUpperCase()} ✦
                  </span>
                </div>
              )}

              {/* Main Interactive Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOpenEnvelope}
                className="w-full mt-2 py-3.5 rounded-full bg-gold-gradient text-emerald-950 font-sans font-bold text-xs sm:text-sm tracking-widest uppercase shadow-md flex items-center justify-center gap-2 border border-gold-200/50 hover:brightness-105 transition-all touch-manipulation cursor-pointer"
              >
                <MailOpen className="w-4 h-4 stroke-[2]" />
                <span>{t.hero.openBtn}</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Footer instruction */}
          <motion.div
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="z-10 mb-4 sm:mb-6 text-center text-gold-200 text-[10px] sm:text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2"
          >
            <span>✦ Chạm để mở thiệp ✦</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
