"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, Code, Sprout, GraduationCap, CheckCircle2, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { AnimatedFlourishDivider } from "@/components/animated-motifs";

const iconMap: Record<string, React.ElementType> = {
  Compass,
  Code,
  Sprout,
  GraduationCap,
};

export const JourneySection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="journey" className="py-16 sm:py-24 px-4 bg-ivory-100 text-charcoal relative overflow-hidden">
      <div className="w-full max-w-lg mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="text-gold-700 font-sans text-xs uppercase tracking-[0.25em] font-semibold block mb-1">
            {t.journey.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-emerald-950">
            {t.journey.title}
          </h2>
          <AnimatedFlourishDivider className="my-2.5 text-gold-600" />
        </motion.div>

        {/* Vertical Timeline with Clean Gold Hairline */}
        <div className="relative pl-7 sm:pl-10 space-y-7 my-4">
          {/* Subtle Clean Timeline Line */}
          <div className="absolute left-3.5 sm:left-4.5 top-2 bottom-2 w-0.5 bg-gold-500/30" />

          {t.journey.steps.map((item, idx) => {
            const IconComponent = iconMap[item.iconName] || GraduationCap;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative group"
              >
                {/* Node Circle */}
                <div className="absolute -left-[33px] sm:-left-[45px] top-1 z-10">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-emerald-900 flex items-center justify-center border-2 border-gold-500 shadow-soft-xs">
                    <IconComponent className="w-4.5 h-4.5 stroke-[1.75]" />
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gold-500/20 shadow-soft-sm hover:border-gold-500/40 hover:shadow-soft-md transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient" />

                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif text-xs font-bold text-gold-700 tracking-wider uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold-600" />
                      <span>{item.period}</span>
                    </span>
                    
                    {/* Step Pill */}
                    <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-emerald-900/5 text-emerald-900 font-semibold uppercase tracking-wider border border-emerald-900/15">
                      {t.journey.stepPrefix} {item.step}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-emerald-950 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-charcoal/80 leading-relaxed">
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
