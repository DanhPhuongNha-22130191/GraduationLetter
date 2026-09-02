"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, Code, Sprout, GraduationCap, CheckCircle2, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { RotatingBotanicalCrest, AnimatedFlourishDivider } from "@/components/animated-motifs";

const iconMap: Record<string, React.ElementType> = {
  Compass,
  Code,
  Sprout,
  GraduationCap,
};

export const JourneySection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="journey" className="py-16 sm:py-24 px-4 bg-ivory text-emerald-deep relative overflow-hidden">
      {/* Background Animated Rotating Wreath */}
      <div className="absolute top-10 right-0 pointer-events-none opacity-20 transform translate-x-1/3">
        <RotatingBotanicalCrest className="w-64 h-64 sm:w-96 sm:h-96 text-gold animate-spin-slow" />
      </div>

      <div className="w-full max-w-lg mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="text-gold-dark font-sans text-xs uppercase tracking-[0.35em] font-semibold block mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
            <span>{t.journey.eyebrow}</span>
            <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-emerald-deep">
            {t.journey.title}
          </h2>
          <AnimatedFlourishDivider className="my-3" />
        </motion.div>

        {/* Vertical Timeline with Continuous Flowing Glowing Gold Line */}
        <div className="relative pl-7 sm:pl-10 space-y-9 my-4">
          {/* Continuous Glowing Progress Line */}
          <div className="absolute left-3.5 sm:left-4.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-gold via-gold-shimmer to-emerald-deep animate-pulse" />

          {t.journey.steps.map((item, idx) => {
            const IconComponent = iconMap[item.iconName] || GraduationCap;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="relative group"
              >
                {/* Continuous Pulsing Node Circle */}
                <motion.div
                  animate={{ y: [0, -4, 0], scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: idx * 0.4 }}
                  className="absolute -left-[35px] sm:-left-[47px] top-1 z-10"
                >
                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-deep text-gold flex items-center justify-center border-2 border-gold shadow-gold-glow">
                    <div className="absolute inset-0 rounded-full border border-gold animate-ping opacity-30" />
                    <IconComponent className="w-5 h-5 stroke-[1.75]" />
                  </div>
                </motion.div>

                {/* Timeline Card with Continuous Top Shimmer & Hover Glow */}
                <div className="glass-gold-card rounded-2xl p-5 sm:p-6 border border-gold/35 shadow-card-glow group-hover:border-gold group-hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gold-gradient wave-divider" />

                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-xs font-bold text-gold-dark tracking-widest uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold-dark animate-pulse" />
                      <span>{item.period}</span>
                    </span>
                    
                    {/* Continuous Pulsing Step Pill */}
                    <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-gold/15 text-emerald-deep font-bold uppercase tracking-wider border border-gold/40 shadow-xs animate-pulse-glow">
                      {t.journey.stepPrefix} {item.step}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-emerald-deep mb-2">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-charcoal/85 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
