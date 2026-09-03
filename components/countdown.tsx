"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { useGuest } from "@/context/guest-context";
import { formatLocalizedDate, formatLocalizedTime } from "@/config/i18n";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Phân tích ngày giờ tùy chỉnh (customDate + customTime) thành đối tượng Date mục tiêu
 */
function parseCustomTargetDate(customDate?: string, customTime?: string): Date {
  const defaultTarget = new Date(graduationConfig.graduationDate); // Mặc định 2026-10-21T08:00:00
  let year = defaultTarget.getFullYear();
  let month = defaultTarget.getMonth();
  let day = defaultTarget.getDate();
  let hours = defaultTarget.getHours();
  let minutes = defaultTarget.getMinutes();

  // 1. Phân tích customDate (hỗ trợ DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY)
  if (customDate && customDate.trim()) {
    const trimmedDate = customDate.trim();
    const matchDMY = trimmedDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    const matchYMD = trimmedDate.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    const matchDM = trimmedDate.match(/^(\d{1,2})[\/\-](\d{1,2})$/);

    if (matchDMY) {
      day = parseInt(matchDMY[1], 10);
      month = parseInt(matchDMY[2], 10) - 1;
      year = parseInt(matchDMY[3], 10);
    } else if (matchYMD) {
      year = parseInt(matchYMD[1], 10);
      month = parseInt(matchYMD[2], 10) - 1;
      day = parseInt(matchYMD[3], 10);
    } else if (matchDM) {
      day = parseInt(matchDM[1], 10);
      month = parseInt(matchDM[2], 10) - 1;
    }
  }

  // 2. Phân tích customTime (hỗ trợ "09:30 - 11:30 sáng", "14:00 chiều", "10:00 AM"...)
  if (customTime && customTime.trim()) {
    const trimmedTime = customTime.trim();
    const timeMatch = trimmedTime.match(/(\d{1,2})[:h](\d{2})/i) || trimmedTime.match(/(\d{1,2})[:h]/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const isPM = /pm|chiều|chieu|tối|toi|afternoon|evening|រសៀល|យប់/i.test(trimmedTime);
      const isAM = /am|sáng|sang|morning|ព្រឹក/i.test(trimmedTime);

      if (isPM && h < 12) {
        h += 12;
      } else if (isAM && h === 12) {
        h = 0;
      }
      hours = h;
      minutes = m;
    }
  }

  return new Date(year, month, day, hours, minutes, 0);
}

export const CountdownSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const { effectiveDate, effectiveTime } = useGuest();
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
      const targetDate = parseCustomTargetDate(effectiveDate, effectiveTime);
      const target = targetDate.getTime();
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
  }, [effectiveDate, effectiveTime]);

  const timeUnits = [
    { label: t.countdown.days, value: timeLeft.days },
    { label: t.countdown.hours, value: timeLeft.hours },
    { label: t.countdown.minutes, value: timeLeft.minutes },
    { label: t.countdown.seconds, value: timeLeft.seconds },
  ];

  // Hiển thị ngày giờ động theo từng khách hoặc ngày sớm nhất trong Sheet nếu là khách vãng lai
  const displayDateStr = effectiveDate ? formatLocalizedDate(effectiveDate, lang) : t.details.dateVal;
  const displayTimeStr = effectiveTime ? formatLocalizedTime(effectiveTime, lang) : t.details.timeVal;

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
            {displayDateStr} — {displayTimeStr}
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
