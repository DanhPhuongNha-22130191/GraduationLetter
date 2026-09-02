"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Phone, Mail, Share2, Check, Sparkles } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { AnimatedFlourishDivider } from "@/components/animated-motifs";

export const ClosingSection: React.FC = () => {
  const { t } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Lễ Tốt Nghiệp — ${graduationConfig.name}`,
          text: `Trân trọng kính mời bạn đến tham dự Lễ Tốt Nghiệp của ${graduationConfig.name}!`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to copy link
      }
    }

    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <footer id="closing" className="relative bg-emerald-deep text-ivory pt-16 pb-28 sm:pb-16 px-4 overflow-hidden border-t border-gold/30">
      <div className="absolute inset-0 gold-radial-glow opacity-30 pointer-events-none" />

      <div className="w-full max-w-lg mx-auto text-center space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-emerald-card rounded-3xl p-6 sm:p-9 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-gold/70 animate-pulse" />
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gold/70 animate-pulse" />
          <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-gold/70 animate-pulse" />
          <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-gold/70 animate-pulse" />

          <span className="text-gold font-sans text-xs uppercase tracking-[0.3em] font-semibold block mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
            <span>EXPRESSION OF GRATITUDE</span>
            <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-widest text-gold-shimmer mb-2 uppercase drop-shadow-md">
            {t.closing.thankYou}
          </h2>

          <AnimatedFlourishDivider className="my-3" />

          <p className="font-serif italic text-sm sm:text-base text-ivory/95 leading-relaxed max-w-xs mx-auto mb-6">
            &ldquo;{t.closing.message}&rdquo;
          </p>

          {/* Academic Profile Card with University Crest Logo */}
          <div className="my-6 p-4 rounded-2xl bg-emerald-deep/90 border border-gold/30 flex flex-col items-center gap-2 shadow-inner">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white p-1 border-2 border-gold shadow-md flex items-center justify-center animate-float-slow">
              <Image
                src={graduationConfig.universityLogoUrl}
                alt={graduationConfig.university}
                fill
                className="object-contain p-0.5"
              />
            </div>
            <span className="font-serif font-bold text-sm text-gold-light tracking-wide uppercase mt-1">
              {graduationConfig.university}
            </span>
            <span className="font-sans text-xs text-ivory/80 font-medium">
              {graduationConfig.faculty} · Lớp {graduationConfig.classCode}
            </span>
          </div>

          {/* Quick Contact & Share Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 my-6">
            <a
              href={`tel:${graduationConfig.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/15 hover:bg-gold/30 border border-gold/40 text-xs font-sans text-gold font-semibold transition-all active:scale-95 touch-manipulation shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 stroke-[2]" />
              <span>{graduationConfig.phone}</span>
            </a>

            <a
              href={`mailto:${graduationConfig.email}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/15 hover:bg-gold/30 border border-gold/40 text-xs font-sans text-gold font-semibold transition-all active:scale-95 touch-manipulation shadow-sm"
            >
              <Mail className="w-3.5 h-3.5 stroke-[2]" />
              <span>{graduationConfig.email}</span>
            </a>

            <button
              onClick={handleShare}
              className="w-full py-3.5 rounded-full bg-gold-gradient text-emerald-deep font-sans font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2 border border-ivory/40 active:scale-95 touch-manipulation cursor-pointer shadow-gold-glow shimmer-gold"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-deep stroke-[2]" />
                  <span>Đã sao chép liên kết thư mời!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 stroke-[2]" />
                  <span>Chia Sẻ Thư Mời Này</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-4 border-t border-gold/20 flex flex-col items-center">
            <span className="font-serif italic text-2xl font-bold text-ivory mb-1">
              {graduationConfig.name}
            </span>
            <span className="font-sans text-[11px] text-gold uppercase tracking-[0.25em] font-semibold">
              {t.closing.periodLabel}
            </span>
          </div>
        </motion.div>

        <div className="text-center space-y-1 font-sans text-xs text-ivory/60">
          <p className="font-bold tracking-wider text-gold-light uppercase text-xs">
            {graduationConfig.name} — IT CLASS OF {graduationConfig.year}
          </p>
          <p className="text-[11px] flex items-center justify-center gap-1.5 mt-2 text-ivory/70 font-medium">
            <span>{t.closing.madeWith}</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 animate-pulse" />
          </p>
        </div>
      </div>
    </footer>
  );
};
