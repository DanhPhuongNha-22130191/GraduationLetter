"use client";

import React from "react";
import { MapPin, Navigation } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { extrasCopy } from "@/config/extras";
import { Reveal, SectionHeading } from "@/components/animated-motifs";

export const LocationSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const x = extrasCopy[lang];

  const embedMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.485189704256!2d106.7876878758686!3d10.850654089302636!2m3!10f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276398969f7b%3A0x629555c45e5d1645!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBOw7RuZyBMw6JtIFRQLiBI4buTIENow60gTWluaA!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s";

  return (
    <section id="location" className="px-5 bg-ivory-50 text-charcoal" style={{ paddingBlock: "var(--section-y)" }}>
      <div className="w-full max-w-3xl mx-auto">
        <SectionHeading
          eyebrow={t.location.eyebrow}
          title={t.location.title}
          icon={<MapPin className="w-7 h-7" strokeWidth={1.25} />}
        />

        <Reveal>
          <div className="diploma-frame p-3 sm:p-4">
            <div className="aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden bg-ivory-200">
              <iframe
                title={`${t.location.title}: ${t.details.venueVal}`}
                src={embedMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "saturate(0.75) contrast(1.02)" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="font-serif text-xl text-emerald-950">{t.details.venueVal}</p>
            <p className="text-sm text-charcoal/75 mt-1">{t.details.addressVal}</p>
            {graduationConfig.mapUrl && (
              <a
                href={graduationConfig.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold mt-7"
              >
                <Navigation className="w-4 h-4" strokeWidth={1.75} />
                <span>{t.location.viewMap || x.directions}</span>
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};
