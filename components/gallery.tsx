"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Heart,
  ImageIcon,
  Link as LinkIcon,
  Tag,
  Plus,
  Globe,
  FileImage,
  Images,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useGuest } from "@/context/guest-context";
import { graduationConfig, GalleryItem } from "@/config/graduation";
import { fetchPhotosFromSheet } from "@/config/guests";
import { Lock, ShieldCheck } from "lucide-react";

const PRESET_CATEGORIES = ["Kỷ Niệm", "Tình Bạn", "Kỷ Ức", "Chân Dung", "Vinh Danh"];

export const GallerySection: React.FC = () => {
  const { t } = useLanguage();
  const { guestName, isRegisteredGuest, canUpload } = useGuest();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // User-uploaded photos state (locally added)
  const [userPhotos, setUserPhotos] = useState<GalleryItem[]>([]);
  // Community-uploaded photos state (synced from Google Sheet & Cloud)
  const [cloudPhotos, setCloudPhotos] = useState<GalleryItem[]>([]);
  // Failed / 404 photo URLs tracker for automatic self-cleaning
  const [failedPhotoUrls, setFailedPhotoUrls] = useState<Set<string>>(new Set());

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadSourceMode, setUploadSourceMode] = useState<"file" | "url">("file");
  // Multi-file selection state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  // Multi-URL selection state
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [urlList, setUrlList] = useState<string[]>([]);
  
  const [uploaderName, setUploaderName] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedUploadCat, setSelectedUploadCat] = useState("Kỷ Niệm");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadSuccessCount, setUploadSuccessCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper tự động dọn dẹp các ảnh bị xóa trên Cloud (404/lỗi tải) khỏi bộ nhớ đệm
  const handleImageError = (failedSrc: string) => {
    if (!failedSrc) return;
    setFailedPhotoUrls((prev) => {
      const updated = new Set(prev);
      updated.add(failedSrc);
      return updated;
    });

    if (typeof window !== "undefined") {
      try {
        // Dọn dẹp graduation_user_photos
        const saved = localStorage.getItem("graduation_user_photos");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((p: GalleryItem) => p.src !== failedSrc);
            localStorage.setItem("graduation_user_photos", JSON.stringify(cleaned));
            setUserPhotos(cleaned);
          }
        }
        // Dọn dẹp cached_cloud_photos
        const cloudSaved = localStorage.getItem("cached_cloud_photos");
        if (cloudSaved) {
          const parsed = JSON.parse(cloudSaved);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((p: GalleryItem) => p.src !== failedSrc);
            localStorage.setItem("cached_cloud_photos", JSON.stringify(cleaned));
            setCloudPhotos(cleaned);
          }
        }
      } catch {
        // ignore
      }
    }
  };

  // Load saved contributed photos from localStorage & fetch all community photos from Google Sheets
  useEffect(() => {
    // 1. Khôi phục ảnh đã up từ máy này
    try {
      const saved = localStorage.getItem("graduation_user_photos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setUserPhotos(parsed);
        }
      }
    } catch {
      // ignore
    }

    // 2. Nạp toàn bộ ảnh từ Google Sheet / Cloud do mọi người đã up (tự động đồng bộ và xóa ảnh không còn trên sheet)
    fetchPhotosFromSheet().then((remotePhotos) => {
      if (Array.isArray(remotePhotos)) {
        setCloudPhotos(remotePhotos);
      }
    }).catch(() => {
      // ignore
    });
  }, []);

  // Pre-fill uploader name when guestName is detected
  useEffect(() => {
    if (guestName) {
      setUploaderName(guestName);
    }
  }, [guestName]);

  const defaultItems = (t.gallery.items || []) as GalleryItem[];
  // Kết hợp ảnh vừa upload trên máy + toàn bộ ảnh từ Cloud của mọi người + ảnh mặc định (nếu có)
  const allPhotos = [...userPhotos, ...cloudPhotos, ...defaultItems];
  // Khử trùng lặp ảnh theo đường dẫn src & loại bỏ các ảnh không hợp lệ hoặc đã bị xóa
  const items = Array.from(new Map(allPhotos.map((p) => [p.src, p])).values())
    .filter((p) => Boolean(p.src && p.src.trim() && !failedPhotoUrls.has(p.src)));

  // Tự động tính toán lại danh sách chủ đề DUY NHẤT từ các ảnh ĐANG CÒN TỒN TẠI
  const categories = ["all", ...Array.from(new Set(items.map((item) => item.category)))];

  // Tự động chuyển về tab "Tất cả" nếu chủ đề đang chọn không còn bức ảnh nào
  useEffect(() => {
    if (selectedCategory !== "all" && !categories.includes(selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [categories, selectedCategory]);

  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const handleOpenLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedIndex(null);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === 0 ? filteredItems.length - 1 : (prev ?? 0) - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === filteredItems.length - 1 ? 0 : (prev ?? 0) + 1));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter((f) => f.type.startsWith("image/"));
      if (validFiles.length === 0) {
        setUploadError("Vui lòng chọn các tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP)");
        return;
      }
      
      const combinedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(combinedFiles);
      setFilePreviews(combinedFiles.map((f) => URL.createObjectURL(f)));
      setUploadError(null);

      // Reset file input value để có thể chọn tiếp cùng tệp hoặc tệp khác
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updatedFiles = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(updatedFiles);
    setFilePreviews(updatedFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleAddUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      setUploadError("Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://");
      return;
    }
    if (!urlList.includes(trimmed)) {
      setUrlList([...urlList, trimmed]);
      setImageUrlInput("");
      setUploadError(null);
    }
  };

  const handleRemoveUrl = (indexToRemove: number) => {
    setUrlList(urlList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleResetUploadForm = () => {
    setSelectedFiles([]);
    setFilePreviews([]);
    setImageUrlInput("");
    setUrlList([]);
    setUploadSourceMode("file");
    setCaption("");
    setSelectedUploadCat("Kỷ Niệm");
    setIsCustomCategory(false);
    setCustomCategory("");
    setIsUploading(false);
    setUploadProgressText("");
    setUploadSuccess(false);
    setUploadSuccessCount(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRegisteredGuest || !canUpload) {
      setUploadError("Bạn không có quyền tải ảnh lên kho kỷ niệm.");
      return;
    }

    const targetCategory =
      isCustomCategory && customCategory.trim()
        ? customCategory.trim()
        : selectedUploadCat || "Kỷ Niệm";

    const uploadedUrls: string[] = [];

    if (uploadSourceMode === "file") {
      if (selectedFiles.length === 0) {
        setUploadError("Vui lòng chọn ít nhất 1 bức ảnh từ thiết bị để tải lên");
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        // Tải từng ảnh lên Cloudinary
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgressText(
            selectedFiles.length > 1
              ? `Đang tải ảnh (${i + 1}/${selectedFiles.length}) lên Cloud...`
              : "Đang tải ảnh lên Cloud..."
          );

          const file = selectedFiles[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", graduationConfig.cloudinaryUploadPreset);
          formData.append("folder", "graduation_memories");

          const cloudRes = await fetch(
            `https://api.cloudinary.com/v1_1/${graduationConfig.cloudinaryCloudName}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!cloudRes.ok) {
            throw new Error(`Tải ảnh thứ ${i + 1} không thành công`);
          }

          const cloudData = await cloudRes.json();
          const photoUrl = cloudData.secure_url || cloudData.url;

          if (photoUrl) {
            uploadedUrls.push(photoUrl);
          }
        }
      } catch (err) {
        console.error(err);
        setUploadError("Có lỗi xảy ra khi tải một số ảnh lên Cloud. Vui lòng thử lại!");
        setIsUploading(false);
        return;
      }
    } else {
      // URL Mode: Gom các URL trong urlList và ô nhập hiện tại (nếu có)
      const combinedUrls = [...urlList];
      if (imageUrlInput.trim()) {
        const trimmed = imageUrlInput.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
          if (!combinedUrls.includes(trimmed)) combinedUrls.push(trimmed);
        }
      }

      if (combinedUrls.length === 0) {
        setUploadError("Vui lòng nhập ít nhất 1 đường dẫn (link) ảnh hợp lệ");
        return;
      }

      uploadedUrls.push(...combinedUrls);
      setIsUploading(true);
      setUploadError(null);
    }

    if (uploadedUrls.length === 0) {
      setUploadError("Không có ảnh nào để tải lên.");
      setIsUploading(false);
      return;
    }

    try {
      // 2. Tạo đối tượng ảnh mới đưa ngay vào Gallery
      const newPhotos: GalleryItem[] = uploadedUrls.map((url, i) => ({
        id: `user-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        title: caption.trim()
          ? `${caption.trim()} — (${guestName || uploaderName || "Khách mời"})${uploadedUrls.length > 1 ? ` (#${i + 1})` : ""}`
          : `Khoảnh khắc từ ${guestName || uploaderName || "Khách mời"}${uploadedUrls.length > 1 ? ` (#${i + 1})` : ""}`,
        category: targetCategory,
        src: url,
        alt: `Ảnh kỷ niệm [${targetCategory}] đóng góp bởi ${guestName || uploaderName || "Khách mời"}`,
      }));

      const updatedUserPhotos = [...newPhotos, ...userPhotos];
      setUserPhotos(updatedUserPhotos);

      try {
        localStorage.setItem("graduation_user_photos", JSON.stringify(updatedUserPhotos));
      } catch {
        // ignore
      }

      // 3. Ghi log lên Google Sheet ngầm (gửi từng ảnh)
      try {
        if (graduationConfig.googleScriptUrl) {
          Promise.allSettled(
            uploadedUrls.map((url, i) =>
              fetch(graduationConfig.googleScriptUrl, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({
                  type: "PHOTO_UPLOAD",
                  action: "PHOTO_UPLOAD",
                  sheet: "AnhKyNiem",
                  name: guestName || uploaderName || "Khách mời",
                  caption: caption.trim()
                    ? `${caption.trim()}${uploadedUrls.length > 1 ? ` (#${i + 1})` : ""}`
                    : "Ảnh kỷ niệm cùng Nhã",
                  category: targetCategory,
                  photoUrl: url,
                  sourceType: uploadSourceMode,
                  timestamp: new Date().toLocaleString("vi-VN"),
                }),
              })
            )
          ).catch(() => {});
        }
      } catch {
        // ignore
      }

      setUploadSuccessCount(uploadedUrls.length);
      setUploadSuccess(true);
      setTimeout(() => {
        setIsUploadOpen(false);
        handleResetUploadForm();
      }, 2500);
    } catch (err) {
      console.error(err);
      setUploadError("Có lỗi xảy ra khi lưu ảnh. Vui lòng thử lại!");
      setIsUploading(false);
    }
  };

  const currentPhoto = selectedIndex !== null ? filteredItems[selectedIndex] : null;

  return (
    <section id="gallery" className="py-16 sm:py-24 px-4 bg-ivory text-emerald-deep relative overflow-hidden">
      <div className="w-full max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <span className="text-gold-dark font-sans text-xs uppercase tracking-[0.35em] font-semibold block mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>{t.gallery.eyebrow}</span>
            <Sparkles className="w-3.5 h-3.5 text-gold" />
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-emerald-deep">
            {t.gallery.title}
          </h2>
          <div className="w-16 h-0.5 bg-gold-gradient mx-auto mt-3 rounded-full" />
        </motion.div>

        {/* Action Button: Upload Memory Photo with Nhã */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <button
            onClick={() => {
              handleResetUploadForm();
              setIsUploadOpen(true);
            }}
            className="group relative px-6 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light text-emerald-deep font-sans font-bold text-xs sm:text-sm tracking-wide shadow-gold-glow hover:shadow-2xl hover:brightness-105 active:scale-98 transition-all flex items-center gap-2.5 cursor-pointer border border-gold/40 touch-manipulation"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
            <span className="text-center">{t.gallery.uploadBtn}</span>
          </button>
        </motion.div>

        {/* Filter Category Tabs (Only when there are categories) */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-10">
            {categories.map((cat) => {
              const label = cat === "all" ? t.gallery.allTab : cat;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wider transition-all duration-300 active:scale-95 touch-manipulation cursor-pointer border ${
                    isActive
                      ? "bg-emerald-deep text-gold border-gold shadow-md"
                      : "bg-white/80 text-charcoal/80 border-gold/30 hover:border-gold hover:text-emerald-deep"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* Gallery Grid or Empty State */}
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto p-8 rounded-3xl bg-emerald-deep/5 border-2 border-dashed border-gold/40 text-center space-y-4 shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-gold/15 text-gold flex items-center justify-center mx-auto shadow-gold-glow">
              <Camera className="w-8 h-8" />
            </div>
            <p className="font-serif text-base sm:text-lg text-emerald-deep font-semibold">
              {t.gallery.emptyText}
            </p>
            <button
              onClick={() => {
                handleResetUploadForm();
                setIsUploadOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-gradient text-emerald-deep font-sans font-bold text-xs uppercase tracking-wider shadow-gold-glow hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Đóng góp ảnh ngay</span>
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            <AnimatePresence>
              {filteredItems.map((photo, idx) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  onClick={() => handleOpenLightbox(idx)}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer border border-gold/30 shadow-card-glow bg-emerald-deep/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl active:scale-98 touch-manipulation transform-gpu"
                >
                  {/* Crystal Clear High-Resolution Image */}
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={95}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    loading={idx < 4 ? "eager" : "lazy"}
                    priority={idx < 2}
                    onError={() => handleImageError(photo.src)}
                  />

                  {/* Shimmer Gold Hover Border */}
                  <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/60 rounded-2xl transition-colors pointer-events-none z-10" />

                  {/* Bottom-Only Caption Gradient (Does NOT fog or darken the photo) */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-emerald-deep/95 via-emerald-deep/50 to-transparent flex flex-col justify-end p-3 sm:p-4 text-ivory pointer-events-none z-10">
                    <span className="text-[10px] font-sans uppercase tracking-widest text-gold font-bold mb-0.5 line-clamp-1 drop-shadow-sm">
                      {photo.category}
                    </span>
                    <p className="font-serif text-xs sm:text-sm font-semibold line-clamp-1 drop-shadow-sm">
                      {photo.title}
                    </p>
                  </div>

                  {/* Zoom Indicator Icon */}
                  <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 text-gold backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all border border-gold/30 z-20">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Upload Memory Photo Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-emerald-deep text-ivory rounded-3xl p-6 sm:p-8 border-2 border-gold/50 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Gold Ambient Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setIsUploadOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-gold/70 hover:text-gold hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {uploadSuccess ? (
                /* Success Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center mx-auto text-gold shadow-gold-glow">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-gold-shimmer">
                    {t.gallery.uploadSuccessTitle}
                  </h3>
                  <p className="font-sans text-sm text-ivory/80 max-w-xs mx-auto">
                    {uploadSuccessCount > 1
                      ? `Đã tải lên thành công ${uploadSuccessCount} bức ảnh kỷ niệm vào bộ sưu tập của Nhã!`
                      : t.gallery.uploadSuccessDesc}
                  </p>
                </motion.div>
              ) : !isRegisteredGuest || !canUpload ? (
                /* Restricted Screen for guests without permission */
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 sm:py-8 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-gold/15 border-2 border-gold/60 flex items-center justify-center mx-auto text-gold shadow-gold-glow">
                    <Lock className="w-7 h-7 stroke-[2]" />
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gold/20 text-gold text-[10px] font-sans font-bold uppercase tracking-widest border border-gold/40">
                    <span>QUYỀN TRUY CẬP KHÁCH MỜI</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-gold-shimmer">
                    {t.gallery.uploadRestrictedTitle}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-ivory/80 max-w-sm mx-auto leading-relaxed">
                    {!isRegisteredGuest
                      ? t.gallery.uploadRestrictedDesc
                      : "Khách mời hiện chưa được cấp quyền đóng góp ảnh cho kho kỷ niệm. Vui lòng liên hệ Nhã để mở quyền nhé! 💌"}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="px-6 py-2.5 rounded-full bg-gold-gradient text-emerald-deep font-sans font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-gold-glow cursor-pointer"
                    >
                      Đã hiểu
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Upload Form */
                <div>
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-gold text-[11px] font-sans font-bold uppercase tracking-widest border border-gold/40 mb-2">
                      <Heart className="w-3 h-3 text-gold fill-gold" />
                      <span>{t.gallery.uploadModalTitle}</span>
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gold-shimmer">
                      Chia Sẻ Khoảnh Khắc
                    </h3>
                    <p className="font-sans text-xs text-ivory/70 mt-1 max-w-sm mx-auto">
                      {t.gallery.uploadModalDesc}
                    </p>
                  </div>

                  <form onSubmit={handleUploadPhoto} className="space-y-4">
                    {/* Media Source Selector Tabs: Upload File or URL */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-sans uppercase tracking-wider text-gold-light font-semibold">
                          Hình ảnh kỷ niệm:
                        </label>
                        <div className="flex bg-white/10 p-0.5 rounded-lg border border-gold/30">
                          <button
                            type="button"
                            onClick={() => {
                              setUploadSourceMode("file");
                              setUploadError(null);
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              uploadSourceMode === "file"
                                ? "bg-gold text-emerald-deep shadow-xs"
                                : "text-ivory/70 hover:text-ivory"
                            }`}
                          >
                            <FileImage className="w-3 h-3" />
                            <span>{t.gallery.uploadSourceFileTab}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadSourceMode("url");
                              setUploadError(null);
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              uploadSourceMode === "url"
                                ? "bg-gold text-emerald-deep shadow-xs"
                                : "text-ivory/70 hover:text-ivory"
                            }`}
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>{t.gallery.uploadSourceUrlTab}</span>
                          </button>
                        </div>
                      </div>

                      {uploadSourceMode === "file" ? (
                        /* Multi-File Upload Mode */
                        <div className="space-y-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                          />

                          {filePreviews.length > 0 ? (
                            <div className="space-y-2">
                              {/* Preview Header Bar */}
                              <div className="flex items-center justify-between px-1 text-xs">
                                <span className="font-sans font-semibold text-gold-light flex items-center gap-1">
                                  <Images className="w-3.5 h-3.5 text-gold" />
                                  Đã chọn <strong className="text-gold font-bold">{filePreviews.length}</strong> bức ảnh
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-1 text-[11px] text-gold hover:text-gold-light font-sans font-semibold px-2 py-0.5 rounded-full bg-gold/15 border border-gold/40 hover:bg-gold/25 transition-all cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Thêm ảnh khác</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedFiles([]);
                                      setFilePreviews([]);
                                    }}
                                    className="text-[11px] text-red-400 hover:text-red-300 font-sans cursor-pointer underline"
                                  >
                                    Xóa hết
                                  </button>
                                </div>
                              </div>

                              {/* Multi-Photo Thumbnails Grid */}
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto p-1.5 rounded-2xl bg-black/30 border border-gold/30 scrollbar-thin">
                                {filePreviews.map((url, idx) => (
                                  <div
                                    key={idx}
                                    className="relative aspect-square rounded-xl overflow-hidden border border-gold/40 shadow-xs group bg-emerald-deep/40"
                                  >
                                    <Image
                                      src={url}
                                      alt={`Preview ${idx + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                    {/* Index Badge */}
                                    <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-black/70 text-[9px] font-sans font-bold text-gold border border-gold/30">
                                      #{idx + 1}
                                    </span>
                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFile(idx)}
                                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md hover:bg-red-500 transition-all cursor-pointer"
                                      title="Xóa ảnh này"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}

                                {/* Add More Tile in Grid */}
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="aspect-square rounded-xl border-2 border-dashed border-gold/40 hover:border-gold hover:bg-gold/10 bg-white/5 transition-all flex flex-col items-center justify-center p-1 text-center cursor-pointer group"
                                >
                                  <Plus className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                                  <span className="text-[9px] text-gold-light font-sans font-semibold mt-0.5">
                                    Thêm ảnh
                                  </span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full aspect-[4/3] sm:aspect-[16/9] rounded-2xl border-2 border-dashed border-gold/40 hover:border-gold hover:bg-gold/5 bg-white/5 transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer group"
                            >
                              <div className="w-12 h-12 rounded-full bg-gold/15 text-gold flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
                                <UploadCloud className="w-6 h-6" />
                              </div>
                              <span className="font-sans text-xs font-semibold text-gold-light block">
                                {t.gallery.uploadSelectFile}
                              </span>
                              <span className="font-sans text-[11px] text-ivory/50 mt-1">
                                Hỗ trợ chọn nhiều ảnh cùng lúc (PNG, JPG, JPEG, WEBP)
                              </span>
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Multi-URL Mode */
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="url"
                                value={imageUrlInput}
                                onChange={(e) => {
                                  setImageUrlInput(e.target.value);
                                  setUploadError(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddUrl();
                                  }
                                }}
                                placeholder={t.gallery.uploadUrlPlaceholder}
                                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-gold/40 text-ivory placeholder-ivory/40 text-sm sm:text-xs font-sans focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                              />
                              <LinkIcon className="w-3.5 h-3.5 text-gold absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <button
                              type="button"
                              onClick={handleAddUrl}
                              className="px-3 py-2.5 rounded-xl bg-gold text-emerald-deep font-sans font-bold text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                            >
                              + Thêm link
                            </button>
                          </div>

                          {urlList.length > 0 ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs px-1">
                                <span className="font-sans text-gold-light font-semibold">
                                  Đã nhập <strong className="text-gold">{urlList.length}</strong> liên kết ảnh
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setUrlList([])}
                                  className="text-[11px] text-red-400 hover:text-red-300 font-sans cursor-pointer underline"
                                >
                                  Xóa hết
                                </button>
                              </div>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1.5 rounded-2xl bg-black/30 border border-gold/30">
                                {urlList.map((url, idx) => (
                                  <div
                                    key={idx}
                                    className="relative aspect-square rounded-xl overflow-hidden border border-gold/40 shadow-xs bg-emerald-deep/40"
                                  >
                                    <Image
                                      src={url}
                                      alt={`Preview URL ${idx + 1}`}
                                      fill
                                      className="object-cover"
                                      onError={() => {
                                        setUploadError(`Link ảnh #${idx + 1} không thể hiển thị. Vui lòng kiểm tra lại URL!`);
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveUrl(idx)}
                                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md hover:bg-red-500 transition-all cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="w-full aspect-[4/3] sm:aspect-[16/9] rounded-2xl border border-gold/20 bg-white/5 flex flex-col items-center justify-center p-4 text-center">
                              <ImageIcon className="w-8 h-8 text-gold/40 mb-1" />
                              <span className="text-[11px] text-ivory/60 font-sans">
                                Dán liên kết ảnh trực tiếp (URL) và nhấn &quot;+ Thêm link&quot; để thêm nhiều ảnh
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Uploader Name */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-sans uppercase tracking-wider text-gold-light font-semibold">
                          {t.gallery.uploadNameLabel}:
                        </label>
                        <span className="inline-flex items-center gap-1 text-[10px] text-gold font-sans font-semibold">
                          <ShieldCheck className="w-3 h-3 text-gold" /> Khách mời đã xác thực
                        </span>
                      </div>
                      <input
                        type="text"
                        value={guestName || uploaderName}
                        readOnly
                        className="w-full px-3.5 py-2.5 rounded-xl bg-gold/15 border border-gold/60 text-gold-light font-sans text-sm sm:text-xs font-bold focus:outline-hidden cursor-not-allowed"
                        required
                      />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-sans uppercase tracking-wider text-gold-light font-semibold">
                          {t.gallery.uploadCategoryLabel}:
                        </label>
                        {isCustomCategory && (
                          <span className="text-[10px] font-sans text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">
                            Chủ đề riêng
                          </span>
                        )}
                      </div>

                      {/* Preset Pills + Custom Button */}
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_CATEGORIES.map((cat) => {
                          const isSelected = !isCustomCategory && selectedUploadCat === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setSelectedUploadCat(cat);
                                setIsCustomCategory(false);
                              }}
                              className={`text-[11px] sm:text-xs px-3 py-1.5 rounded-full font-sans font-semibold transition-colors duration-150 cursor-pointer border touch-manipulation active:scale-95 ${
                                isSelected
                                  ? "bg-gold text-emerald-deep border-gold shadow-xs"
                                  : "bg-white/5 text-ivory/75 border-white/20 hover:border-gold/50"
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}

                        {/* + Chủ đề khác button */}
                        <button
                          type="button"
                          onClick={() => setIsCustomCategory(true)}
                          className={`text-[11px] sm:text-xs px-3 py-1.5 rounded-full font-sans font-semibold transition-colors duration-150 cursor-pointer border flex items-center gap-1 touch-manipulation active:scale-95 ${
                            isCustomCategory
                              ? "bg-gold text-emerald-deep border-gold shadow-xs"
                              : "bg-gold/10 text-gold-light border-gold/40 hover:bg-gold/20"
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{t.gallery.uploadOtherCategoryBtn}</span>
                        </button>
                      </div>

                      {/* Custom Category Input (Clean, smooth without jerky layout shifts) */}
                      {isCustomCategory && (
                        <div className="pt-1">
                          <div className="relative">
                            <input
                              type="text"
                              value={customCategory}
                              onChange={(e) => {
                                setCustomCategory(e.target.value);
                                setIsCustomCategory(true);
                              }}
                              placeholder={t.gallery.uploadCustomCategoryPlaceholder}
                              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-gold/60 text-ivory placeholder-ivory/40 text-sm sm:text-xs font-sans focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-inner"
                            />
                            <Tag className="w-3.5 h-3.5 text-gold absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          <p className="text-[10px] text-ivory/50 mt-1 pl-1">
                            💡 Gợi ý: Nhập tên chủ đề bạn muốn đặt (VD: Du Lịch, Hội Bạn Thân, Kỷ Niệm Cấp 3...).
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Caption / Story */}
                    <div>
                      <label className="block text-xs font-sans uppercase tracking-wider text-gold-light font-semibold mb-1">
                        {t.gallery.uploadCaptionLabel}:
                      </label>
                      <textarea
                        rows={2}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={t.gallery.uploadCaptionPlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-gold/40 text-ivory placeholder-ivory/40 text-sm sm:text-xs font-sans focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                      />
                    </div>

                    {uploadError && (
                      <p className="text-red-400 text-xs font-sans bg-red-950/40 p-2.5 rounded-xl border border-red-500/40">
                        {uploadError}
                      </p>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={
                        isUploading ||
                        (uploadSourceMode === "file"
                          ? selectedFiles.length === 0
                          : urlList.length === 0 && !imageUrlInput.trim())
                      }
                      className="w-full py-3 rounded-xl bg-gold-gradient text-emerald-deep font-sans font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-gold-glow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{uploadProgressText || t.gallery.uploadingBtn}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          <span>
                            {uploadSourceMode === "file" && selectedFiles.length > 1
                              ? `Tải ${selectedFiles.length} Ảnh Lên Kho Kỷ Niệm`
                              : uploadSourceMode === "url" && urlList.length > 1
                              ? `Tải ${urlList.length} Ảnh Lên Kho Kỷ Niệm`
                              : t.gallery.uploadSubmitBtn}
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Slider Modal */}
      <AnimatePresence>
        {currentPhoto && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseLightbox}
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 select-none"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-emerald-deep rounded-3xl overflow-hidden border border-gold/40 shadow-2xl flex flex-col"
            >
              {/* Top Bar with Counter & Close */}
              <div className="flex items-center justify-between p-4 px-6 border-b border-gold/20 text-ivory">
                <span className="text-xs font-sans tracking-widest uppercase text-gold font-semibold">
                  {selectedIndex + 1} / {filteredItems.length}
                </span>
                <button
                  onClick={handleCloseLightbox}
                  className="w-9 h-9 rounded-full bg-gold/15 text-gold flex items-center justify-center hover:bg-gold hover:text-emerald-deep transition-colors touch-manipulation border border-gold/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Image Frame with Prev/Next Controls */}
              <div className="relative aspect-[4/5] sm:aspect-[16/11] w-full bg-black flex items-center justify-center overflow-hidden">
                <Image
                  src={currentPhoto.src}
                  alt={currentPhoto.alt}
                  fill
                  className="object-contain"
                  onError={() => handleImageError(currentPhoto.src)}
                />

                {/* Left/Right Arrow Navigation */}
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-gold flex items-center justify-center hover:bg-gold hover:text-emerald-deep transition-all backdrop-blur-md border border-gold/30 active:scale-95 touch-manipulation"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-gold flex items-center justify-center hover:bg-gold hover:text-emerald-deep transition-all backdrop-blur-md border border-gold/30 active:scale-95 touch-manipulation"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Caption Footer */}
              <div className="p-4 sm:p-6 bg-emerald-deep text-ivory border-t border-gold/20 text-center">
                <span className="text-xs font-sans uppercase tracking-[0.2em] text-gold font-bold block mb-1">
                  {currentPhoto.category}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-ivory">
                  {currentPhoto.title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
