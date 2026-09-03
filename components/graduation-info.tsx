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
  const { customTime, customDate } = useGuest();
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
      value: customDate ? formatLocalizedDate(customDate, lang) : t.details.dateVal,
      highlight: Boolean(customDate),
    },
    {
      icon: Clock,
      label: t.details.time,
      value: customTime ? formatLocalizedTime(customTime, lang) : t.details.timeVal,
      highlight: Boolean(customTime),
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
    <section id="details" className="py-14 sm:py-20 px-4 max-w-3xl mx-auto relative z-10">
      <div className="text-center mb-8 sm:mb-12">
        <span className="text-xs font-sans uppercase tracking-[0.25em] text-gold-dark font-semibold">
          {t.details.eyebrow}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-emerald-deep font-bold mt-1">
          {t.details.title}
        </h2>
        <div className="w-16 h-0.5 bg-gold mx-auto mt-3" />
      </div>

      <div className="relative">
        <div className="absolute -inset-1 rounded-3xl bg-gold-gradient opacity-20 blur-sm" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-emerald-deep text-ivory rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gold/40 shadow-xl space-y-4"
        >
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all flex items-start justify-between gap-3 ${
                  item.highlight
                    ? "bg-gold/15 border border-gold/40 shadow-xs"
                    : "bg-white/5 border border-white/10 hover:border-gold/30 hover:bg-white/8"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1">
                  <div className={`p-2.5 rounded-xl shrink-0 ${item.highlight ? "bg-gold text-emerald-deep" : "bg-gold/20 text-gold"}`}>
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <span className="block text-[11px] sm:text-xs font-sans text-gold-light uppercase tracking-wider font-semibold">
                      {item.label}
                    </span>
                    <span className={`block font-serif text-sm sm:text-base ${item.highlight ? "font-bold text-gold-light text-base sm:text-lg" : "text-ivory"}`}>
                      {item.value}
                    </span>
                    {item.subValue && (
                      <span className="block text-xs font-sans text-ivory/70 mt-0.5">
                        {item.subValue}
                      </span>
                    )}
                  </div>
                </div>

                {item.copyable && (
                  <button
                    onClick={handleCopyAddress}
                    title="Copy address"
                    className="p-2.5 rounded-xl bg-gold/15 hover:bg-gold/30 text-gold text-xs transition-colors shrink-0 flex items-center gap-1.5 active:scale-95 touch-manipulation border border-gold/30"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline font-sans font-medium">{copied ? t.details.copied : t.details.copy}</span>
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
