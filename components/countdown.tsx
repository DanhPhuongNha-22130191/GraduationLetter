"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownSection: React.FC = () => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const calculateTimeLeft = (): TimeLeft => {
      const target = new Date(graduationConfig.graduationDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { label: t.countdown.days, value: timeLeft.days },
    { label: t.countdown.hours, value: timeLeft.hours },
    { label: t.countdown.minutes, value: timeLeft.minutes },
    { label: t.countdown.seconds, value: timeLeft.seconds },
  ];

  return (
    <section id="countdown" className="py-14 sm:py-24 px-3 sm:px-4 bg-ivory text-emerald-deep relative overflow-hidden">
      <div className="w-full max-w-lg mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-[11px] sm:text-xs font-sans font-semibold uppercase tracking-widest mb-3 border border-gold/30">
            <Timer className="w-3.5 h-3.5 text-gold-dark" />
            <span>COUNTDOWN</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-emerald-deep">
            {t.countdown.title}
          </h2>
          <p className="font-sans text-[11px] sm:text-sm text-charcoal/70 mt-2 font-medium">
            21/10/2026 — 08:00 AM @ Đại Học Nông Lâm TP.HCM
          </p>
        </motion.div>

        {/* High-end Mobile-Optimized Countdown Flip Cards Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-4">
          {timeUnits.map((unit, idx) => (
            <motion.div
              key={unit.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-emerald-deep text-ivory rounded-xl sm:rounded-2xl py-3 px-1.5 sm:p-5 border border-gold/40 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-gold transition-colors"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gold-gradient" />

              <span className="font-serif text-2xl sm:text-5xl font-bold text-gold-shimmer tracking-tight leading-none mb-1 group-hover:scale-105 transition-transform drop-shadow-md">
                {hasMounted ? String(unit.value).padStart(2, "0") : "00"}
              </span>

              <span className="font-sans text-[9px] sm:text-xs tracking-wider uppercase text-ivory/85 font-bold">
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
