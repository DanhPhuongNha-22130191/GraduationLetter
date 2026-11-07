"use client";

import React from "react";
import Image from "next/image";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { uiCopy } from "@/config/ui-copy";
import { extrasCopy } from "@/config/extras";
import { Reveal, SectionHeading } from "@/components/animated-motifs";

export const JourneySection: React.FC = () => {
  const { t, lang } = useLanguage();
  const x = extrasCopy[lang];

  return (
    <section id="journey" className="px-5 bg-emerald-light/60 text-charcoal" style={{ paddingBlock: "var(--section-y)" }}>
      <div className="w-full max-w-2xl mx-auto">
        <SectionHeading eyebrow={t.journey.eyebrow} title={t.journey.title} />

        {/* Trường · Ngành */}
        <Reveal className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 text-center sm:text-left border-y border-gold-500/30 py-7 mb-14">
          <div className="relative w-20 h-20 shrink-0 rounded-full bg-white border border-gold-500/50 p-1.5 shadow-soft-sm">
            <Image
              src={graduationConfig.universityLogoUrl}
              alt={`Logo ${uiCopy[lang].profile.university}`}
              fill
              sizes="80px"
              className="object-contain p-1.5 rounded-full"
            />
          </div>
          <div>
            <p className="font-serif text-xl sm:text-2xl text-emerald-950 leading-snug">{uiCopy[lang].profile.university}</p>
            <p className="text-sm text-charcoal/75 mt-1">
              {uiCopy[lang].profile.faculty} · {t.hero.major} · {graduationConfig.classCode}
            </p>
            <p className="eyebrow mt-2">{graduationConfig.period}</p>
          </div>
        </Reveal>

        {/* Timeline dọc tối giản */}
        <ol className="relative ml-3 sm:ml-0 sm:pl-0 border-l border-gold-500/40 space-y-10">
          {t.journey.steps.map((item, idx) => (
            <li key={item.step} className="relative pl-8 sm:pl-10">
              <span
                aria-hidden="true"
                className="absolute -left-[5px] top-2 w-2.5 h-2.5 rotate-45 bg-emerald-light border border-gold-600"
              />
              <Reveal delay={idx * 0.08} y={16}>
                <p className="eyebrow">{item.period}</p>
                <h3 className="font-serif text-xl sm:text-2xl text-emerald-950 mt-1">{item.title}</h3>
                <p className="text-sm sm:text-[0.95rem] leading-relaxed text-charcoal/80 mt-2 max-w-md">{item.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <p className="eyebrow text-center mt-14 opacity-80">{x.journeyLead}</p>
      </div>
    </section>
  );
};
