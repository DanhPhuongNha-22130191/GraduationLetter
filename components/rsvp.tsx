"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, User, Phone, MessageSquare, Plus, Minus, Sparkles, Heart } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { useGuest } from "@/context/guest-context";

interface WishItem {
  name: string;
  message: string;
  timestamp: string;
}

export const RsvpSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const { guestName } = useGuest();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [guestCount, setGuestCount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (guestName && !fullName) {
      setFullName(guestName);
    }
  }, [guestName, fullName]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [wishes, setWishes] = useState<WishItem[]>([]);

  // Load existing wishes from local storage for interactive wish wall
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("rsvp_responses") || "[]");
      const validWishes = stored
        .filter((item: { message?: string }) => item.message && item.message.trim().length > 0)
        .reverse()
        .slice(0, 5);
      setWishes(validWishes);
    } catch {
      // Ignore parse errors
    }
  }, [submitted]);

  // Confetti Particle Explosion helper
  const triggerConfetti = () => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#C9A96E", "#F4E7CE", "#123C32", "#E5C78B", "#FFD700"];
    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number }[] = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 14,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        alpha: 1,
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravity
        p.alpha -= 0.015;

        if (p.alpha > 0) {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      });

      frame++;
      if (frame < 90) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(canvas);
      }
    };

    animate();
  };

  const handleGuestChange = (delta: number) => {
    setGuestCount((prev) => Math.max(0, Math.min(10, prev + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsSubmitting(true);

    const payload = {
      type: "RSVP",
      action: "RSVP",
      sheet: "confirms",
      confirmTime: new Date().toLocaleString(lang === "vi" ? "vi-VN" : "en-US"),
      fullName: fullName.trim(),
      phone: phone.trim(),
      attendStatus: attending === "yes" ? "Có" : "Không",
      quantity: attending === "yes" ? guestCount : 0,
      message: message.trim(),
      // Fallback compatibility keys
      guestName: fullName.trim(),
      phoneNumber: phone.trim(),
      attending: attending === "yes" ? "Có" : "Không",
      guestCount: attending === "yes" ? guestCount : 0,
      name: fullName.trim(),
      guests: attending === "yes" ? guestCount : 0,
      timestamp: new Date().toLocaleString(lang === "vi" ? "vi-VN" : "en-US"),
    };

    try {
      // 1. Lưu vào LocalStorage tức thì
      try {
        const existing = JSON.parse(localStorage.getItem("rsvp_responses") || "[]");
        existing.push(payload);
        localStorage.setItem("rsvp_responses", JSON.stringify(existing));
      } catch (err) {
        console.error("Local storage error:", err);
      }

      // 2. Gửi đến Google Apps Script
      const scriptPromise = fetch(graduationConfig.googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.warn("RSVP background sync warning:", err);
      });

      // 3. Giới hạn thời gian chờ tối đa 1.2s (Google Apps Script mất 5-10s do chuyển hướng 302 ngầm)
      await Promise.race([
        scriptPromise,
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);

      triggerConfetti();
      setSubmitted(true);
    } catch (err) {
      console.error("Lỗi khi gửi xác nhận RSVP:", err);
      triggerConfetti();
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
    <section id="rsvp" className="py-16 sm:py-24 px-4 bg-ivory-100 text-charcoal relative overflow-hidden">
      <div className="w-full max-w-lg mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <span className="text-gold-700 font-sans text-xs uppercase tracking-[0.25em] font-semibold block mb-1">
            {t.rsvp.eyebrow}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-emerald-950">
            {t.rsvp.title}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-charcoal/75 mt-2 max-w-xs mx-auto font-medium">
            {t.rsvp.subtitle}
          </p>
          <div className="w-12 h-0.5 bg-gold-500 mx-auto mt-3 rounded-full" />
        </motion.div>

        {/* Refined RSVP Container */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-9 border border-gold-500/25 shadow-soft-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold-gradient" />

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-950 text-gold-200 flex items-center justify-center mx-auto border-2 border-gold-500/40 shadow-soft-md">
                  <CheckCircle2 className="w-8 h-8 stroke-[2]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-emerald-950">
                  {t.rsvp.successTitle}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-charcoal/80 leading-relaxed max-w-xs mx-auto">
                  {t.rsvp.successDesc}
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-8 py-3 rounded-full border border-gold-200/50 bg-gold-gradient text-emerald-950 font-sans text-xs font-bold uppercase tracking-wider hover:brightness-105 transition-all shadow-gold-glow active:scale-95 touch-manipulation cursor-pointer"
                >
                  {t.rsvp.resetBtn}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="inputName" className="block text-xs font-sans font-semibold uppercase tracking-wider text-emerald-950 mb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gold-700" />
                    <span>{t.rsvp.nameLabel}</span>
                  </label>
                  <input
                    id="inputName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.rsvp.namePlaceholder}
                    className="w-full h-12 px-4 rounded-xl border border-gold-500/25 bg-ivory-50/70 font-sans text-base sm:text-sm text-charcoal focus:bg-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="inputPhone" className="block text-xs font-sans font-semibold uppercase tracking-wider text-emerald-950 mb-2 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-gold-700" />
                    <span>{t.rsvp.phoneLabel}</span>
                  </label>
                  <input
                    id="inputPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.rsvp.phonePlaceholder}
                    className="w-full h-12 px-4 rounded-xl border border-gold-500/25 bg-ivory-50/70 font-sans text-base sm:text-sm text-charcoal focus:bg-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-emerald-950 mb-2">
                    {t.rsvp.attendLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAttending("yes")}
                      className={`h-12 px-4 rounded-xl font-sans text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation cursor-pointer ${
                        attending === "yes"
                          ? "bg-emerald-900 text-gold-200 border-emerald-900 shadow-soft-sm"
                          : "bg-ivory-50 text-charcoal border-gold-500/20 hover:border-gold-500/40"
                      }`}
                    >
                      <span>{t.rsvp.attendYes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttending("no")}
                      className={`h-12 px-4 rounded-xl font-sans text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation cursor-pointer ${
                        attending === "no"
                          ? "bg-emerald-900 text-gold-200 border-emerald-900 shadow-soft-sm"
                          : "bg-ivory-50 text-charcoal border-gold-500/20 hover:border-gold-500/40"
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
                    <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-emerald-950">
                      {t.rsvp.guestLabel}
                    </label>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-ivory-50 border border-gold-500/25">
                      <button
                        type="button"
                        onClick={() => handleGuestChange(-1)}
                        className="w-10 h-10 rounded-lg bg-white border border-gold-500/30 flex items-center justify-center text-emerald-950 hover:bg-gold-500/10 transition-colors active:scale-95 touch-manipulation cursor-pointer"
                        aria-label="Decrease guests"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="text-center font-serif text-xl font-bold text-emerald-950 px-4">
                        {guestCount} <span className="text-xs font-sans font-normal text-charcoal/70">{t.rsvp.guestUnit}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGuestChange(1)}
                        className="w-10 h-10 rounded-lg bg-white border border-gold-500/30 flex items-center justify-center text-emerald-950 hover:bg-gold-500/10 transition-colors active:scale-95 touch-manipulation cursor-pointer"
                        aria-label="Increase guests"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label htmlFor="inputMessage" className="block text-xs font-sans font-semibold uppercase tracking-wider text-emerald-950 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-gold-700" />
                    <span>{t.rsvp.messageLabel}</span>
                  </label>
                  <textarea
                    id="inputMessage"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.rsvp.messagePlaceholder}
                    className="w-full p-4 rounded-xl border border-gold-500/25 bg-ivory-50/70 font-sans text-base sm:text-sm text-charcoal focus:bg-white focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full bg-gold-gradient text-emerald-950 font-sans text-sm font-bold tracking-wider uppercase hover:brightness-105 transition-all shadow-gold-glow flex items-center justify-center gap-2 border border-gold-200/50 active:scale-95 touch-manipulation cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 font-sans text-xs font-bold">
                      <span className="animate-spin">⏳</span>
                      <span>{t.rsvp.submittingBtn}</span>
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 stroke-[2]" />
                      <span>{t.rsvp.submitBtn}</span>
                      <Send className="w-4 h-4 stroke-[2]" />
                    </>
                  )}
                </button>
              </form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Live Wishes Preview Wall */}
        {wishes.length > 0 && (
          <div className="mt-10 space-y-3">
            <h4 className="font-serif text-xs font-bold uppercase tracking-widest text-gold-700 text-center flex items-center justify-center gap-2">
              <Heart className="w-3.5 h-3.5 text-gold-600 fill-gold-600" />
              <span>LỜI CHÚC TỪ NGƯỜI THÂN YÊU</span>
              <Heart className="w-3.5 h-3.5 text-gold-600 fill-gold-600" />
            </h4>
            <div className="space-y-2">
              {wishes.map((w, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white border border-gold-500/20 text-xs font-sans shadow-soft-xs">
                  <div className="flex items-center justify-between font-semibold text-emerald-950 mb-1">
                    <span>{w.name}</span>
                    <span className="text-[10px] text-charcoal/50 font-normal">{w.timestamp}</span>
                  </div>
                  <p className="text-charcoal/80 italic font-serif text-sm">&ldquo;{w.message}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
