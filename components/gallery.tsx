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
  RotateCw,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useGuest } from "@/context/guest-context";
import { graduationConfig, GalleryItem } from "@/config/graduation";
import { fetchPhotosFromSheet } from "@/config/guests";
import { Lock, ShieldCheck } from "lucide-react";

function getOptimizedImageUrl(src: string, width = 1200): string {
  if (!src || typeof src !== "string") return "";
  const clean = src.trim();
  if (clean.includes("res.cloudinary.com") && clean.includes("/image/upload/")) {
    if (!clean.includes("/image/upload/f_auto") && !clean.includes("/image/upload/w_") && !clean.includes("/image/upload/q_")) {
      return clean.replace(
        "/image/upload/",
        `/image/upload/f_auto,q_auto:best,dpr_auto,w_${width},c_limit/`
      );
    }
  }
  return clean;
}

function normalizePhotoKey(src: string): string {
  if (!src || typeof src !== "string") return "";
  const clean = src.trim().toLowerCase().replace(/^https?:\/\//i, "");
  if (clean.includes("res.cloudinary.com")) {
    const uploadIdx = clean.indexOf("/image/upload/");
    if (uploadIdx !== -1) {
      const rest = clean.substring(uploadIdx + "/image/upload/".length);
      const parts = rest.split("/");
      const lastPart = parts[parts.length - 1].split("?")[0].split("#")[0];
      const folderPart = parts.length > 1 ? parts[parts.length - 2] : "";
      if (folderPart && folderPart.includes("graduation")) {
        return `${folderPart}/${lastPart}`;
      }
      return lastPart;
    }
  }
  return clean.split("?")[0].replace(/\/+$/, "");
}

async function compressImageFile(file: File, maxWidth = 1920, quality = 0.84): Promise<Blob | File> {
  if (typeof window === "undefined" || !file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxWidth && height <= maxWidth && file.size < 700 * 1024) {
          resolve(file);
          return;
        }
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
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

const PRESET_CATEGORIES = ["Kỷ Niệm", "Tình Bạn", "Kỷ Ức", "Chân Dung", "Vinh Danh"];
const ITEMS_PER_PAGE = 4;
const MAX_UPLOAD_PHOTOS = 12;

function getPaginationRange(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export const GallerySection: React.FC = () => {
  const { t } = useLanguage();
  const { guestName, isRegisteredGuest, canUpload } = useGuest();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // User-uploaded photos state (locally added)
  const [userPhotos, setUserPhotos] = useState<GalleryItem[]>([]);
  // Community-uploaded photos state (synced from Google Sheet & Cloud)
  const [cloudPhotos, setCloudPhotos] = useState<GalleryItem[]>([]);
  // Loading & syncing states
  const [isLoadingPhotos, setIsLoadingPhotos] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
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

  const syncPhotos = async (force = false) => {
    setIsSyncing(true);
    try {
      const remotePhotos = await fetchPhotosFromSheet(force);
      if (Array.isArray(remotePhotos)) {
        const cleanedRemote = remotePhotos
          .map((p) => {
            if (!p || !p.src) return null;
            let cat = (p.category || "Kỷ Niệm").trim();
            if (cat.startsWith("http://") || cat.startsWith("https://") || cat.includes("://") || cat.includes("facebook.com") || cat.length > 40) {
              cat = "Kỷ Niệm";
            }
            return { ...p, category: cat };
          })
          .filter((p): p is GalleryItem => p !== null);

        setCloudPhotos(cleanedRemote);
        setFailedPhotoUrls(new Set());

        // Gửi các ảnh cục bộ chưa đồng bộ (nếu có) thông qua server endpoint /api/photos/upload theo hàng đợi duy nhất
        try {
          const cloudSrcs = new Set(cleanedRemote.map((p) => normalizePhotoKey(p.src)));
          const savedRaw = localStorage.getItem("graduation_user_photos");
          if (savedRaw) {
            const savedItems: GalleryItem[] = JSON.parse(savedRaw);
            const unsynced = savedItems.filter(
              (p) => p && p.src && !cloudSrcs.has(normalizePhotoKey(p.src)) && !p.src.startsWith("blob:")
            );
            if (unsynced.length > 0) {
              fetch("/api/photos/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  photos: unsynced.map((item) => ({
                    name: guestName || "Khách mời",
                    caption: item.title || "Ảnh kỷ niệm cùng Nhã",
                    category: item.category || "Kỷ Niệm",
                    photoUrl: item.src,
                    sourceType: "file",
                  })),
                }),
              }).catch(() => {});
            }
          }
        } catch {
          // ignore
        }

        if (cleanedRemote.length === 0) {
          try {
            localStorage.setItem("cached_cloud_photos_v2", JSON.stringify([]));
            sessionStorage.setItem("cached_cloud_photos_v2", JSON.stringify([]));
            setUserPhotos((prev) => {
              const kept = prev.filter((p) => !p.src.includes("res.cloudinary.com"));
              try {
                localStorage.setItem("graduation_user_photos", JSON.stringify(kept));
              } catch {}
              return kept;
            });
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Could not sync photos:", err);
    } finally {
      setIsLoadingPhotos(false);
      setIsSyncing(false);
    }
  };

  // Load saved contributed photos from localStorage & fetch all community photos
  useEffect(() => {
    // 1. Khôi phục ngay tức thì các ảnh đã lưu từ máy này
    try {
      const saved = localStorage.getItem("graduation_user_photos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed
            .map((p: GalleryItem) => {
              if (!p || !p.src) return null;
              let cat = (p.category || "Kỷ Niệm").trim();
              if (cat.startsWith("http://") || cat.startsWith("https://") || cat.includes("://") || cat.includes("facebook.com") || cat.length > 40) {
                cat = "Kỷ Niệm";
              }
              return { ...p, category: cat };
            })
            .filter((p): p is GalleryItem => p !== null);

          setUserPhotos(cleaned);
        }
      }
    } catch {
      // ignore
    }

    // 2. Khôi phục ngay tức thì ảnh Cloud từ bộ nhớ đệm v2 (0ms)
    try {
      const cloudSaved = localStorage.getItem("cached_cloud_photos_v2") || sessionStorage.getItem("cached_cloud_photos_v2");
      if (cloudSaved) {
        const parsed = JSON.parse(cloudSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed
            .map((p: GalleryItem) => {
              if (!p || !p.src) return null;
              let cat = (p.category || "Kỷ Niệm").trim();
              if (cat.startsWith("http://") || cat.startsWith("https://") || cat.includes("://") || cat.includes("facebook.com") || cat.length > 40) {
                cat = "Kỷ Niệm";
              }
              return { ...p, category: cat };
            })
            .filter((p): p is GalleryItem => p !== null);

          setCloudPhotos(cleaned);
          setIsLoadingPhotos(false);
        }
      }
    } catch {
      // ignore
    }

    // 3. Tự động đồng bộ ngầm dữ liệu mới nhất (từ /api/photos và Google Sheet)
    syncPhotos(false);
  }, []);

  // Tự động dọn dẹp ảnh lỗi (404 hoặc bị xóa khỏi Cloud) ngay lập tức
  const handleImageError = (failedSrc: string) => {
    if (!failedSrc) return;
    setFailedPhotoUrls((prev) => {
      const updated = new Set(prev);
      updated.add(failedSrc);
      return updated;
    });

    // Prune from userPhotos state and localStorage
    setUserPhotos((prev) => {
      const updated = prev.filter((p) => p.src !== failedSrc);
      try {
        localStorage.setItem("graduation_user_photos", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Prune from cloudPhotos state and localStorage/sessionStorage
    setCloudPhotos((prev) => {
      const updated = prev.filter((p) => p.src !== failedSrc);
      try {
        localStorage.setItem("cached_cloud_photos_v2", JSON.stringify(updated));
        sessionStorage.setItem("cached_cloud_photos_v2", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Pre-fill uploader name when guestName is detected
  useEffect(() => {
    if (guestName) {
      setUploaderName(guestName);
    }
  }, [guestName]);

  const defaultItems = (t.gallery.items || []) as GalleryItem[];
  // Kết hợp ảnh vừa upload trên máy + toàn bộ ảnh từ Cloud của mọi người + ảnh mặc định (nếu có)
  const allPhotos = [...userPhotos, ...cloudPhotos, ...defaultItems];
  // Khử trùng lặp ảnh triệt để theo normalizePhotoKey & loại bỏ các ảnh không hợp lệ hoặc đã bị xóa
  const items = Array.from(
    new Map(
      allPhotos
        .filter((p) => Boolean(p && p.src && p.src.trim() && !failedPhotoUrls.has(p.src)))
        .map((p) => [normalizePhotoKey(p.src), p])
    ).values()
  ).map((p, idx) => {
    let cat = (p.category || "Kỷ Niệm").trim();
    if (cat.startsWith("http://") || cat.startsWith("https://") || cat.includes("://") || cat.includes("facebook.com") || cat.length > 40) {
      cat = "Kỷ Niệm";
    }
    const safeKey = normalizePhotoKey(p.src) || `photo-${idx}`;
    return {
      ...p,
      id: `photo-${safeKey}`,
      category: cat,
    };
  });

  // Tự động tính toán lại danh sách chủ đề DUY NHẤT (Chỉ chấp nhận chữ thuần túy, tuyệt đối không cho URL xuất hiện thành nút)
  const cleanCategories = Array.from(
    new Set(
      items
        .map((item) => item.category?.trim())
        .filter((cat) => Boolean(cat && !cat.startsWith("http://") && !cat.startsWith("https://") && !cat.includes("://") && cat.length <= 35))
    )
  );
  const categories = ["all", ...cleanCategories];

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

  // Tự động chuyển về trang 1 khi thay đổi chủ đề lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  // Đảm bảo currentPage luôn hợp lệ nếu số lượng ảnh thay đổi
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    const galleryElement = document.getElementById("gallery");
    if (galleryElement) {
      const topPos = galleryElement.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: Math.max(0, topPos), behavior: "smooth" });
    }
  };

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

      if (selectedFiles.length >= MAX_UPLOAD_PHOTOS) {
        setUploadError(`Mỗi lần gửi tối đa ${MAX_UPLOAD_PHOTOS} ảnh để đảm bảo chất lượng và tốc độ cao nhất.`);
        return;
      }

      const availableSlots = MAX_UPLOAD_PHOTOS - selectedFiles.length;
      let filesToAdd = validFiles;
      let limitNotice: string | null = null;

      if (validFiles.length > availableSlots) {
        filesToAdd = validFiles.slice(0, availableSlots);
        limitNotice = `Hệ thống đã chọn ${filesToAdd.length} ảnh đầu tiên (giới hạn tối đa ${MAX_UPLOAD_PHOTOS} ảnh mỗi lần gửi để đảm bảo tốc độ và chất lượng tốt nhất).`;
      }

      const combinedFiles = [...selectedFiles, ...filesToAdd];
      setSelectedFiles(combinedFiles);
      setFilePreviews(combinedFiles.map((f) => URL.createObjectURL(f)));
      setUploadError(limitNotice);

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
    if (updatedFiles.length < MAX_UPLOAD_PHOTOS) {
      setUploadError(null);
    }
  };

  const handleAddUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      setUploadError("Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://");
      return;
    }
    if (urlList.length >= MAX_UPLOAD_PHOTOS) {
      setUploadError(`Mỗi lần gửi tối đa ${MAX_UPLOAD_PHOTOS} ảnh để đảm bảo chất lượng và tốc độ cao nhất.`);
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
      if (selectedFiles.length > MAX_UPLOAD_PHOTOS) {
        setUploadError(`Mỗi lần gửi tối đa ${MAX_UPLOAD_PHOTOS} ảnh để đảm bảo chất lượng và tốc độ.`);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const total = selectedFiles.length;
        let completed = 0;
        setUploadProgressText(total > 1 ? `Đang tối ưu & nén (${total} ảnh)...` : "Đang xử lý ảnh...");

        // Nén song song trước khi tải lên (giảm dung lượng ~90% giúp tải nhanh gấp 10 lần)
        const preparedBlobs: Array<{ blob: Blob | File; filename: string }> = await Promise.all(
          selectedFiles.map(async (file) => ({
            blob: await compressImageFile(file, 1920, 0.84),
            filename: file.name,
          }))
        );

        // Upload song song với worker pool (3 luồng đồng thời cực nhanh)
        const CONCURRENCY = 3;
        let currentIndex = 0;

        const uploadWorker = async () => {
          while (currentIndex < preparedBlobs.length) {
            const idx = currentIndex++;
            const item = preparedBlobs[idx];

            setUploadProgressText(
              total > 1
                ? `Đang tải ảnh (${completed + 1}/${total}) lên Cloud...`
                : "Đang tải ảnh lên Cloud..."
            );

            const formData = new FormData();
            formData.append("file", item.blob, item.filename);
            formData.append("upload_preset", graduationConfig.cloudinaryUploadPreset);
            formData.append("folder", "graduation_memories");

            let photoUrl = "";
            for (let retry = 0; retry < 2; retry++) {
              try {
                const cloudRes = await fetch(
                  `https://api.cloudinary.com/v1_1/${graduationConfig.cloudinaryCloudName}/image/upload`,
                  { method: "POST", body: formData }
                );
                if (cloudRes.ok) {
                  const cloudData = await cloudRes.json();
                  photoUrl = cloudData.secure_url || cloudData.url;
                  if (photoUrl) break;
                }
              } catch (e) {
                console.warn(`Retry ${retry + 1} for file ${idx}:`, e);
              }
            }

            if (photoUrl) {
              uploadedUrls.push(photoUrl);
            }
            completed++;
            setUploadProgressText(`Đã tải xong (${completed}/${total}) ảnh`);
          }
        };

        const workers = Array.from({ length: Math.min(CONCURRENCY, preparedBlobs.length) }, () =>
          uploadWorker()
        );
        await Promise.all(workers);
      } catch (err) {
        console.error(err);
        setUploadError("Có lỗi xảy ra khi tải ảnh lên Cloud. Vui lòng kiểm tra kết nối và thử lại!");
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
      if (combinedUrls.length > MAX_UPLOAD_PHOTOS) {
        setUploadError(`Mỗi lần gửi tối đa ${MAX_UPLOAD_PHOTOS} ảnh để đảm bảo chất lượng và tốc độ.`);
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
      // 2. Tạo đối tượng ảnh mới đưa ngay vào Gallery (hiển thị lập tức 0ms)
      const newPhotos: GalleryItem[] = uploadedUrls.map((url, i) => {
        const safeKey = normalizePhotoKey(url) || `user-${Date.now()}-${i}`;
        return {
          id: `photo-${safeKey}`,
          title: caption.trim()
            ? (uploadedUrls.length > 1 ? `${caption.trim()} (#${i + 1})` : caption.trim())
            : (targetCategory || "Ảnh kỷ niệm"),
          category: targetCategory,
          src: url,
          alt: caption.trim() || `Ảnh kỷ niệm [${targetCategory}]`,
        };
      });

      const updatedUserPhotos = [...newPhotos, ...userPhotos];
      setUserPhotos(updatedUserPhotos);

      try {
        localStorage.setItem("graduation_user_photos", JSON.stringify(updatedUserPhotos));
      } catch {
        // ignore
      }

      // 3. Gửi toàn bộ danh sách ảnh đến server API /api/photos/upload (Server sẽ tuần tự hóa ghi vào Google Sheets, tuyệt đối không bị nghẽn hay lỗi khi nhiều người cùng up)
      try {
        fetch("/api/photos/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photos: uploadedUrls.map((url, i) => ({
              name: guestName || uploaderName || "Khách mời",
              caption: caption.trim()
                ? `${caption.trim()}${uploadedUrls.length > 1 ? ` (#${i + 1})` : ""}`
                : "Ảnh kỷ niệm cùng Nhã",
              category: targetCategory,
              photoUrl: url,
              sourceType: uploadSourceMode,
              timestamp: new Date().toLocaleString("vi-VN"),
            })),
          }),
        }).catch(() => {
          // Fallback ngầm trực tiếp Google Sheet nếu cần
          if (graduationConfig.googleScriptUrl) {
            uploadedUrls.forEach((url, i) => {
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
              }).catch(() => {});
            });
          }
        });
      } catch {
        // ignore
      }

      setUploadSuccessCount(uploadedUrls.length);
      setUploadSuccess(true);
      setTimeout(() => {
        setIsUploadOpen(false);
        handleResetUploadForm();
        syncPhotos(true);
      }, 1500);
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

        {/* Action Buttons: Upload Memory Photo & Sync */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-3 mb-8"
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

          <button
            type="button"
            onClick={() => syncPhotos(true)}
            disabled={isSyncing}
            title="Đồng bộ lại kho ảnh"
            className="p-3 sm:p-3.5 rounded-full bg-white/80 hover:bg-gold/20 text-emerald-deep border border-gold/40 shadow-xs hover:border-gold transition-all cursor-pointer active:scale-95 touch-manipulation disabled:opacity-50 flex items-center justify-center"
          >
            <RotateCw className={`w-4 h-4 sm:w-4.5 sm:h-4.5 text-gold-dark ${isSyncing ? "animate-spin" : ""}`} />
          </button>
        </motion.div>

        {/* Filter Category Tabs (Chỉ hiển thị khi có ảnh và có từ 2 chủ đề trở lên) */}
        {items.length > 0 && categories.length > 2 && (
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

        {/* Gallery Grid, Skeleton Loading or Empty State */}
        {isLoadingPhotos && items.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-[4/5] rounded-2xl bg-emerald-deep/10 border border-gold/25 animate-pulse relative overflow-hidden flex flex-col justify-end p-3.5"
              >
                <div className="w-16 h-3 bg-gold/25 rounded-full mb-2" />
                <div className="w-28 h-4 bg-gold/35 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
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
          <div>
            <motion.div layout className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {paginatedItems.map((photo, localIdx) => {
                  const globalIdx = startIndex + localIdx;
                  return (
                    <motion.div
                      key={`page-${currentPage}-${photo.id}-${localIdx}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35, delay: localIdx * 0.04 }}
                      onClick={() => handleOpenLightbox(globalIdx)}
                      className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer border border-gold/30 shadow-card-glow bg-emerald-deep/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl active:scale-98 touch-manipulation transform-gpu"
                    >
                      {/* Crystal Clear High-Resolution Image */}
                      <Image
                        src={getOptimizedImageUrl(photo.src, 1200)}
                        alt={photo.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={100}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        loading={localIdx < 4 ? "eager" : "lazy"}
                        priority={currentPage === 1 && localIdx < 2}
                        onError={() => handleImageError(photo.src)}
                        unoptimized
                      />

                      {/* Shimmer Gold Hover Border */}
                      <div className="absolute inset-0 border-2 border-gold/0 group-hover:border-gold/60 rounded-2xl transition-colors pointer-events-none z-10" />

                      {/* Compact Bottom-Only Caption Gradient (Leaves photo 100% bright, sharp & uncovered) */}
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-2.5 sm:p-3 text-ivory pointer-events-none z-10">
                        <span className="text-[10px] font-sans uppercase tracking-widest text-gold font-bold mb-0.5 line-clamp-1 drop-shadow-md">
                          {photo.category}
                        </span>
                        <p className="font-serif text-xs sm:text-sm font-semibold line-clamp-1 drop-shadow-md text-ivory/95">
                          {photo.title}
                        </p>
                      </div>

                      {/* Zoom Indicator Icon */}
                      <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/50 text-gold backdrop-blur-md opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all border border-gold/30 z-20">
                        <ZoomIn className="w-3.5 h-3.5" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            {filteredItems.length > ITEMS_PER_PAGE && (
              <div className="mt-10 sm:mt-12 flex flex-col items-center justify-center gap-3.5">
                {/* Page Summary Info */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-deep/5 border border-gold/35 text-emerald-deep font-sans text-xs font-medium shadow-xs">
                  <span className="text-gold-dark font-bold">
                    {t.gallery.paginationPage} {currentPage} {t.gallery.paginationOf} {totalPages}
                  </span>
                  <span className="text-emerald-deep/30">•</span>
                  <span className="text-emerald-deep/80">
                    Hiển thị {startIndex + 1}–{endIndex} {t.gallery.paginationOf} {filteredItems.length} {t.gallery.paginationPhotos}
                  </span>
                </div>

                {/* Pagination Navigation Buttons */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 select-none">
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title={t.gallery.paginationPrev}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gold/40 bg-white/90 text-emerald-deep flex items-center justify-center hover:bg-gold/20 hover:border-gold transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-deep" />
                  </button>

                  {/* Numbered Page Buttons */}
                  {getPaginationRange(currentPage, totalPages).map((item, idx) => {
                    if (typeof item === "string") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-7 sm:w-8 text-center text-gold-dark font-sans font-bold tracking-widest text-xs"
                        >
                          …
                        </span>
                      );
                    }

                    const isActive = item === currentPage;
                    return (
                      <button
                        key={`page-${item}`}
                        type="button"
                        onClick={() => handlePageChange(item)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full font-sans text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border touch-manipulation ${
                          isActive
                            ? "bg-emerald-deep text-gold border-gold shadow-md font-bold scale-105 ring-2 ring-gold/30"
                            : "bg-white/90 text-emerald-deep border-gold/30 hover:bg-gold/20 hover:border-gold active:scale-95"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title={t.gallery.paginationNext}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gold/40 bg-white/90 text-emerald-deep flex items-center justify-center hover:bg-gold/20 hover:border-gold transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-deep" />
                  </button>
                </div>
              </div>
            )}
          </div>
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
                                  Đã chọn <strong className="text-gold font-bold">{filePreviews.length}/{MAX_UPLOAD_PHOTOS}</strong> bức ảnh
                                </span>
                                <div className="flex items-center gap-2">
                                  {filePreviews.length < MAX_UPLOAD_PHOTOS && (
                                    <button
                                      type="button"
                                      onClick={() => fileInputRef.current?.click()}
                                      className="inline-flex items-center gap-1 text-[11px] text-gold hover:text-gold-light font-sans font-semibold px-2 py-0.5 rounded-full bg-gold/15 border border-gold/40 hover:bg-gold/25 transition-all cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Thêm ảnh</span>
                                    </button>
                                  )}
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

                                {/* Add More Tile in Grid (chỉ hiện khi chưa đủ 12 ảnh) */}
                                {filePreviews.length < MAX_UPLOAD_PHOTOS && (
                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-xl border-2 border-dashed border-gold/40 hover:border-gold hover:bg-gold/10 bg-white/5 transition-all flex flex-col items-center justify-center p-1 text-center cursor-pointer group"
                                  >
                                    <Plus className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] text-gold-light font-sans font-semibold mt-0.5">
                                      Thêm ảnh ({filePreviews.length}/{MAX_UPLOAD_PHOTOS})
                                    </span>
                                  </button>
                                )}
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
                                Hỗ trợ chọn tối đa 12 ảnh mỗi lần (PNG, JPG, JPEG, WEBP) giúp tải nhanh & bảo toàn chất lượng
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
                              disabled={urlList.length >= MAX_UPLOAD_PHOTOS || !imageUrlInput.trim()}
                              className="px-3 py-2.5 rounded-xl bg-gold text-emerald-deep font-sans font-bold text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              + Thêm link
                            </button>
                          </div>

                          {urlList.length > 0 ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs px-1">
                                <span className="font-sans text-gold-light font-semibold">
                                  Đã nhập <strong className="text-gold">{urlList.length}/{MAX_UPLOAD_PHOTOS}</strong> liên kết ảnh
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
                  src={getOptimizedImageUrl(currentPhoto.src, 2400)}
                  alt={currentPhoto.alt}
                  fill
                  sizes="100vw"
                  quality={100}
                  className="object-contain"
                  priority
                  onError={() => handleImageError(currentPhoto.src)}
                  unoptimized
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
