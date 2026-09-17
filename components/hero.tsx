"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, GraduationCap, MailOpen, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { useGuest } from "@/context/guest-context";
import { playBackgroundMusic } from "@/components/music-toggle";
import { AnimatedFlourishDivider } from "@/components/animated-motifs";

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

  // Fetch persistent cloud avatar on mount and on tab focus
  useEffect(() => {
    try {
      const cached = localStorage.getItem("custom_hero_avatar_url");
      if (cached && cached.startsWith("http")) {
        setAvatarUrl(cached);
      }
    } catch {}

    const loadAvatar = () => {
      fetch(`/api/avatar?refresh=1&_t=${Date.now()}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      })
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
    };

    loadAvatar();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadAvatar();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setUploadStatus("uploading");
    setUploadMessage("Đang nén & tải ảnh lên Cloud...");

    try {
      // 1. Tính toán fingerprint SHA-256 để phát hiện ảnh trùng lặp
      let fileHash = "";
      try {
        const fileBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        fileHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
      } catch {
        fileHash = `${file.name}_${file.size}_${file.lastModified}`;
      }

      // Kiểm tra bộ nhớ đệm các ảnh đã tải lên Cloudinary
      let hashCache: Record<string, string> = {};
      try {
        hashCache = JSON.parse(localStorage.getItem("avatar_hash_cache") || "{}");
      } catch {}

      let photoUrl = hashCache[fileHash];

      // Nếu ảnh này đã trùng với ảnh đại diện hiện tại thì dừng ngay
      if (photoUrl && (photoUrl === avatarUrl || avatarUrl.includes(photoUrl))) {
        setUploadStatus("success");
        setUploadMessage("Ảnh này hiện đang là ảnh đại diện của bạn!");
        setTimeout(() => {
          setIsUploading(false);
          setUploadStatus("idle");
          setUploadMessage("");
        }, 1500);
        return;
      }

      // 2. Chỉ tải lên Cloudinary nếu ảnh chưa từng được upload trước đó
      if (!photoUrl) {
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
        photoUrl = cloudData.secure_url || cloudData.url;

        if (!photoUrl) {
          throw new Error("Không nhận được URL ảnh");
        }

        // Lưu hash vào bộ nhớ đệm để các lần sau không bị tải trùng lên Cloudinary
        try {
          hashCache[fileHash] = photoUrl;
          localStorage.setItem("avatar_hash_cache", JSON.stringify(hashCache));
        } catch {}
      } else {
        setUploadMessage("Phát hiện ảnh đã có trên Cloud. Đang kích hoạt...");
      }

      const previousAvatarUrl = avatarUrl;

      // 3. Lưu bền vững vào Server API route trước khi chốt state
      const avatarRes = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarUrl: photoUrl,
          slug: currentSlug || "phuongnha",
        }),
      });

      const avatarData = await avatarRes.json().catch(() => null);
      if (!avatarRes.ok || !avatarData?.success) {
        throw new Error(avatarData?.error || "Không thể đồng bộ ảnh đại diện lên máy chủ");
      }

      // 4. Cập nhật state UI và LocalStorage sau khi máy chủ xác nhận thành công
      setAvatarUrl(photoUrl);
      try {
        localStorage.setItem("custom_hero_avatar_url", photoUrl);
      } catch {}

      // 5. Kết thúc trạng thái đang tải sau khi đã xác nhận lưu thành công
      setUploadStatus("success");
      setUploadMessage("Đã cập nhật ảnh bìa thành công!");
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus("idle");
        setUploadMessage("");
      }, 1200);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setUploadStatus("error");
      const errMsg =
        err instanceof Error
          ? err.message
          : typeof navigator !== "undefined" && !navigator.onLine
          ? "Thiết bị đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng!"
          : "Không thể tải ảnh. Vui lòng thử lại!";
      setUploadMessage(errMsg);
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus("idle");
        setUploadMessage("");
      }, 2500);
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
    <section id="hero" className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between items-center px-4 py-8 sm:py-12 bg-ivory-50 text-charcoal overflow-hidden">
      {/* Background Subtle Paper Texture & Soft Amber Radial */}
      <div className="absolute inset-0 paper-texture opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-gold-500/10 via-transparent to-transparent opacity-40 pointer-events-none" />

      {/* Top Header Badge */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center mt-6 sm:mt-2"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 text-xs font-sans tracking-widest text-emerald-900 font-semibold uppercase shadow-soft-sm backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          <span>{t.hero.invitationCard}</span>
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
        </div>
      </motion.div>

      {/* Main Luxury Card Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.2 }}
        className="z-10 my-auto w-full max-w-sm sm:max-w-md glass-gold-card rounded-3xl p-5 sm:p-8 shadow-soft-xl relative flex flex-col items-center text-center border border-gold-500/25"
      >
        {/* Single subtle inner hairline border */}
        <div className="absolute inset-2.5 rounded-2xl border border-gold-500/15 pointer-events-none" />

        {/* Graduate Avatar Portrait Frame with Refined Gold Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 border-2 border-gold-500 shadow-soft-md mb-3 sm:mb-4 bg-gold-gradient transform hover:scale-[1.03] transition-transform"
        >
          <div className="relative w-full h-full rounded-full overflow-hidden border border-ivory-50">
            <Image
              src={avatarUrl}
              alt={graduationConfig.name}
              fill
              priority
              sizes="(max-width: 640px) 120px, 160px"
              quality={85}
              className="object-cover"
              unoptimized
              onError={() => {
                if (avatarUrl !== "/images/graduation/Avatar.jpg") {
                  setAvatarUrl("/images/graduation/Avatar.jpg");
                }
              }}
            />

            {/* Upload Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center text-ivory-50 z-10">
                {uploadStatus === "uploading" && (
                  <>
                    <Loader2 className="w-5 h-5 text-gold-200 animate-spin mb-1" />
                    <span className="text-[9px] font-sans font-medium text-gold-200 leading-tight">Đang tải...</span>
                  </>
                )}
                {uploadStatus === "success" && (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-[9px] font-sans font-semibold text-emerald-300 leading-tight">Thành công!</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Gold Crest Icon Badge Overlay (Default) */}
          {!isOwner && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold-gradient text-emerald-950 flex items-center justify-center shadow-soft-md border-2 border-ivory-50">
              <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
            </div>
          )}

          {/* Owner Change Cover Photo Button (Only for slug phuongnha) */}
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Đổi ảnh đại diện (Dành riêng cho Phương Nhã)"
                title="Đổi ảnh đại diện (Dành riêng cho Phương Nhã)"
                className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gold-gradient text-emerald-950 flex items-center justify-center shadow-soft-lg border-2 border-ivory-50 hover:scale-110 active:scale-95 transition-all cursor-pointer z-20 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-500"
              >
                <Camera className="w-4 h-4 stroke-[2.2] group-hover:rotate-12 transition-transform" />
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
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-gold-500/20 text-emerald-900 border border-gold-500/30"
            }`}
          >
            {uploadMessage}
          </motion.div>
        )}

        {/* Ceremony Title */}
        <h2 className="font-serif text-[11px] sm:text-xs uppercase tracking-[0.25em] text-gold-700 font-bold mb-0.5 flex items-center gap-1.5">
          <span className="text-gold-500/70">✦</span>
          <span>{t.hero.ceremony}</span>
          <span className="text-gold-500/70">✦</span>
        </h2>

        {/* Student Name - Most Prominent Element */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-950 tracking-tight my-1 leading-tight"
        >
          {graduationConfig.name}
        </motion.h1>

        {/* Degree Subtitle */}
        <span className="italic font-serif text-gold-700 text-sm sm:text-base block my-0.5 font-semibold">
          {t.hero.degree}
        </span>

        {/* Animated Flourish Divider */}
        <AnimatedFlourishDivider className="my-1.5 text-gold-600" />

        {/* Major & Year Pill Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="inline-block px-3.5 py-1 rounded-full border border-emerald-900/15 bg-emerald-900/5 text-emerald-900 font-sans font-semibold text-[11px] sm:text-xs tracking-wider uppercase my-1"
        >
          {t.hero.major}
        </motion.div>

        {/* Subtitle quote - Compact & Supporting */}
        <p className="font-serif italic text-xs sm:text-sm text-charcoal/75 max-w-xs mb-2 line-clamp-2">
          &ldquo;{t.hero.subTitle}&rdquo;
        </p>

        {/* Personalized Guest Badge */}
        {hasCustomGuest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="w-full my-2 py-2 px-3 rounded-2xl bg-gold-500/10 border border-gold-500/30 shadow-soft-xs"
          >
            <span className="block text-[10px] font-sans uppercase tracking-[0.2em] text-gold-700 font-bold mb-0.5">
              ✦ {getGreetingPrefix(lang).toUpperCase()} ✦
            </span>
            <span className="font-serif italic text-base sm:text-lg font-bold text-emerald-950 line-clamp-2 break-words overflow-wrap-anywhere">
              {guestName}
            </span>
          </motion.div>
        )}

        {/* Gold Gradient Action Button - Main CTA */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={scrollToNext}
          aria-label={t.hero.openBtn}
          className="w-full sm:w-auto px-8 py-3 rounded-full bg-gold-gradient text-emerald-950 font-sans font-bold text-xs sm:text-sm tracking-wider uppercase shadow-gold-glow flex items-center justify-center gap-2 border border-gold-200/50 hover:brightness-105 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold-500"
        >
          <MailOpen className="w-4 h-4 stroke-[2]" />
          <span>{t.hero.openBtn}</span>
          <ChevronDown className="w-4 h-4 text-emerald-950" />
        </motion.button>
      </motion.div>

      {/* Swipe Down Floating Indicator - Subtle & Supporting */}
      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="z-10 text-charcoal/50 text-xs font-sans hidden sm:flex flex-col items-center gap-0.5 cursor-pointer hover:text-charcoal transition-colors"
        onClick={scrollToNext}
      >
        <span className="tracking-widest uppercase text-[9px]">{t.hero.swipeDown}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gold-600/70" />
      </motion.div>
    </section>
  );
};
