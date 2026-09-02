"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeartHandshake, Sparkles } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";

export const InvitationSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="invitation" className="relative py-16 sm:py-24 px-4 bg-ivory text-emerald-deep flex justify-center">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="relative bg-white rounded-2xl p-6 sm:p-10 border border-gold/30 shadow-card-glow text-center overflow-hidden"
        >
          {/* Subtle Paper Texture & Watermark */}
          <div className="absolute inset-0 paper-texture opacity-30 pointer-events-none" />

          {/* Top Decorative Gold Accent Line */}
          <div className="w-20 h-1 bg-gold-gradient mx-auto rounded-full mb-6" />

          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-gold/10 text-gold-dark mb-4 border border-gold/20 shadow-sm">
            <HeartHandshake className="w-5 h-5 stroke-[1.5]" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-emerald-deep uppercase mb-3">
            {t.invitation.title}
          </h2>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-[1px] bg-gold/40" />
            <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
            <div className="w-10 h-[1px] bg-gold/40" />
          </div>

          {/* Softer, Graceful Script/Serif Italic Typography */}
          <div className="space-y-5 text-base sm:text-lg md:text-xl text-emerald-deep/90 leading-loose font-serif italic font-normal px-2 sm:px-4 tracking-wide">
            <p className="first-letter:text-3xl sm:first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-gold-dark first-letter:mr-1">
              {t.invitation.para1}
            </p>
            <p>
              {t.invitation.para2}
            </p>
          </div>

          {/* Elegant Calligraphic Signature */}
          <div className="mt-8 pt-6 border-t border-gold/20 flex flex-col items-center">
            <span className="font-serif italic font-normal text-gold-dark text-xl sm:text-2xl tracking-wide">
              {graduationConfig.name}
            </span>
            <span className="text-[11px] font-sans text-emerald-soft uppercase tracking-widest mt-1">
              IT • Class of {graduationConfig.year}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
