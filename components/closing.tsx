"use client";

import React, { useState } from "react";
import { Phone, Mail, Share2, Check, ArrowUp, Copy } from "lucide-react";
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

  const [copiedField, setCopiedField] = useState<"phone" | "email" | null>(null);
  const handleCopy = async (field: "phone" | "email", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <p className="eyebrow eyebrow-on-dark">{x.contact}</p>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-1">
            <a
              href={`tel:${graduationConfig.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-2.5 font-serif text-xl sm:text-2xl text-ivory-50 hover:text-gold-200 transition-colors"
            >
              <Phone className="w-4 h-4 text-gold-500 shrink-0" strokeWidth={1.5} />
              <span>{graduationConfig.phone}</span>
            </a>
            <button
              type="button"
              onClick={() => handleCopy("phone", graduationConfig.phone)}
              aria-label="Copy"
              className="p-1.5 text-gold-500/70 hover:text-gold-200 transition-colors"
            >
              {copiedField === "phone" ? <Check className="w-4 h-4" strokeWidth={1.75} /> : <Copy className="w-4 h-4" strokeWidth={1.5} />}
            </button>
            </div>
            <div className="flex items-center gap-1">
            <a
              href={`mailto:${graduationConfig.email}`}
              className="inline-flex items-center gap-2.5 font-serif text-base sm:text-xl text-ivory-50 hover:text-gold-200 transition-colors break-all"
            >
              <Mail className="w-4 h-4 text-gold-500 shrink-0" strokeWidth={1.5} />
              <span>{graduationConfig.email}</span>
            </a>
            <button
              type="button"
              onClick={() => handleCopy("email", graduationConfig.email)}
              aria-label="Copy"
              className="p-1.5 text-gold-500/70 hover:text-gold-200 transition-colors shrink-0"
            >
              {copiedField === "email" ? <Check className="w-4 h-4" strokeWidth={1.75} /> : <Copy className="w-4 h-4" strokeWidth={1.5} />}
            </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-[0.7rem] tracking-[0.25em] uppercase">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 text-gold-200 hover:text-gold-500 transition-colors border-b border-gold-500/40 pb-1"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Share2 className="w-3.5 h-3.5" strokeWidth={1.75} />}
              <span>{copiedLink ? u.linkCopied : u.share}</span>
            </button>
            {onReopenEnvelope && (
              <>
                <span className="text-gold-500/50" aria-hidden>◆</span>
                <button
                  type="button"
                  onClick={onReopenEnvelope}
                  className="inline-flex items-center gap-2 text-ivory-100/70 hover:text-gold-200 transition-colors border-b border-ivory-100/20 pb-1"
                >
                  <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>{t.nav.backToEnvelope}</span>
                </button>
              </>
            )}
          </div>
        </Reveal>

        <p className="text-center text-[0.65rem] sm:text-[0.7rem] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-ivory-100/50 mt-14 pb-24 sm:pb-0 text-balance flex flex-col sm:block items-center gap-1">
          <span>{uiCopy[lang].profile.university}</span>
          <span className="hidden sm:inline"> · </span>
          <span>{x.classOf} {graduationConfig.year}</span>
        </p>
      </div>
    </footer>
  );
};
