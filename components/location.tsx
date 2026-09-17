"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, ExternalLink, Compass } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { AnimatedFlourishDivider } from "@/components/animated-motifs";

export const LocationSection: React.FC = () => {
  const { t } = useLanguage();

  const embedMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.485189704256!2d106.7876878758686!3d10.850654089302636!2m3!10f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276398969f7b%3A0x629555c45e5d1645!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBOw7RuZyBMw6JtIFRQLiBI4buTIENow60gTWluaA!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s";

  return (
    <section id="location" className="py-16 sm:py-24 px-4 bg-emerald-950 text-ivory-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial from-gold-500/10 via-transparent to-transparent opacity-30 pointer-events-none" />

      <div className="w-full max-w-xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <span className="text-gold-200 font-sans text-xs uppercase tracking-[0.25em] font-semibold block mb-1">
            {t.location.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ivory-50">
            {t.location.title}
          </h2>
          <AnimatedFlourishDivider className="my-2.5 text-gold-500/60" />
        </motion.div>

        {/* Main Map Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-emerald-card rounded-3xl p-6 sm:p-8 border border-gold-500/25 shadow-soft-xl flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Map Pin Icon Badge */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gold-gradient text-emerald-950 flex items-center justify-center shadow-gold-glow border-2 border-gold-200/40">
              <MapPin className="w-6 h-6 stroke-[2]" />
            </div>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-gold-200 mb-2">
            {t.details.venueVal}
          </h3>

          <p className="font-sans text-xs sm:text-sm text-ivory-100/85 leading-relaxed max-w-md mb-6">
            {t.details.addressVal}
          </p>

          {/* Embedded Interactive Map Frame */}
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gold-500/30 shadow-inner mb-6 relative">
            <iframe
              title="Google Map Location"
              src={embedMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, filter: "contrast(1.02) saturate(1.05)" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {graduationConfig.mapUrl && (
            <a
              href={graduationConfig.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.location.viewMap}
              className="w-full sm:w-auto px-9 py-3.5 rounded-full bg-gold-gradient text-emerald-950 font-sans font-bold text-sm tracking-wider uppercase hover:brightness-105 shadow-gold-glow transition-all flex items-center justify-center gap-2 border border-gold-200/50 active:scale-95 touch-manipulation cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <Navigation className="w-4 h-4 fill-emerald-950" />
              <span>{t.location.viewMap}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
};
