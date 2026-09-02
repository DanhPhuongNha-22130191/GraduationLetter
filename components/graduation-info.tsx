"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, BookOpen, Calendar, Clock, MapPin, Copy, Check } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";

export const GraduationInfoSection: React.FC = () => {
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

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
      value: graduationConfig.major,
      highlight: false,
    },
    {
      icon: Calendar,
      label: t.details.date,
      value: t.details.dateVal,
      highlight: false,
    },
    {
      icon: Clock,
      label: t.details.time,
      value: t.details.timeVal,
      highlight: false,
    },
    {
      icon: MapPin,
      label: t.details.venue,
      value: t.details.venueVal,
      subValue: t.details.addressVal,
      highlight: false,
      isAddress: true,
    },
  ];

  return (
    <section id="details" className="relative py-16 sm:py-24 px-4 bg-emerald-deep text-ivory">
      <div className="w-full max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <span className="text-gold font-sans text-xs uppercase tracking-[0.3em] font-semibold block mb-2">
            {t.details.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ivory">
            {t.details.title}
          </h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-3" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-emerald-main/60 border border-gold/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6"
        >
          {items.map((item, index) => {
            const IconComp = item.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 pb-4 border-b border-gold/15 last:border-0 last:pb-0"
              >
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold shrink-0 mt-0.5">
                  <IconComp className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-sans uppercase tracking-widest text-gold/90 font-medium block">
                    {item.label}
                  </span>
                  <p className={`text-base sm:text-lg font-serif font-semibold mt-0.5 ${item.highlight ? "text-gold-light" : "text-ivory"}`}>
                    {item.value}
                  </p>
                  {item.subValue && (
                    <p className="text-xs font-sans text-ivory/80 mt-1 leading-relaxed">
                      {item.subValue}
                    </p>
                  )}
                </div>

                {item.isAddress && (
                  <button
                    onClick={handleCopyAddress}
                    title="Copy address"
                    className="p-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold text-xs transition-colors shrink-0 flex items-center gap-1 active:scale-95 touch-manipulation"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copied ? t.details.copied : t.details.copy}</span>
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
