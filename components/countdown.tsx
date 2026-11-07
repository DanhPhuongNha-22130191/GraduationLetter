"use client";

import React, { useState, useEffect } from "react";
import { Reveal, SectionHeading } from "@/components/animated-motifs";
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
export function parseCustomTargetDate(customDate?: string, customTime?: string): Date {
  const defaultTarget = new Date(graduationConfig.graduationDate); // Mặc định 2026-12-04T08:00:00
  let year = defaultTarget.getFullYear();
  let month = defaultTarget.getMonth();
  let day = defaultTarget.getDate();
  let hours = defaultTarget.getHours();
  let minutes = defaultTarget.getMinutes();

  // 1. Phân tích customDate (hỗ trợ DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY)
  // Google Sheets có thể trả về dạng "30/10/2026 00:00:00" — strip phần giờ thừa
  if (customDate && customDate.trim()) {
    const trimmedDate = customDate.trim().replace(/\s+\d{1,2}:\d{2}(:\d{2})?$/, "").trim();
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
    <section id="countdown" className="px-5 bg-emerald-950 text-ivory-50 relative overflow-hidden" style={{ paddingBlock: "var(--section-y)" }}>
      <div className="w-full max-w-2xl mx-auto text-center relative z-10">
        <SectionHeading eyebrow={t.countdown.eyebrow} title={t.countdown.title} onDark className="mb-10" />

        <Reveal className="grid grid-cols-4 gap-px bg-gold-500/30 border border-gold-500/30 rounded-2xl overflow-hidden">
          {timeUnits.map((unit) => (
            <div key={unit.label} className="bg-emerald-950 py-6 sm:py-9 px-1 flex flex-col items-center">
              <span
                className="font-serif text-4xl sm:text-6xl font-medium text-ivory-50 leading-none tabular-nums"
                aria-label={`${unit.value} ${unit.label}`}
              >
                {hasMounted ? String(unit.value).padStart(2, "0") : "00"}
              </span>
              <span className="eyebrow eyebrow-on-dark !text-[0.6rem] sm:!text-[0.7rem] mt-3 !tracking-[0.2em]">{unit.label}</span>
            </div>
          ))}
        </Reveal>

        <p className="font-serif italic text-lg text-gold-200 mt-8">
          {displayDateStr}
          <span className="mx-2 text-gold-500">·</span>
          {displayTimeStr}
        </p>
      </div>
    </section>
  );
};
