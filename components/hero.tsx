"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ChevronDown, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { graduationConfig } from "@/config/graduation";
import { useLanguage } from "@/context/language-context";
import { useGuest } from "@/context/guest-context";
import { playBackgroundMusic } from "@/components/music-toggle";
import { AnimatedFlourishDivider, WheatBranch, EASE_LUX } from "@/components/animated-motifs";
import { extrasCopy } from "@/config/extras";

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
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const x = extrasCopy[lang];
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 70]);
  const haloY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 130]);

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
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-[100svh] flex flex-col items-center justify-center px-5 pt-16 pb-36 sm:py-20 bg-emerald-950 text-ivory-50 overflow-hidden"
    >
      {/* Halo mờ — parallax chậm hơn nội dung */}
      <motion.div
        style={{ y: haloY }}
        aria-hidden="true"
        className="absolute left-1/2 top-[18%] -translate-x-1/2 w-[130vw] max-w-[900px] aspect-square rounded-full bg-radial from-emerald-700/40 via-emerald-900/10 to-transparent pointer-events-none"
      />
      {/* Cành nguyệt quế hai bên (ẩn trên mobile hẹp để thoáng) */}
      <WheatBranch className="hidden md:block absolute left-[6%] top-1/2 -translate-y-1/2 w-16 h-32 text-gold-500/50" />
      <WheatBranch flip className="hidden md:block absolute right-[6%] top-1/2 -translate-y-1/2 w-16 h-32 text-gold-500/50" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_LUX }}
          className="eyebrow eyebrow-on-dark mb-2"
        >
          {t.hero.invitationCard}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE_LUX }}
          className="font-serif italic text-gold-200 text-lg tracking-[0.2em] mb-7"
        >
          {x.classOf} {graduationConfig.year}
        </motion.p>

        {/* Chân dung trong khung arch */}
        <motion.div
          style={{ y: portraitY }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.25, ease: EASE_LUX }}
          className="relative w-[14.5rem] sm:w-64"
        >
          {/* Viền arch lệch */}
          <div className="absolute -inset-2.5 rounded-full border border-gold-500/50" aria-hidden="true" />
          <div className="relative aspect-square rounded-full overflow-hidden bg-emerald-900">
            <Image
              src={avatarUrl}
              alt={`Chân dung ${graduationConfig.name} trong lễ phục tốt nghiệp`}
              fill
              priority
              sizes="(max-width: 640px) 232px, 256px"
              quality={85}
              className="object-cover"
              unoptimized
              onError={() => {
                if (avatarUrl !== "/images/graduation/Avatar.jpg") {
                  setAvatarUrl("/images/graduation/Avatar.jpg");
                }
              }}
            />
            {/* Overlay mờ phía dưới để chữ/khung hòa vào ảnh */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-emerald-950/40 via-transparent to-transparent" aria-hidden="true" />

            {isUploading && (
              <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 text-center z-10" role="status">
                {uploadStatus === "uploading" && (
                  <>
                    <Loader2 className="w-6 h-6 text-gold-200 animate-spin mb-1" />
                    <span className="text-[11px] font-sans text-gold-200">Đang tải...</span>
                  </>
                )}
                {uploadStatus === "success" && (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="text-[11px] font-sans text-emerald-200">Thành công!</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Chỉ chủ thiệp (slug phuongnha) mới thấy nút đổi ảnh */}
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label="Đổi ảnh đại diện (Dành riêng cho Phương Nhã)"
                title="Đổi ảnh đại diện (Dành riêng cho Phương Nhã)"
                className="absolute bottom-3 right-1 w-10 h-10 rounded-full bg-gold-500 text-emerald-950 flex items-center justify-center shadow-soft-lg border border-ivory-50/60 hover:scale-105 active:scale-95 transition-transform duration-500 ease-lux cursor-pointer z-20"
              >
                <Camera className="w-4 h-4" strokeWidth={1.75} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
            </>
          )}
        </motion.div>

        {uploadMessage && (
          <div
            role="status"
            className={`mt-4 text-xs font-sans px-3 py-1 rounded-full ${
              uploadStatus === "error" ? "bg-red-50 text-red-700" : "bg-gold-500/20 text-gold-200"
            }`}
          >
            {uploadMessage}
          </div>
        )}

        {/* Tên — chữ viết tay tiết chế, chỉ dùng cho tên */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: EASE_LUX }}
          className="font-serif italic font-medium text-[2.75rem] sm:text-6xl leading-[1.15] text-ivory-50 mt-9 mb-1"
        >
          {graduationConfig.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="font-serif text-[0.8rem] sm:text-sm uppercase tracking-[0.3em] text-gold-200 mt-2"
        >
          {t.hero.degree} · {t.hero.major}
        </motion.p>

        <AnimatedFlourishDivider className="my-6" />

        <p className="font-serif italic text-base text-ivory-100/80 max-w-xs leading-relaxed">
          &ldquo;{t.hero.subTitle}&rdquo;
        </p>

        {hasCustomGuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-7 w-full border-y border-gold-500/30 py-3"
          >
            <span className="block eyebrow eyebrow-on-dark mb-1">{getGreetingPrefix(lang)}</span>
            <span className="font-serif italic text-2xl text-ivory-50 break-words overflow-wrap-anywhere">{guestName}</span>
          </motion.div>
        )}

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: EASE_LUX }}
          onClick={scrollToNext}
          aria-label={x.scrollCta}
          className="btn-gold mt-9"
        >
          <span>{x.scrollCta}</span>
          <ChevronDown className="w-4 h-4" strokeWidth={1.75} />
        </motion.button>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1 text-gold-200/60" aria-hidden="true">
        <span className="eyebrow eyebrow-on-dark !text-[0.6rem] opacity-70">{x.scrollHint}</span>
        <div className="w-px h-8 bg-gradient-to-b from-gold-500/70 to-transparent" />
      </div>
    </section>
  );
};
