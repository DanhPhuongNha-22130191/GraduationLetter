"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeartHandshake, Sparkles } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { useGuest } from "@/context/guest-context";
import { AnimatedFlourishDivider, RotatingBotanicalCrest } from "@/components/animated-motifs";

export const InvitationSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const { guestName, hasCustomGuest, isFormal, getGreetingPrefix } = useGuest();

  return (
    <section id="invitation" className="relative py-16 sm:py-24 px-4 bg-ivory text-emerald-deep flex justify-center overflow-hidden">
      {/* Background Decorative Gold Light Glow */}
      <div className="absolute inset-0 gold-radial-glow opacity-30 pointer-events-none" />

      {/* Continuous Animated Rotating Botanical Wreaths in Background */}
      <div className="absolute -top-12 -right-12 sm:-top-16 sm:-right-16 pointer-events-none opacity-25">
        <RotatingBotanicalCrest className="w-56 h-56 sm:w-80 sm:h-80 text-gold animate-spin-slow" />
      </div>
      <div className="absolute -bottom-12 -left-12 sm:-bottom-16 sm:-left-16 pointer-events-none opacity-25">
        <RotatingBotanicalCrest className="w-56 h-56 sm:w-80 sm:h-80 text-gold animate-spin-slow" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="relative glass-gold-card rounded-3xl p-6 sm:p-10 border-2 border-gold/40 shadow-2xl text-center overflow-hidden"
        >
          {/* Subtle Paper Texture */}
          <div className="absolute inset-0 paper-texture opacity-40 pointer-events-none" />
          
          {/* Dual Gold Inner Dashed Line with Shimmer */}
          <div className="absolute inset-3 rounded-2xl border border-gold/35 pointer-events-none" />
          <div className="absolute inset-5 rounded-xl border border-gold/40 border-dashed pointer-events-none opacity-50" />

          {/* Floating animated sparkles inside card corners */}
          <div className="absolute top-4 left-4 text-gold opacity-70 animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="absolute top-4 right-4 text-gold opacity-70 animate-pulse" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-4 h-4" />
          </div>

          {/* Animated Heart Handshake Icon Seal with Pulsing Halo */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute w-16 h-16 rounded-full bg-gold/20 animate-ping opacity-40" />
            <div className="relative w-13 h-13 rounded-full bg-gold-gradient text-emerald-deep flex items-center justify-center border-2 border-ivory shadow-gold-glow animate-float-slow">
              <HeartHandshake className="w-7 h-7 stroke-[2]" />
            </div>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-emerald-deep uppercase mb-2 drop-shadow-xs">
            {t.invitation.title}
          </h2>

          <AnimatedFlourishDivider className="my-4" />

          {/* Personalized Guest Recipient Plaque - Only shown when a specific guest is invited */}
          {hasCustomGuest && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="my-5 py-3.5 px-6 rounded-2xl bg-gold/15 border-2 border-gold/45 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-1 left-2 text-gold/40 font-serif text-2xl select-none pointer-events-none">❧</div>
              <div className="absolute top-1 right-2 text-gold/40 font-serif text-2xl select-none pointer-events-none">☙</div>
              <span className="block text-[11px] sm:text-xs font-sans uppercase tracking-[0.25em] text-gold-dark font-bold mb-1">
                ✦ {getGreetingPrefix().toUpperCase()} ✦
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-deep italic drop-shadow-xs">
                {guestName}
              </h3>
            </motion.div>
          )}

          {/* Graceful Script/Serif Italic Typography */}
          <div className="space-y-5 text-base sm:text-lg md:text-xl text-emerald-deep/95 leading-loose font-serif italic font-normal px-2 sm:px-4 tracking-wide relative z-10">
            <p className="first-letter:text-3xl sm:first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-gold-dark first-letter:mr-1">
              {t.invitation.para1}
            </p>
            <p>
              {hasCustomGuest ? (
                lang === "vi" ? (
                  isFormal ? (
                    <>
                      Với tất cả niềm vui và lòng biết ơn sâu sắc, con kính mời{" "}
                      <strong className="text-gold-dark font-bold not-italic underline decoration-gold/60 underline-offset-4">
                        {guestName}
                      </strong>{" "}
                      đến chung vui và cùng lưu lại những khoảnh khắc ý nghĩa nhất trong ngày đặc biệt này.
                    </>
                  ) : (
                    <>
                      Với tất cả niềm vui và sự biết ơn, Nhã thân mời{" "}
                      <strong className="text-gold-dark font-bold not-italic underline decoration-gold/60 underline-offset-4">
                        {guestName}
                      </strong>{" "}
                      đến chung vui và cùng lưu lại những khoảnh khắc ý nghĩa nhất trong ngày đặc biệt này.
                    </>
                  )
                ) : lang === "en" ? (
                  <>
                    With immense joy and gratitude, Nha warmly invites{" "}
                    <strong className="text-gold-dark font-bold not-italic underline decoration-gold/60 underline-offset-4">
                      {guestName}
                    </strong>{" "}
                    to join and celebrate this momentous milestone together.
                  </>
                ) : (
                  <>
                    ដោយក្តីរីករាយ និងការដឹងគុណ ខ្ញុំបាទសូមគោរពអញ្ជើញ{" "}
                    <strong className="text-gold-dark font-bold not-italic underline decoration-gold/60 underline-offset-4">
                      {guestName}
                    </strong>{" "}
                    មកចូលរួមអបអរសាទរក្នុងថ្ងៃដ៏ពិសេសនេះ។
                  </>
                )
              ) : (
                t.invitation.para2
              )}
            </p>
          </div>

          {/* Calligraphic Signature with Gold Glow */}
          <div className="mt-8 pt-6 border-t border-gold/30 flex flex-col items-center relative z-10">
            <motion.span
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="font-serif italic font-normal text-gold-dark text-2xl sm:text-3xl tracking-wide drop-shadow-xs"
            >
              {graduationConfig.name}
            </motion.span>
            <span className="text-[11px] font-sans text-emerald-deep/80 font-bold uppercase tracking-[0.25em] mt-1">
              IT • CLASS OF {graduationConfig.year}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
