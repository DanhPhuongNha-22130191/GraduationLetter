"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeartHandshake, Sparkles } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { useGuest } from "@/context/guest-context";
import { AnimatedFlourishDivider } from "@/components/animated-motifs";

export const InvitationSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const { guestName, hasCustomGuest, pronounMode, customMessage, getGreetingPrefix } = useGuest();

  return (
    <section id="invitation" className="relative py-16 sm:py-24 px-4 bg-ivory-100 text-charcoal flex justify-center overflow-hidden">
      {/* Background Subtle Radial Amber Glow */}
      <div className="absolute inset-0 bg-radial from-gold-500/10 via-transparent to-transparent opacity-40 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="relative glass-gold-card bg-white/95 rounded-3xl p-6 sm:p-10 border border-gold-500/25 shadow-soft-xl text-center overflow-hidden"
        >
          {/* Subtle Paper Texture */}
          <div className="absolute inset-0 paper-texture opacity-30 pointer-events-none" />
          
          {/* Single clean hairline border */}
          <div className="absolute inset-2.5 rounded-2xl border border-gold-500/15 pointer-events-none" />

          {/* Heart Handshake Icon Seal */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gold-gradient text-emerald-950 flex items-center justify-center border-2 border-ivory-50 shadow-soft-md">
              <HeartHandshake className="w-6 h-6 stroke-[2]" />
            </div>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-emerald-950 uppercase mb-2">
            {t.invitation.title}
          </h2>

          <AnimatedFlourishDivider className="my-3 text-gold-600" />

          {/* Personalized Guest Recipient Plaque - Only shown when a specific guest is invited */}
          {hasCustomGuest && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="my-5 py-3.5 px-4 sm:px-6 rounded-2xl bg-gold-500/10 border border-gold-500/30 relative overflow-hidden"
            >
              <span className="block text-[11px] sm:text-xs font-sans uppercase tracking-[0.2em] text-gold-700 font-semibold mb-1">
                ✦ {getGreetingPrefix(lang).toUpperCase()} ✦
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-950 italic break-words overflow-wrap-anywhere">
                {guestName}
              </h3>
            </motion.div>
          )}

          {/* Graceful Legible Typography */}
          <div className="space-y-5 text-base sm:text-lg text-charcoal/90 leading-relaxed font-serif px-2 sm:px-4 tracking-normal relative z-10 text-center max-w-xl mx-auto">
            <p className="first-letter:text-3xl sm:first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-gold-700 first-letter:mr-1">
              {lang === "vi" ? (
                hasCustomGuest ? (
                  pronounMode === "elder" ? (
                    `Sau những năm tháng học tập, nỗ lực và trưởng thành tại Trường Đại học Nông Lâm TP.HCM, con Danh Phương Nhã đã chính thức hoàn thành hành trình đại học ngành Công nghệ thông tin (Lớp DH22DTB).`
                  ) : pronounMode === "senior" ? (
                    `Sau những năm tháng học tập, nỗ lực và trưởng thành tại Trường Đại học Nông Lâm TP.HCM, em Danh Phương Nhã đã chính thức hoàn thành hành trình đại học ngành Công nghệ thông tin (Lớp DH22DTB).`
                  ) : pronounMode === "junior" ? (
                    `Sau những năm tháng học tập, nỗ lực và trưởng thành tại Trường Đại học Nông Lâm TP.HCM, anh Danh Phương Nhã đã chính thức hoàn thành hành trình đại học ngành Công nghệ thông tin (Lớp DH22DTB).`
                  ) : (
                    `Sau những năm tháng học tập, nỗ lực và trưởng thành tại Trường Đại học Nông Lâm TP.HCM, mình Danh Phương Nhã đã chính thức hoàn thành hành trình đại học ngành Công nghệ thông tin (Lớp DH22DTB).`
                  )
                ) : (
                  t.invitation.para1
                )
              ) : (
                t.invitation.para1
              )}
            </p>
            <p>
              {hasCustomGuest ? (
                lang === "vi" ? (
                  pronounMode === "elder" ? (
                    <>
                      Với tất cả niềm vui và lòng biết ơn sâu sắc, con kính mời{" "}
                      <strong className="text-gold-700 font-semibold underline decoration-gold-500/50 underline-offset-4">
                        {guestName}
                      </strong>{" "}
                      đến chung vui và cùng lưu lại những khoảnh khắc ý nghĩa nhất trong ngày đặc biệt này.
                    </>
                  ) : pronounMode === "senior" ? (
                    <>
                      Với tất cả niềm vui và sự biết ơn, em thân ái mời{" "}
                      <strong className="text-gold-700 font-semibold underline decoration-gold-500/50 underline-offset-4">
                        {guestName}
                      </strong>{" "}
                      đến chung vui và cùng lưu lại những khoảnh khắc ý nghĩa nhất trong ngày đặc biệt này.
                    </>
                  ) : pronounMode === "junior" ? (
                    <>
                      Với tất cả niềm vui và sự biết ơn, anh mời{" "}
                      <strong className="text-gold-700 font-semibold underline decoration-gold-500/50 underline-offset-4">
                        {guestName}
                      </strong>{" "}
                      đến chung vui và cùng lưu lại những khoảnh khắc ý nghĩa nhất trong ngày đặc biệt này.
                    </>
                  ) : (
                    <>
                      Với tất cả niềm vui và sự biết ơn, Nhã thân mời{" "}
                      <strong className="text-gold-700 font-semibold underline decoration-gold-500/50 underline-offset-4">
                        {guestName}
                      </strong>{" "}
                      đến chung vui và cùng lưu lại những khoảnh khắc ý nghĩa nhất trong ngày đặc biệt này.
                    </>
                  )
                ) : lang === "en" ? (
                  pronounMode === "elder" ? (
                    <>
                      With profound joy and heartfelt respect, Nha respectfully invites{" "}
                      <strong className="text-gold-700 font-semibold underline decoration-gold-500/50 underline-offset-4">
                        {guestName}
                      </strong>{" "}
                      to join and celebrate this momentous milestone together.
                    </>
                  ) : pronounMode === "senior" ? (
                    <>
                      With great joy and warm regards, Nha cordially invites{" "}
                      <strong className="text-gold-700 font-semibold underline decoration-gold-500/50 underline-offset-4">
                        {guestName}
                      </strong>{" "}
                      to join and celebrate this momentous milestone together.
                    </>
                  ) : (
                    <>
                      With immense joy and gratitude, Nha warmly invites{" "}
                      <strong className="text-gold-700 font-semibold underline decoration-gold-500/50 underline-offset-4">
                        {guestName}
                      </strong>{" "}
                      to join and celebrate this momentous milestone together.
                    </>
                  )
                ) : (
                  pronounMode === "elder" ? (
                    <>
                      ដោយក្តីរីករាយ និងការដឹងគុណយ៉ាងជ្រាលជ្រៅ ខ្ញុំបាទសូមគោរពអញ្ជើញ{" "}
                      <strong className="text-gold-700 font-semibold underline decoration-gold-500/50 underline-offset-4">
                        {guestName}
                      </strong>{" "}
                      មកចូលរួមអបអរសាទរក្នុងថ្ងៃដ៏ពិសេសនេះ។
                    </>
                  ) : pronounMode === "senior" ? (
                    <>
                      ដោយក្តីរីករាយ និងការដឹងគុណ ខ្ញុំបាទសូមអញ្ជើញដោយរាប់អាន{" "}
                      <strong className="text-gold-700 font-semibold underline decoration-gold-500/50 underline-offset-4">
                        {guestName}
                      </strong>{" "}
                      មកចូលរួមអបអរសាទរក្នុងថ្ងៃដ៏ពិសេសនេះ។
                    </>
                  ) : (
                    <>
                      ដោយក្តីរីករាយ និងការដឹងគុណ ខ្ញុំបាទសូមគោរពអញ្ជើញ{" "}
                      <strong className="text-gold-700 font-semibold underline decoration-gold-500/50 underline-offset-4">
                        {guestName}
                      </strong>{" "}
                      មកចូលរួមអបអរសាទរក្នុងថ្ងៃដ៏ពិសេសនេះ។
                    </>
                  )
                )
              ) : (
                t.invitation.para2
              )}
            </p>

            {/* Dedicated Custom Letter for VIP / Close Friends */}
            {customMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mt-6 p-4 sm:p-5 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-left relative"
              >
                <div className="flex items-center gap-1.5 text-gold-700 font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  <span>Đôi lời gửi gắm riêng đến {guestName}:</span>
                </div>
                <p className="font-serif italic text-base sm:text-lg text-charcoal leading-relaxed">
                  &ldquo;{customMessage}&rdquo;
                </p>
              </motion.div>
            )}
          </div>

          {/* Calligraphic Signature */}
          <div className="mt-8 pt-6 border-t border-gold-500/25 flex flex-col items-center relative z-10">
            <span className="font-serif italic font-normal text-gold-700 text-2xl sm:text-3xl tracking-wide">
              {graduationConfig.name}
            </span>
            <span className="text-[11px] font-sans text-emerald-800 font-semibold uppercase tracking-[0.25em] mt-1">
              IT • CLASS OF {graduationConfig.year}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
