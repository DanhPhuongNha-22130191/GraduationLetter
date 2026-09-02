"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, BookOpen, Calendar as CalendarIcon, Clock, MapPin, Copy, Check, CalendarPlus, ExternalLink } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";

export const GraduationInfoSection: React.FC = () => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (!graduationConfig.address) return;
    navigator.clipboard.writeText(`${t.details.venueVal} - ${t.details.addressVal}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToGoogleCalendar = () => {
    const title = encodeURIComponent(`Lễ Tốt Nghiệp — ${graduationConfig.name}`);
    const details = encodeURIComponent(`Lễ tốt nghiệp ngành Công nghệ thông tin của ${graduationConfig.name}.\nĐịa điểm: ${t.details.venueVal}\nHotline: ${graduationConfig.phone}`);
    const location = encodeURIComponent(`${t.details.venueVal}, ${t.details.addressVal}`);
    
    // ISO start/end format YYYYMMDDTHHMMSSZ
    const startTime = "20261021T010000Z"; // 8:00 AM UTC+7 = 01:00 AM UTC
    const endTime = "20261021T043000Z";   // 11:30 AM UTC+7 = 04:30 AM UTC

    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
    window.open(googleCalUrl, "_blank");
  };

  const handleDownloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Graduation Invitation//Danh Phuong Nha//EN
BEGIN:VEVENT
SUMMARY:Lễ Tốt Nghiệp — ${graduationConfig.name}
DESCRIPTION:Lễ Tốt Nghiệp ngành Công nghệ thông tin Lớp DH22DTB
LOCATION:${t.details.venueVal}, ${t.details.addressVal}
DTSTART:20261021T010000Z
DTEND:20261021T043000Z
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `Le-Tot-Nghiep-${graduationConfig.name.replace(/\s+/g, "-")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      value: `${graduationConfig.major} (${graduationConfig.classCode})`,
      highlight: false,
    },
    {
      icon: CalendarIcon,
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
    <section id="details" className="relative py-16 sm:py-24 px-4 bg-emerald-deep text-ivory overflow-hidden">
      {/* Background Decorative Gold Light Glow */}
      <div className="absolute inset-0 gold-radial-glow opacity-35 pointer-events-none" />
      <div className="absolute inset-0 paper-texture opacity-30 pointer-events-none" />

      <div className="w-full max-w-lg mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <span className="text-gold font-sans text-xs uppercase tracking-[0.35em] font-semibold block mb-2">
            {t.details.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ivory drop-shadow-md">
            {t.details.title}
          </h2>
          <div className="w-16 h-0.5 bg-gold-gradient mx-auto mt-3 rounded-full" />
        </motion.div>

        {/* Main Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-emerald-card rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Inner Accent Line */}
          <div className="absolute inset-2.5 rounded-2xl border border-gold/25 pointer-events-none" />

          {items.map((item, index) => {
            const IconComp = item.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 pb-4 border-b border-gold/15 last:border-0 last:pb-0 relative z-10"
              >
                <div className="w-11 h-11 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shrink-0 mt-0.5 shadow-sm">
                  <IconComp className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-gold font-bold block">
                    {item.label}
                  </span>
                  <p className={`text-base sm:text-lg font-serif font-semibold mt-0.5 ${item.highlight ? "text-gold-light text-xl" : "text-ivory"}`}>
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
                    className="p-2.5 rounded-xl bg-gold/15 hover:bg-gold/30 text-gold text-xs transition-colors shrink-0 flex items-center gap-1.5 active:scale-95 touch-manipulation border border-gold/30"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline font-sans font-medium">{copied ? t.details.copied : t.details.copy}</span>
                  </button>
                )}
              </div>
            );
          })}

          {/* Quick Action: Add to Calendar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleAddToGoogleCalendar}
              className="w-full py-3 px-4 rounded-xl bg-gold-gradient text-emerald-deep font-sans font-bold text-xs tracking-wider uppercase shadow-gold-glow flex items-center justify-center gap-2 hover:brightness-110 transition-all border border-ivory/40 active:scale-98 touch-manipulation"
            >
              <CalendarPlus className="w-4 h-4 stroke-[2]" />
              <span>Google Calendar</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDownloadIcs}
              className="w-full py-3 px-4 rounded-xl bg-emerald-deep/80 text-ivory border border-gold/40 font-sans font-semibold text-xs tracking-wider uppercase hover:bg-gold/20 transition-all flex items-center justify-center gap-2 active:scale-98 touch-manipulation"
            >
              <CalendarIcon className="w-4 h-4 text-gold" />
              <span>Lưu Lịch Apple/ICS</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
