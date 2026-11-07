"use client";

import React, { useState } from "react";
import { Phone, Mail, Share2, Check, ArrowUp } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { uiCopy } from "@/config/ui-copy";
import { extras, extrasCopy } from "@/config/extras";
import {
  Reveal,
  SectionHeading,
  AnimatedFlourishDivider,
  SealCrest,
  WheatBranch,
} from "@/components/animated-motifs";

interface ClosingSectionProps {
  onReopenEnvelope?: () => void;
}

export const ClosingSection: React.FC<ClosingSectionProps> = ({ onReopenEnvelope }) => {
  const { t, lang } = useLanguage();
  const x = extrasCopy[lang];
  const u = uiCopy[lang].closing;
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: u.shareTitle(graduationConfig.name),
          text: u.shareText(graduationConfig.name),
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to copy link
      }
    }
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const thanks = [
    { title: x.thanksFamily, text: x.thanksFamilyText },
    { title: x.thanksTeachers, text: x.thanksTeachersText },
    { title: x.thanksFriends, text: x.thanksFriendsText },
  ];

  return (
    <footer id="closing" className="relative bg-emerald-950 text-ivory-50 px-5 overflow-hidden" style={{ paddingBlock: "var(--section-y)" }}>
      <div className="w-full max-w-3xl mx-auto relative z-10">
        {/* Lời cảm ơn */}
        <SectionHeading eyebrow={x.thanksEyebrow} title={t.closing.thankYou} onDark />

        <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 text-center mb-6">
          {thanks.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1} y={16}>
              <h3 className="font-serif text-xl text-gold-200 mb-3 tracking-wide">{item.title}</h3>
              <p className="text-sm leading-relaxed text-ivory-100/80">{item.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mt-14">
          <p className="font-serif italic text-lg sm:text-xl text-ivory-100/90 leading-relaxed max-w-lg mx-auto">
            &ldquo;{t.closing.message}&rdquo;
          </p>
        </Reveal>

        {/* Chữ ký + hashtag */}
        <Reveal className="text-center mt-16 relative">
          <WheatBranch className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 w-12 h-24 text-gold-500/40" />
          <WheatBranch flip className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 w-12 h-24 text-gold-500/40" />
          <SealCrest className="w-16 h-16 mx-auto text-gold-500 mb-4" label={graduationConfig.year} />
          <p className="font-serif italic font-medium text-5xl sm:text-6xl text-ivory-50">{graduationConfig.name}</p>
          <p className="eyebrow eyebrow-on-dark mt-3">{t.closing.periodLabel}</p>
          <p className="font-serif text-lg tracking-[0.2em] text-gold-200 mt-4">{extras.hashtag}</p>
        </Reveal>

        <AnimatedFlourishDivider className="my-10" />

        {/* Liên hệ */}
        <Reveal className="flex flex-col items-center gap-5">
          <p className="eyebrow eyebrow-on-dark">{x.contact}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href={`tel:${graduationConfig.phone.replace(/\s+/g, "")}`} className="btn-outline btn-outline-on-dark !normal-case !tracking-wide">
              <Phone className="w-3.5 h-3.5" strokeWidth={1.75} />
              {graduationConfig.phone}
            </a>
            <a href={`mailto:${graduationConfig.email}`} className="btn-outline btn-outline-on-dark !normal-case !tracking-wide">
              <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />
              {graduationConfig.email}
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <button type="button" onClick={handleShare} className="btn-gold">
              {copiedLink ? <Check className="w-4 h-4" strokeWidth={1.75} /> : <Share2 className="w-4 h-4" strokeWidth={1.75} />}
              <span>{copiedLink ? u.linkCopied : u.share}</span>
            </button>
            {onReopenEnvelope && (
              <button type="button" onClick={onReopenEnvelope} className="btn-outline btn-outline-on-dark">
                <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>{t.nav.backToEnvelope}</span>
              </button>
            )}
          </div>
        </Reveal>

        <p className="text-center text-[0.7rem] tracking-[0.2em] uppercase text-ivory-100/50 mt-14">
          {uiCopy[lang].profile.university} · {x.classOf} {graduationConfig.year}
        </p>
      </div>
    </footer>
  );
};
