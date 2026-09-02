"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    <section id="countdown" className="py-14 sm:py-20 px-4 bg-ivory text-emerald-deep">
      <div className="w-full max-w-lg mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <span className="text-emerald-soft text-xs uppercase tracking-[0.25em] font-semibold block mb-1">
            {t.countdown.eyebrow}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-emerald-deep">
            {t.countdown.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {timeUnits.map((unit, idx) => (
            <motion.div
              key={unit.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-emerald-deep text-ivory rounded-xl p-3 sm:p-5 border border-gold/40 shadow-md flex flex-col items-center justify-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold-gradient" />
              <span className="font-serif text-2xl sm:text-4xl font-bold text-gold tracking-tight leading-none mb-1">
                {hasMounted ? String(unit.value).padStart(2, "0") : "00"}
              </span>
              <span className="font-sans text-[9px] sm:text-xs tracking-wider uppercase text-ivory/80 font-medium">
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
