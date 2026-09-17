"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, BookOpen, Calendar as CalendarIcon, Clock, MapPin, Copy, Check } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { useGuest } from "@/context/guest-context";
import { formatLocalizedTime, formatLocalizedDate } from "@/config/i18n";

export const GraduationInfoSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const { effectiveDate, effectiveTime, hasCustomDate, hasCustomTime } = useGuest();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (!graduationConfig.address) return;
    navigator.clipboard.writeText(`${t.details.venueVal} - ${t.details.addressVal}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const items = [
    {
      icon: User,
      label: t.details.graduate,
      value: graduationConfig.name,
      highlight: true,
    },
    {
      icon: BookOpen,
      label: t.details.major,
      value: `${graduationConfig.major} — Lớp ${graduationConfig.classCode}`,
    },
    {
      icon: CalendarIcon,
      label: t.details.date,
      value: effectiveDate ? formatLocalizedDate(effectiveDate, lang) : t.details.dateVal,
      highlight: hasCustomDate,
    },
    {
      icon: Clock,
      label: t.details.time,
      value: effectiveTime ? formatLocalizedTime(effectiveTime, lang) : t.details.timeVal,
      highlight: hasCustomTime,
    },
    {
      icon: MapPin,
      label: t.details.venue,
      value: t.details.venueVal,
      subValue: t.details.addressVal,
      copyable: true,
    },
  ];

  return (
    <section id="details" className="py-16 sm:py-24 px-4 bg-ivory-100 relative z-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <span className="text-xs font-sans uppercase tracking-[0.25em] text-gold-700 font-semibold">
            {t.details.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-emerald-950 font-bold mt-1">
            {t.details.title}
          </h2>
          <div className="w-12 h-0.5 bg-gold-500 mx-auto mt-3" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gold-500/25 shadow-soft-lg space-y-3.5 backdrop-blur-xs"
        >
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all flex items-start justify-between gap-3 ${
                  item.highlight
                    ? "bg-gold-500/10 border border-gold-500/35 shadow-soft-xs"
                    : "bg-ivory-50/80 border border-gold-500/15 hover:border-gold-500/30"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                  <div className={`p-2.5 rounded-xl shrink-0 ${item.highlight ? "bg-gold-gradient text-emerald-950 shadow-soft-xs" : "bg-emerald-900/10 text-emerald-900"}`}>
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="block text-[11px] sm:text-xs font-sans text-gold-700 uppercase tracking-wider font-semibold">
                      {item.label}
                    </span>
                    <span className={`block font-serif text-sm sm:text-base ${item.highlight ? "font-bold text-emerald-950 text-base sm:text-lg" : "text-charcoal"}`}>
                      {item.value}
                    </span>
                    {item.subValue && (
                      <span className="block text-xs font-sans text-charcoal/70 mt-0.5">
                        {item.subValue}
                      </span>
                    )}
                  </div>
                </div>

                {item.copyable && (
                  <button
                    onClick={handleCopyAddress}
                    title="Copy address"
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 text-gold-700 text-xs transition-colors shrink-0 flex items-center gap-1.5 active:scale-95 touch-manipulation border border-gold-500/30 cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline font-sans font-semibold">{copied ? t.details.copied : t.details.copy}</span>
                  </button>
                )}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
