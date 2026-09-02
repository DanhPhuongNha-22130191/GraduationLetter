"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, User, Phone, MessageSquare, Plus, Minus, Sparkles } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";

export const RsvpSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [guestCount, setGuestCount] = useState(0);
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleGuestChange = (delta: number) => {
    setGuestCount((prev) => Math.max(0, Math.min(10, prev + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSubmitting(true);

    const payload = {
      name: fullName.trim(),
      phone: phone.trim(),
      attending: attending,
      guests: attending === "yes" ? guestCount : 0,
      message: message.trim(),
      timestamp: new Date().toLocaleString(lang === "vi" ? "vi-VN" : "en-US"),
    };

    try {
      await fetch(graduationConfig.googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      try {
        const existing = JSON.parse(localStorage.getItem("rsvp_responses") || "[]");
        existing.push(payload);
        localStorage.setItem("rsvp_responses", JSON.stringify(existing));
      } catch (err) {
        console.error("Local storage error:", err);
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Lỗi khi gửi xác nhận RSVP:", err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName("");
    setPhone("");
    setAttending("yes");
    setGuestCount(0);
    setMessage("");
  };

  return (
    <section id="rsvp" className="py-16 sm:py-24 px-4 bg-ivory text-emerald-deep">
      <div className="w-full max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <span className="text-gold-dark font-sans text-xs uppercase tracking-[0.3em] font-semibold block mb-2">
            {t.rsvp.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-emerald-deep">
            {t.rsvp.title}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-charcoal/80 mt-2 max-w-xs mx-auto">
            {t.rsvp.subtitle}
          </p>
          <div className="w-16 h-0.5 bg-gold mx-auto mt-3" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-gold/30 shadow-card-glow relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gold-gradient" />

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald/10 text-emerald flex items-center justify-center mx-auto border border-emerald/30 shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-emerald-deep">
                  {t.rsvp.successTitle}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-charcoal/80 leading-relaxed max-w-xs mx-auto">
                  {t.rsvp.successDesc}
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-6 py-2.5 rounded-full border border-gold/60 text-emerald-deep bg-ivory font-sans text-xs font-semibold hover:bg-gold/10 transition-colors shadow-sm active:scale-95 touch-manipulation"
                >
                  {t.rsvp.resetBtn}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="inputName" className="block text-xs font-sans font-semibold uppercase tracking-wider text-emerald-deep mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold-dark" />
                    <span>{t.rsvp.nameLabel}</span>
                  </label>
                  <input
                    id="inputName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.rsvp.namePlaceholder}
                    className="w-full h-12 px-4 rounded-xl border border-gold/40 bg-ivory/50 font-sans text-sm text-charcoal focus:bg-white focus:border-emerald-deep focus:ring-2 focus:ring-emerald/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="inputPhone" className="block text-xs font-sans font-semibold uppercase tracking-wider text-emerald-deep mb-2 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold-dark" />
                    <span>{t.rsvp.phoneLabel}</span>
                  </label>
                  <input
                    id="inputPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.rsvp.phonePlaceholder}
                    className="w-full h-12 px-4 rounded-xl border border-gold/40 bg-ivory/50 font-sans text-sm text-charcoal focus:bg-white focus:border-emerald-deep focus:ring-2 focus:ring-emerald/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-emerald-deep mb-2">
                    {t.rsvp.attendLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAttending("yes")}
                      className={`h-12 px-4 rounded-xl font-sans text-xs sm:text-sm font-medium border transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation ${
                        attending === "yes"
                          ? "bg-emerald-deep text-ivory border-emerald-deep shadow-md font-semibold"
                          : "bg-ivory/40 text-charcoal border-gold/30 hover:border-gold"
                      }`}
                    >
                      <span>{t.rsvp.attendYes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttending("no")}
                      className={`h-12 px-4 rounded-xl font-sans text-xs sm:text-sm font-medium border transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation ${
                        attending === "no"
                          ? "bg-emerald-deep text-ivory border-emerald-deep shadow-md font-semibold"
                          : "bg-ivory/40 text-charcoal border-gold/30 hover:border-gold"
                      }`}
                    >
                      <span>{t.rsvp.attendNo}</span>
                    </button>
                  </div>
                </div>

                {attending === "yes" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 pt-1"
                  >
                    <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-emerald-deep">
                      {t.rsvp.guestLabel}
                    </label>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-ivory/60 border border-gold/40">
                      <button
                        type="button"
                        onClick={() => handleGuestChange(-1)}
                        className="w-10 h-10 rounded-lg bg-white border border-gold/40 flex items-center justify-center text-emerald-deep hover:bg-gold/10 transition-colors active:scale-95 touch-manipulation"
                        aria-label="Decrease guests"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="text-center font-serif text-xl font-bold text-emerald-deep px-4">
                        {guestCount} <span className="text-xs font-sans font-normal text-charcoal/70">{t.rsvp.guestUnit}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGuestChange(1)}
                        className="w-10 h-10 rounded-lg bg-white border border-gold/40 flex items-center justify-center text-emerald-deep hover:bg-gold/10 transition-colors active:scale-95 touch-manipulation"
                        aria-label="Increase guests"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label htmlFor="inputMessage" className="block text-xs font-sans font-semibold uppercase tracking-wider text-emerald-deep mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-gold-dark" />
                    <span>{t.rsvp.messageLabel}</span>
                  </label>
                  <textarea
                    id="inputMessage"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.rsvp.messagePlaceholder}
                    className="w-full p-4 rounded-xl border border-gold/40 bg-ivory/50 font-sans text-sm text-charcoal focus:bg-white focus:border-emerald-deep focus:ring-2 focus:ring-emerald/20 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-emerald-deep text-ivory font-sans text-sm font-semibold tracking-wider uppercase hover:bg-emerald transition-all duration-300 shadow-md flex items-center justify-center gap-2 border border-gold/30 active:scale-98 touch-manipulation disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 font-sans text-xs">
                      <span className="animate-spin">⏳</span>
                      <span>{t.rsvp.submittingBtn}</span>
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-gold" />
                      <span>{t.rsvp.submitBtn}</span>
                      <Send className="w-4 h-4 text-gold" />
                    </>
                  )}
                </button>
              </form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
