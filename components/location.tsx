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
    <section id="location" className="py-16 sm:py-24 px-4 bg-emerald-deep text-ivory relative overflow-hidden">
      <div className="absolute inset-0 gold-radial-glow opacity-30 pointer-events-none" />

      <div className="w-full max-w-xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <span className="text-gold font-sans text-xs uppercase tracking-[0.35em] font-semibold block mb-2 flex items-center justify-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-gold" />
            <span>{t.location.eyebrow}</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ivory">
            {t.location.title}
          </h2>
          <AnimatedFlourishDivider className="my-3" />
        </motion.div>

        {/* Main Map Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-emerald-card rounded-3xl p-6 sm:p-8 border border-gold/40 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Pulsing Map Pin Icon with Radar Ripple Effect */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute w-16 h-16 rounded-full bg-gold/20 animate-ping" />
            <div className="relative w-14 h-14 rounded-full bg-gold-gradient text-emerald-deep flex items-center justify-center shadow-gold-glow border-2 border-ivory">
              <MapPin className="w-7 h-7 stroke-[2]" />
            </div>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-gold-shimmer mb-2">
            {t.details.venueVal}
          </h3>

          <p className="font-sans text-xs sm:text-sm text-ivory/85 leading-relaxed max-w-md mb-6 font-medium">
            {t.details.addressVal}
          </p>

          {/* Embedded Interactive Map Frame */}
          <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gold/30 shadow-inner mb-6 relative">
            <iframe
              title="Google Map Location"
              src={embedMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, filter: "contrast(1.05) saturate(1.1)" }}
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
              className="w-full sm:w-auto px-10 py-3.5 rounded-full bg-gold-gradient text-emerald-deep font-sans font-bold text-xs tracking-widest uppercase hover:brightness-110 shadow-gold-glow transition-all duration-300 flex items-center justify-center gap-2 border border-ivory/60 active:scale-95 touch-manipulation cursor-pointer shimmer-gold"
            >
              <Navigation className="w-4 h-4 fill-emerald-deep" />
              <span>{t.location.viewMap}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
};
