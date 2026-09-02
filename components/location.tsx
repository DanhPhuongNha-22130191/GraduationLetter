"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";

export const LocationSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="location" className="py-16 sm:py-24 px-4 bg-emerald-deep text-ivory relative">
      <div className="w-full max-w-lg mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <span className="text-gold font-sans text-xs uppercase tracking-[0.3em] font-semibold block mb-2">
            {t.location.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ivory">
            {t.location.title}
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-3" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-emerald-main/70 border border-gold/40 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col items-center text-center"
        >
          <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center text-gold mb-4 border border-gold/30">
            <MapPin className="w-7 h-7 stroke-[1.5]" />
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-ivory mb-2">
            {t.details.venueVal}
          </h3>

          <p className="font-sans text-xs sm:text-sm text-ivory/80 leading-relaxed max-w-xs mb-6">
            {t.details.addressVal}
          </p>

          {graduationConfig.mapUrl && (
            <a
              href={graduationConfig.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gold-gradient text-emerald-deep font-sans font-semibold text-sm tracking-widest uppercase hover:brightness-110 shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 touch-manipulation"
            >
              <Navigation className="w-4 h-4 fill-emerald-deep" />
              <span>{t.location.viewMap}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
};
