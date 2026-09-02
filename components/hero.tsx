"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, GraduationCap, MailOpen } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { playBackgroundMusic } from "@/components/music-toggle";
import { RotatingBotanicalCrest, AnimatedFlourishDivider } from "@/components/animated-motifs";

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();

  const scrollToNext = () => {
    playBackgroundMusic();
    const el = document.getElementById("invitation");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between items-center px-4 py-8 sm:py-12 bg-ivory text-emerald-deep overflow-hidden">
      {/* Background Decorative Paper Grid & Gold Radial Spotlight */}
      <div className="absolute inset-0 paper-texture opacity-70 pointer-events-none" />
      <div className="absolute inset-0 gold-radial-glow opacity-30 pointer-events-none" />
      
      {/* Corner Rotating Botanical Ornaments */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 pointer-events-none z-0">
        <RotatingBotanicalCrest className="w-20 h-20 sm:w-28 sm:h-28 text-gold" />
      </div>
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 pointer-events-none z-0 transform rotate-90">
        <RotatingBotanicalCrest className="w-20 h-20 sm:w-28 sm:h-28 text-gold" />
      </div>

      {/* Top Header Badge */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center mt-6 sm:mt-2"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold/40 bg-gold/10 text-xs sm:text-sm font-sans tracking-widest text-emerald-deep font-semibold uppercase shadow-gold-glow backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
          <span>{t.hero.invitationCard}</span>
          <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
        </div>
      </motion.div>

      {/* Main Luxury Card Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="z-10 my-auto w-full max-w-sm sm:max-w-md glass-gold-card rounded-3xl p-6 sm:p-9 shadow-2xl relative flex flex-col items-center text-center backdrop-blur-md border-2 border-gold/40"
      >
        {/* Dual Gold Foil Inner Borders */}
        <div className="absolute inset-3 rounded-2xl border border-gold/30 pointer-events-none" />
        <div className="absolute inset-5 rounded-xl border border-gold/50 border-dashed pointer-events-none opacity-50" />

        {/* Four Corner Dots inside Card */}
        <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-gold/70 animate-pulse" />
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gold/70 animate-pulse" />
        <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-gold/70 animate-pulse" />
        <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-gold/70 animate-pulse" />

        {/* Graduate Avatar Portrait Frame with Gold Pulsing Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 border-2 border-gold shadow-gold-glow mb-4 sm:mb-5 bg-gold-gradient transform hover:scale-105 transition-transform"
        >
          <div className="relative w-full h-full rounded-full overflow-hidden border border-ivory/80">
            <Image
              src={graduationConfig.avatarUrl}
              alt={graduationConfig.name}
              fill
              priority
              className="object-cover"
            />
          </div>
          {/* Gold Crest Icon Badge Overlay */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold-gradient text-emerald-deep flex items-center justify-center shadow-md border-2 border-ivory animate-float-slow">
            <GraduationCap className="w-4 h-4 stroke-[2]" />
          </div>
        </motion.div>

        {/* Ceremony Title */}
        <h2 className="font-serif text-xs sm:text-sm uppercase tracking-[0.3em] text-gold-dark font-bold mb-1 flex items-center gap-2">
          <span className="text-gold/60">✦</span>
          <span>{t.hero.ceremony}</span>
          <span className="text-gold/60">✦</span>
        </h2>

        {/* Degree Subtitle */}
        <span className="italic font-serif text-gold-dark text-2xl sm:text-3xl block my-1 font-semibold">
          {t.hero.degree}
        </span>

        {/* Student Name */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-deep tracking-tight mb-1 leading-tight drop-shadow-sm"
        >
          {graduationConfig.name}
        </motion.h1>

        {/* Animated Flourish Divider */}
        <AnimatedFlourishDivider className="my-2" />

        {/* Major & Year Pill Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="inline-block px-4 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-emerald-deep font-sans font-bold text-xs tracking-widest uppercase my-2 shadow-inner"
        >
          {t.hero.major}
        </motion.div>

        {/* Subtitle quote */}
        <p className="font-serif italic text-sm text-emerald-soft/90 max-w-xs mb-6">
          &ldquo;{t.hero.subTitle}&rdquo;
        </p>

        {/* Gold Gradient Action Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={scrollToNext}
          className="w-full sm:w-auto px-10 py-3.5 rounded-full bg-gold-gradient text-emerald-deep font-sans font-bold text-sm tracking-widest uppercase shadow-gold-glow flex items-center justify-center gap-2.5 border border-ivory/60 hover:brightness-110 transition-all active:scale-95 touch-manipulation cursor-pointer shimmer-gold"
        >
          <MailOpen className="w-4 h-4 stroke-[2]" />
          <span>{t.hero.openBtn}</span>
          <ChevronDown className="w-4 h-4 text-emerald-deep animate-bounce" />
        </motion.button>
      </motion.div>

      {/* Swipe Down Floating Indicator */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="z-10 text-emerald-soft/70 text-xs font-sans flex flex-col items-center gap-1 cursor-pointer"
        onClick={scrollToNext}
      >
        <span className="tracking-widest uppercase text-[10px]">{t.hero.swipeDown}</span>
        <ChevronDown className="w-4 h-4 text-gold" />
      </motion.div>
    </section>
  );
};
