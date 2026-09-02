"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, Code, Sprout, GraduationCap } from "lucide-react";
import { useLanguage } from "@/context/language-context";

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
      <div className="w-full max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="text-gold-dark font-sans text-xs uppercase tracking-[0.3em] font-semibold block mb-2">
            {t.journey.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-emerald-deep">
            {t.journey.title}
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-3" />
        </motion.div>

        <div className="relative pl-6 sm:pl-8 border-l-2 border-gold/30 space-y-10 my-4">
          {t.journey.steps.map((item, idx) => {
            const IconComponent = iconMap[item.iconName] || GraduationCap;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="relative group"
              >
                <div className="absolute -left-[31px] sm:-left-[39px] top-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-deep text-gold flex items-center justify-center border-2 border-gold shadow-md">
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
                </div>

                <div className="bg-white rounded-xl p-5 border border-gold/25 shadow-card-glow hover:border-gold/60 transition-all duration-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif text-xs font-bold text-gold-dark tracking-widest">
                      {item.period}
                    </span>
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-emerald/10 text-emerald uppercase font-semibold">
                      {t.journey.stepPrefix} {item.step}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-emerald-deep mb-2">
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
