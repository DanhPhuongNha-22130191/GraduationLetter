"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Share2, ExternalLink, X, Send, UserPlus, Link2 } from "lucide-react";
import { useGuest } from "@/context/guest-context";
import { graduationConfig } from "@/config/graduation";

export const GuestLinkModal: React.FC = () => {
  const { guestName, setGuestName, generateGuestUrl } = useGuest();
  const [isOpen, setIsOpen] = useState(false);
  const [inputName, setInputName] = useState(guestName || "");
  const [copied, setCopied] = useState(false);

  const currentUrl = generateGuestUrl(inputName);

  const presets = [
    "Bạn",
    "Thầy",
    "Cô",
    "Anh",
    "Chị",
    "Gia đình",
    "Cô Chú",
    "Bác",
  ];

  const handleOpen = () => {
    setInputName(guestName || "");
    setIsOpen(true);
  };

  const handleCopy = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleApplyPreview = () => {
    setGuestName(inputName);
    setIsOpen(false);
    const el = document.getElementById("invitation");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleShareZalo = () => {
    if (!currentUrl) return;
    const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(currentUrl)}`;
    window.open(zaloUrl, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Lễ Tốt Nghiệp — ${graduationConfig.name}`,
          text: `Thân mời ${inputName || "bạn"} đến tham dự Lễ Tốt Nghiệp của ${graduationConfig.name}!`,
          url: currentUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button on Bottom-Right */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring" }}
        onClick={handleOpen}
        className="fixed top-4 right-20 sm:top-5 sm:right-28 z-40 px-3.5 py-1.5 rounded-full bg-emerald-deep/90 border border-gold/60 text-gold text-xs font-sans font-semibold tracking-wider flex items-center gap-1.5 shadow-gold-glow hover:bg-gold hover:text-emerald-deep transition-all backdrop-blur-md cursor-pointer group"
        title="Tạo thiệp có tên riêng cho từng người"
      >
        <UserPlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Gửi tên riêng</span>
        <span className="sm:hidden">Tên khách</span>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md bg-emerald-deep text-ivory rounded-3xl p-6 sm:p-8 border-2 border-gold/50 shadow-2xl overflow-hidden"
            >
              {/* Gold Ambient Glow & Texture */}
              <div className="absolute inset-0 paper-texture opacity-30 pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-gold/70 hover:text-gold hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-[11px] font-sans font-bold uppercase tracking-widest border border-gold/40 mb-2">
                  <Sparkles className="w-3 h-3 text-gold" />
                  <span>CÁ NHÂN HÓA LỜI MỜI</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gold-shimmer">
                  Tạo Thiệp Gửi Riêng
                </h3>
                <p className="font-sans text-xs text-ivory/70 mt-1 max-w-xs mx-auto">
                  Nhập tên người nhận để tạo liên kết thiệp có chữ &ldquo;Thân mời&rdquo; kèm tên người đó.
                </p>
              </div>

              {/* Input Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-wider text-gold-light font-semibold mb-1.5">
                    Tên khách mời:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      placeholder="VD: Bạn Hoàng, Thầy Minh, Gia đình Bác Tư..."
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-gold/40 text-ivory placeholder-ivory/40 text-sm font-sans focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                      autoFocus
                    />
                    {inputName && (
                      <button
                        onClick={() => setInputName("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/50 hover:text-ivory text-xs p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Prepend Tags */}
                <div>
                  <span className="block text-[11px] font-sans text-ivory/60 mb-1.5">
                    Thêm xưng hô nhanh:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {presets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          if (!inputName.startsWith(p)) {
                            setInputName(`${p} ${inputName}`.trim());
                          }
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/20 text-ivory/80 hover:border-gold hover:text-gold hover:bg-gold/10 transition-colors cursor-pointer"
                      >
                        +{p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generated Link Preview */}
                <div className="p-3 rounded-xl bg-black/30 border border-gold/30">
                  <div className="flex items-center justify-between text-[11px] text-gold-light mb-1">
                    <span className="flex items-center gap-1 font-semibold">
                      <Link2 className="w-3.5 h-3.5" /> Liên kết thiệp riêng:
                    </span>
                  </div>
                  <p className="font-mono text-xs text-gold/90 break-all select-all line-clamp-2">
                    {currentUrl || "..."}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full py-3 rounded-xl bg-gold-gradient text-emerald-deep font-sans font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-gold-glow"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Đã sao chép link gửi khách!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Sao chép link thiệp này</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleApplyPreview}
                      className="py-2.5 px-3 rounded-xl bg-white/10 border border-gold/40 text-gold-light text-xs font-sans font-semibold flex items-center justify-center gap-1.5 hover:bg-gold/20 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem thử thiệp</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="py-2.5 px-3 rounded-xl bg-white/10 border border-gold/40 text-gold-light text-xs font-sans font-semibold flex items-center justify-center gap-1.5 hover:bg-gold/20 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Chia sẻ ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
