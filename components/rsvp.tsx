"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, User, Phone, MessageSquare, Plus, Minus, Sparkles, Heart } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";

interface WishItem {
  name: string;
  message: string;
  timestamp: string;
}

export const RsvpSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [guestCount, setGuestCount] = useState(0);
  const [message, setMessage] = useState("");

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
    <section id="rsvp" className="py-16 sm:py-24 px-4 bg-ivory text-emerald-deep relative overflow-hidden">
      <div className="w-full max-w-lg mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <span className="text-gold-dark font-sans text-xs uppercase tracking-[0.35em] font-semibold block mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>{t.rsvp.eyebrow}</span>
            <Sparkles className="w-3.5 h-3.5 text-gold" />
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-emerald-deep">
            {t.rsvp.title}
          </h2>
          <p className="font-sans text-xs sm:text-sm text-charcoal/80 mt-2 max-w-xs mx-auto font-medium">
            {t.rsvp.subtitle}
          </p>
          <div className="w-16 h-0.5 bg-gold-gradient mx-auto mt-3 rounded-full" />
        </motion.div>

        {/* Glassmorphic RSVP Container */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-gold-card rounded-3xl p-6 sm:p-9 border border-gold/40 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gold-gradient" />

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-deep text-gold flex items-center justify-center mx-auto border-2 border-gold shadow-gold-glow">
                  <CheckCircle2 className="w-9 h-9 stroke-[2]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-emerald-deep">
                  {t.rsvp.successTitle}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-charcoal/80 leading-relaxed max-w-xs mx-auto font-medium">
                  {t.rsvp.successDesc}
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-8 py-3 rounded-full border border-gold bg-gold-gradient text-emerald-deep font-sans text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-gold-glow active:scale-95 touch-manipulation cursor-pointer"
                >
                  {t.rsvp.resetBtn}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="inputName" className="block text-xs font-sans font-bold uppercase tracking-wider text-emerald-deep mb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gold-dark" />
                    <span>{t.rsvp.nameLabel}</span>
                  </label>
                  <input
                    id="inputName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.rsvp.namePlaceholder}
                    className="w-full h-12 px-4 rounded-xl border border-gold/40 bg-white/70 font-sans text-sm text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="inputPhone" className="block text-xs font-sans font-bold uppercase tracking-wider text-emerald-deep mb-2 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-gold-dark" />
                    <span>{t.rsvp.phoneLabel}</span>
                  </label>
                  <input
                    id="inputPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.rsvp.phonePlaceholder}
                    className="w-full h-12 px-4 rounded-xl border border-gold/40 bg-white/70 font-sans text-sm text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-emerald-deep mb-2">
                    {t.rsvp.attendLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAttending("yes")}
                      className={`h-12 px-4 rounded-xl font-sans text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation cursor-pointer ${
                        attending === "yes"
                          ? "bg-emerald-deep text-gold border-gold shadow-md"
                          : "bg-white/60 text-charcoal border-gold/30 hover:border-gold"
                      }`}
                    >
                      <span>{t.rsvp.attendYes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttending("no")}
                      className={`h-12 px-4 rounded-xl font-sans text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center gap-2 active:scale-95 touch-manipulation cursor-pointer ${
                        attending === "no"
                          ? "bg-emerald-deep text-gold border-gold shadow-md"
                          : "bg-white/60 text-charcoal border-gold/30 hover:border-gold"
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
                    <label className="block text-xs font-sans font-bold uppercase tracking-wider text-emerald-deep">
                      {t.rsvp.guestLabel}
                    </label>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-gold/40">
                      <button
                        type="button"
                        onClick={() => handleGuestChange(-1)}
                        className="w-10 h-10 rounded-lg bg-ivory border border-gold/40 flex items-center justify-center text-emerald-deep hover:bg-gold/15 transition-colors active:scale-95 touch-manipulation cursor-pointer"
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
                        className="w-10 h-10 rounded-lg bg-ivory border border-gold/40 flex items-center justify-center text-emerald-deep hover:bg-gold/15 transition-colors active:scale-95 touch-manipulation cursor-pointer"
                        aria-label="Increase guests"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label htmlFor="inputMessage" className="block text-xs font-sans font-bold uppercase tracking-wider text-emerald-deep mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-gold-dark" />
                    <span>{t.rsvp.messageLabel}</span>
                  </label>
                  <textarea
                    id="inputMessage"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.rsvp.messagePlaceholder}
                    className="w-full p-4 rounded-xl border border-gold/40 bg-white/70 font-sans text-sm text-charcoal focus:bg-white focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full bg-gold-gradient text-emerald-deep font-sans text-sm font-bold tracking-widest uppercase hover:brightness-110 transition-all duration-300 shadow-gold-glow flex items-center justify-center gap-2 border border-ivory/60 active:scale-95 touch-manipulation cursor-pointer disabled:opacity-70 shimmer-gold"
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
            <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-emerald-deep text-center flex items-center justify-center gap-2">
              <Heart className="w-3.5 h-3.5 text-gold fill-gold" />
              <span>LỜI CHÚC TỪ NGƯỜI THÂN YÊU</span>
              <Heart className="w-3.5 h-3.5 text-gold fill-gold" />
            </h4>
            <div className="space-y-2">
              {wishes.map((w, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white/90 border border-gold/30 text-xs font-sans shadow-sm">
                  <div className="flex items-center justify-between font-semibold text-emerald-deep mb-1">
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
