"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, GraduationCap, MailOpen, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { useGuest } from "@/context/guest-context";
import { playBackgroundMusic } from "@/components/music-toggle";
import { RotatingBotanicalCrest, AnimatedFlourishDivider } from "@/components/animated-motifs";

async function compressAvatarFile(file: File, maxDim = 1200, quality = 0.85): Promise<Blob | File> {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) return file;
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxDim && height <= maxDim && file.size < 500 * 1024) {
          resolve(file);
          return;
        }
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob && blob.size < file.size ? resolve(blob) : resolve(file)),
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export const HeroSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const { guestName, hasCustomGuest, getGreetingPrefix, isOwner, currentSlug } = useGuest();
  const [avatarUrl, setAvatarUrl] = useState<string>(graduationConfig.avatarUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch persistent cloud avatar on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem("custom_hero_avatar_url");
      if (cached && cached.startsWith("http")) {
        setAvatarUrl(cached);
      }
    } catch {}

    fetch("/api/avatar")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.avatarUrl && typeof data.avatarUrl === "string") {
          setAvatarUrl(data.avatarUrl);
          try {
            localStorage.setItem("custom_hero_avatar_url", data.avatarUrl);
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setUploadStatus("uploading");
    setUploadMessage("Đang nén & tải ảnh lên Cloud...");

    try {
      const compressedBlob = await compressAvatarFile(file);
      const formData = new FormData();
      formData.append("file", compressedBlob, "avatar.jpg");
      formData.append("upload_preset", graduationConfig.cloudinaryUploadPreset);
      formData.append("folder", "graduation_avatar");

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${graduationConfig.cloudinaryCloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!cloudRes.ok) {
        throw new Error("Lỗi tải ảnh lên Cloudinary");
      }

      const cloudData = await cloudRes.json();
      const photoUrl = cloudData.secure_url || cloudData.url;

      if (!photoUrl) {
        throw new Error("Không nhận được URL ảnh");
      }

      // 1. Cập nhật state UI lập tức
      setAvatarUrl(photoUrl);

      // 2. Lưu bộ nhớ đệm LocalStorage
      try {
        localStorage.setItem("custom_hero_avatar_url", photoUrl);
      } catch {}

      // 3. Gửi trực tiếp từ trình duyệt đến Google Sheets (no-cors mode)
      if (graduationConfig.googleScriptUrl) {
        fetch(graduationConfig.googleScriptUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            type: "PHOTO_UPLOAD",
            action: "PHOTO_UPLOAD",
            sheet: "AnhKyNiem",
            name: "Phương Nhã",
            caption: "Ảnh đại diện bìa thiệp tốt nghiệp",
            category: "Ảnh đại diện",
            "Chủ Đề": "Ảnh đại diện",
            photoUrl: photoUrl,
            sourceType: "file",
            timestamp: new Date().toLocaleString("vi-VN"),
            priority: 1,
            "Mức độ ưu tiên": 1,
            "Ưu tiên": 1,
            "Thứ tự": 1,
          }),
        }).catch(() => {});
      }

      // 4. Lưu bền vững vào Server API route
      await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl: photoUrl,
          slug: currentSlug || "phuongnha",
        }),
      });

      setUploadStatus("success");
      setUploadMessage("Đã cập nhật ảnh bìa thành công!");
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus("idle");
        setUploadMessage("");
      }, 2500);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setUploadStatus("error");
      setUploadMessage("Không thể tải ảnh. Vui lòng thử lại!");
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus("idle");
        setUploadMessage("");
      }, 3000);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const scrollToNext = () => {
    playBackgroundMusic();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("refresh_gallery_photos"));
    }
    const el = document.getElementById("invitation");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between items-center px-4 py-8 sm:py-12 bg-ivory text-emerald-deep overflow-hidden">
      {/* Background Decorative Paper Grid & Gold Radial Spotlight */}
      <div className="absolute inset-0 paper-texture opacity-70 pointer-events-none" />
      <div className="absolute inset-0 gold-radial-glow opacity-30 pointer-events-none" />
      
      {/* Corner Rotating Botanical Ornaments */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 pointer-events-none z-0">
        <RotatingBotanicalCrest className="w-20 h-20 sm:w-28 sm:h-28 text-gold" />
      </div>
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 pointer-events-none z-0 transform rotate-90">
        <RotatingBotanicalCrest className="w-20 h-20 sm:w-28 sm:h-28 text-gold" />
      </div>

      {/* Top Header Badge */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center mt-6 sm:mt-2"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold/40 bg-gold/10 text-xs sm:text-sm font-sans tracking-widest text-emerald-deep font-semibold uppercase shadow-gold-glow backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
          <span>{t.hero.invitationCard}</span>
          <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
        </div>
      </motion.div>

      {/* Main Luxury Card Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="z-10 my-auto w-full max-w-sm sm:max-w-md glass-gold-card rounded-3xl p-6 sm:p-9 shadow-2xl relative flex flex-col items-center text-center backdrop-blur-md border-2 border-gold/40"
      >
        {/* Dual Gold Foil Inner Borders */}
        <div className="absolute inset-3 rounded-2xl border border-gold/30 pointer-events-none" />
        <div className="absolute inset-5 rounded-xl border border-gold/50 border-dashed pointer-events-none opacity-50" />

        {/* Four Corner Dots inside Card */}
        <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-gold/70 animate-pulse" />
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-gold/70 animate-pulse" />
        <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-gold/70 animate-pulse" />
        <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-gold/70 animate-pulse" />

        {/* Graduate Avatar Portrait Frame with Gold Pulsing Glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 border-2 border-gold shadow-gold-glow mb-4 sm:mb-5 bg-gold-gradient transform hover:scale-105 transition-transform"
        >
          <div className="relative w-full h-full rounded-full overflow-hidden border border-ivory/80">
            <Image
              src={avatarUrl}
              alt={graduationConfig.name}
              fill
              priority
              sizes="(max-width: 640px) 150px, 200px"
              quality={100}
              className="object-cover"
              unoptimized
            />

            {/* Upload Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-emerald-deep/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center text-ivory z-10">
                {uploadStatus === "uploading" && (
                  <>
                    <Loader2 className="w-6 h-6 text-gold animate-spin mb-1" />
                    <span className="text-[9px] font-sans font-medium text-gold-light leading-tight">Đang tải...</span>
                  </>
                )}
                {uploadStatus === "success" && (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="text-[9px] font-sans font-semibold text-emerald-300 leading-tight">Thành công!</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Gold Crest Icon Badge Overlay (Default) */}
          {!isOwner && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold-gradient text-emerald-deep flex items-center justify-center shadow-md border-2 border-ivory animate-float-slow">
              <GraduationCap className="w-4 h-4 stroke-[2]" />
            </div>
          )}

          {/* Owner Change Cover Photo Button (Only for slug phuongnha) */}
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Đổi ảnh bìa (Dành riêng cho Phương Nhã)"
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gold-gradient text-emerald-deep flex items-center justify-center shadow-xl border-2 border-ivory hover:scale-110 active:scale-95 transition-all cursor-pointer z-20 group"
              >
                <Camera className="w-4.5 h-4.5 stroke-[2.2] group-hover:rotate-12 transition-transform" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </>
          )}
        </motion.div>

        {/* Upload status message feedback */}
        {uploadMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs font-sans font-semibold mb-2 px-3 py-1 rounded-full ${
              uploadStatus === "error"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-gold/20 text-emerald-deep border border-gold/40"
            }`}
          >
            {uploadMessage}
          </motion.div>
        )}

        {/* Ceremony Title */}
        <h2 className="font-serif text-xs sm:text-sm uppercase tracking-[0.3em] text-gold-dark font-bold mb-1 flex items-center gap-2">
          <span className="text-gold/60">✦</span>
          <span>{t.hero.ceremony}</span>
          <span className="text-gold/60">✦</span>
        </h2>

        {/* Degree Subtitle */}
        <span className="italic font-serif text-gold-dark text-2xl sm:text-3xl block my-1 font-semibold">
          {t.hero.degree}
        </span>

        {/* Student Name */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-deep tracking-tight mb-1 leading-tight drop-shadow-sm"
        >
          {graduationConfig.name}
        </motion.h1>

        {/* Animated Flourish Divider */}
        <AnimatedFlourishDivider className="my-2" />

        {/* Major & Year Pill Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="inline-block px-4 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-emerald-deep font-sans font-bold text-xs tracking-widest uppercase my-2 shadow-inner"
        >
          {t.hero.major}
        </motion.div>

        {/* Subtitle quote */}
        <p className="font-serif italic text-sm text-emerald-soft/90 max-w-xs mb-3">
          &ldquo;{t.hero.subTitle}&rdquo;
        </p>

        {/* Personalized Guest Badge - Only shown when a specific guest is invited */}
        {hasCustomGuest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="w-full my-2.5 py-2 px-3 rounded-2xl bg-gold/15 border border-gold/40 shadow-xs"
          >
            <span className="block text-[10px] font-sans uppercase tracking-[0.2em] text-gold-dark font-bold mb-0.5">
              ✦ {getGreetingPrefix(lang).toUpperCase()} ✦
            </span>
            <span className="font-serif italic text-base sm:text-lg font-bold text-emerald-deep line-clamp-1">
              {guestName}
            </span>
          </motion.div>
        )}

        {/* Gold Gradient Action Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={scrollToNext}
          className="w-full sm:w-auto px-10 py-4 rounded-full bg-gold-gradient text-emerald-deep font-sans font-bold text-sm tracking-widest uppercase shadow-gold-glow flex items-center justify-center gap-2.5 border border-ivory/60 hover:brightness-110 transition-all active:scale-95 touch-manipulation cursor-pointer shimmer-gold"
        >
          <MailOpen className="w-4 h-4 stroke-[2]" />
          <span>{t.hero.openBtn}</span>
          <ChevronDown className="w-4 h-4 text-emerald-deep animate-bounce" />
        </motion.button>
      </motion.div>

      {/* Swipe Down Floating Indicator */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="z-10 text-emerald-soft/70 text-xs font-sans flex flex-col items-center gap-1 cursor-pointer"
        onClick={scrollToNext}
      >
        <span className="tracking-widest uppercase text-[10px]">{t.hero.swipeDown}</span>
        <ChevronDown className="w-4 h-4 text-gold" />
      </motion.div>
    </section>
  );
};
