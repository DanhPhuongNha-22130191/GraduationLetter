"use client";

import React from "react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { useGuest } from "@/context/guest-context";
import { extrasCopy } from "@/config/extras";
import { Reveal, SectionHeading, AnimatedFlourishDivider, DiplomaScrollIcon } from "@/components/animated-motifs";

type Mode = "elder" | "senior" | "junior" | string;

/** Cách xưng hô theo từng nhóm khách (giữ nguyên nội dung cũ, gom lại thành bảng tra). */
const PARA1_SUBJECT: Record<string, Record<string, string>> = {
  vi: { elder: "con", senior: "em", junior: "anh", default: "mình" },
};

const PARA2: Record<string, { lead: Record<string, string>; tail: string }> = {
  vi: {
    lead: {
      elder: "Với tất cả niềm vui và lòng biết ơn sâu sắc, con kính mời",
      senior: "Với tất cả niềm vui và sự biết ơn, em thân ái mời",
      junior: "Với tất cả niềm vui và sự biết ơn, anh mời",
      default: "Với tất cả niềm vui và sự biết ơn, Nhã thân mời",
    },
    tail: "đến chung vui và cùng lưu lại những khoảnh khắc ý nghĩa nhất trong ngày đặc biệt này.",
  },
  en: {
    lead: {
      elder: "With profound joy and heartfelt respect, Nha respectfully invites",
      senior: "With great joy and warm regards, Nha cordially invites",
      default: "With immense joy and gratitude, Nha warmly invites",
    },
    tail: "to join and celebrate this momentous milestone together.",
  },
  km: {
    lead: {
      elder: "ដោយក្តីរីករាយ និងការដឹងគុណយ៉ាងជ្រាលជ្រៅ ខ្ញុំបាទសូមគោរពអញ្ជើញ",
      senior: "ដោយក្តីរីករាយ និងការដឹងគុណ ខ្ញុំបាទសូមអញ្ជើញដោយរាប់អាន",
      default: "ដោយក្តីរីករាយ និងការដឹងគុណ ខ្ញុំបាទសូមគោរពអញ្ជើញ",
    },
    tail: "មកចូលរួមអបអរសាទរក្នុងថ្ងៃដ៏ពិសេសនេះ។",
  },
};

export const InvitationSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const { guestName, hasCustomGuest, pronounMode, customMessage, getGreetingPrefix } = useGuest();
  const x = extrasCopy[lang];

  const mode: Mode = pronounMode ?? "default";

  const para1 =
    lang === "vi" && hasCustomGuest
      ? `Sau những năm tháng học tập, nỗ lực và trưởng thành tại Trường Đại học Nông Lâm TP.HCM, ${
          PARA1_SUBJECT.vi[mode] ?? PARA1_SUBJECT.vi.default
        } Danh Phương Nhã đã chính thức hoàn thành hành trình đại học ngành Công nghệ thông tin (Lớp DH22DTB).`
      : t.invitation.para1;

  const p2 = PARA2[lang];
  const para2 =
    hasCustomGuest && p2 ? (
      <>
        {p2.lead[mode] ?? p2.lead.default}{" "}
        <strong className="font-semibold text-emerald-900 border-b border-gold-500/60">{guestName}</strong> {p2.tail}
      </>
    ) : (
      t.invitation.para2
    );

  return (
    <section id="invitation" className="relative px-5 bg-ivory-100 text-charcoal" style={{ paddingBlock: "var(--section-y)" }}>
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Quote ngắn về hành trình */}
        <Reveal className="mb-16 sm:mb-24">
          <DiplomaScrollIcon className="w-11 h-11 mx-auto text-gold-600 mb-6" />
          <blockquote className="font-serif italic text-[1.35rem] sm:text-3xl leading-relaxed text-emerald-900 max-w-xl mx-auto">
            &ldquo;{x.quote}&rdquo;
          </blockquote>
          <p className="eyebrow mt-6">{x.quoteBy}</p>
        </Reveal>

        <SectionHeading title={t.invitation.title} />

        {hasCustomGuest && (
          <Reveal className="my-8">
            <p className="eyebrow mb-2">{getGreetingPrefix(lang)}</p>
            <h3 className="font-serif italic text-3xl sm:text-4xl text-emerald-950 break-words overflow-wrap-anywhere">
              {guestName}
            </h3>
          </Reveal>
        )}

        <Reveal delay={0.1} className="space-y-6 font-serif font-medium text-lg sm:text-xl leading-[1.85] text-charcoal/90 max-w-xl mx-auto">
          <p>{para1}</p>
          <p>{para2}</p>
        </Reveal>

        {customMessage && (
          <Reveal className="mt-10 max-w-md mx-auto border-l-2 border-gold-500 pl-5 text-left">
            <p className="eyebrow mb-2">Đôi lời gửi gắm riêng đến {guestName}</p>
            <p className="font-serif italic text-lg leading-relaxed text-charcoal">&ldquo;{customMessage}&rdquo;</p>
          </Reveal>
        )}

        <Reveal className="mt-14">
          <AnimatedFlourishDivider className="mb-5" />
          <p className="font-serif italic font-medium text-4xl sm:text-5xl text-gold-700">{graduationConfig.name}</p>
          <p className="eyebrow mt-2">
            IT · {x.classOf} {graduationConfig.year}
          </p>
        </Reveal>
      </div>
    </section>
  );
};
