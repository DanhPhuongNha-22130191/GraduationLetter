"use client";

import React, { useState } from "react";
import { Copy, Check, CalendarPlus, Navigation, Shirt } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { useGuest } from "@/context/guest-context";
import { formatLocalizedTime, formatLocalizedDate } from "@/config/i18n";
import { extrasCopy } from "@/config/extras";
import { Reveal, SectionHeading, GradCapIcon } from "@/components/animated-motifs";
import { parseCustomTargetDate } from "@/components/countdown";

const pad = (n: number) => String(n).padStart(2, "0");
const icsStamp = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const icsEscape = (s: string) => s.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

/** Tạo & tải file .ics (mở được bằng Apple/Google/Outlook Calendar). */
function downloadIcs(opts: { title: string; start: Date; end: Date; location: string; description: string }) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Graduation Invitation//VI",
    "BEGIN:VEVENT",
    `UID:${icsStamp(opts.start)}-${Math.random().toString(36).slice(2)}@graduation-invitation`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(opts.start)}`,
    `DTEND:${icsStamp(opts.end)}`,
    `SUMMARY:${icsEscape(opts.title)}`,
    `LOCATION:${icsEscape(opts.location)}`,
    `DESCRIPTION:${icsEscape(opts.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([lines], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "graduation.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface EventCardProps {
  index: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  dress: string;
  dressLabel: string;
  mapUrl?: string;
  directionsLabel: string;
  calendarLabel: string;
  onCalendar: () => void;
  copy?: { onClick: () => void; copied: boolean; label: string; copiedLabel: string };
}

const EventCard: React.FC<EventCardProps> = (p) => (
  <article className="diploma-frame px-6 py-8 sm:p-10 text-center flex flex-col h-full">

    <p className="eyebrow">{p.index}</p>
    <h3 className="font-serif text-2xl sm:text-[1.75rem] text-emerald-950 mt-2 mb-6 tracking-wide">{p.title}</h3>

    <dl className="space-y-4 text-sm flex-1">
      <div>
        <dt className="sr-only">Ngày</dt>
        <dd className="font-serif text-lg text-emerald-900">{p.date}</dd>
        <dd className="text-charcoal/75 mt-0.5 tabular-nums">{p.time}</dd>
      </div>
      <div className="w-8 h-px bg-gold-500/60 mx-auto" aria-hidden="true" />
      <div>
        <dt className="sr-only">Địa điểm</dt>
        <dd className="font-serif text-lg text-emerald-900 leading-snug">{p.venue}</dd>
        <dd className="text-charcoal/75 mt-1 leading-relaxed">{p.address}</dd>
        {p.copy && (
          <dd className="mt-2">
            <button
              type="button"
              onClick={p.copy.onClick}
              className="inline-flex items-center gap-1.5 text-xs text-gold-700 hover:text-emerald-900 transition-colors duration-500 ease-lux cursor-pointer"
              aria-label={p.copy.copied ? p.copy.copiedLabel : p.copy.label}
            >
              {p.copy.copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {p.copy.copied ? p.copy.copiedLabel : p.copy.label}
            </button>
          </dd>
        )}
      </div>
      <div className="w-8 h-px bg-gold-500/60 mx-auto" aria-hidden="true" />
      <div className="flex items-start justify-center gap-2.5 text-left max-w-xs mx-auto">
        <Shirt className="w-4 h-4 mt-0.5 shrink-0 text-gold-600" strokeWidth={1.5} aria-hidden="true" />
        <div>
          <dt className="eyebrow !text-[0.625rem]">{p.dressLabel}</dt>
          <dd className="text-charcoal/80 mt-1">{p.dress}</dd>
        </div>
      </div>
    </dl>

    <div className="mt-8 flex flex-col gap-3 justify-center sm:flex-row">
      {p.mapUrl && (
        <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-outline w-full sm:w-auto">
          <Navigation className="w-3.5 h-3.5" strokeWidth={1.75} />
          {p.directionsLabel}
        </a>
      )}
      <button type="button" onClick={p.onCalendar} className="btn-outline w-full sm:w-auto">
        <CalendarPlus className="w-3.5 h-3.5" strokeWidth={1.75} />
        {p.calendarLabel}
      </button>
    </div>
  </article>
);

export const GraduationInfoSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const { effectiveDate, effectiveTime } = useGuest();
  const [copied, setCopied] = useState(false);
  const x = extrasCopy[lang];

  const dateText = effectiveDate ? formatLocalizedDate(effectiveDate, lang) : t.details.dateVal;
  const timeText = effectiveTime ? formatLocalizedTime(effectiveTime, lang) : t.details.timeVal;

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(`${t.details.venueVal} - ${t.details.addressVal}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addCeremony = () => {
    const start = parseCustomTargetDate(effectiveDate, effectiveTime);
    const end = new Date(start.getTime() + 3.5 * 60 * 60 * 1000);
    downloadIcs({
      title: `${x.calendarCeremony} — ${graduationConfig.name}`,
      start,
      end,
      location: `${t.details.venueVal}, ${t.details.addressVal}`,
      description: `${graduationConfig.name} · ${graduationConfig.major}`,
    });
  };

  return (
    <section id="details" className="px-5 bg-ivory-100 relative" style={{ paddingBlock: "var(--section-y)" }}>
      <div className="max-w-4xl mx-auto">
        <SectionHeading
          eyebrow={t.details.eyebrow}
          title={t.details.title}
          icon={<GradCapIcon className="w-9 h-9" />}
        />

        <div className="max-w-xl mx-auto">
          <Reveal className="h-full">
            <EventCard
              index=""
              title={x.ceremony}
              date={dateText}
              time={timeText}
              venue={t.details.venueVal}
              address={t.details.addressVal}
              dress={x.dressCeremony}
              dressLabel={x.dressCode}
              mapUrl={graduationConfig.mapUrl}
              directionsLabel={x.directions}
              calendarLabel={x.addToCalendar}
              onCalendar={addCeremony}
              copy={{ onClick: handleCopyAddress, copied, label: t.details.copy, copiedLabel: t.details.copied }}
            />
          </Reveal>

        </div>
      </div>
    </section>
  );
};
