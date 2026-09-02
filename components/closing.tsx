"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Phone, Mail } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";

export const ClosingSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer id="closing" className="relative bg-emerald-deep text-ivory pt-16 pb-24 sm:pb-16 px-4 overflow-hidden border-t border-gold/30">
      <div className="w-full max-w-lg mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-emerald-main/50 border border-gold/40 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative"
        >
          <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-gold/60" />
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gold/60" />
          <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-gold/60" />
          <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-gold/60" />

          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-widest text-gold mb-3 uppercase">
            {t.closing.thankYou}
          </h2>

          <div className="w-16 h-[1px] bg-gold-gradient mx-auto mb-4" />

          <p className="font-sans text-xs sm:text-sm text-ivory/90 leading-relaxed max-w-xs mx-auto mb-6">
            {t.closing.message}
          </p>

          {/* Academic Profile Card with University Crest Logo */}
          <div className="my-6 p-4 rounded-xl bg-emerald-deep/80 border border-gold/30 flex flex-col items-center gap-2 shadow-inner">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-1 border border-gold/40 shadow-sm flex items-center justify-center">
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
            <span className="font-sans text-xs text-ivory/80">
              {graduationConfig.faculty} · Lớp {graduationConfig.classCode}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 my-6">
            <a
              href={`tel:${graduationConfig.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/30 text-xs font-sans text-gold transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{graduationConfig.phone}</span>
            </a>

            <a
              href={`mailto:${graduationConfig.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 hover:bg-gold/20 border border-gold/30 text-xs font-sans text-gold transition-all active:scale-95"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{graduationConfig.email}</span>
            </a>
          </div>

          <p className="font-serif italic text-xs text-gold/90 mb-4 max-w-xs mx-auto">
            &ldquo;{t.closing.motto}&rdquo;
          </p>

          <div className="pt-4 border-t border-gold/20 flex flex-col items-center">
            <span className="font-serif italic text-2xl font-bold text-ivory mb-1">
              {graduationConfig.name}
            </span>
            <span className="font-sans text-[11px] text-gold uppercase tracking-[0.25em]">
              {t.closing.periodLabel}
            </span>
          </div>
        </motion.div>

        <div className="text-center space-y-1 font-sans text-xs text-ivory/60">
          <p className="font-semibold tracking-wider text-gold-light uppercase text-[11px]">
            {graduationConfig.name}
          </p>
          <p className="text-[10px] tracking-widest text-ivory/50 uppercase">
            {t.closing.classLabel}
          </p>
          <p className="text-[11px] flex items-center justify-center gap-1 mt-2 text-ivory/70">
            <span>{t.closing.madeWith}</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
          </p>
        </div>
      </div>
    </footer>
  );
};
